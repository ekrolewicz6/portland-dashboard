import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { programData } from "@/lib/mock-data";
import type { ProgramData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<ProgramData>> {
  if (!USE_MOCK) {
    // TODO: Query pcb_certifications and pcb_outcomes tables.
    // Example:
    //   const certified = await query<{ month: string; cumulative: number }>(
    //     `SELECT to_char(date_trunc('month', certified_at), 'YYYY-MM') AS month,
    //            SUM(COUNT(*)) OVER (ORDER BY date_trunc('month', certified_at)) AS cumulative
    //       FROM pcb_certifications
    //      GROUP BY 1 ORDER BY 1`
    //   );
  }

  return NextResponse.json(programData);
}
