import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { taxData } from "@/lib/mock-data";
import type { TaxData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<TaxData>> {
  if (!USE_MOCK) {
    // TODO: Query tax_comparison table.
    // Example:
    //   const jurisdictions = await query<TaxJurisdiction>(
    //     `SELECT name, property_tax_rate, income_tax_rate, sales_tax_rate,
    //             biz_license_fee, transit_tax, arts_education_tax, effective_rate
    //        FROM tax_comparison
    //       ORDER BY effective_rate DESC`
    //   );
  }

  return NextResponse.json(taxData);
}
