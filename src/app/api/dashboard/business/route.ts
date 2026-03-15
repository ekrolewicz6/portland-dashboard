import { NextResponse } from "next/server";
import { businessData } from "@/lib/mock-data";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { BusinessData, ChartPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "business";

export async function GET(): Promise<NextResponse<BusinessData>> {
  try {
    // Check cache first
    const cached = await getCachedData<BusinessData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Query monthly new business licenses
    const monthlyRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', date_added), 'YYYY-MM') as date,
        count(*) as count
      FROM business.civicapps_licenses
      WHERE date_added IS NOT NULL
      GROUP BY date_trunc('month', date_added)
      ORDER BY date_trunc('month', date_added)
    `;

    if (!monthlyRows || monthlyRows.length === 0) {
      console.warn("[business] No license data in DB, returning mock data");
      return NextResponse.json(businessData);
    }

    const newRegistrations: ChartPoint[] = monthlyRows.map((row) => ({
      date: row.date as string,
      value: Number(row.count),
      label: "New registrations",
    }));

    // Get total count
    const totalRows = await sql`
      SELECT count(*) as total FROM business.civicapps_licenses
    `;
    const totalNew = Number(totalRows[0].total);

    // Get top ZIP codes for insights
    const zipRows = await sql`
      SELECT zip_code, count(*) as count
      FROM business.civicapps_licenses
      WHERE zip_code IS NOT NULL
      GROUP BY zip_code
      ORDER BY count(*) DESC
      LIMIT 3
    `;

    const chartData = newRegistrations.map(({ date, value }) => ({
      date,
      value,
    }));

    const result: BusinessData = {
      headline: `${totalNew.toLocaleString()} business licenses in database`,
      headlineValue: totalNew,
      trend: businessData.trend, // keep mock trend until YoY computation
      chartData: chartData.length > 0 ? chartData : businessData.chartData,
      newRegistrations,
      cancelledRegistrations: businessData.cancelledRegistrations, // not available from civicapps
      civicAppsLicenses: newRegistrations,
      source: "CivicApps Business Licenses (local DB)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalNew} business licenses stored locally.`,
        `Data spans ${newRegistrations.length} months.`,
        `Top ZIP codes: ${zipRows
          .map((r) => `${r.zip_code} (${r.count})`)
          .join(", ")}.`,
        "Cancellation data not available — using mock values.",
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[business] DB query failed, returning mock data:", error);
    return NextResponse.json(businessData);
  }
}
