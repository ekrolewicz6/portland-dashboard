import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { DowntownData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "downtown";

export async function GET(): Promise<NextResponse<DowntownData & { dataStatus: string }>> {
  try {
    // Check cache first
    const cached = await getCachedData<DowntownData & { dataStatus: string }>(CACHE_KEY);
    if (cached) return NextResponse.json(withFreshness(cached));

    // Real data: graffiti reports from Portland BPS
    const graffitiRows = await sql`
      SELECT count
      FROM safety.graffiti_monthly
      ORDER BY month DESC
      LIMIT 1
    `;

    const monthlyGraffiti = await sql`
      SELECT TO_CHAR(month, 'YYYY-MM') as date, count
      FROM safety.graffiti_monthly
      ORDER BY month
    `;

    const latestGraffiti = graffitiRows.length > 0 ? Number(graffitiRows[0].count) : 0;
    const totalGraffiti = monthlyGraffiti.length > 0
      ? monthlyGraffiti.reduce((s, r) => s + Number(r.count), 0)
      : 0;

    const graffitiChartData = monthlyGraffiti.map((r) => ({
      date: r.date as string,
      value: Number(r.count),
    }));

    // Real data: TriMet transit from downtown.trimet_routes and downtown.trimet_stops
    let trimetSummary: { routes: number; stops: number; routesByType: Record<string, number> } | null = null;
    try {
      const routeCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_routes`;
      const stopCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_stops`;
      const routeTypes = await sql`
        SELECT route_type_name, count(*)::int as cnt
        FROM downtown.trimet_routes
        GROUP BY route_type_name
        ORDER BY cnt DESC
      `;
      const routesByType: Record<string, number> = {};
      for (const r of routeTypes) {
        routesByType[r.route_type_name as string] = Number(r.cnt);
      }
      trimetSummary = {
        routes: Number(routeCount[0].cnt),
        stops: Number(stopCount[0].cnt),
        routesByType,
      };
    } catch {
      // TriMet tables may not exist yet
    }

    // Real data: commercial vacancy from downtown.vacancy_real
    let latestVacancy: { office: number | null; retail: number | null; quarter: string } | null = null;
    let vacancyChartData: { date: string; value: number; label?: string }[] = [];

    try {
      const latestRow = await sql`
        SELECT
          TO_CHAR(quarter, 'YYYY-"Q"Q') AS quarter,
          office_vacancy_pct::float,
          retail_vacancy_pct::float
        FROM downtown.vacancy_real
        WHERE source NOT LIKE 'FRED_%'
          AND office_vacancy_pct IS NOT NULL
        ORDER BY quarter DESC
        LIMIT 1
      `;

      if (latestRow.length > 0) {
        latestVacancy = {
          office: latestRow[0].office_vacancy_pct != null ? Number(latestRow[0].office_vacancy_pct) : null,
          retail: latestRow[0].retail_vacancy_pct != null ? Number(latestRow[0].retail_vacancy_pct) : null,
          quarter: latestRow[0].quarter as string,
        };
      }

      const vacancyRows = await sql`
        SELECT
          TO_CHAR(quarter, 'YYYY-MM') AS date,
          office_vacancy_pct::float AS value
        FROM downtown.vacancy_real
        WHERE source NOT LIKE 'FRED_%'
          AND office_vacancy_pct IS NOT NULL
        ORDER BY quarter
      `;

      vacancyChartData = vacancyRows.map((r) => ({
        date: r.date as string,
        value: Number(r.value),
        label: `Office vacancy: ${Number(r.value).toFixed(1)}%`,
      }));
    } catch {
      // downtown.vacancy_real may not exist yet
    }

    const insights: string[] = [];
    if (latestVacancy) {
      insights.push(
        `Portland metro office vacancy: ${latestVacancy.office?.toFixed(1)}% (${latestVacancy.quarter}). ` +
        `Pre-pandemic was ~10-11%. Peak was ~25% in late 2023.`
      );
      if (latestVacancy.retail != null) {
        insights.push(
          `Retail vacancy: ${latestVacancy.retail.toFixed(1)}% — ` +
          (latestVacancy.retail < 6 ? "near pre-pandemic levels." : "still elevated.")
        );
      }
    }
    if (totalGraffiti > 0) {
      insights.push(`${totalGraffiti.toLocaleString()} graffiti reports total from Portland BPS.`);
    }
    if (latestGraffiti > 0) {
      insights.push(`Latest month: ${latestGraffiti.toLocaleString()} graffiti reports.`);
    }
    if (trimetSummary) {
      insights.push(
        `TriMet operates ${trimetSummary.routes} routes across ${trimetSummary.stops.toLocaleString()} stops: ${Object.entries(trimetSummary.routesByType).map(([t, c]) => `${c} ${t}`).join(", ")}.`
      );
    }
    // Real foot traffic from Clean & Safe / Placer.ai published reports
    let footTrafficData: { date: string; value: number; label?: string }[] = [];
    let footTrafficInsight: string | null = null;
    try {
      const ftRows = await sql`
        SELECT TO_CHAR(month, 'YYYY-MM') AS date, visits, is_annual_total
        FROM downtown.foot_traffic
        ORDER BY month
      `;
      if (ftRows.length > 0) {
        footTrafficData = ftRows.map((r) => ({
          date: r.date as string,
          value: Number(r.visits),
          label: r.is_annual_total
            ? `${(Number(r.visits) / 1_000_000).toFixed(0)}M annual total`
            : `${(Number(r.visits) / 1_000_000).toFixed(1)}M monthly`,
        }));
        // Find 2019 annual and latest annual for recovery comparison
        const annual2019 = ftRows.find((r) => r.is_annual_total && (r.date as string).startsWith("2019"));
        const latestAnnual = [...ftRows].reverse().find((r) => r.is_annual_total);
        if (annual2019 && latestAnnual) {
          const recoveryPct = Math.round((Number(latestAnnual.visits) / Number(annual2019.visits)) * 100);
          const year = (latestAnnual.date as string).slice(0, 4);
          footTrafficInsight = `Downtown foot traffic: ${(Number(latestAnnual.visits) / 1_000_000).toFixed(0)}M visits (${year}), ${recoveryPct}% of pre-pandemic 2019 levels (${(Number(annual2019.visits) / 1_000_000).toFixed(0)}M). Saturday recovery: 88.6%.`;
        }
      }
    } catch {
      // downtown.foot_traffic may not exist yet
    }

    if (footTrafficInsight) {
      insights.push(footTrafficInsight);
    }

    // Real office vacancy from dedicated table
    let officeVacancyData: { quarter: string; vacancy_pct: number }[] = [];
    try {
      const ovRows = await sql`
        SELECT quarter, vacancy_pct::float
        FROM downtown.office_vacancy
        ORDER BY quarter_date
      `;
      if (ovRows.length > 0) {
        officeVacancyData = ovRows.map((r) => ({
          quarter: r.quarter as string,
          vacancy_pct: Number(r.vacancy_pct),
        }));
        const latest = ovRows[ovRows.length - 1];
        const peak = ovRows.reduce((max, r) => Number(r.vacancy_pct) > Number(max.vacancy_pct) ? r : max, ovRows[0]);
        insights.push(
          `Office vacancy: ${Number(latest.vacancy_pct).toFixed(1)}% (${latest.quarter}). ` +
          `Peak was ${Number(peak.vacancy_pct).toFixed(1)}% (${peak.quarter}).`
        );
      }
    } catch {
      // downtown.office_vacancy may not exist yet
    }

    const headlineValue = latestVacancy?.office ?? (trimetSummary
      ? trimetSummary.routes
      : totalGraffiti);

    // Compute trend from vacancy data
    let trendInfo: { direction: "up" | "down" | "flat"; percentage: number; label: string } = {
      direction: "flat" as const, percentage: 0, label: "no trend comparison available",
    };
    if (vacancyChartData.length >= 2) {
      const latest = vacancyChartData[vacancyChartData.length - 1].value;
      const previous = vacancyChartData[vacancyChartData.length - 2].value;
      const change = ((latest - previous) / previous) * 100;
      trendInfo = {
        direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
        percentage: Math.abs(Math.round(change * 10) / 10),
        label: change < 0
          ? `Office vacancy improved ${Math.abs(change).toFixed(1)}% vs prior quarter`
          : change > 0
            ? `Office vacancy rose ${change.toFixed(1)}% vs prior quarter`
            : "Office vacancy stable vs prior quarter",
      };
    }

    const headline = latestVacancy
      ? `Office vacancy ${latestVacancy.office?.toFixed(1)}% — ${latestVacancy.office! > 20 ? "elevated but improving" : "recovery underway"}`
      : trimetSummary
        ? `${trimetSummary.routes} TriMet routes, ${trimetSummary.stops.toLocaleString()} stops — real GTFS transit data`
        : latestGraffiti > 0
          ? `${totalGraffiti.toLocaleString()} graffiti reports tracked — disorder proxy metric`
          : "Downtown vitality data collection in progress";

    const result: DowntownData & { dataStatus: string } = {
      headline,
      headlineValue,
      dataStatus: latestVacancy ? "good" : "partial",
      trend: trendInfo,
      chartData: vacancyChartData.length > 0 ? vacancyChartData : graffitiChartData,
      footTraffic: footTrafficData, // Real data from Clean & Safe / Placer.ai published reports
      vacancyRate: vacancyChartData, // REAL data from CBRE/Colliers/JLL/Kidder Mathews quarterly reports
      dwellTime: [], // Needs Placer.ai subscription
      source: "Clean & Safe / Placer.ai · CBRE / Colliers / Kidder Mathews · TriMet GTFS · Portland BPS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(withFreshness(result));
  } catch (error) {
    console.error("[downtown] DB query failed:", error);
    return NextResponse.json({
      headline: "Downtown data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      footTraffic: [],
      vacancyRate: [],
      dwellTime: [],
      source: "Clean & Safe / Placer.ai · CBRE / Colliers / Kidder Mathews · TriMet GTFS · Portland BPS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Database connection failed. Downtown data is temporarily unavailable."],
    } as unknown as DowntownData & { dataStatus: string });
  }
}
