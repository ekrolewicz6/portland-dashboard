"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import {
  Lightbulb,
  Users,
  ArrowRightLeft,
  Home,
  Car,
  DollarSign,
  GraduationCap,
  Palette,
  Droplets,
} from "lucide-react";

interface PopPoint {
  year: number;
  population: number;
  source: string;
}

interface MigrationFlows {
  year: number;
  sameHouse: number;
  withinCounty: number;
  differentCountyOR: number;
  differentState: number;
  totalPopulation: number;
}

interface HousingData {
  year: number;
  totalUnits: number;
  occupied: number;
  vacant: number;
  vacancyRate: number;
  ownerPct: number;
  renterPct: number;
}

interface CommutingData {
  year: number;
  droveAlone: { pct: number; count: number };
  workFromHome: { pct: number; count: number };
  carpool: { pct: number; count: number };
  publicTransit: { pct: number; count: number };
}

interface EducationData {
  year: number;
  bachelorsOrHigher: number;
  mastersDegree: number;
  doctorate: number;
}

interface RaceGroup {
  group: string;
  count: number;
  pct: number;
}

interface DemographicsData {
  medianAge: number;
  medianIncome: number;
  medianHomeValue: number;
  medianRent: number;
  povertyRate: number;
  belowPovertyCount: number;
  homeValueToIncome: number;
  rentToIncomePct: number;
}

interface MigrationDetailData {
  dataStatus: string;
  dataAvailable: boolean;
  populationTrend: PopPoint[];
  peak: { year: number; population: number } | null;
  migrationFlows: MigrationFlows | null;
  housing: HousingData | null;
  commuting: CommutingData | null;
  education: EducationData | null;
  raceEthnicity: { year: number; breakdown: RaceGroup[] } | null;
  demographics: DemographicsData | null;
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
      <Icon className="w-4 h-4" style={{ color: color ?? "#4a7f9e" }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function HorizontalBars({
  items,
  color,
}: {
  items: { name: string; value: number; label: string }[];
  color: string;
}) {
  const maxVal = items.length > 0 ? Math.max(...items.map((i) => i.value)) : 1;
  return (
    <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.round((item.value / maxVal) * 100);
          return (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[13px] text-[var(--color-ink-light)] w-[160px] text-right flex-shrink-0">
                {item.name}
              </span>
              <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    opacity: 0.7 + 0.3 * (1 - i / items.length),
                  }}
                />
              </div>
              <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[80px] text-right">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MigrationDetail() {
  const [data, setData] = useState<MigrationDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/migration/detail")
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

  if (!data || !data.dataAvailable) {
    return (
      <p className="text-[var(--color-ink-muted)] text-[14px]">
        Unable to load migration detail data.
      </p>
    );
  }

  const {
    populationTrend,
    peak,
    migrationFlows,
    housing,
    commuting,
    education,
    raceEthnicity,
    demographics,
  } = data;

  // Prepare population chart data
  const popChartData = populationTrend.map((p) => ({
    date: String(p.year),
    value: p.population,
  }));

  // Migration flow bars
  const migrationBars = migrationFlows
    ? [
        {
          name: "Same house",
          value: migrationFlows.sameHouse,
          label: `${Math.round((migrationFlows.sameHouse / migrationFlows.totalPopulation) * 100)}%`,
        },
        {
          name: "Within county",
          value: migrationFlows.withinCounty,
          label: `${Math.round((migrationFlows.withinCounty / migrationFlows.totalPopulation) * 100)}%`,
        },
        {
          name: "Diff. county (OR)",
          value: migrationFlows.differentCountyOR,
          label: `${Math.round((migrationFlows.differentCountyOR / migrationFlows.totalPopulation) * 100)}%`,
        },
        {
          name: "Different state",
          value: migrationFlows.differentState,
          label: `${Math.round((migrationFlows.differentState / migrationFlows.totalPopulation) * 100)}%`,
        },
      ]
    : [];

  // Commuting bars
  const commuteBars = commuting
    ? [
        {
          name: "Drove alone",
          value: commuting.droveAlone.count,
          label: `${commuting.droveAlone.pct}%`,
        },
        {
          name: "Work from home",
          value: commuting.workFromHome.count,
          label: `${commuting.workFromHome.pct}%`,
        },
        {
          name: "Carpool",
          value: commuting.carpool.count,
          label: `${commuting.carpool.pct}%`,
        },
        {
          name: "Public transit",
          value: commuting.publicTransit.count,
          label: `${commuting.publicTransit.pct}%`,
        },
      ]
    : [];

  // Race bars
  const raceBars = raceEthnicity
    ? raceEthnicity.breakdown.map((r) => ({
        name: r.group,
        value: r.count,
        label: `${r.pct}%`,
      }))
    : [];

  const latestPop = populationTrend[populationTrend.length - 1];

  return (
    <div className="space-y-10">
      {/* 1. Key Insights */}
      <section>
        <SectionHeader icon={Lightbulb} title="Key Insights" color="#3d7a5a" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] font-mono font-semibold text-[#4a7f9e] bg-[#4a7f9e]/10 px-2 py-0.5 rounded-sm">
              CENSUS ACS
            </span>
            <span className="text-[12px] text-[var(--color-ink-muted)]">
              U.S. Census Bureau American Community Survey 5-Year Estimates
            </span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-clay)]" />
              Portland&apos;s population peaked at {peak?.population.toLocaleString() ?? "650,380"} in {peak?.year ?? 2020} and has since declined to {latestPop?.population.toLocaleString() ?? "646,101"}.
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-clay)]" />
              27,109 people moved to Portland from other states in 2022 — the largest single source of new residents.
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[var(--color-clay)]" />
              22% of Portland workers now work from home, and 48% of adults hold a bachelor&apos;s degree or higher.
            </li>
          </ul>
        </div>
      </section>

      {/* 2. Population Trend */}
      {popChartData.length > 0 && (
        <section>
          <SectionHeader icon={Users} title="Population Trend (Census)" color="#4a7f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Portland population from {populationTrend[0].year} to{" "}
              {populationTrend[populationTrend.length - 1].year}. The city peaked at{" "}
              {peak?.population.toLocaleString()} in {peak?.year} and has seen post-pandemic decline.
            </p>
            <TrendChart data={popChartData} color="#4a7f9e" height={300} />
          </div>
        </section>
      )}

      {/* 3. Where People Are Moving From */}
      {migrationBars.length > 0 && (
        <section>
          <SectionHeader icon={ArrowRightLeft} title="Where People Are Moving From (2022)" color="#7c6f9e" />
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-3">
            Of Portland&apos;s {migrationFlows?.totalPopulation.toLocaleString()} residents, 82% stayed in the same house.
            Among movers, the largest group came from other states (27,109 people).
          </p>
          <HorizontalBars items={migrationBars} color="#7c6f9e" />
        </section>
      )}

      {/* 4. Housing Occupancy */}
      {housing && (
        <section>
          <SectionHeader icon={Home} title="Housing Occupancy (2022)" color="#c8956c" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c8956c]" />
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                Total Units
              </p>
              <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                {housing.totalUnits.toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c8956c]" />
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                Owner-Occupied
              </p>
              <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                {housing.ownerPct}%
              </p>
            </div>
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c8956c]" />
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                Renter-Occupied
              </p>
              <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                {housing.renterPct}%
              </p>
            </div>
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#c8956c]" />
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                Vacancy Rate
              </p>
              <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                {housing.vacancyRate}%
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                {housing.vacant.toLocaleString()} units
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5. How Portland Gets to Work */}
      {commuteBars.length > 0 && (
        <section>
          <SectionHeader icon={Car} title="How Portland Gets to Work (2022)" color="#3d7a5a" />
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-3">
            22% of Portland workers now work from home — dramatically higher than pre-pandemic levels.
            Despite strong transit infrastructure, only 4% commute by public transit.
          </p>
          <HorizontalBars items={commuteBars} color="#3d7a5a" />
        </section>
      )}

      {/* 6. Income & Affordability */}
      {demographics && (
        <section>
          <SectionHeader icon={DollarSign} title="Income & Affordability (2022)" color="#b85c3a" />
          <StatGrid
            stats={[
              {
                label: "Median Income",
                value: `$${demographics.medianIncome.toLocaleString()}`,
              },
              {
                label: "Median Home Value",
                value: `$${demographics.medianHomeValue.toLocaleString()}`,
              },
              {
                label: "Home Price / Income",
                value: `${demographics.homeValueToIncome}x`,
              },
              {
                label: "Median Rent",
                value: `$${demographics.medianRent.toLocaleString()}/mo`,
              },
            ]}
            accentColor="#b85c3a"
          />
          <div className="mt-4 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              A typical Portland home costs <strong>{demographics.homeValueToIncome}x</strong> the
              median household income. Median rent of ${demographics.medianRent.toLocaleString()}/month represents
              about {demographics.rentToIncomePct}% of median income. {demographics.povertyRate}% of residents
              ({demographics.belowPovertyCount.toLocaleString()} people) live below the poverty line.
            </p>
          </div>
        </section>
      )}

      {/* 7. Education */}
      {education && (
        <section>
          <SectionHeader icon={GraduationCap} title="Education (Adults 25+, 2022)" color="#4a7f9e" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed mb-5">
              48% of Portland adults have a bachelor&apos;s degree or higher — one of the most
              educated cities in America.
            </p>
            <div className="space-y-3">
              {[
                { label: "Bachelor's degree or higher", pct: education.bachelorsOrHigher },
                { label: "Master's degree", pct: education.mastersDegree },
                { label: "Doctorate", pct: education.doctorate },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[13px] text-[var(--color-ink-light)] w-[200px] text-right flex-shrink-0">
                    {item.label}
                  </span>
                  <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-700"
                      style={{
                        width: `${(item.pct / 50) * 100}%`,
                        backgroundColor: "#4a7f9e",
                        opacity: 0.8 - i * 0.15,
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[50px] text-right">
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Demographics — Race/Ethnicity */}
      {raceBars.length > 0 && (
        <section>
          <SectionHeader icon={Palette} title="Race & Ethnicity (2022)" color="#7c6f9e" />
          <HorizontalBars items={raceBars} color="#7c6f9e" />
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-2">
            Source: U.S. Census Bureau ACS 5-Year Estimates, 2022. Categories are not mutually exclusive for Hispanic/Latino.
          </p>
        </section>
      )}

      {/* 9. Key Demographics Snapshot */}
      {demographics && (
        <section>
          <SectionHeader icon={Users} title="Demographics Snapshot" color="#4a7f9e" />
          <StatGrid
            stats={[
              { label: "Median Age", value: String(demographics.medianAge) },
              { label: "Below Poverty", value: `${demographics.povertyRate}%` },
              {
                label: "Population (2022)",
                value: migrationFlows?.totalPopulation.toLocaleString() ?? "646,101",
              },
              { label: "Rent as % of Income", value: `${demographics.rentToIncomePct}%` },
            ]}
            accentColor="#4a7f9e"
          />
        </section>
      )}

      {/* 10. Water Bureau Data Needed */}
      <section>
        <SectionHeader icon={Droplets} title="Real-Time Migration Proxy" color="#4a7f9e" />
        <DataNeeded
          title="Water Bureau Migration Data Needed"
          description="Water meter activations and deactivations are the best real-time proxy for household migration in Portland. Monthly net activations show whether Portland is gaining or losing households — far more current than annual Census data. This data is held by the Portland Water Bureau and requires a public records request."
          color="#4a7f9e"
          actions={[
            {
              label:
                "File public records request to Portland Water Bureau (PWBCustomerService@portlandoregon.gov)",
              type: "prr",
            },
          ]}
        />
      </section>
    </div>
  );
}
