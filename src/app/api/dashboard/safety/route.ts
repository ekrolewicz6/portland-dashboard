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

    // Query crime categories from real data (current snapshot from ArcGIS Crime MapServer)
    const categoryRows = await sql`
      SELECT category, SUM(count) as count
      FROM safety.crime_monthly
      ORDER BY category
    `;

    if (!categoryRows || categoryRows.length === 0) {
      // No real data available at all
      return NextResponse.json({
        headline: "Crime data temporarily unavailable",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          { name: "Crime Grid Data", status: "offline", provider: "Portland Police Bureau via ArcGIS" },
          { name: "911 Response Times", status: "needs_prr", provider: "BOEC" },
        ],
        trend: { direction: "flat" as const, percentage: 0, label: "no data" },
        chartData: [],
        crimeByCategory: [],
        responseTime: null,
        source: "Portland Police Bureau / BOEC 911",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Crime grid data is not currently available from the database."],
      } as unknown as SafetyData & { dataStatus: string });
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

    // Build chart data from crime_monthly (limited — only current snapshot)
    const monthlyRows = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') as date, SUM(count) as value
      FROM safety.crime_monthly
      GROUP BY month
      ORDER BY month
    `;

    const chartData = monthlyRows.map((row) => ({
      date: row.date as string,
      value: Number(row.value),
    }));

    // Query graffiti count
    const graffitiRows = await sql`
      SELECT count FROM safety.graffiti_monthly ORDER BY month DESC LIMIT 1
    `;
    const graffitiCount = graffitiRows.length > 0 ? Number(graffitiRows[0].count) : null;

    const result: SafetyData & { dataStatus: string } = {
      headline: `${totalCrimes.toLocaleString()} total reported crimes — ${ratePer1000} per 1,000 residents (current snapshot)`,
      headlineValue: totalCrimes,
      dataStatus: "partial",
      trend: { direction: "flat" as const, percentage: 0, label: "no historical comparison available" },
      chartData,
      crimeByCategory,
      responseTime: [], // No BOEC data — needs public records request
      source: "Portland Police Bureau ArcGIS Crime MapServer (real) / BOEC 911 (unavailable)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        ...crimeByCategory
          .slice(0, 3)
          .map((c) => `${c.category}: ${c.count.toLocaleString()} incidents (current snapshot from ArcGIS grid).`),
        ...(graffitiCount ? [`${graffitiCount.toLocaleString()} graffiti reports from Portland BPS.`] : []),
        "FBI UCR Oregon statewide crime estimates available (2016-2022) — see detail view for trends.",
        "Historical monthly crime trends unavailable — need PPB CSV downloads from portland.gov/police/open-data.",
        "911 response times unavailable — requires public records request to BOEC.",
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
