import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

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
  topInsights: string[];
  dataStatus: string;
}

// Only count these as "building" permits (exclude trade permits, tree permits, noise)
const BUILDING_PERMIT_FILTER = `
  permit_type IN (
    'Residential 1 & 2 Family Permit',
    'Commercial Building Permit',
    'Facility Permit',
    'Minor Improvement Permit',
    'Housing',
    'Fire Systems Permit'
  )
`;

export async function GET(): Promise<NextResponse<HousingDetailResponse>> {
  try {
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
        count(*) FILTER (WHERE status = 'finaled')::int AS finaled,
        ROUND(100.0 * count(*) FILTER (WHERE status = 'finaled') / NULLIF(count(*), 0))::int AS clearance_pct,
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
        count(*) FILTER (WHERE status = 'finaled')::int as cleared,
        ROUND(100.0 * count(*) FILTER (WHERE status = 'finaled') / NULLIF(count(*), 0))::int as clearance_pct,
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

    // 6. Valuation by year — exclude current incomplete year
    const valuationRows = await sql`
      SELECT
        EXTRACT(YEAR FROM issued_date)::int AS yr,
        SUM(valuation)::bigint AS total,
        count(*)::int AS permit_count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND valuation > 0
        AND EXTRACT(YEAR FROM issued_date) <= 2024
      GROUP BY EXTRACT(YEAR FROM issued_date)
      ORDER BY yr
    `;

    const valuationByYear = valuationRows.map((r) => ({
      name: String(r.yr),
      value: Number(r.total),
    }));

    // 7. Hero stats — building permits only for pipeline
    const heroRows = await sql`
      SELECT
        count(*) FILTER (WHERE status = 'issued' AND ${sql.unsafe(BUILDING_PERMIT_FILTER)})::int AS pipeline,
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

    return NextResponse.json({
      permitsByType,
      permitsByNeighborhood,
      pipelineTrend,
      rentTrend: rentTrendData,
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
      dataStatus: "partial",
    });
  } catch (error) {
    console.error("[housing/detail] DB query failed:", error);
    return NextResponse.json(
      {
        permitsByType: [],
        permitsByNeighborhood: [],
        pipelineTrend: [],
        rentTrend: null,
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
        dataStatus: "unavailable",
      },
      { status: 200 }
    );
  }
}
