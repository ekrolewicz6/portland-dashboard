import { NextRequest, NextResponse } from "next/server";

/**
 * Is this a call from our own tooling rather than a browser?
 *
 * PERFORMANCE_API_TOKEN is its own credential. CRON_SECRET remains accepted
 * so an environment that has not set the dedicated token yet keeps working,
 * but it is a fallback, not the intended configuration: a secret that
 * authorises both the scheduler and a JSON API has twice the blast radius of
 * one that authorises either.
 */
export function isInternalPerformanceRequest(request: NextRequest): boolean {
  const token = process.env.PERFORMANCE_API_TOKEN?.trim() || process.env.CRON_SECRET?.trim();

  if (!token) return false;

  return (
    request.headers.get("authorization") === `Bearer ${token}` ||
    request.headers.get("x-performance-api-token") === token
  );
}

export function internalPerformanceOnlyResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Performance JSON endpoints are internal only.",
    },
    { status: 404 },
  );
}
