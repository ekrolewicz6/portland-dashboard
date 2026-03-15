import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 10-year formation trend
    const monthlyRows = await sql`
      SELECT month, new_registrations, cancellations, net_formation
      FROM public.business_formation_monthly
      ORDER BY month ASC
    `;

    const formationTrend = monthlyRows.map((r) => ({
      month: String(r.month).slice(0, 7),
      new: Number(r.new_registrations),
      cancelled: Number(r.cancellations),
      net: Number(r.net_formation),
    }));

    // Yearly totals
    const yearMap = new Map<string, number>();
    let cumulative = 0;
    const cumulativeFormation: { month: string; total: number }[] = [];

    for (const row of formationTrend) {
      const year = row.month.slice(0, 4);
      yearMap.set(year, (yearMap.get(year) || 0) + row.net);
      cumulative += row.net;
      cumulativeFormation.push({ month: row.month, total: cumulative });
    }

    const yearlyTotals = Array.from(yearMap.entries()).map(([year, net]) => ({
      year,
      net,
    }));

    return NextResponse.json({
      formationTrend,
      yearlyTotals,
      cumulativeFormation,
    });
  } catch (error) {
    console.error("[business/detail] DB query failed:", error);
    return NextResponse.json(
      { error: "Failed to load business detail data" },
      { status: 500 },
    );
  }
}
