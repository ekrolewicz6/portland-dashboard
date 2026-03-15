import { NextResponse } from "next/server";
import { USE_MOCK } from "@/lib/db";
import { vacancyMapData } from "@/lib/mock-data";
import type { VacancyMapData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<VacancyMapData>> {
  if (!USE_MOCK) {
    // TODO: Query vacancy_listings table and build GeoJSON.
    // Example:
    //   const rows = await query<{
    //     lng: number; lat: number; address: string;
    //     property_type: string; sqft: number;
    //     vacant_since: string; asking_rent: number | null;
    //     neighborhood: string;
    //   }>(
    //     `SELECT lng, lat, address, property_type, sqft,
    //             vacant_since, asking_rent, neighborhood
    //        FROM vacancy_listings
    //       WHERE status = 'vacant'
    //       ORDER BY vacant_since`
    //   );
    //
    //   const features = rows.map(r => ({
    //     type: "Feature" as const,
    //     geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] as [number, number] },
    //     properties: {
    //       address: r.address,
    //       type: r.property_type as VacancyFeature["properties"]["type"],
    //       sqft: r.sqft,
    //       vacantSince: r.vacant_since,
    //       askingRent: r.asking_rent,
    //       neighborhood: r.neighborhood,
    //     },
    //   }));
  }

  return NextResponse.json(vacancyMapData);
}
