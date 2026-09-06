import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "homelessness";
const CACHE_TTL = 60 * 60 * 1000; // 1h

// Single round-trip query — see detail/route.ts for the rationale.
// Previously this fired 5 parallel queries, several of which referenced
// non-existent columns and silently caught errors. Now: one round trip,
// correct columns, no Promise.all deadlock under serverless `max: 1`.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'pit', (
      SELECT COALESCE(json_agg(t ORDER BY year), '[]'::json) FROM (
        SELECT year, total_homeless, sheltered, unsheltered
        FROM homelessness.pit_counts
      ) t
    ),
    'shelter', (
      SELECT row_to_json(t) FROM (
        SELECT quarter, total_beds, utilization_pct
        FROM homelessness.shelter_capacity
        ORDER BY quarter DESC LIMIT 1
      ) t
    ),
    'placements', (
      SELECT row_to_json(t) FROM (
        SELECT fiscal_year, total_placements
        FROM homelessness.housing_placements
        ORDER BY fiscal_year DESC LIMIT 1
      ) t
    ),
    'overdose', (
      SELECT row_to_json(t) FROM (
        SELECT year, total_od_deaths_homeless
        FROM homelessness.overdose_deaths
        ORDER BY year DESC LIMIT 1
      ) t
    ),
    'shs', (
      SELECT row_to_json(t) FROM (
        SELECT year, tax_revenue, psh_units_cumulative
        FROM homelessness.shs_funding
        ORDER BY year DESC LIMIT 1
      ) t
    ),
    'irp_total', (
      SELECT row_to_json(t) FROM (
        SELECT
          COUNT(*) FILTER (WHERE NOT is_duplicate)::int AS unique_total,
          MIN(incident_date)::date AS earliest
        FROM homelessness.irp_campsite_reports
      ) t
    )
  ) AS payload
`;

type PitRow = {
  year: number;
  total_homeless: number;
  sheltered: number;
  unsheltered: number;
};

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(withFreshness(cached));

    const t0 = Date.now();
    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;
    console.log(`[homelessness] combined query: ${Date.now() - t0}ms`);

    const pitRows = (payload.pit as PitRow[]) ?? [];
    const shelter = payload.shelter as Record<string, unknown> | null;
    const placements = payload.placements as Record<string, unknown> | null;
    const overdose = payload.overdose as Record<string, unknown> | null;
    const shs = payload.shs as Record<string, unknown> | null;
    const irpTotal = payload.irp_total as { unique_total: number; earliest: string } | null;

    if (pitRows.length === 0) {
      return NextResponse.json(withFreshness({
        headline: "No homelessness data loaded yet",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        trend: { direction: "flat", percentage: 0, label: "no data" },
        chartData: [],
        source: "HUD Point-in-Time Count · JOHS · Metro SHS · Multnomah County Health",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Homelessness data not yet available."],
      }));
    }

    const latest = pitRows[pitRows.length - 1];
    const latestTotal = Number(latest.total_homeless);
    const latestYear = Number(latest.year);

    let yoyChange = 0;
    let yoyLabel = "year-over-year";
    let prevYear: number | null = null;
    if (pitRows.length >= 2) {
      const prev = pitRows[pitRows.length - 2];
      const prevTotal = Number(prev.total_homeless);
      prevYear = Number(prev.year);
      if (prevTotal > 0) {
        yoyChange = Math.round(((latestTotal - prevTotal) / prevTotal) * 100);
        yoyLabel = `up ${Math.abs(yoyChange)}% since ${prevYear}`;
      }
    }

    const trendDirection: "up" | "down" | "flat" =
      yoyChange > 1 ? "up" : yoyChange < -1 ? "down" : "flat";

    const headline =
      `${latestTotal.toLocaleString()} people homeless in Multnomah County` +
      (prevYear ? ` — ${yoyLabel}` : "");

    const chartData = pitRows.map((r) => ({
      date: String(r.year),
      value: Number(r.total_homeless),
    }));

    const insights: string[] = [];
    insights.push(
      `${latestTotal.toLocaleString()} total homeless counted in ${latestYear} PIT count (${Number(latest.sheltered).toLocaleString()} sheltered, ${Number(latest.unsheltered).toLocaleString()} unsheltered).`,
    );

    if (shelter) {
      insights.push(
        `${Number(shelter.total_beds).toLocaleString()} shelter beds at ${Number(shelter.utilization_pct)}% utilization (${shelter.quarter}).`,
      );
    }
    if (placements) {
      insights.push(
        `${Number(placements.total_placements).toLocaleString()} housing placements in ${placements.fiscal_year}.`,
      );
    }
    if (overdose) {
      insights.push(
        `${Number(overdose.total_od_deaths_homeless).toLocaleString()} overdose deaths in ${overdose.year}.`,
      );
    }
    if (shs) {
      insights.push(
        `SHS revenue: $${(Number(shs.tax_revenue) / 1e6).toFixed(0)}M (${shs.year}).`,
      );
    }
    if (irpTotal && irpTotal.unique_total > 0) {
      insights.push(
        `${irpTotal.unique_total.toLocaleString()} campsite reports tracked since ${irpTotal.earliest} via IRP.`,
      );
    }

    const responseData = {
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
      source: "HUD Point-in-Time Count · JOHS · Metro SHS · Multnomah County Health",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (error) {
    console.error("[homelessness] DB query failed:", error);
    return NextResponse.json(withFreshness({
      headline: "Homelessness data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      source: "HUD Point-in-Time Count · JOHS · Metro SHS · Multnomah County Health",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        "Database connection failed. Homelessness data is temporarily unavailable.",
      ],
    }));
  }
}
