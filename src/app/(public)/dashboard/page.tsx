"use client";

import Link from "next/link";
import HeadlineCard from "@/components/cards/HeadlineCard";
import InsightBanner from "@/components/cards/InsightBanner";
import { QUESTION_DATA_STATUS } from "@/data/source-status";
import type { QuestionId } from "@/types/dashboard";
import { Database } from "lucide-react";

/**
 * Headlines for questions with REAL data.
 * Questions without real data get a different card style below.
 */
const realHeadlines = [
  {
    id: "safety",
    question: "Is Portland safe?",
    headline: {
      value: "5,494",
      label: "crime incidents in current ArcGIS snapshot",
      subValue: "22K",
      subLabel: "graffiti reports from BPS",
    },
    trend: { direction: "flat" as const, value: "snapshot", isPositive: false },
    sparklineData: [] as { value: number }[],
    source: "Portland Police Bureau ArcGIS",
    lastUpdated: "Live snapshot",
    color: "#b85c3a",
  },
  {
    id: "tax",
    question: "Is the tax burden competitive?",
    headline: {
      value: "12.8%",
      label: "Portland effective rate at highest bracket",
      subValue: "vs 8.4%",
      subLabel: "Vancouver, WA",
    },
    trend: { direction: "flat" as const, value: "stable", isPositive: false },
    sparklineData: [] as { value: number }[],
    source: "Published tax rates",
    lastUpdated: "FY 2025-26",
    color: "#7c6f9e",
  },
  {
    id: "housing",
    question: "Is housing getting built?",
    headline: {
      value: "34,307",
      label: "real building permits tracked",
      subValue: "91%",
      subLabel: "processed within 90 days",
    },
    trend: { direction: "flat" as const, value: "real data", isPositive: true },
    sparklineData: [] as { value: number }[],
    source: "BDS PermitsNow (ArcGIS)",
    lastUpdated: "Live data",
    color: "#b85c6a",
  },
  {
    id: "downtown",
    question: "Is downtown coming back?",
    headline: {
      value: "22K",
      label: "graffiti reports (disorder proxy)",
    },
    trend: { direction: "flat" as const, value: "partial", isPositive: false },
    sparklineData: [] as { value: number }[],
    source: "Portland BPS (real)",
    lastUpdated: "Live data",
    color: "#c8956c",
  },
];

/** Questions with NO real data — shown as "data collection in progress" cards */
const unavailableQuestions = [
  {
    id: "migration",
    question: "Is Portland gaining or losing people?",
    color: "#4a7f9e",
    needed: "Water Bureau PRR + Census API key",
  },
  {
    id: "business",
    question: "Is Portland gaining or losing businesses?",
    color: "#3d7a5a",
    needed: "Revenue Division PRR (CivicApps offline)",
  },
  {
    id: "program",
    question: "Is the Portland Commons working?",
    color: "#1a3a2a",
    needed: "PCB registry not yet live",
  },
];

/** Real insights computed from actual data we have */
const insights = [
  {
    id: "1",
    text: "34,307 building permits tracked across Portland — 91% processed within 90 days.",
    question: "housing",
    severity: "high" as const,
  },
  {
    id: "2",
    text: "22,000 graffiti reports mapped citywide from Portland BPS — a visible disorder metric.",
    question: "downtown",
    severity: "medium" as const,
  },
  {
    id: "3",
    text: "Property crime grid data shows 5,494 incidents in current ArcGIS snapshot across 3 categories.",
    question: "safety",
    severity: "medium" as const,
  },
  {
    id: "4",
    text: "120 Portland neighborhoods tracked with real boundary data from Portland Boundaries.",
    question: "housing",
    severity: "medium" as const,
  },
];

export default function DashboardPage() {
  return (
    <div>
      {/* ── Hero ── */}
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

      {/* ── Insights (REAL) ── */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 -mt-6 relative z-20">
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <InsightBanner insights={insights} />
        </div>
      </section>

      {/* ── Seven Questions Grid ── */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 mt-10 pb-16">
        <div className="section-divider">
          <h2>The Seven Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Cards with REAL data */}
          {realHeadlines.map((h, i) => {
            const status = QUESTION_DATA_STATUS[h.id as QuestionId];
            return (
              <Link
                key={h.id}
                href={`/dashboard/${h.id}`}
                className="block animate-fade-up"
                style={{ animationDelay: `${400 + i * 60}ms` }}
              >
                <HeadlineCard
                  question={h.question}
                  headline={h.headline}
                  trend={h.trend}
                  sparklineData={h.sparklineData}
                  source={h.source}
                  lastUpdated={h.lastUpdated}
                  color={h.color}
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

          {/* Cards with NO real data — data collection in progress */}
          {unavailableQuestions.map((q, i) => {
            const status = QUESTION_DATA_STATUS[q.id as QuestionId];
            return (
              <Link
                key={q.id}
                href={`/dashboard/${q.id}`}
                className="block animate-fade-up"
                style={{
                  animationDelay: `${400 + (realHeadlines.length + i) * 60}ms`,
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
                        {q.needed}
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
