/**
 * The PPS budget deep dive — data layer.
 *
 * House rule (venue-dive convention): every load-bearing number lives in
 * HEADLINE or a typed const below, with its corpus citation (docId p.N) in a
 * comment. The corpus is research/pps-budget/ (120 checksummed documents);
 * the two published analyses this page renders are document.md ("Where the
 * Next Dollar Goes") and recommendations.md ("The Movable Dollar Plan"),
 * both adversarially fact-checked before publication. Judgments cite
 * pclAnalysis. Figures that exist only in press reporting are flagged
 * `press: true` wherever they appear.
 */

export interface Source {
  title: string;
  org: string;
  url: string;
  kind: "primary" | "analysis" | "news" | "statute";
  year?: string;
}

const RM = "https://www.pps.net/fs/resource-manager/view";

export const SOURCES = {
  budgetFy27Vol1: {
    title: "FY2026-27 Adopted Budget, Volume 1",
    org: "Portland Public Schools",
    url: `${RM}/0defe213-e66e-4416-adaf-97add47ed00f`,
    kind: "primary",
    year: "2026",
  },
  budgetFy26Vol1: {
    title: "FY2025-26 Adopted Budget, Volume 1",
    org: "Portland Public Schools",
    url: `${RM}/a4e960fb-e321-4297-bd2e-587394969d50`,
    kind: "primary",
    year: "2025",
  },
  suptMessageFy27: {
    title: "Superintendent's FY2026-27 Proposed Budget Message",
    org: "Portland Public Schools",
    url: `${RM}/51380314-e6ee-4177-a0e8-b8d5e17964ee`,
    kind: "primary",
    year: "2026",
  },
  acfrFy2025: {
    title: "Annual Comprehensive Financial Report, FY2025",
    org: "Portland Public Schools (audited)",
    url: `${RM}/341b8773-a285-4c2b-ba40-103391aed82b`,
    kind: "primary",
    year: "2026",
  },
  acfrFy2020: {
    title: "Annual Comprehensive Financial Report, FY2020",
    org: "Portland Public Schools (audited)",
    url: `${RM}/d4be7e6c-02b4-448e-97c1-c04f7b73c12f`,
    kind: "primary",
    year: "2020",
  },
  tsccFy26: {
    title: "Budget Review 2025-26: Portland Public Schools",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/Portland-Public-School-District-FY-26-Budget-Review.pdf",
    kind: "primary",
    year: "2025",
  },
  tsccFy25: {
    title: "Budget Review 2024-25: Portland Public Schools",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/PPS-A-FY25-Budget-Review.pdf",
    kind: "primary",
    year: "2024",
  },
  tsccFy24: {
    title: "Budget Review 2023-24: Portland Public Schools",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/FY24-Portland-Public-Schools-Budget-Review.pdf",
    kind: "primary",
    year: "2023",
  },
  tsccAnnual2425: {
    title: "TSCC Annual Report 2024-25, General Information",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/2024-25-General-Information-Section-Annual-Report.pdf",
    kind: "primary",
    year: "2025",
  },
  tsccBond2025: {
    title: "Tax Measure Review: Measure 26-259 (2025 bond)",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/PPS-Bond-Levy-Review-May-2025.pdf",
    kind: "primary",
    year: "2025",
  },
  cbrcFy27: {
    title: "CBRC Annual Budget Review, FY2026-27",
    org: "PPS Community Budget Review Committee",
    url: `${RM}/206a8db4-5c9e-45e8-95d4-4b58c73377ad`,
    kind: "primary",
    year: "2026",
  },
  cbrcFy26: {
    title: "CBRC Annual Budget Review, FY2025-26",
    org: "PPS Community Budget Review Committee",
    url: `${RM}/23241aa1-3847-4834-8acf-272cd4e67d41`,
    kind: "primary",
    year: "2025",
  },
  cbrcFy25: {
    title: "CBRC Annual Budget Review, FY2024-25",
    org: "PPS Community Budget Review Committee",
    url: `${RM}/5781c947-8fba-4045-977c-450cf0b4736d`,
    kind: "primary",
    year: "2024",
  },
  cbrcFy24: {
    title: "CBRC Annual Budget Review, FY2023-24",
    org: "PPS Community Budget Review Committee",
    url: `${RM}/35dfd5e7-5661-4385-a132-8a3a55bec4c9`,
    kind: "primary",
    year: "2023",
  },
  cbrcLevy2025: {
    title: "CBRC Local Option Levy Review, FY2024-25",
    org: "PPS Community Budget Review Committee",
    url: `${RM}/7531ee3f-8d6a-4ed1-a100-73d66d519d61`,
    kind: "primary",
    year: "2025",
  },
  bondAuditY6: {
    title: "Bond Performance Audit, Year 6 (FY2023-24)",
    org: "Sjoberg Evashenk Consulting",
    url: `${RM}/360be54d-7d9e-4919-9bbc-50a519481c2c`,
    kind: "primary",
    year: "2025",
  },
  bondAuditY4: {
    title: "Bond Performance Audit, Year 4 (FY2021-22)",
    org: "Sjoberg Evashenk Consulting",
    url: `${RM}/69866af5-9563-4541-ba81-e11df7a40587`,
    kind: "primary",
    year: "2023",
  },
  bondAuditY1P1: {
    title: "Bond Performance Audit, Year 1 Phase 1",
    org: "Sjoberg Evashenk Consulting",
    url: `${RM}/3bed472c-29a8-4aa8-a084-283f16a34610`,
    kind: "primary",
    year: "2019",
  },
  sosAudit2019: {
    title: "Audit 2019-01: ODE and PPS spending and oversight",
    org: "Oregon Secretary of State",
    url: `${RM}/f1b59ce8-400f-4784-aabb-812676ac0ab3`,
    kind: "primary",
    year: "2019",
  },
  sosFollowUp: {
    title: "2019 audit recommendation follow-up report",
    org: "Oregon Secretary of State",
    url: `${RM}/afc593a0-112e-442a-815e-751a32b8197c`,
    kind: "primary",
    year: "2022",
  },
  financeInterim: {
    title: "Quarterly and period financial reports (FY2023-24 to present)",
    org: "Portland Public Schools",
    url: "https://www.pps.net/departments/finance/finance",
    kind: "primary",
    year: "2026",
  },
  fy25AuditMemo: {
    title: "FY2025 audit communications (findings memo)",
    org: "Talbot, Korvola & Warwick / PPS",
    url: `${RM}/11756a72-66a0-4faa-a425-2cc1bbc8bc65`,
    kind: "primary",
    year: "2026",
  },
  patCba: {
    title: "PAT Collective Bargaining Agreement 2023-2026",
    org: "PPS / Portland Association of Teachers",
    url: `${RM}/70c9aeed-2057-4603-bbef-d0f72360dbee`,
    kind: "primary",
    year: "2024",
  },
  lro524: {
    title: "Research Report 5-24: K-12 School Funding Equalization",
    org: "Oregon Legislative Revenue Office",
    url: "https://www.oregonlegislature.gov/lro/Documents/K-12%20and%20ESD%20Finance%20RR%20August%2024%20Final.pdf",
    kind: "primary",
    year: "2024",
  },
  ors294423: {
    title: "ORS 294.423: governing body as budget committee",
    org: "Oregon Revised Statutes",
    url: "https://oregon.public.law/statutes/ors_294.423",
    kind: "statute",
  },
  ors294414: {
    title: "ORS 294.414: budget committee composition",
    org: "Oregon Revised Statutes",
    url: "https://oregon.public.law/statutes/ors_294.414",
    kind: "statute",
  },
  ors327011: {
    title: "ORS 327.011: local revenues offset",
    org: "Oregon Revised Statutes",
    url: "https://oregon.public.law/statutes/ors_327.011",
    kind: "statute",
  },
  opbAdoption: {
    title: "PPS board passes $2.77B budget with painful layoffs",
    org: "OPB",
    url: "https://www.opb.org/article/2026/06/25/portland-public-schools-budget-painful-layoffs/",
    kind: "news",
    year: "2026",
  },
  opbStrikeFaq: {
    title: "What Portland teachers got from the strike",
    org: "OPB",
    url: "https://www.opb.org/article/2023/11/29/portland-teachers-get-from-strike-faq/",
    kind: "news",
    year: "2023",
  },
  academicJourney: {
    title: "Our Academic Journey (district outcomes dashboard)",
    org: "Portland Public Schools",
    url: "https://www.pps.net/departments/dataaccountability/data-and-accountability/data-strategy-and-insights/our-academic-journey",
    kind: "primary",
    year: "2026",
  },
  wwTwentySchools: {
    title: "Superintendent says district could close up to 20 schools",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/schools/2026/08/26/pps-superintendent-says-district-could-close-up-to-20-schools/",
    kind: "news",
    year: "2026",
  },
  researchDoc: {
    title: "Where the Next Dollar Goes (full research document)",
    org: "Portland Civic Lab",
    url: "https://github.com/ekrolewicz6/portland-civic-lab/blob/main/research/pps-budget/document.md",
    kind: "analysis",
    year: "2026",
  },
  planDoc: {
    title: "The Movable Dollar Plan (full recommendations)",
    org: "Portland Civic Lab",
    url: "https://github.com/ekrolewicz6/portland-civic-lab/blob/main/research/pps-budget/recommendations.md",
    kind: "analysis",
    year: "2026",
  },
  pclAnalysis: {
    title: "Portland Civic Lab analysis (methods and corpus)",
    org: "Portland Civic Lab",
    url: "https://github.com/ekrolewicz6/portland-civic-lab/tree/main/research/pps-budget",
    kind: "analysis",
    year: "2026",
  },
  odeFallMembership2526: {
    title: "Fall Membership Report 2025-26, school level",
    org: "Oregon Department of Education",
    url: "https://www.oregon.gov/ode/reports-and-data/students/pages/student-enrollment-reports.aspx",
    kind: "primary",
    year: "2026",
  },
  lrfp2021: {
    title: "Long-Range Facility Plan 2021, Volume 1 (functional capacity)",
    org: "Portland Public Schools",
    url: "https://www.pps.net/fs/resource-manager/view/84245cbd-4298-4803-8ba9-d26fb13a9c7a",
    kind: "primary",
    year: "2021",
  },
  holmesSeismic2024: {
    title: "2024 PPS Seismic Assessments, All Schools (ROM cost estimates)",
    org: "Holmes, for Portland Public Schools",
    url: "https://www.pps.net/departments/rise/pps-maps-and-facility-data/seismic-assessments",
    kind: "primary",
    year: "2024",
  },
  wwLowest15: {
    title: "What PPS will consider as it selects schools to close",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/schools/2026/03/18/heres-what-pps-will-consider-as-it-selects-schools-to-close/",
    kind: "news",
    year: "2026",
  },
  ppsdataInfo: {
    title: "PPS Data Explorer: school-level enrollment, capacity, and seismic data",
    org: "ppsdata.info (Alex Meub, open source)",
    url: "https://ppsdata.info",
    kind: "analysis",
    year: "2026",
  },
  turnerCostIndex: {
    title: "Turner Building Cost Index, 2020-2023",
    org: "Turner Construction",
    url: "https://www.turnerconstruction.com/cost-index",
    kind: "primary",
    year: "2023",
  },
  megaprojectBaseRates: {
    title: "Cost overrun base rates in large public projects (Flyvbjerg et al.)",
    org: "University of Oxford / arXiv",
    url: "https://arxiv.org/pdf/1307.2176",
    kind: "analysis",
    year: "2013",
  },
  opbBondTrim: {
    title: "PPS lowered its 2017 bond cost estimate before the ballot",
    org: "Oregon Public Broadcasting",
    url: "https://www.opb.org/news/article/portland-public-schools-bond-lowered/",
    kind: "news",
    year: "2019",
  },
  persOverview: {
    title: "PERS: system overview and employer rate information",
    org: "Oregon Public Employees Retirement System",
    url: "https://www.oregon.gov/pers/Pages/index.aspx",
    kind: "primary",
    year: "2026",
  },
  qem2026: {
    title: "Quality Education Model Report, 2026",
    org: "Oregon Quality Education Commission",
    url: "https://www.oregon.gov/ode/reports-and-data/taskcomm/Documents/Quality%20Education%20Commission%20QEM%20Report%202026.pdf",
    kind: "primary",
    year: "2026",
  },
  odeNoe2324: {
    title: "Net Operating Expenditures per ADMr by district, 2023-24",
    org: "Oregon Department of Education, Fiscal Transparency",
    url: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Pages/FiscalTransparencyHome.aspx",
    kind: "primary",
    year: "2025",
  },
  censusFin2024: {
    title: "Annual Survey of School System Finances, FY2024",
    org: "U.S. Census Bureau",
    url: "https://www.census.gov/programs-surveys/school-finances.html",
    kind: "primary",
    year: "2026",
  },
  beaRpp2024: {
    title: "Regional Price Parities by metro area, 2024",
    org: "U.S. Bureau of Economic Analysis",
    url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
    kind: "primary",
    year: "2025",
  },
  neaPay2025: {
    title: "Teacher salary rankings and estimates, 2024-25",
    org: "National Education Association",
    url: "https://www.nea.org/resource-library/educator-pay-and-student-spending-how-does-your-state-rank/teacher",
    kind: "analysis",
    year: "2025",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** Every prose-level load-bearing number, transcribed from the fact-checked documents. */
export const HEADLINE = {
  allFundsFy27: 2_768_590_878, // Resolution 7326 [budget-fy2026-27-vol1 p317]
  gfFy27K: 862_112, // [budget-fy2026-27-vol1 p108]
  gfFy26K: 868_580, // [budget-fy2026-27-vol1 p108]
  gfDeltaK: -6_468,
  capitalDeltaK: 738_735, // waterfall [budget-fy2026-27-vol1 p173]
  fy28GapM: 65, // "more than 65 million" [budget-fy2026-27-vol1 p11]
  compressionFy27M: 53.4, // [budget-fy2026-27-vol1 p28]
  compressionFy20M: 20.9, // [tscc-review-fy2024 p3]
  levyVotedRate: 1.99,
  levyEffectiveRate: 1.5142, // FY2024-25 [tscc-annual-report-2024-25-general p50]
  levyPositionsFy25: 744, // [cbrc-2024-25-cbrc-local-option-levy-review p1]
  levyPositionsFy20: 916, // "more than 916" [same]
  enrollmentFy26Forecast: 42_304, // TSCC series [tscc-review-fy2025 p4]
  enrollmentFy20: 49_478, // ACFR headcount [acfr-fy2020 p140]
  enrollmentDropPct: 12.2, // district's own count [budget-fy2026-27-supt-message]
  fteFy27: 5_513, // [budget-fy2026-27-vol1 p92]
  fteFy22Actual: 6_274, // [tscc-review-fy2026 p3]
  debtOutstandingK: 2_130_788, // at 6/30/26 [budget-fy2026-27-vol1 p232]
  personnelShareFy27: 78.9, // of GF, $680.5M [budget-fy2026-27-vol1 p107]
  absenteeismPct: 36, // "over 36 percent" [cbrc-2025-26 p1]
  instructionalShare: 53, // vs 61 national [cbrc-2026-27 p5]
  cbrcWorkingDays: 9, // [cbrc-2026-27 p2]
  cbseAllocatedM: 60, // zero spent through Feb 2025 [bond-audit-year-6 p21, p33-34]
  bensonBallotM: 202, // [bond-audit-year-6 p13-14]
  bensonEacM: 421.2,
  centralFteCut: 96, // FY2025-26 [budget-fy2026-27-supt-message]
  positionsCutFy27: 322, // adopted, of 336 proposed [supt message; press]
  reservesM: 41, // 5% floor [budget-fy2026-27-vol1 p36]
} as const;

/** The four ledger tags — the organizing device of both documents. */
export const LEDGER_TAGS = [
  {
    id: "locked",
    label: "Locked",
    definition:
      "Legally cannot move. Bond proceeds, bond debt service, restricted grants. Wasting it is real waste, but it was never teacher money.",
    tone: "clay",
  },
  {
    id: "committed",
    label: "Committed",
    definition:
      "Legally movable but pinned by contracts and mandates: bargaining agreements, pensions, special education obligations, the lights.",
    tone: "ember",
  },
  {
    id: "movable",
    label: "Movable",
    definition: "The slice where board choices actually bite.",
    tone: "fern",
  },
  {
    id: "unknown",
    label: "Unknown",
    definition: "The public record cannot tell.",
    tone: "sage",
  },
] as const;

/** FY26 -> FY27 adopted requirements by fund type, $K. [budget-fy2026-27-vol1 p108, p122, p157, p173, p205; budget-fy2025-26-vol1] */
export const WATERFALL = [
  { fund: "General Fund", fy26: 868_580, fy27: 862_112, tag: "movable+committed" },
  { fund: "Special Revenue", fy26: 224_805, fy27: 223_936, tag: "mostly locked" },
  { fund: "Debt Service", fy26: 272_690, fy27: 278_876, tag: "locked" },
  { fund: "Capital Projects", fy26: 643_773, fy27: 1_382_508, tag: "locked" },
  { fund: "Internal Service", fy26: 25_269, fy27: 21_159, tag: "committed" },
] as const;

/**
 * The decade spine: adopted GF, all funds, enrollment, real GF (calendar-2026
 * dollars). Transcribed from research/pps-budget/data/derived/gf_series.csv and
 * per_pupil_gf.csv; each figure cites its book in the corpus. Enrollment is
 * the ACFR October headcount series through 2024-25 (2022-23 substituted from
 * the TSCC series where the ACFR prints an apparent misprint), TSCC forecasts
 * after (a slightly different series; flagged).
 */
export const DECADE = [
  { fy: "2016-17", gfK: 592_600, allFundsK: 1_155_905, enrollment: 49_189, realGfK: 824_475, forecast: false },
  { fy: "2017-18", gfK: 617_287, allFundsK: 1_587_755, enrollment: 49_557, realGfK: 840_907, forecast: false },
  { fy: "2018-19", gfK: 655_002, allFundsK: 1_506_992, enrollment: 49_550, realGfK: 871_012, forecast: false },
  { fy: "2019-20", gfK: 691_767, allFundsK: 1_379_456, enrollment: 49_478, realGfK: 903_529, forecast: false },
  { fy: "2020-21", gfK: 729_654, allFundsK: 2_725_778, enrollment: 47_314, realGfK: 941_400, forecast: false, note: "All-funds includes a $1.0B placeholder for the not-yet-passed November 2020 bond" },
  { fy: "2021-22", gfK: 771_963, allFundsK: 2_058_410, enrollment: 45_497, realGfK: 951_295, forecast: false, note: "Real General Fund peak" },
  { fy: "2022-23", gfK: 804_062, allFundsK: 1_883_261, enrollment: 44_548, realGfK: 917_431, forecast: false },
  { fy: "2023-24", gfK: 833_774, allFundsK: 2_182_057, enrollment: 44_771, realGfK: 913_719, forecast: false },
  { fy: "2024-25", gfK: 854_394, allFundsK: 2_393_878, enrollment: 44_086, realGfK: 909_492, forecast: false },
  { fy: "2025-26", gfK: 868_580, allFundsK: 2_035_117, enrollment: 42_304, realGfK: 900_888, forecast: true },
  { fy: "2026-27", gfK: 862_112, allFundsK: 2_768_591, enrollment: 41_341, realGfK: 862_112, forecast: true, note: "First year-over-year General Fund decline in the series" },
] as const;

/** Total Measure 5 loss across all PPS tax lines, $M. Most lands on the levy (~80-88%). [tscc-review-fy2024 p3; tscc-review-fy2025 p3; tscc-annual-report-2024-25-general p50; budget-fy2026-27-vol1 p28] */
export const COMPRESSION_SERIES = [
  { fy: "2019-20", lossM: 20.9 },
  { fy: "2020-21", lossM: 23.0 },
  { fy: "2021-22", lossM: 24.8 },
  { fy: "2022-23", lossM: 25.2 },
  { fy: "2023-24", lossM: 35.7 },
  { fy: "2024-25", lossM: 42.6 },
  { fy: "2026-27", lossM: 53.4, projected: true },
] as const;

/** The teachers levy: receipts, positions, cost. [cbrc levy reviews] */
export const LEVY_SERIES = [
  { fy: "2019-20", receiptsM: 97.4, positions: 916, avgCost: 106_000 },
  { fy: "2022-23", receiptsM: 106.5, positions: 851, avgCost: 125_161, note: "Official reviews disagree for this year: 851 and 922. Neither explains why" },
  { fy: "2023-24", receiptsM: 108.8, positions: 802, avgCost: 135_739 },
  { fy: "2024-25", receiptsM: 104.6, positions: 744, avgCost: 141_000 },
  { fy: "2025-26", receiptsM: 109.2, positions: 718, avgCost: 152_000, projected: true },
] as const;

/** One-time money in, cuts out. [tscc reviews; cbrc-2026-27 p9; budget-fy2023-24-vol1] */
export const ESSER_TIMELINE = {
  esserTotalM: 115, // "almost $115 million" awarded to district and partners [budget-fy2023-24-vol1]
  cuts: [
    { fy: "2023-24", gapM: null as number | null, label: "~281 positions, patched with one-time money" },
    { fy: "2024-25", gapM: 30, label: "$15M central office, $15M schools" },
    { fy: "2025-26", gapM: 40, label: "$17M central, $23M schools; PERS reserve drained" },
    { fy: "2026-27", gapM: 56.3, label: "322 positions eliminated" },
    { fy: "2027-28", gapM: 65, label: "projected, 'more than'", projected: true },
  ],
  cliffNote:
    "ESSER money was braided into ongoing programs; the district's own citizen committee wrote in spring 2023 that the funding was 'hiding the looming shortfall ... from the general public.'", // [cbrc-2023-24 p3]
};

/** FTE by function, FY2021-22 actual to FY2025-26 adopted. [budget-fy2025-26-vol1 p231] */
export const FTE_BY_FUNCTION = [
  { group: "Regular instruction", fy22: 2_467.62, fy26: 2_166.69, pct: -12.2 },
  { group: "Special programs", fy22: 1_059.26, fy26: 1_094.09, pct: 3.3 },
  { group: "School administration", fy22: 451.62, fy26: 416.01, pct: -7.9 },
  { group: "Central business support", fy22: 715.45, fy26: 676.15, pct: -5.5 },
] as const;

/** The bond ledger: ballot promise vs latest estimate, $M. [bond audit exhibits as noted] */
export const BOND_LEDGER = [
  { project: "Benson Polytechnic", bond: "2017", ballotM: 202, latestM: 421.2, status: "over", note: "+108% vs ballot; auditors named a $14M 'budgeting error' inside the jump" }, // [y6 p13-14; y4 p14]
  { project: "Jefferson HS", bond: "2020", ballotM: 311, latestM: 491, status: "paused", note: "Design paused at the $491M schematic estimate; opening slipped two years" }, // [y6 p21-22]
  { project: "Grant HS", bond: "2012", ballotM: 88.3, latestM: 158.7, status: "over", note: "+80%; the 2012 program finished only because $115.8M of non-bond money absorbed overruns" }, // [2012 audit 4; y1p2 p14]
  { project: "Lincoln HS", bond: "2017", ballotM: 187, latestM: 223.6, status: "under-revised", note: "Finished $16.9M under its revised budget." }, // [y6 p13]
  { project: "McDaniel HS", bond: "2017", ballotM: 146, latestM: 200.5, status: "near-revised", note: "Completed near its revised target" }, // [y6 p13]
  { project: "Center for Black Student Excellence", bond: "2020", ballotM: 60, latestM: 0, status: "unspent", note: "$60M allocated in 2020; zero dollars spent through February 2025; flagged by auditors three years running" }, // [y6 p21, p33-34]
] as const;

/** The waste examination, W1-W5, from document.md section 10. */
export const WASTE_VERDICTS = [
  {
    id: "W1",
    title: "Bond overruns",
    ledger: "locked",
    verdict: "Real waste, but it could never have paid a teacher.",
    evidence:
      "Benson High was pitched to voters at $202 million and finished at $421 million, including a $14 million arithmetic error the auditors named. The 2017 bond fit on the ballot only because roughly $100 million was cut from the district's own cost estimate before voters saw it. And a $60 million pledge to Black Portland sat unspent for four years.",
    defense:
      "Construction prices jumped nationwide from 2020 to 2023, earthquake-safety work genuinely grew, and Lincoln High finished under budget, which proves the district can build on budget when the starting number is honest.",
    bottomLine:
      "Hundreds of millions were lost, but bond money can legally buy only buildings, so the loss came out of Portland's borrowing power and its trust in the next bond, not out of classrooms.",
  },
  {
    id: "W2",
    title: "Paying for empty schools",
    ledger: "movable",
    verdict: "The waste was not the small schools. It was five years of not deciding.",
    evidence:
      "The enrollment forecasts were public and clear by 2021. The district did not begin consolidating schools until fall 2026. In every year between, it paid full costs, principal, heat, custodians, on buildings that kept emptying, out of the same fund that was cutting teachers.",
    defense:
      "Small schools are something Portland pays extra for on purpose: walkability and belonging. And the last round of closures fell hardest on Black and brown neighborhoods, so the hesitation was not irrational.",
    bottomLine:
      "Keeping a small school open is a legitimate choice. Taking five years to make the choice, while classrooms paid for the delay, is the waste.",
  },
  {
    id: "W3",
    title: "Central office and outside contracts",
    ledger: "movable",
    verdict: "Nobody outside the building can check it. After seven years of asking, that is the scandal.",
    evidence:
      "Classroom teaching positions were cut more than twice as fast as central business support. A paid testing contract that mostly duplicates a free state service has survived three straight years of the district's own citizen committee asking to cancel it. One proposed budget raised management-services spending 199 percent in a single year.",
    defense:
      "Some spending labeled support is counselors and campus safety, not executives. State and federal mandates grew all decade. And two-thirds of the contract surge is bond construction, not overhead.",
    bottomLine:
      "Nobody can prove the central office is bloated, and nobody can prove it is not, because the district has never published the numbers that would settle it. The state audit asked for exactly those numbers in 2019. They still do not exist.",
  },
  {
    id: "W4",
    title: "One-time money spent as if it were permanent",
    ledger: "committed",
    verdict: "A defensible bet. The failure was not telling the public the bill was coming.",
    evidence:
      "Almost $115 million of temporary federal relief was spent on continuing programs and the people who run them. When it ran out, the cuts that followed track the missing money almost dollar for dollar.",
    defense:
      "The money was meant for pandemic recovery, which means hiring people to help children in crisis, immediately. A district that banked it instead would have been attacked for hoarding aid.",
    bottomLine:
      "Spending temporary money on children was a reasonable choice. Letting the public believe that spending level was sustainable was not. The district's own citizen committee said the money was 'hiding the looming shortfall' a year before the strike.",
  },
  {
    id: "W5",
    title: "Money lost to slow reactions",
    ledger: "movable",
    verdict: "The district saw this coming. What it lacks is a mechanism that forces action when the numbers move.",
    evidence:
      "Within one school year, the district's own published forecast of its year-end cash swung from $41 million down to $18 million and back to $35 million, and a deficit opened mid-year anyway. Its own December report attributed part of the drop to staffing it had added and vacancy savings that never materialized, both internal. Its citizen committee had called the budget's assumptions optimistic at adoption, before any surprise from Salem. Nothing in policy requires the district to explain a swing like that in public, or to do anything when it happens.",
    defense:
      "This district did plan ahead. It adopted a reserve policy in 2019 targeting up to 10 percent, built a balance above the floor, and spent it down through the deficit years rather than laying off staff sooner, over a teachers union arguing throughout that the money should be spent faster. That reserve is a real reason Portland avoided mass layoffs two years ago. State revenue is genuinely hard to forecast inside a year, the budget office itself has been cut, and the fixes big enough to close a structural gap are politically brutal in every district that faces them.",
    bottomLine:
      "The failure here is not blindness, it is speed. The district built a cushion for this and then spent it in a single year against a multi-year cliff, in its own FAQ's words a one-year solution to a multi-year challenge. Late decisions buy less than early ones, which is why every other problem on this page cost more than it had to. The cheapest available fix is a rule the district can adopt for itself: grade the forecasts in public, and require a named response the quarter one moves.",
  },
] as const;

/** What the public record cannot answer, and the drafted (unsent) asks. */
export const GAPS = [
  {
    gap: "The strike settlement cost model",
    settles:
      "The most charged claim in Portland: whether the 2023 strike settlement broke the budget, is one of three comparable pressures, or neither. One spreadsheet would end an argument that has run three years on a press-reported number.",
    holder:
      "The district's finance office built it to negotiate the contract; it exists internally.",
    ask: "A one-paragraph records request under ORS 192, or a board vote to publish. The signed contract is already public; only the arithmetic is not.",
  },
  {
    gap: "Position-control staffing reports",
    settles:
      "Whether the union's claim that 149 central-office positions were added from 2019 to 2024 is true, false, or partly true. This is the single document the broke-or-hiding fight is missing.",
    holder:
      "The district's HR and budget systems generate these counts routinely; every large employer has them.",
    ask: "Publish staffing counts by role and location, 2018 forward. A records request reaches them; a board member could ask for them Monday.",
  },
  {
    gap: "The closure savings model",
    settles:
      "What closing a school actually saves, building by building, before any community is asked to accept a closure. Right now every number in the closure debate, on both sides, is a guess.",
    holder: "The facilities and finance staff running the consolidation process now underway.",
    ask: "Publish the model before any closure list, and let someone independent check it. The board can make that a condition of its own vote.",
  },
  {
    gap: "The equity allocation's effectiveness study",
    settles:
      "Whether a decade of set-aside staffing for high-poverty schools measurably closed the gaps it targeted. That answer now shapes both a federal lawsuit's public meaning and whether halving the allocation was right.",
    holder:
      "Nobody. The citizen committee asked for this analysis in 2023 and again in 2024; it was never produced, and the allocation was halved without it.",
    ask: "Commission the study. The staffing and outcome data needed to run it sit in district systems today.",
  },
  {
    gap: "A forecast-accuracy standard for the quarterly reports",
    settles:
      "Whether the district's mid-year surprises are bad luck or bad practice. Inside FY2025-26 the year-end forecast swung $24M in one quarter; a public scorecard would show how often the forecasts miss, by how much, and what changed in response.",
    holder:
      "Nobody. This one is not a hidden document; it does not exist yet.",
    ask: "One board policy vote: accuracy bands, a revision log, and a named response when a forecast misses badly.",
  },
  {
    gap: "The bond disclosures, on a PPS site",
    settles:
      "What the district tells Wall Street about its own risks, under securities law, in plainer terms than anything it mails to voters. The documents exist; they just live where only bond buyers look.",
    holder:
      "PPS wrote them. They sit on the municipal bond market's EMMA system today.",
    ask: "Repost them on pps.net. This is an afternoon of work.",
  },
  {
    gap: "A new state performance audit (none since January 2019)",
    settles:
      "An independent answer to the central-office question, from examiners with the power to compel records the public cannot. A strike, the pandemic money, and five cut years have passed since the state last looked.",
    holder:
      "The Oregon Secretary of State's Audits Division, which picks its own targets and takes public suggestions.",
    ask: "Anyone can propose an audit topic to the division. Its own 2022 follow-up found the 2019 recommendations only partially implemented, which is the argument for going back.",
  },
  {
    gap: "A deadline on the annual bond audit",
    settles:
      "Whether construction cost problems surface while they can still be fixed. Benson's estimate moved for sixteen months between audit reports, because nothing sets the auditor's publication date.",
    holder: "The school board's audit committee, which writes the engagement.",
    ask: "A due date in the engagement letter: final report within a fixed number of months after fiscal year end.",
  },
] as const;

/** Six tripwires for the decade ahead (document.md section 12). */
export const TRIPWIRES = [
  { what: "FY2027-28 budget, spring 2027", tripwire: "Does the General Fund fall a second consecutive year, and can the district state one gap number per cycle", action: "Show up in April when the proposed budget lands. A good answer states one gap figure and the assumptions behind it; a bad one gives you two numbers in the same document" },
  { what: "The closure decision, recommendations due end of 2026", tripwire: "Savings model published before the vote; savings tied by name to classroom reinvestment", action: "Ask for the per-building model at the hearing. A good answer is a published number you can check; 'trust the process' is not one" },
  { what: "The quarterly reports, each release", tripwire: "Does the year-end forecast hold, or swing eight figures again with no explanation", action: "The reports are public at pps.net/departments/finance/finance. A good answer to a big swing is a named cause and a named response" },
  { what: "The 2025 bond's first audit cycle", tripwire: "Jefferson's estimate-at-completion vs the reduced target; the first Center for Black Student Excellence dollar actually spent", action: "The annual bond audit is public. A good answer shows spending against the $60M; a fourth year of zero is the answer too" },
  { what: "PERS 2027-29 rates", tripwire: "The school-pool rate adoption lands with the stabilization reserve already gone", action: "Ask what replaces the drained reserve. A good answer is a plan; 'we hope Salem acts' is a forecast, not a plan" },
  { what: "The 2029 levy renewal, campaign starts ~2028", tripwire: "Whether the campaign prints the effective rate, near $1.51 and falling, next to the $1.99", action: "One sentence, to any canvasser or mailer: print the effective rate. If the campaign won't say $1.51, it is hoping you won't ask" },
] as const;

/** The doctrine (document.md section 14). */
export const DOCTRINE = {
  sentence:
    "Count every dollar in the open, say plainly which ones can move, and make every dollar that can move prove, in public, every spring, that nothing else it could buy would do more for a student who is here now.",
  annualQuestion: "Does the next dollar reach a student, and can you show me?",
  commitments: [
    "Make the interim statements decision-grade: forecast-accuracy scoring, revision logs, public reconciliation. No new money required.",
    "Publish the one-page budget: operating, capital, debt, side by side.",
    "Publish the trend table in every budget book. The state asked in 2019.",
    "Sort every dollar by ledger before arguing about it.",
    "Give citizen reviewers the weeks the work needs, and answer them in writing.",
    "Benchmark central costs against peers annually, or accept that others will.",
    "When spending one-time money on ongoing things, print the cliff beside the promise.",
    "Publish the closure savings model before asking any community to accept a closure.",
    "Treat an unremediated audit finding as a standing debt with a date on it.",
    "Put the levy's effective rate next to its nominal rate, everywhere.",
  ],
} as const;
