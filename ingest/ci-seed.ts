#!/usr/bin/env npx tsx
/**
 * ci-seed.ts
 *
 * Prepares a throwaway database for the CI smoke suite.
 *
 * The suite used to run with no DATABASE_URL at all, so every dashboard route
 * answered "unavailable" and the only assertions that could survive were ones
 * about static text. A renamed table, a route throwing on every request, or a
 * detail endpoint returning a 500 all passed.
 *
 * This is deliberately NOT a copy of the production schema. It applies the
 * committed migrations, then creates the minimum set of ingest-owned tables
 * the smoke tests assert against and puts a few rows in them. Routes that read
 * a table this script does not create still work: they catch the error and
 * report the topic as unavailable, which is the behaviour we want in that case
 * anyway.
 *
 * Fixture values are obviously synthetic (round numbers, a single Portland
 * neighbourhood) so that a fixture leaking into a real database would be
 * recognisable on sight.
 *
 * Usage: DATABASE_URL=postgresql://... npx tsx ingest/ci-seed.ts
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const sql = postgres(requireDatabaseUrl(), { max: 1, onnotice: () => {} });

const MIGRATIONS_DIR = join(import.meta.dirname ?? ".", "..", "drizzle");

/** Schemas the app's queries are namespaced under. */
const SCHEMAS = [
  "safety",
  "housing",
  "homelessness",
  "education",
  "economy",
  "environment",
  "transportation",
  "quality",
  "accountability",
  "business",
  "downtown",
  "migration",
  "fiscal",
  "content",
  "performance",
  "reference",
  "real_estate",
];

/**
 * Minimum tables the smoke assertions touch, plus the cache table every route
 * reads through. Kept small on purpose: this file should not drift into being
 * a second, unmaintained copy of the schema.
 */
const FIXTURE_DDL = `
-- Only tables the migrations do NOT create. dashboard_cache,
-- climate_workplan_actions and climate_emissions_trajectory come from
-- drizzle/0000; redeclaring them here would be a second definition free to
-- drift from the real one.
CREATE TABLE IF NOT EXISTS housing.permits (
  permit_id         BIGSERIAL PRIMARY KEY,
  permit_number     TEXT NOT NULL,
  permit_type       TEXT NOT NULL,
  permit_type_mapped TEXT,
  project_address   TEXT,
  neighborhood      TEXT,
  valuation         NUMERIC(14, 2),
  application_date  DATE,
  issued_date       DATE,
  final_date        DATE,
  status            TEXT NOT NULL,
  processing_days   INTEGER,
  arcgis_object_id  BIGINT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_permits_arcgis_oid
  ON housing.permits (arcgis_object_id) WHERE arcgis_object_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS safety.ppb_offenses (
  id               BIGSERIAL PRIMARY KEY,
  case_number      TEXT NOT NULL,
  occur_date       DATE,
  occur_time       TEXT,
  offense_category TEXT,
  offense_type     TEXT,
  neighborhood     TEXT,
  crime_against    TEXT,
  offense_count    INTEGER,
  CONSTRAINT ppb_offenses_case_offense_uq UNIQUE (case_number, offense_type)
);

CREATE TABLE IF NOT EXISTS homelessness.pit_counts (
  year                 INTEGER PRIMARY KEY,
  total_homeless       INTEGER,
  sheltered            INTEGER,
  unsheltered          INTEGER,
  chronically_homeless INTEGER,
  veterans             INTEGER,
  families             INTEGER,
  unaccompanied_youth  INTEGER,
  source               TEXT
);
`;

/**
 * Fixture rows. Enough for a route to return a real payload rather than
 * "unavailable", and shaped so the derived figures the routes compute are
 * exercised rather than short-circuited.
 */
const FIXTURE_ROWS = `
INSERT INTO housing.permits
  (permit_number, permit_type, project_address, neighborhood, valuation,
   application_date, issued_date, status, processing_days, arcgis_object_id)
SELECT
  'CI-' || n, 'Building', n || ' SE Test St', 'Buckman', 100000,
  (DATE '2023-03-01' + (n || ' days')::interval)::date,
  (DATE '2023-04-01' + (n || ' days')::interval)::date,
  'Issued', 31, n
FROM generate_series(1, 60) AS n
WHERE NOT EXISTS (SELECT 1 FROM housing.permits WHERE permit_number = 'CI-1');

INSERT INTO safety.ppb_offenses
  (case_number, occur_date, offense_category, offense_type, neighborhood, crime_against, offense_count)
SELECT
  'CI-' || n,
  (DATE '2025-01-01' + (n || ' days')::interval)::date,
  'Burglary', 'Burglary', 'Downtown', 'Property', 1
FROM generate_series(1, 40) AS n
WHERE NOT EXISTS (SELECT 1 FROM safety.ppb_offenses WHERE case_number = 'CI-1');

INSERT INTO homelessness.pit_counts (year, total_homeless, sheltered, unsheltered, source)
SELECT * FROM (VALUES
  (2024, 6000, 3000, 3000, 'CI fixture'),
  (2025, 6100, 3100, 3000, 'CI fixture')
) AS v(year, total_homeless, sheltered, unsheltered, source)
WHERE NOT EXISTS (SELECT 1 FROM homelessness.pit_counts WHERE year = 2024);

INSERT INTO public.climate_workplan_actions
  (action_id, title, status, category, sector, lead_bureaus)
SELECT * FROM (VALUES
  ('CI-1', 'CI fixture action one',   'achieved', 'decarbonization', 'buildings',  ARRAY['BPS']),
  ('CI-2', 'CI fixture action two',   'ongoing',  'decarbonization', 'transport',  ARRAY['PBOT']),
  ('CI-3', 'CI fixture action three', 'delayed',  'adaptation',      'resilience', ARRAY['BES'])
) AS v(action_id, title, status, category, sector, lead_bureaus)
WHERE NOT EXISTS (SELECT 1 FROM public.climate_workplan_actions WHERE action_id = 'CI-1');

INSERT INTO public.climate_emissions_trajectory (year, total_mtco2e, is_target)
SELECT * FROM (VALUES
  (1990, 10.40, false),
  (2023,  7.70, false),
  (2030,  5.20, true)
) AS v(year, total_mtco2e, is_target)
WHERE NOT EXISTS (SELECT 1 FROM public.climate_emissions_trajectory WHERE year = 1990);
`;

/** Split a SQL file into statements, ignoring semicolons inside $$ bodies. */
function splitStatements(text: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollar = false;

  for (const line of text.split("\n")) {
    if (line.includes("$$")) {
      // An odd number of $$ on a line flips whether we are inside a body.
      const count = (line.match(/\$\$/g) ?? []).length;
      if (count % 2 === 1) inDollar = !inDollar;
    }
    current += line + "\n";
    if (!inDollar && line.trimEnd().endsWith(";")) {
      statements.push(current);
      current = "";
    }
  }
  if (current.trim()) statements.push(current);

  // Strip leading comment lines and blank lines from each statement, then drop
  // anything left that is only comments. Filtering out statements that merely
  // BEGIN with a comment would discard most of these files, since almost every
  // migration explains itself before it acts.
  return statements
    .map((statement) =>
      statement
        .split("\n")
        .filter((line, index, lines) => {
          const isLeading = lines
            .slice(0, index)
            .every((l) => l.trim() === "" || l.trim().startsWith("--"));
          return !(isLeading && (line.trim() === "" || line.trim().startsWith("--")));
        })
        .join("\n"),
    )
    .filter((statement) => statement.trim().length > 0);
}

async function applyMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const text = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    let applied = 0;
    let skipped = 0;

    // Statement at a time, tolerating "already exists" and the ordering
    // problems in the older migrations (0000 has bare CREATE TABLEs, 0002
    // alters a table no migration creates). A migration failing here must not
    // stop the rest: the goal is a database good enough to exercise the
    // routes, not a faithful production replica.
    for (const statement of splitStatements(text)) {
      try {
        await sql.unsafe(statement);
        applied++;
      } catch (error) {
        skipped++;
        // Print the reason. A silent skip count hides the difference between
        // "already exists" and a migration that is genuinely broken.
        const message = error instanceof Error ? error.message : String(error);
        if (!/already exists/i.test(message)) {
          console.log(`    skipped: ${message.split("\n")[0]}`);
        }
      }
    }
    console.log(`  ${file}: ${applied} applied, ${skipped} skipped`);
  }
}

async function main(): Promise<void> {
  console.log("[ci-seed] Creating schemas...");
  for (const schema of SCHEMAS) {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  }

  console.log("[ci-seed] Applying migrations...");
  await applyMigrations();

  console.log("[ci-seed] Creating fixture tables...");
  for (const statement of splitStatements(FIXTURE_DDL)) {
    await sql.unsafe(statement);
  }

  console.log("[ci-seed] Inserting fixture rows...");
  for (const statement of splitStatements(FIXTURE_ROWS)) {
    await sql.unsafe(statement);
  }

  const [permits] = await sql`SELECT COUNT(*)::int AS n FROM housing.permits`;
  const [offenses] = await sql`SELECT COUNT(*)::int AS n FROM safety.ppb_offenses`;
  console.log(
    `[ci-seed] Done. ${permits.n} permits, ${offenses.n} offenses.`,
  );
}

main()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error("[ci-seed] FAILED:", error);
    await sql.end();
    process.exit(1);
  });
