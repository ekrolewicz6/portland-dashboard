"use client";

import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import Sparkline from "@/components/charts/Sparkline";

export interface HeadlineCardProps {
  question: string;
  headline: {
    value: string;
    label: string;
    subValue?: string;
    subLabel?: string;
  };
  trend: {
    direction: "up" | "down" | "flat";
    value: string;
    isPositive: boolean;
  };
  sparklineData: { value: number }[];
  source: string;
  lastUpdated: string;
  color: string;
  onClick?: () => void;
}

export default function HeadlineCard({
  question,
  headline,
  trend,
  sparklineData,
  source,
  lastUpdated,
  color,
  onClick,
}: HeadlineCardProps) {
  const trendColor = trend.isPositive ? "#16a34a" : "#dc2626";
  const trendBg = trend.isPositive
    ? "bg-green-50 text-green-700"
    : "bg-red-50 text-red-700";

  const TrendIcon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <button
      onClick={onClick}
      className="headline-card text-left w-full group"
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-forest)] uppercase tracking-wide leading-tight pr-4">
          {question}
        </h2>
        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-forest)] transition-colors flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-3xl font-extrabold text-[var(--color-slate-warm)] tracking-tight">
            {headline.value}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{headline.label}</p>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${trendBg}`}
          >
            <TrendIcon className="w-3 h-3" />
            {trend.value}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full mt-2"
            style={{
              backgroundColor: trendColor,
              boxShadow: `0 0 6px ${trendColor}40`,
            }}
          />
        </div>
      </div>

      {headline.subValue && (
        <p className="text-lg font-semibold text-gray-600 mt-1">
          {headline.subValue}{" "}
          <span className="text-sm font-normal text-gray-400">
            {headline.subLabel}
          </span>
        </p>
      )}

      <div className="mt-3 mb-3">
        <Sparkline data={sparklineData} color={color} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>Source: {source}</span>
        <span>Updated {lastUpdated}</span>
      </div>
    </button>
  );
}
