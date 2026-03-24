import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface BottleneckEntry {
  activity_type: string;
  avg_days_to_complete: number;
  median_days_to_complete: number;
  pct_is_last_review: number;
  total_permits_reviewed: number;
  avg_correction_rounds: number;
}

interface SlowestPermit {
  detail_id: number;
  permit_type: string | null;
  address: string | null;
  days_to_issue: number | null;
  status: string | null;
  activity_type: string;
  days_from_setup: number;
}

interface TrendPoint {
  quarter: string;
  [key: string]: string | number; // activity_type keys with median_days values
}

interface BottleneckResponse {
  ranking: BottleneckEntry[];
  trend: TrendPoint[];
  slowest_examples: SlowestPermit[];
  total_permits_analyzed: number;
  date_range: { earliest: string; latest: string };
  correction_stats: {
    avg_rounds: number;
    pct_with_corrections: number;
  };
  dataStatus: string;
}

export async function GET(): Promise<NextResponse<BottleneckResponse>> {
  try {
    // 1. Get bottleneck ranking — exclude non-review activity types
    // (D - Permit Request, inspections, process management are not review steps)
    const EXCLUDED_TYPES = [
      'D - Permit Request',
      'Facilities Final Inspection',
      'Facilities Process Management',
      'Under Inspection',
      'Plat Issuance',
      'Enforcement',
      'Permit Expiration',
      'E - Code Compliance',
      'Tree Inspections',
      'Deconstruction Inspections',
      'Sign Inspections',
      'City Attorney',
      'Bond/Insurance PW',
      'Pre-Issuance PW',
      'Permit Frontage',
      'Deconstruction',
      'Intake',
      'Home Occupation Permit Issuance',
      'Revenue',
      'Multnomah County',
      'Trade Permits',
    ];
    const rankingRows = await sql`
      SELECT
        activity_type,
        avg_days_to_complete::float,
        median_days_to_complete::float,
        pct_is_last_review::float,
        total_permits_reviewed::int,
        avg_correction_rounds::float
      FROM housing.permit_bottleneck_analysis
      WHERE activity_type != ALL(${EXCLUDED_TYPES})
      ORDER BY avg_days_to_complete DESC
    `;

    const ranking: BottleneckEntry[] = rankingRows.map((r) => ({
      activity_type: r.activity_type as string,
      avg_days_to_complete: Number(r.avg_days_to_complete),
      median_days_to_complete: Number(r.median_days_to_complete),
      pct_is_last_review: Number(r.pct_is_last_review),
      total_permits_reviewed: Number(r.total_permits_reviewed),
      avg_correction_rounds: Number(r.avg_correction_rounds),
    }));

    // 2. Quarterly trend — median days by activity type over time
    const TOP_TREND_TYPES = [
      'Fire Inspections',
      'Electrical Inspections',
      'Plumbing Inspections',
      'Mechanical Inspections',
      'Plan Review PW',
    ];
    const trendRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', completed_date), 'YYYY-"Q"Q') as quarter,
        activity_type,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_from_setup))::int as median_days
      FROM housing.permit_activities
      WHERE completed_date IS NOT NULL
        AND days_from_setup IS NOT NULL AND days_from_setup > 0
        AND activity_type = ANY(${TOP_TREND_TYPES})
      GROUP BY 1, 2
      HAVING count(*) >= 5
      ORDER BY 1, 2
    `;

    // Pivot into {quarter, "Fire Inspections": 35, "Electrical Inspections": 20, ...}
    const trendMap = new Map<string, Record<string, number>>();
    for (const r of trendRows) {
      const q = r.quarter as string;
      if (!trendMap.has(q)) trendMap.set(q, {});
      trendMap.get(q)![r.activity_type as string] = Number(r.median_days);
    }
    const trend: TrendPoint[] = [...trendMap.entries()].map(([quarter, types]) => ({
      quarter,
      ...types,
    }));

    // 2b. Date range of activity data
    const dateRangeRows = await sql`
      SELECT min(last_activity_date)::text as earliest, max(last_activity_date)::text as latest
      FROM housing.permit_activities WHERE last_activity_date IS NOT NULL
    `;
    const date_range = {
      earliest: (dateRangeRows[0]?.earliest as string) ?? "unknown",
      latest: (dateRangeRows[0]?.latest as string) ?? "unknown",
    };

    // 3. Get slowest specific permits for each top review type
    const slowestRows = await sql`
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
      SELECT detail_id, permit_type, address, days_to_issue, status, activity_type, days_from_setup
      FROM ranked_permits
      WHERE rn <= 3
      ORDER BY activity_type, days_from_setup DESC
    `;

    const slowest_examples: SlowestPermit[] = slowestRows.map((r) => ({
      detail_id: Number(r.detail_id),
      permit_type: r.permit_type as string | null,
      address: r.address as string | null,
      days_to_issue: r.days_to_issue ? Number(r.days_to_issue) : null,
      status: r.status as string | null,
      activity_type: r.activity_type as string,
      days_from_setup: Number(r.days_from_setup),
    }));

    // 3. Overall correction stats
    const corrStats = await sql`
      SELECT
        count(DISTINCT detail_id)::int as total_permits,
        count(DISTINCT detail_id) FILTER (
          WHERE detail_id IN (
            SELECT DISTINCT detail_id FROM housing.permit_activities
            WHERE activity_name ILIKE '%corrections received%'
          )
        )::int as with_corrections
      FROM housing.permit_details
    `;

    const corrRoundRows = await sql`
      SELECT ROUND(AVG(rounds), 2)::float as avg_rounds
      FROM (
        SELECT detail_id, count(*)::int as rounds
        FROM housing.permit_activities
        WHERE activity_name ILIKE '%corrections received%'
        GROUP BY detail_id
      ) sub
    `;

    const totalAnalyzed = Number(corrStats[0].total_permits);
    const withCorr = Number(corrStats[0].with_corrections);

    return NextResponse.json({
      ranking,
      trend,
      slowest_examples,
      total_permits_analyzed: totalAnalyzed,
      date_range,
      correction_stats: {
        avg_rounds: Number(corrRoundRows[0]?.avg_rounds ?? 0),
        pct_with_corrections:
          totalAnalyzed > 0
            ? Math.round((withCorr / totalAnalyzed) * 1000) / 10
            : 0,
      },
      dataStatus: ranking.length > 0 ? "available" : "empty",
    });
  } catch (error) {
    console.error("[housing/bottleneck] DB query failed:", error);
    return NextResponse.json(
      {
        ranking: [],
        trend: [],
        slowest_examples: [],
        total_permits_analyzed: 0,
        date_range: { earliest: "unknown", latest: "unknown" },
        correction_stats: { avg_rounds: 0, pct_with_corrections: 0 },
        dataStatus: "unavailable",
      },
      { status: 200 }
    );
  }
}
