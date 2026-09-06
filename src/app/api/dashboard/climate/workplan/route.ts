/**
 * Climate Accountability Platform — Workplan Tracker API
 * Returns all 43 workplan actions with full metadata, filterable.
 */

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filterSector = searchParams.get("sector");
  const filterBureau = searchParams.get("bureau");
  const filterStatus = searchParams.get("status");
  const filterCategory = searchParams.get("category");
  const filterDeclaration = searchParams.get("declaration");
  const filterPcef = searchParams.get("pcef");
  const actionId = searchParams.get("actionId");

  let actions: object[] = [];
  let statusHistory: object[] = [];

  try {
    // Fetch all actions (filtering done in JS for simplicity)
    const rows = await sql`
      SELECT
        id, action_id, title, sector, category, lead_bureaus,
        is_declaration_priority, fiscal_year, resource_gap,
        is_pcef_funded, is_multi_bureau, status,
        description, external_partners, cobenefits,
        updated_at
      FROM public.climate_workplan_actions
      ORDER BY
        CASE category WHEN 'decarbonization' THEN 0 ELSE 1 END,
        action_id
    `;

    actions = rows.map((r) => ({
      id: r.id,
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
      externalPartners: r.external_partners,
      cobenefits: r.cobenefits,
      updatedAt: r.updated_at,
    }));
  } catch {
    // Return empty — client shows skeleton
  }

  // Fetch status history if a specific actionId is requested
  if (actionId) {
    try {
      const rows = await sql`
        SELECT action_id, status, status_date, narrative, source
        FROM public.climate_action_status_history
        WHERE action_id = ${actionId}
        ORDER BY status_date
      `;
      statusHistory = rows.map((r) => ({
        actionId: r.action_id,
        status: r.status,
        date: r.status_date,
        narrative: r.narrative,
        source: r.source,
      }));
    } catch {
      // no history
    }
  }

  // Apply filters
  let filtered = actions as Array<{
    actionId: string;
    category: string;
    sector: string;
    leadBureaus: string[];
    status: string;
    isDeclarationPriority: boolean;
    isPcefFunded: boolean;
  }>;

  if (filterCategory) filtered = filtered.filter((a) => a.category === filterCategory);
  if (filterSector) filtered = filtered.filter((a) => a.sector === filterSector);
  if (filterBureau) filtered = filtered.filter((a) => a.leadBureaus.includes(filterBureau));
  if (filterStatus) filtered = filtered.filter((a) => a.status === filterStatus);
  if (filterDeclaration === "true") filtered = filtered.filter((a) => a.isDeclarationPriority);
  if (filterPcef === "true") filtered = filtered.filter((a) => a.isPcefFunded);

  // Summary stats from full (unfiltered) action list
  const allActions = actions as Array<{ status: string; updatedAt: unknown }>;
  // Freshness comes from the newest row we actually read, not from the clock
  // and not from a date frozen in source.
  const latestUpdatedAt =
    allActions
      .map((a) => (a.updatedAt ? new Date(String(a.updatedAt)) : null))
      .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString()
      .slice(0, 10) ?? null;
  const achieved = allActions.filter((a) => a.status === "achieved").length;
  const ongoing = allActions.filter((a) => a.status === "ongoing").length;
  const delayed = allActions.filter((a) => a.status === "delayed").length;
  const total = allActions.length;

  // An empty climate_workplan_actions table means the sync has not run or has
  // failed. Report that, rather than substituting remembered counts: a summary
  // reading "43 actions, 6 achieved" beside a BPS citation is indistinguishable
  // from a measured one.
  if (total === 0) {
    return NextResponse.json({
      actions: [],
      summary: null,
      statusHistory: [],
      dataStatus: "unavailable",
      note: "No Climate Emergency Workplan actions are loaded. Run the climate sync to populate climate_workplan_actions.",
      source: "Portland Bureau of Planning & Sustainability · Climate Emergency Workplan",
      lastUpdated: null,
    });
  }

  return NextResponse.json({
    actions: filtered,
    summary: {
      total,
      achieved,
      ongoing,
      delayed,
      achievedPct: Math.round((achieved / total) * 100),
      ongoingPct: Math.round((ongoing / total) * 100),
      delayedPct: Math.round((delayed / total) * 100),
    },
    statusHistory,
    dataStatus: "live",
    source: "Portland Bureau of Planning & Sustainability · Climate Emergency Workplan",
    lastUpdated: latestUpdatedAt,
  });
}
