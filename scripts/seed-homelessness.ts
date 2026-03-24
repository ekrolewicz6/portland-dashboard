/**
 * seed-homelessness.ts
 *
 * Comprehensive seed script for the homelessness schema.
 * Creates and populates all tables with real published data from:
 *   - PSU 2025 Tri-County PIT Count
 *   - JOHS Shelter Capacity Reports
 *   - SHS Annual Reports
 *   - Multnomah County Medical Examiner / Domicile Unknown reports
 *   - HMIS By-Name List
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
    spending: null as number | null,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro",
  },
  {
    year: 2023,
    tax_revenue: 357_000_000,
    spending: null as number | null,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro (estimated)",
  },
  {
    year: 2024,
    tax_revenue: 255_000_000,
    spending: 143_500_000,
    psh_units_added: null as number | null,
    psh_units_cumulative: null as number | null,
    source: "SHS Annual Report / Metro",
  },
  {
    year: 2025,
    tax_revenue: null as number | null,
    spending: null as number | null,
    psh_units_added: 244,
    psh_units_cumulative: 1541,
    source: "SHS Annual Report / Metro (partial year)",
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

    // Summary
    const totalRecords =
      pitRows.length + shelterRows.length + housingRows.length +
      odRows.length + fundingRows.length + bnlRows.length;

    console.log("\n=============================================");
    console.log("SEED COMPLETE");
    console.log("=============================================");
    console.log(`Total records across 6 tables: ${totalRecords}`);
    console.log("  - pit_counts:        " + pitRows.length);
    console.log("  - shelter_capacity:  " + shelterRows.length);
    console.log("  - housing_placements:" + housingRows.length);
    console.log("  - overdose_deaths:   " + odRows.length);
    console.log("  - shs_funding:       " + fundingRows.length);
    console.log("  - by_name_list:      " + bnlRows.length);

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
