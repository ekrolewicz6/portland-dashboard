import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 10-year net migration trend from water meter data
    const waterRows = await sql`
      SELECT month, activations, deactivations, net
      FROM public.migration_water_monthly
      ORDER BY month ASC
    `;

    // Census population trend
    const censusRows = await sql`
      SELECT year, population, change_from_prior
      FROM public.migration_census
      ORDER BY year ASC
    `;

    const waterTrend = waterRows.map((r) => ({
      month: String(r.month).slice(0, 7),
      activations: Number(r.activations),
      deactivations: Number(r.deactivations),
      net: Number(r.net),
    }));

    // Recent 12 months
    const recentMonths = waterTrend.slice(-12);

    const populationTrend = censusRows.map((r) => ({
      year: Number(r.year),
      population: Number(r.population),
      change: Number(r.change_from_prior),
    }));

    return NextResponse.json({
      waterTrend,
      populationTrend,
      recentMonths,
    });
  } catch (error) {
    console.error("[migration/detail] DB query failed:", error);
    return NextResponse.json(
      { error: "Failed to load migration detail data" },
      { status: 500 },
    );
  }
}
