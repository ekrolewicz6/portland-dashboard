"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DualLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  line1Key: string;
  line2Key: string;
  line1Label?: string;
  line2Label?: string;
  color1?: string;
  color2?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  referenceLine?: number;
  /** Replaces the summary read out in place of the chart graphic. */
  ariaLabel?: string;
}

function describeDualLines(
  data: Record<string, string | number>[],
  xKey: string,
  label1: string,
  label2: string
): string {
  if (data.length === 0) return "Line chart with no data.";
  const first = String(data[0]?.[xKey] ?? "");
  const last = String(data[data.length - 1]?.[xKey] ?? "");
  const span = first && last && first !== last ? ` from ${first} to ${last}` : "";
  return `Line chart comparing ${label1} and ${label2} across ${data.length} ${
    data.length === 1 ? "point" : "points"
  }${span}.`;
}

export default function DualLineChart({
  data,
  xKey,
  line1Key,
  line2Key,
  line1Label,
  line2Label,
  color1 = "#3d7a5a",
  color2 = "#b85c3a",
  height = 300,
  valuePrefix = "",
  valueSuffix = "",
  ariaLabel,
}: DualLineChartProps) {
  // The SVG itself carries no text for assistive technology, so the wrapper
  // stands in for it with the shape of the data spelled out.
  const label =
    ariaLabel ??
    describeDualLines(
      data,
      xKey,
      line1Label || line1Key,
      line2Label || line2Key
    );

  return (
    <div role="img" aria-label={label} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
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
          />
          <YAxis
            tick={{ fontSize: 15, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={50}
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
            formatter={(value: number, name: string) => [
              `${valuePrefix}${value.toLocaleString()}${valueSuffix}`,
              name,
            ]}
            labelStyle={{ fontWeight: 600, fontFamily: "var(--font-body)", marginBottom: 2 }}
          />
          <Legend
            wrapperStyle={{ fontSize: "16px", fontFamily: "var(--font-body)" }}
          />
          <Line
            type="monotone"
            dataKey={line1Key}
            name={line1Label || line1Key}
            stroke={color1}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color1, strokeWidth: 2, stroke: "#faf6f0" }}
          />
          <Line
            type="monotone"
            dataKey={line2Key}
            name={line2Label || line2Key}
            stroke={color2}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color2, strokeWidth: 2, stroke: "#faf6f0" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
