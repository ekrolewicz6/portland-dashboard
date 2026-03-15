"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import MultiLineChart from "@/components/charts/MultiLineChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import BarChart from "@/components/charts/BarChart";
import {
  Building2,
  TrendingUp,
  MapPin,
  BarChart3,
  Lightbulb,
  Layers,
} from "lucide-react";

interface QuarterlyPoint {
  quarter: string;
  total: number;
  llcs: number;
  corps: number;
  nonprofits: number;
  assumedNames: number;
}

interface EntityEntry {
  name: string;
  value: number;
}

interface ZipEntry {
  zip: string;
  count: number;
}

interface YearlyEntry {
  year: number;
  count: number;
}

interface HeroStats {
  totalActive: number;
  newThisQuarter: number;
  topEntityType: string;
  topEntityPct: number;
  yoyGrowthMultiple: number;
  firstYear: number;
  lastYear: number;
}

interface BusinessDetailData {
  quarterlyTrend: QuarterlyPoint[];
  entityBreakdown: EntityEntry[];
  topZipCodes: ZipEntry[];
  yearlyTotals: YearlyEntry[];
  heroStats: HeroStats;
  dataStatus: string;
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: color ?? "#3d7a5a" }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function BusinessDetail() {
  const [data, setData] = useState<BusinessDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/business/detail")
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
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-parchment)]/50 rounded-sm h-64"
          />
        ))}
      </div>
    );
  }

  if (!data || data.dataStatus === "error") {
    return (
      <p className="text-[var(--color-ink-muted)] text-[14px]">
        Unable to load business detail data.
      </p>
    );
  }

  const { heroStats, quarterlyTrend, entityBreakdown, topZipCodes, yearlyTotals } = data;

  // Build insights from real data
  const insights: string[] = [];
  insights.push(
    `${heroStats.totalActive.toLocaleString()} active businesses registered in Portland.`
  );
  if (heroStats.firstYear > 0 && heroStats.lastYear > 0) {
    insights.push(
      `New business registrations grew ${heroStats.yoyGrowthMultiple}x from 2016 (${heroStats.firstYear.toLocaleString()}) to 2025 (${heroStats.lastYear.toLocaleString()}).`
    );
  }
  if (heroStats.topEntityPct > 0) {
    insights.push(
      `${heroStats.topEntityType}s account for ${heroStats.topEntityPct}% of all registrations.`
    );
  }
  if (quarterlyTrend.length > 8) {
    // Find the pandemic boom quarter
    const q2021 = quarterlyTrend.filter((q) => q.quarter.startsWith("2021"));
    const peak2021 = q2021.reduce(
      (max, q) => (q.total > max ? q.total : max),
      0
    );
    if (peak2021 > 0) {
      insights.push(
        `The 2021 pandemic LLC boom peaked at ${peak2021.toLocaleString()} registrations in a single quarter.`
      );
    }
  }

  // Prepare quarterly chart data for MultiLineChart
  const quarterlyChartData = quarterlyTrend.map((q) => {
    // Format quarter label: "2016-01-01" -> "Q1 '16"
    const d = new Date(q.quarter + "T00:00:00");
    const qNum = Math.floor(d.getMonth() / 3) + 1;
    const yr = d.getFullYear().toString().slice(2);
    return {
      quarter: `Q${qNum} '${yr}`,
      Total: q.total,
      LLCs: q.llcs,
      Corporations: q.corps,
      Nonprofits: q.nonprofits,
    };
  });

  // Yearly bar chart data
  const yearlyBarData = yearlyTotals.map((y) => ({
    name: y.year.toString(),
    value: y.count,
  }));

  // YoY growth percentage for hero stat
  const sortedYears = [...yearlyTotals].sort((a, b) => a.year - b.year);
  const prevYear = sortedYears.find((y) => y.year === 2024);
  const currYear = sortedYears.find((y) => y.year === 2025);
  const yoyPct =
    prevYear && currYear && prevYear.count > 0
      ? Math.round(((currYear.count - prevYear.count) / prevYear.count) * 100)
      : 0;

  return (
    <div className="space-y-10">
      {/* 0. Key Insights */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#3d7a5a]" />
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
          accentColor="#3d7a5a"
          stats={[
            {
              label: "Total Active Businesses",
              value: heroStats.totalActive,
            },
            {
              label: "New This Quarter",
              value: heroStats.newThisQuarter,
            },
            {
              label: `${heroStats.topEntityType} Share`,
              value: `${heroStats.topEntityPct}%`,
            },
            {
              label: "YoY Growth (2024-2025)",
              value: yoyPct > 0 ? `+${yoyPct}%` : `${yoyPct}%`,
            },
          ]}
        />
      </section>

      {/* 2. Quarterly Registration Trend (10 years) */}
      {quarterlyChartData.length > 0 && (
        <section>
          <SectionHeader
            icon={TrendingUp}
            title="Currently Active Businesses by Quarter Founded (2016-2026)"
            color="#1a3a2a"
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Businesses that are STILL ACTIVE today, grouped by the quarter they were founded. Older years show fewer businesses because many have since closed — this is survivorship bias, not a registration trend. The steep rise toward recent years reflects the fact that newer businesses haven&apos;t had time to close yet. The 2021 pandemic LLC boom
              and 2024-2025 acceleration are clearly visible. LLCs consistently
              dominate new filings.
            </p>
            <MultiLineChart
              data={quarterlyChartData}
              xKey="quarter"
              height={400}
              lines={[
                { key: "Total", label: "Total", color: "#1a3a2a" },
                { key: "LLCs", label: "LLCs", color: "#3d7a5a" },
                { key: "Corporations", label: "Corporations", color: "#c8956c" },
                { key: "Nonprofits", label: "Nonprofits", color: "#b85c6a" },
              ]}
            />
          </div>
        </section>
      )}

      {/* 3. Entity Type Breakdown — horizontal HTML bars */}
      {entityBreakdown.length > 0 && (
        <section>
          <SectionHeader
            icon={Layers}
            title="Entity Type Breakdown"
            color="#c8956c"
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Distribution of all {heroStats.totalActive.toLocaleString()} active
              businesses by entity type.
            </p>
            <div className="space-y-3">
              {entityBreakdown.slice(0, 8).map((entry, i) => {
                const maxVal = entityBreakdown[0]?.value || 1;
                const pct = Math.round((entry.value / maxVal) * 100);
                const sharePct =
                  heroStats.totalActive > 0
                    ? Math.round(
                        (entry.value / heroStats.totalActive) * 1000
                      ) / 10
                    : 0;
                const barColor =
                  i === 0
                    ? "#3d7a5a"
                    : i === 1
                      ? "#4a7f9e"
                      : i === 2
                        ? "#c8956c"
                        : i === 3
                          ? "#b85c6a"
                          : "#78716c";
                return (
                  <div key={entry.name} className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--color-ink-light)] w-[180px] text-right flex-shrink-0 truncate">
                      {entry.name}
                    </span>
                    <div className="flex-1 h-7 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-mono font-semibold w-[70px] text-right">
                      {entry.value.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-ink-muted)] w-[45px] text-right">
                      {sharePct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Top ZIP Codes — horizontal HTML bars */}
      {topZipCodes.length > 0 && (
        <section>
          <SectionHeader
            icon={MapPin}
            title="Top ZIP Codes by Business Count"
            color="#4a7f9e"
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Portland ZIP codes with the highest concentration of active
              businesses.
            </p>
            <div className="space-y-3">
              {topZipCodes.map((entry, i) => {
                const maxVal = topZipCodes[0]?.count || 1;
                const pct = Math.round((entry.count / maxVal) * 100);
                return (
                  <div key={entry.zip} className="flex items-center gap-3">
                    <span className="text-[13px] font-mono text-[var(--color-ink-light)] w-[60px] text-right flex-shrink-0">
                      {entry.zip}
                    </span>
                    <div className="flex-1 h-7 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          backgroundColor:
                            i === 0
                              ? "#4a7f9e"
                              : i < 3
                                ? "#6a9bb5"
                                : "#8cb5c8",
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[70px] text-right">
                      {entry.count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Survival Rate — pending PRR data */}
      <section>
        <SectionHeader
          icon={BarChart3}
          title="Business Survival Rate"
          color="#b85c3a"
        />
        <DataNeeded
          title="Total Business Filings Data Needed for Survival Analysis"
          description="To calculate what percentage of Portland businesses survive each year, we need the TOTAL number of businesses filed (including dissolved/cancelled ones). The Oregon SOS 'Active Businesses' dataset only shows currently active businesses — creating survivorship bias in the charts above. A public records request has been filed with Oregon SOS to obtain total historical filing counts."
          color="#b85c3a"
          actions={[
            {
              label: "PRR filed with Oregon Secretary of State (pending)",
              type: "prr",
            },
            {
              label: "Search Oregon SOS directly for dissolved businesses",
              href: "https://sos.oregon.gov/business/pages/find.aspx",
              type: "download",
            },
          ]}
        />
      </section>
    </div>
  );
}
