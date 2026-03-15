/**
 * fetch-bls.ts
 *
 * Fetches employment data from the Bureau of Labor Statistics (BLS) API v1
 * (no key needed, 25 requests/day limit) and inserts into PostgreSQL.
 *
 * Series fetched:
 *   - Portland MSA (38900) nonfarm employment by sector
 *   - Multnomah County unemployment rate
 *
 * Usage: npx tsx scripts/fetch-bls.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const BLS_API_URL = "https://api.bls.gov/publicAPI/v1/timeseries/data/";

// BLS v1 API allows max 10 series per request, max 10 years per request
// We'll batch carefully to stay within 25 requests/day

interface BLSSeries {
  id: string;
  name: string;
}

// BLS CES series for Portland-Vancouver-Hillsboro MSA (area code 38900)
// Format: SMU + state(41) + area(38900) + industry(XXXXXXXX) + data_type(01)
const EMPLOYMENT_SERIES: BLSSeries[] = [
  { id: "SMU41389000000000001", name: "Total Nonfarm" },
  { id: "SMU41389000500000001", name: "Total Private" },
  { id: "SMU41389001500000001", name: "Mining and Logging" },
  { id: "SMU41389002000000001", name: "Construction" },
  { id: "SMU41389003000000001", name: "Manufacturing" },
  { id: "SMU41389004000000001", name: "Trade, Transportation, Utilities" },
  { id: "SMU41389005000000001", name: "Information" },
  { id: "SMU41389005500000001", name: "Financial Activities" },
  { id: "SMU41389006000000001", name: "Professional and Business Services" },
  { id: "SMU41389006500000001", name: "Education and Health Services" },
];

const EMPLOYMENT_SERIES_2: BLSSeries[] = [
  { id: "SMU41389007000000001", name: "Leisure and Hospitality" },
  { id: "SMU41389008000000001", name: "Other Services" },
  { id: "SMU41389009000000001", name: "Government" },
  // US reference
  { id: "CES0000000001", name: "US Total Nonfarm (reference)" },
];

const UNEMPLOYMENT_SERIES: BLSSeries[] = [
  {
    id: "LAUMT413890000000003",
    name: "Portland MSA Unemployment Rate",
  },
  {
    id: "LAUMT413890000000006",
    name: "Portland MSA Employment Level",
  },
];

interface BLSDataPoint {
  series_id: string;
  series_name: string;
  year: number;
  period: string;
  period_name: string;
  value: number;
  footnotes: string;
}

async function fetchBLSSeries(
  seriesList: BLSSeries[],
  startYear: string,
  endYear: string
): Promise<BLSDataPoint[]> {
  const seriesIds = seriesList.map((s) => s.id);
  const seriesMap = new Map(seriesList.map((s) => [s.id, s.name]));

  console.log(
    `  Requesting ${seriesIds.length} series for ${startYear}-${endYear}...`
  );

  const body = JSON.stringify({
    seriesid: seriesIds,
    startyear: startYear,
    endyear: endYear,
  });

  const res = await fetch(BLS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    throw new Error(`BLS API returned HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.status !== "REQUEST_SUCCEEDED") {
    console.log(`  BLS API status: ${json.status}`);
    if (json.message && json.message.length > 0) {
      for (const msg of json.message) {
        console.log(`  BLS message: ${msg}`);
      }
    }
    // Still try to parse results even if status isn't perfect
  }

  const results: BLSDataPoint[] = [];
  const series = json.Results?.series ?? [];

  for (const s of series) {
    const seriesId = s.seriesID;
    const seriesName = seriesMap.get(seriesId) ?? seriesId;
    const dataPoints = s.data ?? [];

    console.log(`    ${seriesName} (${seriesId}): ${dataPoints.length} data points`);

    for (const dp of dataPoints) {
      const value = parseFloat(dp.value);
      if (isNaN(value)) continue;

      const footnoteTexts = (dp.footnotes ?? [])
        .map((fn: any) => fn.text ?? "")
        .filter(Boolean)
        .join("; ");

      results.push({
        series_id: seriesId,
        series_name: seriesName,
        year: parseInt(dp.year, 10),
        period: dp.period,
        period_name: dp.periodName ?? dp.period,
        value,
        footnotes: footnoteTexts,
      });
    }
  }

  return results;
}

async function fetchAllBLS(): Promise<BLSDataPoint[]> {
  console.log("\n=== Fetching BLS Employment Data ===");
  const allData: BLSDataPoint[] = [];

  // BLS v1 API: max 10 series per request, max 10 years
  // We'll do 3 requests to cover all series

  // Request 1: First batch of employment series (10 series), 2016-2025
  try {
    const batch1 = await fetchBLSSeries(EMPLOYMENT_SERIES, "2016", "2025");
    allData.push(...batch1);
    console.log(`  Batch 1: ${batch1.length} data points`);
  } catch (err: any) {
    console.log(`  Batch 1 failed: ${err.message}`);
  }

  // Brief pause to be nice to the API
  await new Promise((r) => setTimeout(r, 1000));

  // Request 2: Second batch of employment + unemployment (5 series)
  try {
    const batch2Series = [...EMPLOYMENT_SERIES_2, ...UNEMPLOYMENT_SERIES];
    const batch2 = await fetchBLSSeries(batch2Series, "2016", "2025");
    allData.push(...batch2);
    console.log(`  Batch 2: ${batch2.length} data points`);
  } catch (err: any) {
    console.log(`  Batch 2 failed: ${err.message}`);
  }

  // If we got no data for recent years, try a smaller range
  if (allData.length === 0) {
    console.log("  Retrying with smaller date range...");
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const retry = await fetchBLSSeries(
        [EMPLOYMENT_SERIES[0], ...UNEMPLOYMENT_SERIES],
        "2020",
        "2025"
      );
      allData.push(...retry);
      console.log(`  Retry: ${retry.length} data points`);
    } catch (err: any) {
      console.log(`  Retry failed: ${err.message}`);
    }
  }

  console.log(`\n  Total BLS data points: ${allData.length}`);
  return allData;
}

// ── Insert into PostgreSQL ───────────────────────────────────────────────

async function insertData(data: BLSDataPoint[]) {
  console.log("\n=== Inserting BLS Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS business`);

    // Create BLS employment series table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.bls_employment_series (
        id            SERIAL PRIMARY KEY,
        series_id     TEXT NOT NULL,
        series_name   TEXT NOT NULL,
        year          INTEGER NOT NULL,
        period        TEXT NOT NULL,
        period_name   TEXT,
        value         NUMERIC(12,1) NOT NULL,
        footnotes     TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(series_id, year, period)
      )
    `);

    // Create indexes for common queries
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_bls_series_year
        ON business.bls_employment_series(series_id, year)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_bls_series_name
        ON business.bls_employment_series(series_name)
    `);

    // Truncate and re-insert
    await sql.unsafe(
      `TRUNCATE business.bls_employment_series RESTART IDENTITY`
    );

    let inserted = 0;
    for (const dp of data) {
      try {
        await sql`
          INSERT INTO business.bls_employment_series
            (series_id, series_name, year, period, period_name, value, footnotes)
          VALUES (
            ${dp.series_id}, ${dp.series_name}, ${dp.year},
            ${dp.period}, ${dp.period_name}, ${dp.value}, ${dp.footnotes}
          )
          ON CONFLICT (series_id, year, period) DO UPDATE SET
            value = EXCLUDED.value,
            series_name = EXCLUDED.series_name,
            period_name = EXCLUDED.period_name,
            footnotes = EXCLUDED.footnotes
        `;
        inserted++;
      } catch (err: any) {
        console.log(
          `  Error inserting ${dp.series_id}/${dp.year}/${dp.period}: ${err.message}`
        );
      }
    }

    console.log(`  Inserted ${inserted} BLS data points`);

    // Update dashboard cache
    // Summarize by series
    const seriesSummary: Record<
      string,
      { name: string; count: number; min_year: number; max_year: number; latest_value: number }
    > = {};

    for (const dp of data) {
      if (!seriesSummary[dp.series_id]) {
        seriesSummary[dp.series_id] = {
          name: dp.series_name,
          count: 0,
          min_year: dp.year,
          max_year: dp.year,
          latest_value: dp.value,
        };
      }
      const s = seriesSummary[dp.series_id];
      s.count++;
      if (dp.year < s.min_year) s.min_year = dp.year;
      if (dp.year > s.max_year) {
        s.max_year = dp.year;
        s.latest_value = dp.value;
      }
    }

    const cacheData = {
      source: "Bureau of Labor Statistics (v1 API)",
      total_data_points: data.length,
      series: Object.entries(seriesSummary).map(([id, s]) => ({
        series_id: id,
        series_name: s.name,
        data_points: s.count,
        year_range: `${s.min_year}-${s.max_year}`,
        latest_value: s.latest_value,
      })),
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('bls_employment', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with bls_employment entry");

    // Verify
    const verify = await sql`
      SELECT series_name, count(*)::int as cnt,
             min(year) as min_year, max(year) as max_year
      FROM business.bls_employment_series
      GROUP BY series_name
      ORDER BY series_name
    `;
    console.log("\n  Verification:");
    for (const row of verify) {
      console.log(
        `    ${row.series_name}: ${row.cnt} rows (${row.min_year}-${row.max_year})`
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
  console.log("Portland Dashboard — BLS Data Fetch");
  console.log("====================================");

  const data = await fetchAllBLS();

  if (data.length === 0) {
    console.log(
      "WARNING: No BLS data fetched. You may have hit the daily request limit (25/day)."
    );
    console.log("Consider registering for a BLS API key at:");
    console.log("  https://data.bls.gov/registrationEngine/");
    process.exit(0);
  }

  // Save JSON
  const jsonPath = path.join(DATA_DIR, "bls_employment.json");
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${jsonPath} (${data.length} data points)`);

  // Insert into database
  await insertData(data);

  console.log("\n====================================");
  console.log("BLS data fetch complete!");
  console.log(`  Total data points: ${data.length}`);
  console.log(
    `  Unique series: ${new Set(data.map((d) => d.series_id)).size}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
