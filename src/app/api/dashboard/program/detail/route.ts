import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT as_of, total_certified, survival_rate_1yr, jobs_created, credits_issued
      FROM public.program_pcb_summary
      ORDER BY as_of ASC
    `;

    const growthTrend = rows.map((r) => ({
      month: String(r.as_of).slice(0, 7),
      total: Number(r.total_certified),
      survival: Number(r.survival_rate_1yr),
      jobs: Number(r.jobs_created),
      credits: Number(r.credits_issued),
    }));

    const currentStats = growthTrend.length > 0
      ? growthTrend[growthTrend.length - 1]
      : null;

    return NextResponse.json({
      growthTrend,
      currentStats,
    });
  } catch (error) {
    console.error("[program/detail] DB query failed:", error);
    return NextResponse.json(
      { error: "Failed to load program detail data" },
      { status: 500 },
    );
  }
}
