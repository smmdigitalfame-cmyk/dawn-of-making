// Pure data layer for the Dashora dashboard: date ranges, deterministic
// series generation, currency conversion and formatting. No React here so
// every rule stays unit-testable.

export type RangeKey =
  | "today"
  | "30min"
  | "yesterday"
  | "12h"
  | "7d"
  | "30d"
  | "90d"
  | "365d"
  | "12m"
  | "lastweek"
  | "lastmonth";

export type MetricKey = "sales" | "visits" | "orders" | "conversion";

export interface RangeDef {
  key: RangeKey;
  label: string;
  points: number;
  /** How x-axis ticks are labelled. */
  axis: "hours" | "minutes" | "days" | "d-index" | "months";
}

export const RANGES: RangeDef[] = [
  { key: "today", label: "Today", points: 23, axis: "hours" },
  { key: "30min", label: "Last 30 minutes", points: 30, axis: "minutes" },
  { key: "yesterday", label: "Yesterday", points: 23, axis: "hours" },
  { key: "12h", label: "Last 12 hours", points: 24, axis: "hours" },
  { key: "7d", label: "Last 7 days", points: 7, axis: "days" },
  { key: "30d", label: "Last 30 days", points: 30, axis: "days" },
  { key: "90d", label: "Last 90 days", points: 90, axis: "d-index" },
  { key: "365d", label: "Last 365 days", points: 52, axis: "d-index" },
  { key: "12m", label: "Last 12 months", points: 12, axis: "months" },
  { key: "lastweek", label: "Last week", points: 7, axis: "days" },
  { key: "lastmonth", label: "Last month", points: 30, axis: "days" },
];

export function getRange(key: RangeKey): RangeDef {
  const found = RANGES.find((r) => r.key === key);
  if (!found) throw new Error(`Unknown range: ${key}`);
  return found;
}

export const METRICS: { key: MetricKey; label: string }[] = [
  { key: "sales", label: "Total sales" },
  { key: "visits", label: "Visits" },
  { key: "orders", label: "Orders" },
  { key: "conversion", label: "Conversion rate" },
];

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator so a given range always renders the
// same shape (stable across reloads, like a real store's data).
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface SeriesPoint {
  label: string;
  /** Label for the same point in the previous period (shown in tooltips). */
  prevLabel: string;
  current: number;
  previous: number;
}

/** Build one wavy series of `points` values, deterministic per seed. */
function waveSeries(points: number, seed: number, base: number, amp: number) {
  const rand = mulberry32(seed);
  const phase1 = rand() * Math.PI * 2;
  const phase2 = rand() * Math.PI * 2;
  const freq1 = 2 + rand() * 3;
  const freq2 = 5 + rand() * 5;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(points - 1, 1);
    const wave =
      Math.sin(t * Math.PI * freq1 + phase1) * 0.6 +
      Math.sin(t * Math.PI * freq2 + phase2) * 0.4;
    const noise = (rand() - 0.5) * 0.35;
    const v = base + amp * (wave + noise);
    out.push(Math.max(0, v));
  }
  return out;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "19 Oct 2026" style date label. */
export function formatDateLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function daysAgo(n: number, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

function axisLabel(def: RangeDef, i: number): string {
  switch (def.axis) {
    case "hours":
      return `${String(i).padStart(2, "0")} h`;
    case "minutes":
      return `${i} m`;
    case "days":
      return `${i + 1}`;
    case "d-index":
      return `D${i + 1}`;
    case "months":
      return `M${i + 1}`;
  }
}

/** Tooltip labels: current point and the matching point in the previous period. */
function axisLabelPair(def: RangeDef, i: number): { label: string; prevLabel: string } {
  switch (def.axis) {
    case "hours": {
      const hh = String(i).padStart(2, "0");
      const today = WEEKDAYS[new Date().getDay()];
      const yesterday = WEEKDAYS[daysAgo(1).getDay()];
      return { label: `${today} ${hh}:00`, prevLabel: `${yesterday} ${hh}:00` };
    }
    case "minutes":
      return { label: `${i} min ago`, prevLabel: `${i + def.points} min ago` };
    case "days": {
      const cur = daysAgo(def.points - 1 - i);
      const prev = daysAgo(def.points - 1 - i + def.points);
      return {
        label: `${WEEKDAYS[cur.getDay()]} ${cur.getDate()} ${MONTHS[cur.getMonth()]}`,
        prevLabel: `${WEEKDAYS[prev.getDay()]} ${prev.getDate()} ${MONTHS[prev.getMonth()]}`,
      };
    }
    case "d-index":
      return { label: `Day ${i + 1}`, prevLabel: `Day ${i + 1} (prev)` };
    case "months": {
      const cur = new Date();
      cur.setMonth(cur.getMonth() - (def.points - 1 - i));
      const prev = new Date(cur);
      prev.setFullYear(prev.getFullYear() - 1);
      return {
        label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`,
        prevLabel: `${MONTHS[prev.getMonth()]} ${prev.getFullYear()}`,
      };
    }
  }
}

/** Legend labels under the chart, e.g. "19 Oct 2026" vs "18 Oct 2026". */
export function periodLegend(range: RangeKey): { current: string; previous: string } {
  const def = getRange(range);
  switch (def.axis) {
    case "hours":
    case "minutes":
      return {
        current: formatDateLabel(new Date()),
        previous: formatDateLabel(daysAgo(1)),
      };
    case "days":
      return {
        current: `${formatDateLabel(daysAgo(def.points - 1))} – ${formatDateLabel(new Date())}`,
        previous: `${formatDateLabel(daysAgo(def.points * 2 - 1))} – ${formatDateLabel(daysAgo(def.points))}`,
      };
    case "d-index":
      return {
        current: `${formatDateLabel(daysAgo(def.points - 1))} – ${formatDateLabel(new Date())}`,
        previous: `${formatDateLabel(daysAgo(def.points * 2 - 1))} – ${formatDateLabel(daysAgo(def.points))}`,
      };
    case "months": {
      const start = new Date();
      start.setMonth(start.getMonth() - (def.points - 1));
      return {
        current: `${MONTHS[start.getMonth()]} ${start.getFullYear()} – ${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`,
        previous: "Previous year",
      };
    }
  }
}

export interface MetricSeries {
  points: SeriesPoint[];
  total: number;
  previousTotal: number;
  /** Percent change vs previous period, e.g. 67 means +67%. */
  changePct: number;
}

/** Generate the series for one metric over a range. Sales are in INR. */
export function getMetricSeries(metric: MetricKey, range: RangeKey): MetricSeries {
  const def = getRange(range);
  const seed = hashString(`${metric}:${range}`);

  const scale: Record<MetricKey, { base: number; amp: number }> = {
    sales: { base: 9000, amp: 4200 },
    visits: { base: 900, amp: 380 },
    orders: { base: 34, amp: 15 },
    conversion: { base: 2.1, amp: 0.9 },
  };
  const { base, amp } = scale[metric];

  const current = waveSeries(def.points, seed, base, amp);
  const previous = waveSeries(def.points, seed + 7919, base * 0.62, amp * 0.6);

  const points: SeriesPoint[] = current.map((v, i) => {
    const pair = axisLabelPair(def, i);
    return {
      label: def.axis === "hours" || def.axis === "minutes" ? axisLabel(def, i) : pair.label,
      prevLabel: pair.prevLabel,
      current: Math.round(v * 100) / 100,
      previous: Math.round((previous[i] ?? 0) * 100) / 100,
    };
  });

  // Rates are averaged over the period; counts and amounts are summed.
  const aggregate = (vals: number[]) =>
    metric === "conversion"
      ? vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1)
      : vals.reduce((a, b) => a + b, 0);
  const total = aggregate(current);
  const previousTotal = aggregate(previous);
  const changePct =
    previousTotal === 0 ? 0 : Math.round(((total - previousTotal) / previousTotal) * 100);

  return {
    points,
    total: Math.round(total * 100) / 100,
    previousTotal: Math.round(previousTotal * 100) / 100,
    changePct,
  };
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export interface Currency {
  code: string;
  symbol: string;
  /** Multiply an INR amount by this to get the amount in this currency. */
  rateFromINR: number;
}

export const CURRENCIES: Currency[] = [
  { code: "MAD", symbol: "DH", rateFromINR: 0.113 },
  { code: "USD", symbol: "$", rateFromINR: 0.0114 },
  { code: "EUR", symbol: "€", rateFromINR: 0.0098 },
  { code: "GBP", symbol: "£", rateFromINR: 0.0085 },
  { code: "CAD", symbol: "C$", rateFromINR: 0.0158 },
  { code: "AUD", symbol: "A$", rateFromINR: 0.0173 },
  { code: "CHF", symbol: "CHF", rateFromINR: 0.0092 },
  { code: "JPY", symbol: "¥", rateFromINR: 1.71 },
  { code: "CNY", symbol: "¥", rateFromINR: 0.081 },
  { code: "INR", symbol: "₹", rateFromINR: 1 },
  { code: "BRL", symbol: "R$", rateFromINR: 0.061 },
];

export function getCurrency(code: string): Currency {
  const found = CURRENCIES.find((c) => c.code === code);
  if (!found) throw new Error(`Unknown currency: ${code}`);
  return found;
}

export function convertFromINR(amountINR: number, code: string): number {
  return amountINR * getCurrency(code).rateFromINR;
}

/** Format like the store admin: grouped number followed by the symbol, e.g. "975,000 $". */
export function formatMoney(amountINR: number, code: string): string {
  const currency = getCurrency(code);
  const converted = convertFromINR(amountINR, code);
  const rounded = Math.round(converted * 100) / 100;
  const text = rounded.toLocaleString("en-US", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${text} ${currency.symbol}`;
}

/** Compact axis formatting: 1500 -> "1.5K", 2_550_000 -> "2.55M". */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${trimZeros(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trimZeros(value / 1_000)}K`;
  return `${Math.round(value * 100) / 100}`;
}

function trimZeros(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

/** Format a metric total for the card header. */
export function formatMetricTotal(metric: MetricKey, total: number, currencyCode: string): string {
  if (metric === "sales") return formatMoney(total, currencyCode);
  if (metric === "conversion") return `${(Math.round(total * 100) / 100).toFixed(2)}%`;
  return Math.round(total).toLocaleString("en-US");
}

/** Y-axis tick label per metric. */
export function formatAxisTick(metric: MetricKey, value: number, currencyCode: string): string {
  if (metric === "sales") {
    const converted = convertFromINR(value, currencyCode);
    return formatCompact(converted);
  }
  if (metric === "conversion") return `${Math.round(value)}%`;
  return formatCompact(value);
}

// ---------------------------------------------------------------------------
// Customization (pencil editor): overrides applied on top of generated series.
// ---------------------------------------------------------------------------

export type Language = "en" | "fr" | "de";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
];

export const BADGE_COLORS = [
  "#ec4899", "#7c3aed", "#f43f5e", "#2dd4bf", "#38b2c8",
  "#8ad9b5", "#f0d070", "#e5e5e5", "#10b981", "#6b7280",
];

/** Readable text color (dark or light) for a hex badge background. */
export function badgeTextColor(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65 ? "#1a1a1a" : "#ffffff";
}

/**
 * Apply user overrides to a series. `chartValues` replaces current points
 * (index by index); `target` then rescales current points so the period
 * total (or average for conversion) equals the target exactly.
 */
export function customizeSeries(
  series: MetricSeries,
  metric: MetricKey,
  target: number | null,
  chartValues: number[] | null,
): MetricSeries {
  let points = series.points.map((p, i) => {
    const v = chartValues?.[i];
    return typeof v === "number" && Number.isFinite(v) ? { ...p, current: v } : p;
  });
  const agg = (vals: number[]) =>
    metric === "conversion"
      ? vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1)
      : vals.reduce((a, b) => a + b, 0);
  let total = agg(points.map((p) => p.current));
  if (target !== null && Number.isFinite(target)) {
    const factor = total === 0 ? 0 : target / total;
    points = points.map((p) => ({ ...p, current: Math.round(p.current * factor * 100) / 100 }));
    total = target;
  }
  const prev = series.previousTotal;
  const changePct = prev === 0 ? 0 : Math.round(((total - prev) / prev) * 100);
  return { ...series, points, total: Math.round(total * 100) / 100, changePct };
}

const DICT: Record<Language, Record<string, string>> = {
  en: {},
  fr: {
    Home: "Accueil", Orders: "Commandes", Products: "Produits", Customers: "Clients",
    Marketing: "Marketing", Discounts: "Réductions", Content: "Contenu",
    Metaobjects: "Métaobjets", Markets: "Marchés", Finances: "Finances",
    Analytics: "Statistiques", "Online Store": "Boutique en ligne",
    "Point of Sale": "Point de vente", Apps: "Applications", Settings: "Paramètres",
    "Sales channels": "Canaux de vente", "Total sales": "Ventes totales",
    Visits: "Visites", "Conversion rate": "Taux de conversion",
    visitors: "visiteurs", "Next payout": "Prochain versement",
    "Orders to fulfill": "Commandes à traiter", "High risk orders": "Commandes à risque",
    greeting: "Bonsoir, commençons !", Search: "Rechercher",
  },
  de: {
    Home: "Startseite", Orders: "Bestellungen", Products: "Produkte", Customers: "Kunden",
    Marketing: "Marketing", Discounts: "Rabatte", Content: "Inhalte",
    Metaobjects: "Metaobjekte", Markets: "Märkte", Finances: "Finanzen",
    Analytics: "Analysen", "Online Store": "Onlineshop",
    "Point of Sale": "Point of Sale", Apps: "Apps", Settings: "Einstellungen",
    "Sales channels": "Vertriebskanäle", "Total sales": "Gesamtumsatz",
    Visits: "Besuche", "Conversion rate": "Conversion-Rate",
    visitors: "Besucher", "Next payout": "Nächste Auszahlung",
    "Orders to fulfill": "Zu erfüllende Bestellungen", "High risk orders": "Risikobestellungen",
    greeting: "Guten Abend, legen wir los!", Search: "Suchen",
  },
};

export function translate(lang: Language, key: string): string {
  if (key === "greeting" && lang === "en") return "Good evening, let\u2019s get started!";
  return DICT[lang]?.[key] ?? key;
}
