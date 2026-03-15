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

interface MigrationCensusRow {
  year: number;
  population: number;
  change: number | null;
}

export async function GET(): Promise<
  NextResponse<MigrationData & { dataStatus: string; dataAvailable: boolean }>
> {
  try {
    // Try fetching real census data from the database
    const [censusRows, migrationRows] = await Promise.all([
      sql<CensusRow[]>`
        SELECT year, population, change_from_prev, pct_change, source, geo_name
        FROM migration.census_population
        ORDER BY year
      `.catch(() => [] as CensusRow[]),
      sql<MigrationCensusRow[]>`
        SELECT year, population, change
        FROM public.migration_census
        ORDER BY year
      `.catch(() => [] as MigrationCensusRow[]),
    ]);

    const hasData = censusRows.length > 0 || migrationRows.length > 0;

    if (!hasData) {
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

    // Build census population chart data
    const pepRows = censusRows.filter((r) => r.source === "PEP");
    const acsRows = censusRows.filter((r) => r.source === "ACS5");

    // Prefer PEP data, fill in with ACS
    const allYears = new Map<number, CensusRow>();
    for (const r of acsRows) allYears.set(r.year, r);
    for (const r of pepRows) allYears.set(r.year, r); // PEP overwrites ACS
    const sortedYears = [...allYears.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, r]) => r);

    const censusPopulation = sortedYears.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.population,
      label: `${r.year}: ${r.population.toLocaleString()} (${r.source})`,
    }));

    // Chart data: use population trend as primary chart
    const chartData = sortedYears.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.population,
      label: `${r.year}`,
    }));

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

    // Build insights
    const insights: string[] = [];
    if (latest) {
      insights.push(
        `Portland's population was ${latest.population.toLocaleString()} in ${latest.year} (${latest.source === "PEP" ? "Census Population Estimates" : "ACS 5-Year"}).`
      );
    }
    if (latest?.change_from_prev != null) {
      const dir = latest.change_from_prev > 0 ? "grew by" : "declined by";
      insights.push(
        `Population ${dir} ${Math.abs(latest.change_from_prev).toLocaleString()} from the previous year.`
      );
    }
    if (pepRows.length > 0) {
      insights.push(
        `Census PEP data available: ${pepRows.map((r) => r.year).join(", ")}.`
      );
    }
    if (acsRows.length > 0) {
      insights.push(
        `ACS 5-Year estimates available: ${acsRows.map((r) => r.year).join(", ")}.`
      );
    }
    insights.push(
      "Water Bureau net activation data requires a public records request for finer-grained migration tracking."
    );

    return NextResponse.json({
      headline: `Portland population: ${latest?.population.toLocaleString() ?? "N/A"} (${latest?.year ?? "?"})`,
      headlineValue: latest?.population ?? 0,
      dataStatus: "available",
      dataAvailable: true,
      dataSources: [
        {
          name: "Census Population Estimates (PEP)",
          status: pepRows.length > 0 ? "connected" : "no_data",
          provider: "U.S. Census Bureau",
          action: `${pepRows.length} years of PEP data`,
        },
        {
          name: "Census ACS 5-Year Estimates",
          status: acsRows.length > 0 ? "connected" : "no_data",
          provider: "U.S. Census Bureau",
          action: `${acsRows.length} years of ACS data`,
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
      netActivations: [], // Need Water Bureau PRR for this
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
        "Run: npx tsx scripts/fetch-census.ts",
      ],
    } as unknown as MigrationData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  }
}
