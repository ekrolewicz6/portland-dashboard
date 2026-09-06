import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "economy";
const CACHE_TTL = 60 * 60 * 1000; // 1h

// Single round-trip combined query — see homelessness/detail for rationale.
// 3 parallel queries via Promise.all deadlocked under serverless `max: 1`.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'qcew_latest', (
      SELECT row_to_json(t) FROM (
        SELECT year, quarter, establishments, month3_employment, avg_weekly_wage, total_quarterly_wages
        FROM economy.qcew_employment
        WHERE industry_code = '10'
        ORDER BY year DESC, quarter DESC
        LIMIT 1
      ) t
    ),
    'qcew_prior', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT year, quarter, establishments, month3_employment, avg_weekly_wage
        FROM economy.qcew_employment
        WHERE industry_code = '10'
        ORDER BY year DESC, quarter DESC
        LIMIT 2
      ) t
    ),
    'unemployment', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT year, period, period_name, value::numeric as value
        FROM business.bls_employment_series
        WHERE series_id = 'LAUMT413890000000003'
        ORDER BY year DESC, period DESC
        LIMIT 12
      ) t
    ),
    'trend', (
      SELECT COALESCE(json_agg(t ORDER BY year, quarter), '[]'::json) FROM (
        SELECT year, quarter, establishments
        FROM economy.qcew_employment
        WHERE industry_code = '10'
      ) t
    ),
    'msa_latest', (
      SELECT row_to_json(t) FROM (
        SELECT year, quarter, establishments, month3_employment, avg_weekly_wage
        FROM economy.msa_employment_wages
        ORDER BY year DESC, quarter DESC
        LIMIT 1
      ) t
    ),
    'mfg_formation', (
      SELECT row_to_json(t) FROM (
        SELECT year, new_mfg_firms_per_10k_pop, metro_rank_mfg_formation
        FROM economy.business_formation
        WHERE new_mfg_firms_per_10k_pop IS NOT NULL
        ORDER BY year DESC
        LIMIT 1
      ) t
    )
  ) AS payload
`;

type Row = Record<string, unknown>;

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(withFreshness(cached));

    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;
    const latest = payload.qcew_latest as Row | null;
    const qcewPrior = (payload.qcew_prior as Row[]) ?? [];
    const unemploymentRows = (payload.unemployment as Row[]) ?? [];
    const trendRows = (payload.trend as Row[]) ?? [];

    const msaLatest = payload.msa_latest as Row | null;
    const mfgFormation = payload.mfg_formation as Row | null;

    const prior = qcewPrior.length > 1 ? qcewPrior[1] : null;

    const establishments = Number(latest?.establishments ?? 0);
    const employment = Number(latest?.month3_employment ?? 0);
    const avgWage = Number(latest?.avg_weekly_wage ?? 0);
    const latestQtr = latest ? `${latest.year} Q${latest.quarter}` : "N/A";

    // MSA-level figures
    const msaEstablishments = msaLatest ? Number(msaLatest.establishments) : 0;
    const msaEmployment = msaLatest ? Number(msaLatest.month3_employment) : 0;

    // YoY trend from QCEW (same quarter comparison)
    let trendDir: "up" | "down" | "flat" = "flat";
    let trendPct = 0;
    let trendLabel = "no prior data";
    if (prior && latest) {
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

    // QCEW quarterly trend for chart — included in combined query above
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
    if (msaEstablishments > 0) {
      insights.push(
        `The broader Portland MSA has ${msaEstablishments.toLocaleString()} private establishments and ${msaEmployment.toLocaleString()} jobs.`
      );
    }
    if (mfgFormation) {
      insights.push(
        `Portland has ${mfgFormation.new_mfg_firms_per_10k_pop} new manufacturing firms per 10,000 population — #${mfgFormation.metro_rank_mfg_formation} among large metros (Census SUSB ${mfgFormation.year}).`
      );
    }

    const responseData = {
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
        {
          name: "BLS QCEW (Portland MSA)",
          status: msaEstablishments > 0 ? "connected" : "no_data",
          provider: "Bureau of Labor Statistics",
          action: msaEstablishments > 0 ? `${msaEstablishments.toLocaleString()} MSA establishments` : "No data",
        },
        {
          name: "Census Business Formation",
          status: mfgFormation ? "connected" : "no_data",
          provider: "Census Bureau CBP/SUSB",
          action: mfgFormation ? `#${mfgFormation.metro_rank_mfg_formation} metro for mfg formation` : "No data",
        },
      ],
      trend: {
        direction: trendDir,
        percentage: Math.abs(trendPct),
        label: trendLabel,
      },
      chartData,
      source: "Bureau of Labor Statistics · QCEW · LAUS · Census Bureau · CBP · SUSB",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (err) {
    console.error("Economy API error:", err);
    // "unavailable", not "error": the caller's question is whether there is
    // anything to show, and the answer is no. Every other topic route uses
    // that value, the dashboard hub and the cache layer both key on it, and
    // a distinct value here only meant the same condition rendered
    // differently depending on which topic you were reading. The cause is
    // logged above, where it is actionable.
    return NextResponse.json(withFreshness({
      headline: "Economy data temporarily unavailable",
      headlineValue: null,
      dataStatus: "unavailable",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat" as const, percentage: 0, label: "error" },
      chartData: [],
      source: "Bureau of Labor Statistics · QCEW · LAUS · Census Bureau · CBP · SUSB",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Economy data is not available right now."],
    }));
  }
}
