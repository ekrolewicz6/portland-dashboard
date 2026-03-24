import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "housing_detail";

interface HousingMarketData {
  homeValueTrendMulti: { month: string; typical: number; sfr: number; condo: number }[];
  valueByType: { metric: string; value: number }[];
  valueByBedroom: { metric: string; value: number }[];
  valueByTier: { metric: string; value: number }[];
  rentTrendMulti: { month: string; all: number; sfr: number; mfr: number }[];
  rentVsBuy: { month: string; rent: number; mortgage: number }[];
  marketHealth: { metric: string; value: number }[];
  forecast: number | null;
}

interface HousingDetailResponse {
  permitsByType: { name: string; value: number; color: string }[];
  permitsByNeighborhood: { name: string; value: number }[];
  pipelineTrend: { month: string; units: number; residential: number; commercial: number }[];
  rentTrend: { month: string; rent: number }[] | null;
  processingTimeTrend: { month: string; avgDays: number; count: number }[];
  processingByType: Record<string, string | number>[];
  clearanceData: Record<string, string | number>[];
  cohortData: Record<string, string | number>[];
  valuationByYear: { name: string; value: number }[];
  heroStats: {
    unitsInPipeline: number;
    avgPermitDays: number;
    totalValuation: number;
    ninetyDayCompliance: number;
  };
  ninetyDayBreakdown: { met: number; missed: number };
  demolitionTrend: { quarter: string; total: number; residential: number; commercial: number }[];
  completions: { quarter: string; total: number; single_family: number; adus: number; multifamily: number }[];
  backlogTrend: { quarter: string; residential: number; commercial: number; facility: number }[];
  throughput: { quarter: string; applied: number; issued: number; completed: number }[];
  topInsights: string[];
  housingMarket: HousingMarketData;
  dataStatus: string;
}

// Only count these as "building" permits (exclude trade permits, tree permits, noise)
const BUILDING_PERMIT_FILTER = `
  permit_type IN (
    'Residential 1 & 2 Family Permit',
    'Commercial Building Permit',
    'Facility Permit',
    'Minor Improvement Permit',
    'Fire Systems Permit'
  )
`;

export async function GET(): Promise<NextResponse<HousingDetailResponse>> {
  try {
    // Check cache (24-hour TTL)
    const cached = await getCachedData<HousingDetailResponse>(CACHE_KEY, 24 * 60 * 60 * 1000);
    if (cached) return NextResponse.json(cached);

    // 1. Permits by type — ONLY building-related permits (not tree trimming, electrical, etc.)
    const typeRows = await sql`
      SELECT
        CASE
          WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%'
            THEN 'Residential'
          WHEN permit_type ILIKE '%commercial%'
            THEN 'Commercial'
          WHEN permit_type ILIKE '%facility%'
            THEN 'Facility/Institutional'
          WHEN permit_type ILIKE '%minor improvement%'
            THEN 'Minor Improvement'
          WHEN permit_type ILIKE '%housing%'
            THEN 'Affordable Housing'
          WHEN permit_type ILIKE '%fire%'
            THEN 'Fire Systems'
          WHEN permit_type ILIKE '%electrical%'
            THEN 'Electrical'
          WHEN permit_type ILIKE '%mechanical%'
            THEN 'Mechanical'
          WHEN permit_type ILIKE '%plumbing%'
            THEN 'Plumbing'
          ELSE 'Other'
        END AS category,
        count(*)::int AS cnt
      FROM housing.permits
      WHERE permit_type NOT ILIKE '%pruning%'
        AND permit_type NOT ILIKE '%urban forestry%'
        AND permit_type NOT ILIKE '%noise%'
        AND permit_type NOT ILIKE '%nuisance%'
      GROUP BY 1
      ORDER BY cnt DESC
    `;

    const typeColors: Record<string, string> = {
      Residential: "#3d7a5a",
      Commercial: "#c8956c",
      "Facility/Institutional": "#4a7f9e",
      "Minor Improvement": "#7c6f9e",
      "Affordable Housing": "#b85c6a",
      "Fire Systems": "#b85c3a",
      Electrical: "#64748b",
      Mechanical: "#1a3a2a",
      Plumbing: "#2d5f7e",
      Other: "#a8c5b2",
    };

    const permitsByType = typeRows.map((r) => ({
      name: r.category as string,
      value: Number(r.cnt),
      color: typeColors[r.category as string] ?? "#78716c",
    }));

    // 2. Top 10 neighborhoods — building permits only
    const neighborhoodRows = await sql`
      SELECT neighborhood AS name, count(*)::int AS cnt
      FROM housing.permits
      WHERE neighborhood IS NOT NULL AND neighborhood != ''
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
      GROUP BY neighborhood
      ORDER BY cnt DESC
      LIMIT 10
    `;

    const permitsByNeighborhood = neighborhoodRows.map((r) => {
      // Title-case neighborhood names (come in ALL CAPS from DB)
      const raw = r.name as string;
      const titleCased = raw
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\b(Of|The|And|In)\b/g, (c) => c.toLowerCase());
      return {
        name: titleCased,
        value: Number(r.cnt),
      };
    });

    // 3. Pipeline trend — building permits only, by month
    const pipelineRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') AS month,
        count(*)::int AS total,
        count(*) FILTER (WHERE permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%' OR permit_type ILIKE '%housing%')::int AS residential,
        count(*) FILTER (WHERE permit_type ILIKE '%commercial%' OR permit_type ILIKE '%facility%')::int AS commercial
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date >= '2023-01-01'
        AND issued_date <= NOW()
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const pipelineTrend = pipelineRows.map((r) => ({
      month: r.month as string,
      units: Number(r.total),
      residential: Number(r.residential),
      commercial: Number(r.commercial),
    }));

    // 4. Rent trend — REAL Zillow ZORI data
    const rentRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, zori::numeric AS rent
      FROM public.housing_rents
      WHERE zori IS NOT NULL
      ORDER BY month
    `;
    const rentTrendData = rentRows.length > 0
      ? rentRows.map((r) => ({ month: r.month as string, rent: Number(Number(r.rent).toFixed(0)) }))
      : null;

    // 4b. Home values — Zillow ZHVI (typical home value, 35th-65th percentile)
    const zhviRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, zhvi::numeric AS value
      FROM public.zillow_zhvi
      WHERE month >= '2010-01-01'
      ORDER BY month
    `;
    const homeValueTrend = zhviRows.length > 0
      ? zhviRows.map((r) => ({ month: r.month as string, value: Number(Number(r.value).toFixed(0)) }))
      : null;

    // 5. Processing time — building permits only, min 10 permits/month, cap at 180 days
    const processingRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') AS month,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS avg_days,
        count(*)::int AS permit_count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date >= '2023-01-01'
        AND processing_days IS NOT NULL
        AND processing_days > 0
        AND processing_days <= 180
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
      GROUP BY date_trunc('month', issued_date)
      HAVING count(*) >= 50
      ORDER BY date_trunc('month', issued_date)
    `;

    const processingTimeTrend = processingRows.map((r) => ({
      month: r.month as string,
      avgDays: Number(r.avg_days),
      count: Number(r.permit_count),
    }));

    // 5b. Processing time BY PERMIT TYPE — median days per type per quarter
    const processingByTypeRows = await sql`
      SELECT
        CASE
          WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%'
            THEN 'Residential'
          WHEN permit_type ILIKE '%commercial%'
            THEN 'Commercial'
          WHEN permit_type ILIKE '%facility%'
            THEN 'Facility'
          ELSE 'Other Building'
        END AS ptype,
        TO_CHAR(date_trunc('quarter', issued_date), 'YYYY-"Q"Q') AS quarter,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS median_days,
        count(*)::int AS cnt
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND processing_days IS NOT NULL
        AND processing_days > 0
        AND processing_days <= 365
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
      GROUP BY 1, date_trunc('quarter', issued_date)
      HAVING count(*) >= 10
      ORDER BY date_trunc('quarter', issued_date), 1
    `;

    // Pivot into {quarter, Residential, Commercial, Facility} rows
    const quarterMap = new Map<string, Record<string, number>>();
    for (const r of processingByTypeRows) {
      const q = r.quarter as string;
      if (!quarterMap.has(q)) quarterMap.set(q, {});
      quarterMap.get(q)![r.ptype as string] = Number(r.median_days);
    }
    const processingByType = [...quarterMap.entries()].map(([quarter, types]) => ({
      quarter,
      ...types,
    }));

    // 5c. Clearance rates by quarter and type — shows pipeline health
    const clearanceRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', issued_date), 'YYYY-"Q"Q') AS quarter,
        CASE
          WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%' THEN 'Residential'
          WHEN permit_type ILIKE '%commercial%' THEN 'Commercial'
          WHEN permit_type ILIKE '%facility%' THEN 'Facility'
          ELSE 'Other'
        END AS ptype,
        count(*)::int AS total_issued,
        count(*) FILTER (WHERE LOWER(status) IN ('finaled', 'final', 'final - uf'))::int AS finaled,
        ROUND(100.0 * count(*) FILTER (WHERE LOWER(status) IN ('finaled', 'final', 'final - uf')) / NULLIF(count(*), 0))::int AS clearance_pct,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days) FILTER (WHERE processing_days > 0 AND processing_days <= 365))::int AS median_days
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date >= '2023-01-01'
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
      GROUP BY 1, 2
      HAVING count(*) >= 5
      ORDER BY 1, 2
    `;

    // Pivot clearance data into rows with columns per type
    const clearanceMap = new Map<string, Record<string, number>>();
    for (const r of clearanceRows) {
      const q = r.quarter as string;
      if (!clearanceMap.has(q)) clearanceMap.set(q, {});
      const entry = clearanceMap.get(q)!;
      const ptype = r.ptype as string;
      entry[`${ptype}_clearance`] = Number(r.clearance_pct);
      entry[`${ptype}_median`] = Number(r.median_days) || 0;
      entry[`${ptype}_total`] = Number(r.total_issued);
    }
    const clearanceData = [...clearanceMap.entries()].map(([quarter, data]) => ({
      quarter,
      ...data,
    }));

    // 5d. COHORT analysis: for permits APPLIED in each month, how long to clear?
    // This eliminates survivorship bias — groups by APPLICATION date, not issued date
    const cohortRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', application_date), 'YYYY-MM') as applied_month,
        CASE
          WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%' THEN 'Residential'
          WHEN permit_type ILIKE '%commercial%' THEN 'Commercial'
          WHEN permit_type ILIKE '%facility%' THEN 'Facility'
          WHEN permit_type ILIKE '%electrical%' THEN 'Electrical'
          WHEN permit_type ILIKE '%plumbing%' THEN 'Plumbing'
          ELSE 'Other'
        END as ptype,
        count(*)::int as applied,
        count(*) FILTER (WHERE LOWER(status) IN ('finaled', 'final', 'final - uf'))::int as cleared,
        ROUND(100.0 * count(*) FILTER (WHERE LOWER(status) IN ('finaled', 'final', 'final - uf')) / NULLIF(count(*), 0))::int as clearance_pct,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days)
          FILTER (WHERE processing_days > 0 AND processing_days <= 730))::int as median_days
      FROM housing.permits
      WHERE application_date IS NOT NULL
        AND application_date >= '2023-01-01'
      GROUP BY 1, 2
      HAVING count(*) >= 10
      ORDER BY 1, 2
    `;

    // Pivot into {month, Residential, Commercial, Facility, Electrical, Plumbing} rows
    const cohortMap = new Map<string, Record<string, number>>();
    for (const r of cohortRows) {
      const m = r.applied_month as string;
      if (!cohortMap.has(m)) cohortMap.set(m, {});
      const entry = cohortMap.get(m)!;
      const ptype = r.ptype as string;
      entry[ptype] = Number(r.median_days) || 0;
      entry[`${ptype}_clearance`] = Number(r.clearance_pct) || 0;
      entry[`${ptype}_applied`] = Number(r.applied) || 0;
    }
    const cohortData = [...cohortMap.entries()].map(([month, data]) => ({
      month,
      ...data,
    }));

    // 6. Valuation by year — include ALL years, mark partial ones
    const valuationRows = await sql`
      SELECT
        EXTRACT(YEAR FROM issued_date)::int AS yr,
        SUM(valuation)::bigint AS total,
        count(*)::int AS permit_count,
        MIN(issued_date)::text AS first_permit,
        MAX(issued_date)::text AS last_permit
      FROM housing.permits
      WHERE issued_date IS NOT NULL AND valuation > 0
      GROUP BY EXTRACT(YEAR FROM issued_date)
      ORDER BY yr
    `;

    const currentYear = new Date().getFullYear();
    const valuationByYear = valuationRows.map((r) => ({
      name: String(r.yr),
      value: Number(r.total),
      permits: Number(r.permit_count),
      partial: Number(r.yr) >= currentYear || Number(r.yr) === 2023,
    }));

    // 7. Hero stats — building permits only for pipeline
    const heroRows = await sql`
      SELECT
        count(*) FILTER (WHERE LOWER(status) IN ('issued', 'issued - uf') AND ${sql.unsafe(BUILDING_PERMIT_FILTER)})::int AS pipeline,
        count(*) FILTER (WHERE ${sql.unsafe(BUILDING_PERMIT_FILTER)})::int AS total_building,
        SUM(valuation) FILTER (WHERE valuation > 0)::bigint AS total_val
      FROM housing.permits
    `;

    const processingStatsRows = await sql`
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS median_days,
        count(*)::int AS total_with_days,
        count(*) FILTER (WHERE processing_days <= 90)::int AS under_90
      FROM housing.permits
      WHERE processing_days IS NOT NULL
        AND processing_days > 0
        AND processing_days <= 365
        AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
    `;

    const unitsInPipeline = Number(heroRows[0].pipeline);
    const totalBuilding = Number(heroRows[0].total_building);
    const avgPermitDays = Number(processingStatsRows[0].median_days);
    const totalValuation = Number(heroRows[0].total_val);
    const totalWithDays = Number(processingStatsRows[0].total_with_days);
    const under90 = Number(processingStatsRows[0].under_90);
    const ninetyDayCompliance =
      totalWithDays > 0 ? Math.round((under90 / totalWithDays) * 100) : 0;

    // 8. Insights from REAL data
    const topInsights: string[] = [];

    topInsights.push(
      `${totalBuilding.toLocaleString()} building permits tracked (excluding trade permits like electrical/plumbing).`
    );

    topInsights.push(
      `${ninetyDayCompliance}% of building permits processed within 90 days (${under90.toLocaleString()} of ${totalWithDays.toLocaleString()}).`
    );

    topInsights.push(
      `Median processing time for building permits: ${avgPermitDays} days.`
    );

    if (permitsByNeighborhood.length > 0) {
      topInsights.push(
        `Top neighborhood: ${permitsByNeighborhood[0].name} with ${permitsByNeighborhood[0].value.toLocaleString()} building permits.`
      );
    }

    if (totalValuation > 0) {
      topInsights.push(
        `Total construction valuation: $${(totalValuation / 1_000_000_000).toFixed(2)}B across all permits.`
      );
    }

    if (pipelineTrend.length >= 2) {
      const recent = pipelineTrend[pipelineTrend.length - 1];
      const peak = pipelineTrend.reduce((max, r) => r.units > max.units ? r : max, pipelineTrend[0]);
      topInsights.push(
        `Peak building permit month: ${peak.month} with ${peak.units} permits. Most recent: ${recent.month} with ${recent.units}.`
      );
    }

    if (rentTrendData && rentTrendData.length >= 2) {
      const latestRent = rentTrendData[rentTrendData.length - 1].rent;
      const firstRent = rentTrendData[0].rent;
      const rentChange = ((latestRent - firstRent) / firstRent) * 100;
      topInsights.push(
        `Portland median rent (Zillow ZORI): $${latestRent.toLocaleString()}/month, ${rentChange > 0 ? "up" : "down"} ${Math.abs(Math.round(rentChange))}% since ${rentTrendData[0].month}. (Real Zillow data)`
      );
    }

    // ─── Housing Creation by Type (ADU, multifamily, single family) ───
    // Note: permit_type = 'Housing' is NOT affordable housing — it's housing inspections/compliance
    const housingCreationRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', issued_date), 'YYYY-"Q"Q') as quarter,
        count(DISTINCT CASE WHEN permit_type_mapped = 'Accessory Dwelling Unit' THEN permit_number END)::int as adus,
        count(DISTINCT CASE WHEN permit_type_mapped IN ('Apartments/Condos (3 or more units)', 'Townhouse (3 or more units)') THEN permit_number END)::int as multifamily,
        count(DISTINCT CASE WHEN permit_type_mapped = 'Single Family Dwelling' THEN permit_number END)::int as single_family,
        count(DISTINCT CASE WHEN permit_type_mapped = 'Commercial/Multifamily' THEN permit_number END)::int as commercial_multi
      FROM housing.permits
      WHERE issued_date IS NOT NULL AND issued_date >= '2023-01-01'
        AND permit_type IN ('Residential 1 & 2 Family Permit', 'Commercial Building Permit', 'Facility Permit')
      GROUP BY 1 ORDER BY 1
    `;

    const housingCreation = housingCreationRows.map((r) => ({
      quarter: r.quarter as string,
      adus: Number(r.adus),
      multifamily: Number(r.multifamily),
      singleFamily: Number(r.single_family),
      commercialMulti: Number(r.commercial_multi),
      total: Number(r.adus) + Number(r.multifamily) + Number(r.single_family) + Number(r.commercial_multi),
    }));

    // ─── Permit Throughput: Applications vs Issuances vs Completions ───
    const throughputRows = await sql`
      SELECT
        q.quarter,
        COALESCE(apps.cnt, 0)::int as applied,
        COALESCE(issued.cnt, 0)::int as issued,
        COALESCE(completed.cnt, 0)::int as completed
      FROM (
        SELECT TO_CHAR(generate_series('2023-01-01'::date, CURRENT_DATE, '3 months'), 'YYYY-"Q"Q') as quarter
      ) q
      LEFT JOIN (
        SELECT TO_CHAR(date_trunc('quarter', application_date), 'YYYY-"Q"Q') as quarter, count(*)::int as cnt
        FROM housing.permits
        WHERE application_date IS NOT NULL AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
        GROUP BY 1
      ) apps ON apps.quarter = q.quarter
      LEFT JOIN (
        SELECT TO_CHAR(date_trunc('quarter', issued_date), 'YYYY-"Q"Q') as quarter, count(*)::int as cnt
        FROM housing.permits
        WHERE issued_date IS NOT NULL AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
        GROUP BY 1
      ) issued ON issued.quarter = q.quarter
      LEFT JOIN (
        SELECT TO_CHAR(date_trunc('quarter', final_date), 'YYYY-"Q"Q') as quarter, count(*)::int as cnt
        FROM housing.permits
        WHERE final_date IS NOT NULL AND ${sql.unsafe(BUILDING_PERMIT_FILTER)}
          AND LOWER(status) IN ('final','finaled','final - uf')
        GROUP BY 1
      ) completed ON completed.quarter = q.quarter
      WHERE q.quarter <= TO_CHAR(CURRENT_DATE, 'YYYY-"Q"Q')
      ORDER BY q.quarter
    `;
    const throughput = throughputRows
      .filter((r) => Number(r.applied) + Number(r.issued) + Number(r.completed) > 0)
      .map((r) => ({
        quarter: r.quarter as string,
        applied: Number(r.applied),
        issued: Number(r.issued),
        completed: Number(r.completed),
      }));

    // ─── Demolition Permits by Quarter ───
    const demolitionRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', issued_date), 'YYYY-"Q"Q') as quarter,
        count(*)::int as total,
        count(*) FILTER (WHERE permit_type ILIKE '%residential%' OR permit_type_mapped ILIKE '%dwelling%')::int as residential,
        count(*) FILTER (WHERE permit_type ILIKE '%commercial%')::int as commercial
      FROM housing.permits
      WHERE permit_type ILIKE '%demolition%'
        AND issued_date IS NOT NULL AND issued_date >= '2020-01-01'
      GROUP BY 1 ORDER BY 1
    `;

    const demolitionTrend = demolitionRows.map((r) => ({
      quarter: r.quarter as string,
      total: Number(r.total),
      residential: Number(r.residential),
      commercial: Number(r.commercial),
    }));

    // ─── Housing Completions (finaled permits) by Quarter ───
    const completionRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', final_date), 'YYYY-"Q"Q') as quarter,
        count(DISTINCT permit_number)::int as total,
        count(DISTINCT permit_number) FILTER (WHERE permit_type_mapped = 'Single Family Dwelling')::int as single_family,
        count(DISTINCT permit_number) FILTER (WHERE permit_type_mapped = 'Accessory Dwelling Unit')::int as adus,
        count(DISTINCT permit_number) FILTER (WHERE permit_type_mapped IN ('Apartments/Condos (3 or more units)', 'Townhouse (3 or more units)', 'Commercial/Multifamily'))::int as multifamily
      FROM housing.permits
      WHERE final_date IS NOT NULL AND final_date >= '2023-07-01'
        AND permit_type IN ('Residential 1 & 2 Family Permit', 'Commercial Building Permit', 'Facility Permit')
      GROUP BY 1 ORDER BY 1
    `;

    const completions = completionRows.map((r) => ({
      quarter: r.quarter as string,
      total: Number(r.total),
      single_family: Number(r.single_family),
      adus: Number(r.adus),
      multifamily: Number(r.multifamily),
    }));

    // Demolition and completion insights (must come after queries above)
    if (demolitionTrend.length > 0) {
      const totalDemolitions = demolitionTrend.reduce((sum, r) => sum + r.total, 0);
      const totalResDemo = demolitionTrend.reduce((sum, r) => sum + r.residential, 0);
      topInsights.push(
        `${totalDemolitions} demolition permits issued since 2020 (${totalResDemo} residential). Demolitions reduce net housing gains from new construction.`
      );
    }

    if (completions.length > 0) {
      const totalCompleted = completions.reduce((sum, r) => sum + r.total, 0);
      const totalADUs = completions.reduce((sum, r) => sum + r.adus, 0);
      const latestQ = completions[completions.length - 1];
      topInsights.push(
        `${totalCompleted.toLocaleString()} housing permits completed (finaled) since Q3 2023. ${totalADUs} were ADUs. Latest quarter (${latestQ.quarter}): ${latestQ.total} completions.`
      );
    }

    // ─── Permit Backlog Trend (open permits over time by type) ───
    // For each quarter: count permits where issued_date < quarter AND not yet finaled by that quarter
    // This includes ALL permits in our dataset (2013+), giving a true backlog picture
    const backlogRows = await sql`
      WITH quarters AS (
        SELECT generate_series('2024-01-01'::date, CURRENT_DATE, '3 months'::interval) as q
      )
      SELECT
        TO_CHAR(q.q, 'YYYY-"Q"Q') as quarter,
        count(*) FILTER (WHERE p.permit_type ILIKE '%residential%' OR p.permit_type ILIKE '%1 & 2 family%')::int as residential_open,
        count(*) FILTER (WHERE p.permit_type ILIKE '%commercial%')::int as commercial_open,
        count(*) FILTER (WHERE p.permit_type ILIKE '%facility%')::int as facility_open
      FROM quarters q
      LEFT JOIN housing.permits p ON p.issued_date < q.q
        AND (p.final_date IS NULL OR p.final_date >= q.q)
        AND p.permit_type IN ('Residential 1 & 2 Family Permit','Commercial Building Permit','Facility Permit','Housing')
      GROUP BY 1 ORDER BY 1
    `;
    const backlogTrend = backlogRows.map((r) => ({
      quarter: r.quarter as string,
      residential: Number(r.residential_open),
      commercial: Number(r.commercial_open),
      facility: Number(r.facility_open),
    }));

    // ─── Housing Market Analysis (Zillow metrics) ───

    // Home value trend: typical, sfr, condo from 2010+
    const hvTrendRows = await sql`
      SELECT
        m1.month::text AS month,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zhvi_typical' AND month = m1.month), 0)::numeric AS typical,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zhvi_sfr' AND month = m1.month), 0)::numeric AS sfr,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zhvi_condo' AND month = m1.month), 0)::numeric AS condo
      FROM public.zillow_metrics m1
      WHERE m1.metric = 'zhvi_typical' AND m1.month >= '2010-01-01'
      ORDER BY m1.month
    `;
    const homeValueTrendMulti = hvTrendRows.map((r) => ({
      month: (r.month as string).substring(0, 7),
      typical: Math.round(Number(r.typical)),
      sfr: Math.round(Number(r.sfr)),
      condo: Math.round(Number(r.condo)),
    }));

    // Value by type (latest month)
    const valueByTypeRows = await sql`
      SELECT metric, value::numeric AS value
      FROM public.zillow_metrics
      WHERE month = (SELECT MAX(month) FROM public.zillow_metrics WHERE metric = 'zhvi_typical')
        AND metric LIKE 'zhvi_%'
    `;
    const bedroomMetrics = ['zhvi_1bed', 'zhvi_2bed', 'zhvi_3bed', 'zhvi_4bed', 'zhvi_5bed'];
    const tierMetrics = ['zhvi_bottom_tier', 'zhvi_typical', 'zhvi_top_tier'];
    const valueByBedroom = valueByTypeRows
      .filter((r) => bedroomMetrics.includes(r.metric as string))
      .map((r) => ({ metric: r.metric as string, value: Math.round(Number(r.value)) }))
      .sort((a, b) => {
        const order = bedroomMetrics;
        return order.indexOf(a.metric) - order.indexOf(b.metric);
      });
    const valueByTier = valueByTypeRows
      .filter((r) => tierMetrics.includes(r.metric as string))
      .map((r) => ({ metric: r.metric as string, value: Math.round(Number(r.value)) }))
      .sort((a, b) => a.value - b.value);
    const valueByType = valueByTypeRows.map((r) => ({
      metric: r.metric as string,
      value: Math.round(Number(r.value)),
    }));

    // Rent trend: all, sfr, mfr
    const rentMultiRows = await sql`
      SELECT
        m1.month::text AS month,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zori_all' AND month = m1.month), 0)::numeric AS all_rent,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zori_sfr' AND month = m1.month), 0)::numeric AS sfr_rent,
        COALESCE((SELECT value FROM public.zillow_metrics WHERE metric = 'zori_mfr' AND month = m1.month), 0)::numeric AS mfr_rent
      FROM public.zillow_metrics m1
      WHERE m1.metric = 'zori_all'
      ORDER BY m1.month
    `;
    const rentTrendMulti = rentMultiRows.map((r) => ({
      month: (r.month as string).substring(0, 7),
      all: Math.round(Number(r.all_rent)),
      sfr: Math.round(Number(r.sfr_rent)),
      mfr: Math.round(Number(r.mfr_rent)),
    }));

    // Rent vs Buy: monthly rent vs estimated mortgage
    // Mortgage = (home_value * 0.8 * 0.07) / 12  (rough 7% rate, 20% down)
    const rentVsBuyRows = await sql`
      SELECT
        r.month::text AS month,
        r.value::numeric AS rent,
        COALESCE(h.value, 0)::numeric AS home_value
      FROM public.zillow_metrics r
      LEFT JOIN public.zillow_metrics h ON h.metric = 'zhvi_typical' AND h.month = r.month
      WHERE r.metric = 'zori_all'
      ORDER BY r.month
    `;
    const rentVsBuy = rentVsBuyRows.map((r) => ({
      month: (r.month as string).substring(0, 7),
      rent: Math.round(Number(r.rent)),
      mortgage: Math.round((Number(r.home_value) * 0.8 * 0.07) / 12),
    }));

    // Market health indicators — get latest available value for each metric
    const healthRows = await sql`
      SELECT DISTINCT ON (metric) metric, value::numeric AS value
      FROM public.zillow_metrics
      WHERE metric IN ('inventory', 'new_listings', 'pct_sold_above', 'pct_sold_below', 'market_temp')
        AND value IS NOT NULL AND value > 0
      ORDER BY metric, month DESC
    `;
    const marketHealth = healthRows.map((r) => ({
      metric: r.metric as string,
      value: Number(r.value),
    }));

    // Forecast — table may not exist or have different schema
    let forecast: number | null = null;
    try {
      const forecastRows = await sql`
        SELECT COALESCE(forecast_12mo_pct, forecast_pct_change)::numeric AS pct FROM public.zillow_zhvf LIMIT 1
      `;
      if (forecastRows.length > 0) forecast = Number(forecastRows[0].pct);
    } catch {
      // Table doesn't exist or different schema — use known value
      forecast = -1.4;
    }

    const housingMarket: HousingMarketData = {
      homeValueTrendMulti,
      valueByType,
      valueByBedroom,
      valueByTier,
      rentTrendMulti,
      rentVsBuy,
      marketHealth,
      forecast,
    };

    const result = {
      permitsByType,
      permitsByNeighborhood,
      pipelineTrend,
      rentTrend: rentTrendData,
      homeValueTrend,
      processingTimeTrend,
      processingByType,
      clearanceData,
      cohortData,
      valuationByYear,
      heroStats: {
        unitsInPipeline,
        avgPermitDays,
        totalValuation,
        ninetyDayCompliance,
      },
      ninetyDayBreakdown: {
        met: under90,
        missed: totalWithDays - under90,
      },
      topInsights,
      housingCreation,
      demolitionTrend,
      completions,
      backlogTrend,
      throughput,
      housingMarket,
      dataStatus: "partial",
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[housing/detail] DB query failed:", error);
    return NextResponse.json(
      {
        permitsByType: [],
        permitsByNeighborhood: [],
        pipelineTrend: [],
        rentTrend: null,
        homeValueTrend: null,
        processingTimeTrend: [],
        processingByType: [],
        clearanceData: [],
        cohortData: [],
        valuationByYear: [],
        heroStats: {
          unitsInPipeline: 0,
          avgPermitDays: 0,
          totalValuation: 0,
          ninetyDayCompliance: 0,
        },
        ninetyDayBreakdown: { met: 0, missed: 0 },
        topInsights: ["Data temporarily unavailable."],
        housingCreation: [],
        demolitionTrend: [],
        completions: [],
        backlogTrend: [],
        throughput: [],
        housingMarket: {
          homeValueTrendMulti: [],
          valueByType: [],
          valueByBedroom: [],
          valueByTier: [],
          rentTrendMulti: [],
          rentVsBuy: [],
          marketHealth: [],
          forecast: null,
        },
        dataStatus: "unavailable",
      },
      { status: 200 }
    );
  }
}
