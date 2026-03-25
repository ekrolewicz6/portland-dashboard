/**
 * fetch-census-qol.ts
 *
 * Fetches Census ACS 5-year data for quality-of-life metrics in Portland, OR:
 *   - Rent burden (B25070) — % of renters paying 30%+ of income on rent
 *   - Median gross rent (B25064)
 *   - Median household income (B19013)
 *   - Educational attainment (B15003) — % with bachelor's or higher
 *   - Health insurance coverage (B27001) — uninsured rate
 *
 * Inserts into quality.affordability and quality.context_stats tables.
 *
 * Cadence: Run annually after ACS 5-year release (typically December)
 *
 * Usage: npx tsx scripts/fetch-census-qol.ts
 *
 * Note: Census API works without a key (25 requests/day limit).
 * For higher limits, get a free key at https://api.census.gov/data/key_signup.html
 * and set CENSUS_API_KEY env var.
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const sql = postgres(DB_URL);

const CENSUS_KEY = process.env.CENSUS_API_KEY || "";
const KEY_PARAM = CENSUS_KEY ? `&key=${CENSUS_KEY}` : "";

const YEARS = [2023, 2022, 2021];
const GEO = "for=place:59000&in=state:41";
const SOURCE = "Census ACS 5-year";

// ── Helpers ─────────────────────────────────────────────────────────────

async function fetchJson(url: string): Promise<any> {
  console.log(`  Fetching: ${url.slice(0, 120)}...`);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** Try fetching a Census table for multiple years, return first success */
async function fetchWithYearFallback(
  vars: string,
  years: number[]
): Promise<{ data: string[][]; headers: string[]; year: number }> {
  for (const year of years) {
    const url = `https://api.census.gov/data/${year}/acs/acs5?get=${vars},NAME&${GEO}${KEY_PARAM}`;
    try {
      const raw = await fetchJson(url);
      const headers = raw[0] as string[];
      const rows = raw.slice(1) as string[][];
      console.log(`  ✓ Got data for ${year}`);
      return { data: rows, headers, year };
    } catch (err: any) {
      console.log(`  ✗ Year ${year} failed: ${err.message?.slice(0, 80)}`);
    }
  }
  throw new Error(`All years failed for vars: ${vars}`);
}

function parseVal(val: string | undefined): number | null {
  if (!val || val === "-666666666" || val === "-222222222" || val === "-333333333") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function col(headers: string[], row: string[], name: string): string | undefined {
  const idx = headers.indexOf(name);
  return idx >= 0 ? row[idx] : undefined;
}

// ── Step 1: Rent Burden (B25070) ────────────────────────────────────────

async function fetchRentBurden(): Promise<{ year: number; pct: number; totalRenters: number }> {
  console.log("\n=== Step 1: Rent Burden (B25070) ===");

  const vars = "B25070_001E,B25070_007E,B25070_008E,B25070_009E,B25070_010E";
  const { data, headers, year } = await fetchWithYearFallback(vars, YEARS);
  const row = data[0];

  const total = parseVal(col(headers, row, "B25070_001E"));
  const pct30_34 = parseVal(col(headers, row, "B25070_007E")) ?? 0;
  const pct35_39 = parseVal(col(headers, row, "B25070_008E")) ?? 0;
  const pct40_49 = parseVal(col(headers, row, "B25070_009E")) ?? 0;
  const pct50plus = parseVal(col(headers, row, "B25070_010E")) ?? 0;

  if (!total || total === 0) throw new Error("No total renters in B25070");

  const burdened = pct30_34 + pct35_39 + pct40_49 + pct50plus;
  const pct = Math.round((burdened / total) * 1000) / 10;

  console.log(`  Total renters: ${total.toLocaleString()}`);
  console.log(`  Rent-burdened (30%+): ${burdened.toLocaleString()} (${pct}%)`);

  return { year, pct, totalRenters: total };
}

// ── Step 2: Median Rent (B25064) ────────────────────────────────────────

async function fetchMedianRent(): Promise<{ year: number; medianRent: number }> {
  console.log("\n=== Step 2: Median Gross Rent (B25064) ===");

  const vars = "B25064_001E";
  const { data, headers, year } = await fetchWithYearFallback(vars, YEARS);
  const row = data[0];

  const medianRent = parseVal(col(headers, row, "B25064_001E"));
  if (!medianRent) throw new Error("No median rent in B25064");

  console.log(`  Median gross rent: $${medianRent.toLocaleString()}`);

  return { year, medianRent };
}

// ── Step 3: Median Household Income (B19013) ────────────────────────────

async function fetchMedianIncome(): Promise<{ year: number; medianIncome: number }> {
  console.log("\n=== Step 3: Median Household Income (B19013) ===");

  const vars = "B19013_001E";
  const { data, headers, year } = await fetchWithYearFallback(vars, YEARS);
  const row = data[0];

  const medianIncome = parseVal(col(headers, row, "B19013_001E"));
  if (!medianIncome) throw new Error("No median income in B19013");

  console.log(`  Median household income: $${medianIncome.toLocaleString()}`);

  return { year, medianIncome };
}

// ── Step 4: Educational Attainment (B15003) ─────────────────────────────

async function fetchEducation(): Promise<{ year: number; pct: number }> {
  console.log("\n=== Step 4: Educational Attainment (B15003) ===");

  const vars = "B15003_001E,B15003_022E,B15003_023E,B15003_024E,B15003_025E";
  const { data, headers, year } = await fetchWithYearFallback(vars, YEARS);
  const row = data[0];

  const total = parseVal(col(headers, row, "B15003_001E"));
  const bachelors = parseVal(col(headers, row, "B15003_022E")) ?? 0;
  const masters = parseVal(col(headers, row, "B15003_023E")) ?? 0;
  const professional = parseVal(col(headers, row, "B15003_024E")) ?? 0;
  const doctorate = parseVal(col(headers, row, "B15003_025E")) ?? 0;

  if (!total || total === 0) throw new Error("No total pop 25+ in B15003");

  const degreeHolders = bachelors + masters + professional + doctorate;
  const pct = Math.round((degreeHolders / total) * 1000) / 10;

  console.log(`  Pop 25+: ${total.toLocaleString()}`);
  console.log(`  Bachelor's+: ${degreeHolders.toLocaleString()} (${pct}%)`);

  return { year, pct };
}

// ── Step 5: Health Insurance (B27001) ───────────────────────────────────

async function fetchUninsured(): Promise<{ year: number; pct: number }> {
  console.log("\n=== Step 5: Health Insurance Coverage (B27001) ===");

  // B27001: total pop (001E) and uninsured by age groups
  // Male uninsured: 005E (under 6), 008E (6-18), 011E (19-25), 014E (26-34),
  //   017E (35-44), 020E (45-54), 023E (55-64), 026E (65-74), 029E (75+)
  // Female: 033E, 036E, 039E, 042E, 045E, 048E, 051E, 054E, 057E
  // Simpler approach: use B27010_001E (total) and B27010_017E (no insurance, under 19)
  // Actually, let's use the subject table approach with B27010
  // B27010_001E = total civilian noninstitutionalized, B27010_050E = total uninsured
  const vars = "B27010_001E,B27010_050E";
  const { data, headers, year } = await fetchWithYearFallback(vars, YEARS);
  const row = data[0];

  const total = parseVal(col(headers, row, "B27010_001E"));
  const uninsured = parseVal(col(headers, row, "B27010_050E"));

  if (!total || total === 0) throw new Error("No total pop in B27010");
  if (uninsured === null) throw new Error("No uninsured count in B27010");

  const pct = Math.round((uninsured / total) * 1000) / 10;

  console.log(`  Total civilian noninst. pop: ${total.toLocaleString()}`);
  console.log(`  Uninsured: ${uninsured.toLocaleString()} (${pct}%)`);

  return { year, pct };
}

// ── DB Setup + Insert ───────────────────────────────────────────────────

async function ensureTables() {
  console.log("\n=== Creating schema and tables ===");

  await sql`CREATE SCHEMA IF NOT EXISTS quality`;

  await sql`
    CREATE TABLE IF NOT EXISTS quality.affordability (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL,
      metric TEXT NOT NULL,
      value NUMERIC(12,2),
      source TEXT,
      UNIQUE(year, metric)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quality.context_stats (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      value TEXT NOT NULL,
      context TEXT,
      source TEXT,
      as_of_date DATE,
      UNIQUE(metric)
    )
  `;

  console.log("  Tables ready");
}

async function upsertAffordability(year: number, metric: string, value: number, source: string) {
  await sql`
    INSERT INTO quality.affordability (year, metric, value, source)
    VALUES (${year}, ${metric}, ${value}, ${source})
    ON CONFLICT (year, metric) DO UPDATE SET
      value = EXCLUDED.value,
      source = EXCLUDED.source
  `;
  console.log(`  Upserted affordability: ${metric} = ${value} (${year})`);
}

async function upsertContextStat(
  metric: string,
  value: string,
  context: string,
  source: string,
  asOfDate: string
) {
  await sql`
    INSERT INTO quality.context_stats (metric, value, context, source, as_of_date)
    VALUES (${metric}, ${value}, ${context}, ${source}, ${asOfDate})
    ON CONFLICT (metric) DO UPDATE SET
      value = EXCLUDED.value,
      context = EXCLUDED.context,
      source = EXCLUDED.source,
      as_of_date = EXCLUDED.as_of_date
  `;
  console.log(`  Upserted context_stats: ${metric} = ${value}`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Fetch Census ACS Quality-of-Life Metrics for Portland, OR ===");
  console.log(`  Using Census API ${CENSUS_KEY ? "with" : "WITHOUT"} API key`);

  await ensureTables();

  // Fetch all metrics
  const [rentBurden, medianRent, medianIncome, education, uninsured] =
    await Promise.all([
      fetchRentBurden(),
      fetchMedianRent(),
      fetchMedianIncome(),
      fetchEducation(),
      fetchUninsured(),
    ]);

  // Insert into quality.affordability
  console.log("\n=== Inserting into quality.affordability ===");
  await upsertAffordability(rentBurden.year, "rent_burden_pct", rentBurden.pct, SOURCE);
  await upsertAffordability(medianRent.year, "median_rent", medianRent.medianRent, SOURCE);
  await upsertAffordability(medianIncome.year, "median_income", medianIncome.medianIncome, SOURCE);
  await upsertAffordability(uninsured.year, "uninsured_pct", uninsured.pct, SOURCE);

  // Insert into quality.context_stats
  console.log("\n=== Inserting into quality.context_stats ===");
  await upsertContextStat(
    "bachelors_or_higher_pct",
    String(education.pct),
    `${education.pct}% of Portland residents 25+ hold a bachelor's degree or higher`,
    `${SOURCE} ${education.year}`,
    `${education.year}-12-31`
  );
  await upsertContextStat(
    "uninsured_pct",
    String(uninsured.pct),
    `${uninsured.pct}% of Portland civilian noninstitutionalized population lacks health insurance`,
    `${SOURCE} ${uninsured.year}`,
    `${uninsured.year}-12-31`
  );
  await upsertContextStat(
    "rent_burden_pct",
    String(rentBurden.pct),
    `${rentBurden.pct}% of Portland renters pay 30%+ of income on rent`,
    `${SOURCE} ${rentBurden.year}`,
    `${rentBurden.year}-12-31`
  );
  await upsertContextStat(
    "median_rent",
    String(medianRent.medianRent),
    `Median gross rent in Portland: $${medianRent.medianRent.toLocaleString()}/month`,
    `${SOURCE} ${medianRent.year}`,
    `${medianRent.year}-12-31`
  );
  await upsertContextStat(
    "median_income",
    String(medianIncome.medianIncome),
    `Median household income in Portland: $${medianIncome.medianIncome.toLocaleString()}`,
    `${SOURCE} ${medianIncome.year}`,
    `${medianIncome.year}-12-31`
  );

  // Verify
  console.log("\n=== Verification ===");

  const affRows = await sql`
    SELECT year, metric, value FROM quality.affordability ORDER BY year DESC, metric
  `;
  console.log(`  quality.affordability: ${affRows.length} rows`);
  for (const r of affRows) {
    console.log(`    ${r.year} | ${r.metric} = ${r.value}`);
  }

  const ctxRows = await sql`
    SELECT metric, value, as_of_date FROM quality.context_stats ORDER BY metric
  `;
  console.log(`  quality.context_stats: ${ctxRows.length} rows`);
  for (const r of ctxRows) {
    console.log(`    ${r.metric} = ${r.value} (as of ${r.as_of_date})`);
  }

  await sql.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
