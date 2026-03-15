import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface QuarterlyRow {
  quarter: string;
  total: number;
  llcs: number;
  corps: number;
  nonprofits: number;
  assumed_names: number;
}

interface EntityRow {
  entity_type: string;
  cnt: number;
}

interface ZipRow {
  zip: string;
  cnt: number;
}

interface YearlyRow {
  yr: number;
  cnt: number;
}

interface TotalRow {
  total: number;
}

export async function GET() {
  try {
    const [quarterlyRows, entityRows, zipRows, yearlyRows, totalRows] =
      await Promise.all([
        sql<QuarterlyRow[]>`
          SELECT date_trunc('quarter', registry_date)::date::text as quarter,
            count(DISTINCT registry_number)::int as total,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%limited liability%')::int as llcs,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%business corporation%')::int as corps,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%nonprofit%')::int as nonprofits,
            count(DISTINCT registry_number) FILTER (WHERE entity_type ILIKE '%assumed%')::int as assumed_names
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01' AND registry_date < '2026-04-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<EntityRow[]>`
          SELECT entity_type, count(DISTINCT registry_number)::int as cnt
          FROM business.oregon_sos_all_active
          GROUP BY 1 ORDER BY cnt DESC
        `,
        sql<ZipRow[]>`
          SELECT zip, count(DISTINCT registry_number)::int as cnt
          FROM business.oregon_sos_all_active
          WHERE zip IS NOT NULL AND zip != ''
          GROUP BY 1 ORDER BY cnt DESC LIMIT 10
        `,
        sql<YearlyRow[]>`
          SELECT EXTRACT(YEAR FROM registry_date)::int as yr, count(DISTINCT registry_number)::int as cnt
          FROM business.oregon_sos_all_active
          WHERE registry_date >= '2016-01-01'
          GROUP BY 1 ORDER BY 1
        `,
        sql<TotalRow[]>`
          SELECT count(DISTINCT registry_number)::int as total FROM business.oregon_sos_all_active
        `,
      ]);

    // Compute survival rate analysis
    // Method: use the most recent full year (2025) as ~100% baseline
    // Then calculate what fraction of each older year's businesses are still active
    const survivalInsight = (() => {
      const y2025 = yearlyRows.find(y => y.yr === 2025);
      const y2020 = yearlyRows.find(y => y.yr === 2020);
      const y2016 = yearlyRows.find(y => y.yr === 2016);
      if (!y2025) return null;

      // Estimated survival: if we assume each year had roughly similar registration volume
      // to 2025, the ratio still_active/2025_active gives implied survival
      // But this is misleading because registration volumes DID change

      // Better: just state the facts
      return {
        note: "This dataset only contains CURRENTLY ACTIVE businesses. Businesses that were registered but have since dissolved, cancelled, or expired are NOT included. Older years appear to have fewer registrations because many businesses from those years have since closed.",
        y2016_active: y2016?.cnt ?? 0,
        y2020_active: y2020?.cnt ?? 0,
        y2025_active: y2025?.cnt ?? 0,
      };
    })();

    const totalActive = totalRows[0]?.total ?? 0;

    // Current quarter registrations (Q1 2026 = Jan-Mar 2026)
    const currentQuarter = quarterlyRows.length > 0
      ? quarterlyRows[quarterlyRows.length - 1]
      : null;
    const newThisQuarter = currentQuarter?.total ?? 0;

    // Top entity type
    const topEntity = entityRows[0];
    const topEntityPct =
      totalActive > 0 && topEntity
        ? Math.round((topEntity.cnt / totalActive) * 100)
        : 0;

    // Simplify entity type names for display
    const entityNameMap: Record<string, string> = {};
    for (const row of entityRows) {
      const name = row.entity_type;
      let label = name;
      if (name.toLowerCase().includes("limited liability")) label = "LLC";
      else if (name.toLowerCase().includes("assumed")) label = "Assumed Business Name";
      else if (name.toLowerCase().includes("nonprofit")) label = "Nonprofit";
      else if (name.toLowerCase().includes("business corporation") && !name.toLowerCase().includes("foreign"))
        label = "Business Corporation";
      else if (name.toLowerCase().includes("foreign") && name.toLowerCase().includes("limited liability"))
        label = "Foreign LLC";
      else if (name.toLowerCase().includes("foreign") && name.toLowerCase().includes("business corporation"))
        label = "Foreign Business Corp";
      else if (name.toLowerCase().includes("limited partnership"))
        label = "Limited Partnership";
      else if (name.toLowerCase().includes("professional"))
        label = "Professional Corp";
      entityNameMap[name] = label;
    }

    // Aggregate entity types by simplified label
    const entityAgg: Record<string, number> = {};
    for (const row of entityRows) {
      const label = entityNameMap[row.entity_type] ?? row.entity_type;
      entityAgg[label] = (entityAgg[label] ?? 0) + row.cnt;
    }
    const entityBreakdown = Object.entries(entityAgg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top entity type label for hero stat
    const topEntityLabel = entityBreakdown[0]?.name ?? "LLC";

    // Year-over-year growth
    const yearlyTotals = yearlyRows.map((r) => ({
      year: r.yr,
      count: r.cnt,
    }));

    // Quarterly trend
    const quarterlyTrend = quarterlyRows.map((r) => ({
      quarter: r.quarter,
      total: r.total,
      llcs: r.llcs,
      corps: r.corps,
      nonprofits: r.nonprofits,
      assumedNames: r.assumed_names,
    }));

    // Top ZIP codes
    const topZipCodes = zipRows.map((r) => ({
      zip: r.zip,
      count: r.cnt,
    }));

    // YoY growth for hero stat
    const sortedYears = [...yearlyTotals].sort((a, b) => a.year - b.year);
    const firstFullYear = sortedYears.find((y) => y.year === 2016);
    const lastFullYear = sortedYears.find((y) => y.year === 2025);
    const yoyGrowthMultiple =
      firstFullYear && lastFullYear && firstFullYear.count > 0
        ? Math.round((lastFullYear.count / firstFullYear.count) * 10) / 10
        : 0;

    return NextResponse.json({
      quarterlyTrend,
      entityBreakdown,
      topZipCodes,
      yearlyTotals,
      survivalInsight,
      heroStats: {
        totalActive,
        newThisQuarter,
        topEntityType: topEntityLabel,
        topEntityPct,
        yoyGrowthMultiple,
        firstYear: firstFullYear?.count ?? 0,
        lastYear: lastFullYear?.count ?? 0,
      },
      dataStatus: "live",
    });
  } catch (err) {
    console.error("Business detail API error:", err);
    return NextResponse.json(
      {
        quarterlyTrend: [],
        entityBreakdown: [],
        topZipCodes: [],
        yearlyTotals: [],
        heroStats: {
          totalActive: 0,
          newThisQuarter: 0,
          topEntityType: "LLC",
          topEntityPct: 0,
          yoyGrowthMultiple: 0,
          firstYear: 0,
          lastYear: 0,
        },
        dataStatus: "error",
      },
      { status: 500 }
    );
  }
}
