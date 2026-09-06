import { NextResponse } from "next/server";
import { TAX_BURDEN, TAX_BURDEN_VERIFIED_AT } from "@/data/tax-burden";
import type { TaxData } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Tax and fiscal burden comparison.
 *
 * This payload is static reference data, not a live query: it is transcribed
 * from the Lincoln Institute FiSC 2023 database and published statutory rates
 * (see src/data/tax-burden.ts for full provenance). It is reported as
 * "reference" rather than "live" so the UI never implies a running pipeline
 * stands behind it, and `verifiedAt` says when a human last re-read the
 * sources.
 */
export async function GET(): Promise<
  NextResponse<TaxData & { dataStatus: string; verifiedAt: string }>
> {
  return NextResponse.json({
    ...TAX_BURDEN,
    dataStatus: "reference",
    verifiedAt: TAX_BURDEN_VERIFIED_AT,
  });
}
