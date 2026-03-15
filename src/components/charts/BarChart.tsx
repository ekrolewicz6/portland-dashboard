"use client";

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface BarChartProps {
  data: { name: string; value: number; color?: string }[];
  color?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function BarChart({
  data,
  color = "#1a3a2a",
  height = 300,
  layout = "horizontal",
  valuePrefix = "",
  valueSuffix = "",
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={
            isVertical
              ? { top: 4, right: 32, left: 0, bottom: 4 }
              : { top: 8, right: 8, left: -8, bottom: 0 }
          }
        >
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="#d6d3d1"
            strokeOpacity={0.5}
            horizontal={!isVertical}
            vertical={isVertical}
          />
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={{
                  fontSize: 11,
                  fill: "#78716c",
                  fontFamily: "var(--font-mono)",
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  `${valuePrefix}${v.toLocaleString()}${valueSuffix}`
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{
                  fontSize: 12,
                  fill: "#44403c",
                  fontFamily: "var(--font-body)",
                }}
                tickLine={false}
                axisLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                  fill: "#44403c",
                  fontFamily: "var(--font-body)",
                }}
                tickLine={false}
                axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#78716c",
                  fontFamily: "var(--font-mono)",
                }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v: number) =>
                  `${valuePrefix}${v.toLocaleString()}${valueSuffix}`
                }
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "#faf6f0",
              border: "1px solid #ebe5da",
              borderRadius: "2px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 16px rgba(15,36,25,0.1)",
              padding: "8px 12px",
            }}
            formatter={(value: number) => [
              `${valuePrefix}${value.toLocaleString()}${valueSuffix}`,
              "",
            ]}
            labelStyle={{
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              marginBottom: 2,
            }}
            cursor={{ fill: "rgba(15,36,25,0.04)" }}
          />
          <Bar
            dataKey="value"
            radius={isVertical ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color ?? color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
