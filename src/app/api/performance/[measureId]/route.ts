import { NextRequest, NextResponse } from "next/server";
import { getPerformanceMetric } from "@/lib/performance/service";
import { internalPerformanceOnlyResponse, isInternalPerformanceRequest } from "../_internal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ measureId: string }> },
) {
  if (!isInternalPerformanceRequest(request)) return internalPerformanceOnlyResponse();

  const { measureId } = await context.params;

  try {
    const metric = await getPerformanceMetric(measureId);
    if (!metric) {
      return NextResponse.json({ ok: false, error: "Metric not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      metric,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        // A fixed message. Internal error text names tables, upstream
        // hosts and query fragments, none of which the caller can act on.
        error: "Performance metric failed",
      },
      { status: 500 },
    );
  }
}
