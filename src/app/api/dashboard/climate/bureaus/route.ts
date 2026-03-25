/**
 * Climate Accountability Platform — Bureau Scorecard API
 * Returns bureau-level climate performance data.
 */

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bureauCode = searchParams.get("bureau");

  let bureaus: object[] = [];
  let bureauActions: object[] = [];

  try {
    const rows = await sql`
      SELECT
        bureau_code, bureau_name, total_actions, achieved_actions,
        ongoing_actions, delayed_actions, cross_bureau_actions,
        pcef_funding_received, updated_at
      FROM public.climate_bureau_scorecard
      ORDER BY total_actions DESC, bureau_code
    `;

    bureaus = rows.map((r) => {
      const total = Number(r.total_actions) || 0;
      const achieved = Number(r.achieved_actions) || 0;
      const delayed = Number(r.delayed_actions) || 0;
      const performanceScore = total > 0
        ? Math.round(((achieved + (total - achieved - delayed) * 0.5) / total) * 100)
        : 0;

      return {
        bureauCode: r.bureau_code,
        bureauName: r.bureau_name,
        totalActions: total,
        achievedActions: achieved,
        ongoingActions: Number(r.ongoing_actions) || 0,
        delayedActions: delayed,
        crossBureauActions: Number(r.cross_bureau_actions) || 0,
        pcefFundingReceived: r.pcef_funding_received != null ? Number(r.pcef_funding_received) : null,
        performanceScore,
        performanceLabel: performanceScore >= 70 ? "on-track" : performanceScore >= 40 ? "mixed" : "needs-attention",
        updatedAt: r.updated_at,
      };
    });
  } catch {
    // table not yet populated
  }

  // If a specific bureau is requested, also fetch its actions
  if (bureauCode) {
    try {
      const rows = await sql`
        SELECT
          action_id, title, sector, category, lead_bureaus,
          is_declaration_priority, fiscal_year, resource_gap,
          is_pcef_funded, is_multi_bureau, status, description
        FROM public.climate_workplan_actions
        WHERE ${bureauCode} = ANY(lead_bureaus)
        ORDER BY
          CASE category WHEN 'decarbonization' THEN 0 ELSE 1 END,
          action_id
      `;
      bureauActions = rows.map((r) => ({
        actionId: r.action_id,
        title: r.title,
        sector: r.sector,
        category: r.category,
        leadBureaus: r.lead_bureaus as string[],
        isDeclarationPriority: r.is_declaration_priority,
        fiscalYear: r.fiscal_year,
        resourceGap: r.resource_gap,
        isPcefFunded: r.is_pcef_funded,
        isMultiBureau: r.is_multi_bureau,
        status: r.status,
        description: r.description,
      }));
    } catch {
      // no actions found
    }
  }

  return NextResponse.json({
    bureaus,
    bureauActions,
    source: "Climate Emergency Workplan 2022-2025 / Portland Bureau of Planning & Sustainability",
    lastUpdated: new Date().toISOString().slice(0, 10),
    auditNote: "The February 2026 City Audit found the CSO cannot currently answer which bureaus are accountable for what and whether they are performing. This scorecard directly addresses that gap.",
  });
}
