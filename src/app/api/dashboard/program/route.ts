import { NextResponse } from "next/server";
import { programData } from "@/lib/mock-data";
import type { ProgramData } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Internal PCB program data — will come from PCB registry in the future. */
export async function GET(): Promise<NextResponse<ProgramData>> {
  return NextResponse.json(programData);
}
