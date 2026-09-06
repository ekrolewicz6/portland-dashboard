/**
 * fetch-peer-metros-extended.ts
 *
 * Three additional peer-metro indicators for the Economic Health composite:
 *
 *   1. Census BFS — annual business applications by COUNTY, rolled up to
 *      MSA. Source: https://www.census.gov/econ/bfs/xlsx/bfs_county_apps_annual.xlsx
 *      (no API exposes metro-level, so we aggregate counties → MSA via a
 *      hard-coded county→MSA map for the 7 peer metros).
 *
 *   2. Census ACS 1-year — annual labor force participation rate (B23025)
 *      and median household income (B19013) per MSA. Census Data API,
 *      no key required for ACS. Latest year published is 2023.
 *
 *   3. Zillow ZHVI — monthly typical home value per MSA (smoothed, SA, all
 *      homes tier). Free CSV at files.zillowstatic.com.
 *
 * Tables created (CREATE IF NOT EXISTS — script self-bootstraps):
 *   metro_business_applications_annual
 *   metro_acs_annual
 *   metro_zhvi_monthly
 *
 * Usage:
 *   cd civic-dashboard && set -a && source .env.local && set +a
 *   npx tsx ingest/fetch-peer-metros-extended.ts
 *   npx tsx ingest/fetch-peer-metros-extended.ts --bfs-only
 *   npx tsx ingest/fetch-peer-metros-extended.ts --acs-only
 *   npx tsx ingest/fetch-peer-metros-extended.ts --zhvi-only
 *   npx tsx ingest/fetch-peer-metros-extended.ts --years 2018 2024
 */

import postgres from "postgres";
import * as XLSX from "xlsx";
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

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const ONLY_BFS = flag("--bfs-only");
const ONLY_ACS = flag("--acs-only");
const ONLY_ZHVI = flag("--zhvi-only");
const ONLY_BEA = flag("--bea-only");
const yi = args.indexOf("--years");
const startYear = yi >= 0 && args[yi + 1] ? Number(args[yi + 1]) : 2010;
const endYear = yi >= 0 && args[yi + 2] ? Number(args[yi + 2]) : new Date().getFullYear();
const BEA_API_KEY = process.env.BEA_API_KEY ?? "";

// 7 peer MSAs, with constituent county FIPS for BFS roll-up.
// Census MSA delineations are stable; verified against OMB Bulletin 23-01.
interface MetroDef {
  metroCode: string;
  shortName: string;
  countyFips: string[];
}

const METROS: MetroDef[] = [
  {
    metroCode: "38900",
    shortName: "Portland",
    // OR: Multnomah, Clackamas, Washington, Yamhill, Columbia, Hood River
    // WA: Clark, Skamania
    countyFips: ["41051", "41005", "41067", "41071", "41009", "41027", "53011", "53059"],
  },
  {
    metroCode: "42660",
    shortName: "Seattle",
    // WA: King, Pierce, Snohomish
    countyFips: ["53033", "53053", "53061"],
  },
  {
    metroCode: "19740",
    shortName: "Denver",
    // CO: Denver, Adams, Arapahoe, Broomfield, Clear Creek, Douglas, Elbert, Gilpin, Jefferson, Park
    countyFips: [
      "08031", "08001", "08005", "08014", "08019",
      "08035", "08039", "08047", "08059", "08093",
    ],
  },
  {
    metroCode: "12420",
    shortName: "Austin",
    // TX: Travis, Williamson, Hays, Bastrop, Caldwell
    countyFips: ["48453", "48491", "48209", "48021", "48055"],
  },
  {
    metroCode: "41860",
    shortName: "San Francisco",
    // CA: San Francisco, Alameda, Contra Costa, Marin, San Mateo
    countyFips: ["06075", "06001", "06013", "06041", "06081"],
  },
  {
    metroCode: "33460",
    shortName: "Minneapolis",
    // MN: Hennepin, Ramsey, Anoka, Carver, Chisago, Dakota, Isanti, Le Sueur,
    //     Mille Lacs, Scott, Sherburne, Sibley, Washington, Wright
    // WI: Pierce, St. Croix
    countyFips: [
      "27053", "27123", "27003", "27019", "27025", "27037",
      "27059", "27079", "27095", "27139", "27141", "27143",
      "27163", "27171", "55093", "55109",
    ],
  },
  {
    metroCode: "38060",
    shortName: "Phoenix",
    // AZ: Maricopa, Pinal
    countyFips: ["04013", "04021"],
  },
];

const ALL_METRO_CODES = METROS.map((m) => m.metroCode);

// Build reverse map: county FIPS → MSA code (for BFS roll-up)
const COUNTY_TO_METRO: Map<string, string> = new Map();
for (const m of METROS) {
  for (const fips of m.countyFips) COUNTY_TO_METRO.set(fips, m.metroCode);
}

// ── Schema bootstrap ────────────────────────────────────────────────────

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS metro_business_applications_annual (
      metro_code           TEXT NOT NULL,
      year                 INTEGER NOT NULL,
      applications_total   INTEGER NOT NULL,
      counties_included    INTEGER NOT NULL,
      created_at           TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_acs_annual (
      metro_code             TEXT NOT NULL,
      year                   INTEGER NOT NULL,
      population_16_plus     INTEGER,
      labor_force            INTEGER,
      unemployed_acs         INTEGER,
      median_household_income INTEGER,
      lfp_rate               NUMERIC(5,2),
      created_at             TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_personal_income_annual (
      metro_code               TEXT NOT NULL,
      year                     INTEGER NOT NULL,
      personal_income_thousands NUMERIC(18,0),
      population               INTEGER,
      per_capita_income        INTEGER,
      counties_included        INTEGER,
      created_at               TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS metro_zhvi_monthly (
      metro_code  TEXT NOT NULL,
      year        INTEGER NOT NULL,
      month       INTEGER NOT NULL,
      zhvi        NUMERIC(12,2),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (metro_code, year, month)
    )
  `;
}

// ── 1. Census BFS county roll-up ────────────────────────────────────────

async function syncBfsCounty() {
  console.log("\n━━━ 1. Census BFS county → MSA (annual business applications) ━━━");
  const url = "https://www.census.gov/econ/bfs/xlsx/bfs_county_apps_annual.xlsx";
  console.log(`  fetching ${url}…`);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.error(`  HTTP ${res.status} — abort`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });

  // BFS workbook structure (verified):
  //   row 0: title  "County Level Business Applications"
  //   row 1: DRB disclosure note
  //   row 2: header — State | County | County Code | state_fips | county_fips | BA2005 | BA2006 | ... | BA2024
  //   rows 3+: data
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"]!);
  const headerRow = 2;
  const cell = (r: number, c: number) => {
    const cv = sheet[XLSX.utils.encode_cell({ r, c })];
    return cv ? cv.v : null;
  };
  const header: string[] = [];
  for (let c = 0; c <= range.e.c; c++) {
    header.push(String(cell(headerRow, c) ?? ""));
  }
  const iCountyCode = header.findIndex((h) => /county[_\s]?code/i.test(h));
  // BA{year} columns
  const yearCols: { col: number; year: number }[] = [];
  for (let c = 0; c < header.length; c++) {
    const m = /^BA\s*(\d{4})$/i.exec(header[c]);
    if (m) yearCols.push({ col: c, year: Number(m[1]) });
  }
  if (iCountyCode < 0 || yearCols.length === 0) {
    console.error(`  could not infer columns — county_code=${iCountyCode} years=${yearCols.length}`);
    return;
  }
  console.log(`  county FIPS col=${iCountyCode}, year cols=${yearCols.length} (${yearCols[0].year}–${yearCols[yearCols.length-1].year})`);

  // Aggregate to MSA × year
  const agg: Map<string, { total: number; counties: Set<string> }> = new Map();
  let countyRowsScanned = 0;
  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const fipsRaw = cell(r, iCountyCode);
    if (fipsRaw === null) continue;
    countyRowsScanned++;
    const fips = String(fipsRaw).padStart(5, "0").slice(0, 5);
    const metroCode = COUNTY_TO_METRO.get(fips);
    if (!metroCode) continue;
    for (const { col, year } of yearCols) {
      if (year < startYear || year > endYear) continue;
      const v = cell(r, col);
      if (v === null || v === "" || v === "n/a") continue;
      const apps = Number(v);
      if (!Number.isFinite(apps)) continue;
      const key = `${metroCode}|${year}`;
      if (!agg.has(key)) agg.set(key, { total: 0, counties: new Set() });
      const a = agg.get(key)!;
      a.total += apps;
      a.counties.add(fips);
    }
  }
  console.log(`  scanned ${countyRowsScanned} county-rows, ${agg.size} (metro,year) aggregations`);

  let inserted = 0;
  for (const [key, v] of agg) {
    const [metroCode, yearStr] = key.split("|");
    await sql`
      INSERT INTO metro_business_applications_annual (metro_code, year, applications_total, counties_included)
      VALUES (${metroCode}, ${Number(yearStr)}, ${v.total}, ${v.counties.size})
      ON CONFLICT (metro_code, year) DO UPDATE SET
        applications_total = EXCLUDED.applications_total,
        counties_included = EXCLUDED.counties_included
    `;
    inserted++;
  }
  console.log(`  inserted/updated ${inserted} rows`);
}

// ── 2. Census ACS 1-year for 7 metros ───────────────────────────────────

async function syncAcs() {
  console.log("\n━━━ 2. Census ACS 1-year (LFP rate + median income, 7 metros) ━━━");
  // ACS 1-year is published 2005-present, except 2020 (skipped due to COVID).
  // Latest typically lags by ~9-12 months.
  const fipsList = ALL_METRO_CODES.join(",");
  let total = 0;
  for (let year = Math.max(startYear, 2010); year <= endYear; year++) {
    if (year === 2020) continue; // not published
    const url =
      `https://api.census.gov/data/${year}/acs/acs1?get=NAME,B23025_001E,B23025_002E,B23025_005E,B19013_001E` +
      `&for=metropolitan+statistical+area/micropolitan+statistical+area:${fipsList}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  ${year}: HTTP ${res.status} — skipping`);
        continue;
      }
      const data = (await res.json()) as string[][];
      if (!Array.isArray(data) || data.length < 2) continue;
      const header = data[0];
      const iPop = header.indexOf("B23025_001E");
      const iLF = header.indexOf("B23025_002E");
      const iUnemp = header.indexOf("B23025_005E");
      const iInc = header.indexOf("B19013_001E");
      const iCode = header.indexOf("metropolitan statistical area/micropolitan statistical area");
      let yearRows = 0;
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const metroCode = String(row[iCode]);
        if (!ALL_METRO_CODES.includes(metroCode)) continue;
        const pop = Number(row[iPop]);
        const lf = Number(row[iLF]);
        const unemp = Number(row[iUnemp]);
        const inc = Number(row[iInc]);
        const lfp = pop > 0 ? Math.round((lf / pop) * 10000) / 100 : null;
        await sql`
          INSERT INTO metro_acs_annual
            (metro_code, year, population_16_plus, labor_force, unemployed_acs, median_household_income, lfp_rate)
          VALUES (${metroCode}, ${year}, ${pop || null}, ${lf || null}, ${unemp || null}, ${inc || null}, ${lfp})
          ON CONFLICT (metro_code, year) DO UPDATE SET
            population_16_plus = EXCLUDED.population_16_plus,
            labor_force = EXCLUDED.labor_force,
            unemployed_acs = EXCLUDED.unemployed_acs,
            median_household_income = EXCLUDED.median_household_income,
            lfp_rate = EXCLUDED.lfp_rate
        `;
        yearRows++;
        total++;
      }
      console.log(`  ${year}: ${yearRows} metros`);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.log(`  ${year}: error ${(err as Error).message}`);
    }
  }
  console.log(`  inserted/updated ${total} rows`);
}

// ── 3. Zillow ZHVI monthly per metro ────────────────────────────────────

async function syncZhvi() {
  console.log("\n━━━ 3. Zillow ZHVI metro (monthly typical home value, 7 metros) ━━━");
  const url =
    "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv";
  console.log(`  fetching ${url}…`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  HTTP ${res.status} — abort`);
    return;
  }
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    console.error("  empty CSV");
    return;
  }

  // Header: RegionID,SizeRank,RegionName,RegionType,StateName,2000-01-31,...
  const header = parseCsvLine(lines[0]);
  const iName = header.indexOf("RegionName");
  const iType = header.indexOf("RegionType");
  const iState = header.indexOf("StateName");
  const dateCols: { col: number; year: number; month: number }[] = [];
  for (let i = 0; i < header.length; i++) {
    const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(header[i]);
    if (m) dateCols.push({ col: i, year: Number(m[1]), month: Number(m[2]) });
  }

  // Zillow names metros as "City, ST" — disambiguate using StateName + name to
  // avoid "Portland, OR" vs "Portland, ME" collisions.
  const nameStateToCode: Map<string, string> = new Map([
    ["Portland, OR|OR", "38900"],
    ["Seattle, WA|WA", "42660"],
    ["Denver, CO|CO", "19740"],
    ["Austin, TX|TX", "12420"],
    ["San Francisco, CA|CA", "41860"],
    ["Minneapolis, MN|MN", "33460"],
    ["Phoenix, AZ|AZ", "38060"],
  ]);

  let inserted = 0;
  for (let r = 1; r < lines.length; r++) {
    const row = parseCsvLine(lines[r]);
    if (row.length <= iState) continue;
    if (row[iType] !== "msa") continue;
    const name = row[iName];
    const state = row[iState];
    const metroCode = nameStateToCode.get(`${name}|${state}`);
    if (!metroCode) continue;
    for (const { col, year, month } of dateCols) {
      if (year < startYear || year > endYear) continue;
      const v = row[col];
      if (v === undefined || v === "" || v === "null") continue;
      const zhvi = Number(v);
      if (!Number.isFinite(zhvi)) continue;
      await sql`
        INSERT INTO metro_zhvi_monthly (metro_code, year, month, zhvi)
        VALUES (${metroCode}, ${year}, ${month}, ${zhvi})
        ON CONFLICT (metro_code, year, month) DO UPDATE SET zhvi = EXCLUDED.zhvi
      `;
      inserted++;
    }
  }
  console.log(`  inserted/updated ${inserted} rows`);
}

/**
 * RFC-4180 lite CSV parser — handles double-quoted fields (which is required
 * for Zillow's region names like `"Portland, OR"`). Doesn't handle escaped
 * quotes inside fields; fine for ZHVI which has none.
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  let cur = "";
  let inQuotes = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    i++;
  }
  out.push(cur);
  return out;
}

// ── 4. BEA Regional CAINC1 county roll-up to MSA personal income ────────
//
// BEA's MSA-level GDP tables aren't exposed via the public API (only county
// and state). Workaround: pull CAINC1 line 1 (total personal income) and
// line 2 (population) for every county in the 7 peer MSAs, sum to MSA, then
// compute per-capita = sum_income / sum_pop. CAINC1 publishes annual data
// 1969-present (~1y lag).
//
// Per-capita personal income is BEA's recommended substitute for per-capita
// GDP at the metro level (correlates ~0.9 across metros).

const BEA_API_URL = "https://apps.bea.gov/api/data/";

interface BeaDataPoint {
  GeoFips: string;
  GeoName: string;
  TimePeriod: string;
  DataValue: string;
  CL_UNIT: string;
}

async function fetchBeaCainc1(lineCode: 1 | 2, year: number, fipsList: string[]): Promise<BeaDataPoint[]> {
  // BEA caps GeoFIPS at ~50 per request; we have 49 counties.
  const geoFips = fipsList.join(",");
  const url =
    `${BEA_API_URL}?` +
    `UserID=${BEA_API_KEY}` +
    `&method=GetData&datasetname=Regional&TableName=CAINC1` +
    `&LineCode=${lineCode}` +
    `&GeoFIPS=${encodeURIComponent(geoFips)}` +
    `&Year=${year}&ResultFormat=JSON`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as {
    BEAAPI?: { Results?: { Data?: BeaDataPoint[]; Error?: { APIErrorDescription?: string } } };
  };
  const r = json.BEAAPI?.Results;
  if (r?.Error) {
    console.warn(`  BEA error (line=${lineCode} year=${year}): ${r.Error.APIErrorDescription}`);
    return [];
  }
  return r?.Data ?? [];
}

async function syncBeaPersonalIncome() {
  console.log("\n━━━ 4. BEA CAINC1 county → MSA per-capita personal income ━━━");
  if (!BEA_API_KEY) {
    console.error("  BEA_API_KEY not set in env — skip");
    return;
  }
  // Build flat list of all county FIPS we care about.
  const allCountyFips: string[] = [];
  for (const m of METROS) for (const f of m.countyFips) allCountyFips.push(f);
  console.log(`  ${allCountyFips.length} counties across ${METROS.length} metros`);

  // BEA CAINC1 series start 1969; we only need the recent decade for scoring.
  const beaStart = Math.max(startYear, 2010);
  const beaEnd = Math.min(endYear, new Date().getFullYear() - 1); // BEA ~1y lag

  let total = 0;
  for (let year = beaStart; year <= beaEnd; year++) {
    const [income, population] = await Promise.all([
      fetchBeaCainc1(1, year, allCountyFips),
      fetchBeaCainc1(2, year, allCountyFips),
    ]);
    if (income.length === 0 && population.length === 0) {
      console.log(`  ${year}: no data — skipping`);
      continue;
    }

    // Index by county FIPS
    const incomeByFips = new Map(income.map((d) => [d.GeoFips, Number(d.DataValue.replace(/,/g, ""))]));
    const popByFips = new Map(population.map((d) => [d.GeoFips, Number(d.DataValue.replace(/,/g, ""))]));

    for (const m of METROS) {
      let sumIncome = 0; // CAINC1 line 1 is in thousands of dollars
      let sumPop = 0;
      let counties = 0;
      for (const fips of m.countyFips) {
        const inc = incomeByFips.get(fips);
        const pop = popByFips.get(fips);
        if (Number.isFinite(inc) && Number.isFinite(pop) && pop! > 0) {
          sumIncome += inc!;
          sumPop += pop!;
          counties++;
        }
      }
      if (counties === 0 || sumPop === 0) continue;
      const perCapita = Math.round((sumIncome * 1000) / sumPop); // thousands → dollars
      await sql`
        INSERT INTO metro_personal_income_annual
          (metro_code, year, personal_income_thousands, population, per_capita_income, counties_included)
        VALUES (${m.metroCode}, ${year}, ${sumIncome}, ${sumPop}, ${perCapita}, ${counties})
        ON CONFLICT (metro_code, year) DO UPDATE SET
          personal_income_thousands = EXCLUDED.personal_income_thousands,
          population = EXCLUDED.population,
          per_capita_income = EXCLUDED.per_capita_income,
          counties_included = EXCLUDED.counties_included
      `;
      total++;
    }
    console.log(`  ${year}: 7 metros aggregated`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`  inserted/updated ${total} rows`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  await ensureTables();
  const onlyOne = ONLY_BFS || ONLY_ACS || ONLY_ZHVI || ONLY_BEA;
  if (!onlyOne || ONLY_BFS) await syncBfsCounty();
  if (!onlyOne || ONLY_ACS) await syncAcs();
  if (!onlyOne || ONLY_ZHVI) await syncZhvi();
  if (!onlyOne || ONLY_BEA) await syncBeaPersonalIncome();
  console.log("\n[peer-metros-extended] done.");
}

main()
  .catch((err) => {
    console.error("[peer-metros-extended] FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
