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
  let baselineEmissions = 10.40;
  let reductionPct = 0;

  try {
    const rows = await sql`
      SELECT status, COUNT(*)::int AS cnt
      FROM public.climate_workplan_actions
      GROUP BY status
    `;
    for (const r of rows) {
      const cnt = Number(r.cnt);
      totalActions += cnt;
      if (r.status === "achieved") achievedActions = cnt;
      else if (r.status === "ongoing") ongoingActions = cnt;
      else if (r.status === "delayed") delayedActions = cnt;
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

  const achievedPct = totalActions > 0 ? Math.round((achievedActions / totalActions) * 100) : 13;
  const delayedPct = totalActions > 0 ? Math.round((delayedActions / totalActions) * 100) : 9;

  return NextResponse.json({
    headline: dataAvailable
      ? `${achievedPct}% of climate commitments achieved — ${delayedPct}% delayed`
      : "Portland Climate Accountability Platform",
    headlineValue: dataAvailable ? totalActions : 43,
    trend: {
      direction: "up" as const,
      percentage: reductionPct || 26,
      label: "below 1990 emissions baseline",
    },
    chartData: [],
    source: "Portland Bureau of Planning & Sustainability — Climate Emergency Workplan",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights: [
      `${achievedActions || 6} of ${totalActions || 43} workplan actions achieved as of the 2025 final progress report.`,
      `${delayedActions || 4} actions are delayed — including private building decarbonization, compact development, and solar+battery resilience hubs.`,
      latestEmissions
        ? `Multnomah County emissions: ${latestEmissions.toFixed(1)}M MTCO2e (down ${reductionPct}% from 1990). Must double pace to hit 2030 goal.`
        : "Portland has reduced emissions 26% from 1990 levels but must double annual reductions to hit the 2030 target.",
      "The February 2026 City Audit found no infrastructure to track bureau climate performance. This platform is the direct response.",
    ],
    dataStatus: dataAvailable ? "live" : "seeded",
    dataAvailable,
    totalActions: totalActions || 43,
    achievedActions: achievedActions || 6,
    ongoingActions: ongoingActions || 33,
    delayedActions: delayedActions || 4,
    latestEmissionsMtco2e: latestEmissions ?? 7.7,
    reductionFromBaseline: reductionPct || 26,
    target2030Mtco2e: 5.2,
    target2050Mtco2e: 0,
  });
}
