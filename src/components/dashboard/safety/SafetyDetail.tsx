"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import BarChart from "@/components/charts/BarChart";
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
        Unable to load safety detail data.
      </p>
    );
  }

  const { heroStats, currentYearByCategory, graffitiTrend, topInsights } = data;

  const graffitiChartData = graffitiTrend
    ? graffitiTrend.map((r) => ({ date: r.month, value: r.count }))
    : [];

  return (
    <div className="space-y-10">
      {/* 1. Hero Stat Grid — from real data */}
      <section>
        <SectionHeader icon={Shield} title="Key Metrics (Current Snapshot)" />
        <StatGrid
          accentColor="#b85c3a"
          stats={[
            {
              label: "Total Crimes (Snapshot)",
              value: heroStats.totalCrimesThisYear,
            },
            {
              label: "Rate per 1,000",
              value: heroStats.ratePer1000,
              suffix: "",
            },
            {
              label: "Year-over-Year",
              value: "N/A",
            },
            {
              label: "Avg P1 Response",
              value: heroStats.avgResponseP1 !== null ? heroStats.avgResponseP1 : "N/A",
              suffix: heroStats.avgResponseP1 !== null ? " min" : "",
            },
          ]}
        />
      </section>

      {/* 2. Crime by Category - Current (REAL from ArcGIS) */}
      {currentYearByCategory && currentYearByCategory.length > 0 && (
        <section>
          <SectionHeader icon={Shield} title="Crime by Category (ArcGIS Snapshot)" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <BarChart data={currentYearByCategory} height={260} />
          </div>
        </section>
      )}

      {/* 3. Historical Crime Trend — DATA NEEDED */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Historical Crime Trend" />
        <DataNeeded
          title="Historical Monthly Crime Data Needed"
          description="We have a current snapshot from the ArcGIS Crime MapServer grid, but no historical monthly trends. The Portland Police Bureau publishes downloadable CSV data that would enable 10-year trend analysis."
          color="#b85c3a"
          actions={[
            {
              label: "Download PPB crime CSVs from Portland Open Data",
              href: "https://www.portland.gov/police/open-data/reported-crime-data",
              type: "download",
            },
            {
              label: "Contact PPB Open Data team",
              href: "mailto:ppbopendata@police.portlandoregon.gov",
              type: "prr",
            },
          ]}
        />
      </section>

      {/* 4. 911 Response Times — DATA NEEDED */}
      <section>
        <SectionHeader icon={Shield} title="911 Response Times" color="#4a7f9e" />
        <DataNeeded
          title="911 Response Time Data Needed"
          description="Response time data from the Bureau of Emergency Communications (BOEC) is not publicly available through an API. A public records request is required to obtain monthly Priority 1 response medians."
          color="#4a7f9e"
          actions={[
            {
              label: "File public records request to BOEC for response time data",
              type: "prr",
            },
          ]}
        />
      </section>

      {/* 5. Graffiti/Disorder Trend — REAL from Portland BPS */}
      {graffitiTrend && graffitiTrend.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Graffiti / Disorder Trend (Real Data)" color="#7c6f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly graffiti reports from Portland BPS serve as a proxy for visible street-level disorder.
            </p>
            <TrendChart data={graffitiChartData} color="#7c6f9e" height={260} />
          </div>
        </section>
      )}

      {/* 6. Key Insights */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ul className="space-y-3">
            {topInsights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-clay)]" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
