import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return NextResponse.json({ error: "Invalid business ID" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, registry_number, business_name, entity_type,
             registry_date::text, associated_name_type,
             first_name, middle_name, last_name, suffix,
             entity_of_record_name, entity_of_record_reg_number,
             address, address_continued, city, state, zip,
             jurisdiction, business_details
      FROM business.oregon_sos_all_active
      WHERE id = ${businessId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const b = rows[0];

    // Find similar businesses of the same type (recently registered)
    const similar = await sql`
      SELECT id, business_name, entity_type, registry_date::text, address
      FROM business.oregon_sos_all_active
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
        associatedNameType: b.associated_name_type,
        contactName: [b.first_name, b.middle_name, b.last_name, b.suffix]
          .filter(Boolean)
          .join(" ") || null,
        entityOfRecord: b.entity_of_record_name,
        address: [b.address, b.address_continued].filter(Boolean).join(", "),
        city: b.city,
        state: b.state,
        zip: b.zip,
        jurisdiction: b.jurisdiction,
        sosUrl: b.business_details,
      },
      similarBusinesses: similar.map((s) => ({
        id: s.id,
        name: s.business_name,
        entityType: s.entity_type,
        registryDate: s.registry_date,
        address: s.address,
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
