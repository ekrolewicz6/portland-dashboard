/**
 * fetch-airnow.ts
 *
 * Fetches air quality (AQI) data from the AirNow API for Portland, OR (zip 97201).
 * Stores current observations plus the last 7 days of historical data.
 *
 * Requires: AIRNOW_API_KEY environment variable
 *
 * Usage: npx tsx scripts/fetch-airnow.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const API_KEY = process.env.AIRNOW_API_KEY;
if (!API_KEY) {
  console.error("ERROR: AIRNOW_API_KEY environment variable is required.");
  console.error("  Get a free key at https://docs.airnowapi.org/account/request/");
  process.exit(1);
}

const ZIP = "97201";
const DISTANCE = 25;

interface AirNowObservation {
  DateObserved: string;
  HourObserved: number;
  LocalTimeZone: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string;
  AQI: number;
  Category: { Number: number; Name: string };
}

async function fetchCurrentAQI(): Promise<AirNowObservation[]> {
  console.log("  Fetching current AQI...");
  const url = `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${ZIP}&distance=${DISTANCE}&API_KEY=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AirNow current API returned HTTP ${res.status}`);
  }
  const data: AirNowObservation[] = await res.json();
  console.log(`    Got ${data.length} current observations`);
  return data;
}

async function fetchHistoricalAQI(dateStr: string): Promise<AirNowObservation[]> {
  const url = `https://www.airnowapi.org/aq/observation/zipCode/historical/?format=application/json&zipCode=${ZIP}&date=${dateStr}T00-0000&distance=${DISTANCE}&API_KEY=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AirNow historical API returned HTTP ${res.status} for ${dateStr}`);
  }
  return res.json();
}

async function fetchLast7Days(): Promise<AirNowObservation[]> {
  console.log("  Fetching last 7 days of historical data...");
  const allObs: AirNowObservation[] = [];

  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD

    try {
      const obs = await fetchHistoricalAQI(dateStr);
      allObs.push(...obs);
      console.log(`    ${dateStr}: ${obs.length} observations`);
    } catch (err: any) {
      console.log(`    ${dateStr}: failed — ${err.message}`);
    }

    // Be polite to the API
    await new Promise((r) => setTimeout(r, 500));
  }

  return allObs;
}

async function insertData(observations: AirNowObservation[]) {
  console.log("\n=== Inserting AirNow Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS environment`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS environment.airnow_aqi (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        hour INT,
        aqi INT NOT NULL,
        category TEXT NOT NULL,
        pollutant TEXT NOT NULL,
        reporting_area TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(date, hour, pollutant)
      )
    `);

    let inserted = 0;
    let updated = 0;

    for (const obs of observations) {
      const dateStr = obs.DateObserved.trim();
      try {
        const result = await sql`
          INSERT INTO environment.airnow_aqi
            (date, hour, aqi, category, pollutant, reporting_area)
          VALUES (
            ${dateStr}::date,
            ${obs.HourObserved},
            ${obs.AQI},
            ${obs.Category.Name},
            ${obs.ParameterName},
            ${obs.ReportingArea}
          )
          ON CONFLICT (date, hour, pollutant) DO UPDATE SET
            aqi = EXCLUDED.aqi,
            category = EXCLUDED.category,
            reporting_area = EXCLUDED.reporting_area
          RETURNING (xmax = 0) AS is_insert
        `;
        if (result[0]?.is_insert) {
          inserted++;
        } else {
          updated++;
        }
      } catch (err: any) {
        console.log(`  Error inserting ${dateStr} ${obs.ParameterName}: ${err.message}`);
      }
    }

    console.log(`  Inserted: ${inserted}, Updated: ${updated}`);

    // Verify
    const verify = await sql`
      SELECT pollutant, count(*)::int as cnt,
             min(date)::text as min_date, max(date)::text as max_date,
             round(avg(aqi)) as avg_aqi
      FROM environment.airnow_aqi
      GROUP BY pollutant
      ORDER BY pollutant
    `;
    console.log("\n  Verification:");
    for (const row of verify) {
      console.log(
        `    ${row.pollutant}: ${row.cnt} rows (${row.min_date} to ${row.max_date}), avg AQI=${row.avg_aqi}`
      );
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — AirNow AQI Fetch");
  console.log("======================================");

  const current = await fetchCurrentAQI();
  const historical = await fetchLast7Days();

  const allObservations = [...current, ...historical];

  if (allObservations.length === 0) {
    console.log("WARNING: No AQI data fetched.");
    process.exit(0);
  }

  console.log(`\nTotal observations collected: ${allObservations.length}`);

  await insertData(allObservations);

  console.log("\n======================================");
  console.log("AirNow AQI fetch complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
