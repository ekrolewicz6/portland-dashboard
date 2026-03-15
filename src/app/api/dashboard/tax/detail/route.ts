import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT city, income_level, effective_rate, federal, state, local, other
      FROM public.tax_comparison
      ORDER BY income_level, city
    `;

    const comparison = rows.map((r) => ({
      city: String(r.city),
      income_level: Number(r.income_level),
      effective_rate: Number(r.effective_rate),
      breakdown: {
        federal: Number(r.federal),
        state: Number(r.state),
        local: Number(r.local),
        other: Number(r.other),
      },
    }));

    // Portland breakdown at each income level
    const portlandRows = comparison.filter((r) => r.city.startsWith("Portland"));
    const portlandBreakdown = portlandRows.map((r) => ({
      income_level: r.income_level,
      effective_rate: r.effective_rate,
      federal: r.breakdown.federal,
      state: r.breakdown.state,
      local: r.breakdown.local,
      other: r.breakdown.other,
    }));

    return NextResponse.json({
      comparison,
      portlandBreakdown,
    });
  } catch (error) {
    console.error("[tax/detail] DB query failed:", error);
    return NextResponse.json(
      { error: "Failed to load tax detail data" },
      { status: 500 },
    );
  }
}
