import { NextResponse } from "next/server";
import type { BusinessData } from "@/lib/types";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface QuarterlyRow {
  quarter: string;
  cnt: number;
}

interface YearlyRow {
  yr: number;
  cnt: number;
}

interface TotalRow {
  total: number;
}

interface TopEntityRow {
  entity_type: string;
  cnt: number;
}

export async function GET(): Promise<
  NextResponse<BusinessData & { dataStatus: string; dataAvailable: boolean }>
> {
  try {
    const [totalRows, yearlyRows, quarterlyRows, topEntityRows] =
      await Promise.all([
        sql<TotalRow[]>`
          SELECT count(*)::int as total FROM business.oregon_sos_all_active
        `,
        sql<YearlyRow[]>`
          SELECT EXTRACT(YEAR FROM registry_date)::int as yr, count(*)::int as cnt
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<QuarterlyRow[]>`
          SELECT date_trunc('quarter', registry_date)::date::text as quarter, count(*)::int as cnt
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01' AND registry_date < '2026-04-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<TopEntityRow[]>`
          SELECT entity_type, count(*)::int as cnt
          FROM business.oregon_sos_all_active
          GROUP BY 1 ORDER BY cnt DESC LIMIT 1
        `,
      ]);

    const totalActive = totalRows[0]?.total ?? 0;
    const sortedYears = [...yearlyRows].sort((a, b) => a.yr - b.yr);
    const firstYear = sortedYears.find((y) => y.yr === 2016);
    const lastYear = sortedYears.find((y) => y.yr === 2025);

    const growthMultiple =
      firstYear && lastYear && firstYear.cnt > 0
        ? Math.round((lastYear.cnt / firstYear.cnt) * 10) / 10
        : 0;

    // Trend: compare latest two full years
    const prev = sortedYears.find((y) => y.yr === 2024);
    const curr = sortedYears.find((y) => y.yr === 2025);
    let trendDir: "up" | "down" | "flat" = "flat";
    let trendPct = 0;
    let trendLabel = "no trend data";
    if (prev && curr && prev.cnt > 0) {
      trendPct =
        Math.round(((curr.cnt - prev.cnt) / prev.cnt) * 1000) / 10;
      trendDir = trendPct > 1 ? "up" : trendPct < -1 ? "down" : "flat";
      trendLabel = `${prev.yr} to ${curr.yr}`;
    }

    // Chart data: quarterly totals
    const chartData = quarterlyRows.map((r) => ({
      date: r.quarter,
      value: r.cnt,
      label: r.quarter,
    }));

    // Insights
    const insights: string[] = [];
    insights.push(
      `${totalActive.toLocaleString()} active businesses registered in Portland via Oregon Secretary of State.`
    );
    if (firstYear && lastYear) {
      insights.push(
        `New registrations grew ${growthMultiple}x from ${firstYear.cnt.toLocaleString()} in 2016 to ${lastYear.cnt.toLocaleString()} in 2025.`
      );
    }
    if (topEntityRows.length > 0) {
      const topPct =
        totalActive > 0
          ? Math.round((topEntityRows[0].cnt / totalActive) * 100)
          : 0;
      const label = topEntityRows[0].entity_type.toLowerCase().includes("limited liability")
        ? "LLCs"
        : topEntityRows[0].entity_type;
      insights.push(`${label} account for ${topPct}% of all registrations.`);
    }

    return NextResponse.json({
      headline: `${totalActive.toLocaleString()} active businesses — up ${growthMultiple}x since 2016`,
      headlineValue: totalActive,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "Oregon Secretary of State Business Registry",
          status: "connected" as const,
          provider: "data.oregon.gov (Socrata)",
          action: `${totalActive.toLocaleString()} active Portland businesses`,
        },
      ],
      trend: {
        direction: trendDir,
        percentage: Math.abs(trendPct),
        label: trendLabel,
      },
      chartData,
      newRegistrations: [],
      cancelledRegistrations: [],
      civicAppsLicenses: [],
      source: "Oregon Secretary of State via data.oregon.gov",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  } catch (err) {
    console.error("Business API error:", err);
    return NextResponse.json({
      headline: "Business data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat" as const, percentage: 0, label: "error" },
      chartData: [],
      newRegistrations: [],
      cancelledRegistrations: [],
      civicAppsLicenses: [],
      source: "Database query failed",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection error. Check that PostgreSQL is running and tables are populated.",
      ],
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  }
}
