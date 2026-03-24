"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "@/components/dashboard/NewsContext";
import DualLineChart from "@/components/charts/DualLineChart";
import {
  Briefcase,
  TrendingDown,
  Users,
  Building2,
  BarChart3,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const ACCENT = "#c8956c";

interface QcewIndustry {
  code: string;
  title: string;
  employment: number;
  avgWage: number;
  establishments: number;
}

interface IndustryChange {
  code: string;
  title: string;
  peakEstablishments: number;
  currentEstablishments: number;
  change: number;
  pctChange: number;
  employment: number;
  avgWage: number;
  avgSize: number;
}

interface EconomyDetailData {
  businessStats: { totalActive: number; newThisQuarter: number; yoyGrowthMultiple: number };
  quarterlyTrend: { quarter: string; total: number }[];
  entityBreakdown: { name: string; value: number }[];
  unemploymentTrend: { month: string; rate: number }[];
  employmentTrend: { month: string; level: number }[];
  latestVacancy: { office: number; retail: number; quarter: string } | null;
  qcewEmployment?: { quarter: string; totalEmployment: number; avgWeeklyWage: number; totalWages: number; industries: QcewIndustry[] }[];
  qcewTrend?: { quarter: string; employment: number; avgWage: number; establishments: number }[];
  establishmentChanges?: { industry: string; peakEstablishments: number; currentEstablishments: number; change: number; pctChange: number }[];
  detailedIndustryChanges?: IndustryChange[];
  since2019TopGrowers?: { title: string; change: number; pctChange: number }[];
  realWageTrend?: { quarter: string; nominalWage: number; realWage: number }[];
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
      <Icon className="w-4 h-4" style={{ color: color ?? ACCENT }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function EconomyDetail() {
  const [data, setData] = useState<EconomyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/economy/detail")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-sm bg-[var(--color-parchment)]" />
        ))}
      </div>
    );
  }

  if (error || !data || data.dataStatus === "error") {
    return (
      <div className="text-center py-16 text-[var(--color-ink-muted)]">
        <p className="text-sm">Economy data temporarily unavailable.</p>
      </div>
    );
  }

  const { unemploymentTrend, qcewEmployment, qcewTrend, detailedIndustryChanges, since2019TopGrowers, realWageTrend } = data;

  // Compute key figures from QCEW
  const latestQcew = qcewTrend && qcewTrend.length > 0 ? qcewTrend[qcewTrend.length - 1] : null;
  const preCovidQcew = qcewTrend?.find((d) => d.quarter === "2019 Q3");
  const peakEstQcew = qcewTrend ? qcewTrend.reduce((max, d) => d.establishments > max.establishments ? d : max, qcewTrend[0]) : null;
  const peakEmpQcew = qcewTrend ? qcewTrend.reduce((max, d) => d.employment > max.employment ? d : max, qcewTrend[0]) : null;
  const latestUnemp = unemploymentTrend.length > 0 ? unemploymentTrend[unemploymentTrend.length - 1] : null;

  // Dynamic narrative
  const estLossFromPeak = peakEstQcew && latestQcew ? peakEstQcew.establishments - latestQcew.establishments : 0;
  const empLossFromPeak = peakEmpQcew && latestQcew ? peakEmpQcew.employment - latestQcew.employment : 0;
  const estGainSince2019 = preCovidQcew && latestQcew ? latestQcew.establishments - preCovidQcew.establishments : 0;

  return (
    <div className="space-y-10">
      <NewsContext category="economy" />

      {/* ━━━ 1. NARRATIVE SUMMARY ━━━ */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--color-ember)] flex-shrink-0 mt-1" />
            <h3 className="font-editorial-normal text-[28px] sm:text-[34px] leading-snug text-white">
              Portland&apos;s economy is contracting after a post-COVID peak
            </h3>
          </div>
          <div className="space-y-3 text-[14px] text-white/70 leading-relaxed">
            <p>
              Multnomah County&apos;s private economy grew steadily from 2016 through late 2023, adding
              {preCovidQcew && peakEstQcew ? ` ${(peakEstQcew.establishments - preCovidQcew.establishments + estGainSince2019 > 0 ? peakEstQcew.establishments - qcewTrend![0].establishments : 0).toLocaleString()}` : ""} businesses
              over seven years. But since {peakEstQcew?.quarter}, the county has{" "}
              <strong className="text-white">lost {estLossFromPeak.toLocaleString()} businesses</strong> and{" "}
              <strong className="text-white">{empLossFromPeak.toLocaleString()} jobs</strong>.
              {estGainSince2019 > 0
                ? ` The county still has ${estGainSince2019.toLocaleString()} more businesses than before COVID (2019), but the gains are eroding.`
                : ` The county now has fewer businesses than before COVID.`}
            </p>
            {latestQcew && (
              <p>
                The average worker earns <strong className="text-white">${latestQcew.avgWage.toLocaleString()}/week</strong> (${Math.round(latestQcew.avgWage * 52).toLocaleString()}/yr),
                but after adjusting for Portland&apos;s 36.5% inflation since 2016, real wage growth has been minimal.
                {latestUnemp ? ` Unemployment stands at ${latestUnemp.rate}%.` : ""}
              </p>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-4 font-mono">
            Source: BLS QCEW (Multnomah County, private sector) · BLS LAUS (Portland MSA) · Updated quarterly
          </p>
        </div>
      </section>

      {/* ━━━ 2. KEY METRICS ━━━ */}
      {latestQcew && (
        <section>
          <SectionHeader icon={Briefcase} title={`Snapshot — ${latestQcew.quarter}`} />
          <StatGrid
            accentColor={ACCENT}
            stats={[
              {
                label: "Businesses",
                value: latestQcew.establishments.toLocaleString(),
                changeLabel: peakEstQcew ? `Down ${estLossFromPeak.toLocaleString()} from ${peakEstQcew.quarter} peak` : undefined,
              },
              {
                label: "Jobs",
                value: latestQcew.employment.toLocaleString(),
                changeLabel: peakEmpQcew ? `Down ${empLossFromPeak.toLocaleString()} from ${peakEmpQcew.quarter} peak` : undefined,
              },
              {
                label: "Avg Weekly Wage",
                value: `$${latestQcew.avgWage.toLocaleString()}`,
                changeLabel: `$${Math.round(latestQcew.avgWage * 52).toLocaleString()}/yr before tax`,
              },
              ...(latestUnemp ? [{
                label: "Unemployment",
                value: `${latestUnemp.rate}%`,
                changeLabel: `${latestUnemp.month} · Portland MSA`,
              }] : []),
            ]}
          />
        </section>
      )}

      {/* ━━━ 3. BUSINESS COUNT TREND ━━━ */}
      {qcewTrend && qcewTrend.length > 0 && latestQcew && (
        <section>
          <SectionHeader icon={Building2} title="Are Businesses Leaving Portland?" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Private establishments grew from {qcewTrend[0].establishments.toLocaleString()} ({qcewTrend[0].quarter}) to a peak of{" "}
              <strong>{peakEstQcew!.establishments.toLocaleString()}</strong> ({peakEstQcew!.quarter}), then fell to{" "}
              <strong>{latestQcew.establishments.toLocaleString()}</strong> — a loss of {estLossFromPeak.toLocaleString()} in{" "}
              {qcewTrend.length > 0 ? Math.abs(parseInt(latestQcew.quarter) - parseInt(peakEstQcew!.quarter)) || 2 : 2} years.
              This is the BLS count of actual businesses operating each quarter — the most reliable measure available.
            </p>
            <TrendChart
              data={qcewTrend.map((d) => ({ date: d.quarter, value: d.establishments }))}
              color="#b85c3a"
              height={320}
            />
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: BLS QCEW, Multnomah County (FIPS 41051), private sector, all industries.
            </p>
          </div>
        </section>
      )}

      {/* ━━━ 4. EMPLOYMENT TREND ━━━ */}
      {qcewTrend && qcewTrend.length > 0 && latestQcew && (
        <section>
          <SectionHeader icon={Users} title="Has Portland Recovered the Jobs Lost to COVID?" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Private employment peaked at {peakEmpQcew!.employment.toLocaleString()} ({peakEmpQcew!.quarter}), crashed to{" "}
              {qcewTrend.reduce((min, d) => d.employment < min.employment ? d : min, qcewTrend[0]).employment.toLocaleString()} during COVID,
              partially recovered, then began declining again. At {latestQcew.employment.toLocaleString()},{" "}
              Portland is still <strong>{empLossFromPeak.toLocaleString()} jobs below its pre-pandemic peak</strong>.
            </p>
            <TrendChart
              data={qcewTrend.map((d) => ({ date: d.quarter, value: d.employment }))}
              color={ACCENT}
              height={300}
            />
          </div>
        </section>
      )}

      {/* ━━━ 5. WINNERS & LOSERS — since 2023 peak ━━━ */}
      {detailedIndustryChanges && detailedIndustryChanges.length > 0 && (
        <section>
          <SectionHeader icon={TrendingDown} title="Which Industries Are Growing and Shrinking? (Since 2023)" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {(() => {
              const sorted = [...detailedIndustryChanges];
              const losses = sorted.filter((d) => d.change < 0).sort((a, b) => a.change - b.change);
              const gains = sorted.filter((d) => d.change > 0).sort((a, b) => b.change - a.change);
              const netChange = sorted.reduce((s, d) => s + d.change, 0);
              const totalLost = Math.abs(losses.reduce((s, d) => s + d.change, 0));
              const totalGained = gains.reduce((s, d) => s + d.change, 0);

              return (
                <div className="bg-[var(--color-canopy)] rounded-sm p-5 mb-5 text-white/90">
                  <p className="text-[14px] leading-relaxed mb-3">
                    Since 2023 Q3, <strong>{losses.length} industries lost a combined {totalLost.toLocaleString()} establishments</strong>
                    {gains.length > 0 ? <> while <strong>{gains.length} gained {totalGained.toLocaleString()}</strong></> : null}
                    {" "}— net: <strong>{netChange.toLocaleString()}</strong>.
                    The contraction is broad-based, hitting professional services, healthcare, retail, and construction
                    after their post-COVID expansion.
                  </p>
                  {losses.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[12px] text-red-400 font-semibold mb-1">Biggest losses:</p>
                      {losses.slice(0, 5).map((g) => (
                        <p key={g.code} className="text-[13px] text-white/70">
                          {g.title}: <strong className="text-white/90">{g.change.toLocaleString()}</strong> ({g.pctChange}%)
                        </p>
                      ))}
                    </div>
                  )}
                  {since2019TopGrowers && since2019TopGrowers.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-[12px] text-white/50 mb-1">
                        Despite recent losses, these still have more establishments than pre-COVID (2019):
                      </p>
                      {since2019TopGrowers.map((g) => (
                        <p key={g.title} className="text-[13px] text-white/60">
                          {g.title}: <span className="text-green-400/80">+{g.change.toLocaleString()}</span> since 2019 (+{g.pctChange}%)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <p className="text-[12px] text-[var(--color-ink-muted)] mb-3">
              Change from 2023 Q3 to latest quarter. Green = growing, red = shrinking. Sorted by % change.
            </p>
            <div className="space-y-1">
              {detailedIndustryChanges.map((ind) => {
                const maxAbs = Math.max(...detailedIndustryChanges.map((d) => Math.abs(d.pctChange)));
                const barPct = maxAbs > 0 ? (Math.abs(ind.pctChange) / maxAbs) * 50 : 0;
                const isNeg = ind.pctChange < 0;
                const barColor = ind.pctChange <= -15 ? "#b85c3a" : ind.pctChange <= -5 ? "#c8956c" : ind.pctChange < 0 ? "#a8a29e" : "#3d7a5a";

                return (
                  <div key={ind.code} className="flex items-center gap-1 h-6">
                    <span className="text-[11px] text-[var(--color-ink-light)] w-44 flex-shrink-0 truncate text-right pr-2">
                      {ind.title}
                    </span>
                    <div className="flex-1 flex items-center h-full">
                      <div className="w-1/2 flex justify-end">
                        {isNeg && <div className="h-4 rounded-l-sm" style={{ width: `${barPct}%`, backgroundColor: barColor }} />}
                      </div>
                      <div className="w-px h-full bg-[var(--color-ink)]/20 flex-shrink-0" />
                      <div className="w-1/2">
                        {!isNeg && <div className="h-4 rounded-r-sm" style={{ width: `${barPct}%`, backgroundColor: barColor }} />}
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono w-28 text-right flex-shrink-0 ${ind.pctChange <= -10 ? "text-red-600 font-semibold" : ind.pctChange >= 0 ? "text-green-700 font-semibold" : "text-[var(--color-ink)]"}`}>
                      {ind.change > 0 ? "+" : ""}{ind.change.toLocaleString()} ({ind.pctChange > 0 ? "+" : ""}{ind.pctChange}%)
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: BLS QCEW, 3-digit NAICS, Multnomah County, private sector.
            </p>
          </div>
        </section>
      )}

      {/* ━━━ 6. WHO EMPLOYS PORTLAND? ━━━ */}
      {qcewEmployment && qcewEmployment.length > 0 && qcewEmployment[0].industries.length > 0 && (
        <section>
          <SectionHeader icon={BarChart3} title={`Who Employs Portland? — ${qcewEmployment[0].quarter}`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              {qcewEmployment[0].totalEmployment.toLocaleString()} private-sector employees across{" "}
              {qcewEmployment[0].industries.reduce((s, i) => s + i.establishments, 0).toLocaleString()} establishments.
              The wage gap is stark: Information workers earn {(() => {
                const sorted = [...qcewEmployment[0].industries].sort((a, b) => b.avgWage - a.avgWage);
                const highest = sorted[0];
                const lowest = sorted[sorted.length - 1];
                return `$${highest.avgWage.toLocaleString()}/wk (${highest.title}) while ${lowest.title} earns $${lowest.avgWage.toLocaleString()}/wk — a ${Math.round(highest.avgWage / lowest.avgWage)}:1 ratio`;
              })()}.
            </p>
            <div className="space-y-2">
              {qcewEmployment[0].industries.map((ind) => {
                const max = qcewEmployment[0].industries[0].employment;
                const pct = max > 0 ? (ind.employment / max) * 100 : 0;
                return (
                  <div key={ind.code}>
                    <div className="flex items-center justify-between text-[12px] mb-0.5">
                      <span className="text-[var(--color-ink-light)] truncate pr-2">{ind.title}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono text-[var(--color-ink)]">{ind.employment.toLocaleString()}</span>
                        <span className="text-[11px] font-mono text-[var(--color-ink-muted)] w-20 text-right">${ind.avgWage.toLocaleString()}/wk</span>
                      </div>
                    </div>
                    <div className="h-5 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 7. REAL VS NOMINAL WAGES ━━━ */}
      {realWageTrend && realWageTrend.length > 0 && (() => {
        const first = realWageTrend[0];
        const last = realWageTrend[realWageTrend.length - 1];
        const nomGrowth = Math.round(((last.nominalWage - first.nominalWage) / first.nominalWage) * 100);
        const realGrowth = Math.round(((last.realWage - first.realWage) / first.realWage) * 100);
        return (
          <section>
            <SectionHeader icon={DollarSign} title="Are Wages Keeping Up with Inflation?" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                Nominal wages grew {nomGrowth}% (${first.nominalWage.toLocaleString()} → ${last.nominalWage.toLocaleString()}/wk).
                But adjusted for Portland&apos;s 36.5% CPI increase,{" "}
                <strong>real wages {realGrowth > 0 ? `grew only ${realGrowth}%` : `fell ${Math.abs(realGrowth)}%`}</strong> — from
                ${first.realWage.toLocaleString()} to ${last.realWage.toLocaleString()} in 2016 dollars.
                Q4 spikes reflect year-end bonuses. This doesn&apos;t account for Portland&apos;s additional local taxes
                (BLT, SHS, PFA) which further reduce take-home pay.
              </p>
              <DualLineChart
                data={realWageTrend.map((d) => ({ quarter: d.quarter, nominal: d.nominalWage, real: d.realWage }))}
                xKey="quarter"
                line1Key="nominal"
                line2Key="real"
                line1Label="Nominal ($/wk)"
                line2Label="Real (2016 $, CPI-adjusted)"
                color1="#c8956c"
                color2="#3d7a5a"
                height={300}
                valuePrefix="$"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
                Source: BLS QCEW wages deflated by Portland-Salem CPI (CUURS49BSA0).
              </p>
            </div>
          </section>
        );
      })()}

      {/* ━━━ 8. UNEMPLOYMENT ━━━ */}
      {unemploymentTrend.length > 0 && (
        <section>
          <SectionHeader icon={Users} title="Unemployment Rate (Portland MSA)" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly unemployment for the Portland-Vancouver-Hillsboro metro area.
              Note: this covers the broader MSA (3 counties, 2 states), not just Multnomah County.
              The national rate is ~4.0% for comparison.
            </p>
            <TrendChart
              data={unemploymentTrend.map((d) => ({ date: d.month, value: d.rate }))}
              color={ACCENT}
              height={260}
              valueSuffix="%"
            />
          </div>
        </section>
      )}

      {/* ━━━ 9. DATA STILL NEEDED ━━━ */}
      <section className="space-y-4">
        <DataNeeded
          title="Commercial Vacancy by District"
          description="Office, retail, and industrial vacancy rates by submarket (downtown, inner east, outer east, industrial). Critical for understanding where the economy is weakest."
          actions={[{ label: "Requires brokerage subscription (CBRE, JLL)", type: "subscription" }]}
          color={ACCENT}
        />
        <DataNeeded
          title="New Business Registrations vs Closures"
          description="Monthly count of businesses opening AND closing. Our current Oregon SOS data only shows currently active businesses (survivorship bias). Need the full registry including dissolved/cancelled entities."
          actions={[{ label: "Request full Oregon SOS dataset including dissolved businesses", type: "download" }]}
          color={ACCENT}
        />
        <DataNeeded
          title="Downtown Foot Traffic"
          description="Pedestrian counts at key intersections. The single best measure of downtown vitality."
          actions={[{ label: "Placer.ai subscription ($2-5K/mo) or Clean & Safe partnership", type: "subscription" }]}
          color={ACCENT}
        />
      </section>

      {/* ━━━ 10. METHODOLOGY ━━━ */}
      <section>
        <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-6">
          <h3 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-3">
            Data Sources &amp; Methodology
          </h3>
          <div className="space-y-2 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
            <p>
              <strong>Primary:</strong> BLS Quarterly Census of Employment and Wages (QCEW), Multnomah County (FIPS 41051), private sector.
              Covers ~99.7% of wage and salary employment. Updated quarterly, ~6 month lag. The &ldquo;establishment&rdquo; count
              is the number of businesses filing quarterly unemployment insurance reports — the most reliable county-level business count.
            </p>
            <p>
              <strong>Wages:</strong> QCEW average weekly wage, deflated by Portland-Salem CPI (CUURS49BSA0, bimonthly) to compute real wages.
              The CPI adjustment uses the February reading of each year as the annual index.
            </p>
            <p>
              <strong>Unemployment:</strong> BLS LAUS, Portland-Vancouver-Hillsboro MSA, monthly, ~2 month lag. Covers Clackamas, Multnomah,
              Washington, and Clark (WA) counties.
            </p>
            <p>
              <strong>Industry changes:</strong> 3-digit NAICS codes, comparing 2023 Q3 (near the establishment peak) to the latest available
              quarter. Industries with fewer than 20 establishments are excluded. &ldquo;Since 2019&rdquo; comparisons use the same quarter
              in 2019 as the baseline.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
