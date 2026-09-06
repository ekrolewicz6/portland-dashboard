import { Building2, CircleDollarSign, Clock3, Fence, Home, Landmark, Leaf, Scale, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DEFAULTS,
  annualTax,
  buyerScarcityScenario,
  mortgagePayment,
  scarcityScenario,
  taxBasisScenario,
} from "@/lib/growth-politics/engine";

export const SOURCES = {
  multcoAssessment: {
    org: "Multnomah County",
    title: "Property Assessment FAQs",
    url: "https://multco.us/info/property-assessment-faqs",
  },
  multcoChanged: {
    org: "Multnomah County",
    title: "Estimating Taxes on Changed Property",
    url: "https://multco.us/info/estimating-taxes-changed-property",
  },
  multcoCpr: {
    org: "Multnomah County",
    title: "2025-2026 Changed Property Ratios",
    url: "https://multco.us/file/2025-2026_change_property_ratios/download",
  },
  dorMav: {
    org: "Oregon Department of Revenue",
    title: "Maximum Assessed Value Manual",
    url: "https://www.oregon.gov/dor/forms/FormsPubs/maximum-assessed-value-manual_303-438.pdf",
  },
  lroInequity: {
    org: "Oregon Legislative Revenue Office",
    title: "Fairness problems under Measure 50",
    url: "https://www.oregonlegislature.gov/lro/documents/rr4-10h_inequitiesundermeasure50_092210.pdf",
  },
  oregonliveMap: {
    org: "OregonLive",
    title: "Measure 50 winners and losers map",
    url: "https://projects.oregonlive.com/taxes/property/map/",
  },
  hna: {
    org: "City of Portland",
    title: "2045 Housing Needs Analysis and Housing Production Strategy",
    url: "https://www.portland.gov/bps/planning/housing-production/about",
  },
  middleHousing: {
    org: "City of Portland",
    title: "Middle housing progress report",
    url: "https://www.portland.gov/bps/planning/rip2/news/2025/2/4/portland-sees-significant-production-middle-housing-resulting",
  },
  permitImprovement: {
    org: "City of Portland",
    title: "Permit Improvement Project background",
    url: "https://www.portland.gov/permitimprovement/about",
  },
  auditorPermit: {
    org: "Portland Auditor",
    title: "Audit update on permit reforms",
    url: "https://www.portland.gov/auditor/audit-services/news/2023/10/11/audit-update-momentous-move-council-consolidate-permitting",
  },
  sdcExemption: {
    org: "City of Portland",
    title: "Temporary SDC exemptions for new housing units",
    url: "https://www.portland.gov/ppd/current-fee-schedules/housing-sdc-exemption",
  },
  inclusionary: {
    org: "Portland Housing Bureau",
    title: "Inclusionary Housing affordability requirements",
    url: "https://www.portland.gov/phb/inclusionary-housing/affordability-requirements",
  },
  sb1521: {
    org: "Oregon Legislature",
    title: "SB 1521 affordable housing offset requirement",
    url: "https://olis.oregonlegislature.gov/liz/2026R1/Measures/Overview/SB1521",
  },
  hb4037: {
    org: "Oregon Legislature",
    title: "HB 4037 housing approvals and surplus property",
    url: "https://olis.oregonlegislature.gov/liz/2026R1/Measures/Overview/HB4037",
  },
  rentCap: {
    org: "Oregon Office of Economic Analysis",
    title: "Rent Stabilization",
    url: "https://www.oregon.gov/das/oea/pages/rent-stabilization.aspx",
  },
  relocation: {
    org: "Portland Housing Bureau",
    title: "Mandatory Renter Relocation Assistance",
    url: "https://www.portland.gov/phb/rental-services/renter-relocation-assistance",
  },
  personalTax: {
    org: "Portland Revenue Division",
    title: "Personal Income Tax Filing and Payment Information",
    url: "https://www.portland.gov/revenue/personal-tax",
  },
  businessTax: {
    org: "Portland Revenue Division",
    title: "Business Tax Filing and Payment Information",
    url: "https://www.portland.gov/revenue/business-tax",
  },
  socialSecurity: {
    org: "Oregon Department of Revenue",
    title: "Personal Income Tax",
    url: "https://www.oregon.gov/dor/programs/individuals/pages/pit.aspx",
  },
  exemptions: {
    org: "Oregon Department of Revenue",
    title: "Property tax exemptions",
    url: "https://www.oregon.gov/dor/programs/property/pages/exemptions.aspx",
  },
  deferral: {
    org: "Oregon Department of Revenue",
    title: "Senior and Disabled Property Tax Deferral",
    url: "https://www.oregon.gov/dor/programs/property/pages/senior-and-disabled-property-tax-deferral-program.aspx",
  },
  metroUgb: {
    org: "Metro",
    title: "Urban Growth Boundary",
    url: "https://www.oregonmetro.gov/what-metro-does/land-use-and-development/2040-growth-concept/urban-growth-boundary",
  },
  historic: {
    org: "City of Portland",
    title: "Historic Resource Reviews",
    url: "https://www.portland.gov/ppd/zoning-land-use/land-use-review-fees-and-types/historic-resource-reviews",
  },
  design: {
    org: "City of Portland",
    title: "Design Standards",
    url: "https://www.portland.gov/ppd/land-use-review-fees-and-types/design-standards",
  },
  trees: {
    org: "City of Portland",
    title: "On-Site Tree Preservation",
    url: "https://www.portland.gov/ppd/trees-development/tree-plan-requirements-development-permits/site-tree-preservation",
  },
  deconstruction: {
    org: "City of Portland",
    title: "Deconstruction permit requirements",
    url: "https://www.portland.gov/bps/garbage-recycling/decon/deconstruction-requirements",
  },
  census: {
    org: "U.S. Census Bureau",
    title: "QuickFacts: Portland city, Oregon",
    url: "https://www.census.gov/quickfacts/fact/table/portlandcityoregon/PST045225",
  },
  pit: {
    org: "Portland State University HRAC",
    title: "2025 Portland Tri-County Point in Time Count",
    url: "https://www.pdx.edu/homelessness/2025-portland-tri-county-point-time-count",
  },
} as const;

export type SourceKey = keyof typeof SOURCES;

export interface SystemLayer {
  title: string;
  intent: string;
  hiddenEffect: string;
  winners: string;
  losers: string;
  icon: LucideIcon;
  source: SourceKey;
}

export const SYSTEM_LAYERS: SystemLayer[] = [
  {
    title: "Measure 50",
    intent: "Keep property-tax bills from jumping too fast.",
    hiddenEffect: "Also keeps some valuable older properties on very low tax bills.",
    winners: "Owners with older low-tax-bill properties, some landlords, and sellers of old homes.",
    losers: "New homes, owners with higher taxable values, renters, and public services.",
    icon: Landmark,
    source: "multcoAssessment",
  },
  {
    title: "No reset at sale",
    intent: "Keep the system simple when a property sells.",
    hiddenEffect: "The low tax bill usually stays with the property, even after a new owner buys it.",
    winners: "Sellers and buyers of older homes with low taxable values.",
    losers: "People buying newer homes and anyone paying more than a similar neighbor.",
    icon: Home,
    source: "dorMav",
  },
  {
    title: "Urban Growth Boundary",
    intent: "Protect farms and forests by keeping the region from sprawling outward.",
    hiddenEffect: "If we limit outward growth, blocking homes inside the city becomes much more costly.",
    winners: "Developable landowners inside the boundary.",
    losers: "Future residents if the city blocks enough homes inside the boundary.",
    icon: Fence,
    source: "metroUgb",
  },
  {
    title: "Permitting delay",
    intent: "Make sure buildings meet safety, infrastructure, design, and code rules.",
    hiddenEffect: "Time costs money. A slow permit process acts like an extra charge on housing.",
    winners: "People who benefit when fewer new homes get built nearby.",
    losers: "Small builders, renters, and projects paying interest while they wait.",
    icon: Clock3,
    source: "permitImprovement",
  },
  {
    title: "Building fees (SDCs)",
    intent: "Make new development help pay for pipes, parks, streets, and other shared systems. The city calls these System Development Charges, or SDCs.",
    hiddenEffect: "The next home has to pay upfront for systems the whole city uses.",
    winners: "Existing residents if the cost is not spread broadly.",
    losers: "New homes that barely pencil out and the people who would live in them.",
    icon: CircleDollarSign,
    source: "sdcExemption",
  },
  {
    title: "Inclusionary housing",
    intent: "Put below-market affordable units inside market-rate apartment buildings.",
    hiddenEffect: "If the city does not fully pay for the affordable units, the cost lands on the new building.",
    winners: "Tenants who get affordable units and taxpayers who do not see the cost directly.",
    losers: "Projects that barely work financially and sometimes renters in the market-rate units.",
    icon: Scale,
    source: "inclusionary",
  },
  {
    title: "Tenant protections",
    intent: "Prevent sudden rent hikes and displacement.",
    hiddenEffect: "They help tenants who already have a home more than people still searching for one.",
    winners: "Covered renters in stable units.",
    losers: "Future renters if supply stays scarce.",
    icon: Shield,
    source: "rentCap",
  },
  {
    title: "Design, historic, tree, and deconstruction rules",
    intent: "Protect good design, older buildings, trees, and reusable materials.",
    hiddenEffect: "Each rule may make sense alone. Together they add cost, delay, and more ways to stop a project.",
    winners: "Existing built form and neighborhood aesthetics.",
    losers: "Projects trying to add homes in high-demand places.",
    icon: Leaf,
    source: "historic",
  },
  {
    title: "Income and business taxes",
    intent: "Fund homelessness, preschool, city/county services.",
    hiddenEffect: "Taxes paychecks and business income, while some valuable property keeps a lighter property-tax bill.",
    winners: "People with valuable property but lower taxable income.",
    losers: "High-earning renters, founders, firms, working newcomers.",
    icon: Building2,
    source: "personalTax",
  },
];

export interface Cohort {
  name: string;
  kind: "winner" | "loser" | "mixed";
  scale: string;
  mechanism: string;
  quantified: string;
}

export const COHORTS: Cohort[] = [
  {
    name: "Homeowners with older low-tax-bill homes in expensive neighborhoods",
    kind: "winner",
    scale: "Subset of ~150,600 owner households",
    mechanism: "They can get both a lower property-tax bill and a rising home value.",
    quantified: "$2k-$3.6k/year tax advantage on a median home versus a new or heavily changed home in modeled examples.",
  },
  {
    name: "Older and fixed-income homeowners",
    kind: "mixed",
    scale: "~92,100 residents age 65+; not all homeowners",
    mechanism: "Tax limits can help them stay housed, but many are cash-poor rather than wealthy.",
    quantified: "A state tax-delay program exists for qualifying seniors and disabled homeowners, but it is a loan against the home at 6% simple interest.",
  },
  {
    name: "Landlords with older low-tax-bill buildings",
    kind: "winner",
    scale: "Owners of stock housing ~139,100 renter households",
    mechanism: "They may have lower tax bills while charging rents shaped by a tight housing market.",
    quantified: "A 10-unit building with a 10% shortage markup can gain about $19,860/year in operating income, worth about $361k at a 5.5% cap rate.",
  },
  {
    name: "Renters searching now",
    kind: "loser",
    scale: "Large share of ~139,100 renter households",
    mechanism: "They pay today's rent without an older low tax bill or older rent protections.",
    quantified: "A 10% shortage markup costs about $1,986/year per household, or about $276M/year across renter households.",
  },
  {
    name: "Future Portlanders",
    kind: "loser",
    scale: "120,560 needed units by 2045",
    mechanism: "Cannot vote, testify, or appeal. They are missing from the process.",
    quantified: "A 10% shortage markup applied to the needed-unit base equals about $239M/year.",
  },
  {
    name: "First-time buyers and young families",
    kind: "loser",
    scale: "Subset of renters and younger households",
    mechanism: "The housing shortage gets baked into purchase prices.",
    quantified: "A 20% premium on a $581,500 home adds ~$116,300 principal and ~$8,821/year mortgage cost at 6.5%.",
  },
  {
    name: "Middle-housing buyers",
    kind: "winner",
    scale: "1,400+ ADUs/middle-housing units permitted Aug. 2021-Jun. 2024",
    mechanism: "The Residential Infill Project made smaller ownership homes possible in areas that used to allow mostly detached houses.",
    quantified: "New middle-housing units sold for ~$250k-$300k less than new detached homes in 2023-24.",
  },
  {
    name: "New apartment projects",
    kind: "loser",
    scale: "The project base needed to deliver the 120,560-unit need",
    mechanism: "They carry many costs at once: taxes, development fees, affordable-unit rules, delays, and design/tree/historic rules.",
    quantified: "$3.8k-$6.4k/unit/year modeled tax burden plus $1.2M-$1.8M for a six-month delay on a $30M project.",
  },
  {
    name: "Tenants who get inclusionary housing units",
    kind: "winner",
    scale: "1,313+ permitted or in-process IH units in first five years",
    mechanism: "They get a real below-market rent benefit.",
    quantified: "A 1BR at 60% MFI can save ~$10,272/year versus a $2,300 market rent.",
  },
  {
    name: "High-income renters and working newcomers",
    kind: "loser",
    scale: "Tax liability depends on filing status and income",
    mechanism: "They pay visible local income taxes but do not own valuable property with a lower tax bill.",
    quantified: "A single filer at $300k taxable income owes ~$5,095/year in SHS + PFA before Arts Tax.",
  },
  {
    name: "Homeowners whose tax bill is high compared with their home value",
    kind: "loser",
    scale: "Unknown without property-level data",
    mechanism: "They pay more tax relative to home value than neighbors with older low taxable values.",
    quantified: "A median-value home taxed on 55% of its value pays about $4,701/year more than one taxed on 25% of its value in the model.",
  },
  {
    name: "Public services and infrastructure",
    kind: "mixed",
    scale: "Everyone depends on them",
    mechanism: "When property-tax revenue is limited, pressure shifts to fees, income taxes, development charges, or deferred maintenance.",
    quantified: "A 5,000-unit SDC exemption at $20k/unit shifts or forgoes ~$100M unless backfilled.",
  },
];

export type PackageImpactResult = "paysMore" | "losesAdvantage" | "benefits" | "protected" | "mixed";

export type AnnualEffectKind = "cost" | "benefit" | "exposure" | "neutral";

export interface AnnualEffect {
  amount: number;
  kind: AnnualEffectKind;
  label: string;
}

export interface PackageCohortImpact {
  name: string;
  unit: string;
  currentAnnual: AnnualEffect;
  futureAnnual: AnnualEffect;
  annualChange: string;
  calculationNote: string;
  currentPosition: string;
  packageEffect: string;
  burden: string;
  benefit: string;
  honesty: string;
  result: PackageImpactResult;
  certainty: "High" | "Medium" | "Low";
}

const medianHome35 = taxBasisScenario({
  rmv: DEFAULTS.medianHomeValue,
  legacyRatio: 0.35,
  corridorRatio: 0.5,
});
const medianHome25 = taxBasisScenario({
  rmv: DEFAULTS.medianHomeValue,
  legacyRatio: 0.25,
  corridorRatio: 0.5,
});
const millionHome25 = taxBasisScenario({
  rmv: 1_000_000,
  legacyRatio: 0.25,
  corridorRatio: 0.5,
});
const renterShortage10 = scarcityScenario({
  monthlyRent: DEFAULTS.medianRent,
  scarcityPremium: 0.1,
  households: DEFAULTS.renterHouseholds,
}).perHousehold;
const renterShortage5 = scarcityScenario({
  monthlyRent: DEFAULTS.medianRent,
  scarcityPremium: 0.05,
  households: DEFAULTS.renterHouseholds,
}).perHousehold;
const buyerScarcity20 = buyerScarcityScenario({
  homeValue: DEFAULTS.medianHomeValue,
  scarcityPremium: 0.2,
}).annual;
const buyerScarcity10 = buyerScarcityScenario({
  homeValue: DEFAULTS.medianHomeValue,
  scarcityPremium: 0.1,
}).annual;
const middleHousingSavings = mortgagePayment(250_000, 0.065, 30) * 12;
const smallBuilderDelayCost = mortgagePayment(22_500, 0.065, 30) * 12;
const smallBuilderReducedDelayCost = mortgagePayment(7_500, 0.065, 30) * 12;
const multifamilyTaxPerUnit = annualTax(350_000, DEFAULTS.multifamilyCpr);
const multifamilyStackCurrent = multifamilyTaxPerUnit + (15_000 + 20_000 + 18_000) * 0.065;
const multifamilyStackFuture = multifamilyTaxPerUnit + 5_000 * 0.065;
const highIncomeLocalTaxExample = 5_095;
const annualValueOfScarcityPremium = DEFAULTS.medianHomeValue * 0.1 * DEFAULTS.capRate;

export const PACKAGE_COHORT_IMPACTS: PackageCohortImpact[] = [
  {
    name: "Long-held owner-occupiers in high-appreciation neighborhoods",
    unit: "Per median-value home per year",
    currentAnnual: {
      amount: medianHome35.annualAdvantageVsCpr,
      kind: "benefit",
      label: "Modeled tax-bill advantage today",
    },
    futureAnnual: {
      amount: medianHome35.annualIncreaseToCorridor,
      kind: "cost",
      label: "Added tax if below 50% floor",
    },
    annualChange: "About a $4,400/year swing from protected benefit to added tax, before any income-based protection.",
    calculationNote: "$581,500 home at 35% taxed share versus 48.1% new-residential ratio, then a one-way 50% minimum floor.",
    currentPosition: "Often protected by low taxable value and helped by scarce housing pushing home values up.",
    packageEffect: "A minimum floor would move very low taxable values closer to market value over time without cutting bills for above-floor parcels.",
    burden: "Likely higher property taxes unless the owner qualifies for income-based deferral.",
    benefit: "More stable city services and a clearer path for children, caregivers, and workers to live nearby.",
    honesty: "This group gives up part of a real financial advantage. The package should say that directly.",
    result: "paysMore",
    certainty: "High",
  },
  {
    name: "Older and fixed-income homeowners",
    unit: "Per qualifying owner-occupied home per year",
    currentAnnual: {
      amount: medianHome35.annualAdvantageVsCpr,
      kind: "benefit",
      label: "Tax shock avoided today",
    },
    futureAnnual: {
      amount: 0,
      kind: "neutral",
      label: "Cash increase if protected by deferral",
    },
    annualChange: `Cash bill protected now; about ${Math.round(medianHome35.annualIncreaseToCorridor).toLocaleString()} dollars could be deferred instead of forgiven.`,
    calculationNote: "Uses the same median-home example, but assumes a qualifying income-based deferral caps current cash payments.",
    currentPosition: "Often cash-poor but house-rich; Measure 50 protects them from sudden tax jumps.",
    packageEffect: "Cash bills would be capped by ability to pay, with excess tax deferred until sale, transfer, or estate settlement.",
    burden: "Less cash pressure now, but a lien can reduce future sale proceeds or inheritance.",
    benefit: "They can stay housed without freezing the tax shelter forever for the property.",
    honesty: "This protects residency, not every dollar of family wealth. Heirs may receive less.",
    result: "protected",
    certainty: "Medium",
  },
  {
    name: "Wealthy or high-income buyers of old homes",
    unit: "Per median-value old home per year",
    currentAnnual: {
      amount: medianHome35.annualAdvantageVsCpr,
      kind: "benefit",
      label: "Inherited tax discount today",
    },
    futureAnnual: {
      amount: medianHome35.annualIncreaseToCorridor,
      kind: "cost",
      label: "Higher tax after sale reset or floor",
    },
    annualChange: "A buyer loses the annual discount, but the seller may also lose part of the sale-price premium.",
    calculationNote: "Models an old median-value home bought with a 35% taxed share and reset toward a one-way 50% floor.",
    currentPosition: "Can buy an old home and inherit a lower taxable value even if they can afford more.",
    packageEffect: "A sale reset or minimum floor would shrink the old tax advantage at purchase.",
    burden: "Higher annual tax bill than under today's no-reset system.",
    benefit: "Less bidding up of homes based on inherited tax discounts; fairer treatment versus newer homes.",
    honesty: "Some of the loss lands on sellers because the tax discount becomes less valuable in the sale price.",
    result: "losesAdvantage",
    certainty: "High",
  },
  {
    name: "Heirs and families holding legacy property",
    unit: "Per $1M inherited or transferred property per year",
    currentAnnual: {
      amount: millionHome25.annualAdvantageVsCpr,
      kind: "benefit",
      label: "Legacy tax advantage today",
    },
    futureAnnual: {
      amount: millionHome25.annualIncreaseToCorridor,
      kind: "cost",
      label: "Added tax after transfer floor",
    },
    annualChange: "Roughly a $13,000/year swing on a $1M property if a deep discount moves to a 50% floor.",
    calculationNote: "$1M property at 25% taxed share versus 48.1% new-residential ratio, then a one-way 50% minimum floor.",
    currentPosition: "Can keep low taxable values attached to valuable property over generations.",
    packageEffect: "Transfers, conversions to rentals, and inherited high-value properties would move closer to the minimum floor.",
    burden: "Lower inheritance value or higher taxes after transfer.",
    benefit: "Owner-occupants with low income could still receive targeted protection.",
    honesty: "This is one of the clearest places where the package takes back hidden wealth.",
    result: "losesAdvantage",
    certainty: "Medium",
  },
  {
    name: "Owners in slow-appreciation or historically over-assessed neighborhoods",
    unit: "Per median-value home per year",
    currentAnnual: {
      amount: 0,
      kind: "neutral",
      label: "Minimum-floor increase",
    },
    futureAnnual: {
      amount: 0,
      kind: "neutral",
      label: "No automatic floor increase",
    },
    annualChange: "No modeled increase under the floor. Any relief would need a separate income or hardship test, not a blanket tax cut.",
    calculationNote: "A median-value home already taxed at 55% of market value is above a 50% minimum floor, so the revenue-positive floor adds $0.",
    currentPosition: "May already pay a high tax bill relative to their home's market value.",
    packageEffect: "A minimum-floor package should not cut this bill automatically. It should reserve relief for households that are actually overburdened by income, age, disability, or other hardship.",
    burden: "No floor increase if already above the minimum share.",
    benefit: "Could qualify for targeted protection if the household, not just the parcel, is financially burdened.",
    honesty: "This group is important politically, but automatic cuts here would eat into the revenue needed for renters and services.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "Legacy landlords and owners of existing rental stock",
    unit: "Per rental unit per year",
    currentAnnual: {
      amount: renterShortage10,
      kind: "benefit",
      label: "Scarcity rent premium today",
    },
    futureAnnual: {
      amount: renterShortage5,
      kind: "benefit",
      label: "Remaining shortage markup if cut in half",
    },
    annualChange: "About $993/year less scarcity rent per unit before accounting for higher property taxes.",
    calculationNote: "Uses median gross rent of $1,655/month and assumes the package cuts a 10% shortage markup to 5%.",
    currentPosition: "Can benefit from low taxable value plus market rents shaped by scarcity.",
    packageEffect: "Non-owner-occupied property would reset faster, and more supply would reduce scarcity pricing over time.",
    burden: "Higher property taxes and lower scarcity-driven rent upside.",
    benefit: "Clearer rules, more city investment in tenant stability, and less political backlash if housing supply improves.",
    honesty: "This group is a major payer under any serious version of the package.",
    result: "paysMore",
    certainty: "High",
  },
  {
    name: "Renters in older stable units",
    unit: "Per stable renter household per year",
    currentAnnual: {
      amount: 1_092,
      kind: "benefit",
      label: "Example rent-cap protection today",
    },
    futureAnnual: {
      amount: 1_092,
      kind: "benefit",
      label: "Protection retained, plus more mobility",
    },
    annualChange: "No modeled cash change; the package tries to make moving less punishing.",
    calculationNote: "Memo example: at median rent, a 9.5% cap versus a 15% uncapped increase saves about $1,092/year.",
    currentPosition: "Protected somewhat by rent stabilization and relocation assistance if they stay put.",
    packageEffect: "Tenant stability funding should strengthen direct help while broader supply reduces future search pressure.",
    burden: "Possible pass-through pressure if landlord taxes rise and rent rules allow it.",
    benefit: "More direct rent-shock protection and more options if they need to move.",
    honesty: "They benefit only if tenant protections stay funded and enforcement is real.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "Renters searching for housing now",
    unit: "Per renter household per year",
    currentAnnual: {
      amount: renterShortage10,
      kind: "cost",
      label: "Modeled shortage markup today",
    },
    futureAnnual: {
      amount: renterShortage5,
      kind: "cost",
      label: "Shortage premium if cut in half",
    },
    annualChange: "About $993/year less rent pressure per household in this simple model.",
    calculationNote: "Uses median gross rent of $1,655/month and compares a 10% shortage markup with a 5% shortage markup.",
    currentPosition: "Pay today's market rent and absorb the shortage markup directly.",
    packageEffect: "More housing supply, funded tenant stability, and fewer costs loaded onto new buildings should reduce pressure over time.",
    burden: "No major direct new tax burden unless landlords pass through costs.",
    benefit: "More vacancies, less bidding pressure, and more leverage when choosing where to live.",
    honesty: "The benefit is not instant. It depends on actually building enough homes.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "Future Portlanders and would-be residents",
    unit: "Per future household per year",
    currentAnnual: {
      amount: renterShortage10,
      kind: "cost",
      label: "Modeled exclusion/shortage markup",
    },
    futureAnnual: {
      amount: renterShortage5,
      kind: "cost",
      label: "Remaining shortage markup if supply improves",
    },
    annualChange: "About $993/year less exclusion cost per future household if scarcity pressure is cut in half.",
    calculationNote: "Applies the same renter shortage-premium model to a future household looking for a home.",
    currentPosition: "Do not vote here yet and are invisible in most hearings.",
    packageEffect: "Rules would make it easier for housing planned inside the city to actually get built.",
    burden: "No direct current burden because they are not yet here.",
    benefit: "More homes, more entry points, and less exclusion by scarcity.",
    honesty: "They are the clearest beneficiaries but the weakest political constituency.",
    result: "benefits",
    certainty: "High",
  },
  {
    name: "First-time buyers and young families",
    unit: "Per median-price buyer household per year",
    currentAnnual: {
      amount: buyerScarcity20,
      kind: "cost",
      label: "Mortgage cost of 20% shortage markup",
    },
    futureAnnual: {
      amount: buyerScarcity10,
      kind: "cost",
      label: "Mortgage cost if premium falls to 10%",
    },
    annualChange: "About $4,400/year less mortgage pressure on the modeled median-value home.",
    calculationNote: "Uses a $581,500 home, 30-year mortgage, 6.5% rate, and cuts a 20% price premium to 10%.",
    currentPosition: "Compete against scarcity-inflated prices and incumbents with older tax bases.",
    packageEffect: "More small homes, townhomes, condos, and less capitalization of old tax discounts into prices.",
    burden: "Some buyers of old homes may face higher annual taxes than they would today.",
    benefit: "Lower shortage markup and more types of homes to buy.",
    honesty: "They do not automatically win if mortgage rates, construction costs, and incomes remain out of line.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "Middle-housing buyers",
    unit: "Per buyer household per year",
    currentAnnual: {
      amount: middleHousingSavings,
      kind: "benefit",
      label: "Mortgage savings versus a larger new detached home",
    },
    futureAnnual: {
      amount: middleHousingSavings,
      kind: "benefit",
      label: "Savings retained if more middle housing is allowed",
    },
    annualChange: "The annual savings stays similar, but more households could access it if production scales.",
    calculationNote: "Annual mortgage payment avoided on a $250,000 lower purchase price at 6.5% over 30 years.",
    currentPosition: "Benefit when zoning allows smaller ownership homes in high-demand areas.",
    packageEffect: "More by-right housing and lower delay costs should expand this market.",
    burden: "New homes still carry current tax values, so they do not get the old-property discount.",
    benefit: "More duplexes, triplexes, townhomes, ADUs, and small condos in more neighborhoods.",
    honesty: "This works only if financing, condo liability, and permitting also cooperate.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "Small infill builders",
    unit: "Per four-unit project unit per year",
    currentAnnual: {
      amount: smallBuilderDelayCost,
      kind: "cost",
      label: "Annualized cost of a six-month delay",
    },
    futureAnnual: {
      amount: smallBuilderReducedDelayCost,
      kind: "cost",
      label: "Annualized cost after shorter delay",
    },
    annualChange: "About $1,100/year less required unit revenue if delay cost falls from $22,500 to $7,500 per unit.",
    calculationNote: "Annual mortgage-equivalent cost of delay per unit, using memo's $22,500/unit six-month delay example and 6.5% over 30 years.",
    currentPosition: "Often face the same complexity as bigger developers with less balance-sheet capacity.",
    packageEffect: "Clearer rules, lower delay, and broader infrastructure funding should help them compete.",
    burden: "Land sellers may still capture much of the value unless land policy changes too.",
    benefit: "Less time risk and fewer project-killing soft costs.",
    honesty: "The package helps small builders only if approval is genuinely predictable.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "New multifamily developers",
    unit: "Per new apartment unit per year",
    currentAnnual: {
      amount: multifamilyStackCurrent,
      kind: "cost",
      label: "Modeled tax, delay, SDC, and IH stack",
    },
    futureAnnual: {
      amount: multifamilyStackFuture,
      kind: "cost",
      label: "Remaining cost after backfill and delay relief",
    },
    annualChange: "About $3,100/year less required unit revenue in this simplified project-stack model.",
    calculationNote: "Uses a $350,000 RMV unit, multifamily CPR tax, and annualizes example delay, SDC, and IH gap costs.",
    currentPosition: "Carry property taxes on new value, fees, delays, financing costs, and affordability mandates.",
    packageEffect: "SDC backfill, direct IH funding, and faster permitting would shift some cost off the marginal new project.",
    burden: "May face stronger public-benefit requirements in exchange for public relief.",
    benefit: "More projects pencil if the city removes delay and hidden cross-subsidy costs.",
    honesty: "This is a benefit to developers, but the public reason is getting homes built.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "Affordable-housing tenants in inclusionary units",
    unit: "Per one-bedroom tenant household per year",
    currentAnnual: {
      amount: 10_272,
      kind: "benefit",
      label: "Example below-market rent savings",
    },
    futureAnnual: {
      amount: 10_272,
      kind: "benefit",
      label: "Savings retained with direct affordability funding",
    },
    annualChange: "No modeled per-household cash change; the goal is more households receiving the benefit.",
    calculationNote: "Memo example: $2,300 market 1BR versus $1,444 60% MFI rent saves $856/month.",
    currentPosition: "Direct winners when they receive below-market units.",
    packageEffect: "Direct public funding for affordability should make the subsidy clearer and more durable.",
    burden: "No direct burden.",
    benefit: "More stable funding and potentially more units if projects pencil more often.",
    honesty: "The number of winners remains limited unless production scales up.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "Market-rate renters in inclusionary housing buildings",
    unit: "Per market-rate renter household per year",
    currentAnnual: {
      amount: 1_140,
      kind: "cost",
      label: "Potential hidden IH cross-subsidy",
    },
    futureAnnual: {
      amount: 0,
      kind: "neutral",
      label: "Cross-subsidy if directly funded instead",
    },
    annualChange: "Up to about $1,140/year less hidden building-level subsidy exposure in the memo example.",
    calculationNote: "Uses the memo's roughly $94-$95/month modeled exposure if IH costs are shifted to market-rate units.",
    currentPosition: "May indirectly pay when below-market units are cross-subsidized inside the same building.",
    packageEffect: "Direct affordability funding reduces pressure to load the cost onto the other units.",
    burden: "Still pays market rent, and rents may not fall quickly.",
    benefit: "Less hidden cross-subsidy and more chance the building gets built.",
    honesty: "They are not the priority group, but the current system can quietly tax them too.",
    result: "benefits",
    certainty: "Low",
  },
  {
    name: "Unhoused and extremely low-income households",
    unit: "Per household needing a deeply affordable home per year",
    currentAnnual: {
      amount: DEFAULTS.medianRent * 12,
      kind: "exposure",
      label: "Annual market-rent barrier",
    },
    futureAnnual: {
      amount: (DEFAULTS.medianRent * 12) / 2,
      kind: "exposure",
      label: "Barrier if subsidy closes half the gap",
    },
    annualChange: "About $9,930/year less uncovered rent barrier in this simple subsidy-gap example.",
    calculationNote: "Uses annual median gross rent as the market-rent barrier; future assumes direct housing subsidy closes half the gap.",
    currentPosition: "Most harmed by the gap between housing need, deeply affordable units, and actual availability.",
    packageEffect: "Public land housing, affordability funding, and tenant stability money should target the deepest need.",
    burden: "No direct burden.",
    benefit: "More deeply affordable and supportive housing if dollars are actually reserved for that purpose.",
    honesty: "Market-rate supply alone will not solve this. The package must fund direct housing help.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "High-income working renters",
    unit: "Per single filer at $300k taxable income per year",
    currentAnnual: {
      amount: highIncomeLocalTaxExample,
      kind: "cost",
      label: "SHS + PFA local income-tax example",
    },
    futureAnnual: {
      amount: highIncomeLocalTaxExample,
      kind: "cost",
      label: "Unchanged unless income-tax reliance falls",
    },
    annualChange: "No automatic savings unless policymakers use property/land revenue to avoid more income-tax load.",
    calculationNote: "Uses memo's 2026 single-filer $300,000 taxable income example for SHS + PFA.",
    currentPosition: "Pay local income taxes without owning a property that gets Measure 50 protection.",
    packageEffect: "A broader property base could reduce pressure to keep adding taxes on income and work.",
    burden: "May still pay existing income taxes unless policymakers actually reduce or avoid future income-tax increases.",
    benefit: "Fairer split between labor income and land wealth.",
    honesty: "They benefit only if the city uses property/land revenue to stop leaning harder on income.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "High-income homeowners with low-taxed property",
    unit: "Per high-income owner of median-value low-taxed home per year",
    currentAnnual: {
      amount: highIncomeLocalTaxExample - medianHome35.annualAdvantageVsCpr,
      kind: "cost",
      label: "Income tax after modeled property-tax advantage",
    },
    futureAnnual: {
      amount: highIncomeLocalTaxExample + medianHome35.annualIncreaseToCorridor,
      kind: "cost",
      label: "Income tax plus floor increase",
    },
    annualChange: "About a $4,400/year swing once the current property-tax advantage becomes a tax increase.",
    calculationNote: "Combines the $300k single-filer local income-tax example with the median-home 35% to one-way 50% floor model.",
    currentPosition: "Can pay income taxes but still hold a valuable low-tax property advantage.",
    packageEffect: "Income-based protections would not shield them much, and their taxable value would rise toward the minimum floor.",
    burden: "Higher property taxes and reduced tax-shelter value.",
    benefit: "Better public services and a fairer city tax base.",
    honesty: "This is another clear payer group, especially in expensive neighborhoods.",
    result: "paysMore",
    certainty: "High",
  },
  {
    name: "Businesses and startup owners",
    unit: "Per business with $500k taxable income per year",
    currentAnnual: {
      amount: 28_000,
      kind: "cost",
      label: "Local business-income tax example",
    },
    futureAnnual: {
      amount: 28_000,
      kind: "cost",
      label: "Unchanged unless business-tax reliance falls",
    },
    annualChange: "No automatic savings; the package only helps if broader property/land revenue prevents more business-tax pressure.",
    calculationNote: "Uses memo example: 5.6% local business-income tax stack on $500,000 taxable business income.",
    currentPosition: "Can face high local business-income taxes while property wealth is less fully taxed.",
    packageEffect: "If property and land wealth carry more of the load, the city can avoid pushing as much onto business formation.",
    burden: "Commercial property owners may pay more; tenants may see some pass-through depending on leases.",
    benefit: "Less pressure for new business and income taxes; better infrastructure if backfill is real.",
    honesty: "The impact splits between business owners who own land and those who rent space.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "City bureaus, infrastructure systems, schools, and public services",
    unit: "System-wide annual funding exposure",
    currentAnnual: {
      amount: 100_000_000,
      kind: "exposure",
      label: "Example yearly SDC gap if 5,000 units are exempt",
    },
    futureAnnual: {
      amount: 0,
      kind: "neutral",
      label: "Gap if fully backfilled by broader tax base",
    },
    annualChange: "Potentially closes a $100M/year infrastructure hole in this scenario.",
    calculationNote: "Uses memo formula: 5,000 exempt units times $20,000 average SDC per unit.",
    currentPosition: "Lose when property-tax limits and SDC exemptions leave funding gaps.",
    packageEffect: "Broader property value and land value revenue can backfill infrastructure and service needs.",
    burden: "They must prove the dollars are used well.",
    benefit: "More reliable funding and less dependence on fees charged to the next project.",
    honesty: "This only works if the revenue is legally usable and transparently tracked.",
    result: "benefits",
    certainty: "Medium",
  },
  {
    name: "Owners of developable land inside the Urban Growth Boundary",
    unit: "Per $1M of underused urban land value per year",
    currentAnnual: {
      amount: 0,
      kind: "neutral",
      label: "No explicit underuse charge in this model",
    },
    futureAnnual: {
      amount: 10_000,
      kind: "cost",
      label: "Example 1% land-value charge",
    },
    annualChange: "About $10,000/year more carrying cost per $1M of underused land value.",
    calculationNote: "Illustrative land-value tax example only; exact rate and legal structure are not specified in this package.",
    currentPosition: "Benefit from scarce urban land and the option to wait.",
    packageEffect: "Land-value taxation and stronger build-inside-the-boundary rules would make holding underused land more expensive.",
    burden: "Higher carrying cost for sitting on valuable buildable land.",
    benefit: "Owners who actually build may benefit from clearer approvals and infrastructure funding.",
    honesty: "The package intentionally shifts pressure onto underused urban land.",
    result: "paysMore",
    certainty: "Medium",
  },
  {
    name: "Rural, farm, and forest landowners outside the Urban Growth Boundary",
    unit: "Per landowner per year",
    currentAnnual: {
      amount: 0,
      kind: "neutral",
      label: "No annual cash cost modeled",
    },
    futureAnnual: {
      amount: 0,
      kind: "neutral",
      label: "No annual cash change modeled",
    },
    annualChange: "The real issue is development option value, not an annual bill we can responsibly estimate here.",
    calculationNote: "Kept at $0 because this page does not yet model rural development option value.",
    currentPosition: "Protected from urban encroachment but limited in development options.",
    packageEffect: "Keeping the boundary while building more inside preserves rural protection.",
    burden: "Continued loss of urban development option value outside the boundary.",
    benefit: "Less pressure to expand the boundary if Portland builds enough inside it.",
    honesty: "They remain mixed: protected from sprawl, but restricted from urban conversion.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "Low-income renters in vulnerable neighborhoods",
    unit: "Per lower-income renter household per year",
    currentAnnual: {
      amount: renterShortage10,
      kind: "cost",
      label: "Modeled shortage markup today",
    },
    futureAnnual: {
      amount: renterShortage5,
      kind: "cost",
      label: "Remaining premium if supply and protections work",
    },
    annualChange: "About $993/year less rent pressure, but only if anti-displacement funding is real.",
    calculationNote: "Uses the same median-rent shortage-premium model; for a $40,000 household, the current $1,986 is about 5% of gross income.",
    currentPosition: "Benefit from tenant protections but face displacement if growth is pushed mainly into cheaper neighborhoods.",
    packageEffect: "The package should spread growth into high-opportunity areas and fund direct anti-displacement help.",
    burden: "Construction pressure can still raise anxiety, rents, and land values if protections are weak.",
    benefit: "More tenant stability money, more affordable units, and less concentration of change in poorer neighborhoods.",
    honesty: "They are only net winners if anti-displacement funding is real and growth is geographically fair.",
    result: "mixed",
    certainty: "Medium",
  },
  {
    name: "Homeowners who oppose new housing nearby",
    unit: "Per median-value home per year",
    currentAnnual: {
      amount: annualValueOfScarcityPremium,
      kind: "benefit",
      label: "Annualized value of a 10% shortage markup",
    },
    futureAnnual: {
      amount: annualValueOfScarcityPremium / 2,
      kind: "benefit",
      label: "Remaining annualized premium if cut in half",
    },
    annualChange: "About $1,454/year less scarcity-value benefit in this model.",
    calculationNote: "Annualizes a 10% shortage markup on a $581,500 home at a 5% return rate, then cuts the premium in half.",
    currentPosition: "Can benefit from scarcity, less competition, preserved parking, and more control over neighborhood change.",
    packageEffect: "More by-right housing and a land/property fairness package would reduce their ability to block planned homes.",
    burden: "Less control over nearby change and less shortage markup in home value.",
    benefit: "More options for family members, workers, and services to stay in the city.",
    honesty: "This is probably the most politically important loser group.",
    result: "losesAdvantage",
    certainty: "High",
  },
];

/**
 * Signed annual effect: positive means the group comes out ahead under a rule
 * set, negative means it pays. Used so a "benefit" and a "cost" never get
 * subtracted as if they were the same sign.
 */
export function signedAnnualEffect(effect: AnnualEffect): number {
  if (effect.kind === "benefit") return effect.amount;
  if (effect.kind === "neutral") return 0;
  return -effect.amount;
}

export type WinnerLoserSide = "winner" | "loser" | "middle";

export interface WinnerLoserGroup {
  name: string;
  side: WinnerLoserSide;
  /** Signed dollars per year, same unit family across the chart: + ahead, - pays. */
  amount: number;
  unit: string;
  persona: string;
  why: string;
}

/**
 * The single, consolidated winners-and-losers picture. Every amount is in the
 * same unit family (dollars per household or per unit, per year) so the bars are
 * actually comparable. System-wide effects live in SYSTEM_WIDE_GAP, off this axis.
 */
export const WINNERS_LOSERS: WinnerLoserGroup[] = [
  {
    name: "Owners of older, lightly taxed homes",
    side: "winner",
    amount: Math.round(medianHome35.annualAdvantageVsCpr),
    unit: "per home, every year",
    persona: "Bought years ago; the tax bill never caught up.",
    why: "Taxed as if the home is worth far less than it is, and the discount stays with the house when it sells.",
  },
  {
    name: "Landlords with older buildings",
    side: "winner",
    amount: Math.round(renterShortage10),
    unit: "per rented unit, every year",
    persona: "Owns a fourplex bought decades ago.",
    why: "A low, frozen tax bill, plus rents lifted by a citywide shortage.",
  },
  {
    name: "Homeowners who keep new homes out",
    side: "winner",
    amount: Math.round(annualValueOfScarcityPremium),
    unit: "per home, every year",
    persona: "Fights the apartments proposed down the block.",
    why: "Scarcity quietly adds to their own home's value, so blocking homes can pay.",
  },
  {
    name: "Renters looking for a place now",
    side: "loser",
    amount: -Math.round(renterShortage10),
    unit: "per household, every year",
    persona: "New to town, bidding against everyone else.",
    why: "Pays a shortage markup on rent, with no old tax break to offset it.",
  },
  {
    name: "First-time buyers",
    side: "loser",
    amount: -Math.round(buyerScarcity20),
    unit: "per buyer household, every year",
    persona: "Trying to buy a first home against inflated prices.",
    why: "The shortage is baked into the price, so they borrow far more to get in.",
  },
  {
    name: "The next apartment building",
    side: "loser",
    amount: -Math.round(multifamilyStackCurrent),
    unit: "per new home, every year",
    persona: "A 100-home project deciding whether to break ground.",
    why: "Pays new-value taxes, city fees, affordable-unit costs, delay, and design rules all at once.",
  },
  {
    name: "Future Portlanders",
    side: "loser",
    amount: -Math.round(renterShortage10),
    unit: "per future household, every year",
    persona: "The nurse or grad who hasn't moved here yet.",
    why: "Can't vote or testify here yet, so the shortage gets decided without them.",
  },
  {
    name: "Older neighbors on fixed incomes",
    side: "middle",
    amount: 0,
    unit: "protected, but cash-poor",
    persona: "Retired, house-rich, living on a fixed check.",
    why: "The cap can be the difference between staying and being taxed out — real protection worth keeping.",
  },
];

export const SYSTEM_WIDE_GAP = {
  amount: 100_000_000,
  label: "a year for city services and infrastructure",
  note: "When property taxes stay capped and new buildings are waved past fees, the money has to come from somewhere — usually fees on the next project, income taxes, or skipped maintenance.",
};

export const NAV = [
  { id: "measure-50", label: "Why it happens" },
  { id: "winners-losers", label: "Winners & losers" },
  { id: "contradictions", label: "Broken promises" },
  { id: "parcel-lookup", label: "Your address" },
  { id: "reforms", label: "The fix" },
  { id: "calculator", label: "Try it yourself" },
  { id: "take-action", label: "Take action" },
  { id: "sources", label: "Sources" },
];

export const HEADLINE_STATS = [
  { value: "$2,000+", label: "a year an older home can save vs. a same-value newer one" },
  { value: "$276M", label: "a year renters pay for Portland's housing shortage" },
  { value: "120,560", label: "homes the city says it must plan for by 2045" },
  { value: "55,000", label: "homes Portland is already behind, needed by 2032" },
];

export const REFORMS = [
  "Set a minimum taxable-value floor for property far below market value, with income-based help for people who cannot pay more in cash.",
  "When non-owner-occupied property sells, move part of its taxable value closer to today's market value.",
  "Tax land value more honestly so valuable land is not rewarded for staying underused.",
  "Move development fees off finished new homes and pay for infrastructure more broadly.",
  "Pay for affordable-unit requirements directly instead of hiding the cost inside new buildings.",
  "If a housing project follows clear rules, let it get approved where the city has already planned for growth.",
  "Allow more small homes, duplexes, triplexes, apartments, and condos near jobs, schools, parks, and transit.",
  "Keep the Urban Growth Boundary, but require real homebuilding inside the boundary.",
  "Fund tenant security directly without making future housing harder to build.",
  "Use public land for permanent mixed-income housing.",
] as const;

export const STAKEHOLDER_BARGAIN = [
  { audience: "Renters", promise: "More homes, stronger tenant security, less shortage pricing, and direct help when at risk." },
  { audience: "First-time buyers", promise: "More duplexes, townhomes, small condos, and fewer old tax advantages baked into prices." },
  { audience: "Low-income seniors", promise: "No one is taxed out of a home; increases above ability to pay are delayed until sale or inheritance." },
  { audience: "Builders", promise: "If you follow clear rules and build real homes, the city stops making time your enemy." },
  { audience: "Neighborhood advocates", promise: "Clear design, tree, infrastructure, and livability standards upfront, but no endless fight over homes that follow the rules." },
  { audience: "Taxpayers", promise: "Affordable housing, infrastructure, and anti-displacement costs become visible instead of hidden in new housing." },
];

export const PersonasIcon = Users;
