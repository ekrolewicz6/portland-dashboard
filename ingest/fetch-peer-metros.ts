/**
 * fetch-peer-metros.ts
 *
 * Pulls economic indicators for Portland + 6 peer metros from BLS and
 * Census APIs and seeds them into Postgres for empirical scoring.
 *
 * Indicators (all from public APIs, no key needed):
 *   1. LAUS unemployment rate (monthly, ~10y back)        — BLS API v1
 *   2. QCEW total establishments + employment (quarterly) — BLS QCEW CSV API
 *   3. Census BFS business applications (quarterly)        — Census API
 *
 * Tables (CREATE IF NOT EXISTS — script self-bootstraps):
 *   metro_metadata, metro_unemployment_monthly,
 *   metro_employment_quarterly, metro_business_formation_quarterly
 *
 * Usage:
 *   cd civic-dashboard && set -a && source .env.local && set +a
 *   npx tsx ingest/fetch-peer-metros.ts
 *   npx tsx ingest/fetch-peer-metros.ts --laus-only
 *   npx tsx ingest/fetch-peer-metros.ts --qcew-only
 *   npx tsx ingest/fetch-peer-metros.ts --bfs-only
 *   npx tsx ingest/fetch-peer-metros.ts --years 2015 2026
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

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

const ONLY_LAUS = flag("--laus-only");
const ONLY_QCEW = flag("--qcew-only");
const ONLY_BFS = flag("--bfs-only");

const yearsIdx = args.indexOf("--years");
const startYear =
  yearsIdx >= 0 && args[yearsIdx + 1] ? Number(args[yearsIdx + 1]) : 2015;
const endYear =
  yearsIdx >= 0 && args[yearsIdx + 2] ? Number(args[yearsIdx + 2]) : new Date().getFullYear();

console.log(`[peer-metros] year range: ${startYear}-${endYear}`);

// ── Metro definitions ───────────────────────────────────────────────────
//
// LAUS series ID format: LAUMT{state2}{area5}0000000{measure2}
//   measure 03 = unemployment rate
// QCEW area code format: C{first 4 digits of MSA code}
// Population figures are 2024 Census estimates (roughly; used only for
// per-capita normalization labels — not load-bearing).

interface MetroDef {
  metroCode: string;       // BLS/Census MSA code
  metroName: string;
  shortName: string;
  stateFips: string;
  lausSeriesId: string;
  qcewAreaCode: string;
  isPortland: boolean;
  population: number;
  displayOrder: number;
}

const METROS: MetroDef[] = [
  {
    metroCode: "38900",
    metroName: "Portland-Vancouver-Hillsboro, OR-WA",
    shortName: "Portland",
    stateFips: "41",
    lausSeriesId: "LAUMT413890000000003",
    qcewAreaCode: "C3890",
    isPortland: true,
    population: 2_511_612,
    displayOrder: 0,
  },
  {
    metroCode: "42660",
    metroName: "Seattle-Tacoma-Bellevue, WA",
    shortName: "Seattle",
    stateFips: "53",
    lausSeriesId: "LAUMT534266000000003",
    qcewAreaCode: "C4266",
    isPortland: false,
    population: 4_080_000,
    displayOrder: 1,
  },
  {
    metroCode: "19740",
    metroName: "Denver-Aurora-Lakewood, CO",
    shortName: "Denver",
    stateFips: "08",
    lausSeriesId: "LAUMT081974000000003",
    qcewAreaCode: "C1974",
    isPortland: false,
    population: 3_005_131,
    displayOrder: 2,
  },
  {
    metroCode: "12420",
    metroName: "Austin-Round Rock-Georgetown, TX",
    shortName: "Austin",
    stateFips: "48",
    lausSeriesId: "LAUMT481242000000003",
    qcewAreaCode: "C1242",
    isPortland: false,
    population: 2_473_275,
    displayOrder: 3,
  },
  {
    metroCode: "41860",
    metroName: "San Francisco-Oakland-Berkeley, CA",
    shortName: "San Francisco",
    stateFips: "06",
    lausSeriesId: "LAUMT064186000000003",
    qcewAreaCode: "C4186",
    isPortland: false,
    population: 4_566_961,
    displayOrder: 4,
  },
  {
    metroCode: "33460",
    metroName: "Minneapolis-St. Paul-Bloomington, MN-WI",
    shortName: "Minneapolis",
    stateFips: "27",
    lausSeriesId: "LAUMT273346000000003",
    qcewAreaCode: "C3346",
    isPortland: false,
    population: 3_690_512,
    displayOrder: 5,
  },
  {
    metroCode: "38060",
    metroName: "Phoenix-Mesa-Chandler, AZ",
    shortName: "Phoenix",
    stateFips: "04",
    lausSeriesId: "LAUMT043806000000003",
    qcewAreaCode: "C3806",
    isPortland: false,
    population: 5_070_110,
    displayOrder: 6,
  },
];

const SERIES_TO_METRO: Map<string, string> = new Map(
  METROS.map((m) => [m.lausSeriesId, m.metroCode]),
);

// ── Schema bootstrap ────────────────────────────────────────────────────

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS metro_metadata (
      metro_code      TEXT PRIMARY KEY,
      metro_name      TEXT NOT NULL,
      short_name      TEXT NOT NULL,
      state_fips      TEXT NOT NULL,
      laus_series_id  TEXT,
      qcew_area_code  TEXT,
      is_portland     BOOLEAN DEFAULT FALSE,
      population      INTEGER,
      display_order   INTEGER
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_unemployment_monthly (
      metro_code  TEXT NOT NULL,
      year        INTEGER NOT NULL,
      month       INTEGER NOT NULL,
      rate        NUMERIC(5,2) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year, month)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_employment_quarterly (
      metro_code      TEXT NOT NULL,
      year            INTEGER NOT NULL,
      quarter         INTEGER NOT NULL,
      establishments  INTEGER,
      employment      INTEGER,
      avg_weekly_wage INTEGER,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year, quarter)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_business_formation_quarterly (
      metro_code                  TEXT NOT NULL,
      year                        INTEGER NOT NULL,
      quarter                     INTEGER NOT NULL,
      applications_total          INTEGER,
      applications_high_propensity INTEGER,
      created_at                  TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year, quarter)
    )
  `;
}

async function seedMetadata() {
  for (const m of METROS) {
    await sql`
      INSERT INTO metro_metadata
        (metro_code, metro_name, short_name, state_fips, laus_series_id, qcew_area_code,
         is_portland, population, display_order)
      VALUES (${m.metroCode}, ${m.metroName}, ${m.shortName}, ${m.stateFips},
              ${m.lausSeriesId}, ${m.qcewAreaCode}, ${m.isPortland}, ${m.population},
              ${m.displayOrder})
      ON CONFLICT (metro_code) DO UPDATE SET
        metro_name = EXCLUDED.metro_name,
        short_name = EXCLUDED.short_name,
        state_fips = EXCLUDED.state_fips,
        laus_series_id = EXCLUDED.laus_series_id,
        qcew_area_code = EXCLUDED.qcew_area_code,
        is_portland = EXCLUDED.is_portland,
        population = EXCLUDED.population,
        display_order = EXCLUDED.display_order
    `;
  }
  console.log(`  metro_metadata: ${METROS.length} metros upserted`);
}

// ── 1. LAUS unemployment (BLS API v1) ───────────────────────────────────

interface BLSDataPoint {
  year: string;
  period: string; // "M01"…"M12"
  value: string;
}

const BLS_API_URL = "https://api.bls.gov/publicAPI/v1/timeseries/data/";
// API v1: max 25 req/day, max 10 series/req, max 10 years/req.
// 7 metros × 10 years = 1 request. Easy.

async function fetchLausChunk(seriesIds: string[], y0: number, y1: number) {
  const body = JSON.stringify({
    seriesid: seriesIds,
    startyear: String(y0),
    endyear: String(y1),
  });
  const res = await fetch(BLS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) throw new Error(`BLS HTTP ${res.status}`);
  const json = (await res.json()) as {
    status?: string;
    message?: string[];
    Results?: { series?: { seriesID: string; data: BLSDataPoint[] }[] };
  };
  if (json.status !== "REQUEST_SUCCEEDED") {
    console.warn(`  BLS status=${json.status} msg=${(json.message ?? []).join(" / ")}`);
  }
  return json.Results?.series ?? [];
}

async function syncLaus() {
  console.log("\n━━━ 1. LAUS unemployment (monthly, 7 metros) ━━━");
  const seriesIds = METROS.map((m) => m.lausSeriesId);

  // Chunk by 10-year windows to respect BLS v1 limit.
  let totalInserted = 0;
  for (let y0 = startYear; y0 <= endYear; y0 += 10) {
    const y1 = Math.min(y0 + 9, endYear);
    console.log(`  fetching ${y0}-${y1}…`);
    const seriesResults = await fetchLausChunk(seriesIds, y0, y1);
    for (const s of seriesResults) {
      const metroCode = SERIES_TO_METRO.get(s.seriesID);
      if (!metroCode) continue;
      for (const d of s.data) {
        if (!/^M\d{2}$/.test(d.period)) continue; // skip annual averages
        const month = Number(d.period.slice(1));
        const rate = Number(d.value);
        if (!Number.isFinite(rate)) continue;
        await sql`
          INSERT INTO metro_unemployment_monthly (metro_code, year, month, rate)
          VALUES (${metroCode}, ${Number(d.year)}, ${month}, ${rate})
          ON CONFLICT (metro_code, year, month) DO UPDATE SET rate = EXCLUDED.rate
        `;
        totalInserted++;
      }
    }
    // Polite pause if doing multiple chunks.
    if (y1 < endYear) await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(`  inserted/updated ${totalInserted} rows`);
}

// ── 2. QCEW employment (BLS CSV API per metro/year/quarter) ─────────────

interface QcewRow {
  establishments: number;
  employment: number; // month3
  avgWeeklyWage: number;
}

async function fetchQcewMetroQtr(
  areaCode: string,
  year: number,
  quarter: number,
): Promise<QcewRow | null> {
  const url = `https://data.bls.gov/cew/data/api/${year}/${quarter}/area/${areaCode}.csv`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.split("\n");
    if (lines.length < 2) return null;

    const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const idx = (k: string) => header.indexOf(k);

    // We want industry_code = "10" (Total, all industries) AND own_code = "5" (private + gov)
    // Match seed-economy-data.ts heuristic: prefer industry_code "10" rows.
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      const ind = row[idx("industry_code")];
      const own = row[idx("own_code")];
      // industry "10" with ownership total ("0") = total all sectors
      if (ind === "10" && (own === "0" || own === "5")) {
        const establishments = Number(row[idx("qtrly_estabs")]) || 0;
        const employment = Number(row[idx("month3_emplvl")]) || 0;
        const avgWeeklyWage = Number(row[idx("avg_wkly_wage")]) || 0;
        if (establishments > 0) return { establishments, employment, avgWeeklyWage };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function syncQcew() {
  console.log("\n━━━ 2. QCEW employment (quarterly, 7 metros) ━━━");
  let total = 0;
  for (const m of METROS) {
    let metroRows = 0;
    for (let year = startYear; year <= endYear; year++) {
      for (let qtr = 1; qtr <= 4; qtr++) {
        const row = await fetchQcewMetroQtr(m.qcewAreaCode, year, qtr);
        if (!row) continue;
        await sql`
          INSERT INTO metro_employment_quarterly
            (metro_code, year, quarter, establishments, employment, avg_weekly_wage)
          VALUES (${m.metroCode}, ${year}, ${qtr}, ${row.establishments},
                  ${row.employment}, ${row.avgWeeklyWage})
          ON CONFLICT (metro_code, year, quarter) DO UPDATE SET
            establishments = EXCLUDED.establishments,
            employment = EXCLUDED.employment,
            avg_weekly_wage = EXCLUDED.avg_weekly_wage
        `;
        metroRows++;
        total++;
        // Polite delay between BLS hits.
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    console.log(`  ${m.shortName} (${m.qcewAreaCode}): ${metroRows} quarters`);
  }
  console.log(`  inserted/updated ${total} rows`);
}

// ── 3. Census BFS (Business Formation Statistics) ───────────────────────
//
// The Census BFS API exposes weekly + quarterly applications keyed by MSA.
// API: https://api.census.gov/data/timeseries/bfs?get=BA_BA,BA_HBA&for=metropolitan+statistical+area:38900&time=from+2015-Q1
// BA_BA = Business Applications (quarterly, NSA)
// BA_HBA = High-Propensity Business Applications

async function syncBfs() {
  console.log("\n━━━ 3. Census BFS business formation (quarterly, 7 metros) ━━━");
  let total = 0;
  for (const m of METROS) {
    // Pull all quarters in one URL
    const url =
      `https://api.census.gov/data/timeseries/bfs` +
      `?get=BA_BA,BA_HBA,YEAR,QUARTER` +
      `&for=metropolitan+statistical+area:${m.metroCode}` +
      `&time=from+${startYear}+to+${endYear}` +
      `&seasonally+adj=no`;
    let rows = 0;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  ${m.shortName}: HTTP ${res.status} — skipping`);
        continue;
      }
      const data = (await res.json()) as string[][];
      // First row is header
      if (!Array.isArray(data) || data.length < 2) continue;
      const header = data[0];
      const iBA = header.indexOf("BA_BA");
      const iHBA = header.indexOf("BA_HBA");
      const iYear = header.indexOf("YEAR");
      const iQtr = header.indexOf("QUARTER");
      // BFS sometimes returns quarters as "Q1" or "1" — normalize
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const ba = Number(row[iBA]);
        const hba = Number(row[iHBA]);
        const year = Number(row[iYear]);
        const qStr = String(row[iQtr]);
        const quarter = Number(qStr.replace(/[^0-9]/g, ""));
        if (!quarter || !year) continue;
        await sql`
          INSERT INTO metro_business_formation_quarterly
            (metro_code, year, quarter, applications_total, applications_high_propensity)
          VALUES (${m.metroCode}, ${year}, ${quarter},
                  ${Number.isFinite(ba) ? ba : null},
                  ${Number.isFinite(hba) ? hba : null})
          ON CONFLICT (metro_code, year, quarter) DO UPDATE SET
            applications_total = EXCLUDED.applications_total,
            applications_high_propensity = EXCLUDED.applications_high_propensity
        `;
        rows++;
      }
    } catch (err) {
      console.log(`  ${m.shortName}: error ${(err as Error).message}`);
      continue;
    }
    console.log(`  ${m.shortName}: ${rows} quarters`);
    total += rows;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`  inserted/updated ${total} rows`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  await ensureTables();
  await seedMetadata();

  const onlyOne = ONLY_LAUS || ONLY_QCEW || ONLY_BFS;
  if (!onlyOne || ONLY_LAUS) await syncLaus();
  if (!onlyOne || ONLY_QCEW) await syncQcew();
  if (!onlyOne || ONLY_BFS) await syncBfs();

  console.log("\n[peer-metros] done.");
}

main()
  .catch((err) => {
    console.error("[peer-metros] FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
