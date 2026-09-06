import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

/** Upper bound on any single upstream request. */
const FETCH_TIMEOUT_MS = 30_000;

export const dynamic = "force-dynamic";
// ArcGIS pagination + batched upserts can take a while.
// Vercel Pro allows up to 300s.
export const maxDuration = 300;

const ARCGIS_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22/query";
const BATCH_SIZE = 4000;
const INSERT_BATCH = 500;
const MAX_PAGES = 200;
const MAX_REASONABLE_EPOCH = new Date("2028-12-31").getTime();
const STATUS_REFRESH_DAYS = 180;

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
  const diff = Math.round(
    (db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff >= 0 ? diff : null;
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
  if (s.includes("inspection")) return "issued";
  if (s.includes("application")) return "in_review";
  return raw.trim() || "unknown";
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

// ── ArcGIS fetcher with retries ─────────────────────────────────────────

async function fetchPage(
  where: string,
  offset: number,
  retries = 3,
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
      // A hung upstream socket would otherwise consume the whole 300s
      // maxDuration, and the function is killed before it can invalidate
      // caches or report anything.
      const res = await fetch(`${ARCGIS_URL}?${params}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, attempt * 3000));
          continue;
        }
        throw new Error(`HTTP ${res.status} after ${retries} attempts`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(`ArcGIS: ${data.error.message}`);
      }
      return {
        features: data.features ?? [],
        exceededTransferLimit: data.exceededTransferLimit === true,
      };
    } catch (err: any) {
      if (attempt < retries && !err.message?.includes("after")) {
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

async function fetchAll(where: string): Promise<any[]> {
  const allFeatures: any[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * BATCH_SIZE;
    const { features, exceededTransferLimit } = await fetchPage(where, offset);
    allFeatures.push(...features);
    if (features.length < BATCH_SIZE && !exceededTransferLimit) break;
  }
  return allFeatures;
}

function featureToRow(f: any): PermitRow | null {
  const a = f.attributes;
  if (!a.OBJECTID) return null;

  const appDate = epochToDateStr(a.INTAKECOMPLETEDATE);
  let issuedDate = epochToDateStr(a.ISSUED);
  const finalDate = epochToDateStr(a.FINALED);
  if (!appDate && !issuedDate) return null;

  // Reject issued_date that predates application_date (ArcGIS garbage)
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
    processing_days: daysBetween(appDate, issuedDate),
    arcgis_object_id: a.OBJECTID,
  };
}

async function upsertBatch(rows: PermitRow[]): Promise<number> {
  if (rows.length === 0) return 0;
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
  return result.count;
}

// ── Route handler ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();

  try {
    // 1. Get current DB state
    const [state] = await sql`
      SELECT
        MAX(arcgis_object_id) AS max_oid,
        COUNT(*)::int AS total
      FROM housing.permits
    `;

    const allFeatures: any[] = [];

    // 2a. Fetch new records by OBJECTID
    if (state.max_oid) {
      const newFeatures = await fetchAll(`OBJECTID > ${state.max_oid}`);
      allFeatures.push(...newFeatures);
      console.log(
        `[sync-permits] New records (OID > ${state.max_oid}): ${newFeatures.length}`,
      );
    } else {
      // Empty DB — initial load
      const features = await fetchAll(
        `INTAKECOMPLETEDATE >= timestamp '2023-01-01' OR ISSUED >= timestamp '2023-01-01'`,
      );
      allFeatures.push(...features);
      console.log(`[sync-permits] Initial load: ${features.length}`);
    }

    // 2b. Re-fetch recent permits to catch status changes
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STATUS_REFRESH_DAYS);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);

    const updatedFeatures = await fetchAll(
      `INTAKECOMPLETEDATE >= timestamp '${cutoffStr}'`,
    );
    allFeatures.push(...updatedFeatures);
    console.log(
      `[sync-permits] Status refresh (since ${cutoffStr}): ${updatedFeatures.length}`,
    );

    // 3. Deduplicate by OBJECTID
    const byOid = new Map<number, any>();
    for (const f of allFeatures) {
      const oid = f.attributes?.OBJECTID;
      if (oid != null) byOid.set(oid, f);
    }

    // 4. Transform
    const rows: PermitRow[] = [];
    for (const f of Array.from(byOid.values())) {
      const row = featureToRow(f);
      if (row) rows.push(row);
    }

    // 5. Upsert in batches
    let totalAffected = 0;
    let errors = 0;
    let rowsRejected = 0;
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH);
      try {
        totalAffected += await upsertBatch(batch);
      } catch (err: any) {
        errors++;
        console.error(
          `[sync-permits] Batch error at ${i}: ${err.message}`,
        );
        // Row-by-row fallback so one malformed record cannot drop a whole
        // batch. Rows that fail individually are counted, not silently
        // discarded — a rising count is the signal that upstream changed
        // shape.
        for (const row of batch) {
          try {
            totalAffected += await upsertBatch([row]);
          } catch {
            rowsRejected++;
          }
        }
      }
    }

    // 6. Get final state
    const [after] = await sql`
      SELECT
        MAX(arcgis_object_id) AS max_oid,
        MAX(application_date) AS max_app_date,
        COUNT(*)::int AS total
      FROM housing.permits
    `;

    // 7. Clear housing cache so next request gets fresh data
    if (totalAffected > 0) {
      await sql`
        DELETE FROM public.dashboard_cache
        WHERE question IN ('housing', 'housing_detail', 'housing_journey', 'housing_bottleneck')
      `;
    }

    // Fetching rows and writing none of them is a failure, however cleanly
    // each individual error was caught.
    const failed = rows.length > 0 && totalAffected === 0;

    const result = {
      ok: !failed,
      ms: Date.now() - t0,
      before: { total: state.total, maxOid: state.max_oid },
      after: {
        total: after.total,
        maxOid: after.max_oid,
        maxAppDate: after.max_app_date,
      },
      netNew: Number(after.total) - Number(state.total),
      rowsAffected: totalAffected,
      rowsProcessed: rows.length,
      batchErrors: errors,
      rowsRejected,
      timestamp: new Date().toISOString(),
    };

    console.log(`[sync-permits] Done: +${result.netNew} new, ${totalAffected} affected, ${Date.now() - t0}ms`);

    return NextResponse.json(result, { status: failed ? 500 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync-permits] FATAL: ${message}`);
    return NextResponse.json(
      { ok: false, error: message, ms: Date.now() - t0 },
      { status: 500 },
    );
  }
}
