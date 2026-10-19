import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronUp, Pencil } from "lucide-react";
import {
  METRICS,
  formatMetricTotal,
  getMetricSeries,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

export function MetricCards() {
  const { metric, setMetric, range, currency } = useDashboard();

  const summaries = useMemo(
    () =>
      METRICS.map((m) => ({
        ...m,
        series: getMetricSeries(m.key, range),
      })),
    [range],
  );

  // Active metric first, the rest in original order — like the reference UI.
  const ordered = [
    ...summaries.filter((s) => s.key === metric),
    ...summaries.filter((s) => s.key !== metric),
  ];

  return (
    <div className="relative grid grid-cols-2 gap-2 p-2 pr-10 md:grid-cols-4">
      {ordered.map((s) => {
        const active = s.key === metric;
        const positive = s.series.changePct >= 0;
        return (
          <button
            key={s.key}
            onClick={() => setMetric(s.key)}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              active ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "text-[13px] font-semibold underline decoration-dotted decoration-muted-foreground/60 underline-offset-[5px]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
              {active && <Pencil className="h-3.5 w-3.5 text-muted-foreground" />}
            </span>
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "whitespace-nowrap text-[15px] font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {formatMetricTotal(s.key, s.series.total, currency)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  positive ? "text-success" : "text-muted-foreground",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(s.series.changePct)}%
              </span>
            </span>
          </button>
        );
      })}
      <ChevronUp className="absolute right-4 top-6 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
