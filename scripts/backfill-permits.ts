/**
 * backfill-permits.ts
 *
 * Fetches historical permits (2013-2022) from Portland's ArcGIS FeatureServer
 * and inserts them into the existing housing.permits table WITHOUT truncating.
 *
 * The FeatureServer has 1.4M records going back to 1989.
 * We query by ISSUED date range to get ~84K records for 2013-2022.
 *
 * Usage: npx tsx scripts/backfill-permits.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const isPooled = DB_URL.includes("pooler.supabase.com");
const sql = postgres(DB_URL, {
  max: 5,
  ...(isPooled ? { prepare: false } : {}),
  onnotice: () => {},
});

const BASE_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22/query";

const MAX_REASONABLE_EPOCH = new Date("2027-12-31").getTime();

function epochToDate(epoch: number | null | undefined): string | null {
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
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

async function fetchPage(where: string, offset: number, retries = 3): Promise<any> {
  const params = new URLSearchParams({
    where,
    outFields: "*",
    f: "json",
    returnGeometry: "false",
    resultRecordCount: "4000",
    resultOffset: String(offset),
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}?${params}`);
      if (!res.ok) {
        if (attempt < retries) {
          console.log(`      HTTP ${res.status}, retrying in ${attempt * 5}s (attempt ${attempt}/${retries})...`);
          await new Promise((r) => setTimeout(r, attempt * 5000));
          continue;
        }
        throw new Error(`HTTP ${res.status} after ${retries} attempts`);
      }
      return res.json();
    } catch (err: any) {
      if (attempt < retries && !err.message?.includes("after")) {
        console.log(`      Fetch error: ${err.message}, retrying in ${attempt * 5}s...`);
        await new Promise((r) => setTimeout(r, attempt * 5000));
        continue;
      }
      throw err;
    }
  }
}

async function fetchYearRange(startYear: number, endYear: number) {
  // Use timestamp-based where clause for date range
  const where = `ISSUED >= timestamp '${startYear}-01-01' AND ISSUED < timestamp '${endYear + 1}-01-01' AND ISSUED < timestamp '2027-01-01'`;

  console.log(`  Fetching ${startYear}-${endYear}: ${where}`);

  const allFeatures: any[] = [];
  let offset = 0;

  for (let page = 0; page < 100; page++) {
    console.log(`    Page ${page + 1} (offset=${offset}, total so far: ${allFeatures.length}) ...`);
    const data = await fetchPage(where, offset);

    if (data.error) {
      console.error(`    ArcGIS error: ${data.error.message}`);
      break;
    }

    const features = data.features ?? [];
    allFeatures.push(...features);

    if (features.length < 4000 && data.exceededTransferLimit !== true) {
      break;
    }
    offset += 4000;
  }

  return allFeatures;
}

async function main() {
  console.log("Portland Permits — Historical Backfill (2013-2022)");
  console.log("===================================================\n");

  // Ensure arcgis_object_id has a unique index for dedup
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_permits_arcgis_oid
    ON housing.permits (arcgis_object_id)
    WHERE arcgis_object_id IS NOT NULL
  `.catch(() => {});

  // Check existing count
  const before = await sql`SELECT count(*)::int as cnt FROM housing.permits`;
  console.log(`Current permits in DB: ${before[0].cnt}\n`);

  // Fetch in 2-year chunks to avoid ArcGIS timeouts
  const chunks = [
    [2013, 2014],
    [2015, 2016],
    [2017, 2018],
    [2019, 2020],
    [2021, 2022],
  ];

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFetched = 0;

  for (const [startYear, endYear] of chunks) {
    const features = await fetchYearRange(startYear, endYear);
    totalFetched += features.length;
    console.log(`  Got ${features.length} raw records for ${startYear}-${endYear}`);

    let chunkInserted = 0;
    let chunkSkipped = 0;

    for (const f of features) {
      const a = f.attributes;

      const issuedDate = epochToDate(a.ISSUED);
      if (!issuedDate) continue;

      const appDate = epochToDate(a.INTAKECOMPLETEDATE);
      const finalDate = epochToDate(a.FINALED);
      const address = [a.HOUSE?.trim(), a.DIRECTION, a.PROPSTREET, a.STREETTYPE]
        .filter(Boolean)
        .join(" ");

      const permitNumber = a.APPLICATION ?? `OBJ-${a.OBJECTID}`;
      const rawStatus = (a.STATUS ?? "").trim();
      const valuation = a.FINALVALUATION ?? a.SUBMITTEDVALUATION ?? null;

      try {
        await sql`
          INSERT INTO housing.permits (
            permit_number, permit_type, permit_type_mapped, project_address,
            neighborhood, valuation, application_date, issued_date, final_date,
            status, processing_days, arcgis_object_id
          ) VALUES (
            ${permitNumber}, ${a.PERMIT ?? "unknown"}, ${a.TYPE ?? null},
            ${address || null}, ${a.NEIGHBORHOOD ?? null}, ${valuation},
            ${appDate}::date, ${issuedDate}::date, ${finalDate}::date,
            ${rawStatus || "unknown"}, ${daysBetween(appDate, issuedDate)},
            ${a.OBJECTID ?? null}
          )
          ON CONFLICT (arcgis_object_id) WHERE arcgis_object_id IS NOT NULL DO NOTHING
        `;
        chunkInserted++;
      } catch (err: any) {
        // Unique violation on arcgis_object_id means dupe — skip silently
        if (err.code === "23505") {
          chunkSkipped++;
        } else {
          chunkSkipped++;
        }
      }
    }

    totalInserted += chunkInserted;
    totalSkipped += chunkSkipped;
    console.log(`  Inserted: ${chunkInserted}, Skipped/Dupes: ${chunkSkipped}\n`);
  }

  // Verify
  const after = await sql`SELECT count(*)::int as cnt FROM housing.permits`;
  const byYear = await sql`
    SELECT EXTRACT(YEAR FROM issued_date)::int AS yr, count(*)::int AS cnt
    FROM housing.permits
    WHERE issued_date IS NOT NULL
    GROUP BY 1 ORDER BY 1
  `;

  console.log("===================================================");
  console.log(`Total fetched from ArcGIS: ${totalFetched}`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log(`Permits before: ${before[0].cnt}`);
  console.log(`Permits after: ${after[0].cnt}`);
  console.log(`Net new: ${Number(after[0].cnt) - Number(before[0].cnt)}`);
  console.log("\nPermits by year:");
  for (const r of byYear) {
    console.log(`  ${r.yr}: ${Number(r.cnt).toLocaleString()}`);
  }

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
