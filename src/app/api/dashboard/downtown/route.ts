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

    // Real data: graffiti reports from Portland BPS
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

    // Real data: TriMet transit from downtown.trimet_routes and downtown.trimet_stops
    let trimetSummary: { routes: number; stops: number; routesByType: Record<string, number> } | null = null;
    try {
      const routeCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_routes`;
      const stopCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_stops`;
      const routeTypes = await sql`
        SELECT route_type_name, count(*)::int as cnt
        FROM downtown.trimet_routes
        GROUP BY route_type_name
        ORDER BY cnt DESC
      `;
      const routesByType: Record<string, number> = {};
      for (const r of routeTypes) {
        routesByType[r.route_type_name as string] = Number(r.cnt);
      }
      trimetSummary = {
        routes: Number(routeCount[0].cnt),
        stops: Number(stopCount[0].cnt),
        routesByType,
      };
    } catch {
      // TriMet tables may not exist yet
    }

    const insights: string[] = [];
    if (totalGraffiti > 0) {
      insights.push(`${totalGraffiti.toLocaleString()} graffiti reports total from Portland BPS.`);
    }
    if (latestGraffiti > 0) {
      insights.push(`Latest month: ${latestGraffiti.toLocaleString()} graffiti reports.`);
    }
    if (trimetSummary) {
      insights.push(
        `TriMet operates ${trimetSummary.routes} routes across ${trimetSummary.stops.toLocaleString()} stops: ${Object.entries(trimetSummary.routesByType).map(([t, c]) => `${c} ${t}`).join(", ")}.`
      );
    }
    insights.push("Foot traffic data unavailable — requires Placer.ai subscription ($2-5K/mo) or Clean & Safe partnership.");
    insights.push("Vacancy rate data unavailable — requires CoStar subscription ($500-1.5K/mo) or free CBRE/Colliers quarterly reports.");

    const headlineValue = trimetSummary
      ? trimetSummary.routes
      : totalGraffiti;

    const result: DowntownData & { dataStatus: string } = {
      headline: trimetSummary
        ? `${trimetSummary.routes} TriMet routes, ${trimetSummary.stops.toLocaleString()} stops — real GTFS transit data`
        : latestGraffiti > 0
          ? `${totalGraffiti.toLocaleString()} graffiti reports tracked — disorder proxy metric`
          : "Downtown vitality data collection in progress",
      headlineValue,
      dataStatus: "partial",
      trend: { direction: "flat" as const, percentage: 0, label: "no trend comparison available" },
      chartData: graffitiChartData,
      footTraffic: [], // Needs Placer.ai subscription ($2-5K/mo)
      vacancyRate: [], // Needs CoStar subscription ($500-1.5K/mo)
      dwellTime: [], // Needs Placer.ai subscription
      source: "TriMet GTFS (real) / Portland BPS Graffiti (real) / Placer.ai (unavailable) / CoStar (unavailable)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
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
