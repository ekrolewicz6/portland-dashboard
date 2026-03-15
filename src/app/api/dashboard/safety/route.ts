import { NextResponse } from "next/server";
import { safetyData } from "@/lib/mock-data";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { SafetyData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "safety";
const PORTLAND_POPULATION = 650_000;

export async function GET(): Promise<NextResponse<SafetyData>> {
  try {
    // Check cache first
    const cached = await getCachedData<SafetyData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Query recent crime categories (last 3 months aggregated)
    const categoryRows = await sql`
      SELECT category, SUM(count) as count
      FROM safety.crime_monthly
      ORDER BY category
    `;

    if (!categoryRows || categoryRows.length === 0) {
      console.warn("[safety] No crime data in DB, returning mock data");
      return NextResponse.json(safetyData);
    }

    const crimeByCategory = categoryRows.map((row) => ({
      category: row.category as string,
      count: Number(row.count),
      change: 0, // No prior-year comparison data yet
    }));

    const totalCrimes = crimeByCategory.reduce((s, c) => s + c.count, 0);
    const ratePer1000 = parseFloat(
      ((totalCrimes / PORTLAND_POPULATION) * 1000).toFixed(1),
    );

    // Build 12-month chart data from crime_monthly
    const monthlyRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') as date, SUM(count) as value
      FROM safety.crime_monthly
      GROUP BY month
      ORDER BY month
    `;

    let chartData = safetyData.chartData; // fallback
    if (monthlyRows && monthlyRows.length >= 6) {
      chartData = monthlyRows.slice(-12).map((row) => ({
        date: row.date as string,
        value: Number(row.value),
      }));
    }

    const result: SafetyData = {
      headline: `${totalCrimes.toLocaleString()} total reported crimes — ${ratePer1000} per 1,000 residents`,
      headlineValue: totalCrimes,
      trend: safetyData.trend, // keep mock trend until prior-year data available
      chartData,
      crimeByCategory,
      responseTime: safetyData.responseTime, // keep mock until BOEC API integration
      source: "Portland Police Bureau / BOEC 911 (local DB)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        ...crimeByCategory
          .slice(0, 3)
          .map(
            (c) =>
              `${c.category}: ${c.count.toLocaleString()} incidents.`,
          ),
        "Response-time data still uses mock values — BOEC API integration pending.",
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[safety] DB query failed, returning mock data:", error);
    return NextResponse.json(safetyData);
  }
}
