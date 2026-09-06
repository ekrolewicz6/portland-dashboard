import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Types ──────────────────────────────────────────────────────────────────

type Scope = "monthly" | "quarterly" | "annual" | "all" | "zillow";

interface RefreshResult {
  source: string;
  status: "ok" | "skipped" | "error" | "manual";
  rows?: number;
  message?: string;
  ms?: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

function checkAuth(request: NextRequest): boolean {
  return isAuthorizedCronRequest(request);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 2000,
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * attempt));
          continue;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err: unknown) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error("Unreachable");
}

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetchWithRetry(url);
  return res.json();
}

// ── Scope determination ────────────────────────────────────────────────────

function shouldRunScope(scope: Scope, target: "monthly" | "quarterly" | "annual"): boolean {
  if (scope === "all") return true;
  if (scope === target) return true;
  return false;
}

/**
 * When invoked by the monthly cron (no ?scope param), auto-determine which
 * scopes to run based on the current month:
 *   - Monthly: always
 *   - Quarterly: Jan, Apr, Jul, Oct
 *   - Annual: December
 */
function autoScope(): Scope[] {
  const month = new Date().getMonth() + 1; // 1-12
  const scopes: Scope[] = ["monthly"];
  if ([1, 4, 7, 10].includes(month)) scopes.push("quarterly");
  if (month === 12) scopes.push("annual");
  return scopes;
}

// ════════════════════════════════════════════════════════════════════════════
// MONTHLY SOURCES
// ════════════════════════════════════════════════════════════════════════════

// ── 1. BLS QCEW (Portland MSA) ────────────────────────────────────────────

async function refreshBLSQCEW(): Promise<RefreshResult> {
  const t0 = Date.now();
  const currentYear = new Date().getFullYear();
  // QCEW data lags ~6 months. Check current year and prior year.
  const yearsToCheck = [currentYear - 1, currentYear];
  let totalUpserted = 0;

  for (const year of yearsToCheck) {
    for (let qtr = 1; qtr <= 4; qtr++) {
      const url = `https://data.bls.gov/cew/data/api/${year}/${qtr}/area/C3890.csv`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) continue;

        const text = await res.text();
        const lines = text.split("\n");
        if (lines.length < 2) continue;

        // Find total private: own_code=5, industry_code=10, agglvl_code=41
        for (const line of lines.slice(1)) {
          if (!line.includes('"5","10","41"')) continue;

          const cols =
            line.match(/(".*?"|[^,]+)/g)?.map((c) => c.replace(/"/g, "")) ??
            [];
          if (cols.length < 16) continue;

          const estabs = parseInt(cols[8], 10);
          const m1 = parseInt(cols[9], 10);
          const m2 = parseInt(cols[10], 10);
          const m3 = parseInt(cols[11], 10);
          const wages = parseInt(cols[12], 10);
          const avgWage = parseInt(cols[15], 10);

          if (estabs === 0 || m3 === 0) continue;

          await sql`
            INSERT INTO economy.msa_employment_wages
              (year, quarter, establishments, month1_employment, month2_employment,
               month3_employment, total_quarterly_wages, avg_weekly_wage)
            VALUES
              (${year}, ${qtr}, ${estabs}, ${m1}, ${m2}, ${m3}, ${wages}, ${avgWage})
            ON CONFLICT (year, quarter, area_fips) DO UPDATE SET
              establishments = EXCLUDED.establishments,
              month1_employment = EXCLUDED.month1_employment,
              month2_employment = EXCLUDED.month2_employment,
              month3_employment = EXCLUDED.month3_employment,
              total_quarterly_wages = EXCLUDED.total_quarterly_wages,
              avg_weekly_wage = EXCLUDED.avg_weekly_wage
          `;
          totalUpserted++;
          break;
        }

        // Be polite to BLS
        await new Promise((r) => setTimeout(r, 200));
      } catch {
        // Individual quarter failures are not fatal
        continue;
      }
    }
  }

  if (totalUpserted > 0) {
    await sql`
      DELETE FROM public.dashboard_cache WHERE question IN ('economy', 'economy_detail')
    `.catch(() => {});
  }

  return {
    source: "BLS QCEW (Portland MSA)",
    status: totalUpserted > 0 ? "ok" : "skipped",
    rows: totalUpserted,
    message:
      totalUpserted > 0
        ? `Upserted ${totalUpserted} quarters`
        : "No new QCEW data available (data lags ~6 months)",
    ms: Date.now() - t0,
  };
}

// ── 2. TriMet Monthly Ridership (NTD) ──────────────────────────────────────

const MODE_MAP: Record<string, string> = {
  MB: "Bus",
  LR: "Light Rail",
  DR: "Demand Response",
  CB: "Commuter Bus",
  CR: "Commuter Rail",
  VP: "Vanpool",
  TB: "Trolleybus",
  SR: "Streetcar",
  RB: "Bus Rapid Transit",
};

async function refreshTriMetRidership(): Promise<RefreshResult> {
  const t0 = Date.now();
  const url =
    "https://datahub.transportation.gov/resource/8bui-9xvu.json?$where=agency%20like%20%27%25Tri-County%25%27%20AND%20tos=%27DO%27&$limit=5000";

  let rawData: Array<Record<string, string>>;
  try {
    rawData = (await fetchJSON(url)) as Array<Record<string, string>>;
  } catch (err: unknown) {
    return {
      source: "TriMet Ridership (NTD)",
      status: "error",
      message: `Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      ms: Date.now() - t0,
    };
  }

  if (!Array.isArray(rawData) || rawData.length === 0) {
    return {
      source: "TriMet Ridership (NTD)",
      status: "skipped",
      message: "No data returned from NTD API",
      ms: Date.now() - t0,
    };
  }

  // Parse and deduplicate
  const deduped = new Map<
    string,
    { month: string; mode: string; boardings: number; vrm: number | null; vrh: number | null }
  >();

  for (const r of rawData) {
    const dateStr = r.date || "";
    const modeCode = r.mode || "";
    const upt = parseInt(r.upt || "0");

    if (!dateStr || !modeCode || isNaN(upt) || upt <= 0) continue;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) continue;

    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const modeName = MODE_MAP[modeCode] || modeCode;
    const vrm = r.vrm ? parseInt(r.vrm) : null;
    const vrh = r.vrh ? parseInt(r.vrh) : null;

    const key = `${monthStr}|${modeName}`;
    deduped.set(key, {
      month: monthStr,
      mode: modeName,
      boardings: upt,
      vrm: isNaN(vrm as number) ? null : vrm,
      vrh: isNaN(vrh as number) ? null : vrh,
    });
  }

  const rows = Array.from(deduped.values());
  let inserted = 0;
  const BATCH = 500;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    try {
      const result = await sql`
        INSERT INTO transportation.ridership_monthly (month, mode, boardings, vehicle_revenue_miles, vehicle_revenue_hours, source)
        SELECT m::date, md, b, vrm, vrh, 'NTD'
        FROM unnest(
          ${sql.array(batch.map((r) => r.month))}::text[],
          ${sql.array(batch.map((r) => r.mode))}::text[],
          ${sql.array(batch.map((r) => r.boardings))}::int[],
          ${sql.array(batch.map((r) => r.vrm))}::int[],
          ${sql.array(batch.map((r) => r.vrh))}::int[]
        ) AS t(m, md, b, vrm, vrh)
        ON CONFLICT (month, mode) DO UPDATE SET
          boardings = EXCLUDED.boardings,
          vehicle_revenue_miles = EXCLUDED.vehicle_revenue_miles,
          vehicle_revenue_hours = EXCLUDED.vehicle_revenue_hours
      `;
      inserted += result.count;
    } catch (err: unknown) {
      console.error(`[refresh-data] TriMet batch error at ${i}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (inserted > 0) {
    await sql`
      DELETE FROM public.dashboard_cache WHERE question IN ('transportation', 'transportation_detail')
    `.catch(() => {});
  }

  return {
    source: "TriMet Ridership (NTD)",
    status: "ok",
    rows: inserted,
    message: `Upserted ${inserted} from ${rows.length} unique (month, mode) pairs`,
    ms: Date.now() - t0,
  };
}

// ── 3. Zillow ZORI Rent Data ───────────────────────────────────────────────

async function refreshZillowRent(): Promise<RefreshResult> {
  const t0 = Date.now();
  const csvUrl =
    "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv";

  let text: string;
  try {
    const res = await fetchWithRetry(csvUrl);
    text = await res.text();
  } catch (err: unknown) {
    return {
      source: "Zillow ZORI Rent",
      status: "error",
      message: `CSV download failed: ${err instanceof Error ? err.message : String(err)}`,
      ms: Date.now() - t0,
    };
  }

  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      source: "Zillow ZORI Rent",
      status: "error",
      message: "CSV has fewer than 2 lines",
      ms: Date.now() - t0,
    };
  }

  const headers = parseCsvLine(lines[0]);
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Identify date columns
  const dateColumns: { index: number; normalizedDate: string }[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (dateRegex.test(headers[i])) {
      const parts = headers[i].split("-");
      dateColumns.push({
        index: i,
        normalizedDate: `${parts[0]}-${parts[1]}-01`,
      });
    }
  }

  // Find RegionName column and Portland row
  const regionNameIdx = headers.findIndex(
    (h) => h.toLowerCase() === "regionname",
  );
  if (regionNameIdx < 0) {
    return {
      source: "Zillow ZORI Rent",
      status: "error",
      message: "Cannot find RegionName column in CSV",
      ms: Date.now() - t0,
    };
  }

  let portlandFields: string[] | null = null;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const regionName = fields[regionNameIdx] || "";
    if (regionName.toLowerCase().includes("portland")) {
      portlandFields = fields;
      break;
    }
  }

  if (!portlandFields) {
    return {
      source: "Zillow ZORI Rent",
      status: "error",
      message: "Portland metro area not found in CSV",
      ms: Date.now() - t0,
    };
  }

  // Parse data points
  const dataPoints: { month: string; zori: number }[] = [];
  for (const col of dateColumns) {
    const raw = portlandFields[col.index];
    if (!raw || raw === "" || raw === "." || raw === "NaN") continue;
    const value = parseFloat(raw);
    if (isNaN(value) || value <= 0) continue;
    dataPoints.push({
      month: col.normalizedDate,
      zori: Math.round(value * 100) / 100,
    });
  }

  if (dataPoints.length === 0) {
    return {
      source: "Zillow ZORI Rent",
      status: "error",
      message: "No valid ZORI data points found for Portland",
      ms: Date.now() - t0,
    };
  }

  // Replace the metro series in one transaction.
  //
  // This was a bare TRUNCATE followed by a row-at-a-time insert loop with each
  // error swallowed. Anything that interrupted the loop — a dropped
  // connection, the function's 300s deadline — left the table empty or half
  // filled, and because the cache is only cleared when rows land, the rent
  // chart served stale data for an hour and then went blank. Inside a
  // transaction the old rows survive until the new ones are committed.
  //
  // Only the metro rows are removed: other geographies in this table are
  // loaded by other jobs and are not this function's to delete.
  let inserted = 0;
  await sql.begin(async (tx) => {
    await tx.unsafe(`DELETE FROM public.housing_rents WHERE zip_code = 'metro'`);
    const result = await tx.unsafe(
      `INSERT INTO public.housing_rents (month, zip_code, zori)
       SELECT unnest($1::date[]), 'metro', unnest($2::numeric[])`,
      [dataPoints.map((d) => d.month), dataPoints.map((d) => d.zori)],
    );
    inserted = result.count ?? dataPoints.length;
  });

  // Also update zillow_metrics
  try {
    await sql`DELETE FROM public.zillow_metrics WHERE metric = 'zori_all'`;
    for (const dp of dataPoints) {
      await sql`
        INSERT INTO public.zillow_metrics (metric, month, value, description)
        VALUES ('zori_all', ${dp.month}::date, ${dp.zori}, 'Zillow Observed Rent Index - All homes, Portland MSA')
        ON CONFLICT (metric, month) DO UPDATE SET value = EXCLUDED.value
      `;
    }
  } catch {
    // zillow_metrics table may not exist in all envs
  }

  if (inserted > 0) {
    await sql`
      DELETE FROM public.dashboard_cache
      WHERE question IN ('housing', 'housing_detail', 'housing_journey', 'housing_bottleneck')
    `.catch(() => {});
  }

  return {
    source: "Zillow ZORI Rent",
    status: "ok",
    rows: inserted,
    message: `Inserted ${inserted} rent data points (${dataPoints[0].month} to ${dataPoints[dataPoints.length - 1].month})`,
    ms: Date.now() - t0,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// QUARTERLY SOURCES
// ════════════════════════════════════════════════════════════════════════════

// ── 4. Census ACS Demographics ─────────────────────────────────────────────

const CENSUS_VARIABLES = [
  "B01003_001E", // Total Population
  "B19013_001E", // Median Household Income
  "B17001_001E", // Poverty Universe
  "B17001_002E", // Below Poverty Level
  "B02001_002E", // White alone
  "B02001_003E", // Black alone
  "B02001_005E", // Asian alone
  "B03002_012E", // Hispanic/Latino
  "B01002_001E", // Median Age
  "B25003_002E", // Owner-occupied
  "B25003_003E", // Renter-occupied
];

const METRIC_NAMES: Record<string, string> = {
  B01003_001E: "total_population",
  B19013_001E: "median_household_income",
  B17001_001E: "poverty_universe",
  B17001_002E: "below_poverty",
  B02001_002E: "white_alone",
  B02001_003E: "black_alone",
  B02001_005E: "asian_alone",
  B03002_012E: "hispanic_latino",
  B01002_001E: "median_age",
  B25003_002E: "owner_occupied",
  B25003_003E: "renter_occupied",
};

async function refreshCensusDemographics(): Promise<RefreshResult> {
  const t0 = Date.now();
  const censusKey = process.env.CENSUS_API_KEY || "";
  const varsStr = CENSUS_VARIABLES.join(",");

  // ACS 5-year releases in December. Check latest possible year.
  // ACS 2023 released Dec 2024, ACS 2024 will release Dec 2025, etc.
  const currentYear = new Date().getFullYear();
  // The latest ACS year is typically currentYear - 2 (released Dec of currentYear - 1)
  const latestAcsYear = currentYear - 2;
  // Try the most recent year first, then fall back
  const yearsToTry = [latestAcsYear, latestAcsYear - 1];

  let totalInserted = 0;

  for (const year of yearsToTry) {
    const keyParam = censusKey ? `&key=${censusKey}` : "";
    const url = `https://api.census.gov/data/${year}/acs/acs5?get=${varsStr}&for=place:59000&in=state:41${keyParam}`;

    try {
      const data = (await fetchJSON(url)) as string[][];
      if (!Array.isArray(data) || data.length < 2) continue;

      const headers = data[0];
      const row = data[1];

      for (const varCode of CENSUS_VARIABLES) {
        const idx = headers.indexOf(varCode);
        if (idx < 0) continue;

        const rawVal = row[idx];
        const numVal = rawVal !== null && rawVal !== "" ? parseFloat(rawVal) : null;
        const metricName = METRIC_NAMES[varCode] || varCode;

        // Census uses negative numbers for missing/suppressed data
        const value = numVal !== null && numVal >= 0 ? numVal : null;

        await sql`
          INSERT INTO public.census_demographics (year, metric, value)
          VALUES (${year}, ${metricName}, ${value})
          ON CONFLICT (year, metric) DO UPDATE SET value = EXCLUDED.value
        `;
        totalInserted++;
      }

      console.log(`[refresh-data] Census ACS ${year}: upserted ${CENSUS_VARIABLES.length} metrics`);

      // Polite delay
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: unknown) {
      console.log(`[refresh-data] Census ACS ${year}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    source: "Census ACS Demographics",
    status: totalInserted > 0 ? "ok" : "skipped",
    rows: totalInserted,
    message:
      totalInserted > 0
        ? `Upserted ${totalInserted} metrics for years ${yearsToTry.join(", ")}`
        : "No new ACS data available (releases annually in December)",
    ms: Date.now() - t0,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ANNUAL SOURCES
// ════════════════════════════════════════════════════════════════════════════

// ── 5. ODOT Crash Data (Multnomah County) ──────────────────────────────────

async function refreshODOTCrashes(): Promise<RefreshResult> {
  const t0 = Date.now();
  const baseUrl =
    "https://services.arcgis.com/gfpXnknjcY6QHKhU/arcgis/rest/services/Crash_ODOT/FeatureServer/0/query";

  const outFields = [
    "CRASH_ID",
    "CRASH_DT",
    "CRASH_YR_NO",
    "CRASH_MO_NO",
    "CNTY_NM",
    "ST_FULL_NM",
    "CRASH_SVRTY_LONG_DESC",
    "TOT_FATAL_CNT",
    "TOT_INJ_LVL_A_CNT",
    "TOT_INJ_LVL_B_CNT",
    "TOT_INJ_LVL_C_CNT",
    "TOT_PED_CNT",
    "TOT_PEDCYCL_CNT",
    "CRASH_TYP_LONG_DESC",
    "CRASH_CAUSE_1_LONG_DESC",
    "ALCHL_INVLV_FLG",
    "CRASH_SPEED_INVLV_FLG",
    "POST_SPEED_LMT_VAL",
    "LAT_DD",
    "LONGTD_DD",
  ].join(",");

  const PAGE_SIZE = 2000;
  const MAX_PAGES = 30;

  interface CrashRow {
    crash_id: number;
    crash_date: string | null;
    crash_year: number | null;
    crash_month: number | null;
    county: string;
    street: string | null;
    severity: string | null;
    total_fatalities: number;
    total_injuries: number;
    total_pedestrians: number;
    total_cyclists: number;
    crash_type: string | null;
    crash_cause: string | null;
    alcohol_involved: boolean;
    speed_involved: boolean;
    speed_limit: number | null;
    lat: number | null;
    lon: number | null;
  }

  const allRows: CrashRow[] = [];
  let page = 0;

  while (page < MAX_PAGES) {
    const offset = page * PAGE_SIZE;
    const params = new URLSearchParams({
      where: "CNTY_NM='Multnomah'",
      outFields,
      returnGeometry: "false",
      f: "json",
      resultRecordCount: String(PAGE_SIZE),
      resultOffset: String(offset),
    });

    try {
      const data = (await fetchJSON(`${baseUrl}?${params}`)) as {
        features?: Array<{ attributes: Record<string, unknown> }>;
        exceededTransferLimit?: boolean;
      };

      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) break;

      for (const f of data.features) {
        const a = f.attributes;
        if (!a || !a.CRASH_ID) continue;

        let crashDate: string | null = null;
        if (a.CRASH_DT && typeof a.CRASH_DT === "number" && (a.CRASH_DT as number) > 0) {
          const d = new Date(a.CRASH_DT as number);
          if (d.getFullYear() >= 2000 && d.getFullYear() <= 2030) {
            crashDate = d.toISOString().slice(0, 10);
          }
        }

        const crashYear = a.CRASH_YR_NO ? parseInt(String(a.CRASH_YR_NO)) : null;
        const crashMonth = a.CRASH_MO_NO ? parseInt(String(a.CRASH_MO_NO)) : null;
        const speedLimit = a.POST_SPEED_LMT_VAL ? parseInt(String(a.POST_SPEED_LMT_VAL)) : null;

        const totalInjuries =
          ((a.TOT_INJ_LVL_A_CNT as number) ?? 0) +
          ((a.TOT_INJ_LVL_B_CNT as number) ?? 0) +
          ((a.TOT_INJ_LVL_C_CNT as number) ?? 0);

        allRows.push({
          crash_id: a.CRASH_ID as number,
          crash_date: crashDate,
          crash_year: isNaN(crashYear as number) ? null : crashYear,
          crash_month: isNaN(crashMonth as number) ? null : crashMonth,
          county: (a.CNTY_NM as string) || "Multnomah",
          street: (a.ST_FULL_NM as string) || null,
          severity: (a.CRASH_SVRTY_LONG_DESC as string) || null,
          total_fatalities: (a.TOT_FATAL_CNT as number) ?? 0,
          total_injuries: totalInjuries,
          total_pedestrians: (a.TOT_PED_CNT as number) ?? 0,
          total_cyclists: (a.TOT_PEDCYCL_CNT as number) ?? 0,
          crash_type: (a.CRASH_TYP_LONG_DESC as string) || null,
          crash_cause: (a.CRASH_CAUSE_1_LONG_DESC as string) || null,
          alcohol_involved: a.ALCHL_INVLV_FLG === 1,
          speed_involved: a.CRASH_SPEED_INVLV_FLG === 1,
          speed_limit: isNaN(speedLimit as number) ? null : speedLimit,
          lat: (a.LAT_DD as number) ?? null,
          lon: (a.LONGTD_DD as number) ?? null,
        });
      }

      if (data.features.length < PAGE_SIZE && !data.exceededTransferLimit) break;
      page++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: unknown) {
      console.error(`[refresh-data] ODOT page ${page}: ${err instanceof Error ? err.message : String(err)}`);
      page++;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (allRows.length === 0) {
    return {
      source: "ODOT Crash Data",
      status: "skipped",
      message: "No crash data fetched from ArcGIS",
      ms: Date.now() - t0,
    };
  }

  // Batch upsert
  let inserted = 0;
  const BATCH = 500;

  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH);
    try {
      await sql.unsafe(
        `INSERT INTO transportation.crash_records
           (crash_id, crash_date, crash_year, crash_month, county, street,
            severity, total_fatalities, total_injuries, total_pedestrians,
            total_cyclists, crash_type, crash_cause, alcohol_involved,
            speed_involved, speed_limit, lat, lon)
         SELECT
           cid, cd::date, cy, cm, co, st,
           sv, tf, ti, tp,
           tc, ct, cc, ai::int::boolean,
           si::int::boolean, sl, la, lo
         FROM unnest(
           $1::bigint[], $2::text[], $3::int[], $4::int[], $5::text[], $6::text[],
           $7::text[], $8::int[], $9::int[], $10::int[],
           $11::int[], $12::text[], $13::text[], $14::int[],
           $15::int[], $16::int[], $17::numeric[], $18::numeric[]
         ) AS t(cid, cd, cy, cm, co, st, sv, tf, ti, tp, tc, ct, cc, ai, si, sl, la, lo)
         ON CONFLICT (crash_id) DO UPDATE SET
           crash_date = EXCLUDED.crash_date,
           severity = EXCLUDED.severity,
           total_fatalities = EXCLUDED.total_fatalities,
           total_injuries = EXCLUDED.total_injuries,
           total_pedestrians = EXCLUDED.total_pedestrians,
           total_cyclists = EXCLUDED.total_cyclists`,
        [
          batch.map((r) => r.crash_id),
          batch.map((r) => r.crash_date),
          batch.map((r) => r.crash_year),
          batch.map((r) => r.crash_month),
          batch.map((r) => r.county),
          batch.map((r) => r.street),
          batch.map((r) => r.severity),
          batch.map((r) => r.total_fatalities),
          batch.map((r) => r.total_injuries),
          batch.map((r) => r.total_pedestrians),
          batch.map((r) => r.total_cyclists),
          batch.map((r) => r.crash_type),
          batch.map((r) => r.crash_cause),
          batch.map((r) => (r.alcohol_involved ? 1 : 0)),
          batch.map((r) => (r.speed_involved ? 1 : 0)),
          batch.map((r) => r.speed_limit),
          batch.map((r) => r.lat),
          batch.map((r) => r.lon),
        ],
      );
      inserted += batch.length;
    } catch (err: unknown) {
      console.error(`[refresh-data] ODOT batch at ${i}: ${err instanceof Error ? err.message : String(err)}`);
      // Row-by-row fallback
      for (const r of batch) {
        try {
          await sql.unsafe(
            `INSERT INTO transportation.crash_records
               (crash_id, crash_date, crash_year, crash_month, county, street,
                severity, total_fatalities, total_injuries, total_pedestrians,
                total_cyclists, crash_type, crash_cause, alcohol_involved,
                speed_involved, speed_limit, lat, lon)
             VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (crash_id) DO UPDATE SET
               crash_date = EXCLUDED.crash_date,
               severity = EXCLUDED.severity,
               total_fatalities = EXCLUDED.total_fatalities,
               total_injuries = EXCLUDED.total_injuries`,
            [
              r.crash_id, r.crash_date, r.crash_year, r.crash_month, r.county, r.street,
              r.severity, r.total_fatalities, r.total_injuries, r.total_pedestrians,
              r.total_cyclists, r.crash_type, r.crash_cause, r.alcohol_involved,
              r.speed_involved, r.speed_limit, r.lat, r.lon,
            ],
          );
          inserted++;
        } catch {
          // skip
        }
      }
    }
  }

  if (inserted > 0) {
    await sql`
      DELETE FROM public.dashboard_cache WHERE question IN ('transportation', 'transportation_detail')
    `.catch(() => {});
  }

  return {
    source: "ODOT Crash Data",
    status: "ok",
    rows: inserted,
    message: `Upserted ${inserted.toLocaleString()} crash records from ${allRows.length.toLocaleString()} fetched`,
    ms: Date.now() - t0,
  };
}

// ── 6. Tree Inventory (ArcGIS) ─────────────────────────────────────────────

async function refreshTreeInventory(): Promise<RefreshResult> {
  const t0 = Date.now();
  const TREE_ENDPOINT =
    "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Street_Tree_Inventory_Active/MapServer/4/query";
  const PAGE_SIZE = 2000;

  // Get total count
  let totalCount: number;
  try {
    const countRes = await fetchWithRetry(
      `${TREE_ENDPOINT}?where=1%3D1&returnCountOnly=true&f=json`,
    );
    const countData = (await countRes.json()) as { count: number };
    totalCount = countData.count;
  } catch (err: unknown) {
    return {
      source: "Tree Inventory",
      status: "error",
      message: `Count query failed: ${err instanceof Error ? err.message : String(err)}`,
      ms: Date.now() - t0,
    };
  }

  // Fetch all trees, aggregate by neighborhood
  const neighborhoods = new Map<
    string,
    {
      count: number;
      speciesCounts: Record<string, number>;
      diameters: number[];
      conditionGood: number;
      conditionFair: number;
      conditionPoor: number;
    }
  >();

  let fetched = 0;
  while (fetched < totalCount) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields: "NEIGHBORHOOD,SPECIES,DIAMETER,Condition",
      resultOffset: String(fetched),
      resultRecordCount: String(PAGE_SIZE),
      f: "json",
    });

    try {
      const data = (await fetchJSON(`${TREE_ENDPOINT}?${params}`)) as {
        features?: Array<{ attributes: Record<string, unknown> }>;
      };
      const features = data.features || [];
      if (features.length === 0) break;

      for (const f of features) {
        const a = f.attributes;
        const hood = ((a.NEIGHBORHOOD as string) || "").trim() || "Unknown";

        if (!neighborhoods.has(hood)) {
          neighborhoods.set(hood, {
            count: 0,
            speciesCounts: {},
            diameters: [],
            conditionGood: 0,
            conditionFair: 0,
            conditionPoor: 0,
          });
        }
        const agg = neighborhoods.get(hood)!;
        agg.count++;

        if (a.SPECIES) {
          const sp = (a.SPECIES as string).trim();
          agg.speciesCounts[sp] = (agg.speciesCounts[sp] || 0) + 1;
        }

        const diam = a.DIAMETER as number | null;
        if (diam != null && diam > 0 && diam < 200) {
          agg.diameters.push(diam);
        }

        const cond = ((a.Condition as string) || "").trim().toLowerCase();
        if (cond === "good") agg.conditionGood++;
        else if (cond === "fair") agg.conditionFair++;
        else if (cond === "poor" || cond === "dead" || cond === "dying") agg.conditionPoor++;
      }

      fetched += features.length;
    } catch (err: unknown) {
      console.error(`[refresh-data] Tree page at offset ${fetched}: ${err instanceof Error ? err.message : String(err)}`);
      break;
    }
  }

  if (neighborhoods.size === 0) {
    return {
      source: "Tree Inventory",
      status: "skipped",
      message: "No tree data fetched",
      ms: Date.now() - t0,
    };
  }

  // Upsert aggregated data
  let inserted = 0;
  for (const [hood, agg] of neighborhoods) {
    const topSpecies = Object.entries(agg.speciesCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sp]) => sp);

    const avgDiam =
      agg.diameters.length > 0
        ? agg.diameters.reduce((a, b) => a + b, 0) / agg.diameters.length
        : null;

    const condTotal = agg.conditionGood + agg.conditionFair + agg.conditionPoor;
    const goodPct = condTotal > 0 ? (agg.conditionGood / condTotal) * 100 : null;
    const fairPct = condTotal > 0 ? (agg.conditionFair / condTotal) * 100 : null;
    const poorPct = condTotal > 0 ? (agg.conditionPoor / condTotal) * 100 : null;

    await sql`
      INSERT INTO environment.tree_inventory
        (neighborhood, tree_count, top_species, avg_diameter,
         condition_good_pct, condition_fair_pct, condition_poor_pct, updated_at)
      VALUES (
        ${hood}, ${agg.count}, ${topSpecies},
        ${avgDiam !== null ? Math.round(avgDiam * 10) / 10 : null},
        ${goodPct !== null ? Math.round(goodPct * 10) / 10 : null},
        ${fairPct !== null ? Math.round(fairPct * 10) / 10 : null},
        ${poorPct !== null ? Math.round(poorPct * 10) / 10 : null},
        NOW()
      )
      ON CONFLICT (neighborhood) DO UPDATE SET
        tree_count = EXCLUDED.tree_count,
        top_species = EXCLUDED.top_species,
        avg_diameter = EXCLUDED.avg_diameter,
        condition_good_pct = EXCLUDED.condition_good_pct,
        condition_fair_pct = EXCLUDED.condition_fair_pct,
        condition_poor_pct = EXCLUDED.condition_poor_pct,
        updated_at = NOW()
    `;
    inserted++;
  }

  if (inserted > 0) {
    await sql`
      DELETE FROM public.dashboard_cache WHERE question IN ('environment', 'environment_detail')
    `.catch(() => {});
  }

  return {
    source: "Tree Inventory",
    status: "ok",
    rows: inserted,
    message: `Aggregated ${fetched.toLocaleString()} trees into ${inserted} neighborhoods`,
    ms: Date.now() - t0,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// MANUAL-ONLY SOURCES (log reminders, do not attempt to fetch)
// ════════════════════════════════════════════════════════════════════════════

function manualSources(): RefreshResult[] {
  return [
    {
      source: "BOEC 911 Data",
      status: "manual",
      message: "Requires manual encoding from BOEC Director's Report PDFs (portland.gov/911). Run: npx tsx ingest/seed-boec-downtown.ts --boec-only",
    },
    {
      source: "Downtown Foot Traffic",
      status: "manual",
      message: "Requires manual encoding from Portland Clean & Safe / Placer.ai reports. Run: npx tsx ingest/seed-boec-downtown.ts --downtown-only",
    },
    {
      source: "Downtown Office Vacancy",
      status: "manual",
      message: "Requires manual encoding from CBRE / Colliers broker reports. Run: npx tsx ingest/seed-boec-downtown.ts --downtown-only",
    },
    {
      source: "ODE Education Data",
      status: "manual",
      message: "XLSX downloads from oregon.gov/ode (enrollment, graduation, test scores, chronic absenteeism). Run: npx tsx ingest/seed-education-data.ts",
    },
    {
      source: "GHG Emissions",
      status: "manual",
      message: "Requires manual encoding from BPS Multnomah County GHG report. Run: npx tsx ingest/seed-trees-ghg-budget.ts --ghg-only",
    },
    {
      source: "Budget Program Offers",
      status: "manual",
      message: "Requires downloaded Excel files from portland.gov/budget. Run: npx tsx ingest/seed-trees-ghg-budget.ts --budget-only",
    },
  ];
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope") as Scope | null;

  // Two Vercel cron entries drive this route. They are distinguished by the
  // ?scope= query string in vercel.json, which is part of the cron path and
  // arrives as an ordinary search param.
  //
  // The schedule header below is a documented Vercel behaviour we do not rely
  // on: it is kept only so a cron entry that predates the query strings still
  // does the right thing rather than silently running the full monthly suite
  // every week.
  const WEEKLY_ZILLOW_SCHEDULE = "20 7 * * 4";
  const cronSchedule = request.headers.get("x-vercel-cron-schedule");

  // Determine what to run
  let activeScopes: Scope[];
  if (scopeParam === "all") {
    activeScopes = ["monthly", "quarterly", "annual"];
  } else if (scopeParam) {
    activeScopes = [scopeParam];
  } else if (cronSchedule === WEEKLY_ZILLOW_SCHEDULE) {
    activeScopes = ["zillow"];
  } else {
    // Auto-determine from current month
    activeScopes = autoScope();
  }

  console.log(`[refresh-data] Starting. Scopes: ${activeScopes.join(", ")}`);

  const results: RefreshResult[] = [];

  // ── Zillow-only scope (weekly cron) ──────────────────────────────────
  // Zillow publishes monthly but on its own schedule; a weekly check keeps
  // the housing headline from going 4-8 weeks stale between monthly runs.

  if (activeScopes.includes("zillow") && !activeScopes.includes("monthly")) {
    try {
      const r = await refreshZillowRent();
      results.push(r);
      console.log(`[refresh-data] Zillow ZORI (weekly): ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "Zillow ZORI Rent",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ── Monthly sources ──────────────────────────────────────────────────

  if (activeScopes.includes("monthly")) {
    console.log("[refresh-data] Running monthly sources...");

    try {
      const r = await refreshBLSQCEW();
      results.push(r);
      console.log(`[refresh-data] BLS QCEW: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "BLS QCEW (Portland MSA)",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const r = await refreshTriMetRidership();
      results.push(r);
      console.log(`[refresh-data] TriMet: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "TriMet Ridership (NTD)",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const r = await refreshZillowRent();
      results.push(r);
      console.log(`[refresh-data] Zillow ZORI: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "Zillow ZORI Rent",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    // Flag manual monthly source
    results.push({
      source: "BOEC 911 Data",
      status: "manual",
      message: "Requires manual encoding from BOEC Director's Report PDFs",
    });
  }

  // ── Quarterly sources ────────────────────────────────────────────────

  if (activeScopes.includes("quarterly")) {
    console.log("[refresh-data] Running quarterly sources...");

    try {
      const r = await refreshCensusDemographics();
      results.push(r);
      console.log(`[refresh-data] Census ACS: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "Census ACS Demographics",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    // Flag manual quarterly sources
    results.push({
      source: "Downtown Foot Traffic",
      status: "manual",
      message: "Requires manual encoding from Clean & Safe reports",
    });
    results.push({
      source: "Downtown Office Vacancy",
      status: "manual",
      message: "Requires manual encoding from broker reports",
    });
  }

  // ── Annual sources ───────────────────────────────────────────────────

  if (activeScopes.includes("annual")) {
    console.log("[refresh-data] Running annual sources...");

    try {
      const r = await refreshODOTCrashes();
      results.push(r);
      console.log(`[refresh-data] ODOT Crashes: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "ODOT Crash Data",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const r = await refreshTreeInventory();
      results.push(r);
      console.log(`[refresh-data] Tree Inventory: ${r.status} (${r.ms}ms)`);
    } catch (err: unknown) {
      results.push({
        source: "Tree Inventory",
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    // Flag manual annual sources
    results.push({
      source: "ODE Education Data",
      status: "manual",
      message: "XLSX downloads from oregon.gov/ode",
    });
    results.push({
      source: "GHG Emissions",
      status: "manual",
      message: "Manual encoding from BPS report",
    });
    results.push({
      source: "Budget Program Offers",
      status: "manual",
      message: "Excel from portland.gov/budget",
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────

  const totalMs = Date.now() - t0;
  const ok = results.filter((r) => r.status === "ok");
  const skipped = results.filter((r) => r.status === "skipped");
  const errors = results.filter((r) => r.status === "error");
  const manual = results.filter((r) => r.status === "manual");

  const summary = {
    ok: errors.length === 0,
    ms: totalMs,
    scopes: activeScopes,
    timestamp: new Date().toISOString(),
    counts: {
      refreshed: ok.length,
      skipped: skipped.length,
      errors: errors.length,
      needsManual: manual.length,
    },
    results,
    manualReminders: manual.length > 0
      ? manualSources().filter((m) =>
          results.some((r) => r.source === m.source && r.status === "manual"),
        )
      : [],
  };

  console.log(
    `[refresh-data] Done in ${totalMs}ms: ${ok.length} refreshed, ${skipped.length} skipped, ${errors.length} errors, ${manual.length} manual`,
  );

  return NextResponse.json(summary, {
    status: errors.length > 0 && ok.length === 0 ? 500 : 200,
  });
}
