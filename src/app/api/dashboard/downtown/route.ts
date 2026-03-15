import { NextResponse } from "next/server";
import { downtownData } from "@/lib/mock-data";
import { queryFeatureService } from "@/lib/arcgis";
import type { DowntownData } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Data sources:
 *   - Foot traffic: Placer.ai (requires partnership) — MOCK
 *   - Graffiti reports: Public/BPS_Graffiti/FeatureServer (real)
 *   - Ground floor occupancy: mock
 *
 * The graffiti report count serves as a "visible disorder" metric for downtown vitality.
 */

interface GraffitiRow {
  REPORTED_DATE: number | null;
  STATUS: string | null;
  [key: string]: unknown;
}

function epochToYearMonth(epoch: number): string {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(): Promise<NextResponse<DowntownData>> {
  // Start with mock data as baseline (foot traffic, vacancy rate, dwell time are all mock)
  const result: DowntownData = { ...downtownData };

  try {
    const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    // Query graffiti reports from the last 12 months
    const graffitiReports = await queryFeatureService<GraffitiRow>(
      "Public/BPS_Graffiti/FeatureServer/0",
      {
        where: `REPORTED_DATE >= ${twelveMonthsAgo}`,
        outFields: "REPORTED_DATE,STATUS",
        returnGeometry: false,
        orderByFields: "REPORTED_DATE ASC",
      },
    );

    // Aggregate by month
    const monthlyGraffiti = new Map<string, number>();
    for (const row of graffitiReports) {
      if (!row.REPORTED_DATE) continue;
      const month = epochToYearMonth(row.REPORTED_DATE);
      monthlyGraffiti.set(month, (monthlyGraffiti.get(month) ?? 0) + 1);
    }

    const totalGraffiti = graffitiReports.length;

    // Update the result with real graffiti data
    result.source = "Placer.ai (mock) / BPS Graffiti Reports (real) / CoStar (mock)";
    result.lastUpdated = new Date().toISOString().slice(0, 10);
    result.insights = [
      ...downtownData.insights.slice(0, 2),
      `${totalGraffiti.toLocaleString()} graffiti reports filed in the last 12 months (visible disorder metric).`,
      `Monthly graffiti trend: ${[...monthlyGraffiti.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-3)
        .map(([m, c]) => `${m}: ${c}`)
        .join(", ")}.`,
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error("[downtown] ArcGIS graffiti query failed, returning full mock data:", error);
    return NextResponse.json(downtownData);
  }
}
