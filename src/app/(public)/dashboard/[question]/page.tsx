import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, BookOpen, MapPin } from "lucide-react";
import { isValidQuestion, questionMeta } from "@/lib/questions";
import type { DashboardResponse } from "@/lib/types";
import TrendChart from "@/components/charts/TrendChart";
import ExportButton from "@/components/dashboard/ExportButton";
import EmbedButton from "@/components/dashboard/EmbedButton";
import SafetyDetail from "@/components/dashboard/safety/SafetyDetail";
import HousingDetail from "@/components/dashboard/housing/HousingDetail";

interface PageProps {
  params: Promise<{ question: string }>;
}

async function fetchQuestionData(
  question: string
): Promise<DashboardResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/dashboard/${question}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data for ${question}`);
  }

  return res.json();
}

export async function generateStaticParams() {
  return [
    { question: "migration" },
    { question: "business" },
    { question: "downtown" },
    { question: "safety" },
    { question: "tax" },
    { question: "housing" },
    { question: "program" },
  ];
}

export async function generateMetadata({ params }: PageProps) {
  const { question } = await params;
  if (!isValidQuestion(question)) return {};
  const meta = questionMeta[question];
  return {
    title: `${meta.title} | Portland Commons Dashboard`,
    description: `Deep-dive data and analysis: ${meta.title}`,
  };
}

/** Questions that have dedicated detail views */
const DETAIL_QUESTIONS = new Set(["safety", "housing"]);

export default async function QuestionPage({ params }: PageProps) {
  const { question } = await params;

  if (!isValidQuestion(question)) {
    notFound();
  }

  const meta = questionMeta[question];
  const hasDetailView = DETAIL_QUESTIONS.has(question);

  let data: DashboardResponse | null = null;

  // For questions without a dedicated detail view, fetch the generic data
  if (!hasDetailView) {
    try {
      data = await fetchQuestionData(question);
    } catch {
      const mockModule = await import("@/lib/mock-data");
      const dataMap: Record<string, DashboardResponse> = {
        migration: mockModule.migrationData,
        business: mockModule.businessData,
        downtown: mockModule.downtownData,
        safety: mockModule.safetyData,
        tax: mockModule.taxData,
        housing: mockModule.housingData,
        program: mockModule.programData,
      };
      data = dataMap[question];
    }
  } else {
    // For detail views we still need basic data for the hero section
    try {
      data = await fetchQuestionData(question);
    } catch {
      const mockModule = await import("@/lib/mock-data");
      const dataMap: Record<string, DashboardResponse> = {
        safety: mockModule.safetyData,
        housing: mockModule.housingData,
      };
      data = dataMap[question] ?? null;
    }
  }

  return (
    <div className="bg-[var(--color-paper)] min-h-screen">
      {/* Hero header */}
      <section
        className="relative overflow-hidden noise-overlay"
        style={{ backgroundColor: meta.color }}
      >
        <div className="absolute inset-0 bg-[var(--color-canopy)]/60" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="font-editorial-normal text-[36px] sm:text-[48px] lg:text-[56px] text-white leading-[1.1] tracking-tight max-w-3xl">
            {meta.title}
          </h1>

          {data && (
            <>
              <p className="mt-4 text-[18px] sm:text-[20px] text-white/70 font-editorial leading-snug max-w-2xl">
                {data.headline}
              </p>

              {/* Trend pill */}
              <div className="mt-6 flex items-center gap-4">
                <span
                  className={`trend-pill ${
                    data.trend.direction === "up"
                      ? "trend-positive"
                      : data.trend.direction === "down"
                        ? "trend-negative"
                        : "trend-neutral"
                  }`}
                >
                  {data.trend.direction === "up"
                    ? "+"
                    : data.trend.direction === "down"
                      ? ""
                      : ""}
                  {data.trend.percentage}% {data.trend.label}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 -mt-4 relative z-20">
        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <ExportButton question={question} />
          <EmbedButton question={question} />
        </div>

        {/* Question-specific detail view or generic layout */}
        {question === "safety" && <SafetyDetail />}
        {question === "housing" && <HousingDetail />}

        {!hasDetailView && data && (
          <>
            {/* 12-Month Trend Chart */}
            <section className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
                  12-Month Trend
                </h2>
                <div className="flex-1 h-px bg-[var(--color-parchment)]" />
              </div>
              <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
                <TrendChart data={data.chartData} color={meta.color} height={320} />
              </div>
            </section>

            {/* Key Findings + Methodology grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Key Findings */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <CheckCircle2 className="w-4 h-4" style={{ color: meta.color }} />
                  <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
                    Key Findings
                  </h2>
                </div>
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
                  <ul className="space-y-4">
                    {data.insights.map((insight, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
                      >
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Methodology */}
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <BookOpen className="w-4 h-4 text-[var(--color-ink-muted)]" />
                  <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
                    Methodology
                  </h2>
                </div>
                <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-6">
                  <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                    Data for this metric is sourced from <strong>{data.source}</strong>.
                    All figures are updated automatically from public records and
                    government APIs. Trend percentages compare the current period to
                    the same period in the prior year unless otherwise noted.
                  </p>
                </div>
              </section>
            </div>

            {/* Geographic Breakdown (placeholder) */}
            <section className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <MapPin className="w-4 h-4 text-[var(--color-ink-muted)]" />
                <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
                  Geographic Breakdown
                </h2>
              </div>
              <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-8 text-center">
                <p className="text-[14px] text-[var(--color-ink-muted)]">
                  Geographic breakdown by neighborhood and ZIP code coming soon.
                </p>
                <p className="text-[12px] text-[var(--color-ink-muted)]/60 mt-2">
                  This section will include an interactive map showing data by
                  Portland neighborhood.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Data Source Citation — always show */}
        <section className="mb-10 mt-10">
          <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-1">
                  Data Source
                </p>
                <p className="text-[14px] text-white/80">
                  {data?.source ??
                    (question === "safety"
                      ? "Portland Police Bureau / BOEC 911"
                      : "BDS PermitsNow / Zillow ZORI")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-1">
                  Last Updated
                </p>
                <p className="text-[14px] text-white/80 font-mono">
                  {data?.lastUpdated ?? new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
