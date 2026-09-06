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
  ReferenceLine,
} from "recharts";

interface LineConfig {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface MultiLineChartProps {
  data: Record<string, string | number>[];
  lines: LineConfig[];
  xKey?: string;
  height?: number;
  valueSuffix?: string;
  valuePrefix?: string;
  referenceLines?: { y: number; label: string; color?: string }[];
  /** Replaces the summary read out in place of the chart graphic. */
  ariaLabel?: string;
}

function describeLines(
  data: Record<string, string | number>[],
  lines: LineConfig[],
  xKey: string
): string {
  if (data.length === 0) return "Line chart with no data.";
  const series = lines.map((l) => l.label).join(", ");
  const first = String(data[0]?.[xKey] ?? "");
  const last = String(data[data.length - 1]?.[xKey] ?? "");
  const span = first && last && first !== last ? ` from ${first} to ${last}` : "";
  return `Line chart of ${series} across ${data.length} ${
    data.length === 1 ? "point" : "points"
  }${span}.`;
}

export default function MultiLineChart({
  data,
  lines,
  xKey = "month",
  height = 320,
  valueSuffix = "",
  valuePrefix = "",
  referenceLines = [],
  ariaLabel,
}: MultiLineChartProps) {
  // The SVG itself carries no text for assistive technology, so the wrapper
  // stands in for it with the shape of the data spelled out.
  const label = ariaLabel ?? describeLines(data, lines, xKey);

  return (
    <div role="img" aria-label={label} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="#d6d3d1"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{
              fontSize: 15,
              fill: "#78716c",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{
              fontSize: 15,
              fill: "#78716c",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v: number) =>
              `${valuePrefix}${v.toLocaleString()}${valueSuffix}`
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
            formatter={(value: number, name: string) => {
              const line = lines.find((l) => l.key === name);
              return [
                `${valuePrefix}${value.toLocaleString()}${valueSuffix}`,
                line?.label ?? name,
              ];
            }}
            itemSorter={(item: { value?: number }) => -(item.value ?? 0)}
            labelStyle={{
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              marginBottom: 2,
            }}
            cursor={{
              stroke: "#78716c",
              strokeOpacity: 0.3,
              strokeDasharray: "4 4",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "15px", fontFamily: "var(--font-mono)" }}
            formatter={(value: string) => {
              const line = lines.find((l) => l.key === value);
              return line?.label ?? value;
            }}
          />
          {referenceLines.map((ref, i) => (
            <ReferenceLine
              key={i}
              y={ref.y}
              stroke={ref.color ?? "#b85c3a"}
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: ref.label,
                position: "insideTopRight",
                fontSize: 14,
                fill: ref.color ?? "#b85c3a",
                fontFamily: "var(--font-mono)",
              }}
            />
          ))}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.dashed ? "6 4" : undefined}
              dot={false}
              activeDot={{
                r: 4,
                fill: line.color,
                strokeWidth: 2,
                stroke: "#faf6f0",
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
