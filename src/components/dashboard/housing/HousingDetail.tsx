"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import {
  Building2,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Home,
  AlertTriangle,
} from "lucide-react";

interface BottleneckEntry {
  activity_type: string;
  avg_days_to_complete: number;
  median_days_to_complete: number;
  pct_is_last_review: number;
  total_permits_reviewed: number;
  avg_correction_rounds: number;
}

interface BottleneckData {
  ranking: BottleneckEntry[];
  total_permits_analyzed: number;
  correction_stats: {
    avg_rounds: number;
    pct_with_corrections: number;
  };
  dataStatus: string;
}

interface HousingDetailData {
  permitsByType: { name: string; value: number; color: string }[];
  permitsByNeighborhood: { name: string; value: number }[];
  pipelineTrend: { month: string; units: number }[];
  rentTrend: { month: string; rent: number }[] | null;
  homeValueTrend: { month: string; value: number }[] | null;
  processingTimeTrend: { month: string; avgDays: number }[];
  processingByType: Record<string, string | number>[];
  clearanceData: Record<string, string | number>[];
  cohortData: Record<string, string | number>[];
  valuationByYear: { name: string; value: number }[];
  heroStats: {
    unitsInPipeline: number;
    avgPermitDays: number;
    totalValuation: number;
    ninetyDayCompliance: number;
  };
  ninetyDayBreakdown: { met: number; missed: number };
  topInsights: string[];
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: color ?? "#b85c6a" }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function HousingDetail() {
  const [data, setData] = useState<HousingDetailData | null>(null);
  const [bottleneckData, setBottleneckData] = useState<BottleneckData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/housing/detail").then((r) => r.json()),
      fetch("/api/dashboard/housing/bottleneck").then((r) => r.json()).catch(() => null),
    ]).then(([d, b]) => {
      setData(d);
      if (b && b.dataStatus !== "unavailable") setBottleneckData(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-parchment)]/50 rounded-sm h-64"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-[var(--color-ink-muted)] text-[14px]">
        Unable to load housing detail data.
      </p>
    );
  }

  const {
    heroStats,
    permitsByType,
    permitsByNeighborhood,
    pipelineTrend,
    rentTrend,
    homeValueTrend,
    processingTimeTrend,
    processingByType,
    clearanceData,
    cohortData,
    valuationByYear,
    ninetyDayBreakdown,
    topInsights,
  } = data;

  const pipelineChartData = pipelineTrend.map((r) => ({
    date: r.month,
    value: r.units,
  }));

  const processingChartData = processingTimeTrend.map((r) => ({
    month: r.month,
    avgDays: r.avgDays,
  }));

  const neighborhoodBarData = permitsByNeighborhood.map((r) => ({
    name: r.name,
    value: r.value,
  }));

  const totalNinetyDay = ninetyDayBreakdown.met + ninetyDayBreakdown.missed;
  const metPct = totalNinetyDay > 0 ? Math.round((ninetyDayBreakdown.met / totalNinetyDay) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* 0. Key Insights (always first) */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ul className="space-y-3">
            {topInsights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-rose-hip)]" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 1. Hero Stat Grid */}
      <section>
        <SectionHeader icon={Building2} title="Key Metrics" />
        <StatGrid
          accentColor="#b85c6a"
          stats={[
            {
              label: "Units in Pipeline",
              value: heroStats.unitsInPipeline,
            },
            {
              label: "Avg Permit Time",
              value: heroStats.avgPermitDays,
              suffix: " days",
            },
            {
              label: "Total Valuation",
              value: `$${(heroStats.totalValuation / 1_000_000).toFixed(0)}M`,
            },
            {
              label: "90-Day Compliance",
              value: `${heroStats.ninetyDayCompliance}%`,
            },
          ]}
        />
      </section>

      {/* 1b. Permit Review Bottlenecks — WHERE the process is broken */}
      {bottleneckData && bottleneckData.ranking.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Permit Review Bottlenecks (Portland Maps Activity Data)" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-2">
              Average days from permit setup to completion for each review type. The longest bars show where permits get stuck. Based on {bottleneckData.total_permits_analyzed} permits with detailed activity data scraped from Portland Maps.
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)]/60 mb-5 font-mono">
              {bottleneckData.correction_stats.pct_with_corrections}% of permits required corrections (avg {bottleneckData.correction_stats.avg_rounds.toFixed(1)} rounds).
              The &ldquo;Last %&rdquo; column shows how often each review is the final one to complete — the true bottleneck.
            </p>

            {/* Horizontal bar chart */}
            <div className="space-y-2.5">
              {bottleneckData.ranking
                .filter((r) => r.avg_days_to_complete > 0)
                .slice(0, 12)
                .map((entry, i) => {
                  const maxDays = bottleneckData.ranking[0]?.avg_days_to_complete || 1;
                  const pct = Math.round(
                    (entry.avg_days_to_complete / maxDays) * 100
                  );
                  const isWorst = i === 0;
                  const barColor = isWorst
                    ? "#b85c3a"
                    : entry.avg_days_to_complete > 60
                      ? "#c8956c"
                      : "#3d7a5a";

                  return (
                    <div key={entry.activity_type} className="flex items-center gap-3">
                      <span
                        className={`text-[12px] w-[160px] text-right flex-shrink-0 truncate ${
                          isWorst
                            ? "font-semibold text-[#b85c3a]"
                            : "text-[var(--color-ink-light)]"
                        }`}
                      >
                        {entry.activity_type}
                      </span>
                      <div className="flex-1 h-7 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
                        <div
                          className="h-full rounded-sm transition-all duration-700"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                        {isWorst && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#b85c3a]">
                            SLOWEST
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] font-mono font-semibold w-[55px] text-right">
                        {entry.avg_days_to_complete.toFixed(0)}d
                      </span>
                      <span className="text-[11px] font-mono text-[var(--color-ink-muted)] w-[50px] text-right">
                        {entry.pct_is_last_review > 0
                          ? `${entry.pct_is_last_review.toFixed(0)}%`
                          : ""}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-[var(--color-parchment)] flex flex-wrap gap-x-6 gap-y-1">
              <span className="text-[11px] text-[var(--color-ink-muted)]">
                Bar = avg days from setup to completion
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">
                Right column = % of permits where this review finished last
              </span>
            </div>

            {/* Correction stats summary */}
            <div className="mt-4 pt-4 border-t border-[var(--color-parchment)] grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[24px] font-mono font-bold text-[var(--color-ink)] leading-none">
                  {bottleneckData.correction_stats.avg_rounds.toFixed(1)}
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  avg correction rounds
                </p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-mono font-bold text-[var(--color-ink)] leading-none">
                  {bottleneckData.correction_stats.pct_with_corrections}%
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  permits need corrections
                </p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-mono font-bold text-[var(--color-ink)] leading-none">
                  {bottleneckData.total_permits_analyzed}
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  permits analyzed
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. COHORT VIEW: Median days to clear by permit type and application month */}
      {cohortData && cohortData.length > 0 && (
        <section>
          <SectionHeader icon={Clock} title="How Long Does Each Permit Type Take? (Cohort View)" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-2">
              For every permit <strong>applied for</strong> in each month, this shows the median number of days it took to get cleared. This is the honest view — no survivorship bias.
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)]/60 mb-4 font-mono">
              Grouped by application date, not clearance date. If you applied in May 2023, how long did you wait?
            </p>
            <MultiLineChart
              data={cohortData.map((r) => ({
                month: r.month,
                Residential: (r as Record<string, unknown>).Residential as number ?? 0,
                Commercial: (r as Record<string, unknown>).Commercial as number ?? 0,
                Facility: (r as Record<string, unknown>).Facility as number ?? 0,
                Electrical: (r as Record<string, unknown>).Electrical as number ?? 0,
                Plumbing: (r as Record<string, unknown>).Plumbing as number ?? 0,
              }))}
              xKey="month"
              height={400}
              valueSuffix=" days"
              lines={[
                { key: "Commercial", label: "Commercial", color: "#c8956c" },
                { key: "Residential", label: "Residential", color: "#3d7a5a" },
                { key: "Facility", label: "Facility", color: "#4a7f9e" },
                { key: "Electrical", label: "Electrical", color: "#64748b" },
                { key: "Plumbing", label: "Plumbing", color: "#7c6f9e" },
              ]}
              referenceLines={[
                { y: 90, label: "90-day target", color: "#b85c3a" },
              ]}
            />

            {/* Clearance rate by type for same cohort */}
            <div className="mt-6 pt-6 border-t border-[var(--color-parchment)]">
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4 font-semibold">
                Clearance Rate: What % of permits filed each month have been fully cleared?
              </p>
              <div className="space-y-2">
                {(() => {
                  // Get the latest month's data
                  const latest = cohortData[cohortData.length - 1] as Record<string, unknown> | undefined;
                  if (!latest) return null;
                  const types = ["Residential", "Commercial", "Facility", "Electrical", "Plumbing"];
                  return types.map((t) => {
                    const clearance = (latest[`${t}_clearance`] as number) ?? 0;
                    const applied = (latest[`${t}_applied`] as number) ?? 0;
                    const days = (latest[t] as number) ?? 0;
                    if (applied === 0) return null;
                    return (
                      <div key={t} className="flex items-center gap-3">
                        <span className="text-[12px] text-[var(--color-ink-light)] w-[100px] text-right">{t}</span>
                        <div className="flex-1 h-6 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-700"
                            style={{
                              width: `${clearance}%`,
                              backgroundColor: clearance >= 90 ? "#3d7a5a" : clearance >= 70 ? "#c8956c" : "#b85c3a",
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-mono font-semibold w-[50px] text-right">{clearance}%</span>
                        <span className="text-[11px] text-[var(--color-ink-muted)] w-[80px]">{days}d median</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2b. Housing Pipeline by Type (REAL) */}
      {pipelineTrend.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Housing Pipeline by Type (Real Permit Data)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly building permits issued, broken down by Residential, Commercial, and Facility. Excludes trade permits. Source: Portland BDS PermitsNow.
            </p>
            <MultiLineChart
              data={pipelineTrend.map((r) => ({
                month: r.month,
                Residential: (r as Record<string, unknown>).residential as number ?? 0,
                Commercial: (r as Record<string, unknown>).commercial as number ?? 0,
                Total: r.units,
              }))}
              xKey="month"
              height={360}
              lines={[
                { key: "Total", label: "Total Building Permits", color: "#1a3a2a" },
                { key: "Residential", label: "Residential", color: "#3d7a5a" },
                { key: "Commercial", label: "Commercial / Facility", color: "#c8956c" },
              ]}
            />
          </div>
        </section>
      )}

      {/* 3. Permit Processing Time Trend (REAL) */}
      {processingChartData.length > 0 && (
        <section>
          <SectionHeader icon={Clock} title="Permit Processing Time (Real Data)" color="#4a7f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Median days from application to issuance. The dashed line marks the 90-day target.
            </p>
            <MultiLineChart
              data={processingChartData}
              xKey="month"
              height={320}
              valueSuffix=" days"
              lines={[
                { key: "avgDays", label: "Median Processing Days", color: "#4a7f9e" },
              ]}
              referenceLines={[
                { y: 90, label: "90-day target", color: "#b85c3a" },
              ]}
            />
          </div>
        </section>
      )}

      {/* 3b. Processing Time BY PERMIT TYPE (REAL) */}
      {processingByType && processingByType.length > 0 && (
        <section>
          <SectionHeader icon={Clock} title="Processing Time by Permit Type (Real Data)" color="#7c6f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-2">
              Median processing days by permit type per quarter. The steep rise in late 2023+ reflects survivor bias — easy permits were cleared first during the 2023 backlog processing, leaving only complex/slow permits in later quarters.
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)]/60 mb-4 font-mono">
              Note: Data ends Q4 2024 due to low permit volume in 2025-2026 (insufficient sample size for reliable medians).
            </p>
            <MultiLineChart
              data={processingByType}
              xKey="quarter"
              height={320}
              valueSuffix=" days"
              lines={[
                { key: "Residential", label: "Residential", color: "#3d7a5a" },
                { key: "Commercial", label: "Commercial", color: "#c8956c" },
                { key: "Facility", label: "Facility", color: "#4a7f9e" },
              ]}
              referenceLines={[
                { y: 90, label: "90-day target", color: "#b85c3a" },
              ]}
            />
          </div>
        </section>
      )}

      {/* 3c. Clearance Rate by Type — shows pipeline health */}
      {clearanceData && clearanceData.length > 0 && (
        <section>
          <SectionHeader icon={CheckCircle2} title="Permit Clearance Rate by Type (Real Data)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Percentage of permits issued in each quarter that have been finalized. A declining clearance rate means more permits are sitting in the pipeline unresolved. This eliminates survivorship bias — it measures throughput, not just the speed of completed permits.
            </p>
            <MultiLineChart
              data={clearanceData.map((r) => ({
                quarter: r.quarter,
                Residential: (r as Record<string, unknown>).Residential_clearance as number ?? 0,
                Commercial: (r as Record<string, unknown>).Commercial_clearance as number ?? 0,
                Facility: (r as Record<string, unknown>).Facility_clearance as number ?? 0,
              }))}
              xKey="quarter"
              height={320}
              valueSuffix="%"
              lines={[
                { key: "Residential", label: "Residential Clearance %", color: "#3d7a5a" },
                { key: "Commercial", label: "Commercial Clearance %", color: "#c8956c" },
                { key: "Facility", label: "Facility Clearance %", color: "#4a7f9e" },
              ]}
            />
          </div>
        </section>
      )}

      {/* 4. Permits by Type (REAL) */}
      {permitsByType.length > 0 && (
        <section>
          <SectionHeader icon={Home} title="Permits by Type (Real Data)" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <PieChart data={permitsByType} height={380} />
          </div>
        </section>
      )}

      {/* 5. Top Neighborhoods (REAL) — custom HTML bars for reliability */}
      {neighborhoodBarData.length > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Top 10 Neighborhoods (Real Data)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-3">
              {neighborhoodBarData.map((n, i) => {
                const maxVal = neighborhoodBarData[0]?.value || 1;
                const pct = Math.round((n.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[13px] text-[var(--color-ink-light)] w-[180px] text-right flex-shrink-0 truncate">
                      {n.name}
                    </span>
                    <div className="flex-1 h-7 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#3d7a5a",
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[60px] text-right">
                      {n.value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5d. Home Values — Zillow ZHVI */}
      {homeValueTrend && homeValueTrend.length > 0 && (
        <section>
          <SectionHeader icon={DollarSign} title="Portland Home Values (Zillow ZHVI)" color="#1a3a2a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-2">
              Zillow Home Value Index: typical home value for the 35th-65th percentile range in the Portland metro. Based on the neural Zestimate model.
            </p>
            <p className="text-[12px] text-[var(--color-ink-muted)]/60 mb-4 font-mono">
              Current: ${homeValueTrend[homeValueTrend.length - 1].value.toLocaleString()} ({homeValueTrend[homeValueTrend.length - 1].month}) &middot;
              Zillow forecasts -1.4% over the next 12 months
            </p>
            <TrendChart
              data={homeValueTrend.map((r) => ({ date: r.month, value: r.value }))}
              color="#1a3a2a"
              height={320}
              valuePrefix="$"
            />
          </div>
        </section>
      )}

      {/* 6. Rent Trend — DATA NEEDED */}
      {rentTrend === null ? (
        <section>
          <SectionHeader icon={DollarSign} title="Median Rent Trend" color="#b85c6a" />
          <DataNeeded
            title="Median Rent Data Needed"
            description="Zillow publishes the Observed Rent Index (ZORI) as a free CSV download. This would show median rent trends for the Portland metro area over time."
            color="#b85c6a"
            actions={[
              {
                label: "Download Zillow ZORI CSV (free)",
                href: "https://www.zillow.com/research/data/",
                type: "download",
              },
            ]}
          />
        </section>
      ) : (
        <section>
          <SectionHeader icon={DollarSign} title="Median Rent (ZORI)" color="#b85c6a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <TrendChart
              data={rentTrend.map((r) => ({ date: r.month, value: r.rent }))}
              color="#b85c6a"
              height={300}
              valuePrefix="$"
            />
          </div>
        </section>
      )}

      {/* 7. Valuation by Year (REAL) — bars with permit counts and partial year markers */}
      {valuationByYear.length > 0 && (
        <section>
          <SectionHeader icon={DollarSign} title="Construction Valuation by Year (Real Data)" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-2">
              Total dollar value of building permits issued each year. Our ArcGIS data currently covers 2023-present.
            </p>
            <p className="text-[12px] text-[var(--color-ink-muted)]/60 mb-5 font-mono">
              To see 10+ years, run: npm run scrape:permits -- 4900000 5000000 (fetches older permits from Portland Maps API)
            </p>
            <div className="space-y-3">
              {valuationByYear.map((v: { name: string; value: number; permits?: number; partial?: boolean }, i: number) => {
                const maxVal = Math.max(...valuationByYear.map((x: { value: number }) => x.value));
                const valM = Math.round(v.value / 1_000_000);
                const pct = maxVal > 0 ? Math.round((v.value / maxVal) * 100) : 0;
                const isPartial = v.partial;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-[15px] font-mono font-semibold w-[55px] text-right ${isPartial ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"}`}>
                      {v.name}
                    </span>
                    <div className="flex-1 h-9 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isPartial ? "#a8c5b2" : "#c8956c",
                        }}
                      />
                    </div>
                    <div className="text-right w-[130px] flex-shrink-0">
                      <span className={`text-[15px] font-mono font-bold ${isPartial ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"}`}>
                        ${valM}M
                      </span>
                      <span className="text-[12px] font-mono text-[var(--color-ink-muted)] ml-2">
                        {(v.permits || 0).toLocaleString()} permits
                      </span>
                    </div>
                    {isPartial && (
                      <span className="text-[10px] font-mono text-[var(--color-ink-muted)] bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm flex-shrink-0">
                        partial
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. 90-Day Guarantee Tracker (REAL) */}
      {totalNinetyDay > 0 && (
        <section>
          <SectionHeader icon={CheckCircle2} title="90-Day Guarantee Tracker (Real Data)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-[12px] font-mono text-[var(--color-ink-muted)] mb-2">
                  <span>Met target ({ninetyDayBreakdown.met.toLocaleString()})</span>
                  <span>Missed ({ninetyDayBreakdown.missed.toLocaleString()})</span>
                </div>
                <div className="w-full h-10 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${metPct}%`,
                      backgroundColor: "#3d7a5a",
                    }}
                  />
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${100 - metPct}%`,
                      backgroundColor: "#b85c3a",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-mono text-green-700 font-semibold">
                    {metPct}% within 90 days
                  </span>
                  <span className="text-[11px] font-mono text-red-700 font-semibold">
                    {100 - metPct}% over 90 days
                  </span>
                </div>
              </div>
              <div className="text-center sm:text-right sm:min-w-[140px]">
                <p className="text-[48px] font-mono font-bold text-[var(--color-ink)] leading-none">
                  {metPct}%
                </p>
                <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">
                  compliance rate
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
