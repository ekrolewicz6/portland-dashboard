import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CewAction {
  action_id: string;
  sector: string;
  category: "decarbonization" | "resilience";
  title: string;
  lead_bureaus: string[];
  maps_to_declaration: boolean;
  fiscal_year: string;
  resource_gap: string;
  status: "achieved" | "ongoing" | "delayed";
  pcef_funded: boolean;
  multi_bureau: boolean;
}

// ============================================================================
// All 47 Climate Emergency Workplan 2022-2025 Actions
// Source: Portland BPS CEW adopted by Council Aug 24, 2022
// Status: Feb 2026 audit — 13% achieved, 79% ongoing, 9% delayed
// ============================================================================

const actions: CewAction[] = [
  // ── Electricity Supply (2) ──
  { action_id: "E-1", sector: "Electricity Supply", category: "decarbonization", title: "Implement the state 100% clean electricity law", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "Funded", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "E-2", sector: "Electricity Supply", category: "decarbonization", title: "Invest in community-owned renewable energy generation", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "N/A", status: "ongoing", pcef_funded: true, multi_bureau: false },

  // ── Buildings (4) ──
  { action_id: "B-1", sector: "Buildings", category: "decarbonization", title: "Eliminate carbon from existing buildings (private market)", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "TBD", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "B-2", sector: "Buildings", category: "decarbonization", title: "Eliminate carbon from City operations (Green Building Policy)", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "FY 23-24", resource_gap: "$", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "B-3", sector: "Buildings", category: "decarbonization", title: "Energy retrofits on homes owned by priority populations", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "N/A", status: "ongoing", pcef_funded: true, multi_bureau: false },
  { action_id: "B-4", sector: "Buildings", category: "decarbonization", title: "Lower embodied carbon in the built environment", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "Funded", status: "ongoing", pcef_funded: false, multi_bureau: false },

  // ── Transportation (9) ──
  { action_id: "T-1", sector: "Transportation", category: "decarbonization", title: "Make low-carbon travel options safe, accessible, convenient", lead_bureaus: ["PBOT"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$$$$", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "T-2", sector: "Transportation", category: "decarbonization", title: "Equitable pricing strategies and parking management", lead_bureaus: ["PBOT"], maps_to_declaration: true, fiscal_year: "TBD", resource_gap: "N/A", status: "delayed", pcef_funded: false, multi_bureau: false },
  { action_id: "T-3", sector: "Transportation", category: "decarbonization", title: "Decouple transportation funding from fossil fuels", lead_bureaus: ["PBOT"], maps_to_declaration: false, fiscal_year: "TBD", resource_gap: "N/A", status: "delayed", pcef_funded: false, multi_bureau: false },
  { action_id: "T-4", sector: "Transportation", category: "decarbonization", title: "Make low-carbon transportation more affordable", lead_bureaus: ["PBOT"], maps_to_declaration: true, fiscal_year: "TBD", resource_gap: "$$$$", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "T-5", sector: "Transportation", category: "decarbonization", title: "Support state/regional VMT reduction policies", lead_bureaus: ["PBOT"], maps_to_declaration: false, fiscal_year: "FY 22-23", resource_gap: "N/A", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "T-6", sector: "Transportation", category: "decarbonization", title: "Make new construction EV-ready", lead_bureaus: ["BPS", "BDS"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$", status: "achieved", pcef_funded: false, multi_bureau: true },
  { action_id: "T-7", sector: "Transportation", category: "decarbonization", title: "Make it easier to use EVs if you can't charge at home", lead_bureaus: ["PBOT", "BDS", "BPS"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "T-8", sector: "Transportation", category: "decarbonization", title: "Make freight cleaner", lead_bureaus: ["PBOT"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$$", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "T-9", sector: "Transportation", category: "decarbonization", title: "Replace petroleum diesel at the pump (Renewable Fuel Standard)", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "FY 22-23", resource_gap: "+", status: "achieved", pcef_funded: false, multi_bureau: false },

  // ── Industry (1) ──
  { action_id: "I-1", sector: "Industry", category: "decarbonization", title: "Develop strategies for industrial sector emissions reduction", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "FY 23-24", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: false },

  // ── Land Use (3) ──
  { action_id: "LU-1", sector: "Land Use", category: "decarbonization", title: "Increase capacity for compact mixed-use community planning", lead_bureaus: ["BPS", "PBOT", "BES", "PP&R", "PWB"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "LU-2", sector: "Land Use", category: "decarbonization", title: "Avoid displacement as neighborhoods grow", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "—", resource_gap: "$$$", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "LU-3", sector: "Land Use", category: "decarbonization", title: "Explore last-mile urban logistics hubs", lead_bureaus: ["BPS", "PBOT"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "$", status: "ongoing", pcef_funded: false, multi_bureau: true },

  // ── Embodied Carbon / Food (3) ──
  { action_id: "S-1", sector: "Food & Materials", category: "decarbonization", title: "Prevent food waste through outreach", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "N/A", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "S-2", sector: "Food & Materials", category: "decarbonization", title: "Reduce food waste through composting and food donation", lead_bureaus: ["BPS"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "N/A", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "S-3", sector: "Food & Materials", category: "decarbonization", title: "Invest in community-led reuse, repair, sharing", lead_bureaus: ["BPS"], maps_to_declaration: true, fiscal_year: "FY 23-24", resource_gap: "$", status: "ongoing", pcef_funded: false, multi_bureau: false },

  // ── Cross-Sector (1) ──
  { action_id: "C-1", sector: "Cross-Sector", category: "decarbonization", title: "Implement internal cost of carbon in City decision-making", lead_bureaus: ["BPS", "PP&R", "OMF", "BES", "PBOT", "PWB"], maps_to_declaration: true, fiscal_year: "FY 22-24", resource_gap: "Funded", status: "ongoing", pcef_funded: false, multi_bureau: true },

  // ── Flooding (5) ──
  { action_id: "F-1", sector: "Flooding", category: "resilience", title: "Update floodplain maps and apply new regulations", lead_bureaus: ["BPS", "BES", "BDS", "PBOT"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "F-2", sector: "Flooding", category: "resilience", title: "Update Johnson Creek hydraulic models and floodplain maps", lead_bureaus: ["BPS", "BES", "BDS", "PBOT"], maps_to_declaration: true, fiscal_year: "FY 23-25", resource_gap: "$$$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "F-3", sector: "Flooding", category: "resilience", title: "Develop floodplain mitigation banking program", lead_bureaus: ["BES", "BPS", "BDS"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "F-4", sector: "Flooding", category: "resilience", title: "Expand Willing Seller Program for flooded properties", lead_bureaus: ["BES"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: false },
  { action_id: "F-5", sector: "Flooding", category: "resilience", title: "Design/construct floodplain and wetland restoration sites", lead_bureaus: ["BES"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: false },

  // ── Trees / Canopy (3) ──
  { action_id: "TR-1", sector: "Trees & Canopy", category: "resilience", title: "Update Urban Forestry Management Plan", lead_bureaus: ["PP&R", "BES", "BPS"], maps_to_declaration: true, fiscal_year: "FY 22-24", resource_gap: "TBD", status: "ongoing", pcef_funded: true, multi_bureau: true },
  { action_id: "TR-2", sector: "Trees & Canopy", category: "resilience", title: "Update Title 11 tree regulations", lead_bureaus: ["PP&R", "BES", "BPS"], maps_to_declaration: true, fiscal_year: "Within 2 years", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "TR-3", sector: "Trees & Canopy", category: "resilience", title: "Expand tree planting in East Portland and priority areas", lead_bureaus: ["PP&R", "BES", "BPS"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: true, multi_bureau: true },

  // ── Natural Resources (4) ──
  { action_id: "NR-1", sector: "Natural Resources", category: "resilience", title: "Ezone Map Correction Project for natural resources", lead_bureaus: ["BPS", "BES"], maps_to_declaration: true, fiscal_year: "FY 22-25", resource_gap: "$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "NR-2", sector: "Natural Resources", category: "resilience", title: "Support community-based watershed stewardship orgs", lead_bureaus: ["BES", "PP&R", "PBEM"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "None", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "NR-3", sector: "Natural Resources", category: "resilience", title: "Incorporate climate resilience into Economic Opportunities Analysis", lead_bureaus: ["BPS", "BES", "PP&R"], maps_to_declaration: true, fiscal_year: "FY 22-24", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "NR-4", sector: "Natural Resources", category: "resilience", title: "Citywide green infrastructure systems plan", lead_bureaus: ["BES", "PBOT", "PP&R", "BPS", "PBEM"], maps_to_declaration: true, fiscal_year: "TBD", resource_gap: "TBD", status: "ongoing", pcef_funded: true, multi_bureau: true },

  // ── Wildfire (2) ──
  { action_id: "W-1", sector: "Wildfire", category: "resilience", title: "Implement wildfire prevention from Multnomah County plan", lead_bureaus: ["PBEM", "PF&R", "BPS", "PP&R"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "W-2", sector: "Wildfire", category: "resilience", title: "Build Wildfire Prevention Program", lead_bureaus: ["PF&R", "PBEM", "PP&R", "BPS", "BDS"], maps_to_declaration: false, fiscal_year: "FY 22-23", resource_gap: "$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },

  // ── Health Impacts (2) ──
  { action_id: "H-1", sector: "Health Impacts", category: "resilience", title: "Reduce indoor health impacts (15,000 cooling units, HVAC upgrades, temperature monitoring)", lead_bureaus: ["PP&R", "PBEM"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: true, multi_bureau: true },
  { action_id: "H-2", sector: "Health Impacts", category: "resilience", title: "Reduce outdoor workers' health impacts (extreme heat/smoke protocols)", lead_bureaus: ["PWB", "PP&R", "BES", "PBOT", "BDS", "PF&R"], maps_to_declaration: false, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: true },

  // ── Resilience Hubs (2) ──
  { action_id: "RH-1", sector: "Resilience Hubs", category: "resilience", title: "Convert East Portland Community Center into resilience center", lead_bureaus: ["PP&R", "PBEM"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "TBD", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "RH-2", sector: "Resilience Hubs", category: "resilience", title: "Neighborhood-scale solar + battery energy resilience", lead_bureaus: ["BPS", "PBEM", "PP&R"], maps_to_declaration: true, fiscal_year: "FY 23-25", resource_gap: "$$$$$", status: "delayed", pcef_funded: false, multi_bureau: true },

  // ── Infrastructure Planning (2) ──
  { action_id: "IP-1", sector: "Infrastructure", category: "resilience", title: "Incorporate climate change into capital planning and infrastructure design", lead_bureaus: ["BES", "PWB", "PBOT", "PP&R"], maps_to_declaration: true, fiscal_year: "Ongoing", resource_gap: "$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "IP-2", sector: "Infrastructure", category: "resilience", title: "West Burnside Road landslide prevention improvements", lead_bureaus: ["PBOT", "BES", "PP&R"], maps_to_declaration: false, fiscal_year: "5-year capital", resource_gap: "$$$$$", status: "delayed", pcef_funded: false, multi_bureau: true },

  // ── Emergency Planning (4) ──
  { action_id: "EP-1", sector: "Emergency Planning", category: "resilience", title: "Equipment for transportation continuity during extreme weather", lead_bureaus: ["PBOT", "PP&R", "BES"], maps_to_declaration: true, fiscal_year: "FY 23-24", resource_gap: "$$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "EP-2", sector: "Emergency Planning", category: "resilience", title: "Equipment for emergency response during extreme weather", lead_bureaus: ["PBOT", "PP&R", "BES", "PWB"], maps_to_declaration: false, fiscal_year: "FY 23-24", resource_gap: "$$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "EP-3", sector: "Emergency Planning", category: "resilience", title: "Draft/revise emergency and continuity of operations plans", lead_bureaus: ["PBEM", "PBOT", "PP&R"], maps_to_declaration: true, fiscal_year: "FY 23-24", resource_gap: "$$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
  { action_id: "EP-4", sector: "Emergency Planning", category: "resilience", title: "Increase regional climate resilience awareness", lead_bureaus: ["PBEM"], maps_to_declaration: true, fiscal_year: "—", resource_gap: "$$", status: "ongoing", pcef_funded: false, multi_bureau: true },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorFilter = searchParams.get("sector");
    const statusFilter = searchParams.get("status");
    const bureauFilter = searchParams.get("bureau");

    let filtered = actions;

    if (sectorFilter && sectorFilter !== "all") {
      filtered = filtered.filter((a) => a.sector === sectorFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    if (bureauFilter && bureauFilter !== "all") {
      filtered = filtered.filter((a) => a.lead_bureaus.includes(bureauFilter));
    }

    const achieved = actions.filter((a) => a.status === "achieved").length;
    const ongoing = actions.filter((a) => a.status === "ongoing").length;
    const delayed = actions.filter((a) => a.status === "delayed").length;

    const sectors = [...new Set(actions.map((a) => a.sector))].sort();
    const bureaus = [...new Set(actions.flatMap((a) => a.lead_bureaus))].sort();

    return NextResponse.json({
      actions: filtered,
      summary: { total: actions.length, achieved, ongoing, delayed },
      sectors,
      bureaus,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[environment/workplan] Error:", error);
    return NextResponse.json({
      actions: [],
      summary: { total: 0, achieved: 0, ongoing: 0, delayed: 0 },
      sectors: [],
      bureaus: [],
      dataStatus: "unavailable",
    });
  }
}
