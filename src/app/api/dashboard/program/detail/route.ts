import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // All program detail data is unavailable:
  // - public.program_pcb_summary is FAKE modeled data — removed
  // - PCB registry system not yet live
  return NextResponse.json({
    growthTrend: null,
    currentStats: null,
    dataStatus: "unavailable",
    dataAvailable: false,
    dataSources: [
      {
        name: "PCB Registry",
        status: "internal",
        provider: "Portland Commons Program Office",
        action: "Will be available once the PCB certification system is live",
      },
    ],
  });
}
