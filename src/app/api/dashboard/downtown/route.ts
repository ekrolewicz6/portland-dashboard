import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { downtownData } from "@/lib/mock-data";
import type { DowntownData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<DowntownData>> {
  if (!USE_MOCK) {
    // TODO: Query placer_foot_traffic, costar_vacancy, and dwell_time tables.
    // Example:
    //   const traffic = await query<{ week: string; pct_of_2019: number }>(
    //     `SELECT to_char(date_trunc('week', observation_date), 'YYYY-MM-DD') AS week,
    //            AVG(visit_count)::numeric / baseline_2019 * 100 AS pct_of_2019
    //       FROM placer_foot_traffic
    //      WHERE observation_date >= NOW() - INTERVAL '12 weeks'
    //      GROUP BY 1, baseline_2019 ORDER BY 1`
    //   );
  }

  return NextResponse.json(downtownData);
}
