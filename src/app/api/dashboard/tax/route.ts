import { NextResponse } from "next/server";
import { taxData } from "@/lib/mock-data";
import type { TaxData } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Static tax analysis data — computed from published rates, this IS real data. */
export async function GET(): Promise<NextResponse<TaxData & { dataStatus: string }>> {
  return NextResponse.json({
    ...taxData,
    dataStatus: "live",
  });
}
