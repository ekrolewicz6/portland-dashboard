/**
 * Refresh business.oregon_sos_all_active from the Oregon SOS active-business
 * registry (Socrata dataset tckn-sxa6), filtered to Portland.
 *
 * This table backs the business dashboard and directory but previously had no
 * ingest — it was a one-time snapshot (frozen at 2026-03-09). This script
 * pages the live registry into a staging table, then reloads the real table
 * inside a single transaction with a row-count guard, so a mid-run failure
 * can never leave the table empty or partial.
 *
 * Run: npx tsx ingest/fetch-sos-all-active.ts
 */
import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

const BASE = "https://data.oregon.gov/resource/tckn-sxa6.json";
const PAGE_SIZE = 50000;
// Refuse to reload if the fetch came back suspiciously small (live count ~375k).
const MIN_EXPECTED_ROWS = 300000;

const COLS = [
  "registry_number",
  "business_name",
  "entity_type",
  "registry_date",
  "associated_name_type",
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "entity_of_record_reg_number",
  "entity_of_record_name",
  "address",
  "address_continued",
  "city",
  "state",
  "zip",
  "jurisdiction",
  "business_details",
  "not_of_record_entity",
] as const;

async function main() {
  const sql = postgres(DB_URL, { max: 1, onnotice: () => {} });
  try {
    console.log("=== Step 1: Stage live registry into staging table ===");
    await sql.unsafe(`DROP TABLE IF EXISTS business.oregon_sos_all_active_staging`);
    await sql.unsafe(`
      CREATE TABLE business.oregon_sos_all_active_staging (
        registry_number text, business_name text, entity_type text,
        registry_date timestamptz, associated_name_type text,
        first_name text, middle_name text, last_name text, suffix text,
        entity_of_record_reg_number text, entity_of_record_name text,
        address text, address_continued text, city text, state text, zip text,
        jurisdiction text, business_details text, not_of_record_entity text
      )`);

    let offset = 0;
    let total = 0;
    while (true) {
      const url = `${BASE}?$where=upper(city)='PORTLAND'&$limit=${PAGE_SIZE}&$offset=${offset}&$order=:id`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Socrata HTTP ${res.status} at offset ${offset}`);
      const records = (await res.json()) as Record<string, string>[];
      if (records.length === 0) break;
      for (let i = 0; i < records.length; i += 1000) {
        const chunk = records.slice(i, i + 1000).map((r) => {
          const row: Record<string, string | null> = {};
          for (const c of COLS) row[c] = r[c] ?? null;
          return row;
        });
        await sql`INSERT INTO business.oregon_sos_all_active_staging ${sql(chunk, ...COLS)}`;
      }
      total += records.length;
      console.log(`  fetched ${total} rows so far`);
      offset += PAGE_SIZE;
      if (records.length < PAGE_SIZE) break;
    }

    if (total < MIN_EXPECTED_ROWS) {
      throw new Error(
        `Only ${total} rows staged (expected >= ${MIN_EXPECTED_ROWS}); leaving live table untouched`,
      );
    }

    console.log("=== Step 2: Reload live table in one transaction ===");
    const colList = COLS.join(", ");
    await sql.begin(async (tx) => {
      await tx.unsafe(`TRUNCATE business.oregon_sos_all_active`);
      await tx.unsafe(`
        INSERT INTO business.oregon_sos_all_active (${colList})
        SELECT ${colList} FROM business.oregon_sos_all_active_staging`);
    });
    await sql.unsafe(`DROP TABLE business.oregon_sos_all_active_staging`);

    const v = await sql`
      SELECT count(*)::int AS rows,
             count(DISTINCT registry_number)::int AS entities,
             max(registry_date)::date::text AS newest_registration
      FROM business.oregon_sos_all_active`;
    console.log("=== Done ===");
    console.log(
      `  rows=${v[0].rows} distinct_entities=${v[0].entities} newest=${v[0].newest_registration}`,
    );
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
