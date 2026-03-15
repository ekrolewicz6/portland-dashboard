import { NextResponse } from "next/server";
import { housingData } from "@/lib/mock-data";
import { queryFeatureService } from "@/lib/arcgis";
import type { HousingData, ChartPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Real data sources:
 *   - Public/BDS_Permit/FeatureServer/22  (All Permits)
 *     Fields: APPLICATION_DATE, ISSUED_DATE, TYPE, STATUS, WORK_DESCRIPTION, etc.
 *   - Public/BDS_Metric/FeatureServer     (Permit processing metrics — supplementary)
 *
 * We filter for residential construction + addition/alteration permits,
 * compute average processing time, and build a monthly trend.
 */

interface PermitRow {
  APPLICATION_DATE: number | null; // epoch ms
  ISSUED_DATE: number | null;      // epoch ms
  STATUS: string;
  TYPE: string;
  WORK_DESCRIPTION: string | null;
  [key: string]: unknown;
}

function epochToYearMonth(epoch: number): string {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(): Promise<NextResponse<HousingData>> {
  try {
    const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    // Query residential permits from the last 12 months
    const permits = await queryFeatureService<PermitRow>(
      "Public/BDS_Permit/FeatureServer/22",
      {
        where: `APPLICATION_DATE >= ${twelveMonthsAgo} AND (TYPE LIKE '%RESIDENTIAL%' OR TYPE LIKE '%ADDITION%' OR TYPE LIKE '%ALTERATION%' OR TYPE LIKE '%NEW CONSTRUCTION%')`,
        outFields: "APPLICATION_DATE,ISSUED_DATE,STATUS,TYPE,WORK_DESCRIPTION",
        returnGeometry: false,
        orderByFields: "APPLICATION_DATE ASC",
      },
    );

    // Calculate processing times and monthly pipeline
    const monthlyMap = new Map<string, { count: number; totalDays: number; issuedCount: number }>();

    for (const p of permits) {
      if (!p.APPLICATION_DATE) continue;
      const month = epochToYearMonth(p.APPLICATION_DATE);
      const entry = monthlyMap.get(month) ?? { count: 0, totalDays: 0, issuedCount: 0 };
      entry.count++;

      if (p.APPLICATION_DATE && p.ISSUED_DATE && p.ISSUED_DATE > p.APPLICATION_DATE) {
        const days = Math.round(
          (p.ISSUED_DATE - p.APPLICATION_DATE) / (1000 * 60 * 60 * 24),
        );
        entry.totalDays += days;
        entry.issuedCount++;
      }

      monthlyMap.set(month, entry);
    }

    const sortedMonths = [...monthlyMap.keys()].sort();

    const permitPipeline: ChartPoint[] = sortedMonths.map((date) => ({
      date,
      value: monthlyMap.get(date)!.count,
      label: "Permits filed",
    }));

    const processingDays: ChartPoint[] = sortedMonths.map((date) => {
      const entry = monthlyMap.get(date)!;
      const avg = entry.issuedCount > 0 ? Math.round(entry.totalDays / entry.issuedCount) : 0;
      return { date, value: avg, label: "Avg days to issue" };
    });

    const totalPermits = permits.length;
    const totalDays = [...monthlyMap.values()].reduce((s, e) => s + e.totalDays, 0);
    const totalIssued = [...monthlyMap.values()].reduce((s, e) => s + e.issuedCount, 0);
    const avgDays = totalIssued > 0 ? Math.round(totalDays / totalIssued) : 0;

    const result: HousingData = {
      headline: `${totalPermits.toLocaleString()} residential permits filed (TTM), avg ${avgDays} days to issue`,
      headlineValue: totalPermits,
      trend: housingData.trend, // keep mock trend until we have prior-year comparison
      chartData: permitPipeline.map(({ date, value }) => ({ date, value })),
      permitPipeline,
      processingDays,
      medianRent: housingData.medianRent, // rent data not available from ArcGIS
      source: "BDS PermitsNow ArcGIS / Zillow ZORI (mock)",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalPermits} residential permits filed in the trailing 12 months.`,
        `Average processing time: ${avgDays} days from application to issuance.`,
        "Median rent data still uses mock values — Zillow ZORI integration pending.",
        `${totalIssued} of ${totalPermits} permits have been issued.`,
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[housing] ArcGIS query failed, returning mock data:", error);
    return NextResponse.json(housingData);
  }
}
