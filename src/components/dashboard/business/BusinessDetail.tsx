"use client";

import { useEffect, useState } from "react";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import DualLineChart from "@/components/charts/DualLineChart";
import TrendChart from "@/components/charts/TrendChart";

interface FormationRow {
  month: string;
  new: number;
  cancelled: number;
  net: number;
}

interface YearlyRow {
  year: string;
  net: number;
}

interface CumulativeRow {
  month: string;
  total: number;
}

interface BusinessDetailData {
  formationTrend: FormationRow[];
  yearlyTotals: YearlyRow[];
  cumulativeFormation: CumulativeRow[];
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

export default function BusinessDetail() {
  const [data, setData] = useState<BusinessDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/business/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load business detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading business data...
      </div>
    );
  }

  const { formationTrend, yearlyTotals, cumulativeFormation } = data;

  const latestMonth = formationTrend[formationTrend.length - 1];
  const last12 = formationTrend.slice(-12);
  const last12Net = last12.reduce((s, r) => s + r.net, 0);
  const cumulativeTotal = cumulativeFormation.length > 0
    ? cumulativeFormation[cumulativeFormation.length - 1].total
    : 0;

  const barData = formationTrend.map((r) => ({
    month: r.month.slice(2),
    net: r.net,
  }));

  const dualData = formationTrend.map((r) => ({
    month: r.month.slice(2),
    "New Registrations": r.new,
    Cancellations: r.cancelled,
  }));

  const cumChartData = cumulativeFormation.map((r) => ({
    date: r.month.slice(2),
    value: r.total,
  }));

  return (
    <div className="space-y-10">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Net this month"
          value={latestMonth ? (latestMonth.net >= 0 ? "+" : "") + latestMonth.net.toLocaleString() : "--"}
          sub={latestMonth?.month}
        />
        <StatCard
          label="12-month net"
          value={(last12Net >= 0 ? "+" : "") + last12Net.toLocaleString()}
          sub="businesses"
        />
        <StatCard
          label="Cumulative new"
          value={cumulativeTotal.toLocaleString()}
          sub="total formed"
        />
      </div>

      {/* Net Formation Bar Chart */}
      <section>
        <SectionHeader title="10-Year Net Business Formation" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ComparisonBarChart
            data={barData}
            xKey="month"
            bars={[{ key: "net", label: "Net formation", color: "#3d7a5a" }]}
            height={320}
            colorByValue
            positiveColor="#3d7a5a"
            negativeColor="#b85c3a"
            showLegend={false}
            referenceLine={0}
          />
        </div>
      </section>

      {/* New vs Cancelled Dual Line */}
      <section>
        <SectionHeader title="New Registrations vs Cancellations" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <DualLineChart
            data={dualData}
            xKey="month"
            line1Key="New Registrations"
            line2Key="Cancellations"
            color1="#3d7a5a"
            color2="#b85c3a"
            height={300}
          />
        </div>
      </section>

      {/* Cumulative Trend */}
      <section>
        <SectionHeader title="Cumulative Business Formation" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <TrendChart data={cumChartData} color="#3d7a5a" height={280} />
        </div>
      </section>

      {/* Yearly Summary Table */}
      <section>
        <SectionHeader title="Yearly Summary" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-parchment)]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">Year</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">Net Formation</th>
              </tr>
            </thead>
            <tbody>
              {yearlyTotals.map((row) => (
                <tr key={row.year} className="border-b border-[var(--color-parchment)]/50 last:border-0">
                  <td className="px-5 py-3 font-mono text-[var(--color-ink)]">{row.year}</td>
                  <td className={`px-5 py-3 font-mono text-right ${row.net >= 0 ? "text-[#3d7a5a]" : "text-[#b85c3a]"}`}>
                    {row.net >= 0 ? "+" : ""}{row.net.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
