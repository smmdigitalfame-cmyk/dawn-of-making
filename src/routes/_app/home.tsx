import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Package } from "lucide-react";
import { AskBox } from "@/components/dashboard/AskBox";
import { ChannelSelect } from "@/components/dashboard/ChannelSelect";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { formatMoney, periodLegend } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

export const Route = createFileRoute("/_app/home")({
  head: () => ({
    meta: [
      { title: "Dashora — Home" },
      {
        name: "description",
        content:
          "Dashora store dashboard: live sales, visits, orders and conversion with animated charts, date ranges and multi-currency views.",
      },
      { property: "og:title", content: "Dashora — Home" },
      {
        property: "og:description",
        content: "Live sales dashboard with animated charts and multi-currency support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { visitors, payoutINR, currency, range } = useDashboard();
  const legend = periodLegend(range);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <DateRangePicker />
        <ChannelSelect />
        <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          {visitors} visitors
        </span>
        <span className="ml-auto rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-sm">
          Next payout:{" "}
          <strong className="font-semibold">{formatMoney(payoutINR, currency)}</strong>
        </span>
      </div>

      {/* Metrics + chart card */}
      <div className="relative rounded-xl border border-border bg-card shadow-sm">
        <MetricCards />
        <div className="px-2 pb-2">
          <SalesChart />
        </div>
        <div className="flex items-center justify-center gap-6 border-t border-border py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal" />
            {legend.current}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-2" />
            {legend.previous}
          </span>
        </div>
      </div>

      {/* Action pills */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
          <Package className="h-5 w-5 text-muted-foreground" />
          <strong className="font-semibold">12+</strong> Orders to fulfill
        </button>
        <button className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <strong className="font-semibold">3</strong> High risk orders
        </button>
      </div>

      <AskBox />

      {/* Insight card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">
          Recover sales with your abandoned cart email
        </h3>
        <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
          An automated email has already been created for you. Take a moment to
          review this email and adjust its design, message, or recipient list if
          needed.
        </p>
        <button className="mt-3 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
          Review email
        </button>
      </div>
    </div>
  );
}
