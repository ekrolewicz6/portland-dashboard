/**
 * Climate Accountability Platform — Schema Migration
 * Creates all 7 new climate tables in the target database.
 * Run via: DATABASE_URL=... npx tsx src/db/migrate-climate.ts
 */

import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const isPooled = databaseUrl.includes("pooler.supabase.com");

function parseConnectionOptions(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer" as const,
    };
  } catch {
    return undefined;
  }
}

const explicitOpts = isPooled ? parseConnectionOptions(databaseUrl) : undefined;
const sql = explicitOpts
  ? postgres({ ...explicitOpts, prepare: false })
  : postgres(databaseUrl);

async function migrate() {
  console.log("🗄️  Creating climate accountability platform tables...\n");

  await sql`
    CREATE TABLE IF NOT EXISTS public.climate_workplan_actions (
      id serial PRIMARY KEY,
      action_id text NOT NULL UNIQUE,
      title text NOT NULL,
      sector text NOT NULL,
      category text NOT NULL,
      lead_bureaus text[] NOT NULL,
      is_declaration_priority boolean NOT NULL DEFAULT false,
      fiscal_year text,
      resource_gap text,
      is_pcef_funded boolean NOT NULL DEFAULT false,
      is_multi_bureau boolean NOT NULL DEFAULT false,
      status text NOT NULL DEFAULT 'ongoing',
      description text,
      external_partners text,
      cobenefits text,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `;
  console.log("  ✓ climate_workplan_actions");

  await sql`
    CREATE TABLE IF NOT EXISTS public.climate_action_status_history (
      id serial PRIMARY KEY,
      action_id text NOT NULL,
      status text NOT NULL,
      status_date date NOT NULL,
      narrative text,
      source text
    )
  `;
  console.log("  ✓ climate_action_status_history");

  await sql`
    CREATE TABLE IF NOT EXISTS public.climate_bureau_scorecard (
      id serial PRIMARY KEY,
      bureau_code text NOT NULL UNIQUE,
      bureau_name text NOT NULL,
      total_actions integer NOT NULL DEFAULT 0,
      achieved_actions integer NOT NULL DEFAULT 0,
      ongoing_actions integer NOT NULL DEFAULT 0,
      delayed_actions integer NOT NULL DEFAULT 0,
      cross_bureau_actions integer NOT NULL DEFAULT 0,
      pcef_funding_received numeric,
      updated_at timestamp DEFAULT now()
    )
  `;
  console.log("  ✓ climate_bureau_scorecard");

  await sql`
    CREATE TABLE IF NOT EXISTS public.climate_finance_sources (
      id serial PRIMARY KEY,
      fiscal_year text NOT NULL,
      source text NOT NULL,
      allocation_amount numeric,
      action_count integer
    )
  `;
  console.log("  ✓ climate_finance_sources");

  await sql`
    CREATE TABLE IF NOT EXISTS public.pcef_allocations (
      id serial PRIMARY KEY,
      fiscal_year text NOT NULL,
      recipient text NOT NULL,
      recipient_type text NOT NULL,
      amount numeric NOT NULL,
      program_area text
    )
  `;
  console.log("  ✓ pcef_allocations");

  await sql`
    CREATE TABLE IF NOT EXISTS public.pcef_interest_diversions (
      id serial PRIMARY KEY,
      fiscal_year text NOT NULL UNIQUE,
      amount_diverted numeric NOT NULL,
      destination text,
      notes text
    )
  `;
  console.log("  ✓ pcef_interest_diversions");

  await sql`
    CREATE TABLE IF NOT EXISTS public.climate_emissions_trajectory (
      id serial PRIMARY KEY,
      year integer NOT NULL,
      is_target boolean NOT NULL DEFAULT false,
      target_type text,
      total_mtco2e numeric,
      electricity_mtco2e numeric,
      buildings_mtco2e numeric,
      transportation_mtco2e numeric,
      waste_mtco2e numeric,
      industry_mtco2e numeric,
      other_mtco2e numeric,
      population_thousands numeric
    )
  `;
  console.log("  ✓ climate_emissions_trajectory");

  console.log("\n✅ All climate tables created successfully.");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
