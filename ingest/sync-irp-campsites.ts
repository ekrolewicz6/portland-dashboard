/**
 * sync-irp-campsites.ts
 *
 * Fetches IRP (Impact Reduction Program) campsite report data from
 * Portland's ArcGIS API and loads it into the database.
 *
 * This data tracks tent encampment reports across Portland — useful for
 * verifying claims about encampment trends (e.g., "75% reduction downtown").
 *
 * ArcGIS endpoint:
 *   MapServer/1396 — COP_OpenData_Miscellaneous
 *   Fields: OBJECTID, inc_date_create (epoch ms), inc_id, duplicate (0/1),
 *           item_date_create (string YYYYMMDDHHMMSS), IS_VEHICLE (Yes/No),
 *           report_id, geometry (Web Mercator points)
 *
 * How it works:
 *   1. Queries DB for MAX(arcgis_object_id) to find where we left off
 *   2. Paginates through ArcGIS (200 records per page)
 *   3. Converts Web Mercator (EPSG:3857) geometry to WGS84 lat/lon
 *   4. Upserts via ON CONFLICT (arcgis_object_id) DO UPDATE
 *   5. Logs progress and results
 *
 * Usage:
 *   npx tsx ingest/sync-irp-campsites.ts           # incremental (default)
 *   npx tsx ingest/sync-irp-campsites.ts --full     # full re-sync
 */

import postgres from "postgres";

// ── Config ──────────────────────────────────────────────────────────────

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error(
    "Run with: set -a && source .env.local && set +a && npx tsx ingest/sync-irp-campsites.ts"
  );
  process.exit(1);
}

const sql = postgres(DB_URL, {
  prepare: false, // Required for Supabase transaction pooler
  max: 1, // Avoid deadlocks under max:1 pooler
  onnotice: () => {},
});

const ARCGIS_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Miscellaneous/MapServer/1396/query";

const PAGE_SIZE = 200; // This endpoint caps at 200 per request
const INSERT_BATCH = 500; // DB batch size
const MAX_PAGES = 2000; // Safety limit (200 * 2000 = 400k records max)

// ── Parse CLI args ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const fullSync = args.includes("--full");

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Convert Web Mercator (EPSG:3857) to WGS84 (EPSG:4326) lat/lon.
 */
function webMercatorToLatLon(x: number, y: number): { lat: number; lon: number } {
  const lon = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return { lat: Math.round(lat * 10000000) / 10000000, lon: Math.round(lon * 10000000) / 10000000 };
}

/**
 * Parse the item_date_create string format "YYYYMMDDHHMMSS" to ISO timestamp.
 */
function parseItemDate(s: string | null | undefined): string | null {
  if (!s || s.length < 14) return null;
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() < 2020 || d.getFullYear() > 2030) return null;
  return d.toISOString();
}

/**
 * Convert epoch milliseconds to ISO timestamp with sanity checks.
 */
function epochToTimestamp(epoch: number | null | undefined): string | null {
  if (epoch == null) return null;
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() < 2020 || d.getFullYear() > 2030) return null;
  return d.toISOString();
}

/**
 * ArcGIS answers `f=json` queries with HTTP 200 even when the query failed,
 * so the error envelope is part of the same shape.
 */
interface ArcGISQueryResponse {
  features?: { attributes: Record<string, unknown>; geometry?: unknown }[];
  exceededTransferLimit?: boolean;
  error?: { code?: number; message?: string };
}

async function fetchPage(
  where: string,
  offset: number,
  retries = 3
): Promise<{ features: any[]; exceededTransferLimit: boolean }> {
  const params = new URLSearchParams({
    where,
    outFields: "*",
    f: "json",
    returnGeometry: "true",
    resultRecordCount: String(PAGE_SIZE),
    resultOffset: String(offset),
    orderByFields: "OBJECTID ASC",
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${ARCGIS_URL}?${params}`);
      if (!res.ok) {
        if (attempt < retries) {
          const wait = attempt * 3000;
          console.log(`    HTTP ${res.status}, retry ${attempt}/${retries} in ${wait / 1000}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw new Error(`HTTP ${res.status} after ${retries} attempts`);
      }
      const data = (await res.json()) as ArcGISQueryResponse;
      if (data.error) {
        throw new Error(`ArcGIS error: ${data.error.message}`);
      }
      return {
        features: data.features ?? [],
        exceededTransferLimit: data.exceededTransferLimit === true,
      };
    } catch (err: any) {
      if (attempt < retries && !err.message?.includes("after")) {
        const wait = attempt * 3000;
        console.log(`    Fetch error: ${err.message}, retry ${attempt}/${retries} in ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

async function fetchAll(where: string, label: string): Promise<any[]> {
  console.log(`\n  Fetching: ${label}`);
  console.log(`  WHERE: ${where}`);

  const allFeatures: any[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    process.stdout.write(
      `    Page ${page + 1} (offset=${offset}, total=${allFeatures.length})...\r`
    );
    const { features, exceededTransferLimit } = await fetchPage(where, offset);
    allFeatures.push(...features);

    if (features.length < PAGE_SIZE && !exceededTransferLimit) {
      break;
    }

    // Small delay to be polite to the API
    if (page % 50 === 49) {
      console.log(`    Page ${page + 1} (total=${allFeatures.length})... pausing 2s`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`    Fetched ${allFeatures.length} records.                    `);
  return allFeatures;
}

// ── Row transform ───────────────────────────────────────────────────────

interface CampsiteRow {
  arcgis_object_id: number;
  incident_date: string | null;
  incident_id: string | null;
  is_duplicate: boolean;
  item_date: string | null;
  is_vehicle: boolean;
  report_id: string | null;
  lat: number | null;
  lon: number | null;
}

function featureToRow(f: any): CampsiteRow | null {
  const a = f.attributes;
  if (!a.OBJECTID) return null;

  const incidentDate = epochToTimestamp(a.inc_date_create);
  const itemDate = parseItemDate(a.item_date_create);

  // Must have at least incident_date to be useful
  if (!incidentDate) return null;

  let lat: number | null = null;
  let lon: number | null = null;
  if (f.geometry && f.geometry.x != null && f.geometry.y != null) {
    const coords = webMercatorToLatLon(f.geometry.x, f.geometry.y);
    lat = coords.lat;
    lon = coords.lon;
  }

  return {
    arcgis_object_id: a.OBJECTID,
    incident_date: incidentDate,
    incident_id: a.inc_id ?? null,
    is_duplicate: a.duplicate === 1,
    item_date: itemDate,
    is_vehicle: a.IS_VEHICLE === "Yes",
    report_id: a.report_id ?? null,
    lat,
    lon,
  };
}

// ── Upsert ──────────────────────────────────────────────────────────────

async function upsertBatch(rows: CampsiteRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const result = await sql`
    INSERT INTO homelessness.irp_campsite_reports (
      arcgis_object_id, incident_date, incident_id, is_duplicate,
      item_date, is_vehicle, report_id, lat, lon
    )
    SELECT * FROM unnest(
      ${sql.array(rows.map((r) => r.arcgis_object_id))}::bigint[],
      ${sql.array(rows.map((r) => r.incident_date))}::timestamptz[],
      ${sql.array(rows.map((r) => r.incident_id))}::text[],
      ${sql.array(rows.map((r) => r.is_duplicate))}::boolean[],
      ${sql.array(rows.map((r) => r.item_date))}::timestamptz[],
      ${sql.array(rows.map((r) => r.is_vehicle))}::boolean[],
      ${sql.array(rows.map((r) => r.report_id))}::text[],
      ${sql.array(rows.map((r) => r.lat))}::numeric[],
      ${sql.array(rows.map((r) => r.lon))}::numeric[]
    )
    ON CONFLICT (arcgis_object_id) DO UPDATE SET
      incident_date = EXCLUDED.incident_date,
      incident_id   = EXCLUDED.incident_id,
      is_duplicate  = EXCLUDED.is_duplicate,
      item_date     = EXCLUDED.item_date,
      is_vehicle    = EXCLUDED.is_vehicle,
      report_id     = EXCLUDED.report_id,
      lat           = EXCLUDED.lat,
      lon           = EXCLUDED.lon
  `;

  return result.count;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland IRP Campsite Reports — Sync");
  console.log("=====================================");
  console.log(`Mode: ${fullSync ? "FULL" : "INCREMENTAL"}`);

  // 1. Get current state
  const [state] = await sql`
    SELECT
      COALESCE(MAX(arcgis_object_id), 0) AS max_oid,
      MIN(incident_date) AS min_date,
      MAX(incident_date) AS max_date,
      COUNT(*)::int AS total
    FROM homelessness.irp_campsite_reports
  `;

  console.log(`\nCurrent DB state:`);
  console.log(`  Total reports:  ${state.total}`);
  console.log(`  Max OBJECTID:   ${state.max_oid}`);
  console.log(`  Date range:     ${state.min_date ?? "N/A"} to ${state.max_date ?? "N/A"}`);

  // 2. Fetch from ArcGIS
  let allFeatures: any[];

  if (fullSync || Number(state.max_oid) === 0) {
    // Full sync: get everything
    allFeatures = await fetchAll("1=1", "Full sync (all records)");
  } else {
    // Incremental: only new records
    allFeatures = await fetchAll(
      `OBJECTID > ${state.max_oid}`,
      `New records (OBJECTID > ${state.max_oid})`
    );
  }

  // 3. Deduplicate by OBJECTID
  const byOid = new Map<number, any>();
  for (const f of allFeatures) {
    const oid = f.attributes?.OBJECTID;
    if (oid != null) byOid.set(oid, f);
  }
  console.log(`\n  Total unique features: ${byOid.size}`);

  // 4. Transform to rows
  const rows: CampsiteRow[] = [];
  let skipped = 0;
  for (const f of Array.from(byOid.values())) {
    const row = featureToRow(f);
    if (row) {
      rows.push(row);
    } else {
      skipped++;
    }
  }
  console.log(`  Valid rows: ${rows.length}, Skipped: ${skipped}`);

  // 5. Upsert in batches
  console.log(`\n  Upserting ${rows.length} reports in batches of ${INSERT_BATCH}...`);
  let totalAffected = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    try {
      const affected = await upsertBatch(batch);
      totalAffected += affected;
      if ((i + INSERT_BATCH) % 5000 === 0 || i + INSERT_BATCH >= rows.length) {
        console.log(
          `    ${Math.min(i + INSERT_BATCH, rows.length)}/${rows.length} processed, ${totalAffected} affected`
        );
      }
    } catch (err: any) {
      errors++;
      console.error(`    ERROR at batch ${i}-${i + INSERT_BATCH}: ${err.message}`);
      // Fallback: try individual inserts
      for (const row of batch) {
        try {
          await upsertBatch([row]);
          totalAffected++;
        } catch (innerErr: any) {
          console.error(`      Skip OID ${row.arcgis_object_id}: ${innerErr.message}`);
        }
      }
    }
  }

  // 6. Verify final state
  const [after] = await sql`
    SELECT
      COALESCE(MAX(arcgis_object_id), 0) AS max_oid,
      MIN(incident_date) AS min_date,
      MAX(incident_date) AS max_date,
      COUNT(*)::int AS total
    FROM homelessness.irp_campsite_reports
  `;

  console.log(`\n=====================================`);
  console.log(`Results:`);
  console.log(`  Before:     ${state.total} reports`);
  console.log(`  After:      ${after.total} reports`);
  console.log(`  Net new:    ${Number(after.total) - Number(state.total)}`);
  console.log(`  Affected:   ${totalAffected}`);
  console.log(`  Errors:     ${errors}`);
  console.log(`  Date range: ${after.min_date} to ${after.max_date}`);
  console.log(`  Max OID:    ${after.max_oid}`);

  await sql.end();
  console.log(`\nDone.`);
}

main().catch(async (err) => {
  console.error("\nFATAL:", err.message);
  console.error(err.stack);
  await sql.end();
  process.exit(1);
});
