import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { safetyData } from "@/lib/mock-data";
import type { SafetyData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<SafetyData>> {
  if (!USE_MOCK) {
    // TODO: Query ppb_crime_stats and boec_response_times tables.
    // Example:
    //   const crimes = await query<{ category: string; count: number; change: number }>(
    //     `WITH cur AS (
    //        SELECT category, COUNT(*) AS cnt
    //          FROM ppb_crime_stats
    //         WHERE reported_at >= NOW() - INTERVAL '12 months'
    //         GROUP BY category
    //      ), prev AS (
    //        SELECT category, COUNT(*) AS cnt
    //          FROM ppb_crime_stats
    //         WHERE reported_at BETWEEN NOW() - INTERVAL '24 months'
    //               AND NOW() - INTERVAL '12 months'
    //         GROUP BY category
    //      )
    //      SELECT cur.category,
    //             cur.cnt AS count,
    //             ROUND((cur.cnt - prev.cnt)::numeric / prev.cnt * 100, 1) AS change
    //        FROM cur JOIN prev USING (category)
    //       ORDER BY cur.cnt DESC`
    //   );
  }

  return NextResponse.json(safetyData);
}
