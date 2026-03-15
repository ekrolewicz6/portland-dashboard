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

    // 2. Current totals by category for bar chart
    const currentCatRows = await sql`
      SELECT category, SUM(count)::int AS total
      FROM safety.crime_monthly
      GROUP BY category
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

    // 3. Total crimes for hero stats
    const totalCrimesThisYear = currentYearByCategory
      ? currentYearByCategory.reduce((s, c) => s + c.value, 0)
      : 0;

    const ratePer1000 = totalCrimesThisYear > 0
      ? Number(((totalCrimesThisYear / PORTLAND_POPULATION) * 1000).toFixed(1))
      : 0;

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

    if (totalCrimesThisYear > 0) {
      topInsights.push(
        `${totalCrimesThisYear.toLocaleString()} total reported crimes in current ArcGIS snapshot — ${ratePer1000} per 1,000 residents.`
      );
    }

    const propCurrent = currentYearByCategory?.find((c) => c.name === "Property");
    if (propCurrent && totalCrimesThisYear > 0) {
      topInsights.push(
        `Property crime accounts for ${Math.round((propCurrent.value / totalCrimesThisYear) * 100)}% of all reported crimes (${propCurrent.value.toLocaleString()} incidents).`
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
        totalCrimesThisYear,
        ratePer1000,
        yoyChange: 0,
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
