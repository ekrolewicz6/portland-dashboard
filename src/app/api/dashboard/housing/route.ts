import { NextResponse } from "next/server";
import { housingData } from "@/lib/mock-data";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { HousingData, ChartPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "housing";

export async function GET(): Promise<NextResponse<HousingData>> {
  try {
    // Check cache first
    const cached = await getCachedData<HousingData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Query total permits and average processing days
    const summaryRows = await sql`
      SELECT
        count(*) as total,
        avg(processing_days) as avg_days
      FROM housing.permits
      WHERE status IN ('Final', 'Issued')
    `;

    if (!summaryRows || summaryRows.length === 0 || Number(summaryRows[0].total) === 0) {
      console.warn("[housing] No permit data in DB, returning mock data");
      return NextResponse.json(housingData);
    }

    const totalPermits = Number(summaryRows[0].total);
    const avgDays = Math.round(Number(summaryRows[0].avg_days) || 0);

    // Build monthly pipeline
    const monthlyRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') as date,
        count(*) as count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const permitPipeline: ChartPoint[] = monthlyRows.map((row) => ({
      date: row.date as string,
      value: Number(row.count),
      label: "Permits filed",
    }));

    // Build monthly processing days
    const processingRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') as date,
        avg(processing_days) as avg_days
      FROM housing.permits
      WHERE issued_date IS NOT NULL AND processing_days IS NOT NULL
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const processingDays: ChartPoint[] = processingRows.map((row) => ({
      date: row.date as string,
      value: Math.round(Number(row.avg_days)),
      label: "Avg days to issue",
    }));

    const chartData = permitPipeline.map(({ date, value }) => ({
      date,
      value,
    }));

    const result: HousingData = {
      headline: `${totalPermits.toLocaleString()} permits issued/finalized, avg ${avgDays} days to process`,
      headlineValue: totalPermits,
      trend: housingData.trend, // keep mock trend until prior-year comparison
      chartData: chartData.length > 0 ? chartData : housingData.chartData,
      permitPipeline:
        permitPipeline.length > 0 ? permitPipeline : housingData.permitPipeline,
      processingDays:
        processingDays.length > 0
          ? processingDays
          : housingData.processingDays,
      medianRent: housingData.medianRent, // rent data not in local DB
      source: "BDS PermitsNow (local DB) / Zillow ZORI (mock)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalPermits} permits with status Issued or Final in the database.`,
        `Average processing time: ${avgDays} days from application to issuance.`,
        "Median rent data still uses mock values — Zillow ZORI integration pending.",
        `Monthly pipeline covers ${permitPipeline.length} months of data.`,
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[housing] DB query failed, returning mock data:", error);
    return NextResponse.json(housingData);
  }
}
