import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface AqiReading {
  pollutant: string;
  aqi: number;
  category: string;
  date: string;
  hour: number;
  reporting_area: string;
}

interface EnvironmentDetailResponse {
  currentAqi: AqiReading[];
  aqiTrend: { date: string; value: number }[];
  dataStatus: string;
}

export async function GET(): Promise<NextResponse<EnvironmentDetailResponse>> {
  try {
    // Latest reading per pollutant
    const currentRows = await sql`
      SELECT DISTINCT ON (pollutant)
        pollutant,
        aqi::int,
        category,
        date::text,
        hour::int,
        reporting_area
      FROM environment.airnow_aqi
      ORDER BY pollutant, date DESC, hour DESC
    `;

    const currentAqi: AqiReading[] = currentRows.map((r) => ({
      pollutant: r.pollutant as string,
      aqi: Number(r.aqi),
      category: r.category as string,
      date: r.date as string,
      hour: Number(r.hour),
      reporting_area: r.reporting_area as string,
    }));

    // Daily average AQI for PM2.5 over all available dates
    const trendRows = await sql`
      SELECT
        date::text AS date,
        ROUND(AVG(aqi))::int AS avg_aqi
      FROM environment.airnow_aqi
      WHERE pollutant = 'PM2.5'
      GROUP BY date
      ORDER BY date
    `;

    const aqiTrend = trendRows.map((r) => ({
      date: (r.date as string).slice(5), // MM-DD
      value: Number(r.avg_aqi),
    }));

    const dataStatus = currentAqi.length > 0 ? "live" : "unavailable";

    return NextResponse.json({ currentAqi, aqiTrend, dataStatus });
  } catch (error) {
    console.error("[environment/detail] DB query failed:", error);
    return NextResponse.json({
      currentAqi: [],
      aqiTrend: [],
      dataStatus: "unavailable",
    });
  }
}
