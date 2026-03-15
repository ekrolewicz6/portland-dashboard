"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import StackedAreaChart from "@/components/charts/StackedAreaChart";
import BarChart from "@/components/charts/BarChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import TrendChart from "@/components/charts/TrendChart";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Shield,
  AlertTriangle,
  Phone,
  Lightbulb,
} from "lucide-react";

interface SafetyDetailData {
  crimeByCategory: { month: string; property: number; person: number; society: number }[];
  responseTimesTrend: { month: string; priority1: number; priority2: number; priority3: number }[];
  graffitiTrend: { month: string; count: number }[];
  yearOverYear: { current: number; prior: number; change: number };
  currentYearByCategory: { name: string; value: number; color: string }[];
  heroStats: {
    totalCrimesThisYear: number;
    ratePer1000: number;
    yoyChange: number;
    avgResponseP1: number;
  };
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

  const { heroStats, crimeByCategory, currentYearByCategory, responseTimesTrend, graffitiTrend, yearOverYear, topInsights } = data;

  // Format every 6th month label for the stacked area chart
  const crimeChartData = crimeByCategory.map((row, i) => ({
    ...row,
    month: i % 6 === 0 ? row.month : row.month,
  }));

  const graffitiChartData = graffitiTrend.map((r) => ({
    date: r.month,
    value: r.count,
  }));

  const ChangeIcon =
    yearOverYear.change < 0
      ? ArrowDownRight
      : yearOverYear.change > 0
        ? ArrowUpRight
        : Minus;

  return (
    <div className="space-y-10">
      {/* 1. Hero Stat Grid */}
      <section>
        <SectionHeader icon={Shield} title="Key Metrics" />
        <StatGrid
          accentColor="#b85c3a"
          stats={[
            {
              label: "Crimes This Year",
              value: heroStats.totalCrimesThisYear,
              change: heroStats.yoyChange,
              changeLabel: "vs prior year",
            },
            {
              label: "Rate per 1,000",
              value: heroStats.ratePer1000,
              suffix: "",
            },
            {
              label: "Year-over-Year",
              value: `${heroStats.yoyChange > 0 ? "+" : ""}${heroStats.yoyChange}%`,
            },
            {
              label: "Avg P1 Response",
              value: heroStats.avgResponseP1,
              suffix: " min",
            },
          ]}
        />
      </section>

      {/* 2. 10-Year Crime Trend (Stacked Area) */}
      <section>
        <SectionHeader icon={AlertTriangle} title="10-Year Crime Trend" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Monthly incidents by category. The 2021 spike and subsequent improvement are clearly visible.
          </p>
          <StackedAreaChart
            data={crimeChartData}
            xKey="month"
            height={360}
            areas={[
              { key: "property", label: "Property", color: "#c8956c" },
              { key: "person", label: "Person", color: "#b85c3a" },
              { key: "society", label: "Society", color: "#7c6f9e" },
            ]}
          />
        </div>
      </section>

      {/* 3. Crime by Category - Current Year */}
      <section>
        <SectionHeader icon={Shield} title="Current Year by Category" color="#c8956c" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <BarChart
            data={currentYearByCategory}
            height={260}
          />
        </div>
      </section>

      {/* 4. 911 Response Times */}
      <section>
        <SectionHeader icon={Phone} title="911 Response Times (10-Year)" color="#4a7f9e" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Median response time in minutes by priority level. Priority 1 = life-threatening emergencies.
          </p>
          <MultiLineChart
            data={responseTimesTrend}
            xKey="month"
            height={340}
            valueSuffix=" min"
            lines={[
              { key: "priority1", label: "Priority 1", color: "#b85c3a" },
              { key: "priority2", label: "Priority 2", color: "#c8956c" },
              { key: "priority3", label: "Priority 3", color: "#7c6f9e" },
            ]}
          />
        </div>
      </section>

      {/* 5. Graffiti/Disorder Trend */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Graffiti / Disorder Trend" color="#7c6f9e" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Monthly graffiti reports serve as a proxy for visible street-level disorder.
          </p>
          <TrendChart data={graffitiChartData} color="#7c6f9e" height={260} />
        </div>
      </section>

      {/* 6. Year-over-Year Comparison */}
      <section>
        <SectionHeader icon={Shield} title="Year-over-Year Comparison" color="#1a3a2a" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 text-center">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
              Current Year (YTD)
            </p>
            <p className="text-[36px] font-mono font-semibold text-[var(--color-ink)] leading-none">
              {yearOverYear.current.toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 text-center flex flex-col items-center justify-center">
            <ChangeIcon
              className={`w-8 h-8 mb-1 ${
                yearOverYear.change < 0
                  ? "text-green-600"
                  : yearOverYear.change > 0
                    ? "text-red-600"
                    : "text-[var(--color-ink-muted)]"
              }`}
            />
            <p
              className={`text-[28px] font-mono font-semibold leading-none ${
                yearOverYear.change < 0
                  ? "text-green-700"
                  : yearOverYear.change > 0
                    ? "text-red-700"
                    : "text-[var(--color-ink-muted)]"
              }`}
            >
              {yearOverYear.change > 0 ? "+" : ""}
              {yearOverYear.change}%
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 uppercase tracking-wider">
              Change
            </p>
          </div>
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 text-center">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
              Prior Year (Full)
            </p>
            <p className="text-[36px] font-mono font-semibold text-[var(--color-ink)] leading-none">
              {yearOverYear.prior.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Key Insights */}
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
