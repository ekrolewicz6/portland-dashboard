/**
 * I-5 Rose Quarter — core facts, sources and timeline.
 *
 * Compiled 2026-08-13 from ODOT's own project library, court filings, agency
 * documents and contemporaneous reporting. Time-sensitive items to re-check:
 *   - the cost figure: the estimate presented to the Transportation Commission
 *     in August 2026 is about $3.5B, while ODOT's public project pages still
 *     show an older $1.96-2.08B range
 *   - the state comprehensive-plan case, which has no public docket record
 *     after the January 2026 trial date
 *   - the September closure, which begins 2026-09-11
 */

import type { Source } from "./arguments";

export const SOURCES = {
  odotProject: {
    id: "odotProject",
    title: "I-5 Rose Quarter Improvement Project",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/",
    kind: "primary",
  },
  odotAbout: {
    id: "odotAbout",
    title: "Overview and benefits",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/about/",
    kind: "primary",
  },
  odotFaq: {
    id: "odotFaq",
    title: "Project FAQs",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/faqs/",
    kind: "primary",
  },
  odotLibrary: {
    id: "odotLibrary",
    title: "Project document library",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/library/",
    kind: "primary",
  },
  closureNotice: {
    id: "closureNotice",
    title: "ODOT to close I-5 southbound in the Rose Quarter for up to five weeks",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/news/odot-to-close-i-5-southbound-in-the-rose-quarter-in-september-for-up-to-five-weeks-for-structural-repairs/",
    kind: "primary",
  },
  closureOneMonth: {
    id: "closureOneMonth",
    title: "One month to go until the southbound I-5 closure",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/news/one-month-to-go-until-southbound-i-5-closure-in-rose-quarter/",
    kind: "primary",
  },
  rsea: {
    id: "rsea",
    title: "Revised Supplemental Environmental Assessment (2024)",
    org: "ODOT / FHWA",
    url: "https://www.i5rosequarter.org/media/3wjk5evj/i5rq_rsea_508.pdf",
    kind: "primary",
  },
  fonsi: {
    id: "fonsi",
    title: "Finding of No Significant Impact, signed March 6 2024",
    org: "FHWA",
    url: "https://www.i5rosequarter.org/media/xureybji/i5rq_fonsi_508.pdf",
    kind: "primary",
  },
  ea2019: {
    id: "ea2019",
    title: "Environmental Assessment (2019)",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/pdfs/environmental_assessment/I5%20Rose%20Quarter%20Environmental%20Assessment.pdf",
    kind: "primary",
  },
  coverAssessment: {
    id: "coverAssessment",
    title: "Independent Cover Assessment (2021)",
    org: "ZGF Architects for ODOT",
    url: "https://www.i5rosequarter.org/pdfs/independent_cover_assessment/RQ-CAP-Report.pdf",
    kind: "primary",
  },
  design20: {
    id: "design20",
    title: "20% Design Report and roll maps (2021)",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/pdfs/2021_design_update/I5RQ_20%20Percent%20Design%20Report_Executive%20Summary_Final_03102021.pdf",
    kind: "primary",
  },
  flyoverFs: {
    id: "flyoverFs",
    title: "Flyover design fact sheet",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/rhabaxpx/i5rq_flyover-design_factsheet_v22_remediated.pdf",
    kind: "primary",
  },
  widthFs: {
    id: "widthFs",
    title: "Highway width fact sheet",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/vjjdgpnu/i5rq_highway-widening_factsheet_remediated.pdf",
    kind: "primary",
  },
  compatibility2025: {
    id: "compatibility2025",
    title: "Findings of Compatibility, executed August 2025",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/ua1jvsfw/fully-executed_rq-sac_8825_remediated.pdf",
    kind: "primary",
  },
  otcLetter2025: {
    id: "otcLetter2025",
    title: "Project update to the Oregon Transportation Commission, July 2025",
    org: "ODOT",
    url: "https://www.oregon.gov/odot/Get-Involved/OTCSupportMaterials/Agenda_F_I-5_Rose_Quarter_Improvement_Project_Update.Ltr.pdf",
    kind: "primary",
  },
  mpqr2026: {
    id: "mpqr2026",
    title: "Major Projects Quarterly Report, Q1 2026",
    org: "ODOT",
    url: "https://www.oregon.gov/odot/Get-Involved/CIAC/MPQR_Q1-2026.pdf",
    kind: "primary",
  },
  blazersObject: {
    id: "blazersObject",
    title: "The Trail Blazers organization hates ODOT's proposed changes at the Rose Quarter",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/2023/01/11/the-trail-blazers-organization-hates-odots-proposed-changes-to-i-5-at-the-rose-quarter/",
    kind: "news",
  },
  compPlanSuit: {
    id: "compPlanSuit",
    title: "New lawsuit says the expansion runs afoul of city and regional plans",
    org: "BikePortland",
    url: "https://bikeportland.org/2024/05/15/new-lawsuit-says-i-5-rose-quarter-freeway-expansion-runs-afoul-of-city-regional-plans-386379",
    kind: "news",
  },
  nepaSuit: {
    id: "nepaSuit",
    title: "Freeway opponents file federal lawsuit over the Rose Quarter",
    org: "OPB",
    url: "https://www.opb.org/article/2024/08/09/freeway-opponents-lawsuit-portland-highway-widening/",
    kind: "news",
  },
  withdrawn2025: {
    id: "withdrawn2025",
    title: "Lawyer claims groundbreaking would be illegal after ODOT withdraws its findings",
    org: "BikePortland",
    url: "https://bikeportland.org/2025/08/06/lawyer-claims-groundbreaking-for-i-5-rose-quarter-project-would-be-illegal-395769",
    kind: "news",
  },
  avtRescue: {
    id: "avtRescue",
    title: "Albina Vision Trust rescues the Rose Quarter project, again",
    org: "BikePortland",
    url: "https://bikeportland.org/2025/12/11/albina-vision-trust-rescues-i-5-rose-quarter-project-again-398585",
    kind: "news",
  },
  otcDec2025: {
    id: "otcDec2025",
    title: "Commission keeps the Rose Quarter project going despite a funding gap",
    org: "OPB",
    url: "https://www.opb.org/article/2025/12/11/rose-quarter-project-oregon-transportation-commission-portland/",
    kind: "news",
  },
  credibility: {
    id: "credibility",
    title: "ODOT criticized for a credibility problem as the price tag tops $2B",
    org: "OPB",
    url: "https://www.opb.org/article/2025/05/09/odot-criticized-for-credibility-problem-as-rose-quarter-projects-price-tag-expected-to-top-2b/",
    kind: "news",
  },
  otcAug2026: {
    id: "otcAug2026",
    title: "August 2026 Oregon Transportation Commission support materials",
    org: "Oregon Transportation Commission",
    url: "https://www.oregon.gov/odot/Get-Involved/Pages/August-OTC-Support-Materials.aspx",
    kind: "primary",
  },
  draftCost2026: {
    id: "draftCost2026",
    title: "Price tag jumps past $3B as the funding gap balloons, records show",
    org: "The Oregonian / OregonLive, via State Library of Oregon",
    url: "https://statelibraryeclips.wordpress.com/2026/08/05/price-tag-of-portlands-rose-quarter-road-project-jumps-past-3b-as-funding-gap-balloons-records-show/",
    kind: "news",
  },
  grantAward: {
    id: "grantAward",
    title: "The project receives $450 million in federal grant funding",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/news/the-i-5-rose-quarter-improvement-project-receives-450-million-in-federal-grant-funding/",
    kind: "primary",
  },
  grantRescinded: {
    id: "grantRescinded",
    title: "Rose Quarter project's $450 million in federal grants eliminated",
    org: "KOIN",
    url: "https://www.koin.com/news/oregon/rose-quarter-improvement-projects-450-million-in-federal-grants-eliminated-odot-says/",
    kind: "news",
  },
  kotekTolling: {
    id: "kotekTolling",
    title: "Kotek tells ODOT to scrap regional tolling plans",
    org: "BikePortland",
    url: "https://bikeportland.org/2024/03/11/kotek-tells-odot-scrap-regional-tolling-plans-384685",
    kind: "news",
  },
  emanuel: {
    id: "emanuel",
    title: "New report details the impact on Black Portlanders displaced by Emanuel Hospital expansion",
    org: "Portland Mercury",
    url: "https://www.portlandmercury.com/news/2022/01/31/38162347/new-report-details-impact-of-black-portlanders-displaced-by-emanuel-hospital-expansion",
    kind: "news",
  },
  albinaHistory: {
    id: "albinaHistory",
    title: "How ODOT destroyed Albina",
    org: "City Observatory",
    url: "https://cityobservatory.org/how-odot-destroyed-albina-the-untold-story/",
    kind: "analysis",
  },
  urbanRenewal: {
    id: "urbanRenewal",
    title: "Urban renewal history and the I-5 Rose Quarter project",
    org: "Fair Housing Council of Oregon",
    url: "https://fhco.org/urban-renewal-history-and-the-i-5-rose-quarter-improvement-project/",
    kind: "analysis",
  },
  albinaSettlement: {
    id: "albinaSettlement",
    title: "Portland increases the Albina settlement for displaced Black families",
    org: "KGW",
    url: "https://www.kgw.com/article/news/community/portland-city-council-increases-albina-settlement-displaced-black-families/283-c7b3fb40-e5fa-4d26-919b-4d039307aaf8",
    kind: "news",
  },
  avtPosition: {
    id: "avtPosition",
    title: "Transportation and the highway cover — published position",
    org: "Albina Vision Trust",
    url: "https://www.albinavisioninc.com/transportation",
    kind: "primary",
  },
  avtWithdrawal2020: {
    id: "avtWithdrawal2020",
    title: "Albina Vision Trust withdraws support for the I-5 Rose Quarter project",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/state/2020/06/30/racial-justice-group-albina-vision-trust-now-wont-support-i-5-rose-quarter-project/",
    kind: "news",
  },
  avtEis2019: {
    id: "avtEis2019",
    title: "Albina Vision Trust adds its voice to calls for a full environmental impact statement",
    org: "BikePortland",
    url: "https://bikeportland.org/2019/03/29/albina-vision-trust-adds-voice-to-growing-concerns-over-odots-i-5-project-with-call-for-full-eis-297794",
    kind: "news",
  },
  portlandRejoins2022: {
    id: "portlandRejoins2022",
    title: "After a two-year stoppage, Portland rejoins the project — with conditions",
    org: "BikePortland",
    url: "https://bikeportland.org/2022/06/23/after-two-year-stoppage-portland-ready-to-work-on-i-5-rose-quarter-project-357624",
    kind: "news",
  },
  avtLand: {
    id: "avtLand",
    title: "Portland councilors advance a land plan with Albina Vision Trust near the Moda Center",
    org: "OPB",
    url: "https://www.opb.org/article/2026/08/12/portland-councilors-land-plan-moda-center/",
    kind: "news",
  },
  avtProfile: {
    id: "avtProfile",
    title: "Albina Vision Trust aims to re-root Black Portlanders",
    org: "Street Roots",
    url: "https://www.streetroots.org/news-stories/2026/04/08/albina-vision-trust-aims-to-reroot-black-portlanders/",
    kind: "news",
  },
  nmf: {
    id: "nmf",
    title: "No More Freeways",
    org: "No More Freeways PDX",
    url: "https://nomorefreewayspdx.com/",
    kind: "primary",
  },
  caseAgainst: {
    id: "caseAgainst",
    title: "The case against the I-5 Rose Quarter freeway widening",
    org: "City Observatory",
    url: "https://cityobservatory.org/case_against_rose_quarter/",
    kind: "analysis",
  },
  portal: {
    id: "portal",
    title: "PORTAL — the Portland regional transportation data archive",
    org: "Portland State University",
    url: "https://new.portal.its.pdx.edu/",
    kind: "primary",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

// ── headline ────────────────────────────────────────────────────────

export const HEADLINE = {
  /** ODOT's published estimate as of August 2026. */
  costOfficialLow: 1_960_000_000,
  costOfficialHigh: 2_080_000_000,
  /** Presented to the Oregon Transportation Commission, August 2026. */
  costCurrentLow: 3_200_000_000,
  costCurrentHigh: 3_600_000_000,
  costCurrentAbout: 3_500_000_000,
  /** Spent or committed in Phases 1A and 1B. The rest is unfunded. */
  committedToDate: 400_000_000,
  costOriginal2017: 450_000_000,
  /** ODOT's project length, in miles. Critics use 1.5 for the widening itself. */
  lengthMiles: 1.8,
  vehiclesPerDay: 120_000,
  trucksPerDay: 11_700,
  freightValuePerDay: 100_000_000,
  crashRateMultiple: 3.5,
  coverAcresTotal: 7.1,
  coverAcresBuildable: 4,
  federalGrant: 450_000_000,
  federalObligated: 67_500_000,
  closureStart: "2026-09-11",
  closureWeeks: 5,
  deckLastReplaced: 1985,
  /** Homes destroyed, by wave. See ALBINA below. */
  albinaHomesI5: 300,
  albinaSettlement: 8_500_000,
} as const;

// ── how Albina was destroyed ────────────────────────────────────────

export interface Wave {
  years: string;
  what: string;
  toll: string;
  detail: string;
  sourceId: SourceId;
}

/**
 * Three waves, not one. Getting these numbers right matters more than any
 * other figure on the page: a widely repeated claim of "3,000 families
 * displaced by I-5" appears to conflate the roughly 3,000 RESIDENTS of Lower
 * Albina with families, and is not used here.
 */
export const ALBINA_WAVES: Wave[] = [
  {
    years: "1956–60",
    what: "Veterans Memorial Coliseum",
    toll: "~450 homes",
    detail:
      "The arena and its parking took the heart of a neighbourhood that held the largest concentration of Black residents in Oregon — a concentration produced by racial covenants and redlining, not by choice.",
    sourceId: "urbanRenewal",
  },
  {
    years: "1962",
    what: "I-5, the Minnesota Freeway",
    toll: "300+ homes",
    detail:
      "Demolished directly and never replaced. In 1960 Lower Albina had about 3,000 residents, roughly two-thirds of them Black. The indirect damage exceeded the direct: the freeway severed the street grid and the local economy went with it.",
    sourceId: "albinaHistory",
  },
  {
    years: "1971–73",
    what: "Emanuel Hospital urban renewal",
    toll: "171 households",
    detail:
      "About three-quarters Black, a third of them homeowners, taken by eminent domain across 55 acres. The federal money never arrived — but the demolition went ahead anyway, and the land sat vacant for decades.",
    sourceId: "emanuel",
  },
];

// ── the design, and how it changed ──────────────────────────────────

export interface DesignEra {
  year: string;
  label: string;
  cost: string;
  flint: string;
  covers: string;
  ramps: string;
  note: string;
}

export const DESIGN_ERAS: DesignEra[] = [
  {
    year: "2012",
    label: "The original concept",
    cost: "$300–400M",
    flint: "Flint Avenue bridge demolished",
    covers: "Two or three separate lids",
    ramps: "Entrance ramp moved to Weidler",
    note: "Adopted into the N/NE Quadrant Plan. One planning commissioner voted no.",
  },
  {
    year: "2017",
    label: "Into the Transportation System Plan",
    cost: "$450M",
    flint: "Still demolished; replaced by a steep Hancock–Dixon bike bridge",
    covers: "Two lids",
    ramps: "As 2012",
    note: "A motion to strike the project failed 6–4. No More Freeways formed that August.",
  },
  {
    year: "2022–24",
    label: "Hybrid 3, after the cover assessment",
    cost: "$1.9B → $2.1B",
    flint: "Flint restored as a neighbourhood street on the cover",
    covers: "One continuous buildable cover, ~7 acres",
    ramps: "Southbound off-ramp moved south to Wheeler, plus a new flyover to Weidler",
    note: "Redesign followed the community trust's 2020 walkout and its two public demands: make amends, and make the covers buildable. The flyover came later, after the Blazers objected.",
  },
];

// ── cost history ────────────────────────────────────────────────────

export interface CostPoint {
  date: string;
  value: number;
  label: string;
  sourceId: SourceId;
  draft?: boolean;
}

export const COST_HISTORY: CostPoint[] = [
  { date: "2012", value: 350_000_000, label: "Original concept", sourceId: "odotProject" },
  { date: "2017", value: 450_000_000, label: "Authorised in HB 2017", sourceId: "odotProject" },
  { date: "Dec 2019", value: 795_000_000, label: "Cost-to-complete review", sourceId: "credibility" },
  { date: "Sept 2021", value: 1_450_000_000, label: "Hybrid 3 adopted, with the buildable cover", sourceId: "otcDec2025" },
  { date: "May 2024", value: 1_900_000_000, label: "At the time of the lawsuits", sourceId: "compPlanSuit" },
  { date: "May 2025", value: 2_080_000_000, label: "Risk-based re-estimate", sourceId: "credibility" },
  { date: "Aug 2026", value: 3_500_000_000, label: "Presented to the Transportation Commission", sourceId: "otcAug2026" },
];

// ── the legal fight ─────────────────────────────────────────────────

export interface LegalCase {
  id: string;
  court: string;
  filed: string;
  plaintiffs: string;
  claim: string;
  ifTheyWin: string;
  status: string;
  statusIsUncertain?: boolean;
  sourceId: SourceId;
}

export const CASES: LegalCase[] = [
  {
    id: "compplan",
    court: "Multnomah County Circuit Court",
    filed: "May 2024",
    plaintiffs:
      "No More Freeways, Neighbors for Clean Air, Oregon & SW Washington Families for Safe Streets, BikeLoud PDX, Eliot Neighborhood Association",
    claim:
      "The project is incompatible with Portland's Comprehensive Plan and Metro's Regional Transportation Plan. The Central City Plan requires congestion-pricing analysis before I-5 is expanded; the regional plan requires showing that demand management cannot solve the problem first. Petitioners say ODOT produced neither. They also argue the ramps have moved so far from what Council adopted in 2012 that the plan must be amended before this can be built.",
    ifTheyWin:
      "ODOT must either conform the project to the plan or get the City to amend the plan to describe what is actually being built — which would force a City Council vote the project has so far avoided.",
    status:
      "ODOT withdrew its finding of compatibility 11 days before the July 2025 trial, then let the 30-day window to refile lapse, and re-executed findings that August. The trial was reset to January 2026. We could not verify what has happened since.",
    statusIsUncertain: true,
    sourceId: "withdrawn2025",
  },
  {
    id: "nepa",
    court: "U.S. District Court, District of Oregon",
    filed: "August 2024",
    plaintiffs: "The same coalition, plus the Association of Oregon Rail Transit Advocates",
    claim:
      "The March 2024 Finding of No Significant Impact is unlawful. A project of this size significantly affects the human environment, so NEPA requires a full Environmental Impact Statement. The specific defects alleged are outdated traffic modelling, inadequate climate and air analysis, and a failure to study alternatives — including the congestion pricing ODOT's own consultant found would work better.",
    ifTheyWin:
      "The federal approval is vacated and the project returns to environmental review. That happened once already: the FHWA rescinded an earlier finding in January 2022 rather than litigate, costing about two years.",
    status: "Was heading to merits briefing in late 2025. No ruling found as of August 2026.",
    statusIsUncertain: true,
    sourceId: "nepaSuit",
  },
];

/**
 * A pattern worth naming: opponents have never won a merits ruling. They have
 * won by forcing withdrawals — the 2022 FONSI rescission, and compatibility
 * findings withdrawn in 2022 and again in 2025. Delay is the strategy, and on
 * a project whose cost compounds, delay is also the most effective weapon.
 */
export const LEGAL_PATTERN =
  "Three withdrawals, no merits ruling. Every apparent legal victory here has come from ODOT pulling a document rather than a judge striking one down.";

// ── what happens next ───────────────────────────────────────────────

export interface NextEvent {
  when: string;
  what: string;
  why: string;
}

export const WHATS_NEXT: NextEvent[] = [
  {
    when: "Sept 11 – mid-Oct 2026",
    what: "Southbound I-5 closes for up to five weeks",
    why: "The natural experiment. Traffic goes to I-405 and I-205 — close to what removal advocates propose permanently.",
  },
  {
    when: "Late 2026",
    what: "Phase 1A finishes",
    why: "Stormwater and seismic work. No new through capacity, and nothing that commits the state to the widening.",
  },
  {
    when: "2027",
    what: "$167.5M of Phase 1B construction",
    why: "The first money that starts building the contested configuration. Stakeholders reached alignment on the scope in March 2026.",
  },
  {
    when: "2027 session",
    what: "The Legislature decides the project's fate",
    why: "About $400M is spent or committed; the remaining ~$3B is unfunded. The covers' federal grant — the largest its program ever made — was rescinded, and restoring it would take a different federal administration. The state decides whether to carry the project until that question is answered.",
  },
  {
    when: "Ripe for decision",
    what: "A ruling in the comprehensive-plan case (Multnomah County Circuit Court, No. 24CV23141)",
    why: "The parties have filed their written closing arguments, so the case awaits the judge. A ruling for the plaintiffs could force a City Council vote on whether the project conforms to the city's plans. Flagged to the Lab by a reader on August 18, 2026; the docket is the source of record.",
  },
  {
    when: "Unscheduled",
    what: "A ruling in the NEPA case",
    why: "The federal case could send the project back to environmental review.",
  },
];
