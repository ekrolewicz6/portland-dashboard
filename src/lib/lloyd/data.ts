/**
 * Lloyd Center deep-dive data.
 *
 * Every figure here is sourced. The load-bearing facts were pulled from primary
 * documents in June 2026 — the City's Final Findings (land-use case
 * LU 25-091308), Prosper Portland's TIF page, the ZGF master plan, and the two
 * campaign sites, and cross-checked against local reporting. Where a figure is
 * a modeled ceiling or an estimate, it is labeled as such.
 *
 * This story is LIVE: the City Council appeal was pending as of late June 2026
 * (decision due Dec 22, 2026) and the mall closes Aug 8, 2026. Re-verify the
 * time-sensitive figures before relying on them.
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "news" | "campaign" | "analysis";
}

export const SOURCES: Record<string, Source> = {
  finalFindings: {
    id: "finalFindings",
    title: "Notice of Land Use Final Findings & Decision (LU 25-091308 CCMS AD)",
    org: "City of Portland Permitting & Development",
    url: "https://www.portland.gov/ppd/zoning-land-use/documents/notice-land-use-final-findings-and-decision-lu-25-091308-ccms-ad/download",
    kind: "primary",
  },
  tifDistrict: {
    id: "tifDistrict",
    title: "Lloyd-Holladay Tax Increment Finance District",
    org: "Prosper Portland",
    url: "https://prosperportland.us/our-work/lloyd-holladay-tif-district/",
    kind: "primary",
  },
  zgfPlan: {
    id: "zgfPlan",
    title: "Urban Renaissance Group — Lloyd Center Redevelopment (master plan)",
    org: "ZGF Architects",
    url: "https://www.zgf.com/work/6670-urban-renaissance-group-lloyd-center-redevelopment",
    kind: "primary",
  },
  urgClosing: {
    id: "urgClosing",
    title: "Lloyd Center Announces Official Closing Date",
    org: "Urban Renaissance Group",
    url: "https://www.urbanrengroup.com/lloyd-center-announces-official-closing-date/",
    kind: "primary",
  },
  centralCity2035: {
    id: "centralCity2035",
    title: "Central City 2035 Plan",
    org: "City of Portland",
    url: "https://www.portland.gov/bps/planning/central-city-2035",
    kind: "primary",
  },
  housingNeed: {
    id: "housingNeed",
    title: "What the city is doing to address Portland's housing shortage",
    org: "City of Portland",
    url: "https://www.portland.gov/community-economic-dev/news/2025/4/22/what-has-city-been-doing-address-portlands-housing-shortage",
    kind: "primary",
  },
  oregonPermits: {
    id: "oregonPermits",
    title: "Oregon Issues Building Permits for Multifamily Units at the Slowest Pace in 12 Years",
    org: "Willamette Week / Oregon Journalism Project",
    url: "https://www.wweek.com/news/state/2026/02/28/amid-a-housing-crisis-oregon-issues-building-permits-for-multifamily-units-at-the-slowest-pace-in-12-years/",
    kind: "news",
  },
  mallStats: {
    id: "mallStats",
    title: "Mall Closure Statistics",
    org: "Capital One Shopping Research",
    url: "https://capitaloneshopping.com/research/mall-closure-statistics/",
    kind: "analysis",
  },
  opbApproval: {
    id: "opbApproval",
    title: "Portland approves Lloyd Center master plan; ice rink's fate unresolved",
    org: "OPB",
    url: "https://www.opb.org/article/2026/03/06/portland-lloyd-center-demolish-ice-rink/",
    kind: "news",
  },
  mercuryApproval: {
    id: "mercuryApproval",
    title: "Design Commission Accepts Master Plan for the Lloyd Center Mall",
    org: "Portland Mercury",
    url: "https://www.portlandmercury.com/culture/2026/03/06/48361784/update-portland-design-commission-accepts-master-plan-for-the-lloyd-center-mall",
    kind: "news",
  },
  wwMasterPlan: {
    id: "wwMasterPlan",
    title: "Owners of Lloyd Center Unveil Master Plan That Restores Street Grid and Adds Housing",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/business/2023/09/21/owners-of-lloyd-center-unveil-master-plan-for-mall-that-restores-street-grid-and-adds-housing/",
    kind: "news",
  },
  katuAppeals: {
    id: "katuAppeals",
    title: "Save Lloyd appeals cite 10,000+ signatures as fight heads to Council",
    org: "KATU",
    url: "https://katu.com/news/local/save-lloyd-appeals-cite-10000-plus-signatures-as-fight-over-mall-remake-heads-to-council",
    kind: "news",
  },
  courthouseHearing: {
    id: "courthouseHearing",
    title: "Supporters Pack Portland City Hall to Fight Lloyd Center Redevelopment Plan",
    org: "Courthouse News",
    url: "https://www.courthousenews.com/supporters-pack-portland-city-hall-to-fight-lloyd-center-redevelopment-plan/",
    kind: "news",
  },
  malinin: {
    id: "malinin",
    title: "Olympic superstar Ilia Malinin supports effort to save Lloyd Center ice rink",
    org: "KGW",
    url: "https://www.kgw.com/article/news/local/olympic-superstar-ilia-malinin-supports-effort-save-lloyd-center-ice-rink/283-14158416-61cc-45b4-872b-dee2d275a4ef",
    kind: "news",
  },
  saveLloyd: {
    id: "saveLloyd",
    title: "Save Lloyd Campaign (alternative plan)",
    org: "savelloyd.com",
    url: "https://www.savelloyd.com/alternative-plan",
    kind: "campaign",
  },
  saveLloydIce: {
    id: "saveLloydIce",
    title: "Save Lloyd Ice Coalition",
    org: "savelloydicerink.com",
    url: "https://savelloydicerink.com/",
    kind: "campaign",
  },
  dontSaveLloyd: {
    id: "dontSaveLloyd",
    title: "Don't Save Lloyd (pro-redevelopment campaign)",
    org: "dontsavelloyd.com",
    url: "https://dontsavelloyd.com/",
    kind: "campaign",
  },
};

// ── Headline figures (verified) ───────────────────────────────────

export const HEADLINE = {
  /** Year the mall opened. */
  openedYear: 1960,
  /** Date the mall closes to the public. */
  closeDate: "August 8, 2026",
  /** Approximate vacancy as of spring 2026. */
  vacancyPct: 0.9,
  /** Regulated master-plan site (the figure in the land-use case). */
  siteAcres: 27.1,
  /** Wider study/redevelopment area used in the developer's marketing. */
  siteAcresStudy: 29.3,
  /** Development areas the plan divides the site into. */
  developmentAreas: 14,
  /** Gross square feet of allowed development (millions). */
  grossSfMillions: 7.0,
  /** Maximum building height envelope, feet. */
  heightMaxFt: 225,
  /** Publicly accessible open space, acres. */
  openSpaceAcres: 6.18,
  /** Modeled residential units (used for traffic analysis — a ceiling, NOT a commitment). */
  unitsModeled: 5141,
  /** Modeled retail / entertainment square footage. */
  retailSf: 456_640,
  entertainmentSf: 70_000,
  /** Affordable units required by the master-plan approval. */
  affordableRequired: 0,
  /** Lloyd-Holladay TIF maximum indebtedness over ~30 years. */
  tifMaxIndebtedness: 290_000_000,
  tifEconPct: 0.55,
  tifHousingPct: 0.45,
  /** TIF increment (new tax revenue) generated for the coming fiscal year. */
  tifIncrementNow: 0,
  /** Petition signatures. */
  petitionMall: 10_188,
  petitionRink: 5_467,
  /** City Council deadline to rule on the appeal. */
  councilDeadline: "December 22, 2026",
  /** Portland multifamily units permitted, by year. */
  permits2019Peak: 10_500,
  permits2024: 954,
  permits2025: 495,
  /** Homes Portland must plan for over 20 years. */
  housingNeed20yr: 120_560,
  /** Enclosed U.S. malls now, and the projection for 2028. */
  mallsNow: 1_200,
  malls2028: 900,
  /** Ownership / financing. */
  loanOrigination: 177_000_000, // KKR → Cypress Equities, 2015
  loanBalanceForeclosure: 110_000_000, // outstanding at 2021 foreclosure
} as const;

// ── The mall's decline: anchor losses ─────────────────────────────

export const ANCHOR_LOSSES: { store: string; year: number }[] = [
  { store: "Nordstrom", year: 2015 },
  { store: "Sears", year: 2018 },
  { store: "Marshalls", year: 2019 },
  { store: "Macy's", year: 2021 },
];

// ── What the master-plan approval actually guarantees ─────────────
// The signature honest-broker fact: the fight is over things the approval does
// NOT lock in. Source: Final Findings LU 25-091308.

export type GuaranteeLevel = "required" | "flexible" | "not-required";

export const GUARANTEES: {
  item: string;
  detail: string;
  level: GuaranteeLevel;
}[] = [
  {
    item: "Up to ~5,141 homes",
    detail:
      "A modeling ceiling used for traffic analysis — not a floor. The designers deliberately left the program unspecified to stay adaptable to the market.",
    level: "flexible",
  },
  {
    item: "Any affordable homes",
    detail:
      "Zero are required by this approval. Affordability could only attach later, building by building, through separate city programs.",
    level: "not-required",
  },
  {
    item: "A year-round ice rink",
    detail:
      "City staff found “there are not specific approval criteria that require a new rink or preservation of the existing rink.” The plan can support one; it requires none.",
    level: "not-required",
  },
  {
    item: "6.18 acres of public open space",
    detail:
      "Conditioned through the infrastructure framework, including a new park and plazas.",
    level: "required",
  },
  {
    item: "A restored street grid",
    detail:
      "New public streets and rights-of-way that break the 1960s superblock are conditions of approval.",
    level: "required",
  },
];

// ── Where the two sides actually stand ────────────────────────────

export const AGREEMENTS: string[] = [
  "The enclosed mall is finished — it isn't coming back",
  "The site should hold thousands of new homes",
  "Replace the superblock with a walkable, mixed-use neighborhood",
];

export const FAULT_LINES: { issue: string; save: string; redevelop: string }[] = [
  {
    issue: "The building",
    save: "Adaptively reuse the part still in active use; don't demolish a working asset on a promise.",
    redevelop: "Demolish the obsolete mall and build fresh across 14 parcels.",
  },
  {
    issue: "The ice rink",
    save: "Guarantee a permanent, year-round rink before any demolition.",
    redevelop: "Maybe a seasonal rink, and only if a third party chooses to build it.",
  },
  {
    issue: "Timing & risk",
    save: "Prove the financing and buyers exist before tearing it down and leaving a hole.",
    redevelop: "Build momentum now; the market will follow once the site is cleared.",
  },
  {
    issue: "What's locked in",
    save: "Bind community benefits — affordability, public space, the rink — into the approval.",
    redevelop: "Keep the framework flexible; commitments come later, parcel by parcel.",
  },
];

// ── Who's who ─────────────────────────────────────────────────────

export const PLAYERS: { name: string; role: string; side: "preserve" | "redevelop" | "decide" }[] = [
  { name: "Save Lloyd Campaign", role: "Matt Henderson + NE Coalition of Neighborhoods — adaptive reuse & public space", side: "preserve" },
  { name: "Save Lloyd Ice Coalition", role: "Jenny Gilmore-Robinson, atty. Jeffrey Kleinman — the year-round ice rink", side: "preserve" },
  { name: "Don't Save Lloyd", role: "An anonymous pro-housing (YIMBY) campaign rallying support for the plan", side: "redevelop" },
  { name: "Urban Renaissance Group + KKR", role: "Owner-developer (Tom Kilbane) behind the master plan", side: "redevelop" },
  { name: "Lloyd Community Assn. / EcoDistrict", role: "Standing neighborhood & business groups that back redevelopment", side: "redevelop" },
  { name: "Portland City Council", role: "Hearing the appeal; must rule by Dec. 22, 2026", side: "decide" },
];

// ── The decision path ─────────────────────────────────────────────

export const TIMELINE: { date: string; label: string; status: "past" | "now" | "future" }[] = [
  { date: "Dec 2021", label: "URG & KKR take over the mall after a foreclosure", status: "past" },
  { date: "Sep 2023", label: "Master plan unveiled — demolish, then build a neighborhood", status: "past" },
  { date: "Oct 2024", label: "Council approves the $290M Lloyd-Holladay TIF district", status: "past" },
  { date: "Mar 5, 2026", label: "Design Commission unanimously approves the master plan", status: "past" },
  { date: "Jun 24, 2026", label: "City Council hears the two appeals — 150+ testify, no decision", status: "now" },
  { date: "Aug 8, 2026", label: "Mall closes to the public (proceeds regardless of the appeal)", status: "future" },
  { date: "by Dec 22, 2026", label: "Council's legal deadline to rule on the appeal", status: "future" },
];

// ── Buildout reality: the promise vs. the market ──────────────────
// Portland's entire multifamily output has collapsed; Lloyd's promise is a
// multiple of it. Source: WW / Oregon Journalism Project.

export const BUILD_PACE: { label: string; units: number; tone: "promise" | "peak" | "now" }[] = [
  { label: "Lloyd's promise (over a decade+)", units: HEADLINE.unitsModeled, tone: "promise" },
  { label: "All of Portland, 2019 peak (one year)", units: HEADLINE.permits2019Peak, tone: "peak" },
  { label: "All of Portland, 2024 (one year)", units: HEADLINE.permits2024, tone: "now" },
  { label: "All of Portland, 2025 (one year)", units: HEADLINE.permits2025, tone: "now" },
];
