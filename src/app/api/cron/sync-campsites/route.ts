import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

/** Upper bound on any single upstream request. */
const FETCH_TIMEOUT_MS = 30_000;

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ARCGIS_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Miscellaneous/MapServer/1396/query";
const PAGE_SIZE = 200;
const INSERT_BATCH = 500;
const MAX_PAGES = 2000;

// ── Helpers ─────────────────────────────────────────────────────────────

function webMercatorToLatLon(
  x: number,
  y: number,
): { lat: number; lon: number } {
  const lon = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return {
    lat: Math.round(lat * 10000000) / 10000000,
    lon: Math.round(lon * 10000000) / 10000000,
  };
}

function epochToTimestamp(epoch: number | null | undefined): string | null {
  if (epoch == null) return null;
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() < 2020 || d.getFullYear() > 2030) return null;
  return d.toISOString();
}

function parseItemDate(s: string | null | undefined): string | null {
  if (!s || s.length < 14) return null;
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() < 2020 || d.getFullYear() > 2030) return null;
  return d.toISOString();
}

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

async function fetchPage(
  where: string,
  offset: number,
  retries = 3,
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
      // Bounded so a hung upstream cannot eat the entire maxDuration budget.
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
      if (data.error) throw new Error(`ArcGIS: ${data.error.message}`);
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

function featureToRow(f: any): CampsiteRow | null {
  const a = f.attributes;
  if (!a.OBJECTID) return null;
  const incidentDate = epochToTimestamp(a.inc_date_create);
  if (!incidentDate) return null;

  let lat: number | null = null;
  let lon: number | null = null;
  if (f.geometry?.x != null && f.geometry?.y != null) {
    const coords = webMercatorToLatLon(f.geometry.x, f.geometry.y);
    lat = coords.lat;
    lon = coords.lon;
  }

  return {
    arcgis_object_id: a.OBJECTID,
    incident_date: incidentDate,
    incident_id: a.inc_id ?? null,
    is_duplicate: a.duplicate === 1,
    item_date: parseItemDate(a.item_date_create),
    is_vehicle: a.IS_VEHICLE === "Yes",
    report_id: a.report_id ?? null,
    lat,
    lon,
  };
}

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
      is_vehicle    = EXCLUDED.is_vehicle
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
    // Get current state
    const [state] = await sql`
      SELECT
        COALESCE(MAX(arcgis_object_id), 0)::bigint AS max_oid,
        COUNT(*)::int AS total
      FROM homelessness.irp_campsite_reports
    `;

    // Fetch only new records (incremental)
    const allFeatures: any[] = [];
    const where =
      Number(state.max_oid) > 0
        ? `OBJECTID > ${state.max_oid}`
        : "1=1";

    for (let page = 0; page < MAX_PAGES; page++) {
      const offset = page * PAGE_SIZE;
      const { features, exceededTransferLimit } = await fetchPage(
        where,
        offset,
      );
      allFeatures.push(...features);
      if (features.length < PAGE_SIZE && !exceededTransferLimit) break;
    }

    // Transform and upsert
    const rows = allFeatures
      .map(featureToRow)
      .filter(Boolean) as CampsiteRow[];

    let totalAffected = 0;
    let batchErrors = 0;
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const batch = rows.slice(i, i + INSERT_BATCH);
      try {
        totalAffected += await upsertBatch(batch);
      } catch (err) {
        batchErrors++;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[sync-campsites] batch error at ${i}: ${message}`);
      }
    }

    const [after] = await sql`
      SELECT
        MAX(arcgis_object_id)::bigint AS max_oid,
        MAX(incident_date)::text AS max_date,
        COUNT(*)::int AS total
      FROM homelessness.irp_campsite_reports
    `;

    if (totalAffected > 0) {
      await sql`
        DELETE FROM public.dashboard_cache
        WHERE question IN ('homelessness', 'homelessness_detail', 'accountability_promises')
      `;
    }

    // Rows fetched but none written is a failed run, not a quiet one.
    const failed = rows.length > 0 && totalAffected === 0;

    const result = {
      ok: !failed,
      ms: Date.now() - t0,
      fetched: allFeatures.length,
      upserted: rows.length,
      affected: totalAffected,
      batchErrors,
      before: state.total,
      after: after.total,
      netNew: Number(after.total) - Number(state.total),
      latestDate: after.max_date,
    };

    console.log(
      `[sync-campsites] Done: +${result.netNew} new, ${totalAffected} affected, ${Date.now() - t0}ms`,
    );
    return NextResponse.json(result, { status: failed ? 500 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync-campsites] FATAL: ${message}`);
    return NextResponse.json(
      { ok: false, error: message, ms: Date.now() - t0 },
      { status: 500 },
    );
  }
}
