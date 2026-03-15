"use client";

import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  showLabels?: boolean;
}

const DEFAULT_COLORS = [
  "#3d7a5a", // fern
  "#c8956c", // ember
  "#4a7f9e", // river
  "#7c6f9e", // violet
  "#b85c3a", // clay
  "#b85c6a", // rose-hip
  "#1a3a2a", // canopy-mid
  "#d4a843", // gold
  "#64748b", // storm
];

export default function PieChart({
  data,
  height = 320,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  showLabels = true,
}: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={height / 2 - 40}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            animationDuration={800}
            animationEasing="ease-out"
            label={
              showLabels
                ? ({ name, percent }: { name: string; percent: number }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                : false
            }
            labelLine={showLabels}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color || colors[i % colors.length]}
                strokeWidth={1}
                stroke="#faf6f0"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#faf6f0",
              border: "1px solid #ebe5da",
              borderRadius: "2px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 16px rgba(15,36,25,0.1)",
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              paddingTop: "8px",
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
