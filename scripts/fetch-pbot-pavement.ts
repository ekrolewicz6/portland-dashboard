/**
 * fetch-pbot-pavement.ts
 *
 * Fetches PBOT pavement condition index (PCI) data from ArcGIS MapServer.
 * Handles pagination for the full dataset.
 *
 * Usage: npx tsx scripts/fetch-pbot-pavement.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const PAVEMENT_URL =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Transportation/MapServer/71/query";

const PAGE_SIZE = 2000;

interface ArcGISResponse {
  features: Array<{
    attributes: Record<string, any>;
  }>;
  exceededTransferLimit?: boolean;
}

async function fetchAllPavement(): Promise<Record<string, any>[]> {
  console.log("  Fetching pavement condition data...");
  const allFeatures: Record<string, any>[] = [];
  let offset = 0;

  const outFields = [
    "PCI",
    "Streetname",
    "SurfaceType",
    "FunctionalClass",
    "InspectionYear",
    "Length",
    "SqYards",
    "NumberOfLanes",
  ].join(",");

  while (true) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields,
      returnGeometry: "false",
      f: "json",
      resultRecordCount: String(PAGE_SIZE),
      resultOffset: String(offset),
    });

    const url = `${PAVEMENT_URL}?${params}`;
    console.log(`  Fetching page (offset ${offset})...`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ArcGIS returned HTTP ${res.status}`);
    }

    const data: ArcGISResponse = await res.json();
    const features = data.features ?? [];
    console.log(`    Got ${features.length} features`);

    for (const f of features) {
      allFeatures.push(f.attributes);
    }

    if (features.length < PAGE_SIZE && !data.exceededTransferLimit) {
      break;
    }
    offset += features.length;

    // Brief pause between pages
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`  Total pavement records: ${allFeatures.length}`);
  return allFeatures;
}

function classifyPCI(pci: number | null): string {
  if (pci == null) return "Unknown";
  if (pci > 70) return "Good";
  if (pci >= 40) return "Fair";
  return "Poor";
}

async function insertData(records: Record<string, any>[]) {
  console.log("\n=== Inserting Pavement Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS quality`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quality.pavement_condition (
        id SERIAL PRIMARY KEY,
        street_name TEXT,
        pci INT,
        surface_type TEXT,
        functional_class TEXT,
        inspection_year INT,
        length_ft NUMERIC,
        sq_yards NUMERIC,
        num_lanes INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(street_name, pci, inspection_year)
      )
    `);

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_pavement_pci
        ON quality.pavement_condition(pci)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_pavement_year
        ON quality.pavement_condition(inspection_year)
    `);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const r of records) {
      const streetName = r.Streetname || r.streetname || r.STREETNAME || null;
      const pci = r.PCI != null ? Math.round(Number(r.PCI)) : null;
      const surfaceType = r.SurfaceType || r.surfacetype || null;
      const funcClass = r.FunctionalClass || r.functionalclass || null;
      const inspYear = r.InspectionYear || r.inspectionyear || null;
      const length = r.Length || r.length || null;
      const sqYards = r.SqYards || r.sqyards || null;
      const numLanes = r.NumberOfLanes || r.numberoflanes || null;

      try {
        const result = await sql`
          INSERT INTO quality.pavement_condition
            (street_name, pci, surface_type, functional_class, inspection_year, length_ft, sq_yards, num_lanes)
          VALUES (
            ${streetName}, ${pci}, ${surfaceType}, ${funcClass},
            ${inspYear}, ${length}, ${sqYards}, ${numLanes}
          )
          ON CONFLICT (street_name, pci, inspection_year) DO UPDATE SET
            surface_type = EXCLUDED.surface_type,
            functional_class = EXCLUDED.functional_class,
            length_ft = EXCLUDED.length_ft,
            sq_yards = EXCLUDED.sq_yards,
            num_lanes = EXCLUDED.num_lanes
          RETURNING (xmax = 0) AS is_insert
        `;
        if (result[0]?.is_insert) inserted++;
        else updated++;
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.log(`  Error inserting "${streetName}": ${err.message}`);
        }
      }
    }

    if (errors > 5) {
      console.log(`  ... and ${errors - 5} more errors`);
    }
    console.log(`  Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);

    // Summary statistics
    const stats = await sql`
      SELECT
        count(*)::int as total,
        round(avg(pci)::numeric, 1) as avg_pci,
        min(pci) as min_pci,
        max(pci) as max_pci,
        count(*) FILTER (WHERE pci > 70)::int as good,
        count(*) FILTER (WHERE pci BETWEEN 40 AND 70)::int as fair,
        count(*) FILTER (WHERE pci < 40)::int as poor,
        count(*) FILTER (WHERE pci IS NULL)::int as unknown
      FROM quality.pavement_condition
    `;

    const s = stats[0];
    console.log("\n  === Summary Statistics ===");
    console.log(`    Total segments: ${s.total}`);
    console.log(`    Average PCI: ${s.avg_pci}`);
    console.log(`    PCI range: ${s.min_pci} - ${s.max_pci}`);
    console.log(`    Good (>70):   ${s.good} (${((s.good / s.total) * 100).toFixed(1)}%)`);
    console.log(`    Fair (40-70): ${s.fair} (${((s.fair / s.total) * 100).toFixed(1)}%)`);
    console.log(`    Poor (<40):   ${s.poor} (${((s.poor / s.total) * 100).toFixed(1)}%)`);
    if (s.unknown > 0) {
      console.log(`    Unknown PCI:  ${s.unknown}`);
    }

    // Year breakdown
    const yearStats = await sql`
      SELECT inspection_year, count(*)::int as cnt, round(avg(pci)::numeric, 1) as avg_pci
      FROM quality.pavement_condition
      WHERE inspection_year IS NOT NULL
      GROUP BY inspection_year
      ORDER BY inspection_year DESC
      LIMIT 10
    `;
    console.log("\n  By Inspection Year (most recent 10):");
    for (const row of yearStats) {
      console.log(`    ${row.inspection_year}: ${row.cnt} segments, avg PCI=${row.avg_pci}`);
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Dashboard — PBOT Pavement Condition Fetch");
  console.log("===================================================");

  const records = await fetchAllPavement();

  if (records.length === 0) {
    console.log("WARNING: No pavement data fetched.");
    process.exit(0);
  }

  // Quick pre-insert summary
  const pciValues = records.map((r) => r.PCI).filter((v) => v != null);
  const avgPci = pciValues.reduce((a: number, b: number) => a + b, 0) / pciValues.length;
  console.log(`\n  Pre-insert summary:`);
  console.log(`    Records with PCI: ${pciValues.length}/${records.length}`);
  console.log(`    Raw avg PCI: ${avgPci.toFixed(1)}`);
  console.log(
    `    Good: ${pciValues.filter((v: number) => v > 70).length}, ` +
      `Fair: ${pciValues.filter((v: number) => v >= 40 && v <= 70).length}, ` +
      `Poor: ${pciValues.filter((v: number) => v < 40).length}`
  );

  await insertData(records);

  console.log("\n===================================================");
  console.log("PBOT pavement condition fetch complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
