/**
 * seed-quality-extras.ts
 *
 * Run quarterly or when new static data becomes available
 *
 * Seeds static/semi-static quality of life data that doesn't come from APIs:
 *   1. Cultural institutions (museums, theaters, galleries, etc.)
 *   2. Context stats (tree canopy, broadband, community gardens, heritage trees)
 *   3. BLS CPI data (Portland-area Consumer Price Index)
 *
 * Idempotent — safe to re-run. Uses ON CONFLICT DO UPDATE.
 *
 * Usage: npx tsx scripts/seed-quality-extras.ts
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

// ── 1. Cultural Institutions ────────────────────────────────────────────

async function seedCulturalInstitutions() {
  console.log("\n=== Seeding quality.cultural_institutions ===");

  await sql`CREATE SCHEMA IF NOT EXISTS quality`;

  await sql`
    CREATE TABLE IF NOT EXISTS quality.cultural_institutions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      address TEXT,
      website TEXT,
      source TEXT,
      UNIQUE(name)
    )
  `;

  const institutions = [
    { name: "Portland Art Museum", type: "museum", address: "1219 SW Park Ave", website: "https://portlandartmuseum.org" },
    { name: "Oregon Museum of Science and Industry (OMSI)", type: "science", address: "1945 SE Water Ave", website: "https://omsi.edu" },
    { name: "Portland Center Stage at The Armory", type: "theater", address: "128 NW 11th Ave", website: "https://pcs.org" },
    { name: "Oregon Symphony", type: "music_venue", address: "921 SW Washington St", website: "https://orsymphony.org" },
    { name: "Portland Opera", type: "music_venue", address: "211 SE Caruthers St", website: "https://portlandopera.org" },
    { name: "Oregon Ballet Theatre", type: "dance", address: "0720 SW Bancroft St", website: "https://obt.org" },
    { name: "Portland Children's Museum", type: "museum", address: "4015 SW Canyon Rd", website: "https://portlandcm.org" },
    { name: "Oregon Historical Society", type: "historical", address: "1200 SW Park Ave", website: "https://ohs.org" },
    { name: "Pittock Mansion", type: "historical", address: "3229 NW Pittock Dr", website: "https://pittockmansion.org" },
    { name: "Portland Japanese Garden", type: "gallery", address: "611 SW Kingston Ave", website: "https://japanesegarden.org" },
    { name: "Lan Su Chinese Garden", type: "gallery", address: "239 NW Everett St", website: "https://lansugarden.org" },
    { name: "Alberta Rose Theatre", type: "theater", address: "3000 NE Alberta St", website: "https://albertarosetheatre.com" },
    { name: "Revolution Hall", type: "music_venue", address: "1300 SE Stark St", website: "https://revolutionhall.com" },
    { name: "Arlene Schnitzer Concert Hall", type: "music_venue", address: "1037 SW Broadway", website: "https://portland5.com" },
    { name: "Keller Auditorium", type: "theater", address: "222 SW Clay St", website: "https://portland5.com" },
    { name: "Newmark Theatre", type: "theater", address: "1111 SW Broadway", website: "https://portland5.com" },
    { name: "Hollywood Theatre", type: "theater", address: "4122 NE Sandy Blvd", website: "https://hollywoodtheatre.org" },
    { name: "Literary Arts", type: "literary", address: "925 SW Washington St", website: "https://literary-arts.org" },
    { name: "Portland Institute for Contemporary Art (PICA)", type: "gallery", address: "15 NE Hancock St", website: "https://pica.org" },
    { name: "Museum of Contemporary Craft", type: "gallery", address: "724 NW Davis St", website: "(closed but historically significant)" },
    { name: "Northwest Film Center", type: "theater", address: "934 SW Salmon St", website: "https://nwfilm.org" },
    { name: "Oregon Jewish Museum and Center for Holocaust Education", type: "museum", address: "724 NW Davis St", website: "https://ojmche.org" },
    { name: "World Forestry Center", type: "museum", address: "4033 SW Canyon Rd", website: "https://worldforestry.org" },
  ];

  const source = "Portland Civic Lab compiled list";

  for (const inst of institutions) {
    await sql`
      INSERT INTO quality.cultural_institutions (name, type, address, website, source)
      VALUES (${inst.name}, ${inst.type}, ${inst.address}, ${inst.website}, ${source})
      ON CONFLICT (name) DO UPDATE SET
        type = EXCLUDED.type,
        address = EXCLUDED.address,
        website = EXCLUDED.website,
        source = EXCLUDED.source
    `;
  }

  const count = await sql`SELECT COUNT(*) AS n FROM quality.cultural_institutions`;
  console.log(`  Inserted/updated ${institutions.length} institutions (${count[0].n} total in table)`);
}

// ── 2. Context Stats ────────────────────────────────────────────────────

async function seedContextStats() {
  console.log("\n=== Seeding quality.context_stats ===");

  await sql`
    CREATE TABLE IF NOT EXISTS quality.context_stats (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      value TEXT NOT NULL,
      context TEXT,
      source TEXT,
      as_of_date DATE,
      UNIQUE(metric)
    )
  `;

  const stats = [
    {
      metric: "tree_canopy_pct",
      value: "29.8",
      context: "Down from 30.7% in 2015. Goal: increase canopy to 33% by 2035.",
      source: "Metro RLIS / Portland Urban Forestry",
      as_of_date: "2020-01-01",
    },
    {
      metric: "broadband_pct",
      value: "94.2",
      context: "Percentage of households with broadband access (25/3 Mbps+). Rural SW Portland has lowest access.",
      source: "FCC Broadband Map 2023",
      as_of_date: "2023-12-01",
    },
    {
      metric: "broadband_providers",
      value: "7",
      context: "Major ISPs: Comcast Xfinity, CenturyLink/Lumen, Ziply Fiber, T-Mobile, Verizon, Starlink, Portland Telecom Coop",
      source: "FCC Broadband Map 2023",
      as_of_date: "2023-12-01",
    },
    {
      metric: "community_gardens",
      value: "52",
      context: "52 community garden sites managed by Portland Parks & Recreation with 3,000+ plots",
      source: "Portland Parks ArcGIS",
      as_of_date: "2024-01-01",
    },
    {
      metric: "heritage_trees",
      value: "340",
      context: "Protected heritage trees designated by the Urban Forestry Commission",
      source: "Portland ArcGIS Heritage Trees Layer",
      as_of_date: "2024-01-01",
    },
  ];

  for (const s of stats) {
    await sql`
      INSERT INTO quality.context_stats (metric, value, context, source, as_of_date)
      VALUES (${s.metric}, ${s.value}, ${s.context}, ${s.source}, ${s.as_of_date})
      ON CONFLICT (metric) DO UPDATE SET
        value = EXCLUDED.value,
        context = EXCLUDED.context,
        source = EXCLUDED.source,
        as_of_date = EXCLUDED.as_of_date
    `;
  }

  const count = await sql`SELECT COUNT(*) AS n FROM quality.context_stats`;
  console.log(`  Inserted/updated ${stats.length} stats (${count[0].n} total in table)`);
}

// ── 3. BLS CPI Data (Portland-area) ────────────────────────────────────

async function seedAffordabilityCpi() {
  console.log("\n=== Seeding quality.affordability (CPI) ===");

  await sql`
    CREATE TABLE IF NOT EXISTS quality.affordability (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL,
      metric TEXT NOT NULL,
      value NUMERIC(12,2),
      source TEXT,
      UNIQUE(year, metric)
    )
  `;

  const cpiData = [
    { year: 2019, value: 267.5, source: "BLS CPI-U West Size Class B/C (CUURS49BSA0)" },
    { year: 2020, value: 270.1, source: "BLS CPI-U West Size Class B/C" },
    { year: 2021, value: 282.3, source: "BLS CPI-U West Size Class B/C" },
    { year: 2022, value: 305.1, source: "BLS CPI-U West Size Class B/C" },
    { year: 2023, value: 316.2, source: "BLS CPI-U West Size Class B/C" },
    { year: 2024, value: 323.8, source: "BLS CPI-U West Size Class B/C" },
  ];

  const metric = "cpi";

  for (const row of cpiData) {
    await sql`
      INSERT INTO quality.affordability (year, metric, value, source)
      VALUES (${row.year}, ${metric}, ${row.value}, ${row.source})
      ON CONFLICT (year, metric) DO UPDATE SET
        value = EXCLUDED.value,
        source = EXCLUDED.source
    `;
  }

  const count = await sql`SELECT COUNT(*) AS n FROM quality.affordability WHERE metric = 'cpi'`;
  console.log(`  Inserted/updated ${cpiData.length} CPI rows (${count[0].n} CPI rows in table)`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("seed-quality-extras: starting...");
  console.log(`  DB: ${DB_URL.replace(/\/\/.*@/, "//***@")}`);

  try {
    await seedCulturalInstitutions();
    await seedContextStats();
    await seedAffordabilityCpi();

    // Verification summary
    console.log("\n=== Verification ===");
    const institutions = await sql`SELECT type, COUNT(*) AS n FROM quality.cultural_institutions GROUP BY type ORDER BY n DESC`;
    console.log("  Cultural institutions by type:");
    for (const row of institutions) {
      console.log(`    ${row.type}: ${row.n}`);
    }

    const stats = await sql`SELECT metric, value FROM quality.context_stats ORDER BY metric`;
    console.log("  Context stats:");
    for (const row of stats) {
      console.log(`    ${row.metric}: ${row.value}`);
    }

    const cpi = await sql`SELECT year, value FROM quality.affordability WHERE metric = 'cpi' ORDER BY year`;
    console.log("  CPI trend:");
    for (const row of cpi) {
      console.log(`    ${row.year}: ${row.value}`);
    }

    console.log("\nDone! All quality extras seeded successfully.");
  } catch (err) {
    console.error("\nFATAL:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
