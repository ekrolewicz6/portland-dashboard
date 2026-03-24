"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import BarChart from "@/components/charts/BarChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Home,
  Heart,
  DollarSign,
  ArrowRightLeft,
  BedDouble,
  FileText,
} from "lucide-react";

const ACCENT = "#8b6c5c";

interface PitYear {
  year: number;
  totalHomeless: number;
  sheltered: number;
  unsheltered: number;
  chronicallyHomeless: number;
  veterans: number;
  families: number;
  unaccompaniedYouth: number;
}

interface ShelterQuarter {
  quarter: string;
  totalBeds: number;
  county24hrBeds: number;
  cityOvernightBeds: number;
  utilizationPct: number;
}

interface HousingPlacement {
  fiscalYear: string;
  totalPlacements: number;
  shsPlacements: number;
  rapidRehousing: number;
  pshPlacements: number;
  evictionsPrevented: number;
}

interface OverdoseDeath {
  year: number;
  totalOdDeathsHomeless: number;
  fentanylDeathsHomeless: number;
  totalHomelessDeaths: number;
  countyWideOpioidDeaths: number;
}

interface SHSFunding {
  year: number;
  taxRevenue: number;
  spending: number;
  pshUnitsAdded: number;
  pshUnitsCumulative: number;
}

interface ByNameEntry {
  month: string;
  totalOnList: number;
  newEntries: number;
  exitsToHousing: number;
}

interface HomelessnessDetailData {
  pitCounts: PitYear[];
  shelterCapacity: ShelterQuarter[];
  housingPlacements: HousingPlacement[];
  overdoseDeaths: OverdoseDeath[];
  shsFunding: SHSFunding[];
  byNameList: ByNameEntry[];
  dataStatus: string;
}

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
      <Icon className="w-4 h-4" style={{ color: color ?? ACCENT }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function HomelessnessDetail() {
  const [data, setData] = useState<HomelessnessDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/homelessness/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-sm bg-[var(--color-parchment)]"
          />
        ))}
      </div>
    );
  }

  if (error || !data || data.dataStatus === "error") {
    return (
      <div className="text-center py-16 text-[var(--color-ink-muted)]">
        <p className="text-sm">Homelessness data temporarily unavailable.</p>
      </div>
    );
  }

  const {
    pitCounts,
    shelterCapacity,
    housingPlacements,
    overdoseDeaths,
    shsFunding,
    byNameList,
  } = data;

  // Compute key figures
  const latestPit =
    pitCounts.length > 0 ? pitCounts[pitCounts.length - 1] : null;
  const prevPit =
    pitCounts.length >= 2 ? pitCounts[pitCounts.length - 2] : null;
  const pitChange =
    latestPit && prevPit && prevPit.totalHomeless > 0
      ? Math.round(
          ((latestPit.totalHomeless - prevPit.totalHomeless) /
            prevPit.totalHomeless) *
            100,
        )
      : 0;

  const latestShelter =
    shelterCapacity.length > 0
      ? shelterCapacity[shelterCapacity.length - 1]
      : null;
  const latestPlacements =
    housingPlacements.length > 0
      ? housingPlacements[housingPlacements.length - 1]
      : null;
  const latestOD =
    overdoseDeaths.length > 0
      ? overdoseDeaths[overdoseDeaths.length - 1]
      : null;
  const prevOD =
    overdoseDeaths.length >= 2
      ? overdoseDeaths[overdoseDeaths.length - 2]
      : null;
  const latestSHS =
    shsFunding.length > 0 ? shsFunding[shsFunding.length - 1] : null;

  // By-name list averages
  const avgNewEntries =
    byNameList.length > 0
      ? Math.round(
          byNameList.reduce((s, b) => s + b.newEntries, 0) / byNameList.length,
        )
      : null;
  const avgExits =
    byNameList.length > 0
      ? Math.round(
          byNameList.reduce((s, b) => s + b.exitsToHousing, 0) / byNameList.length,
        )
      : null;
  const latestByName =
    byNameList.length > 0 ? byNameList[byNameList.length - 1] : null;

  return (
    <div className="space-y-10">
      <NewsContext category="homelessness" />

      {/* 1. NARRATIVE SUMMARY */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--color-ember)] flex-shrink-0 mt-1" />
            <h3 className="font-editorial-normal text-[28px] sm:text-[34px] leading-snug text-white">
              Portland&apos;s homelessness crisis is growing faster than the
              response
            </h3>
          </div>
          <div className="space-y-3 text-[14px] text-white/70 leading-relaxed">
            {latestPit && (
              <p>
                <strong className="text-white">
                  {latestPit.totalHomeless.toLocaleString()} people
                </strong>{" "}
                were counted as homeless in the {latestPit.year} Point-in-Time
                count
                {prevPit
                  ? `, up ${pitChange}% from ${prevPit.totalHomeless.toLocaleString()} in ${prevPit.year}`
                  : ""}
                .{" "}
                {latestByName
                  ? `The by-name list tracks ${latestByName.totalOnList.toLocaleString()} actively homeless individuals.`
                  : ""}
              </p>
            )}
            {avgNewEntries && avgExits && (
              <p>
                Roughly{" "}
                <strong className="text-white">
                  {avgNewEntries.toLocaleString()} new people
                </strong>{" "}
                enter homelessness each month while only{" "}
                <strong className="text-white">
                  {avgExits.toLocaleString()} exit
                </strong>{" "}
                — for every 2 people who leave, {Math.round((avgNewEntries / avgExits) * 2)} more
                enter.
              </p>
            )}
            {latestOD && prevOD && (
              <p>
                Overdose deaths{" "}
                {latestOD.totalOdDeathsHomeless < prevOD.totalOdDeathsHomeless
                  ? "are declining"
                  : "continue to rise"}{" "}
                ({latestOD.totalOdDeathsHomeless.toLocaleString()} in {latestOD.year}
                {prevOD
                  ? `, ${latestOD.totalOdDeathsHomeless < prevOD.totalOdDeathsHomeless ? "down" : "up"} from ${prevOD.totalOdDeathsHomeless.toLocaleString()} in ${prevOD.year}`
                  : ""}
                ).
              </p>
            )}
            {latestSHS && latestSHS.pshUnitsCumulative > 0 && (
              <p>
                SHS has housed{" "}
                <strong className="text-white">
                  {latestSHS.pshUnitsCumulative.toLocaleString()} people
                </strong>{" "}
                regionally but can&apos;t keep pace with inflow.
              </p>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-4 font-mono">
            Source: HUD PIT Count · JOHS By-Name List · Multnomah County Health
            · Metro SHS
          </p>
        </div>
      </section>

      {/* 2. KEY STATS */}
      {latestPit && (
        <section>
          <SectionHeader
            icon={TrendingUp}
            title="Key Metrics"
            color={ACCENT}
          />
          <StatGrid
            accentColor={ACCENT}
            stats={[
              {
                label: `Total Homeless (${latestPit.year} PIT)`,
                value: latestPit.totalHomeless.toLocaleString(),
                changeLabel: prevPit
                  ? `${pitChange > 0 ? "+" : ""}${pitChange}% from ${prevPit.year}`
                  : undefined,
              },
              {
                label: "Shelter Beds",
                value: latestShelter
                  ? latestShelter.totalBeds.toLocaleString()
                  : "N/A",
                changeLabel: latestShelter
                  ? `${latestShelter.utilizationPct}% utilization`
                  : undefined,
              },
              {
                label: "Housing Placements/yr",
                value: latestPlacements
                  ? latestPlacements.totalPlacements.toLocaleString()
                  : "N/A",
                changeLabel: latestPlacements
                  ? `FY ${latestPlacements.fiscalYear}`
                  : undefined,
              },
              {
                label: "Overdose Deaths",
                value: latestOD
                  ? latestOD.totalOdDeathsHomeless.toLocaleString()
                  : "N/A",
                changeLabel:
                  latestOD && prevOD
                    ? `${latestOD.totalOdDeathsHomeless < prevOD.totalOdDeathsHomeless ? "Down" : "Up"} from ${prevOD.totalOdDeathsHomeless.toLocaleString()} in ${prevOD.year}`
                    : latestOD
                      ? `${latestOD.year}`
                      : undefined,
              },
            ]}
          />
        </section>
      )}

      {/* 3. PIT COUNT TREND */}
      {pitCounts.length > 0 && (
        <section>
          <SectionHeader
            icon={Users}
            title="Point-in-Time Count Trend"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              The HUD-mandated Point-in-Time count is conducted every 1-2 years
              across the Portland/Gresham/Multnomah County Continuum of Care.
              {latestPit &&
                pitCounts.length > 1 &&
                ` From ${pitCounts[0].year} to ${latestPit.year}, homelessness grew from ${pitCounts[0].totalHomeless.toLocaleString()} to ${latestPit.totalHomeless.toLocaleString()}.`}
            </p>
            <TrendChart
              data={pitCounts.map((r) => ({
                date: String(r.year),
                value: r.totalHomeless,
              }))}
              color={ACCENT}
              height={320}
              yAxisDomain="auto"
            />
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: HUD Point-in-Time Count, Portland/Gresham/Multnomah County
              CoC.
            </p>
          </div>
        </section>
      )}

      {/* 4. THE FLOW PROBLEM */}
      {avgNewEntries && avgExits && (
        <section>
          <SectionHeader
            icon={ArrowRightLeft}
            title="The Flow Problem"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
              For every 2 people who exit homelessness,{" "}
              {Math.round((avgNewEntries / avgExits) * 2)} more enter. Until
              inflow slows or outflow accelerates, the crisis will continue to
              grow regardless of shelter investments.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 border border-red-200 rounded-sm p-5 text-center">
                <p className="text-[11px] font-semibold text-red-800/60 uppercase tracking-wider mb-1">
                  Monthly Inflow
                </p>
                <p className="text-[36px] font-editorial-normal text-red-700 leading-none">
                  {avgNewEntries.toLocaleString()}
                </p>
                <p className="text-[12px] text-red-600/70 mt-1">
                  new entries/month
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-sm p-5 text-center">
                <p className="text-[11px] font-semibold text-green-800/60 uppercase tracking-wider mb-1">
                  Monthly Outflow
                </p>
                <p className="text-[36px] font-editorial-normal text-green-700 leading-none">
                  {avgExits.toLocaleString()}
                </p>
                <p className="text-[12px] text-green-600/70 mt-1">
                  exits/month
                </p>
              </div>
            </div>
            {byNameList.length > 0 && (
              <>
                <TrendChart
                  data={byNameList.map((b) => ({
                    date: b.month,
                    value: b.totalOnList,
                  }))}
                  color={ACCENT}
                  height={240}
                  yAxisDomain="auto"
                />
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
                  Active count on the by-name list over time. Source: JOHS
                  By-Name List.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* 4b. WHY ARE PEOPLE BECOMING HOMELESS? */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Why Are People Becoming Homeless?" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            The root cause of homelessness inflow is <strong>housing affordability</strong>.
            Portland&apos;s rent-to-income ratio exceeds 30% for most working households,
            and eviction filings in Multnomah County rose 33% from 2023 to 2024.
            The majority of people entering the by-name list each month are experiencing
            homelessness for the first time — not returning from housing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Housing Scarcity</p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Portland is short ~20,000 affordable housing units. Vacancy rate is below 5%.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Evictions Rising</p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Multnomah County eviction filings up 33% (2023→2024). Washington County up 63%.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Treatment Gap</p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Oregon needs 3,714 more behavioral health treatment beds. Current capacity: 4,819 statewide.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Demographics</p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                BIPOC people are 46% of homeless population but only 36% of general population. Disparity nearly doubled 2023-2025.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
            Sources: OPB, MultCo HSD, PSU 2025 PIT Count, OHA Behavioral Health Study.
          </p>
        </div>
      </section>

      {/* 5. SHELTER CAPACITY & UTILIZATION */}
      {shelterCapacity.length > 0 && (
        <section>
          <SectionHeader
            icon={BedDouble}
            title="Shelter Capacity & Utilization"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {latestShelter && (
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                {latestShelter.utilizationPct}% utilization across{" "}
                {latestShelter.totalBeds.toLocaleString()} beds.

                {" "}Average stay: 73 days. Only 16% of shelter exits lead to permanent housing.
              </p>
            )}
            <TrendChart
              data={shelterCapacity.map((s) => ({
                date: s.quarter,
                value: s.totalBeds,
              }))}
              color={ACCENT}
              height={280}
              yAxisDomain="auto"
            />
            {shelterCapacity.length > 1 && (
              <div className="mt-4">
                <p className="text-[12px] text-[var(--color-ink-muted)] mb-2">
                  Utilization rate by quarter:
                </p>
                <TrendChart
                  data={shelterCapacity.map((s) => ({
                    date: s.quarter,
                    value: s.utilizationPct,
                  }))}
                  color="#c8956c"
                  height={200}
                  valueSuffix="%"
                  yAxisDomain="auto"
                />
              </div>
            )}
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: JOHS Shelter Capacity Reports, quarterly.
            </p>
          </div>
        </section>
      )}

      {/* 6. HOUSING PLACEMENTS TREND */}
      {housingPlacements.length > 0 && (
        <section>
          <SectionHeader
            icon={Home}
            title="Housing Placements"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Annual housing placements through JOHS and SHS-funded programs.
              {" "}PSH progress: 1,541 of ~2,233 unit goal (69%).
            </p>
            <BarChart
              data={housingPlacements.map((h) => ({
                name: h.fiscalYear,
                value: h.totalPlacements,
              }))}
              color={ACCENT}
              height={300}
            />
            <div className="mt-4 bg-[var(--color-parchment)]/40 rounded-sm p-4">
              <p className="text-[12px] text-[var(--color-ink-muted)] mb-2">
                Permanent Supportive Housing pipeline
              </p>
              <div className="h-6 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: "69%", backgroundColor: ACCENT }}
                />
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                1,541 / 2,233 units (69%)
              </p>
            </div>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: Metro SHS Dashboard · JOHS Housing Placement Reports.
            </p>
          </div>
        </section>
      )}

      {/* 7. OVERDOSE CRISIS */}
      {overdoseDeaths.length > 0 && (
        <section>
          <SectionHeader
            icon={Heart}
            title="Overdose Crisis"
            color="#b85c3a"
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              {(() => {
                const first = overdoseDeaths[0];
                const last = overdoseDeaths[overdoseDeaths.length - 1];
                const peak = overdoseDeaths.reduce((max, d) =>
                  d.totalOdDeathsHomeless > max.totalOdDeathsHomeless ? d : max,
                  overdoseDeaths[0],
                );
                return (
                  <>
                    Overdose deaths rose from{" "}
                    {first.totalOdDeathsHomeless.toLocaleString()} in {first.year} to a
                    peak of {peak.totalOdDeathsHomeless.toLocaleString()} in {peak.year}
                    {last.year !== peak.year
                      ? `, then ${last.totalOdDeathsHomeless < peak.totalOdDeathsHomeless ? "declined" : "remained at"} ${last.totalOdDeathsHomeless.toLocaleString()} in ${last.year}`
                      : ""}
                    .

                    {" "}Fentanyl is present in 86% of overdose cases. Methamphetamine is present in 82%.
                  </>
                );
              })()}
            </p>
            <TrendChart
              data={overdoseDeaths.map((d) => ({
                date: String(d.year),
                value: d.totalOdDeathsHomeless,
              }))}
              color="#b85c3a"
              height={280}
              yAxisDomain="auto"
            />
            {overdoseDeaths.some((d) => d.fentanylDeathsHomeless > 0) && (
              <div className="mt-4">
                <p className="text-[12px] text-[var(--color-ink-muted)] mb-2">
                  Fentanyl-involved deaths:
                </p>
                <TrendChart
                  data={overdoseDeaths
                    .filter((d) => d.fentanylDeathsHomeless > 0)
                    .map((d) => ({
                      date: String(d.year),
                      value: d.fentanylDeathsHomeless,
                    }))}
                  color="#c8956c"
                  height={220}
                  yAxisDomain="auto"
                />
              </div>
            )}
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: Multnomah County Health Department, Medical Examiner data.
            </p>
          </div>
        </section>
      )}

      {/* 8. SHS FUNDING */}
      {shsFunding.length > 0 && (
        <section>
          <SectionHeader
            icon={DollarSign}
            title="Supportive Housing Services Funding"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              The Metro SHS income tax funds the regional homelessness response.
              {(() => {
                if (shsFunding.length < 2) return "";
                const first = shsFunding[0];
                const last = shsFunding[shsFunding.length - 1];
                const peak = shsFunding.reduce((max, d) =>
                  d.taxRevenue > max.taxRevenue ? d : max,
                  shsFunding[0],
                );
                const revM = (v: number) =>
                  `$${(v / 1e6).toFixed(0)}M`;
                if (last.taxRevenue < peak.taxRevenue) {
                  return ` Revenue peaked at ${revM(peak.taxRevenue)} (${peak.year}), declining to ${revM(last.taxRevenue)} (${last.year}).`;
                }
                return ` Revenue grew from ${revM(first.taxRevenue)} to ${revM(last.taxRevenue)}.`;
              })()}
              {" "}A 22% budget cut has been proposed for FY 2026-27.
            </p>
            <TrendChart
              data={shsFunding.map((s) => ({
                date: `${s.year}`,
                value: s.taxRevenue,
              }))}
              color={ACCENT}
              height={280}
              valuePrefix="$"
              yAxisDomain="auto"
            />
            {latestSHS && latestSHS.pshUnitsCumulative > 0 && (
              <div className="mt-4 bg-[var(--color-parchment)]/40 rounded-sm p-4">
                <p className="text-[13px] text-[var(--color-ink-muted)]">
                  <strong>
                    {latestSHS.pshUnitsCumulative.toLocaleString()}
                  </strong>{" "}
                  people housed cumulatively through SHS-funded programs.
                </p>
              </div>
            )}
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: Metro SHS Annual Reports.
            </p>
          </div>
        </section>
      )}

      {/* 9. DATA STILL NEEDED */}
      <section className="space-y-4">
        <DataNeeded
          title="Treatment wait times"
          description="No public data source currently tracks wait times for substance use disorder treatment in Multnomah County. This is critical for understanding whether treatment capacity matches demand."
          actions={[
            {
              label:
                "Request treatment capacity data from Oregon Health Authority",
              type: "prr",
            },
          ]}
          color={ACCENT}
        />
        <DataNeeded
          title="Outreach contact data"
          description="HSD&apos;s outreach teams track contacts with unsheltered individuals, but this data is internal. It would show how many people are being reached and connected to services."
          actions={[
            {
              label:
                "Request outreach contact data from HSD",
              type: "prr",
            },
          ]}
          color={ACCENT}
        />
        <DataNeeded
          title="Behavioral health workforce data"
          description="No centralized data on the number of behavioral health providers, caseloads, or vacancies in Multnomah County. Workforce shortages are widely reported but not tracked publicly."
          actions={[
            {
              label:
                "Request workforce data from Multnomah County Health Dept",
              type: "prr",
            },
          ]}
          color={ACCENT}
        />
      </section>

      {/* 10. METHODOLOGY */}
      <section>
        <SectionHeader
          icon={FileText}
          title="Data Sources & Methodology"
          color={ACCENT}
        />
        <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-6">
          <div className="space-y-2 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
            <p>
              <strong>Point-in-Time Count:</strong> HUD-mandated count conducted
              every 1-2 years by the Portland/Gresham/Multnomah County Continuum
              of Care. Counts both sheltered and unsheltered individuals on a
              single night. Known to undercount — actual homelessness is likely
              2-3x the PIT figure.
            </p>
            <p>
              <strong>By-Name List:</strong> JOHS maintains a by-name list of
              all known homeless individuals in the system. Monthly snapshots
              show inflow (new entries) vs outflow (exits to housing or other
              destinations).
            </p>
            <p>
              <strong>Shelter Capacity:</strong> JOHS quarterly reports on total
              beds, utilization rates, average length of stay, and exit
              destinations across the Portland metro shelter system.
            </p>
            <p>
              <strong>Housing Placements:</strong> Annual placements through
              JOHS- and SHS-funded programs. PSH (Permanent Supportive Housing)
              targets come from the Metro SHS implementation plan.
            </p>
            <p>
              <strong>Overdose Deaths:</strong> Multnomah County Medical Examiner
              data, reported by the County Health Department. Includes
              toxicology breakdowns for fentanyl and methamphetamine involvement.
            </p>
            <p>
              <strong>SHS Funding:</strong> Metro Supportive Housing Services tax
              revenue and spending, from Metro annual reports. The SHS tax is a
              1% income tax on high earners and large businesses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
