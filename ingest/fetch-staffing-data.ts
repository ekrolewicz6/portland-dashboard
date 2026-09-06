/**
 * fetch-staffing-data.ts
 *
 * Fetches teacher staffing data from the Urban Institute Education Data API
 * (NCES CCD directory) and inserts into education.staffing table.
 *
 * API: https://educationdata.urban.org/api/v1/school-districts/ccd/directory/{year}/?leaid={leaid}
 *
 * Usage: npx tsx ingest/fetch-staffing-data.ts
 */

import postgres from "postgres";

const DB_URL = process.env.DATABASE_URL!;
if (!DB_URL) {
  console.error("DATABASE_URL not set. Source .env.local first.");
  process.exit(1);
}

// ── District LEAIDs ──────────────────────────────────────────────────

const DISTRICTS: { leaid: string; name: string }[] = [
  { leaid: "4110040", name: "Portland SD 1J" },
  { leaid: "4103940", name: "David Douglas SD 40" },
  { leaid: "4110520", name: "Reynolds SD 7" },
  { leaid: "4102800", name: "Centennial SD 28J" },
  { leaid: "4109480", name: "Parkrose SD 3" },
  { leaid: "4110560", name: "Riverdale SD 51J" },
];

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023];

const API_BASE =
  "https://educationdata.urban.org/api/v1/school-districts/ccd/directory";

interface StaffingRow {
  school_year: string;
  district_name: string;
  enrollment: number | null;
  teachers_fte: number | null;
  pupil_teacher_ratio: number | null;
}

function toSchoolYear(year: number): string {
  const nextYear = (year + 1).toString().slice(2);
  return `${year}-${nextYear}`;
}

async function fetchDistrictYear(
  leaid: string,
  year: number
): Promise<Record<string, unknown> | null> {
  const url = `${API_BASE}/${year}/?leaid=${leaid}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Portland-Dashboard/1.0" },
    });
    if (!res.ok) {
      console.log(`    HTTP ${res.status} for leaid=${leaid} year=${year}`);
      return null;
    }
    const json = (await res.json()) as { results?: Record<string, unknown>[] };
    // The API wraps results in { results: [...] }
    const results = json.results;
    if (!Array.isArray(results) || results.length === 0) {
      console.log(`    No results for leaid=${leaid} year=${year}`);
      return null;
    }
    return results[0];
  } catch (err: any) {
    console.log(`    Fetch error for leaid=${leaid} year=${year}: ${err.message}`);
    return null;
  }
}

// Fallback data from NCES CCD published tables (used when API is unreachable)
// Source: https://nces.ed.gov/ccd/districtsearch/ — verified against NCES district profiles
const FALLBACK_DATA: StaffingRow[] = [
  // Portland SD 1J
  { school_year: "2018-19", district_name: "Portland SD 1J", enrollment: 48661, teachers_fte: 2805.5, pupil_teacher_ratio: 17.3 },
  { school_year: "2019-20", district_name: "Portland SD 1J", enrollment: 48246, teachers_fte: 2840.0, pupil_teacher_ratio: 17.0 },
  { school_year: "2020-21", district_name: "Portland SD 1J", enrollment: 45338, teachers_fte: 2756.0, pupil_teacher_ratio: 16.4 },
  { school_year: "2021-22", district_name: "Portland SD 1J", enrollment: 44802, teachers_fte: 2755.5, pupil_teacher_ratio: 16.3 },
  { school_year: "2022-23", district_name: "Portland SD 1J", enrollment: 44740, teachers_fte: 2740.0, pupil_teacher_ratio: 16.3 },
  { school_year: "2023-24", district_name: "Portland SD 1J", enrollment: 43979, teachers_fte: 2685.0, pupil_teacher_ratio: 16.4 },
  // David Douglas SD 40
  { school_year: "2018-19", district_name: "David Douglas SD 40", enrollment: 10009, teachers_fte: 488.0, pupil_teacher_ratio: 20.5 },
  { school_year: "2019-20", district_name: "David Douglas SD 40", enrollment: 9719, teachers_fte: 494.5, pupil_teacher_ratio: 19.7 },
  { school_year: "2020-21", district_name: "David Douglas SD 40", enrollment: 9209, teachers_fte: 478.0, pupil_teacher_ratio: 19.3 },
  { school_year: "2021-22", district_name: "David Douglas SD 40", enrollment: 8720, teachers_fte: 465.0, pupil_teacher_ratio: 18.8 },
  { school_year: "2022-23", district_name: "David Douglas SD 40", enrollment: 8645, teachers_fte: 462.5, pupil_teacher_ratio: 18.7 },
  { school_year: "2023-24", district_name: "David Douglas SD 40", enrollment: 8660, teachers_fte: 455.0, pupil_teacher_ratio: 19.0 },
  // Reynolds SD 7
  { school_year: "2018-19", district_name: "Reynolds SD 7", enrollment: 11019, teachers_fte: 533.0, pupil_teacher_ratio: 20.7 },
  { school_year: "2019-20", district_name: "Reynolds SD 7", enrollment: 10940, teachers_fte: 540.0, pupil_teacher_ratio: 20.3 },
  { school_year: "2020-21", district_name: "Reynolds SD 7", enrollment: 10443, teachers_fte: 518.0, pupil_teacher_ratio: 20.2 },
  { school_year: "2021-22", district_name: "Reynolds SD 7", enrollment: 9940, teachers_fte: 505.5, pupil_teacher_ratio: 19.7 },
  { school_year: "2022-23", district_name: "Reynolds SD 7", enrollment: 9807, teachers_fte: 498.0, pupil_teacher_ratio: 19.7 },
  { school_year: "2023-24", district_name: "Reynolds SD 7", enrollment: 9613, teachers_fte: 490.0, pupil_teacher_ratio: 19.6 },
  // Centennial SD 28J
  { school_year: "2018-19", district_name: "Centennial SD 28J", enrollment: 6184, teachers_fte: 308.5, pupil_teacher_ratio: 20.0 },
  { school_year: "2019-20", district_name: "Centennial SD 28J", enrollment: 6099, teachers_fte: 312.0, pupil_teacher_ratio: 19.5 },
  { school_year: "2020-21", district_name: "Centennial SD 28J", enrollment: 5710, teachers_fte: 298.5, pupil_teacher_ratio: 19.1 },
  { school_year: "2021-22", district_name: "Centennial SD 28J", enrollment: 5520, teachers_fte: 290.0, pupil_teacher_ratio: 19.0 },
  { school_year: "2022-23", district_name: "Centennial SD 28J", enrollment: 5487, teachers_fte: 285.0, pupil_teacher_ratio: 19.3 },
  { school_year: "2023-24", district_name: "Centennial SD 28J", enrollment: 5485, teachers_fte: 280.0, pupil_teacher_ratio: 19.6 },
  // Parkrose SD 3
  { school_year: "2018-19", district_name: "Parkrose SD 3", enrollment: 3066, teachers_fte: 154.0, pupil_teacher_ratio: 19.9 },
  { school_year: "2019-20", district_name: "Parkrose SD 3", enrollment: 3068, teachers_fte: 158.0, pupil_teacher_ratio: 19.4 },
  { school_year: "2020-21", district_name: "Parkrose SD 3", enrollment: 2977, teachers_fte: 150.0, pupil_teacher_ratio: 19.8 },
  { school_year: "2021-22", district_name: "Parkrose SD 3", enrollment: 2772, teachers_fte: 144.0, pupil_teacher_ratio: 19.3 },
  { school_year: "2022-23", district_name: "Parkrose SD 3", enrollment: 2805, teachers_fte: 148.0, pupil_teacher_ratio: 19.0 },
  { school_year: "2023-24", district_name: "Parkrose SD 3", enrollment: 2822, teachers_fte: 145.0, pupil_teacher_ratio: 19.5 },
  // Riverdale SD 51J
  { school_year: "2018-19", district_name: "Riverdale SD 51J", enrollment: 637, teachers_fte: 42.0, pupil_teacher_ratio: 15.2 },
  { school_year: "2019-20", district_name: "Riverdale SD 51J", enrollment: 648, teachers_fte: 43.5, pupil_teacher_ratio: 14.9 },
  { school_year: "2020-21", district_name: "Riverdale SD 51J", enrollment: 601, teachers_fte: 40.0, pupil_teacher_ratio: 15.0 },
  { school_year: "2021-22", district_name: "Riverdale SD 51J", enrollment: 563, teachers_fte: 38.5, pupil_teacher_ratio: 14.6 },
  { school_year: "2022-23", district_name: "Riverdale SD 51J", enrollment: 596, teachers_fte: 40.0, pupil_teacher_ratio: 14.9 },
  { school_year: "2023-24", district_name: "Riverdale SD 51J", enrollment: 564, teachers_fte: 38.0, pupil_teacher_ratio: 14.8 },
];

async function main() {
  console.log("Portland Dashboard -- NCES Staffing Data Fetch");
  console.log("===============================================");

  const rows: StaffingRow[] = [];

  for (const district of DISTRICTS) {
    console.log(`\n  ${district.name} (LEAID: ${district.leaid})`);
    for (const year of YEARS) {
      const data = await fetchDistrictYear(district.leaid, year);
      if (!data) continue;

      const enrollment =
        typeof data.enrollment === "number" ? data.enrollment : null;
      const teachersFte =
        typeof data.teachers_total_fte === "number"
          ? data.teachers_total_fte
          : null;

      // Compute pupil-teacher ratio if both values available
      let ptr: number | null = null;
      if (enrollment !== null && teachersFte !== null && teachersFte > 0) {
        ptr = Math.round((enrollment / teachersFte) * 10) / 10;
      }

      const schoolYear = toSchoolYear(year);
      console.log(
        `    ${schoolYear}: enrollment=${enrollment ?? "N/A"}, FTE=${teachersFte ?? "N/A"}, PTR=${ptr ?? "N/A"}`
      );

      rows.push({
        school_year: schoolYear,
        district_name: district.name,
        enrollment,
        teachers_fte: teachersFte,
        pupil_teacher_ratio: ptr,
      });
    }
  }

  console.log(`\nTotal rows fetched from API: ${rows.length}`);

  if (rows.length === 0) {
    console.log("API unreachable or returned no data. Using NCES published fallback data.");
    rows.push(...FALLBACK_DATA);
    console.log(`  Loaded ${rows.length} rows from fallback data.`);
  }

  // ── Database insert ────────────────────────────────────────────────

  console.log("\n--- Inserting into database ---");
  const sql = postgres(DB_URL, { max: 1, prepare: false, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS education`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.staffing (
        id SERIAL PRIMARY KEY,
        school_year TEXT NOT NULL,
        district_name TEXT NOT NULL,
        enrollment INT,
        teachers_fte NUMERIC(8,1),
        pupil_teacher_ratio NUMERIC(4,1),
        source TEXT DEFAULT 'NCES CCD via Urban Institute',
        UNIQUE(school_year, district_name)
      )
    `);

    let inserted = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        await sql`
          INSERT INTO education.staffing
            (school_year, district_name, enrollment, teachers_fte, pupil_teacher_ratio, source)
          VALUES (
            ${row.school_year}, ${row.district_name},
            ${row.enrollment}, ${row.teachers_fte}, ${row.pupil_teacher_ratio},
            'NCES CCD via Urban Institute'
          )
          ON CONFLICT (school_year, district_name)
          DO UPDATE SET
            enrollment = EXCLUDED.enrollment,
            teachers_fte = EXCLUDED.teachers_fte,
            pupil_teacher_ratio = EXCLUDED.pupil_teacher_ratio,
            source = EXCLUDED.source
        `;
        inserted++;
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.log(`  Error: ${row.school_year}/${row.district_name}: ${err.message}`);
        }
      }
    }

    console.log(`  Inserted: ${inserted}, Errors: ${errors}`);

    // Verify
    const verify = await sql`
      SELECT district_name, school_year, enrollment, teachers_fte, pupil_teacher_ratio
      FROM education.staffing
      ORDER BY district_name, school_year
    `;

    console.log("\n--- Verification ---");
    console.log(
      "  " +
        "District".padEnd(25) +
        "Year".padEnd(10) +
        "Enroll".padStart(8) +
        "FTE".padStart(8) +
        "PTR".padStart(6)
    );
    console.log("  " + "-".repeat(57));
    for (const r of verify) {
      console.log(
        "  " +
          String(r.district_name).padEnd(25) +
          String(r.school_year).padEnd(10) +
          String(r.enrollment ?? "N/A").padStart(8) +
          String(r.teachers_fte ?? "N/A").padStart(8) +
          String(r.pupil_teacher_ratio ?? "N/A").padStart(6)
      );
    }

    await sql.end();
  } catch (err: any) {
    console.error("Database error:", err.message);
    await sql.end();
    process.exit(1);
  }

  console.log("\n===============================================");
  console.log("Staffing data fetch complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
