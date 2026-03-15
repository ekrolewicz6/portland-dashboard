"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import MultiLineChart from "@/components/charts/MultiLineChart";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import {
  Shield,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

interface SafetyDetailData {
  crimeByCategory: { month: string; property: number; person: number; society: number }[] | null;
  currentYearByCategory: { name: string; value: number; color: string }[] | null;
  yearOverYear: { current: number; prior: number; change: number } | null;
  heroStats: {
    totalCrimesThisYear: number;
    ratePer1000: number;
    yoyChange: number;
    avgResponseP1: number | null;
  };
  graffitiTrend: { month: string; count: number }[] | null;
  responseTimesTrend: null;
  historicalCrimeTrend: null;
  topInsights: string[];
  dataStatus: string;
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
      <Icon className="w-4 h-4" style={{ color: color ?? "#b85c3a" }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function SafetyDetail() {
  const [data, setData] = useState<SafetyDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/safety/detail")
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
    return <p className="text-[var(--color-ink-muted)] text-[14px]">Unable to load safety detail data.</p>;
  }

  const { heroStats, crimeByCategory, graffitiTrend, topInsights } = data;

  const graffitiChartData = graffitiTrend
    ? graffitiTrend.map((r) => ({ date: r.month, value: r.count }))
    : [];

  return (
    <div className="space-y-10">
      {/* 1. Key Insights (always first) */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ul className="space-y-3">
            {topInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-clay)]" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Hero Stat Grid */}
      <section>
        <SectionHeader icon={Shield} title="Key Metrics (Latest Month)" />
        <StatGrid
          stats={[
            { label: "Crimes This Month", value: heroStats.totalCrimesThisYear.toLocaleString() },
            { label: "Rate per 1,000 (Ann.)", value: String(heroStats.ratePer1000) },
            {
              label: "Year-over-Year",
              value: heroStats.yoyChange !== 0 ? `${heroStats.yoyChange > 0 ? "+" : ""}${heroStats.yoyChange}%` : "N/A",
            },
            {
              label: "Avg P1 Response",
              value: heroStats.avgResponseP1 !== null ? `${heroStats.avgResponseP1} min` : "N/A",
            },
          ]}
        />
      </section>

      {/* 3. Historical Crime Trend — DATA NEEDED */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Crime by Category Over Time" color="#c8956c" />
        <DataNeeded
          title="Historical Monthly Crime Trend Data Needed"
          description="We have a current-month snapshot from the ArcGIS Crime MapServer (see breakdown below), but historical monthly trends require the PPB CSV downloads from Tableau Public. The data is available but locked behind a Tableau dashboard that requires manual download or a headless browser scraper."
          color="#c8956c"
          actions={[
            {
              label: "Download PPB crime CSVs from Tableau Public",
              href: "https://public.tableau.com/app/profile/portlandpolicebureau/viz/MonthlyReportedCrimeStatistics/MonthlyStatistics",
              type: "download",
            },
            {
              label: "Contact PPB Open Data for bulk CSV access",
              href: "mailto:ppbopendata@police.portlandoregon.gov",
              type: "prr",
            },
          ]}
        />
      </section>

      {/* 4. Latest Month Breakdown — simple HTML bars */}
      {data.currentYearByCategory && data.currentYearByCategory.length > 0 && (
        <section>
          <SectionHeader icon={Shield} title="Latest Month Breakdown" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-3">
              {data.currentYearByCategory.map((cat, i) => {
                const maxVal = data.currentYearByCategory![0]?.value || 1;
                const pct = Math.round((cat.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[13px] text-[var(--color-ink-light)] w-[100px] text-right flex-shrink-0">
                      {cat.name}
                    </span>
                    <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[70px] text-right">
                      {cat.value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. 911 Response Times — DATA NEEDED */}
      <section>
        <SectionHeader icon={Shield} title="911 Response Times" color="#4a7f9e" />
        <DataNeeded
          title="911 Response Time Data Needed"
          description="Response time data from the Bureau of Emergency Communications (BOEC) is not publicly available through an API. A public records request is required."
          color="#4a7f9e"
          actions={[
            { label: "File public records request to BOEC", type: "prr" },
          ]}
        />
      </section>

      {/* 6. Graffiti/Disorder Trend — REAL */}
      {graffitiTrend && graffitiTrend.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Graffiti / Visible Disorder (Real Data)" color="#7c6f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly graffiti reports from Portland BPS as a proxy for visible street-level disorder.
            </p>
            <TrendChart data={graffitiChartData} color="#7c6f9e" height={260} />
          </div>
        </section>
      )}
    </div>
  );
}
