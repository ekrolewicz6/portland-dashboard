/**
 * sync-permits.ts
 *
 * Incremental permit sync from Portland BDS ArcGIS FeatureServer.
 * Safe to run repeatedly — uses UPSERT keyed on arcgis_object_id.
 *
 * How it works:
 *   1. Queries DB for MAX(arcgis_object_id) to find where we left off
 *   2. Fetches only new records from ArcGIS (OBJECTID > max)
 *   3. Also re-fetches recently-modified records that may have changed status
 *      (permits filed in the last 180 days, where status may have progressed)
 *   4. Upserts all records — new ones are inserted, existing ones updated
 *   5. Refreshes materialized views if any rows changed
 *
 * Key differences from the old seed-real-data.ts:
 *   - NEVER truncates — purely additive/update
 *   - Fetches ALL permits (not just ISSUED ones) — captures Application,
 *     Under Review, Approved statuses that the old script missed
 *   - Uses INTAKECOMPLETEDATE (application date) as the primary date filter,
 *     not ISSUED, so pending permits are included
 *   - Batched inserts (500 per transaction) instead of one-at-a-time
 *   - Retry logic on network failures
 *   - Uses DATABASE_URL from env with prepare:false for Supabase pooler
 *   - Logs errors instead of swallowing them
 *
 * Usage:
 *   npx tsx ingest/sync-permits.ts              # incremental (default)
 *   npx tsx ingest/sync-permits.ts --full        # full re-sync of 2023+
 *   npx tsx ingest/sync-permits.ts --since 2025  # sync from a specific year
 */

import postgres from "postgres";

// ── Config ──────────────────────────────────────────────────────────────

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error("Run with: set -a && source .env.local && set +a && npx tsx ingest/sync-permits.ts");
  process.exit(1);
}

const sql = postgres(DB_URL, {
  prepare: false, // Required for Supabase transaction pooler
  max: 1, // Avoid deadlocks under max:1 pooler
  onnotice: () => {},
});

const ARCGIS_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22/query";

const BATCH_SIZE = 4000; // ArcGIS max per page
const INSERT_BATCH = 500; // DB batch size
const MAX_PAGES = 200; // Safety limit
const MAX_REASONABLE_EPOCH = new Date("2028-12-31").getTime();
const STATUS_REFRESH_DAYS = 180; // Re-fetch permits from last N days to catch status changes

// ── Parse CLI args ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const fullSync = args.includes("--full");
const sinceIdx = args.indexOf("--since");
const sinceYear = sinceIdx >= 0 ? parseInt(args[sinceIdx + 1], 10) : null;

// ── Helpers ─────────────────────────────────────────────────────────────

function epochToDateStr(epoch: number | null | undefined): string | null {
  if (epoch == null) return null;
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() < 1990 || epoch > MAX_REASONABLE_EPOCH) return null;
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const da = new Date(a);
  const db = new Date(b);
  const diff = Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null; // Reject negative processing times
}

function mapStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("final")) return "finaled";
  if (s.includes("expired")) return "expired";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("withdrawn")) return "withdrawn";
  if (s.includes("review")) return "in_review";
  if (s.includes("approved")) return "approved";
  if (s.includes("issued")) return "issued";
  if (s.includes("inspection")) return "issued"; // Under Inspection = post-issuance
  if (s.includes("application")) return "in_review"; // Application = pre-review
  return raw.trim() || "unknown";
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
    returnGeometry: "false",
    resultRecordCount: String(BATCH_SIZE),
    resultOffset: String(offset),
    orderByFields: "OBJECTID ASC",
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${ARCGIS_URL}?${params}`);
      if (!res.ok) {
        if (attempt < retries) {
          const wait = attempt * 5000;
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
        const wait = attempt * 5000;
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
    const offset = page * BATCH_SIZE;
    process.stdout.write(
      `    Page ${page + 1} (offset=${offset}, total=${allFeatures.length})...\r`
    );
    const { features, exceededTransferLimit } = await fetchPage(where, offset);
    allFeatures.push(...features);

    if (features.length < BATCH_SIZE && !exceededTransferLimit) {
      break;
    }
  }

  console.log(`    Fetched ${allFeatures.length} records.                    `);
  return allFeatures;
}

interface PermitRow {
  permit_number: string;
  permit_type: string;
  permit_type_mapped: string | null;
  project_address: string | null;
  neighborhood: string | null;
  valuation: number | null;
  application_date: string | null;
  issued_date: string | null;
  final_date: string | null;
  status: string;
  processing_days: number | null;
  arcgis_object_id: number;
}

function featureToRow(f: any): PermitRow | null {
  const a = f.attributes;
  if (!a.OBJECTID) return null;

  const appDate = epochToDateStr(a.INTAKECOMPLETEDATE);
  let issuedDate = epochToDateStr(a.ISSUED);
  const finalDate = epochToDateStr(a.FINALED);

  // Must have at least one meaningful date
  if (!appDate && !issuedDate) return null;

  // Reject issued_date that predates application_date (ArcGIS garbage)
  // e.g., permit showing issued in 2004 but applied in 2024
  if (appDate && issuedDate && issuedDate < appDate) {
    issuedDate = null;
  }

  // Cap issued_date to today — future dates are pre-approvals or garbage
  const todayStr = new Date().toISOString().slice(0, 10);
  if (issuedDate && issuedDate > todayStr) {
    issuedDate = null;
  }

  const address = [a.HOUSE?.trim(), a.DIRECTION, a.PROPSTREET, a.STREETTYPE]
    .filter(Boolean)
    .join(" ");

  const processingDays = daysBetween(appDate, issuedDate);

  return {
    permit_number: a.APPLICATION ?? `OBJ-${a.OBJECTID}`,
    permit_type: a.PERMIT ?? "unknown",
    permit_type_mapped: a.TYPE ?? null,
    project_address: address || null,
    neighborhood: a.NEIGHBORHOOD ?? null,
    valuation: a.FINALVALUATION ?? a.SUBMITTEDVALUATION ?? null,
    application_date: appDate,
    issued_date: issuedDate,
    final_date: finalDate,
    status: mapStatus(a.STATUS ?? ""),
    processing_days: processingDays,
    arcgis_object_id: a.OBJECTID,
  };
}

async function upsertBatch(rows: PermitRow[]): Promise<{ inserted: number; updated: number }> {
  if (rows.length === 0) return { inserted: 0, updated: 0 };

  // Use a single query with unnest for the batch
  const result = await sql`
    INSERT INTO housing.permits (
      permit_number, permit_type, permit_type_mapped, project_address,
      neighborhood, valuation, application_date, issued_date, final_date,
      status, processing_days, arcgis_object_id, updated_at
    )
    SELECT * FROM unnest(
      ${sql.array(rows.map((r) => r.permit_number))}::text[],
      ${sql.array(rows.map((r) => r.permit_type))}::text[],
      ${sql.array(rows.map((r) => r.permit_type_mapped))}::text[],
      ${sql.array(rows.map((r) => r.project_address))}::text[],
      ${sql.array(rows.map((r) => r.neighborhood))}::text[],
      ${sql.array(rows.map((r) => r.valuation))}::numeric[],
      ${sql.array(rows.map((r) => r.application_date))}::date[],
      ${sql.array(rows.map((r) => r.issued_date))}::date[],
      ${sql.array(rows.map((r) => r.final_date))}::date[],
      ${sql.array(rows.map((r) => r.status))}::text[],
      ${sql.array(rows.map((r) => r.processing_days))}::int[],
      ${sql.array(rows.map((r) => r.arcgis_object_id))}::bigint[],
      ${sql.array(rows.map(() => new Date().toISOString()))}::timestamptz[]
    )
    ON CONFLICT (arcgis_object_id) WHERE arcgis_object_id IS NOT NULL
    DO UPDATE SET
      permit_number    = EXCLUDED.permit_number,
      permit_type      = EXCLUDED.permit_type,
      permit_type_mapped = EXCLUDED.permit_type_mapped,
      project_address  = EXCLUDED.project_address,
      neighborhood     = EXCLUDED.neighborhood,
      valuation        = EXCLUDED.valuation,
      application_date = EXCLUDED.application_date,
      issued_date      = EXCLUDED.issued_date,
      final_date       = EXCLUDED.final_date,
      status           = EXCLUDED.status,
      processing_days  = EXCLUDED.processing_days,
      updated_at       = now()
    WHERE
      housing.permits.status           IS DISTINCT FROM EXCLUDED.status
      OR housing.permits.issued_date   IS DISTINCT FROM EXCLUDED.issued_date
      OR housing.permits.final_date    IS DISTINCT FROM EXCLUDED.final_date
      OR housing.permits.valuation     IS DISTINCT FROM EXCLUDED.valuation
      OR housing.permits.processing_days IS DISTINCT FROM EXCLUDED.processing_days
  `;

  // result.count is the number of rows affected (inserted + updated)
  return { inserted: result.count, updated: 0 }; // Can't distinguish, count is total affected
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Permits — Incremental Sync");
  console.log("====================================");
  console.log(`Mode: ${fullSync ? "FULL (2013+)" : sinceYear ? `since ${sinceYear}` : "INCREMENTAL"}`);

  // 1. Get current state
  const [state] = await sql`
    SELECT
      MAX(arcgis_object_id) AS max_oid,
      MAX(application_date) AS max_app_date,
      COUNT(*)::int AS total
    FROM housing.permits
  `;

  console.log(`\nCurrent DB state:`);
  console.log(`  Total permits:     ${state.total}`);
  console.log(`  Max OBJECTID:      ${state.max_oid}`);
  console.log(`  Max app date:      ${state.max_app_date}`);

  // 2. Build fetch strategy
  const allFeatures: any[] = [];

  if (fullSync) {
    // Full re-sync: fetch everything from 2013+
    const features = await fetchAll(
      `INTAKECOMPLETEDATE >= timestamp '2013-01-01' OR ISSUED >= timestamp '2013-01-01'`,
      "Full sync (2013+)"
    );
    allFeatures.push(...features);
  } else if (sinceYear) {
    // Fetch from a specific year
    const features = await fetchAll(
      `INTAKECOMPLETEDATE >= timestamp '${sinceYear}-01-01' OR ISSUED >= timestamp '${sinceYear}-01-01'`,
      `Since ${sinceYear}`
    );
    allFeatures.push(...features);
  } else {
    // Incremental: two queries
    // A) New records (OBJECTID > our max)
    if (state.max_oid) {
      const newFeatures = await fetchAll(
        `OBJECTID > ${state.max_oid}`,
        `New records (OBJECTID > ${state.max_oid})`
      );
      allFeatures.push(...newFeatures);
    } else {
      // Empty DB — fetch everything from 2023+
      const features = await fetchAll(
        `INTAKECOMPLETEDATE >= timestamp '2023-01-01' OR ISSUED >= timestamp '2023-01-01'`,
        "Initial load (2023+)"
      );
      allFeatures.push(...features);
    }

    // B) Recently-modified records that may have changed status
    //    Re-fetch permits with application dates in the last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STATUS_REFRESH_DAYS);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const updatedFeatures = await fetchAll(
      `INTAKECOMPLETEDATE >= timestamp '${cutoffStr}'`,
      `Status refresh (last ${STATUS_REFRESH_DAYS} days, since ${cutoffStr})`
    );
    allFeatures.push(...updatedFeatures);
  }

  // 3. Deduplicate by OBJECTID (in case both queries returned the same record)
  const byOid = new Map<number, any>();
  for (const f of allFeatures) {
    const oid = f.attributes?.OBJECTID;
    if (oid != null) byOid.set(oid, f);
  }
  console.log(`\n  Total unique features to process: ${byOid.size}`);

  // 4. Transform to rows
  const rows: PermitRow[] = [];
  let skipped = 0;
  for (const f of Array.from(byOid.values())) {
    const row = featureToRow(f);
    if (row) {
      rows.push(row);
    } else {
      skipped++;
    }
  }
  console.log(`  Valid rows: ${rows.length}, Skipped (no dates): ${skipped}`);

  // 5. Upsert in batches
  console.log(`\n  Upserting ${rows.length} permits in batches of ${INSERT_BATCH}...`);
  let totalAffected = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    try {
      const { inserted } = await upsertBatch(batch);
      totalAffected += inserted;
      if ((i + INSERT_BATCH) % 5000 === 0 || i + INSERT_BATCH >= rows.length) {
        console.log(`    ${Math.min(i + INSERT_BATCH, rows.length)}/${rows.length} processed, ${totalAffected} affected`);
      }
    } catch (err: any) {
      errors++;
      console.error(`    ERROR at batch ${i}-${i + INSERT_BATCH}: ${err.message}`);
      // Log the first failing row for debugging
      if (batch.length > 0) {
        console.error(`    First row in batch: permit=${batch[0].permit_number} oid=${batch[0].arcgis_object_id}`);
      }
      // Try individual inserts as fallback
      for (const row of batch) {
        try {
          await upsertBatch([row]);
          totalAffected++;
        } catch (innerErr: any) {
          console.error(`      Skip ${row.permit_number}: ${innerErr.message}`);
        }
      }
    }
  }

  // 6. Verify final state
  const [after] = await sql`
    SELECT
      MAX(arcgis_object_id) AS max_oid,
      MAX(application_date) AS max_app_date,
      COUNT(*)::int AS total
    FROM housing.permits
  `;

  console.log(`\n====================================`);
  console.log(`Results:`);
  console.log(`  Before:  ${state.total} permits (max OID: ${state.max_oid})`);
  console.log(`  After:   ${after.total} permits (max OID: ${after.max_oid})`);
  console.log(`  Net new: ${Number(after.total) - Number(state.total)}`);
  console.log(`  Rows affected: ${totalAffected}`);
  console.log(`  Batch errors: ${errors}`);
  console.log(`  Latest app date: ${after.max_app_date}`);

  // 7. Refresh materialized views if we changed anything
  if (totalAffected > 0) {
    console.log(`\n  Refreshing materialized views...`);
    const matviews = [
      "housing.mv_permit_phase_summary",
      "housing.mv_permit_journey_by_type",
      "housing.mv_permit_journey_trend",
      "housing.mv_permit_bottleneck_analysis",
      "housing.mv_permit_bottleneck_trend",
      "housing.mv_permit_slowest_examples",
      "housing.mv_permit_correction_stats",
    ];
    for (const mv of matviews) {
      try {
        await sql.unsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${mv}`);
        console.log(`    ✓ ${mv}`);
      } catch (err: any) {
        // Some matviews may not exist or may need non-concurrent refresh
        try {
          await sql.unsafe(`REFRESH MATERIALIZED VIEW ${mv}`);
          console.log(`    ✓ ${mv} (non-concurrent)`);
        } catch {
          console.log(`    ✗ ${mv}: ${err.message}`);
        }
      }
    }

    // Clear dashboard cache so API serves fresh data
    await sql`
      DELETE FROM public.dashboard_cache
      WHERE question IN ('housing', 'housing_detail', 'housing_journey', 'housing_bottleneck')
    `;
    console.log(`    ✓ Cleared housing dashboard caches`);
  }

  await sql.end();
  console.log(`\nDone.`);
}

main().catch(async (err) => {
  console.error("\nFATAL:", err.message);
  console.error(err.stack);
  await sql.end();
  process.exit(1);
});
