/**
 * fetch-hud-vacancy.ts
 *
 * Attempts to download HUD USPS vacancy data for Multnomah County (FIPS 41051).
 * The HUD USPS dataset provides residential vacancy rates by ZIP code or census tract.
 *
 * Data source: https://www.huduser.gov/portal/datasets/usps.html
 *
 * The HUD API requires registration and a token. This script tries:
 *   1. The HUD User API (requires HUD_API_TOKEN env var)
 *   2. Direct CSV download from known URLs
 *
 * Creates table: public.hud_vacancy
 *
 * Usage: npx tsx scripts/fetch-hud-vacancy.ts
 *        HUD_API_TOKEN=xxx npx tsx scripts/fetch-hud-vacancy.ts
 */

import postgres from "postgres";

const DB_URL =
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const sql = postgres(DB_URL, {
  max: 5,
  onnotice: () => {},
});

// Multnomah County FIPS
const COUNTY_FIPS = "41051";
// Portland-area ZIP codes (Multnomah County)
const PORTLAND_ZIPS = [
  "97201", "97202", "97203", "97204", "97205", "97206", "97207", "97208",
  "97209", "97210", "97211", "97212", "97213", "97214", "97215", "97216",
  "97217", "97218", "97219", "97220", "97221", "97222", "97223", "97224",
  "97225", "97227", "97229", "97230", "97231", "97232", "97233", "97236",
  "97239", "97266",
];

interface HudVacancyRow {
  quarter: string;
  zip_code: string;
  total_addresses: number;
  residential_vacant: number;
  residential_no_stat: number;
  commercial_vacant: number;
}

// ── Create table ────────────────────────────────────────────────────────

async function createTable() {
  console.log("Creating public.hud_vacancy table ...");
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS public.hud_vacancy (
      id                  SERIAL PRIMARY KEY,
      quarter             DATE NOT NULL,
      zip_code            TEXT,
      census_tract        TEXT,
      total_addresses     INTEGER,
      residential_vacant  INTEGER,
      residential_no_stat INTEGER,
      commercial_vacant   INTEGER,
      county_fips         TEXT DEFAULT '41051',
      created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(quarter, zip_code)
    )
  `);
  console.log("  Table created/verified.");
}

// ── Attempt 1: HUD User API ────────────────────────────────────────────

async function tryHudApi(): Promise<HudVacancyRow[] | null> {
  const token = process.env.HUD_API_TOKEN;
  if (!token) {
    console.log("  No HUD_API_TOKEN environment variable set.");
    console.log("  Register at https://www.huduser.gov/hudapi/public/register");
    console.log("  Then run: HUD_API_TOKEN=your_token npx tsx scripts/fetch-hud-vacancy.ts");
    return null;
  }

  console.log("  Attempting HUD User API with provided token ...");

  // The HUD USPS API endpoint for vacancy data by county
  // See: https://www.huduser.gov/portal/dataset/usps-crosswalk-api.html
  const quarters = [
    "012024", "042024", "072024", "102024",
    "012025", "042025", "072025", "102025",
  ];

  const rows: HudVacancyRow[] = [];

  for (const quarter of quarters) {
    try {
      const url = `https://www.huduser.gov/hudapi/public/usps?type=7&query=${COUNTY_FIPS}&year=${quarter.slice(2, 6)}&quarter=${quarter.slice(0, 2) === "01" ? "1" : quarter.slice(0, 2) === "04" ? "2" : quarter.slice(0, 2) === "07" ? "3" : "4"}`;

      console.log(`    Fetching Q${quarter} ...`);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log(`    HTTP ${res.status}: ${await res.text()}`);
        continue;
      }

      const data = await res.json();
      const results = data.data?.results ?? data.results ?? data;

      if (!Array.isArray(results)) {
        console.log(`    Unexpected response format`);
        continue;
      }

      const qYear = Number(quarter.slice(2, 6));
      const qMonth = Number(quarter.slice(0, 2));
      const qDate = `${qYear}-${String(qMonth).padStart(2, "0")}-01`;

      for (const r of results) {
        const zip = r.geoid ?? r.zip ?? r.zip_code;
        if (!zip) continue;

        rows.push({
          quarter: qDate,
          zip_code: String(zip),
          total_addresses: Number(r.tot_ratio ?? r.total ?? 0),
          residential_vacant: Number(r.res_vac ?? r.residential_vacant ?? 0),
          residential_no_stat: Number(r.no_stat_ratio ?? r.no_stat ?? 0),
          commercial_vacant: Number(r.bus_vac ?? r.commercial_vacant ?? 0),
        });
      }

      console.log(`    Got ${results.length} records for ${quarter}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`    Error: ${msg}`);
    }
  }

  return rows.length > 0 ? rows : null;
}

// ── Attempt 2: Direct CSV download ─────────────────────────────────────

async function tryDirectDownload(): Promise<HudVacancyRow[] | null> {
  console.log("  Attempting direct CSV downloads ...");

  // Known URL patterns for HUD USPS data
  const csvUrls = [
    "https://www.huduser.gov/portal/datasets/usps/COUNTY_ZIP_032024.xlsx",
    "https://www.huduser.gov/portal/datasets/usps/ZIP_COUNTY_032024.xlsx",
    "https://www.huduser.gov/portal/datasets/usps/COUNTY_ZIP_122023.xlsx",
    "https://www.huduser.gov/portal/datasets/usps/USPS_Vacancy_Data_Q4_2024.csv",
    "https://www.huduser.gov/portal/datasets/usps/USPS_Vacancy_Data_Q3_2024.csv",
  ];

  for (const url of csvUrls) {
    try {
      console.log(`    Trying ${url} ...`);
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        console.log(`    Got response (${res.status}, ${contentType})`);

        if (contentType.includes("text/csv") || url.endsWith(".csv")) {
          const text = await res.text();
          const lines = text.split("\n").filter((l) => l.trim());
          console.log(`    CSV has ${lines.length} lines`);

          // Try to parse; headers vary by file
          if (lines.length > 1) {
            const headers = lines[0].toLowerCase().split(",");
            const zipIdx = headers.findIndex((h) =>
              h.includes("zip") || h.includes("geoid")
            );
            const countyIdx = headers.findIndex((h) => h.includes("county") || h.includes("fips"));
            const resVacIdx = headers.findIndex((h) => h.includes("res_vac") || h.includes("residential_vac"));
            const totIdx = headers.findIndex((h) => h.includes("total") || h.includes("tot"));
            const busVacIdx = headers.findIndex((h) => h.includes("bus_vac") || h.includes("commercial"));

            const rows: HudVacancyRow[] = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(",");
              const county = countyIdx >= 0 ? cols[countyIdx]?.trim() : "";
              if (county && !county.includes("41051") && !county.includes("Multnomah")) {
                continue;
              }
              const zip = zipIdx >= 0 ? cols[zipIdx]?.trim() : "";
              if (zip && !PORTLAND_ZIPS.includes(zip)) continue;

              rows.push({
                quarter: "2024-10-01", // approximate
                zip_code: zip || "unknown",
                total_addresses: Number(cols[totIdx] || 0),
                residential_vacant: Number(cols[resVacIdx] || 0),
                residential_no_stat: 0,
                commercial_vacant: Number(cols[busVacIdx] || 0),
              });
            }

            if (rows.length > 0) return rows;
          }
        } else {
          // Excel or other binary format
          console.log(
            `    File is ${contentType}, not CSV. Skipping (would need xlsx parser).`
          );
        }
      } else {
        console.log(`    HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`    Error: ${msg}`);
    }
  }

  return null;
}

// ── Insert data ─────────────────────────────────────────────────────────

async function insertData(rows: HudVacancyRow[]) {
  console.log(`\n  Inserting ${rows.length} HUD vacancy records ...`);

  await sql.unsafe(`TRUNCATE public.hud_vacancy RESTART IDENTITY`);

  let count = 0;
  for (const r of rows) {
    try {
      await sql`
        INSERT INTO public.hud_vacancy (
          quarter, zip_code, total_addresses, residential_vacant,
          residential_no_stat, commercial_vacant
        ) VALUES (
          ${r.quarter}::date, ${r.zip_code},
          ${r.total_addresses}, ${r.residential_vacant},
          ${r.residential_no_stat}, ${r.commercial_vacant}
        )
        ON CONFLICT (quarter, zip_code) DO UPDATE SET
          total_addresses = ${r.total_addresses},
          residential_vacant = ${r.residential_vacant},
          residential_no_stat = ${r.residential_no_stat},
          commercial_vacant = ${r.commercial_vacant}
      `;
      count++;
    } catch {
      // Skip individual errors
    }
  }

  console.log(`  Inserted ${count} records into public.hud_vacancy`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — HUD USPS Vacancy Data Fetcher");
  console.log("===================================================");
  console.log(`Target: Multnomah County (FIPS ${COUNTY_FIPS})`);
  console.log(`Portland ZIP codes: ${PORTLAND_ZIPS.length}\n`);

  try {
    await createTable();

    // Try API first, then direct download
    console.log("\n--- Method 1: HUD User API ---");
    let rows = await tryHudApi();

    if (!rows) {
      console.log("\n--- Method 2: Direct CSV download ---");
      rows = await tryDirectDownload();
    }

    if (rows && rows.length > 0) {
      await insertData(rows);
      console.log("\nHUD vacancy data loaded successfully!");
    } else {
      console.log("\n--- Could not fetch HUD USPS vacancy data ---");
      console.log("The HUD USPS data requires either:");
      console.log("  1. An API token (register at https://www.huduser.gov/hudapi/public/register)");
      console.log("  2. Manual CSV download from https://www.huduser.gov/portal/datasets/usps.html");
      console.log("\nThe public.hud_vacancy table has been created and is ready for data.");
      console.log("To load data manually, download the ZIP/County crosswalk file and run:");
      console.log("  HUD_API_TOKEN=your_token npx tsx scripts/fetch-hud-vacancy.ts");
    }

    // Verify
    const count = await sql`SELECT count(*)::int as cnt FROM public.hud_vacancy`;
    console.log(`\nVerification: public.hud_vacancy has ${count[0].cnt} rows`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\nError:", msg);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
