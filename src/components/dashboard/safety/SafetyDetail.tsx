"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import MultiLineChart from "@/components/charts/MultiLineChart";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
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
  neighborhoodCrime: {
    highest: { name: string; total: number; property: number; person: number; society: number }[];
    lowest: { name: string; total: number; property: number; person: number; society: number }[];
  };
  mvtTrend: { month: string; count: number }[];
  mvtInsight: {
    peakYear: number;
    peakMonthlyAvg: number;
    prePandemicYear: number;
    prePandemicTotal: number;
    latestFullYear: number;
    latestFullYearTotal: number;
    pctFromPeak: number;
    pctVsPrePandemic: number;
  } | null;
  graffitiTrend: { month: string; count: number }[] | null;
  boec911: {
    latest: {
      month: string;
      monthLabel: string;
      total911Calls: number | null;
      pctAnswered15Sec: number;
      pctAnswered20Sec: number | null;
      avgWaitSeconds: number;
      authorizedFte: number | null;
      seniorDispatchers: number | null;
      vacancies: number | null;
      source: string | null;
    } | null;
    trend: {
      month: string;
      monthLabel: string;
      pctAnswered15Sec: number;
      pctAnswered20Sec: number | null;
      avgWaitSeconds: number;
    }[];
  };
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

const CRIME_COLORS = {
  property: "#c8956c",
  person: "#b85c3a",
  society: "#7c6f9e",
};

function StackedNeighborhoodBars({
  items,
  maxVal,
}: {
  items: { name: string; total: number; property: number; person: number; society: number }[];
  maxVal: number;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const totalPct = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
        const propPct = item.total > 0 ? (item.property / item.total) * totalPct : 0;
        const persPct = item.total > 0 ? (item.person / item.total) * totalPct : 0;
        const socPct = item.total > 0 ? (item.society / item.total) * totalPct : 0;
        return (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[13px] text-[var(--color-ink-light)] w-[140px] text-right flex-shrink-0 truncate" title={item.name}>
              {item.name}
            </span>
            <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden flex">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${propPct}%`, backgroundColor: CRIME_COLORS.property }}
                title={`Property: ${item.property.toLocaleString()}`}
              />
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${persPct}%`, backgroundColor: CRIME_COLORS.person }}
                title={`Person: ${item.person.toLocaleString()}`}
              />
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${socPct}%`, backgroundColor: CRIME_COLORS.society }}
                title={`Society: ${item.society.toLocaleString()}`}
              />
            </div>
            <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[70px] text-right">
              {item.total.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SafetyDetail() {
  const [data, setData] = useState<SafetyDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/safety/detail", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      controller.abort();
    };
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
    neighborhoodCrime,
    mvtTrend,
    mvtInsight,
    graffitiTrend,
    boec911,
    topInsights,
    totalRecords,
  } = data;

  const downtownScorecard: { category: string; ytdCurrent: number; ytdPrior: number; changePct: number }[] =
    (data as any).downtownScorecard ?? [];
  const downtownPeriodLabel: string = (data as any).downtownPeriodLabel ?? "";
  const boecLatest = boec911?.latest ?? null;
  const boecTrend = boec911?.trend ?? [];
  const firstBoecPoint = boecTrend[0] ?? null;

  // Prepare 10-year trend chart data with readable date labels
  const trendChartData = crimeByCategory.map((r) => ({
    month: r.month, // Keep raw YYYY-MM for Recharts
    property: r.property,
    person: r.person,
    society: r.society,
  }));

  // MVT chart data
  const mvtChartData = mvtTrend.map((r) => ({
    date: r.month, // Keep raw YYYY-MM
    value: r.count,
  }));

  // Graffiti chart data
  const graffitiChartData = graffitiTrend
    ? graffitiTrend.map((r) => ({ date: r.month, value: r.count }))
    : [];

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="safety" />

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

      {/* 2b. Downtown Safety Scorecard */}
      {downtownScorecard.length > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Downtown Safety Scorecard" color="#2d4a6e" />
          <p className="text-[14px] text-[var(--color-ink-muted)] mb-4 -mt-2">
            Year-to-date comparison for Downtown, Old Town/Chinatown, and Pearl District.
            <span className="ml-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60">
              {downtownPeriodLabel}
            </span>
          </p>
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[var(--color-parchment)]">
                  <th className="text-left px-5 py-3 text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    Category
                  </th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    Last Year
                  </th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    This Year
                  </th>
                  <th className="text-right px-5 py-3 text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {downtownScorecard.map((row, i) => {
                  const isDown = row.changePct < 0;
                  const isUp = row.changePct > 0;
                  return (
                    <tr
                      key={i}
                      className="border-b border-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)]/15 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-[var(--color-ink)]">
                        {row.category}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)]">
                        {row.ytdPrior.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-[var(--color-ink)]">
                        {row.ytdCurrent.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-semibold text-[13px] px-2 py-0.5 rounded-sm ${
                            isDown
                              ? "text-[#3d7a5a] bg-[#3d7a5a]/10"
                              : isUp
                                ? "text-[#b85c3a] bg-[#b85c3a]/10"
                                : "text-[var(--color-ink-muted)]"
                          }`}
                        >
                          {isDown ? "\u2193" : isUp ? "\u2191" : "\u2014"}{" "}
                          {Math.abs(row.changePct)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://public.tableau.com/app/profile/portlandpolicebureau/viz/PPBOpenDataDownloads" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Portland Police Bureau &middot; NIBRS Offense Data</a>
          </p>
        </section>
      )}

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
            <p className="text-[11px] text-[var(--color-ink-muted)]/70 mt-3 leading-relaxed">
              <strong>Property</strong> = theft, burglary, vandalism, arson &nbsp;·&nbsp;{" "}
              <strong>Person</strong> = assault, robbery, homicide, sex offenses &nbsp;·&nbsp;{" "}
              <strong>Society</strong> = drug offenses, weapons, prostitution, gambling (FBI NIBRS categories)
            </p>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://public.tableau.com/app/profile/portlandpolicebureau/viz/PPBOpenDataDownloads" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Portland Police Bureau &middot; NIBRS Offense Data</a>
          </p>
        </section>
      )}

      {/* 4. Top Offense Categories — HTML bars */}
      {topOffenseCategories.length > 0 && (
        <section>
          <SectionHeader icon={Shield} title={`Top Offense Categories (${new Date().getFullYear()})`} color="#b85c3a" />
          <HorizontalBars items={topOffenseCategories} color="#b85c3a" />
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://public.tableau.com/app/profile/portlandpolicebureau/viz/PPBOpenDataDownloads" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Portland Police Bureau &middot; NIBRS Offense Data</a>
          </p>
        </section>
      )}

      {/* 5. Motor Vehicle Theft Spotlight */}
      {mvtTrend.length > 0 && (
        <section>
          <SectionHeader icon={Car} title="Motor Vehicle Theft Spotlight" color="#d97706" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            {mvtInsight ? (
              <>
                <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                  Motor vehicle theft peaked at ~{mvtInsight.peakMonthlyAvg.toLocaleString()}/month in {mvtInsight.peakYear} — down {mvtInsight.pctFromPeak}% from peak
                  {mvtInsight.pctVsPrePandemic <= 0
                    ? ` and now ${Math.abs(mvtInsight.pctVsPrePandemic)}% below pre-pandemic (${mvtInsight.prePandemicYear}) levels.`
                    : ` but still ${mvtInsight.pctVsPrePandemic}% above pre-pandemic (${mvtInsight.prePandemicYear}) levels.`}
                </p>
                {mvtInsight.pctVsPrePandemic <= 0 && (
                  <div className="bg-[#3d7a5a]/10 border border-[#3d7a5a]/20 rounded-sm px-4 py-3 mb-4">
                    <p className="text-[13px] text-[#3d7a5a] font-medium">
                      Progress: {mvtInsight.latestFullYear} motor vehicle thefts ({mvtInsight.latestFullYearTotal.toLocaleString()}) are now below {mvtInsight.prePandemicYear} levels ({mvtInsight.prePandemicTotal.toLocaleString()}).
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                Motor vehicle theft trend since 2016.
              </p>
            )}
            <TrendChart data={mvtChartData} color="#d97706" height={280} />
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://public.tableau.com/app/profile/portlandpolicebureau/viz/PPBOpenDataDownloads" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Portland Police Bureau &middot; NIBRS Offense Data</a>
          </p>
        </section>
      )}

      {/* 6. Neighborhoods by Crime Type — highest and lowest */}
      {(neighborhoodCrime.highest.length > 0 || neighborhoodCrime.lowest.length > 0) && (
        <section>
          <SectionHeader icon={MapPin} title="Neighborhoods by Crime Type (Last 12 Months)" color="#4a7f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 space-y-8">
            {/* Caveat */}
            <p className="text-[11px] text-[var(--color-ink-muted)]/70 leading-relaxed">
              Raw crime counts — not adjusted for population. Larger neighborhoods with more residents, businesses, and foot traffic will naturally show higher counts. Neighborhoods with fewer than 50 reported crimes are excluded.
            </p>
            {/* Legend */}
            <div className="flex items-center gap-5 text-[12px] text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CRIME_COLORS.property }} />
                Property
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CRIME_COLORS.person }} />
                Person
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CRIME_COLORS.society }} />
                Society
              </span>
            </div>

            {/* Highest crime neighborhoods */}
            {neighborhoodCrime.highest.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                  Highest Crime
                </h3>
                <StackedNeighborhoodBars
                  items={neighborhoodCrime.highest}
                  maxVal={neighborhoodCrime.highest[0]?.total ?? 1}
                />
              </div>
            )}

            {/* Lowest crime neighborhoods */}
            {neighborhoodCrime.lowest.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                  Lowest Crime
                </h3>
                <StackedNeighborhoodBars
                  items={neighborhoodCrime.lowest}
                  maxVal={neighborhoodCrime.highest[0]?.total ?? 1}
                />
              </div>
            )}
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://public.tableau.com/app/profile/portlandpolicebureau/viz/PPBOpenDataDownloads" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Portland Police Bureau &middot; NIBRS Offense Data</a>
          </p>
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
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: Portland BPS &middot; Graffiti Reports
          </p>
        </section>
      )}

      {/* 8. 911 Response — BOEC Director Report data */}
      <section>
        <SectionHeader icon={Shield} title="911 Call Answering Performance (BOEC Data)" color="#4a7f9e" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          {boecLatest ? (
            <>
              <p className="text-[14px] text-[var(--color-ink-muted)] mb-2">
                Latest BOEC Director&apos;s Report point: {boecLatest.monthLabel}. NENA standards are 90% answered within 15 seconds and 95% within 20 seconds.
              </p>
              <p className="text-[12px] text-[var(--color-ink-muted)]/70 mb-5 font-mono">
                Latest result: {boecLatest.pctAnswered15Sec}% within 15 seconds
                {boecLatest.pctAnswered20Sec ? `, ${boecLatest.pctAnswered20Sec}% within 20 seconds` : ""}, average wait {boecLatest.avgWaitSeconds}s.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-[var(--color-canopy)] rounded-sm p-4 text-white text-center">
                  <p className="text-[28px] font-mono font-bold">{boecLatest.pctAnswered15Sec}%</p>
                  <p className="text-[11px] text-white/70 mt-1">Answered within 15s</p>
                  <p className="text-[10px] text-[var(--color-ember)] mt-0.5">Target: 90%</p>
                </div>
                <div className="bg-[var(--color-parchment)]/40 rounded-sm p-4 text-center">
                  <p className="text-[28px] font-mono font-bold text-[var(--color-ink)]">{boecLatest.avgWaitSeconds}s</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">Avg wait time</p>
                  {firstBoecPoint && (
                    <p className="text-[10px] text-[#3d7a5a] mt-0.5">
                      {boecLatest.avgWaitSeconds < firstBoecPoint.avgWaitSeconds
                        ? `Improved from ${firstBoecPoint.avgWaitSeconds}s`
                        : `Was ${firstBoecPoint.avgWaitSeconds}s at start`}
                    </p>
                  )}
                </div>
                <div className="bg-[var(--color-parchment)]/40 rounded-sm p-4 text-center">
                  <p className="text-[28px] font-mono font-bold text-[var(--color-ink)]">
                    {boecLatest.total911Calls ? boecLatest.total911Calls.toLocaleString() : "—"}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">911 calls ({boecLatest.monthLabel})</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Caller disconnects included</p>
                </div>
                <div className="bg-[var(--color-parchment)]/40 rounded-sm p-4 text-center">
                  <p className="text-[28px] font-mono font-bold text-[var(--color-ink)]">
                    {boecLatest.seniorDispatchers ?? "—"}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">Senior dispatchers</p>
                  <p className="text-[10px] text-[#b85c3a] mt-0.5">
                    {boecLatest.vacancies ? `${boecLatest.vacancies} vacancies` : "Vacancies not published"}
                  </p>
                </div>
              </div>

              {boecTrend.length > 0 && (
                <div className="space-y-2">
                  {boecTrend.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[12px] text-[var(--color-ink-muted)] w-[80px] text-right">{d.monthLabel}</span>
                      <div className="flex-1 h-6 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${Math.min(d.pctAnswered15Sec, 100)}%`,
                            backgroundColor:
                              d.pctAnswered15Sec >= 90
                                ? "#3d7a5a"
                                : d.pctAnswered15Sec >= 70
                                  ? "#c8956c"
                                  : "#b85c3a",
                          }}
                        />
                        <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-[#b85c3a]/40" style={{ left: "90%" }} />
                      </div>
                      <span className="text-[12px] font-mono font-semibold w-[42px] text-right">{d.pctAnswered15Sec}%</span>
                      <span className="text-[11px] font-mono text-[var(--color-ink-muted)] w-[40px] text-right">{d.avgWaitSeconds}s</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-ink-muted)]">
                <span>Bar = % answered within 15 seconds</span>
                <span>Dashed line = 90% NENA standard</span>
                <span>Right column = avg wait (seconds)</span>
              </div>
            </>
          ) : (
            <DataNeeded
              title="BOEC 911 answer-time data unavailable"
              description="The dashboard expects monthly BOEC Director's Report data for answer-time trend, call volume, and dispatcher staffing."
              color="#4a7f9e"
              actions={[
                {
                  label: "Load safety.boec_911_monthly from the latest BOEC Director's Report.",
                  href: "https://www.portland.gov/911/documents",
                  type: "download",
                },
              ]}
            />
          )}

          <div className="mt-4 pt-3 border-t border-[var(--color-parchment)]">
            <p className="text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
              Source: <a href="https://www.portland.gov/911/documents" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Bureau of Emergency Communications &middot; Director&apos;s Reports</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
