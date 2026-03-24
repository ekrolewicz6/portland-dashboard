/**
 * fetch-ballot-measures.ts
 *
 * Seeds Portland-area ballot measure election results and current elected
 * officials into PostgreSQL. Data sourced from Multnomah County election
 * records and portland.gov (all public record).
 *
 * Ballot measures tracked:
 *   - 26-210 (SHS): Supportive Housing Services income tax
 *   - 26-201 (PCEF): Portland Clean Energy Fund
 *   - 26-146 (Arts Tax): $35/year arts education tax
 *   - 26-214 (Preschool for All)
 *
 * Usage: npx tsx scripts/fetch-ballot-measures.ts
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

// ── Known published ballot measure results ──────────────────────────────

interface BallotMeasureRow {
  measure_number: string;
  measure_title: string;
  election_date: string; // YYYY-MM-DD
  jurisdiction: string;
  yes_votes: number | null;
  no_votes: number | null;
  yes_pct: number;
  passed: boolean;
  annual_revenue_estimate: number | null;
  description: string;
}

const KNOWN_MEASURES: BallotMeasureRow[] = [
  {
    measure_number: "26-210",
    measure_title: "Supportive Housing Services (SHS)",
    election_date: "2020-05-19",
    jurisdiction: "Multnomah County",
    yes_votes: null,
    no_votes: null,
    yes_pct: 58.6,
    passed: true,
    annual_revenue_estimate: 250000000,
    description:
      "Personal income tax (1% on income over $125K/$200K joint) and business income tax (1% on profits over $5M) to fund supportive housing services for people experiencing or at risk of homelessness.",
  },
  {
    measure_number: "26-201",
    measure_title: "Portland Clean Energy Fund (PCEF)",
    election_date: "2018-11-06",
    jurisdiction: "City of Portland",
    yes_votes: null,
    no_votes: null,
    yes_pct: 64.7,
    passed: true,
    annual_revenue_estimate: 80000000,
    description:
      "1% surcharge on gross revenue for Portland retailers with $1B+ national revenue and $500K+ Portland revenue. Funds clean energy, green jobs, and climate justice programs.",
  },
  {
    measure_number: "26-146",
    measure_title: "Arts Education and Access Income Tax (Arts Tax)",
    election_date: "2012-11-06",
    jurisdiction: "City of Portland",
    yes_votes: null,
    no_votes: null,
    yes_pct: 62.0,
    passed: true,
    annual_revenue_estimate: 12000000,
    description:
      "$35/year flat tax on Portland residents with income above the federal poverty level. Funds K-5 arts and music teachers and arts organizations.",
  },
  {
    measure_number: "26-214",
    measure_title: "Preschool for All (PFA)",
    election_date: "2020-11-03",
    jurisdiction: "Multnomah County",
    yes_votes: null,
    no_votes: null,
    yes_pct: 64.0,
    passed: true,
    annual_revenue_estimate: 200000000,
    description:
      "Personal income tax (1.5% on taxable income over $125K/$200K joint, 3% over $250K/$400K joint) to fund free universal preschool for 3- and 4-year-olds in Multnomah County.",
  },
];

// ── Current Portland City Council (public record from portland.gov) ─────

interface ElectedOfficialRow {
  name: string;
  title: string;
  district: number | null;
  term_start: string;
  term_end: string;
  email: string | null;
  party: string | null;
}

const ELECTED_OFFICIALS: ElectedOfficialRow[] = [
  // Mayor
  {
    name: "Keith Wilson",
    title: "Mayor",
    district: null,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  // District 1
  {
    name: "Candace Avalos",
    title: "City Councilor",
    district: 1,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  {
    name: "Jamie Dunphy",
    title: "City Councilor",
    district: 1,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  {
    name: "Loretta Smith",
    title: "City Councilor",
    district: 1,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  // District 2
  {
    name: "Dan Ryan",
    title: "City Councilor",
    district: 2,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  {
    name: "Elana Pirtle-Guiney",
    title: "City Councilor (Council President)",
    district: 2,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  {
    name: "Sameer Kanal",
    title: "City Councilor",
    district: 2,
    term_start: "2025-01-01",
    term_end: "2028-12-31",
    email: null,
    party: null,
  },
  // District 3
  {
    name: "Steve Novick",
    title: "City Councilor",
    district: 3,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
  {
    name: "Angelita Morillo",
    title: "City Councilor",
    district: 3,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
  {
    name: "Tiffany Koyama Lane",
    title: "City Councilor (Vice President)",
    district: 3,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
  // District 4
  {
    name: "Eric Zimmerman",
    title: "City Councilor",
    district: 4,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
  {
    name: "Mitch Green",
    title: "City Councilor",
    district: 4,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
  {
    name: "Olivia Clark",
    title: "City Councilor",
    district: 4,
    term_start: "2025-01-01",
    term_end: "2026-12-31",
    email: null,
    party: null,
  },
];

// ── Insert into PostgreSQL ──────────────────────────────────────────────

async function insertData() {
  console.log("\n=== Inserting Accountability Data into PostgreSQL ===");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    // Create schema
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS accountability`);

    // Create ballot measures table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS accountability.ballot_measures (
        id SERIAL PRIMARY KEY,
        measure_number TEXT NOT NULL,
        measure_title TEXT NOT NULL,
        election_date DATE NOT NULL,
        jurisdiction TEXT DEFAULT 'Multnomah County',
        yes_votes INT,
        no_votes INT,
        yes_pct NUMERIC(5,2),
        passed BOOLEAN NOT NULL,
        annual_revenue_estimate NUMERIC(14,2),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(measure_number, election_date)
      )
    `);

    // Create elected officials table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS accountability.elected_officials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        district INT,
        term_start DATE,
        term_end DATE,
        email TEXT,
        party TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, title, term_start)
      )
    `);

    // Create indexes
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_ballot_measure_number
        ON accountability.ballot_measures(measure_number)
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_officials_district
        ON accountability.elected_officials(district)
    `);

    // Insert ballot measures
    let measuresInserted = 0;
    for (const m of KNOWN_MEASURES) {
      try {
        await sql`
          INSERT INTO accountability.ballot_measures
            (measure_number, measure_title, election_date, jurisdiction,
             yes_votes, no_votes, yes_pct, passed, annual_revenue_estimate, description)
          VALUES (
            ${m.measure_number}, ${m.measure_title}, ${m.election_date},
            ${m.jurisdiction}, ${m.yes_votes}, ${m.no_votes}, ${m.yes_pct},
            ${m.passed}, ${m.annual_revenue_estimate}, ${m.description}
          )
          ON CONFLICT (measure_number, election_date) DO UPDATE SET
            measure_title = EXCLUDED.measure_title,
            jurisdiction = EXCLUDED.jurisdiction,
            yes_votes = EXCLUDED.yes_votes,
            no_votes = EXCLUDED.no_votes,
            yes_pct = EXCLUDED.yes_pct,
            passed = EXCLUDED.passed,
            annual_revenue_estimate = EXCLUDED.annual_revenue_estimate,
            description = EXCLUDED.description
        `;
        measuresInserted++;
      } catch (err: any) {
        console.log(
          `  Error inserting measure ${m.measure_number}: ${err.message}`
        );
      }
    }
    console.log(`  Inserted ${measuresInserted} ballot measures`);

    // Insert elected officials
    let officialsInserted = 0;
    for (const o of ELECTED_OFFICIALS) {
      try {
        await sql`
          INSERT INTO accountability.elected_officials
            (name, title, district, term_start, term_end, email, party)
          VALUES (
            ${o.name}, ${o.title}, ${o.district}, ${o.term_start},
            ${o.term_end}, ${o.email}, ${o.party}
          )
          ON CONFLICT (name, title, term_start) DO UPDATE SET
            district = EXCLUDED.district,
            term_end = EXCLUDED.term_end,
            email = EXCLUDED.email,
            party = EXCLUDED.party
        `;
        officialsInserted++;
      } catch (err: any) {
        console.log(`  Error inserting official ${o.name}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${officialsInserted} elected officials`);

    // Update dashboard cache
    const cacheData = {
      source: "Multnomah County election records / portland.gov",
      ballot_measures: KNOWN_MEASURES.map((m) => ({
        measure: m.measure_number,
        title: m.measure_title,
        yes_pct: m.yes_pct,
        passed: m.passed,
        annual_revenue: m.annual_revenue_estimate,
      })),
      elected_officials_count: ELECTED_OFFICIALS.length,
      council_districts: [1, 2, 3, 4],
      fetched_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('ballot_measures_officials', ${sql.json(cacheData)}, now())
      ON CONFLICT (question) DO UPDATE SET
        data = ${sql.json(cacheData)},
        updated_at = now()
    `;
    console.log("  Updated dashboard_cache with ballot_measures_officials entry");

    // Verify ballot measures
    const verifyMeasures = await sql`
      SELECT measure_number, measure_title, yes_pct, passed,
             annual_revenue_estimate
      FROM accountability.ballot_measures
      ORDER BY election_date
    `;
    console.log("\n  Ballot Measures:");
    for (const row of verifyMeasures) {
      const revenue = row.annual_revenue_estimate
        ? `$${(Number(row.annual_revenue_estimate) / 1000000).toFixed(0)}M/yr`
        : "N/A";
      console.log(
        `    ${row.measure_number} — ${row.measure_title}: ${row.yes_pct}% yes, ${row.passed ? "PASSED" : "FAILED"}, ${revenue}`
      );
    }

    // Verify officials
    const verifyOfficials = await sql`
      SELECT name, title, district, term_start, term_end
      FROM accountability.elected_officials
      ORDER BY district NULLS FIRST, name
    `;
    console.log("\n  Elected Officials:");
    for (const row of verifyOfficials) {
      const dist = row.district ? `D${row.district}` : "Citywide";
      const termEnd = String(row.term_end).slice(0, 4);
      console.log(`    ${dist} — ${row.name} (${row.title}, term ends ${termEnd})`);
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
  console.log("Portland Dashboard — Ballot Measures & Officials Fetch");
  console.log("======================================================");

  // Insert data
  await insertData();

  // Save JSON for reference
  const measuresPath = path.join(DATA_DIR, "ballot_measures.json");
  fs.writeFileSync(measuresPath, JSON.stringify(KNOWN_MEASURES, null, 2));
  console.log(`\nSaved ${measuresPath} (${KNOWN_MEASURES.length} measures)`);

  const officialsPath = path.join(DATA_DIR, "elected_officials.json");
  fs.writeFileSync(officialsPath, JSON.stringify(ELECTED_OFFICIALS, null, 2));
  console.log(`Saved ${officialsPath} (${ELECTED_OFFICIALS.length} officials)`);

  // Summary
  console.log("\n======================================================");
  console.log("Ballot measures & officials data fetch complete!");
  console.log(`  Ballot measures seeded: ${KNOWN_MEASURES.length}`);
  console.log(`  Elected officials seeded: ${ELECTED_OFFICIALS.length}`);
  console.log(
    `  Total estimated annual revenue from tracked measures: $${(
      KNOWN_MEASURES.reduce(
        (sum, m) => sum + (m.annual_revenue_estimate ?? 0),
        0
      ) / 1000000
    ).toFixed(0)}M`
  );
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
