import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  try {
    const rows = category
      ? await sql`SELECT * FROM content.news_context WHERE category = ${category} ORDER BY published_date DESC LIMIT 5`
      : await sql`SELECT * FROM content.news_context ORDER BY published_date DESC LIMIT 10`;

    return NextResponse.json({ stories: rows });
  } catch {
    return NextResponse.json({ stories: [] });
  }
}
