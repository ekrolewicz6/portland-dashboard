import { NextResponse } from "next/server";
import type { MigrationData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<MigrationData & { dataStatus: string; dataAvailable: boolean }>> {
  // All migration data sources are unavailable:
  // - Water Bureau activations need public records request
  // - Census API needs free API key from api.census.gov
  // - IRS migration data needs free download from irs.gov

  return NextResponse.json({
    headline: "Migration data not yet available",
    headlineValue: 0,
    dataStatus: "unavailable",
    dataAvailable: false,
    dataSources: [
      {
        name: "Water Bureau Activations",
        status: "needs_prr",
        provider: "Portland Water Bureau",
        action: "File PRR to PWBCustomerService@portlandoregon.gov",
      },
      {
        name: "Census Population Estimates",
        status: "needs_api_key",
        provider: "U.S. Census Bureau",
        action: "Register at api.census.gov/data/key_signup.html",
      },
      {
        name: "IRS SOI Migration Flows",
        status: "needs_download",
        provider: "IRS Statistics of Income",
        action: "Download from irs.gov/statistics/soi-tax-stats-migration-data",
      },
    ],
    trend: { direction: "flat" as const, percentage: 0, label: "no data" },
    chartData: [],
    netActivations: [],
    censusPopulation: [],
    source: "No data sources currently connected",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights: [
      "Water Bureau activation data requires a public records request.",
      "Census API requires a free API key — register at api.census.gov.",
      "IRS migration data is a free download from irs.gov.",
    ],
  } as unknown as MigrationData & { dataStatus: string; dataAvailable: boolean });
}
