import { NextResponse } from "next/server";
import type { BusinessData } from "@/lib/types";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

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
    // Fetch QCEW establishment/employment data
    const qcewRows = await sql<QCEWRow[]>`
      SELECT measure, year, month, value::float as value, period_name
      FROM business.bls_employment
      ORDER BY year, month
    `;

    // Fetch Census CBP data (total establishments by year)
    const cbpRows = await sql<CBPRow[]>`
      SELECT year, establishments, size_label, size_code
      FROM business.census_cbp
      WHERE size_code = '001'
      ORDER BY year
    `;

    const hasData = qcewRows.length > 0 || cbpRows.length > 0;

    if (!hasData) {
      // Fall back to unavailable state
      return NextResponse.json({
        headline: "Business data not yet loaded — run fetch-business-data script",
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
        insights: ["Run: npx tsx scripts/fetch-business-data.ts to load real data."],
      } as unknown as BusinessData & {
        dataStatus: string;
        dataAvailable: boolean;
      });
    }

    // Build chart data from QCEW total establishments
    const totalEstabs = qcewRows.filter(
      (r) => r.measure === "total_establishments"
    );
    const privateEstabs = qcewRows.filter(
      (r) => r.measure === "private_establishments"
    );
    const totalEmployment = qcewRows.filter(
      (r) => r.measure === "total_employment"
    );
    const privateEmployment = qcewRows.filter(
      (r) => r.measure === "private_employment"
    );

    // Use private establishments for the main chart (most relevant for business formation)
    const estabSeries = privateEstabs.length > 0 ? privateEstabs : totalEstabs;

    const chartData = estabSeries.map((r) => ({
      date: `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      value: r.value,
      label: `${r.period_name} ${r.year}`,
    }));

    // Census CBP annual data as secondary chart
    const annualChartData = cbpRows.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.establishments,
      label: `${r.year} (annual)`,
    }));

    // Calculate trend from establishment data
    let trend: { direction: "up" | "down" | "flat"; percentage: number; label: string } = {
      direction: "flat",
      percentage: 0,
      label: "no trend data",
    };

    if (estabSeries.length >= 2) {
      const latest = estabSeries[estabSeries.length - 1];
      const previous = estabSeries[estabSeries.length - 2];
      const change = ((latest.value - previous.value) / previous.value) * 100;
      trend = {
        direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
        percentage: Math.round(Math.abs(change) * 10) / 10,
        label: `vs ${previous.period_name} ${previous.year}`,
      };
    } else if (cbpRows.length >= 2) {
      const latest = cbpRows[cbpRows.length - 1];
      const previous = cbpRows[cbpRows.length - 2];
      const change =
        ((latest.establishments - previous.establishments) /
          previous.establishments) *
        100;
      trend = {
        direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
        percentage: Math.round(Math.abs(change) * 10) / 10,
        label: `${previous.year} to ${latest.year}`,
      };
    }

    // Build headline from latest data
    const latestEstab =
      estabSeries.length > 0
        ? estabSeries[estabSeries.length - 1]
        : null;
    const latestCBP =
      cbpRows.length > 0 ? cbpRows[cbpRows.length - 1] : null;

    const headlineValue = latestEstab?.value ?? latestCBP?.establishments ?? 0;
    const headlineLabel = latestEstab
      ? `${latestEstab.period_name} ${latestEstab.year}`
      : latestCBP
        ? `${latestCBP.year} annual`
        : "";

    // Build employment chart for "new registrations" slot
    const emplSeries =
      privateEmployment.length > 0 ? privateEmployment : totalEmployment;
    const employmentChart = emplSeries.map((r) => ({
      date: `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      value: r.value,
      label: `${r.period_name} ${r.year}`,
    }));

    // Build insights
    const insights: string[] = [];

    if (latestEstab) {
      insights.push(
        `Multnomah County had ${latestEstab.value.toLocaleString()} private establishments in ${latestEstab.period_name} ${latestEstab.year} (QCEW).`
      );
    }
    if (latestCBP) {
      insights.push(
        `Census County Business Patterns: ${latestCBP.establishments.toLocaleString()} total establishments in ${latestCBP.year}.`
      );
    }
    if (emplSeries.length > 0) {
      const latestEmpl = emplSeries[emplSeries.length - 1];
      insights.push(
        `${latestEmpl.measure === "private_employment" ? "Private" : "Total"} employment: ${latestEmpl.value.toLocaleString()} in ${latestEmpl.period_name} ${latestEmpl.year}.`
      );
    }
    if (cbpRows.length >= 2) {
      const first = cbpRows[0];
      const last = cbpRows[cbpRows.length - 1];
      const netChange = last.establishments - first.establishments;
      insights.push(
        `Net change in establishments ${first.year}–${last.year}: ${netChange > 0 ? "+" : ""}${netChange.toLocaleString()}.`
      );
    }

    return NextResponse.json({
      headline: `${headlineValue.toLocaleString()} establishments in Multnomah County (${headlineLabel})`,
      headlineValue,
      dataStatus: "available",
      dataAvailable: true,
      dataSources: [
        {
          name: "BLS Quarterly Census of Employment and Wages",
          status: "connected",
          provider: "Bureau of Labor Statistics",
          action: "Quarterly establishment and employment counts for Multnomah County (FIPS 41051)",
        },
        {
          name: "Census County Business Patterns",
          status: "connected",
          provider: "U.S. Census Bureau",
          action: "Annual establishment counts by employee size class (2018–2022)",
        },
      ],
      trend,
      chartData: chartData.length > 0 ? chartData : annualChartData,
      newRegistrations: employmentChart, // employment data in this slot
      cancelledRegistrations: [], // no cancellation data from these sources
      civicAppsLicenses: annualChartData, // CBP annual data
      source:
        "BLS QCEW (Multnomah County FIPS 41051) + Census County Business Patterns",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    } as unknown as BusinessData & {
      dataStatus: string;
      dataAvailable: boolean;
    });
  } catch (err) {
    console.error("Business API error:", err);
    // If DB query fails, return unavailable status
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
