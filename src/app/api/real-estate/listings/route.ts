import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import type { Listing, ListingsResponse, ListingsFilters, SpaceType } from "@/lib/real-estate-types";

export const dynamic = "force-dynamic";

/**
 * GET /api/real-estate/listings
 *
 * Fetches real estate listings with search, filter, and sort capabilities.
 *
 * Query params:
 *   search        — free-text search across title, address, neighborhood, description
 *   space_type    — retail | office | restaurant | industrial | flex
 *   neighborhood  — exact neighborhood name
 *   min_sqft      — minimum square footage
 *   max_sqft      — maximum square footage
 *   max_rent      — maximum asking rent ($/sqft/yr)
 *   popup         — "true" to filter for pop-up available
 *   graduated     — "true" to filter for graduated rent
 *   condition     — condition string
 *   sort          — rent_asc | rent_desc | sqft_asc | sqft_desc | newest
 *   id            — fetch a single listing by ID
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Single listing by ID
  const idParam = params.get("id");
  if (idParam) {
    try {
      const rows = await sql`
        SELECT * FROM real_estate.listings WHERE id = ${parseInt(idParam, 10)}
      `;
      if (rows.length === 0) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }
      const listing = rowToListing(rows[0]);
      return NextResponse.json(listing);
    } catch (error) {
      console.error("[real-estate/listings] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
  }

  // Filters
  const filters: ListingsFilters = {};
  const search = params.get("search");
  const spaceType = params.get("space_type") as SpaceType | null;
  const neighborhood = params.get("neighborhood");
  const minSqft = params.get("min_sqft");
  const maxSqft = params.get("max_sqft");
  const maxRent = params.get("max_rent");
  const popup = params.get("popup");
  const graduated = params.get("graduated");
  const condition = params.get("condition");
  const sort = params.get("sort") || "newest";

  if (search) filters.search = search;
  if (spaceType) filters.space_type = spaceType;
  if (neighborhood) filters.neighborhood = neighborhood;
  if (minSqft) filters.min_sqft = parseInt(minSqft, 10);
  if (maxSqft) filters.max_sqft = parseInt(maxSqft, 10);
  if (maxRent) filters.max_rent = parseFloat(maxRent);
  if (popup === "true") filters.popup_available = true;
  if (graduated === "true") filters.graduated_rent = true;
  if (condition) filters.condition = condition;
  filters.sort = sort as ListingsFilters["sort"];

  try {
    // Build dynamic query using tagged template fragments
    const conditions: ReturnType<typeof sql>[] = [];
    conditions.push(sql`status = 'available'`);

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(sql`(
        title ILIKE ${searchPattern}
        OR address ILIKE ${searchPattern}
        OR neighborhood ILIKE ${searchPattern}
        OR description ILIKE ${searchPattern}
      )`);
    }
    if (spaceType) {
      conditions.push(sql`space_type = ${spaceType}`);
    }
    if (neighborhood) {
      conditions.push(sql`neighborhood = ${neighborhood}`);
    }
    if (minSqft) {
      conditions.push(sql`sqft >= ${parseInt(minSqft, 10)}`);
    }
    if (maxSqft) {
      conditions.push(sql`sqft <= ${parseInt(maxSqft, 10)}`);
    }
    if (maxRent) {
      conditions.push(sql`asking_rent <= ${parseFloat(maxRent)}`);
    }
    if (popup === "true") {
      conditions.push(sql`(pcb_terms->>'popup_available')::boolean = true`);
    }
    if (graduated === "true") {
      conditions.push(sql`(pcb_terms->>'graduated_rent')::boolean = true`);
    }
    if (condition) {
      conditions.push(sql`condition = ${condition}`);
    }

    // Combine WHERE clauses
    let whereClause = conditions[0];
    for (let i = 1; i < conditions.length; i++) {
      whereClause = sql`${whereClause} AND ${conditions[i]}`;
    }

    // Sort
    let orderClause;
    switch (sort) {
      case "rent_asc":
        orderClause = sql`asking_rent ASC NULLS LAST`;
        break;
      case "rent_desc":
        orderClause = sql`asking_rent DESC NULLS LAST`;
        break;
      case "sqft_asc":
        orderClause = sql`sqft ASC`;
        break;
      case "sqft_desc":
        orderClause = sql`sqft DESC`;
        break;
      default:
        orderClause = sql`listed_date DESC, id DESC`;
    }

    const rows = await sql`
      SELECT * FROM real_estate.listings
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT 50
    `;

    // Get all available neighborhoods for filter dropdown
    const nbRows = await sql`
      SELECT DISTINCT neighborhood FROM real_estate.listings
      WHERE status = 'available'
      ORDER BY neighborhood
    `;

    const listings: Listing[] = rows.map(rowToListing);
    const neighborhoods: string[] = nbRows.map((r) => r.neighborhood as string);

    const response: ListingsResponse = {
      listings,
      total: listings.length,
      neighborhoods,
      filters_applied: filters,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[real-estate/listings] DB error:", error);

    // Return fallback with empty results
    return NextResponse.json({
      listings: [],
      total: 0,
      neighborhoods: [],
      filters_applied: filters,
      error: "Database unavailable — please run the seed script",
    } as ListingsResponse & { error: string });
  }
}

function rowToListing(row: Record<string, unknown>): Listing {
  return {
    id: Number(row.id),
    title: row.title as string,
    address: row.address as string,
    neighborhood: row.neighborhood as string,
    sqft: Number(row.sqft),
    space_type: row.space_type as SpaceType,
    asking_rent: Number(row.asking_rent),
    pcb_terms: (row.pcb_terms || {}) as Listing["pcb_terms"],
    condition: row.condition as string,
    vacancy_duration: (row.vacancy_duration as string) || null,
    listed_date: row.listed_date
      ? new Date(row.listed_date as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: (row.status as Listing["status"]) || "available",
    description: (row.description as string) || null,
    amenities: (row.amenities as string[]) || [],
    floor: (row.floor as string) || null,
    contact_email: (row.contact_email as string) || null,
    lat: row.lat != null ? Number(row.lat) : null,
    lon: row.lon != null ? Number(row.lon) : null,
  };
}
