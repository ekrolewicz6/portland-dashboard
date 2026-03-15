import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { SafetyData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "safety";
const PORTLAND_POPULATION = 650_000;

export async function GET(): Promise<NextResponse<SafetyData & { dataStatus: string }>> {
  try {
    // Check cache first
    const cached = await getCachedData<SafetyData & { dataStatus: string }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Monthly totals from real PPB offenses (613K records)
    const monthlyRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', occur_date), 'YYYY-MM') AS date,
        count(*)::int AS value
      FROM safety.ppb_offenses
      WHERE occur_date >= '2016-01-01' AND occur_date < '2026-02-01'
      GROUP BY 1
      ORDER BY 1
    `;

    const chartData = monthlyRows.map((row) => ({
      date: row.date as string,
      value: Number(row.value),
    }));

    // Crime by category totals (last 12 months)
    const categoryRows = await sql`
      SELECT
        crime_against AS category,
        count(*)::int AS count
      FROM safety.ppb_offenses
      WHERE occur_date >= CURRENT_DATE - interval '12 months'
      GROUP BY 1
      ORDER BY count DESC
    `;

    const crimeByCategory = categoryRows.map((row) => ({
      category: row.category as string,
      count: Number(row.count),
      change: 0,
    }));

    // Latest complete month total
    const latestMonth = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    const latestMonthTotal = latestMonth ? latestMonth.value : 0;

    // Year-over-year: compare last complete year to year before
    const yoyRows = await sql`
      WITH current_yr AS (
        SELECT count(*)::int AS cnt
        FROM safety.ppb_offenses
        WHERE occur_date >= date_trunc('year', CURRENT_DATE) - interval '1 year'
          AND occur_date < date_trunc('year', CURRENT_DATE)
      ),
      prior_yr AS (
        SELECT count(*)::int AS cnt
        FROM safety.ppb_offenses
        WHERE occur_date >= date_trunc('year', CURRENT_DATE) - interval '2 years'
          AND occur_date < date_trunc('year', CURRENT_DATE) - interval '1 year'
      )
      SELECT current_yr.cnt AS current_count, prior_yr.cnt AS prior_count
      FROM current_yr, prior_yr
    `;

    let yoyChange = 0;
    let yoyLabel = "year-over-year";
    if (yoyRows.length > 0) {
      const cur = Number(yoyRows[0].current_count);
      const prior = Number(yoyRows[0].prior_count);
      if (prior > 0) {
        yoyChange = Number((((cur - prior) / prior) * 100).toFixed(1));
        yoyLabel = `${yoyChange > 0 ? "+" : ""}${yoyChange}% year-over-year`;
      }
    }

    const annualized = latestMonthTotal * 12;
    const ratePer1000 = parseFloat(
      ((annualized / PORTLAND_POPULATION) * 1000).toFixed(1),
    );

    const trendDirection: "up" | "down" | "flat" =
      yoyChange > 1 ? "up" : yoyChange < -1 ? "down" : "flat";

    const headline = `${latestMonthTotal.toLocaleString()} crimes reported (${latestMonth?.date ?? "latest month"}) — ${ratePer1000} per 1K residents`;

    const result: SafetyData & { dataStatus: string } = {
      headline,
      headlineValue: latestMonthTotal,
      dataStatus: "live",
      trend: {
        direction: trendDirection,
        percentage: Math.abs(yoyChange),
        label: yoyLabel,
      },
      chartData,
      crimeByCategory,
      responseTime: [],
      source: "Portland Police Bureau — 613,003 offense records (2016-2026)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${latestMonthTotal.toLocaleString()} reported crimes in ${latestMonth?.date ?? "latest month"} (${ratePer1000} per 1,000 annualized).`,
        ...crimeByCategory
          .slice(0, 3)
          .map((c) => `${c.category}: ${c.count.toLocaleString()} offenses (last 12 months).`),
        `Year-over-year trend: ${yoyLabel}.`,
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[safety] DB query failed:", error);
    return NextResponse.json({
      headline: "Crime data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      crimeByCategory: [],
      responseTime: [],
      source: "Portland Police Bureau / BOEC 911",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Database connection failed. Crime data is temporarily unavailable."],
    } as unknown as SafetyData & { dataStatus: string });
  }
}
