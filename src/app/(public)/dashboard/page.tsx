"use client";

import Link from "next/link";
import HeadlineCard from "@/components/cards/HeadlineCard";
import InsightBanner from "@/components/cards/InsightBanner";
import { QUESTION_DATA_STATUS } from "@/data/source-status";
import type { QuestionId } from "@/types/dashboard";

const headlines = [
  {
    id: "migration",
    question: "Is Portland gaining or losing people?",
    headline: { value: "+127", label: "net households this month" },
    trend: { direction: "up" as const, value: "+12%", isPositive: true },
    sparklineData: [
      { value: -45 }, { value: -32 }, { value: -18 }, { value: -5 },
      { value: 12 }, { value: 28 }, { value: 35 }, { value: 54 },
      { value: 72 }, { value: 89 }, { value: 108 }, { value: 127 },
    ],
    source: "Portland Water Bureau",
    lastUpdated: "Mar 1, 2026",
    color: "#4a7f9e",
  },
  {
    id: "business",
    question: "Is Portland gaining or losing businesses?",
    headline: { value: "+83", label: "net business formations this month" },
    trend: { direction: "up" as const, value: "+8%", isPositive: true },
    sparklineData: [
      { value: -12 }, { value: -5 }, { value: 8 }, { value: 15 },
      { value: 22 }, { value: 31 }, { value: 38 }, { value: 45 },
      { value: 52 }, { value: 64 }, { value: 71 }, { value: 83 },
    ],
    source: "Portland Revenue Division",
    lastUpdated: "Mar 1, 2026",
    color: "#3d7a5a",
  },
  {
    id: "downtown",
    question: "Is downtown coming back?",
    headline: {
      value: "86%",
      label: "of 2019 foot traffic",
      subValue: "73%",
      subLabel: "ground floors occupied",
    },
    trend: { direction: "up" as const, value: "+5.5%", isPositive: true },
    sparklineData: [
      { value: 62 }, { value: 65 }, { value: 68 }, { value: 71 },
      { value: 73 }, { value: 74 }, { value: 76 }, { value: 79 },
      { value: 80 }, { value: 82 }, { value: 84 }, { value: 86 },
    ],
    source: "Placer.ai via Clean & Safe",
    lastUpdated: "Mar 7, 2026",
    color: "#c8956c",
  },
  {
    id: "safety",
    question: "Is Portland safe?",
    headline: {
      value: "4.2",
      label: "property crime per 1,000 residents",
      subValue: "8.4 min",
      subLabel: "avg 911 response (Priority 1)",
    },
    trend: { direction: "down" as const, value: "-8%", isPositive: true },
    sparklineData: [
      { value: 6.1 }, { value: 5.8 }, { value: 5.5 }, { value: 5.4 },
      { value: 5.2 }, { value: 5.0 }, { value: 4.9 }, { value: 4.7 },
      { value: 4.6 }, { value: 4.5 }, { value: 4.3 }, { value: 4.2 },
    ],
    source: "Portland Police Bureau",
    lastUpdated: "Feb 28, 2026",
    color: "#b85c3a",
  },
  {
    id: "tax",
    question: "Is the tax burden competitive?",
    headline: {
      value: "12.4%",
      label: "effective rate at $200K income",
      subValue: "vs 7.1%",
      subLabel: "Vancouver, WA",
    },
    trend: { direction: "flat" as const, value: "flat", isPositive: false },
    sparklineData: [
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
    ],
    source: "Portland Commons analysis",
    lastUpdated: "Jan 2026",
    color: "#7c6f9e",
  },
  {
    id: "housing",
    question: "Is housing getting built?",
    headline: {
      value: "824",
      label: "units in pipeline",
      subValue: "14.2 mo",
      subLabel: "avg permit time",
    },
    trend: { direction: "up" as const, value: "+168 units", isPositive: true },
    sparklineData: [
      { value: 420 }, { value: 445 }, { value: 480 }, { value: 510 },
      { value: 548 }, { value: 590 }, { value: 620 }, { value: 656 },
      { value: 700 }, { value: 745 }, { value: 790 }, { value: 824 },
    ],
    source: "PP&D permit data",
    lastUpdated: "Mar 10, 2026",
    color: "#b85c6a",
  },
  {
    id: "program",
    question: "Is the Portland Commons working?",
    headline: {
      value: "347",
      label: "certified businesses",
      subValue: "89%",
      subLabel: "1-year survival (vs 80% national avg)",
    },
    trend: { direction: "up" as const, value: "+23 this mo", isPositive: true },
    sparklineData: [
      { value: 180 }, { value: 200 }, { value: 218 }, { value: 235 },
      { value: 248 }, { value: 262 }, { value: 278 }, { value: 295 },
      { value: 310 }, { value: 324 }, { value: 336 }, { value: 347 },
    ],
    source: "Portland Commons Registry",
    lastUpdated: "real-time",
    color: "#1a3a2a",
  },
];

const insights = [
  {
    id: "1",
    text: "Saturday foot traffic is now 94% of 2019 — the highest recovery of any day of the week.",
    question: "downtown",
    severity: "high" as const,
  },
  {
    id: "2",
    text: "After 18 months of decline, net household migration turned positive for the third consecutive month.",
    question: "migration",
    severity: "high" as const,
  },
  {
    id: "3",
    text: "Vehicle theft dropped 22% year-over-year — the largest improvement of any crime category.",
    question: "safety",
    severity: "medium" as const,
  },
  {
    id: "4",
    text: "The Central Eastside saw 22% more foot traffic this month — the largest increase of any corridor.",
    question: "downtown",
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

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-18">
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
              Seven questions that drive Portland&apos;s story, answered with
              real data. Click any card to explore the full analysis.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* ── Insights ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 -mt-6 relative z-20">
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <InsightBanner insights={insights} />
        </div>
      </section>

      {/* ── Seven Questions Grid ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 mt-10 pb-16">
        <div className="section-divider">
          <h2>The Seven Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {headlines.map((h, i) => {
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
        </div>
      </section>
    </div>
  );
}
