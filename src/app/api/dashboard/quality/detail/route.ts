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

    // --- Library extended stats (latest year) ---
    let libraryExtended = null;
    try {
      const libExtRows = await sql`
        SELECT
          fiscal_year,
          sum(visits)::int AS visits,
          sum(circulation)::int AS circulation,
          sum(programs_offered)::int AS programs,
          sum(program_attendance)::int AS attendance,
          sum(registered_users)::int AS registered_users
        FROM quality.library_stats
        GROUP BY fiscal_year
        ORDER BY fiscal_year DESC
        LIMIT 1
      `;
      if (libExtRows.length > 0) {
        libraryExtended = {
          fiscalYear: Number(libExtRows[0].fiscal_year),
          visits: Number(libExtRows[0].visits),
          circulation: Number(libExtRows[0].circulation),
          programs: Number(libExtRows[0].programs),
          attendance: Number(libExtRows[0].attendance),
          registeredUsers: Number(libExtRows[0].registered_users),
        };
      }
    } catch {
      // columns may not exist yet
    }

    // --- Affordability ---
    let affordability: { year: number; metric: string; value: number; source: string }[] = [];
    try {
      const affRows = await sql`
        SELECT year, metric, value::float AS value, COALESCE(source, '') AS source
        FROM quality.affordability
        ORDER BY year, metric
      `;
      affordability = affRows.map((r) => ({
        year: Number(r.year),
        metric: r.metric as string,
        value: Number(r.value),
        source: r.source as string,
      }));
    } catch {
      // table may not exist yet
    }

    // --- Neighborhood income (from economy schema) ---
    let neighborhoodIncome = null;
    try {
      const incRows = await sql`
        SELECT
          count(*)::int AS neighborhoods,
          round(avg(median_income)::numeric, 0)::int AS avg_median_income,
          min(median_income)::int AS min_income,
          max(median_income)::int AS max_income,
          round(avg(poverty_rate)::numeric, 1) AS avg_poverty_rate
        FROM economy.neighborhood_income
      `;
      if (incRows.length > 0 && Number(incRows[0].neighborhoods) > 0) {
        neighborhoodIncome = {
          neighborhoods: Number(incRows[0].neighborhoods),
          avgMedianIncome: Number(incRows[0].avg_median_income),
          minIncome: Number(incRows[0].min_income),
          maxIncome: Number(incRows[0].max_income),
          avgPovertyRate: Number(incRows[0].avg_poverty_rate),
        };
      }
    } catch {
      // table may not exist
    }

    // --- Air Quality (from environment schema) ---
    let airQuality = null;
    try {
      // Latest reading
      const latestAqi = await sql`
        SELECT date, aqi, category, pollutant
        FROM environment.airnow_aqi
        WHERE pollutant = 'PM2.5' OR pollutant = 'O3'
        ORDER BY date DESC, hour DESC
        LIMIT 1
      `;
      // Daily averages for trend
      const aqiTrend = await sql`
        SELECT date::text, round(avg(aqi))::int AS avg_aqi
        FROM environment.airnow_aqi
        WHERE pollutant = 'PM2.5'
        GROUP BY date
        ORDER BY date
      `;
      // Smoke days (AQI > 100) per year
      const smokeDays = await sql`
        SELECT
          EXTRACT(YEAR FROM date)::int AS year,
          count(DISTINCT date)::int AS smoke_days
        FROM environment.airnow_aqi
        WHERE aqi > 100
        GROUP BY EXTRACT(YEAR FROM date)
        ORDER BY year
      `;

      airQuality = {
        latest: latestAqi.length > 0
          ? {
              date: latestAqi[0].date as string,
              aqi: Number(latestAqi[0].aqi),
              category: latestAqi[0].category as string,
              pollutant: latestAqi[0].pollutant as string,
            }
          : null,
        trend: aqiTrend.map((r) => ({
          date: r.date as string,
          value: Number(r.avg_aqi),
        })),
        smokeDays: smokeDays.map((r) => ({
          year: Number(r.year),
          days: Number(r.smoke_days),
        })),
      };
    } catch {
      // table may not exist
    }

    // --- Transit Ridership ---
    let transitRidership = null;
    try {
      const transitRows = await sql`
        SELECT
          EXTRACT(YEAR FROM month)::int AS year,
          mode,
          ridership,
          on_time_pct
        FROM quality.transit_ridership
        ORDER BY month, mode
      `;

      if (transitRows.length > 0) {
        // Group by year for the total line
        const byYear: Record<number, { total: number; onTime: number | null }> = {};
        const byMode: Record<string, { year: number; ridership: number }[]> = {};

        for (const r of transitRows) {
          const year = Number(r.year);
          const mode = r.mode as string;
          const ridership = Number(r.ridership);

          if (mode === "total") {
            byYear[year] = {
              total: ridership,
              onTime: r.on_time_pct ? Number(r.on_time_pct) : null,
            };
          }

          if (!byMode[mode]) byMode[mode] = [];
          byMode[mode].push({ year, ridership });
        }

        transitRidership = {
          byYear: Object.entries(byYear)
            .map(([y, d]) => ({ year: Number(y), total: d.total, onTimePct: d.onTime }))
            .sort((a, b) => a.year - b.year),
          byMode,
        };
      }
    } catch {
      // table may not exist
    }

    // --- Cultural Institutions ---
    let culturalInstitutions: { name: string; type: string }[] = [];
    let culturalCount = 0;
    try {
      const cultRows = await sql`
        SELECT name, type
        FROM quality.cultural_institutions
        ORDER BY type, name
      `;
      culturalInstitutions = cultRows.map((r) => ({
        name: r.name as string,
        type: r.type as string,
      }));
      culturalCount = culturalInstitutions.length;
    } catch {
      // table may not exist
    }

    // --- Context Stats ---
    let contextStats: Record<string, { value: string; context: string; source: string; asOfDate: string | null }> = {};
    try {
      const ctxRows = await sql`
        SELECT metric, value, context, source, as_of_date::text
        FROM quality.context_stats
      `;
      for (const r of ctxRows) {
        contextStats[r.metric as string] = {
          value: r.value as string,
          context: (r.context ?? "") as string,
          source: (r.source ?? "") as string,
          asOfDate: (r.as_of_date ?? null) as string | null,
        };
      }
    } catch {
      // table may not exist
    }

    return NextResponse.json({
      parkStats,
      pavementSummary,
      pavementByYear,
      libraryTrend,
      libraryExtended,
      affordability,
      neighborhoodIncome,
      airQuality,
      transitRidership,
      culturalInstitutions,
      culturalCount,
      contextStats,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[quality/detail] DB query failed:", error);
    return NextResponse.json({
      parkStats: { totalParks: 0, totalAcres: 0, avgAcres: 0, largestPark: null },
      pavementSummary: { avgPci: 0, good: 0, fair: 0, poor: 0, totalSegments: 0 },
      pavementByYear: [],
      libraryTrend: [],
      libraryExtended: null,
      affordability: [],
      neighborhoodIncome: null,
      airQuality: null,
      transitRidership: null,
      culturalInstitutions: [],
      culturalCount: 0,
      contextStats: {},
      dataStatus: "unavailable",
    });
  }
}
