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
}: ComparisonBarChartProps) {
  return (
    <div style={{ width: "100%", height }}>
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
