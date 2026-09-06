import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "quality";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

// Single round-trip query using json_build_object.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'parks', (
      SELECT row_to_json(t) FROM (
        SELECT count(*)::int AS total_parks,
               COALESCE(round(sum(acres)::numeric, 0), 0)::int AS total_acres
        FROM quality.parks
      ) t
    ),
    'pavement', (
      SELECT row_to_json(t) FROM (
        SELECT round(avg(pci)::numeric, 0)::int AS avg_pci
        FROM quality.pavement_condition
      ) t
    ),
    'library', (
      SELECT row_to_json(t) FROM (
        SELECT fiscal_year, visits::int AS total_visits
        FROM quality.library_stats
        ORDER BY fiscal_year DESC
        LIMIT 1
      ) t
    )
  ) AS payload
`;

export async function GET() {
  try {
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY, CACHE_TTL);
    if (cached) return NextResponse.json(withFreshness(cached));

    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;

    const parks = (payload.parks as { total_parks: number; total_acres: number }) ?? {
      total_parks: 0,
      total_acres: 0,
    };
    const pavement = (payload.pavement as { avg_pci: number }) ?? { avg_pci: 0 };
    const library = (payload.library as { fiscal_year: number; total_visits: number } | null) ?? null;

    const totalParks = Number(parks.total_parks);
    const totalAcres = Number(parks.total_acres);
    const avgPci = Number(pavement.avg_pci);
    const pciLabel = avgPci >= 70 ? "Good" : avgPci >= 40 ? "Fair" : "Poor";
    const latestVisits = library ? Number(library.total_visits) : 0;
    const latestFiscalYear = library ? Number(library.fiscal_year) : null;

    const headline = `${totalParks} parks — avg PCI ${avgPci} (${pciLabel}) — ${latestVisits.toLocaleString()} library visits`;

    const dataSources = [
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
    ];

    const insights = [
      `${totalParks} parks totaling ${totalAcres.toLocaleString()} acres across Portland.`,
      `Average pavement condition index is ${avgPci} (${pciLabel}) across city streets.`,
    ];
    if (latestFiscalYear) {
      insights.push(
        `${latestVisits.toLocaleString()} library visits in fiscal year ${latestFiscalYear}.`
      );
    }

    const responseData = {
      headline,
      headlineValue: totalParks,
      dataStatus: "live",
      dataAvailable: true,
      dataSources,
      trend: { direction: "flat", percentage: 0, label: "baseline established" },
      chartData: [],
      source: "Portland Parks & Recreation · PBOT · Multnomah County Library",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (error) {
    console.error("[quality] DB query failed:", error);
    return NextResponse.json(withFreshness({
      headline: "Quality of Life data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat", percentage: 0, label: "error" },
      chartData: [],
      source: "Portland Parks & Recreation · PBOT · Multnomah County Library",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Data temporarily unavailable."],
    }));
  }
}
