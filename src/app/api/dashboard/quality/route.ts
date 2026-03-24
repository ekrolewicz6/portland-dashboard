import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Parks: count and total acreage
    const parkRows = await sql`
      SELECT count(*)::int AS total_parks,
             COALESCE(round(sum(acres)::numeric, 0), 0)::int AS total_acres
      FROM quality.parks
    `;
    const totalParks = Number(parkRows[0].total_parks);
    const totalAcres = Number(parkRows[0].total_acres);

    // Pavement: average PCI
    const pciRows = await sql`
      SELECT round(avg(pci)::numeric, 0)::int AS avg_pci
      FROM quality.pavement_condition
    `;
    const avgPci = Number(pciRows[0].avg_pci);

    // PCI rating label
    const pciLabel =
      avgPci >= 70 ? "Good" : avgPci >= 40 ? "Fair" : "Poor";

    // Library: latest fiscal year visits
    const libRows = await sql`
      SELECT fiscal_year, sum(visits)::int AS total_visits
      FROM quality.library_stats
      GROUP BY fiscal_year
      ORDER BY fiscal_year DESC
      LIMIT 1
    `;
    const latestVisits =
      libRows.length > 0 ? Number(libRows[0].total_visits) : 0;
    const latestFiscalYear =
      libRows.length > 0 ? libRows[0].fiscal_year : null;

    const headline = `${totalParks.toLocaleString()} parks across ${totalAcres.toLocaleString()} acres \u2014 avg street PCI ${avgPci} (${pciLabel})`;

    return NextResponse.json({
      headline,
      headlineValue: totalParks,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "Portland Parks Data",
          status: "live",
          provider: "Portland Parks & Recreation",
          action: `${totalParks} parks, ${totalAcres.toLocaleString()} acres loaded`,
        },
        {
          name: "PBOT Pavement Condition",
          status: "live",
          provider: "Portland Bureau of Transportation",
          action: `Average PCI: ${avgPci} (${pciLabel})`,
        },
        {
          name: "Multnomah County Library",
          status: "live",
          provider: "Multnomah County Library",
          action: latestFiscalYear
            ? `FY${latestFiscalYear}: ${latestVisits.toLocaleString()} visits`
            : "Loaded",
        },
      ],
      trend: { direction: "flat", percentage: 0, label: "baseline established" },
      chartData: [],
      source: "Portland Parks / PBOT / Multnomah County Library",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalParks} parks totaling ${totalAcres.toLocaleString()} acres across Portland.`,
        `Average pavement condition index is ${avgPci} (${pciLabel}) across city streets.`,
        latestFiscalYear
          ? `${latestVisits.toLocaleString()} library visits in fiscal year ${latestFiscalYear}.`
          : "Library visit data loaded.",
      ],
    });
  } catch (error) {
    console.error("[quality] DB query failed:", error);
    return NextResponse.json({
      headline: "Quality of Life data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat", percentage: 0, label: "error" },
      chartData: [],
      source: "Portland Parks / PBOT / Multnomah County Library",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Data temporarily unavailable."],
    });
  }
}
