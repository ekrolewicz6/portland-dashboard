"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
import DataReconciliation, {
  type DataDispute,
} from "./DataReconciliation";
import MethodologyExplainer, {
  type DataSource,
} from "./MethodologyExplainer";
import DataSourceTimeline from "./DataSourceTimeline";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  BedDouble,
  FileText,
  Scale,
  MapPin,
  ChevronDown,
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
  /** Citation for this quarter's capacity report, when the row carries one. */
  source: string | null;
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

interface IrpMonth {
  month: string;
  uniqueReports: number;
  vehicleReports: number;
  tentReports: number;
}

interface IrpTotal {
  uniqueTotal: number;
  rawTotal: number;
  earliest: string;
  latest: string;
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
  dataSources: DataSource[];
  dataDisputes: DataDispute[];
  irpCampsiteMonthly: IrpMonth[];
  irpCampsiteTotal: IrpTotal | null;
  dataStatus: string;
}

// ── Shared Components ────────────────────────────────────────────────────

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

function StatusBadge({ status }: { status: "verified" | "partial" | "contradicted" | "in_progress" }) {
  const cfg: Record<string, { label: string; bg: string; text: string }> = {
    verified: { label: "VERIFIED", bg: "bg-green-100", text: "text-green-800" },
    partial: { label: "PARTIAL", bg: "bg-amber-100", text: "text-amber-800" },
    contradicted: { label: "CONTRADICTED", bg: "bg-red-100", text: "text-red-800" },
    in_progress: { label: "IN PROGRESS", bg: "bg-blue-100", text: "text-blue-800" },
  };
  const c = cfg[status] ?? cfg.in_progress;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--color-parchment)] rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-parchment)]/30 hover:bg-[var(--color-parchment)]/50 transition-colors"
      >
        <span className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-ink-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

export default function HomelessnessDetail() {
  const [data, setData] = useState<HomelessnessDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/homelessness/detail", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
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
    dataSources = [],
    dataDisputes = [],
    statewideByCounty = [],
    racialDisparities = [],
    shelterBedInventory = [],
    studentHomelessness = [],
    doubledUp = [],
    irpCampsiteMonthly = [],
    irpCampsiteTotal = null,
  } = data as Record<string, unknown> & typeof data;

  // ── Computed values ─────────────────────────────────────────────────
  const latestPit = pitCounts.length > 0 ? pitCounts[pitCounts.length - 1] : null;
  const prevPit = pitCounts.length >= 2 ? pitCounts[pitCounts.length - 2] : null;
  const pitChange =
    latestPit && prevPit && prevPit.totalHomeless > 0
      ? Math.round(((latestPit.totalHomeless - prevPit.totalHomeless) / prevPit.totalHomeless) * 100)
      : 0;

  const latestShelter = shelterCapacity.length > 0 ? shelterCapacity[shelterCapacity.length - 1] : null;
  const latestOD = overdoseDeaths.length > 0 ? overdoseDeaths[overdoseDeaths.length - 1] : null;
  const prevOD = overdoseDeaths.length >= 2 ? overdoseDeaths[overdoseDeaths.length - 2] : null;
  const latestShs = shsFunding.filter((s) => s.spending > 0);
  const latestShsYear = latestShs.length > 0 ? latestShs[latestShs.length - 1] : null;
  const latestShsType = shsByType.filter((t) => t.householdsServed > 0);
  const latestShsCounty = shsByCounty.filter((c) => c.householdsPlaced > 0);
  const multEvictions = evictionFilings.filter((e) => e.county === "Multnomah");

  const shelterExitPct = contextStats?.shelter_exit_to_housing_pct;
  // Bed counts come from JOHS quarterly capacity reports, with the
  // context-stats table as a secondary source. When neither has a value we
  // render "--" rather than substituting a remembered number: an unsourced
  // figure displayed beside a citation reads as sourced.
  const contextCityBeds = Number(contextStats?.city_overnight_beds?.value);
  const cityBeds =
    latestShelter?.cityOvernightBeds ??
    (Number.isFinite(contextCityBeds) && contextCityBeds > 0 ? contextCityBeds : null);
  const countyBeds = latestShelter?.county24hrBeds ?? null;
  /**
   * System-wide occupancy from the JOHS capacity report. The source publishes
   * one utilization figure for the whole shelter system, not a city/county
   * split, so this is reported once rather than attributed to either column.
   */
  const shelterUtilizationPct = latestShelter?.utilizationPct ?? null;

  // Shelter bed inventory
  const sbiTyped = shelterBedInventory as { county: string; totalBeds: number; totalHomeless: number; bedsPctOfPit: number; yearRound: number }[];
  const multco = sbiTyped.find((s) => s.county === "Multnomah");
  const statewideBeds = sbiTyped.reduce((s, r) => s + r.totalBeds, 0);
  const statewideHomeless = sbiTyped.reduce((s, r) => s + r.totalHomeless, 0);

  // Hidden homelessness
  const duTyped = doubledUp as { county: string; estimate: number; marginOfError: number }[];
  const duStatewide = duTyped.find((d) => d.county === "Statewide");
  const shTyped = studentHomelessness as { county: string; count202425: number; numericChange: number }[];

  return (
    <div className="space-y-10">
      <NewsContext category="homelessness" />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 0: DATA RECONCILIATION
          ═══════════════════════════════════════════════════════════════════ */}
      <DataReconciliation disputes={dataDisputes} />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: THE VERDICT
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="bg-[#2a2a2a] text-white rounded-sm p-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Card 1: People Homeless */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">People Homeless</p>
              <p className="text-[28px] font-mono font-bold leading-none">
                {latestPit?.totalHomeless.toLocaleString() ?? "--"}
              </p>
              <p className="text-[13px] opacity-60 mt-1">
                {pitChange !== 0 ? `${pitChange > 0 ? "+" : ""}${pitChange}% since ${prevPit?.year ?? "prior"}` : "latest PIT count"}
              </p>
            </div>

            {/* Card 2: Promised Beds */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Promised Beds</p>
              <p className="text-[28px] font-mono font-bold leading-none">
                {cityBeds !== null ? cityBeds.toLocaleString() : "--"}
              </p>
              <p className="text-[13px] opacity-60 mt-1">
                {shelterUtilizationPct !== null
                  ? `${shelterUtilizationPct}% system utilization`
                  : "city overnight"}
              </p>
            </div>

            {/* Card 3: Exit to Housing */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Exit to Housing</p>
              <p className="text-[28px] font-mono font-bold leading-none">
                {shelterExitPct ? `${shelterExitPct.value}%` : "16%"}
              </p>
              <p className="text-[13px] opacity-60 mt-1">goal was 41%</p>
            </div>

            {/* Card 4: SHS Spending/yr */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">SHS Spending/yr</p>
              <p className="text-[28px] font-mono font-bold leading-none">
                ${latestShsYear ? Math.round(latestShsYear.spending / 1e6) : 425}M
              </p>
              <p className="text-[13px] opacity-60 mt-1">16% to housing exits</p>
            </div>

            {/* Card 5: Funding Gap */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-[12px] uppercase tracking-wider opacity-70 mb-1">Funding Gap</p>
              <p className="text-[28px] font-mono font-bold leading-none">$54M</p>
              <p className="text-[13px] opacity-60 mt-1">585 beds being cut</p>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed opacity-80">
            Portland spends more on homelessness than ever before, yet the number of people on the
            streets keeps climbing. Shelter utilization sits well below capacity while beds are being
            cut. Only 16% of shelter exits lead to permanent housing -- the system absorbs people
            without moving them forward. The Supportive Housing Services tax expires in 2030 and a
            22% budget cut looms for FY 2026-27.
          </p>
          <p className="text-[11px] opacity-40 mt-4 font-mono">
            Source: HUD PIT Count &middot; JOHS Shelter Reports &middot; Metro SHS Year 4 Report &middot; MultCo Health
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: HOW BAD IS IT?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={TrendingUp} title="The Scale of the Crisis" color="#ef4444" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PIT Count Trend */}
          {pitCounts.length > 0 && (
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Point-in-Time Count
              </h3>
              <TrendChart
                data={pitCounts.map((r) => ({ date: String(r.year), value: r.totalHomeless }))}
                color={ACCENT}
                height={280}
                yAxisDomain="auto"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2">
                Source: <a href="https://www.hudexchange.info/programs/coc/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink)]">HUD PIT Count</a> -- Portland/Gresham/MultCo CoC
              </p>
            </div>
          )}

          {/* IRP Campsite Reports */}
          {(irpCampsiteMonthly as IrpMonth[]).length > 0 && (
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Campsite Reports (Monthly)
              </h3>
              <TrendChart
                data={(irpCampsiteMonthly as IrpMonth[]).map((r) => {
                  const d = new Date(r.month + "-01");
                  return {
                    date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
                    value: r.uniqueReports,
                  };
                })}
                color="#ef4444"
                height={280}
                yAxisDomain="auto"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2">
                Source: PDX Reporter / IRP (de-duplicated).
                {(irpCampsiteTotal as IrpTotal | null) && ` ${(irpCampsiteTotal as IrpTotal).uniqueTotal.toLocaleString()} unique reports since ${(irpCampsiteTotal as IrpTotal).earliest}.`}
              </p>
            </div>
          )}
        </div>

        {/* Racial disparities — compact bars */}
        {(racialDisparities as { raceGroup: string; disparityRatio: number | null; pctOfPopulation: number | null; pctOfPit: number | null }[]).filter((d) => d.disparityRatio !== null && (d.disparityRatio ?? 0) > 0).length > 0 && (
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
              Racial Disparities -- Overrepresentation in Homelessness
            </h3>
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4 leading-relaxed">
              How many times more likely each group is to experience homelessness relative to their population share.
              A ratio of 1.0x = proportional representation.
            </p>
            <div className="space-y-2.5">
              {(racialDisparities as { raceGroup: string; disparityRatio: number | null }[])
                .filter((d) => d.disparityRatio !== null && (d.disparityRatio ?? 0) > 0)
                .map((d) => (
                  <div key={d.raceGroup} className="flex items-center gap-3">
                    <span className="text-[13px] text-[var(--color-ink)] w-[220px] flex-shrink-0 truncate">
                      {d.raceGroup}
                    </span>
                    <div className="flex-1 h-5 bg-[var(--color-parchment)]/40 rounded-sm overflow-hidden relative">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.min(100, ((d.disparityRatio ?? 0) / 7) * 100)}%`,
                          backgroundColor: (d.disparityRatio ?? 0) > 1 ? "#b85c3a" : "#7c8a4c",
                        }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold tabular-nums text-[var(--color-ink)]">
                        {d.disparityRatio}x
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <p className="mt-3 text-[11px] text-[var(--color-ink-muted)] font-mono">
              Source: PSU HRAC 2025 Statewide Estimates. Population: Census ACS B03002.
            </p>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: WHAT DID WE PROMISE?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={Scale} title="Promise vs. Reality" color={ACCENT} />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] text-left">
                <th className="py-2 pr-4 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Promise</th>
                <th className="py-2 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] text-right">Target</th>
                <th className="py-2 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] text-right">Actual</th>
                <th className="py-2 pl-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-parchment)]/50">
                <td className="py-3 pr-4 text-[var(--color-ink)]">SHS 10-year PSH goal</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">5,000 units</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">4,887 (Yr 4)</td>
                <td className="py-3 pl-3"><StatusBadge status="in_progress" /></td>
              </tr>
              <tr className="border-b border-[var(--color-parchment)]/50">
                <td className="py-3 pr-4 text-[var(--color-ink)]">Shelter exit to housing rate</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">41%</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">{shelterExitPct ? `${shelterExitPct.value}%` : "16%"}</td>
                <td className="py-3 pl-3"><StatusBadge status="contradicted" /></td>
              </tr>
              <tr className="border-b border-[var(--color-parchment)]/50">
                <td className="py-3 pr-4 text-[var(--color-ink)]">Prevention households (10-yr)</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">8,300</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">19,134 (2.3x)</td>
                <td className="py-3 pl-3"><StatusBadge status="verified" /></td>
              </tr>
              <tr className="border-b border-[var(--color-parchment)]/50">
                <td className="py-3 pr-4 text-[var(--color-ink)]">Year 4 shelter beds created</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">2,012</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">2,499</td>
                <td className="py-3 pl-3"><StatusBadge status="verified" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[var(--color-ink)]">PSH retention rate</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">90%</td>
                <td className="py-3 px-3 text-right tabular-nums font-mono">92%</td>
                <td className="py-3 pl-3"><StatusBadge status="verified" /></td>
              </tr>
            </tbody>
          </table>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-3 font-mono">
            Source: Metro SHS Year 4 Regional Annual Report (FY2024-25, published March 2026).
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: WHERE DOES THE MONEY GO?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={DollarSign} title="Follow the Money" color={ACCENT} />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          {/* Part A: SHS Revenue Trend */}
          {shsFunding.filter((s) => s.taxRevenue > 0).length > 0 && (
            <div className="mb-6">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                SHS Revenue by Year
              </h3>
              <TrendChart
                data={shsFunding
                  .filter((s) => s.taxRevenue > 0)
                  .map((s) => ({ date: `${s.year}`, value: s.taxRevenue }))}
                color={ACCENT}
                height={260}
                valuePrefix="$"
                yAxisDomain="auto"
              />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-2">
                Revenue grew from $56M to $425M. Tax expires after 2030 unless reauthorized.
              </p>
            </div>
          )}

          {/* Part B: Intervention type bars */}
          {latestShsType.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Year 4 Spending by Intervention
              </h3>
              <div className="space-y-3">
                {(() => {
                  const labels: Record<string, string> = {
                    psh: "Permanent Supportive Housing",
                    rapid_rehousing: "Rapid Rehousing",
                    prevention: "Homelessness Prevention",
                    shelter: "Shelter Beds Created",
                  };
                  const maxServed = Math.max(...latestShsType.map((t) => t.householdsServed));
                  return latestShsType.map((t) => {
                    const pct = Math.round((t.householdsServed / maxServed) * 100);
                    return (
                      <div key={t.interventionType}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                            {labels[t.interventionType] ?? t.interventionType}
                          </span>
                          <span className="text-[14px] font-mono font-semibold text-[var(--color-ink)]">
                            {t.householdsServed.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-6 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: ACCENT }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Part C: Three-county comparison */}
          {latestShsCounty.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
                Three-County Comparison (Households Placed)
              </h3>
              <div className="space-y-3">
                {latestShsCounty.map((c) => {
                  const colors: Record<string, string> = {
                    Multnomah: "#4f46e5",
                    Washington: "#7c3aed",
                    Clackamas: "#a78bfa",
                  };
                  const color = colors[c.county] ?? "#4f46e5";
                  const maxPlaced = Math.max(...latestShsCounty.map((x) => x.householdsPlaced));
                  const pct = maxPlaced > 0 ? Math.round((c.householdsPlaced / maxPlaced) * 100) : 0;
                  return (
                    <div key={c.county}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                          {c.county}
                        </span>
                        <span className="text-[11px] text-[var(--color-ink-muted)]">
                          {c.allocation > 0 && `$${Math.round(c.allocation / 1e6)}M allocated`}
                        </span>
                      </div>
                      <div className="h-7 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm flex items-center px-3"
                          style={{ width: `${Math.max(pct, 12)}%`, backgroundColor: color }}
                        >
                          <span className="text-[12px] font-mono font-semibold text-white">
                            {c.householdsPlaced.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[11px] text-[var(--color-ink-muted)] mt-4 font-mono">
            Source: Metro SHS Regional Annual Reports &middot; Revenue Forecast Fall 2025.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: THE SHELTER PARADOX
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={BedDouble} title="The Shelter Paradox" color="#d97706" />

        {/* Two boxes: city vs county */}
        {/*
          The JOHS capacity report gives bed counts split by city overnight vs
          county 24-hour, but publishes only one system-wide utilization
          figure. The two bed counts are shown per category; occupancy is
          reported once, below, so neither column carries a rate the source
          does not break out.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 text-center">
            <p className="text-[11px] font-semibold text-amber-800/60 uppercase tracking-wider mb-1">
              City Overnight Shelters
            </p>
            <p className="text-[36px] font-mono font-bold text-amber-700 leading-none">
              {cityBeds !== null ? cityBeds.toLocaleString() : "--"}
            </p>
            <p className="text-[13px] text-amber-600/70 mt-1">beds</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-5 text-center">
            <p className="text-[11px] font-semibold text-green-800/60 uppercase tracking-wider mb-1">
              County 24-Hour Shelters
            </p>
            <p className="text-[36px] font-mono font-bold text-green-700 leading-none">
              {countyBeds !== null && countyBeds > 0 ? countyBeds.toLocaleString() : "--"}
            </p>
            <p className="text-[13px] text-green-600/70 mt-1">beds</p>
          </div>
        </div>
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 mb-6">
          {shelterUtilizationPct !== null ? (
            <p className="text-[13px] text-[var(--color-ink)] leading-relaxed">
              <strong>System-wide occupancy: {shelterUtilizationPct}%</strong>{" "}
              across all shelter types in {latestShelter?.quarter ?? "the latest quarter"}.
              The source reports one occupancy rate for the whole system, so it
              cannot be split between the two columns above.
            </p>
          ) : (
            <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
              Occupancy rate unavailable for the latest quarter.
            </p>
          )}
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-2 font-mono">
            Source: {latestShelter?.source ?? "JOHS Shelter Capacity Report"}.
          </p>
        </div>

        {/* By-name list: total on list + net monthly change */}
        {byNameList.length > 0 && (
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 mb-6">
            <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
              By-Name List: People Experiencing Homelessness Over Time
            </h3>
            <TrendChart
              data={byNameList
                .filter((b) => b.totalOnList > 0)
                .map((b) => {
                  const d = new Date(b.month);
                  return {
                    date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
                    value: b.totalOnList,
                  };
                })}
              height={280}
              color="#b85c3a"
              yAxisDomain="auto"
            />
            {(() => {
              const sorted = byNameList.filter((b) => b.totalOnList > 0).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
              if (sorted.length >= 2) {
                const first = sorted[0];
                const last = sorted[sorted.length - 1];
                const netChange = last.totalOnList - first.totalOnList;
                const months = sorted.length - 1;
                const avgMonthly = months > 0 ? Math.round(netChange / months) : 0;
                return (
                  <p className="text-[14px] text-[var(--color-ink-light)] mt-3">
                    The by-name list grew from {first.totalOnList.toLocaleString()} to{" "}
                    {last.totalOnList.toLocaleString()} — a net increase of{" "}
                    <strong>{netChange.toLocaleString()}</strong> people over {months} months
                    (~{avgMonthly.toLocaleString()}/month).
                  </p>
                );
              }
              return null;
            })()}
            <p className="text-[12px] text-[var(--color-ink-muted)]/60 mt-2">
              Source:{" "}
              <a href="https://www.multco.us/johs" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">
                JOHS By-Name List
              </a>, monthly.
            </p>
          </div>
        )}

        {/* Shelter Gap stats */}
        {sbiTyped.length > 0 && (
          <StatGrid
            accentColor="#d97706"
            stats={[
              {
                label: "MultCo Shelter Beds",
                value: multco?.totalBeds.toLocaleString() ?? "--",
              },
              {
                label: "MultCo PIT Covered",
                value: `${multco?.bedsPctOfPit ?? "--"}%`,
              },
              {
                label: "Statewide Beds",
                value: statewideBeds.toLocaleString(),
              },
              {
                label: "Statewide Coverage",
                value: `${statewideHomeless > 0 ? Math.round((statewideBeds / statewideHomeless) * 100) : "--"}%`,
              },
            ]}
          />
        )}

        <div className="mt-6">
          <DataNeeded
            title="Which shelter models produce the best housing outcomes"
            description="No public data currently tracks whether 24-hour shelters vs. overnight shelters produce better housing exits, or at what cost per placement. This is the most important missing metric in the system."
            actions={[
              { label: "Request shelter outcome data from JOHS/HSD", type: "prr" },
            ]}
            color="#d97706"
          />
        </div>
        <p className="text-[11px] text-[var(--color-ink-muted)] mt-3 font-mono">
          Source: JOHS Shelter Reports &middot; PSU HRAC 2025 HIC data (Table 17).
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: HEALTH AND SURVIVAL
          ═══════════════════════════════════════════════════════════════════ */}
      {overdoseDeaths.length > 0 && (
        <section>
          <SectionHeader icon={Heart} title="Health & Survival" color="#b85c3a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {/* Key stat callout — match the chart metric */}
            {latestOD && (
              <div className="bg-[#b85c3a]/10 border border-[#b85c3a]/20 rounded-sm p-4 mb-5">
                <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                  {latestOD.totalOdDeathsHomeless > 0
                    ? `${latestOD.totalOdDeathsHomeless.toLocaleString()} overdose deaths among unhoused in ${latestOD.year}`
                    : `Fentanyl deaths among unhoused: ${latestOD.fentanylDeathsHomeless} in ${latestOD.year}`}
                  {prevOD && latestOD.totalOdDeathsHomeless > 0 && prevOD.totalOdDeathsHomeless > 0
                    ? ` (${latestOD.totalOdDeathsHomeless < prevOD.totalOdDeathsHomeless ? "down" : "up"} ${Math.abs(Math.round(((latestOD.totalOdDeathsHomeless - prevOD.totalOdDeathsHomeless) / prevOD.totalOdDeathsHomeless) * 100))}% from ${prevOD.year})`
                    : ""}
                  {latestOD.totalHomelessDeaths > 0
                    ? `. Total unhoused deaths: ${latestOD.totalHomelessDeaths.toLocaleString()}.`
                    : ""}
                </p>
              </div>
            )}

            {/* Fentanyl trend (2017-2024, 8 points) — shows the full crisis arc */}
            <h4 className="text-[13px] font-semibold text-[var(--color-ink-muted)] mb-2">
              Fentanyl Deaths Among Unhoused Portlanders
            </h4>
            <TrendChart
              data={overdoseDeaths
                .filter((d) => d.fentanylDeathsHomeless > 0)
                .map((d) => ({
                  date: String(d.year),
                  value: d.fentanylDeathsHomeless,
                }))}
              height={260}
              color="#b85c3a"
              yAxisDomain="auto"
            />
            <p className="text-[14px] text-[var(--color-ink-light)] mt-2 leading-relaxed">
              Fentanyl deaths among unhoused Portlanders surged from near-zero before 2020 to a peak of 251 in 2023, then declined to 183 in 2024 ({Math.round(((183 - 251) / 251) * 100)}%).
              {latestOD && latestOD.totalOdDeathsHomeless > 0 && (
                <> Fentanyl was involved in {latestOD.totalOdDeathsHomeless > 0 ? Math.round((latestOD.fentanylDeathsHomeless / latestOD.totalOdDeathsHomeless) * 100) : 0}% of all overdose deaths.</>
              )}
            </p>
            <p className="text-[12px] text-[var(--color-ink-muted)]/60 mt-2 font-mono tracking-wider">
              Source:{" "}
              <a href="https://multco.us/file/domicile_unknown_report/download" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">
                Multnomah County Medical Examiner · Domicile Unknown Report
              </a>
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: THE INFLOW PROBLEM
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={TrendingUp} title="Why the Number Keeps Growing" color="#ef4444" />

        {/* Eviction filing trend */}
        {multEvictions.length > 0 && (
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 mb-6">
            <h3 className="text-[12px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
              Multnomah County Eviction Filings
            </h3>
            <TrendChart
              data={multEvictions.map((e) => {
                const d = new Date(e.month);
                return {
                  date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
                  value: e.filings,
                };
              })}
              color="#ef4444"
              height={260}
              yAxisDomain="auto"
            />
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-2">
              Source: Evicted in Oregon / HRAC PSU (circuit court data, ~90% of cases).
            </p>
          </div>
        )}

        {/* Root cause cards - 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)] rounded-sm p-4">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
              Housing Scarcity
            </p>
            <p className="text-[14px] text-[var(--color-ink)] leading-snug">
              Portland is short ~20,000 affordable units. Vacancy rate below 5%.
            </p>
          </div>
          <div className="bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)] rounded-sm p-4">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
              Evictions Rising
            </p>
            <p className="text-[14px] text-[var(--color-ink)] leading-snug">
              Multnomah: 7 per 100 rentals/yr (highest in OR). Washington: 5 per 100.
            </p>
          </div>
          <div className="bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)] rounded-sm p-4">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
              Treatment Gap
            </p>
            <p className="text-[14px] text-[var(--color-ink)] leading-snug">
              Oregon needs 3,714 more behavioral health beds. Current statewide: 4,819.
            </p>
          </div>
          <div className="bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)] rounded-sm p-4">
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
              Prevalence Gap
            </p>
            <p className="text-[14px] text-[var(--color-ink)] leading-snug">
              PIT: {latestPit?.totalHomeless.toLocaleString() ?? "--"}.
              HRAC annual estimate: ~38,000. Actual scale is 3-4x the snapshot.
            </p>
          </div>
        </div>

        {/* Home Forward vacancy callout */}
        {affordableVacancy.length > 0 && affordableVacancy.some((v) => v.vacantUnits > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6">
            <p className="text-[13px] text-amber-800">
              <strong>Home Forward vacancy:</strong>{" "}
              {affordableVacancy.filter((v) => v.vacantUnits > 0).map((v) =>
                `${v.vacantUnits.toLocaleString()} empty units (${v.vacancyPct}% vacancy)`
              ).join("; ")}
              . Average unit takes 185 days to fill.
            </p>
            <p className="text-[11px] text-amber-700/60 mt-1">
              Contested: Home Forward disputes some figures. Source: KATU/Willamette Week (Nov 2025).
            </p>
          </div>
        )}

        {/* Hidden homelessness callout */}
        <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)] rounded-sm p-4">
          <p className="text-[13px] text-[var(--color-ink)] leading-relaxed">
            <strong>Hidden homelessness:</strong> The PIT count misses people
            who are doubled up and students experiencing homelessness
            statewide. Doubled up:{" "}
            {duStatewide ? `~${duStatewide.estimate.toLocaleString()}` : "not available"}. Students:{" "}
            {(() => {
              const stateTotal = shTyped.reduce((s, r) => s + r.count202425, 0);
              return stateTotal > 0 ? stateTotal.toLocaleString() : "not available";
            })()}
            .
          </p>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-2 font-mono">
            Source: PSU HRAC 2025 Tables 19-20 &middot; ACS 2024 &middot; ODE Report Card 2024-25.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: WHAT HAPPENS NEXT?
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={AlertTriangle} title="The Funding Cliff" color="#b85c3a" />
        <div className="bg-[#b85c3a]/10 border border-[#b85c3a]/30 rounded-sm p-6">
          <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-4">
            Five risks converging in 2026-2027:
          </p>
          <ol className="space-y-3 text-[14px] text-[var(--color-ink)] leading-relaxed list-decimal list-inside">
            <li>
              <strong>SHS budget cut (22%):</strong> Proposed $54M reduction for FY 2026-27, eliminating 585 shelter beds and reducing outreach capacity.
            </li>
            <li>
              <strong>Federal CoC cuts:</strong> Continuum of Care reductions will eliminate housing for ~1,109 households annually.
            </li>
            <li>
              <strong>Emergency Housing Voucher termination:</strong> ~546 vouchers at risk, with no replacement program.
            </li>
            <li>
              <strong>SHS tax expiration (2030):</strong> The primary funding source expires unless reauthorized by voters. No campaign has begun.
            </li>
            <li>
              <strong>City-county governance split:</strong> Portland and Multnomah County dispute the count, methodology, and responsibility. Partnership agreement expires July 2027.
            </li>
          </ol>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-4 font-mono">
            Source: Metro Revenue Forecast Fall 2025 &middot; JOHS Budget Memos &middot; OPB/Portland Tribune reporting.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 9: CONTEXT & METHODOLOGY
          ═══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader icon={MapPin} title="Context & Methodology" color="#4a7f9e" />
        <div className="space-y-3">
          {/* Statewide comparison table */}
          {(statewideByCounty as { county: string; total: number; ratePer1000: number; unshelteredPct: number }[]).length > 0 && (
            <Collapsible title="Statewide Comparison by County">
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4 leading-relaxed">
                Oregon recorded 27,119 people experiencing homelessness statewide in January 2025 -- a 34.9%
                increase from 2023. Rates below are per 1,000 residents.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--color-parchment)] text-left">
                      <th className="py-2 pr-4 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">County</th>
                      <th className="py-2 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] text-right">Total</th>
                      <th className="py-2 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] text-right">Rate/1K</th>
                      <th className="py-2 px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] text-right">Unsheltered %</th>
                      <th className="py-2 pl-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statewideByCounty as { county: string; total: number; ratePer1000: number; unshelteredPct: number }[])
                      .slice(0, 15)
                      .map((c) => (
                        <tr
                          key={c.county}
                          className={`border-b border-[var(--color-parchment)]/50 ${c.county === "Multnomah" ? "bg-[var(--color-parchment)]/30 font-semibold" : ""}`}
                        >
                          <td className="py-2 pr-4 text-[var(--color-ink)]">{c.county}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{c.total.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{c.ratePer1000}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{c.unshelteredPct}%</td>
                          <td className="py-2 pl-3">
                            <div className="h-2 rounded-sm overflow-hidden bg-[var(--color-parchment)]/60 max-w-[120px]">
                              <div
                                className="h-full rounded-sm"
                                style={{
                                  width: `${Math.min(100, (c.ratePer1000 / 30) * 100)}%`,
                                  backgroundColor: c.county === "Multnomah" ? "#8b6c5c" : "#4a7f9e",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-[var(--color-ink-muted)] font-mono">
                Source: PSU HRAC 2025 Oregon Statewide Homelessness Estimates (Tables 1-2).
              </p>
            </Collapsible>
          )}

          {/* Data sources methodology */}
          <Collapsible title="Data Sources & Methodology">
            <div className="space-y-2 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
              <p>
                <strong>Point-in-Time Count:</strong> HUD-mandated count conducted
                every 1-2 years by the Portland/Gresham/Multnomah County CoC.
                Counts both sheltered and unsheltered on a single night.
              </p>
              <p>
                <strong>By-Name List:</strong> JOHS maintains a by-name list of
                all known homeless individuals. Monthly snapshots show inflow (new
                entries) vs outflow (exits to housing).
              </p>
              <p>
                <strong>Eviction Filings:</strong> From Evicted in Oregon
                (HRAC/PSU), using Oregon Judicial Department circuit court records.
                Covers ~90% of statewide cases.
              </p>
              <p>
                <strong>SHS Reports:</strong> Metro Supportive Housing Services
                data from the Year 4 Regional Annual Report (FY2024-25, published
                March 2026).
              </p>
              <p>
                <strong>Shelter Capacity:</strong> JOHS quarterly reports on beds,
                utilization, length of stay, and exit destinations.
              </p>
              <p>
                <strong>Overdose Deaths:</strong> Multnomah County Medical Examiner
                data with toxicology breakdowns.
              </p>
              <p>
                <strong>IRP Campsite Reports:</strong> PDX Reporter data, de-duplicated
                by location and date window.
              </p>
            </div>
          </Collapsible>

          {/* Timeline + Methodology */}
          <Collapsible title="Data Freshness Timeline">
            <DataSourceTimeline sources={dataSources} />
            <div className="mt-4">
              <MethodologyExplainer sources={dataSources} />
            </div>
          </Collapsible>
        </div>
      </section>
    </div>
  );
}
