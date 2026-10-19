import { describe, expect, it } from "vitest";
import {
  CURRENCIES,
  RANGES,
  convertFromINR,
  formatAxisTick,
  formatCompact,
  formatMetricTotal,
  formatMoney,
  getCurrency,
  getMetricSeries,
  getRange,
} from "@/lib/dashboard-data";

describe("ranges", () => {
  it("offers the 11 presets shown in the UI", () => {
    expect(RANGES).toHaveLength(11);
    expect(RANGES.map((r) => r.label)).toContain("Last 30 days");
    expect(RANGES.map((r) => r.label)).toContain("Last 90 days");
  });

  it("generates exactly one point per range length", () => {
    expect(getMetricSeries("sales", "today").points).toHaveLength(23);
    expect(getMetricSeries("sales", "30d").points).toHaveLength(30);
    expect(getMetricSeries("sales", "90d").points).toHaveLength(90);
  });

  it("is deterministic for the same metric and range", () => {
    const a = getMetricSeries("orders", "7d");
    const b = getMetricSeries("orders", "7d");
    expect(a.total).toBe(b.total);
    expect(a.points).toEqual(b.points);
  });

  it("averages conversion rate instead of summing it", () => {
    const s = getMetricSeries("conversion", "30d");
    expect(s.total).toBeGreaterThan(0);
    expect(s.total).toBeLessThan(10);
  });

  it("rejects unknown ranges", () => {
    expect(() => getRange("nope" as never)).toThrow();
  });
});

describe("currency", () => {
  it("supports the 11 currencies from the settings panel", () => {
    expect(CURRENCIES.map((c) => c.code)).toEqual([
      "MAD", "USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY", "INR", "BRL",
    ]);
  });

  it("keeps INR amounts unchanged", () => {
    expect(convertFromINR(50000, "INR")).toBe(50000);
  });

  it("converts INR to USD with the configured rate", () => {
    expect(convertFromINR(50000, "USD")).toBeCloseTo(570, 0);
  });

  it("formats money with grouped digits and trailing symbol", () => {
    expect(formatMoney(975000, "INR")).toBe("975,000 ₹");
    expect(formatMoney(50000, "USD")).toBe("570 $");
  });

  it("formats conversion totals as percentages", () => {
    expect(formatMetricTotal("conversion", 3.766, "INR")).toBe("3.77%");
  });

  it("formats sales totals through the selected currency", () => {
    expect(formatMetricTotal("sales", 50000, "USD")).toBe("570 $");
  });

  it("compacts axis ticks", () => {
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(2550000)).toBe("2.55M");
    expect(formatAxisTick("conversion", 3.4, "INR")).toBe("3%");
  });

  it("rejects unknown currencies", () => {
    expect(() => getCurrency("XXX")).toThrow();
  });
});

import { customizeSeries, badgeTextColor, translate, getMetricSeries as gms } from "@/lib/dashboard-data";

describe("customizeSeries", () => {
  it("sets total sales exactly to the typed number", () => {
    const s = customizeSeries(gms("sales", "today"), "sales", 5510, null);
    expect(s.total).toBe(5510);
  });
  it("chart values replace the current points", () => {
    const s = customizeSeries(gms("sales", "today"), "sales", null, [708, 784]);
    expect(s.points[0]?.current).toBe(708);
    expect(s.points[1]?.current).toBe(784);
  });
  it("conversion target is the average", () => {
    const s = customizeSeries(gms("conversion", "today"), "conversion", 3.77, null);
    expect(s.total).toBe(3.77);
  });
});

describe("badges and language", () => {
  it("light badge gets dark text", () => {
    expect(badgeTextColor("#e5e5e5")).toBe("#1a1a1a");
    expect(badgeTextColor("#7c3aed")).toBe("#ffffff");
  });
  it("translates sidebar labels", () => {
    expect(translate("fr", "Orders")).toBe("Commandes");
    expect(translate("de", "Orders")).toBe("Bestellungen");
  });
});
