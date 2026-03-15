import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { businessData } from "@/lib/mock-data";
import type { BusinessData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<BusinessData>> {
  if (!USE_MOCK) {
    // TODO: Query blt_registrations and civicapps_licenses tables.
    // Example:
    //   const regs = await query<{ month: string; new_count: number; cancelled: number }>(
    //     `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
    //            COUNT(*) FILTER (WHERE status = 'active') AS new_count,
    //            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
    //       FROM blt_registrations
    //      WHERE created_at >= NOW() - INTERVAL '12 months'
    //      GROUP BY 1 ORDER BY 1`
    //   );
  }

  return NextResponse.json(businessData);
}
