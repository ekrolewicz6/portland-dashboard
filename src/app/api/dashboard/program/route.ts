import { NextResponse } from "next/server";
import type { ProgramData } from "@/lib/types";

export const dynamic = "force-dynamic";

/** PCB program data — internal, not yet available. Will come from PCB registry in the future. */
export async function GET(): Promise<NextResponse<ProgramData & { dataStatus: string; dataAvailable: boolean }>> {
  return NextResponse.json({
    headline: "Program data not yet available",
    headlineValue: 0,
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
    trend: { direction: "flat" as const, percentage: 0, label: "not yet launched" },
    chartData: [],
    certifiedBusinesses: [],
    survivalRate: [],
    jobsCreated: [],
    source: "Portland Commons Program Office (not yet live)",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights: [
      "PCB program metrics will be available once the certification system launches.",
    ],
  } as unknown as ProgramData & { dataStatus: string; dataAvailable: boolean });
}
