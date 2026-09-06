/**
 * Homelessness deep-dive data.
 *
 * Headline figures come from an already-verified data spine (each read from a
 * fetched primary source). The qualitative framing (triage, the plan, the myths)
 * is distilled from a research synthesis. A focused citation pass (June 2026) sourced the
 * remaining national/gap claims and corrected several before publication — e.g.
 * the per-person street cost is an upper-typical figure, not a median; the SHS
 * "unspent" balance peaked near $431M (not $500M+); the pre-release Medicaid
 * benefit is authorized but paused. Approximate figures are labeled.
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "research" | "news" | "advocacy";
}

export const SOURCES: Record<string, Source> = {
  byName: { id: "byName", title: "Homeless Services Department Data Dashboard (by-name list)", org: "Multnomah County HSD", url: "https://hsd.multco.us/data-dashboard/", kind: "primary" },
  byNameRelease: { id: "byNameRelease", title: "For the first time, Multnomah County shares a monthly count of people experiencing homelessness", org: "Multnomah County", url: "https://multco.us/news/news-release-first-time-ever-multnomah-county-shares-monthly-count-people-homelessness-name", kind: "primary" },
  opbByName2026: { id: "opbByName2026", title: "Behind Portland's homelessness data, a familial, political fight emerges", org: "OPB", url: "https://www.opb.org/article/2026/04/01/behind-portlands-homelessness-data-familial-political-fight-emerges/", kind: "news" },
  pitHic: { id: "pitHic", title: "2025 Tri-County Point-in-Time Count Report", org: "PSU Homelessness Research & Action Collaborative", url: "https://hsd.multco.us/wp-content/uploads/2025/11/2025-Tri-County-PITC-Report-11.04.25.pdf", kind: "research" },
  pit2023: { id: "pit2023", title: "Chronic homelessness falls across tri-county region (2023 PIT)", org: "Multnomah County", url: "https://multco.us/news/news-release-chronic-homelessness-number-falls-across-tri-county-region-2023-point-time-count", kind: "primary" },
  shs: { id: "shs", title: "Supportive Housing Services — funding & financial reports", org: "Metro", url: "https://www.oregonmetro.gov/what-metro-does/housing-and-homelessness/supportive-housing-services/funding", kind: "primary" },
  shsRaised: { id: "shsRaised", title: "Metro-area homelessness persists despite $1.3 billion raised since 2021", org: "Willamette Week", url: "https://www.wweek.com/news/2025/11/06/metro-area-homelessness-persists-despite-13-billion-raised-since-2021-point-in-time-count-shows/", kind: "news" },
  shsUnspent: { id: "shsUnspent", title: "Counties, Metro surface major disagreement over homeless services tax", org: "Willamette Week", url: "https://www.wweek.com/news/2024/03/21/counties-metro-surface-major-disagreement-over-homeless-services-tax-as-second-meeting/", kind: "news" },
  shsHoused: { id: "shsHoused", title: "Counties report SHS measure has now housed 15,724 people", org: "Multnomah County", url: "https://multco.us/news/counties-report-supportive-housing-services-measure-has-now-housed-15724-people-across", kind: "primary" },
  evictions: { id: "evictions", title: "Evicted in Oregon — eviction filing data", org: "Portland State University (from OJD records)", url: "https://www.evictedinoregon.com/", kind: "research" },
  domicile: { id: "domicile", title: "Domicile Unknown — deaths of people experiencing homelessness", org: "Multnomah County Health Department / Street Roots", url: "https://multco.us/info/domicile-unknown", kind: "primary" },
  portlandSolutions: { id: "portlandSolutions", title: "Homelessness Assistance Guide", org: "City of Portland (Portland Solutions)", url: "https://www.portland.gov/portland-solutions/homelessness-assistance-guide", kind: "primary" },
  portlandSolutionsHome: { id: "portlandSolutionsHome", title: "Portland Solutions", org: "City of Portland", url: "https://portland.gov/portland-solutions", kind: "primary" },
  psr: { id: "psr", title: "Portland Street Response", org: "City of Portland", url: "https://portland.gov/streetresponse", kind: "primary" },
  chat: { id: "chat", title: "Community Health Assess & Treat (CHAT)", org: "Portland Fire & Rescue", url: "https://portland.gov/fire/community-health/chat", kind: "primary" },
  nwcc: { id: "nwcc", title: "Northwest Community Conservancy", org: "NWCC", url: "https://nwccpdx.org", kind: "primary" },
  impactRecovery: { id: "impactRecovery", title: "Recovery Navigation Program", org: "ImpactNW", url: "https://impactnw.org/programs/housing-and-safety-net/recovery-navigation-program", kind: "primary" },
  shelterDashboards: { id: "shelterDashboards", title: "Shelter Services Data Dashboards", org: "City of Portland", url: "https://portland.gov/shelter-services/shelter-services-data-dashboards", kind: "primary" },
  bybee: { id: "bybee", title: "Bybee Lakes Hope Center", org: "City of Portland", url: "https://portland.gov/united/bybee-lakes", kind: "primary" },
  deflectionProgram: { id: "deflectionProgram", title: "Deflection Program", org: "Multnomah County", url: "https://multco.us/info/deflection-program", kind: "primary" },
  deflectionAnnual: { id: "deflectionAnnual", title: "Deflection Program 2024-2025 Annual Report", org: "Multnomah County", url: "https://multco.us/file/deflection_program_2024-2025_annual_report/download", kind: "primary" },
  deflectionQ3: { id: "deflectionQ3", title: "Deflection Program FY26 Q3 Data Snapshot", org: "Multnomah County", url: "https://multco.us/file/deflection_program_fy26_q3_data_snapshot_(january_1,_2026_-_march_31,_2026)/download", kind: "primary" },

  // Cost of inaction
  naehCost: { id: "naehCost", title: "Ending Chronic Homelessness Saves Taxpayers Money ($35,578/yr)", org: "National Alliance to End Homelessness", url: "https://endhomelessness.org/resources/research-and-analysis/ending-chronic-homelessness-saves-taxpayers-money-2/", kind: "research" },
  economicRt: { id: "economicRt", title: "Where We Sleep: The Costs of Housing and Homelessness in Los Angeles", org: "Economic Roundtable", url: "https://economicrt.org/publication/where-we-sleep/", kind: "research" },
  utahNpr: { id: "utahNpr", title: "Utah Reduced Chronic Homelessness By 91 Percent; Here's How", org: "NPR", url: "https://www.npr.org/2015/12/10/459100751/utah-reduced-chronic-homelessness-by-91-percent-heres-how", kind: "news" },
  wayHome: { id: "wayHome", title: "Portland Way Home — plan & cost analysis", org: "Portland Way Home", url: "https://portlandwayhome.org", kind: "advocacy" },

  // Triage & Housing First
  naehTriageCost: { id: "naehTriageCost", title: "Cost to Provide Housing First to All Households in Shelters (RRH $8,486 / PSH $20,115)", org: "National Alliance to End Homelessness", url: "https://endhomelessness.org/wp-content/uploads/2025/03/3.11.25_Cost-to-Provide-Housing-First-to-All-Households-Staying-in-Shelters.pdf", kind: "research" },
  ahar2024: { id: "ahar2024", title: "2024 Annual Homelessness Assessment Report (AHAR) Part 1", org: "U.S. Department of Housing and Urban Development", url: "https://www.huduser.gov/portal/sites/default/files/pdf/2024-AHAR-Part-1.pdf", kind: "primary" },
  housingFirstNaeh: { id: "housingFirstNaeh", title: "The Truth About Housing First", org: "National Alliance to End Homelessness", url: "https://endhomelessness.org/blog/the-truth-about-housing-first/", kind: "research" },
  manhattanHF: { id: "manhattanHF", title: "Housing First and Homelessness: The Rhetoric and the Reality", org: "Manhattan Institute (Stephen Eide)", url: "https://manhattan.institute/article/housing-first-and-homelessness-the-rhetoric-and-the-reality", kind: "research" },

  // Treatment beds
  pcgBeds: { id: "pcgBeds", title: "Behavioral Health Residential Facility Study (gap of ~3,714 beds)", org: "OHA / Public Consulting Group", url: "https://www.oregon.gov/oha/HSD/AMH/DataReports/Behavioral-Health-Residential-Facility-Study-June-2024.pdf", kind: "research" },
  kotek465: { id: "kotek465", title: "Gov. Kotek & OHA announce 465 added treatment beds by end of 2026", org: "Oregon Governor's Office / OHA", url: "https://apps.oregon.gov/oregon-newsroom/OR/GOV/Posts/Post/governor-kotek-oregon-health-authority-announce-465-added-treatment-beds-by-end-of-2026", kind: "primary" },
  obcc: { id: "obcc", title: "Millions in OHSU behavioral-health coordination center has aided few patients", org: "Willamette Week", url: "https://www.wweek.com/news/health/2026/01/28/millions-of-dollars-in-ohsu-behavioral-health-coordination-center-has-aided-few-actual-patients/", kind: "news" },

  // Medicaid 1115
  medicaidHousing: { id: "medicaidHousing", title: "OHP Health-Related Social Needs — housing benefits", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/hsd/ohp/pages/housing.aspx", kind: "primary" },
  medicaidOpb: { id: "medicaidOpb", title: "Oregon launches Medicaid program to help pay rent", org: "OPB", url: "https://www.opb.org/article/2024/10/28/oregon-health-authority-rental-assistance-program-medicaid-housing/", kind: "news" },

  // Intervention unit costs (for the cost model)
  shelterReview: { id: "shelterReview", title: "Adult Shelter Review FY25 (per-bed shelter costs)", org: "Multnomah County HSD", url: "https://hsd.multco.us/wp-content/uploads/2026/01/Adult-Shelter-Review-FY25.pdf", kind: "primary" },
  masterLeaseNofa: { id: "masterLeaseNofa", title: "Master Leasing & Landlord Engagement NOFA (per-unit cost)", org: "Multnomah County JOHS", url: "https://multco.us/file/master_leasing_and_landlord_engagement_nofa_announcement/download", kind: "primary" },
  treatmentCost: { id: "treatmentCost", title: "Cost of residential substance-abuse treatment (per week)", org: "French, Popovici & Tapsell, J. Subst. Abuse Treat. (2008)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2614666/", kind: "research" },

  // Who pays, and the doors to federal dollars (September 2026 research memo)
  kffFmap: { id: "kffFmap", title: "Federal Medical Assistance Percentage (FMAP) and multiplier, FY2027", org: "KFF", url: "https://www.kff.org/medicaid/state-indicator/federal-matching-rate-and-multiplier/", kind: "research" },
  ohaWaiver: { id: "ohaWaiver", title: "2022–2027 Medicaid 1115 Demonstration Waiver", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/hsd/medicaid-policy/pages/waiver-renewal.aspx", kind: "primary" },
  ohaHrsn: { id: "ohaHrsn", title: "Health-Related Social Needs (HRSN) covered services", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/hsd/medicaid-policy/pages/hrsn.aspx", kind: "primary" },
  cmsRescission: { id: "cmsRescission", title: "Rescission of Guidance on Health-Related Social Needs (CMCS Informational Bulletin, Mar. 4, 2025)", org: "CMS", url: "https://www.medicaid.gov/federal-policy-guidance/2025-03-03/177006", kind: "primary" },
  lundHrsn: { id: "lundHrsn", title: "'Administrative collapse': advocates blame evictions on new OHA housing program", org: "OPB / The Lund Report", url: "https://www.opb.org/article/2025/05/05/portland-oregon-homelessness-low-income-eviction-health-social-workers-housing/", kind: "news" },
  ohaFederalChanges: { id: "ohaFederalChanges", title: "Oregon Health Plan changes in late 2026 to 2028 (H.R. 1)", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/hsd/ohp/pages/federal-changes.aspx", kind: "primary" },
  orpcaHr1: { id: "orpcaHr1", title: "OHA analysis of H.R. 1: 100,000–200,000 Oregonians could lose coverage", org: "Oregon Primary Care Association (reproducing OHA)", url: "https://orpca.org/wp-content/uploads/2025/09/H.R-1-Medicaid-Cuts-OHA-Analysis.pdf", kind: "primary" },
  shareGuidance: { id: "shareGuidance", title: "2026 SHARE Guidance (CCO reinvestment formula, OAR 410-141-3735)", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/HPA/dsi-tc/Documents/SHARE-Initiative-Guidance-Document.pdf", kind: "primary" },
  ohaHousingMedicaid: { id: "ohaHousingMedicaid", title: "CCO Guidance: Housing and Medicaid Spending Programs (Dec. 2025)", org: "Oregon Health Authority", url: "https://www.oregon.gov/oha/HPA/dsi-tc/Documents/Housing-and-Medicaid-Spending-Programs.pdf", kind: "primary" },
  hudCocOr: { id: "hudCocOr", title: "FY2024 Continuum of Care award report, Oregon (OR-501 $37.7M)", org: "U.S. Department of Housing and Urban Development", url: "https://www.hud.gov/sites/dfiles/CPD/documents/CoC/CoC-2024-OR_Press.pdf", kind: "primary" },
  nacoFy26: { id: "nacoFy26", title: "Court vacates FY2026 Continuum of Care grant changes", org: "National Association of Counties", url: "https://www.naco.org/news/court-vacates-fy-2026-continuum-care-grant-changes", kind: "news" },
  crsHudFy27: { id: "crsHudFy27", title: "HUD FY2027 Budget Request: In Brief", org: "Congressional Research Service", url: "https://www.congress.gov/crs-product/R48927", kind: "primary" },
  multcoFy27: { id: "multcoFy27", title: "County adopts FY2027 budget: $67M Homeless Services gap, 605 shelter units closed", org: "Multnomah County", url: "https://multco.us/news/news-release-multnomah-county-board-commissioners-closes-significant-spending-gap-adopts", kind: "primary" },
  randH4h: { id: "randH4h", title: "Evaluation of Housing for Health Permanent Supportive Housing Program (LA County)", org: "RAND", url: "https://www.rand.org/pubs/research_reports/RR1694.html", kind: "research" },
  providenceCore: { id: "providenceCore", title: "Housing is Health: Medicaid outcomes for 1,600 Portland residents", org: "Providence Center for Outcomes Research & Education", url: "https://blog.providence.org/center-for-outcomes-research-education/core-study-shows-benefits-of-major-local-housing-for-health-initiative", kind: "research" },
  urbanDenver: { id: "urbanDenver", title: "Denver Supportive Housing Social Impact Bond: final outcome payments", org: "Urban Institute", url: "https://www.urban.org/research/publication/denver-supportive-housing-social-impact-bond-initiative-final-outcome-payments", kind: "research" },
  ncHop: { id: "ncHop", title: "Healthy Opportunities Pilots reduce Medicaid costs $164/member/month; program suspended", org: "North Carolina DHHS", url: "https://www.ncdhhs.gov/news/press-releases/2026/06/02/healthy-opportunities-pilots-lead-healthier-outcomes-and-reduce-nc-medicaid-costs", kind: "primary" },
  waFcs: { id: "waFcs", title: "Foundational Community Supports (Medicaid-billed supportive housing services)", org: "Washington State Health Care Authority", url: "https://www.hca.wa.gov/about-hca/programs-and-initiatives/medicaid-transformation-project-mtp/foundational-community-supports", kind: "primary" },
};

// ── Headline figures (verified) ───────────────────────────────────

export const STATS = {
  byNameTotal: 18_000, // ~Jan 2026
  byNameUnsheltered: 8_800,
  byNameTotalJan2025: 14_361,
  monthlyInflow: 1_277,
  monthlyOutflow: 865,
  netMonthly: 412, // Jan 2025 specific
  regionalMonthlyInflow: 3_068, // FY25 tri-county, first-time seeking services
  regionalMonthlyOutflow: 1_001, // FY25 tri-county, exits to housing
  pitTotal: 10_526,
  pitSheltered: 3_614,
  pitUnsheltered: 6_912,
  pitChange2023to2025Pct: 0.67,
  chronicSharePct: 0.41, // Multnomah 2023 PIT: 2,610 of 6,297
  pshBeds: 6_973,
  rrhBeds: 2_663,
  esBeds: 3_350,
  // Costs (per adult household / year, 2022 dollars, NAEH)
  rrhCostPerYear: 8_486,
  pshCostPerYear: 20_115,
  // SHS tax
  shsRaisedSince2021: 1_300_000_000,
  shsUnspentPeak: 431_000_000, // FY2024 year-end projection
  shsCollectedFY25: 325_000_000,
  shsProjectedFY26: 351_000_000,
  regionalHousedSince2021: 15_724,
  evictionPreventionsFY25: 2_416,
  // Evictions
  evictionFilings2025: 12_094,
  evictionFilings2019: 5_957,
  // Treatment
  treatmentBedGap: 3_714,
  currentSudResidentialBeds: 1_629,
  kotekBedGoal: 465,
  // Medicaid
  medicaidHousingMembers: 4_490, // Nov 2024–June 2025
  // Deaths
  deaths2024: 372,
  deaths2023: 456,
  overdoseDeaths2024: 214,
  fentanylDeaths2024: 183,
  avgAgeAtDeath: 48,
  deflectionQ3LawEnforcementReferrals: 79,
  deflectionQ3Exited90DayWindow: 21,
  deflectionQ3Successful90DayCompletions: 9,
  deflectionQ3SuccessfulSUDOnly: 1,
  deflectionQ3SuccessfulSUDPlusCareCoordination: 7,
  deflectionQ3SuccessfulCareCoordinationOnly: 1,
} as const;

// ── Triage: the three populations ─────────────────────────────────
// Plain-language version of the transitional / episodic / chronic typology
// (Kuhn & Culhane, 1998). Costs are NAEH per-adult-household/year figures.

export interface TriageGroup {
  id: "economic" | "moderate" | "chronic";
  label: string;
  share: string;
  who: string;
  rightFix: string;
  cost: string;
  mismatch: string;
  color: string;
}

export const TRIAGE: TriageGroup[] = [
  {
    id: "economic",
    label: "Economic-only",
    share: "the largest group",
    who: "People pushed out by a rent hike, a lost job, a medical bill — no serious addiction or mental-illness barrier. Often homeless for the first time and not for long.",
    rightFix: "Rapid rehousing — a unit plus light, short-term help.",
    cost: "≈ $8,500 per household/year — the cheapest, fastest fix, for the majority.",
    mismatch: "Park them in expensive permanent supportive housing and you burn scarce, intensive resources on people who didn't need them.",
    color: "var(--color-fern)",
  },
  {
    id: "moderate",
    label: "Moderate / episodic",
    share: "the middle",
    who: "People who cycle in and out of homelessness, often with treatable mental-health or substance-use needs that flare under stress.",
    rightFix: "Stable housing plus moderate, ongoing support and treatment access.",
    cost: "Mid-range — housing plus case management.",
    mismatch: "Bare rapid rehousing without support and many cycle back; full PSH and you over-serve.",
    color: "var(--color-river)",
  },
  {
    id: "chronic",
    label: "Chronic / severe",
    share: "~4 in 10 of Multnomah's homeless",
    who: "Long-term homeless with serious, co-occurring disability — the most visible on the street, and by far the most costly to the public when left there.",
    rightFix: "Permanent Supportive Housing + treatment — housing with intensive, indefinite services.",
    cost: "≈ $20,000 per household/year — expensive, but cheaper than the street (see the calculator).",
    mismatch: "Bare rapid rehousing without services, and they cycle straight back to the street — the most expensive failure of all.",
    color: "var(--color-clay)",
  },
];

// -- Street-to-stability cohort routing ------------------------------------

export interface PlacementCohort {
  id: string;
  cohort: string;
  deadline: string;
  firstPlacement: string;
  capacityNeeded: string[];
  responsibleOwners: string[];
  metrics: string[];
}

export const PLACEMENT_COHORTS: PlacementCohort[] = [
  {
    id: "economic-shock",
    cohort: "Recently homeless / economic shock",
    deadline: "30-60 days",
    firstPlacement: "Motel bridge, prevention payment, landlord mediation, rapid rehousing",
    capacityNeeded: ["Flexible rent fund", "Landlord guarantees", "Rapid rehousing slots", "Motel bridge rooms"],
    responsibleOwners: ["County", "City", "Metro", "State"],
    metrics: ["Days homeless", "Cost per prevention", "Return rate"],
  },
  {
    id: "vehicle-homeless",
    cohort: "Car/RV homeless / working poor",
    deadline: "30-90 days",
    firstPlacement: "Safe parking, sanitation, vehicle support, housing navigation",
    capacityNeeded: ["Safe parking lots", "RV repair/disposal fund", "Housing navigators", "Landlord pool"],
    responsibleOwners: ["City", "County", "Metro", "Nonprofits"],
    metrics: ["Unmanaged vehicles reduced", "Housing exits", "Sanitation incidents"],
  },
  {
    id: "families",
    cohort: "Families with children",
    deadline: "Same day",
    firstPlacement: "Family motel or family shelter with school continuity",
    capacityNeeded: ["Family motel rooms", "Family shelter", "Childcare", "Rent subsidies"],
    responsibleOwners: ["County", "Schools", "State"],
    metrics: ["Unsheltered family nights", "School continuity", "Housing placement"],
  },
  {
    id: "youth",
    cohort: "Youth and young adults",
    deadline: "24-72 hours",
    firstPlacement: "Youth shelter, host home, family reunification if safe, transitional living",
    capacityNeeded: ["Youth-specific beds", "Host homes", "Transitional housing", "Mental health support"],
    responsibleOwners: ["County", "Schools", "State", "Youth providers"],
    metrics: ["Adult-system exposure", "School/work path", "Stable exits"],
  },
  {
    id: "dv-trafficking",
    cohort: "DV / trafficking survivors",
    deadline: "Same day",
    firstPlacement: "Confidential hotel, safe shelter, legal protection, relocation if needed",
    capacityNeeded: ["Confidential hotel fund", "DV shelter beds", "Legal aid", "Relocation fund"],
    responsibleOwners: ["DV providers", "County", "State", "Courts"],
    metrics: ["Safe placement", "Legal protection", "Confidential housing exit"],
  },
  {
    id: "sud",
    cohort: "Severe substance use disorder",
    deadline: "Same day to 72 hours when willing",
    firstPlacement: "Sobering, withdrawal management, residential SUD, recovery housing",
    capacityNeeded: ["Sobering beds", "Detox beds", "Residential SUD beds", "Recovery housing"],
    responsibleOwners: ["County behavioral health", "OHA/Medicaid", "Treatment providers", "Courts"],
    metrics: ["Treatment access", "Retention", "Overdose/ER/jail reduction"],
  },
  {
    id: "smi",
    cohort: "Serious mental illness",
    deadline: "Same day for crisis",
    firstPlacement: "Crisis stabilization, psychiatric evaluation, inpatient or residential care, ACT, PSH",
    capacityNeeded: ["Crisis beds", "Inpatient psych", "Secure residential treatment", "ACT teams"],
    responsibleOwners: ["County behavioral health", "OHA", "Hospitals", "Courts"],
    metrics: ["Stabilization", "Medication continuity", "Street returns"],
  },
  {
    id: "dual-diagnosis",
    cohort: "Co-occurring SMI + SUD",
    deadline: "Same day to 72 hours",
    firstPlacement: "Dual-diagnosis stabilization and integrated residential treatment",
    capacityNeeded: ["Dual-diagnosis beds", "Specialized stabilization shelter", "Secure treatment", "Recovery PSH"],
    responsibleOwners: ["County", "OHA", "Hospitals", "Providers", "Courts"],
    metrics: ["Dual-diagnosis access", "Retention", "Crisis events"],
  },
  {
    id: "medical-fragile",
    cohort: "Medically fragile / elderly / disabled",
    deadline: "Before discharge",
    firstPlacement: "Medical respite, accessible shelter, adult foster home, assisted living, supportive housing",
    capacityNeeded: ["Medical respite beds", "Accessible units", "Medicaid coordination", "Adult foster slots"],
    responsibleOwners: ["Hospitals", "CCOs", "County health", "Medicaid/OHP"],
    metrics: ["Discharge-to-street avoided", "Readmissions", "SNF/respite cost"],
  },
  {
    id: "chronic-stable",
    cohort: "Chronically homeless but relatively stable",
    deadline: "90-180 days",
    firstPlacement: "Low-barrier shelter or village while documents, benefits, and PSH match are completed",
    capacityNeeded: ["PSH units", "Landlord partners", "Case managers", "Lease-up support"],
    responsibleOwners: ["County", "Metro", "Housing providers", "Landlords"],
    metrics: ["PSH placement", "6/12-month retention", "Returns to homelessness"],
  },
  {
    id: "justice-involved",
    cohort: "Justice-involved / repeat public-safety contacts",
    deadline: "Before release or next court event",
    firstPlacement: "Specialty court, supervised diversion, jail-release bridge, treatment and housing",
    capacityNeeded: ["Specialty court slots", "Treatment beds", "Jail-release shelter", "Compliance monitoring"],
    responsibleOwners: ["Courts", "County jail", "DA/public defense", "City police", "Treatment providers"],
    metrics: ["Jail-street-jail interruptions", "Compliance", "Treatment/housing retention"],
  },
  {
    id: "service-refusing",
    cohort: "Service-refusing / unsafe encampment",
    deadline: "Repeated and documented",
    firstPlacement: "Barrier-specific offer with pets, partners, storage, alternative models, and legal path if dangerous or incapable",
    capacityNeeded: ["Credible alternatives", "Pet/partner/storage options", "Outreach capacity", "Court pathway"],
    responsibleOwners: ["City public space", "County services", "Outreach providers", "Courts"],
    metrics: ["Real offers made", "Refusal reasons", "Public-space resolution"],
  },
];

// ── The bed-visibility problem ────────────────────────────────────

export const BED_LAYERS = [
  { key: "licensed", label: "Licensed", desc: "the bed is legally allowed to exist", tracked: true },
  { key: "funded", label: "Funded", desc: "someone is paying for it", tracked: true },
  { key: "staffed", label: "Staffed", desc: "there are workers to run it", tracked: false },
  { key: "occupied", label: "Occupied", desc: "someone is in it right now", tracked: false },
  { key: "available", label: "Open tonight", desc: "a worker could place someone in it now", tracked: false },
] as const;

// -- Field triage: what a worker can actually do at first contact ----------

export const FIELD_TRIAGE = [
  {
    step: "Crime present",
    route: "Criminal justice route",
    reality: "Legal authority is clear, but the back end only helps if court, jail, deflection, or treatment creates an actual service path.",
  },
  {
    step: "Mental-health hold threshold",
    route: "Civil hold / hospital route",
    reality: "Only available when the person is a danger to self or others or cannot care for themselves. Many visible street crises fall below that threshold.",
  },
  {
    step: "No crime, no hold",
    route: "Voluntary shelter or treatment referral",
    reality: "This is the gap PDX Help targets: if the person says yes now, the worker needs an eligible option, phone confirmation, hold, and transport before the window closes.",
  },
] as const;

export const OUTREACH_ACTORS = [
  { name: "Portland Street Response", source: "psr" },
  { name: "Portland Solutions", source: "portlandSolutionsHome" },
  { name: "Portland Fire CHAT", source: "chat" },
  { name: "Northwest Community Conservancy", source: "nwcc" },
  { name: "ImpactNW Recovery Navigation", source: "impactRecovery" },
] as const;

export const DEFLECTION_REALITY = [
  {
    label: "Law-enforcement referrals",
    value: STATS.deflectionQ3LawEnforcementReferrals,
    note: "FY26 Q3, Jan. 1-Mar. 31, 2026.",
  },
  {
    label: "Reached 90-day completion window",
    value: STATS.deflectionQ3Exited90DayWindow,
    note: "The denominator for Q3 90-day completions.",
  },
  {
    label: "Successful 90-day completions",
    value: STATS.deflectionQ3Successful90DayCompletions,
    note: "Under the January 2026 completion definition.",
  },
  {
    label: "SUD/recovery only",
    value: STATS.deflectionQ3SuccessfulSUDOnly,
    note: "One completion was in the SUD/recovery-only bucket.",
  },
  {
    label: "SUD/recovery + care coordination",
    value: STATS.deflectionQ3SuccessfulSUDPlusCareCoordination,
    note: "Seven combined SUD/recovery access with sustained PATH follow-up.",
  },
] as const;

export const SHELTER_CONTINUUM = [
  {
    model: "Overnight emergency shelter",
    job: "Immediate bed for the night",
    gap: "Daytime street exposure remains; live open-bed status is not universal.",
  },
  {
    model: "24-hour congregate shelter",
    job: "Stability, meals, daytime access, and service connection",
    gap: "Works best when structured activity and case management are real.",
  },
  {
    model: "Tiny village / alternative shelter",
    job: "Low-barrier private sleeping space",
    gap: "Can become a dead end without routine, treatment, work, or exit pathways.",
  },
  {
    model: "Detox / residential SUD / OTP",
    job: "Treat addiction as the binding constraint",
    gap: "Provider lists exist, but facility-level open bed counts are not public.",
  },
  {
    model: "Jail-discharge bridge",
    job: "Reentry, court, treatment, documents, work placement",
    gap: "Mostly a proposal locally; needs program and records-request validation.",
  },
  {
    model: "Hospital step-down shelter",
    job: "Safe discharge with medical knowledge on site",
    gap: "Could reduce street discharge and high-cost skilled nursing overuse; cost claims need verification.",
  },
  {
    model: "Housing First / supportive housing",
    job: "Stable housing with the right service intensity",
    gap: "Fails when used as the only answer or when isolated people return to encampment community.",
  },
] as const;

// ── The fastest-reduction plan (sequenced by speed) ───────────────

export const PLAN = [
  {
    n: 1,
    title: "Slam the inflow shut, precisely",
    body: "The cheapest 'reduction' is the person who never becomes homeless. Use time-limited eviction prevention for verified financial crises, paid directly to landlords, while preserving tools to remove dangerous or predatory tenants. Then stop institutions from releasing people from jail, hospital, or foster care straight to the street.",
  },
  {
    n: 2,
    title: "Make field triage immediate",
    body: "When someone says yes right now, a worker needs an eligible option in minutes: anonymous criteria, live or phone-confirmed availability, name check by phone, hold, transport, and outcome. That is the product gap PDX Help is built to close.",
  },
  {
    n: 3,
    title: "Build the missing continuum",
    body: "Portland needs more than shelter vs. apartment: overnight beds, 24-hour shelters, detox, residential treatment, opioid treatment, jail-discharge shelters, hospital step-down shelters, structured recovery cohorts, and supportive housing. Each has a different job.",
  },
  {
    n: 4,
    title: "Measure treatment, not vibes",
    body: "Deflection, outreach, and shelter programs should report the real funnel: referral, engagement, service type, treatment admission, shelter arrival, housing exit, and retention. A contact is not a placement, and service access is not treatment completion.",
  },
  {
    n: 5,
    title: "Housing First, where it fits",
    body: "Scattered-site housing and permanent supportive housing remain essential. But housing is one tier in a continuum, not a substitute for treatment, reentry, hospital step-down care, or structured recovery community.",
  },
] as const;

// ── Myths that survive a hostile hearing ──────────────────────────

export const MYTHS = [
  {
    myth: "“Housing First means no rules — that's why it fails.”",
    truth: "Housing First removes the preconditions to *qualify* (you don't have to get sober first) — NOT the rules once you're housed. Tenants still sign standard leases and must meet ordinary obligations. The model sustains ~85–90% housing retention; the out-of-control-building failures are management and over-concentration problems, fixed by staffing and scattered-site placement.",
  },
  {
    myth: "“Housing the homeless pays for itself.”",
    truth: "Overclaimed locally. The biggest cost savings are *federal* Medicaid (ER and hospital care), not the city or county budget — Portland and the county are mostly on the hook for jail, EMS, sanitation, and the homelessness budget. The honest fix is pulling the federal payer in, not pretending it nets out for local taxpayers.",
  },
  {
    myth: "“Just force the addicts into treatment.”",
    truth: "You can't punish a status, can't force treatment without due process, and can't mandate people into beds that don't exist. The legal, effective version is a real treatment pathway: drug courts, deflection that actually reaches SUD care, pre-release planning, and narrow civil commitment where legally justified.",
  },
  {
    myth: "“We spend over a billion dollars and nothing changes.”",
    truth: "Spending is real, but a balance that peaked near $431 million sat unspent across fragmented budgets while the system couldn't see itself, so effort flowed to the visible lever (units built) instead of the binding one (closing the inflow, staffing beds). The highest-leverage fix is making the machine legible.",
  },
  {
    myth: "“Housing First is either the answer or the problem.”",
    truth: "Wrong frame. Housing First is a strong tool for people whose binding constraint is housing instability or chronic disability with services. It is not a detox bed, a jail-reentry plan, a hospital step-down unit, or a recovery community.",
  },
] as const;

// ── Presentation metadata (visual layer only; no new claims) ─────

/**
 * How fast each plan step can start producing results. Editorial reading of
 * the PLAN text itself: prevention and discharge rules are policy/admin
 * changes (weeks), triage software and funnel measurement are build-and-ship
 * work (months), the continuum and supportive housing are capital (years).
 */
export const PLAN_SPEED: Record<number, { horizon: "weeks" | "months" | "years"; costTag: string }> = {
  1: { horizon: "weeks", costTag: "cheapest per person kept housed" },
  2: { horizon: "months", costTag: "software + protocol, not construction" },
  3: { horizon: "years", costTag: "capital and staffing" },
  4: { horizon: "months", costTag: "reporting rules, near-zero cost" },
  5: { horizon: "years", costTag: "capital and ongoing services" },
};

/** Deadline buckets that order the cohort ladder, fastest first. */
export const DEADLINE_BUCKETS = [
  { key: "same-day", label: "Same day", sub: "hours", ids: ["families", "dv-trafficking", "smi", "sud", "dual-diagnosis"] },
  { key: "72h", label: "24–72 hours", sub: "days", ids: ["youth"] },
  { key: "before-exit", label: "Before discharge or release", sub: "the institution's clock", ids: ["medical-fragile", "justice-involved"] },
  { key: "1-3mo", label: "30–90 days", sub: "weeks", ids: ["economic-shock", "vehicle-homeless"] },
  { key: "3-6mo", label: "90–180 days", sub: "months", ids: ["chronic-stable"] },
  { key: "repeated", label: "Repeated, documented offers", sub: "no single deadline", ids: ["service-refusing"] },
] as const;

/** The deflection funnel, FY26 Q3, derived only by subtraction from STATS. */
export const DEFLECTION_FUNNEL = {
  referrals: STATS.deflectionQ3LawEnforcementReferrals,
  reachedWindow: STATS.deflectionQ3Exited90DayWindow,
  notYetAtWindow: STATS.deflectionQ3LawEnforcementReferrals - STATS.deflectionQ3Exited90DayWindow,
  completed: STATS.deflectionQ3Successful90DayCompletions,
  didNotComplete: STATS.deflectionQ3Exited90DayWindow - STATS.deflectionQ3Successful90DayCompletions,
  split: [
    { label: "SUD / recovery only", value: STATS.deflectionQ3SuccessfulSUDOnly },
    { label: "SUD / recovery + care coordination", value: STATS.deflectionQ3SuccessfulSUDPlusCareCoordination },
    { label: "Care coordination only", value: STATS.deflectionQ3SuccessfulCareCoordinationOnly },
  ],
} as const;

// ── Who pays for the street, and the doors to federal dollars ─────
// Distilled from research/homelessness-funding/document.md (Sept 2026).

export const FUNDING = {
  fmapRegular: 0.5818, // Oregon FY2027 (kffFmap)
  fmapExpansion: 0.9, // ACA expansion adults, statutory
  hrsnRentMonths: 6,
  hrsnMembersThroughJun2025: 4_490,
  ccoHousingInvest2018to2024: 104_000_000, // statewide, SHARE + flexible services (ohaHousingMedicaid)
  cocOr501Fy2024: 37_660_187, // hudCocOr
  hsdStructuralGapFy27: 67_000_000, // multcoFy27
  ohpCoverageLoss: [100_000, 200_000] as const, // orpcaHr1
  waiverEnds: "Sept. 30, 2027",
  workRequirementsStart: "Jan. 1, 2027",
} as const;

export interface Payer {
  id: string;
  name: string;
  pays: string;
  captures: string;
  /** Can this payer actually be made to fund the fix? */
  lever: "obligated" | "willing" | "conditional" | "none";
  leverNote: string;
}

export const PAYERS: Payer[] = [
  { id: "federal", name: "Federal Medicaid", pays: "ER visits and hospital stays billed to the Oregon Health Plan", captures: "58¢ of every avoided OHP dollar, 90¢ for expansion adults", lever: "none", leverNote: "No local reinvestment mechanism except the waiver and CCO contracts. It is not a pot anyone can ask for." },
  { id: "cco", name: "Health Share (the CCO)", pays: "The rest of OHP costs, inside a capped global budget", captures: "The remaining 42¢, kept as margin", lever: "obligated", leverNote: "State rule requires 0–20% of net income be reinvested, with housing as the designated priority. SHARE can even fund capital." },
  { id: "hospital", name: "Hospitals", pays: "Uncompensated emergency and inpatient care", captures: "Avoided uncompensated care", lever: "willing", leverNote: "Six Portland health systems put $21.5M into Central City Concern housing in 2016 and measured a 12% drop in Medicaid spend." },
  { id: "county", name: "Multnomah County", pays: "Jail nights, county clinics, the homeless-services budget", captures: "Only if a jail dorm or clinic capacity actually closes", lever: "conditional", leverNote: "Avoided cost is not cashable savings. A dorm that stays open saves nothing." },
  { id: "city", name: "City of Portland", pays: "EMS, police, Portland Street Response, camp cleanup", captures: "Same caveat: only if capacity is decommissioned", lever: "conditional", leverNote: "This is the cost that is genuinely local, and the honest case for it is deaths and public space, not payback." },
];

export interface Evidence {
  place: string;
  source: keyof typeof SOURCES;
  figure: string;
  unit: string;
  what: string;
  cautionary?: boolean;
}

export const PAYER_EVIDENCE: Evidence[] = [
  { place: "Los Angeles County", source: "randH4h", figure: "$1.20", unit: "saved per $1, year one", what: "County costs per person fell from $38,146 to $15,358; housing cost $15,288. The county health department paid for the housing because it was the payer that saved." },
  { place: "Portland", source: "providenceCore", figure: "−12%", unit: "Medicaid spend per resident", what: "1,600 members across 145 properties after six health systems funded Central City Concern. ER visits −18%, inpatient −15%, primary care +20%." },
  { place: "Denver", source: "urbanDenver", figure: "81%", unit: "still housed at two years", what: "250 frequent jail users, $8.6M private capital. Services cost $6,876 a year less than the control group. The city repaid investors on outcomes because jail days are its cost." },
  { place: "North Carolina", source: "ncHop", figure: "−$164", unit: "per member per month", what: "31,000 people, verified savings, federal authorization through 2029. The legislature declined the state share in 2025 and the program suspended anyway.", cautionary: true },
];

export interface Door {
  n: number;
  title: string;
  body: string;
  durability: "most durable" | "durable" | "time-limited" | "least controllable";
  deadline: string;
  source: keyof typeof SOURCES;
}

export const DOORS: Door[] = [
  { n: 1, title: "Bill what is billable, move local dollars off it", body: "Tenancy support, case management, and behavioral health delivered in supportive housing are Medicaid-reimbursable through CCO contracts. Every local dollar paying for those today could draw a 58–90% federal match, freeing it for rent past month six, shelter, and capital, which Medicaid cannot buy. Washington bills these services for 20,000+ people.", durability: "most durable", deadline: "Available now; does not depend on the waiver", source: "waFcs" },
  { n: 2, title: "Make the CCO pay for what it saves", body: "Health Share's reinvestment obligation is a formula on its own reserves, and housing is the required priority. The ask is a co-funding agreement that makes the county's supportive-housing pipeline the CCO's housing vehicle. CCOs statewide have put $104M into housing since 2018; how much of it is aligned with the county pipeline is a records request.", durability: "durable", deadline: "In state rule and CCO contracts; sized to the CCO's margin", source: "shareGuidance" },
  { n: 3, title: "Use the waiver rent benefit at scale, then fight for renewal", body: "OHP will pay six months of rent to stop an eviction, the cheapest lever in the flow model, and the state funded eviction prevention at a fifth of the governor's request. But the rollout was described to the state's own advisory committee as an administrative collapse. Fixing intake is near-free with a federal match behind it.", durability: "time-limited", deadline: "Waiver ends Sept. 30, 2027; CMS reviews renewals case by case", source: "lundHrsn" },
  { n: 4, title: "Defend the federal housing grant, and plan for its loss", body: "The $37.7M Continuum of Care grant is the region's permanent-supportive-housing backbone. Two 2026 court rulings blocked HUD's attempts to cap it. The FY2027 budget request would abolish the program; the House bill keeps it with a cut.", durability: "least controllable", deadline: "HUD weighing appeal; 2027 appropriation pending", source: "nacoFy26" },
];
