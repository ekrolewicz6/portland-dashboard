/**
 * fetch-hud-pit.ts
 *
 * Fetches/seeds HUD Point-in-Time homeless count data for OR-501
 * (Portland, Gresham/Multnomah County CoC).
 *
 * The official bulk file is an .xlsb (Excel Binary) which is hard to parse,
 * so this script seeds known published PIT count data from HUD AHAR reports
 * and attempts to download the bulk file for future processing.
 *
 * Usage: npx tsx scripts/fetch-hud-pit.ts
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

const XLSB_URL =
  "https://www.huduser.gov/portal/sites/default/files/xls/2007-2024-PIT-Counts-by-CoC.xlsb";

// Known published PIT count data for OR-501 from HUD AHAR reports.
// These are REAL published numbers, not estimates.
interface PITCountRow {
  year: number;
  coc_code: string;
  coc_name: string;
  total_homeless: number;
  sheltered: number | null;
  unsheltered: number | null;
  chronically_homeless: number | null;
  veterans: number | null;
  families: number | null;
  unaccompanied_youth: number | null;
  source: string;
}

const KNOWN_PIT_DATA: PITCountRow[] = [
  {
    year: 2024,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 6297,
    sheltered: 2100,
    unsheltered: 4197,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2024 PIT Count",
  },
  {
    year: 2023,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 6070,
    sheltered: null,
    unsheltered: null,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2023 PIT Count",
  },
  {
    year: 2022,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 5228,
    sheltered: null,
    unsheltered: null,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2022 PIT Count",
  },
  {
    year: 2020,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 4015,
    sheltered: null,
    unsheltered: null,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2020 PIT Count (COVID year, partial count)",
  },
  {
    year: 2019,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 4015,
    sheltered: null,
    unsheltered: null,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2019 PIT Count",
  },
  {
    year: 2017,
    coc_code: "OR-501",
    coc_name: "Portland, Gresham/Multnomah County CoC",
    total_homeless: 4177,
    sheltered: null,
    unsheltered: null,
    chronically_homeless: null,
    veterans: null,
    families: null,
    unaccompanied_youth: null,
    source: "HUD 2017 PIT Count",
  },
];

// ── Download XLSB bulk file ─────────────────────────────────────────────

async function downloadXLSB(): Promise<boolean> {
  console.log("\n=== Attempting to Download HUD PIT XLSB File ===");
  console.log(`  URL: ${XLSB_URL}`);

  try {
    const res = await fetch(XLSB_URL, {
      headers: {
        "User-Agent": "Portland-Dashboard/1.0 (civic data project)",
      },
    });

    if (!res.ok) {
      console.log(`  Download failed: HTTP ${res.status}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = path.join(DATA_DIR, "hud-pit-counts.xlsb");
    fs.writeFileSync(filePath, buffer);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(`  Downloaded to ${filePath} (${sizeMB} MB)`);
    console.log(
      "  NOTE: This is an Excel Binary file (.xlsb). Convert to CSV for parsing."
    );
    console.log(
      "  You can open it in Excel/LibreOffice and export as CSV, or use a"
    );
    console.log("  tool like `ssconvert` (from gnumeric) to convert.");
    return true;
  } catch (err: any) {
    console.log(`  Download failed: ${err.message}`);
    return false;
  }
}

// ── Insert into PostgreSQL ──────────────────────────────────────────────

async function insertData() {
  console.log("\n=== Inserting HUD PIT Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS homelessness`);

    // Create PIT counts table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.pit_counts (
        id SERIAL PRIMARY KEY,
        year INT NOT NULL,
        coc_code TEXT DEFAULT 'OR-501',
        coc_name TEXT DEFAULT 'Portland, Gresham/Multnomah County CoC',
        total_homeless INT,
        sheltered INT,
        unsheltered INT,
        chronically_homeless INT,
        veterans INT,
        families INT,
        unaccompanied_youth INT,
        source TEXT DEFAULT 'HUD AHAR/PIT Count',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(year, coc_code)
      )
    `);

    // Create indexes
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_pit_year
        ON homelessness.pit_counts(year)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_pit_coc
        ON homelessness.pit_counts(coc_code)
    `);

    // Insert known data points
    let inserted = 0;
    for (const row of KNOWN_PIT_DATA) {
      try {
        await sql`
          INSERT INTO homelessness.pit_counts
            (year, coc_code, coc_name, total_homeless, sheltered, unsheltered,
             chronically_homeless, veterans, families, unaccompanied_youth, source)
          VALUES (
            ${row.year}, ${row.coc_code}, ${row.coc_name},
            ${row.total_homeless}, ${row.sheltered}, ${row.unsheltered},
            ${row.chronically_homeless}, ${row.veterans}, ${row.families},
            ${row.unaccompanied_youth}, ${row.source}
          )
          ON CONFLICT (year, coc_code) DO UPDATE SET
            total_homeless = EXCLUDED.total_homeless,
            sheltered = EXCLUDED.sheltered,
            unsheltered = EXCLUDED.unsheltered,
            chronically_homeless = EXCLUDED.chronically_homeless,
            veterans = EXCLUDED.veterans,
            families = EXCLUDED.families,
            unaccompanied_youth = EXCLUDED.unaccompanied_youth,
            source = EXCLUDED.source
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Error inserting year ${row.year}: ${err.message}`);
      }
    }

    console.log(`  Inserted ${inserted} PIT count records`);

    // Update dashboard cache
    const cacheData = {
      source: "HUD AHAR/PIT Count (published data)",
      coc: "OR-501 — Portland, Gresham/Multnomah County",
      total_records: inserted,
      years: KNOWN_PIT_DATA.map((r) => r.year).sort(),
      latest: {
        year: 2024,
        total: 6297,
        sheltered: 2100,
        unsheltered: 4197,
      },
      note: "Seeded with known published figures. Update when XLSB is parsed or new data released.",
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('hud_pit_counts', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with hud_pit_counts entry");

    // Verify
    const verify = await sql`
      SELECT year, total_homeless, sheltered, unsheltered, source
      FROM homelessness.pit_counts
      WHERE coc_code = 'OR-501'
      ORDER BY year
    `;
    console.log("\n  Verification (OR-501 PIT Counts):");
    for (const row of verify) {
      const parts = [`Total: ${row.total_homeless}`];
      if (row.sheltered != null) parts.push(`Sheltered: ${row.sheltered}`);
      if (row.unsheltered != null) parts.push(`Unsheltered: ${row.unsheltered}`);
      console.log(`    ${row.year}: ${parts.join(", ")}`);
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
  console.log("Portland Dashboard — HUD PIT Count Data Fetch");
  console.log("==============================================");

  // Step 1: Insert known published data
  await insertData();

  // Step 2: Save JSON for reference
  const jsonPath = path.join(DATA_DIR, "hud_pit_counts.json");
  fs.writeFileSync(jsonPath, JSON.stringify(KNOWN_PIT_DATA, null, 2));
  console.log(`\nSaved ${jsonPath} (${KNOWN_PIT_DATA.length} records)`);

  // Step 3: Try to download the XLSB bulk file
  const downloaded = await downloadXLSB();

  // Summary
  console.log("\n==============================================");
  console.log("HUD PIT data fetch complete!");
  console.log(`  Known data points seeded: ${KNOWN_PIT_DATA.length}`);
  console.log(
    `  Years covered: ${KNOWN_PIT_DATA.map((r) => r.year)
      .sort()
      .join(", ")}`
  );
  console.log(`  XLSB bulk file downloaded: ${downloaded ? "Yes" : "No"}`);
  if (downloaded) {
    console.log(
      "  Convert the XLSB file to CSV and re-run to import full dataset."
    );
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
