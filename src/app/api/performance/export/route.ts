import { NextRequest, NextResponse } from "next/server";
import { getPerformanceSnapshot } from "@/lib/performance/service";
import { snapshotToCsv } from "@/lib/performance/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rawMeasureId = request.nextUrl.searchParams.get("measureId") ?? undefined;
  // Only allow safe characters in the id — it ends up in a response header.
  const measureId =
    rawMeasureId && /^[\w.-]+$/.test(rawMeasureId) ? rawMeasureId : undefined;

  try {
    // Cache only. A live fallback here walks every ClearImpact scorecard,
    // container and measure with sequential requests: an anonymous visitor
    // arriving while the cache is cold would make this site hammer a third
    // party from a request that then times out anyway. Refreshing the cache
    // is the sync cron's job.
    const snapshot = await getPerformanceSnapshot({ allowLiveFallback: false });
    const csv = snapshotToCsv(snapshot, measureId);
    const filename = measureId
      ? `performance-portland-${measureId}.csv`
      : "performance-portland-scorecards.csv";

    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[performance/export]", error);
    const empty =
      error instanceof Error && error.message.includes("cache is empty");
    return NextResponse.json(
      {
        ok: false,
        error: empty
          ? "Performance data has not been loaded yet. Try again after the next sync."
          : "Performance CSV export failed",
      },
      { status: empty ? 503 : 500 },
    );
  }
}
