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
  Car,
  MapPin,
} from "lucide-react";

interface SafetyDetailData {
  crimeByCategory: {
    month: string;
    property: number;
    person: number;
    society: number;
    total: number;
  }[];
  topOffenseCategories: { name: string; count: number }[];
  yearOverYear: { current: number; prior: number; change: number } | null;
  heroStats: {
    latestMonthTotal: number;
    latestMonthLabel: string;
    ratePer1000: number;
    yoyChange: number;
    totalCurrentYear: number;
  };
  topNeighborhoods: { name: string; count: number }[];
  mvtTrend: { month: string; count: number }[];
  graffitiTrend: { month: string; count: number }[] | null;
  topInsights: string[];
  dataStatus: string;
  totalRecords: number;
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

/** Format month label: show year for Jan, otherwise abbreviated month */
function formatMonthLabel(m: string): string {
  const [year, month] = m.split("-");
  const monthNum = parseInt(month, 10);
  if (monthNum === 1) return `'${year.slice(2)}`;
  return "";
}

function HorizontalBars({
  items,
  color,
}: {
  items: { name: string; count: number }[];
  color: string;
}) {
  const maxVal = items.length > 0 ? items[0].count : 1;
  return (
    <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.round((item.count / maxVal) * 100);
          return (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[13px] text-[var(--color-ink-light)] w-[140px] text-right flex-shrink-0 truncate">
                {item.name}
              </span>
              <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 + (0.3 * (1 - i / items.length)) }}
                />
              </div>
              <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[70px] text-right">
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
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

  const {
    heroStats,
    crimeByCategory,
    topOffenseCategories,
    topNeighborhoods,
    mvtTrend,
    graffitiTrend,
    topInsights,
    totalRecords,
  } = data;

  // Prepare 10-year trend chart data — sample to every 3rd month for readability
  const trendChartData = crimeByCategory.map((r) => ({
    month: formatMonthLabel(r.month) || "",
    property: r.property,
    person: r.person,
    society: r.society,
  }));

  // MVT chart data
  const mvtChartData = mvtTrend.map((r) => ({
    date: formatMonthLabel(r.month) || "",
    value: r.count,
  }));

  // Graffiti chart data
  const graffitiChartData = graffitiTrend
    ? graffitiTrend.map((r) => ({ date: r.month, value: r.count }))
    : [];

  return (
    <div className="space-y-10">
      {/* 1. Key Insights */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] font-mono font-semibold text-[#3d7a5a] bg-[#3d7a5a]/10 px-2 py-0.5 rounded-sm">
              LIVE
            </span>
            <span className="text-[12px] text-[var(--color-ink-muted)]">
              {totalRecords.toLocaleString()} Portland Police Bureau records (2016-2026)
            </span>
          </div>
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

      {/* 2. Hero Stats */}
      <section>
        <SectionHeader icon={Shield} title="Key Metrics" />
        <StatGrid
          stats={[
            {
              label: `Crimes (${heroStats.latestMonthLabel})`,
              value: heroStats.latestMonthTotal.toLocaleString(),
            },
            {
              label: "Rate per 1,000 (Ann.)",
              value: String(heroStats.ratePer1000),
            },
            {
              label: "Year-over-Year",
              value: heroStats.yoyChange !== 0
                ? `${heroStats.yoyChange > 0 ? "+" : ""}${heroStats.yoyChange}%`
                : "N/A",
            },
            {
              label: `Total ${new Date().getFullYear()} YTD`,
              value: heroStats.totalCurrentYear.toLocaleString(),
            },
          ]}
        />
      </section>

      {/* 3. 10-Year Crime Trend — MultiLineChart */}
      {crimeByCategory.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="10-Year Crime Trend by Category" color="#c8956c" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly reported crimes from {crimeByCategory[0].month} to{" "}
              {crimeByCategory[crimeByCategory.length - 1].month} — {totalRecords.toLocaleString()} total offenses.
            </p>
            <MultiLineChart
              data={trendChartData}
              lines={[
                { key: "property", label: "Property", color: "#c8956c" },
                { key: "person", label: "Person", color: "#b85c3a" },
                { key: "society", label: "Society", color: "#7c6f9e" },
              ]}
              xKey="month"
              height={360}
            />
          </div>
        </section>
      )}

      {/* 4. Top Offense Categories — HTML bars */}
      {topOffenseCategories.length > 0 && (
        <section>
          <SectionHeader icon={Shield} title={`Top Offense Categories (${new Date().getFullYear()})`} color="#b85c3a" />
          <HorizontalBars items={topOffenseCategories} color="#b85c3a" />
        </section>
      )}

      {/* 5. Motor Vehicle Theft Spotlight */}
      {mvtTrend.length > 0 && (
        <section>
          <SectionHeader icon={Car} title="Motor Vehicle Theft Spotlight" color="#d97706" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Portland&apos;s car theft crisis peaked in 2022 and has been declining — but remains well above pre-pandemic levels.
            </p>
            <TrendChart data={mvtChartData} color="#d97706" height={280} />
          </div>
        </section>
      )}

      {/* 6. Top Neighborhoods — HTML bars */}
      {topNeighborhoods.length > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Top Neighborhoods (Last 12 Months)" color="#4a7f9e" />
          <HorizontalBars items={topNeighborhoods} color="#4a7f9e" />
        </section>
      )}

      {/* 7. Graffiti / Visible Disorder — single stat (not enough data for a chart) */}
      {graffitiTrend && graffitiTrend.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Graffiti / Visible Disorder (BPS Data)" color="#7c6f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[36px] font-mono font-bold text-[var(--color-ink)]">
                  {graffitiTrend.reduce((s, r) => s + r.count, 0).toLocaleString()}
                </p>
                <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
                  graffiti reports tracked from Portland BPS
                </p>
              </div>
              <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed flex-1">
                Graffiti reports serve as a proxy for visible street-level disorder. This is a cumulative count from the BPS Graffiti FeatureServer — monthly trend data requires more frequent data pulls.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 8. 911 Response Times — Data Needed */}
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
    </div>
  );
}
