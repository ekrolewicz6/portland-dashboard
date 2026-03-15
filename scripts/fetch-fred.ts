/**
 * fetch-fred.ts
 *
 * Fetches economic data from FRED (Federal Reserve Economic Data) via their
 * public CSV download endpoints (no API key needed for CSV downloads).
 *
 * Series fetched:
 *   - ORPOP: Oregon population
 *   - ATNHPIUS38900Q: Portland MSA House Price Index (quarterly)
 *   - MEDLISFPRI38900: Portland MSA Median Listing Price
 *   - LAUMT413890000000003: Portland MSA Unemployment Rate
 *   - MEHOINUSOR672N: Oregon Median Household Income
 *
 * Usage: npx tsx scripts/fetch-fred.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

interface FREDSeries {
  id: string;
  name: string;
  category: string; // housing, employment, population
}

const FRED_SERIES: FREDSeries[] = [
  { id: "ORPOP", name: "Oregon Population", category: "population" },
  {
    id: "ATNHPIUS38900Q",
    name: "Portland MSA House Price Index",
    category: "housing",
  },
  {
    id: "MEDLISFPRI38900",
    name: "Portland MSA Median Listing Price",
    category: "housing",
  },
  {
    id: "LAUMT413890000000003",
    name: "Portland MSA Unemployment Rate",
    category: "employment",
  },
  {
    id: "MEHOINUSOR672N",
    name: "Oregon Median Household Income",
    category: "income",
  },
  {
    id: "ACTLISCOU38900",
    name: "Portland MSA Active Listings Count",
    category: "housing",
  },
];

interface FREDDataPoint {
  series_id: string;
  series_name: string;
  category: string;
  date: string;
  value: number;
}

async function fetchFREDCsv(
  seriesId: string
): Promise<{ date: string; value: string }[]> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  console.log(`  Fetching: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const text = await res.text();
  const lines = text.trim().split("\n");

  if (lines.length < 2) {
    throw new Error(`No data rows in CSV for ${seriesId}`);
  }

  // First line is header: DATE,VALUE (or DATE,seriesId)
  const header = lines[0];
  console.log(`    Header: ${header}`);
  console.log(`    Total rows: ${lines.length - 1}`);

  const rows: { date: string; value: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV format: DATE,VALUE
    const commaIdx = line.indexOf(",");
    if (commaIdx < 0) continue;

    const date = line.slice(0, commaIdx).trim();
    const value = line.slice(commaIdx + 1).trim();

    // Skip missing values (FRED uses "." for missing)
    if (value === "." || value === "" || value === "#N/A") continue;

    rows.push({ date, value });
  }

  return rows;
}

async function fetchAllFRED(): Promise<FREDDataPoint[]> {
  console.log("\n=== Fetching FRED Economic Data ===");
  const allData: FREDDataPoint[] = [];

  for (const series of FRED_SERIES) {
    try {
      const rows = await fetchFREDCsv(series.id);

      for (const row of rows) {
        const numValue = parseFloat(row.value);
        if (isNaN(numValue)) continue;

        allData.push({
          series_id: series.id,
          series_name: series.name,
          category: series.category,
          date: row.date,
          value: numValue,
        });
      }

      console.log(
        `    ${series.name}: ${rows.length} data points parsed`
      );

      // Show latest value
      if (rows.length > 0) {
        const latest = rows[rows.length - 1];
        console.log(`    Latest: ${latest.date} = ${latest.value}`);
      }
    } catch (err: any) {
      console.log(`  ${series.name} (${series.id}) failed: ${err.message}`);
    }

    // Brief pause between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n  Total FRED data points: ${allData.length}`);
  return allData;
}

// ── Insert into PostgreSQL ───────────────────────────────────────────────

async function insertData(data: FREDDataPoint[]) {
  console.log("\n=== Inserting FRED Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schemas
    for (const schema of ["housing", "migration", "business"]) {
      await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    }

    // Create FRED data table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.fred_series (
        id            SERIAL PRIMARY KEY,
        series_id     TEXT NOT NULL,
        series_name   TEXT NOT NULL,
        category      TEXT NOT NULL,
        date          DATE NOT NULL,
        value         NUMERIC(14,2) NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(series_id, date)
      )
    `);

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_fred_series_id ON public.fred_series(series_id)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_fred_category ON public.fred_series(category)
    `);

    // Truncate and re-insert
    await sql.unsafe(`TRUNCATE public.fred_series RESTART IDENTITY`);

    let inserted = 0;
    // Batch insert for efficiency
    const BATCH_SIZE = 100;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      for (const dp of batch) {
        try {
          await sql`
            INSERT INTO public.fred_series
              (series_id, series_name, category, date, value)
            VALUES (
              ${dp.series_id}, ${dp.series_name}, ${dp.category},
              ${dp.date}::date, ${dp.value}
            )
            ON CONFLICT (series_id, date) DO UPDATE SET
              value = EXCLUDED.value,
              series_name = EXCLUDED.series_name,
              category = EXCLUDED.category
          `;
          inserted++;
        } catch (err: any) {
          // Skip individual insert errors (e.g., bad dates)
        }
      }

      if (i > 0 && i % 1000 === 0) {
        console.log(`    ... ${i} rows processed`);
      }
    }

    console.log(`  Inserted ${inserted} FRED data points`);

    // ── Create derived housing tables ──

    // House Price Index
    const hpiData = data.filter((d) => d.series_id === "ATNHPIUS38900Q");
    if (hpiData.length > 0) {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS housing.fred_house_price_index (
          id        SERIAL PRIMARY KEY,
          quarter   DATE NOT NULL UNIQUE,
          hpi_value NUMERIC(10,2) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await sql.unsafe(
        `TRUNCATE housing.fred_house_price_index RESTART IDENTITY`
      );
      for (const dp of hpiData) {
        await sql`
          INSERT INTO housing.fred_house_price_index (quarter, hpi_value)
          VALUES (${dp.date}::date, ${dp.value})
          ON CONFLICT (quarter) DO UPDATE SET hpi_value = EXCLUDED.hpi_value
        `;
      }
      console.log(`  Created housing.fred_house_price_index (${hpiData.length} rows)`);
    }

    // Median Listing Price
    const mlpData = data.filter((d) => d.series_id === "MEDLISFPRI38900");
    if (mlpData.length > 0) {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS housing.fred_median_listing_price (
          id         SERIAL PRIMARY KEY,
          month      DATE NOT NULL UNIQUE,
          price      NUMERIC(12,2) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await sql.unsafe(
        `TRUNCATE housing.fred_median_listing_price RESTART IDENTITY`
      );
      for (const dp of mlpData) {
        await sql`
          INSERT INTO housing.fred_median_listing_price (month, price)
          VALUES (${dp.date}::date, ${dp.value})
          ON CONFLICT (month) DO UPDATE SET price = EXCLUDED.price
        `;
      }
      console.log(
        `  Created housing.fred_median_listing_price (${mlpData.length} rows)`
      );
    }

    // Portland MSA Unemployment Rate
    const unempData = data.filter(
      (d) => d.series_id === "LAUMT413890000000003"
    );
    if (unempData.length > 0) {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS business.fred_unemployment_rate (
          id         SERIAL PRIMARY KEY,
          month      DATE NOT NULL UNIQUE,
          rate       NUMERIC(5,2) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await sql.unsafe(
        `TRUNCATE business.fred_unemployment_rate RESTART IDENTITY`
      );
      for (const dp of unempData) {
        await sql`
          INSERT INTO business.fred_unemployment_rate (month, rate)
          VALUES (${dp.date}::date, ${dp.value})
          ON CONFLICT (month) DO UPDATE SET rate = EXCLUDED.rate
        `;
      }
      console.log(
        `  Created business.fred_unemployment_rate (${unempData.length} rows)`
      );
    }

    // ── Update dashboard cache ──

    const seriesSummary: Record<
      string,
      {
        name: string;
        category: string;
        count: number;
        min_date: string;
        max_date: string;
        latest_value: number;
      }
    > = {};

    for (const dp of data) {
      if (!seriesSummary[dp.series_id]) {
        seriesSummary[dp.series_id] = {
          name: dp.series_name,
          category: dp.category,
          count: 0,
          min_date: dp.date,
          max_date: dp.date,
          latest_value: dp.value,
        };
      }
      const s = seriesSummary[dp.series_id];
      s.count++;
      if (dp.date < s.min_date) s.min_date = dp.date;
      if (dp.date > s.max_date) {
        s.max_date = dp.date;
        s.latest_value = dp.value;
      }
    }

    const cacheData = {
      source: "FRED (Federal Reserve Economic Data)",
      total_data_points: data.length,
      series: Object.entries(seriesSummary).map(([id, s]) => ({
        series_id: id,
        series_name: s.name,
        category: s.category,
        data_points: s.count,
        date_range: `${s.min_date} to ${s.max_date}`,
        latest_value: s.latest_value,
      })),
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('fred_economic', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with fred_economic entry");

    // Verify
    const verify = await sql`
      SELECT series_name, count(*)::int as cnt,
             min(date)::text as min_date, max(date)::text as max_date
      FROM public.fred_series
      GROUP BY series_name
      ORDER BY series_name
    `;
    console.log("\n  Verification:");
    for (const row of verify) {
      console.log(
        `    ${row.series_name}: ${row.cnt} rows (${row.min_date} to ${row.max_date})`
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
  console.log("Portland Dashboard — FRED Data Fetch");
  console.log("=====================================");

  const data = await fetchAllFRED();

  if (data.length === 0) {
    console.log(
      "WARNING: No FRED data fetched. CSV download endpoints may be unavailable."
    );
    process.exit(0);
  }

  // Save JSON
  const jsonPath = path.join(DATA_DIR, "fred_economic.json");
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${jsonPath} (${data.length} data points)`);

  // Insert into database
  await insertData(data);

  console.log("\n=====================================");
  console.log("FRED data fetch complete!");
  console.log(`  Total data points: ${data.length}`);
  console.log(
    `  Unique series: ${new Set(data.map((d) => d.series_id)).size}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
