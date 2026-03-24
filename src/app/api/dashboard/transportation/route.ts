import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  let totalRoutes = 0;
  let totalStops = 0;
  let routeTypes: { route_type: string; count: number }[] = [];
  let commuteTransitPct: number | null = null;
  let commuteDrivePct: number | null = null;
  let commuteWfhPct: number | null = null;
  let commuteYear: number | null = null;
  let ridershipData: { month: string; total_boardings: number; recovery_pct: number | null }[] = [];
  let hasRidership = false;

  // 1. TriMet route count
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_routes`;
    totalRoutes = Number(rows[0].cnt);
  } catch {
    // table may not exist
  }

  // 2. TriMet stop count
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_stops`;
    totalStops = Number(rows[0].cnt);
  } catch {
    // table may not exist
  }

  // 3. Route types breakdown
  try {
    const rows = await sql`
      SELECT route_type_name, count(*)::int AS cnt
      FROM downtown.trimet_routes
      GROUP BY route_type_name
      ORDER BY cnt DESC
    `;
    routeTypes = rows.map((r) => ({
      route_type: r.route_type_name as string,
      count: Number(r.cnt),
    }));
  } catch {
    // table may not exist
  }

  // 4. Census commute mode share (latest year)
  try {
    const rows = await sql`
      SELECT year, commute_drive_pct, commute_transit_pct, commute_wfh_pct
      FROM migration.census_demographics
      WHERE commute_transit_pct IS NOT NULL
      ORDER BY year DESC
      LIMIT 1
    `;
    if (rows.length > 0) {
      commuteTransitPct = Number(rows[0].commute_transit_pct);
      commuteDrivePct = Number(rows[0].commute_drive_pct);
      commuteWfhPct = Number(rows[0].commute_wfh_pct);
      commuteYear = Number(rows[0].year);
    }
  } catch {
    // table may not exist
  }

  // 5. TriMet ridership (if populated)
  try {
    const rows = await sql`
      SELECT
        TO_CHAR(month, 'YYYY-MM') AS month,
        total_boardings::int,
        recovery_pct
      FROM downtown.trimet_ridership
      ORDER BY month DESC
      LIMIT 24
    `;
    if (rows.length > 0) {
      hasRidership = true;
      ridershipData = rows.reverse().map((r) => ({
        month: r.month as string,
        total_boardings: Number(r.total_boardings),
        recovery_pct: r.recovery_pct != null ? Number(r.recovery_pct) : null,
      }));
    }
  } catch {
    // table may not exist
  }

  const hasTrimetData = totalRoutes > 0 || totalStops > 0;
  const dataAvailable = hasTrimetData;

  // Build headline
  let headline = "Transportation data not yet available";
  let headlineValue = 0;
  if (hasTrimetData) {
    const parts: string[] = [];
    if (totalRoutes > 0) parts.push(`${totalRoutes.toLocaleString()} TriMet routes`);
    if (totalStops > 0) parts.push(`${totalStops.toLocaleString()} stops`);
    if (commuteTransitPct != null) parts.push(`${commuteTransitPct}% transit commute share`);
    headline = parts.join(" across ");
    headlineValue = totalRoutes;
  }

  // Build chart data from route types for the summary card
  const chartData = routeTypes.map((rt) => ({
    date: rt.route_type,
    value: rt.count,
  }));

  // If we have ridership, use that as chart data instead
  if (hasRidership && ridershipData.length > 0) {
    chartData.length = 0;
    for (const r of ridershipData) {
      chartData.push({ date: r.month, value: r.total_boardings });
    }
  }

  // Build data sources
  const dataSources = [
    {
      name: "TriMet GTFS Route & Stop Data",
      status: hasTrimetData ? "live" : "needed",
      provider: "TriMet",
      action: hasTrimetData
        ? `${totalRoutes} routes and ${totalStops.toLocaleString()} stops loaded`
        : "Fetch TriMet GTFS data",
    },
    {
      name: "TriMet Ridership Data",
      status: hasRidership ? "live" : "needed",
      provider: "TriMet",
      action: hasRidership
        ? `${ridershipData.length} months of ridership data loaded`
        : "Fetch ridership data from TriMet monthly reports",
    },
    {
      name: "Census Commute Mode Share",
      status: commuteTransitPct != null ? "live" : "needed",
      provider: "U.S. Census Bureau",
      action: commuteTransitPct != null
        ? `${commuteYear} ACS commute data loaded`
        : "Obtain Census API key and fetch ACS commute mode share data",
    },
    {
      name: "PBOT Crash/Fatality Data",
      status: "needed" as const,
      provider: "Portland Bureau of Transportation",
      action: "Pull crash and fatality data from Portland Maps ArcGIS",
    },
  ];

  // Trend
  let trend: { direction: "up" | "down" | "flat"; percentage: number; label: string } = {
    direction: "flat",
    percentage: 0,
    label: "not yet tracked",
  };
  if (hasRidership && ridershipData.length >= 2) {
    const latest = ridershipData[ridershipData.length - 1];
    if (latest.recovery_pct != null) {
      trend = {
        direction: latest.recovery_pct >= 100 ? "up" : "down",
        percentage: Math.abs(Math.round(100 - latest.recovery_pct)),
        label: `${latest.recovery_pct}% of 2019 ridership`,
      };
    }
  }

  // Insights
  const insights: string[] = [];
  if (hasTrimetData) {
    insights.push(
      `${totalRoutes} TriMet routes serve ${totalStops.toLocaleString()} stops across the Portland metro area.`
    );
  }
  if (routeTypes.length > 0) {
    const breakdown = routeTypes.map((rt) => `${rt.count} ${rt.route_type}`).join(", ");
    insights.push(`Route breakdown: ${breakdown}.`);
  }
  if (commuteTransitPct != null && commuteDrivePct != null && commuteWfhPct != null) {
    insights.push(
      `Census ${commuteYear}: ${commuteDrivePct}% drive alone, ${commuteWfhPct}% work from home, ${commuteTransitPct}% use public transit.`
    );
  }
  if (hasRidership) {
    const latest = ridershipData[ridershipData.length - 1];
    insights.push(
      `Latest ridership: ${latest.total_boardings.toLocaleString()} total boardings (${latest.month}).`
    );
  }
  if (!hasRidership) {
    insights.push("TriMet monthly ridership data not yet loaded — needed to track pandemic recovery.");
  }

  return NextResponse.json({
    headline,
    headlineValue,
    dataStatus: dataAvailable ? "live" : "unavailable",
    dataAvailable,
    dataSources,
    trend,
    chartData,
    source: "TriMet / U.S. Census Bureau / PBOT",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights,
  });
}
