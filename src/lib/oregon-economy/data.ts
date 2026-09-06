import {
  Building2,
  ClipboardList,
  Compass,
  Factory,
  Gauge,
  LayoutGrid,
  LineChart,
  Megaphone,
  Network,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Sources — every number on the page is traceable to one of these.    */
/* ------------------------------------------------------------------ */

export const SOURCES = {
  ojp: {
    org: "Oregon Journalism Project",
    title: "Prosperity Council Likely to Streamline State's Economic Development Agency (Nigel Jaquiss)",
    url: "https://www.oregonjournalismproject.org/",
  },
  appr2024: {
    org: "Business Oregon / Legislative Fiscal Office",
    title: "Annual Performance Progress Report, reporting year 2024 (KPM tables, methodology note)",
    url: "https://www.oregonlegislature.gov/lfo/APPR/APPR_OBDD_2024-10-02.pdf",
  },
  lfoBudget: {
    org: "Oregon Legislative Fiscal Office",
    title: "2025-27 Budget Review — Oregon Business Development Department",
    url: "https://olis.oregonlegislature.gov/liz/2025R1/Downloads/CommitteeMeetingDocument/294188",
  },
  oed: {
    org: "Oregon Employment Department",
    title: "Employment in Oregon — April 2026 press release",
    url: "https://www.oregon.gov/employ/NewsAndMedia/Press%20Releases%20Archives/2026-05-20-Employment-in-Oregon-April-2026-press-release.pdf",
  },
  prosperityCouncil: {
    org: "Office of the Governor",
    title: "Governor's Prosperity Council (charge, members, June 30, 2026 deadline)",
    url: "https://www.oregon.gov/gov/policies/Pages/Prosperity-Council.aspx",
  },
  prosperityRoadmap: {
    org: "Office of the Governor",
    title: "Oregon's Prosperity Roadmap (December 2025)",
    url: "https://www.oregon.gov/gov/Documents/Oregon's_Prosperity_Roadmap_December_2025.pdf",
  },
  goodJobsFirst: {
    org: "Good Jobs First / Oregon Capital Chronicle",
    title: "Business property-tax breaks cost Oregon schools $275 million in one year",
    url: "https://centraloregonian.com/2025/08/21/oregon-business-property-tax-breaks-cost-schools-275-million-last-year-study-finds/",
  },
  intelSip: {
    org: "Washington County",
    title: "2014 Intel Strategic Investment Program agreement",
    url: "https://www.washingtoncountyor.gov/cao/2014-intel-sip",
  },
  opbDataCenters: {
    org: "OPB",
    title: "Data centers cut from bill expanding Oregon tax breaks (Mar 2026)",
    url: "https://www.opb.org/article/2026/03/02/data-centers-cut-bill-expanding-oregon-tax-breaks/",
  },
  roiStudy: {
    org: "Business Oregon",
    title: "Property Tax Incentives Impact Study (2007-2020 economic output per $1 abated)",
    url: "https://www.oregon.gov/biz/Publications/Property_Tax_Incentivies_Impact_Study.pdf",
  },
  bizOregonSite: {
    org: "Business Oregon",
    title: "Business Oregon — agency website (oregon.gov/biz)",
    url: "https://www.oregon.gov/biz/Pages/default.aspx",
  },
  utahGoeo: {
    org: "Utah Governor's Office of Economic Opportunity",
    title: "GOEO — About (governor-led office, ~100 staff, >$240M)",
    url: "https://business.utah.gov/about/",
  },
  jobsOhio: {
    org: "JobsOhio",
    title: "JobsOhio — site-selection front door",
    url: "https://www.jobsohio.com/",
  },
  iedcAudit: {
    org: "Indiana Capital Chronicle",
    title: "IEDC forensic analysis highlights lackluster oversight and questionable spending (Oct 2025)",
    url: "https://indianacapitalchronicle.com/2025/10/03/iedc-forensic-analysis-highlights-lackluster-oversight-and-questionable-spending/",
  },
  edpnc: {
    org: "Economic Development Partnership of North Carolina",
    title: "EDPNC 2025 Annual Report (revenue, 35,000+ jobs)",
    url: "https://edpnc.com/annual-report/",
  },
  mackinac: {
    org: "Mackinac Center for Public Policy",
    title: "Michigan Economic Development Corp Is Not Developing Michigan's Economy (advocacy analysis)",
    url: "https://www.mackinac.org/blog/2025/michigan-economic-development-corp-is-not-developing-michigans-economy",
  },
  richStates: {
    org: "ALEC-Laffer",
    title: "Rich States, Poor States, 19th ed. — economic-outlook index (forward-looking, not realized outcomes)",
    url: "https://www.richstatespoorstates.org/",
  },
  ipre: {
    org: "University of Oregon Institute for Policy Research and Engagement",
    title: "Oregon economic development assessment (June 2025, co-author Bob Parker)",
    url: "https://ipre.uoregon.edu/",
  },
  obi: {
    org: "Oregon Business & Industry",
    title: "Oregon Business & Industry — statewide employer association",
    url: "https://oregonbusinessindustry.com/",
  },
  appr2025: {
    org: "Business Oregon",
    title: "Annual Performance Progress Report, reporting year 2025 (KPM #1: 808 jobs vs the lowered 800 target)",
    url: "https://www.oregon.gov/biz/Publications/APPR_OBDD_2025-10-01.pdf",
  },
  dorTaxExp: {
    org: "Oregon Department of Revenue",
    title: "2025-27 Tax Expenditure Report (SIP + enterprise-zone revenue loss, state + local)",
    url: "https://www.oregon.gov/dor/gov-research/pages/tax_expenditure_report.aspx",
  },
  cnbc: {
    org: "CNBC / Business Oregon legislative deck",
    title: "America's Top States for Business — Oregon 2019 vs 2025 rankings",
    url: "https://olis.oregonlegislature.gov/liz/2025I1/Downloads/CommitteeMeetingDocument/311398",
  },
  ipreCommissioned: {
    org: "Business Oregon / IPRE",
    title: "External Business Recruitment (UO/IPRE, commissioned by Business Oregon with an OBI/OBC advisory committee)",
    url: "https://www.oregon.gov/biz/Publications/Biz_Recruitment.pdf",
  },
  lab2527: {
    org: "Business Oregon",
    title: "2025-27 Legislatively Adopted Budget (ORBITS division detail; total funds $2.26B)",
    url: "https://www.oregon.gov/biz/Publications/12300%20-%20Oregon%20Business%20Development%20Department-v4.pdf",
  },
  obcLetter: {
    org: "Oregon Business Council",
    title: "A Moment of Economic Reckoning for Oregon — letter to the Governor's Prosperity Council (March 18, 2026)",
    url: "https://www.oregon.gov/gov/policies/Documents/20260318_OBC%20Prosperity%20Council%20Letter%20pdf.pdf",
  },
  highRoadPaper: {
    org: "SEIU & Oregon Building Trades (the Council's labor members)",
    title: "The High Road to Prosperity for All Oregonians (April 7, 2026) — with Joe Cortright and Chuck Sheketoff",
    url: "https://www.oregon.gov/gov/policies/Documents/Final-Prosperity-Paper-April%207.pdf",
  },
  prosperitySurvey: {
    org: "Governor's Prosperity Council",
    title: "Statewide engagement survey — 1,039 responses (raw results)",
    url: "https://www.oregon.gov/gov/policies/Pages/Prosperity-Council.aspx",
  },
} as const;

export type SourceKey = keyof typeof SOURCES;

/* ------------------------------------------------------------------ */
/* Hero stats + the 60-second version                                  */
/* ------------------------------------------------------------------ */

export const HEADLINE_STATS: Array<{ value: string; label: string; source: SourceKey }> = [
  { value: "808 vs 800", label: "the agency's 2025 “win” — beating a goal it had cut from 1,200, the year Oregon lost jobs", source: "appr2025" },
  { value: "1,200 → 800", label: "where it moved the job target after years of missing it", source: "appr2025" },
  { value: "$617M", label: "a year Oregon gives up in business property-tax breaks — outside the agency's scorecard", source: "dorTaxExp" },
  { value: "$31M", label: "the agency's actual operations budget — far from the “$1 billion a year” headline", source: "lab2527" },
];

export const TLDR_POINTS = [
  "A confidential draft from Governor Kotek's Prosperity Council says Oregon's economic-development agency, Business Oregon, is “underperforming relative to peer states” and should become a “Department of Commerce.” The final report is scheduled to be unveiled June 25, 2026, ahead of its June 30 deadline.",
  "The damning detail: the agency missed its job-creation goal for years, so the goal was lowered from 1,200 to 800, and the latest public report still shows a miss (490 jobs).",
  "But the headline numbers are slipperier than they look: the agency changed how it counts jobs in 2024, its biggest tools (the Intel and data-center tax breaks) aren't even in that scorecard, and “$1 billion a year” is mostly pass-through infrastructure money, not money the agency actually runs.",
  "You can also just look at the front door: Business Oregon's website is built like an org chart, not like a product a CEO deciding where to expand would ever use.",
  "Some of this is structural (Oregon never made economic development a real priority) and some is execution (missed targets, an unusable website). A reorg fixes the first. Whether it touches the second is the real question for June 25.",
];

/* ------------------------------------------------------------------ */
/* The scorecard — KPM #1 jobs created vs target                       */
/* ------------------------------------------------------------------ */

export interface JobsYear {
  year: string;
  actual: number;
  target: number;
}

/** KPM #1 "jobs created", actual vs LFO target, reporting years 2020-2025. */
export const JOBS_KPM: JobsYear[] = [
  { year: "2020", actual: 811, target: 1200 },
  { year: "2021", actual: 504, target: 1300 },
  { year: "2022", actual: 378, target: 1200 },
  { year: "2023", actual: 541, target: 1200 },
  { year: "2024", actual: 490, target: 800 },
  { year: "2025", actual: 808, target: 800 },
];

/** The confirmed FY2025 twist (from the reporting-year-2025 APPR). */
export const FY2025_TWIST =
  "In 2025 the agency finally cleared the bar — by eight jobs (808 vs 800). But it was the bar it had cut from 1,200, and it declared “100% of targets met” in a year Oregon's private sector lost roughly 6,500 jobs.";

/** Pre-2024 FTE-methodology history (NOT comparable to post-2024 counts). */
export const JOBS_FTE_HISTORY: JobsYear[] = [
  { year: "~2008", actual: 3538, target: 0 },
  { year: "2014", actual: 2005, target: 2000 },
  { year: "2015", actual: 2214, target: 2000 },
];

export const SCOREBOARD_NOTE =
  "Targets are set by Business Oregon in partnership with the Legislative Fiscal Office and are legislatively approved. KPM #1 counts only new jobs at firms that received money from one of the agency's ~18 funding programs.";

/* The other KPMs — the "honest read" the failure framing leaves out. */
export interface OtherKpm {
  name: string;
  value: string;
  verdict: "beat" | "miss" | "mixed";
  note: string;
}

/** FY2025 values, from the reporting-year-2025 APPR. */
export const OTHER_KPMS: OtherKpm[] = [
  {
    name: "Jobs retained (KPM #2)",
    value: "9,640 vs 3,000 target",
    verdict: "beat",
    note: "Far above target, but 93.5% came from two one-time COVID grant programs that are winding down.",
  },
  {
    name: "Personal income tax (KPM #3)",
    value: "$20.6M vs $21.0M target",
    verdict: "miss",
    note: "Missed again — the agency's own note calls it the 6th miss in 7 years, even as the jobs it credits rose.",
  },
  {
    name: "Customer satisfaction (KPM #10)",
    value: "95% vs an 85% target",
    verdict: "beat",
    note: "A record high, but the target was cut from 90% to 85%, and the survey drew a 6% response rate (340 of 5,300 sent).",
  },
  {
    name: "Abatement jobs (KPM #6)",
    value: "1,560 vs 750 target",
    verdict: "beat",
    note: "The Intel/enterprise-zone jobs — counted separately from the KPM #1 the agency is graded on, and down from 2,402 in 2024.",
  },
];

/** In FY2025 the agency declared all 11 KPMs "green" — after cutting several targets. */
export const TARGETS_CUT: Array<{ kpm: string; from: string; to: string }> = [
  { kpm: "Jobs created", from: "1,200", to: "800" },
  { kpm: "Customer satisfaction", from: "90%", to: "85%" },
  { kpm: "Federal contract value", from: "$76M", to: "$50M" },
];

export const FY2025_GREEN = "100% of targets met";

/* ------------------------------------------------------------------ */
/* The methodology asterisk                                            */
/* ------------------------------------------------------------------ */

export const METHODOLOGY = {
  policy: "Policy #OBDD.112",
  before: {
    label: "Before FY2024",
    method: "Full-time equivalent (FTE), from unemployment-insurance wage records",
    effect: "Counts ran in the thousands. In 2015 the agency created 2,214 jobs and beat its 2,000 target.",
  },
  after: {
    label: "FY2024 onward",
    method: "Average annual employment, from the Quarterly Census of Employment & Wages (QCEW)",
    effect: "Counts dropped to the hundreds. The agency switched citing “data quality concerns.”",
  },
  takeaway:
    "Because the ruler changed in 2024, the popular “missed its goal nine of the past ten years” line splices together two different yardsticks. The recent misses (2021-2024) are real; a clean ten-year trend is not available.",
};

/* ------------------------------------------------------------------ */
/* Follow the billion — budget composition                             */
/* ------------------------------------------------------------------ */

export interface FundSlice {
  name: string;
  millions: number;
  kind: "operating" | "passthrough";
  note: string;
}

/** 2025-27 Legislatively Adopted Budget by division, total funds $2.26B (biennium). */
export const BUDGET_FUNDS: FundSlice[] = [
  { name: "Infrastructure Financing", millions: 1744.4, kind: "passthrough", note: "Bonded capital — lottery/GO/Bond Bank proceeds and loan repayments recycled into community water, sewer, seismic, and broadband loans. About 77% of the agency." },
  { name: "Business, Innovation & Trade", millions: 249.8, kind: "operating", note: "The actual economic-development work: business retention, recruitment, CHIPS, the Strategic Reserve Fund, innovation, and exports. The largest staff division." },
  { name: "Lottery & bond debt service", millions: 186.7, kind: "passthrough", note: "Pure debt service — paying off bonds. Zero staff." },
  { name: "Arts Commission & Cultural Trust", millions: 47.2, kind: "operating", note: "Arts and heritage grants." },
  { name: "Operations", millions: 31.2, kind: "operating", note: "Central administration — director's office, IT, fiscal, HR, comms. 73 positions. The part that actually runs the agency." },
  { name: "Film & Video Office", millions: 1.5, kind: "passthrough", note: "Lottery pass-through to a semi-independent office." },
];

export const BUDGET_BIENNIA: Array<{ period: string; millions: number; note: string }> = [
  { period: "2021-23 (actual)", millions: 1019.8, note: "~$510M/yr" },
  { period: "2023-25 (adopted)", millions: 2272.9, note: "one-time + federal money" },
  { period: "2025-27 (adopted)", millions: 2260.8, note: "~$1.13B/yr total funds" },
  { period: "2025-27 base", millions: 1151.2, note: "recurring “current service level” — ~$600M/yr" },
];

export const BUDGET_OPERATIONS = {
  operationsDivisionMillions: 31.2,
  operationsDivisionPositions: 73,
  totalPositions: 206,
  fte: 201.4,
  takeaway:
    "“Business Oregon spends more than $1 billion a year” is the most repeated number about the agency, and it's misleading. The figure is biennial total funds ($2.26 billion for two years), and most of it is bonded infrastructure finance that passes through the agency to water and sewer projects. The division that actually runs the agency is about $31 million for the two years.",
};

/* ------------------------------------------------------------------ */
/* The incentive paradox                                               */
/* ------------------------------------------------------------------ */

export interface IncentiveRoi {
  program: string;
  perDollar: number;
  note: string;
}

/** Business Oregon's own 2022 study: economic output per $1 of property tax abated, 2007-2020. */
export const INCENTIVE_ROI: IncentiveRoi[] = [
  { program: "Standard Enterprise Zone", perDollar: 29.16, note: "Highest measured output per dollar abated." },
  { program: "Strategic Investment Program (Intel)", perDollar: 6.24, note: "The flagship program — far lower output per dollar." },
  { program: "Long-Term Rural Enterprise Zone", perDollar: 1.18, note: "Barely more than a dollar of output per dollar given up." },
];

export const SCHOOL_COST = {
  y2019: 125,
  y2024: 275,
  districts: [
    { name: "Hillsboro (Intel SIP)", millions: 143 },
    { name: "Crook County (data centers)", millions: 29 },
    { name: "Hermiston (data centers)", millions: 16 },
  ],
  dataCenterPerJob: 294000,
  standardEzMillions: 68,
  dataCenterShare: 0.66,
};

export const INTEL_SIP = {
  investment: "up to ~$100B over 30 years",
  taxBreak: "~$2B property-tax break (machinery & equipment only)",
  mechanic:
    "The Strategic Investment Program lets a company exempt the value of an investment above a set floor from property tax for 15 years. To qualify in an urban county, a company must invest at least about $154M (rising to ~$163M in mid-2026). Intel still pays tax on land and buildings, plus fees estimated near $350M over the life of the deal.",
  context:
    "And the state's flagship incentive is riding on a company in retreat: Intel cut more than 3,000 Oregon jobs in 2025, its foundry business lost roughly $10B, and in August 2025 the U.S. government took an ownership stake of about 10%. The Council's co-chair, Renée James, is a former Intel president.",
};

/** Statewide (state + all local) property-tax revenue forgone, per the DOR Tax Expenditure Report. */
export const STATEWIDE_INCENTIVE = {
  perYear: 617,
  sip: 327,
  ruralEz: 194.5,
  standardEz: 95,
  dataCentersAllPrograms: 457,
  note:
    "Counting all taxing districts, state and local, Oregon forgoes about $617M a year in property tax to the Strategic Investment Program plus all enterprise zones, per the Department of Revenue. The $275M schools give up is a subset. Intel's SIP alone is ~$327M/yr; the rural enterprise zone that covers eastern-Oregon data centers is ~$194M/yr.",
};

/** CNBC "America's Top States for Business" — Oregon's rank, 2019 vs 2025. */
export const CNBC_RANK: Array<{ metric: string; y2019: number; y2025: number }> = [
  { metric: "Overall", y2019: 22, y2025: 39 },
  { metric: "Economy", y2019: 7, y2025: 41 },
  { metric: "Business friendliness", y2019: 43, y2025: 47 },
];

/** The two competing papers the Council received — the business and labor poles. */
export interface CouncilCamp {
  author: string;
  date: string;
  tone: "business" | "labor";
  frame: string;
  asks: string[];
  evidence: string;
  source: SourceKey;
}

export const COUNCIL_CAMPS: CouncilCamp[] = [
  {
    author: "Oregon Business Council",
    date: "March 2026",
    tone: "business",
    frame:
      "Oregon is in “recession-like” conditions and entering an era of population scarcity. Stagnation, not growth, is now the threat.",
    asks: [
      "A permanent growth-strategy body: a successor Prosperity Council with a public-private “backbone organization.”",
      "Land-use reform for 2027 — modernize the urban growth boundary, speed permitting, fund industrial sites.",
      "Restore “tax competitiveness” — ease the Corporate Activity Tax and Portland's high-income surtaxes.",
      "Regulatory modernization with hard reduction targets.",
      "Stronger talent pipelines and K-12 accountability.",
    ],
    evidence:
      "Greater Portland Inc. counted six clean-tech and advanced-manufacturing prospects, about $5.6B of investment, lost to other states; Daimler put a battery plant in Mississippi over the Portland region.",
    source: "obcLetter",
  },
  {
    author: "SEIU + Building Trades",
    date: "April 2026",
    tone: "labor",
    frame:
      "The “doom loop” is a myth. Take the high road: raise incomes for working Oregonians instead of chasing business-climate rankings.",
    asks: [
      "Target per-capita income and wages for low- and middle-earners — not GDP or job counts.",
      "Fully fund the 40/40/20 education vision, childcare, and apprenticeships.",
      "Tie any business tax break to family wages and paid training.",
      "Protect the Corporate Activity Tax (it funds schools, hits ~5% of firms) and high-income taxes.",
      "Add the worker-centered AI guardrails the Governor's Roadmap left out.",
    ],
    evidence:
      "Brookings' March 2026 Metro Monitor ranks Portland 10th of large U.S. metros for prosperity (Bend 1st among mid-size); Oregon has net positive firm migration. “Business-climate rankings are barely worth the paper they're printed on.”",
    source: "highRoadPaper",
  },
];

/** Same state, two stories — the evidence each side leans on. */
export const CONTESTED_EVIDENCE: Array<{ question: string; reform: string; counter: string }> = [
  {
    question: "Is Oregon's economy failing?",
    reform: "CNBC's business rank fell #22 → #39; unemployment is among the nation's highest.",
    counter: "Brookings ranks Portland 10th of large metros for prosperity; Bend 1st among mid-size.",
  },
  {
    question: "Are businesses fleeing the state?",
    reform: "Greater Portland Inc. tallied ~$5.6B in clean-tech and manufacturing projects lost to other states.",
    counter: "BLS firm-migration data put Oregon 11th of 50 states for net inbound business moves (+35).",
  },
  {
    question: "Do tax breaks actually bring jobs?",
    reform: "“Modernize” incentives so Oregon can compete for the big employers it keeps losing.",
    counter: "Upjohn's Tim Bartik: 9 of 10 incentives change no decision. Tektronix's own tax director said the same.",
  },
];

/** The Council's "statewide engagement" survey, summarized from the raw results. */
export const SURVEY = {
  responses: 1039,
  oregon: 1022,
  businessShare: 0.43, // "Both" + "Organization/Business" of all respondents
  topFocus: [
    { area: "Business climate", n: 507 },
    { area: "Tools for growth", n: 264 },
    { area: "Workforce", n: 254 },
  ],
  note:
    "Over 1,000 Oregonians answered. The top-ranked concern was “business climate”, but about 4 in 10 respondents were speaking for a business or organization, so the engagement leans toward employer voices more than a representative public.",
  source: "prosperitySurvey" as SourceKey,
};

/* ------------------------------------------------------------------ */
/* The front door — Oregon vs a product-built peer                     */
/* ------------------------------------------------------------------ */

export interface FrontDoorRow {
  label: string;
  oregon: string;
  ohio: string;
}

export const FRONT_DOOR: {
  oregonHero: string;
  oregonCta: string;
  ohioHero: string;
  ohioCta: string;
  rows: FrontDoorRow[];
  verdict: string;
} = {
  oregonHero: "“Big Ideas Start in Oregon”",
  oregonCta: "Explore the stories shaping Oregon's economy at ThisIsEcDev.com",
  ohioHero: "“Make Great Happen”",
  ohioCta: "Let's Talk Business",
  rows: [
    {
      label: "Who it's built for",
      oregon: "Everyone and no one — the public, grant-seekers, the agency's own org chart.",
      ohio: "A corporate site-selector deciding where to put the next plant.",
    },
    {
      label: "Navigation",
      oregon: "Agency functions: “Fund Your Business,” “Build Infrastructure,” “Compete for Contracts.”",
      ohio: "A buyer's journey: Why Ohio → Site Selection → Industries → Incentives → Workforce.",
    },
    {
      label: "Tools",
      oregon: "None — no incentives finder, no site selector, no “talk to a specialist.”",
      ohio: "Shovel-ready site selector, incentives finder, 9 industry pages, case studies, rankings.",
    },
    {
      label: "Primary call to action",
      oregon: "Read stories about the economy.",
      ohio: "Talk to a deal team. Now.",
    },
  ],
  verdict:
    "An automated read of Business Oregon's homepage called it “a government information repository masquerading as economic development marketing… the layout mirrors a state agency org chart rather than a buyer's journey.” The front door is the cheapest, most visible tell of whether an agency is built around itself or around the customer it's supposed to win.",
};

/* ------------------------------------------------------------------ */
/* Structural vs. execution diagnosis                                  */
/* ------------------------------------------------------------------ */

export interface DiagnosisItem {
  problem: string;
  kind: "structural" | "execution";
  detail: string;
  fixedByReorg: "yes" | "partly" | "no";
  icon: LucideIcon;
}

export const DIAGNOSIS: DiagnosisItem[] = [
  {
    problem: "No statewide economic strategy",
    kind: "structural",
    detail: "A UO assessment found Oregon “lacks a coordinated, comprehensive statewide economic development strategy.” Functions are split across agencies.",
    fixedByReorg: "yes",
    icon: Compass,
  },
  {
    problem: "Economic development is nobody's top priority",
    kind: "structural",
    detail: "Successful states make it a governor-level priority. Oregon's culture has been ambivalent since Tom McCall told people not to move here. Kotek kept the director while replacing five others.",
    fixedByReorg: "partly",
    icon: Megaphone,
  },
  {
    problem: "Small, diffuse programs",
    kind: "structural",
    detail: "The draft faults the agency's “small scale of programs” and “diffuse focus” — doing many things, none at scale.",
    fixedByReorg: "partly",
    icon: LayoutGrid,
  },
  {
    problem: "Missed targets, then a lower bar",
    kind: "execution",
    detail: "Years of missing the job goal, then the goal was cut from 1,200 to 800, and the latest report still shows a miss.",
    fixedByReorg: "no",
    icon: Gauge,
  },
  {
    problem: "Lack of responsiveness to business",
    kind: "execution",
    detail: "The draft and lawmakers cite “lack of responsiveness.” Customer satisfaction has missed its 90% target every year.",
    fixedByReorg: "no",
    icon: ClipboardList,
  },
  {
    problem: "A front door no CEO would use",
    kind: "execution",
    detail: "The agency's website is built like an org chart, not a product. A new nameplate does not rebuild the customer experience.",
    fixedByReorg: "no",
    icon: Network,
  },
];

/* ------------------------------------------------------------------ */
/* Peer states — would a Department of Commerce fix it?                */
/* ------------------------------------------------------------------ */

export interface PeerState {
  state: string;
  agency: string;
  model: string;
  outcome: string;
  caution: string;
  tone: "positive" | "caution" | "mixed";
  icon: LucideIcon;
  source: SourceKey;
}

export const PEER_STATES: PeerState[] = [
  {
    state: "Utah",
    agency: "Governor's Office of Economic Opportunity",
    model: "A lean office inside the governor's portfolio — ~100 staff, >$240M.",
    outcome: "Ranked #1 in the ALEC-Laffer economic-outlook index for 19 straight years.",
    caution: "That ranking is a forward-looking ideological index, not a measure of realized outcomes.",
    tone: "positive",
    icon: Compass,
    source: "utahGoeo",
  },
  {
    state: "North Carolina",
    agency: "EDPNC (under the Dept. of Commerce)",
    model: "A nonprofit public-private partnership run by a business-leader board, contracting with the state.",
    outcome: "2025 recruitment: 35,000+ jobs and $24.1B in investment — both records.",
    caution: "How much is the model vs. North Carolina's growth and location is hard to separate.",
    tone: "positive",
    icon: Building2,
    source: "edpnc",
  },
  {
    state: "Indiana",
    agency: "IEDC",
    model: "A centralized, governor-chaired quasi-public corporation funded with >$1B over two years.",
    outcome: "Aggressive deal-making and a big war chest — the model reformers often admire.",
    caution: "A 2025 forensic audit found governance gaps and 52 conflict-of-interest deals; the governor replaced the entire board.",
    tone: "caution",
    icon: Scale,
    source: "iedcAudit",
  },
  {
    state: "Michigan",
    agency: "MEDC",
    model: "A large, centralized strategic fund spending billions on incentives.",
    outcome: "The cautionary case: one analysis found projects promised ~123,000 jobs and delivered ~11,000.",
    caution: "That 91% shortfall comes from a free-market think tank, not an official audit, but the pattern is widely reported.",
    tone: "caution",
    icon: Factory,
    source: "mackinac",
  },
];

export const PEER_TAKEAWAY =
  "The states reformers point to do share a pattern: economic development sits close to the governor with a clear, centralized strategy. But scale and centralization don't guarantee results — Michigan centralized and still missed, and Indiana centralized and got a forensic audit. Structure is necessary, not sufficient. The harder ingredients are political will, a real strategy, and a culture built around the customer.";

/* ------------------------------------------------------------------ */
/* The decision + what "serious" would require                         */
/* ------------------------------------------------------------------ */

export const COMMERCE_PROPOSAL = {
  what: "Convert Business Oregon into a “Department of Commerce” that consolidates economic-development functions now split across multiple agencies.",
  changes: "The structure: one consolidated home, a clearer line to the governor, and (potentially) more scale and influence over peer agencies.",
  doesntChange: "The execution and the will: whether the state actually prioritizes growth, whether the agency answers the phone, whether the front door is rebuilt, and whether the metrics become honest.",
  status: "This comes from a confidential draft obtained by reporters. The Governor's official Prosperity Council page does not mention Business Oregon or a Department of Commerce. The final report is scheduled for June 25, 2026 (charter deadline June 30).",
};

export const SERIOUS_BAR: Array<{ title: string; detail: string; icon: LucideIcon }> = [
  { title: "Make it a governor-level priority", detail: "The peer-state pattern isn't a nameplate — it's the governor personally owning growth and a written strategy the whole government follows.", icon: Megaphone },
  { title: "Fix the front door", detail: "Rebuild the agency around the customer: an incentives finder, a site selector, a deal team you can actually reach.", icon: Network },
  { title: "Make the metrics honest", detail: "Count all the tools (including the Intel and data-center breaks), hold one consistent yardstick, and stop quietly lowering the bar.", icon: Gauge },
  { title: "Decide what the incentives are for", detail: "If Oregon gives up $275M of school revenue a year, it should know what it's buying, and let schools have a seat at the table.", icon: Scale },
];

export const TRADEOFFS: Array<{ tension: string; left: string; right: string }> = [
  {
    tension: "Centralize for clout, or keep oversight tight?",
    left: "A bigger, governor-led Department of Commerce can move faster and punch harder.",
    right: "Indiana's centralized agency got a forensic audit and a board purge. More power needs more scrutiny.",
  },
  {
    tension: "Chase big employers, or fund schools and services?",
    left: "Incentives like Intel's SIP can anchor an industry and thousands of jobs.",
    right: "Those same breaks cost schools $275M in a year, with ROI ranging from $29 to barely $1 per dollar.",
  },
  {
    tension: "Reorganize, or just execute?",
    left: "A new structure can end the fragmentation and signal that Oregon is serious.",
    right: "A rename doesn't answer the phone, rebuild the website, or set an honest target. That's a culture, not an org chart.",
  },
];

export const CAVEATS = [
  "The “beat the target by eight jobs” figure is now confirmed: Business Oregon's reporting-year-2025 report shows 808 jobs created against the lowered 800 target. The catch is that the target had been cut from 1,200, and the agency declared “100% of targets met” in a year Oregon's private sector lost jobs.",
  "The “missed nine of ten years” line is directionally fair for recent years but mixes two measurement methods: the agency changed how it counts jobs in 2024 (FTE → QCEW), so a clean ten-year comparison isn't possible.",
  "“More than $1 billion a year” is biennial total funds, and most of it is bonded infrastructure finance that passes through the agency. The agency's operating footprint is far smaller.",
  "On unemployment: Oregon's 5.2% (April 2026) was higher than all but three states — California, Delaware, and Nevada, each 5.3%. D.C. (6.2%) is a federal district, not a state, and Oregon was tied with Washington state. “All but four states” overcounts D.C. as a state.",
  "The two studies most cited to argue Oregon must “centralize” its economic development, the UO/IPRE report and ECONorthwest's work, were commissioned and steered by Business Oregon and the business lobby (Oregon Business & Industry, the Oregon Business Council). The data is real; the prescription is also the funders' policy preference.",
  "The “Department of Commerce” recommendation comes from a confidential draft and could change before the final report (scheduled June 25, 2026; charter deadline June 30). It is not enacted policy.",
  "Several peer-state and incentive figures come from advocacy groups (Mackinac Center, Good Jobs First, Tax Fairness Oregon) or the agency's own studies; each is labeled where it appears.",
];

export const NAV = [
  { id: "scorecard", label: "The scorecard" },
  { id: "methodology", label: "Two rulers" },
  { id: "metric", label: "The hidden tools" },
  { id: "budget", label: "The $1B, decoded" },
  { id: "front-door", label: "The front door" },
  { id: "diagnosis", label: "Structure vs. execution" },
  { id: "peer-states", label: "Other states" },
  { id: "debate", label: "The real debate" },
  { id: "decide", label: "You decide" },
  { id: "sources", label: "Sources" },
];

export const PageIcons = { LineChart };
