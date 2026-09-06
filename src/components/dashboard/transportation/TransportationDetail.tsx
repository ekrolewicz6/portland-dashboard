"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import MultiLineChart from "@/components/charts/MultiLineChart";
import StackedAreaChart from "@/components/charts/StackedAreaChart";
import DataNeeded from "../DataNeeded";
import NewsContext from "../NewsContext";
import {
  Bus,
  MapPin,
  Car,
  Train,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────

interface RouteByType {
  type: string;
  count: number;
}

interface SampleRoute {
  routeName: string;
  routeType: string;
  routeColor: string;
}

interface RidershipYear {
  fiscalYear: number;
  bus: number;
  maxRail: number;
  wes: number;
  streetcar: number;
  total: number;
}

interface CrashYear {
  year: number;
  fatalities: number;
  seriousInjuries: number;
  pedestrianFatalities: number;
  cyclistFatalities: number;
  motorcyclistFatalities: number;
  vehicleOccupantFatalities: number;
  totalReportedCrashes: number;
  source: string;
}

interface CommuteModeYear {
  year: number;
  droveAlone: number;
  carpooled: number;
  transit: number;
  bicycle: number;
  walked: number;
  wfh: number;
  droveAlonePct: number;
  carpooledPct: number;
  transitPct: number;
  bicyclePct: number;
  walkedPct: number;
  wfhPct: number;
}

interface TransportationDetailData {
  dataStatus: string;
  dataAvailable: boolean;
  routesByType: RouteByType[];
  sampleRoutes: SampleRoute[];
  totalRoutes: number;
  totalStops: number;
  ridershipTrend: RidershipYear[];
  crashTrend: CrashYear[];
  commuteModeTrend: CommuteModeYear[];
  ridershipRecovery: {
    prePandemic: number;
    lowest: number;
    latest: number;
    recoveryPct: number;
  } | null;
  visionZeroSummary: {
    visionZeroAdopted: number;
    latestYear: number;
    latestFatalities: number;
    peakYear: number;
    peakFatalities: number;
    changeFromPeak: number;
  } | null;
}

// ── Constants ─────────────────────────────────────────────────────────

const COLOR = "#4a7f9e";
const COLOR_BUS = "#4a7f9e";
const COLOR_MAX = "#3d7a5a";
const COLOR_WES = "#7c6f9e";
const COLOR_STREETCAR = "#c8956c";
const COLOR_CRASH = "#b85c3a";
const COLOR_COMMUTE = "#3d7a5a";

// ── Helpers ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: color ?? COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function millions(n: number): string {
  return (n / 1_000_000).toFixed(1) + "M";
}

// ── Component ─────────────────────────────────────────────────────────

export default function TransportationDetail() {
  const [data, setData] = useState<TransportationDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/transportation/detail", { signal: controller.signal })
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
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-parchment)]/50 rounded-sm h-48"
          />
        ))}
      </div>
    );
  }

  if (!data || !data.dataAvailable) {
    return (
      <div className="space-y-8">
        <p className="text-[var(--color-ink-muted)] text-[14px]">
          Unable to load transportation detail data.
        </p>
      </div>
    );
  }

  const {
    routesByType,
    sampleRoutes,
    totalRoutes,
    totalStops,
    ridershipTrend,
    crashTrend,
    commuteModeTrend,
    ridershipRecovery,
    visionZeroSummary,
  } = data;

  // ── Derived data ────────────────────────────────────────────────────

  const latestRidership =
    ridershipTrend.length > 0
      ? ridershipTrend[ridershipTrend.length - 1]
      : null;

  // Exclude partial year (2025) from crash stats
  const fullYearCrashes = crashTrend.filter(
    (c) => !c.source.includes("partial")
  );
  const latestCrash =
    fullYearCrashes.length > 0
      ? fullYearCrashes[fullYearCrashes.length - 1]
      : null;

  const latestCommute =
    commuteModeTrend.length > 0
      ? commuteModeTrend[commuteModeTrend.length - 1]
      : null;

  // Ridership chart data (stacked area)
  const ridershipChartData = ridershipTrend.map((r) => ({
    year: `FY${String(r.fiscalYear).slice(2)}`,
    Bus: r.bus,
    "MAX Light Rail": r.maxRail,
    Streetcar: r.streetcar,
    WES: r.wes,
  }));

  // Total ridership trend line
  const totalRidershipChartData = ridershipTrend.map((r) => ({
    date: `FY${String(r.fiscalYear).slice(2)}`,
    value: r.total,
  }));

  // Crash fatality trend
  const crashChartData = fullYearCrashes.map((c) => ({
    year: String(c.year),
    fatalities: c.fatalities,
    seriousInjuries: c.seriousInjuries,
  }));

  // Fatality breakdown by mode
  const fatalityBreakdown =
    latestCrash != null
      ? [
          {
            name: "Pedestrian",
            value: latestCrash.pedestrianFatalities,
            color: "#b85c3a",
          },
          {
            name: "Vehicle Occupant",
            value: latestCrash.vehicleOccupantFatalities,
            color: "#4a7f9e",
          },
          {
            name: "Motorcyclist",
            value: latestCrash.motorcyclistFatalities,
            color: "#7c6f9e",
          },
          {
            name: "Cyclist",
            value: latestCrash.cyclistFatalities,
            color: "#c8956c",
          },
        ]
      : [];

  // Commute mode chart data (multi-line percentages)
  const commuteChartData = commuteModeTrend.map((c) => ({
    year: String(c.year),
    "Drove Alone": c.droveAlonePct,
    "Work From Home": c.wfhPct,
    "Public Transit": c.transitPct,
    Bicycle: c.bicyclePct,
    Walked: c.walkedPct,
  }));

  // ── Key findings ────────────────────────────────────────────────────

  const insights: string[] = [];

  if (latestRidership && ridershipRecovery) {
    insights.push(
      `FY${latestRidership.fiscalYear} total transit boardings reached ${millions(latestRidership.total)}, ` +
        `recovering to ${ridershipRecovery.recoveryPct}% of pre-pandemic (FY2019) levels.`
    );
  }

  if (latestRidership) {
    const busShare = Math.round(
      (latestRidership.bus / latestRidership.total) * 100
    );
    const maxShare = Math.round(
      (latestRidership.maxRail / latestRidership.total) * 100
    );
    insights.push(
      `Bus accounts for ${busShare}% of all boardings, MAX light rail ${maxShare}%. ` +
        `WES commuter rail and Streetcar together represent less than 5%.`
    );
  }

  if (visionZeroSummary) {
    const direction =
      visionZeroSummary.latestFatalities > 39 ? "above" : "at or below";
    insights.push(
      `Portland adopted Vision Zero in ${visionZeroSummary.visionZeroAdopted}, targeting zero traffic deaths by 2025. ` +
        `In ${visionZeroSummary.latestYear}, ${visionZeroSummary.latestFatalities} people were killed — ` +
        `${direction} the 39 deaths recorded in the adoption year.`
    );
  }

  if (latestCrash) {
    const pedShare = Math.round(
      (latestCrash.pedestrianFatalities / latestCrash.fatalities) * 100
    );
    insights.push(
      `Pedestrians account for ${pedShare}% of traffic fatalities despite making up a small fraction of road users. ` +
        `The City Auditor found 70% of fatal crashes occur in low-light conditions.`
    );
  }

  if (latestCommute) {
    const pre2019 = commuteModeTrend.find((c) => c.year === 2019);
    if (pre2019) {
      const wfhChange = (latestCommute.wfhPct - pre2019.wfhPct).toFixed(1);
      const transitChange = (
        latestCommute.transitPct - pre2019.transitPct
      ).toFixed(1);
      insights.push(
        `Since 2019, work-from-home share surged from ${pre2019.wfhPct}% to ${latestCommute.wfhPct}% (+${wfhChange}pp). ` +
          `Transit commuting fell from ${pre2019.transitPct}% to ${latestCommute.transitPct}% (${transitChange}pp).`
      );
    }
  }

  // Route type breakdown bars
  const maxRouteCount =
    routesByType.length > 0 ? Math.max(...routesByType.map((r) => r.count)) : 1;

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="transportation" />

      {/* 1. Key Findings */}
      {insights.length > 0 && (
        <section>
          <SectionHeader icon={Lightbulb} title="Key Findings" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] font-mono font-semibold text-[#3d7a5a] bg-[#3d7a5a]/10 px-2 py-0.5 rounded-sm">
                LIVE
              </span>
              <span className="text-[12px] text-[var(--color-ink-muted)]">
                TriMet ridership, PBOT crash data, Census ACS commute data
              </span>
            </div>
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
                >
                  <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-river)]" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 2. Hero Stats */}
      <section>
        <SectionHeader icon={Bus} title="Key Metrics" />
        <StatGrid
          accentColor={COLOR}
          stats={[
            ...(latestRidership
              ? [
                  {
                    label: `FY${latestRidership.fiscalYear} Boardings`,
                    value: millions(latestRidership.total),
                    subtitle: ridershipRecovery
                      ? `${ridershipRecovery.recoveryPct}% of FY2019`
                      : undefined,
                  },
                ]
              : []),
            ...(totalRoutes > 0
              ? [
                  {
                    label: "TriMet Routes",
                    value: totalRoutes,
                    subtitle: `${totalStops.toLocaleString()} stops`,
                  },
                ]
              : []),
            ...(latestCrash
              ? [
                  {
                    label: `${latestCrash.year} Traffic Deaths`,
                    value: latestCrash.fatalities,
                    subtitle: `${latestCrash.seriousInjuries} serious injuries`,
                  },
                ]
              : []),
            ...(latestCommute
              ? [
                  {
                    label: `${latestCommute.year} Transit Share`,
                    value: `${latestCommute.transitPct}`,
                    suffix: "%",
                    subtitle: `${latestCommute.wfhPct}% WFH`,
                  },
                ]
              : []),
          ]}
        />
      </section>

      {/* 3. Ridership Trend */}
      {ridershipTrend.length > 0 && (
        <section>
          <SectionHeader
            icon={Train}
            title="Transit Ridership (FY2006-FY2025)"
            color={COLOR_BUS}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Annual boardings across all TriMet and Portland Streetcar services.
              Ridership cratered during the pandemic and has been slowly
              recovering.
            </p>
            <StackedAreaChart
              data={ridershipChartData}
              areas={[
                { key: "Bus", label: "Bus", color: COLOR_BUS },
                {
                  key: "MAX Light Rail",
                  label: "MAX Light Rail",
                  color: COLOR_MAX,
                },
                { key: "Streetcar", label: "Streetcar", color: COLOR_STREETCAR },
                { key: "WES", label: "WES Commuter Rail", color: COLOR_WES },
              ]}
              xKey="year"
              height={340}
            />
            {ridershipRecovery && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                    Pre-Pandemic (FY2019)
                  </p>
                  <p className="text-[20px] font-mono font-semibold text-[var(--color-ink)]">
                    {millions(ridershipRecovery.prePandemic)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                    Pandemic Low
                  </p>
                  <p className="text-[20px] font-mono font-semibold text-red-700">
                    {millions(ridershipRecovery.lowest)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                    Latest
                  </p>
                  <p className="text-[20px] font-mono font-semibold text-[var(--color-ink)]">
                    {millions(ridershipRecovery.latest)}
                    <span className="text-[13px] text-[var(--color-ink-muted)] ml-1">
                      ({ridershipRecovery.recoveryPct}%)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://datahub.transportation.gov/resource/8bui-9xvu" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">TriMet &middot; National Transit Database</a>
          </p>
        </section>
      )}

      {/* 4. Vision Zero — Crash Fatality Trend */}
      {fullYearCrashes.length > 0 && (
        <section>
          <SectionHeader
            icon={AlertTriangle}
            title="Vision Zero: Traffic Fatalities"
            color={COLOR_CRASH}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Portland adopted Vision Zero in 2015, pledging to eliminate traffic
              deaths by 2025. Instead, fatalities rose sharply. The City Auditor
              found speed cameras were never installed and 70% of fatal crashes
              occur in low-light conditions.
            </p>
            <MultiLineChart
              data={crashChartData}
              lines={[
                {
                  key: "fatalities",
                  label: "Fatalities",
                  color: COLOR_CRASH,
                },
                {
                  key: "seriousInjuries",
                  label: "Serious Injuries",
                  color: "#7c6f9e",
                },
              ]}
              xKey="year"
              height={300}
              referenceLines={[
                {
                  y: 0,
                  label: "Vision Zero Goal",
                  color: "#3d7a5a",
                },
              ]}
            />

            {/* Fatality breakdown by mode */}
            {fatalityBreakdown.length > 0 && latestCrash && (
              <div className="mt-6">
                <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-3">
                  {latestCrash.year} Fatalities by Road User Type
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {fatalityBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-4 text-center"
                    >
                      <p className="text-[24px] font-mono font-semibold text-[var(--color-ink)]">
                        {item.value}
                      </p>
                      <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--color-ink-muted)]">
                        {latestCrash.fatalities > 0
                          ? Math.round(
                              (item.value / latestCrash.fatalities) * 100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visionZeroSummary && (
              <p className="text-[13px] text-[var(--color-ink-muted)] mt-4 leading-relaxed">
                Fatalities peaked at{" "}
                <strong>{visionZeroSummary.peakFatalities}</strong> in{" "}
                {visionZeroSummary.peakYear}.{" "}
                {visionZeroSummary.latestYear} saw{" "}
                <strong>{visionZeroSummary.latestFatalities}</strong> deaths
                ({visionZeroSummary.changeFromPeak > 0 ? "+" : ""}
                {visionZeroSummary.changeFromPeak}% from peak). Portland
                typically sees 10,000-12,000 reported crashes per year.
              </p>
            )}
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://services.arcgis.com/gfpXnknjcY6QHKhU/arcgis/rest/services/Crash_ODOT/FeatureServer" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">ODOT &middot; Crash Data</a>
          </p>
        </section>
      )}

      {/* 5. Commute Mode Share */}
      {commuteModeTrend.length > 0 && (
        <section>
          <SectionHeader
            icon={Car}
            title="How Portlanders Get to Work"
            color={COLOR_COMMUTE}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Census ACS 1-year estimates for Portland city. The pandemic
              permanently shifted commute patterns: work-from-home surged from
              ~9% to ~26%, while transit dropped from ~13% to ~6%.
            </p>
            <MultiLineChart
              data={commuteChartData}
              lines={[
                {
                  key: "Drove Alone",
                  label: "Drove Alone",
                  color: "#64748b",
                },
                {
                  key: "Work From Home",
                  label: "Work From Home",
                  color: "#3d7a5a",
                },
                {
                  key: "Public Transit",
                  label: "Public Transit",
                  color: COLOR_BUS,
                },
                { key: "Bicycle", label: "Bicycle", color: COLOR_STREETCAR },
                { key: "Walked", label: "Walked", color: COLOR_WES },
              ]}
              xKey="year"
              height={320}
              valueSuffix="%"
            />

            {/* Commute mode table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Drive Alone</th>
                    <th className="py-2 pr-4">Transit</th>
                    <th className="py-2 pr-4">WFH</th>
                    <th className="py-2 pr-4">Bicycle</th>
                    <th className="py-2 pr-4">Walk</th>
                    <th className="py-2 pr-4">Carpool</th>
                  </tr>
                </thead>
                <tbody>
                  {commuteModeTrend.map((row) => (
                    <tr
                      key={row.year}
                      className="border-t border-[var(--color-parchment)]/60"
                    >
                      <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-ink)]">
                        {row.year}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.droveAlonePct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.transitPct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.wfhPct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.bicyclePct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.walkedPct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.carpooledPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://data.census.gov/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">U.S. Census Bureau &middot; ACS Table B08301</a>
          </p>
        </section>
      )}

      {/* 6. Routes by Type */}
      {routesByType.length > 0 && (
        <section>
          <SectionHeader icon={Bus} title="TriMet Routes by Type" color={COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-3">
              {routesByType.map((rt, i) => {
                const pct = Math.round((rt.count / maxRouteCount) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[13px] text-[var(--color-ink-light)] w-[120px] text-right flex-shrink-0">
                      {rt.type}
                    </span>
                    <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLOR,
                          opacity:
                            0.7 + 0.3 * (1 - i / routesByType.length),
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[60px] text-right">
                      {rt.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Rail & Streetcar Lines */}
      {sampleRoutes.length > 0 && (
        <section>
          <SectionHeader
            icon={Train}
            title="Rail & Streetcar Lines"
            color={COLOR}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleRoutes.map((route, i) => (
              <div
                key={i}
                className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 flex items-center gap-3"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: route.routeColor
                      ? `#${route.routeColor}`
                      : COLOR,
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate">
                    {route.routeName}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">
                    {route.routeType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Stop Coverage */}
      {totalStops > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Stop Coverage" color={COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              TriMet operates{" "}
              <strong>{totalStops.toLocaleString()}</strong> stops across the
              Portland metro area, serving {totalRoutes} routes. This includes
              bus stops, MAX light rail stations, WES commuter rail stations,
              and Portland Streetcar stops.
            </p>
          </div>
        </section>
      )}

      {/* 9. Data still needed */}
      <DataNeeded
        title="Bike lane miles and infrastructure"
        description="PBOT bike plan data tracks protected, buffered, and standard bike lane miles built against the city's bicycle network goals. This data would show whether Portland is building the safe cycling infrastructure it has promised."
        actions={[
          {
            label: "Download PBOT bike plan and infrastructure data",
            type: "download",
            href: "https://www.portland.gov/transportation/planning/bicycle-plan-for-2030",
          },
        ]}
        color={COLOR}
      />

      <DataNeeded
        title="Bridge traffic counts"
        description="Portland's Willamette River bridges carry most cross-city traffic. PBOT and ODOT publish annual traffic counts by bridge that would show whether commute patterns are shifting geographically."
        actions={[
          {
            label: "Request PBOT bridge traffic count data",
            type: "download",
            href: "https://www.portland.gov/transportation",
          },
        ]}
        color={COLOR}
      />
    </div>
  );
}
