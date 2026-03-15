import { NextResponse } from "next/server";
import { taxData } from "@/lib/mock-data";
import type { TaxData } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Static tax analysis data — no external API. */
export async function GET(): Promise<NextResponse<TaxData>> {
  return NextResponse.json(taxData);
}
