import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CewAction {
  action_id: string;
  sector: string;
  title: string;
  status: "achieved" | "ongoing" | "delayed";
  lead_bureaus: string[];
}

const BUREAU_NAMES: Record<string, string> = {
  BPS: "Bureau of Planning and Sustainability",
  PBOT: "Portland Bureau of Transportation",
  BES: "Bureau of Environmental Services",
  "PP&R": "Portland Parks & Recreation",
  PWB: "Portland Water Bureau",
  BDS: "Bureau of Development Services",
  "PF&R": "Portland Fire & Rescue",
  PBEM: "Portland Bureau of Emergency Management",
  OMF: "Office of Management and Finance",
  PCEF: "Portland Clean Energy Community Benefits Fund",
  JOHS: "Joint Office of Homeless Services",
  BHR: "Bureau of Human Resources",
  BRFS: "Bureau of Revenue and Financial Services",
};

// Simplified action list for bureau grouping (same 43 actions as workplan route)
const actions: CewAction[] = [
  { action_id: "E-1", sector: "Electricity Supply", title: "Implement the state 100% clean electricity law", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "E-2", sector: "Electricity Supply", title: "Invest in community-owned renewable energy generation", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "B-1", sector: "Buildings", title: "Eliminate carbon from existing buildings (private market)", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "B-2", sector: "Buildings", title: "Eliminate carbon from City operations (Green Building Policy)", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "B-3", sector: "Buildings", title: "Energy retrofits on homes owned by priority populations", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "B-4", sector: "Buildings", title: "Lower embodied carbon in the built environment", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "T-1", sector: "Transportation", title: "Make low-carbon travel options safe, accessible, convenient", status: "ongoing", lead_bureaus: ["PBOT"] },
  { action_id: "T-2", sector: "Transportation", title: "Equitable pricing strategies and parking management", status: "delayed", lead_bureaus: ["PBOT"] },
  { action_id: "T-3", sector: "Transportation", title: "Decouple transportation funding from fossil fuels", status: "delayed", lead_bureaus: ["PBOT"] },
  { action_id: "T-4", sector: "Transportation", title: "Make low-carbon transportation more affordable", status: "ongoing", lead_bureaus: ["PBOT"] },
  { action_id: "T-5", sector: "Transportation", title: "Support state/regional VMT reduction policies", status: "ongoing", lead_bureaus: ["PBOT"] },
  { action_id: "T-6", sector: "Transportation", title: "Make new construction EV-ready", status: "achieved", lead_bureaus: ["BPS", "BDS"] },
  { action_id: "T-7", sector: "Transportation", title: "Make it easier to use EVs if you can't charge at home", status: "ongoing", lead_bureaus: ["PBOT", "BDS", "BPS"] },
  { action_id: "T-8", sector: "Transportation", title: "Make freight cleaner", status: "ongoing", lead_bureaus: ["PBOT"] },
  { action_id: "T-9", sector: "Transportation", title: "Replace petroleum diesel at the pump (Renewable Fuel Standard)", status: "achieved", lead_bureaus: ["BPS"] },
  { action_id: "I-1", sector: "Industry", title: "Develop strategies for industrial sector emissions reduction", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "LU-1", sector: "Land Use", title: "Increase capacity for compact mixed-use community planning", status: "ongoing", lead_bureaus: ["BPS", "PBOT", "BES", "PP&R", "PWB"] },
  { action_id: "LU-2", sector: "Land Use", title: "Avoid displacement as neighborhoods grow", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "LU-3", sector: "Land Use", title: "Explore last-mile urban logistics hubs", status: "ongoing", lead_bureaus: ["BPS", "PBOT"] },
  { action_id: "S-1", sector: "Food & Materials", title: "Prevent food waste through outreach", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "S-2", sector: "Food & Materials", title: "Reduce food waste through composting and food donation", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "S-3", sector: "Food & Materials", title: "Invest in community-led reuse, repair, sharing", status: "ongoing", lead_bureaus: ["BPS"] },
  { action_id: "C-1", sector: "Cross-Sector", title: "Implement internal cost of carbon in City decision-making", status: "ongoing", lead_bureaus: ["BPS", "PP&R", "OMF", "BES", "PBOT", "PWB"] },
  { action_id: "F-1", sector: "Flooding", title: "Update floodplain maps and apply new regulations", status: "ongoing", lead_bureaus: ["BPS", "BES", "BDS", "PBOT"] },
  { action_id: "F-2", sector: "Flooding", title: "Update Johnson Creek hydraulic models and floodplain maps", status: "ongoing", lead_bureaus: ["BPS", "BES", "BDS", "PBOT"] },
  { action_id: "F-3", sector: "Flooding", title: "Develop floodplain mitigation banking program", status: "ongoing", lead_bureaus: ["BES", "BPS", "BDS"] },
  { action_id: "F-4", sector: "Flooding", title: "Expand Willing Seller Program for flooded properties", status: "ongoing", lead_bureaus: ["BES"] },
  { action_id: "F-5", sector: "Flooding", title: "Design/construct floodplain and wetland restoration sites", status: "ongoing", lead_bureaus: ["BES"] },
  { action_id: "TR-1", sector: "Trees & Canopy", title: "Update Urban Forestry Management Plan", status: "ongoing", lead_bureaus: ["PP&R", "BES", "BPS"] },
  { action_id: "TR-2", sector: "Trees & Canopy", title: "Update Title 11 tree regulations", status: "ongoing", lead_bureaus: ["PP&R", "BES", "BPS"] },
  { action_id: "TR-3", sector: "Trees & Canopy", title: "Expand tree planting in East Portland and priority areas", status: "ongoing", lead_bureaus: ["PP&R", "BES", "BPS"] },
  { action_id: "NR-1", sector: "Natural Resources", title: "Ezone Map Correction Project for natural resources", status: "ongoing", lead_bureaus: ["BPS", "BES"] },
  { action_id: "NR-2", sector: "Natural Resources", title: "Support community-based watershed stewardship orgs", status: "ongoing", lead_bureaus: ["BES", "PP&R", "PBEM"] },
  { action_id: "NR-3", sector: "Natural Resources", title: "Incorporate climate resilience into Economic Opportunities Analysis", status: "ongoing", lead_bureaus: ["BPS", "BES", "PP&R"] },
  { action_id: "NR-4", sector: "Natural Resources", title: "Citywide green infrastructure systems plan", status: "ongoing", lead_bureaus: ["BES", "PBOT", "PP&R", "BPS", "PBEM"] },
  { action_id: "W-1", sector: "Wildfire", title: "Implement wildfire prevention from Multnomah County plan", status: "ongoing", lead_bureaus: ["PBEM", "PF&R", "BPS", "PP&R"] },
  { action_id: "W-2", sector: "Wildfire", title: "Build Wildfire Prevention Program", status: "ongoing", lead_bureaus: ["PF&R", "PBEM", "PP&R", "BPS", "BDS"] },
  { action_id: "H-1", sector: "Health Impacts", title: "Reduce indoor health impacts (cooling units, HVAC upgrades)", status: "ongoing", lead_bureaus: ["PP&R", "PBEM"] },
  { action_id: "H-2", sector: "Health Impacts", title: "Reduce outdoor workers' health impacts (heat/smoke protocols)", status: "ongoing", lead_bureaus: ["PWB", "PP&R", "BES", "PBOT", "BDS", "PF&R"] },
  { action_id: "RH-1", sector: "Resilience Hubs", title: "Convert East Portland Community Center into resilience center", status: "ongoing", lead_bureaus: ["PP&R", "PBEM"] },
  { action_id: "RH-2", sector: "Resilience Hubs", title: "Neighborhood-scale solar + battery energy resilience", status: "delayed", lead_bureaus: ["BPS", "PBEM", "PP&R"] },
  { action_id: "IP-1", sector: "Infrastructure", title: "Incorporate climate change into capital planning", status: "ongoing", lead_bureaus: ["BES", "PWB", "PBOT", "PP&R"] },
  { action_id: "IP-2", sector: "Infrastructure", title: "West Burnside Road landslide prevention improvements", status: "delayed", lead_bureaus: ["PBOT", "BES", "PP&R"] },
  { action_id: "EP-1", sector: "Emergency Planning", title: "Equipment for transportation continuity during extreme weather", status: "ongoing", lead_bureaus: ["PBOT", "PP&R", "BES"] },
  { action_id: "EP-2", sector: "Emergency Planning", title: "Equipment for emergency response during extreme weather", status: "ongoing", lead_bureaus: ["PBOT", "PP&R", "BES", "PWB"] },
  { action_id: "EP-3", sector: "Emergency Planning", title: "Draft/revise emergency and continuity of operations plans", status: "ongoing", lead_bureaus: ["PBEM", "PBOT", "PP&R"] },
  { action_id: "EP-4", sector: "Emergency Planning", title: "Increase regional climate resilience awareness", status: "ongoing", lead_bureaus: ["PBEM"] },
];

export async function GET() {
  try {
    // Group actions by bureau
    const bureauMap = new Map<string, {
      abbreviation: string;
      fullName: string;
      totalActions: number;
      achieved: number;
      ongoing: number;
      delayed: number;
      actions: { action_id: string; title: string; status: string; sector: string }[];
    }>();

    for (const action of actions) {
      for (const bureau of action.lead_bureaus) {
        if (!bureauMap.has(bureau)) {
          bureauMap.set(bureau, {
            abbreviation: bureau,
            fullName: BUREAU_NAMES[bureau] ?? bureau,
            totalActions: 0,
            achieved: 0,
            ongoing: 0,
            delayed: 0,
            actions: [],
          });
        }
        const b = bureauMap.get(bureau)!;
        b.totalActions++;
        if (action.status === "achieved") b.achieved++;
        else if (action.status === "ongoing") b.ongoing++;
        else if (action.status === "delayed") b.delayed++;
        b.actions.push({
          action_id: action.action_id,
          title: action.title,
          status: action.status,
          sector: action.sector,
        });
      }
    }

    const bureaus = [...bureauMap.values()].sort((a, b) => b.totalActions - a.totalActions);

    return NextResponse.json({ bureaus, dataStatus: "live" });
  } catch (error) {
    console.error("[environment/bureaus] Error:", error);
    return NextResponse.json({ bureaus: [], dataStatus: "unavailable" });
  }
}
