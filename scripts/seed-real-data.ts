/**
 * seed-real-data.ts
 *
 * Fetches live data from Portland's ArcGIS endpoints,
 * saves JSON snapshots to data/, and inserts into PostgreSQL.
 *
 * Usage: npx tsx scripts/seed-real-data.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

// ── Config ──────────────────────────────────────────────────────────────

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

// Only keep permits from 2023-01-01 onward (epoch ms)
const PERMIT_CUTOFF_EPOCH = new Date("2023-01-01").getTime();
// Reject dates beyond 2027 as bogus
const MAX_REASONABLE_EPOCH = new Date("2027-12-31").getTime();

// Ensure data/ exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Helpers ─────────────────────────────────────────────────────────────

function epochToDate(epoch: number | null | undefined): Date | null {
  if (epoch == null) return null;
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return null;
  // Reject unreasonable dates (before 1990 or after 2027)
  if (d.getFullYear() < 1990 || epoch > MAX_REASONABLE_EPOCH) return null;
  return d;
}

function dateToPgDate(d: Date | null): string | null {
  if (!d || isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date | null, b: Date | null): number | null {
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/**
 * Generic paginated ArcGIS fetcher.
 * Uses resultOffset for pagination, max 4000 per page.
 */
async function fetchArcGISPaginated(
  baseUrl: string,
  whereClause: string,
  outFields: string = "*",
  maxPages: number = 50,
  maxRecords: number = Infinity
): Promise<any[]> {
  const allFeatures: any[] = [];
  let offset = 0;
  const batchSize = 4000;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      where: whereClause,
      outFields,
      f: "json",
      returnGeometry: "false",
      resultRecordCount: String(batchSize),
      resultOffset: String(offset),
    });

    const url = `${baseUrl}?${params}`;
    console.log(`    Page ${page + 1} (offset=${offset}) ...`);

    const data = await fetchJson(url);

    if (data.error) {
      console.error(`    ArcGIS error: ${data.error.message}`);
      break;
    }

    const features = data.features ?? [];
    allFeatures.push(...features);

    if (allFeatures.length >= maxRecords) {
      console.log(`    Reached max records limit (${maxRecords})`);
      break;
    }

    const exceeded = data.exceededTransferLimit === true;
    if (features.length < batchSize && !exceeded) {
      break;
    }
    offset += batchSize;
  }

  return allFeatures;
}

// ── 1. Fetch Building Permits ───────────────────────────────────────────

interface RawPermit {
  attributes: {
    APPLICATION?: string;
    PERMIT?: string;
    TYPE?: string;
    HOUSE?: string;
    DIRECTION?: string;
    PROPSTREET?: string;
    STREETTYPE?: string;
    WORK_DESCRIPTION?: string;
    SUBMITTEDVALUATION?: number;
    FINALVALUATION?: number;
    INTAKECOMPLETEDATE?: number;
    ISSUED?: number;
    FINALED?: number;
    STATUS?: string;
    NEIGHBORHOOD?: string;
    OBJECTID?: number;
    NUMNEWUNITS?: number;
    TOTALSQFT?: number;
  };
}

interface Permit {
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
  arcgis_object_id: number | null;
}

async function fetchPermits(): Promise<Permit[]> {
  console.log("\n=== Fetching Building Permits ===");
  console.log("  Using OBJECTID > 4900000 to get 2023+ permits efficiently");
  console.log("  (OBJECTID ~4900000 corresponds to ~March 2023)");

  const baseUrl =
    "https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22/query";

  // Use OBJECTID > 4900000 to efficiently get 2023+ permits.
  // Server-side filtering on ISSUED fails with 400 errors, so we filter
  // by OBJECTID (which correlates with date) and then filter in JS.
  // Cap at 40,000 raw records to keep fetching reasonable.
  const features = await fetchArcGISPaginated(
    baseUrl,
    "OBJECTID > 4900000",
    "*",
    50,
    40000
  );

  console.log(`  Raw features received: ${features.length}`);

  const allPermits: Permit[] = [];

  for (const f of features as RawPermit[]) {
    const a = f.attributes;

    // Filter in JS: only keep permits with ISSUED epoch >= 2023-01-01
    // and reject future dates beyond 2027
    const rawIssued = a.ISSUED;
    if (rawIssued == null) continue;
    if (rawIssued < PERMIT_CUTOFF_EPOCH) continue;
    if (rawIssued > MAX_REASONABLE_EPOCH) continue;

    const appDate = epochToDate(a.INTAKECOMPLETEDATE);
    const issuedDate = epochToDate(a.ISSUED);
    const finalDate = epochToDate(a.FINALED);
    const address = [a.HOUSE?.trim(), a.DIRECTION, a.PROPSTREET, a.STREETTYPE]
      .filter(Boolean)
      .join(" ");

    // Map ArcGIS status to our enum
    let status = "issued";
    const raw = (a.STATUS ?? "").toLowerCase();
    if (raw.includes("final")) status = "finaled";
    else if (raw.includes("expired")) status = "expired";
    else if (raw.includes("cancel")) status = "cancelled";
    else if (raw.includes("withdrawn")) status = "withdrawn";
    else if (raw.includes("review")) status = "in_review";
    else if (raw.includes("approved")) status = "approved";

    // Use FINALVALUATION if available, otherwise SUBMITTEDVALUATION
    const valuation = a.FINALVALUATION ?? a.SUBMITTEDVALUATION ?? null;

    allPermits.push({
      permit_number: a.APPLICATION ?? `OBJ-${a.OBJECTID}`,
      permit_type: a.PERMIT ?? "unknown",
      permit_type_mapped: a.TYPE ?? null,
      project_address: address || null,
      neighborhood: a.NEIGHBORHOOD ?? null,
      valuation,
      application_date: dateToPgDate(appDate),
      issued_date: dateToPgDate(issuedDate),
      final_date: dateToPgDate(finalDate),
      status,
      processing_days: daysBetween(appDate, issuedDate),
      arcgis_object_id: a.OBJECTID ?? null,
    });
  }

  console.log(`  Permits after JS date filter (2023+): ${allPermits.length}`);
  return allPermits;
}

// ── 2. Fetch Crime Grid Data ────────────────────────────────────────────

interface CrimeRecord {
  category: string;
  attributes: Record<string, any>;
}

async function fetchCrime(): Promise<CrimeRecord[]> {
  console.log("\n=== Fetching Crime Grid Data ===");

  const layers = [
    { id: 2, category: "property" },
    { id: 41, category: "person" },
    { id: 60, category: "society" },
  ];

  const allRecords: CrimeRecord[] = [];

  for (const layer of layers) {
    console.log(`  Layer ${layer.id} (${layer.category}):`);
    try {
      const features = await fetchArcGISPaginated(
        `https://www.portlandmaps.com/arcgis/rest/services/Public/Crime/MapServer/${layer.id}/query`,
        "1=1",
        "*"
      );
      for (const f of features) {
        allRecords.push({ category: layer.category, attributes: f.attributes });
      }
      console.log(`    Total for layer: ${features.length} records`);
    } catch (err: any) {
      console.error(`    Error fetching layer ${layer.id}: ${err.message}`);
    }
  }

  const counts: Record<string, number> = {};
  for (const r of allRecords) {
    counts[r.category] = (counts[r.category] ?? 0) + 1;
  }
  console.log("  Crime counts by category:", counts);
  console.log(`  Total crime records: ${allRecords.length}`);

  return allRecords;
}

// ── 3. Fetch Graffiti Reports ───────────────────────────────────────────

async function fetchGraffiti(): Promise<any[]> {
  console.log("\n=== Fetching Graffiti Reports ===");

  const features = await fetchArcGISPaginated(
    "https://www.portlandmaps.com/arcgis/rest/services/Public/BPS_Graffiti/FeatureServer/0/query",
    "1=1",
    "*"
  );

  const allReports = features.map((f: any) => f.attributes);
  console.log(`  Total graffiti reports: ${allReports.length}`);
  return allReports;
}

// ── 4. Fetch Business Licenses (CivicApps) ──────────────────────────────

interface BusinessLicense {
  business_name: string;
  address: string | null;
  naics_code: string | null;
  naics_description: string | null;
  date_added: string | null;
  latitude: number | null;
  longitude: number | null;
  api_id: string | null;
}

async function fetchBusinesses(): Promise<BusinessLicense[]> {
  console.log("\n=== Fetching Business Licenses (CivicApps) ===");

  const allBusinesses: BusinessLicense[] = [];

  // Try HTTPS first, then HTTP as fallback
  const urlBases = [
    "https://api.civicapps.org/business-licenses/",
    "http://api.civicapps.org/business-licenses/",
  ];

  for (const urlBase of urlBases) {
    console.log(`  Trying ${urlBase} ...`);
    try {
      const testRes = await fetch(`${urlBase}?page=1`);
      if (!testRes.ok) {
        console.log(`    Got HTTP ${testRes.status}, trying next...`);
        continue;
      }
      const testData = await testRes.json();
      const testResults = testData.results ?? testData.data ?? [];

      if (!Array.isArray(testResults) || testResults.length === 0) {
        console.log(`    No results from this endpoint, trying next...`);
        continue;
      }

      console.log(`    Endpoint works! Fetching pages...`);

      for (let page = 1; page <= 10; page++) {
        const url = `${urlBase}?page=${page}`;
        console.log(`    Page ${page} ...`);

        try {
          const data = await fetchJson(url);
          const results = data.results ?? data.data ?? [];

          if (!Array.isArray(results) || results.length === 0) {
            console.log(`      No results, stopping pagination`);
            break;
          }

          for (const r of results) {
            allBusinesses.push({
              business_name: r.business_name ?? r.name ?? "Unknown",
              address: r.address ?? r.street_address ?? null,
              naics_code: r.naics_code ?? r.naics ?? null,
              naics_description: r.naics_description ?? r.naics_title ?? null,
              date_added: r.date_added ?? r.start_date ?? null,
              latitude: r.latitude != null ? Number(r.latitude) : null,
              longitude: r.longitude != null ? Number(r.longitude) : null,
              api_id: r.id != null ? String(r.id) : null,
            });
          }

          console.log(`      ${results.length} records`);
        } catch (err: any) {
          console.error(`      Error: ${err.message}`);
          break;
        }
      }

      break; // Successfully used this endpoint
    } catch (err: any) {
      console.log(`    Failed: ${err.message}`);
      continue;
    }
  }

  if (allBusinesses.length === 0) {
    console.log(
      "  WARNING: CivicApps API is unavailable. Skipping business licenses."
    );
    console.log(
      "  The CivicApps API may be permanently offline."
    );
  }

  console.log(`  Total businesses: ${allBusinesses.length}`);
  return allBusinesses;
}

// ── 5. Fetch Neighborhood Boundaries ────────────────────────────────────

interface Neighborhood {
  name: string;
  coalition: string | null;
  map_label: string | null;
  neighborhood_id: number | null;
}

async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  console.log("\n=== Fetching Neighborhood Boundaries ===");

  const features = await fetchArcGISPaginated(
    "https://www.portlandmaps.com/arcgis/rest/services/Public/Boundaries/MapServer/1/query",
    "1=1",
    "*"
  );

  const neighborhoods: Neighborhood[] = [];
  for (const f of features) {
    const a = f.attributes;
    if (!a.NAME) continue;
    neighborhoods.push({
      name: a.NAME,
      coalition: a.COALIT ?? null,
      map_label: a.MAPLABEL ?? null,
      neighborhood_id: a.ID ?? a.OBJECTID ?? null,
    });
  }

  console.log(`  Total neighborhoods: ${neighborhoods.length}`);
  return neighborhoods;
}

// ── 6. Fetch PBOT Service Requests ──────────────────────────────────────

interface PBOTRequest {
  item_id: string;
  work_start_date: string | null;
  work_end_date: string | null;
  days_of_week: string | null;
  sidewalk_closure: string | null;
  street_closure: string | null;
  bike_lane_closure: string | null;
  lane_closure_count: string | null;
  object_id: number | null;
}

async function fetchPBOTRequests(): Promise<PBOTRequest[]> {
  console.log("\n=== Fetching PBOT Service Requests (Active FUN Permits) ===");

  const features = await fetchArcGISPaginated(
    "https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Service_Requests/MapServer/1/query",
    "1=1",
    "*"
  );

  const requests: PBOTRequest[] = [];
  for (const f of features) {
    const a = f.attributes;
    requests.push({
      item_id: a.ITEM_ID ?? `OBJ-${a.OBJECTID}`,
      work_start_date: dateToPgDate(epochToDate(a.WORK_START_DATE)),
      work_end_date: dateToPgDate(epochToDate(a.WORK_END_DATE)),
      days_of_week: a.DAYS_OF_THE_WEEK_WORKING ?? null,
      sidewalk_closure: a.SIDEWALK_CLOSURE ?? null,
      street_closure: a.STREET_CLOSURE ?? null,
      bike_lane_closure: a.BIKE_LANE_CLOSURE ?? null,
      lane_closure_count: a.LANE_CLOSURE_HOW_MANY_LANES_CL ?? null,
      object_id: a.OBJECTID ?? null,
    });
  }

  console.log(`  Total PBOT requests: ${requests.length}`);
  return requests;
}

// ── 7. Save to JSON ─────────────────────────────────────────────────────

function saveJson(filename: string, data: any) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(
    `  Saved ${filepath} (${Array.isArray(data) ? data.length : "object"} entries)`
  );
}

// ── 8. Insert into PostgreSQL ───────────────────────────────────────────

async function insertIntoDb(
  permits: Permit[],
  crime: CrimeRecord[],
  graffiti: any[],
  businesses: BusinessLicense[],
  neighborhoods: Neighborhood[],
  pbotRequests: PBOTRequest[]
) {
  console.log("\n=== Inserting into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {}, // Suppress NOTICE messages
  });

  try {
    // Create schemas
    for (const schema of [
      "housing",
      "safety",
      "business",
      "downtown",
      "migration",
      "tax",
      "program",
      "reference",
    ]) {
      await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    }

    // ── Permits table ───────────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS housing.permits (
        permit_id         BIGSERIAL PRIMARY KEY,
        permit_number     TEXT NOT NULL UNIQUE,
        permit_type       TEXT NOT NULL,
        permit_type_mapped TEXT,
        project_address   TEXT,
        neighborhood      TEXT,
        valuation         NUMERIC(14,2),
        application_date  DATE,
        issued_date       DATE,
        final_date        DATE,
        status            TEXT NOT NULL,
        processing_days   INTEGER,
        arcgis_object_id  BIGINT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Add neighborhood column if it doesn't exist yet
    await sql.unsafe(`
      ALTER TABLE housing.permits ADD COLUMN IF NOT EXISTS neighborhood TEXT
    `);

    // Truncate to avoid stale data on re-run
    await sql.unsafe(`TRUNCATE housing.permits RESTART IDENTITY`);

    console.log(`  Inserting ${permits.length} permits ...`);
    let permitCount = 0;
    const permitBatchSize = 500;
    for (let i = 0; i < permits.length; i += permitBatchSize) {
      const batch = permits.slice(i, i + permitBatchSize);
      for (const p of batch) {
        try {
          await sql`
            INSERT INTO housing.permits (
              permit_number, permit_type, permit_type_mapped, project_address,
              neighborhood, valuation, application_date, issued_date, final_date,
              status, processing_days, arcgis_object_id
            ) VALUES (
              ${p.permit_number}, ${p.permit_type}, ${p.permit_type_mapped},
              ${p.project_address}, ${p.neighborhood}, ${p.valuation},
              ${p.application_date ? p.application_date : null}::date,
              ${p.issued_date ? p.issued_date : null}::date,
              ${p.final_date ? p.final_date : null}::date,
              ${p.status}, ${p.processing_days}, ${p.arcgis_object_id}
            )
            ON CONFLICT (permit_number) DO NOTHING
          `;
          permitCount++;
        } catch {
          // Skip individual insert errors
        }
      }
      if (i % 2000 === 0 && i > 0) {
        console.log(`    ... ${i} permits processed`);
      }
    }
    console.log(`    Inserted ${permitCount} permits`);

    // ── Crime monthly aggregates table ──────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS safety.crime_monthly (
        id                SERIAL PRIMARY KEY,
        month             DATE NOT NULL,
        category          TEXT NOT NULL,
        count             INTEGER NOT NULL DEFAULT 0,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (month, category)
      )
    `);

    console.log("  Inserting crime monthly aggregates ...");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const crimeCounts: Record<string, number> = {};
    for (const r of crime) {
      crimeCounts[r.category] = (crimeCounts[r.category] ?? 0) + 1;
    }
    for (const [cat, count] of Object.entries(crimeCounts)) {
      await sql`
        INSERT INTO safety.crime_monthly (month, category, count)
        VALUES (${currentMonth}::date, ${cat}, ${count})
        ON CONFLICT (month, category) DO UPDATE SET count = ${count}
      `;
    }
    console.log(
      `    Inserted ${Object.keys(crimeCounts).length} crime category aggregates`
    );

    // ── Graffiti monthly table ──────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS safety.graffiti_monthly (
        id                SERIAL PRIMARY KEY,
        month             DATE NOT NULL UNIQUE,
        count             INTEGER NOT NULL DEFAULT 0,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    console.log("  Inserting graffiti monthly aggregate ...");
    await sql`
      INSERT INTO safety.graffiti_monthly (month, count)
      VALUES (${currentMonth}::date, ${graffiti.length})
      ON CONFLICT (month) DO UPDATE SET count = ${graffiti.length}
    `;
    console.log(`    Graffiti count: ${graffiti.length}`);

    // ── Business licenses table ─────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.civicapps_licenses (
        license_id        BIGSERIAL PRIMARY KEY,
        business_name     TEXT NOT NULL,
        address           TEXT,
        naics_code        TEXT,
        naics_description TEXT,
        date_added        DATE,
        latitude          NUMERIC(10,7),
        longitude         NUMERIC(10,7),
        api_id            TEXT UNIQUE,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    if (businesses.length > 0) {
      await sql.unsafe(
        `TRUNCATE business.civicapps_licenses RESTART IDENTITY`
      );
      console.log(`  Inserting ${businesses.length} business licenses ...`);
      let bizCount = 0;
      for (const b of businesses) {
        try {
          await sql`
            INSERT INTO business.civicapps_licenses (
              business_name, address, naics_code, naics_description,
              date_added, latitude, longitude, api_id
            ) VALUES (
              ${b.business_name}, ${b.address}, ${b.naics_code},
              ${b.naics_description},
              ${b.date_added ? b.date_added : null}::date,
              ${b.latitude}, ${b.longitude}, ${b.api_id}
            )
            ON CONFLICT (api_id) DO NOTHING
          `;
          bizCount++;
        } catch {
          // Skip individual insert errors
        }
      }
      console.log(`    Inserted ${bizCount} business licenses`);
    } else {
      console.log("  Skipping business licenses (CivicApps unavailable)");
    }

    // ── Neighborhoods table ─────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS reference.neighborhoods (
        id                SERIAL PRIMARY KEY,
        name              TEXT NOT NULL UNIQUE,
        coalition         TEXT,
        map_label         TEXT,
        neighborhood_id   INTEGER,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    if (neighborhoods.length > 0) {
      await sql.unsafe(`TRUNCATE reference.neighborhoods RESTART IDENTITY`);
      console.log(`  Inserting ${neighborhoods.length} neighborhoods ...`);
      let nhoodCount = 0;
      for (const n of neighborhoods) {
        try {
          await sql`
            INSERT INTO reference.neighborhoods (name, coalition, map_label, neighborhood_id)
            VALUES (${n.name}, ${n.coalition}, ${n.map_label}, ${n.neighborhood_id})
            ON CONFLICT (name) DO NOTHING
          `;
          nhoodCount++;
        } catch {
          // Skip
        }
      }
      console.log(`    Inserted ${nhoodCount} neighborhoods`);
    }

    // ── PBOT service requests table ─────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS downtown.pbot_requests (
        id                SERIAL PRIMARY KEY,
        item_id           TEXT NOT NULL UNIQUE,
        work_start_date   DATE,
        work_end_date     DATE,
        days_of_week      TEXT,
        sidewalk_closure  TEXT,
        street_closure    TEXT,
        bike_lane_closure TEXT,
        lane_closure_count TEXT,
        object_id         INTEGER,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    if (pbotRequests.length > 0) {
      await sql.unsafe(`TRUNCATE downtown.pbot_requests RESTART IDENTITY`);
      console.log(`  Inserting ${pbotRequests.length} PBOT requests ...`);
      let pbotCount = 0;
      for (const r of pbotRequests) {
        try {
          await sql`
            INSERT INTO downtown.pbot_requests (
              item_id, work_start_date, work_end_date, days_of_week,
              sidewalk_closure, street_closure, bike_lane_closure,
              lane_closure_count, object_id
            ) VALUES (
              ${r.item_id},
              ${r.work_start_date ? r.work_start_date : null}::date,
              ${r.work_end_date ? r.work_end_date : null}::date,
              ${r.days_of_week}, ${r.sidewalk_closure}, ${r.street_closure},
              ${r.bike_lane_closure}, ${r.lane_closure_count}, ${r.object_id}
            )
            ON CONFLICT (item_id) DO NOTHING
          `;
          pbotCount++;
        } catch {
          // Skip
        }
      }
      console.log(`    Inserted ${pbotCount} PBOT requests`);
    }

    // ── Dashboard cache ─────────────────────────────────────────────────

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.dashboard_cache (
        question          TEXT PRIMARY KEY,
        data              JSONB,
        updated_at        TIMESTAMPTZ DEFAULT now()
      )
    `);

    console.log("\n  Building dashboard cache entries ...");

    // Permit stats
    const totalPermits = permits.length;
    const permitsWithProcessing = permits.filter(
      (p) => p.processing_days != null && p.processing_days >= 0
    );
    const avgProcessing =
      permitsWithProcessing.length > 0
        ? permitsWithProcessing.reduce(
            (s, p) => s + (p.processing_days ?? 0),
            0
          ) / permitsWithProcessing.length
        : 0;
    const permitsByType: Record<string, number> = {};
    for (const p of permits) {
      permitsByType[p.permit_type] = (permitsByType[p.permit_type] ?? 0) + 1;
    }
    const permitsByNeighborhood: Record<string, number> = {};
    for (const p of permits) {
      const n = p.neighborhood ?? "Unknown";
      permitsByNeighborhood[n] = (permitsByNeighborhood[n] ?? 0) + 1;
    }
    const under90 = permitsWithProcessing.filter(
      (p) => (p.processing_days ?? 0) <= 90
    ).length;
    const pctUnder90 =
      permitsWithProcessing.length > 0
        ? Math.round((under90 / permitsWithProcessing.length) * 100)
        : 0;

    // Permits by year-month
    const permitsByMonth: Record<string, number> = {};
    for (const p of permits) {
      if (p.issued_date) {
        const ym = p.issued_date.slice(0, 7); // YYYY-MM
        permitsByMonth[ym] = (permitsByMonth[ym] ?? 0) + 1;
      }
    }

    // Permits by status
    const permitsByStatus: Record<string, number> = {};
    for (const p of permits) {
      permitsByStatus[p.status] = (permitsByStatus[p.status] ?? 0) + 1;
    }

    // Average valuation
    const permitsWithVal = permits.filter(
      (p) => p.valuation != null && p.valuation > 0
    );
    const avgValuation =
      permitsWithVal.length > 0
        ? Math.round(
            permitsWithVal.reduce((s, p) => s + (p.valuation ?? 0), 0) /
              permitsWithVal.length
          )
        : 0;
    const totalValuation = permitsWithVal.reduce(
      (s, p) => s + (p.valuation ?? 0),
      0
    );

    const issuedDates = permits
      .map((p) => p.issued_date)
      .filter(Boolean)
      .sort() as string[];

    const permitCache = {
      total_permits: totalPermits,
      avg_processing_days: Math.round(avgProcessing),
      pct_under_90_days: pctUnder90,
      avg_valuation: avgValuation,
      total_valuation: Math.round(totalValuation),
      by_type: permitsByType,
      by_status: permitsByStatus,
      by_neighborhood: permitsByNeighborhood,
      by_month: permitsByMonth,
      date_range: {
        earliest: issuedDates[0] ?? null,
        latest: issuedDates[issuedDates.length - 1] ?? null,
      },
    };

    // Crime stats
    const crimeCache = {
      total_records: crime.length,
      by_category: crimeCounts,
      snapshot_month: currentMonth,
    };

    // Graffiti stats
    const graffitiCache = {
      total_reports: graffiti.length,
      snapshot_month: currentMonth,
    };

    // Business stats
    const bizCache = {
      total_licenses: businesses.length,
      api_status: businesses.length > 0 ? "available" : "unavailable",
      snapshot_date: now.toISOString().slice(0, 10),
    };

    // Neighborhood stats
    const nhoodCache = {
      total_neighborhoods: neighborhoods.length,
      coalitions: [
        ...new Set(neighborhoods.map((n) => n.coalition).filter(Boolean)),
      ],
    };

    // PBOT stats
    const pbotCache = {
      total_requests: pbotRequests.length,
      with_sidewalk_closure: pbotRequests.filter(
        (r) => r.sidewalk_closure === "Yes"
      ).length,
      with_street_closure: pbotRequests.filter(
        (r) => r.street_closure === "Yes"
      ).length,
      with_bike_lane_closure: pbotRequests.filter(
        (r) => r.bike_lane_closure === "Yes"
      ).length,
    };

    const cacheEntries: [string, any][] = [
      ["housing_permits", permitCache],
      ["safety_crime", crimeCache],
      ["safety_graffiti", graffitiCache],
      ["business_licenses", bizCache],
      ["reference_neighborhoods", nhoodCache],
      ["downtown_pbot", pbotCache],
    ];

    for (const [question, data] of cacheEntries) {
      await sql`
        INSERT INTO public.dashboard_cache (question, data, updated_at)
        VALUES (${question}, ${sql.json(data)}, now())
        ON CONFLICT (question) DO UPDATE SET data = ${sql.json(data)}, updated_at = now()
      `;
    }
    console.log(`    Cached ${cacheEntries.length} dashboard entries`);

    // ── Verification queries ────────────────────────────────────────────
    console.log("\n=== Verification Queries ===");

    const verifications = await sql`
      SELECT 'permits' as tbl, count(*)::int as cnt FROM housing.permits
      UNION ALL
      SELECT 'crime_monthly', count(*)::int FROM safety.crime_monthly
      UNION ALL
      SELECT 'graffiti_monthly', count(*)::int FROM safety.graffiti_monthly
      UNION ALL
      SELECT 'neighborhoods', count(*)::int FROM reference.neighborhoods
      UNION ALL
      SELECT 'pbot_requests', count(*)::int FROM downtown.pbot_requests
      UNION ALL
      SELECT 'dashboard_cache', count(*)::int FROM public.dashboard_cache
    `;

    for (const row of verifications) {
      console.log(`  ${row.tbl}: ${row.cnt} rows`);
    }

    // Also check businesses if table exists
    try {
      const bizVerify = await sql`
        SELECT count(*)::int as cnt FROM business.civicapps_licenses
      `;
      console.log(`  civicapps_licenses: ${bizVerify[0].cnt} rows`);
    } catch {
      console.log("  civicapps_licenses: table empty or not created");
    }

    await sql.end();
    console.log("\n  Database connection closed.");
  } catch (err: any) {
    console.error("  Database error:", err.message);
    console.error(err.stack);
    await sql.end();
    throw err;
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Real Data Seeding");
  console.log("======================================");
  console.log(`Data directory: ${DATA_DIR}`);

  // Fetch all data sources in parallel
  const [permits, crime, graffiti, businesses, neighborhoods, pbotRequests] =
    await Promise.all([
      fetchPermits(),
      fetchCrime(),
      fetchGraffiti(),
      fetchBusinesses(),
      fetchNeighborhoods(),
      fetchPBOTRequests(),
    ]);

  // Save to JSON
  console.log("\n=== Saving JSON Files ===");
  saveJson("permits.json", permits);
  saveJson("crime.json", crime);
  saveJson("graffiti.json", graffiti);
  saveJson("businesses.json", businesses);
  saveJson("neighborhoods.json", neighborhoods);
  saveJson("pbot_requests.json", pbotRequests);

  // Insert into PostgreSQL
  await insertIntoDb(
    permits,
    crime,
    graffiti,
    businesses,
    neighborhoods,
    pbotRequests
  );

  console.log("\n======================================");
  console.log("Seeding complete!");
  console.log(`  Permits:        ${permits.length}`);
  console.log(`  Crime:          ${crime.length}`);
  console.log(`  Graffiti:       ${graffiti.length}`);
  console.log(`  Businesses:     ${businesses.length}`);
  console.log(`  Neighborhoods:  ${neighborhoods.length}`);
  console.log(`  PBOT Requests:  ${pbotRequests.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
