import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Weekly foot traffic trend
    const footTrafficRows = await sql`
      SELECT week, pct_of_2019, day_of_week
      FROM public.downtown_foot_traffic
      ORDER BY week ASC
    `;

    // Quarterly vacancy trend
    const vacancyRows = await sql`
      SELECT quarter, office_vacancy_pct, retail_vacancy_pct
      FROM public.downtown_vacancy
      ORDER BY quarter ASC
    `;

    // Aggregate foot traffic to weekly averages for the trend chart
    const weekMap = new Map<string, { total: number; count: number }>();
    const weekdayTotals = { weekday: { total: 0, count: 0 }, weekend: { total: 0, count: 0 } };

    for (const r of footTrafficRows) {
      const week = String(r.week).slice(0, 10);
      const pct = Number(r.pct_of_2019);
      const day = String(r.day_of_week);

      const existing = weekMap.get(week) || { total: 0, count: 0 };
      existing.total += pct;
      existing.count += 1;
      weekMap.set(week, existing);

      const isWeekend = day === "Saturday" || day === "Sunday";
      if (isWeekend) {
        weekdayTotals.weekend.total += pct;
        weekdayTotals.weekend.count += 1;
      } else {
        weekdayTotals.weekday.total += pct;
        weekdayTotals.weekday.count += 1;
      }
    }

    const footTrafficTrend = Array.from(weekMap.entries()).map(([week, v]) => ({
      week,
      pct: Math.round((v.total / v.count) * 10) / 10,
    }));

    const vacancyTrend = vacancyRows.map((r) => ({
      quarter: String(r.quarter),
      office: Number(r.office_vacancy_pct),
      retail: Number(r.retail_vacancy_pct),
    }));

    const weekdayVsWeekend = {
      weekday: weekdayTotals.weekday.count > 0
        ? Math.round((weekdayTotals.weekday.total / weekdayTotals.weekday.count) * 10) / 10
        : 0,
      weekend: weekdayTotals.weekend.count > 0
        ? Math.round((weekdayTotals.weekend.total / weekdayTotals.weekend.count) * 10) / 10
        : 0,
    };

    // Recovery milestones: first week each threshold was crossed
    const milestones: { threshold: number; week: string }[] = [];
    const thresholds = [50, 75, 90];
    const crossed = new Set<number>();

    for (const point of footTrafficTrend) {
      for (const t of thresholds) {
        if (!crossed.has(t) && point.pct >= t) {
          milestones.push({ threshold: t, week: point.week });
          crossed.add(t);
        }
      }
    }

    return NextResponse.json({
      footTrafficTrend,
      vacancyTrend,
      weekdayVsWeekend,
      recoveryMilestones: milestones,
    });
  } catch (error) {
    console.error("[downtown/detail] DB query failed:", error);
    return NextResponse.json(
      { error: "Failed to load downtown detail data" },
      { status: 500 },
    );
  }
}
