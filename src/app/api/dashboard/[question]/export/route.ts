import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
// Building a 50k-row CSV in memory takes time; give it room rather than
// letting the platform kill the function mid-response.
export const maxDuration = 60;

// Every query here is bounded. An unbounded SELECT on the larger tables
// materialises the whole result as strings in memory, and a handful of
// concurrent requests would exhaust both the heap and the connection pool.
const ROW_LIMIT = 50_000;

/** Exports per IP per hour. Each one is a multi-megabyte CSV. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines.
 * Double any embedded quotes per RFC 4180.
 */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of row objects into a CSV string with a header row.
 */
function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(csvEscape).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => csvEscape(row[h])).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

/**
 * Build a CSV response with proper headers for download.
 */
function csvResponse(csv: string, question: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="portland-${question}-data.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

type QueryResult = Record<string, unknown>[];

async function queryCategory(question: string): Promise<{ rows: QueryResult; note?: string } | null> {
  switch (question) {
    case "housing": {
      const rows = await sql`
        SELECT permit_number, permit_type, application_date, issued_date,
               status, processing_days, valuation, neighborhood
        FROM housing.permits
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "safety": {
      const rows = await sql`
        SELECT case_number, occur_date, offense_category, offense_type,
               neighborhood, crime_against
        FROM safety.ppb_offenses
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "homelessness": {
      const rows = await sql`
        SELECT incident_date, is_vehicle, is_duplicate, lat, lon
        FROM homelessness.irp_campsite_reports
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "education": {
      // Join enrollment, graduation, and test scores for a combined export
      const enrollment = await sql`
        SELECT * FROM education.enrollment
        LIMIT ${ROW_LIMIT}
      `;
      const graduation = await sql`
        SELECT * FROM education.graduation_rates
        LIMIT ${ROW_LIMIT}
      `;
      const testScores = await sql`
        SELECT * FROM education.test_scores
        LIMIT ${ROW_LIMIT}
      `;
      // Export each as a labeled section
      const sections: string[] = [];

      if (enrollment.length > 0) {
        sections.push("# Enrollment");
        sections.push(rowsToCsv(enrollment as unknown as QueryResult));
      }
      if (graduation.length > 0) {
        sections.push("\n# Graduation Rates");
        sections.push(rowsToCsv(graduation as unknown as QueryResult));
      }
      if (testScores.length > 0) {
        sections.push("\n# Test Scores");
        sections.push(rowsToCsv(testScores as unknown as QueryResult));
      }

      const csv = sections.join("\n");
      return { rows: [], note: csv };
    }

    case "economy": {
      const rows = await sql`
        SELECT * FROM economy.msa_employment_wages
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "transportation": {
      const ridership = await sql`SELECT * FROM transportation.ridership LIMIT ${ROW_LIMIT}`;
      const crashes = await sql`SELECT * FROM transportation.crashes LIMIT ${ROW_LIMIT}`;
      const commute = await sql`SELECT * FROM transportation.commute_mode LIMIT ${ROW_LIMIT}`;

      const sections: string[] = [];
      if (ridership.length > 0) {
        sections.push("# Ridership");
        sections.push(rowsToCsv(ridership as unknown as QueryResult));
      }
      if (crashes.length > 0) {
        sections.push("\n# Crashes");
        sections.push(rowsToCsv(crashes as unknown as QueryResult));
      }
      if (commute.length > 0) {
        sections.push("\n# Commute Mode");
        sections.push(rowsToCsv(commute as unknown as QueryResult));
      }

      const csv = sections.join("\n");
      return { rows: [], note: csv };
    }

    case "quality": {
      const rows = await sql`
        SELECT * FROM quality.library_stats
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "accountability": {
      const rows = await sql`
        SELECT * FROM accountability.promises
        LIMIT ${ROW_LIMIT}
      `;
      return { rows: rows as unknown as QueryResult };
    }

    case "fiscal": {
      // Budget data is verified static data from City Budget Office documents.
      const { budgetData } = await import("@/data/general-fund-budget");
      const sections: string[] = [
        `# Portland General Fund Budget — ${budgetData.fiscalYear}`,
        `# Source: ${budgetData.dataSource} (verified ${budgetData.lastVerified})`,
        "\n# Revenue Sources",
        rowsToCsv(budgetData.generalFund.revenueSources as unknown as QueryResult),
        "\n# Bureau Allocations",
        rowsToCsv(budgetData.generalFund.bureaus as unknown as QueryResult),
        "\n# Cash Transfers",
        rowsToCsv(budgetData.generalFund.cashTransfers as unknown as QueryResult),
        "\n# Five-Year Forecast",
        rowsToCsv(budgetData.fiveYearForecast as unknown as QueryResult),
        "\n# Restricted Funds (All-Funds Budget)",
        rowsToCsv(budgetData.fullBudget.restrictedFunds as unknown as QueryResult),
      ];
      return { rows: [], note: sections.join("\n") };
    }

    case "environment":
    case "climate": {
      const trajectory = await sql`SELECT * FROM climate_emissions_trajectory LIMIT ${ROW_LIMIT}`;
      const actions = await sql`SELECT * FROM climate_workplan_actions LIMIT ${ROW_LIMIT}`;

      const sections: string[] = [];
      if (trajectory.length > 0) {
        sections.push("# Emissions Trajectory (Multnomah County)");
        sections.push(rowsToCsv(trajectory as unknown as QueryResult));
      }
      if (actions.length > 0) {
        sections.push("\n# Climate Emergency Workplan Actions");
        sections.push(rowsToCsv(actions as unknown as QueryResult));
      }
      return { rows: [], note: sections.join("\n") };
    }

    case "economic-health": {
      const metros = await sql`SELECT * FROM metro_metadata LIMIT ${ROW_LIMIT}`;
      const unemployment = await sql`
        SELECT * FROM metro_unemployment_monthly ORDER BY metro_code, year, month LIMIT ${ROW_LIMIT}
      `;
      const employment = await sql`
        SELECT * FROM metro_employment_quarterly ORDER BY metro_code, year, quarter LIMIT ${ROW_LIMIT}
      `;
      const homeValues = await sql`
        SELECT * FROM metro_zhvi_monthly ORDER BY metro_code, month LIMIT ${ROW_LIMIT}
      `;

      const sections: string[] = [];
      if (metros.length > 0) {
        sections.push("# Peer Metros");
        sections.push(rowsToCsv(metros as unknown as QueryResult));
      }
      if (unemployment.length > 0) {
        sections.push("\n# Unemployment (Monthly, BLS LAUS)");
        sections.push(rowsToCsv(unemployment as unknown as QueryResult));
      }
      if (employment.length > 0) {
        sections.push("\n# Employment & Wages (Quarterly, BLS QCEW)");
        sections.push(rowsToCsv(employment as unknown as QueryResult));
      }
      if (homeValues.length > 0) {
        sections.push("\n# Home Values (Monthly, Zillow ZHVI)");
        sections.push(rowsToCsv(homeValues as unknown as QueryResult));
      }
      return { rows: [], note: sections.join("\n") };
    }

    default:
      return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ question: string }> }
) {
  const { question } = await params;

  if (!checkRateLimit(`export:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many exports. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const result = await queryCategory(question);

    if (!result) {
      return NextResponse.json(
        { error: `Unknown category: ${question}` },
        { status: 404 }
      );
    }

    // If the query function returned a pre-built CSV string (multi-table categories)
    if (result.note && result.rows.length === 0) {
      return csvResponse(result.note, question);
    }

    // Single-table result
    const csv = rowsToCsv(result.rows);
    if (!csv) {
      return csvResponse("No data available for this category.\n", question);
    }

    return csvResponse(csv, question);
  } catch (error) {
    console.error(`[export] Failed to export ${question}:`, error);
    return NextResponse.json(
      { error: "Export failed. The database may be temporarily unavailable." },
      { status: 500 }
    );
  }
}
