import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

const PORTLAND_POPULATION = 650_000;

interface SafetyDetailResponse {
  // REAL data from safety.crime_monthly (ArcGIS Crime MapServer snapshot)
  crimeByCategory: { month: string; property: number; person: number; society: number }[] | null;
  currentYearByCategory: { name: string; value: number; color: string }[] | null;
  yearOverYear: { current: number; prior: number; change: number } | null;
  heroStats: {
    totalCrimesThisYear: number;
    ratePer1000: number;
    yoyChange: number;
    avgResponseP1: number | null;
  };
  // REAL data from safety.graffiti_monthly
  graffitiTrend: { month: string; count: number }[] | null;
  // UNAVAILABLE — needs data
  responseTimesTrend: null;
  historicalCrimeTrend: null;
  topInsights: string[];
  dataStatus: string;
}

export async function GET(): Promise<NextResponse<SafetyDetailResponse>> {
  try {
    // 1. Crime by category from REAL safety.crime_monthly (current snapshot)
    const crimePivotRows = await sql`
      SELECT
        TO_CHAR(month, 'YYYY-MM') AS month,
        COALESCE(SUM(count) FILTER (WHERE category = 'property'), 0)::int AS property,
        COALESCE(SUM(count) FILTER (WHERE category = 'person'), 0)::int AS person,
        COALESCE(SUM(count) FILTER (WHERE category = 'society'), 0)::int AS society
      FROM safety.crime_monthly
      GROUP BY month
      ORDER BY month
    `;

    const crimeByCategory = crimePivotRows.length > 0
      ? crimePivotRows.map((r) => ({
          month: r.month as string,
          property: Number(r.property),
          person: Number(r.person),
          society: Number(r.society),
        }))
      : null;

    // 2. Most recent month totals by category for bar chart
    const currentCatRows = await sql`
      SELECT category, count::int AS total
      FROM safety.crime_monthly
      WHERE month = (SELECT MAX(month) FROM safety.crime_monthly)
      ORDER BY total DESC
    `;

    const categoryColors: Record<string, string> = {
      property: "#c8956c",
      person: "#b85c3a",
      society: "#7c6f9e",
    };

    const currentYearByCategory = currentCatRows.length > 0
      ? currentCatRows.map((r) => ({
          name: String(r.category).charAt(0).toUpperCase() + String(r.category).slice(1),
          value: Number(r.total),
          color: categoryColors[r.category as string] ?? "#1a3a2a",
        }))
      : null;

    // 3. Latest month total for hero stats
    const latestMonthTotal = currentYearByCategory
      ? currentYearByCategory.reduce((s, c) => s + c.value, 0)
      : 0;

    // Annualized rate: latest month × 12 / population × 1000
    const annualizedTotal = latestMonthTotal * 12;
    const ratePer1000 = latestMonthTotal > 0
      ? Number(((annualizedTotal / PORTLAND_POPULATION) * 1000).toFixed(1))
      : 0;

    // Year-over-year: compare latest month to same month last year
    let yoyChange = 0;
    let priorYearTotal = 0;
    if (crimeByCategory && crimeByCategory.length >= 13) {
      const latest = crimeByCategory[crimeByCategory.length - 1];
      const priorYear = crimeByCategory[crimeByCategory.length - 13];
      const latestTotal = latest.property + latest.person + latest.society;
      priorYearTotal = priorYear.property + priorYear.person + priorYear.society;
      if (priorYearTotal > 0) {
        yoyChange = Number((((latestTotal - priorYearTotal) / priorYearTotal) * 100).toFixed(1));
      }
    }

    // 4. Graffiti trend from REAL safety.graffiti_monthly
    const graffitiRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, count::int
      FROM safety.graffiti_monthly
      ORDER BY month
    `;

    const graffitiTrend = graffitiRows.length > 0
      ? graffitiRows.map((r) => ({
          month: r.month as string,
          count: Number(r.count),
        }))
      : null;

    // 5. Generate insights from REAL data only
    const topInsights: string[] = [];

    if (latestMonthTotal > 0) {
      topInsights.push(
        `${latestMonthTotal.toLocaleString()} reported crimes in the most recent month (${ratePer1000} per 1,000 residents annualized).`
      );
    }

    if (yoyChange !== 0) {
      topInsights.push(
        `Crime is ${yoyChange < 0 ? "down" : "up"} ${Math.abs(yoyChange)}% compared to the same month last year.`
      );
    }

    const propCurrent = currentYearByCategory?.find((c) => c.name === "Property");
    if (propCurrent && latestMonthTotal > 0) {
      topInsights.push(
        `Property crime accounts for ${Math.round((propCurrent.value / latestMonthTotal) * 100)}% of all reported crimes (${propCurrent.value.toLocaleString()} incidents this month).`
      );
    }

    if (graffitiTrend && graffitiTrend.length > 0) {
      const totalGraffiti = graffitiTrend.reduce((s, r) => s + r.count, 0);
      topInsights.push(
        `${totalGraffiti.toLocaleString()} graffiti reports tracked from Portland BPS.`
      );
    }

    topInsights.push(
      "Historical monthly crime trends are unavailable — need PPB CSV downloads from portland.gov/police/open-data/reported-crime-data."
    );
    topInsights.push(
      "911 response times are unavailable — requires public records request to BOEC."
    );

    const result: SafetyDetailResponse = {
      crimeByCategory,
      currentYearByCategory,
      yearOverYear: null, // No historical comparison data
      heroStats: {
        totalCrimesThisYear: latestMonthTotal,
        ratePer1000,
        yoyChange,
        avgResponseP1: null, // No BOEC data
      },
      graffitiTrend,
      responseTimesTrend: null, // Needs BOEC public records request
      historicalCrimeTrend: null, // Needs PPB CSV downloads
      topInsights,
      dataStatus: "partial",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[safety/detail] DB query failed:", error);
    return NextResponse.json({
      crimeByCategory: null,
      currentYearByCategory: null,
      yearOverYear: null,
      heroStats: {
        totalCrimesThisYear: 0,
        ratePer1000: 0,
        yoyChange: 0,
        avgResponseP1: null,
      },
      graffitiTrend: null,
      responseTimesTrend: null,
      historicalCrimeTrend: null,
      topInsights: ["Data temporarily unavailable."],
      dataStatus: "unavailable",
    });
  }
}
