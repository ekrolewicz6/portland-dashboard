/**
 * seed-climate-data.ts
 *
 * ALL seed data for the Portland Climate Accountability Platform.
 * Exports typed data arrays that can be imported by API routes as static
 * fallback data. Does NOT execute anything on its own.
 */

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Bureau {
  code: string;
  name: string;
}

export interface CEWAction {
  id: string;
  category: "decarbonization" | "resilience";
  sector: string;
  title: string;
  lead_bureaus: string[];
  priority: boolean;
  timeline: string;
  funding_level: string;
  status: "ongoing" | "achieved" | "delayed" | "not_started";
  multi_bureau: boolean;
  pcef_funded: boolean;
}

export interface EmissionsDataPoint {
  year: number;
  total_mt_co2e: number;
  transportation: number;
  electricity: number;
  natural_gas: number;
  industrial: number;
  waste: number;
}

export interface EmissionsTarget {
  year: number;
  target_mt_co2e: number;
  reduction_from_1990: string;
  label: string;
}

export interface RenewableEnergyDataPoint {
  year: number;
  renewable_pct: number;
  total_mwh: number;
  renewable_mwh: number;
}

export interface PCEFInvestmentCategory {
  category: string;
  total_million: number;
  description: string;
  fiscal_year_allocations: Record<string, number>;
}

// ── Bureaus ─────────────────────────────────────────────────────────────────

export const bureaus: Bureau[] = [
  { code: "BPS", name: "Bureau of Planning and Sustainability" },
  { code: "PBOT", name: "Portland Bureau of Transportation" },
  { code: "BES", name: "Bureau of Environmental Services" },
  { code: "PP&R", name: "Portland Parks & Recreation" },
  { code: "PWB", name: "Portland Water Bureau" },
  { code: "BDS", name: "Bureau of Development Services" },
  { code: "PF&R", name: "Portland Fire & Rescue" },
  { code: "PBEM", name: "Portland Bureau of Emergency Management" },
  { code: "OMF", name: "Office of Management and Finance" },
  { code: "PCEF", name: "Portland Clean Energy Community Benefits Fund" },
  { code: "JOHS", name: "Joint Office of Homeless Services" },
  { code: "BHR", name: "Bureau of Human Resources" },
  { code: "BRFS", name: "Bureau of Revenue and Financial Services" },
];

// ── CEW Actions (43 total) ──────────────────────────────────────────────────

export const cewActions: CEWAction[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DECARBONIZATION ACTIONS (22)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Electricity Supply ──────────────────────────────────────────────────
  {
    id: "E-1",
    category: "decarbonization",
    sector: "Electricity Supply",
    title: "Implement the state 100% clean electricity law",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "FY 22-25",
    funding_level: "Funded",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "E-2",
    category: "decarbonization",
    sector: "Electricity Supply",
    title: "Invest in community-owned renewable energy generation",
    lead_bureaus: ["BPS", "PCEF"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "N/A",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: true,
  },

  // ── Buildings ───────────────────────────────────────────────────────────
  {
    id: "B-1",
    category: "decarbonization",
    sector: "Buildings",
    title: "Eliminate carbon from existing buildings (private market)",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "TBD",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "B-2",
    category: "decarbonization",
    sector: "Buildings",
    title: "Eliminate carbon from City operations (Green Building Policy)",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "23-24",
    funding_level: "$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "B-3",
    category: "decarbonization",
    sector: "Buildings",
    title: "Energy retrofits on homes owned by priority populations",
    lead_bureaus: ["BPS", "PCEF"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "N/A",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: true,
  },
  {
    id: "B-4",
    category: "decarbonization",
    sector: "Buildings",
    title: "Lower embodied carbon in the built environment",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "FY 22-25",
    funding_level: "Funded",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },

  // ── Transportation ──────────────────────────────────────────────────────
  {
    id: "T-1",
    category: "decarbonization",
    sector: "Transportation",
    title: "Make low-carbon travel options safe, accessible, convenient",
    lead_bureaus: ["PBOT"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$$$$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-2",
    category: "decarbonization",
    sector: "Transportation",
    title: "Equitable pricing strategies and parking management",
    lead_bureaus: ["PBOT"],
    priority: true,
    timeline: "TBD",
    funding_level: "N/A",
    status: "delayed",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-3",
    category: "decarbonization",
    sector: "Transportation",
    title: "Decouple transportation funding from fossil fuels",
    lead_bureaus: ["PBOT"],
    priority: false,
    timeline: "TBD",
    funding_level: "N/A",
    status: "delayed",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-4",
    category: "decarbonization",
    sector: "Transportation",
    title: "Make low-carbon transportation more affordable",
    lead_bureaus: ["PBOT"],
    priority: true,
    timeline: "TBD",
    funding_level: "$$$$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-5",
    category: "decarbonization",
    sector: "Transportation",
    title: "Support state/regional VMT reduction policies",
    lead_bureaus: ["PBOT"],
    priority: false,
    timeline: "22-23",
    funding_level: "N/A",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-6",
    category: "decarbonization",
    sector: "Transportation",
    title: "Make new construction EV-ready",
    lead_bureaus: ["BPS", "BDS"],
    priority: true,
    timeline: "22-25",
    funding_level: "$",
    status: "achieved",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "T-7",
    category: "decarbonization",
    sector: "Transportation",
    title: "Make it easier to use EVs if you can't charge at home",
    lead_bureaus: ["PBOT", "BDS", "BPS"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "T-8",
    category: "decarbonization",
    sector: "Transportation",
    title: "Make freight cleaner",
    lead_bureaus: ["PBOT"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "T-9",
    category: "decarbonization",
    sector: "Transportation",
    title: "Replace petroleum diesel at the pump (Renewable Fuel Standard)",
    lead_bureaus: ["BPS"],
    priority: false,
    timeline: "22-23",
    funding_level: "+",
    status: "achieved",
    multi_bureau: false,
    pcef_funded: false,
  },

  // ── Industry ────────────────────────────────────────────────────────────
  {
    id: "I-1",
    category: "decarbonization",
    sector: "Industry",
    title: "Develop strategies for industrial sector emissions reduction",
    lead_bureaus: ["BPS"],
    priority: false,
    timeline: "23-24",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },

  // ── Land Use ────────────────────────────────────────────────────────────
  {
    id: "LU-1",
    category: "decarbonization",
    sector: "Land Use",
    title: "Increase capacity for compact mixed-use community planning",
    lead_bureaus: ["BPS", "PBOT", "BES", "PP&R", "PWB"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "LU-2",
    category: "decarbonization",
    sector: "Land Use",
    title: "Avoid displacement as neighborhoods grow",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "-",
    funding_level: "$$$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "LU-3",
    category: "decarbonization",
    sector: "Land Use",
    title: "Explore last-mile urban logistics hubs",
    lead_bureaus: ["BPS", "PBOT"],
    priority: false,
    timeline: "Ongoing (funded thru 23-24)",
    funding_level: "$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Embodied Carbon / Food ──────────────────────────────────────────────
  {
    id: "S-1",
    category: "decarbonization",
    sector: "Embodied Carbon / Food",
    title: "Prevent food waste through outreach",
    lead_bureaus: ["BPS"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "N/A",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "S-2",
    category: "decarbonization",
    sector: "Embodied Carbon / Food",
    title: "Reduce food waste through composting and food donation",
    lead_bureaus: ["BPS"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "N/A",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "S-3",
    category: "decarbonization",
    sector: "Embodied Carbon / Food",
    title: "Invest in community-led reuse, repair, sharing",
    lead_bureaus: ["BPS"],
    priority: true,
    timeline: "23-24",
    funding_level: "$",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },

  // ── Cross-Sector ────────────────────────────────────────────────────────
  {
    id: "C-1",
    category: "decarbonization",
    sector: "Cross-Sector",
    title: "Implement internal cost of carbon in City decision-making",
    lead_bureaus: ["BPS", "PP&R", "OMF", "BES", "PBOT", "PWB"],
    priority: true,
    timeline: "22-24",
    funding_level: "Funded",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESILIENCE ACTIONS (21)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Flooding ────────────────────────────────────────────────────────────
  {
    id: "F-1",
    category: "resilience",
    sector: "Flooding",
    title: "Update floodplain maps and apply new regulations",
    lead_bureaus: ["BPS", "BES", "BDS", "PBOT"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "F-2",
    category: "resilience",
    sector: "Flooding",
    title: "Update Johnson Creek hydraulic models and floodplain maps",
    lead_bureaus: ["BPS", "BES", "BDS", "PBOT"],
    priority: true,
    timeline: "23-25",
    funding_level: "$$$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "F-3",
    category: "resilience",
    sector: "Flooding",
    title: "Develop floodplain mitigation banking program",
    lead_bureaus: ["BES", "BPS", "BDS"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "F-4",
    category: "resilience",
    sector: "Flooding",
    title: "Expand Willing Seller Program for flooded properties",
    lead_bureaus: ["BES"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },
  {
    id: "F-5",
    category: "resilience",
    sector: "Flooding",
    title: "Design/construct floodplain and wetland restoration sites",
    lead_bureaus: ["BES"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: false,
    pcef_funded: false,
  },

  // ── Trees / Canopy ──────────────────────────────────────────────────────
  {
    id: "TR-1",
    category: "resilience",
    sector: "Trees / Canopy",
    title: "Update Urban Forestry Management Plan",
    lead_bureaus: ["PP&R", "BES", "BPS", "PCEF"],
    priority: true,
    timeline: "22-24",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: true,
  },
  {
    id: "TR-2",
    category: "resilience",
    sector: "Trees / Canopy",
    title: "Update Title 11 tree regulations",
    lead_bureaus: ["PP&R", "BES", "BPS", "PCEF"],
    priority: true,
    timeline: "Within 2 years",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "TR-3",
    category: "resilience",
    sector: "Trees / Canopy",
    title: "Expand tree planting in East Portland and priority areas",
    lead_bureaus: ["PP&R", "BES", "BPS", "PCEF"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: true,
  },

  // ── Natural Resources ───────────────────────────────────────────────────
  {
    id: "NR-1",
    category: "resilience",
    sector: "Natural Resources",
    title: "Ezone Map Correction Project for natural resources",
    lead_bureaus: ["BPS", "BES"],
    priority: true,
    timeline: "22-25",
    funding_level: "$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "NR-2",
    category: "resilience",
    sector: "Natural Resources",
    title: "Support community-based watershed stewardship orgs",
    lead_bureaus: ["BES", "PP&R", "PBEM"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "None",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "NR-3",
    category: "resilience",
    sector: "Natural Resources",
    title: "Incorporate climate resilience into Economic Opportunities Analysis",
    lead_bureaus: ["BPS", "BES", "PP&R"],
    priority: true,
    timeline: "22-24",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "NR-4",
    category: "resilience",
    sector: "Natural Resources",
    title: "Citywide green infrastructure systems plan",
    lead_bureaus: ["BES", "PBOT", "PP&R", "BPS", "PCEF", "PBEM"],
    priority: true,
    timeline: "TBD",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Wildfire ────────────────────────────────────────────────────────────
  {
    id: "W-1",
    category: "resilience",
    sector: "Wildfire",
    title: "Implement wildfire prevention from Multnomah County plan",
    lead_bureaus: ["PBEM", "PF&R", "BPS", "PP&R", "JOHS"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "W-2",
    category: "resilience",
    sector: "Wildfire",
    title: "Build Wildfire Prevention Program",
    lead_bureaus: ["PF&R", "PBEM", "PP&R", "BPS", "BDS"],
    priority: false,
    timeline: "22-23",
    funding_level: "$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Health Impacts ──────────────────────────────────────────────────────
  {
    id: "H-1",
    category: "resilience",
    sector: "Health Impacts",
    title:
      "Reduce indoor health impacts (15,000 cooling units, HVAC upgrades)",
    lead_bureaus: ["PCEF", "PP&R", "PBEM"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: true,
  },
  {
    id: "H-2",
    category: "resilience",
    sector: "Health Impacts",
    title: "Reduce outdoor workers' health impacts (extreme heat/smoke)",
    lead_bureaus: ["PWB", "PP&R", "BES", "PBOT", "BDS", "BHR", "BRFS", "PF&R"],
    priority: false,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Resilience Hubs ─────────────────────────────────────────────────────
  {
    id: "RH-1",
    category: "resilience",
    sector: "Resilience Hubs",
    title: "Convert East Portland Community Center into resilience center",
    lead_bureaus: ["PP&R", "PBEM"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "TBD",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "RH-2",
    category: "resilience",
    sector: "Resilience Hubs",
    title: "Neighborhood-scale solar + battery energy resilience",
    lead_bureaus: ["BPS", "PBEM", "PP&R"],
    priority: true,
    timeline: "23-25",
    funding_level: "$$$$$",
    status: "delayed",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Infrastructure Planning ─────────────────────────────────────────────
  {
    id: "IP-1",
    category: "resilience",
    sector: "Infrastructure Planning",
    title: "Incorporate climate change into capital planning",
    lead_bureaus: ["BES", "PWB", "PBOT", "PP&R"],
    priority: true,
    timeline: "Ongoing",
    funding_level: "$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "IP-2",
    category: "resilience",
    sector: "Infrastructure Planning",
    title: "West Burnside Road landslide prevention improvements",
    lead_bureaus: ["PBOT", "BES", "PP&R"],
    priority: false,
    timeline: "5-year capital",
    funding_level: "$$$$$",
    status: "delayed",
    multi_bureau: true,
    pcef_funded: false,
  },

  // ── Emergency Planning ──────────────────────────────────────────────────
  {
    id: "EP-1",
    category: "resilience",
    sector: "Emergency Planning",
    title: "Equipment for transportation continuity during extreme weather",
    lead_bureaus: ["PBOT", "PP&R", "BES"],
    priority: true,
    timeline: "23-24",
    funding_level: "$$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "EP-2",
    category: "resilience",
    sector: "Emergency Planning",
    title: "Equipment for emergency response during extreme weather",
    lead_bureaus: ["PBOT", "PP&R", "BES", "PWB"],
    priority: false,
    timeline: "23-24",
    funding_level: "$$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "EP-3",
    category: "resilience",
    sector: "Emergency Planning",
    title: "Draft/revise emergency and continuity of operations plans",
    lead_bureaus: ["PBEM", "PBOT", "PP&R"],
    priority: true,
    timeline: "23-24",
    funding_level: "$$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
  {
    id: "EP-4",
    category: "resilience",
    sector: "Emergency Planning",
    title: "Increase regional climate resilience awareness",
    lead_bureaus: ["All Infrastructure Bureaus", "PBEM"],
    priority: true,
    timeline: "-",
    funding_level: "$$",
    status: "ongoing",
    multi_bureau: true,
    pcef_funded: false,
  },
];

// ── Emissions Data (Multnomah County total MT CO2e) ─────────────────────────
// Sector shares: transportation 44%, electricity 20%, natural_gas 18%,
//                industrial 10%, waste 8%

export const emissionsData: EmissionsDataPoint[] = [
  {
    year: 1990,
    total_mt_co2e: 9_300_000,
    transportation: 4_092_000,
    electricity: 1_860_000,
    natural_gas: 1_674_000,
    industrial: 930_000,
    waste: 744_000,
  },
  {
    year: 1995,
    total_mt_co2e: 9_600_000,
    transportation: 4_224_000,
    electricity: 1_920_000,
    natural_gas: 1_728_000,
    industrial: 960_000,
    waste: 768_000,
  },
  {
    year: 2000,
    total_mt_co2e: 9_800_000,
    transportation: 4_312_000,
    electricity: 1_960_000,
    natural_gas: 1_764_000,
    industrial: 980_000,
    waste: 784_000,
  },
  {
    year: 2005,
    total_mt_co2e: 9_400_000,
    transportation: 4_136_000,
    electricity: 1_880_000,
    natural_gas: 1_692_000,
    industrial: 940_000,
    waste: 752_000,
  },
  {
    year: 2010,
    total_mt_co2e: 8_700_000,
    transportation: 3_828_000,
    electricity: 1_740_000,
    natural_gas: 1_566_000,
    industrial: 870_000,
    waste: 696_000,
  },
  {
    year: 2015,
    total_mt_co2e: 8_100_000,
    transportation: 3_564_000,
    electricity: 1_620_000,
    natural_gas: 1_458_000,
    industrial: 810_000,
    waste: 648_000,
  },
  {
    year: 2017,
    total_mt_co2e: 7_900_000,
    transportation: 3_476_000,
    electricity: 1_580_000,
    natural_gas: 1_422_000,
    industrial: 790_000,
    waste: 632_000,
  },
  {
    year: 2019,
    total_mt_co2e: 7_600_000,
    transportation: 3_344_000,
    electricity: 1_520_000,
    natural_gas: 1_368_000,
    industrial: 760_000,
    waste: 608_000,
  },
  {
    year: 2020,
    total_mt_co2e: 7_100_000,
    transportation: 3_124_000,
    electricity: 1_420_000,
    natural_gas: 1_278_000,
    industrial: 710_000,
    waste: 568_000,
  },
  {
    year: 2021,
    total_mt_co2e: 7_300_000,
    transportation: 3_212_000,
    electricity: 1_460_000,
    natural_gas: 1_314_000,
    industrial: 730_000,
    waste: 584_000,
  },
  {
    year: 2022,
    total_mt_co2e: 7_100_000,
    transportation: 3_124_000,
    electricity: 1_420_000,
    natural_gas: 1_278_000,
    industrial: 710_000,
    waste: 568_000,
  },
  {
    year: 2023,
    total_mt_co2e: 6_900_000,
    transportation: 3_036_000,
    electricity: 1_380_000,
    natural_gas: 1_242_000,
    industrial: 690_000,
    waste: 552_000,
  },
];

// ── Emissions Targets ───────────────────────────────────────────────────────

export const emissionsTargets: EmissionsTarget[] = [
  {
    year: 2030,
    target_mt_co2e: 4_650_000,
    reduction_from_1990: "50%",
    label: "2030 Target: 50% below 1990 levels",
  },
  {
    year: 2050,
    target_mt_co2e: 0,
    reduction_from_1990: "100%",
    label: "2050 Target: Net-zero emissions",
  },
];

// ── Renewable Energy Data ───────────────────────────────────────────────────

export const renewableEnergyData: RenewableEnergyDataPoint[] = [
  { year: 2015, renewable_pct: 30.0, total_mwh: 11_200_000, renewable_mwh: 3_360_000 },
  { year: 2016, renewable_pct: 31.5, total_mwh: 11_300_000, renewable_mwh: 3_559_500 },
  { year: 2017, renewable_pct: 33.0, total_mwh: 11_250_000, renewable_mwh: 3_712_500 },
  { year: 2018, renewable_pct: 35.2, total_mwh: 11_400_000, renewable_mwh: 4_012_800 },
  { year: 2019, renewable_pct: 37.0, total_mwh: 11_350_000, renewable_mwh: 4_199_500 },
  { year: 2020, renewable_pct: 39.5, total_mwh: 11_100_000, renewable_mwh: 4_384_500 },
  { year: 2021, renewable_pct: 41.0, total_mwh: 11_200_000, renewable_mwh: 4_592_000 },
  { year: 2022, renewable_pct: 43.5, total_mwh: 11_300_000, renewable_mwh: 4_915_500 },
  { year: 2023, renewable_pct: 46.0, total_mwh: 11_350_000, renewable_mwh: 5_221_000 },
];

// ── PCEF Investment Data ────────────────────────────────────────────────────

export const pcefInvestments: PCEFInvestmentCategory[] = [
  {
    category: "energy_efficiency",
    total_million: 300,
    description: "Housing and small business energy efficiency upgrades",
    fiscal_year_allocations: {
      "FY 23-24": 80,
      "FY 24-25": 95,
      "FY 25-26": 75,
      "FY 26-27": 50,
    },
  },
  {
    category: "transportation",
    total_million: 128,
    description: "E-bikes, EV access, and clean transportation programs",
    fiscal_year_allocations: {
      "FY 23-24": 30,
      "FY 24-25": 40,
      "FY 25-26": 35,
      "FY 26-27": 23,
    },
  },
  {
    category: "green_infrastructure",
    total_million: 70,
    description: "Tree canopy and green infrastructure improvements",
    fiscal_year_allocations: {
      "FY 23-24": 15,
      "FY 24-25": 20,
      "FY 25-26": 20,
      "FY 26-27": 15,
    },
  },
  {
    category: "renewable_energy",
    total_million: 60,
    description: "Solar installations on affordable housing",
    fiscal_year_allocations: {
      "FY 23-24": 12,
      "FY 24-25": 18,
      "FY 25-26": 18,
      "FY 26-27": 12,
    },
  },
  {
    category: "tree_canopy",
    total_million: 40,
    description: "Equitable tree planting programs in priority areas",
    fiscal_year_allocations: {
      "FY 23-24": 8,
      "FY 24-25": 12,
      "FY 25-26": 12,
      "FY 26-27": 8,
    },
  },
  {
    category: "community_grants",
    total_million: 64.4,
    description: "60 nonprofit projects through community grants",
    fiscal_year_allocations: {
      "FY 23-24": 20,
      "FY 24-25": 22.4,
      "FY 25-26": 14,
      "FY 26-27": 8,
    },
  },
];
