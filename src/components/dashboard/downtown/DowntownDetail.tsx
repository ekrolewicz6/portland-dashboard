"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/charts/TrendChart";
import DualLineChart from "@/components/charts/DualLineChart";

interface FootTrafficRow {
  week: string;
  pct: number;
}

interface VacancyRow {
  quarter: string;
  office: number;
  retail: number;
}

interface Milestone {
  threshold: number;
  week: string;
}

interface DowntownDetailData {
  footTrafficTrend: FootTrafficRow[];
  vacancyTrend: VacancyRow[];
  weekdayVsWeekend: { weekday: number; weekend: number };
  recoveryMilestones: Milestone[];
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
      <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-1">
        {label}
      </p>
      <p className="text-[28px] font-editorial-normal text-[var(--color-ink)] leading-tight">
        {value}
      </p>
      {sub && (
        <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 font-mono">{sub}</p>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function DowntownDetail() {
  const [data, setData] = useState<DowntownDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/downtown/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load downtown detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading downtown data...
      </div>
    );
  }

  const { footTrafficTrend, vacancyTrend, weekdayVsWeekend, recoveryMilestones } = data;

  const latestFt = footTrafficTrend[footTrafficTrend.length - 1];
  const latestVac = vacancyTrend[vacancyTrend.length - 1];

  // Recovery rate: how much the latest pct is vs the lowest post-pandemic
  const lowestPct = Math.min(...footTrafficTrend.filter(r => r.week >= "2020-03").map(r => r.pct));
  const recoveryRate = lowestPct > 0 && latestFt
    ? Math.round(((latestFt.pct - lowestPct) / (100 - lowestPct)) * 100)
    : 0;

  // Area chart data
  const areaData = footTrafficTrend.map((r) => ({
    date: r.week.slice(0, 10),
    value: r.pct,
  }));

  // Vacancy dual line
  const vacDualData = vacancyTrend.map((r) => ({
    quarter: r.quarter,
    "Office Vacancy": r.office,
    "Retail Vacancy": r.retail,
  }));

  return (
    <div className="space-y-10">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Foot traffic"
          value={latestFt ? `${latestFt.pct}%` : "--"}
          sub="of 2019 baseline"
        />
        <StatCard
          label="Office vacancy"
          value={latestVac ? `${latestVac.office}%` : "--"}
          sub={latestVac?.quarter}
        />
        <StatCard
          label="Retail vacancy"
          value={latestVac ? `${latestVac.retail}%` : "--"}
          sub={latestVac?.quarter}
        />
        <StatCard
          label="Recovery rate"
          value={`${recoveryRate}%`}
          sub="from pandemic low"
        />
      </div>

      {/* Foot Traffic Area Chart */}
      <section>
        <SectionHeader title="Foot Traffic Recovery (% of 2019)" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <TrendChart data={areaData} color="#c8956c" height={320} valueSuffix="%" />
          <div className="mt-2 text-[11px] text-[var(--color-ink-muted)] font-mono">
            100% = 2019 pre-pandemic baseline
          </div>
        </div>
      </section>

      {/* Office vs Retail Vacancy */}
      <section>
        <SectionHeader title="Office vs Retail Vacancy Rate" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <DualLineChart
            data={vacDualData}
            xKey="quarter"
            line1Key="Office Vacancy"
            line2Key="Retail Vacancy"
            color1="#4a7f9e"
            color2="#c8956c"
            height={300}
            valueSuffix="%"
          />
        </div>
      </section>

      {/* Recovery Milestones */}
      <section>
        <SectionHeader title="Recovery Milestones" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          {recoveryMilestones.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {recoveryMilestones.map((m) => (
                <div key={m.threshold} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-editorial-normal text-[18px] text-white"
                    style={{
                      backgroundColor:
                        m.threshold >= 90
                          ? "#3d7a5a"
                          : m.threshold >= 75
                            ? "#c8956c"
                            : "#4a7f9e",
                    }}
                  >
                    {m.threshold}%
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--color-ink)]">
                      {m.threshold}% recovery
                    </p>
                    <p className="text-[12px] text-[var(--color-ink-muted)] font-mono">
                      {m.week}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[var(--color-ink-muted)]">
              No milestones reached yet.
            </p>
          )}
        </div>
      </section>

      {/* Weekday vs Weekend Story */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <p className="font-editorial-normal text-[20px] leading-snug">
            Weekend recovery leads at {weekdayVsWeekend.weekend}% while weekday foot traffic
            lags at {weekdayVsWeekend.weekday}% of pre-pandemic levels.
          </p>
          <p className="text-[13px] text-white/60 mt-3 font-mono">
            Based on aggregated foot traffic data compared to 2019 baseline.
          </p>
        </div>
      </section>
    </div>
  );
}
