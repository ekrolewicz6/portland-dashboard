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
} from "recharts";

interface TrendChartProps {
  data: { date: string; value: number; label?: string }[];
  color?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  showGrid?: boolean;
  /** Set to "auto" to zoom Y-axis to data range instead of starting at 0 */
  yAxisDomain?: "auto" | [number, number];
}

export default function TrendChart({
  data,
  color = "#1a3a2a",
  height = 260,
  valuePrefix = "",
  valueSuffix = "",
  showGrid = true,
  yAxisDomain,
}: TrendChartProps) {
  const gradientId = useId();

  // Compute YAxis width based on largest formatted value
  const maxVal = Math.max(...data.map((d) => d.value), 0);
  const maxFormatted = `${valuePrefix}${maxVal.toLocaleString()}${valueSuffix}`;
  const yAxisWidth = Math.max(56, maxFormatted.length * 9 + 8);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 6"
              stroke="#d6d3d1"
              strokeOpacity={0.5}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 15, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
          />
          <YAxis
            tick={{ fontSize: 15, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
            tickFormatter={(v: number) => `${valuePrefix}${v.toLocaleString()}${valueSuffix}`}
            domain={
              yAxisDomain === "auto"
                ? [(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.02)]
                : yAxisDomain ?? [0, "auto"]
            }
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
            formatter={(value: number) => [
              `${valuePrefix}${value.toLocaleString()}${valueSuffix}`,
              "",
            ]}
            labelStyle={{ fontWeight: 600, fontFamily: "var(--font-body)", marginBottom: 2 }}
            cursor={{ stroke: color, strokeOpacity: 0.3, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              strokeWidth: 2,
              stroke: "#faf6f0",
            }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
