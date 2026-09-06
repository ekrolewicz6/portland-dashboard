/**
 * sync-pbj-records.ts
 *
 * Loads the Python pipeline's dashboard-shaped JSON output into Postgres.
 * Source files (already produced by intelligence/bizjournals-records/insights/run_analysis.py):
 *
 *   intelligence/bizjournals-records/insights/output/pbj_economy.json
 *   intelligence/bizjournals-records/insights/output/pbj_housing.json
 *   intelligence/bizjournals-records/insights/output/pbj_accountability.json
 *   intelligence/bizjournals-records/insights/output/pbj_geography.json
 *
 * Tables touched (created if not exist; matches src/db/schema.ts):
 *   pbj_business_monthly, pbj_real_estate_monthly,
 *   pbj_serial_buyer, pbj_distress_entity,
 *   pbj_zip_investment, pbj_top_lawsuit
 *
 * Usage:
 *   cd civic-dashboard && set -a && source .env.local && set +a
 *   npx tsx ingest/sync-pbj-records.ts                  # full upsert
 *   npx tsx ingest/sync-pbj-records.ts --dry-run        # parse + count, don't write
 *   npx tsx ingest/sync-pbj-records.ts --replace        # truncate snapshot tables
 *   npx tsx ingest/sync-pbj-records.ts --businesses-only
 *   npx tsx ingest/sync-pbj-records.ts --realestate-only
 *   npx tsx ingest/sync-pbj-records.ts --accountability-only
 *   npx tsx ingest/sync-pbj-records.ts --zips-only
 *   npx tsx ingest/sync-pbj-records.ts --input /custom/path
 *
 * Source dir resolution: env PBJ_INPUT_DIR > flag --input <dir> > default
 *   ../../intelligence/bizjournals-records/insights/output (relative to this file)
 */

import postgres from "postgres";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireDatabaseUrl } from "./lib/db-url";

// ── DB connection (Supabase pooler-safe) ────────────────────────────────

const DB_URL = requireDatabaseUrl();

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
    });
  }
  return postgres(DB_URL, { max: 1 });
}

const sql = makeSQL();

// ── CLI ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const flagValue = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

const DRY_RUN = flag("--dry-run");
const REPLACE = flag("--replace");
const ONLY_BUSINESSES = flag("--businesses-only");
const ONLY_REALESTATE = flag("--realestate-only");
const ONLY_ACCOUNTABILITY = flag("--accountability-only");
const ONLY_ZIPS = flag("--zips-only");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DIR = path.resolve(__dirname, "../../../intelligence/bizjournals-records/insights/output");
const PBJ_DIR =
  process.env.PBJ_INPUT_DIR ||
  flagValue("--input") ||
  DEFAULT_DIR;

console.log(`[pbj-sync] source: ${PBJ_DIR}`);
console.log(`[pbj-sync] dry-run=${DRY_RUN} replace=${REPLACE}`);

// ── Helpers ─────────────────────────────────────────────────────────────

function loadJSON<T = unknown>(filename: string): T | null {
  const p = path.join(PBJ_DIR, filename);
  if (!existsSync(p)) {
    console.warn(`  ⚠ ${filename} not found at ${p} — skipping`);
    return null;
  }
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

/** Convert "YYYY-MM" → "YYYY-MM-01" (DATE-friendly). */
function toMonthDate(ym: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(ym)) return ym;
  if (/^\d{4}-\d{2}$/.test(ym)) return `${ym}-01`;
  throw new Error(`unparseable month: ${ym}`);
}

function hashCase(d: string, p: string | null, date: string | null, amount: number): string {
  return createHash("sha1")
    .update([d, p ?? "", date ?? "", String(amount)].join("|"))
    .digest("hex")
    .slice(0, 24);
}

const noOpRun = DRY_RUN
  ? (label: string, n: number) => console.log(`  [dry-run] would upsert ${n} rows into ${label}`)
  : null;

// ── Schema bootstrap (idempotent — matches src/db/schema.ts) ────────────

async function ensureTables() {
  if (DRY_RUN) return;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_business_monthly (
      month            DATE PRIMARY KEY,
      new_businesses   INTEGER NOT NULL DEFAULT 0,
      bankruptcies     INTEGER NOT NULL DEFAULT 0,
      lawsuits         INTEGER NOT NULL DEFAULT 0,
      tax_liens        INTEGER NOT NULL DEFAULT 0,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_real_estate_monthly (
      month            DATE PRIMARY KEY,
      entity_buyers    INTEGER NOT NULL DEFAULT 0,
      person_buyers    INTEGER NOT NULL DEFAULT 0,
      total_volume_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
      deal_count       INTEGER NOT NULL DEFAULT 0,
      entity_share_pct NUMERIC(5,2),
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_serial_buyer (
      buyer_name        TEXT PRIMARY KEY,
      buyer_type        TEXT,
      deal_count        INTEGER NOT NULL,
      total_volume_usd  NUMERIC(14,2),
      zip_count         INTEGER,
      last_seen_week    DATE,
      ingested_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pbj_serial_buyer_volume_idx ON pbj_serial_buyer (total_volume_usd DESC)`;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_distress_entity (
      entity_name     TEXT PRIMARY KEY,
      categories      TEXT[] NOT NULL,
      category_count  INTEGER NOT NULL,
      last_seen_week  DATE,
      ingested_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pbj_distress_entity_count_idx ON pbj_distress_entity (category_count DESC)`;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_zip_investment (
      zip_code             TEXT PRIMARY KEY,
      permit_count         INTEGER DEFAULT 0,
      permit_value_usd     NUMERIC(14,2) DEFAULT 0,
      re_deal_count        INTEGER DEFAULT 0,
      re_volume_usd        NUMERIC(14,2) DEFAULT 0,
      new_business_count   INTEGER DEFAULT 0,
      total_investment_usd NUMERIC(14,2) DEFAULT 0,
      ingested_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS pbj_top_lawsuit (
      case_id        TEXT PRIMARY KEY,
      defendant_name TEXT NOT NULL,
      plaintiff_name TEXT,
      suit_type      TEXT,
      damages_usd    NUMERIC(14,2) NOT NULL,
      filed_date     DATE,
      ingested_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pbj_top_lawsuit_damages_idx ON pbj_top_lawsuit (damages_usd DESC)`;
}

// ── Section: Businesses (monthly) ───────────────────────────────────────

interface EconomyJSON {
  chartData?: Array<{
    date: string;
    new_businesses?: number;
    bankruptcies?: number;
    lawsuits?: number;
    tax_liens?: number;
  }>;
}

async function syncBusinesses() {
  const data = loadJSON<EconomyJSON>("pbj_economy.json");
  if (!data?.chartData?.length) {
    console.log("  ⚠ pbj_economy.json missing or has no chartData — skipping businesses");
    return;
  }
  const rows = data.chartData.filter((r) => r.date);
  console.log(`  pbj_business_monthly: ${rows.length} months`);
  if (DRY_RUN) return noOpRun!("pbj_business_monthly", rows.length);
  for (const r of rows) {
    await sql`
      INSERT INTO pbj_business_monthly (month, new_businesses, bankruptcies, lawsuits, tax_liens)
      VALUES (${toMonthDate(r.date)},
              ${r.new_businesses ?? 0}, ${r.bankruptcies ?? 0},
              ${r.lawsuits ?? 0}, ${r.tax_liens ?? 0})
      ON CONFLICT (month) DO UPDATE SET
        new_businesses = EXCLUDED.new_businesses,
        bankruptcies   = EXCLUDED.bankruptcies,
        lawsuits       = EXCLUDED.lawsuits,
        tax_liens      = EXCLUDED.tax_liens
    `;
  }
}

// ── Section: Real Estate (monthly + serial buyers) ──────────────────────

interface HousingChartRow {
  date: string;
  entity_count?: number;
  person_count?: number;
  entity_value_usd?: number;
  person_value_usd?: number;
  entity_share_pct?: number;
}
interface SerialBuyer {
  label: string; // buyer name
  value: number; // deal count
  meta: { total_value_usd?: number; zip_count?: number; entity?: boolean };
}
interface HousingJSON {
  chartData?: HousingChartRow[];
  topList?: SerialBuyer[];
}

async function syncRealEstate() {
  const data = loadJSON<HousingJSON>("pbj_housing.json");
  if (!data) {
    console.log("  ⚠ pbj_housing.json missing — skipping real estate");
    return;
  }

  // Monthly
  const months = (data.chartData ?? []).filter((r) => r.date);
  console.log(`  pbj_real_estate_monthly: ${months.length} months`);
  if (!DRY_RUN) {
    for (const r of months) {
      const totalVolume = (r.entity_value_usd ?? 0) + (r.person_value_usd ?? 0);
      const dealCount = (r.entity_count ?? 0) + (r.person_count ?? 0);
      await sql`
        INSERT INTO pbj_real_estate_monthly
          (month, entity_buyers, person_buyers, total_volume_usd, deal_count, entity_share_pct)
        VALUES (${toMonthDate(r.date)},
                ${r.entity_count ?? 0}, ${r.person_count ?? 0},
                ${totalVolume}, ${dealCount}, ${r.entity_share_pct ?? null})
        ON CONFLICT (month) DO UPDATE SET
          entity_buyers     = EXCLUDED.entity_buyers,
          person_buyers     = EXCLUDED.person_buyers,
          total_volume_usd  = EXCLUDED.total_volume_usd,
          deal_count        = EXCLUDED.deal_count,
          entity_share_pct  = EXCLUDED.entity_share_pct
      `;
    }
  } else {
    noOpRun!("pbj_real_estate_monthly", months.length);
  }

  // Serial buyers (snapshot table)
  const buyers = data.topList ?? [];
  console.log(`  pbj_serial_buyer: ${buyers.length} buyers`);
  if (!DRY_RUN) {
    if (REPLACE) await sql`TRUNCATE pbj_serial_buyer`;
    for (const b of buyers) {
      const buyerType = b.meta?.entity ? "entity" : "person";
      await sql`
        INSERT INTO pbj_serial_buyer
          (buyer_name, buyer_type, deal_count, total_volume_usd, zip_count, last_seen_week)
        VALUES (${b.label}, ${buyerType}, ${b.value},
                ${b.meta?.total_value_usd ?? null}, ${b.meta?.zip_count ?? null}, NULL)
        ON CONFLICT (buyer_name) DO UPDATE SET
          buyer_type        = EXCLUDED.buyer_type,
          deal_count        = EXCLUDED.deal_count,
          total_volume_usd  = EXCLUDED.total_volume_usd,
          zip_count         = EXCLUDED.zip_count,
          ingested_at       = NOW()
      `;
    }
  } else {
    noOpRun!("pbj_serial_buyer", buyers.length);
  }
}

// ── Section: Accountability (distress + lawsuits) ───────────────────────

interface DistressEntity {
  label: string; // entity name (uppercased & normalized)
  value: number; // category count
  meta: { categories: string[] };
}
interface TopLawsuit {
  label: string; // defendant
  value: number; // damages USD (already cents-stripped — value is dollars)
  meta: { plaintiff?: string | null; suit_type?: string | null; date?: string | null };
}
interface AccountabilityJSON {
  distressClusters?: DistressEntity[];
  topLawsuits?: TopLawsuit[];
}

async function syncAccountability() {
  const data = loadJSON<AccountabilityJSON>("pbj_accountability.json");
  if (!data) {
    console.log("  ⚠ pbj_accountability.json missing — skipping accountability");
    return;
  }

  const distress = data.distressClusters ?? [];
  console.log(`  pbj_distress_entity: ${distress.length} entities`);
  if (!DRY_RUN) {
    if (REPLACE) await sql`TRUNCATE pbj_distress_entity`;
    for (const d of distress) {
      await sql`
        INSERT INTO pbj_distress_entity
          (entity_name, categories, category_count, last_seen_week)
        VALUES (${d.label}, ${d.meta?.categories ?? []}, ${d.value}, NULL)
        ON CONFLICT (entity_name) DO UPDATE SET
          categories     = EXCLUDED.categories,
          category_count = EXCLUDED.category_count,
          ingested_at    = NOW()
      `;
    }
  } else {
    noOpRun!("pbj_distress_entity", distress.length);
  }

  const suits = data.topLawsuits ?? [];
  console.log(`  pbj_top_lawsuit: ${suits.length} suits`);
  if (!DRY_RUN) {
    if (REPLACE) await sql`TRUNCATE pbj_top_lawsuit`;
    for (const s of suits) {
      const filedDate = s.meta?.date && /^\d{4}-\d{2}-\d{2}$/.test(s.meta.date) ? s.meta.date : null;
      const caseId = hashCase(s.label, s.meta?.plaintiff ?? null, filedDate, s.value);
      await sql`
        INSERT INTO pbj_top_lawsuit
          (case_id, defendant_name, plaintiff_name, suit_type, damages_usd, filed_date)
        VALUES (${caseId}, ${s.label}, ${s.meta?.plaintiff ?? null},
                ${s.meta?.suit_type ?? null}, ${s.value}, ${filedDate})
        ON CONFLICT (case_id) DO UPDATE SET
          defendant_name = EXCLUDED.defendant_name,
          plaintiff_name = EXCLUDED.plaintiff_name,
          suit_type      = EXCLUDED.suit_type,
          damages_usd    = EXCLUDED.damages_usd,
          filed_date     = EXCLUDED.filed_date,
          ingested_at    = NOW()
      `;
    }
  } else {
    noOpRun!("pbj_top_lawsuit", suits.length);
  }
}

// ── Section: Geography (ZIP investment) ─────────────────────────────────

interface ZipRow {
  zip: string;
  permit_count?: number;
  permit_value_usd?: number;
  re_count?: number;
  re_value_usd?: number;
  biz_count?: number;
  total_investment_usd?: number;
}
interface GeographyJSON {
  topList?: ZipRow[];
}

async function syncZips() {
  const data = loadJSON<GeographyJSON>("pbj_geography.json");
  if (!data?.topList?.length) {
    console.log("  ⚠ pbj_geography.json missing or empty — skipping zips");
    return;
  }
  const zips = data.topList;
  console.log(`  pbj_zip_investment: ${zips.length} ZIPs`);
  if (DRY_RUN) return noOpRun!("pbj_zip_investment", zips.length);
  if (REPLACE) await sql`TRUNCATE pbj_zip_investment`;
  for (const z of zips) {
    await sql`
      INSERT INTO pbj_zip_investment
        (zip_code, permit_count, permit_value_usd, re_deal_count, re_volume_usd,
         new_business_count, total_investment_usd)
      VALUES (${z.zip}, ${z.permit_count ?? 0}, ${z.permit_value_usd ?? 0},
              ${z.re_count ?? 0}, ${z.re_value_usd ?? 0},
              ${z.biz_count ?? 0}, ${z.total_investment_usd ?? 0})
      ON CONFLICT (zip_code) DO UPDATE SET
        permit_count         = EXCLUDED.permit_count,
        permit_value_usd     = EXCLUDED.permit_value_usd,
        re_deal_count        = EXCLUDED.re_deal_count,
        re_volume_usd        = EXCLUDED.re_volume_usd,
        new_business_count   = EXCLUDED.new_business_count,
        total_investment_usd = EXCLUDED.total_investment_usd,
        ingested_at          = NOW()
    `;
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(PBJ_DIR)) {
    console.error(`[pbj-sync] ERROR: source dir not found: ${PBJ_DIR}`);
    process.exit(2);
  }

  await ensureTables();

  const onlyOne = ONLY_BUSINESSES || ONLY_REALESTATE || ONLY_ACCOUNTABILITY || ONLY_ZIPS;

  if (!onlyOne || ONLY_BUSINESSES) {
    console.log("\n━━━ businesses (pbj_business_monthly) ━━━");
    await syncBusinesses();
  }
  if (!onlyOne || ONLY_REALESTATE) {
    console.log("\n━━━ real estate (pbj_real_estate_monthly + pbj_serial_buyer) ━━━");
    await syncRealEstate();
  }
  if (!onlyOne || ONLY_ACCOUNTABILITY) {
    console.log("\n━━━ accountability (pbj_distress_entity + pbj_top_lawsuit) ━━━");
    await syncAccountability();
  }
  if (!onlyOne || ONLY_ZIPS) {
    console.log("\n━━━ geography (pbj_zip_investment) ━━━");
    await syncZips();
  }

  console.log("\n[pbj-sync] done.");
}

main()
  .catch((err) => {
    console.error("[pbj-sync] FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
