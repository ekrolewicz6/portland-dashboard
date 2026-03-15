"use client";

import { useEffect, useState } from "react";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";

interface TaxRow {
  city: string;
  income_level: number;
  effective_rate: number;
  breakdown: {
    federal: number;
    state: number;
    local: number;
    other: number;
  };
}

interface PortlandBreakdownRow {
  income_level: number;
  effective_rate: number;
  federal: number;
  state: number;
  local: number;
  other: number;
}

interface TaxDetailData {
  comparison: TaxRow[];
  portlandBreakdown: PortlandBreakdownRow[];
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

export default function TaxDetail() {
  const [data, setData] = useState<TaxDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/tax/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load tax detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading tax data...
      </div>
    );
  }

  const { comparison, portlandBreakdown } = data;

  // Get all unique income levels and cities
  const incomeLevels = [...new Set(comparison.map((r) => r.income_level))].sort(
    (a, b) => a - b,
  );
  const cities = [...new Set(comparison.map((r) => r.city))];

  // Grouped bar data at $200K
  const highIncome = comparison.filter((r) => r.income_level === Math.max(...incomeLevels));
  const groupedBarData = highIncome.map((r) => ({
    city: r.city,
    Federal: r.breakdown.federal,
    State: r.breakdown.state,
    Local: r.breakdown.local,
    Other: r.breakdown.other,
  }));

  // Portland stacked breakdown
  const portlandStacked = portlandBreakdown.map((r) => ({
    income: `$${(r.income_level / 1000).toFixed(0)}K`,
    Federal: r.federal,
    State: r.state,
    Local: r.local,
    Other: r.other,
  }));

  // Portland vs Vancouver gap
  const portland200 = comparison.find(
    (r) => r.city.startsWith("Portland") && r.income_level === Math.max(...incomeLevels),
  );
  const vancouver200 = comparison.find(
    (r) => r.city.startsWith("Vancouver") && r.income_level === Math.max(...incomeLevels),
  );

  const gap =
    portland200 && vancouver200
      ? (portland200.effective_rate - vancouver200.effective_rate).toFixed(1)
      : null;

  return (
    <div className="space-y-10">
      {/* Comparison Bar Chart */}
      <section>
        <SectionHeader title={`Tax Burden Comparison at $${(Math.max(...incomeLevels) / 1000).toFixed(0)}K Income`} />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Effective income tax rate broken down by level of government. Portland stands out for having the highest LOCAL tax burden (BLT + MultCo BIT + Metro SHS + PFA) of any comparable city.
          </p>
          <ComparisonBarChart
            data={groupedBarData}
            xKey="city"
            bars={[
              { key: "Federal", label: "Federal", color: "#4a7f9e", stackId: "stack" },
              { key: "State", label: "State", color: "#3d7a5a", stackId: "stack" },
              { key: "Local", label: "Local", color: "#c8956c", stackId: "stack" },
              { key: "Other", label: "Other", color: "#7c6f9e", stackId: "stack" },
            ]}
            height={360}
            valueSuffix="%"
          />

          {/* Dollar amount summary */}
          <div className="mt-6 pt-4 border-t border-[var(--color-parchment)]">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-3">
              What that means in real dollars at ${(Math.max(...incomeLevels) / 1000).toFixed(0)}K income:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {highIncome
                .sort((a, b) => b.effective_rate - a.effective_rate)
                .map((r) => {
                  const totalDollars = Math.round(r.income_level * r.effective_rate / 100);
                  const isPortland = r.city.startsWith("Portland");
                  return (
                    <div
                      key={r.city}
                      className={`rounded-sm p-3 ${isPortland ? "bg-[var(--color-canopy)] text-white" : "bg-[var(--color-parchment)]/40"}`}
                    >
                      <p className={`text-[11px] font-medium truncate ${isPortland ? "text-[var(--color-ember)]" : "text-[var(--color-ink-muted)]"}`}>
                        {r.city.replace(/, [A-Z]{2}$/, "")}
                      </p>
                      <p className={`text-[20px] font-mono font-bold mt-0.5 ${isPortland ? "text-white" : "text-[var(--color-ink)]"}`}>
                        ${totalDollars.toLocaleString()}
                      </p>
                      <p className={`text-[11px] font-mono ${isPortland ? "text-white/50" : "text-[var(--color-ink-muted)]"}`}>
                        {r.effective_rate}% effective
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Portland Tax Breakdown */}
      <section>
        <SectionHeader title="Portland Tax Breakdown by Income Level" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            How Portland&apos;s effective tax rate breaks down at each income level. Local taxes (BLT 2.6%, MultCo BIT 2.0%, Metro SHS 1.0%, PFA 1.5%) hit hardest above $125K.
          </p>
          <ComparisonBarChart
            data={portlandStacked}
            xKey="income"
            bars={[
              { key: "Federal", label: "Federal", color: "#4a7f9e", stackId: "stack" },
              { key: "State", label: "State (Oregon)", color: "#3d7a5a", stackId: "stack" },
              { key: "Local", label: "Local (BLT+BIT+SHS+PFA)", color: "#c8956c", stackId: "stack" },
              { key: "Other", label: "Other (Arts Tax)", color: "#7c6f9e", stackId: "stack" },
            ]}
            height={320}
            valueSuffix="%"
          />

          {/* Dollar breakdown per income level */}
          <div className="mt-6 pt-4 border-t border-[var(--color-parchment)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {portlandBreakdown.map((r) => {
                const totalDollars = Math.round(r.income_level * r.effective_rate / 100);
                const localDollars = Math.round(r.income_level * r.local / 100);
                return (
                  <div key={r.income_level} className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
                    <p className="text-[12px] font-mono font-semibold text-[var(--color-ink-muted)]">
                      At ${(r.income_level / 1000).toFixed(0)}K income
                    </p>
                    <p className="text-[24px] font-mono font-bold text-[var(--color-ink)] mt-1">
                      ${totalDollars.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                      total tax ({r.effective_rate}% effective)
                    </p>
                    <p className="text-[13px] font-mono font-semibold text-[var(--color-clay)] mt-2">
                      ${localDollars.toLocaleString()} in local taxes alone
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]">
                      BLT + MultCo BIT + Metro SHS + PFA ({r.local}%)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Income Level Comparison Table */}
      <section>
        <SectionHeader title="Effective Tax Rate by City and Income" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-parchment)]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                  City
                </th>
                {incomeLevels.map((lvl) => (
                  <th
                    key={lvl}
                    className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]"
                  >
                    ${(lvl / 1000).toFixed(0)}K
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr
                  key={city}
                  className={`border-b border-[var(--color-parchment)]/50 last:border-0 ${city === "Portland" ? "bg-[var(--color-parchment)]/30 font-semibold" : ""}`}
                >
                  <td className="px-5 py-3 text-[var(--color-ink)]">{city}</td>
                  {incomeLevels.map((lvl) => {
                    const row = comparison.find(
                      (r) => r.city === city && r.income_level === lvl,
                    );
                    return (
                      <td key={lvl} className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                        {row ? `${row.effective_rate}%` : "--"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Gap Callout */}
      {gap && portland200 && vancouver200 && (
        <section>
          <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
            <p className="font-editorial-normal text-[20px] leading-snug">
              At ${(Math.max(...incomeLevels) / 1000).toFixed(0)}K income, Portland&rsquo;s effective rate is{" "}
              {portland200.effective_rate}% vs {vancouver200.city}&rsquo;s {vancouver200.effective_rate}% &mdash;
              a {gap} percentage point gap.
            </p>
            <p className="text-[13px] text-white/60 mt-3 font-mono">
              Portland layers include BLT, MultCo BIT, Metro SHS, PFA, state income tax, and federal tax.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
