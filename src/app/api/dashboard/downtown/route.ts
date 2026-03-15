import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { DowntownData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "downtown";

export async function GET(): Promise<NextResponse<DowntownData & { dataStatus: string }>> {
  try {
    // Check cache first
    const cached = await getCachedData<DowntownData & { dataStatus: string }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Only real data: graffiti reports from Portland BPS
    const graffitiRows = await sql`
      SELECT count
      FROM safety.graffiti_monthly
      ORDER BY month DESC
      LIMIT 1
    `;

    const monthlyGraffiti = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') as date, count
      FROM safety.graffiti_monthly
      ORDER BY month
    `;

    const latestGraffiti = graffitiRows.length > 0 ? Number(graffitiRows[0].count) : 0;
    const totalGraffiti = monthlyGraffiti.length > 0
      ? monthlyGraffiti.reduce((s, r) => s + Number(r.count), 0)
      : 0;

    const graffitiChartData = monthlyGraffiti.map((r) => ({
      date: r.date as string,
      value: Number(r.count),
    }));

    const result: DowntownData & { dataStatus: string } = {
      headline: latestGraffiti > 0
        ? `${totalGraffiti.toLocaleString()} graffiti reports tracked — disorder proxy metric`
        : "Downtown vitality data collection in progress",
      headlineValue: totalGraffiti,
      dataStatus: "partial",
      trend: { direction: "flat" as const, percentage: 0, label: "no trend comparison available" },
      chartData: graffitiChartData,
      footTraffic: [], // Needs Placer.ai subscription ($2-5K/mo)
      vacancyRate: [], // Needs CoStar subscription ($500-1.5K/mo)
      dwellTime: [], // Needs Placer.ai subscription
      source: "Portland BPS Graffiti (real) / Placer.ai (unavailable) / CoStar (unavailable)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        ...(totalGraffiti > 0
          ? [`${totalGraffiti.toLocaleString()} graffiti reports total from Portland BPS.`]
          : []),
        ...(latestGraffiti > 0
          ? [`Latest month: ${latestGraffiti.toLocaleString()} graffiti reports.`]
          : []),
        "Foot traffic data unavailable — requires Placer.ai subscription ($2-5K/mo) or Clean & Safe partnership.",
        "Vacancy rate data unavailable — requires CoStar subscription ($500-1.5K/mo) or free CBRE/Colliers quarterly reports.",
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[downtown] DB query failed:", error);
    return NextResponse.json({
      headline: "Downtown data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      footTraffic: [],
      vacancyRate: [],
      dwellTime: [],
      source: "Placer.ai / CoStar / Portland BPS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Database connection failed. Downtown data is temporarily unavailable."],
    } as unknown as DowntownData & { dataStatus: string });
  }
}
