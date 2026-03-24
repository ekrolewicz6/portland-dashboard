import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface RouteByType {
  type: string;
  count: number;
}

interface CommuteModeTrend {
  year: number;
  drivePct: number;
  transitPct: number;
  wfhPct: number;
}

interface RidershipMonth {
  month: string;
  routeName: string;
  routeType: string;
  totalBoardings: number;
  baseline2019: number | null;
  recoveryPct: number | null;
}

interface SampleRoute {
  routeName: string;
  routeType: string;
  routeColor: string;
}

interface TransportationDetailResponse {
  dataStatus: string;
  dataAvailable: boolean;
  routesByType: RouteByType[];
  commuteModeTrend: CommuteModeTrend[];
  ridershipTrend: RidershipMonth[];
  sampleRoutes: SampleRoute[];
  totalRoutes: number;
  totalStops: number;
}

export async function GET(): Promise<NextResponse<TransportationDetailResponse>> {
  let routesByType: RouteByType[] = [];
  let commuteModeTrend: CommuteModeTrend[] = [];
  let ridershipTrend: RidershipMonth[] = [];
  let sampleRoutes: SampleRoute[] = [];
  let totalRoutes = 0;
  let totalStops = 0;

  // 1. Routes by type
  try {
    const rows = await sql`
      SELECT route_type_name, count(*)::int AS cnt
      FROM downtown.trimet_routes
      GROUP BY route_type_name
      ORDER BY cnt DESC
    `;
    routesByType = rows.map((r) => ({
      type: r.route_type_name as string,
      count: Number(r.cnt),
    }));
  } catch {
    // table may not exist
  }

  // 2. Total routes
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_routes`;
    totalRoutes = Number(rows[0].cnt);
  } catch {
    // table may not exist
  }

  // 3. Total stops
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_stops`;
    totalStops = Number(rows[0].cnt);
  } catch {
    // table may not exist
  }

  // 4. Commute mode share trend over years
  try {
    const rows = await sql`
      SELECT year, commute_drive_pct, commute_transit_pct, commute_wfh_pct
      FROM migration.census_demographics
      WHERE commute_transit_pct IS NOT NULL
      ORDER BY year ASC
    `;
    commuteModeTrend = rows.map((r) => ({
      year: Number(r.year),
      drivePct: Number(r.commute_drive_pct),
      transitPct: Number(r.commute_transit_pct),
      wfhPct: Number(r.commute_wfh_pct),
    }));
  } catch {
    // table may not exist
  }

  // 5. Ridership trend (if available)
  try {
    const rows = await sql`
      SELECT
        TO_CHAR(month, 'YYYY-MM') AS month,
        route_name,
        route_type,
        total_boardings::int,
        baseline_2019::int,
        recovery_pct
      FROM downtown.trimet_ridership
      ORDER BY month ASC
      LIMIT 500
    `;
    if (rows.length > 0) {
      ridershipTrend = rows.map((r) => ({
        month: r.month as string,
        routeName: r.route_name as string,
        routeType: r.route_type as string,
        totalBoardings: Number(r.total_boardings),
        baseline2019: r.baseline_2019 != null ? Number(r.baseline_2019) : null,
        recoveryPct: r.recovery_pct != null ? Number(r.recovery_pct) : null,
      }));
    }
  } catch {
    // table may not exist or empty
  }

  // 6. Sample routes (non-bus: MAX, Streetcar, WES)
  try {
    const rows = await sql`
      SELECT route_name, route_type_name, route_color
      FROM downtown.trimet_routes
      WHERE route_type_name != 'Bus'
      ORDER BY route_type_name, route_name
    `;
    sampleRoutes = rows.map((r) => ({
      routeName: r.route_name as string,
      routeType: r.route_type_name as string,
      routeColor: r.route_color as string,
    }));
  } catch {
    // table may not exist
  }

  const dataAvailable = totalRoutes > 0 || totalStops > 0;

  return NextResponse.json({
    dataStatus: dataAvailable ? "live" : "unavailable",
    dataAvailable,
    routesByType,
    commuteModeTrend,
    ridershipTrend,
    sampleRoutes,
    totalRoutes,
    totalStops,
  });
}
