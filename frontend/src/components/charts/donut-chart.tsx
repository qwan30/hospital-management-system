"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  height?: number;
  showLegend?: boolean;
  title?: string;
  isLoading?: boolean;
}

export function DonutChart({
  segments,
  height = 260,
  showLegend = true,
  title,
  isLoading = false,
}: DonutChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-5">
        {title && <Skeleton className="mb-2 h-5 w-32 rounded" />}
        <div className="flex items-center justify-center">
          <Skeleton className="size-[200px] rounded-full" />
        </div>
      </div>
    );
  }

  if (!segments.length) {
    return (
      <div
        role="status"
        className="flex h-[300px] items-center justify-center rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] text-sm text-[var(--hc-text-muted)]"
      >
        No chart data available.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={title ? `${title} donut chart` : "Donut chart"}
      className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-5"
    >
      {title && (
        <h3 className="mb-2 text-base font-bold text-[var(--hc-text)]">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={segments}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {segments.map((seg, i) => (
              <Cell key={i} fill={seg.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--hc-border)",
              background: "var(--hc-surface)",
              fontSize: 13,
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: "var(--hc-text-secondary)", fontSize: 13 }}>
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
