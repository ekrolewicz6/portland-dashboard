/**
 * fetch-housing-data.ts
 *
 * Fetches housing/economic data from:
 * - FHFA House Price Index (CSV)
 * - Redfin market tracker (TSV, Portland ZIP codes)
 *
 * Usage: npx tsx scripts/fetch-housing-data.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── CSV/TSV Parsers ─────────────────────────────────────────────────────

function parseCSVLine(line: string, delimiter = ","): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  return values;
}

function parseDelimited(content: string, delimiter = ","): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.replace(/"/g, "").trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").replace(/"/g, "").trim();
    }
    rows.push(row);
  }
  return rows;
}

// ── 1. FHFA House Price Index ───────────────────────────────────────────

async function fetchFHFA(): Promise<any[]> {
  console.log("\n=== FHFA House Price Index ===");

  const urls = [
    "https://www.fhfa.gov/DataTools/Downloads/Documents/HPI/HPI_AT_metro.csv",
    "https://www.fhfa.gov/hpi/download/monthly/hpi_at_metro.csv",
  ];

  for (const url of urls) {
    console.log(`   Trying: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 Portland-Dashboard/1.0",
          "Accept": "text/csv,*/*",
        },
      });

      if (!res.ok) {
        console.log(`   HTTP ${res.status}, trying next...`);
        continue;
      }

      const text = await res.text();
      console.log(`   Downloaded ${(text.length / 1024).toFixed(0)} KB`);

      const rows = parseDelimited(text);
      console.log(`   Total rows: ${rows.length}`);
      console.log(`   Headers: ${Object.keys(rows[0] ?? {}).join(", ")}`);

      // Filter for Portland MSA (CBSA 38900)
      // Try different column name patterns
      const portlandRows = rows.filter((r) => {
        const cbsa = r.cbsa ?? r.CBSA ?? r.metro ?? r.fips ?? "";
        const name = r.metro_name ?? r.MSA ?? r.Name ?? r.name ?? "";
        return cbsa === "38900" || name.toLowerCase().includes("portland");
      });

      console.log(`   Portland MSA rows: ${portlandRows.length}`);

      if (portlandRows.length > 0) {
        console.log(`   Sample row: ${JSON.stringify(portlandRows[0])}`);
      }

      return portlandRows;
    } catch (err: any) {
      console.error(`   Error: ${err.message}`);
    }
  }

  console.log("   Could not download FHFA data from any URL");
  return [];
}

// ── 2. Redfin Market Tracker ────────────────────────────────────────────

async function fetchRedfin(): Promise<any[]> {
  console.log("\n=== Redfin Market Tracker ===");

  // Try multiple Portland ZIP codes
  const zipCodes = ["97201", "97204", "97205", "97209", "97210", "97214", "97215"];
  const allData: any[] = [];

  for (const zip of zipCodes) {
    const url = `https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/zip_code/tsvs/market_tracker_zip-${zip}.tsv`;
    console.log(`   Trying ZIP ${zip}...`);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 Portland-Dashboard/1.0" },
      });

      if (!res.ok) {
        console.log(`   HTTP ${res.status} for ZIP ${zip}`);
        continue;
      }

      const text = await res.text();
      const rows = parseDelimited(text, "\t");
      console.log(`   ZIP ${zip}: ${rows.length} rows`);

      if (rows.length > 0) {
        console.log(`   Sample headers: ${Object.keys(rows[0]).slice(0, 10).join(", ")}`);
      }

      for (const r of rows) {
        allData.push({ ...r, zip_code: zip });
      }
    } catch (err: any) {
      console.error(`   ZIP ${zip} error: ${err.message}`);
    }
  }

  // Also try city-level
  const cityUrl = "https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/city/tsvs/market_tracker_city-Portland_OR.tsv";
  console.log(`   Trying city-level Portland...`);
  try {
    const res = await fetch(cityUrl, {
      headers: { "User-Agent": "Mozilla/5.0 Portland-Dashboard/1.0" },
    });
    if (res.ok) {
      const text = await res.text();
      const rows = parseDelimited(text, "\t");
      console.log(`   City-level: ${rows.length} rows`);
      for (const r of rows) {
        allData.push({ ...r, zip_code: "city" });
      }
    } else {
      console.log(`   HTTP ${res.status} for city-level`);
    }
  } catch (err: any) {
    console.error(`   City-level error: ${err.message}`);
  }

  console.log(`   Total Redfin records: ${allData.length}`);
  return allData;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Housing & Economic Data Fetch ===");

  const [fhfaData, redfinData] = await Promise.all([fetchFHFA(), fetchRedfin()]);

  // Save JSON
  console.log("\n=== Saving JSON ===");

  if (fhfaData.length > 0) {
    fs.writeFileSync(
      path.join(DATA_DIR, "fhfa_hpi_portland.json"),
      JSON.stringify(fhfaData, null, 2)
    );
    console.log(`   Saved fhfa_hpi_portland.json (${fhfaData.length} records)`);
  }

  if (redfinData.length > 0) {
    fs.writeFileSync(
      path.join(DATA_DIR, "redfin_portland.json"),
      JSON.stringify(redfinData, null, 2)
    );
    console.log(`   Saved redfin_portland.json (${redfinData.length} records)`);
  }

  // Insert into PostgreSQL
  console.log("\n=== Inserting into PostgreSQL ===");
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS housing`);

    // FHFA HPI table
    if (fhfaData.length > 0) {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS housing.fhfa_hpi (
          id          SERIAL PRIMARY KEY,
          cbsa        TEXT,
          metro_name  TEXT,
          year        INTEGER,
          quarter     INTEGER,
          hpi         NUMERIC(10,2),
          hpi_change  NUMERIC(10,4),
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (cbsa, year, quarter)
        )
      `);

      await sql.unsafe(`TRUNCATE housing.fhfa_hpi RESTART IDENTITY`);

      let hpiCount = 0;
      for (const r of fhfaData) {
        // Try to find the right column names
        const cbsa = r.cbsa ?? r.CBSA ?? r.fips ?? "38900";
        const name = r.metro_name ?? r.MSA ?? r.Name ?? r.name ?? "Portland";
        const year = parseInt(r.yr ?? r.Year ?? r.year ?? "0");
        const quarter = parseInt(r.qtr ?? r.Quarter ?? r.quarter ?? r.period ?? "0");
        const hpi = parseFloat(r.index_nsa ?? r.HPI ?? r.hpi ?? r.index ?? "0");
        const change = parseFloat(r.index_nsa_change ?? r.change ?? "0");

        if (!year || isNaN(hpi)) continue;

        try {
          await sql`
            INSERT INTO housing.fhfa_hpi (cbsa, metro_name, year, quarter, hpi, hpi_change)
            VALUES (${cbsa}, ${name}, ${year}, ${quarter || 0}, ${hpi || 0}, ${change || 0})
            ON CONFLICT (cbsa, year, quarter) DO NOTHING
          `;
          hpiCount++;
        } catch { /* skip */ }
      }
      console.log(`   Inserted ${hpiCount} FHFA HPI records`);
    }

    // Redfin market data table
    if (redfinData.length > 0) {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS housing.redfin_market (
          id              SERIAL PRIMARY KEY,
          zip_code        TEXT,
          period_begin    DATE,
          period_end      DATE,
          period_duration TEXT,
          median_sale_price NUMERIC(12,2),
          median_ppsf     NUMERIC(10,2),
          homes_sold      INTEGER,
          new_listings    INTEGER,
          inventory       INTEGER,
          days_on_market  INTEGER,
          avg_sale_to_list NUMERIC(6,4),
          sold_above_list_pct NUMERIC(6,4),
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);

      await sql.unsafe(`TRUNCATE housing.redfin_market RESTART IDENTITY`);

      let redfinCount = 0;
      for (const r of redfinData) {
        const periodBegin = r.period_begin ?? r.period_start ?? null;
        const periodEnd = r.period_end ?? null;
        const medianPrice = parseFloat(r.median_sale_price ?? r.median_sale_price_adjusted ?? "0");
        const medianPpsf = parseFloat(r.median_ppsf ?? r.median_sale_ppsf ?? "0");
        const homesSold = parseInt(r.homes_sold ?? "0");
        const newListings = parseInt(r.new_listings ?? r.new_listings_adjusted ?? "0");
        const inventory = parseInt(r.inventory ?? r.active_listings ?? "0");
        const dom = parseInt(r.median_dom ?? r.days_on_market ?? r.avg_days_on_market ?? "0");
        const saleToList = parseFloat(r.avg_sale_to_list ?? r.sale_to_list_ratio ?? "0");
        const aboveList = parseFloat(r.sold_above_list ?? r.pct_sold_above_list ?? "0");

        if (!periodBegin) continue;

        try {
          await sql`
            INSERT INTO housing.redfin_market (
              zip_code, period_begin, period_end, period_duration,
              median_sale_price, median_ppsf, homes_sold, new_listings,
              inventory, days_on_market, avg_sale_to_list, sold_above_list_pct
            ) VALUES (
              ${r.zip_code}, ${periodBegin}::date, ${periodEnd}::date,
              ${r.period_duration ?? null},
              ${medianPrice || null}, ${medianPpsf || null},
              ${homesSold || null}, ${newListings || null},
              ${inventory || null}, ${dom || null},
              ${saleToList || null}, ${aboveList || null}
            )
          `;
          redfinCount++;
        } catch { /* skip */ }

        if (redfinCount % 500 === 0 && redfinCount > 0) {
          console.log(`   ... ${redfinCount} Redfin records inserted`);
        }
      }
      console.log(`   Inserted ${redfinCount} Redfin market records`);
    }

    // Cache summary
    const cacheSummary = {
      fhfa_hpi_count: fhfaData.length,
      redfin_count: redfinData.length,
      sources: [
        fhfaData.length > 0 ? "FHFA House Price Index" : null,
        redfinData.length > 0 ? "Redfin Market Tracker" : null,
      ].filter(Boolean),
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('housing_market', ${sql.json(cacheSummary)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(cacheSummary)}, updated_at = now()
    `;

    // Verify
    try {
      const hpiV = await sql`SELECT count(*)::int as cnt FROM housing.fhfa_hpi`;
      console.log(`   Verify: housing.fhfa_hpi = ${hpiV[0].cnt} rows`);
    } catch { /* table may not exist */ }
    try {
      const rfV = await sql`SELECT count(*)::int as cnt FROM housing.redfin_market`;
      console.log(`   Verify: housing.redfin_market = ${rfV[0].cnt} rows`);
    } catch { /* table may not exist */ }

    await sql.end();
  } catch (err: any) {
    console.error(`   DB error: ${err.message}`);
    await sql.end();
  }

  console.log("\n=== Housing & Economic Data fetch complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
