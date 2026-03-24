import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use QCEW data (the authoritative source) for headline metrics
    const [qcewLatest, qcewPrior, unemploymentRows] = await Promise.all([
      // Latest quarter total private sector
      sql`
        SELECT year, quarter, establishments, month3_employment, avg_weekly_wage, total_quarterly_wages
        FROM economy.qcew_employment
        WHERE industry_code = '10'
        ORDER BY year DESC, quarter DESC
        LIMIT 1
      `,
      // Same quarter previous year (for YoY comparison)
      sql`
        SELECT year, quarter, establishments, month3_employment, avg_weekly_wage
        FROM economy.qcew_employment
        WHERE industry_code = '10'
        ORDER BY year DESC, quarter DESC
        LIMIT 2
      `,
      // BLS unemployment rate
      sql`
        SELECT year, period, period_name, value::numeric as value
        FROM business.bls_employment_series
        WHERE series_id = 'LAUMT413890000000003'
        ORDER BY year DESC, period DESC
        LIMIT 12
      `,
    ]);

    const latest = qcewLatest[0];
    const prior = qcewPrior.length > 1 ? qcewPrior[1] : null;

    const establishments = Number(latest?.establishments ?? 0);
    const employment = Number(latest?.month3_employment ?? 0);
    const avgWage = Number(latest?.avg_weekly_wage ?? 0);
    const latestQtr = latest ? `${latest.year} Q${latest.quarter}` : "N/A";

    // YoY trend from QCEW (same quarter comparison)
    let trendDir: "up" | "down" | "flat" = "flat";
    let trendPct = 0;
    let trendLabel = "no prior data";
    if (prior) {
      const priorEst = Number(prior.establishments);
      if (priorEst > 0) {
        trendPct = Math.round(((establishments - priorEst) / priorEst) * 1000) / 10;
        trendDir = trendPct > 0.5 ? "up" : trendPct < -0.5 ? "down" : "flat";
        trendLabel = `${prior.year} Q${prior.quarter} to ${latest.year} Q${latest.quarter}`;
      }
    }

    // Unemployment
    const latestUnemp = unemploymentRows.length > 0 ? unemploymentRows[0] : null;
    const unempRate = latestUnemp ? Number(latestUnemp.value) : null;

    // QCEW quarterly trend for chart (establishments over time)
    const trendRows = await sql`
      SELECT year, quarter, establishments
      FROM economy.qcew_employment
      WHERE industry_code = '10'
      ORDER BY year, quarter
    `;
    const chartData = trendRows.map((r) => ({
      date: `${r.year} Q${r.quarter}`,
      value: Number(r.establishments),
    }));

    // Peak for context
    const peakEst = Math.max(...chartData.map((d) => d.value));
    const estLoss = peakEst - establishments;

    // Headline
    const headline = unempRate
      ? `${establishments.toLocaleString()} businesses · ${employment.toLocaleString()} jobs · ${unempRate}% unemployment`
      : `${establishments.toLocaleString()} businesses · ${employment.toLocaleString()} private-sector jobs`;

    // Insights
    const insights: string[] = [];
    insights.push(
      `${establishments.toLocaleString()} private-sector establishments in Multnomah County (${latestQtr}), down ${estLoss.toLocaleString()} from peak of ${peakEst.toLocaleString()}.`
    );
    insights.push(
      `${employment.toLocaleString()} private-sector employees, earning $${avgWage.toLocaleString()}/week average ($${Math.round(avgWage * 52).toLocaleString()}/year).`
    );
    if (unempRate !== null) {
      insights.push(
        `Portland MSA unemployment rate: ${unempRate}% (${latestUnemp!.period_name} ${latestUnemp!.year}).`
      );
    }
    insights.push(
      `Every industry sector has fewer establishments today than at its peak. Small businesses (avg 4.7 employees) in "Other services" have been hit hardest (−36%).`
    );

    return NextResponse.json({
      headline,
      headlineValue: establishments,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "BLS QCEW (Multnomah County)",
          status: "connected",
          provider: "Bureau of Labor Statistics",
          action: `${establishments.toLocaleString()} establishments, ${employment.toLocaleString()} employees`,
        },
        {
          name: "BLS Unemployment (Portland MSA)",
          status: unempRate ? "connected" : "no_data",
          provider: "BLS LAUS",
          action: unempRate ? `${unempRate}% unemployment` : "No data",
        },
      ],
      trend: {
        direction: trendDir,
        percentage: Math.abs(trendPct),
        label: trendLabel,
      },
      chartData,
      source: "BLS QCEW · BLS LAUS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    });
  } catch (err) {
    console.error("Economy API error:", err);
    return NextResponse.json({
      headline: "Economy data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat" as const, percentage: 0, label: "error" },
      chartData: [],
      source: "Database query failed",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Database connection error."],
    });
  }
}
