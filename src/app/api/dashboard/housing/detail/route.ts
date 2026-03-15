import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface HousingDetailResponse {
  permitsByType: { name: string; value: number; color: string }[];
  permitsByNeighborhood: { name: string; value: number }[];
  pipelineTrend: { month: string; units: number }[];
  rentTrend: { month: string; rent: number }[];
  processingTimeTrend: { month: string; avgDays: number }[];
  valuationByYear: { name: string; value: number }[];
  heroStats: {
    unitsInPipeline: number;
    avgPermitDays: number;
    totalValuation: number;
    ninetyDayCompliance: number;
  };
  ninetyDayBreakdown: { met: number; missed: number };
  topInsights: string[];
}

export async function GET(): Promise<NextResponse<HousingDetailResponse>> {
  try {
    // 1. Permits by type — use actual permit_type names, top 8 + other
    const typeRows = await sql`
      WITH ranked AS (
        SELECT permit_type AS category, count(*)::int AS cnt,
          ROW_NUMBER() OVER (ORDER BY count(*) DESC) AS rn
        FROM housing.permits
        WHERE permit_type IS NOT NULL
        GROUP BY permit_type
      )
      SELECT
        CASE WHEN rn <= 8 THEN category ELSE 'Other' END AS category,
        SUM(cnt)::int AS cnt
      FROM ranked
      GROUP BY CASE WHEN rn <= 8 THEN category ELSE 'Other' END
      ORDER BY SUM(cnt) DESC
    `;

    const typeColors: Record<string, string> = {
      Residential: "#3d7a5a",
      Commercial: "#c8956c",
      Facility: "#4a7f9e",
      "Trade/Other": "#7c6f9e",
    };

    const permitsByType = typeRows.map((r) => ({
      name: r.category as string,
      value: Number(r.cnt),
      color: typeColors[r.category as string] ?? "#1a3a2a",
    }));

    // 2. Top 10 neighborhoods by permit count
    const neighborhoodRows = await sql`
      SELECT neighborhood AS name, count(*)::int AS cnt
      FROM housing.permits
      WHERE neighborhood IS NOT NULL AND neighborhood != ''
      GROUP BY neighborhood
      ORDER BY cnt DESC
      LIMIT 10
    `;

    const permitsByNeighborhood = neighborhoodRows.map((r) => ({
      name: r.name as string,
      value: Number(r.cnt),
    }));

    // 3. Pipeline trend from housing_pipeline_monthly (10-year)
    const pipelineRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, units_in_pipeline::int AS units
      FROM housing_pipeline_monthly
      ORDER BY month
    `;

    const pipelineTrend = pipelineRows.map((r) => ({
      month: r.month as string,
      units: Number(r.units),
    }));

    // 4. Rent trend from housing_rents (10-year)
    const rentRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, zori AS rent
      FROM housing_rents
      ORDER BY month
    `;

    const rentTrend = rentRows.map((r) => ({
      month: r.month as string,
      rent: Number(Number(r.rent).toFixed(0)),
    }));

    // 5. Processing time trend — MEDIAN per month, excluding outliers
    // Only include permits with reasonable processing times (1-365 days)
    // and from the last 3 years for a meaningful trend
    const processingRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') AS month,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS avg_days,
        count(*)::int AS permit_count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date >= NOW() - INTERVAL '36 months'
        AND processing_days IS NOT NULL
        AND processing_days > 0
        AND processing_days <= 365
      GROUP BY date_trunc('month', issued_date)
      HAVING count(*) >= 5
      ORDER BY date_trunc('month', issued_date)
    `;

    const processingTimeTrend = processingRows.map((r) => ({
      month: r.month as string,
      avgDays: Number(r.avg_days),
    }));

    // 6. Valuation by year
    const valuationRows = await sql`
      SELECT
        EXTRACT(YEAR FROM issued_date)::int AS yr,
        SUM(valuation)::bigint AS total
      FROM housing.permits
      WHERE issued_date IS NOT NULL AND valuation > 0
      GROUP BY EXTRACT(YEAR FROM issued_date)
      ORDER BY yr
    `;

    const valuationByYear = valuationRows.map((r) => ({
      name: String(r.yr),
      value: Number(r.total),
    }));

    // 7. Hero stats
    const heroRows = await sql`
      SELECT
        count(*) FILTER (WHERE status = 'issued')::int AS pipeline,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_days) FILTER (WHERE processing_days IS NOT NULL AND processing_days > 0 AND processing_days <= 365)::int AS avg_days,
        SUM(valuation) FILTER (WHERE valuation > 0)::bigint AS total_val,
        count(*) FILTER (WHERE processing_days IS NOT NULL AND processing_days >= 0)::int AS total_with_days,
        count(*) FILTER (WHERE processing_days IS NOT NULL AND processing_days >= 0 AND processing_days <= 90)::int AS under_90
      FROM housing.permits
    `;

    const unitsInPipeline = Number(heroRows[0].pipeline);
    const avgPermitDays = Number(heroRows[0].avg_days);
    const totalValuation = Number(heroRows[0].total_val);
    const totalWithDays = Number(heroRows[0].total_with_days);
    const under90 = Number(heroRows[0].under_90);
    const ninetyDayCompliance =
      totalWithDays > 0 ? Math.round((under90 / totalWithDays) * 100) : 0;

    // 8. Insights
    const topInsights: string[] = [];

    // Total permits
    const totalPermits = permitsByType.reduce((s, p) => s + p.value, 0);
    topInsights.push(
      `${totalPermits.toLocaleString()} total permits in the database spanning residential, commercial, facility, and trade categories.`
    );

    // Pipeline trend
    if (pipelineTrend.length >= 24) {
      const recent = pipelineTrend.slice(-3).reduce((s, r) => s + r.units, 0) / 3;
      const twoYearsAgo =
        pipelineTrend.slice(-27, -24).reduce((s, r) => s + r.units, 0) / 3;
      if (twoYearsAgo > 0) {
        const pipelineChange = ((recent - twoYearsAgo) / twoYearsAgo) * 100;
        topInsights.push(
          `Housing pipeline is ${pipelineChange > 0 ? "up" : "down"} ${Math.abs(Math.round(pipelineChange))}% vs two years ago.`
        );
      }
    }

    // 90-day compliance
    topInsights.push(
      `${ninetyDayCompliance}% of permits meet the 90-day processing guarantee (${under90.toLocaleString()} of ${totalWithDays.toLocaleString()}).`
    );

    // Top neighborhood
    if (permitsByNeighborhood.length > 0) {
      topInsights.push(
        `Top neighborhood for permits: ${permitsByNeighborhood[0].name} with ${permitsByNeighborhood[0].value.toLocaleString()} permits.`
      );
    }

    // Valuation
    if (totalValuation > 0) {
      topInsights.push(
        `Total construction valuation: $${(totalValuation / 1_000_000_000).toFixed(2)}B across all permits.`
      );
    }

    // Rent trend
    if (rentTrend.length >= 2) {
      const latestRent = rentTrend[rentTrend.length - 1].rent;
      const firstRent = rentTrend[0].rent;
      const rentChange = ((latestRent - firstRent) / firstRent) * 100;
      topInsights.push(
        `Median rent (ZORI) has ${rentChange > 0 ? "increased" : "decreased"} ${Math.abs(Math.round(rentChange))}% over the period, from $${firstRent.toLocaleString()} to $${latestRent.toLocaleString()}.`
      );
    }

    const result: HousingDetailResponse = {
      permitsByType,
      permitsByNeighborhood,
      pipelineTrend,
      rentTrend,
      processingTimeTrend,
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
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[housing/detail] DB query failed:", error);
    return NextResponse.json(
      {
        permitsByType: [],
        permitsByNeighborhood: [],
        pipelineTrend: [],
        rentTrend: [],
        processingTimeTrend: [],
        valuationByYear: [],
        heroStats: {
          unitsInPipeline: 0,
          avgPermitDays: 0,
          totalValuation: 0,
          ninetyDayCompliance: 0,
        },
        ninetyDayBreakdown: { met: 0, missed: 0 },
        topInsights: ["Data temporarily unavailable."],
      },
      { status: 200 }
    );
  }
}
