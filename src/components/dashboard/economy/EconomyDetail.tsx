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
  MapPin,
} from "lucide-react";

const ACCENT = "#c8956c";

const SECTOR_DEFINITIONS: Record<string, string> = {
  "Trade, Transportation, and Utilities": "Retail, wholesale, warehousing, trucking",
  "Education and Health Services": "Hospitals, clinics, schools, social workers",
  "Professional and Business Services": "Tech, law, accounting, consulting, staffing",
  "Leisure and Hospitality": "Restaurants, hotels, bars, entertainment",
  "Construction": "Homebuilders, contractors, trades",
  "Manufacturing": "Factories, food processing, electronics",
  "Financial Activities": "Banks, insurance, real estate",
  "Information": "Software, media, telecom, data centers",
  "Other Services": "Repair shops, salons, nonprofits, religious orgs",
  "Natural Resources and Mining": "Farms, forestry, quarries",
};

// Map 3-digit NAICS codes to their parent supersector
const NAICS3_TO_SUPERSECTOR: Record<string, string> = {
  "236": "Construction", "237": "Construction", "238": "Construction",
  "311": "Manufacturing", "312": "Manufacturing", "313": "Manufacturing", "314": "Manufacturing",
  "315": "Manufacturing", "316": "Manufacturing", "321": "Manufacturing", "322": "Manufacturing",
  "323": "Manufacturing", "324": "Manufacturing", "325": "Manufacturing", "326": "Manufacturing",
  "327": "Manufacturing", "331": "Manufacturing", "332": "Manufacturing", "333": "Manufacturing",
  "334": "Manufacturing", "335": "Manufacturing", "336": "Manufacturing", "337": "Manufacturing", "339": "Manufacturing",
  "423": "Trade, Transportation, and Utilities", "424": "Trade, Transportation, and Utilities",
  "425": "Trade, Transportation, and Utilities", "441": "Trade, Transportation, and Utilities",
  "442": "Trade, Transportation, and Utilities", "443": "Trade, Transportation, and Utilities",
  "444": "Trade, Transportation, and Utilities", "445": "Trade, Transportation, and Utilities",
  "446": "Trade, Transportation, and Utilities", "447": "Trade, Transportation, and Utilities",
  "448": "Trade, Transportation, and Utilities", "451": "Trade, Transportation, and Utilities",
  "452": "Trade, Transportation, and Utilities", "453": "Trade, Transportation, and Utilities",
  "454": "Trade, Transportation, and Utilities", "481": "Trade, Transportation, and Utilities",
  "482": "Trade, Transportation, and Utilities", "483": "Trade, Transportation, and Utilities",
  "484": "Trade, Transportation, and Utilities", "485": "Trade, Transportation, and Utilities",
  "486": "Trade, Transportation, and Utilities", "487": "Trade, Transportation, and Utilities",
  "488": "Trade, Transportation, and Utilities", "491": "Trade, Transportation, and Utilities",
  "492": "Trade, Transportation, and Utilities", "493": "Trade, Transportation, and Utilities",
  "221": "Trade, Transportation, and Utilities",
  "511": "Information", "512": "Information", "515": "Information", "516": "Information", "517": "Information", "518": "Information", "519": "Information",
  "521": "Financial Activities", "522": "Financial Activities", "523": "Financial Activities",
  "524": "Financial Activities", "525": "Financial Activities", "531": "Financial Activities",
  "532": "Financial Activities", "533": "Financial Activities",
  "541": "Professional and Business Services", "551": "Professional and Business Services",
  "561": "Professional and Business Services", "562": "Professional and Business Services",
  "611": "Education and Health Services", "621": "Education and Health Services",
  "622": "Education and Health Services", "623": "Education and Health Services", "624": "Education and Health Services",
  "711": "Leisure and Hospitality", "712": "Leisure and Hospitality", "713": "Leisure and Hospitality",
  "721": "Leisure and Hospitality", "722": "Leisure and Hospitality",
  "811": "Other Services", "812": "Other Services", "813": "Other Services",
  "111": "Natural Resources and Mining", "112": "Natural Resources and Mining", "113": "Natural Resources and Mining",
  "114": "Natural Resources and Mining", "115": "Natural Resources and Mining", "211": "Natural Resources and Mining",
  "212": "Natural Resources and Mining", "213": "Natural Resources and Mining",
};

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
  neighborhoodEconomy?: {
    name: string;
    medianIncome: number | null;
    povertyRate: number | null;
    businessCount?: number;
    population?: number;
  }[];
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

  const { unemploymentTrend, qcewEmployment, qcewTrend, detailedIndustryChanges, since2019TopGrowers, realWageTrend, neighborhoodEconomy } = data;

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
                  <div key={ind.code} className="flex items-center gap-1 h-6" title={NAICS3_TO_SUPERSECTOR[ind.code] ? `${ind.title} (${NAICS3_TO_SUPERSECTOR[ind.code]})` : ind.title}>
                    <span className="text-[11px] text-[var(--color-ink-light)] w-44 flex-shrink-0 truncate text-right pr-2">
                      {ind.title}
                      {NAICS3_TO_SUPERSECTOR[ind.code] && (
                        <span className="text-[10px] text-[var(--color-ink-muted)]"> · {NAICS3_TO_SUPERSECTOR[ind.code].split(",")[0]}</span>
                      )}
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

      {/* ━━━ 5b. WHERE INEQUALITY SHOWS UP ━━━ */}
      {neighborhoodEconomy && neighborhoodEconomy.length > 0 ? (() => {
        const sorted = [...neighborhoodEconomy].filter((n) => n.medianIncome !== null);
        const top10 = sorted.slice(0, 10);
        const bottom10 = sorted.slice(-10).reverse();
        const maxIncome = Math.max(...sorted.map((n) => n.medianIncome!));
        const minIncome = Math.min(...sorted.map((n) => n.medianIncome!));
        const ratio = minIncome > 0 ? Math.round(maxIncome / minIncome * 10) / 10 : 0;
        const hasBizData = sorted.some((n) => n.businessCount != null && n.population != null);

        return (
          <section>
            <SectionHeader icon={MapPin} title="Where Inequality Shows Up" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                Median household income ranges from <strong>${maxIncome.toLocaleString()}</strong> ({top10[0]?.name}) to{" "}
                <strong>${minIncome.toLocaleString()}</strong> ({bottom10[0]?.name})
                {ratio > 0 ? ` — a ${ratio}:1 ratio` : ""}.
                These are neighborhood-level averages from Census tract data; actual variation within neighborhoods can be significant.
              </p>

              <p className="text-[12px] text-[var(--color-ink-muted)] mb-2 font-semibold">Highest income neighborhoods</p>
              <div className="space-y-1 mb-4">
                {top10.map((n) => {
                  const pct = maxIncome > 0 ? (n.medianIncome! / maxIncome) * 100 : 0;
                  return (
                    <div key={n.name} className="flex items-center gap-1 h-5">
                      <span className="text-[11px] text-[var(--color-ink-light)] w-36 flex-shrink-0 truncate text-right pr-2">{n.name}</span>
                      <div className="flex-1 h-4 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm bg-[#3d7a5a]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--color-ink)] w-16 text-right flex-shrink-0">${n.medianIncome!.toLocaleString()}</span>
                      {n.povertyRate !== null && (
                        <span className="text-[10px] text-[var(--color-ink-muted)] w-12 text-right flex-shrink-0">{n.povertyRate}% pov</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[12px] text-[var(--color-ink-muted)] mb-2 font-semibold">Lowest income neighborhoods</p>
              <div className="space-y-1 mb-4">
                {bottom10.map((n) => {
                  const pct = maxIncome > 0 ? (n.medianIncome! / maxIncome) * 100 : 0;
                  return (
                    <div key={n.name} className="flex items-center gap-1 h-5">
                      <span className="text-[11px] text-[var(--color-ink-light)] w-36 flex-shrink-0 truncate text-right pr-2">{n.name}</span>
                      <div className="flex-1 h-4 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm bg-[#b85c3a]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--color-ink)] w-16 text-right flex-shrink-0">${n.medianIncome!.toLocaleString()}</span>
                      {n.povertyRate !== null && (
                        <span className="text-[10px] text-[var(--color-ink-muted)] w-12 text-right flex-shrink-0">{n.povertyRate}% pov</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasBizData && (
                <>
                  <p className="text-[12px] text-[var(--color-ink-muted)] mb-2 font-semibold mt-5">Businesses per 1,000 residents</p>
                  <div className="space-y-1">
                    {sorted
                      .filter((n) => n.businessCount != null && n.population != null && n.population! > 0)
                      .map((n) => ({ ...n, bizPer1k: Math.round((n.businessCount! / n.population!) * 1000 * 10) / 10 }))
                      .sort((a, b) => b.bizPer1k - a.bizPer1k)
                      .slice(0, 15)
                      .map((n) => {
                        const maxBiz = sorted
                          .filter((s) => s.businessCount != null && s.population != null && s.population! > 0)
                          .reduce((max, s) => Math.max(max, (s.businessCount! / s.population!) * 1000), 0);
                        const pct = maxBiz > 0 ? (n.bizPer1k / maxBiz) * 100 : 0;
                        return (
                          <div key={n.name} className="flex items-center gap-1 h-5">
                            <span className="text-[11px] text-[var(--color-ink-light)] w-36 flex-shrink-0 truncate text-right pr-2">{n.name}</span>
                            <div className="flex-1 h-4 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                              <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
                            </div>
                            <span className="text-[11px] font-mono text-[var(--color-ink)] w-12 text-right flex-shrink-0">{n.bizPer1k}</span>
                          </div>
                        );
                      })}
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
                    Source: Portland BLT business registrations (active) · Neighborhood population estimates
                  </p>
                </>
              )}

              <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
                Source: Census ACS 5-year estimates, spatially joined to Portland neighborhood boundaries.
              </p>
            </div>
          </section>
        );
      })() : (
        <section>
          <DataNeeded
            title="Neighborhood Economic Inequality"
            description="Median income and poverty rates by neighborhood. Requires Census tract-level demographics spatially joined to Portland neighborhoods. This would show where economic distress concentrates — the aggregate county numbers mask enormous variation."
            actions={[{ label: "Load Census ACS tract-level demographics with PostGIS spatial join", type: "download" }]}
            color={ACCENT}
          />
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
                      <div className="truncate pr-2">
                        <span className="text-[var(--color-ink-light)]">{ind.title}</span>
                        {SECTOR_DEFINITIONS[ind.title] && (
                          <span className="text-[11px] text-[var(--color-ink-muted)] ml-1.5">— {SECTOR_DEFINITIONS[ind.title]}</span>
                        )}
                      </div>
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
