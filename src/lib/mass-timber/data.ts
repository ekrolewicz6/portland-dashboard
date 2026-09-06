/**
 * Mass Timber & Housing deep-dive data.
 *
 * Built from the user's adversarially-verified briefing, then each load-bearing
 * claim was re-sourced to a primary/credible URL (June 2026). Corrections from
 * that pass are applied here — e.g. the "1,223 permits / lowest since 2010"
 * figure was refuted and replaced with the sourced "~1,400 total in 2025."
 *
 * Certainty labels mirror the briefing: verified | reported | modeled | analysis.
 */

export type Certainty = "verified" | "reported" | "modeled" | "analysis";

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "research" | "news" | "industry" | "reference";
}

export const SOURCES: Record<string, Source> = {
  ohna2026: { id: "ohna2026", title: "Oregon Housing Needs Analysis — 2026 Results Report", org: "Oregon DAS, Office of Economic Analysis", url: "https://www.oregon.gov/das/oea/Documents/OHNA-2026-Results-Report.pdf", kind: "primary" },
  eo2304: { id: "eo2304", title: "Executive Order 23-04 — Statewide Housing Production Goal", org: "Office of Governor Tina Kotek", url: "https://www.oregon.gov/gov/eo/eo-23-04.pdf", kind: "primary" },
  wwSupply: { id: "wwSupply", title: "Oregon's housing supply increased only about 5% between 2020 and 2025", org: "Willamette Week / Oregon Journalism Project", url: "https://www.wweek.com/news/state/2026/05/16/oregons-housing-supply-increased-only-about-5-between-2020-and-2025/", kind: "news" },
  opbPermits: { id: "opbPermits", title: "Portland says new housing incentive program is working, yet data is inconclusive", org: "OPB", url: "https://www.opb.org/article/2026/03/03/portland-claims-new-housing-program-works-but-data-inconclusive/", kind: "news" },
  codeDive: { id: "codeDive", title: "Oregon first state to codify timber high-rises", org: "Construction Dive", url: "https://www.constructiondive.com/news/oregon-first-state-to-codify-timber-high-rises/530668/", kind: "news" },
  tallwood: { id: "tallwood", title: "About the TallWood Design Institute", org: "TallWood Design Institute (OSU / UO)", url: "https://tallwoodinstitute.org/about-tdi/", kind: "research" },
  ofriFacts: { id: "ofriFacts", title: "Oregon Forest Facts 2023–24", org: "Oregon Forest Resources Institute", url: "https://oregonforests.org/sites/default/files/2023-01/OFRI_2022ForestFacts_Web.pdf", kind: "research" },
  freres: { id: "freres", title: "Mass Ply Panel (MPP)", org: "Freres Engineered Wood", url: "https://frereswood.com/products-and-services/mass-ply-products/mass-ply-panel/", kind: "industry" },
  edaGrant: { id: "edaGrant", title: "TallWood / Oregon Mass Timber Coalition receives $41.4 million", org: "Oregon State University, College of Forestry", url: "https://blogs.oregonstate.edu/collegeofforestry/2022/09/16/tallwood-design-institute-in-partnership-with-oregon-mass-timber-coalition-receives-41-4-million-to-accelerate-use-of-mass-timber-to-restore-forests-create-jobs-and-address-housing/", kind: "primary" },
  techHub: { id: "techHub", title: "PNW Mass Timber Tech Hub designation", org: "University of Oregon, College of Design", url: "https://design.uoregon.edu/biden-harris-administration-designates-pnw-mass-timber-tech-hub", kind: "primary" },
  coalition: { id: "coalition", title: "Oregon Mass Timber Coalition — About / Why Mass Timber", org: "Oregon Mass Timber Coalition", url: "https://www.masstimbercoalition.org/why-mass-timber", kind: "primary" },
  costPhysics: { id: "costPhysics", title: "Mass timber is great, but it will not solve the housing crisis", org: "Construction Physics (Brian Potter), citing the 2023 Intl. Mass Timber Report", url: "https://www.construction-physics.com/p/mass-timber-is-great-but-it-will", kind: "research" },
  thinkWood: { id: "thinkWood", title: "How mass timber can cut construction costs", org: "Think Wood", url: "https://www.thinkwood.com/blog/how-mass-timber-can-cut-construction-costs", kind: "industry" },
  hudWsu: { id: "hudWsu", title: "HUD PD&R / Washington State University mass-timber affordable-housing study", org: "HUD USER (PD&R)", url: "https://www.huduser.gov/portal/pdredge/pdr-edge-trending-060525.html", kind: "primary" },
  woodworksAffordable: { id: "woodworksAffordable", title: "Mass Timber in Affordable Multi-Family Housing (Sept 2024)", org: "WoodWorks – Wood Products Council", url: "https://www.woodworks.org/wp-content/uploads/wood_solution_paper_Mass_Timber_Affordable_Multi-Family_09.2024.pdf", kind: "industry" },
  meyerCost: { id: "meyerCost", title: "The Cost of Affordable Housing Development in Oregon (2015)", org: "Meyer Memorial Trust (hosted by Oregon DLCD)", url: "https://www.oregon.gov/lcd/UP/Documents/Cost_of_AffordableHousingDev_Oregon.pdf", kind: "research" },
  insuranceRoadmap: { id: "insuranceRoadmap", title: "Mass Timber Insurance Strategy Roadmap 2025–2030", org: "WoodWorks / Field Edge LLC", url: "https://www.woodworks.org/wp-content/uploads/FieldEdge_MT_Insurance_Strategy_Roadmap_03.2025.pdf", kind: "industry" },
  insuranceClean: { id: "insuranceClean", title: "Mass timber at parity: fixing insurance & code bottlenecks", org: "CleanTechnica", url: "https://cleantechnica.com/2025/08/29/mass-timber-at-parity-fixing-insurance-code-bottlenecks/", kind: "news" },
  verisk: { id: "verisk", title: "Mass timber: new technology drives a new construction class", org: "Verisk (ISO)", url: "https://www.verisk.com/resources/campaigns/mass-timber-new-technology-drives-a-new-construction-class/", kind: "industry" },
  opbFramework: { id: "opbFramework", title: "A wooden high-rise in downtown Portland", org: "OPB", url: "https://www.opb.org/news/article/wooden-high-rise-downtown-portland/", kind: "news" },
  archdailyPrize: { id: "archdailyPrize", title: "U.S. Tall Wood Building Prize winners announced (2015)", org: "ArchDaily", url: "https://www.archdaily.com/773646/us-tall-wood-building-prize-winners-announced", kind: "news" },
  wheelerFramework: { id: "wheelerFramework", title: "Smart affordable housing investments (Framework $6M)", org: "City of Portland (Mayor's Office)", url: "https://www.portland.gov/wheeler/news/2018/1/3/smart-affordable-housing-investments-portland-deliver-more-bang-buck", kind: "primary" },
  archRecordFramework: { id: "archRecordFramework", title: "Groundbreaking of mass-timber Framework building placed on indefinite hold", org: "Architectural Record", url: "https://www.architecturalrecord.com/articles/13556-groundbreaking-of-mass-timber-framework-building-placed-on-indefinite-hold", kind: "news" },
  bloombergKaterra: { id: "bloombergKaterra", title: "SoftBank-backed Katerra files bankruptcy with billions in debt", org: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2021-06-07/softbank-backed-katerra-files-bankruptcy-with-billions-in-debt", kind: "news" },
  ilke: { id: "ilke", title: "Ilke Homes enters liquidation leaving £319m debts unpaid", org: "Housing Today", url: "https://www.housingtoday.co.uk/news/ilke-homes-enters-liquidation-leaving-319m-debts-unpaid/5125875.article", kind: "news" },
  lgModular: { id: "lgModular", title: "Post-tax losses at failed L&G modular builder top £279m", org: "Inside Housing", url: "https://www.insidehousing.co.uk/news/post-tax-losses-at-failed-lg-modular-builder-top-279m-88741", kind: "news" },
  urbanSplash: { id: "urbanSplash", title: "Urban Splash's modular spin-off falls into administration", org: "Construction News", url: "https://www.constructionnews.co.uk/financial/administrations/urban-splashs-modular-spin-off-falls-into-administration-13-05-2022/", kind: "news" },
  sahp: { id: "sahp", title: "Social and Affordable Homes Programme (SAHP) 2026 to 2036", org: "GOV.UK (Homes England)", url: "https://www.gov.uk/guidance/social-and-affordable-homes-programme-sahp-2026-to-2036", kind: "primary" },
  portT2: { id: "portT2", title: "Mass Timber and Housing Innovation Campus (Terminal 2)", org: "Port of Portland", url: "https://www.portofportland.com/innovationcampus", kind: "primary" },
  portZaugg: { id: "portZaugg", title: "Port announces partnership with ZTS on new mass timber factory", org: "Port of Portland", url: "https://www.portofportland.com/Newsroom/port-announces-partnership-with-zts-on-new-mass-timber-factory-boosting-jobs-and-modular-housing-construction-for-the-region", kind: "primary" },
  hacienda: { id: "hacienda", title: "Introducing Mass Casitas", org: "Hacienda CDC", url: "https://www.haciendacdc.org/news-updates/introducing-mass-casitas-a-new-model-for-easing-states-housing-crisis", kind: "primary" },
  mhdf: { id: "mhdf", title: "Modular Housing Development Fund", org: "Oregon Housing and Community Services", url: "https://www.oregon.gov/ohcs/development/pages/modular-housing-development-fund.aspx", kind: "primary" },
  hb3145: { id: "hb3145", title: "Factory-Produced Housing Initiative (HB 3145)", org: "Oregon Housing and Community Services", url: "https://www.oregon.gov/ohcs/development/Pages/factory-produced-housing.aspx", kind: "primary" },
  guerdon: { id: "guerdon", title: "Mutual Housing California & Guerdon sign Master Agreement", org: "Guerdon Modular Buildings", url: "https://www.guerdonmodularbuildings.com/mutual-housing-california-and-guerdon-sign-master-agreement-to-launch-new-model-for-scaling-up-factory-built-affordable-housing/", kind: "industry" },
  nature: { id: "nature", title: "Carbon mitigation potential of mass timber (Lan et al., 2025)", org: "Nature Communications", url: "https://www.nature.com/articles/s41467-025-60245-y", kind: "research" },
  ofriEcon: { id: "ofriEcon", title: "Oregon forest economics & harvest", org: "Oregon Forest Resources Institute", url: "https://oregonforests.org/economics", kind: "research" },
  qap: { id: "qap", title: "2025 Qualified Allocation Plan (LIHTC)", org: "Oregon Housing and Community Services", url: "https://www.oregon.gov/ohcs/rental-housing/housing-development/development-resources/Documents/QAP/2025-qap-final.pdf", kind: "primary" },
  phbBond: { id: "phbBond", title: "2024 Portland Housing Bond progress report", org: "Portland Housing Bureau", url: "https://www.portland.gov/phb/boc/news/2025/8/22/2024-portland-housing-bond-progress-report", kind: "primary" },
  metroBond: { id: "metroBond", title: "Regional affordable housing bond (2018)", org: "Metro", url: "https://www.oregonmetro.gov/public-projects/regional-affordable-housing-bond", kind: "primary" },
  measure102: { id: "measure102", title: "Oregon Measure 102 (2018)", org: "Ballotpedia", url: "https://ballotpedia.org/Oregon_Measure_102,_Allow_Municipal_Bond_Revenue_to_Fund_Privately_Owned_Affordable_Housing_Amendment_(2018)", kind: "reference" },
};

// ── Headline housing need ─────────────────────────────────────────

export const HOUSING = {
  twentyYearNeed: 491_347,
  currentNeed: 95_828,
  underproduction: 50_191,
  forHomelessness: 45_637,
  futureNeed: 395_519,
  annualTarget: 29_359,
  kotekGoal: 36_000,
  supplyGrowth2020to2025: 0.05,
  /** Corrected: ~1,400 total units permitted in Portland in 2025 (OPB); the
   *  "lowest since 2010" framing applies to multifamily only. */
  portlandPermits2025: 1_400,
  portlandPermits2021: 5_400,
} as const;

// ── Cost economics ────────────────────────────────────────────────

export const ECON = {
  premiumMedian: 0.02,
  premiumHigh: 0.15,
  lighterVsConcrete: 0.6, // up to ~60% vs post-tensioned concrete (project-specific)
  crewCut: 0.5,
  fasterMin: 0.25,
  insuranceMultipleLow: 4,
  insuranceMultipleHigh: 10,
  hudStudyMonths: 24,
} as const;

// ── The graveyard (failure stories) ───────────────────────────────

export interface Grave {
  name: string;
  where: string;
  year: string;
  raised?: string;
  whatHappened: string;
  lesson: string;
  sourceId: string;
}

export const GRAVEYARD: Grave[] = [
  {
    name: "Framework",
    where: "Portland, OR",
    year: "2018",
    whatHappened:
      "A 12-story, all-mass-timber high-rise in the Pearl District — the first U.S. mass-timber high-rise to win a building permit (2017), with all 60 units affordable at ≤60% of area median income. Construction cost rose from $26M to over $34M (about a third) while the tax-credit equity behind it fell ~20% after the 2017 federal tax law.",
    lesson:
      "Not engineering, not code — both were cleared. A hard-cost premium is fatal for affordable housing because it lands on a tight subsidy gap with nothing to absorb it.",
    sourceId: "archRecordFramework",
  },
  {
    name: "Katerra",
    where: "USA",
    year: "2021",
    raised: "over $2 billion",
    whatHappened:
      "A SoftBank-backed startup that tried to do design, manufacturing, and construction all at once, across a national market where every state regulates modular differently. It filed for bankruptcy in 2021.",
    lesson:
      "Doing too much, too fast, across inconsistent codes — never achieving the repetition that makes a factory pay.",
    sourceId: "bloombergKaterra",
  },
  {
    name: "Ilke Homes",
    where: "United Kingdom",
    year: "2023",
    whatHappened:
      "A flagship UK modular factory that went into administration in June 2023 owing ~£319M and shedding ~1,150 jobs, while holding a roughly £1 billion order book / ~4,200-home pipeline.",
    lesson:
      "The decisive lesson: a paper pipeline is not survival. If you can't convert orders into delivered, profitable volume fast enough to carry the factory's overhead, you're toast.",
    sourceId: "ilke",
  },
  {
    name: "L&G Modular Homes",
    where: "United Kingdom",
    year: "2023",
    whatHappened:
      "Backed by one of the UK's largest investors, it halted production at its Leeds-area factory in May 2023, ultimately booking £279M in cumulative losses over the life of the business.",
    lesson:
      "Deep pockets don't save a factory that can't fill its line — fixed cost runs whether the line moves or not.",
    sourceId: "lgModular",
  },
  {
    name: "House by Urban Splash",
    where: "United Kingdom",
    year: "2022",
    whatHappened:
      "A modular venture co-owned by Urban Splash, Japan's Sekisui House, and the UK government's Homes England — into administration in 2022.",
    lesson:
      "Even with a government co-owner and a deep-pocketed industrial partner, the factory economics still bit.",
    sourceId: "urbanSplash",
  },
];

// ── What exists in Oregon ─────────────────────────────────────────

export interface Asset {
  name: string;
  year: string;
  what: string;
  status: "built" | "funded" | "leased" | "delivered" | "planned";
  sourceId: string;
}

export const ASSETS: Asset[] = [
  {
    name: "$41.4M federal EDA grant",
    year: "2022",
    what: "The Oregon Mass Timber Coalition won a $41.4M U.S. EDA Build Back Better Regional Challenge grant; Oregon & Washington later won the federal PNW Mass Timber Tech Hub designation (2023).",
    status: "funded",
    sourceId: "edaGrant",
  },
  {
    name: "Terminal 2 Innovation Campus",
    year: "2024–28",
    what: "A 39-acre 'Mass Timber and Housing Innovation Campus' on the Portland riverfront, run by the Port of Portland — the physical home of the industry.",
    status: "planned",
    sourceId: "portT2",
  },
  {
    name: "Zaugg Timber Solutions factory",
    year: "2025",
    what: "A century-old Swiss firm's North American affiliate signed a long-term ground lease at Terminal 2 to build a ~100,000-sq-ft factory making ~700 homes/year (interim ~2026, permanent ~2028). A lease — not a guaranteed order book.",
    status: "leased",
    sourceId: "portZaugg",
  },
  {
    name: "Hacienda's six Mass Casitas",
    year: "2023",
    what: "Oregon's largest Latino-serving housing nonprofit built six mass-timber modular homes at Terminal 2, delivered across the state — the clearest delivered link between the industry and affordable housing. Six homes: proof of concept, not scale.",
    status: "delivered",
    sourceId: "hacienda",
  },
  {
    name: "Modular Housing Development Fund",
    year: "2023",
    what: "HB 2001 put $20M into four $5M grants to factories (Blazer, Intelifab, Pacific Wall Systems, Zaugg). Supply-side capacity money — it commits no forward orders.",
    status: "funded",
    sourceId: "mhdf",
  },
  {
    name: "Factory-Produced Housing Initiative",
    year: "2025",
    what: "HB 3145 added $25M for up to five factory-produced-housing projects. A project-side set-aside — again, not a demand-aggregation lever.",
    status: "funded",
    sourceId: "hb3145",
  },
];

// ── Climate (both sides) ──────────────────────────────────────────

export const CLIMATE = {
  netBenefitLow: 25.6, // GtCO2e by 2100
  netBenefitHigh: 39.0,
  storageLow: 20.3,
  storageHigh: 25.2,
  productiveForestGrowthLow: 30.7, // million hectares
  productiveForestGrowthHigh: 36.5,
  naturalForestShrinkLow: 8.1,
  naturalForestShrinkHigh: 18.9,
  federalForestlandShare: 0.6,
  federalHarvestShare: 0.1,
} as const;

// ── Jobs ──────────────────────────────────────────────────────────

export const JOBS = {
  potentialJobs: 17_000,
  factoryWageLow: 50_000,
  factoryWageHigh: 80_000,
  forestryWageLow: 45_000,
  forestryWageHigh: 75_000,
  tradesWageLow: 60_000,
  tradesWageHigh: 95_000,
} as const;

// ── Financing / policy ────────────────────────────────────────────

export const FINANCE = {
  bond2016: 258_400_000,
  bond2016Units: 1_551, // opened by end-2024 (PHB)
  bond2016SubsidyPerUnit: 150_000, // "$150,000 or less" per city audit
  metroBond2018: 652_800_000,
} as const;
