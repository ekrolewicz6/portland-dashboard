import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Real data: graffiti from safety.graffiti_monthly
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

    // Real data: commercial vacancy from downtown.vacancy_real
    // Sourced from CBRE, Colliers, JLL, Kidder Mathews quarterly reports
    let vacancyTrend: {
      quarter: string;
      source: string;
      office_vacancy_pct: number | null;
      retail_vacancy_pct: number | null;
      notes: string | null;
    }[] | null = null;

    try {
      const vacancyRows = await sql`
        SELECT
          TO_CHAR(quarter, 'YYYY-Q"Q"') AS quarter,
          source,
          office_vacancy_pct::float,
          retail_vacancy_pct::float,
          notes
        FROM downtown.vacancy_real
        WHERE source NOT LIKE 'FRED_%'
        ORDER BY quarter
      `;

      if (vacancyRows.length > 0) {
        vacancyTrend = vacancyRows.map((r) => ({
          quarter: r.quarter as string,
          source: r.source as string,
          office_vacancy_pct: r.office_vacancy_pct != null ? Number(r.office_vacancy_pct) : null,
          retail_vacancy_pct: r.retail_vacancy_pct != null ? Number(r.retail_vacancy_pct) : null,
          notes: r.notes as string | null,
        }));
      }
    } catch {
      // downtown.vacancy_real may not exist yet
    }

    // US national benchmark from FRED (for comparison)
    let usNationalBenchmark: { quarter: string; rental_vacancy_pct: number }[] | null = null;

    try {
      const fredRows = await sql`
        SELECT
          TO_CHAR(quarter, 'YYYY-Q"Q"') AS quarter,
          retail_vacancy_pct::float AS rental_vacancy_pct
        FROM downtown.vacancy_real
        WHERE source = 'FRED_RRVRUSQ156N'
          AND retail_vacancy_pct IS NOT NULL
        ORDER BY quarter
      `;

      if (fredRows.length > 0) {
        usNationalBenchmark = fredRows.map((r) => ({
          quarter: r.quarter as string,
          rental_vacancy_pct: Number(r.rental_vacancy_pct),
        }));
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({
      // REAL data
      graffitiTrend,
      trimetData,
      vacancyTrend,
      usNationalBenchmark,
      // UNAVAILABLE — needs subscriptions
      footTrafficTrend: null,
      weekdayVsWeekend: null,
      recoveryMilestones: null,
      dataStatus: vacancyTrend ? "good" : "partial",
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
          name: "Commercial Vacancy Rate",
          status: vacancyTrend ? "live" : "needs_data",
          provider: "CBRE, Colliers, JLL, Kidder Mathews quarterly reports",
          action: vacancyTrend
            ? `${vacancyTrend.length} quarterly data points from published CRE reports`
            : "Run: npx tsx scripts/fetch-vacancy-real.ts",
        },
        {
          name: "US National Benchmark (FRED)",
          status: usNationalBenchmark ? "live" : "needs_data",
          provider: "FRED / Census Bureau",
        },
        {
          name: "Foot Traffic",
          status: "needs_subscription",
          provider: "Placer.ai",
          action: "$2K-$5K/mo subscription or Clean & Safe partnership",
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
