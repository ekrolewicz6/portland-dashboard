"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import TrendChart from "@/components/charts/TrendChart";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
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
  Activity,
  TrendingDown,
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
  trend: Record<string, string | number>[];
  total_permits_analyzed: number;
  date_range?: { earliest: string; latest: string };
  correction_stats: {
    avg_rounds: number;
    pct_with_corrections: number;
  };
  dataStatus: string;
}

interface HousingMarketData {
  homeValueTrendMulti: { month: string; typical: number; sfr: number; condo: number }[];
  valueByType: { metric: string; value: number }[];
  valueByBedroom: { metric: string; value: number }[];
  valueByTier: { metric: string; value: number }[];
  rentTrendMulti: { month: string; all: number; sfr: number; mfr: number }[];
  rentVsBuy: { month: string; rent: number; mortgage: number }[];
  marketHealth: { metric: string; value: number }[];
  forecast: number | null;
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
  housingCreation?: { quarter: string; adus: number; multifamily: number; singleFamily: number; commercialMulti: number; total: number }[];
  demolitionTrend?: { quarter: string; total: number; residential: number; commercial: number }[];
  completions?: { quarter: string; total: number; single_family: number; adus: number; multifamily: number }[];
  backlogTrend?: { quarter: string; residential: number; commercial: number; facility: number }[];
  throughput?: { quarter: string; applied: number; issued: number; completed: number }[];
  housingMarket?: HousingMarketData;
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

interface JourneyData {
  phases: { phase: string; median_day: number; median_step_duration: number; permits_affected: number }[];
  byType: { label: string; permits: number; phases: { phase: string; median_day: number }[]; total_days: number }[];
  trend: Record<string, string | number>[];
  correctionStats: { pctWithCorrections: number; avgRounds: number; totalPermits: number };
  dataStatus: string;
}

export default function HousingDetail() {
  const [data, setData] = useState<HousingDetailData | null>(null);
  const [bottleneckData, setBottleneckData] = useState<BottleneckData | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/housing/detail").then((r) => r.json()),
      fetch("/api/dashboard/housing/bottleneck").then((r) => r.json()).catch(() => null),
      fetch("/api/dashboard/housing/journey").then((r) => r.json()).catch(() => null),
    ]).then(([d, b, j]) => {
      setData(d);
      if (b && b.dataStatus !== "unavailable") setBottleneckData(b);
      if (j && j.dataStatus !== "unavailable") setJourneyData(j);
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
    housingMarket,
  } = data;
  const housingCreation = data.housingCreation;

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

  // Helper for journey by-type cards
  function yearsAndMonths(days: number) {
    if (days >= 365) return `${(days / 365).toFixed(1)} years`;
    if (days >= 60) return `${Math.round(days / 30)} months`;
    return `${days} days`;
  }

  return (
    <div className="space-y-10">
      {/* ═══════════════════════════════════════════════════
          SECTION 1: THE BIG PICTURE — Is Portland Building Enough?
          ═══════════════════════════════════════════════════ */}

      {/* Key Metrics */}
      <section>
        <SectionHeader icon={Activity} title="Key Metrics" />
        <StatGrid
          stats={[
            { label: "Units in Pipeline", value: heroStats.unitsInPipeline.toLocaleString() },
            { label: "Median Permit Time", value: `${heroStats.avgPermitDays} days` },
            { label: "Construction Valuation", value: `$${(heroStats.totalValuation / 1_000_000_000).toFixed(2)}B` },
            { label: "90-Day Compliance", value: `${heroStats.ninetyDayCompliance}%` },
          ]}
        />
      </section>

      {/* Backlog: THE lead chart */}
      {data.backlogTrend && data.backlogTrend.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Permit Backlog: Is It Growing or Shrinking?" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Open building permits (issued but not yet finaled) at the start of each quarter. Rising lines = backlog is growing.
            </p>
            <MultiLineChart
              data={data.backlogTrend.filter((r) => r.residential + r.commercial + r.facility > 0)}
              xKey="quarter"
              height={340}
              lines={[
                { key: "residential", label: "Residential", color: "#3d7a5a" },
                { key: "commercial", label: "Commercial", color: "#c8956c" },
                { key: "facility", label: "Facility", color: "#4a7f9e" },
              ]}
            />
          </div>
        </section>
      )}

      {/* Throughput: Applications vs Issuances vs Completions */}
      {data.throughput && data.throughput.length > 0 && (
        <section>
          <SectionHeader icon={Activity} title="Permit Throughput: Applications vs Issuances vs Completions" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              How many building permits are applied for, issued, and completed each quarter. The gap between lines shows where the pipeline backs up.
            </p>
            <MultiLineChart
              data={data.throughput}
              xKey="quarter"
              height={340}
              lines={[
                { key: "applied", label: "Applications Filed", color: "#b85c3a" },
                { key: "issued", label: "Permits Issued", color: "#c8956c" },
                { key: "completed", label: "Completed (Finaled)", color: "#3d7a5a" },
              ]}
            />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 2: THE PERMIT PROCESS — What's Broken?
          ═══════════════════════════════════════════════════ */}

      {/* Journey: Where Does Time Go? */}
      {journeyData && journeyData.phases.length > 0 && (() => {
        const reviewPhases = journeyData.phases.filter(p =>
          ["Application", "Planning and Zoning", "Structural", "Life Safety", "Fire Review", "Environmental Services"].includes(p.phase)
        );
        const inspectionPhases = journeyData.phases.filter(p =>
          ["Building Inspections", "Electrical Inspections", "Plumbing Inspections", "Mechanical Inspections"].includes(p.phase)
        );
        const issuancePhase = journeyData.phases.find(p => p.phase === "Issuance");
        const finalPhase = journeyData.phases.find(p => p.phase === "Final Permit");
        const maxStepDuration = Math.max(...journeyData.phases.map(p => p.median_step_duration), 1);
        const totalReviewDays = issuancePhase?.median_day ?? 0;
        const totalConstructionDays = (finalPhase?.median_day ?? 0) - totalReviewDays;

        return (
        <section>
          <SectionHeader icon={Clock} title="The Permit Journey: Where Does the Time Go?" color="#4a7f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[var(--color-canopy)]/[0.04] border border-[var(--color-canopy)]/10 rounded-sm p-4 text-center">
                <p className="text-[32px] font-mono font-bold text-[var(--color-canopy)]">{totalReviewDays}d</p>
                <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">Review & Approval</p>
              </div>
              <div className="bg-[var(--color-ember)]/[0.04] border border-[var(--color-ember)]/10 rounded-sm p-4 text-center">
                <p className="text-[32px] font-mono font-bold text-[var(--color-clay)]">{totalConstructionDays}d</p>
                <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">Construction & Inspections</p>
              </div>
              <div className="bg-[#b85c3a]/[0.06] border border-[#b85c3a]/15 rounded-sm p-4 text-center">
                <p className="text-[32px] font-mono font-bold text-[#b85c3a]">{journeyData.correctionStats.avgRounds}x</p>
                <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">Avg Correction Rounds</p>
                <p className="text-[10px] text-[var(--color-ink-muted)]/60">{journeyData.correctionStats.pctWithCorrections}% of permits</p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-3">How long each step takes on its own (median days).</p>
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-[var(--color-canopy)] uppercase tracking-wider mb-1.5">Phase 1: Review & Approval</p>
              <div className="space-y-1">
                {[...reviewPhases, ...(issuancePhase ? [{ ...issuancePhase, phase: "Permit Issued" }] : [])].map((phase) => {
                  const pct = Math.round((phase.median_step_duration / maxStepDuration) * 100);
                  const color = phase.phase === "Permit Issued" ? "#3d7a5a" : "#4a7f9e";
                  return (
                    <div key={phase.phase} className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--color-ink-light)] w-[150px] text-right flex-shrink-0 truncate">{phase.phase}</span>
                      <div className="flex-1 h-5 bg-[var(--color-parchment)]/30 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[11px] font-mono font-semibold w-[35px] text-right" style={{ color }}>{phase.median_step_duration}d</span>
                      <span className="text-[10px] text-[var(--color-ink-muted)] w-[40px] text-right">
                        {phase.permits_affected >= 1000 ? `${(phase.permits_affected / 1000).toFixed(0)}K` : phase.permits_affected}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-parchment)]">
              <p className="text-[10px] font-semibold text-[var(--color-clay)] uppercase tracking-wider mb-1.5">Phase 2: Construction & Inspections</p>
              <div className="space-y-1">
                {[...inspectionPhases, ...(finalPhase ? [{ ...finalPhase, phase: "Final Sign-Off" }] : [])].map((phase) => {
                  const pct = Math.round((phase.median_step_duration / maxStepDuration) * 100);
                  const color = phase.phase === "Final Sign-Off" ? "#b85c3a" : "#c8956c";
                  return (
                    <div key={phase.phase} className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--color-ink-light)] w-[150px] text-right flex-shrink-0 truncate">{phase.phase}</span>
                      <div className="flex-1 h-5 bg-[var(--color-parchment)]/30 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[11px] font-mono font-semibold w-[35px] text-right" style={{ color }}>{phase.median_step_duration}d</span>
                      <span className="text-[10px] text-[var(--color-ink-muted)] w-[40px] text-right">
                        {phase.permits_affected >= 1000 ? `${(phase.permits_affected / 1000).toFixed(0)}K` : phase.permits_affected}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        );
      })()}

      {/* How Long by Permit Type — cards grouped by category */}
      {journeyData && journeyData.byType.length > 0 && (() => {
        const sorted = [...journeyData.byType].sort((a, b) => b.total_days - a.total_days);
        const maxDays = sorted[0]?.total_days || 1;
        const newConstruction = sorted.filter(t => t.label.includes("(New)") || t.label.includes("New Construction"));
        const remodels = sorted.filter(t => t.label.includes("Remodel") || t.label.includes("Alteration") || t.label.includes("Addition") || t.label.includes("Interior"));
        const other = sorted.filter(t => !newConstruction.includes(t) && !remodels.includes(t));

        function renderGroup(title: string, items: typeof sorted, accent: string) {
          if (items.length === 0) return null;
          return (
            <div className="mb-5 last:mb-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>{title}</p>
              <div className="space-y-2">
                {items.map((type) => (
                  <div key={type.label} className="bg-[var(--color-paper)] rounded-sm p-3 border border-[var(--color-parchment)]/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-semibold text-[var(--color-ink)]">{type.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-mono font-bold text-[var(--color-ink)]">{yearsAndMonths(type.total_days)}</span>
                        <span className="text-[10px] text-[var(--color-ink-muted)]">{type.permits >= 1000 ? `${(type.permits / 1000).toFixed(1)}K` : type.permits} permits</span>
                      </div>
                    </div>
                    <div className="h-3 bg-[var(--color-parchment)]/30 rounded-full overflow-hidden flex mb-1.5">
                      {type.phases.map((p, j) => {
                        const prevDay = j > 0 ? type.phases[j - 1].median_day : 0;
                        const segWidth = ((p.median_day - prevDay) / maxDays) * 100;
                        const colors = ["#4a7f9e", "#3d7a5a", "#c8956c", "#b85c3a"];
                        return <div key={p.phase} className="h-full" style={{ width: `${Math.max(segWidth, 0.5)}%`, backgroundColor: colors[j % colors.length] }} />;
                      })}
                    </div>
                    <div className="flex gap-4 text-[10px] text-[var(--color-ink-muted)]">
                      {type.phases.map((p, j) => {
                        const prevDay = j > 0 ? type.phases[j - 1].median_day : 0;
                        const duration = p.median_day - prevDay;
                        const colors = ["#4a7f9e", "#3d7a5a", "#c8956c", "#b85c3a"];
                        const labels = ["Reviews", "Issued", "Construction", "Final"];
                        return (
                          <span key={p.phase} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[j % colors.length] }} />
                            {labels[j] ?? p.phase}: <span className="font-mono font-semibold" style={{ color: colors[j % colors.length] }}>{duration}d</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
        <section>
          <SectionHeader icon={Building2} title="How Long Does Each Permit Type Take?" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
              Total time from application to final sign-off, broken down by phase.
            </p>
            {renderGroup("New Construction", newConstruction, "#b85c3a")}
            {renderGroup("Remodels & Additions", remodels, "#c8956c")}
            {renderGroup("Other", other, "#4a7f9e")}
          </div>
        </section>
        );
      })()}

      {/* Is the Process Getting Faster or Slower? */}
      {journeyData && journeyData.trend.length > 1 && (() => {
        const durationTrend = journeyData.trend.map((t) => {
          const issued = Number(t["Permit Issued"]) || 0;
          const final_val = Number(t["Final Permit"]) || 0;
          return {
            period: t.period as string,
            "Time to Approve": issued,
            "Construction Time": final_val > 0 && issued > 0 ? final_val - issued : 0,
            "Total Process": final_val,
          };
        }).filter((t) => t["Total Process"] > 0);

        // Permits take ~200 days median. Quarters less than 9 months old have incomplete data.
        // Mark last 3 quarters as "incomplete" — their numbers are artificially low.
        const incompleteCount = 3;
        const reliableData = durationTrend.slice(0, -incompleteCount);
        const incompleteData = durationTrend.slice(-incompleteCount);

        // Use last reliable quarter for the improvement callout, not the most recent
        const peak = reliableData.reduce((max, t) => t["Total Process"] > max["Total Process"] ? t : max, reliableData[0]);
        const lastReliable = reliableData[reliableData.length - 1];
        const pctImproved = peak && lastReliable ? Math.round((1 - lastReliable["Total Process"] / peak["Total Process"]) * 100) : 0;

        // Build chart data: reliable lines + faded incomplete lines
        const chartData = [
          ...reliableData,
          ...incompleteData.map((d) => ({
            ...d,
            "Total Process (incomplete)": d["Total Process"],
            "Time to Approve (incomplete)": d["Time to Approve"],
            "Total Process": reliableData.length > 0 ? null : d["Total Process"],
            "Time to Approve": reliableData.length > 0 ? null : d["Time to Approve"],
            "Construction Time": null,
          })),
        ];

        // Bridge: duplicate last reliable point into incomplete series for continuity
        if (reliableData.length > 0 && incompleteData.length > 0) {
          const bridge = reliableData[reliableData.length - 1];
          const bridgeIdx = reliableData.length - 1;
          chartData[bridgeIdx] = {
            ...chartData[bridgeIdx],
            "Total Process (incomplete)": bridge["Total Process"],
            "Time to Approve (incomplete)": bridge["Time to Approve"],
          };
        }

        return (
        <section>
          <SectionHeader icon={TrendingUp} title="Is the Permitting Process Getting Faster or Slower?" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            {pctImproved > 10 && peak && lastReliable && (
              <div className="bg-[#3d7a5a]/[0.06] border border-[#3d7a5a]/15 rounded-sm p-3 mb-4">
                <p className="text-[13px] text-[var(--color-ink)]">
                  <span className="font-semibold text-[#3d7a5a]">Improving.</span>{" "}
                  Total time down <span className="font-mono font-semibold">{pctImproved}%</span> from peak of{" "}
                  <span className="font-mono">{peak["Total Process"]}d</span> ({peak.period}) to{" "}
                  <span className="font-mono">{lastReliable["Total Process"]}d</span> ({lastReliable.period}).
                </p>
              </div>
            )}
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              For permits set up each quarter: how long to get approved vs. how long from approval to final sign-off.
              <span className="text-[var(--color-clay)]"> Faded lines = recent quarters where many permits are still in progress (data incomplete).</span>
            </p>
            <MultiLineChart
              data={chartData}
              xKey="period"
              height={340}
              lines={[
                { key: "Time to Approve", label: "Review & Approval", color: "#4a7f9e" },
                { key: "Construction Time", label: "Construction to Final", color: "#c8956c" },
                { key: "Total Process", label: "Total", color: "#b85c3a" },
                { key: "Time to Approve (incomplete)", label: "Review (incomplete)", color: "#4a7f9e", dashed: true },
                { key: "Total Process (incomplete)", label: "Total (incomplete)", color: "#b85c3a", dashed: true },
              ]}
            />
          </div>
        </section>
        );
      })()}

      {/* ═══════════════════════════════════════════════════
          SECTION 3: WHAT'S BEING BUILT — Types and Trends
          ═══════════════════════════════════════════════════ */}

      {/* Housing Creation by Type */}
      {housingCreation && housingCreation.length > 0 && (
        <section>
          <SectionHeader icon={Home} title="Housing Permits Issued by Type" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Building permits issued per quarter by type. Source: Portland BDS via ArcGIS.
            </p>
            <MultiLineChart
              data={housingCreation.filter((r) => r.total > 0).map((r) => ({
                quarter: r.quarter,
                "Single Family": r.singleFamily,
                "Apartments/Townhouses": r.multifamily,
                "Commercial/Mixed-Use": r.commercialMulti,
                "ADUs": r.adus,
              }))}
              xKey="quarter"
              height={340}
              lines={[
                { key: "Single Family", label: "Single Family", color: "#3d7a5a" },
                { key: "Apartments/Townhouses", label: "Apartments & Townhouses", color: "#4a7f9e" },
                { key: "Commercial/Mixed-Use", label: "Commercial / Mixed-Use", color: "#c8956c" },
                { key: "ADUs", label: "ADUs", color: "#7c6f9e" },
              ]}
            />
          </div>
        </section>
      )}

      {/* Completions by Type */}
      {data.completions && data.completions.length > 0 && (
        <section>
          <SectionHeader icon={CheckCircle2} title="Housing Completions (Finaled Permits)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Permits that reached &ldquo;finaled&rdquo; status — construction completed and inspected. Source: Portland BDS.
            </p>
            <ComparisonBarChart
              data={data.completions.map((r) => ({
                quarter: r.quarter,
                "Single Family": r.single_family,
                "ADUs": r.adus,
                "Multifamily": r.multifamily,
              }))}
              xKey="quarter"
              bars={[
                { key: "Single Family", label: "Single Family", color: "#3d7a5a", stackId: "comp" },
                { key: "ADUs", label: "ADUs", color: "#7c6f9e", stackId: "comp" },
                { key: "Multifamily", label: "Multifamily", color: "#4a7f9e", stackId: "comp" },
              ]}
              height={320}
            />
          </div>
        </section>
      )}

      {/* Construction Valuation by Year */}
      {valuationByYear.length > 0 && (
        <section>
          <SectionHeader icon={DollarSign} title="Construction Valuation by Year" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Total dollar value of building permits issued each year.
            </p>
            <div className="space-y-3">
              {valuationByYear.map((yr) => {
                const maxVal = Math.max(...valuationByYear.map((v) => v.value));
                const pct = Math.round((yr.value / maxVal) * 100);
                const valM = Math.round(yr.value / 1_000_000);
                return (
                  <div key={yr.name} className="flex items-center gap-4">
                    <span className="text-[14px] font-mono font-bold text-[var(--color-ink)] w-[50px]">{yr.name}</span>
                    <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: (yr as any).partial ? "#a8c5b2" : "#c8956c" }} />
                    </div>
                    <span className="text-[13px] font-mono font-semibold w-[70px] text-right">${valM}M</span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] w-[70px] text-right">
                      {(yr as any).permits?.toLocaleString()} permits
                      {(yr as any).partial && <span className="ml-1 text-[9px] bg-[var(--color-parchment)] px-1 rounded">partial</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Top Neighborhoods */}
      {permitsByNeighborhood.length > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Top Neighborhoods by Building Permits" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-2">
              {neighborhoodBarData.map((n, i) => {
                const maxVal = neighborhoodBarData[0]?.value || 1;
                const pct = Math.round((n.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--color-ink-light)] w-[160px] text-right flex-shrink-0 truncate">{n.name}</span>
                    <div className="flex-1 h-6 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: "#3d7a5a", opacity: 0.7 + 0.3 * (1 - i / neighborhoodBarData.length) }} />
                    </div>
                    <span className="text-[12px] font-mono font-semibold w-[60px] text-right">{n.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 4: THE HOUSING MARKET — Prices and Rents
          ═══════════════════════════════════════════════════ */}

      {housingMarket && housingMarket.homeValueTrendMulti.length > 0 && (() => {
        const hm = housingMarket;
        const latestTypical = hm.homeValueTrendMulti[hm.homeValueTrendMulti.length - 1]?.typical ?? 0;
        const latestRent = hm.rentTrendMulti[hm.rentTrendMulti.length - 1]?.all ?? 0;
        const tempEntry = hm.marketHealth.find((m) => m.metric === "market_temp");
        const temp = tempEntry?.value ?? 0;
        const tempLabel = temp < 40 ? "cold" : temp < 60 ? "cool" : temp < 80 ? "neutral" : "hot";
        const tempColor = temp < 40 ? "#4a7f9e" : temp < 60 ? "#3d7a5a" : temp < 80 ? "#c8956c" : "#b85c3a";
        const forecastPct = hm.forecast ?? 0;
        const inventoryVal = hm.marketHealth.find((m) => m.metric === "inventory")?.value ?? 0;
        const newListingsVal = hm.marketHealth.find((m) => m.metric === "new_listings")?.value ?? 0;
        const soldAboveVal = hm.marketHealth.find((m) => m.metric === "pct_sold_above")?.value ?? 0;

        return (
          <>
            {/* Market Summary */}
            <section>
              <SectionHeader icon={Home} title="Housing Market Snapshot" color="#1a3a2a" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
                  <p className="text-[24px] font-mono font-bold text-[var(--color-ink)]">${(latestTypical / 1000).toFixed(0)}K</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">Typical Home Value</p>
                </div>
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
                  <p className="text-[24px] font-mono font-bold text-[var(--color-ink)]">${latestRent.toLocaleString()}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">Typical Rent/Month</p>
                </div>
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
                  <p className="text-[24px] font-mono font-bold" style={{ color: tempColor }}>{tempLabel}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">Market Temperature</p>
                </div>
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
                  <p className="text-[24px] font-mono font-bold" style={{ color: forecastPct < 0 ? "#b85c3a" : "#3d7a5a" }}>{forecastPct > 0 ? "+" : ""}{forecastPct}%</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">12-Month Forecast</p>
                </div>
              </div>
            </section>

            {/* Home Values Over Time */}
            <section>
              <SectionHeader icon={TrendingUp} title="Home Values Over Time" color="#1a3a2a" />
              <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
                <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                  Zillow Home Value Index (ZHVI) from 2010 to present. Source: Zillow Research.
                </p>
                <MultiLineChart
                  data={hm.homeValueTrendMulti.map((r) => ({ month: r.month, Typical: r.typical, "Single Family": r.sfr, "Condo/Co-op": r.condo }))}
                  xKey="month"
                  height={360}
                  valuePrefix="$"
                  lines={[
                    { key: "Typical", label: "Typical Home", color: "#1a3a2a" },
                    { key: "Single Family", label: "Single Family", color: "#3d7a5a" },
                    { key: "Condo/Co-op", label: "Condo/Co-op", color: "#c8956c" },
                  ]}
                />
              </div>
            </section>

            {/* Rent vs Buy */}
            {hm.rentVsBuy.length > 0 && (
              <section>
                <SectionHeader icon={DollarSign} title="Rent vs Buy: Monthly Cost" color="#c8956c" />
                <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
                  <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                    Typical monthly rent vs. estimated mortgage payment (80% LTV at 7% rate). Source: Zillow ZORI + ZHVI.
                  </p>
                  <MultiLineChart
                    data={hm.rentVsBuy.map((r) => ({ month: r.month, Rent: r.rent, "Est. Mortgage": r.mortgage }))}
                    xKey="month"
                    height={320}
                    valuePrefix="$"
                    lines={[
                      { key: "Rent", label: "Typical Rent", color: "#c8956c" },
                      { key: "Est. Mortgage", label: "Est. Mortgage", color: "#1a3a2a" },
                    ]}
                  />
                </div>
              </section>
            )}

            {/* Market Health */}
            <section>
              <SectionHeader icon={Activity} title="Market Health Indicators" color="#4a7f9e" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Active Inventory", value: inventoryVal.toLocaleString(), sub: "homes for sale" },
                  { label: "New Listings", value: newListingsVal.toLocaleString(), sub: "per month" },
                  { label: "Sold Above Ask", value: `${soldAboveVal.toFixed(1)}%`, sub: "of recent sales" },
                ].map((s) => (
                  <div key={s.label} className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4">
                    <p className="text-[24px] font-mono font-bold text-[var(--color-ink)]">{s.value}</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]">{s.label}</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]/60">{s.sub}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
      })()}
    </div>
  );
}
