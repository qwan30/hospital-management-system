"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface BarChartProps {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  compareKey?: string;
  height?: number;
  showLegend?: boolean;
  barColor?: string;
  compareColor?: string;
  title?: string;
  isLoading?: boolean;
}

export function BarChart({
  data,
  dataKey,
  xKey,
  compareKey,
  height = 280,
  showLegend = false,
  barColor = "var(--hc-blue-500)",
  compareColor = "var(--hc-border-strong)",
  title,
  isLoading = false,
}: BarChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-5">
        {title && <Skeleton className="mb-4 h-5 w-32 rounded" />}
        <Skeleton className="h-[280px] w-full rounded-[var(--radius-md)]" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        role="status"
        className="flex h-[320px] items-center justify-center rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] text-sm text-[var(--hc-text-muted)]"
      >
        No chart data available.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={title ? `${title} bar chart` : "Bar chart"}
      className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-5"
    >
      {title && (
        <h3 className="mb-4 text-base font-bold text-[var(--hc-text)]">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--hc-border-soft)"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--hc-text-muted)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--hc-text-muted)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--hc-border)",
              background: "var(--hc-surface)",
              fontSize: 13,
            }}
          />
          {showLegend && <Legend />}
          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          {compareKey && (
            <Bar
              dataKey={compareKey}
              fill={compareColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
