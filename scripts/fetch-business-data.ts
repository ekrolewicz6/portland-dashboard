/**
 * fetch-business-data.ts
 *
 * Fetches real business/employment data for Portland, Oregon from public APIs:
 *   1. BLS API — Portland MSA employment + Multnomah County unemployment
 *   2. Census County Business Patterns — establishment counts
 *   3. data.oregon.gov Socrata API — Oregon business registrations
 *
 * Usage: npx tsx scripts/fetch-business-data.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Logging ─────────────────────────────────────────────────────────────

const log = {
  attempts: [] as { source: string; url: string; status: string; detail: string }[],
  record(source: string, url: string, status: string, detail: string) {
    this.attempts.push({ source, url, status, detail });
    const icon = status === "success" ? "[OK]" : "[FAIL]";
    console.log(`  ${icon} ${source}: ${detail}`);
  },
};

// ── Types ───────────────────────────────────────────────────────────────

interface BLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  value: string;
}

interface BLSSeries {
  seriesID: string;
  data: BLSDataPoint[];
}

interface BLSResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results?: {
    series: BLSSeries[];
  };
}

interface EmploymentRecord {
  source: string;
  series_id: string;
  year: number;
  month: number;
  period_name: string;
  value: number;
  measure: string;
}

interface EstablishmentRecord {
  source: string;
  year: number;
  county_fips: string;
  state_fips: string;
  establishments: number;
  size_label: string;
  size_code: string;
}

interface OregonBusiness {
  registry_number?: string;
  business_name?: string;
  entity_type?: string;
  registry_date?: string;
  state?: string;
  associated_name_type?: string;
  city?: string;
  zip_code?: string;
  // Socrata fields vary — accept anything
  [key: string]: unknown;
}

// ── 1. BLS API ──────────────────────────────────────────────────────────

async function fetchBLS(): Promise<EmploymentRecord[]> {
  console.log("\n=== Source 1: BLS Public API ===");

  const series = [
    {
      id: "SMU41384200000000001",
      measure: "total_nonfarm_employment",
      desc: "Portland MSA Total Nonfarm Employment (thousands)",
    },
    {
      id: "LAUCN41051000000003",
      measure: "unemployment_rate",
      desc: "Multnomah County Unemployment Rate",
    },
    {
      id: "LAUCN41051000000005",
      measure: "employment_level",
      desc: "Multnomah County Employment Level",
    },
    {
      id: "LAUCN41051000000006",
      measure: "labor_force",
      desc: "Multnomah County Labor Force",
    },
  ];

  const records: EmploymentRecord[] = [];

  for (const s of series) {
    const url = `https://api.bls.gov/publicAPI/v1/timeseries/data/${s.id}`;
    console.log(`  Fetching ${s.desc}...`);
    console.log(`    URL: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        log.record("BLS", url, "fail", `HTTP ${res.status}`);
        continue;
      }

      const json = (await res.json()) as BLSResponse;

      if (json.status !== "REQUEST_SUCCEEDED") {
        log.record("BLS", url, "fail", `API status: ${json.status} — ${json.message?.join("; ")}`);
        continue;
      }

      const seriesData = json.Results?.series?.[0];
      if (!seriesData || !seriesData.data?.length) {
        log.record("BLS", url, "fail", "No data in response");
        continue;
      }

      for (const dp of seriesData.data) {
        // period = "M01" through "M12", or "M13" for annual
        const monthMatch = dp.period.match(/^M(\d{2})$/);
        if (!monthMatch) continue;
        const month = parseInt(monthMatch[1], 10);
        if (month < 1 || month > 12) continue;

        records.push({
          source: "BLS",
          series_id: s.id,
          year: parseInt(dp.year, 10),
          month,
          period_name: dp.periodName,
          value: parseFloat(dp.value),
          measure: s.measure,
        });
      }

      log.record("BLS", url, "success", `${seriesData.data.length} data points for ${s.desc}`);
    } catch (err: any) {
      log.record("BLS", url, "fail", err.message);
    }
  }

  console.log(`  Total BLS records: ${records.length}`);
  return records;
}

// ── 2. Census County Business Patterns ──────────────────────────────────

async function fetchCensus(): Promise<EstablishmentRecord[]> {
  console.log("\n=== Source 2: Census County Business Patterns ===");

  const records: EstablishmentRecord[] = [];

  // Try multiple years
  const years = [2022, 2021, 2020, 2019, 2018];

  for (const year of years) {
    const url = `https://api.census.gov/data/${year}/cbp?get=ESTAB,EMPSZES_LABEL,EMPSZES&for=county:051&in=state:41`;
    console.log(`  Fetching ${year} CBP data...`);
    console.log(`    URL: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        log.record("Census CBP", url, "fail", `HTTP ${res.status}`);
        continue;
      }

      const json = (await res.json()) as string[][];

      if (!Array.isArray(json) || json.length < 2) {
        log.record("Census CBP", url, "fail", "Unexpected response format");
        continue;
      }

      // First row is headers: ["ESTAB","EMPSZES_LABEL","EMPSZES","state","county"]
      const headers = json[0];
      const estabIdx = headers.indexOf("ESTAB");
      const labelIdx = headers.indexOf("EMPSZES_LABEL");
      const codeIdx = headers.indexOf("EMPSZES");
      const stateIdx = headers.indexOf("state");
      const countyIdx = headers.indexOf("county");

      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        records.push({
          source: "Census CBP",
          year,
          county_fips: row[countyIdx] ?? "051",
          state_fips: row[stateIdx] ?? "41",
          establishments: parseInt(row[estabIdx], 10) || 0,
          size_label: row[labelIdx] ?? "unknown",
          size_code: row[codeIdx] ?? "unknown",
        });
      }

      log.record("Census CBP", url, "success", `${json.length - 1} rows for ${year}`);
    } catch (err: any) {
      log.record("Census CBP", url, "fail", err.message);
    }
  }

  console.log(`  Total Census CBP records: ${records.length}`);
  return records;
}

// ── 3. Oregon Secretary of State / data.oregon.gov ──────────────────────

async function fetchOregonBusinesses(): Promise<OregonBusiness[]> {
  console.log("\n=== Source 3: data.oregon.gov (Socrata) ===");

  const records: OregonBusiness[] = [];

  // Known dataset IDs to try for Oregon business registrations
  const datasetAttempts = [
    {
      id: "ygua-vbpg",
      desc: "Oregon New Business Registrations",
    },
    {
      id: "esjy-x697",
      desc: "Active Oregon Businesses",
    },
    {
      id: "nwzr-fqhe",
      desc: "Oregon Business Registry",
    },
  ];

  // Also try the catalog/discovery endpoint
  const catalogUrl = "https://data.oregon.gov/api/views?category=Business&limit=10";
  console.log(`  Searching catalog: ${catalogUrl}`);

  try {
    const catalogRes = await fetch(catalogUrl);
    if (catalogRes.ok) {
      const catalog = await catalogRes.json();
      if (Array.isArray(catalog)) {
        for (const ds of catalog) {
          console.log(`    Found dataset: ${ds.id} — "${ds.name}"`);
          if (
            ds.id &&
            !datasetAttempts.some((d) => d.id === ds.id)
          ) {
            datasetAttempts.push({ id: ds.id, desc: ds.name });
          }
        }
        log.record("data.oregon.gov catalog", catalogUrl, "success", `Found ${catalog.length} datasets`);
      }
    } else {
      log.record("data.oregon.gov catalog", catalogUrl, "fail", `HTTP ${catalogRes.status}`);
    }
  } catch (err: any) {
    log.record("data.oregon.gov catalog", catalogUrl, "fail", err.message);
  }

  // Also try searching by keyword
  const searchUrl =
    "https://data.oregon.gov/api/catalog/v1?q=business+registration&limit=10&only=datasets";
  console.log(`  Searching datasets: ${searchUrl}`);

  try {
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = searchData.results ?? [];
      for (const r of results) {
        const rid = r.resource?.id;
        const rname = r.resource?.name ?? r.name;
        if (rid) {
          console.log(`    Found: ${rid} — "${rname}"`);
          if (!datasetAttempts.some((d) => d.id === rid)) {
            datasetAttempts.push({ id: rid, desc: rname ?? "Unknown" });
          }
        }
      }
      log.record("data.oregon.gov search", searchUrl, "success", `Found ${results.length} datasets`);
    } else {
      log.record("data.oregon.gov search", searchUrl, "fail", `HTTP ${searchRes.status}`);
    }
  } catch (err: any) {
    log.record("data.oregon.gov search", searchUrl, "fail", err.message);
  }

  // Try each dataset
  for (const ds of datasetAttempts) {
    // Filter for Portland/Multnomah County businesses
    const filters = [
      `$where=upper(city)='PORTLAND'&$limit=2000&$order=:id`,
      `$where=county='MULTNOMAH' OR upper(city)='PORTLAND'&$limit=2000&$order=:id`,
      `$limit=100&$order=:id`, // Fallback: just get some data to see structure
    ];

    for (const filter of filters) {
      const url = `https://data.oregon.gov/resource/${ds.id}.json?${filter}`;
      console.log(`  Trying ${ds.desc}: ${url}`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          log.record("data.oregon.gov", url, "fail", `HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();

        if (json.error || json.message) {
          log.record(
            "data.oregon.gov",
            url,
            "fail",
            json.message ?? json.error ?? "Unknown error"
          );
          continue;
        }

        if (!Array.isArray(json) || json.length === 0) {
          log.record("data.oregon.gov", url, "fail", "Empty result");
          continue;
        }

        // Log sample record structure
        console.log(`    Sample record keys: ${Object.keys(json[0]).join(", ")}`);

        for (const r of json) {
          records.push(r as OregonBusiness);
        }

        log.record(
          "data.oregon.gov",
          url,
          "success",
          `${json.length} records from "${ds.desc}"`
        );

        // If we got Portland data, stop trying other filters for this dataset
        if (json.length > 50) break;
      } catch (err: any) {
        log.record("data.oregon.gov", url, "fail", err.message);
      }
    }

    // If we have enough data, stop
    if (records.length >= 500) break;
  }

  console.log(`  Total Oregon SOS records: ${records.length}`);
  return records;
}

// ── 4. QCEW (BLS Quarterly Census of Employment and Wages) ──────────────

async function fetchQCEW(): Promise<EmploymentRecord[]> {
  console.log("\n=== Source 4: BLS QCEW (Establishment Counts) ===");

  const records: EmploymentRecord[] = [];

  // QCEW has a CSV API — try getting Multnomah County (FIPS 41051) data
  // Format: https://data.bls.gov/cew/data/api/YEAR/QTR/area/FIPS.csv
  const years = [2024, 2023, 2022];
  const quarters = ["1", "2", "3", "4"];

  for (const year of years) {
    for (const qtr of quarters) {
      const url = `https://data.bls.gov/cew/data/api/${year}/${qtr}/area/41051.csv`;
      console.log(`  Trying QCEW ${year} Q${qtr}...`);

      try {
        const res = await fetch(url);
        if (!res.ok) {
          log.record("QCEW", url, "fail", `HTTP ${res.status}`);
          continue;
        }

        const text = await res.text();
        const lines = text.split("\n").filter((l) => l.trim());

        if (lines.length < 2) {
          log.record("QCEW", url, "fail", "No data rows");
          continue;
        }

        // Parse CSV header
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
        const estabIdx = headers.indexOf("qtrly_estabs");
        const emplIdx = headers.indexOf("month1_emplvl");
        const wageIdx = headers.indexOf("avg_wkly_wage");
        const ownIdx = headers.indexOf("own_code");
        const indIdx = headers.indexOf("industry_code");

        // Get total private (own_code=5) all industries (industry_code=10)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
          const ownCode = cols[ownIdx];
          const indCode = cols[indIdx];

          // "0" = all ownerships, "10" = all industries
          // "5" = private, "10" = all industries
          if ((ownCode === "0" || ownCode === "5") && indCode === "10") {
            const estabs = parseInt(cols[estabIdx], 10);
            const empl = parseInt(cols[emplIdx], 10);

            if (!isNaN(estabs) && estabs > 0) {
              records.push({
                source: "QCEW",
                series_id: `QCEW-41051-own${ownCode}`,
                year,
                month: parseInt(qtr, 10) * 3, // approximate month
                period_name: `Q${qtr}`,
                value: estabs,
                measure: ownCode === "5" ? "private_establishments" : "total_establishments",
              });
            }

            if (!isNaN(empl) && empl > 0) {
              records.push({
                source: "QCEW",
                series_id: `QCEW-41051-own${ownCode}-empl`,
                year,
                month: parseInt(qtr, 10) * 3,
                period_name: `Q${qtr}`,
                value: empl,
                measure: ownCode === "5" ? "private_employment" : "total_employment",
              });
            }
          }
        }

        log.record(
          "QCEW",
          url,
          "success",
          `Parsed ${lines.length - 1} rows for ${year} Q${qtr}`
        );

        // Got data for this year — don't need to go further back
        if (records.length > 0 && year <= 2023) break;
      } catch (err: any) {
        log.record("QCEW", url, "fail", err.message);
      }
    }
  }

  console.log(`  Total QCEW records: ${records.length}`);
  return records;
}

// ── Save & Insert ───────────────────────────────────────────────────────

function saveJson(filename: string, data: unknown) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  Saved ${filepath}`);
}

async function insertIntoDb(
  blsData: EmploymentRecord[],
  censusData: EstablishmentRecord[],
  oregonBiz: OregonBusiness[],
  qcewData: EmploymentRecord[]
) {
  console.log("\n=== Inserting into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS business`);

    // ── BLS Employment Data table ──────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.bls_employment (
        id              SERIAL PRIMARY KEY,
        source          TEXT NOT NULL,
        series_id       TEXT NOT NULL,
        year            INTEGER NOT NULL,
        month           INTEGER NOT NULL,
        period_name     TEXT,
        value           NUMERIC(14,2) NOT NULL,
        measure         TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (series_id, year, month)
      )
    `);

    if (blsData.length > 0) {
      await sql.unsafe(`TRUNCATE business.bls_employment RESTART IDENTITY`);
      console.log(`  Inserting ${blsData.length} BLS records...`);
      let count = 0;
      for (const r of blsData) {
        try {
          await sql`
            INSERT INTO business.bls_employment (source, series_id, year, month, period_name, value, measure)
            VALUES (${r.source}, ${r.series_id}, ${r.year}, ${r.month}, ${r.period_name}, ${r.value}, ${r.measure})
            ON CONFLICT (series_id, year, month) DO UPDATE SET value = ${r.value}
          `;
          count++;
        } catch { /* skip */ }
      }
      console.log(`    Inserted ${count} BLS records`);
    }

    // ── Census CBP table ──────────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.census_cbp (
        id              SERIAL PRIMARY KEY,
        source          TEXT NOT NULL,
        year            INTEGER NOT NULL,
        county_fips     TEXT NOT NULL,
        state_fips      TEXT NOT NULL,
        establishments  INTEGER NOT NULL,
        size_label      TEXT,
        size_code       TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (year, county_fips, state_fips, size_code)
      )
    `);

    if (censusData.length > 0) {
      await sql.unsafe(`TRUNCATE business.census_cbp RESTART IDENTITY`);
      console.log(`  Inserting ${censusData.length} Census CBP records...`);
      let count = 0;
      for (const r of censusData) {
        try {
          await sql`
            INSERT INTO business.census_cbp (source, year, county_fips, state_fips, establishments, size_label, size_code)
            VALUES (${r.source}, ${r.year}, ${r.county_fips}, ${r.state_fips}, ${r.establishments}, ${r.size_label}, ${r.size_code})
            ON CONFLICT (year, county_fips, state_fips, size_code) DO UPDATE SET establishments = ${r.establishments}
          `;
          count++;
        } catch { /* skip */ }
      }
      console.log(`    Inserted ${count} Census CBP records`);
    }

    // ── QCEW table (reuse bls_employment) ──────────────────────────────
    if (qcewData.length > 0) {
      console.log(`  Inserting ${qcewData.length} QCEW records into bls_employment...`);
      let count = 0;
      for (const r of qcewData) {
        try {
          await sql`
            INSERT INTO business.bls_employment (source, series_id, year, month, period_name, value, measure)
            VALUES (${r.source}, ${r.series_id}, ${r.year}, ${r.month}, ${r.period_name}, ${r.value}, ${r.measure})
            ON CONFLICT (series_id, year, month) DO UPDATE SET value = ${r.value}
          `;
          count++;
        } catch { /* skip */ }
      }
      console.log(`    Inserted ${count} QCEW records`);
    }

    // ── Oregon SOS businesses table ───────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS business.oregon_registrations (
        id                SERIAL PRIMARY KEY,
        registry_number   TEXT,
        business_name     TEXT,
        entity_type       TEXT,
        registry_date     DATE,
        city              TEXT,
        state             TEXT,
        zip_code          TEXT,
        raw_data          JSONB,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (registry_number)
      )
    `);

    if (oregonBiz.length > 0) {
      await sql.unsafe(`TRUNCATE business.oregon_registrations RESTART IDENTITY`);
      console.log(`  Inserting ${oregonBiz.length} Oregon business records...`);
      let count = 0;
      for (const r of oregonBiz) {
        const regNum = r.registry_number ?? r.registry_num ?? String(count + 1);
        try {
          await sql`
            INSERT INTO business.oregon_registrations
              (registry_number, business_name, entity_type, registry_date, city, state, zip_code, raw_data)
            VALUES (
              ${String(regNum)},
              ${r.business_name ?? (r as any).entity_name ?? null},
              ${r.entity_type ?? null},
              ${r.registry_date ? String(r.registry_date).slice(0, 10) : null}::date,
              ${r.city ?? null},
              ${r.state ?? null},
              ${r.zip_code ?? null},
              ${sql.json(r)}
            )
            ON CONFLICT (registry_number) DO NOTHING
          `;
          count++;
        } catch { /* skip */ }
      }
      console.log(`    Inserted ${count} Oregon business records`);
    }

    // ── Update dashboard cache ────────────────────────────────────────
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.dashboard_cache (
        question TEXT PRIMARY KEY,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    const allEmployment = [...blsData, ...qcewData];
    const empByMeasure: Record<string, EmploymentRecord[]> = {};
    for (const r of allEmployment) {
      if (!empByMeasure[r.measure]) empByMeasure[r.measure] = [];
      empByMeasure[r.measure].push(r);
    }

    // Sort each measure by year/month
    for (const m of Object.keys(empByMeasure)) {
      empByMeasure[m].sort((a, b) => a.year - b.year || a.month - b.month);
    }

    // Get total establishments from Census CBP ("All establishments" size code)
    const totalEstabs = censusData.filter(
      (r) => r.size_code === "001" || r.size_label.toLowerCase().includes("all")
    );
    totalEstabs.sort((a, b) => a.year - b.year);

    const bizCache = {
      data_available: allEmployment.length > 0 || censusData.length > 0 || oregonBiz.length > 0,
      sources_fetched: {
        bls: blsData.length,
        census_cbp: censusData.length,
        oregon_sos: oregonBiz.length,
        qcew: qcewData.length,
      },
      employment_by_measure: Object.fromEntries(
        Object.entries(empByMeasure).map(([k, v]) => [
          k,
          v.map((r) => ({
            year: r.year,
            month: r.month,
            value: r.value,
          })),
        ])
      ),
      establishment_counts: totalEstabs.map((r) => ({
        year: r.year,
        establishments: r.establishments,
        label: r.size_label,
      })),
      oregon_businesses_count: oregonBiz.length,
      fetch_date: new Date().toISOString().slice(0, 10),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('business_real_data', ${sql.json(bizCache)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(bizCache)}, updated_at = now()
    `;
    console.log("  Updated dashboard_cache with business_real_data");

    // ── Verify ────────────────────────────────────────────────────────
    console.log("\n=== Verification ===");
    const tables = [
      "business.bls_employment",
      "business.census_cbp",
      "business.oregon_registrations",
    ];
    for (const t of tables) {
      try {
        const result = await sql.unsafe(`SELECT count(*)::int as cnt FROM ${t}`);
        console.log(`  ${t}: ${result[0].cnt} rows`);
      } catch (err: any) {
        console.log(`  ${t}: error — ${err.message}`);
      }
    }

    await sql.end();
  } catch (err: any) {
    console.error("  DB error:", err.message);
    await sql.end();
    throw err;
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — Business Data Fetcher");
  console.log("===========================================");
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Database: ${DB_URL}`);

  // Fetch from all sources in parallel
  const [blsData, censusData, oregonBiz, qcewData] = await Promise.all([
    fetchBLS(),
    fetchCensus(),
    fetchOregonBusinesses(),
    fetchQCEW(),
  ]);

  // Save JSON
  console.log("\n=== Saving JSON ===");
  const combined = {
    fetchDate: new Date().toISOString(),
    bls: blsData,
    census_cbp: censusData,
    oregon_sos: oregonBiz,
    qcew: qcewData,
  };
  saveJson("business-real.json", combined);

  // Insert into DB
  await insertIntoDb(blsData, censusData, oregonBiz, qcewData);

  // Log summary
  console.log("\n=== Attempt Log ===");
  for (const a of log.attempts) {
    console.log(`  ${a.status.toUpperCase().padEnd(7)} | ${a.source.padEnd(30)} | ${a.detail}`);
  }

  const successCount = log.attempts.filter((a) => a.status === "success").length;
  const failCount = log.attempts.filter((a) => a.status === "fail").length;

  console.log("\n=== Summary ===");
  console.log(`  BLS employment records:    ${blsData.length}`);
  console.log(`  Census CBP records:        ${censusData.length}`);
  console.log(`  Oregon SOS records:        ${oregonBiz.length}`);
  console.log(`  QCEW records:              ${qcewData.length}`);
  console.log(`  Total API attempts:        ${log.attempts.length} (${successCount} succeeded, ${failCount} failed)`);

  if (blsData.length === 0 && censusData.length === 0 && oregonBiz.length === 0 && qcewData.length === 0) {
    console.log("\n  WARNING: No data was fetched from any source.");
    console.log("  The API endpoints may be temporarily unavailable.");
    console.log("  The script created the tables and saved an empty JSON file.");
    console.log("  Re-run later or check network connectivity.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
