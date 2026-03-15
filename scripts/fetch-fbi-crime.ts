/**
 * fetch-fbi-crime.ts
 *
 * Fetches FBI Crime Data Explorer API for Oregon state-level crime data.
 * Inserts into safety.fbi_crime_estimates.
 *
 * Usage: npx tsx scripts/fetch-fbi-crime.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");
const API_KEY = "DEMO_KEY";

fs.mkdirSync(DATA_DIR, { recursive: true });

async function fetchJson(url: string): Promise<any> {
  console.log(`   Fetching: ${url.replace(API_KEY, "***")}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`   HTTP ${res.status}: ${res.statusText}`);
    const body = await res.text().catch(() => "");
    console.error(`   Body: ${body.slice(0, 500)}`);
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function main() {
  console.log("=== FBI Crime Data Explorer Fetch ===\n");

  const allData: Record<string, any> = {};

  // 1. State estimates (population, crime totals)
  console.log("1. Fetching Oregon state estimates...");
  try {
    const estimates = await fetchJson(
      `https://api.usa.gov/crime/fbi/sapi/api/estimates/states/OR?API_KEY=${API_KEY}`
    );
    const results = estimates?.results ?? [];
    console.log(`   Got ${results.length} year records`);
    allData.estimates = results;
  } catch (err: any) {
    console.error(`   Failed: ${err.message}`);
    allData.estimates = [];
  }

  // Small delay to respect DEMO_KEY rate limits
  await new Promise((r) => setTimeout(r, 1000));

  // 2. Violent crime summary
  console.log("\n2. Fetching Oregon violent crime (2016-2022)...");
  try {
    const violent = await fetchJson(
      `https://api.usa.gov/crime/fbi/sapi/api/summarized/state/OR/violent-crime?from=2016&to=2022&API_KEY=${API_KEY}`
    );
    const results = violent?.results ?? [];
    console.log(`   Got ${results.length} records`);
    allData.violent_crime = results;
  } catch (err: any) {
    console.error(`   Failed: ${err.message}`);
    allData.violent_crime = [];
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 3. Property crime summary
  console.log("\n3. Fetching Oregon property crime (2016-2022)...");
  try {
    const property = await fetchJson(
      `https://api.usa.gov/crime/fbi/sapi/api/summarized/state/OR/property-crime?from=2016&to=2022&API_KEY=${API_KEY}`
    );
    const results = property?.results ?? [];
    console.log(`   Got ${results.length} records`);
    allData.property_crime = results;
  } catch (err: any) {
    console.error(`   Failed: ${err.message}`);
    allData.property_crime = [];
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 4. Try additional endpoints
  console.log("\n4. Fetching Oregon crime trends (supplemental)...");
  try {
    const arson = await fetchJson(
      `https://api.usa.gov/crime/fbi/sapi/api/summarized/state/OR/arson?from=2016&to=2022&API_KEY=${API_KEY}`
    );
    allData.arson = arson?.results ?? [];
    console.log(`   Arson: ${allData.arson.length} records`);
  } catch (err: any) {
    console.error(`   Arson failed: ${err.message}`);
    allData.arson = [];
  }

  // 5. Save JSON
  console.log("\n5. Saving JSON...");
  fs.writeFileSync(
    path.join(DATA_DIR, "fbi_crime_oregon.json"),
    JSON.stringify(allData, null, 2)
  );
  console.log(`   Saved fbi_crime_oregon.json`);

  // 6. Insert into PostgreSQL
  console.log("\n6. Inserting into PostgreSQL...");
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS safety`);

    // State estimates table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS safety.fbi_crime_estimates (
        id              SERIAL PRIMARY KEY,
        year            INTEGER NOT NULL,
        state_abbr      TEXT NOT NULL DEFAULT 'OR',
        state_name      TEXT DEFAULT 'Oregon',
        population      BIGINT,
        violent_crime   INTEGER,
        homicide        INTEGER,
        rape_legacy     INTEGER,
        rape_revised    INTEGER,
        robbery         INTEGER,
        aggravated_assault INTEGER,
        property_crime  INTEGER,
        burglary        INTEGER,
        larceny         INTEGER,
        motor_vehicle_theft INTEGER,
        arson           INTEGER,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (year, state_abbr)
      )
    `);

    await sql.unsafe(`TRUNCATE safety.fbi_crime_estimates RESTART IDENTITY`);

    const estimates = allData.estimates ?? [];
    let estimateCount = 0;
    for (const e of estimates) {
      try {
        await sql`
          INSERT INTO safety.fbi_crime_estimates (
            year, state_abbr, state_name, population,
            violent_crime, homicide, rape_legacy, rape_revised,
            robbery, aggravated_assault, property_crime,
            burglary, larceny, motor_vehicle_theft, arson
          ) VALUES (
            ${e.year ?? null}, 'OR', 'Oregon',
            ${e.population ?? null},
            ${e.violent_crime ?? null},
            ${e.homicide ?? null},
            ${e.rape_legacy ?? null},
            ${e.rape_revised ?? null},
            ${e.robbery ?? null},
            ${e.aggravated_assault ?? null},
            ${e.property_crime ?? null},
            ${e.burglary ?? null},
            ${e.larceny ?? null},
            ${e.motor_vehicle_theft ?? null},
            ${e.arson ?? null}
          )
          ON CONFLICT (year, state_abbr) DO UPDATE SET
            population = EXCLUDED.population,
            violent_crime = EXCLUDED.violent_crime,
            homicide = EXCLUDED.homicide,
            property_crime = EXCLUDED.property_crime,
            burglary = EXCLUDED.burglary,
            larceny = EXCLUDED.larceny,
            motor_vehicle_theft = EXCLUDED.motor_vehicle_theft
        `;
        estimateCount++;
      } catch (err: any) {
        console.error(`   Skip year ${e.year}: ${err.message?.slice(0, 100)}`);
      }
    }
    console.log(`   Inserted ${estimateCount} estimate records`);

    // Violent crime summarized table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS safety.fbi_violent_crime_summary (
        id              SERIAL PRIMARY KEY,
        year            INTEGER NOT NULL,
        state_abbr      TEXT NOT NULL DEFAULT 'OR',
        ori             TEXT,
        agency_name     TEXT,
        offense         TEXT,
        actual          INTEGER,
        cleared         INTEGER,
        population      BIGINT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await sql.unsafe(`TRUNCATE safety.fbi_violent_crime_summary RESTART IDENTITY`);

    let violentCount = 0;
    for (const v of allData.violent_crime ?? []) {
      try {
        await sql`
          INSERT INTO safety.fbi_violent_crime_summary (year, state_abbr, ori, agency_name, offense, actual, cleared, population)
          VALUES (${v.data_year ?? v.year ?? null}, 'OR', ${v.ori ?? null}, ${v.agency_name ?? null},
                  ${v.offense ?? 'violent-crime'}, ${v.actual ?? null}, ${v.cleared ?? null}, ${v.population ?? null})
        `;
        violentCount++;
      } catch { /* skip */ }
    }
    console.log(`   Inserted ${violentCount} violent crime summary records`);

    // Property crime summarized table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS safety.fbi_property_crime_summary (
        id              SERIAL PRIMARY KEY,
        year            INTEGER NOT NULL,
        state_abbr      TEXT NOT NULL DEFAULT 'OR',
        ori             TEXT,
        agency_name     TEXT,
        offense         TEXT,
        actual          INTEGER,
        cleared         INTEGER,
        population      BIGINT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await sql.unsafe(`TRUNCATE safety.fbi_property_crime_summary RESTART IDENTITY`);

    let propCount = 0;
    for (const p of allData.property_crime ?? []) {
      try {
        await sql`
          INSERT INTO safety.fbi_property_crime_summary (year, state_abbr, ori, agency_name, offense, actual, cleared, population)
          VALUES (${p.data_year ?? p.year ?? null}, 'OR', ${p.ori ?? null}, ${p.agency_name ?? null},
                  ${p.offense ?? 'property-crime'}, ${p.actual ?? null}, ${p.cleared ?? null}, ${p.population ?? null})
        `;
        propCount++;
      } catch { /* skip */ }
    }
    console.log(`   Inserted ${propCount} property crime summary records`);

    // Cache for dashboard
    const latestEstimates = estimates
      .filter((e: any) => e.year && e.year >= 2016)
      .sort((a: any, b: any) => a.year - b.year);

    const cacheSummary = {
      source: "FBI Crime Data Explorer (DEMO_KEY)",
      state: "Oregon",
      estimates_count: estimateCount,
      violent_crime_summary_count: violentCount,
      property_crime_summary_count: propCount,
      year_range: latestEstimates.length > 0
        ? { from: latestEstimates[0].year, to: latestEstimates[latestEstimates.length - 1].year }
        : null,
      latest_year: latestEstimates.length > 0
        ? {
            year: latestEstimates[latestEstimates.length - 1].year,
            population: latestEstimates[latestEstimates.length - 1].population,
            violent_crime: latestEstimates[latestEstimates.length - 1].violent_crime,
            property_crime: latestEstimates[latestEstimates.length - 1].property_crime,
          }
        : null,
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('fbi_crime_oregon', ${sql.json(cacheSummary)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(cacheSummary)}, updated_at = now()
    `;
    console.log("   Cached fbi_crime_oregon summary");

    // Verify
    const verifyEst = await sql`SELECT count(*)::int as cnt FROM safety.fbi_crime_estimates`;
    const verifyViol = await sql`SELECT count(*)::int as cnt FROM safety.fbi_violent_crime_summary`;
    const verifyProp = await sql`SELECT count(*)::int as cnt FROM safety.fbi_property_crime_summary`;
    console.log(`\n   Verification:`);
    console.log(`     fbi_crime_estimates: ${verifyEst[0].cnt} rows`);
    console.log(`     fbi_violent_crime_summary: ${verifyViol[0].cnt} rows`);
    console.log(`     fbi_property_crime_summary: ${verifyProp[0].cnt} rows`);

    await sql.end();
  } catch (err: any) {
    console.error(`   DB error: ${err.message}`);
    await sql.end();
  }

  console.log("\n=== FBI Crime Data fetch complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
