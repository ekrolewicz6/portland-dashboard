/**
 * fetch-qcew.ts
 *
 * Fetches Quarterly Census of Employment and Wages (QCEW) data from BLS
 * for Multnomah County (FIPS 41051), private sector, high-level industries.
 * Goes back 10 years (40 quarters).
 *
 * API: https://data.bls.gov/cew/data/api/{year}/{qtr}/area/{area_fips}.csv
 * No API key needed. No rate limit documented but we add small delays.
 *
 * Usage: npx tsx scripts/fetch-qcew.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
fs.mkdirSync(DATA_DIR, { recursive: true });

const sql = postgres(DB_URL);

const AREA_FIPS = "41051"; // Multnomah County, Oregon

// High-level industry codes we want (own_code=5 = private sector)
const TARGET_INDUSTRY_CODES = new Set([
  "10",   // Total, all industries
  "101",  // Goods-producing
  "102",  // Service-providing
  "1011", // Natural resources and mining
  "1012", // Construction
  "1013", // Manufacturing
  "1021", // Trade, transportation, and utilities
  "1022", // Information
  "1023", // Financial activities
  "1024", // Professional and business services
  "1025", // Education and health services
  "1026", // Leisure and hospitality
  "1027", // Other services
  "1029", // Unclassified
]);

const INDUSTRY_LABELS: Record<string, string> = {
  "10":   "Total, all industries",
  "101":  "Goods-producing",
  "102":  "Service-providing",
  "1011": "Natural resources and mining",
  "1012": "Construction",
  "1013": "Manufacturing",
  "1021": "Trade, transportation, and utilities",
  "1022": "Information",
  "1023": "Financial activities",
  "1024": "Professional and business services",
  "1025": "Education and health services",
  "1026": "Leisure and hospitality",
  "1027": "Other services",
  "1029": "Unclassified",
};

interface QCEWRow {
  year: number;
  quarter: number;
  industry_code: string;
  industry_title: string;
  own_code: number;
  establishments: number;
  month1_employment: number;
  month2_employment: number;
  month3_employment: number;
  total_quarterly_wages: number;
  avg_weekly_wage: number;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header — handle quoted fields
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

async function fetchQuarter(year: number, quarter: number): Promise<QCEWRow[]> {
  const url = `https://data.bls.gov/cew/data/api/${year}/${quarter}/area/${AREA_FIPS}.csv`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`    HTTP ${res.status} for ${year} Q${quarter} — skipping`);
    return [];
  }

  const text = await res.text();
  if (!text || text.length < 100) {
    console.log(`    Empty response for ${year} Q${quarter} — skipping`);
    return [];
  }

  const csvRows = parseCSV(text);

  // Filter: own_code=5 (private), high-level industry codes
  const filtered = csvRows.filter((r) => {
    return (
      r.own_code === "5" &&
      TARGET_INDUSTRY_CODES.has(r.industry_code)
    );
  });

  return filtered.map((r) => ({
    year: parseInt(r.year),
    quarter: parseInt(r.qtr),
    industry_code: r.industry_code,
    industry_title: INDUSTRY_LABELS[r.industry_code] ?? r.industry_code,
    own_code: parseInt(r.own_code),
    establishments: parseInt(r.qtrly_estabs) || 0,
    month1_employment: parseInt(r.month1_emplvl) || 0,
    month2_employment: parseInt(r.month2_emplvl) || 0,
    month3_employment: parseInt(r.month3_emplvl) || 0,
    total_quarterly_wages: parseInt(r.total_qtrly_wages) || 0,
    avg_weekly_wage: parseInt(r.avg_wkly_wage) || 0,
  }));
}

async function main() {
  console.log("Portland Dashboard — QCEW Employment & Wages Fetch");
  console.log("===================================================");
  console.log(`  Area: Multnomah County (FIPS ${AREA_FIPS})`);
  console.log(`  Sector: Private (own_code=5)`);
  console.log(`  Industries: ${TARGET_INDUSTRY_CODES.size} high-level categories`);
  console.log();

  // Create table
  await sql`CREATE SCHEMA IF NOT EXISTS economy`;
  await sql`
    CREATE TABLE IF NOT EXISTS economy.qcew_employment (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL,
      quarter INT NOT NULL,
      industry_code TEXT NOT NULL,
      industry_title TEXT NOT NULL,
      own_code INT DEFAULT 5,
      establishments INT,
      month1_employment INT,
      month2_employment INT,
      month3_employment INT,
      total_quarterly_wages BIGINT,
      avg_weekly_wage INT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(year, quarter, industry_code, own_code)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_qcew_year_qtr
    ON economy.qcew_employment(year, quarter)
  `;

  // Fetch 10 years of data (2016 Q1 through latest available)
  const currentYear = new Date().getFullYear();
  const allRows: QCEWRow[] = [];
  let fetchCount = 0;

  for (let year = 2016; year <= currentYear; year++) {
    for (let qtr = 1; qtr <= 4; qtr++) {
      // Don't fetch future quarters
      if (year === currentYear && qtr > Math.ceil((new Date().getMonth() + 1) / 3)) {
        continue;
      }

      process.stdout.write(`  Fetching ${year} Q${qtr}...`);
      const rows = await fetchQuarter(year, qtr);
      fetchCount++;

      if (rows.length > 0) {
        allRows.push(...rows);
        console.log(` ${rows.length} industry records`);
      } else {
        console.log(` no data`);
      }

      // Small delay to be respectful (no documented rate limit but be polite)
      if (fetchCount % 4 === 0) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  console.log(`\n  Total records fetched: ${allRows.length}`);

  if (allRows.length === 0) {
    console.log("  No data fetched. Exiting.");
    await sql.end();
    process.exit(0);
  }

  // Save raw data
  fs.writeFileSync(
    path.join(DATA_DIR, "qcew_multnomah.json"),
    JSON.stringify(allRows, null, 2)
  );
  console.log(`  Saved to data/qcew_multnomah.json`);

  // Upsert into DB
  console.log("\n=== Inserting QCEW Data into PostgreSQL ===");
  let inserted = 0;
  let updated = 0;

  for (const row of allRows) {
    const result = await sql`
      INSERT INTO economy.qcew_employment (
        year, quarter, industry_code, industry_title, own_code,
        establishments, month1_employment, month2_employment, month3_employment,
        total_quarterly_wages, avg_weekly_wage
      ) VALUES (
        ${row.year}, ${row.quarter}, ${row.industry_code}, ${row.industry_title}, ${row.own_code},
        ${row.establishments}, ${row.month1_employment}, ${row.month2_employment}, ${row.month3_employment},
        ${row.total_quarterly_wages}, ${row.avg_weekly_wage}
      )
      ON CONFLICT (year, quarter, industry_code, own_code) DO UPDATE SET
        industry_title = EXCLUDED.industry_title,
        establishments = EXCLUDED.establishments,
        month1_employment = EXCLUDED.month1_employment,
        month2_employment = EXCLUDED.month2_employment,
        month3_employment = EXCLUDED.month3_employment,
        total_quarterly_wages = EXCLUDED.total_quarterly_wages,
        avg_weekly_wage = EXCLUDED.avg_weekly_wage
    `;
    if (result.count > 0) {
      inserted++;
    } else {
      updated++;
    }
  }

  console.log(`  Inserted: ${inserted}, Updated: ${updated}`);

  // Verification
  const verify = await sql`
    SELECT
      year, quarter, industry_code, industry_title,
      month3_employment AS employment,
      avg_weekly_wage,
      total_quarterly_wages
    FROM economy.qcew_employment
    WHERE industry_code = '10'
    ORDER BY year, quarter
  `;

  console.log(`\n  Total Private Employment Trend (Multnomah County):`);
  for (const r of verify) {
    const wages = Number(r.total_quarterly_wages);
    const wageStr = wages >= 1_000_000_000
      ? `$${(wages / 1_000_000_000).toFixed(2)}B`
      : `$${(wages / 1_000_000).toFixed(0)}M`;
    console.log(
      `    ${r.year} Q${r.quarter}: ${Number(r.employment).toLocaleString()} employed, ` +
      `$${r.avg_weekly_wage}/wk avg wage, ${wageStr} total wages`
    );
  }

  // Industry summary for latest quarter
  const latest = await sql`
    SELECT industry_code, industry_title, month3_employment, avg_weekly_wage, establishments
    FROM economy.qcew_employment
    WHERE (year, quarter) = (
      SELECT year, quarter FROM economy.qcew_employment ORDER BY year DESC, quarter DESC LIMIT 1
    )
    AND industry_code != '10' AND industry_code != '101' AND industry_code != '102'
    ORDER BY month3_employment DESC
  `;

  console.log(`\n  Latest Quarter — Employment by Industry:`);
  for (const r of latest) {
    console.log(
      `    ${r.industry_title}: ${Number(r.month3_employment).toLocaleString()} employed, ` +
      `$${r.avg_weekly_wage}/wk, ${Number(r.establishments).toLocaleString()} establishments`
    );
  }

  console.log("\n===================================================");
  console.log("QCEW fetch complete!");

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
