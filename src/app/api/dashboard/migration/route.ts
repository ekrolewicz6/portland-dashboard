import { NextResponse } from "next/server";
import { migrationData } from "@/lib/mock-data";
import type { MigrationData } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Data sources:
 *   - Water Bureau activations: requires public records request — MOCK
 *   - Census population: Census API requires API key — STUB
 *
 * TODO: Census API integration
 *   const CENSUS_API_KEY = process.env.CENSUS_API_KEY;
 *   const censusUrl = `https://api.census.gov/data/2024/pep/population?get=POP_2024&for=place:59000&in=state:41&key=${CENSUS_API_KEY}`;
 *   Endpoint: https://api.census.gov/data/{year}/pep/population
 *   Geography: state:41 (Oregon), place:59000 (Portland)
 */

export async function GET(): Promise<NextResponse<MigrationData>> {
  // All data is mock until Water Bureau partnership and Census API key are in place
  const result: MigrationData = {
    ...migrationData,
    source: "Portland Water Bureau (mock) / U.S. Census Bureau (mock — API key required)",
    lastUpdated: new Date().toISOString().slice(0, 10),
    insights: [
      ...migrationData.insights,
      "Census API integration stubbed — set CENSUS_API_KEY env var to enable.",
    ],
  };

  return NextResponse.json(result);
}
