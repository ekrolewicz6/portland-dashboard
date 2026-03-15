import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { migrationData } from "@/lib/mock-data";
import type { MigrationData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<MigrationData>> {
  if (!USE_MOCK) {
    // TODO: Replace with real queries once PostgreSQL is connected.
    // Example:
    //   const activations = await query<{ month: string; net: number }>(
    //     `SELECT to_char(date_trunc('month', activated_at), 'YYYY-MM') AS month,
    //            COUNT(*) FILTER (WHERE type = 'activation')
    //            - COUNT(*) FILTER (WHERE type = 'deactivation') AS net
    //       FROM water_accounts
    //      WHERE activated_at >= NOW() - INTERVAL '12 months'
    //      GROUP BY 1 ORDER BY 1`
    //   );
  }

  return NextResponse.json(migrationData);
}
