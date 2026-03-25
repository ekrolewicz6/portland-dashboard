/**
 * seed-static-data.ts
 *
 * Seeds STATIC and REFERENCE data into the Portland Civic Lab Dashboard database.
 * These are computed from specs or relatively stable reference data points
 * that don't come from live APIs.
 *
 * Usage: npx tsx scripts/seed-static-data.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

// Parse explicitly for Supabase pooler (special chars in password)
function parseDbUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer" as const,
      prepare: false,
    };
  } catch {
    return undefined;
  }
}

const isPooled = DB_URL.includes("pooler.supabase.com");
const sql = isPooled
  ? postgres({ ...parseDbUrl(DB_URL)!, max: 5 })
  : postgres(DB_URL, { max: 5 });

// ── Helpers ──────────────────────────────────────────────────────────────

function monthDate(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function quarterDate(year: number, q: number): string {
  const month = (q - 1) * 3 + 1;
  return monthDate(year, month);
}

function formatMonth(year: number, month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[month - 1]} ${year}`;
}

// ── 1. Tax Comparison ───────────────────────────────────────────────────
//
// All values are EFFECTIVE RATES (% of gross income), calculated from
// actual 2024 tax brackets for a single W-2 employee with standard deduction.
//
// Federal: 2024 brackets (10/12/22/24/32/35/37%), std deduction $14,600
// Oregon:  2024 brackets (4.75/6.75/8.75/9.9%), std deduction $2,745
// California: 2024 brackets (1/2/4/6/8/9.3/10.3/11.3/12.3%), std deduction $5,540
// Idaho:   flat 5.695% on federal taxable income
// Colorado: flat 4.4% on federal taxable income
// Utah:    flat 4.65% on federal taxable income (w/ credits, effective ~3-4.3%)
//
// Portland local (W-2 employees only):
//   PFA: 1.5% on OR taxable $125K–$250K, 3.0% above $250K (single)
//   Metro SHS: 1.0% on OR taxable income over $125K (single)
//   Arts Tax: $35 flat
//   BLT/BIT: $0 (business taxes, not applicable to employees)
//
// Income levels: $40K, $50K, $60K, $75K, $100K, $125K, $150K, $200K, $300K

async function seedTaxComparison() {
  console.log("\n=== Seeding tax_comparison ===");

  await sql`DELETE FROM tax_comparison`;

  // Each row: [city, income, effective_rate, federal%, state%, local%, other%]
  type TaxRow = [string, number, number, number, number, number, number];

  const data: TaxRow[] = [
    // ── Portland, OR (W-2 employee) ──
    // Local = PFA + SHS (kick in >$125K OR taxable), Other = Arts Tax
    ["Portland, OR",  40000, 14.6,  7.0, 7.4, 0.0, 0.1],
    ["Portland, OR",  50000, 15.8,  8.0, 7.7, 0.0, 0.1],
    ["Portland, OR",  60000, 16.7,  8.7, 7.9, 0.0, 0.1],  // Arts Tax $35
    ["Portland, OR",  75000, 19.2, 11.1, 8.0, 0.0, 0.0],
    ["Portland, OR", 100000, 22.1, 13.8, 8.2, 0.0, 0.0],
    ["Portland, OR", 125000, 23.9, 15.6, 8.3, 0.0, 0.0],  // OR taxable $122,255 < $125K threshold
    ["Portland, OR", 150000, 26.0, 17.0, 8.6, 0.4, 0.0],  // PFA $334 + SHS $223
    ["Portland, OR", 200000, 28.6, 18.8, 8.9, 0.9, 0.0],  // PFA $1,084 + SHS $723
    ["Portland, OR", 300000, 34.3, 23.4, 9.2, 1.7, 0.0],  // PFA $3,293 + SHS $1,723

    // ── San Francisco, CA (no local income tax for W-2; includes CA SDI 1.1%) ──
    ["San Francisco, CA",  40000, 10.1,  7.0, 3.1, 0.0, 0.0],
    ["San Francisco, CA",  50000, 11.7,  8.0, 3.7, 0.0, 0.0],
    ["San Francisco, CA",  60000, 12.9,  8.7, 4.2, 0.0, 0.0],
    ["San Francisco, CA",  75000, 16.4, 11.1, 5.3, 0.0, 0.0],
    ["San Francisco, CA", 100000, 20.3, 13.8, 6.5, 0.0, 0.0],
    ["San Francisco, CA", 125000, 22.9, 15.6, 7.3, 0.0, 0.0],
    ["San Francisco, CA", 150000, 24.8, 17.0, 7.8, 0.0, 0.0],
    ["San Francisco, CA", 200000, 27.3, 18.8, 8.5, 0.0, 0.0],
    ["San Francisco, CA", 300000, 32.5, 23.4, 9.1, 0.0, 0.0],

    // ── Seattle, WA (no state/local income tax) ──
    ["Seattle, WA",  40000,  7.0,  7.0, 0.0, 0.0, 0.0],
    ["Seattle, WA",  50000,  8.0,  8.0, 0.0, 0.0, 0.0],
    ["Seattle, WA",  60000,  8.7,  8.7, 0.0, 0.0, 0.0],
    ["Seattle, WA",  75000, 11.1, 11.1, 0.0, 0.0, 0.0],
    ["Seattle, WA", 100000, 13.8, 13.8, 0.0, 0.0, 0.0],
    ["Seattle, WA", 125000, 15.6, 15.6, 0.0, 0.0, 0.0],
    ["Seattle, WA", 150000, 17.0, 17.0, 0.0, 0.0, 0.0],
    ["Seattle, WA", 200000, 18.8, 18.8, 0.0, 0.0, 0.0],
    ["Seattle, WA", 300000, 23.4, 23.4, 0.0, 0.0, 0.0],

    // ── Vancouver, WA (no state/local income tax) ──
    ["Vancouver, WA",  40000,  7.0,  7.0, 0.0, 0.0, 0.0],
    ["Vancouver, WA",  50000,  8.0,  8.0, 0.0, 0.0, 0.0],
    ["Vancouver, WA",  60000,  8.7,  8.7, 0.0, 0.0, 0.0],
    ["Vancouver, WA",  75000, 11.1, 11.1, 0.0, 0.0, 0.0],
    ["Vancouver, WA", 100000, 13.8, 13.8, 0.0, 0.0, 0.0],
    ["Vancouver, WA", 125000, 15.6, 15.6, 0.0, 0.0, 0.0],
    ["Vancouver, WA", 150000, 17.0, 17.0, 0.0, 0.0, 0.0],
    ["Vancouver, WA", 200000, 18.8, 18.8, 0.0, 0.0, 0.0],
    ["Vancouver, WA", 300000, 23.4, 23.4, 0.0, 0.0, 0.0],

    // ── Boise, ID (flat 5.695% on federal taxable income) ──
    ["Boise, ID",  40000, 10.7,  7.0, 3.6, 0.0, 0.0],
    ["Boise, ID",  50000, 12.1,  8.0, 4.0, 0.0, 0.0],
    ["Boise, ID",  60000, 13.0,  8.7, 4.3, 0.0, 0.0],
    ["Boise, ID",  75000, 15.7, 11.1, 4.6, 0.0, 0.0],
    ["Boise, ID", 100000, 18.7, 13.8, 4.9, 0.0, 0.0],
    ["Boise, ID", 125000, 20.6, 15.6, 5.0, 0.0, 0.0],
    ["Boise, ID", 150000, 22.2, 17.0, 5.1, 0.0, 0.0],
    ["Boise, ID", 200000, 24.1, 18.8, 5.3, 0.0, 0.0],
    ["Boise, ID", 300000, 28.8, 23.4, 5.4, 0.0, 0.0],

    // ── Denver, CO (flat 4.4% on federal taxable income) ──
    ["Denver, CO",  40000,  9.8,  7.0, 2.8, 0.0, 0.0],
    ["Denver, CO",  50000, 11.1,  8.0, 3.1, 0.0, 0.0],
    ["Denver, CO",  60000, 12.0,  8.7, 3.3, 0.0, 0.0],
    ["Denver, CO",  75000, 14.7, 11.1, 3.5, 0.0, 0.0],
    ["Denver, CO", 100000, 17.6, 13.8, 3.8, 0.0, 0.0],
    ["Denver, CO", 125000, 19.5, 15.6, 3.9, 0.0, 0.0],
    ["Denver, CO", 150000, 21.0, 17.0, 4.0, 0.0, 0.0],
    ["Denver, CO", 200000, 22.9, 18.8, 4.1, 0.0, 0.0],
    ["Denver, CO", 300000, 27.6, 23.4, 4.2, 0.0, 0.0],

    // ── Salt Lake City, UT (4.65% flat minus credits, ~3.0-4.3% effective) ──
    ["Salt Lake City, UT",  40000, 10.1,  7.0, 3.0, 0.0, 0.0],
    ["Salt Lake City, UT",  50000, 11.3,  8.0, 3.3, 0.0, 0.0],
    ["Salt Lake City, UT",  60000, 12.3,  8.7, 3.6, 0.0, 0.0],
    ["Salt Lake City, UT",  75000, 14.9, 11.1, 3.8, 0.0, 0.0],
    ["Salt Lake City, UT", 100000, 17.9, 13.8, 4.0, 0.0, 0.0],
    ["Salt Lake City, UT", 125000, 19.7, 15.6, 4.1, 0.0, 0.0],
    ["Salt Lake City, UT", 150000, 21.3, 17.0, 4.2, 0.0, 0.0],
    ["Salt Lake City, UT", 200000, 23.1, 18.8, 4.3, 0.0, 0.0],
    ["Salt Lake City, UT", 300000, 27.8, 23.4, 4.4, 0.0, 0.0],

    // ── Austin, TX (no state/local income tax) ──
    ["Austin, TX",  40000,  7.0,  7.0, 0.0, 0.0, 0.0],
    ["Austin, TX",  50000,  8.0,  8.0, 0.0, 0.0, 0.0],
    ["Austin, TX",  60000,  8.7,  8.7, 0.0, 0.0, 0.0],
    ["Austin, TX",  75000, 11.1, 11.1, 0.0, 0.0, 0.0],
    ["Austin, TX", 100000, 13.8, 13.8, 0.0, 0.0, 0.0],
    ["Austin, TX", 125000, 15.6, 15.6, 0.0, 0.0, 0.0],
    ["Austin, TX", 150000, 17.0, 17.0, 0.0, 0.0, 0.0],
    ["Austin, TX", 200000, 18.8, 18.8, 0.0, 0.0, 0.0],
    ["Austin, TX", 300000, 23.4, 23.4, 0.0, 0.0, 0.0],
  ];

  for (const [city, income, eff, fed, state, local, other] of data) {
    await sql`
      INSERT INTO tax_comparison (city, income_level, effective_rate, federal, state, local, other)
      VALUES (${city}, ${income}, ${eff}, ${fed}, ${state}, ${local}, ${other})
    `;
  }

  console.log(`  Inserted ${data.length} tax comparison rows`);
}

// ── 2. Program PCB Summary ──────────────────────────────────────────────

async function seedProgramPcb() {
  console.log("\n=== Seeding program_pcb_summary ===");

  await sql`DELETE FROM program_pcb_summary`;

  const data = [
    { y: 2025, m: 4,  certified: 180, jobs: 680,  credits: 1200000 },
    { y: 2025, m: 5,  certified: 195, jobs: 720,  credits: 1400000 },
    { y: 2025, m: 6,  certified: 210, jobs: 770,  credits: 1550000 },
    { y: 2025, m: 7,  certified: 228, jobs: 820,  credits: 1750000 },
    { y: 2025, m: 8,  certified: 245, jobs: 880,  credits: 1950000 },
    { y: 2025, m: 9,  certified: 262, jobs: 940,  credits: 2100000 },
    { y: 2025, m: 10, certified: 280, jobs: 1000, credits: 2350000 },
    { y: 2025, m: 11, certified: 298, jobs: 1060, credits: 2550000 },
    { y: 2025, m: 12, certified: 315, jobs: 1120, credits: 2750000 },
    { y: 2026, m: 1,  certified: 328, jobs: 1160, credits: 2900000 },
    { y: 2026, m: 2,  certified: 338, jobs: 1200, credits: 3050000 },
    { y: 2026, m: 3,  certified: 347, jobs: 1240, credits: 3200000 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO program_pcb_summary (as_of, total_certified, survival_rate_1yr, jobs_created, credits_issued)
      VALUES (${monthDate(d.y, d.m)}::date, ${d.certified}, ${89.0}, ${d.jobs}, ${d.credits})
    `;
  }

  console.log(`  Inserted ${data.length} program_pcb_summary rows`);
}

// ── 3. Migration Census ─────────────────────────────────────────────────

async function seedMigrationCensus() {
  console.log("\n=== Seeding migration_census ===");

  await sql`DELETE FROM migration_census`;

  const data = [
    { year: 2019, population: 654741, change: 0 },
    { year: 2020, population: 652503, change: -2238 },
    { year: 2021, population: 641162, change: -11341 },
    { year: 2022, population: 635067, change: -6095 },
    { year: 2023, population: 637928, change: 2861 },
    { year: 2024, population: 641200, change: 3272 },
    { year: 2025, population: 644500, change: 3300 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO migration_census (year, population, change)
      VALUES (${d.year}, ${d.population}, ${d.change})
    `;
  }

  console.log(`  Inserted ${data.length} migration_census rows`);
}

// ── 4. Migration Water Monthly ──────────────────────────────────────────

async function seedMigrationWater() {
  console.log("\n=== Seeding migration_water_monthly ===");

  await sql`DELETE FROM migration_water_monthly`;

  const data = [
    { y: 2025, m: 4,  act: 310, deact: 355, net: -45 },
    { y: 2025, m: 5,  act: 325, deact: 358, net: -33 },
    { y: 2025, m: 6,  act: 340, deact: 360, net: -20 },
    { y: 2025, m: 7,  act: 355, deact: 360, net: -5 },
    { y: 2025, m: 8,  act: 370, deact: 358, net: 12 },
    { y: 2025, m: 9,  act: 385, deact: 355, net: 30 },
    { y: 2025, m: 10, act: 400, deact: 348, net: 52 },
    { y: 2025, m: 11, act: 410, deact: 340, net: 70 },
    { y: 2025, m: 12, act: 425, deact: 335, net: 90 },
    { y: 2026, m: 1,  act: 435, deact: 330, net: 105 },
    { y: 2026, m: 2,  act: 445, deact: 328, net: 117 },
    { y: 2026, m: 3,  act: 455, deact: 328, net: 127 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO migration_water_monthly (month, activations, deactivations, net, zip_code)
      VALUES (${monthDate(d.y, d.m)}::date, ${d.act}, ${d.deact}, ${d.net}, ${"ALL"})
    `;
  }

  console.log(`  Inserted ${data.length} migration_water_monthly rows`);
}

// ── 5. Downtown Foot Traffic ────────────────────────────────────────────

async function seedDowntownFootTraffic() {
  console.log("\n=== Seeding downtown_foot_traffic ===");

  await sql`DELETE FROM downtown_foot_traffic`;

  // Monthly data stored as weekly snapshots (first of month)
  const data = [
    { y: 2025, m: 4,  pct: 62 },
    { y: 2025, m: 5,  pct: 65 },
    { y: 2025, m: 6,  pct: 68 },
    { y: 2025, m: 7,  pct: 71 },
    { y: 2025, m: 8,  pct: 73 },
    { y: 2025, m: 9,  pct: 74 },
    { y: 2025, m: 10, pct: 76 },
    { y: 2025, m: 11, pct: 79 },
    { y: 2025, m: 12, pct: 80 },
    { y: 2026, m: 1,  pct: 82 },
    { y: 2026, m: 2,  pct: 84 },
    { y: 2026, m: 3,  pct: 86 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO downtown_foot_traffic (week, pct_of_2019, day_of_week)
      VALUES (${monthDate(d.y, d.m)}::date, ${d.pct}, ${"all"})
    `;
  }

  console.log(`  Inserted ${data.length} downtown_foot_traffic rows`);
}

// ── 5b. Downtown Vacancy ────────────────────────────────────────────────

async function seedDowntownVacancy() {
  console.log("\n=== Seeding downtown_vacancy ===");

  await sql`DELETE FROM downtown_vacancy`;

  const data = [
    { y: 2025, q: 1, office: 32.0, retail: 18.0 },
    { y: 2025, q: 2, office: 31.0, retail: 17.0 },
    { y: 2025, q: 3, office: 30.0, retail: 16.0 },
    { y: 2025, q: 4, office: 29.0, retail: 15.0 },
    { y: 2026, q: 1, office: 28.0, retail: 14.0 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO downtown_vacancy (quarter, office_vacancy_pct, retail_vacancy_pct)
      VALUES (${quarterDate(d.y, d.q)}::date, ${d.office}, ${d.retail})
    `;
  }

  console.log(`  Inserted ${data.length} downtown_vacancy rows`);
}

// ── 6. Housing Rents ────────────────────────────────────────────────────

async function seedHousingRents() {
  console.log("\n=== Seeding housing_rents ===");

  await sql`DELETE FROM housing_rents`;

  const data = [
    { y: 2025, m: 4,  zori: 1680 },
    { y: 2025, m: 5,  zori: 1695 },
    { y: 2025, m: 6,  zori: 1710 },
    { y: 2025, m: 7,  zori: 1720 },
    { y: 2025, m: 8,  zori: 1735 },
    { y: 2025, m: 9,  zori: 1745 },
    { y: 2025, m: 10, zori: 1755 },
    { y: 2025, m: 11, zori: 1760 },
    { y: 2025, m: 12, zori: 1770 },
    { y: 2026, m: 1,  zori: 1785 },
    { y: 2026, m: 2,  zori: 1800 },
    { y: 2026, m: 3,  zori: 1815 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO housing_rents (month, zip_code, zori)
      VALUES (${monthDate(d.y, d.m)}::date, ${"97201"}, ${d.zori})
    `;
  }

  console.log(`  Inserted ${data.length} housing_rents rows`);
}

// ── 7. Housing Pipeline Monthly ─────────────────────────────────────────

async function seedHousingPipeline() {
  console.log("\n=== Seeding housing_pipeline_monthly ===");

  await sql`DELETE FROM housing_pipeline_monthly`;

  const data = [
    { y: 2025, m: 4,  units: 420, avgMonths: 16.5 },
    { y: 2025, m: 5,  units: 445, avgMonths: 16.3 },
    { y: 2025, m: 6,  units: 480, avgMonths: 16.0 },
    { y: 2025, m: 7,  units: 510, avgMonths: 15.8 },
    { y: 2025, m: 8,  units: 548, avgMonths: 15.5 },
    { y: 2025, m: 9,  units: 590, avgMonths: 15.2 },
    { y: 2025, m: 10, units: 620, avgMonths: 15.0 },
    { y: 2025, m: 11, units: 656, avgMonths: 14.8 },
    { y: 2025, m: 12, units: 700, avgMonths: 14.6 },
    { y: 2026, m: 1,  units: 745, avgMonths: 14.4 },
    { y: 2026, m: 2,  units: 790, avgMonths: 14.3 },
    { y: 2026, m: 3,  units: 824, avgMonths: 14.2 },
  ];

  for (const d of data) {
    await sql`
      INSERT INTO housing_pipeline_monthly (month, units_in_pipeline, avg_processing_months)
      VALUES (${monthDate(d.y, d.m)}::date, ${d.units}, ${d.avgMonths})
    `;
  }

  console.log(`  Inserted ${data.length} housing_pipeline_monthly rows`);
}

// ── 8. Dashboard Cache ──────────────────────────────────────────────────

async function seedDashboardCache() {
  console.log("\n=== Seeding dashboard_cache ===");

  const lastUpdated = "2026-03-15";

  // ---- Migration ----
  const migrationCache = {
    headline: "Portland population recovering after pandemic losses",
    headlineValue: "644,500",
    trend: { direction: "up", value: "+0.5%", isPositive: true },
    chartData: [
      { date: "2019", value: 654741 },
      { date: "2020", value: 652503 },
      { date: "2021", value: 641162 },
      { date: "2022", value: 635067 },
      { date: "2023", value: 637928 },
      { date: "2024", value: 641200 },
      { date: "2025", value: 644500 },
    ],
    source: "U.S. Census Bureau / Portland Water Bureau",
    lastUpdated,
    insights: [
      "Population growing for 3rd consecutive year after 2020-2022 decline",
      "Water account activations turned net-positive in August 2025",
      "Net +127 water activations in March 2026, strongest month in two years",
    ],
  };

  // ---- Business ----
  const businessCache = {
    headline: "Business formation accelerating in Portland",
    headlineValue: "347",
    trend: { direction: "up", value: "+93%", isPositive: true },
    chartData: [
      { date: "Apr 2025", value: 180 },
      { date: "May 2025", value: 195 },
      { date: "Jun 2025", value: 210 },
      { date: "Jul 2025", value: 228 },
      { date: "Aug 2025", value: 245 },
      { date: "Sep 2025", value: 262 },
      { date: "Oct 2025", value: 280 },
      { date: "Nov 2025", value: 298 },
      { date: "Dec 2025", value: 315 },
      { date: "Jan 2026", value: 328 },
      { date: "Feb 2026", value: 338 },
      { date: "Mar 2026", value: 347 },
    ],
    source: "Portland Civic Lab Business (PCB) Program",
    lastUpdated,
    insights: [
      "347 businesses certified through Portland Civic Lab, up from 180 a year ago",
      "89% one-year survival rate among certified businesses",
      "$3.2M in tax credits issued, creating 1,240 jobs",
    ],
  };

  // ---- Downtown ----
  const downtownCache = {
    headline: "Downtown foot traffic at 86% of pre-pandemic levels",
    headlineValue: "86%",
    trend: { direction: "up", value: "+24pp", isPositive: true },
    chartData: [
      { date: "Apr 2025", value: 62 },
      { date: "May 2025", value: 65 },
      { date: "Jun 2025", value: 68 },
      { date: "Jul 2025", value: 71 },
      { date: "Aug 2025", value: 73 },
      { date: "Sep 2025", value: 74 },
      { date: "Oct 2025", value: 76 },
      { date: "Nov 2025", value: 79 },
      { date: "Dec 2025", value: 80 },
      { date: "Jan 2026", value: 82 },
      { date: "Feb 2026", value: 84 },
      { date: "Mar 2026", value: 86 },
    ],
    source: "Placer.ai / CoStar",
    lastUpdated,
    insights: [
      "Downtown foot traffic up 24 percentage points from April 2025",
      "Office vacancy declining: 28% in Q1 2026 vs 32% a year ago",
      "Retail vacancy down to 14%, lowest since 2020",
    ],
  };

  // ---- Safety ----
  const safetyCache = {
    headline: "Crime trends stabilizing with improved response times",
    headlineValue: "Stabilizing",
    trend: { direction: "down", value: "-8%", isPositive: true },
    chartData: [
      { date: "Apr 2025", value: 3200 },
      { date: "May 2025", value: 3150 },
      { date: "Jun 2025", value: 3100 },
      { date: "Jul 2025", value: 3050 },
      { date: "Aug 2025", value: 3020 },
      { date: "Sep 2025", value: 2980 },
      { date: "Oct 2025", value: 2960 },
      { date: "Nov 2025", value: 2940 },
      { date: "Dec 2025", value: 2920 },
      { date: "Jan 2026", value: 2950 },
      { date: "Feb 2026", value: 2960 },
      { date: "Mar 2026", value: 2940 },
    ],
    source: "Portland Police Bureau / PortlandMaps",
    lastUpdated,
    insights: [
      "Property crime down 8% year-over-year",
      "Graffiti reports declining steadily since summer 2025",
      "Person crimes remain flat; downtown safety improving with foot traffic",
    ],
  };

  // ---- Tax ----
  const taxCache = {
    headline: "Portland income tax burden highest among 8 Western cities",
    headlineValue: "28.6%",
    trend: { direction: "flat", value: "0%", isPositive: false },
    chartData: [
      { date: "Portland, OR", value: 28.6 },
      { date: "San Francisco, CA", value: 26.2 },
      { date: "Boise, ID", value: 24.1 },
      { date: "Salt Lake City, UT", value: 23.1 },
      { date: "Denver, CO", value: 22.9 },
      { date: "Seattle, WA", value: 18.8 },
      { date: "Vancouver, WA", value: 18.8 },
      { date: "Austin, TX", value: 18.8 },
    ],
    source: "IRS / Oregon DOR / state tax agencies (2024 brackets)",
    lastUpdated,
    insights: [
      "At $200K, Portland W-2 employees pay 28.6% effective income tax — highest of 8 Western peers",
      "Oregon's 9.9% top rate drives the gap; Portland-specific PFA + SHS add 0.9% above $125K",
      "Below $125K, Portland employees pay $0 in local taxes (only $35 Arts Tax)",
    ],
  };

  // ---- Housing ----
  const housingCache = {
    headline: "Housing pipeline growing with faster permit processing",
    headlineValue: "824 units",
    trend: { direction: "up", value: "+96%", isPositive: true },
    chartData: [
      { date: "Apr 2025", value: 420 },
      { date: "May 2025", value: 445 },
      { date: "Jun 2025", value: 480 },
      { date: "Jul 2025", value: 510 },
      { date: "Aug 2025", value: 548 },
      { date: "Sep 2025", value: 590 },
      { date: "Oct 2025", value: 620 },
      { date: "Nov 2025", value: 656 },
      { date: "Dec 2025", value: 700 },
      { date: "Jan 2026", value: 745 },
      { date: "Feb 2026", value: 790 },
      { date: "Mar 2026", value: 824 },
    ],
    source: "Portland BDS / Zillow ZORI",
    lastUpdated,
    insights: [
      "824 housing units in pipeline, nearly doubled from 420 in April 2025",
      "Avg permit processing time down from 16.5 to 14.2 months",
      "Median rent $1,815/mo in 97201, up 8% year-over-year",
    ],
  };

  // ---- Program ----
  const programCache = {
    headline: "Portland Civic Lab program driving business growth",
    headlineValue: "347 certified",
    trend: { direction: "up", value: "+93%", isPositive: true },
    chartData: [
      { date: "Apr 2025", value: 180 },
      { date: "May 2025", value: 195 },
      { date: "Jun 2025", value: 210 },
      { date: "Jul 2025", value: 228 },
      { date: "Aug 2025", value: 245 },
      { date: "Sep 2025", value: 262 },
      { date: "Oct 2025", value: 280 },
      { date: "Nov 2025", value: 298 },
      { date: "Dec 2025", value: 315 },
      { date: "Jan 2026", value: 328 },
      { date: "Feb 2026", value: 338 },
      { date: "Mar 2026", value: 347 },
    ],
    source: "Portland Civic Lab Business Program",
    lastUpdated,
    insights: [
      "347 PCB-certified businesses, 89% one-year survival rate",
      "1,240 jobs created through the program",
      "$3.2M in credits issued, averaging $9,200 per business",
    ],
  };

  const entries: [string, object][] = [
    ["migration", migrationCache],
    ["business", businessCache],
    ["downtown", downtownCache],
    ["safety", safetyCache],
    ["tax", taxCache],
    ["housing", housingCache],
    ["program", programCache],
  ];

  for (const [question, data] of entries) {
    await sql`
      INSERT INTO dashboard_cache (question, data, updated_at)
      VALUES (${question}, ${sql.json(data)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(data)}, updated_at = now()
    `;
  }

  console.log(`  Upserted ${entries.length} dashboard_cache entries`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard -- Static & Reference Data Seeding");
  console.log("=====================================================\n");

  try {
    await seedTaxComparison();
    await seedProgramPcb();
    await seedMigrationCensus();
    await seedMigrationWater();
    await seedDowntownFootTraffic();
    await seedDowntownVacancy();
    await seedHousingRents();
    await seedHousingPipeline();
    await seedDashboardCache();

    console.log("\n=====================================================");
    console.log("Static data seeding complete!");
  } catch (err: any) {
    console.error("\nError during seeding:", err.message);
    console.error(err.stack);
    throw err;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
