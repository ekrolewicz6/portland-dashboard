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
  /** Replaces the summary read out in place of the chart graphic. */
  ariaLabel?: string;
}

function describeBars(
  data: { name: string; value: number }[],
  valuePrefix: string,
  valueSuffix: string
): string {
  if (data.length === 0) return "Bar chart with no data.";
  const format = (v: number) =>
    `${valuePrefix}${v.toLocaleString()}${valueSuffix}`;
  const ranked = [...data].sort((a, b) => b.value - a.value);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  if (data.length === 1) {
    return `Bar chart with one bar: ${highest.name} at ${format(highest.value)}.`;
  }
  return `Bar chart comparing ${data.length} categories, ranging from ${highest.name} at ${format(highest.value)} down to ${lowest.name} at ${format(lowest.value)}.`;
}

export default function BarChart({
  data,
  color = "#1a3a2a",
  height = 300,
  layout = "horizontal",
  valuePrefix = "",
  valueSuffix = "",
  ariaLabel,
}: BarChartProps) {
  const isVertical = layout === "vertical";

  // The SVG itself carries no text for assistive technology, so the wrapper
  // stands in for it with the shape of the data spelled out.
  const label = ariaLabel ?? describeBars(data, valuePrefix, valueSuffix);

  return (
    <div role="img" aria-label={label} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={
            isVertical
              ? { top: 4, right: 32, left: 0, bottom: 4 }
              : { top: 8, right: 8, left: 4, bottom: 40 }
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
                  fontSize: 15,
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
                  fontSize: 16,
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
                  fontSize: 12,
                  fill: "#44403c",
                  fontFamily: "var(--font-body)",
                }}
                tickLine={false}
                axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
                interval={0}
                angle={data.some((d) => d.name.length > 12) ? -25 : 0}
                textAnchor={data.some((d) => d.name.length > 12) ? "end" : "middle"}
                height={data.some((d) => d.name.length > 12) ? 60 : 30}
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
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "#faf6f0",
              border: "1px solid #ebe5da",
              borderRadius: "2px",
              fontSize: "14px",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 4px 16px rgba(15,36,25,0.1)",
              padding: "8px 12px",
            }}
            formatter={(value: number, _name: string, props: { payload?: { name?: string } }) => [
              `${valuePrefix}${value.toLocaleString()}${valueSuffix}`,
              props.payload?.name ?? "",
            ]}
            labelFormatter={(label: string) => {
              const item = data.find((d) => d.name === label);
              return item?.name ?? label;
            }}
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
