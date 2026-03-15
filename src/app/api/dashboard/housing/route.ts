import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { housingData } from "@/lib/mock-data";
import type { HousingData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<HousingData>> {
  if (!USE_MOCK) {
    // TODO: Query bds_permits, permit_processing, and zillow_zori tables.
    // Example:
    //   const permits = await query<{ month: string; units: number }>(
    //     `SELECT to_char(date_trunc('month', issued_at), 'YYYY-MM') AS month,
    //            SUM(unit_count) AS units
    //       FROM bds_permits
    //      WHERE issued_at >= NOW() - INTERVAL '12 months'
    //        AND permit_type IN ('new_construction', 'adu')
    //      GROUP BY 1 ORDER BY 1`
    //   );
  }

  return NextResponse.json(housingData);
}
