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
  formatAxisTick,
  formatMetricTotal,
  getMetricSeries,
  getRange,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; dataKey?: string }[];
  label?: string;
}) {
  const { metric, currency } = useDashboard();
  if (!active || !payload || payload.length === 0) return null;
  const current = payload.find((p) => p.dataKey === "current");
  const previous = payload.find((p) => p.dataKey === "previous");
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {current && (
        <p className="text-sm font-semibold text-foreground">
          {formatMetricTotal(metric, Number(current.value), currency)}
        </p>
      )}
      {previous && (
        <p className="text-xs text-muted-foreground">
          Previous: {formatMetricTotal(metric, Number(previous.value), currency)}
        </p>
      )}
    </div>
  );
}

export function SalesChart() {
  const { metric, range, currency } = useDashboard();
  const series = useMemo(() => getMetricSeries(metric, range), [metric, range]);
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
          <defs>
            <linearGradient id="dashoraLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            fill="url(#dashoraLine)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--color-teal)" }}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
