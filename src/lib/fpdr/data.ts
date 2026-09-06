/**
 * Portland FPDR (Fire & Police Disability and Retirement) deep-dive data.
 *
 * Every figure here is sourced. Numbers were verified against primary sources
 * (Milliman actuarial valuations, Multnomah County tax certifications, City
 * ordinances and budget documents) in June 2026. Where a figure is an estimate,
 * a reconstruction, or an illustrative interpolation, it is labeled as such.
 *
 * Plain-language note: this dataset is intentionally written so the explainer
 * page can stay readable for a general audience while remaining defensible.
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "actuarial" | "news" | "opinion" | "analysis";
}

export const SOURCES: Record<string, Source> = {
  milliman2024: {
    id: "milliman2024",
    title: "FPDR Pension Actuarial Valuation as of June 30, 2024",
    org: "Milliman, Inc.",
    url: "https://efiles.portlandoregon.gov/record/17165020/file/document",
    kind: "actuarial",
  },
  millimanLevy2025: {
    id: "millimanLevy2025",
    title: "FPDR Levy Adequacy Analysis (presented Jan 28, 2025)",
    org: "Milliman, Inc.",
    url: "https://efiles.portlandoregon.gov/record/17165019/file/document",
    kind: "actuarial",
  },
  fiveYearPlan: {
    id: "fiveYearPlan",
    title: "FPDR FYE 2025–29 Five-Year Plan",
    org: "City of Portland",
    url: "https://www.portland.gov/budget/2024-2025-budget/documents/fire-police-disability-retirement-fund-5-yr-fy24-25/download",
    kind: "primary",
  },
  charter5: {
    id: "charter5",
    title: "Portland City Charter, Chapter 5",
    org: "City of Portland",
    url: "https://www.portland.gov/charter/5",
    kind: "primary",
  },
  county2526: {
    id: "county2526",
    title: "Summary of Assessments and Taxes 2025–2026",
    org: "Multnomah County",
    url: "https://multco.us/file/2025-2026-summary-of-assessments-and-taxes/download",
    kind: "primary",
  },
  fin377: {
    id: "fin377",
    title: "FIN-3.77 — Fire & Police Disability & Retirement Fund (Fund 800)",
    org: "City of Portland",
    url: "https://www.portland.gov/charter-code-policies/documents/fin-377-fire-police-disability-retirement-fund-fund-800/download",
    kind: "primary",
  },
  measure2686: {
    id: "measure2686",
    title: "November 7, 2006 Election Abstracts (Measure 26-86)",
    org: "Multnomah County",
    url: "https://multco.us/info/november-7-2006-abstracts",
    kind: "primary",
  },
  moro: {
    id: "moro",
    title: "Moro v. State of Oregon (2015)",
    org: "Oregon Supreme Court",
    url: "https://caselaw.findlaw.com/or-supreme-court/1699571.html",
    kind: "primary",
  },
  machizDeck: {
    id: "machizDeck",
    title: "FPDR Funding Policy (analysis filed with the City)",
    org: "Kevin Machiz, CFA, FRM",
    url: "https://efiles.portlandoregon.gov/Record/16246455/File/Document/",
    kind: "analysis",
  },
  machizOpEd: {
    id: "machizOpEd",
    title:
      "Opinion: Growing pension burden on Portland property tax bills shows need for leaders to step in",
    org: "Kevin Machiz / OregonLive",
    url: "https://www.oregonlive.com/opinion/2024/11/opinion-growing-pension-burden-on-portland-property-tax-bills-shows-need-for-leaders-to-step-in.html",
    kind: "opinion",
  },
  wweek2023: {
    id: "wweek2023",
    title:
      "Financial Analyst New to Portland Lobbies Against Costly, Antiquated Pension System",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/2023/10/25/financial-analyst-new-to-portland-lobbies-against-costly-antiquated-pension-system/",
    kind: "news",
  },
  streetRoots2022: {
    id: "streetRoots2022",
    title: "One of the most expensive pensions in the country",
    org: "Street Roots",
    url: "https://www.streetroots.org/news/2022/08/25/pensions",
    kind: "news",
  },
  publicPlansData: {
    id: "publicPlansData",
    title: "Public Plans Database — plan comparison",
    org: "Center for Retirement Research, Boston College",
    url: "https://publicplansdata.org/quick-facts/by-pension-plan/plan/?ppd_id=140",
    kind: "analysis",
  },
  moodys2024: {
    id: "moodys2024",
    title: "City of Portland retains Aaa credit rating (March 2024)",
    org: "City of Portland / Moody's",
    url: "https://www.portland.gov/wheeler/news/2024/3/13/city-portland-retains-aaa-credit-rating",
    kind: "news",
  },
  spGlobal2026: {
    id: "spGlobal2026",
    title: "Portland, OR 2026A/B Limited Tax Bonds — 'AA' Rating, Stable Outlook",
    org: "S&P Global Ratings",
    url: "https://www.portland.gov/debt/documents/sp-global-ratings-most-recent-credit-opinion/download",
    kind: "primary",
  },
  fiveYearPlan2731: {
    id: "fiveYearPlan2731",
    title: "FPDR FYE 2027–31 Five-Year Plan (levy-rate & assessed-value forecast)",
    org: "City of Portland",
    url: "https://efiles.portlandoregon.gov/record/17862793/file/document",
    kind: "primary",
  },
};

// ── Headline figures (verified) ───────────────────────────────────

/** The numbers that anchor the whole story. */
export const HEADLINE = {
  /** Actuarial accrued liability — what FPDR owes, in today's dollars. */
  liability: 3_907_867_099,
  /** Money actually set aside in a trust to pay for it. */
  assets: 17_917_971,
  /** assets / liability */
  fundedRatio: 0.0046,
  /** FY2025-26 levy certified by Multnomah County. */
  annualLevyFY26: 251_613_821,
  /** FY2026-27 levy just approved by Council. */
  annualLevyFY27: 279_235_522,
  /** FY2025-26 FPDR rate, per $1,000 of *assessed* value. */
  ratePer1000AV_FY26: 2.9874,
  /** Charter cap, per $1,000 of *real market* value. */
  capPer1000RMV: 2.8,
  /**
   * FPDR's share of the City of Portland's total property-tax levy.
   * FY2026-27: FPDR levy $279.2M / total City levy ~$868.5M ≈ 0.32–0.34 depending
   * on the denominator (gross levy, ex-debt, or net collections). Uses the
   * "Taxes Necessary to Balance" basis. Source: FY26-27 City tax levy ordinance.
   * (Earlier the page used 0.395 = FPDR rate / permanent+FPDR rate only, which
   * omits the Parks, Children's and GO-bond levies and overstates FPDR's slice.)
   */
  shareOfCityLine: 0.34,
  /** 2006 reform vote — share voting YES. */
  measure2686YesPct: 0.8161,
  measure2686Yes: 160_230,
  measure2686No: 36_095,
  /** Actual benefit payments, FY2023-24. */
  benefitPaymentsFY24: 160_600_000,
  /** Projected nominal peak of annual benefit payments. */
  peakBenefitPayments: 234_800_000,
  peakBenefitYear: 2037,
  /** PERS contributions paid by the Fund for post-2006 (FPDR Three) hires, FY2025-26. */
  persContributionsFY26: 59_870_000,
  /** Machiz's undiscounted lifetime cash-cost estimate for the closed group. */
  lifetimeCashEstimate: 8_000_000_000,
  /** GASB discount rate used in the 2024 valuation. */
  discountRate2024: 0.0393,
} as const;

// ── Published FPDR levy-rate forecast (per $1,000 of assessed value) ──
// The City publishes projected FPDR tax rates AND an assessed-value (AV) growth
// assumption. Used to estimate a household's multi-year cost properly — by
// growing AV ~3%/yr and applying each year's published rate — instead of
// multiplying today's bill by N (which ignores both the rising rate and the
// rising base). Source: FPDR FYE 2027-31 Five-Year Plan. AV growth per the City
// Economist: 3.9% in FY27, then 3.0%/yr (Measure 50 caps growth at 3%).
export const FPDR_RATE_FORECAST: { fy: string; ratePer1000AV: number; avGrowth: number }[] = [
  { fy: "FY26", ratePer1000AV: 2.9874, avGrowth: 0 }, // base year — current assessed value
  { fy: "FY27", ratePer1000AV: 3.1906, avGrowth: 0.039 },
  { fy: "FY28", ratePer1000AV: 3.28, avGrowth: 0.03 },
  { fy: "FY29", ratePer1000AV: 3.3897, avGrowth: 0.03 },
  { fy: "FY30", ratePer1000AV: 3.503, avGrowth: 0.03 },
  { fy: "FY31", ratePer1000AV: 3.6082, avGrowth: 0.03 },
];

// ── Annual levy history (levy credited, $ millions) ───────────────
// Verified anchor years. Not every intervening year is shown.

export const LEVY_HISTORY: { fy: string; year: number; levy: number; projected?: boolean }[] =
  [
    { fy: "FY20", year: 2020, levy: 168.8 },
    { fy: "FY24", year: 2024, levy: 210.0 },
    { fy: "FY25", year: 2025, levy: 243.4 },
    { fy: "FY26", year: 2026, levy: 251.6 },
    { fy: "FY27", year: 2027, levy: 279.2 },
    { fy: "FY30", year: 2030, levy: 334.7, projected: true },
  ];

// ── Where the money goes (FY2025-26, $ millions) ──────────────────
// Program spending. Percentages on the page are computed from these
// dollar amounts so the math is always internally consistent.

export const SPENDING_FY26: { key: string; label: string; amount: number; color: string; note: string }[] =
  [
    {
      key: "pension",
      label: "Pensions for pre-2007 hires",
      amount: 163.2,
      color: "var(--color-canopy)",
      note: "Monthly checks to FPDR One & Two retirees and their survivors",
    },
    {
      key: "pers",
      label: "PERS for newly hired officers & firefighters",
      amount: 59.87,
      color: "var(--color-river)",
      note: "Pre-funded retirement contributions for everyone hired since 2007",
    },
    {
      key: "disability",
      label: "Disability & death benefits",
      amount: 8.6,
      color: "var(--color-ember)",
      note: "Injury, disability and survivor benefits for sworn members",
    },
    {
      key: "admin",
      label: "Administration",
      amount: 5.9,
      color: "var(--color-storm)",
      note: "Running the fund, the board, and claims processing",
    },
  ];

// ── The pay-as-you-go projection (illustrative) ───────────────────
// Anchor points are from Milliman: FY2024 actual ($160.6M), the nominal
// peak (~$234.8M around FY2037), and the FY2054 published figure
// ($176.1M). The long decline to the 2080s is interpolated for
// illustration — the *shape* (rise, peak ~mid-2030s, long tail) is what
// matters, not any single intermediate year.

export const PAYGO_ANCHORS: { year: number; payments: number }[] = [
  { year: 2024, payments: 160.6 },
  { year: 2028, payments: 192 },
  { year: 2031, payments: 215 },
  { year: 2034, payments: 230 },
  { year: 2037, payments: 234.8 },
  { year: 2040, payments: 229 },
  { year: 2044, payments: 212 },
  { year: 2048, payments: 196 },
  { year: 2054, payments: 176.1 },
  { year: 2062, payments: 128 },
  { year: 2070, payments: 64 },
  { year: 2078, payments: 18 },
  { year: 2082, payments: 4 },
];

export const SIM_START_YEAR = 2025;
export const SIM_END_YEAR = 2082;

// ── Reform options (for the trade-off menu) ───────────────────────

export interface ReformOption {
  id: string;
  name: string;
  oneLiner: string;
  how: string;
  nearTerm: "lower" | "same" | "higher" | "much-higher";
  lifetime: "same" | "lower" | "much-lower";
  pros: string[];
  cons: string[];
  /** Shown in the interactive simulator as a selectable curve. */
  simulated: boolean;
}

export const REFORM_OPTIONS: ReformOption[] = [
  {
    id: "status-quo",
    name: "Keep pay-as-you-go",
    oneLiner: "Do nothing. Tax each year for that year's checks.",
    how: "The status quo. Property taxes cover retirees' benefits as they come due, with no invested savings behind them.",
    nearTerm: "same",
    lifetime: "same",
    pros: [
      "No upfront cost — nothing changes",
      "Predictable, voter-locked revenue (a stream rating agencies value)",
      "Requires no charter vote or political fight",
    ],
    cons: [
      "Most expensive option over the life of the plan",
      "Passes the bill to future taxpayers for work done decades ago",
      "The rising levy quietly squeezes other city services through tax 'compression'",
      "Weighs on the city's credit — S&P rates Portland two notches below Moody's, partly over this unfunded liability",
    ],
    simulated: true,
  },
  {
    id: "prefund",
    name: "Pre-fund it on a real funding policy",
    oneLiner: "Amortize the unfunded liability over 30 years and invest.",
    how: "Adopt a standard actuarial funding policy: a declining-dollar contribution that fully funds the pension over 30 years, held in an invested trust. Investment returns then cover a large share of the bill, the levy falls every year, and it drops away once the liability is paid off — the cost profile a closed, mature plan should follow.",
    nearTerm: "higher",
    lifetime: "much-lower",
    pros: [
      "Investment returns cut roughly a quarter to a third of the lifetime cost",
      "Annual cost declines over time, then falls away once the liability is paid off",
      "Aligns Portland with how nearly every other public pension is funded",
    ],
    cons: [
      "Costs more up front, for a stretch, before it costs much less",
      "Needs a citywide charter vote",
      "The savings arrive decades later, after most current officials are gone",
    ],
    simulated: true,
  },
  {
    id: "pob",
    name: "Pension obligation bonds",
    oneLiner: "Borrow money now to seed the trust.",
    how: "Issue bonds, drop the proceeds into an invested trust, and bet that investment returns beat the interest rate on the bonds. Best used in modest size, one analysis models a ~$200M issuance, as a complement to a real funding policy, not a standalone fix.",
    nearTerm: "higher",
    lifetime: "lower",
    pros: [
      "Eases the transition hump without a multi-year tax surcharge",
      "A useful complement to a funding policy, not a replacement for one",
      "Used by other governments to jump-start funding",
    ],
    cons: [
      "A market bet, not free money — a downturn can leave you worse off",
      "Tempting to oversell — bonding the whole liability is risky and can backfire publicly if assumptions slip",
      "Adds debt to the city's books; timing the issuance wrong backfires",
    ],
    simulated: false,
  },
  {
    id: "study",
    name: "Study & transparency first",
    oneLiner: "Measure it, publish it, then decide.",
    how: "Commission an independent actuarial cost-savings analysis, convene a citizens commission, and put the real numbers in front of voters before any big move.",
    nearTerm: "same",
    lifetime: "same",
    pros: [
      "Cheap and low-risk — the reformers' actual first ask",
      "Builds the public understanding any charter vote would need",
      "Surfaces a liability that's currently nearly invisible",
    ],
    cons: [
      "Doesn't fix anything by itself",
      "A 2023 board motion to even price a study failed — inertia is real",
      "Can become a way to delay rather than decide",
    ],
    simulated: false,
  },
];

// ── Who receives benefits (Milliman valuation, as of June 30, 2024) ──
// All figures from the Milliman June 30, 2024 valuation (Appendix A) unless
// noted; the average pension is the actuarial average, not the higher
// outlay-per-retiree figure that has circulated in the press.

export const BENEFICIARIES = {
  /** Living retirees + surviving spouses/beneficiaries drawing a pension. */
  retireesAndSurvivors: 2014,
  retireesPolice: 1274,
  retireesFire: 740,
  /** Plus disabled members in pay and ex-spouse alternate payees. */
  disabledInPay: 23,
  alternatePayees: 142,
  /** Active members still earning the old pay-go pension (closed group). */
  activeFpdrTwo: 552,
  activeFpdrTwoPolice: 260,
  activeFpdrTwoFire: 292,
  /** Active members hired since 2007, in Oregon PERS (FPDR covers only disability). */
  activeFpdrThree: 853,
  activeTotal: 1405,
  /** Average pension (actuarial), $/year — all retirees & beneficiaries (Milliman 6/30/24, Appendix A). */
  avgAnnualPension: 78_000,
  /** Same all-retiree average, split by force ($6,318/mo police, $6,813/mo fire × 12). */
  avgAnnualPensionPolice: 75_800,
  avgAnnualPensionFire: 81_800,
  /** FPDR Two tier only (the larger closed tier) — kept for reference, not shown. */
  avgAnnualPensionFireTwo: 87_000,
  avgAnnualPensionPoliceTwo: 79_000,
  /** Typical retirement profile. */
  avgRetireAge: 52,
  avgYearsService: 25,
  /** Average age of current retirees. */
  avgRetireeAge: 69,
  /** Annual cost-of-living adjustment cap. */
  colaPct: 0.02,
  /** Record retirements in a single year (FYE2021), driven by pay-period spiking. */
  recordRetirements: 106,
  /** Oldest beneficiaries still drawing checks. */
  oldestBeneficiaryBand: "95+",
  /** Share of the active workforce that is FPDR Three (mid-2024), and projected. */
  fpdrThreeShareNow: 0.61,
  fpdrThreeShare2029: 0.83,
} as const;

// ── Plain-language reference values for the page ──────────────────

export const FACTS = {
  cityFY26ShortfallLow: 160_000_000,
  cityFY26ShortfallHigh: 172_000_000,
  /** Combined City-of-Portland rate per $1,000 AV (permanent + FPDR), FY2025-26. */
  cityComboRatePer1000AV: 7.5644,
  /** City permanent rate per $1,000 AV. */
  cityPermanentRatePer1000AV: 4.577,
  /** Effective RMV rate path (what actually shows up against market value). */
  rmvRateFY24: 1.18,
  rmvRateFY30: 1.84,
  /** Milliman stochastic result: chance of hitting the cap before 2044. */
  capBreachOddsThru2044: 0.02,
  medianRatePeak: 1.69,
  medianRatePeakYear: 2033,
} as const;
