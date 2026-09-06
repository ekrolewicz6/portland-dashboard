/**
 * "Your Portland tax stack" deep-dive — data foundation.
 *
 * Every figure here is sourced. Numbers were verified against primary sources
 * (TSCC annual report and district budget reviews, the Multnomah County
 * certified Summary of Assessments & Taxes, city/county ACFRs, Metro SHS
 * year-end revenue reports, Oregon LRO "Basic Facts 2026", LFO 2025-27 Budget
 * Highlights, adopted budgets) in July 2026. Where a figure is an estimate,
 * a budget number rather than an actual, or rests on a secondary source, it
 * is labeled as such.
 *
 * Scope note: TAXES covers income, payroll, gross-receipts, flat and excise
 * taxes. Property taxes are modeled separately (PROPERTY_BILL_LINES,
 * PROPERTY_IMPOSED_FY26, MEASURE_5_50) because one property-tax bill spans
 * many governments and deserves its own anatomy.
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "analysis" | "news";
}

export const SOURCES: Record<string, Source> = {
  tscc26: {
    id: "tscc26",
    title: "Annual Report FY 2025-26 — property tax, urban renewal & debt",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/2_25-26-Gen-Info-Prop-Tax-URATIF-Outstanding-Debt-Info-2.pdf",
    kind: "primary",
  },
  countySal26: {
    id: "countySal26",
    title: "Summary of Assessments and Taxes 2025-2026 (certified 10/03/2025)",
    org: "Multnomah County Assessment & Taxation",
    url: "https://multco.us/file/2025-2026-summary-of-assessments-and-taxes/download",
    kind: "primary",
  },
  countyRates26: {
    id: "countyRates26",
    title: "Table of Consolidated Tax Rates for Levy Code Areas 2025-2026",
    org: "Multnomah County Assessment & Taxation",
    url: "https://multco.us/file/2025-2026-levy-code-rates/download",
    kind: "primary",
  },
  dorPropHistory: {
    id: "dorPropHistory",
    title: "A Brief History of Oregon Property Taxation (150-303-405-1)",
    org: "Oregon Department of Revenue",
    url: "https://www.oregon.gov/DOR/programs/gov-research/Documents/303-405-1.pdf",
    kind: "primary",
  },
  lroBasicFacts26: {
    id: "lroBasicFacts26",
    title: "2026 Oregon Public Finance: Basic Facts (Report #1-26, Feb 2026)",
    org: "Oregon Legislative Revenue Office",
    url: "https://www.oregonlegislature.gov/lro/Documents/Basic%20Facts%202026.pdf",
    kind: "primary",
  },
  lfoBudget2527: {
    id: "lfoBudget2527",
    title: "2025-27 Budget Highlights (October 2025)",
    org: "Oregon Legislative Fiscal Office",
    url: "https://www.oregonlegislature.gov/lfo/Documents/2025-27%20Budget%20Highlights.pdf",
    kind: "primary",
  },
  cityAcfr25: {
    id: "cityAcfr25",
    title: "Annual Comprehensive Financial Report, FY ended June 30, 2025",
    org: "City of Portland",
    url: "https://www.portland.gov/accounting/documents/2025-annual-comprehensive-financial-report-0/download",
    kind: "primary",
  },
  countyAcfr25: {
    id: "countyAcfr25",
    title: "Annual Comprehensive Financial Report, FY ended June 30, 2025",
    org: "Multnomah County",
    url: "https://multco.us/file/acfr_2025.pdf/download",
    kind: "primary",
  },
  shsYearEnd25: {
    id: "shsYearEnd25",
    title: "Supportive Housing Services — FY 2024-25 Revenue Year-End Summary",
    org: "Metro",
    url: "https://www.oregonmetro.gov/sites/default/files/2025-12/fy-2024-25-shs-year-end-report.pdf",
    kind: "primary",
  },
  shsAnnual25: {
    id: "shsAnnual25",
    title: "SHS Regional Annual Report FY 2024-25 (Regional Oversight Committee)",
    org: "Metro",
    url: "https://www.oregonmetro.gov/what-metro-does/housing-and-homelessness/supportive-housing-services/progress",
    kind: "primary",
  },
  metroShsFunding: {
    id: "metroShsFunding",
    title: "Supportive housing services funding (rates, thresholds, sunset)",
    org: "Metro",
    url: "https://www.oregonmetro.gov/what-metro-does/housing-and-homelessness/supportive-housing-services/funding",
    kind: "primary",
  },
  artsTaxDisbursements: {
    id: "artsTaxDisbursements",
    title: "Arts Education and Access Fund — revenues, collection costs and disbursements (Dec 2025)",
    org: "City of Portland Revenue Division",
    url: "https://www.portland.gov/revenue/documents/arts-education-and-access-fund-revenues-collection-costs-and-disbursements/download",
    kind: "primary",
  },
  artsOrdinance192185: {
    id: "artsOrdinance192185",
    title: "Ordinance 192185 — Arts Tax restructure (passed May 27, 2026)",
    org: "Portland City Council",
    url: "https://www.portland.gov/council/documents/ordinance/passed/192185",
    kind: "primary",
  },
  artsAudit26: {
    id: "artsAudit26",
    title: "Arts Tax audit (Auditor Simone Rede, March 18, 2026)",
    org: "Portland City Auditor",
    url: "https://efiles.portlandoregon.gov/record/17734582",
    kind: "primary",
  },
  bltPage: {
    id: "bltPage",
    title: "Business License Tax (rates, exemptions, joint city/county administration)",
    org: "City of Portland Revenue Division",
    url: "https://www.portland.gov/revenue/business-tax",
    kind: "primary",
  },
  bltOrdinance192163: {
    id: "bltOrdinance192163",
    title: "Ordinance 192163 — small-business exemption $50k→$75k→$100k (April 2026)",
    org: "Portland City Council",
    url: "https://www.portland.gov/council/documents/ordinance/passed/192163",
    kind: "primary",
  },
  countyBitPage: {
    id: "countyBitPage",
    title: "Multnomah County Business Income Tax (MCBIT)",
    org: "Multnomah County",
    url: "https://multco.us/info/multnomah-county-business-income-tax-mcbit",
    kind: "primary",
  },
  countyPfaPage: {
    id: "countyPfaPage",
    title: "Preschool for All personal income tax (rates, 2027 increase)",
    org: "Multnomah County",
    url: "https://multco.us/info/multnomah-county-preschool-all-personal-income-tax",
    kind: "primary",
  },
  cesPage: {
    id: "cesPage",
    title: "Clean Energy Surcharge (rate, who pays, exclusions)",
    org: "City of Portland Revenue Division",
    url: "https://www.portland.gov/revenue/business-tax/clean-energy-surcharge",
    kind: "primary",
  },
  pcefCip: {
    id: "pcefCip",
    title: "PCEF Climate Investment Plan ($1.59B allocation through FY 2028-29)",
    org: "City of Portland Bureau of Planning & Sustainability",
    url: "https://www.portland.gov/bps/cleanenergy/climate-investment-plan",
    kind: "primary",
  },
  dorCat: {
    id: "dorCat",
    title: "Corporate Activity Tax (rate, thresholds, Fund for Student Success)",
    org: "Oregon Department of Revenue",
    url: "https://www.oregon.gov/dor/programs/businesses/Pages/corporate-activity-tax.aspx",
    kind: "primary",
  },
  dorTransitRates: {
    id: "dorTransitRates",
    title: "Transit payroll tax rates (Pub 150-211-503, rev. Nov 2025)",
    org: "Oregon Department of Revenue",
    url: "https://www.oregon.gov/dor/forms/formspubs/transit-payroll-taxes_211-503.pdf",
    kind: "primary",
  },
  trimetBudget27: {
    id: "trimetBudget27",
    title: "FY2027 Adopted Budget (payroll-tax revenue, revenue shares)",
    org: "TriMet",
    url: "https://trimet.org/budget/pdf/2027-adopted-budget.pdf",
    kind: "primary",
  },
  trimetAcfr25: {
    id: "trimetAcfr25",
    title: "FY2025 Annual Comprehensive Financial Report",
    org: "TriMet",
    url: "https://trimet.org/about/pdf/finance/fy25-trimet-financials.pdf",
    kind: "primary",
  },
  fixingOurStreets: {
    id: "fixingOurStreets",
    title: "Fixing Our Streets — local gas tax fund (Measure 26-245 renewal, 2024)",
    org: "Portland Bureau of Transportation",
    url: "https://www.portland.gov/transportation/fixing-our-streets/local-gas-fund",
    kind: "primary",
  },
  countyVrf: {
    id: "countyVrf",
    title: "Multnomah County vehicle registration fee (Willamette River bridges)",
    org: "Multnomah County",
    url: "https://multco.us/info/vehicle-registration-fee",
    kind: "primary",
  },
  cityLodging: {
    id: "cityLodging",
    title: "Transient Lodgings Tax (city 6% + county 5.5% + TID 3%)",
    org: "City of Portland Revenue Division",
    url: "https://www.portland.gov/revenue/transient-lodgings-tax",
    kind: "primary",
  },
  cityCannabis: {
    id: "cityCannabis",
    title: "Recreational marijuana taxes (state 17% + Portland 3%)",
    org: "City of Portland Revenue Division",
    url: "https://www.portland.gov/revenue/marijuana",
    kind: "primary",
  },
  tsccCounty26: {
    id: "tsccCounty26",
    title: "Multnomah County FY 2025-26 budget review",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/Multnomah-County-FY-26-Budget-Review.pdf",
    kind: "primary",
  },
  tsccPps26: {
    id: "tsccPps26",
    title: "Portland Public Schools FY 2025-26 budget review",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/Portland-Public-School-District-FY-26-Budget-Review.pdf",
    kind: "primary",
  },
  tsccMetro26: {
    id: "tsccMetro26",
    title: "Metro FY 2025-26 budget review",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/Metro-FY-26-Budget-Review.pdf",
    kind: "primary",
  },
  tsccPort26: {
    id: "tsccPort26",
    title: "Port of Portland FY 2025-26 budget review",
    org: "Tax Supervising & Conservation Commission",
    url: "https://www.tsccmultco.com/wp-content/uploads/Port-of-Portland-FY-26-Budget-Review.pdf",
    kind: "primary",
  },
  metroBudget27: {
    id: "metroBudget27",
    title: "FY 2026-27 Proposed Budget (April 2026)",
    org: "Metro",
    url: "https://www.oregonmetro.gov/sites/default/files/2026-04/fy-2026-27-proposed-budget-20260403.pdf",
    kind: "primary",
  },
  parksLevy25: {
    id: "parksLevy25",
    title: "Parks Local Option Levy renewal, Measure 26-260 (Nov 2025) — $1.40/$1,000",
    org: "City of Portland / Multnomah County Elections",
    url: "https://multco.us/info/ballot-measure-26-260-city-portland",
    kind: "primary",
  },
  taxFoundationPortland: {
    id: "taxFoundationPortland",
    title: "Taxes in Portland, Oregon (combined top-marginal-rate ranking, 2025)",
    org: "Tax Foundation",
    url: "https://taxfoundation.org/location/oregon/",
    kind: "analysis",
  },
};

export type SourceId = keyof typeof SOURCES;

// ── The tax inventory (non-property taxes) ─────────────────────────

export type TaxKind =
  | "personal-income"
  | "business-income"
  | "gross-receipts"
  | "payroll"
  | "flat"
  | "excise";

export type Layer = "state" | "regional" | "county" | "city";

export interface TaxItem {
  id: string;
  name: string;
  /** Which government levies it (and which layer of the stack it sits in). */
  jurisdiction: string;
  layer: Layer;
  kind: TaxKind;
  /** Year voters or the legislature created it (or the current form of it). */
  enacted?: number;
  /** Human-readable current rate, incl. thresholds. */
  rate: string;
  whoPays: string;
  /** Latest-known annual revenue, in dollars. Omitted when unverifiable. */
  revenue?: number;
  revenuePeriod?: string;
  revenueBasis?: "actual" | "budget" | "estimate";
  fundsWhat: string;
  sources: SourceId[];
  notes?: string;
}

export const TAXES: TaxItem[] = [
  // ── State of Oregon ──
  {
    id: "or-pit",
    name: "Oregon personal income tax",
    jurisdiction: "State of Oregon",
    layer: "state",
    kind: "personal-income",
    rate: "4.75% / 6.75% / 8.75% / 9.9% — top rate starts at $125k single / $250k joint taxable income (top threshold is not inflation-indexed)",
    whoPays: "Oregon residents on all income; nonresidents on Oregon-source income",
    revenue: 13_073_000_000,
    revenuePeriod: "FY 2025",
    revenueBasis: "actual",
    fundsWhat:
      "85% of the state General Fund for 2025-27 — which pays for K-12 schools, Medicaid, prisons, courts, and most of state government",
    sources: ["lroBasicFacts26"],
    notes:
      "The 8.75% bracket starts at just $11,400 (single, TY2026), so nearly all middle incomes face an 8.75%+ marginal rate. FY2024 collections ($9.17B) were depressed by the record $5.6B kicker credit — don't read the FY24→FY25 jump as underlying growth. Oregon's PIT burden ranks #1 among states as a share of personal income (FY2023 Census data via LRO).",
  },
  {
    id: "or-corp",
    name: "Oregon corporate income/excise tax",
    jurisdiction: "State of Oregon",
    layer: "state",
    kind: "business-income",
    rate: "6.6% on taxable income up to $1M; 7.6% above $1M (plus a minimum tax tiered on Oregon sales, $150–$100,000)",
    whoPays: "C-corporations doing business in Oregon",
    revenue: 3_151_000_000,
    revenuePeriod: "2023-25 biennium",
    revenueBasis: "actual",
    fundsWhat:
      "State General Fund (second-largest source, ~9.4% of gross GF revenue in 2025-27); corporate 'kicker' surpluses go to K-12",
    sources: ["lroBasicFacts26"],
  },
  {
    id: "or-cat",
    name: "Oregon Corporate Activity Tax (CAT)",
    jurisdiction: "State of Oregon",
    layer: "state",
    kind: "gross-receipts",
    enacted: 2019,
    rate: "$250 + 0.57% of Oregon commercial activity above $1M (after a 35% subtraction for inputs or labor; groceries and fuel exempt)",
    whoPays: "Businesses with Oregon commercial activity over $1M, regardless of profit",
    revenue: 1_416_300_000,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "Dedicated to the Fund for Student Success (Student Investment Account ≥50%, statewide education initiatives, early learning) — ~$3.0B forecast for 2025-27",
    sources: ["dorCat", "lroBasicFacts26"],
    notes:
      "Enacted with the Student Success Act (HB 3427); the same act cut the bottom three PIT rates from 5/7/9% to 4.75/6.75/8.75%. Census counts the CAT as a 'general sales tax', a footnote worth carrying on any 'Oregon has no sales tax' claim.",
  },
  {
    id: "or-transit",
    name: "Oregon statewide transit tax",
    jurisdiction: "State of Oregon",
    layer: "state",
    kind: "payroll",
    enacted: 2017,
    rate: "0.1% of wages (employee-paid, employer-withheld)",
    whoPays: "All Oregon resident wage earners + nonresidents' Oregon-source wages",
    revenue: 135_500_000,
    revenuePeriod: "FY 2024",
    revenueBasis: "actual",
    fundsWhat:
      "Statewide Transportation Improvement Fund (STIF): 90% to transit districts by formula, 5% discretionary grants, 4% intercity transit, 1% technical resource center",
    sources: ["lroBasicFacts26", "dorTransitRates"],
    notes:
      "HB 3991 (Nov 2025 special session) would have doubled this to 0.2% on Jan 1, 2026; a veto referendum qualified and Measure 120 failed ~83%-17% in May 2026, so the rate stays 0.1%.",
  },

  // ── Metro (regional government) ──
  {
    id: "metro-shs",
    name: "Metro Supportive Housing Services (SHS) taxes",
    jurisdiction: "Metro",
    layer: "regional",
    kind: "personal-income",
    enacted: 2020,
    rate: "1% on taxable income above $128k single / $205k joint (TY2026, CPI-indexed since 2026) + 1% on net income of businesses with gross receipts over $5M",
    whoPays:
      "Higher earners and larger businesses in the urban parts of Multnomah, Washington and Clackamas counties",
    revenue: 324_964_017,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "Homeless services via the three counties (Multnomah 45.3% / Washington 33.3% / Clackamas 21.3%): supportive housing, rent assistance, shelter. Through June 2025: 14,936 people moved into permanent housing; 33,456 received prevention assistance",
    sources: ["shsYearEnd25", "shsAnnual25", "metroShsFunding"],
    notes:
      "Measure 26-210 (May 2020, ~57-58% yes) projected ~$250M/yr; collections peaked at $347.0M (FY23). Personal component FY25: $203.7M. Expires after tax year 2030 — Metro drafted a renewal (extend to 2050, cut personal rate to 0.75%) but did not refer it to the Nov 2025 ballot; no renewal referred as of July 2026.",
  },

  // ── Multnomah County ──
  {
    id: "mult-pfa",
    name: "Preschool for All (PFA) personal income tax",
    jurisdiction: "Multnomah County",
    layer: "county",
    kind: "personal-income",
    enacted: 2020,
    rate: "1.5% on taxable income above $125k single / $200k joint, plus another 1.5% (3.0% total) above $250k / $400k; a 0.8-point increase is scheduled for Jan 1, 2027",
    whoPays: "Higher earners in Multnomah County (residents and county-source income)",
    revenue: 203_377_000,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "Universal preschool build-out: ~3,800 funded seats at 200+ sites in FY26 (up from 2,225 in FY25); universality targeted for 2030",
    sources: ["countyPfaPage", "countyAcfr25"],
    notes:
      "Measure 26-214 (Nov 2020). Collections ran $40M over budget in FY25 ($203.4M vs $163.0M); the fund balance reached $610.0M on June 30, 2025 while the county General Fund ran a deficit — Gov. Kotek publicly urged easing the tax. The scheduled 2026 rate increase was delayed to 2027 (Sept 2024 board vote); threshold inflation-indexing was proposed and postponed (Aug 2025). Thresholds are not indexed.",
  },
  {
    id: "mult-bit",
    name: "Multnomah County Business Income Tax (BIT)",
    jurisdiction: "Multnomah County",
    layer: "county",
    kind: "business-income",
    rate: "2.0% of apportioned net business income (gross-receipts exemption under $100k; $100 minimum)",
    whoPays: "Businesses with activity in Multnomah County",
    revenue: 157_000_000,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "County General Fund (second-largest source after property tax): jails, DA, health clinics, homeless services, bridges; a share goes to east-county cities",
    sources: ["countyBitPage", "countyAcfr25"],
    notes:
      "Raised from 1.45% to 2.0% by board vote in March 2020 (first permanent increase since 1987). Collected by the City of Portland Revenue Division under the joint administration in place since 1993.",
  },
  {
    id: "mult-vrf",
    name: "Multnomah County vehicle registration fee",
    jurisdiction: "Multnomah County",
    layer: "county",
    kind: "flat",
    enacted: 2009,
    rate: "$56 per vehicle per year ($112 at a standard two-year renewal; $39/yr motorcycles)",
    whoPays: "Owners of vehicles registered in Multnomah County",
    fundsWhat:
      "Legally restricted to the county's Willamette River bridges — enacted at $19/yr for the Sellwood Bridge replacement, raised to $56 in 2021 for the Earthquake Ready Burnside Bridge",
    sources: ["countyVrf"],
    notes:
      "Annual revenue is not published in an easily citable primary source; roughly low-$30Ms/yr by arithmetic. Treat as unverified until confirmed from county road-fund documents.",
  },
  {
    id: "mult-gas",
    name: "Multnomah County gas tax",
    jurisdiction: "Multnomah County",
    layer: "county",
    kind: "excise",
    rate: "3¢ per gallon countywide",
    whoPays: "Drivers buying fuel in Multnomah County",
    revenue: 5_700_000,
    revenuePeriod: "latest reported (county FY26 budget policies)",
    revenueBasis: "actual",
    fundsWhat: "County road fund — road and Willamette River bridge maintenance",
    sources: ["tsccCounty26"],
  },

  // ── City of Portland ──
  {
    id: "pdx-blt",
    name: "Portland Business License Tax (BLT)",
    jurisdiction: "City of Portland",
    layer: "city",
    kind: "business-income",
    rate: "2.6% of apportioned net business income (2.2% before 2018); gross-receipts exemption $50k, rising to $75k (TY2026) and $100k (TY2027); $100 minimum",
    whoPays: "Businesses with activity in Portland",
    revenue: 195_944_258,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "City General Fund — the second-largest GF revenue source after property taxes; pays for police, fire, parks and general operations",
    sources: ["bltPage", "cityAcfr25", "bltOrdinance192163"],
    notes:
      "Combined with the county BIT and Metro SHS business tax, a profitable Portland business pays up to 5.6% of net income in local income taxes before state (6.6-7.6%) and the CAT. FY25 came in $12.7M under forecast after tariff announcements hit quarterly estimated payments (ACFR).",
  },
  {
    id: "pdx-arts",
    name: "Portland Arts Tax",
    jurisdiction: "City of Portland",
    layer: "city",
    kind: "flat",
    enacted: 2012,
    rate: "$35 per income-earning adult through TY2026; from TY2027: $50 single / $100 joint, filing threshold $20k/$40k Oregon taxable income, CPI-indexed (Ordinance 192185, May 2026)",
    whoPays:
      "Portland residents 18+ with ≥$1,000 income in households above the federal poverty level (through TY2026; the poverty test is eliminated from TY2027)",
    revenue: 11_893_024,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "K-5 arts and music teachers across six school districts ($7.8M in FY25 — one FTE per 500 K-5 students; 111 FTE in 2023-24 vs 31 before the tax) plus arts-access grants ($2.1M)",
    sources: ["artsTaxDisbursements", "artsOrdinance192185", "artsAudit26"],
    notes:
      "Collection costs ran ~16% of FY25 collections ($1.96M) — the March 2026 city audit made 12 recommendations and found the city overpaid districts ~$1.3M in FY23-24. Compliance is commonly reported near 75% but no primary document states a rate.",
  },
  {
    id: "pdx-ces",
    name: "Clean Energy Surcharge (PCEF)",
    jurisdiction: "City of Portland",
    layer: "city",
    kind: "gross-receipts",
    enacted: 2018,
    rate: "1% of Portland retail sales of 'large retailers' (≥$1B national and ≥$500k Portland sales; groceries, medicine, health care and utilities excluded)",
    whoPays: "Large retailers on Portland gross receipts (not profit)",
    revenue: 167_217_977,
    revenuePeriod: "FY 2024-25",
    revenueBasis: "actual",
    fundsWhat:
      "Portland Clean Energy Community Benefits Fund: clean-energy retrofits for low-income homes, transportation decarbonization, tree planting, workforce development, Cooling Portland — a $1.59B Climate Investment Plan through FY 2028-29",
    sources: ["cesPage", "pcefCip", "cityAcfr25"],
    notes:
      "Measure 26-201 (Nov 2018, 65% yes) was campaigned at $40-60M/yr; actual collections ran $167-199M/yr in FY23-25 (~3-4×). Fund balance: $738.4M at June 30, 2025. Councils have repeatedly tapped it — $386.99M of bureau-led programs folded into the CIP (Dec 2024), ~$19M then $26.9M of interest earnings transferred to the General Fund (FY26, FY27 budgets), and a contested $75M Moda Center idea (2026, unresolved).",
  },
  {
    id: "pdx-gas",
    name: "Portland gas tax (Fixing Our Streets)",
    jurisdiction: "City of Portland",
    layer: "city",
    kind: "excise",
    enacted: 2016,
    rate: "10¢ per gallon (plus a companion Heavy Vehicle Use Tax on trucks over 13 tons)",
    whoPays: "Drivers buying fuel in Portland",
    revenue: 17_600_000,
    revenuePeriod: "2024-28 cycle, per-year estimate ($70.5M over 4 years)",
    revenueBasis: "estimate",
    fundsWhat:
      "PBOT street paving, high-crash-corridor safety, neighborhood streets and Safe Routes to School, with a citizen oversight committee",
    sources: ["fixingOurStreets"],
    notes:
      "Renewed three times, most recently Measure 26-245 (May 2024, ~72% yes). ~$150M raised 2016-2024.",
  },
  {
    id: "pdx-lodging",
    name: "Lodging taxes (city + county + TID + state)",
    jurisdiction: "City of Portland / Multnomah County / State",
    layer: "city",
    kind: "excise",
    rate: "16% total on a Portland hotel or short-term-rental bill: city 6% + county 5.5% + Tourism Improvement District 3% + state 1.5% (plus $4/night on STRs where applicable)",
    whoPays: "Visitors (collected by lodging operators and booking platforms)",
    revenue: 25_000_000,
    revenuePeriod: "FY 2025-26 (city General Fund share only)",
    revenueBasis: "budget",
    fundsWhat:
      "City share: 5 points to the General Fund, 1 point to Travel Portland; county share largely services Convention Center debt; TID funds tourism promotion",
    sources: ["cityLodging", "cityAcfr25"],
    notes:
      "The city's ~$25M is the CBO's revised FY25-26 General Fund forecast (down from $28M; receipts 'essentially flat'). County TLT budgeted $35.7M in FY25. Component enactment years not verified primary.",
  },
  {
    id: "pdx-cannabis",
    name: "Portland cannabis tax",
    jurisdiction: "City of Portland",
    layer: "city",
    kind: "excise",
    enacted: 2016,
    rate: "3% local tax on recreational sales (on top of the state's 17% — 20% at a Portland register)",
    whoPays: "Recreational cannabis buyers in Portland",
    revenue: 8_000_000,
    revenuePeriod: "FY 2023-24 (fund resources incl. carryover)",
    revenueBasis: "estimate",
    fundsWhat:
      "Recreational Cannabis Tax Fund: drug treatment and education, Vision Zero traffic safety, Portland Street Response, and small-business grants in communities harmed by prohibition",
    sources: ["cityCannabis"],
    notes:
      "Measure 26-180 (Nov 2016). Revenues have declined since FY22-23; Council cut ongoing allocations 22% starting FY24-25. Exact FY24-25 receipts not published in fetched sources.",
  },

  // ── TriMet ──
  {
    id: "trimet-payroll",
    name: "TriMet employer payroll tax",
    jurisdiction: "TriMet",
    layer: "regional",
    kind: "payroll",
    rate: "0.8237% of wages for work performed in the TriMet district (employer-paid; equivalent rate on self-employment earnings)",
    whoPays: "Employers and the self-employed within the district (parts of Multnomah, Washington, Clackamas counties)",
    revenue: 522_193_732,
    revenuePeriod: "FY 2025",
    revenueBasis: "actual",
    fundsWhat:
      "TriMet bus, MAX, WES and LIFT operations — 58.8% of TriMet's FY2027 budgeted revenue, its largest source (fares are ~6%)",
    sources: ["dorTransitRates", "trimetBudget27", "trimetAcfr25"],
    notes:
      "Jan 1, 2025 was the final step of the legislature-authorized 2003/2009 phased increases — no further step-ups are scheduled, which TriMet's FY27 budget flags as a structural risk (it drew $187.4M of reserves and cut ~504 positions).",
  },
];

// ── Property tax: anatomy of a standard Portland bill (FY 2025-26) ──
// Rates per $1,000 of ASSESSED value for a standard Portland/PPS levy code
// area (e.g. TCA 201; the citywide range is ~$22.57-$27.33 depending on
// school district and levy code). These are extended billing rates before
// Measure 5 compression. Shares should be computed from the rates so the
// math stays internally consistent.

export interface PropertyBillLine {
  district: string;
  /** Operating taxes (permanent rate + local option + FPDR-type levies). */
  limited: number;
  /** Voter-approved GO bond debt (exempt from Measure 5 caps). */
  bond: number;
  note?: string;
}

export const PROPERTY_BILL_FY26 = {
  taxCodeArea: "TCA 201 (standard Portland / PPS)",
  totalPer1000AV: 26.9449,
  fiscalYear: "FY 2025-26",
  source: "countyRates26" as SourceId,
} as const;

export const PROPERTY_BILL_LINES: PropertyBillLine[] = [
  {
    district: "Portland Public Schools",
    limited: 7.1296,
    bond: 2.4397,
    note: "Permanent rate + 'gap' levy + local option ($1.99, compressed to ~$1.48 effective) + the 2012/2017/2020/2025 construction bonds",
  },
  {
    district: "City of Portland",
    limited: 8.5636,
    bond: 0.388,
    note: "Permanent rate 4.5770 + FPDR pension levy 2.9874 (see the FPDR deep-dive) + Parks levy 0.80 + Children's Levy 0.4026",
  },
  {
    district: "Multnomah County",
    limited: 5.4632,
    bond: 0.5552,
    note: "Permanent rate 4.3434 + Library District 1.22 + Historical Society 0.05 + library construction bond",
  },
  {
    district: "Portland Community College",
    limited: 0.2756,
    bond: 0.3458,
    note: "Includes the 2022 $450M bond",
  },
  {
    district: "Urban renewal (Prosper Portland)",
    limited: 0.5928,
    bond: 0,
    note: "Division-of-tax across six active TIF plan areas; $46.2M imposed in FY26 (+22% y/y as new districts came online)",
  },
  { district: "Metro", limited: 0.1902, bond: 0.3756, note: "Operating rate funds the Oregon Zoo; bonds are parks/nature + affordable housing" },
  { district: "Multnomah Education Service District", limited: 0.4455, bond: 0 },
  { district: "East Multnomah Soil & Water Conservation District", limited: 0.0983, bond: 0 },
  { district: "Port of Portland", limited: 0.0684, bond: 0, note: "~1% of Port resources; by policy no property tax supports PDX airport" },
  { district: "Urban Flood Safety & Water Quality District", limited: 0, bond: 0.0134 },
];

// ── Property tax: who the $2.5B actually goes to (FY 2025-26 roll) ──
// "Imposed" = after Measure 50 and Measure 5 limits, certified county roll.
// Multnomah County roll only (multi-county districts also collect small
// amounts in Washington/Clackamas counties).

export interface ImposedTaxRow {
  district: string;
  imposed: number;
  detail?: string;
}

export const PROPERTY_IMPOSED_FY26: ImposedTaxRow[] = [
  {
    district: "City of Portland",
    imposed: 709_471_750,
    detail: "Operating (incl. FPDR) $600.7M + local option levies $75.4M + bonds $33.4M",
  },
  {
    district: "Portland Public Schools",
    imposed: 657_801_990,
    detail: "Permanent + gap $369.3M + local option $108.8M + bonds $179.7M",
  },
  {
    district: "Multnomah County",
    imposed: 608_476_407,
    detail: "Operating $425.9M + Library District $119.6M + Historical Society $4.0M + bonds $58.9M",
  },
  {
    district: "Other east-county school districts",
    imposed: 195_400_000,
    detail: "Gresham-Barlow, Reynolds, David Douglas, Parkrose, Centennial, Riverdale, Scappoose, Corbett (combined, approx.)",
  },
  { district: "Urban renewal (all agencies)", imposed: 61_048_499, detail: "Prosper Portland $48.9M extended / $46.2M imposed + east-county agencies" },
  { district: "Metro", imposed: 56_367_944 },
  { district: "Portland Community College", imposed: 46_260_237 },
  { district: "Multnomah ESD", imposed: 45_619_640 },
  { district: "Mt. Hood Community College", imposed: 21_748_016 },
  { district: "East + West Multnomah SWCDs", imposed: 9_096_514 },
  { district: "Port of Portland", imposed: 6_887_688 },
];

// ── Measure 5 / Measure 50 mechanics ───────────────────────────────

export const MEASURE_5_50 = {
  /** Measure 5 (1990): operating-tax caps per $1,000 of REAL MARKET value. */
  m5EducationCapPer1000RMV: 5,
  m5GeneralGovCapPer1000RMV: 10,
  m5BondsExempt: true,
  /** Measure 50 (1997): assessed value set at 1995-96 value minus 10%,... */
  m50BaseYear: "1995-96 minus 10%",
  /** ...then Maximum Assessed Value grows at most 3%/year. */
  m50AvGrowthCap: 0.03,
  /** Countywide result, FY 2025-26: assessed value is ~49% of market value. */
  avShareOfRmvCountywide: 0.49,
  avShareOfRmvResidential: 0.48,
  countyTotalRMV: 217_464_000_000,
  countyTotalAV: 105_677_000_000,
  /** Revenue lost to Measure 5 compression, Multnomah County FY 2025-26. */
  compressionLossFY26: 147_994_886,
  /** Local option levies are compressed FIRST — 25% of them vanished in FY26. */
  localOptionCompressionShare: 0.25,
  /** Compression's bite is growing: 4% of operating taxes (FY24) → 6% (FY26). */
  compressionShareFY24: 0.04,
  compressionShareFY26: 0.06,
  sources: ["dorPropHistory", "tscc26", "countySal26"] as SourceId[],
} as const;

// ── Each government's budget & what it spends on ───────────────────

export interface SpendingSlice {
  label: string;
  share: number;
  note?: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  layer: Layer | "district";
  oneLiner: string;
  budget: number;
  budgetPeriod: string;
  budgetBasis: "adopted" | "approved" | "proposed";
  /** Shares of spending (basis noted per entry); shares sum to ~1. */
  spendingMix?: SpendingSlice[];
  spendingMixBasis?: string;
  revenueNote: string;
  sources: SourceId[];
  notes?: string;
}

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "oregon",
    name: "State of Oregon",
    layer: "state",
    oneLiner: "Schools, Medicaid, prisons, courts, universities, human services",
    budget: 39_137_900_000,
    budgetPeriod: "2025-27 biennium (General Fund $37.3B + Lottery $1.8B; all-funds $138.9B)",
    budgetBasis: "adopted",
    spendingMix: [
      { label: "Education (K-12 + post-secondary)", share: 0.395, note: "State School Fund alone is $10.5B GF+Lottery (~$11.4B with CAT funds)" },
      { label: "Human services (Medicaid/OHA + ODHS)", share: 0.353 },
      { label: "Public safety & corrections", share: 0.124 },
      { label: "Judicial", share: 0.023 },
      { label: "Everything else", share: 0.105 },
    ],
    spendingMixBasis: "General Fund + Lottery Funds, 2025-27 legislatively adopted (LFO)",
    revenueNote:
      "Personal income tax is 85% of the General Fund; corporate taxes ~9%; no sales tax; the state levies no property tax",
    sources: ["lfoBudget2527", "lroBasicFacts26"],
  },
  {
    id: "metro",
    name: "Metro",
    layer: "regional",
    oneLiner:
      "Homeless services funding, Oregon Zoo, Convention Center, regional parks, garbage system, land-use planning",
    budget: 1_630_516_204,
    budgetPeriod: "FY 2026-27",
    budgetBasis: "proposed",
    spendingMix: [
      { label: "Housing & homeless services (SHS + housing bond)", share: 0.47 },
      { label: "Venues, parks, waste & planning operations", share: 0.34 },
      { label: "Debt service", share: 0.08 },
      { label: "Capital & natural-area acquisition", share: 0.1 },
    ],
    spendingMixBasis: "share of current expenditures, FY 2026-27 proposed",
    revenueNote:
      "SHS income taxes are 43% of current revenues; enterprise revenue (tip fees, zoo, venues) 28%; property taxes 16% (rate ~$0.58/$1,000 incl. bonds)",
    sources: ["metroBudget27", "tsccMetro26"],
    notes:
      "FY 2025-26 adopted was $1.86B; the FY 2026-27 adopted document was not yet posted as of early July 2026 — treat $1.63B as proposed, near-final. Headline totals include large fund balances (unspent bond proceeds and SHS reserves).",
  },
  {
    id: "multco",
    name: "Multnomah County",
    layer: "county",
    oneLiner:
      "Health department, jails & sheriff, DA, homeless services, preschool, elections, bridges, SUN schools",
    budget: 4_002_065_887,
    budgetPeriod: "FY 2025-26 (FY 2026-27 adopted holds ~$4.0B, closing an $11M GF gap, cutting 158+ FTE)",
    budgetBasis: "approved",
    spendingMix: [
      { label: "Public safety (Sheriff, DA, corrections)", share: 0.42 },
      { label: "Health & human services", share: 0.37 },
      { label: "General government & everything else", share: 0.21 },
    ],
    spendingMixBasis: "General Fund (~$897M), FY 2025-26",
    revenueNote:
      "Current revenues: intergovernmental 32%, fees/charges 30%, property taxes 18% (permanent rate $4.3434), other taxes 17% (BIT $176M + PFA $175M budgeted, rental car, lodging, gas)",
    sources: ["tsccCounty26", "countyAcfr25"],
  },
  {
    id: "portland",
    name: "City of Portland",
    layer: "city",
    oneLiner: "Police, fire, parks, transportation, water/sewer, housing, permitting",
    budget: 8_500_000_000,
    budgetPeriod: "FY 2026-27 (all funds, adopted June 2026)",
    budgetBasis: "adopted",
    revenueNote:
      "General Fund leans on property taxes and the 2.6% Business License Tax (~$196M actual FY25); utility rates fund water/sewer; PCEF, gas tax and lodging taxes are dedicated funds",
    sources: ["cityAcfr25"],
    notes:
      "The site's Budget Explorer covers the City General Fund in depth (src/data/general-fund-budget) — this dive links there rather than duplicating it. The ~$8.5B all-funds figure is from June 2026 adoption coverage; confirm against the adopted budget document when posted.",
  },
  {
    id: "pps",
    name: "Portland Public Schools",
    layer: "district",
    oneLiner: "Oregon's largest school district: ~44,000 students, 81 schools",
    budget: 2_040_000_000,
    budgetPeriod: "FY 2025-26 (all funds; General Fund $868.6M). FY 2026-27 adopted: $2.77B, inflated by 2025-bond construction while the GF shrank ~$6.5M (320 positions cut)",
    budgetBasis: "approved",
    spendingMix: [
      { label: "Instruction", share: 0.28 },
      { label: "Support services", share: 0.23 },
      { label: "Facilities & construction (bond-driven)", share: 0.33 },
      { label: "Debt service", share: 0.14 },
      { label: "Other", share: 0.02 },
    ],
    spendingMixBasis: "FY 2025-26 requirements by function (TSCC)",
    revenueNote:
      "Property taxes ~45% of current revenues (permanent $5.2781 + local option $1.99 + bonds ~$2.33 per $1,000); State School Fund ~34%. Enrollment is 12.7% below pre-pandemic",
    sources: ["tsccPps26"],
    notes:
      "The 2025 $1.83B bond is the largest school bond in Oregon history. The Portland Children's Levy on the tax bill is CITY money, not PPS.",
  },
  {
    id: "trimet",
    name: "TriMet",
    layer: "regional",
    oneLiner: "Bus, MAX light rail, WES commuter rail, LIFT paratransit",
    budget: 1_746_700_000,
    budgetPeriod: "FY 2027 (total resources incl. $793.5M beginning fund balance)",
    budgetBasis: "adopted",
    revenueNote:
      "Employer payroll tax 58.8% of budgeted revenue; federal ~13%; fares ~6%. Levies no property tax",
    sources: ["trimetBudget27"],
    notes:
      "FY27 closed an operating gap with $187.4M of reserves and ~504 fewer positions; the payroll-tax rate hit its final authorized step in 2025.",
  },
  {
    id: "port",
    name: "Port of Portland",
    layer: "district",
    oneLiner: "PDX airport, marine terminals, industrial parks, channel dredging",
    budget: 2_680_000_000,
    budgetPeriod: "FY 2025-26 (only ~44% is operating expenditure)",
    budgetBasis: "approved",
    revenueNote:
      "Almost entirely enterprise revenue (PDX rentals/concessions $414.8M); property taxes are ~1% of resources ($17.3M at $0.0701/$1,000) and by policy none supports the airport",
    sources: ["tsccPort26"],
  },
];

// ── Headline figures ───────────────────────────────────────────────

export const HEADLINE = {
  /** Distinct taxing districts itemized on a standard Portland property bill. */
  districtsOnPropertyBill: PROPERTY_BILL_LINES.length,
  /** Total property tax imposed on the FY 2025-26 Multnomah County roll. */
  propertyTaxImposedFY26: 2_498_428_332,
  /** Per capita (population 805,583). */
  propertyTaxPerCapitaFY26: 3_122,
  /** Standard Portland/PPS extended rate per $1,000 of assessed value. */
  standardRatePer1000AV: 26.9449,
  /**
   * Top combined marginal personal income-tax rate on Portland wage income:
   * Oregon 9.9% + Preschool for All 3.0% + Metro SHS 1.0% = 13.9% (computed
   * from primary rate schedules above). The Tax Foundation, adding payroll
   * taxes, ranks Portland's combined top rate 2nd-highest in the U.S. after
   * NYC. The PFA increase scheduled for 2027 would push this to 14.7%.
   */
  topMarginalLocalStateIncome: 13.9,
  /**
   * Annual revenue of the three big voter-approved taxes of 2018-2020, at
   * FY 2024-25 actuals: PCEF $167.2M + Metro SHS $325.0M + PFA $203.4M.
   */
  voterTaxes2018to2020AnnualRevenue: 695_600_000,
  /** What campaigns projected for those three, per year, combined (~$50M + ~$250M + ~$133M). */
  voterTaxes2018to2020ProjectedRevenue: 433_000_000,
  /** Combined idle reserves: PCEF $738.4M + PFA $610.0M (June 30, 2025). */
  dedicatedFundBalances: 1_348_000_000,
  /** Median assessed value, Portland-area home (official levy materials). */
  medianAssessedValue: 221_600,
  /** ≈ median AV × standard rate — an estimate; the assessor publishes no median bill. */
  estimatedMedianTaxBill: 5_970,
} as const;

// ── Refresh checklist (what changes and when) ──────────────────────
// FY 2026-27 numbers land in fall 2026: the new $1.40 Parks levy (Measure
// 26-260) raises the standard Portland rate ~$0.60; the FPDR levy rises to
// $279.2M ($3.1906/$1,000); the county certifies the new roll in October;
// TSCC publishes its FY 2026-27 report in December. Decisions pending as of
// July 2026: the PFA 0.8-point increase scheduled for Jan 1, 2027; a Metro
// SHS renewal referral (none yet); Arts Tax $50/$100 rates first apply TY2027.

export const DATA_VINTAGE = "2026-07" as const;
