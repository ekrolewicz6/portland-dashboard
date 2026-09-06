/**
 * fetch-census-tracts.ts
 *
 * Fetches tract-level Census ACS data (median income, poverty, population),
 * tract geometries from Census TIGER, and neighborhood boundaries from
 * Portland ArcGIS. Pre-computes tract→neighborhood mapping via point-in-polygon,
 * then aggregates and inserts into economy.neighborhood_income.
 *
 * Usage: npx tsx ingest/fetch-census-tracts.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
fs.mkdirSync(DATA_DIR, { recursive: true });

const sql = postgres(DB_URL);

// ── Types ───────────────────────────────────────────────────────────────

interface TractData {
  geoid: string;
  name: string;
  medianIncome: number | null;
  povertyCount: number | null;
  povertyUniverse: number | null;
  population: number | null;
}

interface TractGeometry {
  geoid: string;
  centroid: [number, number]; // [lon, lat]
}

interface Neighborhood {
  name: string;
  rings: [number, number][][]; // polygon rings in lon/lat
}

interface NeighborhoodIncome {
  neighborhood: string;
  medianIncome: number;
  povertyRate: number;
  population: number;
  tractCount: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────

async function fetchJson(url: string): Promise<any> {
  console.log(`  Fetching: ${url.slice(0, 120)}...`);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** Convert Web Mercator (EPSG:3857) to WGS84 (EPSG:4326) */
function webMercatorToWgs84(x: number, y: number): [number, number] {
  const lon = (x / 20037508.34) * 180;
  const latRad = Math.atan(Math.exp((y / 20037508.34) * Math.PI));
  const lat = latRad * (360 / Math.PI) - 90;
  return [lon, lat];
}

/** Compute centroid of a polygon (average of exterior ring vertices) */
function polygonCentroid(coords: number[][][]): [number, number] {
  const ring = coords[0]; // exterior ring
  let sumLon = 0,
    sumLat = 0;
  for (const [lon, lat] of ring) {
    sumLon += lon;
    sumLat += lat;
  }
  return [sumLon / ring.length, sumLat / ring.length];
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(
  point: [number, number],
  rings: [number, number][][]
): boolean {
  const [px, py] = point;

  // Check exterior ring
  let inside = raycast(px, py, rings[0]);

  // Subtract holes
  for (let i = 1; i < rings.length; i++) {
    if (raycast(px, py, rings[i])) {
      inside = !inside;
    }
  }
  return inside;
}

function raycast(
  px: number,
  py: number,
  ring: [number, number][]
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ── Step 1: Fetch tract-level ACS data ──────────────────────────────────

async function fetchAcsTracts(): Promise<TractData[]> {
  console.log("\n=== Step 1: Fetch Census ACS tract-level data ===");

  const url =
    "https://api.census.gov/data/2022/acs/acs5?get=NAME,B19013_001E,B17001_002E,B17001_001E,B01003_001E&for=tract:*&in=state:41&in=county:051";
  const raw = await fetchJson(url);

  // First row is headers
  const headers = raw[0] as string[];
  const rows = raw.slice(1) as string[][];

  const tracts: TractData[] = rows.map((row) => {
    const state = row[headers.indexOf("state")];
    const county = row[headers.indexOf("county")];
    const tract = row[headers.indexOf("tract")];
    const geoid = `${state}${county}${tract}`;

    const income = row[headers.indexOf("B19013_001E")];
    const povCount = row[headers.indexOf("B17001_002E")];
    const povUniverse = row[headers.indexOf("B17001_001E")];
    const pop = row[headers.indexOf("B01003_001E")];

    return {
      geoid,
      name: row[headers.indexOf("NAME")],
      medianIncome: income && income !== "-666666666" ? Number(income) : null,
      povertyCount: povCount ? Number(povCount) : null,
      povertyUniverse: povUniverse ? Number(povUniverse) : null,
      population: pop ? Number(pop) : null,
    };
  });

  console.log(`  Got ${tracts.length} tracts`);
  console.log(
    `  ${tracts.filter((t) => t.medianIncome !== null).length} have median income data`
  );
  return tracts;
}

// ── Step 2: Fetch tract geometries from TIGER ───────────────────────────

async function fetchTractGeometries(): Promise<TractGeometry[]> {
  console.log("\n=== Step 2: Fetch Census TIGER tract geometries ===");

  const results: TractGeometry[] = [];
  let offset = 0;
  const batchSize = 100;

  for (let page = 0; page < 10; page++) {
    const url =
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/6/query` +
      `?where=STATE%3D%2741%27+AND+COUNTY%3D%27051%27` +
      `&outFields=GEOID` +
      `&returnGeometry=true&f=geojson` +
      `&resultRecordCount=${batchSize}&resultOffset=${offset}`;

    const data = await fetchJson(url);
    const features = data.features || [];
    if (features.length === 0) break;

    for (const feat of features) {
      const geoid = feat.properties.GEOID as string;
      const geom = feat.geometry;
      let centroid: [number, number];

      if (geom.type === "Polygon") {
        centroid = polygonCentroid(geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        // Use largest polygon
        const largest = geom.coordinates.reduce(
          (max: number[][][], poly: number[][][]) =>
            poly[0].length > max[0].length ? poly : max,
          geom.coordinates[0]
        );
        centroid = polygonCentroid(largest);
      } else {
        console.warn(`  Unexpected geometry type: ${geom.type} for ${geoid}`);
        continue;
      }

      results.push({ geoid, centroid });
    }

    offset += batchSize;
    if (features.length < batchSize) break;
  }

  console.log(`  Got ${results.length} tract geometries with centroids`);
  return results;
}

// ── Step 3: Fetch neighborhood boundaries ───────────────────────────────

async function fetchNeighborhoodBoundaries(): Promise<Neighborhood[]> {
  console.log("\n=== Step 3: Fetch Portland neighborhood boundaries ===");

  const neighborhoods: Neighborhood[] = [];
  let offset = 0;
  const batchSize = 100;

  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields: "NAME",
      returnGeometry: "true",
      f: "json",
      resultRecordCount: String(batchSize),
      resultOffset: String(offset),
    });

    const url = `https://www.portlandmaps.com/arcgis/rest/services/Public/Boundaries/MapServer/1/query?${params}`;
    const data = await fetchJson(url);
    const features = data.features || [];
    if (features.length === 0) break;

    for (const feat of features) {
      const name = feat.attributes.NAME as string;
      const geom = feat.geometry;

      if (!geom?.rings) {
        console.warn(`  No rings for neighborhood: ${name}`);
        continue;
      }

      // Convert rings from Web Mercator to WGS84
      const rings: [number, number][][] = geom.rings.map(
        (ring: number[][]) =>
          ring.map(([x, y]: number[]) => webMercatorToWgs84(x, y))
      );

      neighborhoods.push({ name, rings });
    }

    offset += batchSize;
    if (features.length < batchSize) break;
  }

  console.log(`  Got ${neighborhoods.length} neighborhood boundaries`);
  return neighborhoods;
}

// ── Step 4: Point-in-polygon assignment ─────────────────────────────────

function assignTractsToNeighborhoods(
  tracts: TractData[],
  geometries: TractGeometry[],
  neighborhoods: Neighborhood[]
): Map<string, TractData[]> {
  console.log("\n=== Step 4: Assign tracts to neighborhoods ===");

  const geoMap = new Map(geometries.map((g) => [g.geoid, g.centroid]));
  const result = new Map<string, TractData[]>();
  let matched = 0;
  let unmatched = 0;

  for (const tract of tracts) {
    const centroid = geoMap.get(tract.geoid);
    if (!centroid) {
      unmatched++;
      continue;
    }

    let assigned = false;
    for (const hood of neighborhoods) {
      if (pointInPolygon(centroid, hood.rings)) {
        const existing = result.get(hood.name) || [];
        existing.push(tract);
        result.set(hood.name, existing);
        assigned = true;
        matched++;
        break;
      }
    }

    if (!assigned) {
      unmatched++;
    }
  }

  console.log(`  Matched: ${matched} tracts → ${result.size} neighborhoods`);
  console.log(`  Unmatched: ${unmatched} tracts (outside Portland or no geometry)`);
  return result;
}

// ── Step 5: Aggregate and insert ────────────────────────────────────────

function aggregate(
  mapping: Map<string, TractData[]>
): NeighborhoodIncome[] {
  const results: NeighborhoodIncome[] = [];

  for (const [neighborhood, tracts] of mapping) {
    const withIncome = tracts.filter((t) => t.medianIncome !== null);
    if (withIncome.length === 0) continue;

    // Weighted average of median income by population
    let weightedIncome = 0;
    let totalPop = 0;
    for (const t of withIncome) {
      const pop = t.population ?? 1;
      weightedIncome += t.medianIncome! * pop;
      totalPop += pop;
    }
    const medianIncome = totalPop > 0 ? Math.round(weightedIncome / totalPop) : 0;

    // Poverty rate: sum(poverty count) / sum(poverty universe)
    const totalPovCount = tracts.reduce(
      (s, t) => s + (t.povertyCount ?? 0),
      0
    );
    const totalPovUniverse = tracts.reduce(
      (s, t) => s + (t.povertyUniverse ?? 0),
      0
    );
    const povertyRate =
      totalPovUniverse > 0
        ? Math.round((totalPovCount / totalPovUniverse) * 1000) / 10
        : 0;

    const population = tracts.reduce((s, t) => s + (t.population ?? 0), 0);

    results.push({
      neighborhood,
      medianIncome,
      povertyRate,
      population,
      tractCount: tracts.length,
    });
  }

  return results.sort((a, b) => b.medianIncome - a.medianIncome);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Fetch Census Tract Income → Neighborhood Aggregation ===");

  // Fetch all three data sources
  const [tracts, geometries, neighborhoods] = await Promise.all([
    fetchAcsTracts(),
    fetchTractGeometries(),
    fetchNeighborhoodBoundaries(),
  ]);

  // Assign and aggregate
  const mapping = assignTractsToNeighborhoods(tracts, geometries, neighborhoods);
  const aggregated = aggregate(mapping);

  console.log(`\n=== Results: ${aggregated.length} neighborhoods with data ===`);
  console.log("Top 5 by income:");
  for (const n of aggregated.slice(0, 5)) {
    console.log(
      `  ${n.neighborhood}: $${n.medianIncome.toLocaleString()} median, ${n.povertyRate}% poverty, pop ${n.population.toLocaleString()}`
    );
  }
  console.log("Bottom 5 by income:");
  for (const n of aggregated.slice(-5)) {
    console.log(
      `  ${n.neighborhood}: $${n.medianIncome.toLocaleString()} median, ${n.povertyRate}% poverty, pop ${n.population.toLocaleString()}`
    );
  }

  // Save JSON snapshot
  const snapshotPath = path.join(DATA_DIR, "census_tract_income.json");
  fs.writeFileSync(snapshotPath, JSON.stringify(aggregated, null, 2));
  console.log(`\nSaved snapshot: ${snapshotPath}`);

  // Create table and insert
  console.log("\n=== Inserting into economy.neighborhood_income ===");

  await sql`CREATE SCHEMA IF NOT EXISTS economy`;

  await sql`
    CREATE TABLE IF NOT EXISTS economy.neighborhood_income (
      id SERIAL PRIMARY KEY,
      neighborhood TEXT NOT NULL,
      median_income INTEGER,
      poverty_rate NUMERIC(5,1),
      population INTEGER,
      tract_count INTEGER,
      year INTEGER NOT NULL,
      source TEXT DEFAULT 'Census ACS 5-year',
      fetched_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(neighborhood, year)
    )
  `;

  // Upsert all rows
  const year = 2022; // ACS 5-year (2018-2022)
  for (const row of aggregated) {
    await sql`
      INSERT INTO economy.neighborhood_income (neighborhood, median_income, poverty_rate, population, tract_count, year)
      VALUES (${row.neighborhood}, ${row.medianIncome}, ${row.povertyRate}, ${row.population}, ${row.tractCount}, ${year})
      ON CONFLICT (neighborhood, year) DO UPDATE SET
        median_income = EXCLUDED.median_income,
        poverty_rate = EXCLUDED.poverty_rate,
        population = EXCLUDED.population,
        tract_count = EXCLUDED.tract_count,
        fetched_at = now()
    `;
  }

  console.log(`  Inserted/updated ${aggregated.length} rows for year ${year}`);

  // Verify
  const check = await sql`
    SELECT COUNT(*)::int as cnt, MIN(median_income) as min_inc, MAX(median_income) as max_inc
    FROM economy.neighborhood_income WHERE year = ${year}
  `;
  console.log(
    `  Verified: ${check[0].cnt} rows, income range $${check[0].min_inc}-$${check[0].max_inc}`
  );

  await sql.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
