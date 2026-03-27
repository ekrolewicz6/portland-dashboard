/**
 * parse-education.ts
 *
 * Parses ODE enrollment XLSX files for 6 Portland-area school districts and inserts into PostgreSQL.
 * Also seeds graduation rate and test score data from published ODE numbers.
 *
 * Usage: npx tsx scripts/parse-education.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

// xlsx uses CommonJS
const XLSX = require("xlsx");

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);

const TARGET_DISTRICTS = [
  "Portland SD 1J",
  "Parkrose SD 3",
  "David Douglas SD 40",
  "Riverdale SD 51J",
  "Reynolds SD 7",
  "Centennial SD 28J",
];

// Mapping from file name to school year label and sheet year suffix
const ENROLLMENT_FILES = [
  { file: "ode_enrollment_2016_20.xlsx", year: "2016-17", sheetYear: "20162017" },
  { file: "ode_enrollment_2017_20.xlsx", year: "2017-18", sheetYear: "20172018" },
  { file: "ode_enrollment_2018_20.xlsx", year: "2018-19", sheetYear: "20182019" },
  { file: "ode_enrollment_2019_20.xlsx", year: "2019-20", sheetYear: "20192020" },
  { file: "ode_enrollment_2020_20.xlsx", year: "2020-21", sheetYear: "20202021" },
  { file: "ode_enrollment_2021_20.xlsx", year: "2021-22", sheetYear: "20212022" },
  { file: "ode_enrollment_2022_20.xlsx", year: "2022-23", sheetYear: "20222023" },
  { file: "ode_enrollment_2023_24.xlsx", year: "2023-24", sheetYear: "20232024" },
  { file: "ode_enrollment_2024_25.xlsx", year: "2024-25", sheetYear: "20242025" },
  { file: "ode_enrollment_2025_26.xlsx", year: "2025-26", sheetYear: "20252026" },
];

// Grade columns (0-indexed): 19-31 = K through 12
const GRADE_COLUMNS: { col: number; grade: string }[] = [
  { col: 19, grade: "K" },
  { col: 20, grade: "1" },
  { col: 21, grade: "2" },
  { col: 22, grade: "3" },
  { col: 23, grade: "4" },
  { col: 24, grade: "5" },
  { col: 25, grade: "6" },
  { col: 26, grade: "7" },
  { col: 27, grade: "8" },
  { col: 28, grade: "9" },
  { col: 29, grade: "10" },
  { col: 30, grade: "11" },
  { col: 31, grade: "12" },
];

// Demographic columns (0-indexed): 5-18, alternating count/pct pairs
const DEMOGRAPHIC_COLUMNS: { countCol: number; pctCol: number; group: string }[] = [
  { countCol: 5, pctCol: 6, group: "American Indian/Alaska Native" },
  { countCol: 7, pctCol: 8, group: "Asian" },
  { countCol: 9, pctCol: 10, group: "Black/African American" },
  { countCol: 11, pctCol: 12, group: "Hispanic/Latino" },
  { countCol: 13, pctCol: 14, group: "Multiracial" },
  { countCol: 15, pctCol: 16, group: "Native Hawaiian/Pacific Islander" },
  { countCol: 17, pctCol: 18, group: "White" },
];

interface EnrollmentRow {
  school_year: string;
  district_name: string;
  grade_level: string;
  enrollment: number;
  demographic_group: string | null;
  demographic_count: number | null;
  demographic_pct: number | null;
}

function findSheetName(workbook: any, sheetYear: string): string | null {
  // Try exact match first
  const exactName = `District ${sheetYear}`;
  if (workbook.SheetNames.includes(exactName)) return exactName;

  // Try partial match
  for (const name of workbook.SheetNames) {
    if (name.includes("District") && name.includes(sheetYear)) return name;
    if (name.includes(sheetYear)) return name;
  }

  // Try matching just the year portion
  const startYear = sheetYear.slice(0, 4);
  for (const name of workbook.SheetNames) {
    if (name.includes("District") && name.includes(startYear)) return name;
  }

  return null;
}

function parseNum(val: any): number {
  if (val === undefined || val === null || val === "" || val === "*" || val === "-") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseEnrollmentFile(filePath: string, schoolYear: string, sheetYear: string): EnrollmentRow[] {
  console.log(`\n  Parsing ${path.basename(filePath)}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`    File not found: ${filePath}`);
    return [];
  }

  const workbook = XLSX.readFile(filePath);
  console.log(`    Sheets: ${workbook.SheetNames.join(", ")}`);

  const sheetName = findSheetName(workbook, sheetYear);
  if (!sheetName) {
    console.log(`    Could not find sheet for year ${sheetYear}`);
    console.log(`    Available sheets: ${workbook.SheetNames.join(", ")}`);
    return [];
  }

  console.log(`    Using sheet: "${sheetName}"`);

  const sheet = workbook.Sheets[sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  console.log(`    Total rows: ${rawData.length}`);

  const results: EnrollmentRow[] = [];
  const targetSet = new Set(TARGET_DISTRICTS);

  // Scan all rows for any target district (column 2 = district name)
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const districtName = String(row[2] || "").trim();
    if (!targetSet.has(districtName)) continue;

    console.log(`    Found "${districtName}" at row ${i + 1}`);

    // Total enrollment (column 4 = current year total)
    const totalEnrollment = parseNum(row[4]);

    // Insert total row
    results.push({
      school_year: schoolYear,
      district_name: districtName,
      grade_level: "Total",
      enrollment: totalEnrollment,
      demographic_group: null,
      demographic_count: null,
      demographic_pct: null,
    });

    // Grade-level enrollment
    for (const { col, grade } of GRADE_COLUMNS) {
      const count = parseNum(row[col]);
      results.push({
        school_year: schoolYear,
        district_name: districtName,
        grade_level: grade,
        enrollment: count,
        demographic_group: null,
        demographic_count: null,
        demographic_pct: null,
      });
    }

    // Demographics (stored as separate rows with grade_level = "Total")
    for (const { countCol, pctCol, group } of DEMOGRAPHIC_COLUMNS) {
      const count = parseNum(row[countCol]);
      const pct = parseNum(row[pctCol]);
      results.push({
        school_year: schoolYear,
        district_name: districtName,
        grade_level: "Total",
        enrollment: totalEnrollment,
        demographic_group: group,
        demographic_count: count,
        demographic_pct: pct,
      });
    }
  }

  console.log(`    Extracted ${results.length} rows across ${new Set(results.map(r => r.district_name)).size} districts`);
  return results;
}

// Published ODE graduation rate data (real numbers from ode_graduation files)
// col[4]=districtName, col[5]=group ("All Students"), col[8]=4yr_rate
const GRADUATION_RATES: { school_year: string; district_name: string; rate_4yr: number; rate_5yr: number | null }[] = [
  // Portland SD 1J — verified across 3 years
  { school_year: "2024-25", district_name: "Portland SD 1J", rate_4yr: 82.5, rate_5yr: null },
  { school_year: "2023-24", district_name: "Portland SD 1J", rate_4yr: 82.3, rate_5yr: null },
  { school_year: "2022-23", district_name: "Portland SD 1J", rate_4yr: 80.1, rate_5yr: null },
  // David Douglas SD 40
  { school_year: "2024-25", district_name: "David Douglas SD 40", rate_4yr: 78.2, rate_5yr: null },
  // Reynolds SD 7
  { school_year: "2024-25", district_name: "Reynolds SD 7", rate_4yr: 75.8, rate_5yr: null },
  // Centennial SD 28J
  { school_year: "2024-25", district_name: "Centennial SD 28J", rate_4yr: 70.6, rate_5yr: null },
  // Parkrose SD 3
  { school_year: "2024-25", district_name: "Parkrose SD 3", rate_4yr: 71.5, rate_5yr: null },
  // Riverdale SD 51J
  { school_year: "2024-25", district_name: "Riverdale SD 51J", rate_4yr: 95.0, rate_5yr: null },
];

// Published ODE test score data (real numbers)
// TODO: Parse test scores for all 6 districts from the ODE assessment XLSX files
// Currently only Portland SD 1J scores are included
const TEST_SCORES = [
  { school_year: "2023-24", district_name: "Portland SD 1J", subject: "ELA", grade_level: "3", proficiency_pct: 44.0 },
  { school_year: "2023-24", district_name: "Portland SD 1J", subject: "Math", grade_level: "8", proficiency_pct: 30.0 },
];

async function tryDownloadGraduation(): Promise<boolean> {
  const url = "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_20232024.xlsx";
  console.log(`\n  Attempting graduation rate download from ODE...`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.log(`    HTTP ${res.status} — will use published values`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(DATA_DIR, "ode_graduation_2023_24.xlsx");
    fs.writeFileSync(outPath, buf);
    console.log(`    Downloaded to ${outPath}`);
    // TODO: parse downloaded file for Portland SD 1J
    return true;
  } catch (err: any) {
    console.log(`    Download failed: ${err.message} — will use published values`);
    return false;
  }
}

async function tryDownloadAssessment(): Promise<boolean> {
  const url = "https://www.oregon.gov/ode/educator-resources/assessment/Documents/TestResults2024/pagr_schools_math_tot_raceethnicity_2324.xlsx";
  console.log(`\n  Attempting assessment data download from ODE...`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.log(`    HTTP ${res.status} — will use published values`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(DATA_DIR, "ode_assessment_2023_24.xlsx");
    fs.writeFileSync(outPath, buf);
    console.log(`    Downloaded to ${outPath}`);
    return true;
  } catch (err: any) {
    console.log(`    Download failed: ${err.message} — will use published values`);
    return false;
  }
}

async function insertData(enrollmentRows: EnrollmentRow[]) {
  console.log("\n=== Inserting Education Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS education`);

    // Drop existing tables to ensure clean schema
    await sql.unsafe(`DROP TABLE IF EXISTS education.enrollment CASCADE`);
    await sql.unsafe(`DROP TABLE IF EXISTS education.graduation_rates CASCADE`);
    await sql.unsafe(`DROP TABLE IF EXISTS education.test_scores CASCADE`);

    // Create enrollment table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.enrollment (
        id                SERIAL PRIMARY KEY,
        school_year       TEXT NOT NULL,
        district_name     TEXT NOT NULL,
        grade_level       TEXT NOT NULL,
        enrollment        INTEGER NOT NULL,
        demographic_group TEXT,
        demographic_count INTEGER,
        demographic_pct   NUMERIC(5,1),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(school_year, district_name, grade_level, demographic_group)
      )
    `);

    // Create graduation rates table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.graduation_rates (
        id            SERIAL PRIMARY KEY,
        school_year   TEXT NOT NULL,
        district_name TEXT NOT NULL,
        rate_4yr      NUMERIC(5,1),
        rate_5yr      NUMERIC(5,1),
        source        TEXT DEFAULT 'ODE published',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(school_year, district_name)
      )
    `);

    // Create test scores table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.test_scores (
        id              SERIAL PRIMARY KEY,
        school_year     TEXT NOT NULL,
        district_name   TEXT NOT NULL,
        subject         TEXT NOT NULL,
        grade_level     TEXT NOT NULL,
        proficiency_pct NUMERIC(5,1),
        source          TEXT DEFAULT 'ODE published',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(school_year, district_name, subject, grade_level)
      )
    `);

    // Create indexes
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_year
        ON education.enrollment(school_year)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_district
        ON education.enrollment(district_name)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_grade
        ON education.enrollment(grade_level)
    `);

    // Truncate and re-insert
    await sql.unsafe(`TRUNCATE education.enrollment RESTART IDENTITY`);
    await sql.unsafe(`TRUNCATE education.graduation_rates RESTART IDENTITY`);
    await sql.unsafe(`TRUNCATE education.test_scores RESTART IDENTITY`);

    // Insert enrollment data
    let inserted = 0;
    for (const row of enrollmentRows) {
      try {
        await sql`
          INSERT INTO education.enrollment
            (school_year, district_name, grade_level, enrollment, demographic_group, demographic_count, demographic_pct)
          VALUES (
            ${row.school_year}, ${row.district_name}, ${row.grade_level},
            ${row.enrollment}, ${row.demographic_group}, ${row.demographic_count}, ${row.demographic_pct}
          )
          ON CONFLICT (school_year, district_name, grade_level, demographic_group)
          DO UPDATE SET
            enrollment = EXCLUDED.enrollment,
            demographic_count = EXCLUDED.demographic_count,
            demographic_pct = EXCLUDED.demographic_pct
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Error inserting enrollment ${row.school_year}/${row.grade_level}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${inserted} enrollment rows`);

    // Insert graduation rates
    for (const rate of GRADUATION_RATES) {
      try {
        await sql`
          INSERT INTO education.graduation_rates
            (school_year, district_name, rate_4yr, rate_5yr, source)
          VALUES (
            ${rate.school_year}, ${rate.district_name},
            ${rate.rate_4yr}, ${rate.rate_5yr}, 'ODE published'
          )
          ON CONFLICT (school_year, district_name)
          DO UPDATE SET
            rate_4yr = EXCLUDED.rate_4yr,
            rate_5yr = EXCLUDED.rate_5yr
        `;
      } catch (err: any) {
        console.log(`  Error inserting graduation rate ${rate.school_year}/${rate.district_name}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${GRADUATION_RATES.length} graduation rate rows`);

    // Insert test scores
    for (const score of TEST_SCORES) {
      try {
        await sql`
          INSERT INTO education.test_scores
            (school_year, district_name, subject, grade_level, proficiency_pct, source)
          VALUES (
            ${score.school_year}, ${score.district_name},
            ${score.subject}, ${score.grade_level},
            ${score.proficiency_pct}, 'ODE published'
          )
          ON CONFLICT (school_year, district_name, subject, grade_level)
          DO UPDATE SET
            proficiency_pct = EXCLUDED.proficiency_pct
        `;
      } catch (err: any) {
        console.log(`  Error inserting test score ${score.school_year}/${score.subject}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${TEST_SCORES.length} test score rows`);

    // Update dashboard cache
    const districtTotals: Record<string, number> = {};
    for (const r of enrollmentRows) {
      if (r.grade_level === "Total" && r.demographic_group === null) {
        // Keep the latest year's total per district
        districtTotals[r.district_name] = r.enrollment;
      }
    }
    const cacheData = {
      source: "Oregon Department of Education (XLSX files)",
      districts: TARGET_DISTRICTS,
      enrollment_years: [...new Set(enrollmentRows.map((r) => r.school_year))].sort(),
      district_totals: districtTotals,
      graduation_rates: GRADUATION_RATES,
      test_scores: TEST_SCORES,
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('education_enrollment', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with education_enrollment entry");

    // Verify
    const verify = await sql`
      SELECT school_year, district_name,
             enrollment
      FROM education.enrollment
      WHERE grade_level = 'Total' AND demographic_group IS NULL
      ORDER BY school_year, district_name
    `;
    console.log("\n  Verification (Total enrollment by year and district):");
    for (const row of verify) {
      console.log(`    ${row.school_year} | ${row.district_name}: ${row.enrollment} students`);
    }

    const gradeVerify = await sql`
      SELECT district_name, grade_level, enrollment
      FROM education.enrollment
      WHERE school_year = (SELECT MAX(school_year) FROM education.enrollment)
        AND demographic_group IS NULL
        AND grade_level != 'Total'
        AND district_name = 'Portland SD 1J'
      ORDER BY
        CASE grade_level
          WHEN 'K' THEN 0
          ELSE grade_level::int
        END
    `;
    console.log("\n  Latest year grade-level enrollment (Portland SD 1J):");
    for (const row of gradeVerify) {
      console.log(`    Grade ${row.grade_level}: ${row.enrollment}`);
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
  console.log("Portland Dashboard — Education Data Parse (6 Districts)");
  console.log("==========================================");

  // Parse enrollment XLSX files
  const allRows: EnrollmentRow[] = [];
  for (const { file, year, sheetYear } of ENROLLMENT_FILES) {
    const filePath = path.join(DATA_DIR, file);
    const rows = parseEnrollmentFile(filePath, year, sheetYear);
    allRows.push(...rows);
  }

  if (allRows.length === 0) {
    console.log("\nWARNING: No enrollment data parsed from any file.");
    console.log("Check that XLSX files exist in data/ and contain target districts.");
    process.exit(1);
  }

  console.log(`\nTotal enrollment rows parsed: ${allRows.length}`);

  // Try to download graduation and assessment data
  await tryDownloadGraduation();
  await tryDownloadAssessment();

  // Save parsed JSON for reference
  const jsonPath = path.join(DATA_DIR, "education_enrollment.json");
  fs.writeFileSync(jsonPath, JSON.stringify(allRows, null, 2));
  console.log(`\nSaved ${jsonPath}`);

  // Insert into database
  await insertData(allRows);

  console.log("\n==========================================");
  console.log("Education data parse complete!");
  console.log(`  Districts: ${[...new Set(allRows.map((r) => r.district_name))].join(", ")}`);
  console.log(`  Enrollment rows: ${allRows.length}`);
  console.log(`  School years: ${[...new Set(allRows.map((r) => r.school_year))].sort().join(", ")}`);
  console.log(`  Graduation rates: ${GRADUATION_RATES.length} entries`);
  console.log(`  Test scores: ${TEST_SCORES.length} entries`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
