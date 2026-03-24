import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pitCounts, shelterCapacity, housingPlacements, overdoseDeaths, shsFunding, byNameList, contextStats] =
      await Promise.all([
        sql`
          SELECT year, total_homeless, sheltered, unsheltered,
                 chronically_homeless, veterans, families, unaccompanied_youth, source
          FROM homelessness.pit_counts
          ORDER BY year
        `.catch(() => []),
        sql`
          SELECT quarter, total_beds, county_24hr_beds, city_overnight_beds,
                 utilization_pct, source
          FROM homelessness.shelter_capacity
          ORDER BY quarter
        `.catch(() => []),
        sql`
          SELECT fiscal_year, total_placements, shs_placements, rapid_rehousing,
                 psh_placements, evictions_prevented, source
          FROM homelessness.housing_placements
          ORDER BY fiscal_year
        `.catch(() => []),
        sql`
          SELECT year, total_od_deaths_homeless, fentanyl_deaths_homeless,
                 total_homeless_deaths, county_wide_opioid_deaths, source
          FROM homelessness.overdose_deaths
          ORDER BY year
        `.catch(() => []),
        sql`
          SELECT year, tax_revenue, spending, psh_units_added,
                 psh_units_cumulative, source
          FROM homelessness.shs_funding
          ORDER BY year
        `.catch(() => []),
        sql`
          SELECT month, total_on_list, new_entries, exits_to_housing, source
          FROM homelessness.by_name_list
          ORDER BY month
        `.catch(() => []),
        sql`
          SELECT metric, value, context, source, as_of_date
          FROM homelessness.context_stats
          ORDER BY metric
        `.catch(() => []),
      ]);

    return NextResponse.json({
      pitCounts: pitCounts.map((r: Record<string, unknown>) => ({
        year: Number(r.year),
        totalHomeless: Number(r.total_homeless),
        sheltered: Number(r.sheltered),
        unsheltered: Number(r.unsheltered),
        chronicallyHomeless: Number(r.chronically_homeless),
        veterans: Number(r.veterans),
        families: Number(r.families),
        unaccompaniedYouth: Number(r.unaccompanied_youth),
        source: r.source ?? "HUD PIT Count",
      })),
      shelterCapacity: shelterCapacity.map((r: Record<string, unknown>) => ({
        quarter: String(r.quarter),
        totalBeds: Number(r.total_beds),
        county24hrBeds: Number(r.county_24hr_beds),
        cityOvernightBeds: Number(r.city_overnight_beds),
        utilizationPct: Number(r.utilization_pct),
      })),
      housingPlacements: housingPlacements.map((r: Record<string, unknown>) => ({
        fiscalYear: String(r.fiscal_year),
        totalPlacements: Number(r.total_placements),
        shsPlacements: Number(r.shs_placements ?? 0),
        rapidRehousing: Number(r.rapid_rehousing ?? 0),
        pshPlacements: Number(r.psh_placements ?? 0),
        evictionsPrevented: Number(r.evictions_prevented ?? 0),
      })),
      overdoseDeaths: overdoseDeaths.map((r: Record<string, unknown>) => ({
        year: Number(r.year),
        totalOdDeathsHomeless: Number(r.total_od_deaths_homeless ?? 0),
        fentanylDeathsHomeless: Number(r.fentanyl_deaths_homeless ?? 0),
        totalHomelessDeaths: Number(r.total_homeless_deaths ?? 0),
        countyWideOpioidDeaths: Number(r.county_wide_opioid_deaths ?? 0),
      })),
      shsFunding: shsFunding.map((r: Record<string, unknown>) => ({
        year: Number(r.year),
        taxRevenue: Number(r.tax_revenue ?? 0),
        spending: Number(r.spending ?? 0),
        pshUnitsAdded: Number(r.psh_units_added ?? 0),
        pshUnitsCumulative: Number(r.psh_units_cumulative ?? 0),
      })),
      byNameList: byNameList.map((r: Record<string, unknown>) => ({
        month: String(r.month),
        totalOnList: Number(r.total_on_list),
        newEntries: Number(r.new_entries),
        exitsToHousing: Number(r.exits_to_housing),
      })),
      contextStats: Object.fromEntries(
        (contextStats as Record<string, unknown>[]).map((r) => [r.metric, { value: r.value, context: r.context, source: r.source }])
      ),
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[homelessness/detail] DB query failed:", error);
    return NextResponse.json({
      pitCounts: [],
      shelterCapacity: [],
      housingPlacements: [],
      overdoseDeaths: [],
      shsFunding: [],
      byNameList: [],
      contextStats: {},
      dataStatus: "unavailable",
    });
  }
}
