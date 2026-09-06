import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import type { BusinessData } from "@/lib/types";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "business";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

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

// Single round-trip query — see homelessness/detail for rationale.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'total', (
      SELECT count(DISTINCT registry_number)::int FROM business.oregon_sos_all_active
    ),
    'yearly', (
      SELECT COALESCE(json_agg(t ORDER BY yr), '[]'::json) FROM (
        SELECT EXTRACT(YEAR FROM registry_date)::int as yr, count(DISTINCT registry_number)::int as cnt
        FROM business.oregon_sos_all_active
        WHERE registry_date >= '2016-01-01'
        GROUP BY 1
      ) t
    ),
    'quarterly', (
      SELECT COALESCE(json_agg(t ORDER BY quarter), '[]'::json) FROM (
        SELECT date_trunc('quarter', registry_date)::date::text as quarter, count(DISTINCT registry_number)::int as cnt
        FROM business.oregon_sos_all_active
        WHERE registry_date >= '2016-01-01' AND registry_date < '2026-04-01'
        GROUP BY 1
      ) t
    ),
    'top_entity', (
      SELECT row_to_json(t) FROM (
        SELECT entity_type, count(DISTINCT registry_number)::int as cnt
        FROM business.oregon_sos_all_active
        GROUP BY 1 ORDER BY cnt DESC LIMIT 1
      ) t
    )
  ) AS payload
`;

export async function GET(): Promise<
  NextResponse<BusinessData & { dataStatus: string; dataAvailable: boolean }>
> {
  try {
    const cached = await getCachedData<BusinessData & { dataStatus: string; dataAvailable: boolean }>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(withFreshness(cached));

    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;
    const totalActive2 = Number(payload.total ?? 0);
    const yearlyRows = ((payload.yearly as YearlyRow[]) ?? []);
    const quarterlyRows = ((payload.quarterly as QuarterlyRow[]) ?? []);
    const topEntityRows: TopEntityRow[] = payload.top_entity
      ? [payload.top_entity as TopEntityRow]
      : [];

    const totalActive = totalActive2;
    const sortedYears = [...yearlyRows].sort((a, b) => a.yr - b.yr);
    const firstYear = sortedYears.find((y) => y.yr === 2016);
    const lastYear = sortedYears.find((y) => y.yr === 2025);

    // NOTE on the removed "up 6x since 2016" claim: oregon_sos_all_active is
    // the Oregon SOS "Active Businesses" snapshot. It contains only businesses
    // active TODAY, so counting registrations by year measures survivors of
    // each cohort, not historical registration volume. The 2016 cohort (4,943
    // still active) has lost a decade of closures that the 2025 cohort
    // (29,727) has not, which manufactured the "6x growth". No unbiased
    // historical series exists in this schema (oregon_sos_yearly is the same
    // active-only data counted by row), so the headline states only what the
    // snapshot supports.

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
      trendLabel = `still-active registrations, ${prev.yr} vs ${curr.yr} cohorts`;
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
        `Of today's active businesses, ${lastYear.cnt.toLocaleString()} first registered in 2025 versus ${firstYear.cnt.toLocaleString()} surviving from the 2016 cohort. The registry lists only currently active businesses, so older cohorts shrink as businesses close; this reflects survivorship, not registration growth.`
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

    const responseData = {
      headline: `${totalActive.toLocaleString()} active businesses registered in Portland`,
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
      source: "Oregon Secretary of State · Business Registry",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    };
    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (err) {
    console.error("Business API error:", err);
    return NextResponse.json(withFreshness({
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
      source: "Oregon Secretary of State · Business Registry",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Business data is not available right now.",
      ],
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    }));
  }
}
