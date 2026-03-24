import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    // Format revenue as $XXM/year
    const revenueLabel =
      totalRevenue >= 1_000_000_000
        ? `$${(totalRevenue / 1_000_000_000).toFixed(1)}B`
        : totalRevenue >= 1_000_000
          ? `$${Math.round(totalRevenue / 1_000_000)}M`
          : `$${totalRevenue.toLocaleString()}`;

    const headline =
      `${measureCount} ballot measures generating ${revenueLabel}/year — ${officialCount} elected officials tracked`;

    return NextResponse.json({
      headline,
      headlineValue: measureCount,
      dataStatus: "live",
      dataAvailable: true,
      trend: {
        direction: "flat" as const,
        percentage: 0,
        label: `${officialCount} officials tracked`,
      },
      chartData: [],
      source: "Multnomah County Elections / Portland.gov",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${measureCount} voter-approved measures generating an estimated ${revenueLabel} annually.`,
        `${officialCount} elected officials currently tracked.`,
        "Campaign finance data available from ORESTAR database (not yet integrated).",
      ],
    });
  } catch (error) {
    console.error("[accountability] DB query failed:", error);
    return NextResponse.json({
      headline: "Accountability data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      source: "Multnomah County Elections / Portland.gov",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection failed. Accountability data is temporarily unavailable.",
      ],
    });
  }
}
