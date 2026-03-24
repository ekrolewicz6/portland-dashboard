/**
 * fetch-library.ts
 *
 * Fetches Oregon Public Library Statistics from data.oregon.gov (Socrata)
 * for Multnomah County Library and inserts into PostgreSQL.
 *
 * Dataset: https://data.oregon.gov/d/8zw7-zgjw
 * Socrata API: https://data.oregon.gov/resource/8zw7-zgjw.json
 *
 * Usage: npx tsx scripts/fetch-library.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
fs.mkdirSync(DATA_DIR, { recursive: true });

const SOCRATA_BASE = "https://data.oregon.gov/resource/8zw7-zgjw.json";

async function fetchJson(url: string): Promise<any> {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// ── Discover field names ─────────────────────────────────────────────────

async function discoverFields(): Promise<Record<string, string>> {
  console.log("\n=== Discovering Socrata Field Names ===");

  const sample = await fetchJson(`${SOCRATA_BASE}?$limit=1`);
  if (!Array.isArray(sample) || sample.length === 0) {
    throw new Error("No data returned from Socrata API");
  }

  const fields = Object.keys(sample[0]);
  console.log(`  Found ${fields.length} fields:`);
  for (const f of fields) {
    const val = sample[0][f];
    const display =
      typeof val === "string" && val.length > 60
        ? val.slice(0, 60) + "..."
        : val;
    console.log(`    ${f}: ${display}`);
  }

  return sample[0];
}

// ── Field name mapping ───────────────────────────────────────────────────
// Socrata field names may vary. We'll try common patterns.

interface FieldMap {
  fiscalYear: string;
  libraryName: string;
  visits: string;
  circulation: string;
  programs: string;
  programAttendance: string;
  registeredUsers: string;
  staffFte: string;
  totalRevenue: string;
  totalExpenditures: string;
}

function guessFieldMap(sampleRecord: Record<string, any>): FieldMap {
  const keys = Object.keys(sampleRecord);
  const lower = keys.map((k) => k.toLowerCase());

  function find(...patterns: string[]): string {
    for (const pat of patterns) {
      const idx = lower.findIndex((k) => k.includes(pat));
      if (idx >= 0) return keys[idx];
    }
    return "";
  }

  const map: FieldMap = {
    fiscalYear: find("fiscal_year", "fiscal", "year", "reporting_period"),
    libraryName: find("library_name", "library", "name"),
    visits: find("visits", "visit", "library_visits"),
    circulation: find("circulation", "circ", "total_circulation"),
    programs: find("programs", "program_total", "total_programs", "number_of_programs"),
    programAttendance: find(
      "program_attendance",
      "attendance",
      "total_program_attendance"
    ),
    registeredUsers: find(
      "registered_users",
      "registered_borrowers",
      "borrowers",
      "cardholders"
    ),
    staffFte: find("staff_fte", "total_staff", "fte", "staff"),
    totalRevenue: find(
      "total_revenue",
      "total_operating_revenue",
      "revenue",
      "operating_revenue"
    ),
    totalExpenditures: find(
      "total_expenditures",
      "total_operating_expenditures",
      "expenditures",
      "operating_expenditures"
    ),
  };

  console.log("\n  Field mapping:");
  for (const [label, field] of Object.entries(map)) {
    console.log(`    ${label}: ${field || "(not found)"}`);
  }

  return map;
}

// ── Fetch library data ───────────────────────────────────────────────────

interface LibraryRow {
  fiscal_year: string;
  library_name: string;
  visits: number | null;
  circulation: number | null;
  programs: number | null;
  program_attendance: number | null;
  registered_users: number | null;
  staff_fte: number | null;
  total_revenue: number | null;
  total_expenditures: number | null;
}

function parseNum(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

async function fetchLibraryData(fieldMap: FieldMap): Promise<LibraryRow[]> {
  console.log("\n=== Fetching Multnomah County Library Data ===");

  // Try multiple query strategies since field names may vary
  const queries = [
    `${SOCRATA_BASE}?$where=${fieldMap.libraryName} like '%Multnomah%'&$limit=200`,
    `${SOCRATA_BASE}?$where=${fieldMap.libraryName} like '%MULTNOMAH%'&$limit=200`,
    `${SOCRATA_BASE}?$q=Multnomah&$limit=200`,
  ];

  let rawData: any[] = [];
  for (const url of queries) {
    try {
      const data = await fetchJson(url);
      if (Array.isArray(data) && data.length > 0) {
        rawData = data;
        console.log(`  Got ${data.length} records`);
        break;
      }
      console.log(`  No results from query, trying next...`);
    } catch (err: any) {
      console.log(`  Query failed: ${err.message}, trying next...`);
    }
  }

  if (rawData.length === 0) {
    console.log("  WARNING: No Multnomah County data found. Fetching all records for inspection...");
    try {
      rawData = await fetchJson(`${SOCRATA_BASE}?$limit=5`);
      if (rawData.length > 0) {
        console.log("  Sample library names in dataset:");
        const nameField = fieldMap.libraryName;
        const names = new Set(rawData.map((r: any) => r[nameField]));
        for (const n of names) {
          console.log(`    - ${n}`);
        }
      }
    } catch (err: any) {
      console.log(`  Sample fetch also failed: ${err.message}`);
    }
    return [];
  }

  const rows: LibraryRow[] = rawData.map((r: any) => ({
    fiscal_year: String(r[fieldMap.fiscalYear] || "unknown"),
    library_name: String(r[fieldMap.libraryName] || "unknown"),
    visits: parseNum(r[fieldMap.visits]),
    circulation: parseNum(r[fieldMap.circulation]),
    programs: parseNum(r[fieldMap.programs]),
    program_attendance: parseNum(r[fieldMap.programAttendance]),
    registered_users: parseNum(r[fieldMap.registeredUsers]),
    staff_fte: parseNum(r[fieldMap.staffFte]),
    total_revenue: parseNum(r[fieldMap.totalRevenue]),
    total_expenditures: parseNum(r[fieldMap.totalExpenditures]),
  }));

  return rows;
}

// ── Insert into PostgreSQL ───────────────────────────────────────────────

async function insertData(rows: LibraryRow[]) {
  console.log("\n=== Inserting Library Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema and table
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quality.library_stats (
        id SERIAL PRIMARY KEY,
        fiscal_year TEXT NOT NULL,
        library_name TEXT NOT NULL,
        visits INT,
        circulation INT,
        programs INT,
        program_attendance INT,
        registered_users INT,
        staff_fte NUMERIC(8,2),
        total_revenue NUMERIC(14,2),
        total_expenditures NUMERIC(14,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(fiscal_year, library_name)
      )
    `);
    console.log("  Created quality.library_stats");

    // Create indexes
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_library_stats_year
        ON quality.library_stats(fiscal_year)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_library_stats_name
        ON quality.library_stats(library_name)
    `);

    // Upsert rows
    let inserted = 0;
    for (const row of rows) {
      try {
        await sql`
          INSERT INTO quality.library_stats
            (fiscal_year, library_name, visits, circulation, programs,
             program_attendance, registered_users, staff_fte,
             total_revenue, total_expenditures)
          VALUES (
            ${row.fiscal_year}, ${row.library_name},
            ${row.visits}, ${row.circulation}, ${row.programs},
            ${row.program_attendance}, ${row.registered_users},
            ${row.staff_fte}, ${row.total_revenue}, ${row.total_expenditures}
          )
          ON CONFLICT (fiscal_year, library_name) DO UPDATE SET
            visits = EXCLUDED.visits,
            circulation = EXCLUDED.circulation,
            programs = EXCLUDED.programs,
            program_attendance = EXCLUDED.program_attendance,
            registered_users = EXCLUDED.registered_users,
            staff_fte = EXCLUDED.staff_fte,
            total_revenue = EXCLUDED.total_revenue,
            total_expenditures = EXCLUDED.total_expenditures
        `;
        inserted++;
      } catch (err: any) {
        console.log(
          `  Error inserting ${row.fiscal_year}/${row.library_name}: ${err.message}`
        );
      }
    }
    console.log(`  Inserted/updated ${inserted} library rows`);

    // Build summary for cache
    const years = [...new Set(rows.map((r) => r.fiscal_year))].sort();
    const latestYear = years[years.length - 1];
    const latestRows = rows.filter((r) => r.fiscal_year === latestYear);
    const latestVisits = latestRows.reduce(
      (sum, r) => sum + (r.visits ?? 0),
      0
    );
    const latestCirc = latestRows.reduce(
      (sum, r) => sum + (r.circulation ?? 0),
      0
    );

    const cacheData = {
      source: "Oregon State Library / data.oregon.gov (Socrata)",
      dataset_id: "8zw7-zgjw",
      total_rows: rows.length,
      fiscal_years: years,
      latest_year: latestYear,
      latest_summary: {
        total_visits: latestVisits,
        total_circulation: latestCirc,
        branches: latestRows.length,
      },
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('library_stats', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with library_stats entry");

    // Verify
    const verify = await sql`
      SELECT fiscal_year, count(*)::int as cnt,
             sum(visits)::int as total_visits,
             sum(circulation)::int as total_circ
      FROM quality.library_stats
      GROUP BY fiscal_year
      ORDER BY fiscal_year
    `;
    console.log("\n  Verification by fiscal year:");
    for (const row of verify) {
      console.log(
        `    ${row.fiscal_year}: ${row.cnt} row(s), ` +
          `visits=${(row.total_visits ?? 0).toLocaleString()}, ` +
          `circulation=${(row.total_circ ?? 0).toLocaleString()}`
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
  console.log("Portland Dashboard — Library Statistics Fetch");
  console.log("==============================================");

  // Step 1: Discover field names from the Socrata dataset
  const sampleRecord = await discoverFields();
  const fieldMap = guessFieldMap(sampleRecord);

  if (!fieldMap.libraryName || !fieldMap.fiscalYear) {
    console.error(
      "ERROR: Could not identify library_name or fiscal_year fields in dataset."
    );
    console.log("  Available fields:", Object.keys(sampleRecord).join(", "));
    console.log(
      "  Please check the dataset at https://data.oregon.gov/d/8zw7-zgjw"
    );
    process.exit(1);
  }

  // Step 2: Fetch library data for Multnomah County
  const rows = await fetchLibraryData(fieldMap);

  if (rows.length === 0) {
    console.log(
      "\nWARNING: No Multnomah County library data found. Creating tables only."
    );
    // Still create the table
    const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });
    try {
      await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS quality.library_stats (
          id SERIAL PRIMARY KEY,
          fiscal_year TEXT NOT NULL,
          library_name TEXT NOT NULL,
          visits INT,
          circulation INT,
          programs INT,
          program_attendance INT,
          registered_users INT,
          staff_fte NUMERIC(8,2),
          total_revenue NUMERIC(14,2),
          total_expenditures NUMERIC(14,2),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(fiscal_year, library_name)
        )
      `);
      console.log("  Created quality.library_stats table (empty)");
      await sql.end();
    } catch (err: any) {
      console.error("  Database error:", err.message);
      await sql.end();
    }
    console.log(
      "\n  Try browsing the dataset manually at: https://data.oregon.gov/d/8zw7-zgjw"
    );
    process.exit(0);
  }

  // Save JSON
  const jsonPath = path.join(DATA_DIR, "library_stats.json");
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
  console.log(`\nSaved ${jsonPath} (${rows.length} rows)`);

  // Step 3: Insert into database
  await insertData(rows);

  console.log("\n==============================================");
  console.log("Library statistics fetch complete!");
  console.log(`  Total rows: ${rows.length}`);
  console.log(
    `  Fiscal years: ${[...new Set(rows.map((r) => r.fiscal_year))].sort().join(", ")}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
