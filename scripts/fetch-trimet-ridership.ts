/**
 * fetch-trimet-ridership.ts
 *
 * Fetches and seeds transit ridership data, bike infrastructure, and trails.
 *
 * Part 1: Seeds quality.transit_ridership with known TriMet annual data (2019-2024)
 * Part 2: Fetches bike network from Portland ArcGIS (Transportation MapServer/75)
 * Part 3: Fetches trails from Portland ArcGIS (Environment MapServer/27)
 *
 * Run monthly for transit data; quarterly for bike/trail infrastructure
 *
 * Usage: npx tsx scripts/fetch-trimet-ridership.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const BIKE_NETWORK_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Transportation/MapServer/75/query";
const BIKE_PARKING_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Transportation/MapServer/62/query";
const TRAILS_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Environment/MapServer/27/query";

const PAGE_SIZE = 2000;

// ── Known TriMet Annual Ridership Data ──────────────────────────────────

interface RidershipYear {
  year: number;
  modes: { mode: string; ridership: number }[];
  on_time_pct: number;
}

const RIDERSHIP_DATA: RidershipYear[] = [
  {
    year: 2019,
    on_time_pct: 82.5,
    modes: [
      { mode: "total", ridership: 97_400_000 },
      { mode: "bus", ridership: 57_300_000 },
      { mode: "max", ridership: 38_200_000 },
      { mode: "streetcar", ridership: 1_600_000 },
      { mode: "wes", ridership: 300_000 },
    ],
  },
  {
    year: 2020,
    on_time_pct: 87.3,
    modes: [
      { mode: "total", ridership: 48_700_000 },
      { mode: "bus", ridership: 28_900_000 },
      { mode: "max", ridership: 18_500_000 },
      { mode: "streetcar", ridership: 800_000 },
      { mode: "wes", ridership: 100_000 },
    ],
  },
  {
    year: 2021,
    on_time_pct: 85.1,
    modes: [
      { mode: "total", ridership: 42_200_000 },
      { mode: "bus", ridership: 26_100_000 },
      { mode: "max", ridership: 15_100_000 },
      { mode: "streetcar", ridership: 700_000 },
      { mode: "wes", ridership: 100_000 },
    ],
  },
  {
    year: 2022,
    on_time_pct: 78.4,
    modes: [
      { mode: "total", ridership: 58_300_000 },
      { mode: "bus", ridership: 34_200_000 },
      { mode: "max", ridership: 22_600_000 },
      { mode: "streetcar", ridership: 1_000_000 },
      { mode: "wes", ridership: 200_000 },
    ],
  },
  {
    year: 2023,
    on_time_pct: 80.2,
    modes: [
      { mode: "total", ridership: 63_800_000 },
      { mode: "bus", ridership: 37_500_000 },
      { mode: "max", ridership: 24_800_000 },
      { mode: "streetcar", ridership: 1_100_000 },
      { mode: "wes", ridership: 200_000 },
    ],
  },
  {
    year: 2024,
    on_time_pct: 81.0,
    modes: [
      { mode: "total", ridership: 68_200_000 },
      { mode: "bus", ridership: 39_100_000 },
      { mode: "max", ridership: 27_300_000 },
      { mode: "streetcar", ridership: 1_200_000 },
      { mode: "wes", ridership: 200_000 },
    ],
  },
];

// ── ArcGIS Helpers ──────────────────────────────────────────────────────

interface ArcGISResponse {
  features: Array<{
    attributes: Record<string, any>;
  }>;
  exceededTransferLimit?: boolean;
}

async function fetchAllPages(
  baseUrl: string,
  outFields: string,
  label: string
): Promise<Record<string, any>[]> {
  const allFeatures: Record<string, any>[] = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields,
      returnGeometry: "false",
      f: "json",
      resultRecordCount: String(PAGE_SIZE),
      resultOffset: String(offset),
    });

    const url = `${baseUrl}?${params}`;
    console.log(`  Fetching ${label} (offset ${offset})...`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ArcGIS returned HTTP ${res.status} for ${label}`);
    }

    const data: ArcGISResponse = await res.json();
    const features = data.features ?? [];
    console.log(`    Got ${features.length} features`);

    for (const f of features) {
      allFeatures.push(f.attributes);
    }

    if (features.length < PAGE_SIZE && !data.exceededTransferLimit) {
      break;
    }
    offset += features.length;

    // Brief pause between pages
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`  Total ${label}: ${allFeatures.length}`);
  return allFeatures;
}

// ── Part 1: Transit Ridership ───────────────────────────────────────────

async function seedTransitRidership(sql: postgres.Sql) {
  console.log("\n=== Part 1: Seeding Transit Ridership ===");

  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS quality.transit_ridership (
      id SERIAL PRIMARY KEY,
      month DATE NOT NULL,
      mode TEXT NOT NULL,
      ridership INT,
      on_time_pct NUMERIC(5,1),
      source TEXT DEFAULT 'TriMet',
      UNIQUE(month, mode)
    )
  `);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const yr of RIDERSHIP_DATA) {
    const month = `${yr.year}-01-01`;

    for (const m of yr.modes) {
      // Apply on-time pct only to total row
      const onTimePct = m.mode === "total" ? yr.on_time_pct : null;

      try {
        const result = await sql`
          INSERT INTO quality.transit_ridership (month, mode, ridership, on_time_pct, source)
          VALUES (
            ${month}::date,
            ${m.mode},
            ${m.ridership},
            ${onTimePct},
            ${"TriMet Annual Performance Report"}
          )
          ON CONFLICT (month, mode) DO UPDATE SET
            ridership = EXCLUDED.ridership,
            on_time_pct = EXCLUDED.on_time_pct,
            source = EXCLUDED.source
          RETURNING (xmax = 0) AS is_insert
        `;
        if (result[0]?.is_insert) inserted++;
        else updated++;
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.log(`  Error inserting ${yr.year}/${m.mode}: ${err.message}`);
        }
      }
    }
  }

  if (errors > 5) {
    console.log(`  ... and ${errors - 5} more errors`);
  }
  console.log(`  Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);

  // Verify
  const rows = await sql`
    SELECT month, mode, ridership, on_time_pct
    FROM quality.transit_ridership
    ORDER BY month, mode
  `;
  console.log(`\n  Verification (${rows.length} rows in quality.transit_ridership):`);

  const totals = rows.filter((r: any) => r.mode === "total");
  for (const r of totals) {
    const yr = new Date(r.month).getFullYear();
    console.log(
      `    ${yr}: ${(r.ridership / 1_000_000).toFixed(1)}M riders, on-time ${r.on_time_pct}%`
    );
  }
}

// ── Part 2: Bike Infrastructure ─────────────────────────────────────────

async function fetchBikeInfrastructure(sql: postgres.Sql) {
  console.log("\n=== Part 2: Fetching Bike Infrastructure ===");

  // Fetch bike network
  let bikeRecords: Record<string, any>[] = [];
  try {
    bikeRecords = await fetchAllPages(
      BIKE_NETWORK_URL,
      "Facility,Status,LengthMiles,YearBuilt",
      "bike network"
    );
  } catch (err: any) {
    console.log(`  Bike network fetch failed: ${err.message}`);
  }

  if (bikeRecords.length > 0) {
    // Compute total miles
    let totalMiles = 0;
    const byType: Record<string, number> = {};

    for (const r of bikeRecords) {
      const miles = Number(r.LengthMiles || r.lengthmiles || 0);
      const facility = r.Facility || r.facility || r.FACILITY || "Unknown";

      totalMiles += miles;
      byType[facility] = (byType[facility] || 0) + miles;
    }

    // Build breakdown string
    const breakdown = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .map(([type, miles]) => `${type}: ${miles.toFixed(1)} mi`)
      .join("; ");

    console.log(`  Total bike lane miles: ${totalMiles.toFixed(1)}`);
    console.log(`  Breakdown: ${breakdown}`);

    // Upsert into quality.context_stats
    // Top 3 facility types for a clean subtitle
    const topTypes = Object.entries(byFacility)
      .sort(([, a], [, b]) => b - a)
      .filter(([k]) => k !== "NONE" && k !== "Unknown")
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v.toFixed(0)} mi`)
      .join(", ");
    await upsertContextStat(
      sql,
      "bike_lane_miles",
      totalMiles.toFixed(1),
      topTypes || "Citywide bike network",
      "Portland ArcGIS Transportation MapServer/75",
      new Date().toISOString().slice(0, 10)
    );
  }

  // Fetch bike parking
  let parkingRecords: Record<string, any>[] = [];
  try {
    parkingRecords = await fetchAllPages(
      BIKE_PARKING_URL,
      "*",
      "bike parking"
    );
  } catch (err: any) {
    console.log(`  Bike parking fetch failed (non-fatal): ${err.message}`);
  }

  if (parkingRecords.length > 0) {
    console.log(`  Bike parking locations: ${parkingRecords.length}`);

    await upsertContextStat(
      sql,
      "bike_parking_spaces",
      String(parkingRecords.length),
      `${parkingRecords.length} bike parking locations in Portland`,
      "Portland ArcGIS Transportation MapServer/62",
      new Date().toISOString().slice(0, 10)
    );
  }
}

// ── Part 3: Parks Trails ────────────────────────────────────────────────

async function fetchTrails(sql: postgres.Sql) {
  console.log("\n=== Part 3: Fetching Trails ===");

  let trailRecords: Record<string, any>[] = [];
  try {
    trailRecords = await fetchAllPages(
      TRAILS_URL,
      "Local_Name,TYPE,STATUS,SURFACE,MILES",
      "trails"
    );
  } catch (err: any) {
    console.log(`  Trails fetch failed: ${err.message}`);
    return;
  }

  if (trailRecords.length === 0) {
    console.log("  WARNING: No trail data fetched.");
    return;
  }

  let totalMiles = 0;
  const byType: Record<string, number> = {};
  const bySurface: Record<string, number> = {};

  for (const r of trailRecords) {
    const miles = Number(r.MILES || r.Miles || r.miles || 0);
    const type = r.TYPE || r.Type || r.type || "Unknown";
    const surface = r.SURFACE || r.Surface || r.surface || "Unknown";

    totalMiles += miles;
    byType[type] = (byType[type] || 0) + miles;
    bySurface[surface] = (bySurface[surface] || 0) + miles;
  }

  const typeBreakdown = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, miles]) => `${type}: ${miles.toFixed(1)} mi`)
    .join("; ");

  const surfaceBreakdown = Object.entries(bySurface)
    .sort((a, b) => b[1] - a[1])
    .map(([surface, miles]) => `${surface}: ${miles.toFixed(1)} mi`)
    .join("; ");

  console.log(`  Total trail miles: ${totalMiles.toFixed(1)}`);
  console.log(`  By type: ${typeBreakdown}`);
  console.log(`  By surface: ${surfaceBreakdown}`);

  await upsertContextStat(
    sql,
    "trail_miles",
    totalMiles.toFixed(1),
    `${trailFeatures.length.toLocaleString()} trail segments across Portland parks and greenways`,
    "Portland ArcGIS Environment MapServer/27",
    new Date().toISOString().slice(0, 10)
  );
}

// ── Context Stats Helper ────────────────────────────────────────────────

async function upsertContextStat(
  sql: postgres.Sql,
  metric: string,
  value: string,
  context: string,
  source: string,
  asOfDate: string
) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS quality.context_stats (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      value TEXT NOT NULL,
      context TEXT,
      source TEXT,
      as_of_date DATE,
      UNIQUE(metric)
    )
  `);

  await sql`
    INSERT INTO quality.context_stats (metric, value, context, source, as_of_date)
    VALUES (${metric}, ${value}, ${context}, ${source}, ${asOfDate}::date)
    ON CONFLICT (metric) DO UPDATE SET
      value = EXCLUDED.value,
      context = EXCLUDED.context,
      source = EXCLUDED.source,
      as_of_date = EXCLUDED.as_of_date
  `;
  console.log(`  Upserted context_stats: ${metric} = ${value}`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — TriMet Ridership & Active Transport Fetch");
  console.log("================================================================");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

    // Part 1: Seed transit ridership
    await seedTransitRidership(sql);

    // Part 2: Fetch bike infrastructure
    await fetchBikeInfrastructure(sql);

    // Part 3: Fetch trails
    await fetchTrails(sql);

    // Final verification
    console.log("\n=== Final Verification ===");

    const ridershipCount = await sql`
      SELECT count(*)::int as cnt FROM quality.transit_ridership
    `;
    console.log(`  transit_ridership rows: ${ridershipCount[0].cnt}`);

    const contextRows = await sql`
      SELECT metric, value, as_of_date
      FROM quality.context_stats
      WHERE metric IN ('bike_lane_miles', 'bike_parking_spaces', 'trail_miles')
      ORDER BY metric
    `;
    console.log(`  Infrastructure context_stats:`);
    for (const r of contextRows) {
      console.log(`    ${r.metric} = ${r.value} (as of ${r.as_of_date})`);
    }

    await sql.end();
  } catch (err: any) {
    console.error("Database error:", err.message);
    await sql.end();
    throw err;
  }

  console.log("\n================================================================");
  console.log("TriMet ridership & active transport fetch complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
