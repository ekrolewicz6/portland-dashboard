import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get latest year total enrollment
    const latestRows = await sql`
      SELECT school_year, enrollment
      FROM education.enrollment
      WHERE grade_level = 'Total'
        AND demographic_group IS NULL
      ORDER BY school_year DESC
      LIMIT 2
    `;

    if (latestRows.length === 0) {
      return NextResponse.json({
        headline: "Education data not yet available",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          {
            name: "PPS Enrollment Data",
            status: "needed",
            provider: "Oregon Department of Education",
            action: "Run: npx tsx scripts/parse-education.ts",
          },
        ],
        trend: { direction: "flat", percentage: 0, label: "not yet tracked" },
        chartData: [],
        source: "Oregon Department of Education",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Run parse-education.ts to load ODE enrollment data"],
      });
    }

    const latest = latestRows[0];
    const prior = latestRows.length > 1 ? latestRows[1] : null;

    const totalEnrollment = Number(latest.enrollment);
    const priorEnrollment = prior ? Number(prior.enrollment) : null;
    const yoyChange =
      priorEnrollment && priorEnrollment > 0
        ? ((totalEnrollment - priorEnrollment) / priorEnrollment) * 100
        : 0;

    const direction = yoyChange > 0 ? "up" : yoyChange < 0 ? "down" : "flat";
    const absChange = Math.abs(yoyChange);

    // Chart data: enrollment totals across years
    const chartRows = await sql`
      SELECT school_year, enrollment
      FROM education.enrollment
      WHERE grade_level = 'Total'
        AND demographic_group IS NULL
      ORDER BY school_year ASC
    `;

    const chartData = chartRows.map((r: any) => ({
      date: r.school_year,
      value: Number(r.enrollment),
    }));

    // Get graduation rate for insight
    const gradRows = await sql`
      SELECT rate_4yr FROM education.graduation_rates
      ORDER BY school_year DESC LIMIT 1
    `;
    const latestGradRate = gradRows.length > 0 ? Number(gradRows[0].rate_4yr) : null;

    const insights: string[] = [];
    insights.push(
      `PPS enrollment is ${totalEnrollment.toLocaleString()} students (${latest.school_year})`
    );
    if (priorEnrollment) {
      insights.push(
        `${direction === "down" ? "Declined" : "Grew"} ${absChange.toFixed(1)}% from ${priorEnrollment.toLocaleString()} (${prior!.school_year})`
      );
    }
    if (latestGradRate !== null) {
      insights.push(`4-year graduation rate: ${latestGradRate}%`);
    }

    const headline = `${totalEnrollment.toLocaleString()} students in Portland Public Schools — ${direction} ${absChange.toFixed(1)}% from last year`;

    return NextResponse.json({
      headline,
      headlineValue: totalEnrollment,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "ODE Enrollment Data",
          status: "connected",
          provider: "Oregon Department of Education",
          action: "XLSX files parsed locally",
        },
        {
          name: "ODE Graduation Rates",
          status: "connected",
          provider: "Oregon Department of Education",
          action: "Published ODE values",
        },
      ],
      trend: {
        direction,
        percentage: Math.round(absChange * 10) / 10,
        label: `vs ${prior?.school_year ?? "prior year"}`,
      },
      chartData,
      source: "Oregon Department of Education",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    });
  } catch (err: any) {
    console.error("Education API error:", err.message);
    return NextResponse.json({
      headline: "Education data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat", percentage: 0, label: "error" },
      chartData: [],
      source: "Oregon Department of Education",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Database connection error — check that PostgreSQL is running"],
    });
  }
}
