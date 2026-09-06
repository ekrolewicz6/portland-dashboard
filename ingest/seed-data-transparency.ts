/**
 * seed-data-transparency.ts
 *
 * Seeds the data transparency layer for the homelessness dashboard:
 *   - homelessness.data_sources (methodology metadata for each source)
 *   - homelessness.data_disputes (structured records of contested public claims)
 *
 * This is the foundation for surfacing the city-county data tension
 * in a non-partisan, methodology-aware way.
 *
 * Usage: npx tsx ingest/seed-data-transparency.ts
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

// ── 1. Data Sources (methodology cards) ──────────────────────────────────

const DATA_SOURCES = [
  {
    source_key: "pit_count",
    display_name: "Point-in-Time Count",
    agency: "PSU HRAC (for Multnomah County)",
    methodology:
      "A single-night census conducted by trained volunteers in late January, mandated by HUD. Counts people sleeping in shelters and visible unsheltered locations on one specific night.",
    scope: "Tri-county region (Multnomah, Washington, Clackamas) on one night each year.",
    what_it_misses:
      "People doubled-up with friends or family, couch-surfing, sleeping in cars hidden from view, and anyone who actively avoids enumerators. Considered a significant undercount.",
    update_frequency: "annual",
    last_updated: "2025-01-22",
    next_expected: "2027-01-31",
    url: "https://www.pdx.edu/homelessness/2025-portland-tri-county-point-time-count",
    used_by: ["federal", "county", "city"],
  },
  {
    source_key: "hmis_bnl",
    display_name: "HMIS By-Name List",
    agency: "Multnomah County HSD",
    methodology:
      "A continuously-updated, deduplicated roster of every individual known to the homeless services system. Built from intake data across all funded providers (HMIS = Homeless Management Information System).",
    scope: "Anyone who has been assessed by a Multnomah County funded homeless service provider.",
    what_it_misses:
      "People who never access services, who refuse intake, or who only use non-HMIS providers (e.g. some faith-based shelters). Can include people who have since become housed if not promptly updated.",
    update_frequency: "monthly",
    last_updated: "2026-03-15",
    next_expected: "2026-04-15",
    url: "https://hsd.multco.us/current-initiatives/built-for-zero/",
    used_by: ["county"],
  },
  {
    source_key: "city_shelter_census",
    display_name: "City Shelter Census",
    agency: "City of Portland",
    methodology:
      "Nightly bed counts from shelters operated by or contracted with the City of Portland. Tracks beds available, beds filled, and turn-aways at city-funded sites.",
    scope: "City-operated overnight shelters only. Does not include county 24-hour shelters or non-city-funded sites.",
    what_it_misses:
      "Anyone not in a city shelter on a given night, including people in county shelters, on the street, or in non-city programs. Cannot estimate total unsheltered population.",
    update_frequency: "nightly",
    last_updated: "2026-04-06",
    next_expected: "2026-04-07",
    url: "https://www.portland.gov/shelter-services/shelter-services-data-dashboards",
    used_by: ["city"],
  },
  {
    source_key: "hrac_prevalence",
    display_name: "HRAC Annual Prevalence Estimate",
    agency: "PSU Homelessness Research & Action Collaborative",
    methodology:
      "Statistical estimate of how many unique people experience homelessness over a full year, based on HMIS turnover, PIT counts, and survey data. Differs from PIT because annual prevalence is typically 3-4x a single-night count.",
    scope: "Annual unique-person estimate for the tri-county region.",
    what_it_misses:
      "Still relies on HMIS as a base. Last full study was based on 2017 data; newer estimates extrapolate. Doesn't fully capture rural or hidden homelessness.",
    update_frequency: "irregular",
    last_updated: "2019-06-01",
    next_expected: "2026-12-31",
    url: "https://www.pdx.edu/homelessness/",
    used_by: ["county", "researchers"],
  },
  {
    source_key: "shs_outcomes",
    display_name: "SHS Outcomes Reports",
    agency: "Metro / Multnomah County HSD",
    methodology:
      "Quarterly and annual reports tracking placements, retention, spending, and demographics for the Supportive Housing Services tax measure. Drawn from HMIS but focused on system throughput, not population size.",
    scope: "Households served by SHS-funded programs in Multnomah County.",
    what_it_misses:
      "Doesn't measure total homeless population. Counts placements, not whether people stayed housed long-term beyond the reporting window.",
    update_frequency: "quarterly",
    last_updated: "2026-02-15",
    next_expected: "2026-05-15",
    url: "https://hsd.multco.us/shs/",
    used_by: ["metro", "county"],
  },
];

// ── 2. Data Disputes ─────────────────────────────────────────────────────

const DATA_DISPUTES = [
  {
    slug: "wilson-county-2026",
    title: "Mayor Wilson and Multnomah County dispute homelessness counts",
    date_surfaced: "2026-04-01",
    status: "active",
    claim_a_source: "Mayor Keith Wilson / City of Portland",
    claim_a_summary:
      "City overnight shelters opened under Wilson show declining unsheltered counts. Wilson's office argues the county's numbers are inflated by possible double-counting, fake names, and people accessing services who are not actually homeless.",
    claim_a_data: {
      metric: "unsheltered_trend",
      direction: "declining",
      basis: "City shelter occupancy data and TASS counts",
      time_frame: "Jan 2025 - present",
    },
    claim_b_source: "Multnomah County HSD",
    claim_b_summary:
      "County HMIS and by-name list data show the unsheltered population has grown from approximately 6,000 to 8,800 since January 2025, a 47% increase. The county released a memo addressing the city's claims point by point.",
    claim_b_data: {
      metric: "unsheltered_count",
      jan_2025: 6000,
      current: 8800,
      change_pct: 47,
      basis: "HMIS by-name list and PIT count",
    },
    expert_assessment:
      "Marisa Zapata, director of PSU's Homelessness Research & Action Collaborative, called the city's allegations of double-counting \"completely unfounded.\" The county's methodology is consistent with HUD-required HMIS practices.",
    expert_source: "PSU HRAC",
    methodology_difference:
      "These two numbers measure different things and can both be accurate at the same time. The city counts how many people are in city-operated shelter beds on a given night. The county counts every person known to the entire regional homeless services system — shelters, outreach, by-name list — across all providers. Because most people experiencing homelessness never enter a city shelter, the county's number will always be much larger. It is entirely possible for city shelters to be filling more beds while the total number of people experiencing homelessness countywide continues to grow.",
    news_url:
      "https://www.opb.org/article/2026/04/01/behind-portlands-homelessness-data-familial-political-fight-emerges/",
  },
];

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const sql = postgres(DB_URL, { onnotice: () => {} });

  try {
    console.log("=============================================");
    console.log("SEEDING DATA TRANSPARENCY LAYER");
    console.log("=============================================\n");

    // Ensure schema exists
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS homelessness`);

    // ── data_sources ──
    console.log("1. Creating homelessness.data_sources...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.data_sources (
        id SERIAL PRIMARY KEY,
        source_key TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        agency TEXT NOT NULL,
        methodology TEXT NOT NULL,
        scope TEXT NOT NULL,
        what_it_misses TEXT,
        update_frequency TEXT,
        last_updated DATE,
        next_expected DATE,
        url TEXT,
        used_by TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    let sourcesInserted = 0;
    for (const row of DATA_SOURCES) {
      await sql`
        INSERT INTO homelessness.data_sources
          (source_key, display_name, agency, methodology, scope,
           what_it_misses, update_frequency, last_updated, next_expected, url, used_by)
        VALUES (
          ${row.source_key}, ${row.display_name}, ${row.agency},
          ${row.methodology}, ${row.scope}, ${row.what_it_misses},
          ${row.update_frequency}, ${row.last_updated}::date,
          ${row.next_expected}::date, ${row.url}, ${row.used_by}
        )
        ON CONFLICT (source_key) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          agency = EXCLUDED.agency,
          methodology = EXCLUDED.methodology,
          scope = EXCLUDED.scope,
          what_it_misses = EXCLUDED.what_it_misses,
          update_frequency = EXCLUDED.update_frequency,
          last_updated = EXCLUDED.last_updated,
          next_expected = EXCLUDED.next_expected,
          url = EXCLUDED.url,
          used_by = EXCLUDED.used_by
      `;
      sourcesInserted++;
    }
    console.log(`   Inserted ${sourcesInserted} data source records.`);

    // ── data_disputes ──
    console.log("\n2. Creating homelessness.data_disputes...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS homelessness.data_disputes (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        date_surfaced DATE NOT NULL,
        status TEXT DEFAULT 'active',
        claim_a_source TEXT NOT NULL,
        claim_a_summary TEXT NOT NULL,
        claim_a_data JSONB,
        claim_b_source TEXT NOT NULL,
        claim_b_summary TEXT NOT NULL,
        claim_b_data JSONB,
        expert_assessment TEXT,
        expert_source TEXT,
        methodology_difference TEXT NOT NULL,
        news_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    let disputesInserted = 0;
    for (const row of DATA_DISPUTES) {
      await sql`
        INSERT INTO homelessness.data_disputes
          (slug, title, date_surfaced, status,
           claim_a_source, claim_a_summary, claim_a_data,
           claim_b_source, claim_b_summary, claim_b_data,
           expert_assessment, expert_source, methodology_difference, news_url)
        VALUES (
          ${row.slug}, ${row.title}, ${row.date_surfaced}::date, ${row.status},
          ${row.claim_a_source}, ${row.claim_a_summary}, ${sql.json(row.claim_a_data)},
          ${row.claim_b_source}, ${row.claim_b_summary}, ${sql.json(row.claim_b_data)},
          ${row.expert_assessment}, ${row.expert_source},
          ${row.methodology_difference}, ${row.news_url}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          status = EXCLUDED.status,
          claim_a_source = EXCLUDED.claim_a_source,
          claim_a_summary = EXCLUDED.claim_a_summary,
          claim_a_data = EXCLUDED.claim_a_data,
          claim_b_source = EXCLUDED.claim_b_source,
          claim_b_summary = EXCLUDED.claim_b_summary,
          claim_b_data = EXCLUDED.claim_b_data,
          expert_assessment = EXCLUDED.expert_assessment,
          expert_source = EXCLUDED.expert_source,
          methodology_difference = EXCLUDED.methodology_difference,
          news_url = EXCLUDED.news_url
      `;
      disputesInserted++;
    }
    console.log(`   Inserted ${disputesInserted} data dispute records.`);

    // ── Verification ──
    console.log("\n=============================================");
    console.log("VERIFICATION");
    console.log("=============================================\n");

    const sourceRows = await sql`
      SELECT source_key, display_name, agency, update_frequency, last_updated
      FROM homelessness.data_sources ORDER BY display_name
    `;
    console.log(`data_sources (${sourceRows.length} rows):`);
    for (const r of sourceRows) {
      console.log(`  ${r.source_key}: ${r.display_name} (${r.agency}) — updated ${r.last_updated}`);
    }

    const disputeRows = await sql`
      SELECT slug, title, date_surfaced, status FROM homelessness.data_disputes ORDER BY date_surfaced DESC
    `;
    console.log(`\ndata_disputes (${disputeRows.length} rows):`);
    for (const r of disputeRows) {
      console.log(`  ${r.slug}: ${r.title} [${r.status}] — ${r.date_surfaced}`);
    }

    console.log("\n=============================================");
    console.log("SEED COMPLETE");
    console.log("=============================================");

    await sql.end();
  } catch (err: any) {
    console.error("Database error:", err.message);
    await sql.end();
    throw err;
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
