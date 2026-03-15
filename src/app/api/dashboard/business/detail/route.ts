import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // All business detail data is unavailable:
  // - public.business_formation_monthly is FAKE modeled data — removed
  // - CivicApps API is permanently offline
  // - BLT registration data needs public records request
  return NextResponse.json({
    formationTrend: null,
    yearlyTotals: null,
    cumulativeFormation: null,
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
        action: "API permanently offline",
      },
      {
        name: "Oregon SOS Business Filings",
        status: "needs_download",
        provider: "Oregon Secretary of State",
        action: "Download from sos.oregon.gov/business",
      },
    ],
  });
}
