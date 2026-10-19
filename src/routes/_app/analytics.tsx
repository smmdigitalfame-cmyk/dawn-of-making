import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { ChannelSelect } from "@/components/dashboard/ChannelSelect";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { SalesChart } from "@/components/dashboard/SalesChart";
import {
  formatMoney,
  getCurrency,
  getMetricSeries,
  periodLegend,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Dashora — Analytics" },
      { name: "description", content: "Reports and insights about your store performance." },
      { property: "og:title", content: "Dashora — Analytics" },
      { property: "og:description", content: "Reports and insights about your store performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { range, currency } = useDashboard();
  const legend = periodLegend(range);

  const sales = getMetricSeries("sales", range);
  const orders = getMetricSeries("orders", range);
  const conversion = getMetricSeries("conversion", range);

  const grossSales = sales.total;
  const discounts = Math.round(grossSales * 0.04 * 100) / 100;
  const netSales = Math.round((grossSales - discounts) * 100) / 100;
  const shipping = Math.round(grossSales * 0.025 * 100) / 100;
  const taxes = Math.round(grossSales * 0.07 * 100) / 100;
  const ordersFulfilled = Math.max(1, Math.round(orders.total * 0.16));

  const cards = [
    { label: "Gross sales", value: formatMoney(grossSales, currency) },
    { label: "Returning customer rate", value: `${conversion.total.toFixed(2)}%` },
    { label: "Orders fulfilled", value: ordersFulfilled.toLocaleString("en-US") },
    { label: "Orders", value: Math.round(orders.total).toLocaleString("en-US") },
  ];

  const breakdown = [
    { label: "Gross sales", value: formatMoney(grossSales, currency), link: true },
    { label: "Discounts", value: formatMoney(discounts, currency), link: true },
    { label: "Net sales", value: formatMoney(netSales, currency), link: true },
    { label: "Shipping charges", value: formatMoney(shipping, currency), link: true },
    { label: "Taxes", value: formatMoney(taxes, currency), link: true },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            <FileBarChart className="h-3.5 w-3.5" />
            View reports
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <ChannelSelect />
        <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground shadow-sm">
          {currency} ({getCurrency(currency).symbol})
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex min-h-[110px] flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-[13px] font-medium text-foreground">{c.label}</p>
            <p className="text-xl font-semibold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + breakdown */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[13px] font-medium text-foreground">Total sales over time</p>
          <p className="text-xl font-semibold text-foreground">
            {formatMoney(grossSales, currency)}
          </p>
          <div className="mt-2">
            <SalesChart />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[13px] font-medium text-foreground">Total sales breakdown</p>
          <ul className="mt-3 flex flex-col">
            {breakdown.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-md px-2 py-2 odd:bg-muted/60"
              >
                <span className="text-[13px] font-medium text-teal underline decoration-teal/40 underline-offset-2">
                  {row.label}
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <span className="underline underline-offset-2">Learn more about analytics</span>
      </p>

      <p className="hidden">{legend.current}</p>
    </div>
  );
}
