import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only real data: graffiti from safety.graffiti_monthly
    // NOT querying public.downtown_foot_traffic or public.downtown_vacancy (FAKE data)

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

    // TriMet transit data from GTFS feed
    let trimetData: {
      totalRoutes: number;
      totalStops: number;
      routesByType: { type: string; count: number }[];
      sampleRoutes: { route_id: string; route_name: string; route_type_name: string; route_color: string }[];
    } | null = null;

    try {
      const routeCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_routes`;
      const stopCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_stops`;
      const routeTypes = await sql`
        SELECT route_type_name as type, count(*)::int as count
        FROM downtown.trimet_routes
        GROUP BY route_type_name
        ORDER BY count DESC
      `;
      const sampleRoutes = await sql`
        SELECT route_id, route_name, route_type_name, route_color
        FROM downtown.trimet_routes
        WHERE route_type_name != 'Bus'
        ORDER BY route_type_name, route_name
      `;

      if (Number(routeCount[0].cnt) > 0) {
        trimetData = {
          totalRoutes: Number(routeCount[0].cnt),
          totalStops: Number(stopCount[0].cnt),
          routesByType: routeTypes.map((r) => ({
            type: r.type as string,
            count: Number(r.count),
          })),
          sampleRoutes: sampleRoutes.map((r) => ({
            route_id: r.route_id as string,
            route_name: r.route_name as string,
            route_type_name: r.route_type_name as string,
            route_color: r.route_color as string,
          })),
        };
      }
    } catch {
      // TriMet tables may not exist
    }

    return NextResponse.json({
      // REAL data
      graffitiTrend,
      trimetData,
      // UNAVAILABLE — needs subscriptions
      footTrafficTrend: null,
      vacancyTrend: null,
      weekdayVsWeekend: null,
      recoveryMilestones: null,
      dataStatus: "partial",
      dataSources: [
        {
          name: "Graffiti Reports",
          status: "live",
          provider: "Portland BPS via ArcGIS",
        },
        {
          name: "TriMet Transit (GTFS)",
          status: "live",
          provider: "TriMet developer.trimet.org",
        },
        {
          name: "Foot Traffic",
          status: "needs_subscription",
          provider: "Placer.ai",
          action: "$2K-$5K/mo subscription or Clean & Safe partnership",
        },
        {
          name: "Commercial Vacancy Rate",
          status: "needs_subscription",
          provider: "CoStar Group",
          action: "$500-$1.5K/mo subscription or free CBRE/Colliers quarterly reports",
        },
      ],
    });
  } catch (error) {
    console.error("[downtown/detail] DB query failed:", error);
    return NextResponse.json({
      graffitiTrend: null,
      footTrafficTrend: null,
      vacancyTrend: null,
      weekdayVsWeekend: null,
      recoveryMilestones: null,
      dataStatus: "unavailable",
    });
  }
}
