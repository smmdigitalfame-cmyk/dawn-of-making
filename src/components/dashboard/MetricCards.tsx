import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronUp, Pencil } from "lucide-react";
import { METRICS, formatMetricTotal } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * 60).toFixed(1)},${(18 - ((v - min) / span) * 16).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 60 20" className="spark-in h-5 w-[60px] shrink-0" aria-hidden>
      <path d={d} fill="none" stroke="var(--color-teal)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricCards({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: (() => void) | undefined }) {
  const { metric, setMetric, currency, seriesFor, setEditorOpen, t, custom } = useDashboard();

  const summaries = useMemo(
    () =>
      METRICS.map((m) => ({
        ...m,
        series: seriesFor(m.key),
      })),
    [seriesFor, custom],
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
                {t(s.label)}
              </span>
              {active && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Customize dashboard"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditorOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      setEditorOpen(true);
                    }
                  }}
                  className="rounded p-1 hover:bg-background"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
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
              {collapsed && <Sparkline values={s.series.points.map((p) => p.current)} />}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        aria-label={collapsed ? "Expand chart" : "Collapse chart"}
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="absolute right-2 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
      >
        <ChevronUp
          className={cn("h-4 w-4 transition-transform duration-300 ease-out", collapsed && "rotate-180")}
        />
      </button>
    </div>
  );
}
