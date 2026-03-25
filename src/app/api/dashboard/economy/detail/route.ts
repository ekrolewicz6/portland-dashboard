import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface QuarterlyRow {
  quarter: string;
  total: number;
  llcs: number;
  corps: number;
  nonprofits: number;
}

interface EntityRow {
  entity_type: string;
  cnt: number;
}

interface TotalRow {
  total: number;
}

interface YearlyRow {
  yr: number;
  cnt: number;
}

interface BLSRow {
  year: number;
  period: string;
  period_name: string;
  value: number;
}

interface VacancyRow {
  office_vacancy: number;
  retail_vacancy: number;
  quarter: string;
}

export async function GET() {
  try {
    const [totalRows, quarterlyRows, entityRows, yearlyRows, unemploymentRows, employmentRows] =
      await Promise.all([
        sql<TotalRow[]>`
          SELECT count(DISTINCT registry_number)::int as total
          FROM business.oregon_sos_all_active
        `,
        sql<QuarterlyRow[]>`
          SELECT date_trunc('quarter', registry_date)::date::text as quarter,
            count(DISTINCT registry_number)::int as total,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%limited liability%')::int as llcs,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%business corporation%')::int as corps,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%nonprofit%')::int as nonprofits
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01' AND registry_date < '2026-04-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<EntityRow[]>`
          SELECT entity_type, count(DISTINCT registry_number)::int as cnt
          FROM business.oregon_sos_all_active
          GROUP BY 1 ORDER BY cnt DESC
        `,
        sql<YearlyRow[]>`
          SELECT EXTRACT(YEAR FROM registry_date)::int as yr,
                 count(DISTINCT registry_number)::int as cnt
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<BLSRow[]>`
          SELECT year, period, period_name, value::numeric as value
          FROM business.bls_employment_series
          WHERE series_id = 'LAUMT413890000000003'
          ORDER BY year DESC, period DESC
          LIMIT 36
        `,
        sql<BLSRow[]>`
          SELECT year, period, period_name, value::numeric as value
          FROM business.bls_employment_series
          WHERE series_id = 'LAUMT413890000000006'
          ORDER BY year DESC, period DESC
          LIMIT 36
        `,
      ]);

    const totalActive = totalRows[0]?.total ?? 0;

    // Current quarter registrations
    const currentQuarter =
      quarterlyRows.length > 0 ? quarterlyRows[quarterlyRows.length - 1] : null;
    const newThisQuarter = currentQuarter?.total ?? 0;

    // YoY growth multiple
    const sortedYears = [...yearlyRows].sort((a, b) => a.yr - b.yr);
    const firstFullYear = sortedYears.find((y) => y.yr === 2016);
    const lastFullYear = sortedYears.find((y) => y.yr === 2025);
    const yoyGrowthMultiple =
      firstFullYear && lastFullYear && firstFullYear.cnt > 0
        ? Math.round((lastFullYear.cnt / firstFullYear.cnt) * 10) / 10
        : 0;

    // Simplify entity type names and aggregate
    const entityNameMap: Record<string, string> = {};
    for (const row of entityRows) {
      const name = row.entity_type;
      let label = name;
      if (name.toLowerCase().includes("limited liability")) label = "LLC";
      else if (name.toLowerCase().includes("assumed")) label = "Assumed Business Name";
      else if (name.toLowerCase().includes("nonprofit")) label = "Nonprofit";
      else if (
        name.toLowerCase().includes("business corporation") &&
        !name.toLowerCase().includes("foreign")
      )
        label = "Business Corporation";
      else if (
        name.toLowerCase().includes("foreign") &&
        name.toLowerCase().includes("limited liability")
      )
        label = "Foreign LLC";
      else if (
        name.toLowerCase().includes("foreign") &&
        name.toLowerCase().includes("business corporation")
      )
        label = "Foreign Business Corp";
      else if (name.toLowerCase().includes("limited partnership"))
        label = "Limited Partnership";
      else if (name.toLowerCase().includes("professional")) label = "Professional Corp";
      entityNameMap[name] = label;
    }

    const entityAgg: Record<string, number> = {};
    for (const row of entityRows) {
      const label = entityNameMap[row.entity_type] ?? row.entity_type;
      entityAgg[label] = (entityAgg[label] ?? 0) + row.cnt;
    }
    const entityBreakdown = Object.entries(entityAgg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Quarterly trend
    const quarterlyTrend = quarterlyRows.map((r) => ({
      quarter: r.quarter,
      total: r.total,
      llcs: r.llcs,
      corps: r.corps,
      nonprofits: r.nonprofits,
    }));

    // BLS unemployment trend (reverse to chronological order)
    const unemploymentTrend = [...unemploymentRows].reverse().map((r) => ({
      month: `${r.period_name} ${r.year}`,
      rate: Number(r.value),
    }));

    // BLS employment trend (reverse to chronological order)
    const employmentTrend = [...employmentRows].reverse().map((r) => ({
      month: `${r.period_name} ${r.year}`,
      level: Number(r.value),
    }));

    // QCEW employment & wages by industry (optional table)
    let qcewEmployment: {
      quarter: string;
      totalEmployment: number;
      avgWeeklyWage: number;
      totalWages: number;
      industries: { code: string; title: string; employment: number; avgWage: number; establishments: number }[];
    }[] = [];
    let qcewTrend: { quarter: string; employment: number; avgWage: number; establishments: number }[] = [];
    let establishmentChanges: { industry: string; peakEstablishments: number; currentEstablishments: number; change: number; pctChange: number }[] = [];
    let otherServicesBreakdown: { code: string; title: string; establishments: number; employment: number; avgWage: number; avgSize: number }[] = [];
    let establishmentSizes: { sector: string; establishments: number; employment: number; avgSize: number }[] = [];
    let detailedIndustryChanges: { code: string; title: string; peakEstablishments: number; currentEstablishments: number; change: number; pctChange: number; employment: number; avgWage: number; avgSize: number }[] = [];
    let since2019TopGrowers: { title: string; change: number; pctChange: number }[] = [];

    try {
      // Latest quarter industry breakdown
      const latestQcew = await sql`
        SELECT industry_code, industry_title, month3_employment, avg_weekly_wage, establishments, total_quarterly_wages,
               year, quarter
        FROM economy.qcew_employment
        WHERE (year, quarter) = (
          SELECT year, quarter FROM economy.qcew_employment ORDER BY year DESC, quarter DESC LIMIT 1
        )
        ORDER BY month3_employment DESC
      `;
      if (latestQcew.length > 0) {
        const totalRow = latestQcew.find((r) => r.industry_code === "10");
        const industries = latestQcew
          .filter((r) => !["10", "101", "102"].includes(r.industry_code as string))
          .map((r) => ({
            code: r.industry_code as string,
            title: r.industry_title as string,
            employment: Number(r.month3_employment),
            avgWage: Number(r.avg_weekly_wage),
            establishments: Number(r.establishments),
          }));
        qcewEmployment = [{
          quarter: `${latestQcew[0].year} Q${latestQcew[0].quarter}`,
          totalEmployment: totalRow ? Number(totalRow.month3_employment) : 0,
          avgWeeklyWage: totalRow ? Number(totalRow.avg_weekly_wage) : 0,
          totalWages: totalRow ? Number(totalRow.total_quarterly_wages) : 0,
          industries,
        }];
      }

      // 10-year quarterly trend (total private employment)
      const trendRows = await sql`
        SELECT year, quarter, month3_employment, avg_weekly_wage, establishments
        FROM economy.qcew_employment
        WHERE industry_code = '10'
        ORDER BY year, quarter
      `;
      qcewTrend = trendRows.map((r) => ({
        quarter: `${r.year} Q${r.quarter}`,
        employment: Number(r.month3_employment),
        avgWage: Number(r.avg_weekly_wage),
        establishments: Number(r.establishments),
      }));

      // Establishment change by industry (peak vs latest)
      const estChangeRows = await sql`
        WITH peak AS (
          SELECT industry_code, industry_title, MAX(establishments) as peak_est
          FROM economy.qcew_employment
          WHERE industry_code NOT IN ('10','101','102')
          GROUP BY industry_code, industry_title
        ),
        latest AS (
          SELECT industry_code, establishments as current_est
          FROM economy.qcew_employment
          WHERE (year, quarter) = (SELECT year, quarter FROM economy.qcew_employment ORDER BY year DESC, quarter DESC LIMIT 1)
          AND industry_code NOT IN ('10','101','102')
        )
        SELECT p.industry_title, p.peak_est::int, l.current_est::int,
          (l.current_est - p.peak_est)::int as change,
          ROUND(100.0 * (l.current_est - p.peak_est) / NULLIF(p.peak_est, 0), 1)::float as pct_change
        FROM peak p JOIN latest l ON p.industry_code = l.industry_code
        WHERE p.industry_title != 'Unclassified'
        ORDER BY pct_change ASC
      `;
      establishmentChanges = estChangeRows.map((r) => ({
        industry: r.industry_title as string,
        peakEstablishments: Number(r.peak_est),
        currentEstablishments: Number(r.current_est),
        change: Number(r.change),
        pctChange: Number(r.pct_change),
      }));

      // Sub-industry breakdown for "Other services" (NAICS 81x)
      const subIndustryRows = await sql`
        SELECT industry_code, industry_title, establishments, month3_employment,
               avg_weekly_wage, avg_establishment_size
        FROM economy.qcew_detailed
        WHERE (year, quarter) = (SELECT year, quarter FROM economy.qcew_detailed ORDER BY year DESC, quarter DESC LIMIT 1)
          AND industry_code SIMILAR TO '81[1-4]'
          AND naics_level = 3
        ORDER BY establishments DESC
      `;
      otherServicesBreakdown = subIndustryRows.map((r) => ({
        code: r.industry_code as string,
        title: r.industry_title as string,
        establishments: Number(r.establishments),
        employment: Number(r.month3_employment),
        avgWage: Number(r.avg_weekly_wage),
        avgSize: Number(r.avg_establishment_size),
      }));

      // Detailed 3-digit NAICS industry change — TWO time windows
      const latestQtrRow = await sql`SELECT year, quarter FROM economy.qcew_detailed ORDER BY year DESC, quarter DESC LIMIT 1`;
      const lYear = latestQtrRow[0]?.year ?? 2025;
      const lQtr = latestQtrRow[0]?.quarter ?? 3;

      // Recent trend: 2023 Q3 → latest (captures the current contraction)
      const detailedChangeRows = await sql`
        SELECT
          d2.industry_code, d2.industry_title,
          d1.establishments::int as baseline_est,
          d2.establishments::int as current_est,
          (d2.establishments - d1.establishments)::int as change,
          ROUND(100.0 * (d2.establishments - d1.establishments) / NULLIF(d1.establishments, 0), 1)::float as pct_change,
          d2.month3_employment::int as employment,
          d2.avg_weekly_wage::int as avg_wage,
          d2.avg_establishment_size::float as avg_size
        FROM economy.qcew_detailed d1
        JOIN economy.qcew_detailed d2 ON d1.industry_code = d2.industry_code
        WHERE d1.year = 2023 AND d1.quarter = ${lQtr}
          AND d2.year = ${lYear} AND d2.quarter = ${lQtr}
          AND d1.naics_level = 3 AND d2.naics_level = 3
          AND d1.establishments > 20
          AND d1.industry_code NOT IN ('999', '814')
        ORDER BY pct_change ASC
      `;

      // Also compute since-2019 for longer-term context
      const since2019Rows = await sql`
        SELECT
          d2.industry_code, d2.industry_title,
          d1.establishments::int as baseline_est,
          d2.establishments::int as current_est,
          (d2.establishments - d1.establishments)::int as change,
          ROUND(100.0 * (d2.establishments - d1.establishments) / NULLIF(d1.establishments, 0), 1)::float as pct_change
        FROM economy.qcew_detailed d1
        JOIN economy.qcew_detailed d2 ON d1.industry_code = d2.industry_code
        WHERE d1.year = 2019 AND d1.quarter = ${lQtr}
          AND d2.year = ${lYear} AND d2.quarter = ${lQtr}
          AND d1.naics_level = 3 AND d2.naics_level = 3
          AND d1.establishments > 20
          AND d1.industry_code NOT IN ('999', '814')
        ORDER BY change DESC
        LIMIT 5
      `;
      since2019TopGrowers = since2019Rows.map((r) => ({
        title: r.industry_title as string,
        change: Number(r.change),
        pctChange: Number(r.pct_change),
      }));
      detailedIndustryChanges = detailedChangeRows.map((r) => ({
        code: r.industry_code as string,
        title: r.industry_title as string,
        peakEstablishments: Number(r.baseline_est),
        currentEstablishments: Number(r.current_est),
        change: Number(r.change),
        pctChange: Number(r.pct_change),
        employment: Number(r.employment),
        avgWage: Number(r.avg_wage),
        avgSize: Number(r.avg_size),
      }));

      // Avg establishment size by supersector (for context)
      const sizeRows = await sql`
        SELECT parent_supersector as sector,
          SUM(establishments)::int as estabs,
          SUM(month3_employment)::int as employment,
          ROUND(SUM(month3_employment)::numeric / NULLIF(SUM(establishments), 0), 1)::float as avg_size
        FROM economy.qcew_detailed
        WHERE (year, quarter) = (SELECT year, quarter FROM economy.qcew_detailed ORDER BY year DESC, quarter DESC LIMIT 1)
          AND naics_level = 3
          AND parent_supersector NOT IN ('Other', 'Unclassified')
        GROUP BY parent_supersector
        ORDER BY avg_size DESC
      `;
      establishmentSizes = sizeRows.map((r) => ({
        sector: r.sector as string,
        establishments: Number(r.estabs),
        employment: Number(r.employment),
        avgSize: Number(r.avg_size),
      }));
    } catch {
      // economy.qcew_employment may not exist
    }

    // Portland CPI data for real wage calculation
    // Portland-Salem-Corvallis CPI (CUURS49BSA0), bimonthly
    // We use a simplified annual CPI index to deflate wages to 2016 dollars
    // These are published BLS CPI values (Feb reading of each year)
    const cpiByYear: Record<number, number> = {
      2016: 262.6,
      2017: 271.6,
      2018: 281.3,
      2019: 291.2,
      2020: 299.7,
      2021: 304.4,
      2022: 320.2,
      2023: 337.2,
      2024: 345.2,
      2025: 354.4,
      2026: 362.0, // estimate
    };
    const baseCpi = cpiByYear[2016];

    // Compute real (inflation-adjusted) wages for each quarter
    const realWageTrend = (qcewTrend || []).map((q) => {
      const year = parseInt(q.quarter.split(" ")[0]);
      const cpi = cpiByYear[year] ?? cpiByYear[2025];
      const realWage = Math.round(q.avgWage * (baseCpi / cpi));
      return {
        quarter: q.quarter,
        nominalWage: q.avgWage,
        realWage,
      };
    });

    // Geographic economic inequality data (pre-computed from Census ACS tracts)
    let neighborhoodEconomy: { name: string; medianIncome: number | null; povertyRate: number | null; population?: number }[] = [];
    try {
      const neighborhoodIncomeRows = await sql`
        SELECT neighborhood AS name, median_income, poverty_rate, population
        FROM economy.neighborhood_income
        WHERE year = (SELECT MAX(year) FROM economy.neighborhood_income)
        ORDER BY median_income DESC
      `;
      neighborhoodEconomy = neighborhoodIncomeRows.map((r) => ({
        name: r.name as string,
        medianIncome: r.median_income ? Number(r.median_income) : null,
        povertyRate: r.poverty_rate ? Number(r.poverty_rate) : null,
        population: r.population ? Number(r.population) : undefined,
      }));
    } catch {
      // economy.neighborhood_income may not exist yet — run scripts/fetch-census-tracts.ts
    }

    // Downtown vacancy data (optional table)
    let latestVacancy: { office: number; retail: number; quarter: string } | null = null;
    try {
      const vacancyRows = await sql<VacancyRow[]>`
        SELECT office_vacancy::numeric as office_vacancy,
               retail_vacancy::numeric as retail_vacancy,
               quarter::text as quarter
        FROM downtown.vacancy_real
        ORDER BY quarter DESC
        LIMIT 1
      `;
      if (vacancyRows.length > 0) {
        latestVacancy = {
          office: Number(vacancyRows[0].office_vacancy),
          retail: Number(vacancyRows[0].retail_vacancy),
          quarter: vacancyRows[0].quarter,
        };
      }
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      businessStats: {
        totalActive,
        newThisQuarter,
        yoyGrowthMultiple,
      },
      quarterlyTrend,
      entityBreakdown,
      unemploymentTrend,
      employmentTrend,
      latestVacancy,
      qcewEmployment,
      qcewTrend,
      establishmentChanges,
      otherServicesBreakdown,
      establishmentSizes,
      detailedIndustryChanges,
      since2019TopGrowers,
      realWageTrend,
      neighborhoodEconomy,
      dataStatus: "live",
    });
  } catch (err) {
    console.error("Economy detail API error:", err);
    return NextResponse.json(
      {
        businessStats: {
          totalActive: 0,
          newThisQuarter: 0,
          yoyGrowthMultiple: 0,
        },
        quarterlyTrend: [],
        entityBreakdown: [],
        unemploymentTrend: [],
        employmentTrend: [],
        latestVacancy: null,
        qcewEmployment: [],
        qcewTrend: [],
        establishmentChanges: [],
        otherServicesBreakdown: [],
        establishmentSizes: [],
        detailedIndustryChanges: [],
        since2019TopGrowers: [],
        realWageTrend: [],
        neighborhoodEconomy: [],
        dataStatus: "error",
      },
      { status: 500 }
    );
  }
}
