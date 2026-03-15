import { NextResponse } from "next/server";
import { downtownData } from "@/lib/mock-data";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { DowntownData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "downtown";

export async function GET(): Promise<NextResponse<DowntownData>> {
  try {
    // Check cache first
    const cached = await getCachedData<DowntownData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Start with mock data as baseline (foot traffic, vacancy rate, dwell time are all mock)
    const result: DowntownData = { ...downtownData };

    // Query latest graffiti count from DB
    const graffitiRows = await sql`
      SELECT count
      FROM safety.graffiti_monthly
      ORDER BY month DESC
      LIMIT 1
    `;

    // Query monthly graffiti trend
    const monthlyGraffiti = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') as date, count
      FROM safety.graffiti_monthly
      ORDER BY month
    `;

    if (graffitiRows.length > 0) {
      const latestGraffiti = Number(graffitiRows[0].count);
      const totalGraffiti =
        monthlyGraffiti.length > 0
          ? monthlyGraffiti.reduce((s, r) => s + Number(r.count), 0)
          : latestGraffiti;

      result.source =
        "Placer.ai (mock) / Graffiti Reports (local DB) / CoStar (mock)";
      result.lastUpdated = new Date().toISOString().slice(0, 10);
      result.insights = [
        ...downtownData.insights.slice(0, 2),
        `${totalGraffiti.toLocaleString()} graffiti reports total across ${monthlyGraffiti.length} months (visible disorder metric).`,
        `Latest month: ${latestGraffiti} graffiti reports. Trend: ${monthlyGraffiti
          .slice(-3)
          .map((r) => `${r.date}: ${r.count}`)
          .join(", ")}.`,
      ];
    } else {
      console.warn(
        "[downtown] No graffiti data in DB, using full mock data",
      );
    }

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[downtown] DB query failed, returning mock data:", error);
    return NextResponse.json(downtownData);
  }
}
