import { NextResponse } from "next/server";
import type { BusinessData } from "@/lib/types";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface YearlyRow {
  year: number;
  reg_count: number;
}

interface EntityTypeRow {
  entity_type: string;
  count: number;
}

interface StatsRow {
  key: string;
  value: number;
}

interface NewBizRow {
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
}

interface QCEWRow {
  measure: string;
  year: number;
  month: number;
  value: number;
  period_name: string;
}

interface CBPRow {
  year: number;
  establishments: number;
  size_label: string;
  size_code: string;
}

export async function GET(): Promise<
  NextResponse<BusinessData & { dataStatus: string; dataAvailable: boolean }>
> {
  try {
    // ── Oregon SOS data (primary) ──
    const [statsRows, yearlyRows, entityRows, newBizRows] = await Promise.all([
      sql<StatsRow[]>`
        SELECT key, value::int as value FROM business.oregon_sos_stats
      `.catch(() => [] as StatsRow[]),
      sql<YearlyRow[]>`
        SELECT year, reg_count FROM business.oregon_sos_yearly ORDER BY year
      `.catch(() => [] as YearlyRow[]),
      sql<EntityTypeRow[]>`
        SELECT entity_type, count FROM business.oregon_sos_entity_types ORDER BY count DESC LIMIT 10
      `.catch(() => [] as EntityTypeRow[]),
      sql<NewBizRow[]>`
        SELECT registry_number, business_name, entity_type, registry_date::text
        FROM business.oregon_sos_new_monthly
        ORDER BY registry_date DESC LIMIT 200
      `.catch(() => [] as NewBizRow[]),
    ]);

    const hasOregonData = yearlyRows.length > 0 || statsRows.length > 0;

    // ── BLS/Census data (secondary, if available) ──
    // Query new BLS employment table (Portland MSA unemployment rate from BLS API)
    const blsUnemploymentRows = await sql<{ year: number; period_name: string; value: number }[]>`
      SELECT year, period_name, value::float as value
      FROM business.bls_employment
      WHERE series_id = 'LAUMT413890000000003'
        AND period != 'M13'
      ORDER BY year DESC, period DESC
      LIMIT 24
    `.catch(() => [] as { year: number; period_name: string; value: number }[]);

    const [qcewRows, cbpRows, blsSeriesRows] = await Promise.all([
      sql<QCEWRow[]>`
        SELECT measure, year, month, value::float as value, period_name
        FROM business.bls_employment_series
        WHERE measure IS NOT NULL
        ORDER BY year, month
      `.catch(() => [] as QCEWRow[]),
      sql<CBPRow[]>`
        SELECT year, establishments, size_label, size_code
        FROM business.census_cbp
        WHERE size_code = '001'
        ORDER BY year
      `.catch(() => [] as CBPRow[]),
      sql<{ series_name: string; year: number; period: string; value: number }[]>`
        SELECT series_name, year, period, value::float as value
        FROM business.bls_employment_series
        WHERE series_name IN ('Total Nonfarm', 'Portland MSA Unemployment Rate')
        ORDER BY year, period
      `.catch(() => [] as { series_name: string; year: number; period: string; value: number }[]),
    ]);

    const hasAnyData = hasOregonData || qcewRows.length > 0 || cbpRows.length > 0 || blsSeriesRows.length > 0 || blsUnemploymentRows.length > 0;

    if (!hasAnyData) {
      return NextResponse.json({
        headline: "Business data not yet loaded — run fetch scripts",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [],
        trend: { direction: "flat" as const, percentage: 0, label: "no data" },
        chartData: [],
        newRegistrations: [],
        cancelledRegistrations: [],
        civicAppsLicenses: [],
        source: "No data loaded",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: [
          "Run: npx tsx scripts/fetch-oregon-businesses.ts to load Oregon SOS data.",
          "Run: npx tsx scripts/fetch-business-data.ts to load BLS/Census data.",
        ],
      } as unknown as BusinessData & {
        dataStatus: string;
        dataAvailable: boolean;
      });
    }

    // ── Build response from Oregon SOS data ──
    const totalActive = statsRows.find((r) => r.key === "total_portland_active")?.value ?? 0;
    const newMonthlyCount = statsRows.find((r) => r.key === "new_monthly_count")?.value ?? 0;

    // Chart data: business registrations by year
    const chartData = yearlyRows.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.reg_count,
      label: `${r.year}`,
    }));

    // New registrations chart from new monthly data
    const newRegistrations = newBizRows.map((r) => ({
      date: r.registry_date ?? "",
      value: 1,
      label: `${r.business_name} (${r.entity_type})`,
    }));

    // Entity type breakdown as chart
    const entityChart = entityRows.map((r) => ({
      date: r.entity_type,
      value: r.count,
      label: r.entity_type,
    }));

    // Trend: compare last two full years
    const fullYears = yearlyRows.filter((r) => r.year >= 2020 && r.year <= 2025);
    let trend: { direction: "up" | "down" | "flat"; percentage: number; label: string } = {
      direction: "flat",
      percentage: 0,
      label: "no trend data",
    };

    if (fullYears.length >= 2) {
      const sorted = [...fullYears].sort((a, b) => b.year - a.year);
      const latest = sorted[0];
      const previous = sorted[1];
      const change = ((latest.reg_count - previous.reg_count) / previous.reg_count) * 100;
      trend = {
        direction: change > 1 ? "up" : change < -1 ? "down" : "flat",
        percentage: Math.round(Math.abs(change) * 10) / 10,
        label: `${previous.year} to ${latest.year}`,
      };
    }

    // Build insights
    const insights: string[] = [];

    if (totalActive > 0) {
      insights.push(
        `${totalActive.toLocaleString()} active businesses registered with the Oregon Secretary of State in Portland.`
      );
    }
    if (newMonthlyCount > 0) {
      insights.push(
        `${newMonthlyCount.toLocaleString()} new business registrations in the most recent month.`
      );
    }
    if (entityRows.length > 0) {
      const topType = entityRows[0];
      const pct = totalActive > 0 ? Math.round((topType.count / totalActive) * 100) : 0;
      insights.push(
        `${topType.entity_type}: ${topType.count.toLocaleString()} (${pct}% of all Portland businesses).`
      );
    }
    if (fullYears.length >= 2) {
      const sorted = [...fullYears].sort((a, b) => b.year - a.year);
      insights.push(
        `Business registrations grew from ${sorted[1].reg_count.toLocaleString()} in ${sorted[1].year} to ${sorted[0].reg_count.toLocaleString()} in ${sorted[0].year}.`
      );
    }

    // Add BLS insights if available
    const privateEstabs = qcewRows.filter((r) => r.measure === "private_establishments");
    if (privateEstabs.length > 0) {
      const latest = privateEstabs[privateEstabs.length - 1];
      insights.push(
        `BLS QCEW: ${latest.value.toLocaleString()} private establishments in Multnomah County (${latest.period_name} ${latest.year}).`
      );
    }
    if (cbpRows.length > 0) {
      const latest = cbpRows[cbpRows.length - 1];
      insights.push(
        `Census CBP: ${latest.establishments.toLocaleString()} total establishments in ${latest.year}.`
      );
    }

    // BLS Employment Series insights
    const nonfarmRows = blsSeriesRows.filter((r) => r.series_name === "Total Nonfarm");
    if (nonfarmRows.length > 0) {
      const latest = nonfarmRows[nonfarmRows.length - 1];
      insights.push(
        `BLS: Portland MSA total nonfarm employment: ${latest.value.toLocaleString()}K (${latest.period} ${latest.year}).`
      );
    }
    const unempRows = blsSeriesRows.filter((r) => r.series_name === "Portland MSA Unemployment Rate");
    if (unempRows.length > 0) {
      const latest = unempRows[unempRows.length - 1];
      insights.push(
        `BLS: Portland MSA unemployment rate: ${latest.value}% (${latest.period} ${latest.year}).`
      );
    }

    // New BLS API unemployment data
    if (blsUnemploymentRows.length > 0 && unempRows.length === 0) {
      const latest = blsUnemploymentRows[0];
      insights.push(
        `BLS: Portland MSA unemployment rate: ${latest.value}% (${latest.period_name} ${latest.year}).`
      );
    }

    // Data sources
    const dataSources = [
      {
        name: "Oregon Secretary of State Business Registry",
        status: "connected" as const,
        provider: "data.oregon.gov (Socrata)",
        action: `${totalActive.toLocaleString()} active Portland businesses (datasets tckn-sxa6 + esjy-u4fc)`,
      },
    ];
    if (qcewRows.length > 0) {
      dataSources.push({
        name: "BLS Quarterly Census of Employment and Wages",
        status: "connected" as const,
        provider: "Bureau of Labor Statistics",
        action: "Quarterly establishment and employment counts for Multnomah County",
      });
    }
    if (cbpRows.length > 0) {
      dataSources.push({
        name: "Census County Business Patterns",
        status: "connected" as const,
        provider: "U.S. Census Bureau",
        action: "Annual establishment counts by employee size class",
      });
    }
    if (blsSeriesRows.length > 0) {
      dataSources.push({
        name: "BLS Current Employment Statistics",
        status: "connected" as const,
        provider: "Bureau of Labor Statistics",
        action: `${blsSeriesRows.length} monthly employment data points for Portland MSA`,
      });
    }
    if (blsUnemploymentRows.length > 0) {
      dataSources.push({
        name: "BLS Local Area Unemployment",
        status: "connected" as const,
        provider: "Bureau of Labor Statistics API",
        action: `${blsUnemploymentRows.length} monthly unemployment data points for Portland MSA (2019-2025)`,
      });
    }

    return NextResponse.json({
      headline: `${totalActive.toLocaleString()} active businesses in Portland (Oregon SOS)`,
      headlineValue: totalActive,
      dataStatus: "available",
      dataAvailable: true,
      dataSources,
      trend,
      chartData,
      newRegistrations,
      cancelledRegistrations: entityChart, // entity type breakdown in this slot
      civicAppsLicenses: cbpRows.map((r) => ({
        date: `${r.year}-01-01`,
        value: r.establishments,
        label: `${r.year} (Census CBP)`,
      })),
      source: "Oregon Secretary of State via data.oregon.gov + BLS QCEW + Census CBP",
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
      insights: ["Database connection error. Check that PostgreSQL is running and tables are populated."],
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  }
}
