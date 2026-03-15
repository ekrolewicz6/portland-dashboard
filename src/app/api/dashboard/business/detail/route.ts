import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface YearlyRow {
  year: number;
  reg_count: number;
}

interface EntityTypeRow {
  entity_type: string;
  count: number;
}

interface StatsRow {
  key: string;
  value: number;
}

interface NewBizRow {
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  address: string | null;
  city: string | null;
  zip: string | null;
}

interface QCEWRow {
  measure: string;
  year: number;
  month: number;
  value: number;
  period_name: string;
}

interface CBPRow {
  year: number;
  establishments: number;
  size_label: string;
  size_code: string;
}

export async function GET() {
  try {
    // ── Oregon SOS data ──
    const [statsRows, yearlyRows, entityRows, newBizRows] = await Promise.all([
      sql<StatsRow[]>`
        SELECT key, value::int as value FROM business.oregon_sos_stats
      `.catch(() => [] as StatsRow[]),
      sql<YearlyRow[]>`
        SELECT year, reg_count FROM business.oregon_sos_yearly ORDER BY year
      `.catch(() => [] as YearlyRow[]),
      sql<EntityTypeRow[]>`
        SELECT entity_type, count FROM business.oregon_sos_entity_types ORDER BY count DESC
      `.catch(() => [] as EntityTypeRow[]),
      sql<NewBizRow[]>`
        SELECT registry_number, business_name, entity_type, registry_date::text, address, city, zip
        FROM business.oregon_sos_new_monthly
        ORDER BY registry_date DESC LIMIT 500
      `.catch(() => [] as NewBizRow[]),
    ]);

    // ── BLS/Census data (secondary) ──
    const [qcewRows, cbpAllRows] = await Promise.all([
      sql<QCEWRow[]>`
        SELECT measure, year, month, value::float as value, period_name
        FROM business.bls_employment
        ORDER BY year, month
      `.catch(() => [] as QCEWRow[]),
      sql<CBPRow[]>`
        SELECT year, establishments, size_label, size_code
        FROM business.census_cbp
        ORDER BY year, size_code
      `.catch(() => [] as CBPRow[]),
    ]);

    const hasData =
      yearlyRows.length > 0 ||
      statsRows.length > 0 ||
      qcewRows.length > 0 ||
      cbpAllRows.length > 0;

    if (!hasData) {
      return NextResponse.json({
        oregonSOS: null,
        formationTrend: null,
        yearlyTotals: null,
        cumulativeFormation: null,
        establishmentsBySize: null,
        employmentTrend: null,
        newBusinesses: null,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          {
            name: "Oregon SOS / BLS / Census",
            status: "not_loaded",
            provider: "Multiple",
            action: "Run: npx tsx scripts/fetch-oregon-businesses.ts && npx tsx scripts/fetch-business-data.ts",
          },
        ],
      });
    }

    // ── Oregon SOS data ──
    const totalActive = statsRows.find((r) => r.key === "total_portland_active")?.value ?? 0;
    const newMonthlyCount = statsRows.find((r) => r.key === "new_monthly_count")?.value ?? 0;

    // Formation trend from Oregon SOS yearly registrations
    const formationTrend = yearlyRows.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.reg_count,
      label: `${r.year} (Oregon SOS registrations)`,
    }));

    // Entity type breakdown
    const entityTypeBreakdown = entityRows.map((r) => ({
      entityType: r.entity_type,
      count: r.count,
      pctOfTotal: totalActive > 0 ? Math.round((r.count / totalActive) * 1000) / 10 : 0,
    }));

    // New businesses detail
    const newBusinesses = newBizRows.map((r) => ({
      registryNumber: r.registry_number,
      name: r.business_name,
      type: r.entity_type,
      date: r.registry_date,
      address: r.address,
      city: r.city,
      zip: r.zip,
    }));

    // ── BLS QCEW data ──
    const estabRows = qcewRows.filter(
      (r) =>
        r.measure === "private_establishments" ||
        r.measure === "total_establishments"
    );
    const qcewFormation = estabRows.map((r) => ({
      date: `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      value: r.value,
      label: `${r.period_name} ${r.year} (${r.measure.replace("_", " ")})`,
    }));

    // ── Census CBP data ──
    const cbpTotals = cbpAllRows.filter((r) => r.size_code === "001");
    const yearlyTotals = cbpTotals.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.establishments,
      label: `${r.year}`,
    }));

    const cumulativeFormation = cbpTotals.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.establishments,
      label: `${r.year} total`,
    }));

    // Establishments by size (latest year)
    const latestYear = cbpAllRows.length > 0
      ? Math.max(...cbpAllRows.map((r) => r.year))
      : 0;
    const latestBySize = cbpAllRows
      .filter((r) => r.year === latestYear && r.size_code !== "001")
      .map((r) => ({
        sizeClass: r.size_label,
        sizeCode: r.size_code,
        count: r.establishments,
      }));

    // Employment trend from QCEW
    const emplRows = qcewRows.filter(
      (r) =>
        r.measure === "private_employment" ||
        r.measure === "total_employment"
    );
    const employmentTrend = emplRows.map((r) => ({
      date: `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      value: r.value,
      label: `${r.period_name} ${r.year} (${r.measure.replace("_", " ")})`,
    }));

    return NextResponse.json({
      // Oregon SOS (primary)
      oregonSOS: {
        totalActivePortland: totalActive,
        newMonthlyCount,
        entityTypeBreakdown,
        registrationsByYear: formationTrend,
        newBusinesses,
        source: "Oregon Secretary of State via data.oregon.gov",
        datasets: { active: "tckn-sxa6", newMonthly: "esjy-u4fc" },
      },
      // BLS / Census (secondary)
      formationTrend: qcewFormation.length > 0 ? qcewFormation : formationTrend,
      yearlyTotals,
      cumulativeFormation,
      establishmentsBySize: latestBySize.length > 0 ? latestBySize : null,
      establishmentsBySizeYear: latestYear || null,
      employmentTrend,
      dataStatus: "available",
      dataAvailable: true,
      dataSources: [
        {
          name: "Oregon Secretary of State Business Registry",
          status: "connected",
          provider: "data.oregon.gov (Socrata)",
          action: `${totalActive.toLocaleString()} active Portland businesses`,
        },
        ...(qcewRows.length > 0
          ? [
              {
                name: "BLS Quarterly Census of Employment and Wages",
                status: "connected",
                provider: "Bureau of Labor Statistics",
                action: "Quarterly data for Multnomah County (FIPS 41051)",
              },
            ]
          : []),
        ...(cbpAllRows.length > 0
          ? [
              {
                name: "Census County Business Patterns",
                status: "connected",
                provider: "U.S. Census Bureau",
                action: "Annual establishment counts by size class",
              },
            ]
          : []),
      ],
    });
  } catch (err) {
    console.error("Business detail API error:", err);
    return NextResponse.json({
      oregonSOS: null,
      formationTrend: null,
      yearlyTotals: null,
      cumulativeFormation: null,
      establishmentsBySize: null,
      employmentTrend: null,
      newBusinesses: null,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
    });
  }
}
