/**
 * fetch-education.ts
 *
 * Creates education schema/tables for Portland Public Schools data and
 * attempts to download enrollment XLSX from Oregon Dept of Education.
 *
 * Data sources:
 *   - ODE Enrollment: https://www.oregon.gov/ode/reports-and-data/students/Documents/fallmembershipreport_YYYYYYYY.xlsx
 *   - ODE Graduation Rates: https://www.oregon.gov/ode/reports-and-data/students/pages/cohort-graduation-rate.aspx
 *   - ODE Test Scores (OSAS): https://www.oregon.gov/ode/educator-resources/assessment/pages/assessment-group-reports.aspx
 *
 * Usage: npx tsx scripts/fetch-education.ts
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

// ODE XLSX download URLs (pattern: fallmembershipreport_YYYYYYYY.xlsx)
const ENROLLMENT_URLS = [
  {
    schoolYear: "2025-26",
    url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/fallmembershipreport_20252026.xlsx",
  },
  {
    schoolYear: "2024-25",
    url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/fallmembershipreport_20242025.xlsx",
  },
  {
    schoolYear: "2023-24",
    url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/fallmembershipreport_20232024.xlsx",
  },
];

// ── Create Schema and Tables ─────────────────────────────────────────────

async function createTables(sql: ReturnType<typeof postgres>) {
  console.log("\n=== Creating Education Schema & Tables ===");

  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS education`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS education.enrollment (
      id SERIAL PRIMARY KEY,
      school_year TEXT NOT NULL,
      district_name TEXT DEFAULT 'Portland SD 1J',
      grade_level TEXT,
      enrollment INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(school_year, grade_level)
    )
  `);
  console.log("  Created education.enrollment");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS education.graduation_rates (
      id SERIAL PRIMARY KEY,
      school_year TEXT NOT NULL,
      district_name TEXT DEFAULT 'Portland SD 1J',
      cohort_rate_4yr NUMERIC(5,2),
      cohort_rate_5yr NUMERIC(5,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(school_year)
    )
  `);
  console.log("  Created education.graduation_rates");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS education.test_scores (
      id SERIAL PRIMARY KEY,
      school_year TEXT NOT NULL,
      district_name TEXT DEFAULT 'Portland SD 1J',
      subject TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      proficiency_pct NUMERIC(5,2),
      participation_pct NUMERIC(5,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(school_year, subject, grade_level)
    )
  `);
  console.log("  Created education.test_scores");

  // Create indexes
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS idx_enrollment_year
      ON education.enrollment(school_year)
  `);
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS idx_graduation_year
      ON education.graduation_rates(school_year)
  `);
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS idx_test_scores_year_subject
      ON education.test_scores(school_year, subject)
  `);
  console.log("  Created indexes");
}

// ── Attempt XLSX Downloads ───────────────────────────────────────────────

async function attemptXlsxDownloads(): Promise<string[]> {
  console.log("\n=== Attempting ODE XLSX Downloads ===");
  const downloadedFiles: string[] = [];

  for (const { schoolYear, url } of ENROLLMENT_URLS) {
    const filename = `ode_enrollment_${schoolYear.replace("-", "_")}.xlsx`;
    const filePath = path.join(DATA_DIR, filename);

    try {
      console.log(`  Fetching enrollment ${schoolYear}: ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Portland-Dashboard/1.0",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        console.log(`    HTTP ${res.status} — skipping ${schoolYear}`);
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      // Verify we got an actual XLSX, not an HTML error page
      if (
        contentType.includes("html") ||
        contentType.includes("text/plain")
      ) {
        console.log(`    Got ${contentType} instead of XLSX — skipping`);
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1000) {
        console.log(`    File too small (${buffer.length} bytes) — likely error page`);
        continue;
      }

      fs.writeFileSync(filePath, buffer);
      downloadedFiles.push(filePath);
      console.log(`    Saved ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err: any) {
      console.log(`    Download failed for ${schoolYear}: ${err.message}`);
    }
  }

  return downloadedFiles;
}

// ── Print Manual Instructions ────────────────────────────────────────────

function printManualInstructions(downloadedFiles: string[]) {
  console.log("\n====================================================");
  console.log("  EDUCATION DATA — MANUAL STEPS");
  console.log("====================================================");

  if (downloadedFiles.length > 0) {
    console.log(`\n  Downloaded ${downloadedFiles.length} XLSX file(s):`);
    for (const f of downloadedFiles) {
      console.log(`    - ${f}`);
    }
    console.log(
      "\n  To parse these XLSX files, install a library like 'xlsx' or 'exceljs':"
    );
    console.log("    npm install xlsx");
    console.log(
      "  Then filter for district_name = 'Portland SD 1J' and insert into education.enrollment."
    );
  } else {
    console.log("\n  No XLSX files could be downloaded automatically.");
  }

  console.log("\n  --- Enrollment Data ---");
  console.log("  Download manually from:");
  console.log(
    "    https://www.oregon.gov/ode/reports-and-data/students/pages/fall-membership.aspx"
  );
  console.log(
    "  Look for 'Fall Membership Report' links (XLSX). Filter for 'Portland SD 1J'."
  );

  console.log("\n  --- Graduation Rates ---");
  console.log("  Download from:");
  console.log(
    "    https://www.oregon.gov/ode/reports-and-data/students/pages/cohort-graduation-rate.aspx"
  );
  console.log("  Look for 'Cohort Graduation Rate' files. Filter for Portland SD 1J.");

  console.log("\n  --- Test Scores (OSAS) ---");
  console.log("  Download from:");
  console.log(
    "    https://www.oregon.gov/ode/educator-resources/assessment/pages/assessment-group-reports.aspx"
  );
  console.log(
    "  Look for 'Assessment Group Reports' or 'OSAS Results'. Filter for Portland SD 1J."
  );

  console.log("\n  --- Example SQL to insert data ---");
  console.log(`
    INSERT INTO education.enrollment (school_year, grade_level, enrollment)
    VALUES ('2025-26', 'Total', 45000)
    ON CONFLICT (school_year, grade_level) DO UPDATE
      SET enrollment = EXCLUDED.enrollment;

    INSERT INTO education.graduation_rates (school_year, cohort_rate_4yr, cohort_rate_5yr)
    VALUES ('2023-24', 82.0, 85.0)
    ON CONFLICT (school_year) DO UPDATE
      SET cohort_rate_4yr = EXCLUDED.cohort_rate_4yr,
          cohort_rate_5yr = EXCLUDED.cohort_rate_5yr;

    INSERT INTO education.test_scores (school_year, subject, grade_level, proficiency_pct, participation_pct)
    VALUES ('2023-24', 'ELA', '3rd Grade', 45.0, 95.0)
    ON CONFLICT (school_year, subject, grade_level) DO UPDATE
      SET proficiency_pct = EXCLUDED.proficiency_pct,
          participation_pct = EXCLUDED.participation_pct;
  `);

  console.log("====================================================\n");
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Education Data Fetch");
  console.log("==========================================");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Step 1: Create schema and tables
    await createTables(sql);

    // Step 2: Attempt to download XLSX files from ODE
    const downloadedFiles = await attemptXlsxDownloads();

    // Step 3: Update dashboard cache with metadata
    const cacheData = {
      source: "Oregon Department of Education",
      tables_created: [
        "education.enrollment",
        "education.graduation_rates",
        "education.test_scores",
      ],
      xlsx_downloaded: downloadedFiles.length,
      xlsx_files: downloadedFiles,
      notes:
        "Tables created and ready for data. XLSX files require parsing with a library like 'xlsx' or manual data entry.",
      manual_sources: {
        enrollment:
          "https://www.oregon.gov/ode/reports-and-data/students/pages/fall-membership.aspx",
        graduation_rates:
          "https://www.oregon.gov/ode/reports-and-data/students/pages/cohort-graduation-rate.aspx",
        test_scores:
          "https://www.oregon.gov/ode/educator-resources/assessment/pages/assessment-group-reports.aspx",
      },
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('education_ode', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("\n  Updated dashboard_cache with education_ode entry");

    // Step 4: Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'education'
      ORDER BY table_name
    `;
    console.log("\n  Verified education tables:");
    for (const t of tables) {
      console.log(`    - education.${t.table_name}`);
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }

  // Step 5: Print manual instructions
  const downloadedFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("ode_enrollment_") && f.endsWith(".xlsx"))
    .map((f) => path.join(DATA_DIR, f));
  printManualInstructions(downloadedFiles);

  console.log("==========================================");
  console.log("Education data setup complete!");
  console.log("  - Schema 'education' created");
  console.log("  - 3 tables ready for data");
  console.log("  - See instructions above for data population");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
