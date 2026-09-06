import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";
import type { HousingData, ChartPoint, PermitBreakdown } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "housing";
const REDFIN_MAX_AGE_DAYS = 180;

function isFreshSourceDate(value: unknown, maxAgeDays: number): boolean {
  if (!value) return false;
  const sourceDate = new Date(String(value));
  if (isNaN(sourceDate.getTime())) return false;
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return Date.now() - sourceDate.getTime() <= maxAgeMs;
}

function toYearMonth(value: unknown): string {
  const sourceDate = new Date(String(value));
  if (isNaN(sourceDate.getTime())) return String(value).slice(0, 7);
  return sourceDate.toISOString().slice(0, 7);
}

export async function GET(): Promise<NextResponse<HousingData & { dataStatus: string }>> {
  try {
    // Check cache first
    const cached = await getCachedData<HousingData & { dataStatus: string }>(CACHE_KEY);
    if (cached) return NextResponse.json(withFreshness(cached));

    // 1. Summary: total permits and average processing days
    const summaryRows = await sql`
      SELECT
        count(*) as total,
        avg(processing_days) as avg_days
      FROM housing.permits
      WHERE LOWER(status) IN ('finaled', 'final', 'final - uf', 'issued', 'issued - uf')
    `;

    if (!summaryRows || summaryRows.length === 0 || Number(summaryRows[0].total) === 0) {
      return NextResponse.json(withFreshness({
        headline: "Housing permit data temporarily unavailable",
        headlineValue: 0,
        dataStatus: "unavailable",
        trend: { direction: "flat" as const, percentage: 0, label: "no data" },
        chartData: [],
        permitPipeline: [],
        processingDays: [],
        medianRent: [],
        source: "Portland Bureau of Development Services · PermitsNow",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Permit data is not currently available from the database."],
      } as unknown as HousingData & { dataStatus: string }));
    }

    const totalPermits = Number(summaryRows[0].total);
    const avgDays = Math.round(Number(summaryRows[0].avg_days) || 0);

    // 2. Units in pipeline: active permits with status 'issued' for residential types
    const pipelineRows = await sql`
      SELECT count(*) as cnt
      FROM housing.permits
      WHERE LOWER(status) IN ('issued', 'issued - uf')
        AND (permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%')
    `;
    const unitsInPipeline = Number(pipelineRows[0].cnt);

    // 3. Average processing time for recently issued permits (last 12 months)
    const recentProcessingRows = await sql`
      SELECT avg(processing_days)::int as avg_days
      FROM housing.permits
      WHERE processing_days IS NOT NULL
        AND processing_days >= 0
        AND issued_date >= (CURRENT_DATE - INTERVAL '12 months')
    `;
    const avgProcessingTime = Number(recentProcessingRows[0].avg_days || avgDays);

    // 4. Total construction valuation (last 24 months)
    const valuationRows = await sql`
      SELECT sum(valuation)::bigint as total_val
      FROM housing.permits
      WHERE valuation > 0
        AND issued_date >= (CURRENT_DATE - INTERVAL '24 months')
    `;
    const totalConstructionValuation = Number(valuationRows[0].total_val || 0);

    // 5. 90-day processing guarantee
    const guaranteeRows = await sql`
      SELECT
        count(*) as total,
        count(*) FILTER (WHERE processing_days <= 90) as under_90
      FROM housing.permits
      WHERE processing_days IS NOT NULL AND processing_days >= 0
    `;
    const pctUnder90Days = Number(guaranteeRows[0].total) > 0
      ? Math.round((Number(guaranteeRows[0].under_90) / Number(guaranteeRows[0].total)) * 100)
      : 0;

    // 6. Commercial vs residential breakdown
    const breakdownRows = await sql`
      SELECT
        CASE
          WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%'
            THEN 'Residential'
          WHEN permit_type ILIKE '%commercial%'
            THEN 'Commercial'
          WHEN permit_type ILIKE '%facility%'
            THEN 'Facility'
          ELSE 'Trade/Other'
        END AS category,
        count(*)::int AS cnt,
        count(*) FILTER (WHERE LOWER(status) IN ('issued', 'issued - uf'))::int AS active,
        sum(valuation)::bigint AS total_val,
        avg(processing_days)::int AS avg_days
      FROM housing.permits
      GROUP BY 1
      ORDER BY cnt DESC
    `;

    const permitBreakdown: PermitBreakdown[] = breakdownRows.map((r) => ({
      category: r.category as string,
      count: Number(r.cnt),
      active: Number(r.active),
      totalValuation: Number(r.total_val || 0),
      avgProcessingDays: Number(r.avg_days || 0),
    }));

    // 7. Monthly permit issuance for the last 24 months (exclude future dates)
    const monthlyTrendRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') as date,
        count(*)::int as count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date >= (CURRENT_DATE - INTERVAL '24 months')
        AND issued_date <= CURRENT_DATE
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const monthlyTrend: ChartPoint[] = monthlyTrendRows.map((row) => ({
      date: row.date as string,
      value: Number(row.count),
      label: "Permits issued",
    }));

    // 8. Build full monthly pipeline (all data, exclude future dates)
    const monthlyRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') as date,
        count(*) as count
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date <= CURRENT_DATE
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const permitPipeline: ChartPoint[] = monthlyRows.map((row) => ({
      date: row.date as string,
      value: Number(row.count),
      label: "Permits filed",
    }));

    // 9. Build monthly processing days (exclude negative/garbage and future dates)
    const processingRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') as date,
        avg(processing_days) as avg_days
      FROM housing.permits
      WHERE issued_date IS NOT NULL
        AND issued_date <= CURRENT_DATE
        AND processing_days IS NOT NULL
        AND processing_days >= 0
      GROUP BY date_trunc('month', issued_date)
      ORDER BY date_trunc('month', issued_date)
    `;

    const processingDays: ChartPoint[] = processingRows.map((row) => ({
      date: row.date as string,
      value: Math.round(Number(row.avg_days)),
      label: "Avg days to issue",
    }));

    const chartData = permitPipeline.map(({ date, value }) => ({
      date,
      value,
    }));

    // 10. FRED House Price Index (if available)
    let hpiData: ChartPoint[] = [];
    try {
      const hpiRows = await sql`
        SELECT quarter::text as date, hpi_value::float as value
        FROM housing.fred_house_price_index
        WHERE quarter >= '2010-01-01'
        ORDER BY quarter
      `;
      hpiData = hpiRows.map((r) => ({
        date: (r.date as string).slice(0, 10),
        value: Math.round(Number(r.value) * 100) / 100,
        label: "House Price Index",
      }));
    } catch {
      // Table may not exist yet
    }

    // 10b. FRED Active Listings Count (if available)
    let listingsData: ChartPoint[] = [];
    try {
      const listingsRows = await sql`
        SELECT date::text as date, value::float as value
        FROM public.fred_series
        WHERE series_id = 'ACTLISCOU38900'
          AND date >= '2017-01-01'
        ORDER BY date
      `;
      listingsData = listingsRows.map((r) => ({
        date: (r.date as string).slice(0, 10),
        value: Math.round(Number(r.value)),
        label: "Active Listings",
      }));
    } catch {
      // Table may not exist yet
    }

    // 11. Compute YoY trend from real data
    const trendRows = await sql`
      WITH periods AS (
        SELECT
          count(*) FILTER (WHERE issued_date >= (CURRENT_DATE - INTERVAL '12 months'))::int AS current_yr,
          count(*) FILTER (WHERE issued_date >= (CURRENT_DATE - INTERVAL '24 months')
                           AND issued_date < (CURRENT_DATE - INTERVAL '12 months'))::int AS prior_yr
        FROM housing.permits
        WHERE issued_date IS NOT NULL
      )
      SELECT current_yr, prior_yr,
        CASE WHEN prior_yr > 0
          THEN ROUND(((current_yr - prior_yr)::numeric / prior_yr) * 100, 1)
          ELSE 0
        END AS yoy_pct
      FROM periods
    `;
    const yoyPct = Number(trendRows[0].yoy_pct || 0);
    const trendDirection = yoyPct > 0 ? "up" : yoyPct < 0 ? "down" : "flat";

    // 12. Zillow ZORI rent data
    let zoriData: ChartPoint[] = [];
    try {
      // Restricted to the metro-level series that the Zillow loaders write.
      // The table is keyed (month, zip_code); selecting every zip_code and
      // labelling the result "Median Rent (ZORI)" would plot a mixture of
      // series under one metro-level caption.
      const zoriRows = await sql`
        SELECT month::text as date, zori::float as value
        FROM public.housing_rents
        WHERE zori IS NOT NULL
          AND zip_code = 'metro'
        ORDER BY month
      `;
      zoriData = zoriRows.map((r) => ({
        date: (r.date as string).slice(0, 10),
        value: Math.round(Number(r.value)),
        label: "Median Rent (ZORI)",
      }));
    } catch {
      // Table may not exist yet
    }

    const result: HousingData & { dataStatus: string } = {
      headline: `${totalPermits.toLocaleString()} permits processed, avg ${avgDays} days | ${unitsInPipeline} residential in pipeline`,
      headlineValue: totalPermits,
      dataStatus: "partial",
      trend: {
        direction: trendDirection as "up" | "down" | "flat",
        percentage: Math.abs(yoyPct),
        label: "vs. prior 12 months",
      },
      chartData: chartData.length > 0 ? chartData : [],
      permitPipeline: permitPipeline.length > 0 ? permitPipeline : [],
      processingDays: processingDays.length > 0 ? processingDays : [],
      medianRent: zoriData.length > 0 ? zoriData : hpiData.length > 0 ? hpiData : [],
      unitsInPipeline,
      avgProcessingTime,
      totalConstructionValuation,
      pctUnder90Days,
      permitBreakdown,
      monthlyTrend,
      source: "Portland Bureau of Development Services · PermitsNow",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalPermits.toLocaleString()} permits with status Issued or Final in the database.`,
        `${unitsInPipeline} residential permits currently active in the pipeline.`,
        `Average processing time: ${avgProcessingTime} days (last 12 months).`,
        `${pctUnder90Days}% of permits meet the 90-day processing guarantee.`,
        `Total construction valuation (24 months): $${(totalConstructionValuation / 1_000_000).toFixed(0)}M.`,
        `Breakdown: ${permitBreakdown.map((b) => `${b.category}: ${b.count.toLocaleString()}`).join(", ")}.`,
        ...(hpiData.length > 0
          ? [`FRED House Price Index: ${hpiData[hpiData.length - 1]?.value} (${hpiData[hpiData.length - 1]?.date}). ${hpiData.length} quarterly data points.`]
          : []),
        ...(listingsData.length > 0
          ? [`FRED Active Listings: ${listingsData[listingsData.length - 1]?.value.toLocaleString()} (${listingsData[listingsData.length - 1]?.date}). ${listingsData.length} monthly data points.`]
          : []),
        ...(await (async () => {
          try {
            const fhfa = await sql`SELECT year, quarter, hpi FROM housing.fhfa_hpi ORDER BY year DESC, quarter DESC LIMIT 1`;
            if (fhfa.length > 0) return [`FHFA House Price Index (Portland MSA): ${Number(fhfa[0].hpi).toFixed(1)} (Q${fhfa[0].quarter} ${fhfa[0].year}).`];
          } catch {}
          return [];
        })()),
        ...(await (async () => {
          try {
            const redfin = await sql`SELECT median_sale_price, days_on_market, period_begin FROM housing.redfin_market ORDER BY period_begin DESC LIMIT 1`;
            if (
              redfin.length > 0 &&
              redfin[0].median_sale_price &&
              isFreshSourceDate(redfin[0].period_begin, REDFIN_MAX_AGE_DAYS)
            ) {
              return [
                `Redfin Portland metro median sale price: $${Number(redfin[0].median_sale_price).toLocaleString()}, ${redfin[0].days_on_market} days on market (${toYearMonth(redfin[0].period_begin)}).`,
              ];
            }
          } catch {}
          return [];
        })()),
        ...(zoriData.length >= 2
          ? [`Portland median rent (Zillow ZORI): $${zoriData[zoriData.length - 1].value.toLocaleString()}/month (${zoriData[zoriData.length - 1].date.slice(0, 7)}). ${zoriData.length} monthly data points since ${zoriData[0].date.slice(0, 7)}.`]
          : ["Median rent data is not currently loaded."]),
      ],
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(withFreshness(result));
  } catch (error) {
    console.error("[housing] DB query failed:", error);
    return NextResponse.json(withFreshness({
      headline: "Housing data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      trend: { direction: "flat" as const, percentage: 0, label: "no data" },
      chartData: [],
      permitPipeline: [],
      processingDays: [],
      medianRent: [],
      source: "Portland Bureau of Development Services · PermitsNow",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Housing data is not available right now."],
    } as unknown as HousingData & { dataStatus: string }));
  }
}
