import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  METRICS,
  formatAxisTick,
  formatMetricTotal,
  getRange,
  type SeriesPoint,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: SeriesPoint }[];
}) {
  const { metric, currency, t } = useDashboard();
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  const metricLabel = t(METRICS.find((m) => m.key === metric)?.label ?? metric);
  const pct =
    point.previous === 0
      ? 0
      : Math.round(((point.current - point.previous) / point.previous) * 100);
  const positive = pct >= 0;
  return (
    <div className="w-44 rounded-xl border border-border bg-popover px-3.5 py-3 shadow-xl">
      <p className="text-[13px] font-semibold text-foreground">{metricLabel}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-teal" />
        {point.label}
      </p>
      <p className="text-lg font-semibold text-foreground">
        {formatMetricTotal(metric, point.current, currency)}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs">
        <span className={positive ? "font-semibold text-success" : "font-semibold text-destructive"}>
          {positive ? "↗" : "↘"} {Math.abs(pct)}%
        </span>
        <span className="text-muted-foreground">compared to previous</span>
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-chart-2" />
        {point.prevLabel}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {formatMetricTotal(metric, point.previous, currency)}
      </p>
    </div>
  );
}

export function SalesChart() {
  const { metric, range, currency, seriesFor, custom } = useDashboard();
  const series = useMemo(() => seriesFor(metric), [seriesFor, metric, custom]);
  const def = getRange(range);

  const tickInterval = Math.max(0, Math.floor(def.points / 12) - 1);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          key={`${metric}-${range}-${currency}`}
          data={series.points}
          margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
        >
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(v: number) => formatAxisTick(metric, v, currency)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="var(--color-chart-2)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
            dot={false}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="var(--color-teal)"
            strokeWidth={2.5}
            fill="transparent"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-teal)" }}
            isAnimationActive
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
