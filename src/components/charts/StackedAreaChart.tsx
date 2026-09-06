"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface StackedAreaChartProps {
  data: Record<string, string | number>[];
  areas: { key: string; label: string; color: string }[];
  xKey?: string;
  height?: number;
  /** Replaces the summary read out in place of the chart graphic. */
  ariaLabel?: string;
}

function describeAreas(
  data: Record<string, string | number>[],
  areas: { key: string; label: string }[],
  xKey: string
): string {
  if (data.length === 0) return "Stacked area chart with no data.";
  const series = areas.map((a) => a.label).join(", ");
  const first = String(data[0]?.[xKey] ?? "");
  const last = String(data[data.length - 1]?.[xKey] ?? "");
  const span = first && last && first !== last ? ` from ${first} to ${last}` : "";
  return `Stacked area chart of ${series} across ${data.length} ${
    data.length === 1 ? "point" : "points"
  }${span}.`;
}

export default function StackedAreaChart({
  data,
  areas,
  xKey = "month",
  height = 320,
  ariaLabel,
}: StackedAreaChartProps) {
  const baseId = useId();

  // The SVG itself carries no text for assistive technology, so the wrapper
  // stands in for it with the shape of the data spelled out.
  const label = ariaLabel ?? describeAreas(data, areas, xKey);

  return (
    <div role="img" aria-label={label} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            {areas.map((area, i) => (
              <linearGradient
                key={area.key}
                id={`${baseId}-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={area.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={area.color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="#d6d3d1"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 15, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 15, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#faf6f0",
              border: "1px solid #ebe5da",
              borderRadius: "2px",
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 16px rgba(15,36,25,0.1)",
              padding: "8px 12px",
            }}
            formatter={(value: number, name: string) => {
              const area = areas.find((a) => a.key === name);
              return [value.toLocaleString(), area?.label ?? name];
            }}
            labelStyle={{
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              marginBottom: 2,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "15px", fontFamily: "var(--font-mono)" }}
            formatter={(value: string) => {
              const area = areas.find((a) => a.key === value);
              return area?.label ?? value;
            }}
          />
          {areas.map((area, i) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stackId="1"
              stroke={area.color}
              strokeWidth={1.5}
              fill={`url(#${baseId}-${i})`}
              dot={false}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
