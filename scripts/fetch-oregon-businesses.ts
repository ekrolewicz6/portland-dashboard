/**
 * fetch-oregon-businesses.ts
 *
 * Fetches REAL business data from Oregon Secretary of State's open data portal.
 * Replaces dead CivicApps API with verified Socrata endpoints:
 *
 *   1. Active Businesses:  https://data.oregon.gov/resource/tckn-sxa6.json
 *      - 362,714+ Portland businesses (city='PORTLAND')
 *
 *   2. New Businesses:     https://data.oregon.gov/resource/esjy-u4fc.json
 *      - Recent month registrations (city='PORTLAND')
 *
 * Usage: npx tsx scripts/fetch-oregon-businesses.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

const ACTIVE_BASE = "https://data.oregon.gov/resource/tckn-sxa6.json";
const NEW_BASE = "https://data.oregon.gov/resource/esjy-u4fc.json";

// ── Helpers ────────────────────────────────────────────────────────────

function socrataUrl(base: string, params: Record<string, string>): string {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${base}?${qs}`;
}

async function socrataFetch<T = unknown>(
  base: string,
  params: Record<string, string>,
  label: string
): Promise<T> {
  const url = socrataUrl(base, params);
  console.log(`  [FETCH] ${label}`);
  console.log(`    URL: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${label}: ${await res.text()}`);
  }
  const data = await res.json();
  return data as T;
}

// ── Types ──────────────────────────────────────────────────────────────

interface ActiveBusiness {
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  associated_name_type: string;
  address?: string;
  city: string;
  state: string;
  zip: string;
  jurisdiction?: string;
  first_name?: string;
  last_name?: string;
  entity_of_record_reg_number?: string;
  entity_of_record_name?: string;
  business_details?: { url: string };
  [key: string]: unknown;
}

interface NewBusiness {
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  associated_name_type: string;
  address_?: string;
  city: string;
  state: string;
  zip_code: string;
  first_name?: string;
  last_name?: string;
  entity_of_record_reg_number?: string;
  entity_of_record_name?: string;
  [key: string]: unknown;
}

interface YearCount {
  year: string;
  cnt: string;
}

interface EntityCount {
  entity_type: string;
  cnt: string;
}

// ── Step 1: Sample records ────────────────────────────────────────────

async function fetchSample(): Promise<void> {
  console.log("\n=== Step 1: Sample records (discover field names) ===");
  const sample = await socrataFetch<ActiveBusiness[]>(ACTIVE_BASE, {
    $where: "city='PORTLAND'",
    $limit: "3",
  }, "Sample active businesses");

  console.log(`  Fields: ${Object.keys(sample[0]).join(", ")}`);
  console.log(`  Sample: ${sample[0].business_name} (${sample[0].entity_type})`);
}

// ── Step 2: Total count ───────────────────────────────────────────────

async function fetchTotalCount(): Promise<number> {
  console.log("\n=== Step 2: Total Portland businesses ===");
  const result = await socrataFetch<[{ total: string }]>(ACTIVE_BASE, {
    $where: "city='PORTLAND'",
    $select: "count(*) as total",
  }, "Total count");

  const total = parseInt(result[0].total, 10);
  console.log(`  Total: ${total.toLocaleString()}`);
  return total;
}

// ── Step 3: Registration counts by year ───────────────────────────────

async function fetchByYear(): Promise<YearCount[]> {
  console.log("\n=== Step 3: Registrations by year (2000+) ===");
  const result = await socrataFetch<YearCount[]>(ACTIVE_BASE, {
    $where: "city='PORTLAND' AND registry_date>='2000-01-01T00:00:00'",
    $select: "date_trunc_y(registry_date) as year,count(*) as cnt",
    $group: "date_trunc_y(registry_date)",
    $order: "year",
  }, "Yearly registration counts");

  for (const r of result) {
    const yr = r.year.slice(0, 4);
    console.log(`  ${yr}: ${parseInt(r.cnt, 10).toLocaleString()}`);
  }
  return result;
}

// ── Step 4: Breakdown by entity type ──────────────────────────────────

async function fetchByEntityType(): Promise<EntityCount[]> {
  console.log("\n=== Step 4: Entity type breakdown ===");
  const result = await socrataFetch<EntityCount[]>(ACTIVE_BASE, {
    $where: "city='PORTLAND'",
    $select: "entity_type,count(*) as cnt",
    $group: "entity_type",
    $order: "cnt DESC",
  }, "Entity type breakdown");

  for (const r of result.slice(0, 10)) {
    console.log(`  ${r.entity_type}: ${parseInt(r.cnt, 10).toLocaleString()}`);
  }
  return result;
}

// ── Step 5: New businesses last month ─────────────────────────────────

async function fetchNewBusinesses(): Promise<NewBusiness[]> {
  console.log("\n=== Step 5: New businesses (last month dataset) ===");

  // Get total count first
  const countResult = await socrataFetch<[{ total: string }]>(NEW_BASE, {
    $where: "city='PORTLAND'",
    $select: "count(*) as total",
  }, "New business count");
  const total = parseInt(countResult[0].total, 10);
  console.log(`  Total new Portland businesses in dataset: ${total.toLocaleString()}`);

  // Fetch in pages of 5000 (Socrata default max is 50000)
  const allRecords: NewBusiness[] = [];
  const pageSize = 5000;
  let offset = 0;

  while (offset < total) {
    const page = await socrataFetch<NewBusiness[]>(NEW_BASE, {
      $where: "city='PORTLAND'",
      $limit: String(pageSize),
      $offset: String(offset),
      $order: "registry_date DESC",
    }, `New businesses page (offset ${offset})`);

    if (page.length === 0) break;
    allRecords.push(...page);
    offset += page.length;
    console.log(`  Fetched ${allRecords.length} / ${total}`);
    if (page.length < pageSize) break;
  }

  console.log(`  Total fetched: ${allRecords.length}`);
  return allRecords;
}

// ── Step 6: Save to JSON & PostgreSQL ─────────────────────────────────

async function saveAll(
  totalCount: number,
  byYear: YearCount[],
  byEntityType: EntityCount[],
  newBiz: NewBusiness[]
) {
  console.log("\n=== Step 6: Save results ===");

  // -- JSON files --
  const summary = {
    fetchDate: new Date().toISOString(),
    source: "Oregon Secretary of State via data.oregon.gov",
    activeDataset: "tckn-sxa6",
    newDataset: "esjy-u4fc",
    totalActivePortlandBusinesses: totalCount,
    registrationsByYear: byYear.map((r) => ({
      year: parseInt(r.year.slice(0, 4), 10),
      count: parseInt(r.cnt, 10),
    })),
    entityTypeBreakdown: byEntityType.map((r) => ({
      entityType: r.entity_type,
      count: parseInt(r.cnt, 10),
    })),
  };

  const summaryPath = path.join(DATA_DIR, "oregon-businesses-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`  Saved ${summaryPath}`);

  // Deduplicate new businesses by registry_number (keep first/most-relevant row)
  const seenReg = new Set<string>();
  const uniqueNew: NewBusiness[] = [];
  for (const b of newBiz) {
    if (!seenReg.has(b.registry_number)) {
      seenReg.add(b.registry_number);
      uniqueNew.push(b);
    }
  }

  const newBizPath = path.join(DATA_DIR, "oregon-new-businesses.json");
  fs.writeFileSync(newBizPath, JSON.stringify({
    fetchDate: new Date().toISOString(),
    source: "Oregon Secretary of State — New Registrations (esjy-u4fc)",
    totalRecords: newBiz.length,
    uniqueBusinesses: uniqueNew.length,
    businesses: uniqueNew,
  }, null, 2));
  console.log(`  Saved ${newBizPath} (${uniqueNew.length} unique businesses)`);

  // -- PostgreSQL --
  console.log("\n=== Inserting into PostgreSQL ===");

  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS business`);

    // ── oregon_sos_active: aggregated stats about active businesses ──
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_sos_active (
        id              SERIAL PRIMARY KEY,
        registry_number TEXT NOT NULL,
        business_name   TEXT,
        entity_type     TEXT,
        registry_date   DATE,
        address         TEXT,
        city            TEXT,
        state           TEXT,
        zip             TEXT,
        jurisdiction    TEXT,
        raw_data        JSONB,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (registry_number)
      )
    `);

    // ── oregon_sos_yearly: year-by-year registration counts ──
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_sos_yearly (
        year       INTEGER PRIMARY KEY,
        reg_count  INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── oregon_sos_entity_types: breakdown by entity type ──
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_sos_entity_types (
        entity_type TEXT PRIMARY KEY,
        count       INTEGER NOT NULL,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── oregon_sos_new_monthly: new registrations ──
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_sos_new_monthly (
        id              SERIAL PRIMARY KEY,
        registry_number TEXT NOT NULL,
        business_name   TEXT,
        entity_type     TEXT,
        registry_date   DATE,
        address         TEXT,
        city            TEXT,
        state           TEXT,
        zip             TEXT,
        raw_data        JSONB,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (registry_number)
      )
    `);

    // ── Insert yearly counts ──
    await sql.unsafe(`TRUNCATE business.oregon_sos_yearly`);
    console.log(`  Inserting ${byYear.length} yearly counts...`);
    for (const r of byYear) {
      const yr = parseInt(r.year.slice(0, 4), 10);
      const cnt = parseInt(r.cnt, 10);
      await sql`
        INSERT INTO business.oregon_sos_yearly (year, reg_count, updated_at)
        VALUES (${yr}, ${cnt}, now())
        ON CONFLICT (year) DO UPDATE SET reg_count = ${cnt}, updated_at = now()
      `;
    }
    console.log(`    Done: ${byYear.length} rows`);

    // ── Insert entity type breakdown ──
    await sql.unsafe(`TRUNCATE business.oregon_sos_entity_types`);
    console.log(`  Inserting ${byEntityType.length} entity types...`);
    for (const r of byEntityType) {
      const cnt = parseInt(r.cnt, 10);
      await sql`
        INSERT INTO business.oregon_sos_entity_types (entity_type, count, updated_at)
        VALUES (${r.entity_type}, ${cnt}, now())
        ON CONFLICT (entity_type) DO UPDATE SET count = ${cnt}, updated_at = now()
      `;
    }
    console.log(`    Done: ${byEntityType.length} rows`);

    // ── Insert new monthly businesses (deduplicated) ──
    await sql.unsafe(`TRUNCATE business.oregon_sos_new_monthly RESTART IDENTITY`);
    console.log(`  Inserting ${uniqueNew.length} new businesses...`);
    let newCount = 0;
    // Batch insert for performance
    const batchSize = 100;
    for (let i = 0; i < uniqueNew.length; i += batchSize) {
      const batch = uniqueNew.slice(i, i + batchSize);
      for (const b of batch) {
        try {
          await sql`
            INSERT INTO business.oregon_sos_new_monthly
              (registry_number, business_name, entity_type, registry_date, address, city, state, zip, raw_data)
            VALUES (
              ${b.registry_number},
              ${b.business_name ?? null},
              ${b.entity_type ?? null},
              ${b.registry_date ? b.registry_date.slice(0, 10) : null}::date,
              ${b.address_ ?? null},
              ${b.city ?? null},
              ${b.state ?? null},
              ${b.zip_code ?? null},
              ${sql.json(b)}
            )
            ON CONFLICT (registry_number) DO NOTHING
          `;
          newCount++;
        } catch {
          // skip dupes
        }
      }
      if ((i + batchSize) % 1000 === 0 || i + batchSize >= uniqueNew.length) {
        console.log(`    Progress: ${Math.min(i + batchSize, uniqueNew.length)} / ${uniqueNew.length}`);
      }
    }
    console.log(`    Inserted ${newCount} new business records`);

    // ── Store total count in a lightweight stats row ──
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_sos_stats (
        key        TEXT PRIMARY KEY,
        value      BIGINT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await sql`
      INSERT INTO business.oregon_sos_stats (key, value, updated_at)
      VALUES ('total_portland_active', ${totalCount}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${totalCount}, updated_at = now()
    `;
    await sql`
      INSERT INTO business.oregon_sos_stats (key, value, updated_at)
      VALUES ('new_monthly_count', ${uniqueNew.length}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${uniqueNew.length}, updated_at = now()
    `;
    console.log(`  Stored stats: total_portland_active=${totalCount}, new_monthly_count=${uniqueNew.length}`);

    // ── Step 7: Update dashboard_cache ──
    console.log("\n=== Step 7: Update dashboard_cache ===");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.dashboard_cache (
        question TEXT PRIMARY KEY,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    const recentYears = byYear
      .map((r) => ({ year: parseInt(r.year.slice(0, 4), 10), count: parseInt(r.cnt, 10) }))
      .filter((r) => r.year >= 2015);

    // Calculate trend from most recent full years
    const sortedYears = recentYears.sort((a, b) => b.year - a.year);
    const latestFullYear = sortedYears.find((r) => r.year === 2025) ?? sortedYears[0];
    const previousYear = sortedYears.find((r) => r.year === (latestFullYear.year - 1));

    let trendDir: "up" | "down" | "flat" = "flat";
    let trendPct = 0;
    if (latestFullYear && previousYear) {
      trendPct = ((latestFullYear.count - previousYear.count) / previousYear.count) * 100;
      trendDir = trendPct > 1 ? "up" : trendPct < -1 ? "down" : "flat";
    }

    // Entity breakdown for top types
    const topTypes = byEntityType.slice(0, 8).map((r) => ({
      type: r.entity_type,
      count: parseInt(r.cnt, 10),
    }));

    const cacheData = {
      data_available: true,
      source: "Oregon Secretary of State (data.oregon.gov)",
      datasets: { active: "tckn-sxa6", new_monthly: "esjy-u4fc" },
      total_active_portland: totalCount,
      new_monthly_count: uniqueNew.length,
      registrations_by_year: recentYears,
      entity_type_breakdown: topTypes,
      trend: { direction: trendDir, percentage: Math.round(Math.abs(trendPct) * 10) / 10 },
      fetch_date: new Date().toISOString().slice(0, 10),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('oregon_sos_business', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(cacheData)}, updated_at = now()
    `;

    // Also update the generic business_real_data cache key used by existing code
    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('business_real_data', ${sql.json({
        ...cacheData,
        oregon_businesses_count: totalCount,
        oregon_new_monthly_count: uniqueNew.length,
      })}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json({
        ...cacheData,
        oregon_businesses_count: totalCount,
        oregon_new_monthly_count: uniqueNew.length,
      })}, updated_at = now()
    `;
    console.log("  Updated dashboard_cache: oregon_sos_business + business_real_data");

    // ── Verify ──
    console.log("\n=== Verification ===");
    const tables = [
      "business.oregon_sos_yearly",
      "business.oregon_sos_entity_types",
      "business.oregon_sos_new_monthly",
      "business.oregon_sos_stats",
    ];
    for (const t of tables) {
      try {
        const result = await sql.unsafe(`SELECT count(*)::int as cnt FROM ${t}`);
        console.log(`  ${t}: ${result[0].cnt} rows`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  ${t}: error — ${msg}`);
      }
    }

    await sql.end();
  } catch (err) {
    console.error("  DB error:", err);
    await sql.end();
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Oregon SOS Business Data Fetcher");
  console.log("=====================================================");
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Database: ${DB_URL}`);
  console.log(`Active businesses endpoint: ${ACTIVE_BASE}`);
  console.log(`New businesses endpoint: ${NEW_BASE}`);

  // Steps 1-5
  await fetchSample();
  const totalCount = await fetchTotalCount();
  const byYear = await fetchByYear();
  const byEntityType = await fetchByEntityType();
  const newBiz = await fetchNewBusinesses();

  // Steps 6-7
  await saveAll(totalCount, byYear, byEntityType, newBiz);

  console.log("\n=== Summary ===");
  console.log(`  Total active Portland businesses: ${totalCount.toLocaleString()}`);
  console.log(`  Year-over-year data points:       ${byYear.length}`);
  console.log(`  Entity types:                     ${byEntityType.length}`);
  console.log(`  New monthly registrations:         ${newBiz.length} rows`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
