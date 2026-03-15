import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

interface SearchResult {
  id: number;
  title: string;
  address: string;
  neighborhood: string;
  space_type: string;
  sqft: number;
  asking_rent: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  suggestions: string[];
}

/**
 * GET /api/real-estate/search?q=...
 *
 * Fast search endpoint for autocomplete / typeahead.
 * Returns lightweight results (no full descriptions).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({
      results: [],
      query: q,
      suggestions: [
        "Try searching by neighborhood: Pearl District, Hawthorne, Alberta...",
        "Or by type: retail, restaurant, office, maker space...",
      ],
    } satisfies SearchResponse);
  }

  try {
    const pattern = `%${q}%`;

    const rows = await sql`
      SELECT id, title, address, neighborhood, space_type, sqft, asking_rent
      FROM real_estate.listings
      WHERE status = 'available'
        AND (
          title ILIKE ${pattern}
          OR address ILIKE ${pattern}
          OR neighborhood ILIKE ${pattern}
          OR description ILIKE ${pattern}
          OR space_type ILIKE ${pattern}
          OR condition ILIKE ${pattern}
        )
      ORDER BY
        CASE
          WHEN title ILIKE ${pattern} THEN 1
          WHEN neighborhood ILIKE ${pattern} THEN 2
          WHEN address ILIKE ${pattern} THEN 3
          ELSE 4
        END,
        listed_date DESC
      LIMIT 10
    `;

    const results: SearchResult[] = rows.map((r) => ({
      id: Number(r.id),
      title: r.title as string,
      address: r.address as string,
      neighborhood: r.neighborhood as string,
      space_type: r.space_type as string,
      sqft: Number(r.sqft),
      asking_rent: Number(r.asking_rent),
    }));

    // Generate contextual suggestions
    const suggestions: string[] = [];
    if (results.length === 0) {
      suggestions.push(
        "No results found. Try broadening your search.",
        "Popular searches: Pearl District, Downtown, restaurant space, pop-up",
      );
    }

    return NextResponse.json({
      results,
      query: q,
      suggestions,
    } satisfies SearchResponse);
  } catch (error) {
    console.error("[real-estate/search] DB error:", error);
    return NextResponse.json({
      results: [],
      query: q,
      suggestions: ["Search is temporarily unavailable."],
    } satisfies SearchResponse);
  }
}
