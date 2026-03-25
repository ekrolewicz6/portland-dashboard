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
  Scale,
  Building2,
  MapPin,
  Compass,
  HelpCircle,
} from "lucide-react";

const ACCENT = "#8b6c5c";

// ── Types ────────────────────────────────────────────────────────────────

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

interface EvictionFiling {
  month: string;
  county: string;
  filings: number;
  filingRatePer100: number;
}

interface SHSByType {
  fiscalYear: string;
  interventionType: string;
  amount: number;
  householdsServed: number;
  housingPlacements: number;
  costPerPlacement: number;
}

interface SHSByCounty {
  fiscalYear: string;
  county: string;
  allocation: number;
  spent: number;
  householdsPlaced: number;
}

interface AffordableVacancy {
  asOf: string;
  source: string;
  totalUnits: number;
  vacantUnits: number;
  vacancyPct: number;
  avgDaysToFill: number;
  notes: string;
}

interface ContextStat {
  value: string;
  context: string;
  source: string;
}

interface HomelessnessDetailData {
  pitCounts: PitYear[];
  shelterCapacity: ShelterQuarter[];
  housingPlacements: HousingPlacement[];
  overdoseDeaths: OverdoseDeath[];
  shsFunding: SHSFunding[];
  byNameList: ByNameEntry[];
  contextStats: Record<string, ContextStat>;
  evictionFilings: EvictionFiling[];
  shsByType: SHSByType[];
  shsByCounty: SHSByCounty[];
  affordableVacancy: AffordableVacancy[];
  dataStatus: string;
}

// ── Shared Components ────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  color,
  questionNum,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  color?: string;
  questionNum?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: color ?? ACCENT }} />
      {questionNum && (
        <span className="text-[10px] font-mono font-bold text-[var(--color-ink-muted)]/60 bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm">
          {questionNum}
        </span>
      )}
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function PipelineBox({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div
      className="rounded-sm p-4 text-center border"
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}30`,
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: `${color}90` }}
      >
        {label}
      </p>
      <p
        className="text-[32px] font-editorial-normal leading-none"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[12px] mt-1" style={{ color: `${color}80` }}>
        {sublabel}
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

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
    contextStats,
    evictionFilings,
    shsByType,
    shsByCounty,
    affordableVacancy,
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

  const avgNewEntries =
    byNameList.length > 0
      ? Math.round(
          byNameList.reduce((s, b) => s + b.newEntries, 0) / byNameList.length,
        )
      : null;
  const avgExits =
    byNameList.length > 0
      ? Math.round(
          byNameList.reduce((s, b) => s + b.exitsToHousing, 0) /
            byNameList.length,
        )
      : null;
  const latestByName =
    byNameList.length > 0 ? byNameList[byNameList.length - 1] : null;

  // Eviction data — Multnomah only
  const multEvictions = evictionFilings.filter(
    (e) => e.county === "Multnomah",
  );

  // SHS by county — latest FY only
  const latestShsCounty = shsByCounty.filter(
    (c) => c.householdsPlaced > 0,
  );

  // SHS by type — latest FY
  const latestShsType = shsByType.filter(
    (t) => t.householdsServed > 0,
  );

  const hracAnnual = contextStats?.hrac_annual_homeless;
  const cumulativeHoused = contextStats?.shs_cumulative_housed;
  const pshNeed = contextStats?.psh_need_regional;

  return (
    <div className="space-y-10">
      <NewsContext category="homelessness" />

      {/* ═══════════════════════════════════════════════════════════════════
          PIPELINE OVERVIEW — The Flow-Through Frame
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--color-ember)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-editorial-normal text-[28px] sm:text-[34px] leading-snug text-white">
                The system is over-leveraged in shelter, under-leveraged in
                housing
              </h3>
              <p className="text-[14px] text-white/60 mt-2">
                Flow-through framework: inflow → system → outflow
              </p>
            </div>
          </div>

          {/* Pipeline diagram */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <PipelineBox
              label="Monthly Inflow"
              value={avgNewEntries ? avgNewEntries.toLocaleString() : "—"}
              sublabel="new entries/month"
              color="#ef4444"
            />
            <PipelineBox
              label="In System"
              value={
                latestByName
                  ? latestByName.totalOnList.toLocaleString()
                  : latestPit
                    ? latestPit.totalHomeless.toLocaleString()
                    : "—"
              }
              sublabel={
                latestByName ? "on by-name list" : "PIT count"
              }
              color="#f59e0b"
            />
            <PipelineBox
              label="Monthly Outflow"
              value={avgExits ? avgExits.toLocaleString() : "—"}
              sublabel="exits to housing/month"
              color="#22c55e"
            />
          </div>

          <div className="space-y-3 text-[14px] text-white/70 leading-relaxed">
            {avgNewEntries && avgExits && (
              <p>
                For every person who exits homelessness,{" "}
                <strong className="text-white">
                  {(avgNewEntries / avgExits).toFixed(1)} more enter
                </strong>
                . The by-name list grows by ~
                {(avgNewEntries - avgExits).toLocaleString()} people per month.
              </p>
            )}
            {hracAnnual && (
              <p>
                The PIT count ({latestPit?.totalHomeless.toLocaleString()}) is a
                single-night snapshot. HRAC/PSU estimates{" "}
                <strong className="text-white">
                  ~{Number(hracAnnual.value).toLocaleString()} people
                </strong>{" "}
                experience homelessness annually in the tri-county area.
              </p>
            )}
            {cumulativeHoused && (
              <p>
                SHS has housed{" "}
                <strong className="text-white">
                  {Number(cumulativeHoused.value).toLocaleString()} people
                </strong>{" "}
                cumulatively (Years 1-4), with 92% PSH retention. But estimated
                regional need is{" "}
                {pshNeed
                  ? `${Number(pshNeed.value).toLocaleString()} PSH units`
                  : "growing"}
                .
              </p>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-4 font-mono">
            Source: HUD PIT Count · JOHS By-Name List · HRAC/PSU Prevalence Study · Metro SHS Year 4 Report
          </p>
        </div>
      </section>

      {/* KEY STATS */}
      {latestPit && (
        <section>
          <SectionHeader icon={TrendingUp} title="Key Metrics" color={ACCENT} />
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

      {/* ═══════════════════════════════════════════════════════════════════
          Q1: WHAT'S DRIVING INFLOW?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="What's Driving Inflow?"
          questionNum="Q1"
          color="#ef4444"
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
            Evictions are the primary measurable driver of homelessness inflow.
            Multnomah County filings average over 1,000/month — 7 per 100 rental
            units annually, the highest rate in Oregon. The true scope is larger:
            the PIT count captures a single night, while HRAC estimates ~38,000
            people experience homelessness annually across three counties.
          </p>

          {/* Eviction trend chart */}
          {multEvictions.length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Multnomah County Eviction Filings (Monthly)
              </h3>
              <TrendChart
                data={multEvictions.map((e) => ({
                  date: e.month.substring(0, 7),
                  value: e.filings,
                }))}
                color="#ef4444"
                height={280}
                yAxisDomain="auto"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2 mb-5">
                Source: Evicted in Oregon / HRAC PSU (circuit court data only, ~90% of cases).
                Clackamas County unavailable (justice courts).
              </p>
            </>
          )}

          {/* Root cause cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Housing Scarcity
              </p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Portland is short ~20,000 affordable units. Vacancy rate below
                5%.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Evictions Rising
              </p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Multnomah: 7 per 100 rentals/yr (highest in OR). Washington: 5
                per 100.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Treatment Gap
              </p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                Oregon needs 3,714 more behavioral health beds. Current
                statewide: 4,819.
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Prevalence Gap
              </p>
              <p className="text-[14px] text-[var(--color-ink)] leading-snug">
                PIT count: {latestPit?.totalHomeless.toLocaleString() ?? "—"}.
                HRAC annual estimate: ~38,000. Actual scale is 3-4x the
                snapshot.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
            Sources: Evicted in Oregon, HRAC/PSU Prevalence Study, OHA
            Behavioral Health Study.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Q2: SYSTEM BALANCE — Spending vs. Outcomes by Intervention Type
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Scale}
          title="System Balance — Spending vs. Outcomes"
          questionNum="Q2"
          color={ACCENT}
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
            SHS Year 4 spending hit $424.9M (up 44% from Year 3). The system
            exceeded goals in placements and prevention but fell short on new
            supportive housing units. The question is whether the balance of
            investment across shelter, housing, and prevention is optimal.
          </p>

          {/* SHS spending trend */}
          {shsFunding.filter((s) => s.spending > 0).length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                SHS Total Spending by Year
              </h3>
              <BarChart
                data={shsFunding
                  .filter((s) => s.spending > 0)
                  .map((s) => ({
                    name: `FY${s.year}`,
                    value: Math.round(s.spending / 1e6),
                  }))}
                color={ACCENT}
                height={260}
                valuePrefix="$"
                valueSuffix="M"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2 mb-5">
                Source: Metro SHS Regional Annual Reports.
              </p>
            </>
          )}

          {/* Intervention outcomes */}
          {latestShsType.length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Year 4 Outcomes by Intervention Type
              </h3>
              <BarChart
                data={latestShsType.map((t) => {
                  const labels: Record<string, string> = {
                    psh: "PSH",
                    rapid_rehousing: "Rapid Rehousing",
                    prevention: "Prevention",
                    shelter: "Shelter Beds",
                  };
                  return {
                    name: labels[t.interventionType] ?? t.interventionType,
                    value: t.householdsServed,
                  };
                })}
                color={ACCENT}
                height={260}
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2">
                Households served by intervention type. PSH retention: 92%. RRH
                retention: 86%. Returns to homelessness: PSH 3%, RRH 6%.
              </p>
            </>
          )}

          {/* Cumulative progress */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4 text-center">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Cumulative Housed
              </p>
              <p className="text-[24px] font-editorial-normal text-[var(--color-ink)]">
                14,936
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">
                Years 1-4
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4 text-center">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                PSH Goal Progress
              </p>
              <p className="text-[24px] font-editorial-normal text-[var(--color-ink)]">
                4,887
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">
                of 5,000 (10-yr goal)
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4 text-center">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Prevention
              </p>
              <p className="text-[24px] font-editorial-normal text-[var(--color-ink)]">
                19,134
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">
                households (2.3x 10-yr goal)
              </p>
            </div>
            <div className="bg-[var(--color-parchment)]/30 rounded-sm p-4 text-center">
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Total Spending
              </p>
              <p className="text-[24px] font-editorial-normal text-[var(--color-ink)]">
                $924M
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">
                Years 1-4 cumulative
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
            Source: Metro SHS Regional Annual Report FY2024-25 (Year 4).
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Q3: EMPTY AFFORDABLE UNITS
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Building2}
          title="Empty Affordable Units"
          questionNum="Q3"
          color="#d97706"
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            A KATU/Willamette Week investigation found{" "}
            <strong>955 empty apartments</strong> in Home Forward public housing
            (November 2025), representing ~14% vacancy and $8.4M in foregone
            rent. Home Forward disputes some figures, stating vacancy declined to
            ~11% after the report. The average unit takes{" "}
            <strong>185 days</strong> to fill.
          </p>

          {affordableVacancy.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {affordableVacancy
                .filter((v) => v.vacantUnits > 0)
                .map((v, i) => (
                  <div
                    key={i}
                    className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center"
                  >
                    <p className="text-[11px] font-semibold text-amber-800/60 uppercase tracking-wider mb-1">
                      Vacant Units
                    </p>
                    <p className="text-[32px] font-editorial-normal text-amber-700 leading-none">
                      {v.vacantUnits.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-amber-600/70 mt-1">
                      {v.vacancyPct}% vacancy · {v.source}
                    </p>
                  </div>
                ))}
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
                <p className="text-[11px] font-semibold text-amber-800/60 uppercase tracking-wider mb-1">
                  Avg Days to Fill
                </p>
                <p className="text-[32px] font-editorial-normal text-amber-700 leading-none">
                  185
                </p>
                <p className="text-[12px] text-amber-600/70 mt-1">
                  per unit turnover
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
                <p className="text-[11px] font-semibold text-amber-800/60 uppercase tracking-wider mb-1">
                  Foregone Rent
                </p>
                <p className="text-[32px] font-editorial-normal text-amber-700 leading-none">
                  $8.4M
                </p>
                <p className="text-[12px] text-amber-600/70 mt-1">
                  annual revenue lost
                </p>
              </div>
            </div>
          )}

          <div className="bg-amber-50/50 border border-amber-200/50 rounded-sm p-3 text-[12px] text-amber-800/70">
            <strong>Contested data:</strong> Home Forward disputes the 955-unit
            figure and states their vacancy rate has declined to ~11%. These
            numbers come from news investigations, not official reporting. We
            display both claims transparently.
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
            Source: KATU / Willamette Week investigation (Nov 2025), Home Forward
            public response (Dec 2025).
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Q4: SHELTER & INTERVENTION EFFECTIVENESS
          ═══════════════════════════════════════════════════════════════════ */}
      {shelterCapacity.length > 0 && (
        <section>
          <SectionHeader
            icon={BedDouble}
            title="Shelter & Intervention Effectiveness"
            questionNum="Q4"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {latestShelter && (
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                {latestShelter.utilizationPct}% utilization across{" "}
                {latestShelter.totalBeds.toLocaleString()} beds. Average stay: 73
                days. Only 16% of shelter exits lead to permanent housing. SHS
                Year 4 created/sustained 2,499 shelter beds (goal: 2,012).
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
            <DataNeeded
              title="Singleton shelter effectiveness memo"
              description="An internal memo by Singleton analyzing shelter intervention effectiveness, including outcome data on which shelter models produce the best housing outcomes, is being located. This would answer whether current shelter investment is producing returns."
              actions={[
                {
                  label: "Awaiting from HSD",
                  type: "prr",
                },
              ]}
              color={ACCENT}
            />
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: JOHS Shelter Capacity Reports, quarterly.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Q5: BEHAVIORAL HEALTH CROSSOVER
          ═══════════════════════════════════════════════════════════════════ */}
      {overdoseDeaths.length > 0 && (
        <section>
          <SectionHeader
            icon={Heart}
            title="Behavioral Health Crossover"
            questionNum="Q5"
            color="#b85c3a"
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              {(() => {
                const first = overdoseDeaths[0];
                const last = overdoseDeaths[overdoseDeaths.length - 1];
                const peak = overdoseDeaths.reduce(
                  (max, d) =>
                    d.totalOdDeathsHomeless > max.totalOdDeathsHomeless
                      ? d
                      : max,
                  overdoseDeaths[0],
                );
                return (
                  <>
                    Overdose deaths rose from{" "}
                    {first.totalOdDeathsHomeless > 0
                      ? first.totalOdDeathsHomeless.toLocaleString()
                      : first.fentanylDeathsHomeless.toLocaleString()}{" "}
                    in {first.year} to a peak of{" "}
                    {peak.totalOdDeathsHomeless.toLocaleString()} in {peak.year}
                    {last.year !== peak.year
                      ? `, then ${last.totalOdDeathsHomeless < peak.totalOdDeathsHomeless ? "declined to" : "remained at"} ${last.totalOdDeathsHomeless.toLocaleString()} in ${last.year}`
                      : ""}
                    . Fentanyl is present in 86% of overdose cases.
                    Methamphetamine in 82%.
                  </>
                );
              })()}
            </p>
            <TrendChart
              data={overdoseDeaths
                .filter((d) => d.totalOdDeathsHomeless > 0)
                .map((d) => ({
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
            <div className="mt-4">
              <DataNeeded
                title="Health Share / HSD crossover study"
                description="The Health Share crossover study (analyzing overlap between behavioral health system and homelessness system) may be publicly available. This would quantify how many people cycle between healthcare and homelessness."
                actions={[
                  {
                    label: "Awaiting from Health Share",
                    type: "prr",
                  },
                ]}
                color="#b85c3a"
              />
            </div>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: Multnomah County Health Department, Medical Examiner data.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Q6: OUTREACH COVERAGE
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={Compass}
          title="Outreach Coverage"
          questionNum="Q6"
          color={ACCENT}
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            SHS Year 4 reports Multnomah County outreach teams had{" "}
            <strong>3,957 engagements</strong> (goal: 1,420) and Clackamas had{" "}
            <strong>877 engagements</strong> (goal: 750). However, detailed
            outreach-to-housing pipeline data is not publicly available.
          </p>
          <DataNeeded
            title="Outreach-to-housing pipeline data"
            description="HSD's outreach teams use Survey 123 to track contacts with unsheltered individuals, but only ~1 quarter of data exists and it may not be published. This would show how many outreach contacts actually lead to shelter or housing placement."
            actions={[
              {
                label: "Request outreach contact data from HSD",
                type: "prr",
              },
            ]}
            color={ACCENT}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Q7: WHERE DO PEOPLE GO?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={HelpCircle}
          title="Where Do People Go?"
          questionNum="Q7"
          color={ACCENT}
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Exit destination data — where people go when they leave homelessness
            — is tracked in HMIS but not publicly available. We know that PSH
            has a 3% return rate and RRH has 6%, but the full picture of
            destinations (permanent housing, doubled up, incarceration, unknown)
            requires restricted HMIS data.
          </p>
          <DataNeeded
            title="Exit destination data from HMIS"
            description="HMIS tracks where people go when they leave homelessness (permanent housing, transitional, doubled up, incarceration, unknown). This data is restricted and would require a public records request to obtain aggregated figures."
            actions={[
              {
                label: "Request aggregated exit data from JOHS/HMIS",
                type: "prr",
              },
            ]}
            color={ACCENT}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Q8: REGIONAL PICTURE — Three-County SHS Comparison
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={MapPin}
          title="Regional Picture — Three-County Comparison"
          questionNum="Q8"
          color="#4f46e5"
        />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
            SHS funds are distributed by formula: Multnomah 45.3%, Washington
            33.3%, Clackamas 21.3%. Year 4 saw 2,936 housing placements across
            the three counties, with Multnomah accounting for 58% of placements.
            SHS represents 74% of total homeless services funding in the region.
          </p>

          {latestShsCounty.length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Year 4 Housing Placements by County
              </h3>
              <BarChart
                data={latestShsCounty.map((c) => ({
                  name: c.county,
                  value: c.householdsPlaced,
                  color:
                    c.county === "Multnomah"
                      ? "#4f46e5"
                      : c.county === "Washington"
                        ? "#7c3aed"
                        : "#a78bfa",
                }))}
                color="#4f46e5"
                height={260}
              />

              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3 mt-5">
                FY2026 Allocation by County
              </h3>
              <BarChart
                data={latestShsCounty.map((c) => ({
                  name: c.county,
                  value: Math.round(c.allocation / 1e6),
                  color:
                    c.county === "Multnomah"
                      ? "#4f46e5"
                      : c.county === "Washington"
                        ? "#7c3aed"
                        : "#a78bfa",
                }))}
                color="#4f46e5"
                height={260}
                valuePrefix="$"
                valueSuffix="M"
              />
            </>
          )}

          {/* Federal funding risks */}
          <div className="mt-5 bg-red-50/50 border border-red-200/50 rounded-sm p-4">
            <p className="text-[12px] font-semibold text-red-800/70 mb-1">
              Federal Funding Risk
            </p>
            <p className="text-[13px] text-red-700/70">
              Federal Continuum of Care cuts will eliminate housing for ~1,109
              households annually. Emergency Housing Voucher termination
              eliminates ~546 vouchers. SHS tax expires after Tax Year 2030
              unless reauthorized by voters.
            </p>
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
            Source: Metro SHS Regional Annual Report FY2024-25, Metro Revenue
            Forecast Fall 2025.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PIT COUNT TREND (kept from original)
          ═══════════════════════════════════════════════════════════════════ */}
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
              {hracAnnual && (
                <>
                  {" "}
                  The HRAC/PSU prevalence estimate (~
                  {Number(hracAnnual.value).toLocaleString()} annually) suggests
                  the true scope is 3-4x the single-night count.
                </>
              )}
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
              Source: HUD Point-in-Time Count,
              Portland/Gresham/Multnomah County CoC.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SHS FUNDING (integrated with Q2/Q8)
          ═══════════════════════════════════════════════════════════════════ */}
      {shsFunding.length > 0 && (
        <section>
          <SectionHeader
            icon={DollarSign}
            title="SHS Revenue Trend & Forecast"
            color={ACCENT}
          />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              The Metro SHS income tax funds the regional response.
              {(() => {
                const withRevenue = shsFunding.filter((s) => s.taxRevenue > 0);
                if (withRevenue.length < 2) return "";
                const first = withRevenue[0];
                const last = withRevenue[withRevenue.length - 1];
                const peak = withRevenue.reduce(
                  (max, d) => (d.taxRevenue > max.taxRevenue ? d : max),
                  withRevenue[0],
                );
                const revM = (v: number) => `$${(v / 1e6).toFixed(0)}M`;
                if (last.taxRevenue < peak.taxRevenue) {
                  return ` Revenue peaked at ${revM(peak.taxRevenue)} (${peak.year}), declining to ${revM(last.taxRevenue)} (${last.year}).`;
                }
                return ` Revenue grew from ${revM(first.taxRevenue)} to ${revM(last.taxRevenue)}.`;
              })()}
              {" "}The tax expires after Tax Year 2030 unless reauthorized. A 22%
              budget cut has been proposed for FY 2026-27.
            </p>
            <TrendChart
              data={shsFunding
                .filter((s) => s.taxRevenue > 0)
                .map((s) => ({
                  date: `${s.year}`,
                  value: s.taxRevenue,
                }))}
              color={ACCENT}
              height={280}
              valuePrefix="$"
              yAxisDomain="auto"
            />
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-3">
              Source: Metro SHS Annual Reports, Revenue Forecast Fall 2025.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DATA SOURCES & METHODOLOGY
          ═══════════════════════════════════════════════════════════════════ */}
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
              every 1-2 years by the Portland/Gresham/Multnomah County CoC.
              Counts both sheltered and unsheltered on a single night. The
              HRAC/PSU prevalence study estimates the annual figure is 3-4x the
              PIT snapshot.
            </p>
            <p>
              <strong>By-Name List:</strong> JOHS maintains a by-name list of
              all known homeless individuals. Monthly snapshots show inflow (new
              entries) vs outflow (exits to housing).
            </p>
            <p>
              <strong>Eviction Filings:</strong> From Evicted in Oregon
              (HRAC/PSU), using Oregon Judicial Department circuit court records.
              Covers ~90% of statewide cases. Clackamas County data unavailable
              (justice courts). Updated March 15, 2026.
            </p>
            <p>
              <strong>SHS Reports:</strong> Metro Supportive Housing Services
              data from the Year 4 Regional Annual Report (FY2024-25, published
              March 2026) and Revenue Forecast (Fall 2025). Includes spending,
              outcomes, and retention by intervention type and county.
            </p>
            <p>
              <strong>Shelter Capacity:</strong> JOHS quarterly reports on beds,
              utilization, length of stay, and exit destinations.
            </p>
            <p>
              <strong>Overdose Deaths:</strong> Multnomah County Medical Examiner
              data. Includes toxicology breakdowns for fentanyl and
              methamphetamine.
            </p>
            <p>
              <strong>Affordable Housing Vacancy:</strong> KATU/Willamette Week
              investigation (Nov 2025) and Home Forward response. Flagged as
              contested — both claims displayed.
            </p>
            <p>
              <strong>HRAC Prevalence Study:</strong> Portland State University
              (2019), estimating 38,000 annual homeless and 107,039 at-risk
              households across the tri-county area. Based on 2017 data.
            </p>
          </div>

          <div className="mt-5 border-t border-[var(--color-parchment)] pt-4">
            <p className="text-[12px] font-semibold text-[var(--color-ink-muted)] mb-2">
              Data Gaps (Flagged)
            </p>
            <ul className="text-[12px] text-[var(--color-ink-muted)] space-y-1">
              <li>
                <strong>Singleton memo</strong> — Shelter effectiveness analysis
                (pending from HSD)
              </li>
              <li>
                <strong>Health Share crossover study</strong> — Behavioral
                health/homelessness overlap (pending)
              </li>
              <li>
                <strong>Survey 123 outreach data</strong> — Only ~1 quarter may
                exist
              </li>
              <li>
                <strong>HMIS exit destinations</strong> — Restricted data,
                requires PRR
              </li>
              <li>
                <strong>Metro PMC case studies</strong> — Not found online
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
