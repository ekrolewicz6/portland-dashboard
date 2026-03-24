/**
 * fetch-education-extended.ts
 *
 * Downloads and parses additional ODE education data for Portland SD 1J:
 *   1. Chronic Absenteeism (Regular Attenders Reports)
 *   2. Per-Pupil Spending
 *   3. Class Size
 *   4. Graduation Rates (5-year) — updates existing table
 *
 * Usage: npx tsx scripts/fetch-education-extended.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const XLSX = require("xlsx");

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "data"
);
const DISTRICT_NAME = "Portland SD 1J";

// ── Helpers ─────────────────────────────────────────────────────────────

function parseNum(val: any): number {
  if (val === undefined || val === null || val === "" || val === "*" || val === "-" || val === "--") return 0;
  const s = String(val).replace(/,/g, "").replace(/%/g, "").trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

async function downloadFile(url: string, destName: string): Promise<string | null> {
  const destPath = path.join(DATA_DIR, destName);
  console.log(`    Trying: ${url}`);
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Portland Dashboard Data Fetch)",
      },
    });
    if (!res.ok) {
      console.log(`    HTTP ${res.status} — skipping`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());

    // Check if we got an HTML error page instead of a real file
    if (buf.length < 10240) {
      const text = buf.toString("utf-8", 0, Math.min(buf.length, 500));
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        console.log(`    Got HTML response (${buf.length} bytes) — not a data file, skipping`);
        return null;
      }
    }

    fs.writeFileSync(destPath, buf);
    console.log(`    Downloaded ${destName} (${(buf.length / 1024).toFixed(1)} KB)`);
    return destPath;
  } catch (err: any) {
    console.log(`    Download failed: ${err.message}`);
    return null;
  }
}

/** Try multiple URLs in order, return the first that succeeds */
async function downloadFirst(urls: { url: string; name: string }[]): Promise<string | null> {
  for (const { url, name } of urls) {
    const result = await downloadFile(url, name);
    if (result) return result;
  }
  return null;
}

/**
 * Find a row matching Portland SD 1J in a sheet.
 * Searches all columns for a cell containing the district name.
 */
function findPortlandRow(
  rawData: any[][],
  matchText: string = DISTRICT_NAME
): { row: any[]; rowIndex: number; colIndex: number } | null {
  // First try exact match
  for (let i = 0; i < rawData.length; i++) {
    for (let j = 0; j < (rawData[i]?.length || 0); j++) {
      const cell = String(rawData[i][j] || "").trim();
      if (cell === matchText) {
        return { row: rawData[i], rowIndex: i, colIndex: j };
      }
    }
  }
  // Then try partial match
  const lower = matchText.toLowerCase();
  for (let i = 0; i < rawData.length; i++) {
    for (let j = 0; j < (rawData[i]?.length || 0); j++) {
      const cell = String(rawData[i][j] || "").trim().toLowerCase();
      if (cell.includes("portland") && (cell.includes("sd") || cell.includes("1j") || cell.includes("school"))) {
        return { row: rawData[i], rowIndex: i, colIndex: j };
      }
    }
  }
  return null;
}

/** Find column index by searching the header row for a pattern */
function findCol(headerRow: any[], ...patterns: (string | RegExp)[]): number {
  for (const pattern of patterns) {
    for (let j = 0; j < headerRow.length; j++) {
      const cell = String(headerRow[j] || "").trim();
      if (pattern instanceof RegExp) {
        if (pattern.test(cell)) return j;
      } else {
        if (cell.toLowerCase().includes(pattern.toLowerCase())) return j;
      }
    }
  }
  return -1;
}

/** Find the header row — the row with the most non-empty cells near the top */
function findHeaderRow(rawData: any[][], maxSearch: number = 15): number {
  let bestIdx = 0;
  let bestCount = 0;
  for (let i = 0; i < Math.min(maxSearch, rawData.length); i++) {
    const count = (rawData[i] || []).filter(
      (c: any) => c !== undefined && c !== null && String(c).trim() !== ""
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// ── 1. Chronic Absenteeism ─────────────────────────────────────────────

interface AbsenteeismRow {
  school_year: string;
  district_name: string;
  regular_attenders_pct: number | null;
  chronic_absent_pct: number | null;
  total_students: number | null;
}

async function fetchChronicAbsenteeism(): Promise<AbsenteeismRow[]> {
  console.log("\n=== 1. Chronic Absenteeism ===");
  const results: AbsenteeismRow[] = [];

  const yearConfigs = [
    {
      year: "2024-25",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2024-25.xlsx", name: "ode_regular_attenders_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/regularattenders_report_2425.xlsx", name: "ode_regular_attenders_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2024-2025.xlsx", name: "ode_regular_attenders_2024_25.xlsx" },
      ],
    },
    {
      year: "2023-24",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2023-24.xlsx", name: "ode_regular_attenders_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/regularattenders_report_2324.xlsx", name: "ode_regular_attenders_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2023-2024.xlsx", name: "ode_regular_attenders_2023_24.xlsx" },
      ],
    },
    {
      year: "2022-23",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2022-23.xlsx", name: "ode_regular_attenders_2022_23.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/regularattenders_report_2223.xlsx", name: "ode_regular_attenders_2022_23.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/Regular_Attenders_Report_2022-2023.xlsx", name: "ode_regular_attenders_2022_23.xlsx" },
      ],
    },
  ];

  for (const config of yearConfigs) {
    console.log(`\n  Year: ${config.year}`);
    const filePath = await downloadFirst(config.urls);
    if (!filePath) {
      console.log(`    No file found for ${config.year}`);
      continue;
    }

    try {
      const workbook = XLSX.readFile(filePath);
      console.log(`    Sheets: ${workbook.SheetNames.join(", ")}`);

      // Find the data sheet (skip "Notes")
      for (const sheetName of workbook.SheetNames) {
        if (sheetName.toLowerCase().includes("note")) continue;

        const sheet = workbook.Sheets[sheetName];
        const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const headerIdx = findHeaderRow(rawData);
        const headerRow = rawData[headerIdx];
        console.log(`    Header: ${headerRow.join(" | ")}`);

        // Find columns by name — "Percent Regular Attenders" not "Number Regular Attenders"
        const pctCol = findCol(headerRow, "percent regular", "percent chronically", /pct.*regular/i, /regular.*pct/i, /percent.*attend/i);
        const chronicPctCol = findCol(headerRow, "percent chronically", /pct.*chronic/i);
        const totalCol = findCol(headerRow, "students included", "total students", "student count");
        // "District" column (name, not ID) — look for exact text match first
        let distCol = -1;
        for (let j = 0; j < headerRow.length; j++) {
          const h = String(headerRow[j] || "").trim().toLowerCase();
          if (h === "district" || h === "district name") { distCol = j; break; }
        }
        if (distCol < 0) distCol = findCol(headerRow, "district name");
        const groupCol = findCol(headerRow, "student group");
        const instTypeCol = findCol(headerRow, "institution type");
        const instCol = findCol(headerRow, "institution");

        console.log(`    pctCol=${pctCol} ("${headerRow[pctCol]}"), distCol=${distCol}, groupCol=${groupCol}, instTypeCol=${instTypeCol}`);

        if (pctCol < 0 || distCol < 0) {
          console.log(`    Missing required columns, skipping sheet`);
          continue;
        }

        // Find district-level row for Portland SD 1J where student group = "All Students" or "Total"
        let bestRow: any[] | null = null;
        for (let i = headerIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          const dist = String(row[distCol] || "").trim();
          if (dist !== DISTRICT_NAME && !dist.toLowerCase().includes("portland sd")) continue;

          // Check institution type — we want "District" level
          if (instTypeCol >= 0) {
            const instType = String(row[instTypeCol] || "").trim().toLowerCase();
            if (instType !== "district" && instType !== "dist") continue;
          } else if (instCol >= 0) {
            // If no institution type column, look for institution matching district name
            const inst = String(row[instCol] || "").trim();
            if (inst !== dist && inst !== DISTRICT_NAME) continue;
          }

          // Check student group — we want "All Students" or "Total"
          if (groupCol >= 0) {
            const group = String(row[groupCol] || "").trim().toLowerCase();
            if (group !== "all students" && group !== "total" && group !== "all") continue;
          }

          bestRow = row;
          console.log(`    Found district-level "All Students" row at ${i + 1}`);
          break;
        }

        if (!bestRow) {
          // Fallback: find any Portland district row
          for (let i = headerIdx + 1; i < rawData.length; i++) {
            const dist = String(rawData[i][distCol] || "").trim();
            if (dist !== DISTRICT_NAME) continue;
            if (instTypeCol >= 0 && String(rawData[i][instTypeCol] || "").trim().toLowerCase() === "district") {
              bestRow = rawData[i];
              console.log(`    Fallback: found district-level row at ${i + 1}`);
              break;
            }
          }
        }

        if (!bestRow) {
          console.log(`    Could not find Portland district-level row`);
          continue;
        }

        const rawPct = parseNum(bestRow[pctCol]);
        // The "Percent Regular Attenders" is a percentage 0-100 (e.g., 67.47)
        const regularPct = rawPct > 1 ? rawPct : rawPct > 0 ? rawPct * 100 : null;
        const totalStudents = totalCol >= 0 ? (parseNum(bestRow[totalCol]) || null) : null;

        // Use explicit "Percent Chronically Absent" column if available, else compute
        let chronicPct: number | null = null;
        if (chronicPctCol >= 0) {
          const rawChronic = parseNum(bestRow[chronicPctCol]);
          chronicPct = rawChronic > 1 ? rawChronic : rawChronic > 0 ? rawChronic * 100 : null;
        }
        if (chronicPct === null && regularPct !== null) {
          chronicPct = Math.round((100 - regularPct) * 100) / 100;
        }

        console.log(`    Regular Attender %: ${regularPct?.toFixed(1)}, Students: ${totalStudents}`);
        console.log(`    Chronic Absent %: ${chronicPct}`);

        if (regularPct !== null) {
          results.push({
            school_year: config.year,
            district_name: DISTRICT_NAME,
            regular_attenders_pct: Math.round(regularPct * 100) / 100,
            chronic_absent_pct: chronicPct,
            total_students: totalStudents ? Math.round(totalStudents) : null,
          });
        }

        break; // Found data, move to next year
      }
    } catch (err: any) {
      console.log(`    Parse error: ${err.message}`);
    }
  }

  return results;
}

// ── 2. Per-Pupil Spending ──────────────────────────────────────────────

interface SpendingRow {
  school_year: string;
  district_name: string;
  total_per_pupil: number | null;
}

async function fetchPerPupilSpending(): Promise<SpendingRow[]> {
  console.log("\n=== 2. Per-Pupil Spending ===");
  const results: SpendingRow[] = [];

  const yearConfigs = [
    {
      year: "2023-24",
      urls: [
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/2023-24%20School%20Level%20Spending%20Report.csv", name: "ode_spending_2023_24.csv" },
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/2023-24%20School%20Level%20Spending%20Report.xlsx", name: "ode_spending_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/2023-24SchoolLevelSpendingReport.xlsx", name: "ode_spending_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/SchoolLevelSpendingReport2023-24.xlsx", name: "ode_spending_2023_24.xlsx" },
      ],
    },
    {
      year: "2022-23",
      urls: [
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/2022-23%20School%20Level%20Spending%20Report.xlsx", name: "ode_spending_2022_23.xlsx" },
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/2022-23%20School%20Level%20Spending%20Report.csv", name: "ode_spending_2022_23.csv" },
        { url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Documents/SchoolLevelSpendingReport2022-23.xlsx", name: "ode_spending_2022_23.xlsx" },
      ],
    },
  ];

  for (const config of yearConfigs) {
    console.log(`\n  Year: ${config.year}`);
    const filePath = await downloadFirst(config.urls);
    if (!filePath) {
      console.log(`    No file found for ${config.year}`);
      continue;
    }

    try {
      let rawData: any[][];
      if (filePath.endsWith(".csv")) {
        const csvText = fs.readFileSync(filePath, "utf-8");
        rawData = csvText.split("\n").map((line) => line.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
      } else {
        const workbook = XLSX.readFile(filePath);
        console.log(`    Sheets: ${workbook.SheetNames.join(", ")}`);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      }

      console.log(`    Total rows: ${rawData.length}`);

      const headerIdx = findHeaderRow(rawData);
      const headerRow = rawData[headerIdx];
      console.log(`    Header: ${headerRow.slice(0, 8).join(" | ")}`);

      // Find district and per-pupil columns (search "district name" before generic "district" to avoid matching "District ID")
      const distCol = findCol(headerRow, "district name", "dist name", "lea name", "district");
      const ppCol = findCol(headerRow, "per pupil", "per-pupil", "total per", "expenditure per", /pp.*spending/i);
      console.log(`    distCol=${distCol} ("${headerRow[distCol]}"), ppCol=${ppCol} ("${headerRow[ppCol]}")`);


      if (distCol < 0) {
        console.log(`    Could not find district column`);
        // Log some column names for debugging
        console.log(`    Columns: ${headerRow.join(" | ")}`);
        continue;
      }

      // Find Portland rows and average per-pupil spending across schools
      let totalSpending = 0;
      let schoolCount = 0;

      for (let i = headerIdx + 1; i < rawData.length; i++) {
        const dist = String(rawData[i][distCol] || "").trim();
        if (
          dist === DISTRICT_NAME ||
          dist.toLowerCase().includes("portland") &&
            (dist.toLowerCase().includes("sd") || dist.toLowerCase().includes("1j"))
        ) {
          if (ppCol >= 0) {
            const val = parseNum(rawData[i][ppCol]);
            if (val > 0) {
              totalSpending += val;
              schoolCount++;
            }
          }
        }
      }

      if (schoolCount > 0) {
        const avgPP = Math.round((totalSpending / schoolCount) * 100) / 100;
        console.log(`    Found ${schoolCount} Portland schools, avg per-pupil: $${avgPP.toFixed(2)}`);
        results.push({
          school_year: config.year,
          district_name: DISTRICT_NAME,
          total_per_pupil: avgPP,
        });
      } else if (ppCol < 0) {
        // Try to find a district-level summary row with any dollar amount
        console.log(`    Could not find per-pupil column, scanning...`);
        console.log(`    Columns: ${headerRow.join(" | ")}`);
      } else {
        console.log(`    No Portland schools found in spending data`);
      }
    } catch (err: any) {
      console.log(`    Parse error: ${err.message}`);
    }
  }

  return results;
}

// ── 3. Class Size ──────────────────────────────────────────────────────

interface ClassSizeRow {
  school_year: string;
  district_name: string;
  avg_class_size: number | null;
  subject: string;
}

async function fetchClassSize(): Promise<ClassSizeRow[]> {
  console.log("\n=== 3. Class Size ===");
  const results: ClassSizeRow[] = [];

  const yearConfigs = [
    {
      year: "2024-25",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/classsizereport2024-25.xlsx", name: "ode_classsize_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/class_size_report_20242025.xlsx", name: "ode_classsize_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/classsizereport2024-2025.xlsx", name: "ode_classsize_2024_25.xlsx" },
      ],
    },
    {
      year: "2023-24",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/classsizereport2023-24.xlsx", name: "ode_classsize_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/class_size_report_20232024.xlsx", name: "ode_classsize_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/Documents/classsizereport2023-2024.xlsx", name: "ode_classsize_2023_24.xlsx" },
      ],
    },
  ];

  for (const config of yearConfigs) {
    console.log(`\n  Year: ${config.year}`);
    const filePath = await downloadFirst(config.urls);
    if (!filePath) {
      console.log(`    No file found for ${config.year}`);
      continue;
    }

    try {
      const workbook = XLSX.readFile(filePath);
      console.log(`    Sheets: ${workbook.SheetNames.join(", ")}`);

      // Use "Data" sheet (skip "Notes")
      const dataSheetName = workbook.SheetNames.find((s: string) => s.toLowerCase() === "data") || workbook.SheetNames.find((s: string) => !s.toLowerCase().includes("note")) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[dataSheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      const headerIdx = findHeaderRow(rawData);
      const headerRow = rawData[headerIdx];
      console.log(`    Sheet "${dataSheetName}", Header: ${headerRow.slice(0, 10).join(" | ")}`);

      // Find columns
      const distCol = findCol(headerRow, "district name", "district");
      const avgCol = findCol(headerRow, "average class", "avg class", "class size", /avg.*size/i, /mean.*size/i);
      const subjectCol = findCol(headerRow, "subject", "content area", "course", "subject area");
      console.log(`    distCol=${distCol}, avgCol=${avgCol}, subjectCol=${subjectCol}`);

      if (avgCol < 0 || distCol < 0) {
        console.log(`    Missing required columns`);
        console.log(`    All columns: ${headerRow.join(" | ")}`);
        continue;
      }

      // Collect all Portland rows, then aggregate by subject
      const subjectSums: Map<string, { total: number; count: number }> = new Map();

      for (let i = headerIdx + 1; i < rawData.length; i++) {
        const dist = String(rawData[i][distCol] || "").trim();
        if (dist !== DISTRICT_NAME && !(dist.toLowerCase().includes("portland") && dist.toLowerCase().includes("sd"))) continue;

        const avgSize = parseNum(rawData[i][avgCol]);
        const subject = subjectCol >= 0 ? String(rawData[i][subjectCol] || "All").trim() : "All";
        if (avgSize <= 0 || avgSize > 100) continue; // skip invalid

        const key = subject || "All";
        const existing = subjectSums.get(key) || { total: 0, count: 0 };
        existing.total += avgSize;
        existing.count++;
        subjectSums.set(key, existing);
      }

      // Compute district-wide averages per subject
      for (const [subject, { total, count }] of subjectSums) {
        const avg = Math.round((total / count) * 10) / 10;
        results.push({
          school_year: config.year,
          district_name: DISTRICT_NAME,
          avg_class_size: avg,
          subject,
        });
        console.log(`    ${subject}: avg class size = ${avg} (${count} schools)`);
      }
    } catch (err: any) {
      console.log(`    Parse error: ${err.message}`);
    }
  }

  return results;
}

// ── 4. Graduation Rates (5-year) ───────────────────────────────────────

interface GradRateRow {
  school_year: string;
  rate_4yr: number | null;
  rate_5yr: number | null;
}

async function fetchGraduationRates(): Promise<GradRateRow[]> {
  console.log("\n=== 4. Graduation Rates (5-year) ===");
  const results: GradRateRow[] = [];

  const yearConfigs = [
    {
      year: "2024-25",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_20242025.xlsx", name: "ode_graduation_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile2024-2025.xlsx", name: "ode_graduation_2024_25.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_2024-2025.xlsx", name: "ode_graduation_2024_25.xlsx" },
      ],
    },
    {
      year: "2023-24",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_20232024.xlsx", name: "ode_graduation_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile2023-2024.xlsx", name: "ode_graduation_2023_24.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_2023-2024.xlsx", name: "ode_graduation_2023_24.xlsx" },
      ],
    },
    {
      year: "2022-23",
      urls: [
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_20222023.xlsx", name: "ode_graduation_2022_23.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile2022-2023.xlsx", name: "ode_graduation_2022_23.xlsx" },
        { url: "https://www.oregon.gov/ode/reports-and-data/students/Documents/cohortmediafile_2022-2023.xlsx", name: "ode_graduation_2022_23.xlsx" },
      ],
    },
  ];

  for (const config of yearConfigs) {
    console.log(`\n  Year: ${config.year}`);
    const filePath = await downloadFirst(config.urls);
    if (!filePath) {
      console.log(`    No file found for ${config.year}`);
      continue;
    }

    try {
      const workbook = XLSX.readFile(filePath);
      console.log(`    Sheets: ${workbook.SheetNames.join(", ")}`);

      let rate4: number | null = null;
      let rate5: number | null = null;

      // Helper: find district-level "All Students" row for Portland and extract a graduation rate
      function extractRateFromSheet(sheetName: string): number | null {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return null;
        const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const headerIdx = findHeaderRow(rawData);
        const headerRow = rawData[headerIdx];

        const distCol = findCol(headerRow, "district name", "district");
        // Prefer exact "Student Group" column over "Student Group Code"
        let groupCol = -1;
        for (let j = 0; j < headerRow.length; j++) {
          const h = String(headerRow[j] || "").trim().toLowerCase();
          if (h === "student group") { groupCol = j; break; }
        }
        if (groupCol < 0) groupCol = findCol(headerRow, "student group");
        const schoolCol = findCol(headerRow, "school name", "school id");
        const rateCol = findCol(headerRow, /graduation rate/i, /cohort grad/i);

        console.log(`    Sheet "${sheetName}": distCol=${distCol}, groupCol=${groupCol}, rateCol=${rateCol}, schoolCol=${schoolCol}`);
        if (distCol < 0) return null;

        // Find Portland district-level row with "All Students" group
        // District-level rows have school name = district name (e.g., "Portland SD 1J")
        for (let i = headerIdx + 1; i < rawData.length; i++) {
          const dist = String(rawData[i][distCol] || "").trim();
          if (dist !== DISTRICT_NAME) continue;

          // District-level: school name should match district name exactly
          if (schoolCol >= 0) {
            const school = String(rawData[i][schoolCol] || "").trim();
            if (school !== DISTRICT_NAME && school !== dist) continue;
          }

          // Must be "All Students" group
          if (groupCol >= 0) {
            const group = String(rawData[i][groupCol] || "").trim().toLowerCase();
            if (group !== "all students" && group !== "total" && group !== "all" && group !== "") continue;
          }

          // Try all columns that look like graduation rate, pick the most plausible one
          const candidateCols: number[] = [];
          if (rateCol >= 0) candidateCols.push(rateCol);
          for (let j = 0; j < headerRow.length; j++) {
            const hdr = String(headerRow[j] || "").toLowerCase();
            if (hdr.includes("graduation rate") && j !== rateCol) {
              candidateCols.push(j);
            }
          }

          for (const col of candidateCols) {
            const val = parseNum(rawData[i][col]);
            const adjusted = val > 1 ? val : val > 0 ? val * 100 : 0;
            // Portland graduation rate should be plausible (50-100%)
            if (adjusted >= 50 && adjusted <= 100) {
              console.log(`    Found rate ${adjusted.toFixed(1)}% in col "${headerRow[col]}" at row ${i + 1}, group="${rawData[i][groupCol] || ""}", school="${rawData[i][schoolCol] || ""}"`);
              return adjusted;
            }
          }
        }
        return null;
      }

      // Look for 4-year rate in "4YR District and School" sheet
      const fourYrSheet = workbook.SheetNames.find((s: string) => s.includes("4YR") && s.includes("District"));
      if (fourYrSheet) {
        rate4 = extractRateFromSheet(fourYrSheet);
        if (rate4) console.log(`    4-year graduation rate: ${rate4.toFixed(1)}%`);
      }

      // Look for 5-year rate in "5YR District and School" sheet
      const fiveYrSheet = workbook.SheetNames.find((s: string) => s.includes("5YR") && s.includes("District"));
      if (fiveYrSheet) {
        rate5 = extractRateFromSheet(fiveYrSheet);
        if (rate5) console.log(`    5-year graduation rate: ${rate5.toFixed(1)}%`);
      }

      if (rate4 !== null || rate5 !== null) {
        results.push({
          school_year: config.year,
          rate_4yr: rate4 !== null ? Math.round(rate4 * 10) / 10 : null,
          rate_5yr: rate5 !== null ? Math.round(rate5 * 10) / 10 : null,
        });
      } else {
        console.log(`    No graduation rates found for Portland`);
      }
    } catch (err: any) {
      console.log(`    Parse error: ${err.message}`);
    }
  }

  return results;
}

// ── Database Insert ────────────────────────────────────────────────────

async function insertAllData(
  absenteeism: AbsenteeismRow[],
  spending: SpendingRow[],
  classSize: ClassSizeRow[],
  gradRates: GradRateRow[]
) {
  console.log("\n=== Inserting Extended Education Data ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Ensure schema exists
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS education`);

    // 1. Chronic Absenteeism table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.chronic_absenteeism (
        id SERIAL PRIMARY KEY,
        school_year TEXT NOT NULL,
        district_name TEXT DEFAULT 'Portland SD 1J',
        regular_attenders_pct NUMERIC(5,2),
        chronic_absent_pct NUMERIC(5,2),
        total_students INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(school_year, district_name)
      )
    `);

    // 2. Per-Pupil Spending table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.per_pupil_spending (
        id SERIAL PRIMARY KEY,
        school_year TEXT NOT NULL,
        district_name TEXT DEFAULT 'Portland SD 1J',
        total_per_pupil NUMERIC(10,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(school_year, district_name)
      )
    `);

    // 3. Class Size table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS education.class_size (
        id SERIAL PRIMARY KEY,
        school_year TEXT NOT NULL,
        district_name TEXT DEFAULT 'Portland SD 1J',
        avg_class_size NUMERIC(5,1),
        subject TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(school_year, district_name, subject)
      )
    `);

    // Insert chronic absenteeism
    let absCount = 0;
    for (const row of absenteeism) {
      try {
        await sql`
          INSERT INTO education.chronic_absenteeism
            (school_year, district_name, regular_attenders_pct, chronic_absent_pct, total_students)
          VALUES (
            ${row.school_year}, ${row.district_name},
            ${row.regular_attenders_pct}, ${row.chronic_absent_pct}, ${row.total_students}
          )
          ON CONFLICT (school_year, district_name)
          DO UPDATE SET
            regular_attenders_pct = EXCLUDED.regular_attenders_pct,
            chronic_absent_pct = EXCLUDED.chronic_absent_pct,
            total_students = EXCLUDED.total_students
        `;
        absCount++;
      } catch (err: any) {
        console.log(`  Error inserting absenteeism ${row.school_year}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${absCount} chronic absenteeism rows`);

    // Insert per-pupil spending
    let spendCount = 0;
    for (const row of spending) {
      try {
        await sql`
          INSERT INTO education.per_pupil_spending
            (school_year, district_name, total_per_pupil)
          VALUES (${row.school_year}, ${row.district_name}, ${row.total_per_pupil})
          ON CONFLICT (school_year, district_name)
          DO UPDATE SET total_per_pupil = EXCLUDED.total_per_pupil
        `;
        spendCount++;
      } catch (err: any) {
        console.log(`  Error inserting spending ${row.school_year}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${spendCount} per-pupil spending rows`);

    // Insert class size
    let classCount = 0;
    for (const row of classSize) {
      try {
        await sql`
          INSERT INTO education.class_size
            (school_year, district_name, avg_class_size, subject)
          VALUES (${row.school_year}, ${row.district_name}, ${row.avg_class_size}, ${row.subject})
          ON CONFLICT (school_year, district_name, subject)
          DO UPDATE SET avg_class_size = EXCLUDED.avg_class_size
        `;
        classCount++;
      } catch (err: any) {
        console.log(`  Error inserting class size ${row.school_year}/${row.subject}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${classCount} class size rows`);

    // Update graduation rates (5-year) in existing table
    let gradCount = 0;
    for (const row of gradRates) {
      try {
        // Try update first (existing row from parse-education.ts)
        const updated = await sql`
          UPDATE education.graduation_rates
          SET
            rate_4yr = COALESCE(${row.rate_4yr}, rate_4yr),
            rate_5yr = COALESCE(${row.rate_5yr}, rate_5yr),
            source = 'ODE cohort media file'
          WHERE school_year = ${row.school_year}
            AND district_name = ${DISTRICT_NAME}
          RETURNING id
        `;
        if (updated.length === 0) {
          // Insert new row
          await sql`
            INSERT INTO education.graduation_rates
              (school_year, district_name, rate_4yr, rate_5yr, source)
            VALUES (
              ${row.school_year}, ${DISTRICT_NAME},
              ${row.rate_4yr}, ${row.rate_5yr}, 'ODE cohort media file'
            )
            ON CONFLICT (school_year, district_name)
            DO UPDATE SET
              rate_4yr = COALESCE(EXCLUDED.rate_4yr, education.graduation_rates.rate_4yr),
              rate_5yr = COALESCE(EXCLUDED.rate_5yr, education.graduation_rates.rate_5yr)
          `;
        }
        gradCount++;
      } catch (err: any) {
        console.log(`  Error updating graduation rate ${row.school_year}: ${err.message}`);
      }
    }
    console.log(`  Updated ${gradCount} graduation rate rows with 5-year data`);

    // Update dashboard cache
    const cacheData = {
      source: "Oregon Department of Education (extended data)",
      chronic_absenteeism: absenteeism,
      per_pupil_spending: spending,
      class_size: classSize,
      graduation_rates_updated: gradRates,
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('education_extended', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with education_extended entry");

    // Verification
    console.log("\n  Verification:");

    const absVerify = await sql`
      SELECT school_year, regular_attenders_pct, chronic_absent_pct, total_students
      FROM education.chronic_absenteeism
      ORDER BY school_year
    `;
    if (absVerify.length > 0) {
      console.log("  Chronic Absenteeism:");
      for (const r of absVerify) {
        console.log(`    ${r.school_year}: Regular ${r.regular_attenders_pct}%, Chronic Absent ${r.chronic_absent_pct}%, Students: ${r.total_students}`);
      }
    }

    const spendVerify = await sql`
      SELECT school_year, total_per_pupil
      FROM education.per_pupil_spending
      ORDER BY school_year
    `;
    if (spendVerify.length > 0) {
      console.log("  Per-Pupil Spending:");
      for (const r of spendVerify) {
        console.log(`    ${r.school_year}: $${r.total_per_pupil}`);
      }
    }

    const classVerify = await sql`
      SELECT school_year, subject, avg_class_size
      FROM education.class_size
      ORDER BY school_year, subject
    `;
    if (classVerify.length > 0) {
      console.log("  Class Size:");
      for (const r of classVerify) {
        console.log(`    ${r.school_year} ${r.subject}: ${r.avg_class_size}`);
      }
    }

    const gradVerify = await sql`
      SELECT school_year, rate_4yr, rate_5yr, source
      FROM education.graduation_rates
      ORDER BY school_year
    `;
    if (gradVerify.length > 0) {
      console.log("  Graduation Rates:");
      for (const r of gradVerify) {
        console.log(`    ${r.school_year}: 4yr=${r.rate_4yr}%, 5yr=${r.rate_5yr || "N/A"}% (${r.source})`);
      }
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Extended Education Data Fetch");
  console.log("===================================================");
  console.log(`Data directory: ${DATA_DIR}`);

  // Ensure data dir exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Fetch all data sources
  const absenteeism = await fetchChronicAbsenteeism();
  const spending = await fetchPerPupilSpending();
  const classSize = await fetchClassSize();
  const gradRates = await fetchGraduationRates();

  // Insert into database
  await insertAllData(absenteeism, spending, classSize, gradRates);

  // Summary
  console.log("\n===================================================");
  console.log("Extended Education Data Fetch Complete!");
  console.log(`  Chronic Absenteeism: ${absenteeism.length} year(s)`);
  console.log(`  Per-Pupil Spending:  ${spending.length} year(s)`);
  console.log(`  Class Size:          ${classSize.length} row(s)`);
  console.log(`  Graduation Rates:    ${gradRates.length} year(s) updated with 5yr data`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
