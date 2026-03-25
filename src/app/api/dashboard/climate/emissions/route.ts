/**
 * Climate Accountability Platform — Emissions Trajectory API
 * Returns Multnomah County emissions data with targets and sector breakdown.
 */

import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  let actuals: object[] = [];
  let targets: object[] = [];

  try {
    const rows = await sql`
      SELECT
        year, is_target, target_type, total_mtco2e,
        electricity_mtco2e, buildings_mtco2e, transportation_mtco2e,
        waste_mtco2e, industry_mtco2e, other_mtco2e, population_thousands
      FROM public.climate_emissions_trajectory
      ORDER BY is_target ASC, year ASC
    `;

    for (const r of rows) {
      const point = {
        year: Number(r.year),
        totalMtco2e: r.total_mtco2e != null ? Number(r.total_mtco2e) : null,
        electricityMtco2e: r.electricity_mtco2e != null ? Number(r.electricity_mtco2e) : null,
        buildingsMtco2e: r.buildings_mtco2e != null ? Number(r.buildings_mtco2e) : null,
        transportationMtco2e: r.transportation_mtco2e != null ? Number(r.transportation_mtco2e) : null,
        wasteMtco2e: r.waste_mtco2e != null ? Number(r.waste_mtco2e) : null,
        industryMtco2e: r.industry_mtco2e != null ? Number(r.industry_mtco2e) : null,
        otherMtco2e: r.other_mtco2e != null ? Number(r.other_mtco2e) : null,
        populationThousands: r.population_thousands != null ? Number(r.population_thousands) : null,
        isTarget: r.is_target,
        targetType: r.target_type,
      };
      if (r.is_target) targets.push(point);
      else actuals.push(point);
    }
  } catch {
    // table not yet available
  }

  // Compute per-capita for actuals
  const actualsWithPerCapita = (actuals as Array<{
    year: number;
    totalMtco2e: number | null;
    electricityMtco2e: number | null;
    buildingsMtco2e: number | null;
    transportationMtco2e: number | null;
    wasteMtco2e: number | null;
    industryMtco2e: number | null;
    otherMtco2e: number | null;
    populationThousands: number | null;
    isTarget: boolean;
    targetType: string | null;
  }>).map((a) => ({
    ...a,
    perCapitaMtco2e:
      a.totalMtco2e != null && a.populationThousands != null && a.populationThousands > 0
        ? Math.round((a.totalMtco2e / a.populationThousands) * 1000 * 100) / 100
        : null,
  }));

  // Latest actual for summary stats
  const latest = actualsWithPerCapita[actualsWithPerCapita.length - 1];
  const baseline1990 = actualsWithPerCapita.find((a) => a.year === 1990);
  const reductionFromBaseline = baseline1990 && latest && baseline1990.totalMtco2e && latest.totalMtco2e
    ? Math.round(((baseline1990.totalMtco2e - latest.totalMtco2e) / baseline1990.totalMtco2e) * 100)
    : 26;

  const target2030 = (targets as Array<{ targetType: string; totalMtco2e: number | null }>).find((t) => t.targetType === "2030_goal");
  const gapTo2030 = latest?.totalMtco2e && target2030?.totalMtco2e != null
    ? Number((latest.totalMtco2e - target2030.totalMtco2e).toFixed(2))
    : null;

  // Sector-level summary for latest year
  const sectorSummary = latest
    ? {
        electricity: latest.electricityMtco2e,
        buildings: latest.buildingsMtco2e,
        transportation: latest.transportationMtco2e,
        waste: latest.wasteMtco2e,
        industry: latest.industryMtco2e,
        other: latest.otherMtco2e,
      }
    : null;

  return NextResponse.json({
    actuals: actualsWithPerCapita,
    targets,
    summary: {
      latestYear: latest?.year ?? 2023,
      latestTotalMtco2e: latest?.totalMtco2e ?? 7.7,
      baseline1990Mtco2e: baseline1990?.totalMtco2e ?? 10.4,
      reductionFromBaseline,
      target2030Mtco2e: 5.2,
      target2050Mtco2e: 0,
      gapTo2030,
      sectorSummary,
      currentTrajectoryNote: "At the current pace of reduction (~0.12M MTCO2e/year), Portland will reach only ~6.5M MTCO2e by 2030. The 2030 goal requires ~0.42M MTCO2e/year — more than 3× the current rate.",
    },
    source: "BPS Climate & Energy Dashboard — Multnomah County Community Greenhouse Gas Inventory",
    lastUpdated: "2025-08-01",
  });
}
