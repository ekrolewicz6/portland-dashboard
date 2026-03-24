import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Query all available tables in parallel, each wrapped in try/catch
    const [pitRows, shelterRows, placementRows, odRows, shsRows] =
      await Promise.all([
        sql`
          SELECT year, total_homeless, sheltered, unsheltered,
                 chronically_homeless, veterans, families, unaccompanied_youth, source
          FROM homelessness.pit_counts
          ORDER BY year
        `.catch(() => []),
        sql`
          SELECT quarter, total_beds, utilization_rate, avg_length_of_stay_days,
                 pct_exits_to_housing
          FROM homelessness.shelter_capacity
          ORDER BY quarter DESC
          LIMIT 1
        `.catch(() => []),
        sql`
          SELECT fiscal_year, total_placements
          FROM homelessness.housing_placements
          ORDER BY fiscal_year DESC
          LIMIT 1
        `.catch(() => []),
        sql`
          SELECT year, total_deaths
          FROM homelessness.overdose_deaths
          ORDER BY year DESC
          LIMIT 1
        `.catch(() => []),
        sql`
          SELECT fiscal_year, total_revenue, psh_units_occupied
          FROM homelessness.shs_funding
          ORDER BY fiscal_year DESC
          LIMIT 1
        `.catch(() => []),
      ]);

    if (pitRows.length === 0) {
      return NextResponse.json({
        headline: "No homelessness data loaded yet",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        trend: { direction: "flat", percentage: 0, label: "no data" },
        chartData: [],
        source: "HUD Point-in-Time Count",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Homelessness data not yet available."],
      });
    }

    const latest = pitRows[pitRows.length - 1];
    const latestTotal = Number(latest.total_homeless);
    const latestYear = Number(latest.year);

    // Find previous PIT count for YoY comparison
    let yoyChange = 0;
    let yoyLabel = "year-over-year";
    let prevYear: number | null = null;
    if (pitRows.length >= 2) {
      const prev = pitRows[pitRows.length - 2];
      const prevTotal = Number(prev.total_homeless);
      prevYear = Number(prev.year);
      if (prevTotal > 0) {
        yoyChange = Math.round(
          ((latestTotal - prevTotal) / prevTotal) * 100,
        );
        yoyLabel = `up ${Math.abs(yoyChange)}% since ${prevYear}`;
      }
    }

    const trendDirection: "up" | "down" | "flat" =
      yoyChange > 1 ? "up" : yoyChange < -1 ? "down" : "flat";

    // Build rich headline
    const headline =
      `${latestTotal.toLocaleString()} people homeless in Multnomah County` +
      (prevYear ? ` — ${yoyLabel}` : "");

    const chartData = pitRows.map((r: Record<string, unknown>) => ({
      date: String(r.year),
      value: Number(r.total_homeless),
    }));

    // Build insights from all available data
    const insights: string[] = [];
    insights.push(
      `${latestTotal.toLocaleString()} total homeless counted in ${latestYear} PIT count (${Number(latest.sheltered).toLocaleString()} sheltered, ${Number(latest.unsheltered).toLocaleString()} unsheltered).`,
    );

    if (shelterRows.length > 0) {
      const s = shelterRows[0];
      insights.push(
        `${Number(s.total_beds).toLocaleString()} shelter beds at ${Number(s.utilization_rate)}% utilization (${s.quarter}).`,
      );
    }
    if (placementRows.length > 0) {
      insights.push(
        `${Number(placementRows[0].total_placements).toLocaleString()} housing placements in FY ${placementRows[0].fiscal_year}.`,
      );
    }
    if (odRows.length > 0) {
      insights.push(
        `${Number(odRows[0].total_deaths).toLocaleString()} overdose deaths in ${odRows[0].year}.`,
      );
    }
    if (shsRows.length > 0) {
      insights.push(
        `SHS revenue: $${(Number(shsRows[0].total_revenue) / 1e6).toFixed(0)}M (FY ${shsRows[0].fiscal_year}).`,
      );
    }

    return NextResponse.json({
      headline,
      headlineValue: latestTotal,
      dataStatus: "live",
      dataAvailable: true,
      trend: {
        direction: trendDirection,
        percentage: Math.abs(yoyChange),
        label: yoyLabel,
      },
      chartData,
      source: "HUD PIT Count · JOHS · Metro SHS · Multnomah County Health",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    });
  } catch (error) {
    console.error("[homelessness] DB query failed:", error);
    return NextResponse.json({
      headline: "Homelessness data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      source: "HUD Point-in-Time Count",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection failed. Homelessness data is temporarily unavailable.",
      ],
    });
  }
}
