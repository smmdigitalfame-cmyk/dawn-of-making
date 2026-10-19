import { useMemo } from "react";
import { ChevronUp, Pencil, TrendingDown, TrendingUp } from "lucide-react";
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
    <div className="relative grid grid-cols-2 gap-0 md:grid-cols-4">
      {ordered.map((s) => {
        const active = s.key === metric;
        const positive = s.series.changePct >= 0;
        return (
          <button
            key={s.key}
            onClick={() => setMetric(s.key)}
            className={cn(
              "group relative flex flex-col items-start gap-0.5 rounded-lg px-4 py-3 text-left transition-colors",
              active ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 text-[13px] font-medium text-foreground",
                active && "underline decoration-dotted underline-offset-4",
              )}
            >
              {s.label}
              {active && <Pencil className="h-3 w-3 text-muted-foreground" />}
            </span>
            <span className="flex items-baseline gap-3">
              <span className="text-lg font-semibold text-foreground">
                {formatMetricTotal(s.key, s.series.total, currency)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  positive ? "text-success" : "text-destructive",
                )}
              >
                {positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(s.series.changePct)}%
              </span>
            </span>
            {active && (
              <ChevronUp className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
