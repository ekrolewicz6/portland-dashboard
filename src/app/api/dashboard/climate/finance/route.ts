/**
 * Climate Accountability Platform — Climate Finance Tracker API
 * Returns PCEF allocation data, funding gaps, and interest diversions.
 */

import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  let financeSources: object[] = [];
  let pcefAllocations: object[] = [];
  let pcefInterestDiversions: object[] = [];
  let totalBureauAllocations = 0;
  let totalCommunityGrants = 0;
  let totalInterestDiverted = 0;

  // Finance sources (funding gap analysis)
  try {
    const rows = await sql`
      SELECT fiscal_year, source, allocation_amount, action_count
      FROM public.climate_finance_sources
      ORDER BY fiscal_year, source
    `;
    financeSources = rows.map((r) => ({
      fiscalYear: r.fiscal_year,
      source: r.source,
      allocationAmount: r.allocation_amount != null ? Number(r.allocation_amount) : null,
      actionCount: Number(r.action_count) || 0,
    }));
  } catch {
    // table not yet available
  }

  // PCEF allocations
  try {
    const rows = await sql`
      SELECT fiscal_year, recipient, recipient_type, amount, program_area
      FROM public.pcef_allocations
      ORDER BY fiscal_year, recipient_type, recipient
    `;
    pcefAllocations = rows.map((r) => {
      const amount = Number(r.amount);
      if (r.recipient_type === "bureau") totalBureauAllocations += amount;
      else totalCommunityGrants += amount;
      return {
        fiscalYear: r.fiscal_year,
        recipient: r.recipient,
        recipientType: r.recipient_type,
        amount,
        programArea: r.program_area,
      };
    });
  } catch {
    // table not yet available
  }

  // PCEF interest diversions
  try {
    const rows = await sql`
      SELECT fiscal_year, amount_diverted, destination, notes
      FROM public.pcef_interest_diversions
      ORDER BY fiscal_year
    `;
    pcefInterestDiversions = rows.map((r) => {
      totalInterestDiverted += Number(r.amount_diverted);
      return {
        fiscalYear: r.fiscal_year,
        amountDiverted: Number(r.amount_diverted),
        destination: r.destination,
        notes: r.notes,
      };
    });
  } catch {
    // table not yet available
  }

  // Aggregate PCEF by bureau across all years
  const bureauTotals: Record<string, number> = {};
  const bureauByYear: Record<string, Record<string, number>> = {};
  const communityByYear: Record<string, number> = {};

  for (const alloc of pcefAllocations as Array<{ recipient: string; recipientType: string; amount: number; fiscalYear: string }>) {
    if (alloc.recipientType === "bureau") {
      bureauTotals[alloc.recipient] = (bureauTotals[alloc.recipient] ?? 0) + alloc.amount;
      if (!bureauByYear[alloc.fiscalYear]) bureauByYear[alloc.fiscalYear] = {};
      bureauByYear[alloc.fiscalYear][alloc.recipient] = (bureauByYear[alloc.fiscalYear][alloc.recipient] ?? 0) + alloc.amount;
    } else {
      communityByYear[alloc.fiscalYear] = (communityByYear[alloc.fiscalYear] ?? 0) + alloc.amount;
    }
  }

  // Build year-over-year split chart data
  const allYears = [...new Set((pcefAllocations as Array<{ fiscalYear: string }>).map((a) => a.fiscalYear))].sort();
  const allocationSplit = allYears.map((fy) => {
    const bureauTotal = Object.values(bureauByYear[fy] ?? {}).reduce((s, v) => s + v, 0);
    const communityTotal = communityByYear[fy] ?? 0;
    return {
      fiscalYear: fy,
      bureauTotal,
      communityTotal,
      total: bureauTotal + communityTotal,
      bureauPct: bureauTotal + communityTotal > 0
        ? Math.round((bureauTotal / (bureauTotal + communityTotal)) * 100)
        : 0,
    };
  });

  // Empty tables mean the PCEF sync has not run. Report that rather than
  // filling in remembered dollar totals, which would be indistinguishable
  // from measured ones once rendered beside the PCEF citation.
  const hasAllocations = pcefAllocations.length > 0 || financeSources.length > 0;
  if (!hasAllocations) {
    return NextResponse.json({
      financeSources: [],
      pcefAllocations: [],
      pcefInterestDiversions: [],
      summary: null,
      dataStatus: "unavailable",
      note: "No PCEF allocation rows are loaded. Run the climate sync to populate pcef_allocations.",
      source: "Portland Clean Energy Fund · Bureau of Planning & Sustainability",
      lastUpdated: null,
    });
  }

  return NextResponse.json({
    financeSources,
    pcefAllocations,
    pcefInterestDiversions,
    summary: {
      totalBureauAllocations,
      totalCommunityGrants,
      totalInterestDiverted,
      allocationSplit,
      bureauTotals,
    },
    dataStatus: "live",
    source: "Portland Clean Energy Fund · Bureau of Planning & Sustainability",
    lastUpdated: new Date().toISOString().slice(0, 10),
    auditNote: "The February 2026 audit found Portland has not been transparent enough about how PCEF funding is used when allocated to bureaus. This tracker makes every dollar visible.",
  });
}
