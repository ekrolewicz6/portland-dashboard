/**
 * seed-statewide-homelessness.ts
 *
 * Seeds statewide homelessness data from the PSU HRAC 2025 Oregon
 * Statewide Homelessness Estimates report (January 2026).
 *
 * Creates and populates:
 *   - homelessness.statewide_pit_by_county (Tables 1-2)
 *   - homelessness.statewide_unsheltered_change (Table 3)
 *   - homelessness.racial_disparities (Chart 1 + exec summary)
 *   - homelessness.shelter_bed_inventory (Table 17)
 *   - homelessness.student_homelessness (Table 19)
 *   - homelessness.doubled_up (Table 20)
 *   + updates homelessness.context_stats with statewide metrics
 *
 * Usage: npx tsx ingest/seed-statewide-homelessness.ts
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

// ── Tables 1-2: County-level PIT counts + rates ─────────────────────────

const COUNTY_PIT = [
  // [county, coc, sheltered, unsheltered, total, unsheltered_pct, shelter_beds, rate_sheltered, rate_unsheltered, rate_total]
  ["Crook", "Central Oregon", 25, 344, 369, 93.2, 26, 0.95, 13.05, 14.00],
  ["Deschutes", "Central Oregon", 572, 1039, 1611, 64.5, 733, 2.74, 4.98, 7.72],
  ["Jefferson", "Central Oregon", 69, 59, 128, 46.1, 96, 2.71, 2.32, 5.03],
  ["Clackamas", "Clackamas", 210, 358, 568, 63.0, 272, 0.49, 0.84, 1.33],
  ["Jackson", "Jackson", 740, 421, 1161, 36.3, 794, 3.34, 1.90, 5.25],
  ["Lane", "Lane", 1505, 2004, 3509, 57.1, 1900, 3.93, 5.24, 9.17],
  ["Marion", "Marion/Polk", 1017, 719, 1736, 41.4, 1544, 2.92, 2.07, 4.99],
  ["Polk", "Marion/Polk", 123, 234, 357, 65.5, 79, 1.39, 2.64, 4.02],
  ["Multnomah", "Multnomah", 3614, 6912, 10526, 65.7, 4008, 4.51, 8.62, 13.13],
  ["Washington", "Washington", 701, 239, 940, 25.4, 861, 1.15, 0.39, 1.54],
  ["Baker", "Balance of State", 9, 32, 41, 78.0, 5, 0.54, 1.91, 2.45],
  ["Benton", "Balance of State", 301, 274, 575, 47.7, 315, 3.08, 2.80, 5.88],
  ["Clatsop", "Balance of State", 215, 1028, 1243, 82.7, 232, 5.15, 24.60, 29.75],
  ["Columbia", "Balance of State", 51, 342, 393, 87.0, 51, 0.95, 6.38, 7.33],
  ["Coos", "Balance of State", 140, 315, 455, 69.2, 165, 2.14, 4.83, 6.97],
  ["Curry", "Balance of State", 14, 190, 204, 93.1, 14, 0.59, 8.05, 8.65],
  ["Douglas", "Balance of State", 101, 248, 349, 71.1, 130, 0.91, 2.23, 3.14],
  ["Gilliam", "Balance of State", 0, 0, 0, null, 0, 0, 0, 0],
  ["Grant", "Balance of State", 0, 28, 28, 100.0, 0, 0, 3.90, 3.90],
  ["Harney", "Balance of State", 0, 58, 58, 100.0, 0, 0, 7.77, 7.77],
  ["Hood River", "Balance of State", 49, 30, 79, 38.0, 21, 2.01, 1.23, 3.24],
  ["Josephine", "Balance of State", 34, 323, 357, 90.5, 34, 0.39, 3.69, 4.08],
  ["Klamath", "Balance of State", 67, 127, 194, 65.5, 68, 0.96, 1.82, 2.78],
  ["Lake", "Balance of State", 0, 10, 10, 100.0, 0, 0, 1.22, 1.22],
  ["Lincoln", "Balance of State", 282, 334, 616, 54.2, 300, 5.51, 6.53, 12.04],
  ["Linn", "Balance of State", 268, 265, 533, 49.7, 338, 2.05, 2.03, 4.07],
  ["Malheur", "Balance of State", 94, 201, 295, 68.1, 97, 2.99, 6.40, 9.39],
  ["Morrow", "Balance of State", 2, 2, 4, 50.0, 0, 0.14, 0.14, 0.28],
  ["Sherman", "Balance of State", 0, 6, 6, 100.0, 0, 0, 3.11, 3.11],
  ["Tillamook", "Balance of State", 51, 52, 103, 50.5, 56, 1.85, 1.88, 3.73],
  ["Umatilla", "Balance of State", 138, 140, 278, 50.4, 152, 1.70, 1.73, 3.43],
  ["Union", "Balance of State", 16, 42, 58, 72.4, 23, 0.61, 1.61, 2.23],
  ["Wallowa", "Balance of State", 0, 1, 1, 100.0, 0, 0, 0.13, 0.13],
  ["Wasco", "Balance of State", 72, 112, 184, 60.9, 140, 2.72, 4.24, 6.96],
  ["Wheeler", "Balance of State", 0, 0, 0, null, 0, 0, 0, 0],
  ["Yamhill", "Balance of State", 127, 23, 150, 15.3, 153, 1.16, 0.21, 1.37],
];

// ── Table 3: Unsheltered change 2023→2025 (selected key counties) ───────

const UNSHELTERED_CHANGE = [
  // [county, count_2023, count_2025, numeric_change, pct_change]
  ["Multnomah", 3944, 6912, 2968, 75],
  ["Crook", 22, 344, 322, 1464],
  ["Clackamas", 178, 358, 180, 101],
  ["Lincoln", 62, 334, 272, 439],
  ["Klamath", 33, 127, 94, 285],
  ["Josephine", 191, 323, 132, 69],
  ["Lane", 2110, 2004, -106, -5],
  ["Jackson", 556, 421, -135, -24],
  ["Deschutes", 1075, 1039, -36, -3],
  ["Douglas", 412, 248, -164, -40],
  ["Washington", 230, 239, 9, 4],
  ["Marion", 654, 719, 65, 10],
  ["Clatsop", 887, 1028, 141, 16],
  ["Benton", 149, 274, 125, 84],
  ["Linn", 232, 265, 33, 14],
  ["Coos", 457, 315, -142, -31],
];

// ── Racial disparity ratios (from exec summary + Chart 1) ───────────────

const RACIAL_DISPARITIES = [
  // [race_group, pct_population, pct_pit, disparity_ratio, scope]
  ["American Indian, Alaska Native, or Indigenous", 1.8, 4.3, 6.92, "statewide"],
  ["Native Hawaiian or Pacific Islander", 0.5, 1.1, 5.47, "statewide"],
  ["Black, African American, or African", 2.1, 8.3, 5.08, "statewide"],
  ["Hispanic/Latina/e/o", 14.1, 10.9, 0.77, "statewide"],
  ["Asian or Asian American", 5.2, 0.7, 0.13, "statewide"],
  ["Multi-racial", null, 5.3, null, "statewide"],
  ["White", 74.6, 59.2, 0.89, "statewide"],
];

// ── Table 17: Shelter bed inventory ─────────────────────────────────────

const SHELTER_BEDS = [
  // [county, seasonal_overflow, year_round, total_beds, total_homeless, beds_pct_of_pit]
  ["Crook", 2, 24, 26, 369, 7],
  ["Deschutes", 79, 654, 733, 1611, 45],
  ["Jefferson", 35, 61, 96, 128, 75],
  ["Clackamas", 22, 250, 272, 568, 48],
  ["Jackson", 86, 708, 794, 1161, 68],
  ["Lane", 741, 1159, 1900, 3509, 54],
  ["Marion", 377, 1167, 1544, 1736, 89],
  ["Polk", 13, 66, 79, 357, 22],
  ["Multnomah", 0, 4008, 4008, 10526, 38],
  ["Washington", 0, 861, 861, 940, 92],
  ["Lincoln", 0, 300, 300, 616, 49],
  ["Linn", 2, 336, 338, 533, 63],
  ["Benton", 98, 217, 315, 575, 55],
  ["Clatsop", 0, 232, 232, 1243, 19],
  ["Yamhill", 1, 152, 153, 150, 102],
  ["Klamath", 30, 38, 68, 194, 35],
  ["Douglas", 0, 130, 130, 349, 37],
  ["Josephine", 0, 34, 34, 357, 10],
  ["Wasco", 27, 113, 140, 184, 76],
  ["Coos", 0, 165, 165, 455, 36],
  ["Hood River", 0, 21, 21, 79, 27],
  ["Malheur", 16, 81, 97, 295, 33],
  ["Umatilla", 19, 133, 152, 278, 55],
  ["Tillamook", 7, 49, 56, 103, 54],
  ["Columbia", 0, 51, 51, 393, 13],
  ["Curry", 0, 14, 14, 204, 7],
];

// ── Table 19: Student homelessness by county ────────────────────────────

const STUDENT_HOMELESSNESS = [
  // [county, count_2023_24, count_2024_25, numeric_change, pct_change]
  ["Multnomah", 3407, 2903, -504, -14.8],
  ["Washington", 3337, 2894, -443, -13.3],
  ["Marion", 2350, 2271, -79, -3.4],
  ["Lane", 2310, 2053, -257, -11.1],
  ["Jackson", 1770, 1647, -123, -6.9],
  ["Clackamas", 801, 982, 181, 22.6],
  ["Deschutes", 813, 811, -2, -0.2],
  ["Polk", 159, 248, 89, 56.0],
  ["Linn", 1194, 1079, -115, -9.6],
  ["Josephine", 758, 786, 28, 3.7],
  ["Douglas", 582, 560, -22, -3.8],
  ["Klamath", 355, 468, 113, 31.8],
  ["Lincoln", 716, 642, -74, -10.3],
  ["Coos", 659, 677, 18, 2.7],
  ["Benton", 374, 356, -18, -4.8],
  ["Columbia", 209, 161, -48, -23.0],
  ["Yamhill", 630, 601, -29, -4.6],
  ["Umatilla", 263, 220, -43, -16.3],
  ["Tillamook", 188, 180, -8, -4.3],
  ["Malheur", 286, 331, 45, 15.7],
  ["Clatsop", 246, 272, 26, 10.6],
  ["Hood River", 39, 39, 0, 0],
  ["Curry", 120, 93, -27, -22.5],
  ["Crook", 87, 118, 31, 35.6],
  ["Jefferson", 113, 78, -35, -31.0],
  ["Wheeler", 24, 111, 87, 362.5],
  ["Grant", 18, 39, 21, 116.7],
  ["Morrow", 112, 144, 32, 28.6],
  ["Wasco", 140, 160, 20, 14.3],
];

// ── Table 20: Doubled-up homelessness (ACS estimates, 2024) ─────────────

const DOUBLED_UP = [
  // [county_or_puma, estimate, margin_of_error]
  ["Multnomah", 3477, 960],
  ["Washington", 3118, 710],
  ["Clackamas", 1159, 520],
  ["Marion", 2149, 604],
  ["Lane", 1503, 326],
  ["Jackson", 762, 368],
  ["Deschutes", null, null], // combined with Crook/Jefferson
  ["Crook", 477, 170], // actually "Central Oregon PUMA"
  ["Polk", 168, 108],
  ["Statewide", 21542, 1993],
];

// ── Statewide context stats ─────────────────────────────────────────────

const NEW_CONTEXT_STATS = [
  { metric: "statewide_pit_total", value: "27119", context: "2025 PIT Count — 27,119 people across Oregon on a single night in January 2025", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "statewide_unsheltered", value: "16512", context: "60.9% of all homeless Oregonians were unsheltered on the night of the count", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "statewide_sheltered", value: "10607", context: "39.1% sheltered; sheltered count up 49% from 2023 due to shelter bed expansion", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "statewide_pit_change_pct", value: "34.9", context: "34.9% increase from 20,110 in 2023 — driven by both real increase and improved counting", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "statewide_shelter_beds", value: "12607", context: "12,607 total shelter beds (11,047 year-round + 1,560 seasonal) — a 45% increase over 2023", source: "PSU HRAC 2025 Statewide Homelessness Estimates (HIC)", as_of_date: "2025-01-22" },
  { metric: "statewide_doubled_up", value: "21542", context: "Estimated 21,542 people doubled up in Oregon (2024 ACS), ± 1,993 margin of error", source: "PSU HRAC via ACS 1-year estimates (Richard et al. method)", as_of_date: "2024-12-31" },
  { metric: "statewide_student_homeless", value: "21122", context: "21,122 K-12 students (4.0% of all students) experienced homelessness in 2024-25; 3,052 unsheltered — likely the most ever recorded", source: "Oregon Department of Education Statewide Report Card", as_of_date: "2025-06-30" },
  { metric: "multco_shelter_gap_pct", value: "38", context: "Multnomah County shelter beds cover only 38% of the PIT count (4,008 beds vs 10,526 people)", source: "PSU HRAC 2025 Statewide Homelessness Estimates (HIC)", as_of_date: "2025-01-22" },
  { metric: "ai_an_disparity_ratio", value: "6.92", context: "American Indian/Alaska Native/Indigenous Oregonians experience homelessness at 6.92x their share of the population", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "black_disparity_ratio", value: "5.08", context: "Black/African American Oregonians experience homelessness at 5.08x their share of the population", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
  { metric: "nhpi_disparity_ratio", value: "5.47", context: "Native Hawaiian/Pacific Islander Oregonians experience homelessness at 5.47x their share of the population", source: "PSU HRAC 2025 Statewide Homelessness Estimates", as_of_date: "2025-01-22" },
];

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const sql = postgres(DB_URL, { prepare: false, max: 1, onnotice: () => {} });

  try {
    console.log("=============================================");
    console.log("SEEDING PSU 2025 STATEWIDE HOMELESSNESS DATA");
    console.log("=============================================\n");

    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS homelessness`);

    // ── 1. statewide_pit_by_county ──
    console.log("1. Creating homelessness.statewide_pit_by_county...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.statewide_pit_by_county CASCADE;
      CREATE TABLE homelessness.statewide_pit_by_county (
        id SERIAL PRIMARY KEY,
        county TEXT NOT NULL,
        coc TEXT,
        sheltered INT,
        unsheltered INT,
        total INT,
        unsheltered_pct NUMERIC(5,1),
        shelter_beds INT,
        rate_per_1000_sheltered NUMERIC(6,2),
        rate_per_1000_unsheltered NUMERIC(6,2),
        rate_per_1000_total NUMERIC(6,2),
        year INT DEFAULT 2025
      )
    `);
    for (const r of COUNTY_PIT) {
      await sql`INSERT INTO homelessness.statewide_pit_by_county
        (county, coc, sheltered, unsheltered, total, unsheltered_pct, shelter_beds, rate_per_1000_sheltered, rate_per_1000_unsheltered, rate_per_1000_total)
        VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]}, ${r[5]}, ${r[6]}, ${r[7]}, ${r[8]}, ${r[9]})`;
    }
    console.log(`   ${COUNTY_PIT.length} counties inserted`);

    // ── 2. statewide_unsheltered_change ──
    console.log("\n2. Creating homelessness.statewide_unsheltered_change...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.statewide_unsheltered_change CASCADE;
      CREATE TABLE homelessness.statewide_unsheltered_change (
        id SERIAL PRIMARY KEY,
        county TEXT NOT NULL,
        count_2023 INT,
        count_2025 INT,
        numeric_change INT,
        pct_change INT
      )
    `);
    for (const r of UNSHELTERED_CHANGE) {
      await sql`INSERT INTO homelessness.statewide_unsheltered_change
        (county, count_2023, count_2025, numeric_change, pct_change)
        VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]})`;
    }
    console.log(`   ${UNSHELTERED_CHANGE.length} counties inserted`);

    // ── 3. racial_disparities ──
    console.log("\n3. Creating homelessness.racial_disparities...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.racial_disparities CASCADE;
      CREATE TABLE homelessness.racial_disparities (
        id SERIAL PRIMARY KEY,
        race_group TEXT NOT NULL,
        pct_of_population NUMERIC(5,1),
        pct_of_pit NUMERIC(5,1),
        disparity_ratio NUMERIC(5,2),
        scope TEXT DEFAULT 'statewide',
        year INT DEFAULT 2025
      )
    `);
    for (const r of RACIAL_DISPARITIES) {
      await sql`INSERT INTO homelessness.racial_disparities
        (race_group, pct_of_population, pct_of_pit, disparity_ratio, scope)
        VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]})`;
    }
    console.log(`   ${RACIAL_DISPARITIES.length} groups inserted`);

    // ── 4. shelter_bed_inventory ──
    console.log("\n4. Creating homelessness.shelter_bed_inventory...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.shelter_bed_inventory CASCADE;
      CREATE TABLE homelessness.shelter_bed_inventory (
        id SERIAL PRIMARY KEY,
        county TEXT NOT NULL,
        seasonal_overflow INT,
        year_round INT,
        total_beds INT,
        total_homeless INT,
        beds_pct_of_pit INT,
        year INT DEFAULT 2025
      )
    `);
    for (const r of SHELTER_BEDS) {
      await sql`INSERT INTO homelessness.shelter_bed_inventory
        (county, seasonal_overflow, year_round, total_beds, total_homeless, beds_pct_of_pit)
        VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]}, ${r[5]})`;
    }
    console.log(`   ${SHELTER_BEDS.length} counties inserted`);

    // ── 5. student_homelessness ──
    console.log("\n5. Creating homelessness.student_homelessness...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.student_homelessness CASCADE;
      CREATE TABLE homelessness.student_homelessness (
        id SERIAL PRIMARY KEY,
        county TEXT NOT NULL,
        count_2023_24 INT,
        count_2024_25 INT,
        numeric_change INT,
        pct_change NUMERIC(6,1)
      )
    `);
    for (const r of STUDENT_HOMELESSNESS) {
      await sql`INSERT INTO homelessness.student_homelessness
        (county, count_2023_24, count_2024_25, numeric_change, pct_change)
        VALUES (${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, ${r[4]})`;
    }
    console.log(`   ${STUDENT_HOMELESSNESS.length} counties inserted`);

    // ── 6. doubled_up ──
    console.log("\n6. Creating homelessness.doubled_up...");
    await sql.unsafe(`
      DROP TABLE IF EXISTS homelessness.doubled_up CASCADE;
      CREATE TABLE homelessness.doubled_up (
        id SERIAL PRIMARY KEY,
        county TEXT NOT NULL,
        estimate INT,
        margin_of_error INT,
        year INT DEFAULT 2024
      )
    `);
    for (const r of DOUBLED_UP) {
      if (r[1] !== null) {
        await sql`INSERT INTO homelessness.doubled_up
          (county, estimate, margin_of_error)
          VALUES (${r[0]}, ${r[1]}, ${r[2]})`;
      }
    }
    console.log(`   ${DOUBLED_UP.filter(r => r[1] !== null).length} entries inserted`);

    // ── 7. Update context_stats ──
    console.log("\n7. Updating homelessness.context_stats...");
    let ctxCount = 0;
    for (const row of NEW_CONTEXT_STATS) {
      await sql`
        INSERT INTO homelessness.context_stats (metric, value, context, source, as_of_date)
        VALUES (${row.metric}, ${row.value}, ${row.context}, ${row.source}, ${row.as_of_date}::date)
        ON CONFLICT (metric) DO UPDATE SET
          value = EXCLUDED.value, context = EXCLUDED.context,
          source = EXCLUDED.source, as_of_date = EXCLUDED.as_of_date
      `;
      ctxCount++;
    }
    console.log(`   ${ctxCount} context stats upserted`);

    // ── Verification ──
    console.log("\n=============================================");
    console.log("VERIFICATION");
    console.log("=============================================\n");

    const tables = [
      "statewide_pit_by_county",
      "statewide_unsheltered_change",
      "racial_disparities",
      "shelter_bed_inventory",
      "student_homelessness",
      "doubled_up",
    ];
    for (const t of tables) {
      const r = await sql.unsafe(`SELECT count(*)::int as n FROM homelessness.${t}`);
      console.log(`  homelessness.${t}: ${r[0].n} rows`);
    }

    // Multnomah spot check
    const mc = await sql`SELECT total, unsheltered, rate_per_1000_total FROM homelessness.statewide_pit_by_county WHERE county = 'Multnomah'`;
    console.log(`\n  Multnomah: ${mc[0].total} total, ${mc[0].unsheltered} unsheltered, ${mc[0].rate_per_1000_total}/1K rate`);

    console.log("\n✅ All statewide data seeded.");
    await sql.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\nERROR:", msg);
    await sql.end();
    process.exit(1);
  }
}

main().then(() => process.exit(0));
