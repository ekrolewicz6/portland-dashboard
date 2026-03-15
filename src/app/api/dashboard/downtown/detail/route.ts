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

    return NextResponse.json({
      // REAL data
      graffitiTrend,
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
