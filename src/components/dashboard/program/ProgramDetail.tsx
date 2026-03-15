"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/charts/TrendChart";
import DualLineChart from "@/components/charts/DualLineChart";

interface GrowthRow {
  month: string;
  total: number;
  survival: number;
  jobs: number;
  credits: number;
}

interface ProgramDetailData {
  growthTrend: GrowthRow[];
  currentStats: GrowthRow | null;
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

export default function ProgramDetail() {
  const [data, setData] = useState<ProgramDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/program/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load program detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading program data...
      </div>
    );
  }

  const { growthTrend, currentStats } = data;

  const totalCertified = currentStats?.total ?? 0;
  const survivalRate = currentStats?.survival ?? 0;
  const jobsCreated = currentStats?.jobs ?? 0;
  const creditsIssued = currentStats?.credits ?? 0;

  const certifiedChartData = growthTrend.map((r) => ({
    date: r.month,
    value: r.total,
  }));

  const jobsCreditsData = growthTrend.map((r) => ({
    month: r.month,
    "Jobs Created": r.jobs,
    "Credits Issued": r.credits,
  }));

  // National benchmark
  const nationalSurvival = 80;
  const survivalGap = survivalRate - nationalSurvival;

  return (
    <div className="space-y-10">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total certified"
          value={totalCertified.toLocaleString()}
          sub="businesses"
        />
        <StatCard
          label="1-yr survival"
          value={`${survivalRate}%`}
          sub={`vs ${nationalSurvival}% national`}
        />
        <StatCard
          label="Jobs created"
          value={jobsCreated.toLocaleString()}
          sub="cumulative"
        />
        <StatCard
          label="Credits issued"
          value={`$${creditsIssued.toLocaleString()}`}
          sub="total"
        />
      </div>

      {/* Growth Trend */}
      <section>
        <SectionHeader title="Certified Business Growth" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <TrendChart data={certifiedChartData} color="#1a3a2a" height={320} />
        </div>
      </section>

      {/* Survival Rate Comparison */}
      <section>
        <SectionHeader title="1-Year Survival Rate Comparison" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                  Portland Commons
                </span>
                <span className="text-[14px] font-mono text-[var(--color-ink)]">
                  {survivalRate}%
                </span>
              </div>
              <div className="w-full h-6 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000"
                  style={{
                    width: `${survivalRate}%`,
                    backgroundColor: "#1a3a2a",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-[var(--color-ink-muted)]">
                  National Average
                </span>
                <span className="text-[14px] font-mono text-[var(--color-ink-muted)]">
                  {nationalSurvival}%
                </span>
              </div>
              <div className="w-full h-6 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000"
                  style={{
                    width: `${nationalSurvival}%`,
                    backgroundColor: "#78716c",
                  }}
                />
              </div>
            </div>
            <p className="text-[12px] text-[var(--color-ink-muted)] font-mono mt-2">
              Portland Commons outperforms the national average by {survivalGap} percentage points
            </p>
          </div>
        </div>
      </section>

      {/* Jobs and Credits Growth */}
      <section>
        <SectionHeader title="Jobs Created & Credits Issued Over Time" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <DualLineChart
            data={jobsCreditsData}
            xKey="month"
            line1Key="Jobs Created"
            line2Key="Credits Issued"
            color1="#3d7a5a"
            color2="#7c6f9e"
            height={300}
          />
        </div>
      </section>

      {/* Tier Breakdown Placeholder */}
      <section>
        <SectionHeader title="Program Tier Breakdown" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-8 text-center">
          <p className="text-[14px] text-[var(--color-ink-muted)]">
            Tier-level breakdown of certified businesses coming soon.
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)]/60 mt-2">
            This section will show distribution across certification tiers and industry sectors.
          </p>
        </div>
      </section>
    </div>
  );
}
