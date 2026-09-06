/**
 * Data for the Oregon data centers deep-dive.
 *
 * Figures pulled August 3, 2026. Time-sensitive items to re-check:
 * - The Kotek Data Center Advisory Committee report (due October 2026)
 * - The 1000 Friends / OEA lawsuit against Hillsboro & Washington County (filed June 24, 2026)
 * - The HB 4084 enterprise-zone moratorium (runs until 90 days after the 2027 session adjourns)
 * - Pacific Power's data-center rate investigation at the PUC (opened spring 2026)
 * - PGE's implemented rate split (+30% data centers / −1.3% residential) as later rate cases land
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "news" | "analysis";
}

export const SOURCES = {
  klccCheapDate: {
    id: "klccCheapDate",
    title: "Oregon governor says state is a 'cheap date' for data centers",
    org: "KLCC",
    url: "https://www.klcc.org/economy-business/2026-07-03/oregon-governor-says-state-is-a-cheap-date-for-data-centers",
    kind: "news",
  },
  dwtMoratorium: {
    id: "dwtMoratorium",
    title: "New Oregon law bars new data centers from enterprise-zone tax breaks (HB 4084)",
    org: "Davis Wright Tremaine",
    url: "https://www.dwt.com/blogs/energy--environmental-law-blog/2026/06/oregon-data-center-tax-break-moratorium",
    kind: "analysis",
  },
  opbEzCut: {
    id: "opbEzCut",
    title: "Data centers are cut, for now, from a bill expanding Oregon tax breaks",
    org: "OPB",
    url: "https://www.opb.org/article/2026/03/02/data-centers-cut-bill-expanding-oregon-tax-breaks/",
    kind: "news",
  },
  ocppBoom: {
    id: "ocppBoom",
    title: "“We've been very foolish”: inside Oregon's data center boom",
    org: "Oregon Center for Public Policy",
    url: "https://www.ocpp.org/2026/03/12/oregons-data-center-boom/",
    kind: "analysis",
  },
  governingStudy: {
    id: "governingStudy",
    title: "Oregon's own incentive study: what data center tax breaks return",
    org: "Governing",
    url: "https://www.governing.com/finance/oregon-tax-breaks-to-big-tech-not-always-beneficial",
    kind: "analysis",
  },
  capitalChronicleLawsuit: {
    id: "capitalChronicleLawsuit",
    title: "Politicians, teachers union sue Hillsboro, Washington County over data center tax breaks",
    org: "Oregon Capital Chronicle",
    url: "https://oregoncapitalchronicle.com/2026/06/24/politicians-teachers-union-sue-hillsboro-washington-county-over-tax-breaks-to-data-centers/",
    kind: "news",
  },
  bakerCityAbatement: {
    id: "bakerCityAbatement",
    title: "Morrow County approves $1 billion in tax breaks for Amazon data centers",
    org: "Baker City Herald",
    url: "https://bakercityherald.com/2023/05/11/morrow-county-approves-1-billion-in-tax-breaks-for-amazon-data-centers/",
    kind: "news",
  },
  eastOregonianLeaders: {
    id: "eastOregonianLeaders",
    title: "Eastern Oregon leaders praise data centers, look to future",
    org: "East Oregonian",
    url: "https://eastoregonian.com/2025/05/30/local-leaders-praise-data-centers-look-to-future/",
    kind: "news",
  },
  opbPowerAct: {
    id: "opbPowerAct",
    title: "Oregon Legislature passes 'POWER Act,' targeting industrial energy users like data centers",
    org: "OPB",
    url: "https://www.opb.org/article/2025/06/05/oregon-data-centers-cryptocurrency-business-environment-power-electricity/",
    kind: "news",
  },
  oecGuardrails: {
    id: "oecGuardrails",
    title: "New PUC rules protect Oregonians from data center-caused rate increases",
    org: "Oregon Environmental Council",
    url: "https://oeconline.org/pge-guardrails-press-release/",
    kind: "primary",
  },
  tomsHardwareRates: {
    id: "tomsHardwareRates",
    title: "PGE data center bills rise 30%, residential rates fall 1.3% under POWER Act",
    org: "Tom's Hardware",
    url: "https://www.tomshardware.com/tech-industry/data-centers/power-company-hikes-data-center-bills-by-30-percent-cuts-residential-electricity-costs-by-1-3-percent-oregon-approves-change-through-power-act-pushes-developments-using-more-than-20-megawatts-of-power-to-pay-their-fair-share",
    kind: "news",
  },
  governingUec: {
    id: "governingUec",
    title: "Oregon's rural power utility has become a big polluter",
    org: "Governing",
    url: "https://www.governing.com/resilience/oregons-rural-power-utility-has-become-a-big-polluter",
    kind: "analysis",
  },
  capitalChronicleGas: {
    id: "capitalChronicleGas",
    title: "Data centers are driving demand for gas from Northwest utilities, reports find",
    org: "Oregon Capital Chronicle",
    url: "https://oregoncapitalchronicle.com/2026/06/04/data-centers-are-driving-demand-for-gas-from-northwest-utilities-reports-find/",
    kind: "news",
  },
  registerWater: {
    id: "registerWater",
    title: "Google's The Dalles water use revealed after city drops records suit",
    org: "The Register",
    url: "https://www.theregister.com/2022/12/19/google_datacenters_dalles/",
    kind: "news",
  },
  waterWatch: {
    id: "waterWatch",
    title: "Data centers are hogging The Dalles' water",
    org: "WaterWatch of Oregon",
    url: "https://waterwatch.org/data-centers-are-hogging-this-towns-water/",
    kind: "analysis",
  },
  rollingStoneWater: {
    id: "rollingStoneWater",
    title: "How Oregon's data center boom is supercharging a water crisis",
    org: "Rolling Stone",
    url: "https://www.rollingstone.com/culture/culture-features/data-center-water-pollution-amazon-oregon-1235466613/",
    kind: "news",
  },
  fortuneStudy: {
    id: "fortuneStudy",
    title: "Data centers boost jobs 4% in cities; rural economies barely feel a dent (Georgia Tech study)",
    org: "Fortune",
    url: "https://fortune.com/2026/07/14/data-centers-urban-rural-jobs-study/",
    kind: "analysis",
  },
  advisoryCommittee: {
    id: "advisoryCommittee",
    title: "Oregon Data Center Advisory Committee",
    org: "Oregon Dept. of Energy",
    url: "https://www.oregon.gov/energy/get-involved/pages/oregon-data-center-advisory-committee.aspx",
    kind: "primary",
  },
  lincolnAcres: {
    id: "lincolnAcres",
    title: "Oregon communities envision 9,100 acres for new data centers",
    org: "Lincoln Chronicle",
    url: "https://lincolnchronicle.org/oregon-communities-envision-9100-acres-for-new-data-centers-quadrupling-the-industrys-footprint/",
    kind: "news",
  },
  cubWhyOregon: {
    id: "cubWhyOregon",
    title: "Why is Oregon a hot spot for data centers?",
    org: "Oregon Citizens' Utility Board",
    url: "https://oregoncub.org/news/blog/why-is-oregon-a-hot-spot-for-data-centers/3277/",
    kind: "analysis",
  },
  dcacCharge: {
    id: "dcacCharge",
    title: "Data Center Advisory Committee charge from the Governor",
    org: "Governor's Office / ODOE",
    url: "https://www.oregon.gov/energy/get-involved/Documents/Data-Center-Advisory-Committee-Charge.pdf",
    kind: "primary",
  },
  dcacIncentives: {
    id: "dcacIncentives",
    title: "Session 5 facilitator summary — affordability, revenue & incentives",
    org: "DCAC (June 26, 2026)",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-06-26-DCAC-Facilitator-Meeting-Summary.pdf",
    kind: "primary",
  },
  businessOregonRoi: {
    id: "businessOregonRoi",
    title: "Data center incentive programs: investment, abatement & return",
    org: "Business Oregon",
    url: "https://www.oregon.gov/energy/get-involved/Documents/08-Alex-Albertine-Michael-Held-DCAC.pdf",
    kind: "primary",
  },
  morrowAssessor: {
    id: "morrowAssessor",
    title: "County assessor data on exempt value and in-lieu payments",
    org: "Morrow County Assessor",
    url: "https://www.oregon.gov/energy/get-involved/Documents/09-Mike-Gorman-DCAC.pdf",
    kind: "primary",
  },
  taxFairness: {
    id: "taxFairness",
    title: "The four stacked subsidies, and what to end in 2027",
    org: "Tax Fairness Oregon",
    url: "https://www.oregon.gov/energy/get-involved/Documents/11-Jody-Wiser-DCAC.pdf",
    kind: "primary",
  },
  econw: {
    id: "econw",
    title: "Understanding Oregon's data center industry (preliminary findings)",
    org: "ECONorthwest",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-07-31-ECONW-Understanding-Data-Center-Industry.pdf",
    kind: "analysis",
  },
  odeSchoolFunding: {
    id: "odeSchoolFunding",
    title: "How property tax abatements move through school funding",
    org: "Oregon Dept. of Education",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-07-31-OR-Dept-Education-Revenue-Impact-Presentation.pdf",
    kind: "primary",
  },
  deqAir: {
    id: "deqAir",
    title: "Air-quality permitting: data center backup generators",
    org: "Oregon DEQ",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-07-31-Oregon-DEQ-Air-Quality-Permitting-Presentation.pdf",
    kind: "primary",
  },
  dlcdLandUse: {
    id: "dlcdLandUse",
    title: "Data centers and Oregon's land-use system",
    org: "Dept. of Land Conservation & Development",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-04-24-1-Leigh-McIlvaine-DLCD-DCAC-LandUse.pdf",
    kind: "primary",
  },
  dcacWater: {
    id: "dcacWater",
    title: "Session 2 facilitator summary — water resources",
    org: "DCAC (March 27, 2026)",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-03-27-DCAC-Facilitators-Summary.pdf",
    kind: "primary",
  },
  awsWater: {
    id: "awsWater",
    title: "AWS water use and community water investment in Oregon",
    org: "Amazon Web Services",
    url: "https://www.oregon.gov/energy/get-involved/Documents/2026-03-27-Schilz-Amazon.pdf",
    kind: "primary",
  },
  harpelIncentives: {
    id: "harpelIncentives",
    title: "What other states do with data center incentives",
    org: "Smart Incentives",
    url: "https://www.oregon.gov/energy/get-involved/Documents/13-Ellen-Harpel-DCAC.pdf",
    kind: "analysis",
  },
  govCommittee: {
    id: "govCommittee",
    title: "Governor Kotek convenes statewide Data Center Advisory Committee",
    org: "Governor's Office",
    url: "https://apps.oregon.gov/oregon-newsroom/OR/GOV/Posts/Post/governor-kotek-convenes-statewide-data-center-advisory-committee",
    kind: "primary",
  },
  salemWithdrawal: {
    id: "salemWithdrawal",
    title: "Governor Kotek directs state to withdraw land for proposed Salem data center site",
    org: "Governor's Office",
    url: "https://apps.oregon.gov/oregon-newsroom/OR/GOV/Posts/Post/governor-kotek-directs-state-to-withdraw-land-for-proposed-salem-data-center-site",
    kind: "primary",
  },
} as const satisfies Record<string, Source>;

/** Headline numbers used across the page. */
export const HEADLINE = {
  facilities: 125, // roughly; Gov. Kotek via KLCC, July 2026
  annualTaxBreaksM: 450, // >$450M/yr statewide tech tax savings (DWT); Kotek cited >$400M
  ezPotM: 68, // standard enterprise-zone breaks, most recent tax year
  ezDataCenterShare: 2 / 3, // data centers' share of that pot
  awsMorrowTaxesM: 19, // AWS property taxes actually paid in Morrow County, $/yr
  regionalJobsFte: 7400, // Eastern Oregon FTE attributed to data centers
  easternOregonGdpB: 9, // $ added to Eastern Oregon GDP
  amazonDirectJobs: 740, // Amazon's approximate direct data-center employees in eastern Oregon
  subsidyPerJobLongTerm: 54500, // long-term rural EZ incentives per job
  subsidyPerJobStandard: 4200, // standard EZ incentives per job
  longTermReturnPerDollar: -0.84, // 15-yr deals lose 84 cents per $1 forgone (income tax)
  standardReturnPerDollar: 1.35, // standard EZ returns $1.35 per $1
  dcRateChangePct: 30, // PGE data-center bills up
  resRateChangePct: -1.3, // PGE residential bills down
  powerActThresholdMw: 20,
  uecEmissionsTonsM: 1.8, // Umatilla Electric annual CO2, tons (millions)
  uecCustomers: 16000,
  googleWaterGallonsM2021: 274.5, // The Dalles, 2021
  googleWaterCitySharePct: 25, // >25% of all city water in 2021; recent reports ~40%
  googleWaterCityShareRecentPct: 40,
  schoolsLostM2024: 275, // 191 OR school + education service districts, 2024 abatements
  schoolDistrictsAffected: 191,
  hillsboroSchoolsForgoneM: 140, // Hillsboro SD, recent years cumulative
  envisionedAcres: 9100,
  moratoriumEffective: "June 5, 2026",
  committeeReportDue: "October 2026",

  // ── from the committee's own record (see dcac-findings.ts) ──
  /** Business Oregon's reported return per dollar, by program. */
  roiLongTerm: 1.18,
  roiStandard: 29.16,
  roiSip: 6.24,
  /** ECONorthwest: direct operating jobs statewide. */
  directOpsJobs: 2630,
  opsShareOfEmploymentPct: 0.2,
  /** ECONorthwest electricity projection, TWh. */
  twh2025: 14.0,
  twh2030: 24.8,
  /** DEQ permitted diesel backup fleet. */
  dieselGenerators: 2482,
  dieselMw: 6328,
  /** Morrow County Assessor, exempt vs collected. */
  morrowExemptTaxM: 123.6,
  morrowCollectedTaxM: 72.3,
  morrowFeesM: 23.9,
  /** ODE: statewide school fund dilution per $1M removed. */
  perAdmwPerMillion: 1.5,
} as const;

/** POWER Act rate shift (PGE implementation, mid-2026). */
export const RATE_SHIFT = [
  {
    who: "Data centers (>20 MW)",
    changePct: 30,
    detail: "New rate class: 10–30 year contracts, 100% of new grid costs, minimum-take rules",
  },
  {
    who: "Residential customers",
    changePct: -1.3,
    detail: "First decrease after years of increases driven partly by grid buildout",
  },
] as const;

/** Subsidy cost per job, Oregon's own incentive study. */
export const SUBSIDY_PER_JOB = [
  {
    program: "Standard enterprise zone (3–5 yr)",
    perJob: 4200,
    note: "Typical manufacturing-era deal",
  },
  {
    program: "Long-term rural enterprise zone (15 yr)",
    perJob: 54500,
    note: "The main data-center vehicle",
  },
] as const;

export type ConditionStatus = "met" | "partial" | "unmet";

export interface WinWinCondition {
  condition: string;
  status: ConditionStatus;
  evidence: string;
  sourceId: keyof typeof SOURCES;
}

/**
 * The win-win test: conditions under which a data center is a net gain for
 * its host community, and where Oregon stands on each as of August 2026.
 */
export const WIN_WIN_CONDITIONS: WinWinCondition[] = [
  {
    condition: "Large users pay the full cost of the grid built for them",
    status: "met",
    evidence:
      "The POWER Act (2025) and PGE's 2026 rate class make >20 MW users sign 10–30 year contracts, cover 100% of new distribution costs, and meet minimum-take rules. Data-center bills rose ~30%; residential bills fell ~1.3%.",
    sourceId: "oecGuardrails",
  },
  {
    condition: "New load is tied to new clean energy, not backfilled with gas",
    status: "partial",
    evidence:
      "PGE connects new data centers only if emissions-free power is available, but HB 2021 and the POWER Act reach only about 61% of Oregon electricity sales. Co-op and PUD territory is exempt, and that is exactly where Umatilla Electric's carbon intensity rose 2,000% in a decade serving Amazon's buildout.",
    sourceId: "governingUec",
  },
  {
    condition: "Water use is disclosed and capped in stressed basins",
    status: "unmet",
    evidence:
      "State reporting requirements are virtually nonexistent. The Dalles spent 13 months in court trying to keep Google's water figures secret; Google used over a quarter of the city's water in 2021, near 40% in recent reports.",
    sourceId: "waterWatch",
  },
  {
    condition: "Tax deals return more than they give up",
    status: "unmet",
    evidence:
      "Oregon's own incentive study found 15-year rural enterprise-zone deals, the main data-center vehicle, lose 84 cents per dollar of property tax forgone and cost ~$54,500 per job, vs. $4,200 in standard zones.",
    sourceId: "governingStudy",
  },
  {
    condition: "Schools and services are held harmless",
    status: "unmet",
    evidence:
      "Hermiston's superintendent told the committee the enterprise-zone school fee is 'not additional support to the local district' — equalization backfills the district and the loss lands on the statewide pool, roughly $1.50 per weighted student per $1M. Negotiated fees do fund real local projects, including a $240M Boardman school bond over 80% covered by one operator.",
    sourceId: "odeSchoolFunding",
  },
  {
    condition: "Deals are approved in public, with notice and a vote",
    status: "unmet",
    evidence:
      "A June 2026 lawsuit alleges Hillsboro and Washington County staff approved ~17 enterprise-zone applications, filed in a rush before the moratorium, without required public notice or governing-body authorization.",
    sourceId: "capitalChronicleLawsuit",
  },
];

/**
 * Governor Kotek's Data Center Advisory Committee (formed January 2026).
 * Membership, charge, and schedule from the Governor's announcement and the
 * Oregon Dept. of Energy committee page, checked August 2026.
 */
export const COMMITTEE = {
  reportDue: "October 2026",
  email: "datacenter.ac@oregon.gov",
  members: [
    {
      name: "Margaret Hoffmann",
      role: "Oregon member, Northwest Power & Conservation Council",
      coChair: true,
    },
    { name: "Michael Jung", role: "Energy & climate policy professional", coChair: true },
    { name: "Dan Dorran", role: "Chair, Umatilla County Commission", coChair: false },
    {
      name: "Greg Dotson",
      role: "Associate professor of law, University of Oregon",
      coChair: false,
    },
    { name: "Bill Edmonds", role: "Adjunct professor, University of Portland", coChair: false },
    { name: "Tim Miller", role: "Director, Oregon Business for Climate", coChair: false },
    { name: "Jean Wilson", role: "Operating partner, Sandbrook Capital", coChair: false },
  ],
  charge: [
    "Encourage responsible siting that supports economic development, especially in rural communities",
    "Understand data centers' effects on Oregon's climate, clean-energy, and natural-resource goals",
    "Ensure data centers get reliable energy without burdening other ratepayers",
    "Protect Oregon's limited water resources as cooling demand grows",
    "Identify the policy framework the state needs to guide growth responsibly",
  ],
  schedule: [
    { date: "Feb 27, 2026", topic: "Economic development & workforce" },
    { date: "Mar 27, 2026", topic: "Water resources" },
    { date: "Apr 24, 2026", topic: "Land use" },
    { date: "May 29, 2026", topic: "Energy" },
    { date: "Jun 26, 2026", topic: "Energy affordability, revenue & incentives" },
    { date: "Jul 31 & Aug 4, 2026", topic: "Deliberations & draft report" },
    { date: "Sep 23, 2026", topic: "Public listening session on preliminary findings" },
    { date: "Oct 2026", topic: "Final report & recommendations to the Governor" },
  ],
} as const;

export interface NextEvent {
  when: string;
  what: string;
  why: string;
}

/** Decision points ahead (the committee has its own section). */
export const WHATS_NEXT: NextEvent[] = [
  {
    when: "2027 session",
    what: "The moratorium forces a decision",
    why: "HB 4084's enterprise-zone ban for new data centers expires 90 days after the session adjourns. Lawmakers must renew, replace, or let the old rules return.",
  },
  {
    when: "In the courts",
    what: "The Hillsboro / Washington County lawsuit",
    why: "1000 Friends of Oregon, Tax Fairness Oregon, Tualatin Riverkeepers, and the Oregon Education Association want the pre-moratorium approvals voided.",
  },
  {
    when: "At the PUC",
    what: "Pacific Power's data-center rate case",
    why: "PGE's rate class was first. Pacific Power's proceeding decides whether the same guardrails cover the rest of the state's investor-owned territory.",
  },
];

// ── siting regions & calculator presets ─────────────────────────────

export type SitingPosture = "price-right" | "conditional" | "pull-back" | "not-viable";

export interface Region {
  id: string;
  name: string;
  towns: string;
  /** Approximate marker position on the schematic Oregon map (0–440 × 0–320). */
  x: number;
  y: number;
  posture: SitingPosture;
  /** Default calculator inputs for this region (see engine.ts for the model). */
  preset: {
    investmentM: number; // total on-site investment, $M (building + equipment)
    taxRatePct: number; // effective property tax rate, % of taxable value
    abatementYears: number;
    feeM: number; // fee-in-lieu, $M per year during abatement
    jobs: number;
    wageK: number; // average wage, $K/yr
    leveragePct: number; // chance they'd build here with NO tax break, %
  };
  leverageNote: string;
  water: string;
  grid: string;
  verdict: string;
}

/**
 * Regional defaults are illustrative judgment calls, not measurements —
 * anchored to the public record (deal terms, water fights, grid mix) and
 * fully adjustable in the calculator. Leverage = the chance the company
 * would have built there anyway with no tax break.
 */
export const REGIONS: Region[] = [
  {
    id: "hillsboro",
    name: "Hillsboro / Washington County",
    towns: "Hillsboro, Beaverton",
    x: 78,
    y: 78,
    posture: "pull-back",
    preset: {
      investmentM: 1500,
      taxRatePct: 1.0,
      abatementYears: 5,
      feeM: 1.0,
      jobs: 30,
      wageK: 70,
      leveragePct: 85,
    },
    leverageNote:
      "Eight trans-Pacific fiber cables land here — an advantage no abatement can move. Leverage is very high.",
    water: "Tualatin basin pressure; Riverkeepers now in court",
    grid: "PGE territory — POWER Act guardrails apply",
    verdict:
      "Full freight. With leverage this high, almost no abatement pencils out — the state's study and the 2026 lawsuit both point the same way.",
  },
  {
    id: "gorge",
    name: "The Dalles / Columbia Gorge",
    towns: "The Dalles",
    x: 148,
    y: 72,
    posture: "conditional",
    preset: {
      investmentM: 1200,
      taxRatePct: 1.0,
      abatementYears: 15,
      feeM: 1.5,
      jobs: 50,
      wageK: 80,
      leveragePct: 50,
    },
    leverageNote:
      "Dam-adjacent power is a real draw, but the town's water system is the binding constraint.",
    water: "Google used >25% of city water in 2021, ~40% recently",
    grid: "Adjacent hydro; municipal water is the limit",
    verdict:
      "Conditional. Deals can pencil at mid leverage, but only with mandatory water disclosure and caps written into the agreement.",
  },
  {
    id: "columbia-east",
    name: "Columbia River East",
    towns: "Boardman, Hermiston, Umatilla",
    x: 262,
    y: 62,
    posture: "conditional",
    preset: {
      investmentM: 2000,
      taxRatePct: 1.1,
      abatementYears: 15,
      feeM: 2.7,
      jobs: 100,
      wageK: 90,
      leveragePct: 25,
    },
    leverageNote:
      "Cheap land and power exist across the river in Washington too — leverage is genuinely low.",
    water: "Groundwater already in a nitrate crisis",
    grid: "Co-op territory: carbon intensity up 2,000% in a decade; POWER Act doesn't apply",
    verdict:
      "The strongest case for deals, and the weakest guardrails. Pencils at low leverage, but fees near Morrow's ~$2.7M/yr run close to the break-even line, and clean-power terms don't exist here yet.",
  },
  {
    id: "central",
    name: "Central Oregon",
    towns: "Prineville, Bend",
    x: 196,
    y: 150,
    posture: "conditional",
    preset: {
      investmentM: 1800,
      taxRatePct: 1.05,
      abatementYears: 15,
      feeM: 2.0,
      jobs: 80,
      wageK: 85,
      leveragePct: 40,
    },
    leverageNote:
      "The Meta/Apple cluster raises leverage over time — each new deal needs less sweetener than the last.",
    water: "High desert: cooling water is scarce by definition",
    grid: "Pacific Power territory — rate case pending",
    verdict:
      "Conditional, tightening. The cluster is established; abatement terms should ratchet down with each expansion, not roll over.",
  },
  {
    id: "willamette",
    name: "Willamette Valley",
    towns: "Salem, farm belt",
    x: 72,
    y: 128,
    posture: "pull-back",
    preset: {
      investmentM: 1000,
      taxRatePct: 1.0,
      abatementYears: 0,
      feeM: 0,
      jobs: 30,
      wageK: 70,
      leveragePct: 60,
    },
    leverageNote: "No unique draw, and the land competes with farms and housing.",
    water: "Farm and municipal demand already compete",
    grid: "Constrained; no surplus story",
    verdict:
      "The state has already answered: in July 2026 the Governor withdrew 32 state-owned acres in Salem from a proposed data center. High-value farmland is the wrong trade at almost any price.",
  },
  {
    id: "southeast",
    name: "South & Southeast Oregon",
    towns: "Burns, Lakeview",
    x: 300,
    y: 215,
    posture: "not-viable",
    preset: {
      investmentM: 500,
      taxRatePct: 1.0,
      abatementYears: 15,
      feeM: 0.5,
      jobs: 20,
      wageK: 70,
      leveragePct: 5,
    },
    leverageNote: "Maximum willingness, minimum leverage, and no fiber or transmission to sell.",
    water: "Closed basins; some already over-allocated",
    grid: "No major fiber routes or transmission headroom",
    verdict:
      "Not a pricing question. Without fiber and grid, no subsidy attracts a serious project — chasing one means giving away the most for the least.",
  },
];

// ── formatters ──────────────────────────────────────────────────────

export const fmtNum = (n: number) => n.toLocaleString("en-US");

export const fmtMoney = (n: number) =>
  n >= 1_000_000_000
    ? `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`
    : n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
      : `$${n.toLocaleString("en-US")}`;

export const fmtPct = (n: number) => `${n}%`;
