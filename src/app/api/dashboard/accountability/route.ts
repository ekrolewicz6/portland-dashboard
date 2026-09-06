import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "accountability";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(withFreshness(cached));
    // Count ballot measures and sum annual revenue
    const measureRows = await sql`
      SELECT
        count(*)::int AS measure_count,
        COALESCE(sum(annual_revenue_estimate), 0)::bigint AS total_revenue
      FROM accountability.ballot_measures
    `;

    const measureCount = Number(measureRows[0].measure_count);
    const totalRevenue = Number(measureRows[0].total_revenue);

    // Count elected officials
    const officialRows = await sql`
      SELECT count(*)::int AS official_count
      FROM accountability.elected_officials
    `;

    const officialCount = Number(officialRows[0].official_count);

    // Count promises by verification status
    const promiseRows = await sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE verification_status = 'verified')::int AS verified,
        count(*) FILTER (WHERE verification_status = 'partially_verified')::int AS partially_verified,
        count(*) FILTER (WHERE verification_status = 'in_progress')::int AS in_progress,
        count(*) FILTER (WHERE verification_status = 'unverifiable')::int AS unverifiable,
        count(*) FILTER (WHERE verification_status = 'contradicted')::int AS contradicted
      FROM accountability.promises
    `;

    const promiseTotal = Number(promiseRows[0].total);
    const promiseVerified = Number(promiseRows[0].verified);
    const promisePartial = Number(promiseRows[0].partially_verified);
    const promiseInProgress = Number(promiseRows[0].in_progress);
    const promiseContradicted = Number(promiseRows[0].contradicted);
    const promiseUnverifiable = Number(promiseRows[0].unverifiable);

    // Format revenue as $XXM/year
    const revenueLabel =
      totalRevenue >= 1_000_000_000
        ? `$${(totalRevenue / 1_000_000_000).toFixed(1)}B`
        : totalRevenue >= 1_000_000
          ? `$${Math.round(totalRevenue / 1_000_000)}M`
          : `$${totalRevenue.toLocaleString()}`;

    const promisePhrase = promiseTotal > 0
      ? ` — ${promiseTotal} promises tracked (${promiseVerified} verified)`
      : "";

    const headline =
      `${measureCount} ballot measures generating ${revenueLabel}/year — ${officialCount} elected officials serving${promisePhrase}`;

    const responseData = {
      headline,
      headlineValue: measureCount,
      dataStatus: "live",
      dataAvailable: true,
      trend: {
        direction: "flat" as const,
        percentage: 0,
        label: `${officialCount} officials serving`,
      },
      chartData: [],
      source: "Multnomah County Elections · Portland.gov",
      lastUpdated: new Date().toISOString().slice(0, 10),
      promises: {
        total: promiseTotal,
        verified: promiseVerified,
        partiallyVerified: promisePartial,
        inProgress: promiseInProgress,
        unverifiable: promiseUnverifiable,
        contradicted: promiseContradicted,
      },
      insights: [
        `${measureCount} voter-approved measures generating an estimated ${revenueLabel} annually.`,
        `${officialCount} elected officials currently serving.`,
        ...(promiseTotal > 0
          ? [
              `${promiseTotal} mayoral promises tracked: ${promiseVerified} verified, ${promiseInProgress} in progress, ${promiseContradicted} contradicted.`,
            ]
          : []),
        "Campaign finance data available from ORESTAR database (not yet integrated).",
      ],
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (error) {
    console.error("[accountability] DB query failed:", error);
    return NextResponse.json(withFreshness({
      headline: "Accountability data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      source: "Multnomah County Elections · Portland.gov",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection failed. Accountability data is temporarily unavailable.",
      ],
    }));
  }
}
