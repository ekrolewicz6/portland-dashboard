import { NextRequest, NextResponse } from "next/server";
import sql, { createDedicatedClient } from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
// Refresh can take a few minutes against 5.9M rows. Vercel Pro allows up to 300s.
export const maxDuration = 300;

const MATVIEWS = [
  "mv_permit_phase_summary",
  "mv_permit_journey_by_type",
  "mv_permit_journey_trend",
  "mv_permit_correction_stats",
  "mv_permit_bottleneck_trend",
  "mv_permit_slowest_examples",
];

// Refreshes housing materialized views. Each has a unique index, so
// CONCURRENTLY avoids locking reads while the refresh runs.
//
// Triggered by Vercel cron (see vercel.json) on a daily schedule.
// Permit data updates infrequently — overnight refresh is enough.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: { matview: string; ms: number; ok: boolean; error?: string }[] = [];

  // A dedicated client, not the shared request client. The shared one is
  // recycled on age, and a refresh here runs far longer than that window: a
  // request arriving mid-refresh would retire the client this statement is
  // running on. This client lives and dies with the job.
  const jobSql = createDedicatedClient();
  try {
    for (const mv of MATVIEWS) {
      const t0 = Date.now();
      try {
        await jobSql.unsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY housing.${mv}`);
        results.push({ matview: mv, ms: Date.now() - t0, ok: true });
        console.log(`[refresh-matviews] ${mv}: ${Date.now() - t0}ms ✓`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ matview: mv, ms: Date.now() - t0, ok: false, error: msg });
        console.error(`[refresh-matviews] ${mv}: FAILED ${msg}`);
      }
    }
  } finally {
    await jobSql.end().catch(() => {});
  }

  // Invalidate the dashboard cache for the affected routes so they
  // pick up the fresh matview data on the next request.
  try {
    await sql`
      DELETE FROM public.dashboard_cache
      WHERE question IN ('housing_journey', 'housing_bottleneck', 'housing_detail')
    `;
  } catch {
    // best-effort
  }

  const totalMs = results.reduce((s, r) => s + r.ms, 0);
  const allOk = results.every((r) => r.ok);

  // A failed refresh is returned as a 5xx so the scheduler records the run as
  // failed. Answering 200 with ok:false means a cron that has been silently
  // broken for weeks still looks healthy in the platform's dashboard.
  return NextResponse.json(
    {
      ok: allOk,
      totalMs,
      refreshed: results,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 500 },
  );
}
