/**
 * fetch-hsd-dashboard.ts
 *
 * Fetches data from the Multnomah County HSD dashboards and saves to Supabase.
 * Run monthly to pull the latest data as it's updated.
 *
 * Data sources:
 *   1. HSD Quarterly Dashboard (Chart.js) — https://hsd.multco.us/quarterly-data-dashboard/
 *      Uses window.johs.charts.push() with JSON config objects.
 *   2. Evicted in Oregon (Datawrapper) — https://datawrapper.dwcdn.net/0Ofed/22/dataset.csv
 *      Tab-separated, county rows x month columns.
 *
 * Future: Add tableau-scraper for the main Tableau dashboard at:
 *   https://public.tableau.com/views/MultnomahCountyHomelessServicesDepartmentDataDashboard_17447622060640/TotalPopulation
 *
 * Usage: npx tsx scripts/fetch-hsd-dashboard.ts
 */

import postgres from "postgres";
import { writeFile } from "fs/promises";
import path from "path";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ── 1. HSD Quarterly Dashboard ───────────────────────────────────────────
// Format: window.johs.charts.push({ id: 'chart-XXXX', config: { type: '...', data: { labels: [...], datasets: [{ "data": ["val",...] }] } } });

interface ChartData {
  id: string;
  label: string;
  labels: string[];
  data: number[];
}

async function fetchQuarterlyDashboard(): Promise<ChartData[]> {
  console.log("1. Fetching HSD Quarterly Dashboard...");
  const html = await fetchText("https://hsd.multco.us/quarterly-data-dashboard/");

  // Extract all window.johs.charts.push() calls
  const charts: ChartData[] = [];
  const pushRegex = /window\.johs\.charts\.push\(\s*(\{[\s\S]*?\})\s*\);/g;
  let match;

  while ((match = pushRegex.exec(html)) !== null) {
    try {
      // The config is JS object literal — parse it as JSON after cleaning
      const raw = match[1];

      // Extract id
      const idMatch = raw.match(/id:\s*['"]([^'"]+)['"]/);
      const id = idMatch?.[1] ?? "unknown";

      // Extract labels array
      const labelsMatch = raw.match(/labels:\s*\[([^\]]+)\]/);
      const labels = labelsMatch
        ? labelsMatch[1]
            .split(",")
            .map((s) => s.trim().replace(/"/g, ""))
            .filter((s) => s.length > 0)
        : [];

      // Extract dataset label and data
      // Format: "label":"Some Label","data":["4406","4266","5477"]
      const datasetLabelMatch = raw.match(/"label"\s*:\s*"([^"]+)"/);
      const datasetLabel = datasetLabelMatch?.[1] ?? id;

      const dataMatch = raw.match(/"data"\s*:\s*\[([^\]]+)\]/);
      const data = dataMatch
        ? dataMatch[1]
            .split(",")
            .map((s) => parseFloat(s.trim().replace(/"/g, "")))
            .filter((n) => !isNaN(n))
        : [];

      if (data.length > 0) {
        charts.push({ id, label: datasetLabel, labels, data });
        console.log(`   Chart ${id}: "${datasetLabel}" — ${data.length} values`);
      }
    } catch (e) {
      // Skip unparseable charts
    }
  }

  console.log(`   Total: ${charts.length} charts extracted`);
  return charts;
}

// ── 2. Eviction filings (Datawrapper TSV) ────────────────────────────────
// Tab-separated: first column = county, remaining columns = months (Mar, Apr, ... Feb)
// First row after header = Oregon statewide

interface EvictionRow {
  county: string;
  total: number;
  months: { month: string; filings: number }[];
}

async function fetchEvictionFilings(): Promise<EvictionRow[]> {
  console.log("\n2. Fetching eviction filings from Evicted in Oregon...");
  const tsv = await fetchText("https://datawrapper.dwcdn.net/0Ofed/22/dataset.csv");
  const lines = tsv.trim().split("\n");

  // Header: \tTotal\tMar\tApr\tMay\tJun\tJul\tAug\tSep\tOct\tNov\tDec\tJan\tFeb
  const header = lines[0].split("\t").map((h) => h.trim());
  // Month columns start at index 2 (skip county name at 0, Total at 1)
  const monthNames = header.slice(2);

  // Map month abbreviations to YYYY-MM-01 dates
  // The data covers Mar 2025 - Feb 2026 based on our prior knowledge
  const monthToDate: Record<string, string> = {
    Mar: "2025-03-01", Apr: "2025-04-01", May: "2025-05-01",
    Jun: "2025-06-01", Jul: "2025-07-01", Aug: "2025-08-01",
    Sep: "2025-09-01", Oct: "2025-10-01", Nov: "2025-11-01",
    Dec: "2025-12-01", Jan: "2026-01-01", Feb: "2026-02-01",
  };

  const rows: EvictionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t").map((c) => c.trim());
    const county = cols[0].replace(/\*$/, ""); // Remove asterisk footnotes
    const total = parseInt(cols[1], 10);
    const months: { month: string; filings: number }[] = [];

    for (let j = 0; j < monthNames.length; j++) {
      const filings = parseInt(cols[j + 2], 10);
      const monthDate = monthToDate[monthNames[j]];
      if (!isNaN(filings) && monthDate) {
        months.push({ month: monthDate, filings });
      }
    }

    if (!isNaN(total)) {
      rows.push({ county, total, months });
    }
  }

  console.log(`   Parsed ${rows.length} counties, ${monthNames.length} months each`);
  const target = rows.filter((r) =>
    ["Oregon", "Multnomah", "Washington", "Clackamas"].includes(r.county),
  );
  for (const r of target) {
    console.log(`   ${r.county}: ${r.total} total filings`);
  }
  return rows;
}

// ── 3. Save to database ──────────────────────────────────────────────────

async function saveToDatabase(
  charts: ChartData[],
  evictionRows: EvictionRow[],
) {
  console.log("\n3. Saving to database...");
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS homelessness`);

    // ── Shelter capacity from Chart.js ──────────────────────────────
    // Find the shelter capacity chart (line chart with 12 data points)
    const shelterChart = charts.find(
      (c) => c.data.length === 12 && c.label.toLowerCase().includes("bed"),
    ) ?? charts.find((c) => c.data.length === 12);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.shelter_capacity (
        id SERIAL PRIMARY KEY,
        quarter TEXT NOT NULL,
        total_beds INT,
        county_24hr_beds INT,
        city_overnight_beds INT,
        utilization_pct NUMERIC(5,1),
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(quarter)
      )
    `);

    let shelterInserted = 0;
    if (shelterChart) {
      // FY quarters → calendar quarters
      const calendarQuarters = [
        "2021-Q3", "2021-Q4", "2022-Q1", "2022-Q2",
        "2022-Q3", "2022-Q4", "2023-Q1", "2023-Q2",
        "2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2",
      ];
      for (let i = 0; i < shelterChart.data.length && i < calendarQuarters.length; i++) {
        await sql`
          INSERT INTO homelessness.shelter_capacity (quarter, total_beds, source)
          VALUES (${calendarQuarters[i]}, ${shelterChart.data[i]}, 'HSD Quarterly Dashboard (automated fetch)')
          ON CONFLICT (quarter) DO UPDATE SET
            total_beds = EXCLUDED.total_beds,
            source = EXCLUDED.source
        `;
        shelterInserted++;
      }
    }
    console.log(`   Upserted ${shelterInserted} shelter capacity records`);

    // ── Utilization from Chart.js ───────────────────────────────────
    const utilChart = charts.find(
      (c) => c.data.length === 4 && c.data.every((v) => v > 50 && v < 100),
    );
    if (utilChart) {
      const utilQuarters = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"];
      for (let i = 0; i < utilChart.data.length && i < utilQuarters.length; i++) {
        await sql`
          UPDATE homelessness.shelter_capacity
          SET utilization_pct = ${utilChart.data[i]}
          WHERE quarter = ${utilQuarters[i]}
        `;
      }
      console.log(`   Updated ${utilChart.data.length} utilization records`);
    }

    // ── Eviction filings ────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.eviction_filings (
        id SERIAL PRIMARY KEY,
        month DATE NOT NULL,
        county TEXT NOT NULL,
        filings INT,
        filing_rate_per_100 NUMERIC(5,2),
        default_judgments INT,
        stipulated_agreements INT,
        source TEXT DEFAULT 'Evicted in Oregon / HRAC PSU',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(month, county)
      )
    `);

    // Save all counties (not just tri-county) for comprehensive data
    const targetCounties = ["Oregon", "Multnomah", "Washington"];
    let evictionInserted = 0;
    for (const row of evictionRows) {
      if (!targetCounties.includes(row.county)) continue;
      const countyLabel = row.county === "Oregon" ? "Oregon (statewide)" : row.county;
      for (const m of row.months) {
        await sql`
          INSERT INTO homelessness.eviction_filings (month, county, filings, source)
          VALUES (${m.month}::date, ${countyLabel}, ${m.filings}, 'Evicted in Oregon (automated fetch)')
          ON CONFLICT (month, county) DO UPDATE SET
            filings = EXCLUDED.filings,
            source = EXCLUDED.source
        `;
        evictionInserted++;
      }
    }
    console.log(`   Upserted ${evictionInserted} eviction filing records`);

    // ── Timestamp ───────────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.context_stats (
        id SERIAL PRIMARY KEY,
        metric TEXT NOT NULL,
        value TEXT NOT NULL,
        context TEXT,
        source TEXT,
        as_of_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(metric)
      )
    `);

    await sql`
      INSERT INTO homelessness.context_stats (metric, value, context, source, as_of_date)
      VALUES (
        'hsd_dashboard_last_fetch',
        ${new Date().toISOString()},
        'Last automated fetch of HSD quarterly dashboard + eviction data',
        'scripts/fetch-hsd-dashboard.ts',
        ${new Date().toISOString().split("T")[0]}::date
      )
      ON CONFLICT (metric) DO UPDATE SET
        value = EXCLUDED.value,
        context = EXCLUDED.context,
        as_of_date = EXCLUDED.as_of_date
    `;

    await sql.end();
  } catch (err: any) {
    console.error("DB error:", err.message);
    await sql.end();
    throw err;
  }
}

// ── 4. Save local backup ─────────────────────────────────────────────────

async function saveLocalBackup(
  charts: ChartData[],
  evictionRows: EvictionRow[],
) {
  const backup = {
    fetched_at: new Date().toISOString(),
    quarterly_dashboard_charts: charts,
    eviction_filings: evictionRows.filter((r) =>
      ["Oregon", "Multnomah", "Washington"].includes(r.county),
    ),
    all_eviction_counties: evictionRows.map((r) => r.county),
  };

  const outPath = path.resolve(__dirname, "..", "data", "hsd_fetch_latest.json");
  await writeFile(outPath, JSON.stringify(backup, null, 2));
  console.log(`\n4. Saved local backup to ${outPath}`);
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("HSD Dashboard Data Fetch");
  console.log("========================\n");

  const [charts, evictionRows] = await Promise.all([
    fetchQuarterlyDashboard(),
    fetchEvictionFilings(),
  ]);

  console.log("\nQuarterly dashboard charts:");
  for (const c of charts) {
    console.log(`  "${c.label}": [${c.data.join(", ")}]`);
  }

  await saveToDatabase(charts, evictionRows);
  await saveLocalBackup(charts, evictionRows);

  console.log("\n========================");
  console.log("FETCH COMPLETE");
  console.log("========================");
  console.log("Run this script monthly: npx tsx scripts/fetch-hsd-dashboard.ts");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
