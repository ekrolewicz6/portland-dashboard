"use client";

import { useEffect, useState } from "react";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import DualLineChart from "@/components/charts/DualLineChart";
import TrendChart from "@/components/charts/TrendChart";

interface WaterRow {
  month: string;
  activations: number;
  deactivations: number;
  net: number;
}

interface PopRow {
  year: number;
  population: number;
  change: number;
}

interface MigrationDetailData {
  waterTrend: WaterRow[];
  populationTrend: PopRow[];
  recentMonths: WaterRow[];
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

export default function MigrationDetail() {
  const [data, setData] = useState<MigrationDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/migration/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load migration detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading migration data...
      </div>
    );
  }

  const { waterTrend, populationTrend, recentMonths } = data;

  // Stats
  const latestMonth = recentMonths[recentMonths.length - 1];
  const last12Net = recentMonths.reduce((s, r) => s + r.net, 0);
  const latestPop = populationTrend[populationTrend.length - 1];
  const yoyChange = latestPop?.change ?? 0;

  // Story: find turning point
  const lossYears = waterTrend.filter(
    (r) => r.month >= "2020-01" && r.month <= "2023-12" && r.net < 0,
  );
  const totalLoss = lossYears.reduce((s, r) => s + Math.abs(r.net), 0);
  const gainMonths = waterTrend.filter(
    (r) => r.month >= "2024-01" && r.net > 0,
  );
  const totalGain = gainMonths.reduce((s, r) => s + r.net, 0);

  // Bar chart data
  const barData = waterTrend.map((r) => ({
    month: r.month.slice(2), // "16-01"
    net: r.net,
  }));

  // Dual line data
  const dualData = waterTrend.map((r) => ({
    month: r.month.slice(2),
    Activations: r.activations,
    Deactivations: r.deactivations,
  }));

  // Population line chart
  const popChartData = populationTrend.map((r) => ({
    date: String(r.year),
    value: r.population,
  }));

  return (
    <div className="space-y-10">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net this month"
          value={latestMonth ? (latestMonth.net >= 0 ? "+" : "") + latestMonth.net.toLocaleString() : "--"}
          sub={latestMonth?.month}
        />
        <StatCard
          label="12-month total"
          value={(last12Net >= 0 ? "+" : "") + last12Net.toLocaleString()}
          sub="households"
        />
        <StatCard
          label="Population"
          value={latestPop ? latestPop.population.toLocaleString() : "--"}
          sub={latestPop ? String(latestPop.year) : ""}
        />
        <StatCard
          label="YoY change"
          value={yoyChange ? (yoyChange >= 0 ? "+" : "") + yoyChange.toLocaleString() : "--"}
          sub="from prior year"
        />
      </div>

      {/* 10-Year Net Migration Bar Chart */}
      <section>
        <SectionHeader title="10-Year Net Migration (Water Meter Proxy)" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ComparisonBarChart
            data={barData}
            xKey="month"
            bars={[{ key: "net", label: "Net migration", color: "#3d7a5a" }]}
            height={320}
            colorByValue
            positiveColor="#3d7a5a"
            negativeColor="#b85c3a"
            showLegend={false}
            referenceLine={0}
          />
        </div>
      </section>

      {/* Population Trend */}
      <section>
        <SectionHeader title="Census Population Trend" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <TrendChart data={popChartData} color="#4a7f9e" height={280} />
        </div>
      </section>

      {/* Activations vs Deactivations */}
      <section>
        <SectionHeader title="Activations vs Deactivations" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <DualLineChart
            data={dualData}
            xKey="month"
            line1Key="Activations"
            line2Key="Deactivations"
            line1Label="Activations"
            line2Label="Deactivations"
            color1="#3d7a5a"
            color2="#b85c3a"
            height={300}
          />
        </div>
      </section>

      {/* Story Callout */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <p className="font-editorial-normal text-[20px] leading-snug">
            Portland lost {totalLoss.toLocaleString()} household connections during 2020&ndash;2023,
            but has gained {totalGain.toLocaleString()} since the turning point.
          </p>
          <p className="text-[13px] text-white/60 mt-3 font-mono">
            Based on water meter activations and deactivations as a proxy for household migration.
          </p>
        </div>
      </section>
    </div>
  );
}
