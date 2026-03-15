"use client";

import Link from "next/link";
import HeadlineCard from "@/components/cards/HeadlineCard";
import InsightBanner from "@/components/cards/InsightBanner";
import { QUESTION_DATA_STATUS } from "@/data/source-status";
import type { QuestionId } from "@/types/dashboard";
import { Database } from "lucide-react";
import type { QuestionData } from "./types";

interface DashboardClientProps {
  questions: QuestionData[];
}

/** Map API trend to HeadlineCard trend props */
function mapTrend(apiTrend: { direction: "up" | "down" | "flat"; percentage: number; label: string }) {
  const isPositive =
    (apiTrend.direction === "up" && apiTrend.percentage > 0) ||
    (apiTrend.direction === "down" && apiTrend.label.toLowerCase().includes("improv"));

  return {
    direction: apiTrend.direction,
    value: apiTrend.percentage > 0
      ? `${apiTrend.direction === "down" ? "-" : "+"}${apiTrend.percentage}%`
      : apiTrend.label.length > 20
        ? apiTrend.label.slice(0, 20)
        : apiTrend.label,
    isPositive,
  };
}

/** Determine if a question has real displayable data */
function hasData(q: QuestionData): boolean {
  if (!q.apiData) return false;
  const status = q.apiData.dataStatus;
  if (status === "unavailable") return false;
  // dataAvailable explicitly false
  if (q.apiData.dataAvailable === false) return false;
  return true;
}

/** Extract a short headline value from the API headline string */
function extractHeadlineValue(headline: string): string {
  // Try to pull the first number-like value from the headline
  const match = headline.match(/^([\d,]+(?:\.\d+)?%?)/);
  if (match) return match[1];
  // Try to find a number with commas
  const numMatch = headline.match(/([\d,]+(?:\.\d+)?)/);
  if (numMatch) return numMatch[1];
  // Fallback
  return headline.split(" ").slice(0, 3).join(" ");
}

/** Extract a label from the headline (everything after the first number) */
function extractHeadlineLabel(headline: string): string {
  // Remove the leading number part
  const cleaned = headline.replace(/^[\d,]+(?:\.\d+)?%?\s*/, "");
  // Trim leading dashes or separators
  return cleaned.replace(/^[—–-]\s*/, "").trim() || headline;
}

/** Determine the "needed" text for unavailable questions */
function getNeededText(q: QuestionData): string {
  if (q.apiData?.dataSources && q.apiData.dataSources.length > 0) {
    const actions = q.apiData.dataSources
      .filter((s) => s.action && s.status !== "connected")
      .map((s) => s.action)
      .filter(Boolean);
    if (actions.length > 0) return actions[0]!;
  }
  if (q.apiData?.insights && q.apiData.insights.length > 0) {
    return q.apiData.insights[0];
  }
  // Fallback based on question id
  const fallbacks: Record<string, string> = {
    migration: "Water Bureau PRR + Census API key",
    business: "Revenue Division PRR (CivicApps offline)",
    program: "PCB registry not yet live",
  };
  return fallbacks[q.id] || "Data collection in progress";
}

export default function DashboardClient({ questions }: DashboardClientProps) {
  const liveQuestions = questions.filter(hasData);
  const unavailableQuestions = questions.filter((q) => !hasData(q));

  // Build insights from all questions with real data
  const insights = liveQuestions
    .flatMap((q) => {
      if (!q.apiData?.insights) return [];
      return q.apiData.insights.slice(0, 2).map((text, i) => ({
        id: `${q.id}-${i}`,
        text,
        question: q.id,
        severity: (i === 0 ? "high" : "medium") as "high" | "medium" | "low",
      }));
    })
    .slice(0, 6); // Cap at 6 insights total

  return (
    <div>
      {/* -- Hero -- */}
      <section className="relative bg-[var(--color-canopy)] overflow-hidden noise-overlay">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-canopy-light)] rounded-full blur-[180px] opacity-30 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-ember)] rounded-full blur-[160px] opacity-[0.06] translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5 animate-fade-up">
              <div className="w-8 h-px bg-[var(--color-ember)]" />
              <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
                Portland Commons Civic Dashboard
              </span>
            </div>
            <h1
              className="font-editorial-normal text-[38px] sm:text-[50px] lg:text-[60px] text-white leading-[1.08] tracking-tight animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              How is Portland{" "}
              <span className="font-editorial text-[var(--color-ember-bright)]">
                actually
              </span>{" "}
              doing?
            </h1>
            <p
              className="mt-4 text-[16px] text-white/50 leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Seven questions that drive Portland&apos;s story. Real data where
              we have it, honest gaps where we don&apos;t. Click any card to
              explore.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* -- Insights (from real API data) -- */}
      {insights.length > 0 && (
        <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 -mt-6 relative z-20">
          <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
            <InsightBanner insights={insights} />
          </div>
        </section>
      )}

      {/* -- Seven Questions Grid -- */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 mt-10 pb-16">
        <div className="section-divider">
          <h2>The Seven Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Cards with REAL data */}
          {liveQuestions.map((q, i) => {
            const status = QUESTION_DATA_STATUS[q.id as QuestionId];
            const api = q.apiData!;
            const headlineValue = extractHeadlineValue(api.headline);
            const headlineLabel = extractHeadlineLabel(api.headline);

            // Build sparkline data from chartData
            const sparklineData = (api.chartData || []).map((pt) => ({
              value: pt.value,
            }));

            return (
              <Link
                key={q.id}
                href={`/dashboard/${q.id}`}
                className="block animate-fade-up"
                style={{ animationDelay: `${400 + i * 60}ms` }}
              >
                <HeadlineCard
                  question={q.question}
                  headline={{
                    value: headlineValue,
                    label: headlineLabel,
                  }}
                  trend={mapTrend(api.trend)}
                  sparklineData={sparklineData}
                  source={api.source}
                  lastUpdated={api.lastUpdated}
                  color={q.color}
                  dataStatus={
                    status
                      ? {
                          status: status.overallStatus,
                          label: status.badgeLabel,
                          tooltip: status.badgeTooltip,
                        }
                      : undefined
                  }
                />
              </Link>
            );
          })}

          {/* Cards with NO real data -- data collection in progress */}
          {unavailableQuestions.map((q, i) => {
            const status = QUESTION_DATA_STATUS[q.id as QuestionId];
            const neededText = getNeededText(q);
            return (
              <Link
                key={q.id}
                href={`/dashboard/${q.id}`}
                className="block animate-fade-up"
                style={{
                  animationDelay: `${400 + (liveQuestions.length + i) * 60}ms`,
                }}
              >
                <div
                  className="metric-card text-left w-full group relative overflow-hidden"
                  style={
                    { "--accent-color": q.color } as React.CSSProperties
                  }
                >
                  {/* Subtle accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-40"
                    style={{ backgroundColor: q.color }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <h2 className="font-editorial text-[17px] text-[var(--color-ink)] leading-snug pr-6">
                      {q.question}
                    </h2>
                    {status && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 flex-shrink-0 uppercase tracking-wider">
                        {status.badgeLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center"
                      style={{
                        backgroundColor: q.color,
                        opacity: 0.12,
                      }}
                    >
                      <Database
                        className="w-5 h-5"
                        style={{ color: q.color }}
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[var(--color-ink-light)]">
                        Data collection in progress
                      </p>
                      <p className="text-[12px] text-[var(--color-ink-muted)]">
                        {neededText}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-parchment)]">
                    <p className="text-[11px] text-[var(--color-ink-muted)] leading-relaxed">
                      Click to see what data is needed and how to contribute.
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
