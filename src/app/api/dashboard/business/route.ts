import { NextResponse } from "next/server";
import type { BusinessData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<BusinessData & { dataStatus: string; dataAvailable: boolean }>> {
  // All business data sources are unavailable:
  // - CivicApps API is permanently offline
  // - BLT registration data needs public records request to Revenue Division
  // - Oregon SOS business filings not yet integrated

  return NextResponse.json({
    headline: "Business formation data not yet available",
    headlineValue: 0,
    dataStatus: "unavailable",
    dataAvailable: false,
    dataSources: [
      {
        name: "Revenue Division BLT Registrations",
        status: "needs_prr",
        provider: "Portland Revenue Division",
        action: "File public records request — call 503-823-5157",
      },
      {
        name: "CivicApps Business Licenses",
        status: "offline",
        provider: "CivicApps Portland",
        action: "API permanently offline — use Revenue Division PRR instead",
      },
      {
        name: "Oregon SOS Business Filings",
        status: "needs_download",
        provider: "Oregon Secretary of State",
        action: "Download from sos.oregon.gov/business",
      },
    ],
    trend: { direction: "flat" as const, percentage: 0, label: "no data" },
    chartData: [],
    newRegistrations: [],
    cancelledRegistrations: [],
    civicAppsLicenses: [],
    source: "No data sources currently connected",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights: [
      "Business formation data requires a public records request to the Portland Revenue Division.",
      "CivicApps API is permanently offline.",
      "Oregon Secretary of State filings can be downloaded for free.",
    ],
  } as unknown as BusinessData & { dataStatus: string; dataAvailable: boolean });
}
