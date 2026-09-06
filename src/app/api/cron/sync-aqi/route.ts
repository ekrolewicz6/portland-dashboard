import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// AirNow AQI Sync — runs every 3 hours via Vercel cron
// ---------------------------------------------------------------------------
// Fetches:
//   1. Current AQI observations (O3, PM2.5) for Portland
//   2. Tomorrow's AQI forecast
// Upserts into environment.airnow_aqi (current) and
// environment.airnow_forecast (forecast).
// ---------------------------------------------------------------------------

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

interface AirNowForecast {
  DateIssue: string;
  DateForecast: string;
  ReportingArea: string;
  ParameterName: string;
  AQI: number;
  Category: { Number: number; Name: string };
  ActionDay: boolean;
  Discussion: string;
}

async function fetchJSON<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`AirNow API ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function GET(request: NextRequest) {
  // Auth check
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!AIRNOW_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "AIRNOW_API_KEY not configured" },
      { status: 500 },
    );
  }

  const t0 = Date.now();
  let currentCount = 0;
  let forecastCount = 0;
  const errors: string[] = [];

  // ── 1. Current observations ──────────────────────────────────────────
  try {
    const current = await fetchJSON<AirNowObservation>(
      `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${ZIP}&distance=${DISTANCE}&API_KEY=${AIRNOW_API_KEY}`,
    );

    for (const obs of current) {
      const dateStr = obs.DateObserved.trim();
      try {
        await sql`
          INSERT INTO environment.airnow_aqi
            (date, hour, aqi, category, pollutant, reporting_area)
          VALUES
            (${dateStr}::date, ${obs.HourObserved}, ${obs.AQI},
             ${obs.Category.Name}, ${obs.ParameterName}, ${obs.ReportingArea})
          ON CONFLICT (date, hour, pollutant) DO UPDATE SET
            aqi = EXCLUDED.aqi,
            category = EXCLUDED.category,
            reporting_area = EXCLUDED.reporting_area
        `;
        currentCount++;
      } catch (err) {
        errors.push(
          `current upsert: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    console.log(`[sync-aqi] Upserted ${currentCount} current observations`);
  } catch (err) {
    const msg = `current fetch: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    console.error(`[sync-aqi] ${msg}`);
  }

  // ── 2. Forecast ──────────────────────────────────────────────────────
  try {
    const forecasts = await fetchJSON<AirNowForecast>(
      `https://www.airnowapi.org/aq/forecast/zipCode/?format=application/json&zipCode=${ZIP}&distance=${DISTANCE}&API_KEY=${AIRNOW_API_KEY}`,
    );

    // Ensure forecast table exists (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS environment.airnow_forecast (
        id            serial PRIMARY KEY,
        date_issue    date NOT NULL,
        date_forecast date NOT NULL,
        aqi           int NOT NULL,
        category      text NOT NULL,
        pollutant     text NOT NULL,
        reporting_area text NOT NULL,
        action_day    boolean DEFAULT false,
        discussion    text,
        created_at    timestamptz DEFAULT now(),
        UNIQUE (date_forecast, pollutant)
      )
    `;

    for (const fc of forecasts) {
      try {
        await sql`
          INSERT INTO environment.airnow_forecast
            (date_issue, date_forecast, aqi, category, pollutant,
             reporting_area, action_day, discussion)
          VALUES
            (${fc.DateIssue}::date, ${fc.DateForecast}::date, ${fc.AQI},
             ${fc.Category.Name}, ${fc.ParameterName}, ${fc.ReportingArea},
             ${fc.ActionDay}, ${fc.Discussion || null})
          ON CONFLICT (date_forecast, pollutant) DO UPDATE SET
            date_issue = EXCLUDED.date_issue,
            aqi = EXCLUDED.aqi,
            category = EXCLUDED.category,
            action_day = EXCLUDED.action_day,
            discussion = EXCLUDED.discussion
        `;
        forecastCount++;
      } catch (err) {
        errors.push(
          `forecast upsert: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    console.log(`[sync-aqi] Upserted ${forecastCount} forecast records`);
  } catch (err) {
    const msg = `forecast fetch: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    console.error(`[sync-aqi] ${msg}`);
  }

  // ── 3. Invalidate environment cache ──────────────────────────────────
  if (currentCount > 0 || forecastCount > 0) {
    await sql`
      DELETE FROM public.dashboard_cache
      WHERE question IN ('environment', 'environment_detail')
    `.catch(() => {});
  }

  const ms = Date.now() - t0;
  console.log(`[sync-aqi] Done in ${ms}ms`);

  // A run that wrote nothing while collecting errors is a failed run, and the
  // scheduler only sees the status code. Returning 200 with ok:false meant a
  // cron could be broken for weeks and still look healthy.
  const wroteNothing = currentCount === 0 && forecastCount === 0;
  const failed = errors.length > 0 && wroteNothing;

  return NextResponse.json(
    {
      ok: errors.length === 0,
      ms,
      current: currentCount,
      forecast: forecastCount,
      ...(errors.length > 0 ? { errors } : {}),
    },
    { status: failed ? 500 : 200 },
  );
}
