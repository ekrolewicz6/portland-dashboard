import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

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
    // Fetch QCEW establishment data
    const qcewRows = await sql<QCEWRow[]>`
      SELECT measure, year, month, value::float as value, period_name
      FROM business.bls_employment
      ORDER BY year, month
    `;

    // Fetch Census CBP data by size class for the latest year
    const cbpAllRows = await sql<CBPRow[]>`
      SELECT year, establishments, size_label, size_code
      FROM business.census_cbp
      ORDER BY year, size_code
    `;

    const hasData = qcewRows.length > 0 || cbpAllRows.length > 0;

    if (!hasData) {
      return NextResponse.json({
        formationTrend: null,
        yearlyTotals: null,
        cumulativeFormation: null,
        establishmentsBySize: null,
        employmentTrend: null,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          {
            name: "BLS QCEW / Census CBP",
            status: "not_loaded",
            provider: "Federal Government",
            action: "Run: npx tsx scripts/fetch-business-data.ts",
          },
        ],
      });
    }

    // Formation trend: quarterly establishment counts
    const estabRows = qcewRows.filter(
      (r) =>
        r.measure === "private_establishments" ||
        r.measure === "total_establishments"
    );

    const formationTrend = estabRows.map((r) => ({
      date: `${r.year}-${String(r.month).padStart(2, "0")}-01`,
      value: r.value,
      label: `${r.period_name} ${r.year} (${r.measure.replace("_", " ")})`,
    }));

    // Yearly totals from Census CBP (total establishments, size_code = "001")
    const cbpTotals = cbpAllRows.filter(
      (r) => r.size_code === "001"
    );
    const yearlyTotals = cbpTotals.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.establishments,
      label: `${r.year}`,
    }));

    // Cumulative formation proxy: use CBP total over time
    const cumulativeFormation = cbpTotals.map((r) => ({
      date: `${r.year}-01-01`,
      value: r.establishments,
      label: `${r.year} total`,
    }));

    // Establishments by employee size (latest year)
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
      formationTrend,
      yearlyTotals,
      cumulativeFormation,
      establishmentsBySize: latestBySize.length > 0 ? latestBySize : null,
      establishmentsBySizeYear: latestYear || null,
      employmentTrend,
      dataStatus: "available",
      dataAvailable: true,
      dataSources: [
        {
          name: "BLS Quarterly Census of Employment and Wages",
          status: "connected",
          provider: "Bureau of Labor Statistics",
          action:
            "Quarterly data for Multnomah County (FIPS 41051)",
        },
        {
          name: "Census County Business Patterns",
          status: "connected",
          provider: "U.S. Census Bureau",
          action: "Annual establishment counts by size class (2018–2022)",
        },
      ],
    });
  } catch (err) {
    console.error("Business detail API error:", err);
    return NextResponse.json({
      formationTrend: null,
      yearlyTotals: null,
      cumulativeFormation: null,
      establishmentsBySize: null,
      employmentTrend: null,
      dataStatus: "error",
      dataAvailable: false,
      dataSources: [],
    });
  }
}
