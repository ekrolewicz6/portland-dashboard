"use client";

import { useEffect, useState } from "react";

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

/* ── Income tiers we want to feature ── */
const FEATURED_LEVELS = [60_000, 75_000, 125_000, 200_000, 300_000];

const LEVEL_LABELS: Record<number, string> = {
  60_000: "Below median",
  75_000: "Area median",
  125_000: "PFA / SHS threshold",
  200_000: "High income",
  300_000: "Top bracket",
};

/* ── Heatmap color interpolation ── */
function heatColor(rate: number, min: number, max: number): string {
  const t = max === min ? 0 : (rate - min) / (max - min);
  // warm cream → deep terracotta
  const r = Math.round(245 - t * 65);   // 245 → 180
  const g = Math.round(235 - t * 120);  // 235 → 115
  const b = Math.round(220 - t * 130);  // 220 → 90
  return `rgb(${r}, ${g}, ${b})`;
}

function textColor(rate: number, min: number, max: number): string {
  const t = max === min ? 0 : (rate - min) / (max - min);
  return t > 0.6 ? "white" : "var(--color-ink)";
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

  // Filter to featured income levels only
  const incomeLevels = FEATURED_LEVELS.filter((lvl) =>
    comparison.some((r) => r.income_level === lvl),
  );

  // Sort cities: Portland first, then by rate at median ($75K) descending
  const allCities = [...new Set(comparison.map((r) => r.city))];
  const sortedCities = allCities.sort((a, b) => {
    if (a.startsWith("Portland")) return -1;
    if (b.startsWith("Portland")) return 1;
    const aRate = comparison.find((r) => r.city === a && r.income_level === 75_000)?.effective_rate ?? 0;
    const bRate = comparison.find((r) => r.city === b && r.income_level === 75_000)?.effective_rate ?? 0;
    return bRate - aRate;
  });

  // Compute min/max for heatmap across featured levels
  const featuredRows = comparison.filter((r) => incomeLevels.includes(r.income_level));
  const allRates = featuredRows.map((r) => r.effective_rate);
  const minRate = Math.min(...allRates);
  const maxRate = Math.max(...allRates);

  // Portland vs Vancouver gap at median
  const portlandMedian = comparison.find(
    (r) => r.city.startsWith("Portland") && r.income_level === 75_000,
  );
  const vancouverMedian = comparison.find(
    (r) => r.city.startsWith("Vancouver") && r.income_level === 75_000,
  );

  // Portland breakdown for featured levels
  const featuredBreakdown = portlandBreakdown
    .filter((r) => incomeLevels.includes(r.income_level))
    .sort((a, b) => a.income_level - b.income_level);

  return (
    <div className="space-y-10">
      {/* ── Intro context ── */}
      <section>
        <p className="text-[14px] text-[var(--color-ink-muted)] leading-relaxed max-w-prose">
          Effective income tax rates for a single W-2 employee with standard deduction.
          All rates include federal, state, and local income taxes
          (California includes SDI, a mandatory 1.1% state payroll withholding).
          Portland-specific taxes (PFA and Metro SHS) only apply to taxable income above $125K.
          Below that, the only Portland tax is the $35 Arts Tax.
        </p>
        <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed max-w-prose mt-2 italic">
          Note: This compares income taxes only. Oregon has no sales tax, while most comparison
          states do (CA 7.25%+, TX 6.25%+, UT 6.1%, CO 2.9%+, ID 6%). A full tax burden
          comparison would narrow Portland&rsquo;s gap with high-sales-tax cities considerably.
        </p>
      </section>

      {/* ── Heatmap Table ── */}
      <section>
        <SectionHeader title="How Portland Compares at Every Income Level" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--color-parchment)]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] min-w-[140px]">
                  City
                </th>
                {incomeLevels.map((lvl) => (
                  <th
                    key={lvl}
                    className="text-center px-3 py-2 min-w-[90px]"
                  >
                    <span className="block text-[13px] font-mono font-bold text-[var(--color-ink)]">
                      ${(lvl / 1000).toFixed(0)}K
                    </span>
                    <span className="block text-[10px] text-[var(--color-ink-muted)] font-normal mt-0.5">
                      {LEVEL_LABELS[lvl] ?? ""}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCities.map((city, cityIdx) => {
                const isPortland = city.startsWith("Portland");
                return (
                  <tr
                    key={city}
                    className={`${cityIdx > 0 ? "border-t border-[var(--color-parchment)]/40" : ""} ${isPortland ? "border-t-2 border-b-2 border-[var(--color-canopy)]/40" : ""}`}
                  >
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${isPortland ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"}`}
                    >
                      {city}
                    </td>
                    {incomeLevels.map((lvl) => {
                      const row = comparison.find(
                        (r) => r.city === city && r.income_level === lvl,
                      );
                      if (!row) {
                        return (
                          <td key={lvl} className="px-3 py-3 text-center font-mono text-[var(--color-ink-muted)]">
                            --
                          </td>
                        );
                      }
                      const bg = heatColor(row.effective_rate, minRate, maxRate);
                      const fg = textColor(row.effective_rate, minRate, maxRate);
                      const dollars = Math.round(row.income_level * row.effective_rate / 100);
                      return (
                        <td
                          key={lvl}
                          className="px-3 py-3 text-center"
                          style={{ backgroundColor: bg }}
                        >
                          <span
                            className="block text-[14px] font-mono font-bold"
                            style={{ color: fg }}
                          >
                            {row.effective_rate}%
                          </span>
                          <span
                            className="block text-[10px] font-mono mt-0.5 opacity-70"
                            style={{ color: fg }}
                          >
                            ${dollars.toLocaleString()}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[var(--color-ink-muted)] mt-2 font-mono">
          Source: IRS / Oregon DOR / state tax agencies (2024 brackets). CA includes SDI (1.1%). Darker = higher burden. Income taxes only — excludes sales tax.
        </p>
      </section>

      {/* ── Key Insight Callout ── */}
      {portlandMedian && vancouverMedian && (
        <section>
          <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
            <p className="font-editorial-normal text-[20px] leading-snug">
              At the area median income ($75K), a Portlander pays {portlandMedian.effective_rate}%
              effective tax vs {vancouverMedian.effective_rate}% across the river in Vancouver &mdash;
              a {(portlandMedian.effective_rate - vancouverMedian.effective_rate).toFixed(1)} point gap.
            </p>
            <p className="text-[13px] text-white/60 mt-3 font-mono">
              That gap is entirely Oregon&rsquo;s state income tax (top bracket 9.9%). At $75K, Portland&rsquo;s
              only local tax is the $35 Arts Tax. PFA and Metro SHS don&rsquo;t kick in until taxable income
              exceeds $125K.
            </p>
          </div>
        </section>
      )}

      {/* ── Portland-Specific Breakdown ── */}
      <section>
        <SectionHeader title="What a Portlander Actually Pays" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
            How Portland&rsquo;s effective tax rate breaks down by component.
            Self-employed and business owners pay additional BLT (2.6%) and MultCo BIT (2.0%) on net business income — these rates show W-2 employee burden only.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {featuredBreakdown.map((r) => {
              const totalDollars = Math.round(r.income_level * r.effective_rate / 100);
              const localDollars = Math.round(r.income_level * r.local / 100);
              const portlandTotal = localDollars + 35; // everyone pays $35 Arts Tax
              return (
                <div key={r.income_level} className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
                  <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    {LEVEL_LABELS[r.income_level] ?? ""}
                  </p>
                  <p className="text-[16px] font-mono font-bold text-[var(--color-ink)] mt-1">
                    ${(r.income_level / 1000).toFixed(0)}K income
                  </p>
                  <div className="mt-3 space-y-1 text-[12px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-ink-muted)]">Federal</span>
                      <span className="text-[var(--color-ink)]">{r.federal}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-ink-muted)]">Oregon</span>
                      <span className="text-[var(--color-ink)]">{r.state}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-ink-muted)]">Portland local</span>
                      <span className={r.local > 0 ? "text-[var(--color-clay)] font-semibold" : "text-[var(--color-ink)]"}>
                        {r.local > 0 ? `${r.local}%` : "$35 only"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[var(--color-parchment)]">
                      <span className="font-semibold text-[var(--color-ink)]">Total</span>
                      <span className="font-bold text-[var(--color-ink)]">{r.effective_rate}%</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[var(--color-parchment)]">
                    <p className="text-[18px] font-mono font-bold text-[var(--color-ink)]">
                      ${totalDollars.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]">
                      total tax &middot; ${portlandTotal.toLocaleString()} Portland-only
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
