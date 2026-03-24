/**
 * fetch-parks.ts
 *
 * Fetches Portland Parks data and amenities from the ArcGIS MapServer.
 * Handles pagination for large result sets.
 *
 * Usage: npx tsx scripts/fetch-parks.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const PARKS_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/2/query";
const AMENITIES_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/4/query";

const PAGE_SIZE = 2000;

interface ArcGISResponse {
  features: Array<{
    attributes: Record<string, any>;
    geometry?: any;
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

async function insertData(
  parks: Record<string, any>[],
  amenities: Record<string, any>[]
) {
  console.log("\n=== Inserting Parks Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quality.parks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        acres NUMERIC(10,2),
        property_id TEXT,
        geometry_type TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name)
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quality.park_amenities (
        id SERIAL PRIMARY KEY,
        park_name TEXT,
        amenity_type TEXT NOT NULL,
        amenity_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(park_name, amenity_type, amenity_name)
      )
    `);

    // Insert parks
    let parksInserted = 0;
    let parksUpdated = 0;
    for (const p of parks) {
      const name = p.NAME || p.name || p.Name;
      if (!name) continue;

      const acres = p.ACRES || p.acres || p.Acres || null;
      const propertyId = p.PROPERTYID || p.PropertyId || p.propertyid || null;

      try {
        const result = await sql`
          INSERT INTO quality.parks (name, acres, property_id)
          VALUES (${name}, ${acres}, ${propertyId})
          ON CONFLICT (name) DO UPDATE SET
            acres = EXCLUDED.acres,
            property_id = EXCLUDED.property_id
          RETURNING (xmax = 0) AS is_insert
        `;
        if (result[0]?.is_insert) parksInserted++;
        else parksUpdated++;
      } catch (err: any) {
        console.log(`  Error inserting park "${name}": ${err.message}`);
      }
    }
    console.log(`  Parks — Inserted: ${parksInserted}, Updated: ${parksUpdated}`);

    // Insert amenities
    let amenInserted = 0;
    let amenUpdated = 0;
    for (const a of amenities) {
      const parkName = a.PARKNAME || a.ParkName || a.parkname || a.NAME || null;
      const amenityType = a.TYPE || a.Type || a.type || a.AMENITY_TYPE || "Unknown";
      const amenityName = a.NAME || a.Name || a.name || a.AMENITY || null;

      try {
        const result = await sql`
          INSERT INTO quality.park_amenities (park_name, amenity_type, amenity_name)
          VALUES (${parkName}, ${amenityType}, ${amenityName})
          ON CONFLICT (park_name, amenity_type, amenity_name) DO NOTHING
          RETURNING (xmax = 0) AS is_insert
        `;
        if (result.length > 0) amenInserted++;
        else amenUpdated++;
      } catch (err: any) {
        console.log(`  Error inserting amenity: ${err.message}`);
      }
    }
    console.log(`  Amenities — Inserted: ${amenInserted}, Skipped (existing): ${amenUpdated}`);

    // Verify
    const parkCount = await sql`SELECT count(*)::int as cnt FROM quality.parks`;
    const amenCount = await sql`SELECT count(*)::int as cnt FROM quality.park_amenities`;
    const acreStats = await sql`
      SELECT round(sum(acres)::numeric, 1) as total_acres,
             round(avg(acres)::numeric, 2) as avg_acres,
             max(acres) as max_acres
      FROM quality.parks
      WHERE acres IS NOT NULL
    `;

    console.log("\n  Verification:");
    console.log(`    Parks in DB: ${parkCount[0].cnt}`);
    console.log(`    Amenities in DB: ${amenCount[0].cnt}`);
    if (acreStats[0]) {
      console.log(
        `    Total acreage: ${acreStats[0].total_acres}, avg: ${acreStats[0].avg_acres}, max: ${acreStats[0].max_acres}`
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
  console.log("Portland Dashboard — Parks Data Fetch");
  console.log("=====================================");

  const parks = await fetchAllPages(
    PARKS_URL,
    "NAME,ACRES,PROPERTYID",
    "parks"
  );

  let amenities: Record<string, any>[] = [];
  try {
    amenities = await fetchAllPages(
      AMENITIES_URL,
      "*",
      "park amenities"
    );
  } catch (err: any) {
    console.log(`  Amenities fetch failed (non-fatal): ${err.message}`);
    console.log("  Continuing with parks only...");
  }

  if (parks.length === 0) {
    console.log("WARNING: No parks data fetched.");
    process.exit(0);
  }

  await insertData(parks, amenities);

  console.log("\n=====================================");
  console.log("Parks data fetch complete!");
  console.log(`  Parks: ${parks.length}, Amenities: ${amenities.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
