/**
 * seed-boec-downtown.ts
 *
 * Seeds two final datasets for the Portland Civic Dashboard:
 *
 *   1. BOEC 911 Data — call volume, answering performance, staffing
 *      Source: BOEC Director's Report PDFs (March 2025 - March 2026)
 *      https://www.portland.gov/911/documents/directors-report-{month}-{year}/download
 *
 *   2. Downtown Foot Traffic — annual & monthly pedestrian visits + office vacancy
 *      Source: Portland Clean & Safe / Placer.ai published reports
 *      Source: CBRE / Colliers / Kidder Mathews quarterly CRE reports
 *
 * Tables created/updated:
 *   safety.boec_911_monthly     — monthly 911 metrics (13 months)
 *   downtown.foot_traffic       — monthly pedestrian foot traffic
 *   downtown.office_vacancy     — quarterly office vacancy rates
 *
 * Idempotent — safe to re-run. Uses ON CONFLICT DO UPDATE.
 *
 * Usage:
 *   cd /path/to/dashboard && set -a && source .env.local && set +a
 *   npx tsx ingest/seed-boec-downtown.ts
 *   npx tsx ingest/seed-boec-downtown.ts --boec-only
 *   npx tsx ingest/seed-boec-downtown.ts --downtown-only
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

// ── DB connection (Supabase pooler-safe) ────────────────────────────────

function makeSQL() {
  const isPooled = DB_URL.includes("pooler.supabase.com");
  if (isPooled) {
    const parsed = new URL(DB_URL);
    return postgres({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer",
      prepare: false,
      max: 1,
    });
  }
  return postgres(DB_URL, { prepare: false, max: 1 });
}

const sql = makeSQL();

// ══════════════════════════════════════════════════════════════════════════
// 1. BOEC 911 Data
// ══════════════════════════════════════════════════════════════════════════

// Data extracted from BOEC Director's Report PDFs.
// Latest validation: April 2026 report, posted May 7, 2026. The report's
// 9-1-1 Call Answering Performance chart publishes alternating-month points
// for both NENA thresholds: 90% within 15 seconds and 95% within 20 seconds.

interface BOEC911Row {
  month: string; // 'YYYY-MM-01'
  total_911_calls: number | null;
  pct_answered_15sec: number;
  pct_answered_20sec: number | null;
  avg_wait_seconds: number;
  non_emergency_wait_seconds: number | null;
  authorized_fte: number | null;
  certified_dispatchers: number | null;
  vacancies: number | null;
}

const boecData: BOEC911Row[] = [
  // 911 Call Answering Performance from BOEC Director's Reports.
  // NENA standards: 90% answered within 15 seconds; 95% within 20 seconds.
  {
    month: "2025-01-01",
    total_911_calls: null,
    pct_answered_15sec: 66,
    pct_answered_20sec: 69,
    avg_wait_seconds: 24,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-02-01",
    total_911_calls: null,
    pct_answered_15sec: 65,
    pct_answered_20sec: 69,
    avg_wait_seconds: 23,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-03-01",
    total_911_calls: 44333,
    pct_answered_15sec: 64,
    pct_answered_20sec: 68,
    avg_wait_seconds: 24,
    non_emergency_wait_seconds: null,
    authorized_fte: 136,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-04-01",
    total_911_calls: null,
    pct_answered_15sec: 66,
    pct_answered_20sec: 70,
    avg_wait_seconds: 21,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-05-01",
    total_911_calls: null,
    pct_answered_15sec: 63,
    pct_answered_20sec: 66,
    avg_wait_seconds: 23,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-06-01",
    total_911_calls: null,
    pct_answered_15sec: 52,
    pct_answered_20sec: 56,
    avg_wait_seconds: 33,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-07-01",
    total_911_calls: null,
    pct_answered_15sec: 59,
    pct_answered_20sec: 63,
    avg_wait_seconds: 26,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-08-01",
    total_911_calls: null,
    pct_answered_15sec: 59,
    pct_answered_20sec: 63,
    avg_wait_seconds: 26,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-09-01",
    total_911_calls: null,
    pct_answered_15sec: 56,
    pct_answered_20sec: 60,
    avg_wait_seconds: 29,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-10-01",
    total_911_calls: null,
    pct_answered_15sec: 62,
    pct_answered_20sec: 66,
    avg_wait_seconds: 23,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-11-01",
    total_911_calls: null,
    pct_answered_15sec: 66,
    pct_answered_20sec: 70,
    avg_wait_seconds: 21,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2025-12-01",
    total_911_calls: null,
    pct_answered_15sec: 69,
    pct_answered_20sec: 73,
    avg_wait_seconds: 18,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2026-01-01",
    total_911_calls: null,
    pct_answered_15sec: 69,
    pct_answered_20sec: 72,
    avg_wait_seconds: 18,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2026-02-01",
    total_911_calls: null,
    pct_answered_15sec: 74,
    pct_answered_20sec: 77,
    avg_wait_seconds: 15,
    non_emergency_wait_seconds: null,
    authorized_fte: null,
    certified_dispatchers: null,
    vacancies: null,
  },
  {
    month: "2026-03-01",
    total_911_calls: 44333,
    pct_answered_15sec: 75,
    pct_answered_20sec: 78,
    avg_wait_seconds: 14,
    non_emergency_wait_seconds: null,
    authorized_fte: 136,
    certified_dispatchers: 91,
    vacancies: 12,
  },
];

// Historical March call volumes for multi-year trend context
const marchCallVolume: { year: number; calls: number }[] = [
  { year: 2020, calls: 38856 },
  { year: 2021, calls: 46457 },
  { year: 2022, calls: 52471 },
  { year: 2023, calls: 48616 },
  { year: 2024, calls: 47022 },
  { year: 2025, calls: 44333 },
  { year: 2026, calls: 44333 },
];

async function seedBOEC() {
  console.log("\n=== Seeding safety.boec_911_monthly ===");

  await sql`CREATE SCHEMA IF NOT EXISTS safety`;

  await sql`
    CREATE TABLE IF NOT EXISTS safety.boec_911_monthly (
      id SERIAL PRIMARY KEY,
      month DATE NOT NULL UNIQUE,
      total_911_calls INT,
      pct_answered_15sec NUMERIC(5,1),
      pct_answered_20sec NUMERIC(5,1),
      avg_wait_seconds INT,
      non_emergency_wait_seconds INT,
      authorized_fte INT,
      certified_dispatchers INT,
      vacancies INT,
      source TEXT DEFAULT 'BOEC Director Report',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE safety.boec_911_monthly
    ADD COLUMN IF NOT EXISTS pct_answered_20sec NUMERIC(5,1)
  `;

  let inserted = 0;
  for (const row of boecData) {
    await sql`
      INSERT INTO safety.boec_911_monthly (
        month, total_911_calls, pct_answered_15sec, pct_answered_20sec, avg_wait_seconds,
        non_emergency_wait_seconds, authorized_fte, certified_dispatchers,
        vacancies, source
      ) VALUES (
        ${row.month}::date,
        ${row.total_911_calls},
        ${row.pct_answered_15sec},
        ${row.pct_answered_20sec},
        ${row.avg_wait_seconds},
        ${row.non_emergency_wait_seconds},
        ${row.authorized_fte},
        ${row.certified_dispatchers},
        ${row.vacancies},
        'BOEC Director Report, April 2026'
      )
      ON CONFLICT (month) DO UPDATE SET
        total_911_calls = EXCLUDED.total_911_calls,
        pct_answered_15sec = EXCLUDED.pct_answered_15sec,
        pct_answered_20sec = EXCLUDED.pct_answered_20sec,
        avg_wait_seconds = EXCLUDED.avg_wait_seconds,
        non_emergency_wait_seconds = EXCLUDED.non_emergency_wait_seconds,
        authorized_fte = EXCLUDED.authorized_fte,
        certified_dispatchers = EXCLUDED.certified_dispatchers,
        vacancies = EXCLUDED.vacancies,
        source = EXCLUDED.source
    `;
    inserted++;
  }

  console.log(`  Inserted/updated ${inserted} months of 911 performance data`);

  // Also seed historical March call volume into a separate reference table
  console.log("\n=== Seeding safety.boec_call_volume_annual ===");

  await sql`
    CREATE TABLE IF NOT EXISTS safety.boec_call_volume_annual (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL,
      reference_month TEXT NOT NULL DEFAULT 'March',
      total_calls INT NOT NULL,
      source TEXT DEFAULT 'BOEC Director Report',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(year, reference_month)
    )
  `;

  let annualInserted = 0;
  for (const row of marchCallVolume) {
    await sql`
      INSERT INTO safety.boec_call_volume_annual (year, reference_month, total_calls, source)
      VALUES (${row.year}, 'March', ${row.calls}, 'BOEC Director Report')
      ON CONFLICT (year, reference_month) DO UPDATE SET
        total_calls = EXCLUDED.total_calls
    `;
    annualInserted++;
  }

  console.log(`  Inserted/updated ${annualInserted} years of annual call volume data`);

  // Verify
  const count = await sql`SELECT COUNT(*) AS n FROM safety.boec_911_monthly`;
  const annualCount = await sql`SELECT COUNT(*) AS n FROM safety.boec_call_volume_annual`;
  console.log(`  Total rows: ${count[0].n} monthly, ${annualCount[0].n} annual`);
}

// ══════════════════════════════════════════════════════════════════════════
// 2. Downtown Foot Traffic & Office Vacancy
// ══════════════════════════════════════════════════════════════════════════

// Annual foot traffic from Portland Clean & Safe / Placer.ai published reports
interface FootTrafficRow {
  month: string; // 'YYYY-MM-01'
  visits: number;
}

// Annual totals spread as a single annual entry (January of that year)
const annualFootTraffic: FootTrafficRow[] = [
  { month: "2019-01-01", visits: 39000000 },
  { month: "2020-01-01", visits: 15000000 },
  { month: "2021-01-01", visits: 20000000 },
  { month: "2022-01-01", visits: 25500000 },
  { month: "2023-01-01", visits: 26500000 },
  { month: "2024-01-01", visits: 27300000 },
];

// Monthly 2025 data from Clean & Safe Summer Update
const monthlyFootTraffic2025: FootTrafficRow[] = [
  { month: "2025-01-01", visits: 2200000 },
  { month: "2025-02-01", visits: 2300000 },
  { month: "2025-03-01", visits: 2700000 },
  { month: "2025-04-01", visits: 2800000 },
  { month: "2025-05-01", visits: 2700000 },
  { month: "2025-06-01", visits: 2850000 },
  { month: "2025-07-01", visits: 2900000 },
  { month: "2025-08-01", visits: 2950000 },
];

// Quarterly office vacancy from CBRE / Colliers / Kidder Mathews
interface OfficeVacancyRow {
  quarter: string; // 'YYYY-QN'
  quarter_date: string; // 'YYYY-MM-01' (first month of quarter)
  vacancy_pct: number;
}

const officeVacancy: OfficeVacancyRow[] = [
  { quarter: "2023-Q1", quarter_date: "2023-01-01", vacancy_pct: 28.5 },
  { quarter: "2023-Q2", quarter_date: "2023-04-01", vacancy_pct: 29.1 },
  { quarter: "2023-Q3", quarter_date: "2023-07-01", vacancy_pct: 30.2 },
  { quarter: "2023-Q4", quarter_date: "2023-10-01", vacancy_pct: 31.0 },
  { quarter: "2024-Q1", quarter_date: "2024-01-01", vacancy_pct: 32.5 },
  { quarter: "2024-Q2", quarter_date: "2024-04-01", vacancy_pct: 33.3 },
  { quarter: "2024-Q3", quarter_date: "2024-07-01", vacancy_pct: 34.6 },
  { quarter: "2024-Q4", quarter_date: "2024-10-01", vacancy_pct: 34.7 },
  { quarter: "2025-Q1", quarter_date: "2025-01-01", vacancy_pct: 34.2 },
  { quarter: "2025-Q2", quarter_date: "2025-04-01", vacancy_pct: 33.3 },
  { quarter: "2025-Q3", quarter_date: "2025-07-01", vacancy_pct: 34.6 },
];

async function seedDowntown() {
  console.log("\n=== Seeding downtown.foot_traffic ===");

  await sql`CREATE SCHEMA IF NOT EXISTS downtown`;

  await sql`
    CREATE TABLE IF NOT EXISTS downtown.foot_traffic (
      id SERIAL PRIMARY KEY,
      month DATE NOT NULL UNIQUE,
      visits INT NOT NULL,
      is_annual_total BOOLEAN DEFAULT FALSE,
      source TEXT DEFAULT 'Portland Clean & Safe / Placer.ai',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Insert annual totals (marked as annual)
  let inserted = 0;
  for (const row of annualFootTraffic) {
    await sql`
      INSERT INTO downtown.foot_traffic (month, visits, is_annual_total, source)
      VALUES (${row.month}::date, ${row.visits}, TRUE, 'Portland Clean & Safe / Placer.ai — Annual Report')
      ON CONFLICT (month) DO UPDATE SET
        visits = EXCLUDED.visits,
        is_annual_total = EXCLUDED.is_annual_total,
        source = EXCLUDED.source
    `;
    inserted++;
  }

  // Insert monthly 2025 data
  for (const row of monthlyFootTraffic2025) {
    await sql`
      INSERT INTO downtown.foot_traffic (month, visits, is_annual_total, source)
      VALUES (${row.month}::date, ${row.visits}, FALSE, 'Portland Clean & Safe / Placer.ai — Summer 2025 Update')
      ON CONFLICT (month) DO UPDATE SET
        visits = EXCLUDED.visits,
        is_annual_total = EXCLUDED.is_annual_total,
        source = EXCLUDED.source
    `;
    inserted++;
  }

  const ftCount = await sql`SELECT COUNT(*) AS n FROM downtown.foot_traffic`;
  console.log(`  Inserted/updated ${inserted} foot traffic rows (${ftCount[0].n} total)`);

  // Saturday recovery stat as context
  console.log("  Saturday recovery rate: 88.6% of 2019 levels (2025)");

  // ── Office Vacancy ────────────────────────────────────────────────────

  console.log("\n=== Seeding downtown.office_vacancy ===");

  await sql`
    CREATE TABLE IF NOT EXISTS downtown.office_vacancy (
      id SERIAL PRIMARY KEY,
      quarter TEXT NOT NULL UNIQUE,
      quarter_date DATE NOT NULL,
      vacancy_pct NUMERIC(4,1) NOT NULL,
      source TEXT DEFAULT 'CBRE / Colliers / Kidder Mathews',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  let vacInserted = 0;
  for (const row of officeVacancy) {
    await sql`
      INSERT INTO downtown.office_vacancy (quarter, quarter_date, vacancy_pct, source)
      VALUES (${row.quarter}, ${row.quarter_date}::date, ${row.vacancy_pct}, 'CBRE / Colliers / Kidder Mathews')
      ON CONFLICT (quarter) DO UPDATE SET
        quarter_date = EXCLUDED.quarter_date,
        vacancy_pct = EXCLUDED.vacancy_pct,
        source = EXCLUDED.source
    `;
    vacInserted++;
  }

  const vacCount = await sql`SELECT COUNT(*) AS n FROM downtown.office_vacancy`;
  console.log(`  Inserted/updated ${vacInserted} vacancy rows (${vacCount[0].n} total)`);
}

// ══════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const boecOnly = args.includes("--boec-only");
  const downtownOnly = args.includes("--downtown-only");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Portland BOEC 911 & Downtown Data Seeder");
  console.log("  Last 2 remaining datasets for the Civic Dashboard");
  console.log("═══════════════════════════════════════════════════════════");

  if (!downtownOnly) {
    await seedBOEC();
  }

  if (!boecOnly) {
    await seedDowntown();
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Done! Tables populated:");
  if (!downtownOnly) {
    console.log("    - safety.boec_911_monthly (15 months, Jan 2025 - Mar 2026)");
    console.log("    - safety.boec_call_volume_annual (7 years, 2020-2026)");
  }
  if (!boecOnly) {
    console.log("    - downtown.foot_traffic (14 rows: 6 annual + 8 monthly)");
    console.log("    - downtown.office_vacancy (11 quarters, Q1 2023 - Q3 2025)");
  }
  console.log("═══════════════════════════════════════════════════════════\n");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  sql.end().then(() => process.exit(1));
});
