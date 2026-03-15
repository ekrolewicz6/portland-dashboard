/**
 * fix-bls-insert.ts
 *
 * Fixes the BLS employment table schema and re-inserts the data.
 * The table was created by the earlier script without series_name column.
 *
 * Usage: npx tsx scripts/fix-bls-insert.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.join(process.cwd(), "data");

async function main() {
  console.log("=== Fix BLS Employment Insert ===\n");

  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  // Drop and recreate table with correct schema
  console.log("1. Dropping old table...");
  await sql.unsafe(`DROP TABLE IF EXISTS business.bls_employment`);

  console.log("2. Creating new table with series_name column...");
  await sql.unsafe(`
    CREATE TABLE business.bls_employment (
      id          SERIAL PRIMARY KEY,
      series_id   TEXT NOT NULL,
      series_name TEXT,
      year        INTEGER NOT NULL,
      period      TEXT NOT NULL,
      period_name TEXT,
      value       NUMERIC(12,2),
      footnotes   TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (series_id, year, period)
    )
  `);

  // Read saved JSON
  const dataPath = path.join(DATA_DIR, "bls_portland_employment.json");
  if (!fs.existsSync(dataPath)) {
    console.log("   No BLS data file found. Re-fetching from BLS API...");

    const seriesInfo = [
      { id: "LAUMT413890000000003", name: "Portland MSA Unemployment Rate" },
      { id: "LAUMT413890000000005", name: "Portland MSA Employment" },
      { id: "LAUMT413890000000006", name: "Portland MSA Labor Force" },
      { id: "LASST410000000000003", name: "Oregon Statewide Unemployment Rate" },
    ];

    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: seriesInfo.map(s => s.id),
        startyear: "2019",
        endyear: "2025",
      }),
    });

    const data = await res.json();
    const allData: any[] = [];

    if (data.status === "REQUEST_SUCCEEDED") {
      for (const series of data.Results.series) {
        const info = seriesInfo.find(s => s.id === series.seriesID);
        for (const d of series.data ?? []) {
          allData.push({
            series_id: series.seriesID,
            series_name: info?.name ?? null,
            year: parseInt(d.year),
            period: d.period,
            period_name: d.periodName,
            value: parseFloat(d.value),
            footnotes: d.footnotes?.map((f: any) => f.text).filter(Boolean).join("; ") ?? "",
          });
        }
      }
    }

    fs.writeFileSync(dataPath, JSON.stringify(allData, null, 2));
    console.log(`   Saved ${allData.length} records to ${dataPath}`);
  }

  const allData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`\n3. Inserting ${allData.length} BLS records...`);

  let cnt = 0;
  for (const d of allData) {
    try {
      await sql`
        INSERT INTO business.bls_employment (series_id, series_name, year, period, period_name, value, footnotes)
        VALUES (${d.series_id}, ${d.series_name ?? null}, ${d.year}, ${d.period}, ${d.period_name}, ${d.value}, ${d.footnotes ?? ""})
        ON CONFLICT (series_id, year, period) DO NOTHING
      `;
      cnt++;
    } catch (err: any) {
      if (cnt === 0) console.log(`   Error: ${err.message?.slice(0, 200)}`);
    }
  }
  console.log(`   Inserted ${cnt} records`);

  // Update cache
  const unemploymentData = allData
    .filter((d: any) => d.series_id === "LAUMT413890000000003" && d.period !== "M13")
    .sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.period.localeCompare(b.period);
    });

  const latestUnemployment = unemploymentData.length > 0
    ? unemploymentData[unemploymentData.length - 1]
    : null;

  const cacheSummary = {
    source: "Bureau of Labor Statistics",
    total_records: cnt,
    latest_portland_unemployment: latestUnemployment
      ? { rate: latestUnemployment.value, period: latestUnemployment.period_name, year: latestUnemployment.year }
      : null,
    unemployment_trend: unemploymentData.slice(-12).map((d: any) => ({
      date: `${d.year}-${d.period.replace("M", "")}`,
      value: d.value,
    })),
    fetched_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO public.dashboard_cache (question, data, updated_at)
    VALUES ('bls_employment', ${sql.json(cacheSummary)}, now())
    ON CONFLICT (question) DO UPDATE SET data = ${sql.json(cacheSummary)}, updated_at = now()
  `;

  // Verify
  const verify = await sql`SELECT count(*)::int as cnt FROM business.bls_employment`;
  console.log(`\n4. Verify: business.bls_employment = ${verify[0].cnt} rows`);

  // Show sample data
  const sample = await sql`
    SELECT series_name, year, period_name, value
    FROM business.bls_employment
    WHERE series_id = 'LAUMT413890000000003'
    ORDER BY year DESC, period DESC
    LIMIT 5
  `;
  console.log("\n   Latest Portland MSA Unemployment Rates:");
  for (const r of sample) {
    console.log(`     ${r.period_name} ${r.year}: ${r.value}%`);
  }

  await sql.end();
  console.log("\n=== BLS fix complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
