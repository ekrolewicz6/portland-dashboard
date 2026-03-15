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
} from "lucide-react";

interface HousingDetailData {
  permitsByType: { name: string; value: number; color: string }[];
  permitsByNeighborhood: { name: string; value: number }[];
  pipelineTrend: { month: string; units: number }[];
  rentTrend: { month: string; rent: number }[] | null;
  processingTimeTrend: { month: string; avgDays: number }[];
  processingByType: Record<string, string | number>[];
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/housing/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    processingTimeTrend,
    processingByType,
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

      {/* 2. Housing Pipeline by Type (REAL) */}
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

      {/* 7. Valuation by Year (REAL) */}
      {valuationByYear.length > 0 && (
        <section>
          <SectionHeader icon={DollarSign} title="Construction Valuation by Year (Real Data)" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <BarChart
              data={valuationByYear.map((r) => ({
                ...r,
                value: Math.round(r.value / 1_000_000),
              }))}
              color="#c8956c"
              height={300}
              valuePrefix="$"
              valueSuffix="M"
            />
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
