#!/usr/bin/env npx tsx
/**
 * seed-trees-ghg-budget.ts
 *
 * Ingests three datasets into the Portland Civic Dashboard:
 *
 *   1. Street Tree Inventory — ArcGIS (253K+ trees), aggregated by neighborhood
 *   2. GHG Emissions by Sector — manual encoding from BPS 2023 report
 *   3. Budget Program Offers — parsed from downloaded Excel files
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx ingest/seed-trees-ghg-budget.ts
 *   npx tsx ingest/seed-trees-ghg-budget.ts --trees-only
 *   npx tsx ingest/seed-trees-ghg-budget.ts --ghg-only
 *   npx tsx ingest/seed-trees-ghg-budget.ts --budget-only
 */

import postgres from "postgres";
import * as XLSX from "xlsx";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { requireDatabaseUrl } from "./lib/db-url";

// ── CLI flags ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const treesOnly = args.includes("--trees-only");
const ghgOnly = args.includes("--ghg-only");
const budgetOnly = args.includes("--budget-only");
const runAll = !treesOnly && !ghgOnly && !budgetOnly;

// ── DB connection ──────────────────────────────────────────────────────────

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
      onnotice: () => {},
    });
  }
  return postgres(DB_URL, { prepare: false, max: 1, onnotice: () => {} });
}

const sql = makeSQL();

// ═══════════════════════════════════════════════════════════════════════════
// 1. STREET TREE INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

const TREE_ENDPOINT =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Street_Tree_Inventory_Active/MapServer/4/query";
const PAGE_SIZE = 2000;

interface TreeRecord {
  NEIGHBORHOOD: string | null;
  SPECIES: string | null;
  DIAMETER: number | null;
  Condition: string | null;
}

interface NeighborhoodAgg {
  count: number;
  speciesCounts: Record<string, number>;
  diameters: number[];
  conditionGood: number;
  conditionFair: number;
  conditionPoor: number;
}

/**
 * ArcGIS answers `f=json` queries with HTTP 200 even when the query failed,
 * so the error envelope is part of the same shape.
 */
interface ArcGISQueryResponse {
  // The query names its outFields, so the attributes are exactly a TreeRecord.
  features?: { attributes: TreeRecord }[];
  exceededTransferLimit?: boolean;
  error?: { code?: number; message?: string };
}

async function fetchTreeCount(): Promise<number> {
  const url = `${TREE_ENDPOINT}?where=1%3D1&returnCountOnly=true&f=json`;
  const res = await fetch(url);
  const data = (await res.json()) as { count: number };
  return data.count;
}

async function fetchTreePage(offset: number): Promise<TreeRecord[]> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "NEIGHBORHOOD,SPECIES,DIAMETER,Condition",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE_SIZE),
    f: "json",
  });
  const res = await fetch(`${TREE_ENDPOINT}?${params}`);
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
  const data = (await res.json()) as ArcGISQueryResponse;
  if (data.error) throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
  return (data.features || []).map((f) => f.attributes);
}

function normalizeCondition(c: string | null): "Good" | "Fair" | "Poor" | null {
  if (!c) return null;
  const lower = c.trim().toLowerCase();
  if (lower === "good") return "Good";
  if (lower === "fair") return "Fair";
  if (lower === "poor" || lower === "dead" || lower === "dying") return "Poor";
  return null;
}

async function seedTrees() {
  console.log("\n" + "=".repeat(60));
  console.log("1. STREET TREE INVENTORY");
  console.log("=".repeat(60));

  // Test endpoint
  console.log("  Testing ArcGIS endpoint...");
  const totalCount = await fetchTreeCount();
  console.log(`  Total trees in dataset: ${totalCount.toLocaleString()}`);

  // Create tables
  await sql`CREATE SCHEMA IF NOT EXISTS environment`;

  await sql`
    CREATE TABLE IF NOT EXISTS environment.tree_inventory (
      id SERIAL PRIMARY KEY,
      neighborhood TEXT,
      tree_count INT,
      top_species TEXT[],
      avg_diameter NUMERIC(5,1),
      condition_good_pct NUMERIC(5,1),
      condition_fair_pct NUMERIC(5,1),
      condition_poor_pct NUMERIC(5,1),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(neighborhood)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS environment.tree_canopy (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL UNIQUE,
      citywide_pct NUMERIC(4,1),
      commercial_pct NUMERIC(4,1),
      industrial_pct NUMERIC(4,1),
      open_space_pct NUMERIC(4,1),
      residential_pct NUMERIC(4,1),
      source TEXT DEFAULT 'Portland Tree Canopy Monitoring Report'
    )
  `;

  // Fetch all trees in pages
  console.log(`  Fetching ${totalCount.toLocaleString()} trees in pages of ${PAGE_SIZE}...`);
  const neighborhoods = new Map<string, NeighborhoodAgg>();
  let fetched = 0;
  let pageNum = 0;

  while (fetched < totalCount) {
    const records = await fetchTreePage(fetched);
    if (records.length === 0) break;

    for (const tree of records) {
      const hood = tree.NEIGHBORHOOD?.trim() || "Unknown";
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

      if (tree.SPECIES) {
        const sp = tree.SPECIES.trim();
        agg.speciesCounts[sp] = (agg.speciesCounts[sp] || 0) + 1;
      }

      if (tree.DIAMETER != null && tree.DIAMETER > 0 && tree.DIAMETER < 200) {
        agg.diameters.push(tree.DIAMETER);
      }

      const cond = normalizeCondition(tree.Condition);
      if (cond === "Good") agg.conditionGood++;
      else if (cond === "Fair") agg.conditionFair++;
      else if (cond === "Poor") agg.conditionPoor++;
    }

    fetched += records.length;
    pageNum++;
    if (pageNum % 10 === 0 || fetched >= totalCount) {
      console.log(`    Fetched ${fetched.toLocaleString()} / ${totalCount.toLocaleString()} (${Math.round((fetched / totalCount) * 100)}%)`);
    }
  }

  console.log(`  Aggregated ${neighborhoods.size} neighborhoods from ${fetched.toLocaleString()} trees`);

  // Insert aggregated data
  let inserted = 0;
  for (const [hood, agg] of neighborhoods) {
    // Top 5 species
    const topSpecies = Object.entries(agg.speciesCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sp]) => sp);

    // Average diameter
    const avgDiam =
      agg.diameters.length > 0
        ? agg.diameters.reduce((a, b) => a + b, 0) / agg.diameters.length
        : null;

    // Condition distribution (only count trees with a condition rating)
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

  console.log(`  Inserted/updated ${inserted} neighborhood summaries`);

  // Seed canopy data
  console.log("  Seeding tree canopy coverage...");
  const canopyData = [
    { year: 2000, citywide_pct: 29.0 },
    { year: 2005, citywide_pct: 30.5 },
    { year: 2010, citywide_pct: 30.7 },
    { year: 2015, citywide_pct: 30.7 },
    { year: 2020, citywide_pct: 29.8 },
  ];

  for (const row of canopyData) {
    await sql`
      INSERT INTO environment.tree_canopy (year, citywide_pct)
      VALUES (${row.year}, ${row.citywide_pct})
      ON CONFLICT (year) DO UPDATE SET
        citywide_pct = EXCLUDED.citywide_pct
    `;
  }
  console.log(`  Inserted ${canopyData.length} canopy data points`);

  // Summary
  const treeCount = await sql`SELECT SUM(tree_count)::int AS total FROM environment.tree_inventory`;
  const hoodCount = await sql`SELECT COUNT(*)::int AS n FROM environment.tree_inventory`;
  const topHoods = await sql`
    SELECT neighborhood, tree_count
    FROM environment.tree_inventory
    ORDER BY tree_count DESC LIMIT 5
  `;
  console.log(`\n  Summary: ${treeCount[0].total?.toLocaleString()} trees across ${hoodCount[0].n} neighborhoods`);
  console.log("  Top 5 neighborhoods by tree count:");
  for (const h of topHoods) {
    console.log(`    ${h.neighborhood}: ${Number(h.tree_count).toLocaleString()}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. GHG EMISSIONS BY SECTOR
// ═══════════════════════════════════════════════════════════════════════════

async function seedGHG() {
  console.log("\n" + "=".repeat(60));
  console.log("2. GHG EMISSIONS BY SECTOR");
  console.log("=".repeat(60));

  await sql`CREATE SCHEMA IF NOT EXISTS environment`;

  // Check existing table structure
  const existingCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'environment' AND table_name = 'ghg_emissions'
    ORDER BY ordinal_position
  `;
  const colNames = existingCols.map((c: any) => c.column_name);
  console.log(`  Existing ghg_emissions columns: ${colNames.join(", ") || "(table does not exist)"}`);

  // The existing table has: year, sector, mtco2e, source_detail, created_at
  // We'll upsert into it using the existing schema
  if (colNames.includes("mtco2e")) {
    console.log("  Using existing table schema (year, sector, mtco2e, source_detail)");

    // Need to check for unique constraint
    const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'environment' AND table_name = 'ghg_emissions'
    `;
    console.log(`  Constraints: ${constraints.map((c: any) => c.constraint_name + '(' + c.constraint_type + ')').join(", ")}`);

    // Add unique constraint if missing
    const hasUnique = constraints.some(
      (c: any) => c.constraint_type === "UNIQUE" || c.constraint_name.includes("year_sector")
    );
    if (!hasUnique) {
      console.log("  Adding UNIQUE(year, sector) constraint...");
      try {
        await sql`
          ALTER TABLE environment.ghg_emissions
          ADD CONSTRAINT ghg_emissions_year_sector_key UNIQUE (year, sector)
        `;
      } catch (e: any) {
        // May already exist under different name or have duplicate data
        console.log(`  Constraint add note: ${e.message}`);
        // Clear existing data and re-insert
        await sql`DELETE FROM environment.ghg_emissions`;
        await sql`
          ALTER TABLE environment.ghg_emissions
          ADD CONSTRAINT ghg_emissions_year_sector_key UNIQUE (year, sector)
        `;
      }
    }
  } else {
    // Table doesn't exist at all, create fresh
    console.log("  Creating environment.ghg_emissions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS environment.ghg_emissions (
        year SMALLINT NOT NULL,
        sector TEXT NOT NULL,
        mtco2e NUMERIC NOT NULL,
        source_detail TEXT DEFAULT 'BPS Multnomah County GHG Inventory',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(year, sector)
      )
    `;
  }

  // BPS 2023 Carbon Emissions data by sector
  const emissionsData = [
    { year: 1990, residential: 1723000, commercial: 1874000, industrial: 1890000, transportation: 3165000, solid_waste: 553000 },
    { year: 1995, residential: 1870000, commercial: 2080000, industrial: 2050000, transportation: 3250000, solid_waste: 510000 },
    { year: 2000, residential: 2005000, commercial: 2390000, industrial: 2297000, transportation: 3285000, solid_waste: 459000 },
    { year: 2005, residential: 1803000, commercial: 2292000, industrial: 1955000, transportation: 3271000, solid_waste: 180000 },
    { year: 2010, residential: 1553000, commercial: 1891000, industrial: 1334000, transportation: 3243000, solid_waste: 103000 },
    { year: 2013, residential: 1534000, commercial: 2107000, industrial: 1461000, transportation: 3053000, solid_waste: 102000 },
    { year: 2015, residential: 1438000, commercial: 2004000, industrial: 1391000, transportation: 3055000, solid_waste: 114000 },
    { year: 2017, residential: 1324000, commercial: 1787000, industrial: 1095000, transportation: 3192000, solid_waste: 116000 },
    { year: 2019, residential: 1295000, commercial: 1828000, industrial: 887000, transportation: 3024000, solid_waste: 121000 },
    { year: 2020, residential: 1177000, commercial: 1480000, industrial: 837000, transportation: 2840000, solid_waste: 120000 },
    { year: 2021, residential: 1355000, commercial: 1792000, industrial: 828000, transportation: 2697000, solid_waste: 122000 },
    { year: 2022, residential: 1261000, commercial: 1659000, industrial: 776000, transportation: 2687000, solid_waste: 123000 },
    { year: 2023, residential: 1265000, commercial: 1638000, industrial: 790000, transportation: 2757000, solid_waste: 125000 },
  ];

  const source = "BPS Multnomah County GHG Inventory 2023";
  let inserted = 0;

  for (const row of emissionsData) {
    const sectors: { sector: string; value: number }[] = [
      { sector: "Residential", value: row.residential },
      { sector: "Commercial", value: row.commercial },
      { sector: "Industrial", value: row.industrial },
      { sector: "Transportation", value: row.transportation },
      { sector: "Solid Waste", value: row.solid_waste },
      {
        sector: "Total",
        value:
          row.residential +
          row.commercial +
          row.industrial +
          row.transportation +
          row.solid_waste,
      },
    ];

    for (const s of sectors) {
      await sql`
        INSERT INTO environment.ghg_emissions (year, sector, mtco2e, source_detail)
        VALUES (${row.year}, ${s.sector}, ${s.value}, ${source})
        ON CONFLICT (year, sector) DO UPDATE SET
          mtco2e = EXCLUDED.mtco2e,
          source_detail = EXCLUDED.source_detail
      `;
      inserted++;
    }
  }

  console.log(`  Inserted/updated ${inserted} emission rows (${emissionsData.length} years x 6 sectors)`);

  // Summary
  const latest = await sql`
    SELECT year, sector, mtco2e
    FROM environment.ghg_emissions
    WHERE year = 2023
    ORDER BY mtco2e DESC
  `;
  console.log("\n  2023 emissions by sector:");
  for (const r of latest) {
    console.log(`    ${r.sector}: ${Number(r.mtco2e).toLocaleString()} MT CO2e`);
  }

  const trend = await sql`
    SELECT year, mtco2e
    FROM environment.ghg_emissions
    WHERE sector = 'Total'
    ORDER BY year
  `;
  console.log("  Total emissions trend:");
  for (const r of trend) {
    console.log(`    ${r.year}: ${Number(r.mtco2e).toLocaleString()}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. BUDGET PROGRAM OFFERS
// ═══════════════════════════════════════════════════════════════════════════

interface ProgramOfferRow {
  service_area: string;
  bureau: string;
  program_offer: string;
  fy_2024_25: number | null;
  fy_2025_26: number | null;
  fy_2026_27: number | null;
  fund_type: string;
}

/**
 * Parse a program offers Excel sheet with hierarchy:
 *   Row 0: Headers
 *   Row 1: Service Area total (SA4 - Public Safety, etc.)
 *   Rows 2..N-1: Bureau subtotals interleaved with Program Offer rows
 *   Row N: Grand Total
 *
 * Bureau rows are subtotals whose values equal the sum of subsequent rows
 * until the next bureau. We validate across ALL THREE FY columns to avoid
 * false positives from accidental partial-sum matches in a single column.
 */
function parseProgramOffersSheet(
  rows: any[][],
  fundType: string
): ProgramOfferRow[] {
  const results: ProgramOfferRow[] = [];
  if (rows.length < 3) return results;

  // Row 0 = headers, Row 1 = Service Area total, last row = Grand Total
  const saRow = rows[1];
  const saLabel = String(saRow[0] || "").trim();
  // Extract service area name: "SA4 - Public Safety" -> "Public Safety"
  const serviceArea = saLabel.replace(/^(SA\d+|AU\d+|CA\d+)\s*-\s*/, "").trim();

  // Data rows: 2 through length-2 (skip header, SA total, and Grand Total)
  const dataRows = rows.slice(2, rows.length - 1);

  // Step 1: Find bureau rows by testing each candidate.
  // A row is a bureau if for EVERY FY column where it has a non-null value,
  // the sum of subsequent rows (up to some boundary) matches that value.
  // We try all possible boundary lengths and validate across columns.

  const bureauIndices: number[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    // Get values for all 3 FY columns
    const vals = [row[1], row[2], row[3]];
    // Need at least one numeric column to test
    const numericCols = vals
      .map((v, idx) => ({ idx, val: v }))
      .filter((c) => typeof c.val === "number");
    if (numericCols.length === 0) continue;

    // Try to find a boundary j where ALL numeric columns' sums match
    let bestJ = -1;
    for (let j = i + 1; j < dataRows.length; j++) {
      // Compute running sums for each column up to j
      let allMatch = true;
      let anyOvershoot = false;

      for (const col of numericCols) {
        let sum = 0;
        for (let k = i + 1; k <= j; k++) {
          sum += dataRows[k][col.idx + 1] || 0;
        }
        if (Math.abs(sum - col.val) >= 1) {
          allMatch = false;
        }
        if (sum > col.val + 1) {
          anyOvershoot = true;
        }
      }

      if (allMatch && j > i + 1) {
        // Require at least 2 children for a bureau (single-child matches
        // are usually coincidental)
        bestJ = j;
        break;
      }

      if (anyOvershoot) break;
    }

    // Also accept single-child if the match is exact on at least 2 columns
    if (bestJ === -1 && i + 1 < dataRows.length) {
      let matchCount = 0;
      for (const col of numericCols) {
        const childVal = dataRows[i + 1][col.idx + 1] || 0;
        if (Math.abs(childVal - col.val) < 1) matchCount++;
      }
      // A row whose value exactly matches the next row on 2+ columns
      // is a bureau with a single program offer (rare but valid)
      if (matchCount >= 2 && numericCols.length >= 2) {
        bestJ = i + 1;
      }
    }

    if (bestJ > i) {
      bureauIndices.push(i);
    }
  }

  // Step 2: Extract program offers using bureau boundaries
  for (let b = 0; b < bureauIndices.length; b++) {
    const bureauIdx = bureauIndices[b];
    const nextBureauIdx =
      b + 1 < bureauIndices.length ? bureauIndices[b + 1] : dataRows.length;
    const bureauName = String(dataRows[bureauIdx][0] || "").trim();

    // Program offers are rows between bureau row and next bureau row
    for (let p = bureauIdx + 1; p < nextBureauIdx; p++) {
      const row = dataRows[p];
      const name = String(row[0] || "").trim();
      if (!name) continue;

      results.push({
        service_area: serviceArea,
        bureau: bureauName,
        program_offer: name,
        fy_2024_25: typeof row[1] === "number" ? row[1] : null,
        fy_2025_26: typeof row[2] === "number" ? row[2] : null,
        fy_2026_27: typeof row[3] === "number" ? row[3] : null,
        fund_type: fundType,
      });
    }
  }

  return results;
}

async function seedBudget() {
  console.log("\n" + "=".repeat(60));
  console.log("3. BUDGET PROGRAM OFFERS");
  console.log("=".repeat(60));

  const dataDir = resolve(process.cwd(), "data");

  // Files mapping: filename -> service area override (only if needed)
  const budgetFiles = [
    "public_safety_program_offers.xlsx",
    "public_works_program_offers.xlsx",
    "city_operations_program_offers.xlsx",
    "elected_officials_program_offers.xlsx",
    "cedsa_program_offers.xlsx",
    "city_admin_program_offers.xlsx",
  ];

  // Check which files exist
  const existingFiles = budgetFiles.filter((f) =>
    existsSync(resolve(dataDir, f))
  );
  const missingFiles = budgetFiles.filter(
    (f) => !existsSync(resolve(dataDir, f))
  );

  if (missingFiles.length > 0) {
    console.log(`  Missing files: ${missingFiles.join(", ")}`);
  }
  console.log(`  Found ${existingFiles.length}/${budgetFiles.length} budget files`);

  if (existingFiles.length === 0) {
    console.log("  ERROR: No budget Excel files found in data/");
    return;
  }

  // Create schema and table
  await sql`CREATE SCHEMA IF NOT EXISTS fiscal`;

  await sql`
    CREATE TABLE IF NOT EXISTS fiscal.program_offers (
      id SERIAL PRIMARY KEY,
      service_area TEXT NOT NULL,
      bureau TEXT NOT NULL,
      program_offer TEXT NOT NULL,
      fy_2024_25 NUMERIC(14,2),
      fy_2025_26 NUMERIC(14,2),
      fy_2026_27 NUMERIC(14,2),
      fund_type TEXT DEFAULT 'All Funds',
      source TEXT DEFAULT 'CBO Program Offer Data FY 2026-27',
      UNIQUE(service_area, bureau, program_offer, fund_type)
    )
  `;

  // Truncate and re-insert for clean data (old parsing may have left stale rows)
  await sql`TRUNCATE fiscal.program_offers RESTART IDENTITY`;
  console.log("  Truncated fiscal.program_offers for clean re-insert");

  let totalInserted = 0;

  for (const file of existingFiles) {
    const filePath = resolve(dataDir, file);
    console.log(`\n  Processing: ${file}`);

    const wb = XLSX.readFile(filePath);

    // Process both "All Funds" and "GF" (General Fund) sheets
    for (const sheetName of ["All Funds", "GF"]) {
      if (!wb.SheetNames.includes(sheetName)) {
        console.log(`    Sheet "${sheetName}" not found, skipping`);
        continue;
      }

      const fundType = sheetName === "GF" ? "General Fund" : "All Funds";
      const ws = wb.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const offers = parseProgramOffersSheet(rows, fundType);
      console.log(`    ${sheetName}: parsed ${offers.length} program offers`);

      for (const offer of offers) {
        await sql`
          INSERT INTO fiscal.program_offers
            (service_area, bureau, program_offer, fy_2024_25, fy_2025_26, fy_2026_27, fund_type)
          VALUES (
            ${offer.service_area}, ${offer.bureau}, ${offer.program_offer},
            ${offer.fy_2024_25}, ${offer.fy_2025_26}, ${offer.fy_2026_27},
            ${offer.fund_type}
          )
          ON CONFLICT (service_area, bureau, program_offer, fund_type) DO UPDATE SET
            fy_2024_25 = EXCLUDED.fy_2024_25,
            fy_2025_26 = EXCLUDED.fy_2025_26,
            fy_2026_27 = EXCLUDED.fy_2026_27
        `;
        totalInserted++;
      }
    }
  }

  console.log(`\n  Total inserted/updated: ${totalInserted} program offer rows`);

  // Summary
  const bySA = await sql`
    SELECT service_area, fund_type, COUNT(*)::int AS n,
           SUM(fy_2026_27)::bigint AS total_fy27
    FROM fiscal.program_offers
    GROUP BY service_area, fund_type
    ORDER BY service_area, fund_type
  `;
  console.log("\n  Summary by service area:");
  for (const r of bySA) {
    const total = r.total_fy27 ? `$${(Number(r.total_fy27) / 1_000_000).toFixed(1)}M` : "N/A";
    console.log(`    ${r.service_area} (${r.fund_type}): ${r.n} offers, FY27 total: ${total}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("seed-trees-ghg-budget: starting...");
  console.log(`  DB: ${DB_URL.replace(/\/\/.*@/, "//***@")}`);
  console.log(`  Mode: ${runAll ? "all" : [treesOnly && "trees", ghgOnly && "ghg", budgetOnly && "budget"].filter(Boolean).join(", ")}`);

  try {
    if (runAll || treesOnly) await seedTrees();
    if (runAll || ghgOnly) await seedGHG();
    if (runAll || budgetOnly) await seedBudget();

    // Final row counts
    console.log("\n" + "=".repeat(60));
    console.log("FINAL ROW COUNTS");
    console.log("=".repeat(60));

    if (runAll || treesOnly) {
      const trees = await sql`SELECT COUNT(*)::int AS n, SUM(tree_count)::int AS total FROM environment.tree_inventory`;
      const canopy = await sql`SELECT COUNT(*)::int AS n FROM environment.tree_canopy`;
      console.log(`  environment.tree_inventory: ${trees[0].n} neighborhoods, ${trees[0].total?.toLocaleString()} total trees`);
      console.log(`  environment.tree_canopy: ${canopy[0].n} rows`);
    }

    if (runAll || ghgOnly) {
      const ghg = await sql`SELECT COUNT(*)::int AS n FROM environment.ghg_emissions`;
      console.log(`  environment.ghg_emissions: ${ghg[0].n} rows`);
    }

    if (runAll || budgetOnly) {
      const budget = await sql`SELECT COUNT(*)::int AS n FROM fiscal.program_offers`;
      console.log(`  fiscal.program_offers: ${budget[0].n} rows`);
    }

    console.log("\nDone!");
  } catch (err) {
    console.error("\nFATAL:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
