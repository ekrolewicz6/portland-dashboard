/**
 * analyze-permit-bottlenecks.ts
 *
 * Analyzes scraped permit activity data to identify review bottlenecks.
 * For each review type (Planning & Zoning, Structural, Life Safety, Fire, etc.):
 *   - Average/median days from permit setup to completion
 *   - % of permits where this was the LAST review to complete (= bottleneck)
 *   - Correction round counts
 *
 * Saves results to housing.permit_bottleneck_analysis and data/permit-bottleneck-analysis.json
 *
 * Usage: npx tsx scripts/analyze-permit-bottlenecks.ts
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const sql = postgres(DB_URL);

const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");

// Review types we care about (excludes inspections, process management, etc.)
const REVIEW_TYPES = [
  "Planning and Zoning",
  "Structural",
  "Life Safety",
  "Fire Review",
  "Erosion Control",
  "Environmental Services",
  "Transportation",
  "Water Review",
  "Parks Review",
  "Trees",
  "Commercial Plumbing",
  "Addressing",
  "Special Inspections Review",
  "Issuance",
];

async function main() {
  console.log("\n=== Permit Bottleneck Analysis ===\n");

  // Ensure analysis table exists
  await sql`
    CREATE TABLE IF NOT EXISTS housing.permit_bottleneck_analysis (
      activity_type TEXT PRIMARY KEY,
      avg_days_to_complete NUMERIC,
      median_days_to_complete NUMERIC,
      pct_is_last_review NUMERIC,
      total_permits_reviewed INTEGER,
      avg_correction_rounds NUMERIC
    )
  `;

  // 1. Get total permits with activities
  const totalRows = await sql`
    SELECT count(DISTINCT detail_id)::int as cnt
    FROM housing.permit_activities
  `;
  const totalPermits = Number(totalRows[0].cnt);
  console.log(`Total permits with activity data: ${totalPermits}\n`);

  if (totalPermits === 0) {
    console.log("No permit activity data found. Run the scraper first.");
    await sql.end();
    return;
  }

  // 2. For each review type, compute stats
  const results: Array<{
    activity_type: string;
    avg_days_to_complete: number;
    median_days_to_complete: number;
    pct_is_last_review: number;
    total_permits_reviewed: number;
    avg_correction_rounds: number;
  }> = [];

  // 2a. Get average and median days_from_setup by activity_type (only completed reviews)
  const statsRows = await sql`
    SELECT
      activity_type,
      ROUND(AVG(days_from_setup), 1) as avg_days,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_from_setup), 1) as median_days,
      count(DISTINCT detail_id)::int as permit_count
    FROM housing.permit_activities
    WHERE days_from_setup IS NOT NULL
      AND days_from_setup > 0
      AND activity_status IN ('Approved', 'Completed', 'Not Required')
      AND activity_type NOT IN (
        'Application', 'Process Management', 'Issuance/Intake',
        'Building Inspections', 'Erosion Control Inspections',
        'BDS Inspection Management', 'Inspections', 'Special Inspections',
        'Final Permit', 'Document Management'
      )
    GROUP BY activity_type
    HAVING count(DISTINCT detail_id) >= 2
    ORDER BY avg_days DESC
  `;

  console.log("Review Type Stats (days from setup to completion):");
  console.log("─".repeat(100));
  console.log(
    "Activity Type".padEnd(30) +
      "Avg Days".padStart(10) +
      "Med Days".padStart(10) +
      "Permits".padStart(10)
  );
  console.log("─".repeat(100));

  for (const row of statsRows) {
    console.log(
      String(row.activity_type).padEnd(30) +
        String(row.avg_days).padStart(10) +
        String(row.median_days).padStart(10) +
        String(row.permit_count).padStart(10)
    );
  }

  // 2b. Determine which review was last to complete for each permit
  // (the bottleneck review = the one that completed latest relative to setup)
  const lastReviewRows = await sql`
    WITH ranked AS (
      SELECT
        detail_id,
        activity_type,
        days_from_setup,
        ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY days_from_setup DESC) as rn
      FROM housing.permit_activities
      WHERE days_from_setup IS NOT NULL
        AND days_from_setup > 0
        AND activity_status IN ('Approved', 'Completed')
        AND activity_type NOT IN (
          'Application', 'Process Management', 'Issuance/Intake',
          'Building Inspections', 'Erosion Control Inspections',
          'BDS Inspection Management', 'Inspections', 'Special Inspections',
          'Final Permit', 'Document Management', 'Issuance'
        )
    )
    SELECT activity_type, count(*)::int as last_count
    FROM ranked
    WHERE rn = 1
    GROUP BY activity_type
    ORDER BY last_count DESC
  `;

  // Total permits that have a "last review"
  const totalWithLast = lastReviewRows.reduce(
    (sum, r) => sum + Number(r.last_count),
    0
  );

  const lastReviewMap = new Map<string, number>();
  for (const row of lastReviewRows) {
    lastReviewMap.set(String(row.activity_type), Number(row.last_count));
  }

  console.log("\n\nBottleneck Frequency (which review finishes LAST):");
  console.log("─".repeat(70));
  for (const row of lastReviewRows) {
    const pct =
      totalWithLast > 0
        ? ((Number(row.last_count) / totalWithLast) * 100).toFixed(1)
        : "0.0";
    console.log(
      `  ${String(row.activity_type).padEnd(30)} ${String(row.last_count).padStart(5)} permits (${pct}%)`
    );
  }

  // 2c. Count correction rounds per permit
  const correctionRows = await sql`
    SELECT
      detail_id,
      count(*)::int as correction_rounds
    FROM housing.permit_activities
    WHERE activity_name ILIKE '%corrections received%'
    GROUP BY detail_id
  `;

  const correctionMap = new Map<number, number>();
  for (const row of correctionRows) {
    correctionMap.set(Number(row.detail_id), Number(row.correction_rounds));
  }

  const avgCorrectionRoundsOverall =
    correctionRows.length > 0
      ? correctionRows.reduce((sum, r) => sum + Number(r.correction_rounds), 0) /
        totalPermits
      : 0;

  console.log(
    `\nAverage correction rounds per permit: ${avgCorrectionRoundsOverall.toFixed(2)}`
  );
  console.log(
    `Permits with corrections: ${correctionRows.length} of ${totalPermits} (${((correctionRows.length / totalPermits) * 100).toFixed(1)}%)`
  );

  // 2d. Correction rounds per review type (permits that had that review as last)
  // We'll compute avg corrections for permits where each type was the bottleneck
  const corrByType = await sql`
    WITH last_review AS (
      SELECT
        detail_id,
        activity_type,
        ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY days_from_setup DESC) as rn
      FROM housing.permit_activities
      WHERE days_from_setup IS NOT NULL
        AND days_from_setup > 0
        AND activity_status IN ('Approved', 'Completed')
        AND activity_type NOT IN (
          'Application', 'Process Management', 'Issuance/Intake',
          'Building Inspections', 'Erosion Control Inspections',
          'BDS Inspection Management', 'Inspections', 'Special Inspections',
          'Final Permit', 'Document Management', 'Issuance'
        )
    ),
    corrections AS (
      SELECT detail_id, count(*)::int as rounds
      FROM housing.permit_activities
      WHERE activity_name ILIKE '%corrections received%'
      GROUP BY detail_id
    )
    SELECT
      lr.activity_type,
      ROUND(AVG(COALESCE(c.rounds, 0)), 2) as avg_corrections
    FROM last_review lr
    LEFT JOIN corrections c ON c.detail_id = lr.detail_id
    WHERE lr.rn = 1
    GROUP BY lr.activity_type
  `;

  const corrByTypeMap = new Map<string, number>();
  for (const row of corrByType) {
    corrByTypeMap.set(String(row.activity_type), Number(row.avg_corrections));
  }

  // 3. Build final results combining all data
  for (const row of statsRows) {
    const actType = String(row.activity_type);
    const lastCount = lastReviewMap.get(actType) ?? 0;
    const pctIsLast =
      totalWithLast > 0
        ? Math.round((lastCount / totalWithLast) * 1000) / 10
        : 0;

    results.push({
      activity_type: actType,
      avg_days_to_complete: Number(row.avg_days),
      median_days_to_complete: Number(row.median_days),
      pct_is_last_review: pctIsLast,
      total_permits_reviewed: Number(row.permit_count),
      avg_correction_rounds: corrByTypeMap.get(actType) ?? 0,
    });
  }

  // Sort by avg_days descending (slowest first)
  results.sort((a, b) => b.avg_days_to_complete - a.avg_days_to_complete);

  // 4. Print final ranking
  console.log("\n\n=== BOTTLENECK RANKING (slowest review types) ===");
  console.log("─".repeat(110));
  console.log(
    "#".padStart(3) +
      "  " +
      "Review Type".padEnd(30) +
      "Avg Days".padStart(10) +
      "Med Days".padStart(10) +
      "Last %".padStart(10) +
      "Permits".padStart(10) +
      "Avg Corr".padStart(10)
  );
  console.log("─".repeat(110));

  results.forEach((r, i) => {
    console.log(
      String(i + 1).padStart(3) +
        "  " +
        r.activity_type.padEnd(30) +
        r.avg_days_to_complete.toFixed(1).padStart(10) +
        r.median_days_to_complete.toFixed(1).padStart(10) +
        (r.pct_is_last_review.toFixed(1) + "%").padStart(10) +
        String(r.total_permits_reviewed).padStart(10) +
        r.avg_correction_rounds.toFixed(2).padStart(10)
    );
  });

  // 5. Save to JSON
  const outputPath = path.join(DATA_DIR, "permit-bottleneck-analysis.json");
  const output = {
    generated_at: new Date().toISOString(),
    total_permits_analyzed: totalPermits,
    avg_correction_rounds_overall: Math.round(avgCorrectionRoundsOverall * 100) / 100,
    pct_permits_with_corrections:
      Math.round((correctionRows.length / totalPermits) * 1000) / 10,
    bottleneck_ranking: results,
  };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved analysis to ${outputPath}`);

  // 6. Save to DB
  await sql`DELETE FROM housing.permit_bottleneck_analysis`;
  for (const r of results) {
    await sql`
      INSERT INTO housing.permit_bottleneck_analysis (
        activity_type, avg_days_to_complete, median_days_to_complete,
        pct_is_last_review, total_permits_reviewed, avg_correction_rounds
      ) VALUES (
        ${r.activity_type}, ${r.avg_days_to_complete}, ${r.median_days_to_complete},
        ${r.pct_is_last_review}, ${r.total_permits_reviewed}, ${r.avg_correction_rounds}
      )
      ON CONFLICT (activity_type) DO UPDATE SET
        avg_days_to_complete = EXCLUDED.avg_days_to_complete,
        median_days_to_complete = EXCLUDED.median_days_to_complete,
        pct_is_last_review = EXCLUDED.pct_is_last_review,
        total_permits_reviewed = EXCLUDED.total_permits_reviewed,
        avg_correction_rounds = EXCLUDED.avg_correction_rounds
    `;
  }
  console.log("Saved analysis to housing.permit_bottleneck_analysis table");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
