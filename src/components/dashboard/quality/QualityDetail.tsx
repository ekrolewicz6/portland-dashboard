"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import BarChart from "@/components/charts/BarChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import NewsContext from "../NewsContext";
import {
  Trees,
  Route,
  BookOpen,
  PlayCircle,
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

interface LibraryYear {
  fiscal_year: number;
  visits: number;
  circulation: number;
  programs: number;
  attendance: number;
  registered_borrowers: number;
  hours_open: number;
  branches: number;
  collection_books: number;
  circ_physical: number;
  circ_econtent: number;
}

interface QualityDetailData {
  parkStats: ParkStats;
  parksByType: { type: string; count: number; acres: number }[];
  pavementSummary: PavementSummary;
  pavementByClass: { class: string; avgPci: number; segments: number }[];
  worstStreets: {
    street_name: string;
    pci: number;
    surface_type: string;
    functional_class: string;
    length_ft: number;
  }[];
  libraryTrend: LibraryYear[];
  amenitiesSummary: {
    equipment_type: string;
    count: number;
    earliest_install: number | null;
    latest_install: number | null;
  }[];
  amenitiesTotal: number;
  parksMostAmenities: { park_name: string; amenity_count: number }[];
  heroStats: {
    totalParks: number;
    avgPci: number;
    pciLabel: string;
    latestVisits: number;
    latestFiscalYear: number | null;
  };
  topInsights: string[];
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

function SourceNote({ source, href }: { source: string; href?: string }) {
  return (
    <p className="mt-3 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
      Source: {href ? (
        <a href={href} target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">{source}</a>
      ) : source}
    </p>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

export default function QualityDetail() {
  const [data, setData] = useState<QualityDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/quality/detail", { signal: controller.signal })
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
    parksByType,
    pavementSummary,
    pavementByClass,
    worstStreets,
    libraryTrend,
    amenitiesSummary,
    amenitiesTotal,
    parksMostAmenities,
    heroStats,
    topInsights,
  } = data;

  // Derived values
  const latestLib = libraryTrend.length > 0 ? libraryTrend[libraryTrend.length - 1] : null;
  const priorLib = libraryTrend.length >= 2 ? libraryTrend[libraryTrend.length - 2] : null;

  const pciLabel =
    pavementSummary.avgPci >= 70
      ? "Good"
      : pavementSummary.avgPci >= 40
        ? "Fair"
        : "Poor";

  // Pavement condition percentages
  const total = pavementSummary.totalSegments || 1;
  const goodPct = Math.round((pavementSummary.good / total) * 100);
  const fairPct = Math.round((pavementSummary.fair / total) * 100);
  const poorPct = Math.round((pavementSummary.poor / total) * 100);

  // Library visit trend chart data
  const libVisitChartData = libraryTrend.map((r) => ({
    date: String(r.fiscal_year),
    value: r.visits,
  }));

  // Library multi-line: visits + circulation
  const libMultiData = libraryTrend.map((r) => ({
    year: String(r.fiscal_year),
    visits: r.visits,
    circulation: r.circulation,
  }));

  // Library program attendance trend
  const libProgramData = libraryTrend
    .filter((r) => r.programs > 0 || r.attendance > 0)
    .map((r) => ({
      year: String(r.fiscal_year),
      programs: r.programs,
      attendance: r.attendance,
    }));

  // E-content vs physical circulation
  const econtentData = libraryTrend
    .filter((r) => r.circ_physical > 0 || r.circ_econtent > 0)
    .map((r) => ({
      year: String(r.fiscal_year),
      physical: r.circ_physical,
      econtent: r.circ_econtent,
    }));

  // Park type bar chart data
  const parkTypeBarData = parksByType.slice(0, 8).map((t) => ({
    name: t.type,
    value: t.count,
  }));

  // Visit change
  let visitChangePct: number | undefined;
  if (latestLib && priorLib && priorLib.visits > 0) {
    visitChangePct = Math.round(
      ((latestLib.visits - priorLib.visits) / priorLib.visits) * 100
    );
  }

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="quality_of_life" />

      {/* ── Narrative Summary ─────────────────────────────────────────── */}
      <section>
        <InfoCard>
          <p className="text-[14px] text-[var(--color-ink)] leading-relaxed">
            Quality of life in Portland tracked across <strong>three core dimensions</strong>:
            {" "}{parkStats.totalParks} parks covering {parkStats.totalAcres.toLocaleString()} acres,
            {" "}{pavementSummary.totalSegments.toLocaleString()} street segments rated for pavement health,
            and {libraryTrend.length} years of Multnomah County Library data.
          </p>
        </InfoCard>
      </section>

      {/* ── Key Findings ──────────────────────────────────────────────── */}
      {topInsights.length > 0 && (
        <section>
          <SectionHeader icon={AlertCircle} title="Key Findings" />
          <InfoCard>
            <ul className="space-y-2">
              {topInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                    style={{ backgroundColor: COLOR }}
                  />
                  <span className="text-[13px] text-[var(--color-ink-muted)]">{insight}</span>
                </li>
              ))}
            </ul>
          </InfoCard>
        </section>
      )}

      {/* ── 1. Parks & Recreation ─────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Trees} title="Parks & Recreation" />

        <StatGrid
          accentColor="#3d7a5a"
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
              label: "Avg Park Size",
              value: `${parkStats.avgAcres}`,
              suffix: " acres",
            },
            {
              label: "Largest Park",
              value: parkStats.largestPark
                ? parkStats.largestPark.name
                : "\u2014",
              subtitle: parkStats.largestPark
                ? `${Math.round(parkStats.largestPark.acres).toLocaleString()} acres`
                : undefined,
            },
          ]}
        />

        {/* Parks by type */}
        {parkTypeBarData.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Parks by type. Portland maintains a diverse mix of park spaces from large natural areas to neighborhood pocket parks.
            </p>
            <BarChart data={parkTypeBarData} color="#3d7a5a" height={280} />
            <SourceNote source="Portland Parks & Recreation &middot; ArcGIS" href="https://gis-pdx.opendata.arcgis.com/datasets/PDX::parks/about" />
          </InfoCard>
        )}

        {/* Parks by type table (acreage) */}
        {parksByType.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Park acreage by type:
            </p>
            <div className="space-y-2">
              {parksByType.map((t) => {
                const pct = parkStats.totalAcres > 0
                  ? Math.round((t.acres / parkStats.totalAcres) * 100)
                  : 0;
                return (
                  <div key={t.type}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[13px] font-medium text-[var(--color-ink)]">
                        {t.type}
                      </span>
                      <span className="text-[13px] font-mono text-[var(--color-ink-muted)]">
                        {t.count} parks / {t.acres.toLocaleString()} acres ({pct}%)
                      </span>
                    </div>
                    <div className="h-5 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.max(pct, 1)}%`,
                          backgroundColor: "#3d7a5a",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <SourceNote source="Portland Parks & Recreation &middot; ArcGIS" href="https://gis-pdx.opendata.arcgis.com/datasets/PDX::parks/about" />
          </InfoCard>
        )}

        {/* Playground amenities */}
        {amenitiesTotal > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              <strong>{amenitiesTotal.toLocaleString()}</strong> playground amenities across Portland parks.
              Top equipment types:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {amenitiesSummary.slice(0, 6).map((a) => (
                <div
                  key={a.equipment_type}
                  className="bg-[var(--color-parchment)]/30 border border-[var(--color-parchment)]/50 rounded-sm px-4 py-3"
                >
                  <p className="text-[22px] font-mono font-semibold text-[var(--color-ink)]">
                    {a.count}
                  </p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">
                    {a.equipment_type}
                  </p>
                </div>
              ))}
            </div>

            {/* Parks with most amenities */}
            {parksMostAmenities.length > 0 && (
              <>
                <p className="text-[13px] text-[var(--color-ink-muted)] mb-3 mt-5">
                  Parks with the most playground equipment:
                </p>
                <div className="space-y-2">
                  {parksMostAmenities.slice(0, 5).map((park) => {
                    const maxAmenities = parksMostAmenities[0].amenity_count;
                    return (
                      <div key={park.park_name}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-[13px] font-medium text-[var(--color-ink)]">
                            {park.park_name}
                          </span>
                          <span className="text-[13px] font-mono text-[var(--color-ink-muted)]">
                            {park.amenity_count} pieces
                          </span>
                        </div>
                        <div className="h-5 bg-[var(--color-parchment)]/60 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${Math.max((park.amenity_count / maxAmenities) * 100, 2)}%`,
                              backgroundColor: "#3d7a5a",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <SourceNote source="Portland Parks & Recreation &middot; Park Amenities" href="https://gis-pdx.opendata.arcgis.com/datasets/PDX::parks/about" />
          </InfoCard>
        )}
      </section>

      {/* ── 2. Pavement Health ────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Route} title="Pavement Health" />

        <StatGrid
          accentColor="#4a7c6f"
          stats={[
            {
              label: "Avg Street PCI",
              value: `${pavementSummary.avgPci}`,
              subtitle: `${pciLabel} condition`,
            },
            {
              label: "Good Condition",
              value: `${goodPct}%`,
              subtitle: `${pavementSummary.good.toLocaleString()} segments (PCI > 70)`,
            },
            {
              label: "Fair Condition",
              value: `${fairPct}%`,
              subtitle: `${pavementSummary.fair.toLocaleString()} segments (PCI 40\u201370)`,
            },
            {
              label: "Poor Condition",
              value: `${poorPct}%`,
              subtitle: `${pavementSummary.poor.toLocaleString()} segments (PCI < 40)`,
            },
          ]}
        />

        {/* PCI distribution bar */}
        <InfoCard className="mt-4">
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            {pavementSummary.totalSegments.toLocaleString()} street segments rated by Pavement Condition Index (PCI).
            A higher PCI indicates better pavement condition.
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
          <SourceNote source="PBOT &middot; Pavement Condition Index" href="https://gis-pdx.opendata.arcgis.com/" />
        </InfoCard>

        {/* PCI by functional class */}
        {pavementByClass.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Average PCI by road functional classification. Higher-traffic arterials often receive
              more maintenance investment than local streets.
            </p>
            <BarChart
              data={pavementByClass.map((c) => ({
                name: c.class,
                value: c.avgPci,
                color: c.avgPci >= 70 ? "#3d7a5a" : c.avgPci >= 40 ? "#c8956c" : "#b85c3a",
              }))}
              height={240}
            />
            <SourceNote source="PBOT &middot; Pavement Condition Index" href="https://gis-pdx.opendata.arcgis.com/" />
          </InfoCard>
        )}

        {/* Worst streets table */}
        {worstStreets.length > 0 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Streets with the lowest pavement condition scores:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left py-2 pr-4 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Street</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">PCI</th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Surface</th>
                    <th className="text-left py-2 pl-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {worstStreets.map((s, i) => (
                    <tr key={i} className="border-b border-[var(--color-parchment)]/50">
                      <td className="py-2 pr-4 font-medium text-[var(--color-ink)]">{s.street_name}</td>
                      <td className="py-2 px-3 text-right font-mono" style={{ color: "#b85c3a" }}>{s.pci}</td>
                      <td className="py-2 px-3 text-[var(--color-ink-muted)]">{s.surface_type || "\u2014"}</td>
                      <td className="py-2 pl-3 text-[var(--color-ink-muted)]">{s.functional_class || "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceNote source="PBOT &middot; Pavement Condition Index" href="https://gis-pdx.opendata.arcgis.com/" />
          </InfoCard>
        )}
      </section>

      {/* ── 3. Libraries & Learning ───────────────────────────────────── */}
      <section>
        <SectionHeader icon={BookOpen} title="Libraries & Learning" />

        <StatGrid
          accentColor="#5a7a8a"
          stats={[
            {
              label: latestLib ? `Library Visits (FY${latestLib.fiscal_year})` : "Library Visits",
              value: latestLib ? latestLib.visits.toLocaleString() : "\u2014",
              change: visitChangePct,
              changeLabel: priorLib ? `vs FY${priorLib.fiscal_year}` : undefined,
            },
            {
              label: "Items Circulated",
              value: latestLib ? latestLib.circulation.toLocaleString() : "\u2014",
              subtitle: latestLib ? `FY${latestLib.fiscal_year}` : undefined,
            },
            {
              label: "Programs Offered",
              value: latestLib ? latestLib.programs.toLocaleString() : "\u2014",
              subtitle: latestLib
                ? `${latestLib.attendance.toLocaleString()} attendees`
                : undefined,
            },
            {
              label: "Branches",
              value: latestLib ? String(latestLib.branches) : "\u2014",
              subtitle: latestLib ? `${latestLib.registered_borrowers.toLocaleString()} registered borrowers` : undefined,
            },
          ]}
        />

        {/* Library visits trend */}
        {libVisitChartData.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Total visits across all Multnomah County Library branches by fiscal year.
              {libraryTrend.length >= 2 && (() => {
                const firstYear = libraryTrend[0];
                const peakYear = libraryTrend.reduce((a, b) => (b.visits > a.visits ? b : a));
                return ` Peak visitation was FY${peakYear.fiscal_year} with ${peakYear.visits.toLocaleString()} visits.`;
              })()}
            </p>
            <TrendChart data={libVisitChartData} color="#5a7a8a" height={280} />
            <SourceNote source="Oregon State Library &middot; Public Library Statistics" href="https://data.oregon.gov/d/8zw7-zgjw" />
          </InfoCard>
        )}

        {/* Visits + Circulation multi-line */}
        {libMultiData.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Library visits versus total circulation (physical + e-content) over time.
            </p>
            <MultiLineChart
              data={libMultiData}
              xKey="year"
              lines={[
                { key: "visits", label: "Visits", color: "#5a7a8a" },
                { key: "circulation", label: "Circulation", color: "#7a5c8a" },
              ]}
              height={300}
            />
            <SourceNote source="Oregon State Library &middot; Public Library Statistics" href="https://data.oregon.gov/d/8zw7-zgjw" />
          </InfoCard>
        )}

        {/* E-content vs physical */}
        {econtentData.length > 1 && econtentData.some((r) => r.econtent > 0) && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Physical vs. e-content circulation. Digital lending has grown steadily, reflecting
              changing borrower preferences.
            </p>
            <MultiLineChart
              data={econtentData}
              xKey="year"
              lines={[
                { key: "physical", label: "Physical", color: "#5a7a8a" },
                { key: "econtent", label: "E-Content", color: "#b85c3a" },
              ]}
              height={280}
            />
            <SourceNote source="Oregon State Library &middot; Public Library Statistics" href="https://data.oregon.gov/d/8zw7-zgjw" />
          </InfoCard>
        )}

        {/* Program attendance */}
        {libProgramData.length > 1 && (
          <InfoCard className="mt-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Library programming: total programs offered and attendance by fiscal year.
            </p>
            <MultiLineChart
              data={libProgramData}
              xKey="year"
              lines={[
                { key: "attendance", label: "Attendance", color: "#4a7c6f" },
                { key: "programs", label: "Programs", color: "#c8956c" },
              ]}
              height={280}
            />
            <SourceNote source="Oregon State Library &middot; Public Library Statistics" href="https://data.oregon.gov/d/8zw7-zgjw" />
          </InfoCard>
        )}
      </section>

      {/* ── 4. Data Gaps ──────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={PlayCircle} title="Data Gaps" />

        <InfoCard>
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
            Portland Civic Lab is committed to transparency. The following quality-of-life
            dimensions are important but not yet tracked:
          </p>
          <div className="space-y-3">
            {[
              {
                title: "Air Quality / AQI",
                desc: "Real-time and historical AQI from the EPA's AirNow API. Already scripted -- needs AIRNOW_API_KEY.",
              },
              {
                title: "TriMet Ridership",
                desc: "Annual ridership by mode (bus, MAX, streetcar, WES). Published in TriMet annual reports.",
              },
              {
                title: "311 / PDX Reporter",
                desc: "Service requests (potholes, graffiti, abandoned vehicles). No public export -- Zendesk backend requires Public Records Request.",
              },
              {
                title: "Walk Score / Bike Score",
                desc: "Walkability and bikeability indices by neighborhood. Commercial API, not free.",
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
