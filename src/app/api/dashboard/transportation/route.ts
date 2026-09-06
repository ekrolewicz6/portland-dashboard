import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "transportation";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

export async function GET() {
  // Check cache first
  const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
  if (cached) return NextResponse.json(withFreshness(cached));

  let totalRoutes = 0;
  let totalStops = 0;
  let routeTypes: { route_type: string; count: number }[] = [];
  let latestRidershipYear = 0;
  let latestRidershipTotal = 0;
  let prePandemicTotal = 0;
  let recoveryPct = 0;
  let hasRidership = false;
  let latestFatalities = 0;
  let latestFatalityYear = 0;
  let hasCrashes = false;
  let commuteTransitPct: number | null = null;
  let commuteDrivePct: number | null = null;
  let commuteWfhPct: number | null = null;
  let commuteYear: number | null = null;

  // 1. TriMet route count
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_routes`;
    totalRoutes = Number(rows[0].cnt);
  } catch { /* table may not exist */ }

  // 2. TriMet stop count
  try {
    const rows = await sql`SELECT count(*)::int AS cnt FROM downtown.trimet_stops`;
    totalStops = Number(rows[0].cnt);
  } catch { /* table may not exist */ }

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
  } catch { /* table may not exist */ }

  // 4. Latest ridership from transportation.ridership
  try {
    const rows = await sql`
      SELECT
        fiscal_year,
        SUM(boardings)::bigint AS total
      FROM transportation.ridership
      GROUP BY fiscal_year
      ORDER BY fiscal_year DESC
      LIMIT 2
    `;
    if (rows.length > 0) {
      hasRidership = true;
      latestRidershipYear = Number(rows[0].fiscal_year);
      latestRidershipTotal = Number(rows[0].total);
    }
    // Get FY2019 as pre-pandemic baseline
    const baseline = await sql`
      SELECT SUM(boardings)::bigint AS total
      FROM transportation.ridership
      WHERE fiscal_year = 2019
    `;
    if (baseline.length > 0 && baseline[0].total) {
      prePandemicTotal = Number(baseline[0].total);
      recoveryPct = Math.round((latestRidershipTotal / prePandemicTotal) * 1000) / 10;
    }
  } catch { /* table may not exist */ }

  // 5. Latest crash/fatality data
  try {
    // Get latest full year (not partial year)
    const rows = await sql`
      SELECT year, fatalities
      FROM transportation.crashes
      WHERE source NOT LIKE '%partial%'
      ORDER BY year DESC
      LIMIT 1
    `;
    if (rows.length > 0) {
      hasCrashes = true;
      latestFatalityYear = Number(rows[0].year);
      latestFatalities = Number(rows[0].fatalities);
    }
  } catch { /* table may not exist */ }

  // 6. Latest commute data from transportation.commute_mode
  try {
    const rows = await sql`
      SELECT year,
        MAX(CASE WHEN mode = 'Drove Alone' THEN pct END)::numeric AS drive_pct,
        MAX(CASE WHEN mode = 'Public Transit' THEN pct END)::numeric AS transit_pct,
        MAX(CASE WHEN mode = 'Work From Home' THEN pct END)::numeric AS wfh_pct
      FROM transportation.commute_mode
      GROUP BY year
      ORDER BY year DESC
      LIMIT 1
    `;
    if (rows.length > 0) {
      commuteYear = Number(rows[0].year);
      commuteDrivePct = Number(rows[0].drive_pct);
      commuteTransitPct = Number(rows[0].transit_pct);
      commuteWfhPct = Number(rows[0].wfh_pct);
    }
  } catch { /* table may not exist */ }

  const hasTrimetData = totalRoutes > 0 || totalStops > 0;
  const dataAvailable = hasTrimetData || hasRidership || hasCrashes;

  // Build headline
  let headline = "Transportation data not yet available";
  let headlineValue = 0;
  if (hasRidership) {
    headline = `${(latestRidershipTotal / 1_000_000).toFixed(1)}M transit boardings (FY${latestRidershipYear})`;
    headlineValue = latestRidershipTotal;
    if (recoveryPct > 0) {
      headline += ` — ${recoveryPct}% of pre-pandemic levels`;
    }
  } else if (hasTrimetData) {
    headline = `${totalRoutes} TriMet routes serving ${totalStops.toLocaleString()} stops`;
    headlineValue = totalRoutes;
  }

  // Chart data — ridership trend for summary card
  const chartData: { date: string; value: number }[] = [];
  try {
    const rows = await sql`
      SELECT fiscal_year, SUM(boardings)::bigint AS total
      FROM transportation.ridership
      GROUP BY fiscal_year
      ORDER BY fiscal_year ASC
    `;
    for (const r of rows) {
      chartData.push({
        date: `FY${r.fiscal_year}`,
        value: Number(r.total),
      });
    }
  } catch { /* table may not exist */ }

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
      name: "TriMet & Streetcar Ridership",
      status: hasRidership ? "live" : "needed",
      provider: "TriMet / Portland Streetcar Inc.",
      action: hasRidership
        ? `FY2006-FY${latestRidershipYear} ridership loaded`
        : "Fetch ridership data from TriMet annual reports",
    },
    {
      name: "Traffic Crash & Fatality Data",
      status: hasCrashes ? "live" : "needed",
      provider: "PBOT / City Auditor",
      action: hasCrashes
        ? `${latestFatalityYear}: ${latestFatalities} fatalities (Vision Zero tracking)`
        : "Pull crash data from PBOT Vision Zero reports",
    },
    {
      name: "Census Commute Mode Share",
      status: commuteTransitPct != null ? "live" : "needed",
      provider: "U.S. Census Bureau",
      action: commuteTransitPct != null
        ? `${commuteYear} ACS: ${commuteTransitPct}% transit, ${commuteWfhPct}% WFH`
        : "Fetch Census ACS commute mode share data",
    },
  ];

  // Trend
  let trend: { direction: "up" | "down" | "flat"; percentage: number; label: string } = {
    direction: "flat",
    percentage: 0,
    label: "not yet tracked",
  };
  if (hasRidership && recoveryPct > 0) {
    trend = {
      direction: recoveryPct >= 100 ? "up" : "down",
      percentage: Math.abs(Math.round(100 - recoveryPct)),
      label: `${recoveryPct}% of FY2019 ridership`,
    };
  }

  // Insights
  const insights: string[] = [];
  if (hasRidership) {
    insights.push(
      `FY${latestRidershipYear} total transit boardings: ${latestRidershipTotal.toLocaleString()} ` +
        `(${recoveryPct}% of pre-pandemic FY2019 levels).`
    );
  }
  if (hasTrimetData) {
    const breakdown = routeTypes.map((rt) => `${rt.count} ${rt.route_type}`).join(", ");
    insights.push(`TriMet operates ${totalRoutes} routes (${breakdown}) across ${totalStops.toLocaleString()} stops.`);
  }
  if (hasCrashes) {
    insights.push(
      `${latestFatalityYear} traffic fatalities: ${latestFatalities}. Portland adopted Vision Zero in 2015 targeting zero deaths by 2025.`
    );
  }
  if (commuteTransitPct != null && commuteDrivePct != null && commuteWfhPct != null) {
    insights.push(
      `Census ${commuteYear}: ${commuteDrivePct}% drive alone, ${commuteWfhPct}% work from home, ${commuteTransitPct}% use transit.`
    );
  }

  const responseData = {
    headline,
    headlineValue,
    dataStatus: dataAvailable ? "live" : "unavailable",
    dataAvailable,
    dataSources,
    trend,
    chartData,
    source: "TriMet · PBOT · U.S. Census Bureau",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights,
  };

  if (dataAvailable) {
    await setCachedData(CACHE_KEY, responseData);
  }
  return NextResponse.json(withFreshness(responseData));
}
