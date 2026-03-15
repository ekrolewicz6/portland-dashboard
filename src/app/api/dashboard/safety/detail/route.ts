import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

const PORTLAND_POPULATION = 650_000;

interface CrimeByCategoryRow {
  month: string;
  property: number;
  person: number;
  society: number;
}

interface ResponseTimeRow {
  month: string;
  priority1: number;
  priority2: number;
  priority3: number;
}

interface GraffitiRow {
  month: string;
  count: number;
}

interface SafetyDetailResponse {
  crimeByCategory: CrimeByCategoryRow[];
  responseTimesTrend: ResponseTimeRow[];
  graffitiTrend: GraffitiRow[];
  yearOverYear: {
    current: number;
    prior: number;
    change: number;
  };
  currentYearByCategory: { name: string; value: number; color: string }[];
  heroStats: {
    totalCrimesThisYear: number;
    ratePer1000: number;
    yoyChange: number;
    avgResponseP1: number;
  };
  topInsights: string[];
}

export async function GET(): Promise<NextResponse<SafetyDetailResponse>> {
  try {
    // 1. Crime by category - full 10-year trend, pivoted by month
    const crimePivotRows = await sql`
      SELECT
        TO_CHAR(month, 'YYYY-MM') AS month,
        COALESCE(SUM(count) FILTER (WHERE category = 'property'), 0)::int AS property,
        COALESCE(SUM(count) FILTER (WHERE category = 'person'), 0)::int AS person,
        COALESCE(SUM(count) FILTER (WHERE category = 'society'), 0)::int AS society
      FROM safety_crime_monthly
      GROUP BY month
      ORDER BY month
    `;

    const crimeByCategory: CrimeByCategoryRow[] = crimePivotRows.map((r) => ({
      month: r.month as string,
      property: Number(r.property),
      person: Number(r.person),
      society: Number(r.society),
    }));

    // 2. Response times trend - pivot by priority
    const rtRows = await sql`
      SELECT
        TO_CHAR(month, 'YYYY-MM') AS month,
        COALESCE(MAX(median_minutes) FILTER (WHERE priority = 'Priority 1'), 0) AS priority1,
        COALESCE(MAX(median_minutes) FILTER (WHERE priority = 'Priority 2'), 0) AS priority2,
        COALESCE(MAX(median_minutes) FILTER (WHERE priority = 'Priority 3'), 0) AS priority3
      FROM safety_response_times
      GROUP BY month
      ORDER BY month
    `;

    const responseTimesTrend: ResponseTimeRow[] = rtRows.map((r) => ({
      month: r.month as string,
      priority1: Number(Number(r.priority1).toFixed(1)),
      priority2: Number(Number(r.priority2).toFixed(1)),
      priority3: Number(Number(r.priority3).toFixed(1)),
    }));

    // 3. Graffiti trend
    const graffitiRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') AS month, count::int
      FROM safety_graffiti_monthly
      ORDER BY month
    `;

    const graffitiTrend: GraffitiRow[] = graffitiRows.map((r) => ({
      month: r.month as string,
      count: Number(r.count),
    }));

    // 4. Year-over-year comparison
    const yoyRows = await sql`
      WITH periods AS (
        SELECT
          SUM(count) FILTER (WHERE month >= date_trunc('year', CURRENT_DATE) - INTERVAL '1 year'
                              AND month < date_trunc('year', CURRENT_DATE))::int AS prior,
          SUM(count) FILTER (WHERE month >= date_trunc('year', CURRENT_DATE))::int AS current_yr
        FROM safety_crime_monthly
      )
      SELECT
        COALESCE(current_yr, 0) AS current_yr,
        COALESCE(prior, 0) AS prior,
        CASE WHEN prior > 0
          THEN ROUND(((current_yr - prior)::numeric / prior) * 100, 1)
          ELSE 0
        END AS change
      FROM periods
    `;

    const currentYr = Number(yoyRows[0].current_yr);
    const priorYr = Number(yoyRows[0].prior);
    const yoyChange = Number(yoyRows[0].change);

    // 5. Current year totals by category for bar chart
    const currentCatRows = await sql`
      SELECT category, SUM(count)::int AS total
      FROM safety_crime_monthly
      WHERE month >= date_trunc('year', CURRENT_DATE)
      GROUP BY category
      ORDER BY total DESC
    `;

    const categoryColors: Record<string, string> = {
      property: "#c8956c",
      person: "#b85c3a",
      society: "#7c6f9e",
    };

    const currentYearByCategory = currentCatRows.map((r) => ({
      name: String(r.category).charAt(0).toUpperCase() + String(r.category).slice(1),
      value: Number(r.total),
      color: categoryColors[r.category as string] ?? "#1a3a2a",
    }));

    // 6. Hero stats
    const totalCrimesThisYear = currentYearByCategory.reduce(
      (s, c) => s + c.value,
      0
    );
    // Annualize based on months elapsed
    const monthsElapsed = new Date().getMonth() + 1;
    const annualizedRate =
      ((totalCrimesThisYear / monthsElapsed) * 12) / PORTLAND_POPULATION * 1000;
    const ratePer1000 = Number(annualizedRate.toFixed(1));

    // Avg Priority 1 response time (last 12 months)
    const p1Avg = await sql`
      SELECT AVG(median_minutes)::numeric(5,1) AS avg_p1
      FROM safety_response_times
      WHERE priority = 'Priority 1'
        AND month >= (CURRENT_DATE - INTERVAL '12 months')
    `;
    const avgResponseP1 = Number(p1Avg[0].avg_p1 || 0);

    // 7. Generate insights
    const topInsights: string[] = [];

    // Find biggest change
    if (yoyChange < 0) {
      topInsights.push(
        `Total crime is down ${Math.abs(yoyChange)}% compared to the same period last year.`
      );
    } else if (yoyChange > 0) {
      topInsights.push(
        `Total crime is up ${yoyChange}% compared to the same period last year.`
      );
    }

    // Property crime insight
    const propCurrent = currentYearByCategory.find((c) => c.name === "Property");
    if (propCurrent) {
      topInsights.push(
        `Property crime accounts for ${Math.round((propCurrent.value / Math.max(totalCrimesThisYear, 1)) * 100)}% of all reported crimes.`
      );
    }

    // Response time insight
    if (avgResponseP1 > 0) {
      topInsights.push(
        `Average Priority 1 (life-threatening) response time: ${avgResponseP1} minutes over the past 12 months.`
      );
    }

    // Peak year insight from data
    const peakMonth = crimeByCategory.reduce(
      (max, row) => {
        const total = row.property + row.person + row.society;
        return total > max.total ? { month: row.month, total } : max;
      },
      { month: "", total: 0 }
    );
    if (peakMonth.month) {
      topInsights.push(
        `Peak crime month in the dataset: ${peakMonth.month} with ${peakMonth.total.toLocaleString()} total incidents.`
      );
    }

    // Graffiti trend
    if (graffitiTrend.length >= 12) {
      const recent = graffitiTrend.slice(-3).reduce((s, r) => s + r.count, 0) / 3;
      const yearAgo =
        graffitiTrend.slice(-15, -12).reduce((s, r) => s + r.count, 0) / 3;
      if (yearAgo > 0) {
        const graffitiChange = ((recent - yearAgo) / yearAgo) * 100;
        topInsights.push(
          `Graffiti reports are ${graffitiChange > 0 ? "up" : "down"} ${Math.abs(Math.round(graffitiChange))}% compared to a year ago.`
        );
      }
    }

    const result: SafetyDetailResponse = {
      crimeByCategory,
      responseTimesTrend,
      graffitiTrend,
      yearOverYear: {
        current: currentYr,
        prior: priorYr,
        change: yoyChange,
      },
      currentYearByCategory,
      heroStats: {
        totalCrimesThisYear,
        ratePer1000,
        yoyChange,
        avgResponseP1,
      },
      topInsights,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[safety/detail] DB query failed:", error);
    return NextResponse.json(
      {
        crimeByCategory: [],
        responseTimesTrend: [],
        graffitiTrend: [],
        yearOverYear: { current: 0, prior: 0, change: 0 },
        currentYearByCategory: [],
        heroStats: {
          totalCrimesThisYear: 0,
          ratePer1000: 0,
          yoyChange: 0,
          avgResponseP1: 0,
        },
        topInsights: ["Data temporarily unavailable."],
      },
      { status: 200 }
    );
  }
}
