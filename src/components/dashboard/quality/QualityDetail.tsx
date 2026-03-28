"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
import {
  Trees,
  Route,
  BookOpen,
  DollarSign,
  Train,
  Wind,
  Landmark,
  Wifi,
  AlertCircle,
} from "lucide-react";

const COLOR = "#6a7f8a";

// ── Types ────────────────────────────────────────────────────────────────

interface ParkStats {
  totalParks: number;
  totalAcres: number;
  avgAcres: number;
  largestPark: { name: string; acres: number } | null;
}

interface PavementSummary {
  avgPci: number;
  good: number;
  fair: number;
  poor: number;
  totalSegments: number;
}

interface LibraryExtended {
  fiscalYear: number;
  visits: number;
  circulation: number;
  programs: number;
  attendance: number;
  registeredUsers: number;
}

interface AffordabilityRow {
  year: number;
  metric: string;
  value: number;
  source: string;
}

interface NeighborhoodIncome {
  neighborhoods: number;
  avgMedianIncome: number;
  minIncome: number;
  maxIncome: number;
  avgPovertyRate: number;
}

interface AirQuality {
  latest: { date: string; aqi: number; category: string; pollutant: string } | null;
  trend: { date: string; value: number }[];
  smokeDays: { year: number; days: number }[];
}

interface TransitRidership {
  byYear: { year: number; total: number; onTimePct: number | null }[];
  byMode: Record<string, { year: number; ridership: number }[]>;
}

interface ContextStat {
  value: string;
  context: string;
  source: string;
  asOfDate: string | null;
}

interface QualityDetailData {
  parkStats: ParkStats;
  pavementSummary: PavementSummary;
  pavementByYear: { year: number; avgPci: number; count: number }[];
  libraryTrend: { year: number; visits: number }[];
  libraryExtended: LibraryExtended | null;
  affordability: AffordabilityRow[];
  neighborhoodIncome: NeighborhoodIncome | null;
  airQuality: AirQuality | null;
  transitRidership: TransitRidership | null;
  culturalInstitutions: { name: string; type: string }[];
  culturalCount: number;
  contextStats: Record<string, ContextStat>;
  dataStatus: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Format "2026-03-10" → "Mar 10" */
function shortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SourceNote({ source }: { source: string }) {
  return (
    <p className="text-[10px] text-[var(--color-ink-muted)]/50 mt-3 font-mono">
      Source: {source}
    </p>
  );
}

function getAffordabilityMetric(
  rows: AffordabilityRow[],
  metric: string,
  year?: number
): AffordabilityRow | undefined {
  const filtered = rows.filter((r) => r.metric === metric);
  if (year) return filtered.find((r) => r.year === year);
  return filtered.sort((a, b) => b.year - a.year)[0]; // latest
}

// ── Main Component ───────────────────────────────────────────────────────

export default function QualityDetail() {
  const [data, setData] = useState<QualityDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/quality/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-64" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-[var(--color-ink-muted)] text-[14px]">
        Unable to load quality of life detail data.
      </p>
    );
  }

  const {
    parkStats,
    pavementSummary,
    libraryTrend,
    libraryExtended,
    affordability,
    neighborhoodIncome,
    airQuality,
    transitRidership,
    culturalInstitutions,
    culturalCount,
    contextStats,
  } = data;

  // Derived values
  const latestLib = libraryTrend.length > 0 ? libraryTrend[libraryTrend.length - 1] : null;
  const pciLabel =
    pavementSummary.avgPci >= 70
      ? "Good"
      : pavementSummary.avgPci >= 40
        ? "Fair"
        : "Poor";

  const rentBurden = getAffordabilityMetric(affordability, "rent_burden_pct");
  const medianRent = getAffordabilityMetric(affordability, "median_rent");
  const medianIncome = getAffordabilityMetric(affordability, "median_income");
  const latestCpi = getAffordabilityMetric(affordability, "cpi");

  const treeCanopy = contextStats["tree_canopy_pct"];
  const broadband = contextStats["broadband_pct"];
  const broadbandProviders = contextStats["broadband_providers"];
  const bachelors = contextStats["bachelors_or_higher_pct"];
  const trailMiles = contextStats["trail_miles"];
  const bikeMiles = contextStats["bike_lane_miles"];

  // CPI → year-over-year inflation %
  const cpiRaw = affordability
    .filter((r) => r.metric === "cpi")
    .sort((a, b) => a.year - b.year);
  const inflationTrend = cpiRaw.slice(1).map((r, i) => ({
    date: String(r.year),
    value: Math.round(((r.value - cpiRaw[i].value) / cpiRaw[i].value) * 1000) / 10,
  }));

  // Transit trend data
  const transitTrend = transitRidership?.byYear.map((r) => ({
    date: String(r.year),
    value: Math.round(r.total / 1_000_000),
  })) ?? [];

  // Pavement condition percentages
  const total = pavementSummary.totalSegments || 1;
  const goodPct = Math.round((pavementSummary.good / total) * 100);
  const fairPct = Math.round((pavementSummary.fair / total) * 100);
  const poorPct = Math.round((pavementSummary.poor / total) * 100);

  // Library trend chart data
  const libChartData = libraryTrend.map((r) => ({
    date: String(r.year),
    value: r.visits,
  }));

  // Income inequality ratio
  const incomeRatio =
    neighborhoodIncome && neighborhoodIncome.minIncome > 0
      ? Math.round(neighborhoodIncome.maxIncome / neighborhoodIncome.minIncome)
      : null;

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="quality_of_life" />

      {/* ── Narrative Summary ─────────────────────────────────────────── */}
      <section>
        <InfoCard>
          <p className="text-[14px] text-[var(--color-ink)] leading-relaxed">
            Quality of life in Portland spans affordability, mobility, environmental health,
            parks, culture, learning, and digital access. This dashboard tracks{" "}
            <strong>real data across 7 dimensions</strong> to answer:{" "}
            <em>Does Portland work as a place to live?</em>
          </p>
        </InfoCard>
      </section>

      {/* ── 1. Affordability & Cost of Living ─────────────────────────── */}
      <section>
        <SectionHeader icon={DollarSign} title="Affordability & Cost of Living" />

        <StatGrid
          accentColor="#b85c3a"
          stats={[
            {
              label: "Rent-Burdened Households",
              value: rentBurden ? `${Math.round(rentBurden.value)}%` : "—",
              subtitle: rentBurden ? `Paying 30%+ of income on rent (${rentBurden.year})` : "Census ACS data pending",
            },
            {
              label: "Median Gross Rent",
              value: medianRent ? `$${Math.round(medianRent.value).toLocaleString()}` : "—",
              subtitle: medianRent ? `Per month (${medianRent.year})` : "Census ACS data pending",
            },
            {
              label: "Median Household Income",
              value: medianIncome
                ? `$${Math.round(medianIncome.value).toLocaleString()}`
                : neighborhoodIncome
                  ? `$${neighborhoodIncome.avgMedianIncome.toLocaleString()}`
                  : "—",
              subtitle: medianIncome
                ? `(${medianIncome.year})`
                : neighborhoodIncome
                  ? `Avg across ${neighborhoodIncome.neighborhoods} neighborhoods`
                  : undefined,
            },
            {
              label: "Income Inequality",
              value: incomeRatio ? `${incomeRatio}:1` : "—",
              subtitle: neighborhoodIncome
                ? `Richest ($${(neighborhoodIncome.maxIncome / 1000).toFixed(0)}K) vs poorest ($${(neighborhoodIncome.minIncome / 1000).toFixed(0)}K) neighborhood`
                : undefined,
            },
          ]}
        />

        {neighborhoodIncome && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)]">
              Across {neighborhoodIncome.neighborhoods} Portland neighborhoods, median income
              ranges from ${neighborhoodIncome.minIncome.toLocaleString()} to $
              {neighborhoodIncome.maxIncome.toLocaleString()}. Average poverty rate:{" "}
              {neighborhoodIncome.avgPovertyRate}%.
            </p>
            <SourceNote source="U.S. Census ACS / economy.neighborhood_income" />
          </InfoCard>
        )}

        {inflationTrend.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Annual inflation rate for Portland-area metro. Prices rose{" "}
              {Math.round(((cpiRaw[cpiRaw.length - 1].value - cpiRaw[0].value) / cpiRaw[0].value) * 100)}%
              {" "}total from {cpiRaw[0].year} to {cpiRaw[cpiRaw.length - 1].year}.
            </p>
            <TrendChart data={inflationTrend} color="#b85c3a" height={220} valueSuffix="%" />
            <SourceNote source="BLS Consumer Price Index (West Size Class B/C metros)" />
          </InfoCard>
        )}
      </section>

      {/* ── 2. Getting Around ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Train} title="Getting Around" />

        <StatGrid
          accentColor="#4a7c6f"
          stats={[
            {
              label: "Avg Street PCI",
              value: `${pavementSummary.avgPci}`,
              subtitle: `${pciLabel} — ${pavementSummary.totalSegments.toLocaleString()} segments`,
            },
            {
              label: "Transit Ridership",
              value: transitRidership?.byYear.length
                ? `${(transitRidership.byYear[transitRidership.byYear.length - 1].total / 1_000_000).toFixed(1)}M`
                : "—",
              subtitle: transitRidership?.byYear.length
                ? `Annual rides (${transitRidership.byYear[transitRidership.byYear.length - 1].year})`
                : "TriMet data pending",
            },
            {
              label: "Bike Lane Miles",
              value: bikeMiles ? Math.round(Number(bikeMiles.value)).toLocaleString() : "—",
              subtitle: "Citywide bike network",
            },
            {
              label: "Trail Miles",
              value: trailMiles ? Math.round(Number(trailMiles.value)).toLocaleString() : "—",
              subtitle: "Parks & greenway trails",
            },
          ]}
        />

        {/* Pavement Condition Bar */}
        <InfoCard className="mt-4">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            {pavementSummary.totalSegments.toLocaleString()} street segments rated by Pavement Condition Index (PCI).
          </p>

          <div className="flex h-10 rounded-sm overflow-hidden mb-4">
            {goodPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${goodPct}%`, backgroundColor: "#3d7a5a" }}
              >
                {goodPct}%
              </div>
            )}
            {fairPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${fairPct}%`, backgroundColor: "#c8956c" }}
              >
                {fairPct}%
              </div>
            )}
            {poorPct > 0 && (
              <div
                className="flex items-center justify-center text-[12px] font-mono font-semibold text-white"
                style={{ width: `${poorPct}%`, backgroundColor: "#b85c3a" }}
              >
                {poorPct}%
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-[12px] text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3d7a5a" }} />
              Good (&gt;70): {pavementSummary.good.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#c8956c" }} />
              Fair (40-70): {pavementSummary.fair.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#b85c3a" }} />
              Poor (&lt;40): {pavementSummary.poor.toLocaleString()}
            </span>
          </div>
          <SourceNote source="PBOT Pavement Condition Index" />
        </InfoCard>

        {/* Transit Ridership Trend */}
        {transitTrend.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Annual TriMet ridership (millions). COVID-19 caused a ~50% drop in 2020; ridership
              has been recovering but remains below 2019 levels.
            </p>
            <TrendChart
              data={transitTrend}
              color="#4a7c6f"
              height={240}
              valueSuffix="M"
            />
            <SourceNote source="TriMet Annual Performance Reports" />
          </InfoCard>
        )}

        {/* Transit mode breakdown for latest year */}
        {transitRidership && transitRidership.byMode && (() => {
          const latestYear = transitRidership.byYear[transitRidership.byYear.length - 1]?.year;
          if (!latestYear) return null;
          const modes = ["bus", "max", "streetcar", "wes"] as const;
          const modeLabels: Record<string, string> = {
            bus: "Bus",
            max: "MAX Light Rail",
            streetcar: "Streetcar",
            wes: "WES Commuter Rail",
          };
          const modeData = modes
            .map((m) => {
              const entry = transitRidership.byMode[m]?.find((r) => r.year === latestYear);
              return entry ? { mode: modeLabels[m], ridership: entry.ridership } : null;
            })
            .filter((x): x is { mode: string; ridership: number } => x !== null);
          const maxRidership = Math.max(...modeData.map((d) => d.ridership));

          return (
            <InfoCard className="mt-4">
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-5">
                Annual ridership by mode ({latestYear}).
              </p>
              <div className="space-y-3">
                {modeData.map((d) => (
                  <div key={d.mode}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[13px] font-medium text-[var(--color-ink)]">{d.mode}</span>
                      <span className="text-[13px] font-mono text-[var(--color-ink-muted)]">
                        {(d.ridership / 1_000_000).toFixed(1)}M rides
                      </span>
                    </div>
                    <div className="h-6 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.max((d.ridership / maxRidership) * 100, 2)}%`,
                          backgroundColor: "#4a7c6f",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <SourceNote source="TriMet Annual Performance Reports" />
            </InfoCard>
          );
        })()}
      </section>

      {/* ── 3. Air & Environment ──────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Wind} title="Air & Environment" />

        <StatGrid
          accentColor="#5a8a6a"
          stats={[
            {
              label: "Current AQI",
              value: airQuality?.latest ? String(airQuality.latest.aqi) : "—",
              subtitle: airQuality?.latest
                ? `${airQuality.latest.category} (${airQuality.latest.pollutant}, ${airQuality.latest.date})`
                : "AirNow data pending (needs API key)",
            },
            {
              label: "Tree Canopy",
              value: treeCanopy ? `${treeCanopy.value}%` : "—",
              subtitle: treeCanopy?.context || "Metro RLIS data pending",
            },
            {
              label: "Wildfire Smoke Days",
              value:
                airQuality?.smokeDays.length
                  ? String(airQuality.smokeDays[airQuality.smokeDays.length - 1].days)
                  : "—",
              subtitle:
                airQuality?.smokeDays.length
                  ? `Days with AQI > 100 (${airQuality.smokeDays[airQuality.smokeDays.length - 1].year})`
                  : "Derived from AirNow historical",
            },
            {
              label: "Community Gardens",
              value: contextStats["community_gardens"]?.value ?? "—",
              subtitle: contextStats["community_gardens"]?.context || "Portland Parks data pending",
            },
          ]}
        />

        {airQuality && airQuality.trend.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Daily average PM2.5 AQI for Portland. AQI under 50 is Good; 51-100 is Moderate;
              above 100 is Unhealthy for Sensitive Groups.
            </p>
            <TrendChart
              data={airQuality.trend.map((d) => ({ ...d, date: shortDate(d.date) }))}
              color="#5a8a6a"
              height={240}
            />
            <SourceNote source="AirNow API (EPA)" />
          </InfoCard>
        )}

        {!airQuality && (
          <DataNeeded
            title="Air quality monitoring"
            description="Real-time and historical AQI from the EPA's AirNow API. Tracks PM2.5, ozone, and wildfire smoke days. Already scripted — just needs AIRNOW_API_KEY."
            actions={[
              { label: "Get free AirNow API key", type: "api_key", href: "https://docs.airnowapi.org/account/request/" },
            ]}
            color={COLOR}
          />
        )}
      </section>

      {/* ── 4. Parks & Recreation ─────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Trees} title="Parks & Recreation" />

        <StatGrid
          accentColor={COLOR}
          stats={[
            {
              label: "Total Parks",
              value: parkStats.totalParks.toLocaleString(),
            },
            {
              label: "Total Acreage",
              value: parkStats.totalAcres.toLocaleString(),
            },
            {
              label: "Largest Park",
              value: parkStats.largestPark
                ? parkStats.largestPark.name
                : "—",
              subtitle: parkStats.largestPark
                ? `${Math.round(parkStats.largestPark.acres).toLocaleString()} acres`
                : undefined,
            },
            {
              label: "Heritage Trees",
              value: contextStats["heritage_trees"]?.value ?? "—",
              subtitle: contextStats["heritage_trees"]?.context || "ArcGIS Heritage Trees layer",
            },
          ]}
        />
        <SourceNote source="Portland Parks & Recreation ArcGIS" />
      </section>

      {/* ── 5. Culture & Arts ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Landmark} title="Culture & Arts" />

        <StatGrid
          accentColor="#7a5c8a"
          stats={[
            {
              label: "Cultural Institutions",
              value: culturalCount > 0 ? String(culturalCount) : "—",
              subtitle: "Museums, theaters, galleries, venues",
            },
            {
              label: "Museums",
              value: culturalInstitutions.filter((c) => c.type === "museum" || c.type === "science" || c.type === "historical").length || "—",
            },
            {
              label: "Performing Arts",
              value: culturalInstitutions.filter((c) => c.type === "theater" || c.type === "music_venue" || c.type === "dance").length || "—",
            },
            {
              label: "Galleries & Literary",
              value: culturalInstitutions.filter((c) => c.type === "gallery" || c.type === "literary").length || "—",
            },
          ]}
        />

        {culturalInstitutions.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-3">
              Major cultural institutions in Portland:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
              {culturalInstitutions.map((inst) => (
                <div key={inst.name} className="flex items-baseline gap-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "#7a5c8a" }} />
                  <span className="text-[13px] text-[var(--color-ink)]">{inst.name}</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">
                    {inst.type?.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
            <SourceNote source="Portland Civic Lab compiled list" />
          </InfoCard>
        )}
      </section>

      {/* ── 6. Libraries & Learning ───────────────────────────────────── */}
      <section>
        <SectionHeader icon={BookOpen} title="Libraries & Learning" />

        <StatGrid
          accentColor="#5a7a8a"
          stats={[
            {
              label: latestLib ? `Library Visits (FY${latestLib.year})` : "Library Visits",
              value: latestLib ? latestLib.visits.toLocaleString() : "—",
            },
            {
              label: "Circulation",
              value: libraryExtended ? libraryExtended.circulation.toLocaleString() : "—",
              subtitle: libraryExtended ? `FY${libraryExtended.fiscalYear}` : undefined,
            },
            {
              label: "Programs Offered",
              value: libraryExtended ? libraryExtended.programs.toLocaleString() : "—",
              subtitle: libraryExtended
                ? `${libraryExtended.attendance.toLocaleString()} attendees`
                : undefined,
            },
            {
              label: "Bachelor's Degree+",
              value: bachelors ? `${bachelors.value}%` : "—",
              subtitle: bachelors ? `Adults 25+ (${bachelors.source})` : "Census ACS data pending",
            },
          ]}
        />

        {libChartData.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Total visits across all Multnomah County Library branches by fiscal year.
            </p>
            <TrendChart data={libChartData} color="#5a7a8a" height={280} />
            <SourceNote source="Multnomah County Library" />
          </InfoCard>
        )}
      </section>

      {/* ── 7. Digital Access ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Wifi} title="Digital Access" />

        <StatGrid
          accentColor="#5a6a8a"
          stats={[
            {
              label: "Broadband Access",
              value: broadband ? `${broadband.value}%` : "—",
              subtitle: broadband?.context || "FCC Broadband Map data pending",
            },
            {
              label: "Internet Providers",
              value: broadbandProviders?.value ?? "—",
              subtitle: broadbandProviders?.context || undefined,
            },
          ]}
        />
        {broadband && <SourceNote source={broadband.source} />}
      </section>

      {/* ── 8. Data Gaps (Honest) ─────────────────────────────────────── */}
      <section>
        <SectionHeader icon={AlertCircle} title="Data Gaps" />

        <InfoCard>
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Portland Civic Lab is committed to transparency. The following quality-of-life
            dimensions are important but not yet available in our dashboard:
          </p>
          <div className="space-y-3">
            {[
              {
                title: "311 / PDX Reporter",
                desc: "Service requests (potholes, graffiti, abandoned vehicles). No public export — Zendesk backend requires Public Records Request.",
                action: "prr" as const,
              },
              {
                title: "Walk Score / Bike Score",
                desc: "Walkability and bikeability indices by neighborhood. Commercial API, not free.",
                action: "subscription" as const,
              },
              {
                title: "Food access / food deserts",
                desc: "USDA Food Access Research Atlas available but complex to integrate at census tract level.",
                action: "download" as const,
              },
              {
                title: "Noise complaints",
                desc: "No public dataset for noise complaints in Portland.",
                action: "prr" as const,
              },
            ].map((gap) => (
              <div
                key={gap.title}
                className="flex items-start gap-3 px-4 py-3 bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)]/50 rounded-sm"
              >
                <AlertCircle className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-ink)]">{gap.title}</p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">{gap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </section>
    </div>
  );
}
