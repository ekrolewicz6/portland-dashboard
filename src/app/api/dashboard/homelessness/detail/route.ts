import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "homelessness_detail";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

// All 13 reads collapsed into a single round trip via json_build_object.
// Previously this route fired 13 queries via Promise.all, which deadlocked
// on Supabase's transaction-mode pooler when combined with the serverless
// `max: 1` connection cap. One query = one round trip = ~120ms total.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'pit_counts', (
      SELECT COALESCE(json_agg(t ORDER BY year), '[]'::json) FROM (
        SELECT year, total_homeless, sheltered, unsheltered,
               chronically_homeless, veterans, families, unaccompanied_youth, source
        FROM homelessness.pit_counts
      ) t
    ),
    'shelter_capacity', (
      SELECT COALESCE(json_agg(t ORDER BY quarter), '[]'::json) FROM (
        SELECT quarter, total_beds, county_24hr_beds, city_overnight_beds,
               utilization_pct, source
        FROM homelessness.shelter_capacity
      ) t
    ),
    'housing_placements', (
      SELECT COALESCE(json_agg(t ORDER BY fiscal_year), '[]'::json) FROM (
        SELECT fiscal_year, total_placements, shs_placements, rapid_rehousing,
               psh_placements, evictions_prevented, source
        FROM homelessness.housing_placements
      ) t
    ),
    'overdose_deaths', (
      SELECT COALESCE(json_agg(t ORDER BY year), '[]'::json) FROM (
        SELECT year, total_od_deaths_homeless, fentanyl_deaths_homeless,
               total_homeless_deaths, county_wide_opioid_deaths, source
        FROM homelessness.overdose_deaths
      ) t
    ),
    'shs_funding', (
      SELECT COALESCE(json_agg(t ORDER BY year), '[]'::json) FROM (
        SELECT year, tax_revenue, spending, psh_units_added,
               psh_units_cumulative, source
        FROM homelessness.shs_funding
      ) t
    ),
    'by_name_list', (
      SELECT COALESCE(json_agg(t ORDER BY month), '[]'::json) FROM (
        SELECT month, total_on_list, new_entries, exits_to_housing, source
        FROM homelessness.by_name_list
      ) t
    ),
    'context_stats', (
      SELECT COALESCE(json_agg(t ORDER BY metric), '[]'::json) FROM (
        SELECT metric, value, context, source, as_of_date
        FROM homelessness.context_stats
      ) t
    ),
    'eviction_filings', (
      SELECT COALESCE(json_agg(t ORDER BY month, county), '[]'::json) FROM (
        SELECT month, county, filings, filing_rate_per_100, source
        FROM homelessness.eviction_filings
      ) t
    ),
    'shs_spending_by_type', (
      SELECT COALESCE(json_agg(t ORDER BY fiscal_year, intervention_type), '[]'::json) FROM (
        SELECT fiscal_year, intervention_type, amount, households_served,
               housing_placements, cost_per_placement, source
        FROM homelessness.shs_spending_by_type
      ) t
    ),
    'shs_by_county', (
      SELECT COALESCE(json_agg(t ORDER BY fiscal_year, county), '[]'::json) FROM (
        SELECT fiscal_year, county, allocation, spent, households_placed, source
        FROM homelessness.shs_by_county
      ) t
    ),
    'affordable_housing_vacancy', (
      SELECT COALESCE(json_agg(t ORDER BY as_of), '[]'::json) FROM (
        SELECT as_of, source, total_units, vacant_units, vacancy_pct,
               avg_days_to_fill, notes
        FROM homelessness.affordable_housing_vacancy
      ) t
    ),
    'data_sources', (
      SELECT COALESCE(json_agg(t ORDER BY display_name), '[]'::json) FROM (
        SELECT source_key, display_name, agency, methodology, scope,
               what_it_misses, update_frequency, last_updated, next_expected,
               url, used_by
        FROM homelessness.data_sources
      ) t
    ),
    'data_disputes', (
      SELECT COALESCE(json_agg(t ORDER BY date_surfaced DESC), '[]'::json) FROM (
        SELECT slug, title, date_surfaced, status,
               claim_a_source, claim_a_summary, claim_a_data,
               claim_b_source, claim_b_summary, claim_b_data,
               expert_assessment, expert_source, methodology_difference, news_url
        FROM homelessness.data_disputes
        WHERE status = 'active'
      ) t
    ),
    'statewide_by_county', (
      SELECT COALESCE(json_agg(t ORDER BY total DESC), '[]'::json) FROM (
        SELECT county, coc, sheltered, unsheltered, total, unsheltered_pct,
               shelter_beds, rate_per_1000_total
        FROM homelessness.statewide_pit_by_county
        WHERE total > 0
      ) t
    ),
    'racial_disparities', (
      SELECT COALESCE(json_agg(t ORDER BY disparity_ratio DESC NULLS LAST), '[]'::json) FROM (
        SELECT race_group, pct_of_population, pct_of_pit, disparity_ratio, scope
        FROM homelessness.racial_disparities
      ) t
    ),
    'shelter_bed_inventory', (
      SELECT COALESCE(json_agg(t ORDER BY total_homeless DESC), '[]'::json) FROM (
        SELECT county, year_round, total_beds, total_homeless, beds_pct_of_pit
        FROM homelessness.shelter_bed_inventory
      ) t
    ),
    'student_homelessness', (
      SELECT COALESCE(json_agg(t ORDER BY count_2024_25 DESC), '[]'::json) FROM (
        SELECT county, count_2023_24, count_2024_25, numeric_change, pct_change
        FROM homelessness.student_homelessness
      ) t
    ),
    'doubled_up', (
      SELECT COALESCE(json_agg(t ORDER BY estimate DESC NULLS LAST), '[]'::json) FROM (
        SELECT county, estimate, margin_of_error
        FROM homelessness.doubled_up
      ) t
    ),
    'unsheltered_change', (
      SELECT COALESCE(json_agg(t ORDER BY numeric_change DESC), '[]'::json) FROM (
        SELECT county, count_2023, count_2025, numeric_change, pct_change
        FROM homelessness.statewide_unsheltered_change
      ) t
    ),
    'irp_campsite_monthly', (
      SELECT COALESCE(json_agg(t ORDER BY month), '[]'::json) FROM (
        SELECT
          TO_CHAR(DATE_TRUNC('month', incident_date), 'YYYY-MM') AS month,
          COUNT(*) FILTER (WHERE NOT is_duplicate)::int AS unique_reports,
          COUNT(*) FILTER (WHERE NOT is_duplicate AND is_vehicle)::int AS vehicle_reports,
          COUNT(*) FILTER (WHERE NOT is_duplicate AND NOT is_vehicle)::int AS tent_reports
        FROM homelessness.irp_campsite_reports
        WHERE incident_date >= '2025-01-01'
        GROUP BY 1
      ) t
    ),
    'irp_campsite_total', (
      SELECT row_to_json(t) FROM (
        SELECT
          COUNT(*) FILTER (WHERE NOT is_duplicate)::int AS unique_total,
          COUNT(*)::int AS raw_total,
          MIN(incident_date)::date AS earliest,
          MAX(incident_date)::date AS latest
        FROM homelessness.irp_campsite_reports
      ) t
    )
  ) AS payload
`;

type Row = Record<string, unknown>;

const arr = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(cached);

    const t0 = Date.now();
    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;
    console.log(`[homelessness/detail] combined query: ${Date.now() - t0}ms`);

    const pitCounts = arr(payload.pit_counts);
    const shelterCapacity = arr(payload.shelter_capacity);
    const housingPlacements = arr(payload.housing_placements);
    const overdoseDeaths = arr(payload.overdose_deaths);
    const shsFunding = arr(payload.shs_funding);
    const byNameList = arr(payload.by_name_list);
    const contextStats = arr(payload.context_stats);
    const evictionFilings = arr(payload.eviction_filings);
    const shsByType = arr(payload.shs_spending_by_type);
    const shsByCounty = arr(payload.shs_by_county);
    const affordableVacancy = arr(payload.affordable_housing_vacancy);
    const dataSources = arr(payload.data_sources);
    const dataDisputes = arr(payload.data_disputes);
    const statewideByCounty = arr(payload.statewide_by_county);
    const racialDisparities = arr(payload.racial_disparities);
    const shelterBedInventory = arr(payload.shelter_bed_inventory);
    const studentHomelessness = arr(payload.student_homelessness);
    const doubledUp = arr(payload.doubled_up);
    const unshelteredChange = arr(payload.unsheltered_change);
    const irpCampsiteMonthly = (payload.irp_campsite_monthly as any[]) ?? [];
    const irpCampsiteTotal = payload.irp_campsite_total as { unique_total: number; raw_total: number; earliest: string; latest: string } | null;

    const responseData = {
      pitCounts: pitCounts.map((r) => ({
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
      shelterCapacity: shelterCapacity.map((r) => ({
        quarter: String(r.quarter),
        totalBeds: Number(r.total_beds),
        county24hrBeds: Number(r.county_24hr_beds),
        cityOvernightBeds: Number(r.city_overnight_beds),
        utilizationPct: Number(r.utilization_pct),
        source: r.source ? String(r.source) : null,
      })),
      housingPlacements: housingPlacements.map((r) => ({
        fiscalYear: String(r.fiscal_year),
        totalPlacements: Number(r.total_placements),
        shsPlacements: Number(r.shs_placements ?? 0),
        rapidRehousing: Number(r.rapid_rehousing ?? 0),
        pshPlacements: Number(r.psh_placements ?? 0),
        evictionsPrevented: Number(r.evictions_prevented ?? 0),
      })),
      overdoseDeaths: overdoseDeaths.map((r) => ({
        year: Number(r.year),
        totalOdDeathsHomeless: Number(r.total_od_deaths_homeless ?? 0),
        fentanylDeathsHomeless: Number(r.fentanyl_deaths_homeless ?? 0),
        totalHomelessDeaths: Number(r.total_homeless_deaths ?? 0),
        countyWideOpioidDeaths: Number(r.county_wide_opioid_deaths ?? 0),
      })),
      shsFunding: shsFunding.map((r) => ({
        year: Number(r.year),
        taxRevenue: Number(r.tax_revenue ?? 0),
        spending: Number(r.spending ?? 0),
        pshUnitsAdded: Number(r.psh_units_added ?? 0),
        pshUnitsCumulative: Number(r.psh_units_cumulative ?? 0),
      })),
      byNameList: byNameList.map((r) => ({
        month: String(r.month),
        totalOnList: Number(r.total_on_list),
        newEntries: Number(r.new_entries),
        exitsToHousing: Number(r.exits_to_housing),
      })),
      contextStats: Object.fromEntries(
        contextStats.map((r) => [
          r.metric,
          { value: r.value, context: r.context, source: r.source },
        ]),
      ),
      evictionFilings: evictionFilings.map((r) => ({
        month: String(r.month),
        county: String(r.county),
        filings: Number(r.filings),
        filingRatePer100: Number(r.filing_rate_per_100 ?? 0),
      })),
      shsByType: shsByType.map((r) => ({
        fiscalYear: String(r.fiscal_year),
        interventionType: String(r.intervention_type),
        amount: Number(r.amount ?? 0),
        householdsServed: Number(r.households_served ?? 0),
        housingPlacements: Number(r.housing_placements ?? 0),
        costPerPlacement: Number(r.cost_per_placement ?? 0),
      })),
      shsByCounty: shsByCounty.map((r) => ({
        fiscalYear: String(r.fiscal_year),
        county: String(r.county),
        allocation: Number(r.allocation ?? 0),
        spent: Number(r.spent ?? 0),
        householdsPlaced: Number(r.households_placed ?? 0),
      })),
      affordableVacancy: affordableVacancy.map((r) => ({
        asOf: String(r.as_of),
        source: String(r.source),
        totalUnits: Number(r.total_units ?? 0),
        vacantUnits: Number(r.vacant_units ?? 0),
        vacancyPct: Number(r.vacancy_pct ?? 0),
        avgDaysToFill: Number(r.avg_days_to_fill ?? 0),
        notes: String(r.notes ?? ""),
      })),
      dataSources: dataSources.map((r) => ({
        sourceKey: String(r.source_key),
        displayName: String(r.display_name),
        agency: String(r.agency),
        methodology: String(r.methodology),
        scope: String(r.scope),
        whatItMisses: String(r.what_it_misses ?? ""),
        updateFrequency: String(r.update_frequency ?? ""),
        lastUpdated: r.last_updated ? String(r.last_updated) : null,
        nextExpected: r.next_expected ? String(r.next_expected) : null,
        url: String(r.url ?? ""),
        usedBy: (r.used_by as string[]) ?? [],
      })),
      dataDisputes: dataDisputes.map((r) => ({
        slug: String(r.slug),
        title: String(r.title),
        dateSurfaced: String(r.date_surfaced),
        status: String(r.status),
        claimASource: String(r.claim_a_source),
        claimASummary: String(r.claim_a_summary),
        claimAData: r.claim_a_data ?? null,
        claimBSource: String(r.claim_b_source),
        claimBSummary: String(r.claim_b_summary),
        claimBData: r.claim_b_data ?? null,
        expertAssessment: String(r.expert_assessment ?? ""),
        expertSource: String(r.expert_source ?? ""),
        methodologyDifference: String(r.methodology_difference),
        newsUrl: String(r.news_url ?? ""),
      })),
      // PSU 2025 Statewide data
      statewideByCounty: statewideByCounty.map((r) => ({
        county: String(r.county),
        coc: String(r.coc ?? ""),
        sheltered: Number(r.sheltered ?? 0),
        unsheltered: Number(r.unsheltered ?? 0),
        total: Number(r.total ?? 0),
        unshelteredPct: Number(r.unsheltered_pct ?? 0),
        shelterBeds: Number(r.shelter_beds ?? 0),
        ratePer1000: Number(r.rate_per_1000_total ?? 0),
      })),
      racialDisparities: racialDisparities.map((r) => ({
        raceGroup: String(r.race_group),
        pctOfPopulation: r.pct_of_population != null ? Number(r.pct_of_population) : null,
        pctOfPit: r.pct_of_pit != null ? Number(r.pct_of_pit) : null,
        disparityRatio: r.disparity_ratio != null ? Number(r.disparity_ratio) : null,
        scope: String(r.scope ?? "statewide"),
      })),
      shelterBedInventory: shelterBedInventory.map((r) => ({
        county: String(r.county),
        yearRound: Number(r.year_round ?? 0),
        totalBeds: Number(r.total_beds ?? 0),
        totalHomeless: Number(r.total_homeless ?? 0),
        bedsPctOfPit: Number(r.beds_pct_of_pit ?? 0),
      })),
      studentHomelessness: studentHomelessness.map((r) => ({
        county: String(r.county),
        count202324: Number(r.count_2023_24 ?? 0),
        count202425: Number(r.count_2024_25 ?? 0),
        numericChange: Number(r.numeric_change ?? 0),
        pctChange: Number(r.pct_change ?? 0),
      })),
      doubledUp: doubledUp.map((r) => ({
        county: String(r.county),
        estimate: Number(r.estimate ?? 0),
        marginOfError: Number(r.margin_of_error ?? 0),
      })),
      unshelteredChange: unshelteredChange.map((r) => ({
        county: String(r.county),
        count2023: Number(r.count_2023 ?? 0),
        count2025: Number(r.count_2025 ?? 0),
        numericChange: Number(r.numeric_change ?? 0),
        pctChange: Number(r.pct_change ?? 0),
      })),
      irpCampsiteMonthly: irpCampsiteMonthly.map((r: any) => ({
        month: r.month,
        uniqueReports: Number(r.unique_reports),
        vehicleReports: Number(r.vehicle_reports),
        tentReports: Number(r.tent_reports),
      })),
      irpCampsiteTotal: irpCampsiteTotal ? {
        uniqueTotal: Number(irpCampsiteTotal.unique_total),
        rawTotal: Number(irpCampsiteTotal.raw_total),
        earliest: irpCampsiteTotal.earliest,
        latest: irpCampsiteTotal.latest,
      } : null,
      dataStatus: "live",
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(responseData);
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
      evictionFilings: [],
      shsByType: [],
      shsByCounty: [],
      affordableVacancy: [],
      dataSources: [],
      dataDisputes: [],
      statewideByCounty: [],
      racialDisparities: [],
      shelterBedInventory: [],
      studentHomelessness: [],
      doubledUp: [],
      unshelteredChange: [],
      irpCampsiteMonthly: [],
      irpCampsiteTotal: null,
      dataStatus: "unavailable",
    });
  }
}
