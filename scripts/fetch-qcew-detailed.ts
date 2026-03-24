/**
 * fetch-qcew-detailed.ts
 *
 * Fetches detailed QCEW data (3-digit NAICS) for Multnomah County.
 * This gives us sub-industry breakdowns like "Other services" →
 * Repair/maintenance, Personal services, Nonprofits, etc.
 *
 * Also stores 4-digit NAICS for key sectors we want to drill into.
 *
 * Usage: npx tsx scripts/fetch-qcew-detailed.ts
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
const AREA_FIPS = "41051";

// We want 3-digit NAICS (agglvl_code=75) and 4-digit for "Other services" (81xx)
const TARGET_LEVELS = new Set(["74", "75", "76"]);

// NAICS supersector labels for parent mapping
const SUPERSECTOR_MAP: Record<string, string> = {
  "11": "Natural resources and mining",
  "21": "Natural resources and mining",
  "23": "Construction",
  "31-33": "Manufacturing",
  "42": "Trade, transportation, and utilities",
  "44-45": "Trade, transportation, and utilities",
  "48-49": "Trade, transportation, and utilities",
  "51": "Information",
  "52": "Financial activities",
  "53": "Financial activities",
  "54": "Professional and business services",
  "55": "Professional and business services",
  "56": "Professional and business services",
  "61": "Education and health services",
  "62": "Education and health services",
  "71": "Leisure and hospitality",
  "72": "Leisure and hospitality",
  "81": "Other services",
  "99": "Unclassified",
};

interface QCEWDetailRow {
  year: number;
  quarter: number;
  industry_code: string;
  industry_title: string;
  naics_level: number;
  parent_supersector: string;
  establishments: number;
  month1_employment: number;
  month2_employment: number;
  month3_employment: number;
  total_quarterly_wages: number;
  avg_weekly_wage: number;
  avg_establishment_size: number;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
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

function getParentSuperSector(code: string): string {
  // Try exact match first
  if (SUPERSECTOR_MAP[code]) return SUPERSECTOR_MAP[code];
  // Try 2-digit prefix
  const prefix2 = code.substring(0, 2);
  if (SUPERSECTOR_MAP[prefix2]) return SUPERSECTOR_MAP[prefix2];
  // Manufacturing range
  if (code >= "31" && code <= "33") return "Manufacturing";
  if (code >= "311" && code <= "339") return "Manufacturing";
  // Trade range
  if (code >= "44" && code <= "45") return "Trade, transportation, and utilities";
  if (code >= "441" && code <= "459") return "Trade, transportation, and utilities";
  if (code >= "48" && code <= "49") return "Trade, transportation, and utilities";
  if (code >= "481" && code <= "493") return "Trade, transportation, and utilities";
  return "Other";
}

function getNaicsLevel(agglvl: string): number {
  const map: Record<string, number> = { "74": 2, "75": 3, "76": 4, "77": 5, "78": 6 };
  return map[agglvl] ?? 0;
}

async function fetchQuarter(year: number, quarter: number): Promise<QCEWDetailRow[]> {
  const url = `https://data.bls.gov/cew/data/api/${year}/${quarter}/area/${AREA_FIPS}.csv`;
  let text = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`    HTTP ${res.status} for ${year} Q${quarter} — skipping`);
        return [];
      }
      text = await res.text();
      break;
    } catch (err) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      console.log(`    Connection failed for ${year} Q${quarter} after 3 attempts — skipping`);
      return [];
    }
  }
  if (!text || text.length < 100) return [];

  const csvRows = parseCSV(text);

  // Filter: own_code=5 (private), 3-digit and 4-digit NAICS
  const filtered = csvRows.filter((r) => {
    if (r.own_code !== "5") return false;
    // Keep supersectors (74), 3-digit (75), and 4-digit (76)
    if (!TARGET_LEVELS.has(r.agglvl_code)) return false;
    // Skip disclosure-suppressed rows
    if (r.disclosure_code === "N") return false;
    return true;
  });

  return filtered.map((r) => {
    const est = parseInt(r.qtrly_estabs) || 0;
    const emp3 = parseInt(r.month3_emplvl) || 0;
    return {
      year: parseInt(r.year),
      quarter: parseInt(r.qtr),
      industry_code: r.industry_code,
      industry_title: r.industry_code, // We'll get the title from NAICS reference
      naics_level: getNaicsLevel(r.agglvl_code),
      parent_supersector: getParentSuperSector(r.industry_code),
      establishments: est,
      month1_employment: parseInt(r.month1_emplvl) || 0,
      month2_employment: parseInt(r.month2_emplvl) || 0,
      month3_employment: emp3,
      total_quarterly_wages: parseInt(r.total_qtrly_wages) || 0,
      avg_weekly_wage: parseInt(r.avg_wkly_wage) || 0,
      avg_establishment_size: est > 0 ? Math.round((emp3 / est) * 10) / 10 : 0,
    };
  });
}

// Fetch NAICS titles from the first available quarter
async function fetchNaicsTitles(): Promise<Record<string, string>> {
  const url = `https://data.bls.gov/cew/data/api/2025/3/industry/10.csv`;
  // Actually, industry titles aren't in the area CSV. Let's use a lookup.
  // BLS provides titles via: https://data.bls.gov/cew/data/api/2025/3/area/41051.csv
  // but we need to extract them from a different source. For now, use the quarterly data itself.
  // The industry_code in QCEW CSVs doesn't include titles — we'll need to map them.

  // NAICS 3-digit title lookup (manually compiled from BLS)
  return {
    "11": "Agriculture, Forestry, Fishing",
    "21": "Mining, Quarrying, Oil/Gas",
    "22": "Utilities",
    "23": "Construction",
    "31-33": "Manufacturing",
    "42": "Wholesale Trade",
    "44-45": "Retail Trade",
    "48-49": "Transportation and Warehousing",
    "51": "Information",
    "52": "Finance and Insurance",
    "53": "Real Estate, Rental, Leasing",
    "54": "Professional, Scientific, Technical",
    "55": "Management of Companies",
    "56": "Admin, Support, Waste Mgmt",
    "61": "Educational Services",
    "62": "Health Care and Social Assistance",
    "71": "Arts, Entertainment, Recreation",
    "72": "Accommodation and Food Services",
    "81": "Other Services",
    "99": "Unclassified",
    // 3-digit NAICS
    "111": "Crop Production",
    "112": "Animal Production",
    "113": "Forestry and Logging",
    "114": "Fishing, Hunting, Trapping",
    "115": "Agriculture Support",
    "211": "Oil and Gas Extraction",
    "212": "Mining (except Oil/Gas)",
    "213": "Mining Support Activities",
    "221": "Utilities",
    "236": "Construction of Buildings",
    "237": "Heavy/Civil Engineering",
    "238": "Specialty Trade Contractors",
    "311": "Food Manufacturing",
    "312": "Beverage/Tobacco Manufacturing",
    "313": "Textile Mills",
    "314": "Textile Product Mills",
    "315": "Apparel Manufacturing",
    "316": "Leather Manufacturing",
    "321": "Wood Product Manufacturing",
    "322": "Paper Manufacturing",
    "323": "Printing and Support",
    "324": "Petroleum/Coal Products",
    "325": "Chemical Manufacturing",
    "326": "Plastics/Rubber Manufacturing",
    "327": "Nonmetallic Mineral Products",
    "331": "Primary Metal Manufacturing",
    "332": "Fabricated Metal Products",
    "333": "Machinery Manufacturing",
    "334": "Computer/Electronic Products",
    "335": "Electrical Equipment",
    "336": "Transportation Equipment",
    "337": "Furniture Manufacturing",
    "339": "Miscellaneous Manufacturing",
    "423": "Merchant Wholesalers, Durable",
    "424": "Merchant Wholesalers, Nondurable",
    "425": "Wholesale Electronic Markets",
    "441": "Motor Vehicle Dealers",
    "442": "Furniture/Home Stores",
    "443": "Electronics/Appliance Stores",
    "444": "Building Material Dealers",
    "445": "Food/Beverage Stores",
    "446": "Health/Personal Care Stores",
    "447": "Gas Stations",
    "448": "Clothing/Accessories Stores",
    "449": "Furniture & Home Furnishings",
    "451": "Sporting Goods/Hobby/Book/Music",
    "452": "General Merchandise Stores",
    "453": "Miscellaneous Retailers",
    "454": "Nonstore Retailers",
    "455": "General Merch & Warehouse Clubs",
    "456": "Health & Personal Care Retailers",
    "457": "Gas Stations & EV Charging",
    "458": "Clothing & Accessories Retailers",
    "459": "Sporting Goods/Hobby/Book/Music",
    "481": "Air Transportation",
    "482": "Rail Transportation",
    "483": "Water Transportation",
    "484": "Truck Transportation",
    "485": "Transit/Ground Passenger",
    "486": "Pipeline Transportation",
    "487": "Scenic/Sightseeing Transport",
    "488": "Transport Support Activities",
    "491": "Postal Service",
    "492": "Couriers and Messengers",
    "493": "Warehousing and Storage",
    "511": "Publishing (except Internet)",
    "512": "Motion Picture/Sound Recording",
    "513": "Publishing Industries",
    "515": "Broadcasting (except Internet)",
    "516": "Internet Publishing/Broadcasting",
    "517": "Telecommunications",
    "518": "Data Processing/Hosting",
    "519": "Other Information Services",
    "521": "Monetary Authorities",
    "522": "Credit Intermediation",
    "523": "Securities/Investments",
    "524": "Insurance Carriers",
    "525": "Funds, Trusts, Financial",
    "531": "Real Estate",
    "532": "Rental and Leasing",
    "533": "Lessors of Nonfinancial IP",
    "541": "Professional/Scientific/Technical",
    "551": "Management of Companies",
    "561": "Administrative/Support Services",
    "562": "Waste Management/Remediation",
    "611": "Educational Services",
    "621": "Ambulatory Health Care",
    "622": "Hospitals",
    "623": "Nursing/Residential Care",
    "624": "Social Assistance",
    "711": "Performing Arts/Spectator Sports",
    "712": "Museums/Historical Sites",
    "713": "Amusement/Recreation",
    "721": "Accommodation",
    "722": "Food Services/Drinking Places",
    "811": "Repair and Maintenance",
    "812": "Personal and Laundry Services",
    "813": "Religious/Civic/Professional Orgs",
    "814": "Private Households",
    // 4-digit for Other Services (81xx)
    "8111": "Auto Mechanical/Electrical Repair",
    "8112": "Electronics/Precision Repair",
    "8113": "Commercial Machinery Repair",
    "8114": "Personal/Household Repair",
    "8121": "Personal Care Services (Salons)",
    "8122": "Death Care Services",
    "8123": "Dry Cleaning and Laundry",
    "8129": "Other Personal Services",
    "8131": "Religious Organizations",
    "8132": "Grantmaking/Social Advocacy",
    "8133": "Civic/Social/Professional Orgs",
    "8134": "Political Organizations",
    "8141": "Private Households",
  };
}

async function main() {
  console.log("Portland Dashboard — QCEW Detailed Industry Fetch");
  console.log("===================================================");

  const naicsTitles = await fetchNaicsTitles();

  // Create table
  await sql`
    CREATE TABLE IF NOT EXISTS economy.qcew_detailed (
      id SERIAL PRIMARY KEY,
      year INT NOT NULL,
      quarter INT NOT NULL,
      industry_code TEXT NOT NULL,
      industry_title TEXT NOT NULL,
      naics_level INT NOT NULL,
      parent_supersector TEXT,
      establishments INT,
      month1_employment INT,
      month2_employment INT,
      month3_employment INT,
      total_quarterly_wages BIGINT,
      avg_weekly_wage INT,
      avg_establishment_size NUMERIC(8,1),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(year, quarter, industry_code)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_qcew_detail_code ON economy.qcew_detailed(industry_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qcew_detail_yq ON economy.qcew_detailed(year, quarter)`;

  const allRows: QCEWDetailRow[] = [];
  const currentYear = new Date().getFullYear();

  for (let year = 2016; year <= currentYear; year++) {
    for (let qtr = 1; qtr <= 4; qtr++) {
      if (year === currentYear && qtr > Math.ceil((new Date().getMonth() + 1) / 3)) continue;

      process.stdout.write(`  ${year} Q${qtr}...`);
      const rows = await fetchQuarter(year, qtr);

      if (rows.length > 0) {
        // Assign titles
        for (const r of rows) {
          r.industry_title = naicsTitles[r.industry_code] ?? r.industry_code;
        }
        allRows.push(...rows);
        console.log(` ${rows.length} rows`);
      } else {
        console.log(` no data`);
      }

      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\n  Total rows: ${allRows.length}`);

  if (allRows.length === 0) {
    await sql.end();
    process.exit(0);
  }

  // Save raw JSON
  fs.writeFileSync(path.join(DATA_DIR, "qcew_detailed.json"), JSON.stringify(allRows, null, 2));

  // Insert
  console.log("\n=== Inserting into economy.qcew_detailed ===");
  let count = 0;
  for (const r of allRows) {
    await sql`
      INSERT INTO economy.qcew_detailed (
        year, quarter, industry_code, industry_title, naics_level, parent_supersector,
        establishments, month1_employment, month2_employment, month3_employment,
        total_quarterly_wages, avg_weekly_wage, avg_establishment_size
      ) VALUES (
        ${r.year}, ${r.quarter}, ${r.industry_code}, ${r.industry_title}, ${r.naics_level}, ${r.parent_supersector},
        ${r.establishments}, ${r.month1_employment}, ${r.month2_employment}, ${r.month3_employment},
        ${r.total_quarterly_wages}, ${r.avg_weekly_wage}, ${r.avg_establishment_size}
      )
      ON CONFLICT (year, quarter, industry_code) DO UPDATE SET
        industry_title = EXCLUDED.industry_title,
        naics_level = EXCLUDED.naics_level,
        parent_supersector = EXCLUDED.parent_supersector,
        establishments = EXCLUDED.establishments,
        month1_employment = EXCLUDED.month1_employment,
        month2_employment = EXCLUDED.month2_employment,
        month3_employment = EXCLUDED.month3_employment,
        total_quarterly_wages = EXCLUDED.total_quarterly_wages,
        avg_weekly_wage = EXCLUDED.avg_weekly_wage,
        avg_establishment_size = EXCLUDED.avg_establishment_size
    `;
    count++;
  }
  console.log(`  Upserted: ${count}`);

  // Show "Other Services" breakdown for latest quarter
  const otherServices = await sql`
    SELECT industry_code, industry_title, establishments, month3_employment, avg_weekly_wage, avg_establishment_size
    FROM economy.qcew_detailed
    WHERE (year, quarter) = (SELECT year, quarter FROM economy.qcew_detailed ORDER BY year DESC, quarter DESC LIMIT 1)
      AND industry_code LIKE '81%'
      AND naics_level IN (3, 4)
    ORDER BY naics_level, establishments DESC
  `;

  console.log("\n  'Other Services' Breakdown (latest quarter):");
  for (const r of otherServices) {
    const indent = String(r.industry_code).length > 3 ? "    " : "  ";
    console.log(
      `${indent}${r.industry_code} ${r.industry_title}: ${Number(r.establishments).toLocaleString()} estabs, ` +
      `${Number(r.month3_employment).toLocaleString()} employees, avg size ${r.avg_establishment_size}/estab, $${r.avg_weekly_wage}/wk`
    );
  }

  // Show establishment size by supersector
  const sizeBySuper = await sql`
    SELECT parent_supersector,
      SUM(establishments)::int as total_est,
      SUM(month3_employment)::int as total_emp,
      ROUND(SUM(month3_employment)::numeric / NULLIF(SUM(establishments), 0), 1) as avg_size
    FROM economy.qcew_detailed
    WHERE (year, quarter) = (SELECT year, quarter FROM economy.qcew_detailed ORDER BY year DESC, quarter DESC LIMIT 1)
      AND naics_level = 3
    GROUP BY parent_supersector
    ORDER BY avg_size DESC
  `;

  console.log("\n  Avg Establishment Size by Supersector:");
  for (const r of sizeBySuper) {
    console.log(`    ${r.parent_supersector}: ${r.avg_size} employees/establishment (${Number(r.total_est).toLocaleString()} estabs)`);
  }

  console.log("\n===================================================");
  console.log("QCEW detailed fetch complete!");

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
