"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import { Trees, Route, BookOpen } from "lucide-react";

const COLOR = "#6a7f8a";

interface QualityDetailData {
  parkStats: {
    totalParks: number;
    totalAcres: number;
    avgAcres: number;
    largestPark: { name: string; acres: number } | null;
  };
  pavementSummary: {
    avgPci: number;
    good: number;
    fair: number;
    poor: number;
    totalSegments: number;
  };
  pavementByYear: { year: number; avgPci: number; count: number }[];
  libraryTrend: { year: number; visits: number }[];
  dataStatus: string;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function QualityDetail() {
  const [data, setData] = useState<QualityDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/quality/detail")
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
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-64" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-[var(--color-ink-muted)] text-[14px]">
        Unable to load quality of life detail data.
      </p>
    );
  }

  const { parkStats, pavementSummary, libraryTrend } = data;

  // Latest library visits for stat grid
  const latestLib = libraryTrend.length > 0 ? libraryTrend[libraryTrend.length - 1] : null;

  // PCI label
  const pciLabel =
    pavementSummary.avgPci >= 70
      ? "Good"
      : pavementSummary.avgPci >= 40
        ? "Fair"
        : "Poor";

  // Library trend chart data
  const libChartData = libraryTrend.map((r) => ({
    date: String(r.year),
    value: r.visits,
  }));

  // Pavement condition percentages
  const total = pavementSummary.totalSegments || 1;
  const goodPct = Math.round((pavementSummary.good / total) * 100);
  const fairPct = Math.round((pavementSummary.fair / total) * 100);
  const poorPct = Math.round((pavementSummary.poor / total) * 100);

  return (
    <div className="space-y-10">
      {/* 1. Key Metrics */}
      <section>
        <SectionHeader icon={Trees} title="Key Metrics" />
        <StatGrid
          accentColor={COLOR}
          stats={[
            {
              label: "Total Parks",
              value: parkStats.totalParks.toLocaleString(),
            },
            {
              label: "Total Acreage",
              value: parkStats.totalAcres.toLocaleString(),
            },
            {
              label: "Avg Street PCI",
              value: `${pavementSummary.avgPci} (${pciLabel})`,
            },
            {
              label: latestLib ? `Library Visits (FY${latestLib.year})` : "Library Visits",
              value: latestLib ? latestLib.visits.toLocaleString() : "N/A",
            },
          ]}
        />
      </section>

      {/* 2. Pavement Condition Breakdown */}
      <section>
        <SectionHeader icon={Route} title="Pavement Condition Breakdown" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            {pavementSummary.totalSegments.toLocaleString()} street segments rated by Pavement Condition Index (PCI).
            {parkStats.largestPark && (
              <> Largest park: {parkStats.largestPark.name} ({Math.round(parkStats.largestPark.acres).toLocaleString()} acres).</>
            )}
          </p>

          {/* Horizontal stacked bar */}
          <div className="flex h-10 rounded-sm overflow-hidden mb-4">
            {goodPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${goodPct}%`, backgroundColor: "#3d7a5a" }}
              >
                {goodPct}%
              </div>
            )}
            {fairPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${fairPct}%`, backgroundColor: "#c8956c" }}
              >
                {fairPct}%
              </div>
            )}
            {poorPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${poorPct}%`, backgroundColor: "#b85c3a" }}
              >
                {poorPct}%
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-[12px] text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3d7a5a" }} />
              Good (&gt;70): {pavementSummary.good.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#c8956c" }} />
              Fair (40-70): {pavementSummary.fair.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#b85c3a" }} />
              Poor (&lt;40): {pavementSummary.poor.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Library Visits Trend */}
      {libChartData.length > 0 && (
        <section>
          <SectionHeader icon={BookOpen} title="Library Visits by Fiscal Year" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Total visits across all Multnomah County Library branches by fiscal year.
            </p>
            <TrendChart data={libChartData} color={COLOR} height={280} />
          </div>
        </section>
      )}

      {/* 4. Data not yet available: 311 */}
      <DataNeeded
        title="311 service request trends"
        description="311 service requests reveal what residents are reporting — potholes, graffiti, abandoned vehicles. Partially available in the database via PBOT service requests."
        actions={[
          { label: "Access 311 / PBOT service request data via API", type: "api_key" },
        ]}
        color={COLOR}
      />
    </div>
  );
}
