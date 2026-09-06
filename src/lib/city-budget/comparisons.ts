/**
 * Peer-city comparison data.
 *
 * Cross-city budget comparison is the single most abused number in local
 * government reporting. The spread between cities is mostly a question of
 * which functions sit inside the corporate boundary — schools, county health,
 * transit, electricity — not how much government anyone is buying. Every
 * figure here is therefore paired with what it does and doesn't include.
 *
 * All peer totals are ADOPTED budgets read from each city's own budget
 * document, not proposals and not news summaries. Populations are U.S. Census
 * Bureau Vintage 2025 estimates (July 1, 2025) for every city, so the
 * denominator is consistent even where a city's own book uses its own count.
 */

export interface PeerCity {
  city: string;
  fy: string;
  total: number;
  population: number;
  /** What sits inside that total but not inside Portland's, or vice versa. */
  includes: string;
  water: "in" | "out" | "partial";
  electric: "in" | "out";
  schools: "in" | "out";
  county: "in" | "out";
  source: string;
  highlight?: boolean;
}

export const PEERS: PeerCity[] = [
  {
    city: "San Francisco",
    fy: "FY2026-27",
    total: 16_850_000_000,
    population: 826_079,
    includes:
      "A consolidated city-and-county: a $3.6B public health system, the sheriff, the airport and the transit agency are all inside this number.",
    water: "in",
    electric: "in",
    schools: "out",
    county: "in",
    source:
      "https://media.api.sf.gov/documents/Mayors_June_1st_Proposed_FY27_and_FY28_Budget_Budget_Book.pdf",
  },
  {
    city: "Portland",
    fy: "FY2026-27 adopted",
    total: 8_546_060_062,
    population: 635_109,
    includes:
      "City functions only. Schools are a separate $2.77B district; health, jail and courts belong to Multnomah County and are not here. No electric utility.",
    water: "in",
    electric: "out",
    schools: "out",
    county: "out",
    source: "https://www.portland.gov/budget/2026-2027-budget/development/adopted",
    highlight: true,
  },
  {
    city: "Seattle",
    fy: "2026 adopted",
    total: 8_950_522_000,
    population: 784_777,
    includes:
      "Includes Seattle City Light, a $1.81B municipal electric utility, plus Seattle Public Utilities at $1.78B — together 40% of the budget. Wastewater treatment is regional (King County).",
    water: "partial",
    electric: "in",
    schools: "out",
    county: "out",
    source:
      "https://www.seattle.gov/documents/Departments/FinanceDepartment/26adoptedbudget/Charts_and_Tables.pdf",
  },
  {
    city: "Austin",
    fy: "FY2025-26 adopted",
    total: 6_344_246_000,
    population: 1_002_632,
    includes:
      "Includes Austin Energy ($1.99B) and Austin Water ($850M) — 45% of the total. Operating only: Austin's capital plan is budgeted separately.",
    water: "in",
    electric: "in",
    schools: "out",
    county: "out",
    source: "https://austin.widen.net/content/gvs5vuvc3l/pdf/FY2025-2026_Approved_Budget.pdf",
  },
  {
    city: "Boston",
    fy: "FY2027",
    total: 4_942_000_000,
    population: 672_973,
    includes:
      "Includes $1.73B of public schools, 35% of the budget, but no water or sewer: those sit in a separate state-chartered commission.",
    water: "out",
    electric: "out",
    schools: "in",
    county: "out",
    source:
      "https://www.boston.gov/sites/default/files/file/2026/04/3-Volume%201%20-%20Operating%20Budget_0.pdf",
  },
  {
    city: "Denver",
    fy: "2026 adopted",
    total: 4_435_670_537,
    population: 740_613,
    includes:
      "A city AND county — jails, county courts, the DA and public health are all inside. But Denver Water is fully independent and outside the budget entirely.",
    water: "out",
    electric: "out",
    schools: "out",
    county: "in",
    source:
      "https://www.denvergov.org/files/assets/public/v/4/finance/documents/budget/2026/final-2026-budget-book.pdf",
  },
  {
    city: "Minneapolis",
    fy: "2026 adopted",
    total: 2_035_677_637,
    population: 430_324,
    includes:
      "No electric, no wastewater treatment (regional), and parks are outside the city budget entirely — the Park Board is independently elected with its own $160M levy.",
    water: "partial",
    electric: "out",
    schools: "out",
    county: "out",
    source:
      "https://lims.minneapolismn.gov/Download/FileV2/52795/2026%20Adopted%20Budget%20-%20reduced%20file%20size.pdf",
  },
  {
    city: "Sacramento",
    fy: "FY2026-27",
    total: 1_723_000_000,
    population: 536_449,
    includes:
      "Water collection only — sewer treatment and electricity are both separate regional agencies. The smallest scope of government on this list.",
    water: "partial",
    electric: "out",
    schools: "out",
    county: "out",
    source:
      "https://www.cityofsacramento.gov/content/dam/portal/finance/Budget/26-27-proposed/FY2026_27_Proposed_Operating_Budget_Web_v2.pdf",
  },
];

/** Police as a share of the general fund — the most misread table in local news. */
export interface PoliceShare {
  city: string;
  fy: string;
  police: number;
  generalFund: number;
  denominator: string;
  comparable: boolean;
  /** True where the city publishes the percentage itself. */
  published?: boolean;
  note?: string;
}

export const POLICE_SHARE: PoliceShare[] = [
  {
    city: "Austin",
    fy: "FY2025-26",
    police: 526_010_042,
    generalFund: 1_579_156_510,
    denominator: "General Fund",
    comparable: true,
    published: true,
    note: "Excludes Forensic Science, which Austin runs as its own department.",
  },
  {
    city: "Portland",
    fy: "FY2025-26",
    police: 265_600_000,
    generalFund: 806_400_000,
    denominator: "General Fund discretionary",
    comparable: true,
    note: "A share of discretionary General Fund — a deliberately narrower slice than peers quote.",
  },
  {
    city: "Minneapolis",
    fy: "2026",
    police: 229_262_097,
    generalFund: 708_057_064,
    denominator: "General Fund incl. transfers",
    comparable: true,
    note: "Excludes police pensions. Parks are outside the city budget entirely.",
  },
  {
    city: "Seattle",
    fy: "2026",
    police: 483_269_000,
    generalFund: 2_012_489_000,
    denominator: "General Fund",
    comparable: true,
    note: "Excludes the $22.5M police pension line, which Seattle budgets separately.",
  },
  {
    city: "Denver",
    fy: "2026",
    police: 280_421_884,
    generalFund: 1_676_329_510,
    denominator: "City-and-county General Fund",
    comparable: false,
    note: "Jails sit with the separate Sheriff ($174.3M). Counting both takes Denver to 27.1%.",
  },
  {
    city: "Boston",
    fy: "FY2027",
    police: 484_500_000,
    generalFund: 4_942_000_000,
    denominator: "General Fund including a $1.7B school district",
    comparable: false,
  },
  {
    city: "San Francisco",
    fy: "FY2026-27",
    police: 702_100_000,
    generalFund: 7_598_000_000,
    denominator: "General Fund including county health",
    comparable: false,
  },
];

/** The City's own three different totals for the same budget. */
export const COMPETING_TOTALS = [
  {
    label: "The adoption ordinance",
    value: 8_537_051_372,
    what: "Ordinance 192195, passed June 17 2026 — the legally adopted amount.",
    url: "https://www.portland.gov/council/documents/ordinance/passed/192195",
  },
  {
    label: "Requirements by major object",
    value: 8_546_060_062,
    what: "Budget book Vol 1, Figure 6. This is the figure our parsed fund detail reproduces to the dollar, so it is the one this page uses.",
    url: "https://www.portland.gov/budget/2026-2027-budget/development/adopted",
  },
  {
    label: "The fund summary table",
    value: 8_546_262_736,
    what: "Budget book Vol 1, citywide fund summary. Its prior-year column also matches our parse exactly.",
    url: "https://www.portland.gov/budget/2026-2027-budget/development/adopted",
  },
] as const;

export const LINCOLN_FISC =
  "https://www.lincolninst.edu/data/fiscally-standardized-cities/explanation-of-fiscally-standardized-cities/";

export const CENSUS_POP =
  "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/sub-est2025.csv";
