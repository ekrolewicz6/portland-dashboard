/**
 * fetch-census.ts
 *
 * Fetches real population data from the U.S. Census Bureau API (no key needed
 * for basic queries) and inserts it into the portland_dashboard database.
 *
 * Sources:
 *   - PEP Population Estimates (2020-2023)
 *   - ACS 5-Year Estimates
 *
 * Usage: npx tsx scripts/fetch-census.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
fs.mkdirSync(DATA_DIR, { recursive: true });

interface CensusPopRow {
  year: number;
  population: number;
  source: string;
  name: string;
}

async function fetchJson(url: string): Promise<any> {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchCsv(url: string): Promise<string> {
  console.log(`  Fetching CSV: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

// ── Census PEP Population Estimates ──────────────────────────────────────

async function fetchPEP(): Promise<CensusPopRow[]> {
  console.log("\n=== Census PEP Population Estimates ===");
  const rows: CensusPopRow[] = [];

  // Try multiple years and API formats
  const attempts = [
    // 2023 PEP
    {
      url: "https://api.census.gov/data/2023/pep/population?get=POP_2023,NAME&for=place:59000&in=state:41",
      year: 2023,
      popField: "POP_2023",
    },
    // 2022 PEP
    {
      url: "https://api.census.gov/data/2022/pep/population?get=POP_2022,NAME&for=place:59000&in=state:41",
      year: 2022,
      popField: "POP_2022",
    },
    // 2021 PEP
    {
      url: "https://api.census.gov/data/2021/pep/population?get=POP_2021,NAME&for=place:59000&in=state:41",
      year: 2021,
      popField: "POP_2021",
    },
    // Alternative: vintage 2023 with multiple years
    {
      url: "https://api.census.gov/data/2023/pep/population?get=POP_2023,POP_2022,POP_2021,POP_2020,NAME&for=place:59000&in=state:41",
      year: 0, // multiple years
      popField: "MULTI",
    },
    // 2019 PEP (pre-COVID baseline)
    {
      url: "https://api.census.gov/data/2019/pep/population?get=POP,NAME&for=place:59000&in=state:41",
      year: 2019,
      popField: "POP",
    },
  ];

  for (const attempt of attempts) {
    try {
      const data = await fetchJson(attempt.url);
      // Census returns array-of-arrays: first row is headers
      if (!Array.isArray(data) || data.length < 2) {
        console.log(`  No data from ${attempt.year} PEP`);
        continue;
      }

      const headers: string[] = data[0];
      console.log(`  Headers: ${headers.join(", ")}`);

      if (attempt.popField === "MULTI") {
        // Extract multiple year columns
        for (const row of data.slice(1)) {
          const name = row[headers.indexOf("NAME")] ?? "Portland";
          for (const hdr of headers) {
            const match = hdr.match(/^POP_(\d{4})$/);
            if (match) {
              const yr = parseInt(match[1], 10);
              const pop = parseInt(row[headers.indexOf(hdr)], 10);
              if (!isNaN(pop) && pop > 0) {
                // Avoid duplicates
                if (!rows.find((r) => r.year === yr)) {
                  rows.push({ year: yr, population: pop, source: "PEP", name });
                  console.log(`  ${yr}: ${pop.toLocaleString()} (${name})`);
                }
              }
            }
          }
        }
      } else {
        for (const row of data.slice(1)) {
          const popIdx = headers.indexOf(attempt.popField);
          const nameIdx = headers.indexOf("NAME");
          if (popIdx < 0) continue;
          const pop = parseInt(row[popIdx], 10);
          const name = nameIdx >= 0 ? row[nameIdx] : "Portland city, Oregon";
          if (!isNaN(pop) && pop > 0 && !rows.find((r) => r.year === attempt.year)) {
            rows.push({
              year: attempt.year,
              population: pop,
              source: "PEP",
              name,
            });
            console.log(`  ${attempt.year}: ${pop.toLocaleString()} (${name})`);
          }
        }
      }
    } catch (err: any) {
      console.log(`  PEP ${attempt.year} failed: ${err.message}`);
    }
  }

  return rows;
}

// ── Census ACS 5-Year ────────────────────────────────────────────────────

async function fetchACS(): Promise<CensusPopRow[]> {
  console.log("\n=== Census ACS 5-Year Estimates ===");
  const rows: CensusPopRow[] = [];

  // Try multiple ACS years
  const acsYears = [2022, 2021, 2020, 2019, 2018, 2017];

  for (const year of acsYears) {
    try {
      const url = `https://api.census.gov/data/${year}/acs/acs5?get=B01003_001E,NAME&for=place:59000&in=state:41`;
      const data = await fetchJson(url);

      if (!Array.isArray(data) || data.length < 2) continue;

      const headers: string[] = data[0];
      const popIdx = headers.indexOf("B01003_001E");
      const nameIdx = headers.indexOf("NAME");

      for (const row of data.slice(1)) {
        const pop = parseInt(row[popIdx], 10);
        const name = nameIdx >= 0 ? row[nameIdx] : "Portland";
        if (!isNaN(pop) && pop > 0) {
          rows.push({ year, population: pop, source: "ACS5", name });
          console.log(`  ACS ${year}: ${pop.toLocaleString()} (${name})`);
        }
      }
    } catch (err: any) {
      console.log(`  ACS ${year} failed: ${err.message}`);
    }
  }

  return rows;
}

// ── Insert into PostgreSQL ───────────────────────────────────────────────

async function insertData(pepRows: CensusPopRow[], acsRows: CensusPopRow[]) {
  console.log("\n=== Inserting Census Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS migration`);

    // Create census population table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS migration.census_population (
        id            SERIAL PRIMARY KEY,
        year          INTEGER NOT NULL,
        population    INTEGER NOT NULL,
        change_from_prev INTEGER,
        pct_change    NUMERIC(6,2),
        source        TEXT NOT NULL DEFAULT 'PEP',
        geo_name      TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(year, source)
      )
    `);

    // Merge PEP and ACS rows, preferring PEP
    const allRows = [...pepRows];
    for (const acs of acsRows) {
      if (!allRows.find((r) => r.year === acs.year && r.source === acs.source)) {
        allRows.push(acs);
      }
    }

    // Sort by year
    allRows.sort((a, b) => a.year - b.year);

    // Calculate year-over-year changes
    const pepSorted = allRows
      .filter((r) => r.source === "PEP")
      .sort((a, b) => a.year - b.year);
    for (let i = 1; i < pepSorted.length; i++) {
      const prev = pepSorted[i - 1];
      const curr = pepSorted[i];
      (curr as any).change = curr.population - prev.population;
      (curr as any).pctChange =
        Math.round(
          ((curr.population - prev.population) / prev.population) * 10000
        ) / 100;
    }

    // Truncate and re-insert
    await sql.unsafe(
      `TRUNCATE migration.census_population RESTART IDENTITY`
    );

    let inserted = 0;
    for (const row of allRows) {
      try {
        await sql`
          INSERT INTO migration.census_population (year, population, change_from_prev, pct_change, source, geo_name)
          VALUES (
            ${row.year},
            ${row.population},
            ${(row as any).change ?? null},
            ${(row as any).pctChange ?? null},
            ${row.source},
            ${row.name}
          )
          ON CONFLICT (year, source) DO UPDATE SET
            population = EXCLUDED.population,
            change_from_prev = EXCLUDED.change_from_prev,
            pct_change = EXCLUDED.pct_change,
            geo_name = EXCLUDED.geo_name
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Error inserting ${row.year}/${row.source}: ${err.message}`);
      }
    }

    console.log(`  Inserted ${inserted} census population rows`);

    // Also update the public.migration_census table (Drizzle schema table)
    // First ensure the table exists and has a unique constraint on year
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.migration_census (
        id          SERIAL PRIMARY KEY,
        year        INTEGER NOT NULL,
        population  INTEGER,
        change      INTEGER
      )
    `);
    // Add unique constraint if missing
    await sql.unsafe(`
      DO $$ BEGIN
        ALTER TABLE public.migration_census ADD CONSTRAINT migration_census_year_key UNIQUE (year);
      EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await sql.unsafe(`TRUNCATE public.migration_census RESTART IDENTITY`);

    // Use simple inserts since we truncated
    for (const row of pepSorted) {
      await sql`
        INSERT INTO public.migration_census (year, population, change)
        VALUES (${row.year}, ${row.population}, ${(row as any).change ?? null})
      `;
    }
    // Also insert ACS rows that don't overlap with PEP
    for (const row of acsRows) {
      const exists = pepSorted.find((r) => r.year === row.year);
      if (!exists) {
        await sql`
          INSERT INTO public.migration_census (year, population, change)
          VALUES (${row.year}, ${row.population}, ${null})
          ON CONFLICT (year) DO NOTHING
        `;
      }
    }
    console.log(`  Updated public.migration_census with ${pepSorted.length} PEP rows`);

    // Update dashboard cache
    const latestPep = pepSorted[pepSorted.length - 1];
    const cacheData = {
      source: "U.S. Census Bureau",
      api_sources: ["PEP Population Estimates", "ACS 5-Year"],
      pep_rows: pepSorted.map((r) => ({
        year: r.year,
        population: r.population,
        change: (r as any).change ?? null,
        pct_change: (r as any).pctChange ?? null,
      })),
      acs_rows: acsRows.map((r) => ({
        year: r.year,
        population: r.population,
      })),
      latest: latestPep
        ? {
            year: latestPep.year,
            population: latestPep.population,
            change: (latestPep as any).change ?? null,
          }
        : null,
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('census_population', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with census_population entry");

    // Verify
    const verify = await sql`
      SELECT source, count(*)::int as cnt, min(year) as min_year, max(year) as max_year
      FROM migration.census_population
      GROUP BY source
      ORDER BY source
    `;
    for (const row of verify) {
      console.log(
        `  ${row.source}: ${row.cnt} rows (${row.min_year}-${row.max_year})`
      );
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
  console.log("Portland Dashboard — Census Data Fetch");
  console.log("======================================");

  const pepRows = await fetchPEP();
  const acsRows = await fetchACS();

  const allRows = [...pepRows, ...acsRows];
  console.log(`\nTotal rows collected: ${allRows.length}`);

  if (allRows.length === 0) {
    console.log("WARNING: No Census data could be fetched. APIs may be down or rate-limited.");
    console.log("Consider registering for a Census API key at:");
    console.log("  https://api.census.gov/data/key_signup.html");
    process.exit(0);
  }

  // Save JSON
  const jsonPath = path.join(DATA_DIR, "census_population.json");
  fs.writeFileSync(jsonPath, JSON.stringify(allRows, null, 2));
  console.log(`Saved ${jsonPath}`);

  // Insert into database
  await insertData(pepRows, acsRows);

  console.log("\n======================================");
  console.log("Census data fetch complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
