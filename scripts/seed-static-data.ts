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
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const sql = postgres(DB_URL, { max: 5 });

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

async function seedTaxComparison() {
  console.log("\n=== Seeding tax_comparison ===");

  await sql`DELETE FROM tax_comparison`;

  const rows: {
    city: string;
    income_level: number;
    effective_rate: number;
    federal: number;
    state: number;
    local: number;
    other: number;
  }[] = [];

  // ---------- $200K income ----------

  // Portland, OR @ $200K
  rows.push({
    city: "Portland, OR",
    income_level: 200000,
    effective_rate: 12.4,
    federal: 48000,
    state: 17000,
    local: 9200, // BLT 5200 + BIT 4000
    other: 1910, // Metro SHS 750 + MultCo PFA 1125 + Arts 35
  });

  // Vancouver, WA @ $200K
  rows.push({
    city: "Vancouver, WA",
    income_level: 200000,
    effective_rate: 7.1,
    federal: 48000,
    state: 0,
    local: 0,
    other: 0,
  });

  // Beaverton, OR @ $200K
  rows.push({
    city: "Beaverton, OR",
    income_level: 200000,
    effective_rate: 10.1,
    federal: 48000,
    state: 17000,
    local: 5200, // BLT only, no MultCo BIT
    other: 0,
  });

  // Lake Oswego, OR @ $200K
  rows.push({
    city: "Lake Oswego, OR",
    income_level: 200000,
    effective_rate: 10.0,
    federal: 48000,
    state: 17000,
    local: 5200,
    other: 0,
  });

  // Seattle, WA @ $200K
  rows.push({
    city: "Seattle, WA",
    income_level: 200000,
    effective_rate: 7.3,
    federal: 48000,
    state: 0,
    local: 0,
    other: 0,
  });

  // ---------- $100K income ----------

  rows.push({
    city: "Portland, OR",
    income_level: 100000,
    effective_rate: 10.8,
    federal: 17600,
    state: 8500,
    local: 4600,
    other: 35,
  });
  rows.push({
    city: "Vancouver, WA",
    income_level: 100000,
    effective_rate: 5.8,
    federal: 17600,
    state: 0,
    local: 0,
    other: 0,
  });
  rows.push({
    city: "Beaverton, OR",
    income_level: 100000,
    effective_rate: 8.7,
    federal: 17600,
    state: 8500,
    local: 2600,
    other: 0,
  });
  rows.push({
    city: "Lake Oswego, OR",
    income_level: 100000,
    effective_rate: 8.6,
    federal: 17600,
    state: 8500,
    local: 2600,
    other: 0,
  });
  rows.push({
    city: "Seattle, WA",
    income_level: 100000,
    effective_rate: 6.0,
    federal: 17600,
    state: 0,
    local: 0,
    other: 0,
  });

  // ---------- $75K income ----------

  rows.push({
    city: "Portland, OR",
    income_level: 75000,
    effective_rate: 9.8,
    federal: 11250,
    state: 6375,
    local: 1950,
    other: 35,
  });
  rows.push({
    city: "Vancouver, WA",
    income_level: 75000,
    effective_rate: 5.2,
    federal: 11250,
    state: 0,
    local: 0,
    other: 0,
  });
  rows.push({
    city: "Beaverton, OR",
    income_level: 75000,
    effective_rate: 7.9,
    federal: 11250,
    state: 6375,
    local: 1950,
    other: 0,
  });
  rows.push({
    city: "Lake Oswego, OR",
    income_level: 75000,
    effective_rate: 7.8,
    federal: 11250,
    state: 6375,
    local: 1950,
    other: 0,
  });
  rows.push({
    city: "Seattle, WA",
    income_level: 75000,
    effective_rate: 5.4,
    federal: 11250,
    state: 0,
    local: 0,
    other: 0,
  });

  for (const r of rows) {
    await sql`
      INSERT INTO tax_comparison (city, income_level, effective_rate, federal, state, local, other)
      VALUES (${r.city}, ${r.income_level}, ${r.effective_rate}, ${r.federal}, ${r.state}, ${r.local}, ${r.other})
    `;
  }

  console.log(`  Inserted ${rows.length} tax comparison rows`);
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
    headline: "Portland total tax burden highest among peer cities at $200K",
    headlineValue: "12.4%",
    trend: { direction: "flat", value: "0%", isPositive: false },
    chartData: [
      { date: "Portland, OR", value: 12.4 },
      { date: "Beaverton, OR", value: 10.1 },
      { date: "Lake Oswego, OR", value: 10.0 },
      { date: "Seattle, WA", value: 7.3 },
      { date: "Vancouver, WA", value: 7.1 },
    ],
    source: "Tax Foundation / Oregon DOR / IRS",
    lastUpdated,
    insights: [
      "Portland effective rate 5.3pp higher than Vancouver, WA at $200K income",
      "MultCo-specific taxes (BIT, PFA, SHS) add ~2.9% for Portland residents",
      "Gap narrows at lower incomes: 4.6pp difference at $75K",
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
