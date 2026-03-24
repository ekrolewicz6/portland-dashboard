import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY;
const ZIP = "97201";
const DISTANCE = 25;

interface AirNowObservation {
  DateObserved: string;
  HourObserved: number;
  ReportingArea: string;
  ParameterName: string;
  AQI: number;
  Category: { Number: number; Name: string };
}

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

/** Fetch current + last 30 days from AirNow and upsert into DB */
async function refreshAirNowData() {
  if (!AIRNOW_API_KEY) return;

  try {
    // Fetch current observations
    const currentRes = await fetch(
      `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${ZIP}&distance=${DISTANCE}&API_KEY=${AIRNOW_API_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const current: AirNowObservation[] = currentRes.ok ? await currentRes.json() : [];

    // Fetch last 14 days of historical data (batch 5 at a time to stay fast)
    const allObs: AirNowObservation[] = [...current];
    const dates: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    // Fetch in parallel batches of 5
    for (let i = 0; i < dates.length; i += 5) {
      const batch = dates.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (dateStr) => {
          const res = await fetch(
            `https://www.airnowapi.org/aq/observation/zipCode/historical/?format=application/json&zipCode=${ZIP}&date=${dateStr}T00-0000&distance=${DISTANCE}&API_KEY=${AIRNOW_API_KEY}`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (!res.ok) return [];
          return res.json() as Promise<AirNowObservation[]>;
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled" && Array.isArray(r.value)) {
          allObs.push(...r.value);
        }
      }
    }

    // Upsert into DB
    for (const obs of allObs) {
      const dateStr = obs.DateObserved.trim();
      try {
        await sql`
          INSERT INTO environment.airnow_aqi (date, hour, aqi, category, pollutant, reporting_area)
          VALUES (${dateStr}::date, ${obs.HourObserved}, ${obs.AQI}, ${obs.Category.Name}, ${obs.ParameterName}, ${obs.ReportingArea})
          ON CONFLICT (date, hour, pollutant) DO UPDATE SET
            aqi = EXCLUDED.aqi, category = EXCLUDED.category, reporting_area = EXCLUDED.reporting_area
        `;
      } catch {
        // Skip individual insert errors
      }
    }

    console.log(`[environment/detail] Refreshed ${allObs.length} AirNow observations (14 days)`);
  } catch (err) {
    console.warn("[environment/detail] AirNow refresh failed:", err instanceof Error ? err.message : err);
  }
}

export async function GET(): Promise<NextResponse<EnvironmentDetailResponse>> {
  try {
    // Refresh AirNow data in background (don't block response if it's slow)
    const refreshPromise = refreshAirNowData();

    // Check if we have recent data (last 24h)
    const recentCheck = await sql`
      SELECT max(date)::text as latest FROM environment.airnow_aqi
    `;
    const latestDate = recentCheck[0]?.latest;
    const today = new Date().toISOString().slice(0, 10);
    const isStale = !latestDate || latestDate < today;

    // If stale, wait for refresh to complete before querying
    if (isStale) {
      await refreshPromise;
    }

    // Latest reading per pollutant
    const currentRows = await sql`
      SELECT DISTINCT ON (pollutant)
        pollutant, aqi::int, category, date::text, hour::int, reporting_area
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

    // Daily average PM2.5 AQI — last 30 days
    const trendRows = await sql`
      SELECT date::text AS date, ROUND(AVG(aqi))::int AS avg_aqi
      FROM environment.airnow_aqi
      WHERE pollutant = 'PM2.5'
        AND date >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date
      ORDER BY date
    `;

    const aqiTrend = trendRows.map((r) => ({
      date: String(r.date).slice(5), // MM-DD
      value: Number(r.avg_aqi),
    }));

    return NextResponse.json({
      currentAqi,
      aqiTrend,
      dataStatus: currentAqi.length > 0 ? "live" : "unavailable",
    });
  } catch (error) {
    console.error("[environment/detail] DB query failed:", error);
    return NextResponse.json({
      currentAqi: [],
      aqiTrend: [],
      dataStatus: "unavailable",
    });
  }
}
