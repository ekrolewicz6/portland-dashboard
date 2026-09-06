/**
 * fetch-zillow-rents.ts
 *
 * Downloads Zillow ZORI (Observed Rent Index) CSV data and seeds it into
 * the `public.housing_rents` table (month, zip_code, zori) and
 * `public.zillow_metrics` table (metric='zori_all', month, value).
 *
 * Source: Zillow Research Data — free, no API key needed.
 * CSV URL: https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv
 *
 * The CSV has one row per metro area. Monthly columns are date-formatted
 * headers like "2015-01-31", "2015-02-28", etc.
 *
 * We filter for "Portland" in RegionName to get Portland-Vancouver-Hillsboro MSA.
 *
 * Usage: npx tsx ingest/fetch-zillow-rents.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();
const isPooled = DB_URL.includes("pooler.supabase.com");
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
fs.mkdirSync(DATA_DIR, { recursive: true });

const ZORI_CSV_URL =
  "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv";

interface RentDataPoint {
  month: string; // YYYY-MM-DD (first of month)
  zori: number;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function downloadAndParse(): Promise<RentDataPoint[]> {
  console.log("\n=== Downloading Zillow ZORI CSV ===");
  console.log(`  URL: ${ZORI_CSV_URL}`);

  const res = await fetch(ZORI_CSV_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  const csvPath = path.join(DATA_DIR, "zillow_zori_metro.csv");
  fs.writeFileSync(csvPath, text);
  console.log(`  Saved CSV: ${csvPath} (${(text.length / 1024 / 1024).toFixed(1)} MB)`);

  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV has fewer than 2 lines");
  }

  // Parse header row
  const headers = parseCsvLine(lines[0]);
  console.log(`  Total columns: ${headers.length}`);
  console.log(`  Total metro rows: ${lines.length - 1}`);

  // Identify date columns — they match YYYY-MM-DD pattern
  const dateColumns: { index: number; header: string; normalizedDate: string }[] = [];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (let i = 0; i < headers.length; i++) {
    if (dateRegex.test(headers[i])) {
      // Normalize to first-of-month: "2015-01-31" -> "2015-01-01"
      const parts = headers[i].split("-");
      const normalizedDate = `${parts[0]}-${parts[1]}-01`;
      dateColumns.push({ index: i, header: headers[i], normalizedDate });
    }
  }

  console.log(`  Date columns found: ${dateColumns.length}`);
  if (dateColumns.length > 0) {
    console.log(`  Date range: ${dateColumns[0].header} to ${dateColumns[dateColumns.length - 1].header}`);
  }

  // Find the RegionName column
  const regionNameIdx = headers.findIndex(
    (h) => h.toLowerCase() === "regionname"
  );
  if (regionNameIdx < 0) {
    throw new Error(
      `Cannot find RegionName column. Headers: ${headers.slice(0, 10).join(", ")}`
    );
  }

  // Find Portland row
  let portlandLine: string | null = null;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const regionName = fields[regionNameIdx] || "";
    if (regionName.toLowerCase().includes("portland")) {
      console.log(`  Found Portland row: "${regionName}" (line ${i + 1})`);
      portlandLine = lines[i];
      break;
    }
  }

  if (!portlandLine) {
    // Debug: show all unique region names containing "port" or "or"
    console.log("\n  Portland not found. Searching for similar regions...");
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      const name = fields[regionNameIdx] || "";
      if (
        name.toLowerCase().includes("port") ||
        name.toLowerCase().includes(", or")
      ) {
        console.log(`    "${name}"`);
      }
    }
    throw new Error("Could not find Portland metro area in CSV");
  }

  // Parse Portland data
  const portlandFields = parseCsvLine(portlandLine);
  const dataPoints: RentDataPoint[] = [];

  for (const col of dateColumns) {
    const raw = portlandFields[col.index];
    if (!raw || raw === "" || raw === "." || raw === "NaN") continue;

    const value = parseFloat(raw);
    if (isNaN(value) || value <= 0) continue;

    dataPoints.push({
      month: col.normalizedDate,
      zori: Math.round(value * 100) / 100, // 2 decimal places
    });
  }

  console.log(`  Portland ZORI data points: ${dataPoints.length}`);
  if (dataPoints.length > 0) {
    console.log(
      `  First: ${dataPoints[0].month} = $${dataPoints[0].zori}`
    );
    console.log(
      `  Latest: ${dataPoints[dataPoints.length - 1].month} = $${dataPoints[dataPoints.length - 1].zori}`
    );
  }

  return dataPoints;
}

async function seedDatabase(data: RentDataPoint[]) {
  console.log("\n=== Seeding Database ===");

  const sql = postgres(DB_URL, {
    max: 5,
    ...(isPooled ? { prepare: false } : {}),
    onnotice: () => {},
  });

  try {
    // Ensure table exists with correct schema
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.housing_rents (
        id        SERIAL PRIMARY KEY,
        month     DATE NOT NULL,
        zip_code  TEXT,
        zori      NUMERIC(10,2)
      )
    `);

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_housing_rents_month ON public.housing_rents(month)
    `);

    // Clear ALL existing data — old rows are placeholder seed data
    await sql`TRUNCATE public.housing_rents RESTART IDENTITY`;
    console.log(`  Truncated housing_rents table`);

    // Insert all data points
    let inserted = 0;
    for (const dp of data) {
      try {
        await sql`
          INSERT INTO public.housing_rents (month, zip_code, zori)
          VALUES (${dp.month}::date, 'metro', ${dp.zori})
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Skip ${dp.month}: ${err.message}`);
      }
    }

    console.log(`  Inserted ${inserted} rows into public.housing_rents`);

    // Also upsert into public.zillow_metrics for the detail page queries
    await sql`DELETE FROM public.zillow_metrics WHERE metric = 'zori_all'`;
    let metricsInserted = 0;
    for (const dp of data) {
      try {
        await sql`
          INSERT INTO public.zillow_metrics (metric, month, value, description)
          VALUES ('zori_all', ${dp.month}::date, ${dp.zori}, 'Zillow Observed Rent Index - All homes, Portland MSA')
          ON CONFLICT (metric, month) DO UPDATE SET
            value = EXCLUDED.value
        `;
        metricsInserted++;
      } catch {
        // skip
      }
    }
    console.log(`  Upserted ${metricsInserted} rows into public.zillow_metrics (zori_all)`);

    // Verify
    const verify = await sql`
      SELECT count(*) as cnt,
             min(month)::text as min_month,
             max(month)::text as max_month,
             min(zori)::numeric as min_zori,
             max(zori)::numeric as max_zori
      FROM public.housing_rents
      WHERE zori IS NOT NULL
    `;

    console.log("\n  Verification (housing_rents):");
    console.log(`    Total rows: ${verify[0].cnt}`);
    console.log(`    Date range: ${verify[0].min_month} to ${verify[0].max_month}`);
    console.log(`    ZORI range: $${verify[0].min_zori} to $${verify[0].max_zori}`);

    const verifyMetrics = await sql`
      SELECT count(*) as cnt FROM public.zillow_metrics WHERE metric = 'zori_all'
    `;
    console.log(`    zillow_metrics zori_all rows: ${verifyMetrics[0].cnt}`);

    // Update dashboard cache to clear stale housing data
    try {
      await sql`
        DELETE FROM public.dashboard_cache
        WHERE question IN ('housing', 'housing_detail', 'housing_journey', 'housing_bottleneck')
      `;
      console.log("  Cleared housing cache so API picks up fresh rent data");
    } catch {
      // cache table may not exist
    }

    // Save JSON backup
    const jsonPath = path.join(DATA_DIR, "zillow_zori_portland.json");
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`  Saved JSON: ${jsonPath}`);

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }
}

async function main() {
  console.log("Portland Dashboard -- Zillow ZORI Rent Data Fetch");
  console.log("==================================================");

  const data = await downloadAndParse();

  if (data.length === 0) {
    console.log("WARNING: No ZORI data found for Portland. CSV may have changed format.");
    process.exit(1);
  }

  await seedDatabase(data);

  console.log("\n==================================================");
  console.log("Zillow ZORI fetch complete!");
  console.log(`  Total data points: ${data.length}`);
  console.log(
    `  Latest rent: $${data[data.length - 1].zori}/month (${data[data.length - 1].month})`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
