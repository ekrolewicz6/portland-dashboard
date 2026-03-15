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
}

interface CountRow {
  total: number;
}

interface EntityTypeRow {
  entity_type: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const entityType = searchParams.get("entityType") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      // Split search into words and match each independently
      // Strip trailing 's' to handle possessives ("elephants" matches "ELEPHANT'S")
      // Also search address field
      const words = search.split(/\s+/).filter(Boolean);
      for (const word of words) {
        // Remove trailing 's' for possessive matching
        const stem = word.replace(/s$/i, "");
        conditions.push(`(business_name ILIKE $${values.length + 1} OR address ILIKE $${values.length + 1})`);
        values.push(`%${stem}%`);
      }
    }

    if (entityType) {
      conditions.push(`entity_type = $${values.length + 1}`);
      values.push(entityType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count + page of results in parallel
    const [countResult, businesses, entityTypes] = await Promise.all([
      sql.unsafe<CountRow[]>(
        `SELECT count(*)::int as total FROM business.oregon_sos_all_active ${whereClause}`,
        values as (string | number)[]
      ),
      sql.unsafe<BusinessRow[]>(
        `SELECT id, registry_number, business_name, entity_type,
                registry_date::text, address, city, state, zip
         FROM business.oregon_sos_all_active
         ${whereClause}
         ORDER BY registry_date DESC NULLS LAST, business_name ASC
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset] as (string | number)[]
      ),
      sql<EntityTypeRow[]>`
        SELECT entity_type, count(*)::int as count
        FROM business.oregon_sos_all_active
        GROUP BY entity_type
        ORDER BY count DESC
      `.catch(() => [] as EntityTypeRow[]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return NextResponse.json({
      businesses: businesses.map((b) => ({
        id: b.id,
        registryNumber: b.registry_number,
        name: b.business_name,
        entityType: b.entity_type,
        registryDate: b.registry_date,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      entityTypes: entityTypes.map((e) => ({
        type: e.entity_type,
        count: e.count,
      })),
    });
  } catch (err) {
    console.error("Directory API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch directory data" },
      { status: 500 }
    );
  }
}
