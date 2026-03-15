import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

const PORTLAND_POPULATION = 650_000;

interface SafetyDetailResponse {
  // 10-year monthly crime by category (Property / Person / Society)
  crimeByCategory: {
    month: string;
    property: number;
    person: number;
    society: number;
    total: number;
  }[];
  // Top offense categories (current year)
  topOffenseCategories: { name: string; count: number }[];
  // Year-over-year comparison
  yearOverYear: { current: number; prior: number; change: number } | null;
  // Hero stats
  heroStats: {
    latestMonthTotal: number;
    latestMonthLabel: string;
    ratePer1000: number;
    yoyChange: number;
    totalCurrentYear: number;
  };
  // Top neighborhoods by crime (last 12 months)
  topNeighborhoods: { name: string; count: number }[];
  // Motor vehicle theft trend
  mvtTrend: { month: string; count: number }[];
  // Graffiti from BPS
  graffitiTrend: { month: string; count: number }[] | null;
  // Key insights computed from real data
  topInsights: string[];
  dataStatus: string;
  totalRecords: number;
}

export async function GET(): Promise<NextResponse<SafetyDetailResponse>> {
  try {
    // 1. Monthly crime by category (10 years) — 613K records
    const monthlyRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', occur_date), 'YYYY-MM') AS month,
        COALESCE(count(*) FILTER (WHERE crime_against = 'Property'), 0)::int AS property,
        COALESCE(count(*) FILTER (WHERE crime_against = 'Person'), 0)::int AS person,
        COALESCE(count(*) FILTER (WHERE crime_against = 'Society'), 0)::int AS society,
        count(*)::int AS total
      FROM safety.ppb_offenses
      WHERE occur_date >= '2016-01-01' AND occur_date < '2026-02-01'
      GROUP BY 1
      ORDER BY 1
    `;

    const crimeByCategory = monthlyRows.map((r) => ({
      month: r.month as string,
      property: Number(r.property),
      person: Number(r.person),
      society: Number(r.society),
      total: Number(r.total),
    }));

    // 2. Top offense categories (current year)
    const topCatRows = await sql`
      SELECT offense_category, count(*)::int AS cnt
      FROM safety.ppb_offenses
      WHERE occur_date >= date_trunc('year', CURRENT_DATE)
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 10
    `;

    const topOffenseCategories = topCatRows.map((r) => ({
      name: r.offense_category as string,
      count: Number(r.cnt),
    }));

    // 3. Year-over-year comparison (full prior year vs year before that)
    const yoyRows = await sql`
      WITH current_yr AS (
        SELECT count(*)::int AS cnt
        FROM safety.ppb_offenses
        WHERE occur_date >= date_trunc('year', CURRENT_DATE) - interval '1 year'
          AND occur_date < date_trunc('year', CURRENT_DATE)
      ),
      prior_yr AS (
        SELECT count(*)::int AS cnt
        FROM safety.ppb_offenses
        WHERE occur_date >= date_trunc('year', CURRENT_DATE) - interval '2 years'
          AND occur_date < date_trunc('year', CURRENT_DATE) - interval '1 year'
      )
      SELECT
        current_yr.cnt AS current_count,
        prior_yr.cnt AS prior_count
      FROM current_yr, prior_yr
    `;

    let yearOverYear: SafetyDetailResponse["yearOverYear"] = null;
    if (yoyRows.length > 0) {
      const cur = Number(yoyRows[0].current_count);
      const prior = Number(yoyRows[0].prior_count);
      const change = prior > 0 ? Number((((cur - prior) / prior) * 100).toFixed(1)) : 0;
      yearOverYear = { current: cur, prior, change };
    }

    // 4. Top neighborhoods by crime (last 12 months)
    const neighborhoodRows = await sql`
      SELECT neighborhood, count(*)::int AS cnt
      FROM safety.ppb_offenses
      WHERE occur_date >= CURRENT_DATE - interval '12 months'
        AND neighborhood IS NOT NULL AND neighborhood != ''
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 10
    `;

    const topNeighborhoods = neighborhoodRows.map((r) => ({
      name: r.neighborhood as string,
      count: Number(r.cnt),
    }));

    // 5. Motor vehicle theft trend (Portland story)
    const mvtRows = await sql`
      SELECT
        TO_CHAR(date_trunc('month', occur_date), 'YYYY-MM') AS month,
        count(*)::int AS cnt
      FROM safety.ppb_offenses
      WHERE offense_category = 'Motor Vehicle Theft'
        AND occur_date >= '2016-01-01'
      GROUP BY 1
      ORDER BY 1
    `;

    const mvtTrend = mvtRows.map((r) => ({
      month: r.month as string,
      count: Number(r.cnt),
    }));

    // 6. Graffiti trend from BPS
    let graffitiTrend: SafetyDetailResponse["graffitiTrend"] = null;
    try {
      const graffitiRows = await sql`
        SELECT TO_CHAR(month, 'YYYY-MM') AS month, count::int
        FROM safety.graffiti_monthly
        ORDER BY month
      `;
      if (graffitiRows.length > 0) {
        graffitiTrend = graffitiRows.map((r) => ({
          month: r.month as string,
          count: Number(r.count),
        }));
      }
    } catch {
      // graffiti table may not exist
    }

    // 7. Total record count
    const countRows = await sql`
      SELECT count(*)::int AS cnt FROM safety.ppb_offenses
    `;
    const totalRecords = Number(countRows[0].cnt);

    // 8. Hero stats — latest complete month
    const latestMonth = crimeByCategory.length > 0
      ? crimeByCategory[crimeByCategory.length - 1]
      : null;
    const latestMonthTotal = latestMonth ? latestMonth.total : 0;
    const latestMonthLabel = latestMonth ? latestMonth.month : "N/A";
    const annualized = latestMonthTotal * 12;
    const ratePer1000 = Number(((annualized / PORTLAND_POPULATION) * 1000).toFixed(1));

    // Total for current year so far
    const currentYearTotalRows = await sql`
      SELECT count(*)::int AS cnt
      FROM safety.ppb_offenses
      WHERE occur_date >= date_trunc('year', CURRENT_DATE)
    `;
    const totalCurrentYear = Number(currentYearTotalRows[0].cnt);

    const yoyChange = yearOverYear ? yearOverYear.change : 0;

    // 9. Generate insights from real data
    const topInsights: string[] = [];

    topInsights.push(
      `${totalRecords.toLocaleString()} real Portland Police Bureau crime records (2016-2026) now powering this dashboard.`
    );

    if (latestMonth) {
      topInsights.push(
        `${latestMonthTotal.toLocaleString()} reported crimes in ${latestMonthLabel} (${ratePer1000} per 1,000 residents annualized).`
      );
    }

    if (yearOverYear) {
      const dir = yearOverYear.change < 0 ? "down" : "up";
      topInsights.push(
        `Full-year crime is ${dir} ${Math.abs(yearOverYear.change)}% — ${yearOverYear.current.toLocaleString()} offenses (${
          yearOverYear.current > yearOverYear.prior ? "vs" : "down from"
        } ${yearOverYear.prior.toLocaleString()} prior year).`
      );
    }

    if (topOffenseCategories.length > 0) {
      const top3 = topOffenseCategories.slice(0, 3).map((c) => c.name).join(", ");
      topInsights.push(
        `Top offense categories this year: ${top3}.`
      );
    }

    // MVT peak insight
    if (mvtTrend.length > 0) {
      const peak = mvtTrend.reduce((max, r) => (r.count > max.count ? r : max), mvtTrend[0]);
      const recent = mvtTrend[mvtTrend.length - 1];
      const pctFromPeak = peak.count > 0
        ? Math.round(((peak.count - recent.count) / peak.count) * 100)
        : 0;
      topInsights.push(
        `Motor vehicle theft peaked at ${peak.count.toLocaleString()}/month (${peak.month}) and is now ${pctFromPeak}% below that peak.`
      );
    }

    if (topNeighborhoods.length > 0) {
      topInsights.push(
        `${topNeighborhoods[0].name} leads in reported crime over the last 12 months (${topNeighborhoods[0].count.toLocaleString()} offenses).`
      );
    }

    topInsights.push(
      "911 response times are unavailable — requires public records request to BOEC."
    );

    const result: SafetyDetailResponse = {
      crimeByCategory,
      topOffenseCategories,
      yearOverYear,
      heroStats: {
        latestMonthTotal,
        latestMonthLabel,
        ratePer1000,
        yoyChange,
        totalCurrentYear,
      },
      topNeighborhoods,
      mvtTrend,
      graffitiTrend,
      topInsights,
      dataStatus: "live",
      totalRecords,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[safety/detail] DB query failed:", error);
    return NextResponse.json({
      crimeByCategory: [],
      topOffenseCategories: [],
      yearOverYear: null,
      heroStats: {
        latestMonthTotal: 0,
        latestMonthLabel: "N/A",
        ratePer1000: 0,
        yoyChange: 0,
        totalCurrentYear: 0,
      },
      topNeighborhoods: [],
      mvtTrend: [],
      graffitiTrend: null,
      topInsights: ["Data temporarily unavailable."],
      dataStatus: "unavailable",
      totalRecords: 0,
    });
  }
}
