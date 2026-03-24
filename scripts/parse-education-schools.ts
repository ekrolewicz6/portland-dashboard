/**
 * parse-education-schools.ts
 *
 * Parses ODE enrollment XLSX files (School sheets) for Portland SD 1J
 * and inserts per-school enrollment into PostgreSQL.
 *
 * Usage: npx tsx scripts/parse-education-schools.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const XLSX = require("xlsx");

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);

const DISTRICT_NAME = "Portland SD 1J";

// Each file has a slightly different column layout
const ENROLLMENT_FILES = [
  {
    file: "ode_enrollment_2023_24.xlsx",
    year: "2023-24",
    sheetName: "School 20232024",
    // Cols: 0=DistrictID, 1=DistrictName, 2=SchoolID, 3=SchoolName, 4=PriorEnrollment, 5=CurrentEnrollment
    districtCol: 1,
    schoolNameCol: 3,
    schoolTypeCol: null as number | null,
    priorEnrollmentCol: 4,
    currentEnrollmentCol: 5,
  },
  {
    file: "ode_enrollment_2024_25.xlsx",
    year: "2024-25",
    sheetName: "School 20242025",
    districtCol: 1,
    schoolNameCol: 3,
    schoolTypeCol: null as number | null,
    priorEnrollmentCol: 4,
    currentEnrollmentCol: 5,
  },
  {
    file: "ode_enrollment_2025_26.xlsx",
    year: "2025-26",
    sheetName: "School 20252026",
    // 2025-26 has no DistrictID column; cols: 0=DistrictName, 1=SchoolID, 2=SchoolName, 3=SchoolType, 4=Virtual, 5=PriorEnrollment, 6=CurrentEnrollment
    districtCol: 0,
    schoolNameCol: 2,
    schoolTypeCol: 3,
    priorEnrollmentCol: 5,
    currentEnrollmentCol: 6,
  },
];

interface SchoolRow {
  school_year: string;
  district_name: string;
  school_name: string;
  school_type: string | null;
  enrollment_current: number;
  enrollment_prior: number;
}

function parseNum(val: any): number {
  if (val === undefined || val === null || val === "" || val === "*" || val === "-" || val === "Merge") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseFile(config: (typeof ENROLLMENT_FILES)[number]): SchoolRow[] {
  const filePath = path.join(DATA_DIR, config.file);
  console.log(`\n  Parsing ${config.file}...`);

  if (!fs.existsSync(filePath)) {
    console.log(`    File not found: ${filePath}`);
    return [];
  }

  const workbook = XLSX.readFile(filePath);

  if (!workbook.SheetNames.includes(config.sheetName)) {
    console.log(`    Sheet "${config.sheetName}" not found. Available: ${workbook.SheetNames.join(", ")}`);
    return [];
  }

  const sheet = workbook.Sheets[config.sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  console.log(`    Total rows: ${rawData.length}`);

  const results: SchoolRow[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const districtName = String(row[config.districtCol] || "").trim();
    if (districtName !== DISTRICT_NAME) continue;

    const schoolName = String(row[config.schoolNameCol] || "").trim();
    if (!schoolName) continue;

    const schoolType = config.schoolTypeCol !== null
      ? String(row[config.schoolTypeCol] || "").trim() || null
      : null;

    const enrollmentCurrent = parseNum(row[config.currentEnrollmentCol]);
    const enrollmentPrior = parseNum(row[config.priorEnrollmentCol]);

    // Skip rows with zero current enrollment (likely inactive)
    if (enrollmentCurrent <= 0) continue;

    results.push({
      school_year: config.year,
      district_name: DISTRICT_NAME,
      school_name: schoolName,
      school_type: schoolType,
      enrollment_current: enrollmentCurrent,
      enrollment_prior: enrollmentPrior,
    });
  }

  console.log(`    Found ${results.length} Portland schools`);
  return results;
}

async function insertData(rows: SchoolRow[]) {
  console.log("\n=== Inserting School Enrollment Data ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS education`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.school_enrollment (
        id SERIAL PRIMARY KEY,
        school_year TEXT NOT NULL,
        district_name TEXT DEFAULT 'Portland SD 1J',
        school_name TEXT NOT NULL,
        school_type TEXT,
        enrollment_current INT,
        enrollment_prior INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(school_year, school_name)
      )
    `);

    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_school_enrollment_year ON education.school_enrollment(school_year)`);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_school_enrollment_name ON education.school_enrollment(school_name)`);

    // Clear existing data and re-insert
    await sql.unsafe(`TRUNCATE education.school_enrollment RESTART IDENTITY`);

    let inserted = 0;
    for (const row of rows) {
      try {
        await sql`
          INSERT INTO education.school_enrollment
            (school_year, district_name, school_name, school_type, enrollment_current, enrollment_prior)
          VALUES (
            ${row.school_year}, ${row.district_name}, ${row.school_name},
            ${row.school_type}, ${row.enrollment_current}, ${row.enrollment_prior}
          )
          ON CONFLICT (school_year, school_name)
          DO UPDATE SET
            school_type = EXCLUDED.school_type,
            enrollment_current = EXCLUDED.enrollment_current,
            enrollment_prior = EXCLUDED.enrollment_prior
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Error inserting ${row.school_year}/${row.school_name}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${inserted} school enrollment rows`);

    // Verify
    const verify = await sql`
      SELECT school_year,
             count(*)::int as schools,
             min(enrollment_current) as min_enrollment,
             max(enrollment_current) as max_enrollment
      FROM education.school_enrollment
      GROUP BY school_year
      ORDER BY school_year
    `;
    console.log("\n  Verification:");
    for (const row of verify) {
      console.log(`    ${row.school_year}: ${row.schools} schools (enrollment range: ${row.min_enrollment}-${row.max_enrollment})`);
    }

    // Show lowest-enrolled schools for latest year
    const lowest = await sql`
      SELECT school_name, school_type, enrollment_current
      FROM education.school_enrollment
      WHERE school_year = (SELECT MAX(school_year) FROM education.school_enrollment)
      ORDER BY enrollment_current ASC
      LIMIT 15
    `;
    console.log("\n  15 Lowest-Enrolled Schools (latest year):");
    for (const row of lowest) {
      console.log(`    ${row.enrollment_current} — ${row.school_name} (${row.school_type || "unknown type"})`);
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }
}

async function main() {
  console.log("Portland Dashboard — School Enrollment Parse");
  console.log("=============================================");

  const allRows: SchoolRow[] = [];
  for (const config of ENROLLMENT_FILES) {
    const rows = parseFile(config);
    allRows.push(...rows);
  }

  if (allRows.length === 0) {
    console.log("\nWARNING: No school enrollment data parsed.");
    process.exit(1);
  }

  console.log(`\nTotal school rows parsed: ${allRows.length}`);
  console.log(`School years: ${[...new Set(allRows.map((r) => r.school_year))].join(", ")}`);

  await insertData(allRows);

  console.log("\n=============================================");
  console.log("School enrollment parse complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
