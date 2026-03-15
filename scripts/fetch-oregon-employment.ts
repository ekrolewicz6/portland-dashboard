/**
 * fetch-oregon-employment.ts
 *
 * Fetches employment and economic data from:
 * - BLS (Bureau of Labor Statistics) public data for Portland MSA
 * - Oregon Employment Department public data
 *
 * Usage: npx tsx scripts/fetch-oregon-employment.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── BLS Data ────────────────────────────────────────────────────────────

async function fetchBLSData(): Promise<any[]> {
  console.log("\n=== BLS Employment Data ===");

  // Portland-Vancouver-Hillsboro MSA unemployment rate
  // Series ID: LAUST410000000000003 (Portland MSA unemployment rate)
  // or LAUMT413890000000003 (Portland metro)
  const seriesIds = [
    "LAUMT413890000000003", // Portland-Vancouver-Hillsboro MSA unemployment rate
    "LAUMT413890000000005", // Portland MSA employment
    "LAUMT413890000000006", // Portland MSA labor force
  ];

  const allData: any[] = [];

  // BLS public API (v2, no key needed for limited use)
  const blsUrl = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

  for (const seriesId of seriesIds) {
    console.log(`   Fetching series: ${seriesId}`);
    try {
      const res = await fetch(blsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesid: [seriesId],
          startyear: "2019",
          endyear: "2025",
        }),
      });

      if (!res.ok) {
        console.log(`   HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      if (data.status === "REQUEST_SUCCEEDED" && data.Results?.series?.length > 0) {
        const series = data.Results.series[0];
        console.log(`   Got ${series.data?.length ?? 0} data points for ${seriesId}`);
        for (const d of series.data ?? []) {
          allData.push({
            series_id: seriesId,
            year: parseInt(d.year),
            period: d.period,
            period_name: d.periodName,
            value: parseFloat(d.value),
            footnotes: d.footnotes?.map((f: any) => f.text).join("; ") ?? "",
          });
        }
      } else {
        console.log(`   Status: ${data.status}, message: ${data.message?.join("; ") ?? "none"}`);
      }
    } catch (err: any) {
      console.error(`   Error: ${err.message}`);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  // Also try Oregon statewide unemployment
  console.log(`   Fetching Oregon statewide unemployment...`);
  try {
    const res = await fetch(blsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: ["LASST410000000000003"], // Oregon statewide unemployment rate
        startyear: "2019",
        endyear: "2025",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "REQUEST_SUCCEEDED" && data.Results?.series?.length > 0) {
        const series = data.Results.series[0];
        console.log(`   Got ${series.data?.length ?? 0} Oregon statewide data points`);
        for (const d of series.data ?? []) {
          allData.push({
            series_id: "LASST410000000000003",
            year: parseInt(d.year),
            period: d.period,
            period_name: d.periodName,
            value: parseFloat(d.value),
            footnotes: d.footnotes?.map((f: any) => f.text).join("; ") ?? "",
          });
        }
      }
    }
  } catch (err: any) {
    console.error(`   Oregon statewide error: ${err.message}`);
  }

  console.log(`   Total BLS data points: ${allData.length}`);
  return allData;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Oregon Employment Data Fetch ===");

  const blsData = await fetchBLSData();

  // Save JSON
  console.log("\n=== Saving JSON ===");
  if (blsData.length > 0) {
    fs.writeFileSync(
      path.join(DATA_DIR, "bls_portland_employment.json"),
      JSON.stringify(blsData, null, 2)
    );
    console.log(`   Saved bls_portland_employment.json (${blsData.length} records)`);
  }

  // Insert into PostgreSQL
  console.log("\n=== Inserting into PostgreSQL ===");
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS business`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.bls_employment (
        id          SERIAL PRIMARY KEY,
        series_id   TEXT NOT NULL,
        year        INTEGER NOT NULL,
        period      TEXT NOT NULL,
        period_name TEXT,
        value       NUMERIC(12,2),
        footnotes   TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (series_id, year, period)
      )
    `);

    await sql.unsafe(`TRUNCATE business.bls_employment RESTART IDENTITY`);

    let insertCount = 0;
    for (const d of blsData) {
      try {
        await sql`
          INSERT INTO business.bls_employment (series_id, year, period, period_name, value, footnotes)
          VALUES (${d.series_id}, ${d.year}, ${d.period}, ${d.period_name}, ${d.value}, ${d.footnotes})
          ON CONFLICT (series_id, year, period) DO NOTHING
        `;
        insertCount++;
      } catch { /* skip */ }
    }
    console.log(`   Inserted ${insertCount} BLS employment records`);

    // Build summary for cache
    const unemploymentData = blsData
      .filter((d) => d.series_id === "LAUMT413890000000003")
      .sort((a, b) => b.year - a.year || b.period.localeCompare(a.period));

    const latestUnemployment = unemploymentData.length > 0 ? unemploymentData[0] : null;

    const cacheSummary = {
      source: "Bureau of Labor Statistics",
      total_records: insertCount,
      latest_portland_unemployment: latestUnemployment
        ? {
            rate: latestUnemployment.value,
            period: latestUnemployment.period_name,
            year: latestUnemployment.year,
          }
        : null,
      series_ids: [...new Set(blsData.map((d) => d.series_id))],
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('bls_employment', ${sql.json(cacheSummary)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(cacheSummary)}, updated_at = now()
    `;

    // Verify
    const verify = await sql`SELECT count(*)::int as cnt FROM business.bls_employment`;
    console.log(`   Verify: business.bls_employment = ${verify[0].cnt} rows`);

    await sql.end();
  } catch (err: any) {
    console.error(`   DB error: ${err.message}`);
    await sql.end();
  }

  console.log("\n=== Oregon Employment Data fetch complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
