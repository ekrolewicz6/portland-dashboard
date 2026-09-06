import { NextResponse } from "next/server";
import sql from "@/lib/db-query";
import type { VacancyFeature, VacancyMapData } from "@/lib/types";

export const dynamic = "force-dynamic";

const SOURCE =
  "Portland Civic Lab listings database (real_estate.listings, seeded from real Portland addresses)";

/**
 * GET /api/dashboard/vacancy-map
 *
 * GeoJSON FeatureCollection of available commercial spaces, built from
 * real_estate.listings (the same table that powers /api/real-estate/listings
 * and the /spaces browse view). This route previously returned a hardcoded
 * snapshot frozen at 2026-03-07; that fixture module has since been deleted.
 *
 * Response keys are kept stable for the map consumer:
 *   features[].properties.{address,type,sqft,vacantSince,askingRent,neighborhood}
 *   summary.{totalVacant,byType,byNeighborhood}, lastUpdated, source
 *
 * TODO: Future enhancement, query Public/BDS_Property/FeatureServer for
 * properties with no active permits as a proxy for suspected (unlisted)
 * vacancy, layered on top of the confirmed listings below.
 */

interface VacancyRow {
  address: string;
  type: VacancyFeature["properties"]["type"];
  sqft: number;
  vacantSince: string;
  askingRent: number | null;
  neighborhood: string;
  lat: number;
  lon: number;
}

export async function GET(): Promise<NextResponse<VacancyMapData>> {
  try {
    // Alias columns in SQL so property keys stay stable for consumers.
    const rows = (await sql`
      SELECT
        address,
        space_type          AS "type",
        sqft::int           AS "sqft",
        listed_date::text   AS "vacantSince",
        asking_rent::float  AS "askingRent",
        neighborhood,
        lat,
        lon
      FROM real_estate.listings
      WHERE status = 'available'
        AND lat IS NOT NULL
        AND lon IS NOT NULL
      ORDER BY listed_date DESC, id
    `) as unknown as VacancyRow[];

    const features: VacancyFeature[] = rows.map((r) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(r.lon), Number(r.lat)],
      },
      properties: {
        address: r.address,
        type: r.type,
        sqft: Number(r.sqft),
        vacantSince: r.vacantSince,
        askingRent: r.askingRent != null ? Number(r.askingRent) : null,
        neighborhood: r.neighborhood,
      },
    }));

    const byType: Record<string, number> = {};
    const byNeighborhood: Record<string, number> = {};
    for (const f of features) {
      byType[f.properties.type] = (byType[f.properties.type] ?? 0) + 1;
      byNeighborhood[f.properties.neighborhood] =
        (byNeighborhood[f.properties.neighborhood] ?? 0) + 1;
    }

    // Data freshness: latest of when rows were loaded or listed.
    const freshness = await sql`
      SELECT GREATEST(max(created_at)::date, max(listed_date))::text AS last_updated
      FROM real_estate.listings
    `;
    const lastUpdated =
      (freshness[0]?.last_updated as string | null) ??
      new Date().toISOString().slice(0, 10);

    const result: VacancyMapData = {
      type: "FeatureCollection",
      features,
      summary: {
        totalVacant: features.length,
        byType,
        byNeighborhood,
      },
      lastUpdated,
      source: SOURCE,
    };

    return NextResponse.json(result);
  } catch (error) {
    // Surface failures with a 500 instead of silently serving zeros.
    console.error("[vacancy-map] DB query failed:", error);
    return NextResponse.json(
      {
        type: "FeatureCollection",
        features: [],
        summary: { totalVacant: 0, byType: {}, byNeighborhood: {} },
        lastUpdated: new Date().toISOString().slice(0, 10),
        source: SOURCE,
      } satisfies VacancyMapData,
      { status: 500 },
    );
  }
}
