/**
 * seed-quality-data.ts
 *
 * Unified fetcher for Quality of Life dashboard data:
 *   1. Parks — ArcGIS Parks_Misc/MapServer (parks + playground amenities)
 *   2. PBOT Pavement Condition — ArcGIS COP_OpenData_Transportation/MapServer
 *   3. Library — Oregon State Library via Socrata (data.oregon.gov)
 *
 * Enhances the DB with additional fields the original scripts missed:
 *   - Library: circulation by type, program breakdown, e-content, collection size,
 *     branches, population served, hours open
 *   - Parks: derived park_type classification
 *
 * Usage: cd /path/to/dashboard && set -a && source .env.local && set +a
 *        npx tsx ingest/seed-quality-data.ts
 *        npx tsx ingest/seed-quality-data.ts --parks-only
 *        npx tsx ingest/seed-quality-data.ts --pavement-only
 *        npx tsx ingest/seed-quality-data.ts --library-only
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

// ── DB connection (Supabase pooler-safe) ────────────────────────────────

function makeSQL() {
  const isPooled = DB_URL.includes("pooler.supabase.com");
  if (isPooled) {
    const parsed = new URL(DB_URL);
    return postgres({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer",
      prepare: false,
      max: 1,
      onnotice: () => {},
    });
  }
  return postgres(DB_URL, { max: 1, prepare: false, onnotice: () => {} });
}

const PAGE_SIZE = 2000;

/** Escape a string for sql.unsafe VALUES — null-safe */
function esc(val: string | null | undefined): string {
  if (val == null) return "NULL";
  // Replace single quotes with doubled single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

/** Escape a number — null-safe */
function escNum(val: number | null | undefined): string {
  if (val == null || isNaN(Number(val))) return "NULL";
  return String(val);
}

// ── ArcGIS pagination helper ────────────────────────────────────────────

interface ArcGISResponse {
  features: Array<{ attributes: Record<string, any> }>;
  exceededTransferLimit?: boolean;
  error?: { code: number; message: string };
}

async function fetchArcGISPages(
  baseUrl: string,
  outFields: string,
  label: string
): Promise<Record<string, any>[]> {
  const all: Record<string, any>[] = [];
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
    console.log(`  [${label}] fetching offset=${offset} ...`);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status} for ${label}`);

    const data: ArcGISResponse = await res.json();
    if (data.error) throw new Error(`ArcGIS error: ${data.error.message}`);

    const features = data.features ?? [];
    console.log(`    got ${features.length} features`);
    for (const f of features) all.push(f.attributes);

    if (features.length < PAGE_SIZE && !data.exceededTransferLimit) break;
    offset += features.length;

    // polite pause
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`  [${label}] total: ${all.length}`);
  return all;
}

// ════════════════════════════════════════════════════════════════════════
// 1. PARKS
// ════════════════════════════════════════════════════════════════════════

const PARKS_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/2/query";
const PLAYGROUND_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/4/query";

/** Classify park type from name + acreage */
function classifyParkType(name: string, acres: number | null): string {
  const lower = name.toLowerCase();
  if (/nature\s*park|wildlife|natural\s*area|butte/.test(lower))
    return "Nature Park";
  if (/community\s*(center|garden)/.test(lower)) return "Community Center";
  if (/golf\s*course/.test(lower)) return "Golf Course";
  if (/raceway|motorsport/.test(lower)) return "Recreational Facility";
  if (/trail|corridor|greenway|path/.test(lower)) return "Trail/Corridor";
  if (/garden|botanical/.test(lower)) return "Garden";
  if (/plaza|square|triangle/.test(lower)) return "Plaza";
  if (/boat\s*ramp|dock|marina/.test(lower)) return "Boat Facility";
  if (/skate\s*park/.test(lower)) return "Skate Park";
  if (/swim|pool|aquatic/.test(lower)) return "Aquatic Facility";
  if (acres != null && acres > 100) return "Regional Park";
  if (acres != null && acres > 20) return "Community Park";
  if (acres != null && acres > 5) return "Neighborhood Park";
  if (acres != null && acres <= 5) return "Pocket Park";
  return "Park";
}

async function seedParks(sql: ReturnType<typeof postgres>) {
  console.log("\n========== 1. PARKS ==========");

  // Ensure schema
  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

  // Add park_type column if missing
  await sql.unsafe(`
    ALTER TABLE quality.parks
      ADD COLUMN IF NOT EXISTS park_type TEXT
  `);

  // Fetch parks
  const parks = await fetchArcGISPages(
    PARKS_URL,
    "NAME,ACRES,PROPERTYID",
    "parks"
  );

  // Fetch playground amenities
  let playgrounds: Record<string, any>[] = [];
  try {
    playgrounds = await fetchArcGISPages(
      PLAYGROUND_URL,
      "NAME,PROPERTYID,Component,Install_Year,ADA_Path,Status,Condition_rating",
      "playground equipment"
    );
  } catch (err: any) {
    console.log(`  Playground fetch failed (non-fatal): ${err.message}`);
  }

  // Prepare park rows
  const parkRows = parks
    .filter((p) => p.NAME || p.name || p.Name)
    .map((p) => {
      const name = p.NAME || p.name || p.Name;
      const acres = p.ACRES || p.acres || null;
      const propertyId = String(p.PROPERTYID || p.propertyid || "");
      const parkType = classifyParkType(name, acres ? Number(acres) : null);
      return { name, acres, propertyId, parkType };
    });

  // Batch upsert parks (50 at a time)
  let inserted = 0;
  for (let i = 0; i < parkRows.length; i += 50) {
    const batch = parkRows.slice(i, i + 50);
    const values = batch
      .map(
        (r) =>
          `(${esc(r.name)}, ${r.acres ?? "NULL"}, ${esc(r.propertyId)}, ${esc(r.parkType)})`
      )
      .join(",\n");
    try {
      await sql.unsafe(`
        INSERT INTO quality.parks (name, acres, property_id, park_type)
        VALUES ${values}
        ON CONFLICT (name) DO UPDATE SET
          acres = EXCLUDED.acres,
          property_id = EXCLUDED.property_id,
          park_type = EXCLUDED.park_type
      `);
      inserted += batch.length;
    } catch (err: any) {
      console.log(`  Batch error at offset ${i}: ${err.message}`);
    }
  }
  console.log(`  Parks — upserted: ${inserted}`);

  // Batch upsert playground amenities
  const amenRows = playgrounds.map((a) => {
    const parkName = a.NAME || null;
    const component = a.Component || "Unknown";
    const amenityName = `${component}${a.Install_Year ? ` (${a.Install_Year})` : ""}`;
    return { parkName, component, amenityName };
  });
  let amenInserted = 0;
  for (let i = 0; i < amenRows.length; i += 50) {
    const batch = amenRows.slice(i, i + 50);
    const values = batch
      .map(
        (r) => `(${esc(r.parkName)}, ${esc(r.component)}, ${esc(r.amenityName)})`
      )
      .join(",\n");
    try {
      await sql.unsafe(`
        INSERT INTO quality.park_amenities (park_name, amenity_type, amenity_name)
        VALUES ${values}
        ON CONFLICT (park_name, amenity_type, amenity_name) DO NOTHING
      `);
      amenInserted += batch.length;
    } catch (err: any) {
      console.log(`  Amenity batch error at offset ${i}: ${err.message}`);
    }
  }
  console.log(`  Amenities — upserted: ${amenInserted}`);

  // Stats
  const stats = await sql`
    SELECT count(*)::int as total,
           round(sum(acres)::numeric, 1) as total_acres,
           count(DISTINCT park_type)::int as type_count
    FROM quality.parks
    WHERE acres IS NOT NULL
  `;
  const byType = await sql`
    SELECT park_type, count(*)::int as cnt, round(sum(acres)::numeric, 1) as acres
    FROM quality.parks
    GROUP BY park_type
    ORDER BY acres DESC NULLS LAST
  `;
  console.log(`\n  Summary: ${stats[0].total} parks, ${stats[0].total_acres} total acres`);
  for (const row of byType) {
    console.log(`    ${row.park_type}: ${row.cnt} parks (${row.acres ?? 0} acres)`);
  }
}

// ════════════════════════════════════════════════════════════════════════
// 2. PBOT PAVEMENT CONDITION
// ════════════════════════════════════════════════════════════════════════

const PAVEMENT_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Transportation/MapServer/71/query";

async function seedPavement(sql: ReturnType<typeof postgres>) {
  console.log("\n========== 2. PBOT PAVEMENT CONDITION ==========");

  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS quality.pavement_condition (
      id SERIAL PRIMARY KEY,
      street_name TEXT,
      pci INT,
      surface_type TEXT,
      functional_class TEXT,
      inspection_year INT,
      length_ft NUMERIC,
      sq_yards NUMERIC,
      num_lanes INT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(street_name, pci, inspection_year)
    )
  `);
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS idx_pavement_pci ON quality.pavement_condition(pci)`
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS idx_pavement_year ON quality.pavement_condition(inspection_year)`
  );

  const outFields =
    "PCI,Streetname,SurfaceType,FunctionalClass,InspectionYear,Length,SqYards,NumberOfLanes";

  const records = await fetchArcGISPages(PAVEMENT_URL, outFields, "pavement");

  // Prepare rows
  const pavementRows = records.map((r) => ({
    streetName: r.Streetname || r.streetname || r.STREETNAME || null,
    pci: r.PCI != null ? Math.round(Number(r.PCI)) : null,
    surfaceType: r.SurfaceType || null,
    funcClass: r.FunctionalClass || null,
    inspYear: r.InspectionYear || null,
    length: r.Length || null,
    sqYards: r.SqYards || null,
    numLanes: r.NumberOfLanes || null,
  }));

  // Deduplicate by (street_name, pci, inspection_year) — keep last occurrence
  const deduped = new Map<string, (typeof pavementRows)[0]>();
  for (const r of pavementRows) {
    const key = `${r.streetName}|${r.pci}|${r.inspYear}`;
    deduped.set(key, r);
  }
  const uniqueRows = Array.from(deduped.values());
  console.log(`  Deduplicated: ${pavementRows.length} -> ${uniqueRows.length} unique rows`);

  // Batch upsert (200 rows per batch)
  const BATCH = 200;
  let upserted = 0;
  let batchErrors = 0;

  for (let i = 0; i < uniqueRows.length; i += BATCH) {
    const batch = uniqueRows.slice(i, i + BATCH);
    const values = batch
      .map(
        (r) =>
          `(${esc(r.streetName)}, ${escNum(r.pci)}, ${esc(r.surfaceType)}, ` +
          `${esc(r.funcClass)}, ${escNum(r.inspYear)}, ${escNum(r.length)}, ` +
          `${escNum(r.sqYards)}, ${escNum(r.numLanes)})`
      )
      .join(",\n");

    try {
      await sql.unsafe(`
        INSERT INTO quality.pavement_condition
          (street_name, pci, surface_type, functional_class,
           inspection_year, length_ft, sq_yards, num_lanes)
        VALUES ${values}
        ON CONFLICT (street_name, pci, inspection_year) DO UPDATE SET
          surface_type = EXCLUDED.surface_type,
          functional_class = EXCLUDED.functional_class,
          length_ft = EXCLUDED.length_ft,
          sq_yards = EXCLUDED.sq_yards,
          num_lanes = EXCLUDED.num_lanes
      `);
      upserted += batch.length;
    } catch (err: any) {
      batchErrors++;
      if (batchErrors <= 3) console.log(`  Batch error at offset ${i}: ${err.message}`);
    }

    if (i > 0 && (i / BATCH) % 25 === 0) {
      console.log(`  ... upserted ${upserted}/${uniqueRows.length}`);
    }
  }
  if (batchErrors > 3) console.log(`  ... +${batchErrors - 3} more batch errors`);
  console.log(`  Upserted: ${upserted}, Batch errors: ${batchErrors}`);

  // Summary
  const stats = await sql`
    SELECT count(*)::int as total,
           round(avg(pci)::numeric, 1) as avg_pci,
           count(*) FILTER (WHERE pci > 70)::int as good,
           count(*) FILTER (WHERE pci BETWEEN 40 AND 70)::int as fair,
           count(*) FILTER (WHERE pci < 40)::int as poor
    FROM quality.pavement_condition
  `;
  const s = stats[0];
  console.log(
    `\n  Summary: ${s.total} segments, avg PCI=${s.avg_pci}` +
      ` | Good(>70): ${s.good} | Fair(40-70): ${s.fair} | Poor(<40): ${s.poor}`
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3. LIBRARY (Multnomah County via Socrata)
// ════════════════════════════════════════════════════════════════════════

const SOCRATA_URL = "https://data.oregon.gov/resource/8zw7-zgjw.json";

interface LibraryRow {
  fiscal_year: string;
  library_name: string;
  visits: number | null;
  circ_physical: number | null;
  circ_econtent: number | null;
  circ_total: number | null;
  programs_kids: number | null;
  programs_kids_attendance: number | null;
  programs_ya: number | null;
  programs_ya_attendance: number | null;
  programs_adults: number | null;
  programs_adults_attendance: number | null;
  programs_total: number | null;
  program_attendance_total: number | null;
  registered_users: number | null;
  branches: number | null;
  population_served: number | null;
  hours_open_year: number | null;
  collection_books: number | null;
  collection_ebooks: number | null;
}

function num(val: any): number | null {
  if (val === null || val === undefined || val === "" || val === true || val === false) return null;
  const n = parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

async function fetchLibraryRows(): Promise<LibraryRow[]> {
  console.log("  Fetching Multnomah County Library data from Socrata...");

  // Key fields we need
  const fields = [
    "year",
    "libraryname",
    "libraryvisits",
    "circadult",
    "circya",
    "circchildrens",
    "circnoagecategory",
    "circodlc",
    "circecontentlocal",
    "registeredusers",
    "branches",
    "populationserved",
    "hoursopenyear",
    "collectionbooks",
    "collectionebooksodlc",
    "collectionebookslocal",
    "programskids0_11",
    "programskids0_11attendance",
    "programsya12_18",
    "programsya12_18attendance",
    "programsadults",
    "programsadultsattendance",
    "programsgeneralinterest",
    "programsgeneralinteresta",
  ].join(",");

  const params = new URLSearchParams({
    $where: "libraryname like '%Multnomah%'",
    $order: "year DESC",
    $limit: "50",
    $select: fields,
  });
  const url = `${SOCRATA_URL}?${params.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Socrata HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const raw: Record<string, any>[] = await res.json();
  console.log(`  Got ${raw.length} year-rows from Socrata`);

  return raw.map((r) => {
    // Circulation: earlier years use circadult+circya+circchildrens;
    // newer years use circnoagecategory (they changed methodology)
    const circAdult = num(r.circadult);
    const circYA = num(r.circya);
    const circChild = num(r.circchildrens);
    const circNoAge = num(r.circnoagecategory);
    const circODLC = num(r.circodlc);
    const circELocal = num(r.circecontentlocal);

    const circPhysical =
      circNoAge ??
      (circAdult != null || circChild != null
        ? (circAdult ?? 0) + (circYA ?? 0) + (circChild ?? 0)
        : null);

    const circEcontent =
      circODLC != null || circELocal != null
        ? (circODLC ?? 0) + (circELocal ?? 0)
        : null;

    // Programs
    const pKids = num(r.programskids0_11);
    const pYA = num(r.programsya12_18);
    const pAdults = num(r.programsadults);
    const pGeneral = num(r.programsgeneralinterest);
    const pKidsAtt = num(r.programskids0_11attendance);
    const pYAAtt = num(r.programsya12_18attendance);
    const pAdultsAtt = num(r.programsadultsattendance);
    const pGeneralAtt = num(r.programsgeneralinteresta);

    const programsTotal =
      pKids != null || pYA != null || pAdults != null || pGeneral != null
        ? (pKids ?? 0) + (pYA ?? 0) + (pAdults ?? 0) + (pGeneral ?? 0)
        : null;
    const attendanceTotal =
      pKidsAtt != null || pYAAtt != null || pAdultsAtt != null || pGeneralAtt != null
        ? (pKidsAtt ?? 0) + (pYAAtt ?? 0) + (pAdultsAtt ?? 0) + (pGeneralAtt ?? 0)
        : null;

    // Ebooks
    const ebooksODLC = num(r.collectionebooksodlc);
    const ebooksLocal = num(r.collectionebookslocal);
    const ebooks =
      ebooksODLC != null || ebooksLocal != null
        ? (ebooksODLC ?? 0) + (ebooksLocal ?? 0)
        : null;

    return {
      fiscal_year: String(r.year || "unknown"),
      library_name: String(r.libraryname || "Multnomah County Library"),
      visits: num(r.libraryvisits),
      circ_physical: circPhysical,
      circ_econtent: circEcontent,
      circ_total:
        circPhysical != null || circEcontent != null
          ? (circPhysical ?? 0) + (circEcontent ?? 0)
          : null,
      programs_kids: pKids,
      programs_kids_attendance: pKidsAtt,
      programs_ya: pYA,
      programs_ya_attendance: pYAAtt,
      programs_adults: pAdults,
      programs_adults_attendance: pAdultsAtt,
      programs_total: programsTotal,
      program_attendance_total: attendanceTotal,
      registered_users: num(r.registeredusers),
      branches: num(r.branches),
      population_served: num(r.populationserved),
      hours_open_year: num(r.hoursopenyear),
      collection_books: num(r.collectionbooks),
      collection_ebooks: ebooks,
    };
  });
}

async function seedLibrary(sql: ReturnType<typeof postgres>) {
  console.log("\n========== 3. LIBRARY (Multnomah County) ==========");

  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

  // Add new columns to existing table if missing
  const newCols = [
    "circ_physical INT",
    "circ_econtent INT",
    "circ_total INT",
    "programs_kids INT",
    "programs_kids_attendance INT",
    "programs_ya INT",
    "programs_ya_attendance INT",
    "programs_adults INT",
    "programs_adults_attendance INT",
    "programs_total INT",
    "program_attendance_total INT",
    "branches INT",
    "population_served INT",
    "hours_open_year INT",
    "collection_books INT",
    "collection_ebooks INT",
  ];

  for (const col of newCols) {
    try {
      await sql.unsafe(
        `ALTER TABLE quality.library_stats ADD COLUMN IF NOT EXISTS ${col}`
      );
    } catch {
      // column may already exist
    }
  }

  const rows = await fetchLibraryRows();

  if (rows.length === 0) {
    console.log("  WARNING: No Multnomah County library data found.");
    return;
  }

  let upserted = 0;
  for (const r of rows) {
    try {
      await sql`
        INSERT INTO quality.library_stats
          (fiscal_year, library_name, visits, circulation,
           circ_physical, circ_econtent, circ_total,
           programs, program_attendance,
           programs_kids, programs_kids_attendance,
           programs_ya, programs_ya_attendance,
           programs_adults, programs_adults_attendance,
           programs_total, program_attendance_total,
           registered_users, branches, population_served,
           hours_open_year, collection_books, collection_ebooks)
        VALUES (
          ${r.fiscal_year}, ${r.library_name}, ${r.visits}, ${r.circ_total},
          ${r.circ_physical}, ${r.circ_econtent}, ${r.circ_total},
          ${r.programs_total}, ${r.program_attendance_total},
          ${r.programs_kids}, ${r.programs_kids_attendance},
          ${r.programs_ya}, ${r.programs_ya_attendance},
          ${r.programs_adults}, ${r.programs_adults_attendance},
          ${r.programs_total}, ${r.program_attendance_total},
          ${r.registered_users}, ${r.branches}, ${r.population_served},
          ${r.hours_open_year}, ${r.collection_books}, ${r.collection_ebooks}
        )
        ON CONFLICT (fiscal_year, library_name) DO UPDATE SET
          visits = EXCLUDED.visits,
          circulation = EXCLUDED.circulation,
          circ_physical = EXCLUDED.circ_physical,
          circ_econtent = EXCLUDED.circ_econtent,
          circ_total = EXCLUDED.circ_total,
          programs = EXCLUDED.programs,
          program_attendance = EXCLUDED.program_attendance,
          programs_kids = EXCLUDED.programs_kids,
          programs_kids_attendance = EXCLUDED.programs_kids_attendance,
          programs_ya = EXCLUDED.programs_ya,
          programs_ya_attendance = EXCLUDED.programs_ya_attendance,
          programs_adults = EXCLUDED.programs_adults,
          programs_adults_attendance = EXCLUDED.programs_adults_attendance,
          programs_total = EXCLUDED.programs_total,
          program_attendance_total = EXCLUDED.program_attendance_total,
          registered_users = EXCLUDED.registered_users,
          branches = EXCLUDED.branches,
          population_served = EXCLUDED.population_served,
          hours_open_year = EXCLUDED.hours_open_year,
          collection_books = EXCLUDED.collection_books,
          collection_ebooks = EXCLUDED.collection_ebooks
      `;
      upserted++;
    } catch (err: any) {
      console.log(
        `  Error upserting ${r.fiscal_year}: ${err.message}`
      );
    }
  }
  console.log(`  Upserted ${upserted} library year-rows`);

  // Update dashboard cache
  const latest = rows[0]; // already sorted DESC
  const cacheData = {
    source: "Oregon State Library / data.oregon.gov (Socrata)",
    dataset_id: "8zw7-zgjw",
    total_rows: rows.length,
    fiscal_years: rows.map((r) => r.fiscal_year),
    latest_year: latest.fiscal_year,
    latest_summary: {
      visits: latest.visits,
      circ_physical: latest.circ_physical,
      circ_econtent: latest.circ_econtent,
      circ_total: latest.circ_total,
      registered_users: latest.registered_users,
      branches: latest.branches,
      programs_total: latest.programs_total,
      program_attendance_total: latest.program_attendance_total,
      collection_books: latest.collection_books,
      collection_ebooks: latest.collection_ebooks,
    },
    fetched_at: new Date().toISOString(),
  };

  try {
    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('library_stats', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache");
  } catch (err: any) {
    console.log(`  Cache update failed (non-fatal): ${err.message}`);
  }

  // Print summary
  console.log("\n  Year-by-year summary:");
  for (const r of rows) {
    const visits = r.visits ? r.visits.toLocaleString() : "-";
    const circ = r.circ_total ? r.circ_total.toLocaleString() : "-";
    const ecirc = r.circ_econtent ? r.circ_econtent.toLocaleString() : "-";
    const progs = r.programs_total ? r.programs_total.toLocaleString() : "-";
    console.log(
      `    ${r.fiscal_year}: visits=${visits}, circ=${circ}, e-content=${ecirc}, programs=${progs}`
    );
  }
}

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("Portland Dashboard — Quality of Life Data Seed");
  console.log("===============================================");
  console.log(`Started: ${new Date().toISOString()}\n`);

  const args = new Set(process.argv.slice(2));
  const parksOnly = args.has("--parks-only");
  const pavementOnly = args.has("--pavement-only");
  const libraryOnly = args.has("--library-only");
  const runAll = !parksOnly && !pavementOnly && !libraryOnly;

  const sql = makeSQL();

  try {
    if (runAll || parksOnly) await seedParks(sql);
    if (runAll || pavementOnly) await seedPavement(sql);
    if (runAll || libraryOnly) await seedLibrary(sql);

    console.log("\n===============================================");
    console.log("Quality of Life data seed complete!");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
