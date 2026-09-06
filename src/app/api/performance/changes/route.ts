import { NextRequest, NextResponse } from "next/server";
import { getPerformanceSnapshot } from "@/lib/performance/service";
import { internalPerformanceOnlyResponse, isInternalPerformanceRequest } from "../_internal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isInternalPerformanceRequest(request)) return internalPerformanceOnlyResponse();

  try {
    // Cache only. A live fallback here walks every ClearImpact scorecard,
    // container and measure with sequential requests: an anonymous visitor
    // arriving while the cache is cold would make this site hammer a third
    // party from a request that then times out anyway. Refreshing the cache
    // is the sync cron's job.
    const snapshot = await getPerformanceSnapshot({ allowLiveFallback: false });
    return NextResponse.json({
      ok: true,
      fetchedAt: snapshot.fetchedAt,
      changes: snapshot.changes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        // A fixed message. Internal error text names tables, upstream
        // hosts and query fragments, none of which the caller can act on.
        error: "Performance change log failed",
      },
      { status: 500 },
    );
  }
}
