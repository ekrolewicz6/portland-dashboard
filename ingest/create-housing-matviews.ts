/**
 * create-housing-matviews.ts
 *
 * Creates materialized views for the slow housing/journey and housing/bottleneck
 * routes. These routes do PERCENTILE_CONT aggregations over housing.permit_activities
 * (5.9M rows), which take 30-60 seconds per request — well past Vercel's function
 * timeout. The matviews precompute these once and the routes query them in <100ms.
 *
 * Refresh strategy:
 *   - Each matview has a unique index, enabling REFRESH MATERIALIZED VIEW CONCURRENTLY
 *   - Refresh on a schedule via ingest/refresh-housing-matviews.ts (Vercel cron)
 *
 * Usage: npx tsx ingest/create-housing-matviews.ts
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

async function main() {
  const sql = postgres(DB_URL, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    onnotice: () => {},
  });

  try {
    console.log("=============================================");
    console.log("CREATING HOUSING MATERIALIZED VIEWS");
    console.log("=============================================\n");

    // ── 1. mv_permit_phase_summary ──
    // Used by housing/journey: median day & median step duration per phase
    console.log("1. Creating housing.mv_permit_phase_summary...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_phase_summary CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_phase_summary AS
      WITH permit_phases AS (
        SELECT
          a.detail_id, a.activity_type, a.days_from_setup,
          a.days_from_setup - LAG(a.days_from_setup) OVER (
            PARTITION BY a.detail_id ORDER BY a.completed_date, a.days_from_setup
          ) as step_duration
        FROM housing.permit_activities a
        WHERE a.completed_date IS NOT NULL
          AND a.days_from_setup IS NOT NULL AND a.days_from_setup >= 0
      )
      SELECT
        activity_type,
        count(DISTINCT detail_id)::int as permits_affected,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_from_setup))::numeric)::int as median_day,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CASE WHEN step_duration > 0 THEN step_duration END))::numeric)::int as median_step_duration
      FROM permit_phases
      GROUP BY activity_type
      HAVING count(DISTINCT detail_id) >= 100;
      CREATE UNIQUE INDEX mv_permit_phase_summary_pk ON housing.mv_permit_phase_summary (activity_type);
    `);
    console.log("   ✓ created");

    // ── 2. mv_permit_journey_by_type ──
    // Used by housing/journey: median days for key milestones, by permit_type
    console.log("\n2. Creating housing.mv_permit_journey_by_type...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_journey_by_type CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_journey_by_type AS
      SELECT
        d.permit_type,
        count(DISTINCT a.detail_id)::int as permits,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Structural'))::numeric)::int as structural,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Life Safety'))::numeric)::int as life_safety,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Issuance'))::numeric)::int as issuance,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Building Inspections'))::numeric)::int as building_insp,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Final Permit'))::numeric)::int as final_permit
      FROM housing.permit_activities a
      JOIN housing.permit_details d ON d.detail_id = a.detail_id
      WHERE a.completed_date IS NOT NULL AND a.days_from_setup >= 0
      GROUP BY d.permit_type
      HAVING count(DISTINCT a.detail_id) >= 200;
      CREATE UNIQUE INDEX mv_permit_journey_by_type_pk ON housing.mv_permit_journey_by_type (permit_type);
    `);
    console.log("   ✓ created");

    // ── 3. mv_permit_journey_trend ──
    // Used by housing/journey: quarterly trend of key milestones
    console.log("\n3. Creating housing.mv_permit_journey_trend...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_journey_trend CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_journey_trend AS
      SELECT
        TO_CHAR(date_trunc('quarter', d.setup_date), 'YYYY-"Q"Q') as period,
        count(DISTINCT a.detail_id)::int as permits,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Structural'))::numeric)::int as structural_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Issuance'))::numeric)::int as issuance_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Building Inspections'))::numeric)::int as inspection_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Final Permit'))::numeric)::int as final_days
      FROM housing.permit_activities a
      JOIN housing.permit_details d ON d.detail_id = a.detail_id
      WHERE a.completed_date IS NOT NULL AND a.days_from_setup >= 0
        AND d.setup_date >= '2019-01-01'
      GROUP BY 1
      HAVING count(DISTINCT a.detail_id) >= 50;
      CREATE UNIQUE INDEX mv_permit_journey_trend_pk ON housing.mv_permit_journey_trend (period);
    `);
    console.log("   ✓ created");

    // ── 4. mv_permit_correction_stats ──
    // Used by housing/journey + housing/bottleneck: correction roundup
    console.log("\n4. Creating housing.mv_permit_correction_stats...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_correction_stats CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_correction_stats AS
      SELECT
        1 as id,
        (SELECT count(DISTINCT detail_id)::int FROM housing.permit_activities) as total_permits,
        (SELECT count(DISTINCT detail_id)::int FROM housing.permit_activities WHERE activity_name ILIKE '%correction%') as with_corrections,
        (SELECT ROUND(AVG(rounds)::numeric, 2)::float FROM (
          SELECT count(*)::int as rounds
          FROM housing.permit_activities
          WHERE activity_name ILIKE '%correction%'
          GROUP BY detail_id
        ) sub) as avg_rounds,
        (SELECT min(last_activity_date)::text FROM housing.permit_activities WHERE last_activity_date IS NOT NULL) as earliest_activity,
        (SELECT max(last_activity_date)::text FROM housing.permit_activities WHERE last_activity_date IS NOT NULL) as latest_activity;
      CREATE UNIQUE INDEX mv_permit_correction_stats_pk ON housing.mv_permit_correction_stats (id);
    `);
    console.log("   ✓ created");

    // ── 5. mv_permit_bottleneck_trend ──
    // Used by housing/bottleneck: quarterly median days by inspection type
    console.log("\n5. Creating housing.mv_permit_bottleneck_trend...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_bottleneck_trend CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_bottleneck_trend AS
      SELECT
        TO_CHAR(date_trunc('quarter', completed_date), 'YYYY-"Q"Q') as quarter,
        activity_type,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_from_setup))::int as median_days
      FROM housing.permit_activities
      WHERE completed_date IS NOT NULL
        AND days_from_setup IS NOT NULL AND days_from_setup > 0
        AND activity_type IN (
          'Fire Inspections','Electrical Inspections','Plumbing Inspections',
          'Mechanical Inspections','Plan Review PW'
        )
      GROUP BY 1, 2
      HAVING count(*) >= 5;
      CREATE UNIQUE INDEX mv_permit_bottleneck_trend_pk ON housing.mv_permit_bottleneck_trend (quarter, activity_type);
    `);
    console.log("   ✓ created");

    // ── 6. mv_permit_slowest_examples ──
    // Used by housing/bottleneck: top 3 slowest permits per top-5 review type
    console.log("\n6. Creating housing.mv_permit_slowest_examples...");
    await sql.unsafe(`
      DROP MATERIALIZED VIEW IF EXISTS housing.mv_permit_slowest_examples CASCADE;
      CREATE MATERIALIZED VIEW housing.mv_permit_slowest_examples AS
      WITH top_types AS (
        SELECT activity_type
        FROM housing.permit_bottleneck_analysis
        ORDER BY avg_days_to_complete DESC
        LIMIT 5
      ),
      ranked_permits AS (
        SELECT
          a.detail_id,
          d.permit_type,
          d.address,
          d.days_to_issue,
          d.status,
          a.activity_type,
          a.days_from_setup,
          ROW_NUMBER() OVER (PARTITION BY a.activity_type ORDER BY a.days_from_setup DESC) as rn
        FROM housing.permit_activities a
        JOIN housing.permit_details d ON d.detail_id = a.detail_id
        JOIN top_types t ON t.activity_type = a.activity_type
        WHERE a.days_from_setup IS NOT NULL
          AND a.activity_status IN ('Approved', 'Completed')
      )
      SELECT rn::int as rank, detail_id, permit_type, address, days_to_issue, status, activity_type, days_from_setup
      FROM ranked_permits
      WHERE rn <= 3;
      CREATE UNIQUE INDEX mv_permit_slowest_examples_pk ON housing.mv_permit_slowest_examples (activity_type, rank);
    `);
    console.log("   ✓ created");

    // ── Verification ──
    console.log("\n=============================================");
    console.log("VERIFICATION");
    console.log("=============================================\n");

    const mvs = [
      "mv_permit_phase_summary",
      "mv_permit_journey_by_type",
      "mv_permit_journey_trend",
      "mv_permit_correction_stats",
      "mv_permit_bottleneck_trend",
      "mv_permit_slowest_examples",
    ];
    for (const mv of mvs) {
      const r = await sql.unsafe(`SELECT count(*)::int as n FROM housing.${mv}`);
      console.log(`  housing.${mv}: ${r[0].n} rows`);
    }

    console.log("\n✅ All matviews created.");
    console.log("Refresh with: ingest/refresh-housing-matviews.ts");

    await sql.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\nERROR:", msg);
    await sql.end();
    process.exit(1);
  }
}

main().then(() => process.exit(0));
