import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface BusinessRow {
  id: number;
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    const rows = await sql<BusinessRow[]>`
      SELECT id, registry_number, business_name, entity_type,
             registry_date::text, address, city, state, zip,
             raw_data, created_at::text
      FROM business.oregon_sos_new_monthly
      WHERE id = ${businessId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const b = rows[0];

    // Find other businesses of the same type for "similar businesses"
    const similar = await sql<{ id: number; business_name: string; entity_type: string; registry_date: string }[]>`
      SELECT id, business_name, entity_type, registry_date::text
      FROM business.oregon_sos_new_monthly
      WHERE entity_type = ${b.entity_type}
        AND id != ${businessId}
      ORDER BY registry_date DESC
      LIMIT 6
    `;

    return NextResponse.json({
      business: {
        id: b.id,
        registryNumber: b.registry_number,
        name: b.business_name,
        entityType: b.entity_type,
        registryDate: b.registry_date,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip,
        rawData: b.raw_data,
        createdAt: b.created_at,
      },
      similarBusinesses: similar.map((s) => ({
        id: s.id,
        name: s.business_name,
        entityType: s.entity_type,
        registryDate: s.registry_date,
      })),
    });
  } catch (err) {
    console.error("Business detail API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch business details" },
      { status: 500 }
    );
  }
}
