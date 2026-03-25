// ---------------------------------------------------------------------------
// Portland Civic Lab Dashboard — Utility Functions
// ---------------------------------------------------------------------------

import { clsx, type ClassValue } from "clsx";
import type { QuestionId, TrendDirection } from "@/types/dashboard";

// ---------------------------------------------------------------------------
// cn — className merger (clsx)
// ---------------------------------------------------------------------------

/**
 * Merge class names with clsx.
 * Drop-in replacement for `classnames` / `clsx` so every component imports
 * from one place.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

/**
 * Format a number with optional K/M suffixes.
 *
 * @example
 * formatNumber(1_234)       // "1.2K"
 * formatNumber(2_500_000)   // "2.5M"
 * formatNumber(850)         // "850"
 * formatNumber(42, 0)       // "42"
 */
export function formatNumber(
  value: number,
  maximumFractionDigits = 1,
): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(maximumFractionDigits)}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(maximumFractionDigits)}K`;
  }

  return value.toLocaleString("en-US", { maximumFractionDigits });
}

// ---------------------------------------------------------------------------
// Percent formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as a percentage string.
 *
 * @example
 * formatPercent(0.1234)  // "12.3%"
 * formatPercent(45.6)    // "45.6%"  (values > 1 treated as already %)
 */
export function formatPercent(
  value: number,
  fractionDigits = 1,
): string {
  // If the value looks like a decimal ratio (< 1), convert to percent.
  const pct = Math.abs(value) < 1 ? value * 100 : value;
  return `${pct.toFixed(fractionDigits)}%`;
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Format an ISO-8601 date string for display.
 *
 * @example
 * formatDate("2026-03-14")            // "Mar 14, 2026"
 * formatDate("2026-03-14", "short")   // "3/14/26"
 */
export function formatDate(
  iso: string,
  style: "long" | "short" = "long",
): string {
  const date = new Date(iso);

  if (style === "short") {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Trend helpers
// ---------------------------------------------------------------------------

/**
 * Questions where a downward trend is *good* news.
 * For everything else an upward trend is positive.
 */
const INVERTED_QUESTIONS: ReadonlySet<QuestionId> = new Set([
  "safety", // crime going down = good
  "tax", // tax burden going down = good
  "fiscal", // tax/debt going down = good
  "homelessness", // homelessness going down = good
]);

/**
 * Return a Tailwind text-color class that reflects whether the trend is
 * positive or negative *in context*.
 *
 * For most questions "up" = green, "down" = red.
 * For inverted questions (e.g. crime, taxes) "down" = green, "up" = red.
 */
export function getTrendColor(
  direction: TrendDirection,
  questionId?: QuestionId,
): string {
  if (direction === "flat") return "text-gray-500";

  const inverted = questionId != null && INVERTED_QUESTIONS.has(questionId);
  const isPositive = inverted
    ? direction === "down"
    : direction === "up";

  return isPositive ? "text-green-600" : "text-red-600";
}

/**
 * Return a lucide-react icon name representing the trend direction.
 */
export function getTrendIcon(direction: TrendDirection): string {
  switch (direction) {
    case "up":
      return "trending-up";
    case "down":
      return "trending-down";
    case "flat":
      return "minus";
  }
}
