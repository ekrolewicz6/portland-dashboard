/**
 * Climate Accountability Platform — Summary Route
 * Returns headline metrics for the hero section of /dashboard/climate
 */

import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  let totalActions = 0;
  let achievedActions = 0;
  let ongoingActions = 0;
  let delayedActions = 0;
  let latestEmissions: number | null = null;
  const baselineEmissions = 10.40;
  let reductionPct: number | null = null;
  let workplanUpdatedAt: string | null = null;

  try {
    const rows = await sql`
      SELECT status, COUNT(*)::int AS cnt, MAX(updated_at) AS latest
      FROM public.climate_workplan_actions
      GROUP BY status
    `;
    for (const r of rows) {
      const cnt = Number(r.cnt);
      totalActions += cnt;
      if (r.status === "achieved") achievedActions = cnt;
      else if (r.status === "ongoing") ongoingActions = cnt;
      else if (r.status === "delayed") delayedActions = cnt;

      // Freshness is the newest row in the table, not the time of the request.
      const latest = r.latest ? new Date(String(r.latest)) : null;
      if (latest && !Number.isNaN(latest.getTime())) {
        const iso = latest.toISOString().slice(0, 10);
        if (workplanUpdatedAt === null || iso > workplanUpdatedAt) workplanUpdatedAt = iso;
      }
    }
  } catch {
    // table not yet available
  }

  try {
    const rows = await sql`
      SELECT total_mtco2e
      FROM public.climate_emissions_trajectory
      WHERE is_target = false
      ORDER BY year DESC
      LIMIT 1
    `;
    if (rows.length > 0 && rows[0].total_mtco2e != null) {
      latestEmissions = Number(rows[0].total_mtco2e);
      reductionPct = Math.round(((baselineEmissions - latestEmissions) / baselineEmissions) * 100);
    }
  } catch {
    // table not yet available
  }

  const dataAvailable = totalActions > 0;

  // With no workplan rows loaded there is nothing to summarise. Every count
  // below used to fall back to a remembered figure (43 actions, 6 achieved,
  // 26% below baseline), which rendered identically to a measured one.
  if (!dataAvailable) {
    return NextResponse.json({
      headline: "Climate commitment tracking data is not loaded",
      headlineValue: null,
      trend: null,
      chartData: [],
      source: "Portland Bureau of Planning & Sustainability · Climate Emergency Workplan",
      lastUpdated: null,
      insights: [
        "No Climate Emergency Workplan actions are currently loaded, so completion rates cannot be reported.",
        "Run the climate sync to populate climate_workplan_actions and climate_emissions_trajectory.",
      ],
      dataStatus: "unavailable",
      dataAvailable: false,
    });
  }

  const achievedPct = Math.round((achievedActions / totalActions) * 100);
  const delayedPct = Math.round((delayedActions / totalActions) * 100);

  return NextResponse.json({
    headline: `${achievedPct}% of climate commitments achieved — ${delayedPct}% delayed`,
    headlineValue: totalActions,
    trend:
      reductionPct !== null
        ? {
            direction: "up" as const,
            percentage: reductionPct,
            label: "below 1990 emissions baseline",
          }
        : null,
    chartData: [],
    source: "Portland Bureau of Planning & Sustainability · Climate Emergency Workplan",
    lastUpdated: workplanUpdatedAt,
    insights: [
      `${achievedActions} of ${totalActions} workplan actions achieved as of the latest progress report.`,
      `${delayedActions} actions are delayed — including private building decarbonization, compact development, and solar+battery resilience hubs.`,
      latestEmissions !== null && reductionPct !== null
        ? `Multnomah County emissions: ${latestEmissions.toFixed(1)}M MTCO2e (down ${reductionPct}% from 1990). Must double pace to hit 2030 goal.`
        : "Multnomah County emissions inventory rows are not loaded, so progress against the 1990 baseline cannot be reported.",
      "The February 2026 City Audit found no infrastructure to track bureau climate performance. This platform is the direct response.",
    ],
    dataStatus: "live",
    dataAvailable: true,
    totalActions,
    achievedActions,
    ongoingActions,
    delayedActions,
    latestEmissionsMtco2e: latestEmissions,
    reductionFromBaseline: reductionPct,
    target2030Mtco2e: 5.2,
    target2050Mtco2e: 0,
  });
}
