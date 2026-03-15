"use client";

import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import Sparkline from "@/components/charts/Sparkline";
import DataSourceBadge from "@/components/cards/DataSourceBadge";
import type { DataSourceStatus } from "@/data/source-status";

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
  /** Optional data source status to display a provenance badge */
  dataStatus?: {
    status: DataSourceStatus;
    label: string;
    tooltip?: string;
  };
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
  dataStatus,
}: HeadlineCardProps) {
  const trendClass = trend.isPositive
    ? "trend-pill trend-positive"
    : trend.direction === "flat"
      ? "trend-pill trend-neutral"
      : "trend-pill trend-negative";

  const signalColor = trend.isPositive
    ? "#059669"
    : trend.direction === "flat"
      ? "#78716c"
      : "#dc2626";

  const TrendIcon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <button
      onClick={onClick}
      className="metric-card text-left w-full group"
      style={{ "--accent-color": color } as React.CSSProperties}
    >
      {/* Question header */}
      <div className="flex items-start justify-between mb-4">
        <h2 className="font-editorial text-[17px] text-[var(--color-ink)] leading-snug pr-6">
          {question}
        </h2>
        <ArrowRight className="w-4 h-4 text-[var(--color-ink-muted)]/30 group-hover:text-[var(--color-ink-muted)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>

      {/* Headline metric + trend */}
      <div className="flex items-end justify-between mb-1.5">
        <div>
          <p className="text-[32px] font-bold text-[var(--color-ink)] tracking-tight leading-none">
            {headline.value}
          </p>
          <p className="text-[13px] text-[var(--color-ink-muted)] mt-1.5">
            {headline.label}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={trendClass}>
            <TrendIcon className="w-3 h-3" />
            {trend.value}
          </span>
          <span
            className="signal-dot"
            style={{ backgroundColor: signalColor, color: signalColor }}
          />
        </div>
      </div>

      {/* Sub-metric */}
      {headline.subValue && (
        <div className="flex items-baseline gap-1.5 mt-2 mb-1">
          <span className="text-[20px] font-semibold text-[var(--color-ink-light)]">
            {headline.subValue}
          </span>
          <span className="text-[12px] text-[var(--color-ink-muted)]">
            {headline.subLabel}
          </span>
        </div>
      )}

      {/* Sparkline */}
      <div className="mt-4 mb-4">
        <Sparkline data={sparklineData} color={color} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-parchment)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-[var(--color-ink-muted)] font-medium tracking-wide uppercase truncate">
            {source}
          </span>
          {dataStatus && (
            <DataSourceBadge
              status={dataStatus.status}
              label={dataStatus.label}
              tooltip={dataStatus.tooltip}
            />
          )}
        </div>
        <span className="text-[11px] text-[var(--color-ink-muted)]/60 font-mono flex-shrink-0">
          {lastUpdated}
        </span>
      </div>
    </button>
  );
}
