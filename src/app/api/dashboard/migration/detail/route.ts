import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // All migration detail data is unavailable:
  // - public.migration_water_monthly is FAKE modeled data — removed
  // - public.migration_census is FAKE modeled data — removed
  // - Water Bureau data needs public records request
  // - Census data needs free API key
  return NextResponse.json({
    waterTrend: null,
    populationTrend: null,
    recentMonths: null,
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
  });
}
