import { NextResponse } from "next/server";
import { vacancyMapData } from "@/lib/mock-data";
import type { VacancyMapData } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Returns GeoJSON with mock vacancy points for now.
 *
 * TODO: Future enhancement — query Public/BDS_Property/FeatureServer
 * for properties with no active permits as a proxy for vacancy:
 *
 *   import { queryFeatureService } from "@/lib/arcgis";
 *
 *   const properties = await queryFeatureService(
 *     "Public/BDS_Property/FeatureServer/0",
 *     {
 *       where: "STATUS = 'INACTIVE' OR LAST_PERMIT_DATE < CURRENT_TIMESTAMP - INTERVAL '2' YEAR",
 *       outFields: "ADDRESS,PROPERTY_TYPE,SQFT,NEIGHBORHOOD",
 *       returnGeometry: true,
 *     },
 *   );
 */

export async function GET(): Promise<NextResponse<VacancyMapData>> {
  return NextResponse.json(vacancyMapData);
}
