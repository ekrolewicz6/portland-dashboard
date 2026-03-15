"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from "recharts";

interface SparklineProps {
  data: { value: number }[];
  color?: string;
  height?: number;
}

export default function Sparkline({
  data,
  color = "#1a3a2a",
  height = 44,
}: SparklineProps) {
  const gradientId = useId();

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
