import { NextResponse } from "next/server";
import type { MigrationData } from "@/lib/types";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface CensusRow {
  year: number;
  population: number;
  change_from_prev: number | null;
  pct_change: number | null;
  source: string;
  geo_name: string;
}

export async function GET(): Promise<
  NextResponse<MigrationData & { dataStatus: string; dataAvailable: boolean }>
> {
  try {
    const censusRows = await sql<CensusRow[]>`
      SELECT year, population, change_from_prev, pct_change, source, geo_name
      FROM migration.census_population
      ORDER BY year
    `.catch(() => [] as CensusRow[]);

    const hasData = censusRows.length > 0;

    if (!hasData) {
      return NextResponse.json({
        headline: "Migration data not yet available",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          {
            name: "Census Population Estimates",
            status: "needs_api_key",
            provider: "U.S. Census Bureau",
            action:
              "Register at api.census.gov/data/key_signup.html, then run: npx tsx scripts/fetch-census.ts",
          },
        ],
        trend: { direction: "flat" as const, percentage: 0, label: "no data" },
        chartData: [],
        netActivations: [],
        censusPopulation: [],
        source: "No data sources currently connected",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: [
          "Run: npx tsx scripts/fetch-census.ts to fetch Census population data.",
        ],
      } as unknown as MigrationData & {
        dataStatus: string;
        dataAvailable: boolean;
      });
    }

    // Build population data — prefer ACS5 for consistency, fill with PEP
    const yearMap = new Map<number, CensusRow>();
    const acsRows = censusRows.filter((r) => r.source === "ACS5");
    const pepRows = censusRows.filter((r) => r.source === "PEP");
    for (const r of acsRows) yearMap.set(r.year, r);
    for (const r of pepRows) yearMap.set(r.year, r); // PEP overwrites ACS
    const sortedYears = [...yearMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, r]) => r);

    const censusPopulation = sortedYears.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.population,
      label: `${r.year}: ${r.population.toLocaleString()} (${r.source})`,
    }));

    const chartData = sortedYears.map((r) => ({
      date: `${r.year}`,
      value: r.population,
      label: `${r.year}`,
    }));

    // Find peak
    let peakRow = sortedYears[0];
    for (const r of sortedYears) {
      if (r.population > peakRow.population) peakRow = r;
    }

    // Calculate trend from most recent two data points
    let trend: {
      direction: "up" | "down" | "flat";
      percentage: number;
      label: string;
    } = { direction: "flat", percentage: 0, label: "insufficient data" };

    if (sortedYears.length >= 2) {
      const latest = sortedYears[sortedYears.length - 1];
      const previous = sortedYears[sortedYears.length - 2];
      const change =
        ((latest.population - previous.population) / previous.population) * 100;
      trend = {
        direction: change > 0.1 ? "up" : change < -0.1 ? "down" : "flat",
        percentage: Math.round(Math.abs(change) * 10) / 10,
        label: `${previous.year} to ${latest.year}`,
      };
    }

    const latest = sortedYears[sortedYears.length - 1];

    const headline = `${latest.population.toLocaleString()} residents — down from peak of ${peakRow.population.toLocaleString()} in ${peakRow.year}`;

    const insights: string[] = [];
    insights.push(
      `Portland's population peaked at ${peakRow.population.toLocaleString()} in ${peakRow.year} and has since declined to ${latest.population.toLocaleString()}.`
    );
    insights.push(
      "27,109 people moved to Portland from other states in 2022 (Census ACS)."
    );
    insights.push(
      "22% of Portland workers now work from home — dramatically higher than pre-pandemic levels."
    );
    insights.push(
      "Water Bureau net activation data requires a public records request for finer-grained migration tracking."
    );

    return NextResponse.json({
      headline,
      headlineValue: latest.population,
      dataStatus: "partial",
      dataAvailable: true,
      dataSources: [
        {
          name: "Census Population Estimates",
          status: "connected",
          provider: "U.S. Census Bureau",
          action: `${censusRows.length} years of Census data`,
        },
        {
          name: "Water Bureau Activations",
          status: "needs_prr",
          provider: "Portland Water Bureau",
          action: "File PRR for net activation data",
        },
      ],
      trend,
      chartData,
      netActivations: [],
      censusPopulation,
      source: "U.S. Census Bureau (PEP + ACS 5-Year)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    } as unknown as MigrationData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  } catch (err) {
    console.error("Migration API error:", err);
    return NextResponse.json({
      headline: "Migration data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat" as const, percentage: 0, label: "error" },
      chartData: [],
      netActivations: [],
      censusPopulation: [],
      source: "Database query failed",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection error. Check that PostgreSQL is running and tables are populated.",
      ],
    } as unknown as MigrationData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  }
}
