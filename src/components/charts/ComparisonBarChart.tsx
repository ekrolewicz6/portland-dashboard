"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

interface BarConfig {
  key: string;
  label: string;
  color: string;
  stackId?: string;
}

interface ComparisonBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: BarConfig[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  showLegend?: boolean;
  colorByValue?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  referenceLine?: number;
  /** Replaces the summary read out in place of the chart graphic. */
  ariaLabel?: string;
}

function describeComparison(
  data: Record<string, string | number>[],
  xKey: string,
  bars: BarConfig[]
): string {
  if (data.length === 0) return "Bar chart with no data.";
  const series = bars.map((b) => b.label).join(", ");
  const first = String(data[0]?.[xKey] ?? "");
  const last = String(data[data.length - 1]?.[xKey] ?? "");
  const span = first && last && first !== last ? ` from ${first} to ${last}` : "";
  return `Grouped bar chart comparing ${series} across ${data.length} ${
    data.length === 1 ? "category" : "categories"
  }${span}.`;
}

export default function ComparisonBarChart({
  data,
  xKey,
  bars,
  height = 300,
  valuePrefix = "",
  valueSuffix = "",
  showLegend = true,
  colorByValue = false,
  positiveColor = "#3d7a5a",
  negativeColor = "#b85c3a",
  referenceLine,
  ariaLabel,
}: ComparisonBarChartProps) {
  // The SVG itself carries no text for assistive technology, so the wrapper
  // stands in for it with the shape of the data spelled out.
  const label = ariaLabel ?? describeComparison(data, xKey, bars);

  return (
    <div role="img" aria-label={label} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="#d6d3d1"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 14, fill: "#78716c", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
            interval="preserveStartEnd"
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
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: "16px", fontFamily: "var(--font-body)" }}
            />
          )}
          {referenceLine !== undefined && (
            <ReferenceLine
              y={referenceLine}
              stroke="#78716c"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              stackId={bar.stackId}
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              {colorByValue &&
                data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      Number(entry[bar.key]) >= 0 ? positiveColor : negativeColor
                    }
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
