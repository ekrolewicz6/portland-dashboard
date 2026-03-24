import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // --- Parks ---
    const parkRows = await sql`
      SELECT
        count(*)::int AS total_parks,
        COALESCE(round(sum(acres)::numeric, 0), 0)::int AS total_acres,
        COALESCE(round(avg(acres)::numeric, 1), 0) AS avg_acres
      FROM quality.parks
    `;
    const largestParkRow = await sql`
      SELECT name, acres
      FROM quality.parks
      ORDER BY acres DESC NULLS LAST
      LIMIT 1
    `;

    const parkStats = {
      totalParks: Number(parkRows[0].total_parks),
      totalAcres: Number(parkRows[0].total_acres),
      avgAcres: Number(parkRows[0].avg_acres),
      largestPark: largestParkRow.length > 0
        ? { name: largestParkRow[0].name as string, acres: Number(largestParkRow[0].acres) }
        : null,
    };

    // --- Pavement ---
    const pavementRows = await sql`
      SELECT
        round(avg(pci)::numeric, 0)::int AS avg_pci,
        COALESCE(count(*) FILTER (WHERE pci > 70), 0)::int AS good,
        COALESCE(count(*) FILTER (WHERE pci >= 40 AND pci <= 70), 0)::int AS fair,
        COALESCE(count(*) FILTER (WHERE pci < 40), 0)::int AS poor,
        count(*)::int AS total_segments
      FROM quality.pavement_condition
    `;

    const pavementSummary = {
      avgPci: Number(pavementRows[0].avg_pci),
      good: Number(pavementRows[0].good),
      fair: Number(pavementRows[0].fair),
      poor: Number(pavementRows[0].poor),
      totalSegments: Number(pavementRows[0].total_segments),
    };

    // Pavement by inspection year
    const pavementYearRows = await sql`
      SELECT
        inspection_year AS year,
        round(avg(pci)::numeric, 0)::int AS avg_pci,
        count(*)::int AS count
      FROM quality.pavement_condition
      WHERE inspection_year IS NOT NULL
      GROUP BY inspection_year
      ORDER BY inspection_year
    `;

    const pavementByYear = pavementYearRows.map((r) => ({
      year: Number(r.year),
      avgPci: Number(r.avg_pci),
      count: Number(r.count),
    }));

    // --- Library visits trend ---
    const libTrendRows = await sql`
      SELECT
        fiscal_year AS year,
        sum(visits)::int AS visits
      FROM quality.library_stats
      GROUP BY fiscal_year
      ORDER BY fiscal_year
    `;

    const libraryTrend = libTrendRows.map((r) => ({
      year: Number(r.year),
      visits: Number(r.visits),
    }));

    return NextResponse.json({
      parkStats,
      pavementSummary,
      pavementByYear,
      libraryTrend,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[quality/detail] DB query failed:", error);
    return NextResponse.json({
      parkStats: { totalParks: 0, totalAcres: 0, avgAcres: 0, largestPark: null },
      pavementSummary: { avgPci: 0, good: 0, fair: 0, poor: 0, totalSegments: 0 },
      pavementByYear: [],
      libraryTrend: [],
      dataStatus: "unavailable",
    });
  }
}
