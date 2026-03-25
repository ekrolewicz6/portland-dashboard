/**
 * seed-homelessness.ts
 *
 * Comprehensive seed script for the homelessness schema.
 * Creates and populates all tables with real published data from:
 *   - PSU 2025 Tri-County PIT Count
 *   - JOHS Shelter Capacity Reports
 *   - SHS Annual Reports (Year 4 / FY2024-25)
 *   - Multnomah County Medical Examiner / Domicile Unknown reports
 *   - HMIS By-Name List
 *   - Evicted in Oregon / HRAC PSU (circuit court data)
 *   - Metro SHS Revenue Forecast (Fall 2025)
 *   - HRAC/PSU Regional Prevalence Study (2019)
 *   - Home Forward vacancy (news reports, contested)
 *
 * Usage: npx tsx scripts/seed-homelessness.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

// ── 1. PIT Counts (2025 update) ──────────────────────────────────────────

const PIT_2025 = {
  year: 2025,
  coc_code: "OR-501",
  coc_name: "Portland, Gresham/Multnomah County CoC",
  total_homeless: 10526,
  sheltered: 4525,
  unsheltered: 7509,
  source: "PSU 2025 Tri-County PIT Count",
};

// ── 2. Shelter Capacity ──────────────────────────────────────────────────

const SHELTER_CAPACITY = [
  {
    quarter: "2024-Q1",
    total_beds: 1703,
    county_24hr_beds: 963,
    city_overnight_beds: 740,
    utilization_pct: 90.5,
    source: "JOHS Shelter Capacity Report Q1 2024",
  },
  {
    quarter: "2024-Q2",
    total_beds: 1992,
    county_24hr_beds: 1127,
    city_overnight_beds: 865,
    utilization_pct: 91.2,
    source: "JOHS Shelter Capacity Report Q2 2024",
  },
  {
    quarter: "2024-Q3",
    total_beds: 2133,
    county_24hr_beds: 1210,
    city_overnight_beds: 923,
    utilization_pct: 92.0,
    source: "JOHS Shelter Capacity Report Q3 2024",
  },
  {
    quarter: "2024-Q4",
    total_beds: 2068,
    county_24hr_beds: 1175,
    city_overnight_beds: 893,
    utilization_pct: 91.5,
    source: "JOHS Shelter Capacity Report Q4 2024",
  },
];

// ── 3. Housing Placements ────────────────────────────────────────────────

const HOUSING_PLACEMENTS = [
  {
    fiscal_year: "FY2022",
    total_placements: 4406,
    shs_placements: null as number | null,
    rapid_rehousing: null as number | null,
    psh_placements: null as number | null,
    evictions_prevented: null as number | null,
    source: "JOHS Annual Report FY2022",
  },
  {
    fiscal_year: "FY2023",
    total_placements: 4266,
    shs_placements: null as number | null,
    rapid_rehousing: null as number | null,
    psh_placements: null as number | null,
    evictions_prevented: null as number | null,
    source: "JOHS Annual Report FY2023",
  },
  {
    fiscal_year: "FY2024",
    total_placements: 5477,
    shs_placements: 2322,
    rapid_rehousing: 2890,
    psh_placements: null as number | null,
    evictions_prevented: null as number | null,
    source: "SHS Annual Report FY2024",
  },
  {
    fiscal_year: "FY2025",
    total_placements: 6160,
    shs_placements: 2599,
    rapid_rehousing: null as number | null,
    psh_placements: 244,
    evictions_prevented: 17589,
    source: "SHS Annual Report FY2025 (partial year)",
  },
];

// ── 4. Overdose Deaths ───────────────────────────────────────────────────

const OVERDOSE_DEATHS = [
  {
    year: 2017,
    total_od_deaths_homeless: null as number | null,
    fentanyl_deaths_homeless: 1,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report",
  },
  {
    year: 2018,
    total_od_deaths_homeless: null as number | null,
    fentanyl_deaths_homeless: 2,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report",
  },
  {
    year: 2019,
    total_od_deaths_homeless: null as number | null,
    fentanyl_deaths_homeless: 2,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report",
  },
  {
    year: 2020,
    total_od_deaths_homeless: null as number | null,
    fentanyl_deaths_homeless: 4,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report",
  },
  {
    year: 2021,
    total_od_deaths_homeless: null as number | null,
    fentanyl_deaths_homeless: 36,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report",
  },
  {
    year: 2022,
    total_od_deaths_homeless: 123,
    fentanyl_deaths_homeless: 91,
    total_homeless_deaths: null as number | null,
    county_wide_opioid_deaths: null as number | null,
    source: "Multnomah County Domicile Unknown Report 2022",
  },
  {
    year: 2023,
    total_od_deaths_homeless: 282,
    fentanyl_deaths_homeless: 251,
    total_homeless_deaths: 456,
    county_wide_opioid_deaths: 483,
    source: "Multnomah County Domicile Unknown Report 2023",
  },
  {
    year: 2024,
    total_od_deaths_homeless: 214,
    fentanyl_deaths_homeless: 183,
    total_homeless_deaths: 372,
    county_wide_opioid_deaths: 379,
    source: "Multnomah County Domicile Unknown Report 2024",
  },
];

// ── 5. SHS Funding ───────────────────────────────────────────────────────

const SHS_FUNDING = [
  {
    year: 2021,
    tax_revenue: 240_000_000,
    spending: null as number | null,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro",
  },
  {
    year: 2022,
    tax_revenue: 337_000_000,
    spending: 55_900_000,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro (Year 1)",
  },
  {
    year: 2023,
    tax_revenue: 357_000_000,
    spending: 149_100_000,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro (Year 2)",
  },
  {
    year: 2024,
    tax_revenue: 255_000_000,
    spending: 294_100_000,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro (Year 3)",
  },
  {
    year: 2025,
    tax_revenue: null as number | null,
    spending: 424_900_000,
    psh_units_added: 244,
    psh_units_cumulative: 1541,
    source: "SHS Annual Report / Metro (Year 4)",
  },
];

// ── 6. By-Name List ──────────────────────────────────────────────────────

const BY_NAME_LIST = [
  {
    month: "2025-01-01",
    total_on_list: 14361,
    new_entries: 1277,
    exits_to_housing: 865,
    source: "HMIS By-Name List January 2025",
  },
];

// ── 7. Eviction Filings (NEW — Evicted in Oregon / HRAC PSU) ────────────
// Source: https://www.evictedinoregon.com/data-tables
// Circuit court data only. Clackamas not available (justice courts).

const EVICTION_FILINGS = [
  // Multnomah County
  { month: "2025-03-01", county: "Multnomah", filings: 896, filing_rate_per_100: 7.0 },
  { month: "2025-04-01", county: "Multnomah", filings: 1072, filing_rate_per_100: 7.0 },
  { month: "2025-05-01", county: "Multnomah", filings: 974, filing_rate_per_100: 7.0 },
  { month: "2025-06-01", county: "Multnomah", filings: 929, filing_rate_per_100: 7.0 },
  { month: "2025-07-01", county: "Multnomah", filings: 1057, filing_rate_per_100: 7.0 },
  { month: "2025-08-01", county: "Multnomah", filings: 1083, filing_rate_per_100: 7.0 },
  { month: "2025-09-01", county: "Multnomah", filings: 999, filing_rate_per_100: 7.0 },
  { month: "2025-10-01", county: "Multnomah", filings: 1152, filing_rate_per_100: 7.0 },
  { month: "2025-11-01", county: "Multnomah", filings: 786, filing_rate_per_100: 7.0 },
  { month: "2025-12-01", county: "Multnomah", filings: 1131, filing_rate_per_100: 7.0 },
  { month: "2026-01-01", county: "Multnomah", filings: 1132, filing_rate_per_100: 7.0 },
  { month: "2026-02-01", county: "Multnomah", filings: 916, filing_rate_per_100: 7.0 },
  // Washington County
  { month: "2025-03-01", county: "Washington", filings: 385, filing_rate_per_100: 5.0 },
  { month: "2025-04-01", county: "Washington", filings: 415, filing_rate_per_100: 5.0 },
  { month: "2025-05-01", county: "Washington", filings: 400, filing_rate_per_100: 5.0 },
  { month: "2025-06-01", county: "Washington", filings: 401, filing_rate_per_100: 5.0 },
  { month: "2025-07-01", county: "Washington", filings: 406, filing_rate_per_100: 5.0 },
  { month: "2025-08-01", county: "Washington", filings: 425, filing_rate_per_100: 5.0 },
  { month: "2025-09-01", county: "Washington", filings: 421, filing_rate_per_100: 5.0 },
  { month: "2025-10-01", county: "Washington", filings: 440, filing_rate_per_100: 5.0 },
  { month: "2025-11-01", county: "Washington", filings: 327, filing_rate_per_100: 5.0 },
  { month: "2025-12-01", county: "Washington", filings: 421, filing_rate_per_100: 5.0 },
  { month: "2026-01-01", county: "Washington", filings: 488, filing_rate_per_100: 5.0 },
  { month: "2026-02-01", county: "Washington", filings: 392, filing_rate_per_100: 5.0 },
  // Oregon statewide
  { month: "2025-03-01", county: "Oregon (statewide)", filings: 2158, filing_rate_per_100: 5.0 },
  { month: "2025-04-01", county: "Oregon (statewide)", filings: 2426, filing_rate_per_100: 5.0 },
  { month: "2025-05-01", county: "Oregon (statewide)", filings: 2322, filing_rate_per_100: 5.0 },
  { month: "2025-06-01", county: "Oregon (statewide)", filings: 2258, filing_rate_per_100: 5.0 },
  { month: "2025-07-01", county: "Oregon (statewide)", filings: 2592, filing_rate_per_100: 5.0 },
  { month: "2025-08-01", county: "Oregon (statewide)", filings: 2521, filing_rate_per_100: 5.0 },
  { month: "2025-09-01", county: "Oregon (statewide)", filings: 2455, filing_rate_per_100: 5.0 },
  { month: "2025-10-01", county: "Oregon (statewide)", filings: 2660, filing_rate_per_100: 5.0 },
  { month: "2025-11-01", county: "Oregon (statewide)", filings: 1884, filing_rate_per_100: 5.0 },
  { month: "2025-12-01", county: "Oregon (statewide)", filings: 2574, filing_rate_per_100: 5.0 },
  { month: "2026-01-01", county: "Oregon (statewide)", filings: 2750, filing_rate_per_100: 5.0 },
  { month: "2026-02-01", county: "Oregon (statewide)", filings: 2241, filing_rate_per_100: 5.0 },
];

// ── 8. SHS Spending by Intervention Type (NEW) ──────────────────────────
// Source: Metro SHS Regional Annual Report FY2024-25 (Year 4)
// Year 4 outcome data used to construct intervention breakdown

const SHS_BY_TYPE = [
  // Year 4 (FY2025) — outcomes from the annual report
  { fiscal_year: "FY2025", intervention_type: "psh", households_served: 1394, housing_placements: 1394, source: "Metro SHS Year 4 Annual Report" },
  { fiscal_year: "FY2025", intervention_type: "rapid_rehousing", households_served: 1404, housing_placements: 1404, source: "Metro SHS Year 4 Annual Report" },
  { fiscal_year: "FY2025", intervention_type: "prevention", households_served: 4064, housing_placements: null as number | null, source: "Metro SHS Year 4 Annual Report" },
  { fiscal_year: "FY2025", intervention_type: "shelter", households_served: 2499, housing_placements: null as number | null, source: "Metro SHS Year 4 Annual Report — beds created/sustained" },
];

// ── 9. SHS by County (NEW) ──────────────────────────────────────────────
// Source: Metro SHS Regional Annual Report FY2024-25 (Year 4)

const SHS_BY_COUNTY = [
  // FY2025 Year 4 — allocations from revenue forecast, outcomes from annual report
  {
    fiscal_year: "FY2025",
    county: "Multnomah",
    allocation: 145_900_000,
    spent: 204_100_000, // contract value (includes multi-year)
    households_placed: 1695, // 715 PSH + 842 RRH + 138 other permanent
    source: "Metro SHS Year 4 Annual Report",
  },
  {
    fiscal_year: "FY2025",
    county: "Washington",
    allocation: 107_300_000,
    spent: null as number | null,
    households_placed: 869, // 498 PSH + 371 RRH
    source: "Metro SHS Year 4 Annual Report",
  },
  {
    fiscal_year: "FY2025",
    county: "Clackamas",
    allocation: 68_600_000,
    spent: 38_600_000, // contract value
    households_placed: 372, // 181 PSH + 191 RRH
    source: "Metro SHS Year 4 Annual Report",
  },
  // FY2026 forecast
  {
    fiscal_year: "FY2026",
    county: "Multnomah",
    allocation: 145_900_000,
    spent: null as number | null,
    households_placed: null as number | null,
    source: "Metro SHS Revenue Forecast Fall 2025",
  },
  {
    fiscal_year: "FY2026",
    county: "Washington",
    allocation: 107_300_000,
    spent: null as number | null,
    households_placed: null as number | null,
    source: "Metro SHS Revenue Forecast Fall 2025",
  },
  {
    fiscal_year: "FY2026",
    county: "Clackamas",
    allocation: 68_600_000,
    spent: null as number | null,
    households_placed: null as number | null,
    source: "Metro SHS Revenue Forecast Fall 2025",
  },
];

// ── 10. Affordable Housing Vacancy (NEW — news reporting, contested) ────

const AFFORDABLE_VACANCY = [
  {
    as_of: "2025-11-01",
    source: "Willamette Week / KATU investigation",
    total_units: null as number | null,
    vacant_units: 955,
    vacancy_pct: 14.0,
    avg_days_to_fill: 185,
    notes: "Home Forward public housing. $8.4M in foregone rent. Home Forward disputes some figures.",
  },
  {
    as_of: "2025-12-01",
    source: "Home Forward (response)",
    total_units: null as number | null,
    vacant_units: null as number | null,
    vacancy_pct: 11.0,
    avg_days_to_fill: null as number | null,
    notes: "Home Forward stated vacancy declined to ~11% after investigation coverage.",
  },
];

// ── 11. Context Stats (HRAC prevalence, federal risks, retention) ────────

const CONTEXT_STATS = [
  {
    metric: "hrac_annual_homeless",
    value: "38000",
    context: "Annual count of people experiencing homelessness in tri-county area (vs PIT single-night count). Based on 2017 data.",
    source: "HRAC/PSU Regional Homelessness & Housing Insecurity Study (2019)",
    as_of_date: "2019-08-01",
  },
  {
    metric: "hrac_at_risk_households",
    value: "107039",
    context: "Households housing insecure or at risk of homelessness across Multnomah, Clackamas, Washington counties.",
    source: "HRAC/PSU Regional Homelessness & Housing Insecurity Study (2019)",
    as_of_date: "2019-08-01",
  },
  {
    metric: "shs_cumulative_housed",
    value: "14936",
    context: "People moved into permanent housing through SHS-funded programs, Years 1-4 cumulative.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "shs_psh_retention",
    value: "0.92",
    context: "PSH retention rate — 92% remain in stable housing after 1 year. Return to homelessness rate: 3%.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "shs_rrh_retention",
    value: "0.86",
    context: "Rapid rehousing retention rate — 86% remain in stable housing. Return to homelessness rate: 6%.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "psh_need_regional",
    value: "8117",
    context: "Estimated regional PSH need (Year 4), up from 6,818 baseline in 2021. Need growing despite placements.",
    source: "Metro SHS Regional Annual Report FY2024-25, Figure 2.3",
    as_of_date: "2026-03-18",
  },
  {
    metric: "federal_coc_cuts_households",
    value: "1109",
    context: "Federal CoC cuts will eliminate housing for ~1,109 households annually.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "federal_ehv_vouchers_eliminated",
    value: "546",
    context: "Emergency Housing Voucher termination eliminates ~546 vouchers regionally.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "shs_pct_poc_served",
    value: "0.56",
    context: "56% of people served by SHS are people of color. POC: 52% PSH, 61% RRH, 66% prevention, 41% shelter.",
    source: "Metro SHS Regional Annual Report FY2024-25",
    as_of_date: "2026-03-18",
  },
  {
    metric: "shs_tax_expires",
    value: "TY2030",
    context: "SHS tax expires after Tax Year 2030 (FY2031-32 residual collections only) unless reauthorized by voters.",
    source: "Metro SHS Revenue Forecast Fall 2025",
    as_of_date: "2026-01-01",
  },
  {
    metric: "eviction_jan_2026_statewide",
    value: "2750",
    context: "January 2026: highest monthly eviction filings in Oregon during the tracking period (Mar 2025 - Feb 2026). Multnomah: 1,132, Washington: 488.",
    source: "Evicted in Oregon / HRAC PSU (circuit court data)",
    as_of_date: "2026-03-15",
  },
];

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Homelessness Data Seed");
  console.log("=============================================\n");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Ensure schema exists
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS homelessness`);

    // ── 1. Update pit_counts with 2025 data ────────────────────────────

    console.log("1. Updating homelessness.pit_counts with 2025 data...");
    await sql`
      INSERT INTO homelessness.pit_counts
        (year, coc_code, coc_name, total_homeless, sheltered, unsheltered, source)
      VALUES (
        ${PIT_2025.year}, ${PIT_2025.coc_code}, ${PIT_2025.coc_name},
        ${PIT_2025.total_homeless}, ${PIT_2025.sheltered}, ${PIT_2025.unsheltered},
        ${PIT_2025.source}
      )
      ON CONFLICT (year, coc_code) DO UPDATE SET
        total_homeless = EXCLUDED.total_homeless,
        sheltered = EXCLUDED.sheltered,
        unsheltered = EXCLUDED.unsheltered,
        source = EXCLUDED.source
    `;
    console.log("   Inserted/updated 2025 PIT count record.");

    // ── 2. Create and seed shelter_capacity ─────────────────────────────

    console.log("\n2. Creating homelessness.shelter_capacity...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.shelter_capacity (
        id SERIAL PRIMARY KEY,
        quarter TEXT NOT NULL,
        total_beds INT,
        county_24hr_beds INT,
        city_overnight_beds INT,
        utilization_pct NUMERIC(5,1),
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(quarter)
      )
    `);

    let shelterInserted = 0;
    for (const row of SHELTER_CAPACITY) {
      await sql`
        INSERT INTO homelessness.shelter_capacity
          (quarter, total_beds, county_24hr_beds, city_overnight_beds, utilization_pct, source)
        VALUES (
          ${row.quarter}, ${row.total_beds}, ${row.county_24hr_beds},
          ${row.city_overnight_beds}, ${row.utilization_pct}, ${row.source}
        )
        ON CONFLICT (quarter) DO UPDATE SET
          total_beds = EXCLUDED.total_beds,
          county_24hr_beds = EXCLUDED.county_24hr_beds,
          city_overnight_beds = EXCLUDED.city_overnight_beds,
          utilization_pct = EXCLUDED.utilization_pct,
          source = EXCLUDED.source
      `;
      shelterInserted++;
    }
    console.log(`   Inserted ${shelterInserted} shelter capacity records.`);

    // ── 3. Create and seed housing_placements ───────────────────────────

    console.log("\n3. Creating homelessness.housing_placements...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.housing_placements (
        id SERIAL PRIMARY KEY,
        fiscal_year TEXT NOT NULL,
        total_placements INT,
        shs_placements INT,
        rapid_rehousing INT,
        psh_placements INT,
        evictions_prevented INT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(fiscal_year)
      )
    `);

    let housingInserted = 0;
    for (const row of HOUSING_PLACEMENTS) {
      await sql`
        INSERT INTO homelessness.housing_placements
          (fiscal_year, total_placements, shs_placements, rapid_rehousing,
           psh_placements, evictions_prevented, source)
        VALUES (
          ${row.fiscal_year}, ${row.total_placements}, ${row.shs_placements},
          ${row.rapid_rehousing}, ${row.psh_placements}, ${row.evictions_prevented},
          ${row.source}
        )
        ON CONFLICT (fiscal_year) DO UPDATE SET
          total_placements = EXCLUDED.total_placements,
          shs_placements = EXCLUDED.shs_placements,
          rapid_rehousing = EXCLUDED.rapid_rehousing,
          psh_placements = EXCLUDED.psh_placements,
          evictions_prevented = EXCLUDED.evictions_prevented,
          source = EXCLUDED.source
      `;
      housingInserted++;
    }
    console.log(`   Inserted ${housingInserted} housing placement records.`);

    // ── 4. Create and seed overdose_deaths ──────────────────────────────

    console.log("\n4. Creating homelessness.overdose_deaths...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.overdose_deaths (
        id SERIAL PRIMARY KEY,
        year INT NOT NULL,
        total_od_deaths_homeless INT,
        fentanyl_deaths_homeless INT,
        total_homeless_deaths INT,
        county_wide_opioid_deaths INT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(year)
      )
    `);

    let odInserted = 0;
    for (const row of OVERDOSE_DEATHS) {
      await sql`
        INSERT INTO homelessness.overdose_deaths
          (year, total_od_deaths_homeless, fentanyl_deaths_homeless,
           total_homeless_deaths, county_wide_opioid_deaths, source)
        VALUES (
          ${row.year}, ${row.total_od_deaths_homeless}, ${row.fentanyl_deaths_homeless},
          ${row.total_homeless_deaths}, ${row.county_wide_opioid_deaths}, ${row.source}
        )
        ON CONFLICT (year) DO UPDATE SET
          total_od_deaths_homeless = EXCLUDED.total_od_deaths_homeless,
          fentanyl_deaths_homeless = EXCLUDED.fentanyl_deaths_homeless,
          total_homeless_deaths = EXCLUDED.total_homeless_deaths,
          county_wide_opioid_deaths = EXCLUDED.county_wide_opioid_deaths,
          source = EXCLUDED.source
      `;
      odInserted++;
    }
    console.log(`   Inserted ${odInserted} overdose death records.`);

    // ── 5. Create and seed shs_funding ──────────────────────────────────

    console.log("\n5. Creating homelessness.shs_funding...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.shs_funding (
        id SERIAL PRIMARY KEY,
        year INT NOT NULL,
        tax_revenue BIGINT,
        spending BIGINT,
        psh_units_added INT,
        psh_units_cumulative INT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(year)
      )
    `);

    let fundingInserted = 0;
    for (const row of SHS_FUNDING) {
      await sql`
        INSERT INTO homelessness.shs_funding
          (year, tax_revenue, spending, psh_units_added, psh_units_cumulative, source)
        VALUES (
          ${row.year}, ${row.tax_revenue}, ${row.spending},
          ${row.psh_units_added}, ${row.psh_units_cumulative}, ${row.source}
        )
        ON CONFLICT (year) DO UPDATE SET
          tax_revenue = EXCLUDED.tax_revenue,
          spending = EXCLUDED.spending,
          psh_units_added = EXCLUDED.psh_units_added,
          psh_units_cumulative = EXCLUDED.psh_units_cumulative,
          source = EXCLUDED.source
      `;
      fundingInserted++;
    }
    console.log(`   Inserted ${fundingInserted} SHS funding records.`);

    // ── 6. Create and seed by_name_list ──────────────────────────────────

    console.log("\n6. Creating homelessness.by_name_list...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.by_name_list (
        id SERIAL PRIMARY KEY,
        month DATE NOT NULL,
        total_on_list INT,
        new_entries INT,
        exits_to_housing INT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(month)
      )
    `);

    let bnlInserted = 0;
    for (const row of BY_NAME_LIST) {
      await sql`
        INSERT INTO homelessness.by_name_list
          (month, total_on_list, new_entries, exits_to_housing, source)
        VALUES (
          ${row.month}::date, ${row.total_on_list}, ${row.new_entries},
          ${row.exits_to_housing}, ${row.source}
        )
        ON CONFLICT (month) DO UPDATE SET
          total_on_list = EXCLUDED.total_on_list,
          new_entries = EXCLUDED.new_entries,
          exits_to_housing = EXCLUDED.exits_to_housing,
          source = EXCLUDED.source
      `;
      bnlInserted++;
    }
    console.log(`   Inserted ${bnlInserted} by-name list records.`);

    // ── 7. Create and seed eviction_filings (NEW) ───────────────────────

    console.log("\n7. Creating homelessness.eviction_filings...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.eviction_filings (
        id SERIAL PRIMARY KEY,
        month DATE NOT NULL,
        county TEXT NOT NULL,
        filings INT,
        filing_rate_per_100 NUMERIC(5,2),
        default_judgments INT,
        stipulated_agreements INT,
        source TEXT DEFAULT 'Evicted in Oregon / HRAC PSU',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(month, county)
      )
    `);

    let evictionInserted = 0;
    for (const row of EVICTION_FILINGS) {
      await sql`
        INSERT INTO homelessness.eviction_filings
          (month, county, filings, filing_rate_per_100)
        VALUES (
          ${row.month}::date, ${row.county}, ${row.filings}, ${row.filing_rate_per_100}
        )
        ON CONFLICT (month, county) DO UPDATE SET
          filings = EXCLUDED.filings,
          filing_rate_per_100 = EXCLUDED.filing_rate_per_100
      `;
      evictionInserted++;
    }
    console.log(`   Inserted ${evictionInserted} eviction filing records.`);

    // ── 8. Create and seed shs_spending_by_type (NEW) ───────────────────

    console.log("\n8. Creating homelessness.shs_spending_by_type...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.shs_spending_by_type (
        id SERIAL PRIMARY KEY,
        fiscal_year TEXT NOT NULL,
        intervention_type TEXT NOT NULL,
        amount BIGINT,
        households_served INT,
        housing_placements INT,
        cost_per_placement NUMERIC(10,2),
        source TEXT DEFAULT 'Metro SHS Reports',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(fiscal_year, intervention_type)
      )
    `);

    let typeInserted = 0;
    for (const row of SHS_BY_TYPE) {
      await sql`
        INSERT INTO homelessness.shs_spending_by_type
          (fiscal_year, intervention_type, households_served, housing_placements, source)
        VALUES (
          ${row.fiscal_year}, ${row.intervention_type},
          ${row.households_served}, ${row.housing_placements}, ${row.source}
        )
        ON CONFLICT (fiscal_year, intervention_type) DO UPDATE SET
          households_served = EXCLUDED.households_served,
          housing_placements = EXCLUDED.housing_placements,
          source = EXCLUDED.source
      `;
      typeInserted++;
    }
    console.log(`   Inserted ${typeInserted} SHS spending by type records.`);

    // ── 9. Create and seed shs_by_county (NEW) ──────────────────────────

    console.log("\n9. Creating homelessness.shs_by_county...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.shs_by_county (
        id SERIAL PRIMARY KEY,
        fiscal_year TEXT NOT NULL,
        county TEXT NOT NULL,
        allocation BIGINT,
        spent BIGINT,
        households_placed INT,
        source TEXT DEFAULT 'Metro SHS Reports',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(fiscal_year, county)
      )
    `);

    let countyInserted = 0;
    for (const row of SHS_BY_COUNTY) {
      await sql`
        INSERT INTO homelessness.shs_by_county
          (fiscal_year, county, allocation, spent, households_placed, source)
        VALUES (
          ${row.fiscal_year}, ${row.county}, ${row.allocation},
          ${row.spent}, ${row.households_placed}, ${row.source}
        )
        ON CONFLICT (fiscal_year, county) DO UPDATE SET
          allocation = EXCLUDED.allocation,
          spent = EXCLUDED.spent,
          households_placed = EXCLUDED.households_placed,
          source = EXCLUDED.source
      `;
      countyInserted++;
    }
    console.log(`   Inserted ${countyInserted} SHS by county records.`);

    // ── 10. Create and seed affordable_housing_vacancy (NEW) ────────────

    console.log("\n10. Creating homelessness.affordable_housing_vacancy...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.affordable_housing_vacancy (
        id SERIAL PRIMARY KEY,
        as_of DATE NOT NULL,
        source TEXT NOT NULL,
        total_units INT,
        vacant_units INT,
        vacancy_pct NUMERIC(5,2),
        avg_days_to_fill INT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    let vacancyInserted = 0;
    for (const row of AFFORDABLE_VACANCY) {
      await sql`
        INSERT INTO homelessness.affordable_housing_vacancy
          (as_of, source, total_units, vacant_units, vacancy_pct, avg_days_to_fill, notes)
        VALUES (
          ${row.as_of}::date, ${row.source}, ${row.total_units},
          ${row.vacant_units}, ${row.vacancy_pct}, ${row.avg_days_to_fill}, ${row.notes}
        )
      `;
      vacancyInserted++;
    }
    console.log(`   Inserted ${vacancyInserted} affordable housing vacancy records.`);

    // ── 11. Create and seed context_stats (NEW/UPDATED) ─────────────────

    console.log("\n11. Creating homelessness.context_stats...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.context_stats (
        id SERIAL PRIMARY KEY,
        metric TEXT NOT NULL,
        value TEXT NOT NULL,
        context TEXT,
        source TEXT,
        as_of_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(metric)
      )
    `);

    let contextInserted = 0;
    for (const row of CONTEXT_STATS) {
      await sql`
        INSERT INTO homelessness.context_stats
          (metric, value, context, source, as_of_date)
        VALUES (
          ${row.metric}, ${row.value}, ${row.context},
          ${row.source}, ${row.as_of_date}::date
        )
        ON CONFLICT (metric) DO UPDATE SET
          value = EXCLUDED.value,
          context = EXCLUDED.context,
          source = EXCLUDED.source,
          as_of_date = EXCLUDED.as_of_date
      `;
      contextInserted++;
    }
    console.log(`   Inserted ${contextInserted} context stat records.`);

    // ── Verification ────────────────────────────────────────────────────

    console.log("\n=============================================");
    console.log("VERIFICATION QUERIES");
    console.log("=============================================\n");

    // PIT Counts
    const pitRows = await sql`
      SELECT year, total_homeless, sheltered, unsheltered, source
      FROM homelessness.pit_counts
      ORDER BY year
    `;
    console.log(`pit_counts (${pitRows.length} rows):`);
    for (const r of pitRows) {
      const parts = [`Total: ${r.total_homeless}`];
      if (r.sheltered != null) parts.push(`Sheltered: ${r.sheltered}`);
      if (r.unsheltered != null) parts.push(`Unsheltered: ${r.unsheltered}`);
      console.log(`  ${r.year}: ${parts.join(", ")}`);
    }

    // Shelter Capacity
    const shelterRows = await sql`
      SELECT quarter, total_beds, utilization_pct
      FROM homelessness.shelter_capacity
      ORDER BY quarter
    `;
    console.log(`\nshelter_capacity (${shelterRows.length} rows):`);
    for (const r of shelterRows) {
      console.log(`  ${r.quarter}: ${r.total_beds} beds, ${r.utilization_pct}% util`);
    }

    // Housing Placements
    const housingRows = await sql`
      SELECT fiscal_year, total_placements, shs_placements, evictions_prevented
      FROM homelessness.housing_placements
      ORDER BY fiscal_year
    `;
    console.log(`\nhousing_placements (${housingRows.length} rows):`);
    for (const r of housingRows) {
      const parts = [`Total: ${r.total_placements}`];
      if (r.shs_placements != null) parts.push(`SHS: ${r.shs_placements}`);
      if (r.evictions_prevented != null) parts.push(`Evictions prevented: ${r.evictions_prevented}`);
      console.log(`  ${r.fiscal_year}: ${parts.join(", ")}`);
    }

    // Overdose Deaths
    const odRows = await sql`
      SELECT year, fentanyl_deaths_homeless, total_od_deaths_homeless, total_homeless_deaths
      FROM homelessness.overdose_deaths
      ORDER BY year
    `;
    console.log(`\noverdose_deaths (${odRows.length} rows):`);
    for (const r of odRows) {
      const parts = [`Fentanyl: ${r.fentanyl_deaths_homeless}`];
      if (r.total_od_deaths_homeless != null) parts.push(`Total OD: ${r.total_od_deaths_homeless}`);
      if (r.total_homeless_deaths != null) parts.push(`All deaths: ${r.total_homeless_deaths}`);
      console.log(`  ${r.year}: ${parts.join(", ")}`);
    }

    // SHS Funding
    const fundingRows = await sql`
      SELECT year, tax_revenue, spending, psh_units_cumulative
      FROM homelessness.shs_funding
      ORDER BY year
    `;
    console.log(`\nshs_funding (${fundingRows.length} rows):`);
    for (const r of fundingRows) {
      const parts: string[] = [];
      if (r.tax_revenue != null) parts.push(`Revenue: $${(Number(r.tax_revenue) / 1e6).toFixed(0)}M`);
      if (r.spending != null) parts.push(`Spending: $${(Number(r.spending) / 1e6).toFixed(1)}M`);
      if (r.psh_units_cumulative != null) parts.push(`PSH cumulative: ${r.psh_units_cumulative}`);
      console.log(`  ${r.year}: ${parts.join(", ")}`);
    }

    // By-Name List
    const bnlRows = await sql`
      SELECT month, total_on_list, new_entries, exits_to_housing
      FROM homelessness.by_name_list
      ORDER BY month
    `;
    console.log(`\nby_name_list (${bnlRows.length} rows):`);
    for (const r of bnlRows) {
      console.log(`  ${r.month}: ${r.total_on_list} on list, ${r.new_entries} new, ${r.exits_to_housing} exits`);
    }

    // Eviction Filings
    const evictionRows = await sql`
      SELECT county, COUNT(*) as months, SUM(filings) as total_filings
      FROM homelessness.eviction_filings
      GROUP BY county ORDER BY county
    `;
    console.log(`\neviction_filings (by county):`);
    for (const r of evictionRows) {
      console.log(`  ${r.county}: ${r.months} months, ${r.total_filings} total filings`);
    }

    // SHS by Type
    const typeRows = await sql`
      SELECT fiscal_year, intervention_type, households_served, housing_placements
      FROM homelessness.shs_spending_by_type
      ORDER BY fiscal_year, intervention_type
    `;
    console.log(`\nshs_spending_by_type (${typeRows.length} rows):`);
    for (const r of typeRows) {
      console.log(`  ${r.fiscal_year} ${r.intervention_type}: ${r.households_served} served, ${r.housing_placements ?? "N/A"} placed`);
    }

    // SHS by County
    const countyRows = await sql`
      SELECT fiscal_year, county, allocation, households_placed
      FROM homelessness.shs_by_county
      ORDER BY fiscal_year, county
    `;
    console.log(`\nshs_by_county (${countyRows.length} rows):`);
    for (const r of countyRows) {
      const alloc = r.allocation ? `$${(Number(r.allocation) / 1e6).toFixed(0)}M` : "N/A";
      console.log(`  ${r.fiscal_year} ${r.county}: ${alloc} allocated, ${r.households_placed ?? "N/A"} placed`);
    }

    // Vacancy
    const vacancyRows = await sql`
      SELECT as_of, source, vacancy_pct FROM homelessness.affordable_housing_vacancy ORDER BY as_of
    `;
    console.log(`\naffordable_housing_vacancy (${vacancyRows.length} rows):`);
    for (const r of vacancyRows) {
      console.log(`  ${r.as_of}: ${r.vacancy_pct}% (${r.source})`);
    }

    // Context Stats
    const ctxRows = await sql`
      SELECT metric, value FROM homelessness.context_stats ORDER BY metric
    `;
    console.log(`\ncontext_stats (${ctxRows.length} rows):`);
    for (const r of ctxRows) {
      console.log(`  ${r.metric}: ${r.value}`);
    }

    // Summary
    const totalRecords =
      pitRows.length + shelterRows.length + housingRows.length +
      odRows.length + fundingRows.length + bnlRows.length +
      evictionInserted + typeInserted + countyInserted +
      vacancyInserted + contextInserted;

    console.log("\n=============================================");
    console.log("SEED COMPLETE");
    console.log("=============================================");
    console.log(`Total records across 11 tables: ${totalRecords}`);
    console.log("  - pit_counts:                " + pitRows.length);
    console.log("  - shelter_capacity:          " + shelterRows.length);
    console.log("  - housing_placements:        " + housingRows.length);
    console.log("  - overdose_deaths:           " + odRows.length);
    console.log("  - shs_funding:               " + fundingRows.length);
    console.log("  - by_name_list:              " + bnlRows.length);
    console.log("  - eviction_filings:          " + evictionInserted);
    console.log("  - shs_spending_by_type:      " + typeInserted);
    console.log("  - shs_by_county:             " + countyInserted);
    console.log("  - affordable_housing_vacancy:" + vacancyInserted);
    console.log("  - context_stats:             " + contextInserted);

    await sql.end();
  } catch (err: any) {
    console.error("Database error:", err.message);
    await sql.end();
    throw err;
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
