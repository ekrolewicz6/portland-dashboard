import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import {
  computeEmpiricalHealth,
  type EmpiricalIndicatorInput,
  type MetroObservation,
} from "@/lib/scoring/empirical-health";

export const dynamic = "force-dynamic";

const CACHE_KEY = "economic-health";
const CACHE_TTL = 60 * 60 * 1000;

const PORTLAND_METRO_CODE = "38900";

const COMBINED_QUERY = `
  SELECT json_build_object(
    'metros', (
      SELECT COALESCE(json_agg(t ORDER BY t.display_order), '[]'::json) FROM (
        SELECT metro_code, short_name, is_portland, population, display_order
        FROM metro_metadata ORDER BY display_order
      ) t
    ),
    'unemploymentSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH latest AS (
          SELECT metro_code, MAX(year * 100 + month) AS ym
          FROM metro_unemployment_monthly GROUP BY metro_code
        ),
        anchored AS (SELECT MIN(ym) AS common_ym FROM latest)
        SELECT u.metro_code, u.rate
        FROM metro_unemployment_monthly u
        JOIN anchored a ON u.year * 100 + u.month = a.common_ym
      ) t
    ),
    'unemploymentPortlandHistory', (
      SELECT COALESCE(json_agg(rate ORDER BY year, month), '[]'::json)
      FROM metro_unemployment_monthly WHERE metro_code = '${PORTLAND_METRO_CODE}'
    ),
    'employmentSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH latest AS (
          SELECT metro_code, MAX(year * 10 + quarter) AS yq
          FROM metro_employment_quarterly WHERE establishments IS NOT NULL GROUP BY metro_code
        ),
        anchored AS (SELECT MIN(yq) AS common_yq FROM latest)
        SELECT e.metro_code,
               (
                 SELECT CASE WHEN prior.establishments > 0
                              THEN (e.establishments - prior.establishments)::numeric / prior.establishments * 100
                              ELSE NULL END
                 FROM metro_employment_quarterly prior
                 WHERE prior.metro_code = e.metro_code
                   AND prior.year = e.year - 1
                   AND prior.quarter = e.quarter
               ) AS yoy_pct
        FROM metro_employment_quarterly e
        JOIN anchored a ON e.year * 10 + e.quarter = a.common_yq
      ) t
    ),
    'employmentPortlandHistory', (
      SELECT COALESCE(json_agg(yoy ORDER BY year, quarter), '[]'::json) FROM (
        SELECT curr.year, curr.quarter,
               (curr.establishments - prior.establishments)::numeric / NULLIF(prior.establishments,0) * 100 AS yoy
        FROM metro_employment_quarterly curr
        JOIN metro_employment_quarterly prior
          ON prior.metro_code = curr.metro_code
         AND prior.year = curr.year - 1
         AND prior.quarter = curr.quarter
        WHERE curr.metro_code = '${PORTLAND_METRO_CODE}' AND curr.establishments IS NOT NULL
      ) t
    ),
    'wageSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH latest AS (
          SELECT metro_code, MAX(year * 10 + quarter) AS yq
          FROM metro_employment_quarterly
          WHERE avg_weekly_wage IS NOT NULL GROUP BY metro_code
        ),
        anchored AS (SELECT MIN(yq) AS common_yq FROM latest)
        SELECT e.metro_code,
               (
                 SELECT CASE WHEN prior.avg_weekly_wage > 0
                              THEN (e.avg_weekly_wage - prior.avg_weekly_wage)::numeric / prior.avg_weekly_wage * 100
                              ELSE NULL END
                 FROM metro_employment_quarterly prior
                 WHERE prior.metro_code = e.metro_code
                   AND prior.year = e.year - 1
                   AND prior.quarter = e.quarter
               ) AS wage_yoy_pct
        FROM metro_employment_quarterly e
        JOIN anchored a ON e.year * 10 + e.quarter = a.common_yq
      ) t
    ),
    'wagePortlandHistory', (
      SELECT COALESCE(json_agg(yoy ORDER BY year, quarter), '[]'::json) FROM (
        SELECT curr.year, curr.quarter,
               (curr.avg_weekly_wage - prior.avg_weekly_wage)::numeric / NULLIF(prior.avg_weekly_wage,0) * 100 AS yoy
        FROM metro_employment_quarterly curr
        JOIN metro_employment_quarterly prior
          ON prior.metro_code = curr.metro_code
         AND prior.year = curr.year - 1
         AND prior.quarter = curr.quarter
        WHERE curr.metro_code = '${PORTLAND_METRO_CODE}' AND curr.avg_weekly_wage IS NOT NULL
      ) t
    ),
    'lfpSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH latest AS (SELECT metro_code, MAX(year) AS y FROM metro_acs_annual WHERE lfp_rate IS NOT NULL GROUP BY metro_code),
             anchored AS (SELECT MIN(y) AS common_y FROM latest)
        SELECT a.metro_code, a.lfp_rate FROM metro_acs_annual a JOIN anchored ON a.year = anchored.common_y WHERE a.lfp_rate IS NOT NULL
      ) t
    ),
    'lfpPortlandHistory', (
      SELECT COALESCE(json_agg(lfp_rate ORDER BY year), '[]'::json)
      FROM metro_acs_annual
      WHERE metro_code = '${PORTLAND_METRO_CODE}' AND lfp_rate IS NOT NULL
    ),
    'bfaSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH common_year AS (
          SELECT MIN(y) AS y FROM (
            SELECT b.metro_code, MAX(b.year) AS y FROM metro_business_applications_annual b
            JOIN metro_acs_annual a USING (metro_code, year) WHERE a.population_16_plus > 0 GROUP BY b.metro_code
          ) latest
        )
        SELECT b.metro_code, (b.applications_total::numeric / NULLIF(a.population_16_plus, 0)) * 100000 AS apps_per_100k
        FROM metro_business_applications_annual b
        JOIN metro_acs_annual a USING (metro_code, year)
        JOIN common_year cy ON b.year = cy.y WHERE a.population_16_plus > 0
      ) t
    ),
    'bfaPortlandHistory', (
      SELECT COALESCE(json_agg(rate ORDER BY year), '[]'::json) FROM (
        SELECT b.year, (b.applications_total::numeric / NULLIF(a.population_16_plus, 0)) * 100000 AS rate
        FROM metro_business_applications_annual b
        JOIN metro_acs_annual a USING (metro_code, year)
        WHERE b.metro_code = '${PORTLAND_METRO_CODE}' AND a.population_16_plus > 0
      ) t
    ),
    'affSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH common_year AS (
          SELECT MIN(y) AS y FROM (
            SELECT z.metro_code, MAX(z.year) AS y FROM metro_zhvi_monthly z
            JOIN metro_acs_annual a ON a.metro_code = z.metro_code AND a.year = z.year
            WHERE z.month = 12 AND a.median_household_income > 0 GROUP BY z.metro_code
          ) latest
        )
        SELECT z.metro_code, z.zhvi / NULLIF(a.median_household_income, 0) AS price_to_income
        FROM metro_zhvi_monthly z
        JOIN metro_acs_annual a ON a.metro_code = z.metro_code AND a.year = z.year
        JOIN common_year cy ON z.year = cy.y
        WHERE z.month = 12 AND a.median_household_income > 0
      ) t
    ),
    'affPortlandHistory', (
      SELECT COALESCE(json_agg(ratio ORDER BY year), '[]'::json) FROM (
        SELECT z.year, z.zhvi / NULLIF(a.median_household_income, 0) AS ratio
        FROM metro_zhvi_monthly z
        JOIN metro_acs_annual a ON a.metro_code = z.metro_code AND a.year = z.year
        WHERE z.metro_code = '${PORTLAND_METRO_CODE}' AND z.month = 12 AND a.median_household_income > 0
      ) t
    ),
    'incomeSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH latest AS (SELECT metro_code, MAX(year) AS y FROM metro_personal_income_annual WHERE per_capita_income IS NOT NULL GROUP BY metro_code),
             anchored AS (SELECT MIN(y) AS common_y FROM latest)
        SELECT i.metro_code, i.per_capita_income FROM metro_personal_income_annual i JOIN anchored ON i.year = anchored.common_y WHERE i.per_capita_income IS NOT NULL
      ) t
    ),
    'incomePortlandHistory', (
      SELECT COALESCE(json_agg(per_capita_income ORDER BY year), '[]'::json)
      FROM metro_personal_income_annual
      WHERE metro_code = '${PORTLAND_METRO_CODE}' AND per_capita_income IS NOT NULL
    ),
    'popGrowthSnapshot', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        WITH paired AS (
          SELECT curr.metro_code, curr.year, curr.population AS curr_pop, prior.population AS prior_pop
          FROM metro_personal_income_annual curr
          JOIN metro_personal_income_annual prior ON prior.metro_code = curr.metro_code AND prior.year = curr.year - 1
          WHERE curr.population IS NOT NULL AND prior.population IS NOT NULL
        ),
        latest AS (SELECT metro_code, MAX(year) AS y FROM paired GROUP BY metro_code),
        anchored AS (SELECT MIN(y) AS common_y FROM latest)
        SELECT p.metro_code, ((p.curr_pop - p.prior_pop)::numeric / NULLIF(p.prior_pop, 0)) * 100 AS yoy_pct
        FROM paired p JOIN anchored ON p.year = anchored.common_y
      ) t
    ),
    'popGrowthPortlandHistory', (
      SELECT COALESCE(json_agg(yoy ORDER BY year), '[]'::json) FROM (
        SELECT curr.year, ((curr.population - prior.population)::numeric / NULLIF(prior.population, 0)) * 100 AS yoy
        FROM metro_personal_income_annual curr
        JOIN metro_personal_income_annual prior ON prior.metro_code = curr.metro_code AND prior.year = curr.year - 1
        WHERE curr.metro_code = '${PORTLAND_METRO_CODE}' AND curr.population IS NOT NULL AND prior.population IS NOT NULL
      ) t
    ),
    'pbjAsOf', (SELECT to_char(MAX(month),'YYYY-MM-DD') FROM pbj_business_monthly),
    'businessTrend12mo', (
      SELECT json_build_object('curr', curr, 'prior', prior) FROM (
        SELECT
          SUM(new_businesses) FILTER (WHERE month >= (date_trunc('month', CURRENT_DATE) - INTERVAL '12 months')) AS curr,
          SUM(new_businesses) FILTER (
            WHERE month >= (date_trunc('month', CURRENT_DATE) - INTERVAL '24 months')
              AND month <  (date_trunc('month', CURRENT_DATE) - INTERVAL '12 months')
          ) AS prior
        FROM pbj_business_monthly
      ) t
    )
  ) AS payload
`;

type Row = Record<string, unknown>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildSnapshotInput(args: {
  metros: Array<{ metro_code: string; short_name: string; is_portland: boolean; population: number | null }>;
  snapshot: Row[];
  valueKey: string;
  populationDivide?: boolean;
  inverted: boolean;
  label: string;
  description: string;
  source: string;
  portlandHistory: number[];
}): EmpiricalIndicatorInput | null {
  const metroById = new Map(args.metros.map((m) => [m.metro_code, m]));
  const obs: MetroObservation[] = [];
  for (const s of args.snapshot) {
    const meta = metroById.get(String(s.metro_code));
    if (!meta) continue;
    let v = num(s[args.valueKey]);
    if (args.populationDivide && meta.population) v = (v / meta.population) * 100_000;
    obs.push({
      metroCode: meta.metro_code,
      isPortland: meta.is_portland,
      shortName: meta.short_name,
      current: v,
      population: meta.population,
    });
  }
  const portland = obs.find((o) => o.isPortland);
  if (!portland) return null;
  if (args.portlandHistory.length < 6) return null;
  let history = args.portlandHistory;
  if (args.populationDivide && portland.population) {
    history = history.map((v) => (v / portland.population!) * 100_000);
  }
  return {
    portlandCurrent: portland.current,
    portlandHistory: history,
    peerSnapshot: obs,
    inverted: args.inverted,
    label: args.label,
    description: args.description,
    source: args.source,
  };
}

export async function GET() {
  try {
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(cached);

    const result = (await sql.unsafe(COMBINED_QUERY)) as unknown as Array<{ payload: Row }>;
    const p = result[0]?.payload ?? {};

    const metros = (p.metros as Array<{
      metro_code: string;
      short_name: string;
      is_portland: boolean;
      population: number | null;
    }>) ?? [];

    const lfpInput = buildSnapshotInput({
      metros,
      snapshot: (p.lfpSnapshot as Row[]) ?? [],
      valueKey: "lfp_rate",
      inverted: false,
      label: "Labor force participation",
      description: "Civilian labor force / pop 16+. Census ACS B23025.",
      source: "Census ACS",
      portlandHistory: ((p.lfpPortlandHistory as unknown[]) ?? []).map((v) => Number(v)).filter((v) => Number.isFinite(v)),
    });
    const bfaInput = buildSnapshotInput({
      metros,
      snapshot: (p.bfaSnapshot as Row[]) ?? [],
      valueKey: "apps_per_100k",
      inverted: false,
      label: "Business applications / 100k",
      description: "Census BFS county roll-up / ACS pop 16+.",
      source: "Census BFS + ACS",
      portlandHistory: ((p.bfaPortlandHistory as unknown[]) ?? []).map((v) => Number(v)).filter((v) => Number.isFinite(v)),
    });
    const affInput = buildSnapshotInput({
      metros,
      snapshot: (p.affSnapshot as Row[]) ?? [],
      valueKey: "price_to_income",
      inverted: true,
      label: "Home price-to-income",
      description: "Zillow ZHVI / ACS median income. Lower = more affordable.",
      source: "Zillow + Census ACS",
      portlandHistory: ((p.affPortlandHistory as unknown[]) ?? []).map((v) => Number(v)).filter((v) => Number.isFinite(v)),
    });

    const incomeInput = buildSnapshotInput({
      metros,
      snapshot: (p.incomeSnapshot as Row[]) ?? [],
      valueKey: "per_capita_income",
      inverted: false,
      label: "Income per capita",
      description: "BEA personal income per person.",
      source: "BEA CAINC1",
      portlandHistory: ((p.incomePortlandHistory as unknown[]) ?? []).map((v) => Number(v)).filter((v) => Number.isFinite(v)),
    });
    const popGrowthInput = buildSnapshotInput({
      metros,
      snapshot: (p.popGrowthSnapshot as Row[]) ?? [],
      valueKey: "yoy_pct",
      inverted: false,
      label: "Population growth",
      description: "Year-over-year metro population change.",
      source: "BEA county roll-up",
      portlandHistory: ((p.popGrowthPortlandHistory as unknown[]) ?? []).map((v) => Number(v)).filter((v) => Number.isFinite(v)),
    });

    const composite = computeEmpiricalHealth({
      incomePerCapita: incomeInput,
      populationGrowth: popGrowthInput,
      laborForceParticipation: lfpInput,
      businessFormation: bfaInput,
      affordability: affInput,
      unemployment: buildSnapshotInput({
        metros,
        snapshot: (p.unemploymentSnapshot as Row[]) ?? [],
        valueKey: "rate",
        inverted: true,
        label: "Unemployment rate",
        description: "BLS LAUS Portland MSA. Lower is better.",
        source: "BLS LAUS",
        portlandHistory: ((p.unemploymentPortlandHistory as unknown[]) ?? []).map((v) => Number(v)),
      }),
      employment: buildSnapshotInput({
        metros,
        snapshot: (p.employmentSnapshot as Row[]) ?? [],
        valueKey: "yoy_pct",
        inverted: false,
        label: "Employment growth (YoY)",
        description: "QCEW total establishments year-over-year change.",
        source: "BLS QCEW",
        portlandHistory: ((p.employmentPortlandHistory as unknown[]) ?? [])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v)),
      }),
      wageGrowth: buildSnapshotInput({
        metros,
        snapshot: (p.wageSnapshot as Row[]) ?? [],
        valueKey: "wage_yoy_pct",
        inverted: false,
        label: "Wage growth (YoY %)",
        description: "QCEW average weekly wage, year-over-year change.",
        source: "BLS QCEW",
        portlandHistory: ((p.wagePortlandHistory as unknown[]) ?? [])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v)),
      }),
    });

    // Formats a sub-score's raw indicator value (e.g. "5.5%" for the
    // unemployment rate, "77,843" for income per capita).
    const formatCurrent = (s: (typeof composite.subScores)[number]) =>
      s.label.toLowerCase().includes("rate") || s.label.toLowerCase().includes("growth")
        ? s.portlandCurrent.toFixed(1) + "%"
        : Math.round(s.portlandCurrent).toLocaleString();

    // Each sub-score `value` is a 0-100 index: the average of two percentile
    // ranks (Portland vs its own history, Portland vs peer metros). It is NOT
    // the indicator's raw value. Say so explicitly in the headline; the old
    // wording "unemployment rate 13" read like a 13% unemployment rate when
    // the actual rate was ~5%.
    const tail = composite.subScores
      .map(
        (s) =>
          `${s.label.toLowerCase()} ${formatCurrent(s)} scores ${s.value}/100 (percentile ${s.portlandHistoricalPercentile} in Portland history, ${s.peerPercentile} vs peers)`,
      )
      .join("; ");
    const headline =
      composite.label === "Insufficient data"
        ? "Economic Health: data refreshing, partial signal available."
        : `Economic Health: ${composite.score}/100 (${composite.label}). ${tail || "See detail"}.`;

    const trendDirection: "up" | "down" | "flat" =
      composite.score >= 60 ? "up" : composite.score >= 40 ? "flat" : "down";

    // Hero chart: monthly new-business registrations from the Oregon SOS
    // active registry (refreshed by ingest/fetch-sos-all-active.ts). Counts
    // are registrations still active today, so older months read slightly
    // low; the current partial month is excluded. Replaces pbj_business_monthly,
    // whose feed died with hard zeros after 2026-02.
    const businessSeriesQ = `
      SELECT to_char(date_trunc('month', registry_date),'YYYY-MM') AS month,
             count(*)::int AS new_businesses
      FROM business.oregon_sos_all_active
      WHERE associated_name_type = 'PRINCIPAL PLACE OF BUSINESS'
        AND registry_date >= date_trunc('month', now()) - interval '24 months'
        AND registry_date < date_trunc('month', now())
      GROUP BY 1 ORDER BY 1
    `;
    const series = (await sql.unsafe(businessSeriesQ)) as unknown as Array<{
      month: string;
      new_businesses: number;
    }>;
    const chartData = series.map((r) => ({ date: r.month, value: num(r.new_businesses) }));

    const insights = composite.subScores.map((s) => {
      const histDirection = s.inverted
        ? s.portlandHistoricalPercentile >= 70
          ? "below"
          : s.portlandHistoricalPercentile <= 30
          ? "above"
          : "near"
        : s.portlandHistoricalPercentile >= 70
        ? "above"
        : s.portlandHistoricalPercentile <= 30
        ? "below"
        : "near";
      const peerDirection = s.peerPercentile >= 60
        ? "ahead of peer median"
        : s.peerPercentile <= 40
        ? "behind peer median"
        : "near peer median";
      const valStr = formatCurrent(s);
      return `${s.label}: Portland at ${valStr} — ${histDirection} historical median, ${peerDirection}.`;
    });

    const responseData = {
      headline,
      headlineValue: composite.score,
      dataStatus: composite.label === "Insufficient data" ? "partial" : "live",
      dataAvailable: composite.subScores.length > 0,
      composite: {
        score: composite.score,
        label: composite.label,
        subScores: composite.subScores,
        missing: composite.missing,
      },
      dataSources: [
        { name: "BLS LAUS (Unemployment, monthly)", status: "connected", provider: "Bureau of Labor Statistics", action: "7 metros, 10y history" },
        { name: "BLS QCEW (Employment, quarterly)", status: "connected", provider: "Bureau of Labor Statistics", action: "7 metros, 10y history" },
        { name: "BLS QCEW (Wages, quarterly)", status: "connected", provider: "Bureau of Labor Statistics", action: "7 metros, 10y history" },
        { name: "PBJ Public Records (descriptive)", status: (p.pbjAsOf as string) ? "connected" : "no_data", provider: "Portland Business Journal", action: (p.pbjAsOf as string) ? `data through ${p.pbjAsOf}` : "no data" },
      ],
      trend: { direction: trendDirection, percentage: composite.score, label: "vs Portland history + peer metros" },
      chartData,
      source: "BLS LAUS · BLS QCEW · Census BFS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(responseData);
  } catch (err) {
    console.error("Economic Health API error:", err);
    // "unavailable", not "error": the caller's question is whether there is
    // anything to show, and the answer is no. Every other topic route uses
    // that value, the dashboard hub and the cache layer both key on it, and
    // a distinct value here only meant the same condition rendered
    // differently depending on which topic you were reading. The cause is
    // logged above, where it is actionable.
    return NextResponse.json({
      headline: "Economic health data temporarily unavailable",
      headlineValue: null,
      dataStatus: "unavailable",
      dataAvailable: false,
      composite: null,
      dataSources: [],
      trend: { direction: "flat" as const, percentage: 0, label: "error" },
      chartData: [],
      source: "BLS LAUS · BLS QCEW · Census BFS",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [],
    });
  }
}
