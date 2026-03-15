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

  const TrendIcon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <div
      onClick={onClick}
      className="metric-card text-left w-full group"
      style={{ "--accent-color": color } as React.CSSProperties}
    >
      {/* ── Question ── */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <h2 className="font-editorial text-[18px] 2xl:text-[20px] text-[var(--color-ink)] leading-snug">
          {question}
        </h2>
        <ArrowRight className="w-4 h-4 text-[var(--color-ink-muted)]/20 group-hover:text-[var(--color-ink-muted)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1.5" />
      </div>

      {/* ── Big Number ── */}
      <p className="text-[36px] 2xl:text-[42px] font-bold text-[var(--color-ink)] tracking-tight leading-none">
        {headline.value}
      </p>
      <p className="text-[14px] 2xl:text-[15px] text-[var(--color-ink-muted)] mt-2 leading-snug">
        {headline.label}
      </p>

      {/* ── Trend pill ── */}
      <div className="mt-3">
        <span className={trendClass}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trend.value}
        </span>
      </div>

      {/* ── Sub-metric ── */}
      {headline.subValue && (
        <div className="mt-3 pt-3 border-t border-[var(--color-parchment)]/60">
          <span className="text-[22px] 2xl:text-[26px] font-semibold text-[var(--color-ink-light)]">
            {headline.subValue}
          </span>
          <span className="text-[13px] text-[var(--color-ink-muted)] ml-2">
            {headline.subLabel}
          </span>
        </div>
      )}

      {/* ── Sparkline ── */}
      <div className="mt-5 mb-5">
        <Sparkline data={sparklineData} color={color} height={52} />
      </div>

      {/* ── Footer: source + status + date stacked ── */}
      <div className="pt-3 border-t border-[var(--color-parchment)] space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--color-ink-muted)] font-medium tracking-wide uppercase truncate">
            {source}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {dataStatus && (
            <DataSourceBadge
              status={dataStatus.status}
              label={dataStatus.label}
              tooltip={dataStatus.tooltip}
            />
          )}
          <span className="text-[12px] text-[var(--color-ink-muted)]/50 font-mono ml-auto">
            {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
}
