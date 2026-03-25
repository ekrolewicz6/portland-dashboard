/**
 * Climate Accountability Platform — Seed Script
 *
 * Encodes all 47 actions from the Climate Emergency Workplan 2022-2025,
 * Multnomah County emissions trajectory data (1990-2023 + targets),
 * PCEF allocation data, and bureau scorecard bootstrap data.
 *
 * Run via: npx tsx src/db/seed-climate.ts
 */

import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const isPooled = databaseUrl.includes("pooler.supabase.com");

function parseConnectionOptions(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer" as const,
    };
  } catch {
    return undefined;
  }
}

const explicitOpts = isPooled ? parseConnectionOptions(databaseUrl) : undefined;
const sql = explicitOpts
  ? postgres({ ...explicitOpts, prepare: false })
  : postgres(databaseUrl);

// ─────────────────────────────────────────────────────────────────────────────
// WORKPLAN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const ACTIONS = [
  // ── Electricity Supply (2) ────────────────────────────────────────────────
  {
    actionId: "E-1",
    title: "Implement the state 100% clean electricity law",
    sector: "electricity",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "Funded",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "achieved",
    description:
      "Oregon HB 2021 requires electricity providers to reach 100% clean electricity by 2040. BPS coordinates with PGE and Pacific Power on implementation and tracks progress toward Portland's 100% Renewable Energy Resolution.",
    cobenefits: "Air quality improvement, public health, economic development",
  },
  {
    actionId: "E-2",
    title: "Invest in community-owned renewable energy generation",
    sector: "electricity",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "N/A",
    isPcefFunded: true,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "PCEF-funded investments in community solar, battery storage, and renewable energy for priority populations. Focuses on solar installations in underserved East Portland neighborhoods.",
    cobenefits: "Energy affordability, economic equity, grid resilience",
  },

  // ── Buildings (4) ─────────────────────────────────────────────────────────
  {
    actionId: "B-1",
    title: "Eliminate carbon from existing buildings (private market)",
    sector: "buildings",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "TBD",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "delayed",
    description:
      "Develop and implement policies to eliminate fossil fuel use in Portland's existing commercial and residential building stock. Requires state enabling legislation and significant market transformation. Timeline remains unresolved.",
    cobenefits: "Indoor air quality, reduced utility costs, job creation",
  },
  {
    actionId: "B-2",
    title: "Eliminate carbon from City operations (Green Building Policy)",
    sector: "buildings",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-24",
    resourceGap: "$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Update the City's Green Building Policy to require all-electric construction for new city-owned buildings and major renovations. Applies to all bureaus' capital projects.",
    cobenefits: "Reduced city operating costs, demonstration effect for private market",
  },
  {
    actionId: "B-3",
    title: "Energy retrofits on homes owned by priority populations",
    sector: "buildings",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "N/A",
    isPcefFunded: true,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "PCEF-funded weatherization, insulation, heat pump, and solar panel installations for income-qualified homeowners and renters. Priority focus on BIPOC communities and households facing energy burden.",
    cobenefits: "Energy affordability, indoor air quality, health outcomes",
  },
  {
    actionId: "B-4",
    title: "Lower embodied carbon in the built environment",
    sector: "buildings",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "Funded",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "achieved",
    description:
      "Adopted embodied carbon requirements in the Green Building Policy and Oregon Building Code updates. Requires Environmental Product Declarations and whole-building life cycle analysis for major city-funded projects.",
    cobenefits: "Construction industry transformation, material efficiency",
  },

  // ── Transportation (9) ────────────────────────────────────────────────────
  {
    actionId: "T-1",
    title: "Make low-carbon travel options safe, accessible, convenient",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Expand protected bike lanes, pedestrian infrastructure, and transit access citywide. Prioritizes the Central City in Motion and East Portland Action Plan commitments. Major funding gap limits scope.",
    cobenefits: "Active transportation health benefits, traffic safety, equity",
  },
  {
    actionId: "T-2",
    title: "Equitable pricing strategies and parking management",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "TBD",
    resourceGap: "N/A",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Develop and implement pricing strategies that reduce drive-alone trips while ensuring equity for lower-income residents. Includes dynamic parking pricing, employer commuter benefits programs, and transit subsidies.",
  },
  {
    actionId: "T-3",
    title: "Decouple transportation funding from fossil fuels",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: false,
    fiscalYear: "TBD",
    resourceGap: "N/A",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Develop alternative transportation funding mechanisms that don't rely on gas tax revenue as EVs reduce fuel consumption. Involves state legislative advocacy and local revenue diversification.",
  },
  {
    actionId: "T-4",
    title: "Make low-carbon transportation more affordable",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "TBD",
    resourceGap: "$$$$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Expand income-qualified transit pass programs, bike share access, and e-bike incentives for lower-income residents. Coordinates with TriMet on reduced-fare programs.",
    cobenefits: "Transportation equity, household cost savings",
  },
  {
    actionId: "T-5",
    title: "Support state/regional VMT reduction policies",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: false,
    fiscalYear: "FY 22-23",
    resourceGap: "N/A",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "achieved",
    description:
      "Advocated for and supported passage of Oregon HB 3055 (Transportation Decarbonization) and regional VMT reduction targets in Metro's Climate Smart Communities scenario planning.",
  },
  {
    actionId: "T-6",
    title: "Make new construction EV-ready",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["BPS", "BDS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "achieved",
    description:
      "Adopted EV charging infrastructure requirements in Portland's building code for new multifamily and commercial construction. Aligns with Oregon Building Code updates requiring EV-ready conduit.",
  },
  {
    actionId: "T-7",
    title: "Make it easier to use EVs if you can't charge at home",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT", "BDS", "BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Expand public EV charging infrastructure in neighborhoods with high rates of apartment dwellers who cannot install home chargers. Prioritizes BIPOC communities and East Portland.",
    cobenefits: "EV equity, air quality, public health",
  },
  {
    actionId: "T-8",
    title: "Make freight cleaner",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Develop strategies to electrify and decarbonize the commercial freight sector, including last-mile delivery, warehouse electrification, and anti-idling enforcement. Coordinates with Port of Portland.",
    cobenefits: "Air quality near freight corridors, public health in industrial areas",
  },
  {
    actionId: "T-9",
    title: "Replace petroleum diesel at the pump (Renewable Fuel Standard)",
    sector: "transportation",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "FY 22-23",
    resourceGap: "+",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "achieved",
    description:
      "Oregon's Clean Fuels Program and Renewable Fuel Standard require increasing percentages of renewable fuel blending. BPS coordinated city fleet transition and advocated for state program expansion.",
  },

  // ── Industry (1) ─────────────────────────────────────────────────────────
  {
    actionId: "I-1",
    title: "Develop strategies for industrial sector emissions reduction",
    sector: "industry",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "FY 23-24",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Conduct analysis of industrial emissions sources within city limits and develop sector-specific decarbonization strategies. Includes coordination with large industrial employers and state environmental agencies.",
  },

  // ── Land Use (3) ─────────────────────────────────────────────────────────
  {
    actionId: "LU-1",
    title: "Increase capacity for compact mixed-use community planning",
    sector: "land-use",
    category: "decarbonization",
    leadBureaus: ["BPS", "PBOT", "BES", "PP&R", "PWB"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "delayed",
    description:
      "Implement Residential Infill Project and 2035 Comprehensive Plan updates to allow more housing density near transit. Requires cross-bureau coordination and has faced significant community opposition and legal challenges.",
    cobenefits: "Housing affordability, reduced VMT, walkable neighborhoods",
  },
  {
    actionId: "LU-2",
    title: "Avoid displacement as neighborhoods grow",
    sector: "land-use",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "—",
    resourceGap: "$$$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Develop anti-displacement tools including community land trusts, affordable housing set-asides, and tenant protection programs to ensure climate-positive densification doesn't displace existing residents.",
    cobenefits: "Housing stability, community cohesion, climate justice",
  },
  {
    actionId: "LU-3",
    title: "Explore last-mile urban logistics hubs",
    sector: "land-use",
    category: "decarbonization",
    leadBureaus: ["BPS", "PBOT"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing (funded thru 23-24)",
    resourceGap: "$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Pilot urban consolidation centers and cargo bike last-mile delivery programs to reduce delivery vehicle VMT in the Central City. Includes zoning analysis for logistics hub siting.",
  },

  // ── Embodied Carbon / Food (3) ────────────────────────────────────────────
  {
    actionId: "S-1",
    title: "Prevent food waste through outreach",
    sector: "waste-food",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "N/A",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Run public education campaigns and business technical assistance to reduce food waste at source. Includes partnerships with food banks, restaurants, and grocery retailers.",
    cobenefits: "Food security, household cost savings, landfill diversion",
  },
  {
    actionId: "S-2",
    title: "Reduce food waste through composting and food donation",
    sector: "waste-food",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "N/A",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Expand commercial composting access, food rescue programs, and organics diversion infrastructure. Includes Metro coordination on regional composting capacity.",
    cobenefits: "Landfill diversion, soil health, food security",
  },
  {
    actionId: "S-3",
    title: "Invest in community-led reuse, repair, sharing",
    sector: "waste-food",
    category: "decarbonization",
    leadBureaus: ["BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-24",
    resourceGap: "$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Fund and support community repair cafes, tool libraries, clothing swaps, and sharing economy programs that reduce consumption-based emissions.",
    cobenefits: "Community building, household cost savings, waste reduction",
  },

  // ── Cross-Sector (1) ─────────────────────────────────────────────────────
  {
    actionId: "C-1",
    title: "Implement internal cost of carbon in City decision-making",
    sector: "cross-sector",
    category: "decarbonization",
    leadBureaus: ["BPS", "PP&R", "OMF", "BES", "PBOT", "PWB"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-24",
    resourceGap: "Funded",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Apply a social cost of carbon to all major city procurement, capital planning, and budget decisions. BPS developed the methodology; OMF/CBO is integrating into budget process. Addresses audit Recommendation 2 directly.",
    cobenefits: "Better-informed capital decisions, long-term cost savings",
  },

  // ── Flooding (5) ─────────────────────────────────────────────────────────
  {
    actionId: "F-1",
    title: "Update floodplain maps and apply new regulations",
    sector: "flooding",
    category: "resilience",
    leadBureaus: ["BPS", "BES", "BDS", "PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Update FEMA floodplain maps to reflect current conditions and climate projections, then update zoning regulations to restrict development in high-risk flood areas. Major funding gap for updated modeling.",
    cobenefits: "Property protection, reduced flood insurance costs, ecological health",
  },
  {
    actionId: "F-2",
    title: "Update Johnson Creek hydraulic models and floodplain maps",
    sector: "flooding",
    category: "resilience",
    leadBureaus: ["BPS", "BES", "BDS", "PBOT"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-25",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Johnson Creek is Portland's most flood-prone watershed. Updated hydraulic models will incorporate climate change projections and drive regulatory updates to protect homes and infrastructure in the floodplain.",
    cobenefits: "Property protection, habitat restoration, recreation",
  },
  {
    actionId: "F-3",
    title: "Develop floodplain mitigation banking program",
    sector: "flooding",
    category: "resilience",
    leadBureaus: ["BES", "BPS", "BDS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Create a mitigation banking program that allows developers to fund floodplain restoration and wetland creation as compensation for development impacts. Generates ecological benefits while managing flood risk.",
    cobenefits: "Wetland restoration, wildlife habitat, water quality",
  },
  {
    actionId: "F-4",
    title: "Expand Willing Seller Program for flooded properties",
    sector: "flooding",
    category: "resilience",
    leadBureaus: ["BES"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Acquire flood-prone properties from willing sellers and restore them to natural floodplain functions. Prioritizes repeatedly flooded properties in East Portland and Johnson Creek corridor.",
    cobenefits: "Habitat restoration, reduced flood insurance, community safety",
  },
  {
    actionId: "F-5",
    title: "Design/construct floodplain and wetland restoration sites",
    sector: "flooding",
    category: "resilience",
    leadBureaus: ["BES"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Design and construct floodplain restoration projects that reduce peak flood flows, improve water quality, and restore native habitat. Coordinates with Army Corps of Engineers and ODFW.",
    cobenefits: "Habitat restoration, water quality, recreation, educational opportunities",
  },

  // ── Trees / Canopy (3) ───────────────────────────────────────────────────
  {
    actionId: "TR-1",
    title: "Update Urban Forestry Management Plan",
    sector: "trees-canopy",
    category: "resilience",
    leadBureaus: ["PP&R", "BES", "BPS"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-24",
    resourceGap: "TBD",
    isPcefFunded: true,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Update Portland's Urban Forestry Management Plan to integrate climate resilience goals, including canopy equity targets for East Portland and cooling infrastructure priorities.",
    cobenefits: "Urban heat island mitigation, air quality, mental health, property values",
  },
  {
    actionId: "TR-2",
    title: "Update Title 11 tree regulations",
    sector: "trees-canopy",
    category: "resilience",
    leadBureaus: ["PP&R", "BES", "BPS"],
    isDeclarationPriority: true,
    fiscalYear: "Within 2 years",
    resourceGap: "TBD",
    isPcefFunded: true,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Update Portland's tree regulations (Title 11) to better protect existing large trees, require canopy replacement for development, and align with climate resilience goals.",
    cobenefits: "Urban cooling, air quality, stormwater management, biodiversity",
  },
  {
    actionId: "TR-3",
    title: "Expand tree planting in East Portland and priority areas",
    sector: "trees-canopy",
    category: "resilience",
    leadBureaus: ["PP&R", "BES", "BPS"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: true,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "PCEF-funded tree planting program prioritizing low-canopy neighborhoods in East Portland and historically disinvested communities. Goal of closing canopy equity gap between NW Portland (40%+ canopy) and East Portland (under 10%).",
    cobenefits: "Urban cooling, air quality, stormwater, equity",
  },

  // ── Natural Resources / Green Infrastructure (4) ─────────────────────────
  {
    actionId: "NR-1",
    title: "Ezone Map Correction Project for natural resources",
    sector: "natural-resources",
    category: "resilience",
    leadBureaus: ["BPS", "BES"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-25",
    resourceGap: "$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Systematic review and correction of Portland's Environmental Zone (Ezone) maps to ensure all significant natural resources are protected under zoning code. Addresses legacy mapping errors.",
    cobenefits: "Habitat protection, stormwater management, flood mitigation",
  },
  {
    actionId: "NR-2",
    title: "Support community-based watershed stewardship organizations",
    sector: "natural-resources",
    category: "resilience",
    leadBureaus: ["BES", "PP&R", "PBEM"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "None",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Provide technical assistance, volunteer coordination, and modest grants to community groups doing watershed restoration, invasive species removal, and native planting in Portland's watersheds.",
    cobenefits: "Community engagement, ecological restoration, youth education",
  },
  {
    actionId: "NR-3",
    title: "Incorporate climate resilience into Economic Opportunities Analysis",
    sector: "natural-resources",
    category: "resilience",
    leadBureaus: ["BPS", "BES", "PP&R"],
    isDeclarationPriority: true,
    fiscalYear: "FY 22-24",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Integrate climate risk and green economy opportunities into Portland's Economic Opportunities Analysis to ensure economic development planning accounts for climate impacts and the clean economy transition.",
    cobenefits: "Green jobs, economic resilience, equitable development",
  },
  {
    actionId: "NR-4",
    title: "Citywide green infrastructure systems plan",
    sector: "natural-resources",
    category: "resilience",
    leadBureaus: ["BES", "PBOT", "PP&R", "BPS"],
    isDeclarationPriority: true,
    fiscalYear: "TBD",
    resourceGap: "TBD",
    isPcefFunded: true,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Develop a comprehensive green infrastructure plan integrating stormwater management, urban cooling, flood mitigation, habitat connectivity, and community access across city systems.",
    cobenefits: "Stormwater management, urban cooling, biodiversity, recreation",
  },

  // ── Wildfire (2) ─────────────────────────────────────────────────────────
  {
    actionId: "W-1",
    title: "Implement wildfire prevention from Multnomah County plan",
    sector: "wildfire",
    category: "resilience",
    leadBureaus: ["PBEM", "PF&R", "BPS", "PP&R", "JOHS"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Implement Portland's components of the Multnomah County Community Wildfire Protection Plan, including defensible space programs, community notification, and coordination with unhoused population services during wildfire events.",
    cobenefits: "Property protection, air quality, community safety",
  },
  {
    actionId: "W-2",
    title: "Build Wildfire Prevention Program",
    sector: "wildfire",
    category: "resilience",
    leadBureaus: ["PF&R", "PBEM", "PP&R", "BPS", "BDS"],
    isDeclarationPriority: false,
    fiscalYear: "FY 22-23",
    resourceGap: "$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Establish a dedicated Wildfire Prevention Program within Portland Fire & Rescue to conduct risk assessments, home hardening education, and defensible space inspections in the Wildland-Urban Interface.",
    cobenefits: "Property protection, reduced fire suppression costs, community resilience",
  },

  // ── Health Impacts — Heat and Smoke (2) ──────────────────────────────────
  {
    actionId: "H-1",
    title: "Reduce indoor health impacts (15,000 cooling units, HVAC upgrades, temperature monitoring)",
    sector: "health-heat-smoke",
    category: "resilience",
    leadBureaus: ["PCEF", "PP&R", "PBEM"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: true,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "PCEF-funded program to distribute cooling units, fund HVAC upgrades, and install temperature monitoring in residences of elderly, disabled, and low-income residents. Responds to 2021 heat dome that killed 96 people in Portland.",
    cobenefits: "Public health, reduced heat mortality, energy efficiency",
  },
  {
    actionId: "H-2",
    title: "Reduce outdoor workers' health impacts (extreme heat/smoke protocols)",
    sector: "health-heat-smoke",
    category: "resilience",
    leadBureaus: ["PWB", "PP&R", "BES", "PBOT", "BDS", "BHR", "BRFS", "PF&R"],
    isDeclarationPriority: false,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Develop and implement extreme heat and wildfire smoke protocols for all City employees working outdoors. Includes cooling stations, schedule adjustments, PPE, and air quality monitoring.",
    cobenefits: "Worker safety, reduced liability, operational continuity",
  },

  // ── Resilience Hubs (2) ──────────────────────────────────────────────────
  {
    actionId: "RH-1",
    title: "Convert East Portland Community Center into resilience center",
    sector: "resilience-hubs",
    category: "resilience",
    leadBureaus: ["PP&R", "PBEM"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "TBD",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Upgrade the East Portland Community Center with backup power, cooling capacity, supply stockpiles, and community services capacity to function as a neighborhood resilience hub during climate emergencies.",
    cobenefits: "Community services, emergency preparedness, equity",
  },
  {
    actionId: "RH-2",
    title: "Neighborhood-scale solar + battery energy resilience",
    sector: "resilience-hubs",
    category: "resilience",
    leadBureaus: ["BPS", "PBEM", "PP&R"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-25",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "delayed",
    description:
      "Install solar panels and battery storage at community centers, libraries, and fire stations to provide backup power during grid outages from extreme weather. Significant funding gap has delayed implementation.",
    cobenefits: "Grid resilience, clean energy demonstration, emergency preparedness",
  },

  // ── Infrastructure Planning (2) ──────────────────────────────────────────
  {
    actionId: "IP-1",
    title: "Incorporate climate change into capital planning and infrastructure design",
    sector: "infrastructure",
    category: "resilience",
    leadBureaus: ["BES", "PWB", "PBOT", "PP&R"],
    isDeclarationPriority: true,
    fiscalYear: "Ongoing",
    resourceGap: "$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Require all capital project planning to use climate-adjusted design standards (higher flood elevations, heat-resistant materials, drought-tolerant plantings). Addresses audit Recommendation 3 on adaptation goals.",
    cobenefits: "Reduced long-term maintenance costs, infrastructure longevity",
  },
  {
    actionId: "IP-2",
    title: "West Burnside Road landslide prevention improvements",
    sector: "infrastructure",
    category: "resilience",
    leadBureaus: ["PBOT", "BES", "PP&R"],
    isDeclarationPriority: false,
    fiscalYear: "5-year capital",
    resourceGap: "$$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Design and construct slope stabilization improvements along West Burnside Road, a critical arterial vulnerable to landslides exacerbated by more intense rainfall events. In 5-year capital plan with major funding gap.",
    cobenefits: "Transportation safety, property protection, natural disaster prevention",
  },

  // ── Emergency Planning (4) ───────────────────────────────────────────────
  {
    actionId: "EP-1",
    title: "Equipment for transportation continuity during extreme weather",
    sector: "emergency-planning",
    category: "resilience",
    leadBureaus: ["PBOT", "PP&R", "BES"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-24",
    resourceGap: "$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Purchase equipment (snow removal, debris clearing, emergency bridges) to maintain critical transportation routes during extreme weather events. Response to road closures during 2021 heat dome and 2022 ice storms.",
    cobenefits: "Economic continuity, emergency response capacity, public safety",
  },
  {
    actionId: "EP-2",
    title: "Equipment for emergency response during extreme weather",
    sector: "emergency-planning",
    category: "resilience",
    leadBureaus: ["PBOT", "PP&R", "BES", "PWB"],
    isDeclarationPriority: false,
    fiscalYear: "FY 23-24",
    resourceGap: "$$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Acquire specialized equipment for emergency response to climate-driven events including flooding, wildfire, heat emergencies, and ice storms. Includes generators, pumps, and communication systems.",
    cobenefits: "Public safety, operational capacity, first responder protection",
  },
  {
    actionId: "EP-3",
    title: "Draft/revise emergency and continuity of operations plans",
    sector: "emergency-planning",
    category: "resilience",
    leadBureaus: ["PBEM", "PBOT", "PP&R"],
    isDeclarationPriority: true,
    fiscalYear: "FY 23-24",
    resourceGap: "$$$",
    isPcefFunded: false,
    isMultiBureau: true,
    status: "ongoing",
    description:
      "Update Portland's Emergency Operations Plan and all bureau continuity of operations plans to incorporate climate scenarios including multi-day heat events, wildfire smoke, major flooding, and cascading infrastructure failures.",
    cobenefits: "Organizational resilience, public safety, reduced emergency costs",
  },
  {
    actionId: "EP-4",
    title: "Increase regional climate resilience awareness",
    sector: "emergency-planning",
    category: "resilience",
    leadBureaus: ["PBEM"],
    isDeclarationPriority: true,
    fiscalYear: "—",
    resourceGap: "$$",
    isPcefFunded: false,
    isMultiBureau: false,
    status: "ongoing",
    description:
      "Public outreach and education program to increase Portland residents' awareness of climate risks, emergency preparedness, and community resilience resources. Includes multilingual materials and community partnerships.",
    cobenefits: "Community resilience, social cohesion, reduced emergency response burden",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY  (from 2023, 2024, and 2025 progress reports)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_HISTORY = [
  // E-1: achieved through Oregon legislative process
  { actionId: "E-1", status: "ongoing", statusDate: "2022-10-01", narrative: "Oregon HB 2021 signed into law. BPS developing implementation roadmap with PGE and Pacific Power.", source: "2023 Progress Report" },
  { actionId: "E-1", status: "achieved", statusDate: "2024-06-01", narrative: "Oregon utilities on track with HB 2021 compliance. Portland 100% Renewable Energy Resolution milestone met.", source: "2024 Progress Report" },
  // T-5: VMT state policies
  { actionId: "T-5", status: "ongoing", statusDate: "2022-10-01", narrative: "Advocacy underway for state VMT reduction framework through Metro's Climate Smart Communities process.", source: "2023 Progress Report" },
  { actionId: "T-5", status: "achieved", statusDate: "2023-06-01", narrative: "Oregon HB 3055 (Transportation Decarbonization) passed. Metro adopted Climate Smart Communities scenario with VMT targets.", source: "2024 Progress Report" },
  // T-6: EV-ready construction
  { actionId: "T-6", status: "ongoing", statusDate: "2022-10-01", narrative: "BPS and BDS drafting code amendment. Public comment period open.", source: "2023 Progress Report" },
  { actionId: "T-6", status: "achieved", statusDate: "2023-06-01", narrative: "EV-ready requirements adopted in Portland Building Code, effective January 2024.", source: "2024 Progress Report" },
  // T-9: Renewable Fuel Standard
  { actionId: "T-9", status: "achieved", statusDate: "2022-10-01", narrative: "Oregon Clean Fuels Program operational. City fleet transitioned to renewable diesel. RFS targets met.", source: "2023 Progress Report" },
  // B-4: Embodied carbon
  { actionId: "B-4", status: "ongoing", statusDate: "2022-10-01", narrative: "Embodied carbon methodology under development. Pilot projects underway.", source: "2023 Progress Report" },
  { actionId: "B-4", status: "achieved", statusDate: "2024-01-01", narrative: "Low embodied carbon requirements adopted in Green Building Policy effective FY 24-25.", source: "2025 Progress Report" },
  // B-1: Delayed — complex market transformation needed
  { actionId: "B-1", status: "ongoing", statusDate: "2022-10-01", narrative: "Stakeholder engagement underway. State enabling legislation needed.", source: "2023 Progress Report" },
  { actionId: "B-1", status: "delayed", statusDate: "2025-03-01", narrative: "State legislation for mandatory building electrification not passed. Timeline TBD pending new state session.", source: "2025 Progress Report" },
  // LU-1: Delayed due to challenges
  { actionId: "LU-1", status: "ongoing", statusDate: "2022-10-01", narrative: "Residential Infill Project implementation underway. Cross-bureau coordination initiated.", source: "2023 Progress Report" },
  { actionId: "LU-1", status: "delayed", statusDate: "2025-03-01", narrative: "Legal challenges to RIP have slowed implementation. Funding gap remains unresolved. New 2035 Comp Plan underway.", source: "2025 Progress Report" },
  // RH-2: Delayed — funding gap
  { actionId: "RH-2", status: "ongoing", statusDate: "2022-10-01", narrative: "Site assessments underway. Federal grant applications submitted.", source: "2023 Progress Report" },
  { actionId: "RH-2", status: "delayed", statusDate: "2025-03-01", narrative: "Federal grants not secured. Estimated $$$$$  gap unresolved. Pilot delayed to FY 26-27.", source: "2025 Progress Report" },
];

// ─────────────────────────────────────────────────────────────────────────────
// EMISSIONS TRAJECTORY  (Multnomah County, million MTCO2e)
// Source: BPS Climate & Energy Dashboard, 1990-2023 inventory
// ─────────────────────────────────────────────────────────────────────────────

const EMISSIONS_DATA = [
  // Historical actuals (isTarget=false)
  { year: 1990, isTarget: false, totalMtco2e: 10.40, electricityMtco2e: 2.10, buildingsMtco2e: 2.40, transportationMtco2e: 4.00, wasteMtco2e: 0.90, industryMtco2e: 0.70, otherMtco2e: 0.30, populationThousands: 583 },
  { year: 1995, isTarget: false, totalMtco2e: 10.80, electricityMtco2e: 2.20, buildingsMtco2e: 2.50, transportationMtco2e: 4.20, wasteMtco2e: 0.90, industryMtco2e: 0.65, otherMtco2e: 0.35, populationThousands: 610 },
  { year: 2000, isTarget: false, totalMtco2e: 11.60, electricityMtco2e: 2.50, buildingsMtco2e: 2.70, transportationMtco2e: 4.60, wasteMtco2e: 0.88, industryMtco2e: 0.62, otherMtco2e: 0.30, populationThousands: 660 },
  { year: 2005, isTarget: false, totalMtco2e: 11.20, electricityMtco2e: 2.30, buildingsMtco2e: 2.60, transportationMtco2e: 4.50, wasteMtco2e: 0.85, industryMtco2e: 0.60, otherMtco2e: 0.35, populationThousands: 685 },
  { year: 2010, isTarget: false, totalMtco2e: 10.10, electricityMtco2e: 1.90, buildingsMtco2e: 2.30, transportationMtco2e: 4.20, wasteMtco2e: 0.75, industryMtco2e: 0.60, otherMtco2e: 0.35, populationThousands: 720 },
  { year: 2015, isTarget: false, totalMtco2e: 9.20, electricityMtco2e: 1.50, buildingsMtco2e: 2.20, transportationMtco2e: 3.90, wasteMtco2e: 0.68, industryMtco2e: 0.58, otherMtco2e: 0.34, populationThousands: 762 },
  { year: 2018, isTarget: false, totalMtco2e: 8.50, electricityMtco2e: 1.20, buildingsMtco2e: 2.10, transportationMtco2e: 3.60, wasteMtco2e: 0.65, industryMtco2e: 0.57, otherMtco2e: 0.38, populationThousands: 796 },
  { year: 2019, isTarget: false, totalMtco2e: 8.30, electricityMtco2e: 1.10, buildingsMtco2e: 2.05, transportationMtco2e: 3.55, wasteMtco2e: 0.63, industryMtco2e: 0.57, otherMtco2e: 0.40, populationThousands: 802 },
  { year: 2020, isTarget: false, totalMtco2e: 7.60, electricityMtco2e: 0.95, buildingsMtco2e: 1.95, transportationMtco2e: 3.10, wasteMtco2e: 0.62, industryMtco2e: 0.55, otherMtco2e: 0.43, populationThousands: 806 },
  { year: 2021, isTarget: false, totalMtco2e: 8.00, electricityMtco2e: 0.90, buildingsMtco2e: 2.00, transportationMtco2e: 3.40, wasteMtco2e: 0.62, industryMtco2e: 0.55, otherMtco2e: 0.53, populationThousands: 808 },
  { year: 2022, isTarget: false, totalMtco2e: 7.90, electricityMtco2e: 0.85, buildingsMtco2e: 1.98, transportationMtco2e: 3.35, wasteMtco2e: 0.61, industryMtco2e: 0.55, otherMtco2e: 0.56, populationThousands: 809 },
  { year: 2023, isTarget: false, totalMtco2e: 7.70, electricityMtco2e: 0.80, buildingsMtco2e: 1.95, transportationMtco2e: 3.30, wasteMtco2e: 0.60, industryMtco2e: 0.54, otherMtco2e: 0.51, populationThousands: 811 },
  // Target lines (isTarget=true)
  { year: 2030, isTarget: true, targetType: "2030_goal", totalMtco2e: 5.20, electricityMtco2e: null, buildingsMtco2e: null, transportationMtco2e: null, wasteMtco2e: null, industryMtco2e: null, otherMtco2e: null, populationThousands: null },
  { year: 2050, isTarget: true, targetType: "2050_goal", totalMtco2e: 0.00, electricityMtco2e: null, buildingsMtco2e: null, transportationMtco2e: null, wasteMtco2e: null, industryMtco2e: null, otherMtco2e: null, populationThousands: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// PCEF ALLOCATIONS  (Bureau projects vs. community grants)
// Source: PCEF Climate Investment Plan
// ─────────────────────────────────────────────────────────────────────────────

const PCEF_ALLOCATIONS = [
  // Bureau allocations (FY 21-22 through FY 28-29 projected, ~$740M total)
  { fiscalYear: "FY 21-22", recipient: "BES", recipientType: "bureau", amount: 22000000, programArea: "Clean Water & Watershed Health" },
  { fiscalYear: "FY 21-22", recipient: "BPS", recipientType: "bureau", amount: 18000000, programArea: "Clean Energy & Equitable Buildings" },
  { fiscalYear: "FY 21-22", recipient: "PP&R", recipientType: "bureau", amount: 14000000, programArea: "Trees, Parks & Green Infrastructure" },
  { fiscalYear: "FY 21-22", recipient: "PBOT", recipientType: "bureau", amount: 12000000, programArea: "Clean Transportation" },
  { fiscalYear: "FY 21-22", recipient: "PWB", recipientType: "bureau", amount: 8000000, programArea: "Resilient Water Infrastructure" },
  { fiscalYear: "FY 22-23", recipient: "BES", recipientType: "bureau", amount: 28000000, programArea: "Clean Water & Watershed Health" },
  { fiscalYear: "FY 22-23", recipient: "BPS", recipientType: "bureau", amount: 24000000, programArea: "Clean Energy & Equitable Buildings" },
  { fiscalYear: "FY 22-23", recipient: "PP&R", recipientType: "bureau", amount: 18000000, programArea: "Trees, Parks & Green Infrastructure" },
  { fiscalYear: "FY 22-23", recipient: "PBOT", recipientType: "bureau", amount: 15000000, programArea: "Clean Transportation" },
  { fiscalYear: "FY 22-23", recipient: "PWB", recipientType: "bureau", amount: 10000000, programArea: "Resilient Water Infrastructure" },
  { fiscalYear: "FY 23-24", recipient: "BES", recipientType: "bureau", amount: 32000000, programArea: "Clean Water & Watershed Health" },
  { fiscalYear: "FY 23-24", recipient: "BPS", recipientType: "bureau", amount: 28000000, programArea: "Clean Energy & Equitable Buildings" },
  { fiscalYear: "FY 23-24", recipient: "PP&R", recipientType: "bureau", amount: 22000000, programArea: "Trees, Parks & Green Infrastructure" },
  { fiscalYear: "FY 23-24", recipient: "PBOT", recipientType: "bureau", amount: 17000000, programArea: "Clean Transportation" },
  { fiscalYear: "FY 23-24", recipient: "PWB", recipientType: "bureau", amount: 12000000, programArea: "Resilient Water Infrastructure" },
  { fiscalYear: "FY 24-25", recipient: "BES", recipientType: "bureau", amount: 35000000, programArea: "Clean Water & Watershed Health" },
  { fiscalYear: "FY 24-25", recipient: "BPS", recipientType: "bureau", amount: 30000000, programArea: "Clean Energy & Equitable Buildings" },
  { fiscalYear: "FY 24-25", recipient: "PP&R", recipientType: "bureau", amount: 25000000, programArea: "Trees, Parks & Green Infrastructure" },
  { fiscalYear: "FY 24-25", recipient: "PBOT", recipientType: "bureau", amount: 18000000, programArea: "Clean Transportation" },
  { fiscalYear: "FY 24-25", recipient: "PWB", recipientType: "bureau", amount: 14000000, programArea: "Resilient Water Infrastructure" },
  // Community grants
  { fiscalYear: "FY 21-22", recipient: "Community Grants Program", recipientType: "community", amount: 24000000, programArea: "Community-led Clean Energy" },
  { fiscalYear: "FY 22-23", recipient: "Community Grants Program", recipientType: "community", amount: 28000000, programArea: "Community-led Clean Energy" },
  { fiscalYear: "FY 23-24", recipient: "Community Grants Program", recipientType: "community", amount: 32000000, programArea: "Community-led Clean Energy" },
  { fiscalYear: "FY 24-25", recipient: "Community Grants Program", recipientType: "community", amount: 36000000, programArea: "Community-led Clean Energy" },
];

const PCEF_INTEREST_DIVERSIONS = [
  { fiscalYear: "FY 21-22", amountDiverted: 4200000, destination: "General Fund", notes: "City Council approved transfer to address General Fund shortfall during COVID recovery." },
  { fiscalYear: "FY 22-23", amountDiverted: 6800000, destination: "General Fund", notes: "Interest earnings diverted to fill General Fund gap per City Council budget action." },
  { fiscalYear: "FY 23-24", amountDiverted: 8100000, destination: "General Fund", notes: "PCEF interest redirected during budget consolidation. Community groups raised transparency concerns." },
  { fiscalYear: "FY 24-25", amountDiverted: 5900000, destination: "General Fund", notes: "Continued diversion despite PCEF oversight committee objections. ~$25M total since fund inception." },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding Climate Accountability Platform data...\n");

  // ── Workplan actions ──────────────────────────────────────────────────────
  console.log(`Inserting ${ACTIONS.length} workplan actions...`);
  for (const action of ACTIONS) {
    await sql`
      INSERT INTO public.climate_workplan_actions (
        action_id, title, sector, category, lead_bureaus,
        is_declaration_priority, fiscal_year, resource_gap,
        is_pcef_funded, is_multi_bureau, status,
        description, cobenefits
      ) VALUES (
        ${action.actionId}, ${action.title}, ${action.sector}, ${action.category},
        ${action.leadBureaus}::text[], ${action.isDeclarationPriority}, ${action.fiscalYear ?? null},
        ${action.resourceGap ?? null}, ${action.isPcefFunded}, ${action.isMultiBureau},
        ${action.status}, ${action.description ?? null}, ${(action as { cobenefits?: string }).cobenefits ?? null}
      )
      ON CONFLICT (action_id) DO UPDATE SET
        title = EXCLUDED.title,
        sector = EXCLUDED.sector,
        category = EXCLUDED.category,
        lead_bureaus = EXCLUDED.lead_bureaus,
        is_declaration_priority = EXCLUDED.is_declaration_priority,
        fiscal_year = EXCLUDED.fiscal_year,
        resource_gap = EXCLUDED.resource_gap,
        is_pcef_funded = EXCLUDED.is_pcef_funded,
        is_multi_bureau = EXCLUDED.is_multi_bureau,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        cobenefits = EXCLUDED.cobenefits,
        updated_at = NOW()
    `;
  }
  console.log("  ✓ Workplan actions inserted");

  // ── Status history ────────────────────────────────────────────────────────
  console.log(`Inserting ${STATUS_HISTORY.length} status history entries...`);
  await sql`DELETE FROM public.climate_action_status_history`;
  for (const entry of STATUS_HISTORY) {
    await sql`
      INSERT INTO public.climate_action_status_history (action_id, status, status_date, narrative, source)
      VALUES (${entry.actionId}, ${entry.status}, ${entry.statusDate}::date, ${entry.narrative}, ${entry.source})
    `;
  }
  console.log("  ✓ Status history inserted");

  // ── Emissions trajectory ─────────────────────────────────────────────────
  console.log(`Inserting ${EMISSIONS_DATA.length} emissions data points...`);
  await sql`DELETE FROM public.climate_emissions_trajectory`;
  for (const row of EMISSIONS_DATA) {
    await sql`
      INSERT INTO public.climate_emissions_trajectory (
        year, is_target, target_type, total_mtco2e, electricity_mtco2e,
        buildings_mtco2e, transportation_mtco2e, waste_mtco2e,
        industry_mtco2e, other_mtco2e, population_thousands
      ) VALUES (
        ${row.year}, ${row.isTarget}, ${row.targetType ?? null},
        ${row.totalMtco2e ?? null}, ${row.electricityMtco2e ?? null},
        ${row.buildingsMtco2e ?? null}, ${row.transportationMtco2e ?? null},
        ${row.wasteMtco2e ?? null}, ${row.industryMtco2e ?? null},
        ${row.otherMtco2e ?? null}, ${row.populationThousands ?? null}
      )
    `;
  }
  console.log("  ✓ Emissions trajectory inserted");

  // ── PCEF allocations ──────────────────────────────────────────────────────
  console.log(`Inserting ${PCEF_ALLOCATIONS.length} PCEF allocation records...`);
  await sql`DELETE FROM public.pcef_allocations`;
  for (const row of PCEF_ALLOCATIONS) {
    await sql`
      INSERT INTO public.pcef_allocations (fiscal_year, recipient, recipient_type, amount, program_area)
      VALUES (${row.fiscalYear}, ${row.recipient}, ${row.recipientType}, ${row.amount}, ${row.programArea})
    `;
  }
  console.log("  ✓ PCEF allocations inserted");

  // ── PCEF interest diversions ──────────────────────────────────────────────
  console.log(`Inserting ${PCEF_INTEREST_DIVERSIONS.length} PCEF interest diversion records...`);
  await sql`DELETE FROM public.pcef_interest_diversions`;
  for (const row of PCEF_INTEREST_DIVERSIONS) {
    await sql`
      INSERT INTO public.pcef_interest_diversions (fiscal_year, amount_diverted, destination, notes)
      VALUES (${row.fiscalYear}, ${row.amountDiverted}, ${row.destination}, ${row.notes})
    `;
  }
  console.log("  ✓ PCEF interest diversions inserted");

  // ── Bureau scorecard (computed from action data) ──────────────────────────
  console.log("Computing and inserting bureau scorecard...");
  await sql`DELETE FROM public.climate_bureau_scorecard`;

  // Collect all bureaus from actions
  const bureauMap: Record<string, { name: string; total: number; achieved: number; ongoing: number; delayed: number; crossBureau: number }> = {};
  const BUREAU_NAMES: Record<string, string> = {
    "BPS": "Bureau of Planning & Sustainability",
    "PBOT": "Portland Bureau of Transportation",
    "BES": "Bureau of Environmental Services",
    "PP&R": "Portland Parks & Recreation",
    "PWB": "Portland Water Bureau",
    "BDS": "Bureau of Development Services",
    "PF&R": "Portland Fire & Rescue",
    "PBEM": "Portland Bureau of Emergency Management",
    "OMF": "Office of Management & Finance",
    "PCEF": "Portland Clean Energy Fund",
    "JOHS": "Joint Office of Homeless Services",
  };

  for (const action of ACTIONS) {
    for (const bureau of action.leadBureaus) {
      if (!BUREAU_NAMES[bureau]) continue; // skip unlisted bureaus
      if (!bureauMap[bureau]) {
        bureauMap[bureau] = { name: BUREAU_NAMES[bureau], total: 0, achieved: 0, ongoing: 0, delayed: 0, crossBureau: 0 };
      }
      bureauMap[bureau].total++;
      if (action.status === "achieved") bureauMap[bureau].achieved++;
      else if (action.status === "ongoing") bureauMap[bureau].ongoing++;
      else if (action.status === "delayed") bureauMap[bureau].delayed++;
      if (action.isMultiBureau) bureauMap[bureau].crossBureau++;
    }
  }

  // Compute PCEF funding per bureau from allocations
  const pcefByBureau: Record<string, number> = {};
  for (const alloc of PCEF_ALLOCATIONS) {
    if (alloc.recipientType === "bureau") {
      pcefByBureau[alloc.recipient] = (pcefByBureau[alloc.recipient] ?? 0) + alloc.amount;
    }
  }

  for (const [bureauCode, data] of Object.entries(bureauMap)) {
    await sql`
      INSERT INTO public.climate_bureau_scorecard (
        bureau_code, bureau_name, total_actions, achieved_actions,
        ongoing_actions, delayed_actions, cross_bureau_actions, pcef_funding_received
      ) VALUES (
        ${bureauCode}, ${data.name}, ${data.total}, ${data.achieved},
        ${data.ongoing}, ${data.delayed}, ${data.crossBureau},
        ${pcefByBureau[bureauCode] ?? null}
      )
      ON CONFLICT (bureau_code) DO UPDATE SET
        bureau_name = EXCLUDED.bureau_name,
        total_actions = EXCLUDED.total_actions,
        achieved_actions = EXCLUDED.achieved_actions,
        ongoing_actions = EXCLUDED.ongoing_actions,
        delayed_actions = EXCLUDED.delayed_actions,
        cross_bureau_actions = EXCLUDED.cross_bureau_actions,
        pcef_funding_received = EXCLUDED.pcef_funding_received,
        updated_at = NOW()
    `;
  }
  console.log("  ✓ Bureau scorecard inserted");

  // ── Climate finance sources summary ──────────────────────────────────────
  console.log("Inserting climate finance source summary...");
  await sql`DELETE FROM public.climate_finance_sources`;

  // Count actions by funding type
  const fundingCounts = { PCEF: 0, Funded: 0, "General Fund": 0, Unfunded: 0, TBD: 0 };
  for (const a of ACTIONS) {
    const gap = a.resourceGap ?? "TBD";
    if (a.isPcefFunded) fundingCounts["PCEF"]++;
    else if (gap === "Funded" || gap === "N/A" || gap === "+") fundingCounts["Funded"]++;
    else if (gap === "TBD" || gap === "None") fundingCounts["TBD"]++;
    else fundingCounts["Unfunded"]++;
  }

  const sources = [
    { source: "PCEF", count: fundingCounts["PCEF"], amount: 120000000 },
    { source: "Funded (General/Other)", count: fundingCounts["Funded"], amount: 45000000 },
    { source: "Unfunded Gap", count: fundingCounts["Unfunded"], amount: null },
    { source: "Funding TBD", count: fundingCounts["TBD"], amount: null },
  ];

  for (const s of sources) {
    await sql`
      INSERT INTO public.climate_finance_sources (fiscal_year, source, allocation_amount, action_count)
      VALUES ('FY 24-25', ${s.source}, ${s.amount ?? null}, ${s.count})
    `;
  }
  console.log("  ✓ Climate finance sources inserted");

  console.log("\n✅ Climate Accountability Platform seeded successfully.");
  console.log(`   ${ACTIONS.length} workplan actions`);
  console.log(`   ${EMISSIONS_DATA.length} emissions data points`);
  console.log(`   ${PCEF_ALLOCATIONS.length} PCEF allocation records`);
  console.log(`   ${PCEF_INTEREST_DIVERSIONS.length} PCEF interest diversion records`);
  console.log(`   ${Object.keys(bureauMap).length} bureau scorecard entries`);

  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
