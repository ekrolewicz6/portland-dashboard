/**
 * Findings drawn from the Data Center Advisory Committee's own public record —
 * every presentation, facilitator summary, and agency deck posted to ODOE's
 * committee page, read August 3, 2026. Document URLs live in dcac-docs.ts.
 *
 * Where presenters disagree, both figures are kept and attributed. Nothing
 * here is our estimate; each item is sourced to a specific deck.
 */

export type Camp =
  | "industry"
  | "utility"
  | "local-gov"
  | "labor"
  | "tribal"
  | "advocate"
  | "agency"
  | "academic";

export interface Voice {
  who: string;
  org: string;
  camp: Camp;
  position: string;
  /** The single hardest number or ask they put on the record. */
  evidence: string;
}

export const CAMP_LABEL: Record<Camp, string> = {
  industry: "Industry",
  utility: "Utilities",
  "local-gov": "Local government",
  labor: "Labor",
  tribal: "Tribal",
  advocate: "Advocates",
  agency: "State agencies",
  academic: "Academic / expert",
};

/** Who actually showed up, and what they put on the record. */
export const VOICES: Voice[] = [
  {
    who: "Jody Wiser",
    org: "Tax Fairness Oregon",
    camp: "advocate",
    position: "End the property tax breaks outright in 2027.",
    evidence:
      "Oregon stacks four subsidies: no sales tax (Amazon saved ~$3B on $39.3B of eastern Oregon investment), ~$450M/yr in property tax breaks, publicly funded infrastructure, and a 10-year income tax exemption — Meta paid about 1.3% instead of 7.6%. California and Washington offer no data-center property tax break at all.",
  },
  {
    who: "Mike Gorman",
    org: "Morrow County Assessor",
    camp: "agency",
    position:
      "Reports the numbers without taking a side, and they are the sharpest in the record.",
    evidence:
      "Morrow County exempts $7.25B of data-center value against $4.20B of total certified value: $123.6M in exempted tax versus $72.3M actually collected countywide, with $23.9M coming back as fees. Umatilla exempts $119.7M and collects $14.2M in payments.",
  },
  {
    who: "Alex Albertine & Michael Held",
    org: "Business Oregon",
    camp: "agency",
    position: "Incentives leverage investment the state would not otherwise capture.",
    evidence:
      "The agency's own return figures split hard by program: short-term standard enterprise zones return 29.16, while the 15-year rural program that carries nearly all data-center value — $15.4B of $15.8B invested, $233.6M of $240.9M abated — returns 1.18.",
  },
  {
    who: "Ellen Harpel",
    org: "Smart Incentives (national expert)",
    camp: "academic",
    position: "Reprice and condition; don't abolish. And speed can beat money.",
    evidence:
      "38 states offer data-center incentives, but only 11 have statewide property tax breaks. The 2026 trend is pause-and-adjust — moratoria in Ohio, Arizona, Illinois; conditions in Pennsylvania and Utah. Fast-track permitting often matters more to operators than subsidy dollars.",
  },
  {
    who: "Supt. Tricia Mooney",
    org: "Hermiston School District",
    camp: "local-gov",
    position: "The school fee doesn't actually reach the school.",
    evidence:
      "The enterprise-zone School Support Fee is offset by the state equalization formula — it is 'not additional support to the local district.' Districts often choose the 15% minimum to leave room for negotiated community benefits instead.",
  },
  {
    who: "Torrie Philippi-Griggs",
    org: "Boardman Chamber of Commerce",
    camp: "local-gov",
    position: "Locally negotiated deals buy things a small town could never fund.",
    evidence:
      "Fees flow through a local nonprofit board: more than $2.5M in homebuyer incentives over 15 years, a $6M business incubator, and a $240M school bond with a single data-center partner covering over 80%.",
  },
  {
    who: "Steve Forrester & Mayor Jason Beebe",
    org: "City of Prineville",
    camp: "local-gov",
    position: "Data centers rebuilt a town the timber economy left for dead.",
    evidence:
      "Unemployment fell from 20% in 2009 to about 6%; county wages went from near-worst to second-highest in Oregon. Franchise fees run $10–12M a year against roughly $30,000 a month before the data centers arrived.",
  },
  {
    who: "Robert Echenrode",
    org: "Umatilla Electric Cooperative",
    camp: "utility",
    position: "Consumer-owned utilities already solved this locally; don't preempt us.",
    evidence:
      "Data-center load pushed co-op sales from about 1 million to 8.4 million MWh by 2024 while residential rates stayed roughly 30% below the national average. Utility plant grew from ~$140M in 2010 to ~$775M in 2025.",
  },
  {
    who: "Nolan Moser & Bret Stevens",
    org: "Oregon Public Utility Commission",
    camp: "agency",
    position: "Growth pays for growth — the POWER Act is now operational.",
    evidence:
      "PGE's May 2026 order sets a 90% minimum demand charge, 10–30 year contracts, exit fees, and a 1¢/kWh surcharge on facilities over 100 MW funding efficiency for energy-burdened households. Rates: +29% data centers, −1.3% residential, −3.7% small business.",
  },
  {
    who: "Anahi Segovia Rodriguez",
    org: "Verde",
    camp: "advocate",
    position: "Put residential affordability at the center; communities bear the burden.",
    evidence:
      "PGE and Pacific Power rates rose more than 50% between 2019 and 2025. Disconnections hit 71,190 in 2025, with 9,839 in the first quarter of 2026 alone.",
  },
  {
    who: "Kelly Campbell",
    org: "Columbia Riverkeeper",
    camp: "advocate",
    position: "The only voice asking for a pause.",
    evidence:
      "A 100 MW data center consumes roughly 100 million gallons a year — about what 2,500 people use at home. Only half of data centers track water use at all. Asks for mandatory reporting plus a temporary moratorium until rules catch up.",
  },
  {
    who: "Julie Carter & Elijah Cetas",
    org: "Columbia River Inter-Tribal Fish Commission",
    camp: "tribal",
    position: "Treaty rights attach to places; assess cumulatively, not project by project.",
    evidence:
      "Salmon runs fell from 15–20 million fish a year to under 500,000 by the late 1970s. Asks for legally protected instream flows, groundwater and surface water managed as one system, and a true-cost analysis that counts treaty-resource damage.",
  },
  {
    who: "Beau Schilz",
    org: "Amazon Web Services",
    camp: "industry",
    position: "Our water use is small, efficient, and more than offset.",
    evidence:
      "284 million gallons statewide in 2024, 3–11% of host utilities' production, at a water-use effectiveness of 0.16 L/kWh, about 70% below the North American average, alongside roughly $400M invested in community water infrastructure.",
  },
  {
    who: "Mark Morgan",
    org: "City of Hermiston",
    camp: "local-gov",
    position: "Per acre, a data center is the lightest water user in town.",
    evidence:
      "Annual use per acre: schools ~1.7M gallons, food processing ~1.3M, homes ~850K, irrigated agriculture ~815K, hyperscale data center ~180K. With aquifer storage, he calculates a 191M gallon/year net gain for the Lower Umatilla basin.",
  },
  {
    who: "Niki Iverson & Dan Dias",
    org: "City of Hillsboro",
    camp: "local-gov",
    position: "Not a water problem here, and we planned for decades.",
    evidence:
      "Data centers used 112 million gallons in 2025 — 1.8% of total city consumption and 3% of industrial use. 'Data centers are not considered large water users in the City of Hillsboro.'",
  },
  {
    who: "Leigh McIlvaine",
    org: "Dept. of Land Conservation & Development",
    camp: "agency",
    position: "The land-use system is strong but straining; should siting be UGB-only?",
    evidence:
      "9,093 acres of identified demand, 6,472 of it requiring urban-growth-boundary expansion or rural upzoning. In 2025–26, data centers accounted for roughly two-thirds of all new industrial land brought inside UGBs.",
  },
  {
    who: "Sam Diaz",
    org: "1000 Friends of Oregon",
    camp: "advocate",
    position: "Prepare the land you already have; tie abatements to outcomes. No moratorium.",
    evidence:
      "A 66-jurisdiction survey found 9,746 acres already zoned industrial but only 21% development-ready, and 57.5% of jurisdictions reported missed opportunities for lack of ready land.",
  },
  {
    who: "Ben Gordon",
    org: "Central Oregon LandWatch",
    camp: "advocate",
    position: "Slow down and review cumulatively — not a ban.",
    evidence:
      "Asks for NEPA-style cumulative fiscal, infrastructure, and environmental review, statutory definitions for hyperscale and exascale, and stronger UGB-expansion standards before Oregon expands data-center land supply again.",
  },
  {
    who: "IBEW, LiUNA, OPEIU & the Building Trades",
    org: "Oregon construction unions",
    camp: "labor",
    position: "Explicitly opposed to any moratorium.",
    evidence:
      "Twenty-plus crafts work a single campus; one Central Oregon IBEW local grew from roughly 40 to about 500 electricians. Apprenticeships are debt-free and five years long.",
  },
  {
    who: "Jeff Omelchuck",
    org: "Infrastructure Masons (retired)",
    camp: "industry",
    position: "Court traditional hyperscalers, not gigawatt AI campuses, and plan for the bust.",
    evidence:
      "Oregon has ~123 data centers and zero AI-scale campuses. A Stargate-class project runs 6,000 construction jobs against 300 operating jobs. Warns to require decommissioning plans and financial surety: 'we don't want a hi-tech ghost town.'",
  },
  {
    who: "Ellen Zuckerman",
    org: "Google",
    camp: "industry",
    position: "We'll pay full incremental cost, and Oregon's law asks for less than Minnesota's.",
    evidence:
      "Points to a fleet PUE of 1.06, a 24/7 carbon-free commitment, and an Xcel Minnesota deal pairing 1,400 MW of wind and 200 MW of solar with a 300 MW/30 GWh iron-air battery — estimated at $1.1B of net benefit to other customers over 15 years. Calls Oregon's POWER Act a missed opportunity.",
  },
  {
    who: "Hamody Hindi",
    org: "Bonneville Power Administration",
    camp: "utility",
    position: "The queue has blown past anything our planning model can handle.",
    evidence:
      "Roughly 60 GW of generation requests, 60–65 GW of transmission service requests, and about 40 GW of line-and-load, some 30 GW of it data centers, against a Northwest peak of about 30 GW.",
  },
  {
    who: "Elaine Hart",
    org: "Sylvan Energy Analytics",
    camp: "academic",
    position: "Whether the region stays reliable depends on whether data centers can be curtailed.",
    evidence:
      "E3 projects a ~9 GW regional capacity shortfall by 2030. Data-center flexibility cuts new 2030 capacity needs from 1–5 GW to 0–3 GW, but baseline growth implies 7 to 9 days of large-load curtailment in a January-2024-type winter.",
  },
  {
    who: "Pete Wyckoff",
    org: "Minnesota Dept. of Commerce",
    camp: "agency",
    position: "Here is a package that does what Oregon's doesn't.",
    evidence:
      "Minnesota's 2025 bipartisan law requires utilities to show a data center won't raise other customers' rates or impede the 100%-by-2040 clean standard; sets 15-year agreements at 80% take-or-pay with collateral and exit fees; funds low-income weatherization from a large-user fee; and removed the electricity sales-tax exemption.",
  },
  {
    who: "Trustee Lisa Ganuelas",
    org: "Confederated Tribes of the Umatilla Indian Reservation",
    camp: "tribal",
    position: "Presenting to this committee is not consultation.",
    evidence:
      "Draws a formal line: CTUIR requires government-to-government consultation with the Governor's office when recommendations are finalized, not a presenter's slot. Flags siting opacity, waste heat, and small modular reactor co-location as unresolved.",
  },
  {
    who: "Terry Wirkkala & João Ferreira",
    org: "ECONorthwest / UVA Weldon Cooper",
    camp: "academic",
    position: "Commissioned, explicitly neutral: here is the size of the thing.",
    evidence:
      "2,630 direct operating jobs statewide — 0.2% of Oregon employment. Electricity demand rising from 14.0 TWh in 2025 to 24.8 TWh by 2030. A future 30 MW facility supports 730 construction jobs but only 46 permanent ones.",
  },
  {
    who: "Vanessa Clark",
    org: "Oregon Dept. of Education",
    camp: "agency",
    position: "Explains who actually loses school money, and it isn't the host district.",
    evidence:
      "Equalization backfills the abating district; the loss lands on the statewide pool instead, diluting every district's per-student rate. Roughly $1.50 per weighted student for every $1M added to or removed from the State School Fund.",
  },
  {
    who: "Ania Loyd",
    org: "Oregon DEQ",
    camp: "agency",
    position: "Reports the diesel fleet nobody was counting.",
    evidence:
      "2,482 large diesel backup generators totaling 6,328 MW across 39 permitted campuses, up from 135 MW permitted in 2012. Emission controls aren't required, and a 2025 streamlined-permit incentive for installing them has had zero uptake.",
  },
];

/** What the record establishes, regardless of which side cites it. */
export interface RecordFinding {
  claim: string;
  detail: string;
  attribution: string;
}

export const RECORD_FINDINGS: RecordFinding[] = [
  {
    claim: "The 15-year program Oregon used for nearly all data-center value barely breaks even",
    detail:
      "Business Oregon's own table: the long-term rural enterprise zone carries $15.4B of $15.8B in investment and $233.6M of $240.9M in abated taxes, and returns 1.18. The short-term standard program returns 29.16. The state is not disputing the critics' arithmetic; it published it.",
    attribution: "Business Oregon, June 26 session",
  },
  {
    claim: "Morrow County exempts more property tax than it collects",
    detail:
      "$7.25B of exempt data-center value against $4.20B of total certified value; $123.6M in exempted tax against $72.3M actually collected countywide, with $23.9M returning as negotiated fees. Umatilla exempts $119.7M and receives $14.2M.",
    attribution: "Morrow County Assessor, June 26 session",
  },
  {
    claim: "The school 'support fee' does not add money to the school",
    detail:
      "Oregon equalizes school funding, so when an abatement cuts a district's local revenue the state backfills that district. The loss shows up instead as a thinner statewide pool, about $1.50 per weighted student per $1M, meaning every district in Oregon pays a little for each local deal.",
    attribution: "Oregon Dept. of Education & Hermiston School District",
  },
  {
    claim: "Permanent jobs are small; construction jobs are not",
    detail:
      "ECONorthwest counts 2,630 direct operating jobs statewide, 0.2% of Oregon employment. A future 30 MW facility supports 730 construction jobs and 46 permanent ones. Business Oregon's larger 7,600-job figure counts construction and payroll effects — both numbers are real, they measure different things.",
    attribution: "ECONorthwest & Business Oregon",
  },
  {
    claim: "Electricity demand is the number that actually changes the state",
    detail:
      "Data-center consumption rises from 14.0 TWh in 2025 to 24.8 TWh by 2030 on ECONorthwest's projection — pushing toward 40% of Oregon's electricity demand. Average IT power per facility more than tripled, from ~11 MW pre-2010 to 39.5 MW for recent vintage.",
    attribution: "ECONorthwest, July 31 session",
  },
  {
    claim: "There are 2,482 diesel generators behind the cloud",
    detail:
      "6,328 MW of permitted backup capacity across 39 campuses, more than the state's largest power plants combined, up from 135 MW in 2012. Emission controls are not required, and DEQ's voluntary incentive to install them has had no takers.",
    attribution: "Oregon DEQ, July 31 session",
  },
  {
    claim: "Growth is moving west, where the case for subsidy is weakest",
    detail:
      "The installed base is eastern Oregon, but the next five years of physical growth run 80% west and 12% east. Hillsboro's advantages, eight trans-Pacific cables, are exactly the ones no abatement created.",
    attribution: "ECONorthwest, July 31 session",
  },
  {
    claim: "Data centers took two-thirds of Oregon's new industrial land",
    detail:
      "9,093 acres of identified demand, 6,472 of it needing UGB expansion or rural upzoning. In 2025–26, urban-growth-boundary expansions for data centers hit 3,243 acres — roughly two-thirds of all new industrial land brought inside UGBs statewide.",
    attribution: "DLCD, April 24 session",
  },
  {
    claim: "Connection requests already exceed the entire Northwest grid",
    detail:
      "Bonneville told the committee its queues hold roughly 60 GW of generation requests, 60–65 GW of transmission service requests, and about 40 GW of line-and-load — of which some 30 GW is data centers. Regional peak demand is about 30 GW. The asking is larger than the system that exists.",
    attribution: "Bonneville Power Administration, May 29 session",
  },
  {
    claim: "Oregon's ratepayer protections cover about 61% of the state",
    detail:
      "HB 2021's clean-energy mandate and the POWER Act's cost rules bind investor-owned utilities — roughly 61% of Oregon electricity sales. Much of the data-center buildout sits in co-op and PUD territory, where neither applies. Committee members flagged the risk that weak-protection territory simply attracts the next wave.",
    attribution: "ODOE & facilitator summary, May 29 session",
  },
  {
    claim: "Google told Oregon its own law was the weaker model",
    detail:
      "Presenting on energy, Google called the POWER Act a missed opportunity next to Minnesota's 2025 package, which pairs cost protection with affirmative clean-energy obligations, covers facilities from 5 MW up, and funds weatherization from a large-user fee. Oregon's law allocates cost; Minnesota's also directs what gets built.",
    attribution: "Google & Minnesota Dept. of Commerce, May 29 session",
  },
  {
    claim: "Everyone agreed on disclosure — including the cities burned by secrecy",
    detail:
      "DEQ called withheld information its 'biggest challenge' in permitting. The Dalles conceded that redacting Google's water figures 'created skepticism and hurt public trust.' Tribes, advocates, academics, and agencies all converged on mandatory reporting as the floor.",
    attribution: "March 27 water session, facilitator summary",
  },
  {
    claim: "The committee has already conceded the central point",
    detail:
      "The facilitator's June summary records that 'the DCAC agreed incentives need to be reviewed and modernized,' with several members flagging that school support fees mainly change who pays. The open question is no longer whether to reprice, but how far.",
    attribution: "Facilitator summary, June 26 session",
  },
];

/** Why the process is producing the outcome it is. */
export interface StructuralFactor {
  title: string;
  detail: string;
}

export const STRUCTURAL_FACTORS: StructuralFactor[] = [
  {
    title: "Tax policy was not in the original charge",
    detail:
      "The Governor added it after the charge was drafted. That is why the money question landed in month five of a seven-month process, compressed into a single June session, while water and land use each got a full day earlier in the calendar.",
  },
  {
    title: "The people most affected aren't on the committee",
    detail:
      "The seven members include no tribal representative, no utility, no data-center operator, and no ratepayer advocate. Those voices appear as presenters — heard for a scheduled slot, then absent from the deliberation that follows.",
  },
  {
    title: "Only new data centers are in scope",
    detail:
      "The charge covers siting of new facilities. The roughly $450M a year already committed to existing deals is structurally outside what the committee can recommend changing — the largest number in the debate is the one it cannot touch.",
  },
  {
    title: "Benefits concentrate; costs disperse",
    detail:
      "Morrow County collects about a third of its property tax from data centers, so its commissioner sits on the committee and defends the deals. The offsetting school-funding loss is spread thinly across 197 districts, where no single actor feels enough pain to organize. That asymmetry explains almost every alignment in the record.",
  },
  {
    title: "Counties negotiate alone against trillion-dollar counterparties",
    detail:
      "Assessors approve exemptions; the state does not. A county of 12,000 people negotiates with Amazon's real-estate team. One presenter asked the state to fund negotiating help for small towns — an admission of the mismatch that current law builds in.",
  },
  {
    title: "Secrecy is structural, not incidental",
    detail:
      "NDAs and shell LLCs are standard, and utilities are often bound to confidentiality. DEQ says withheld information is its biggest permitting obstacle; The Dalles fought a newspaper for 13 months over water figures. Regulators are negotiating against parties who know far more than they do.",
  },
  {
    title: "Power had a forcing mechanism; taxes don't",
    detail:
      "The POWER Act worked because one regulator with jurisdiction could rewrite one tariff and bind every large user at once. Tax policy has no equivalent lever — it is 36 counties making separate deals, which is why reform there requires the Legislature rather than an agency.",
  },
  {
    title: "The labor coalition rules out the loudest option",
    detail:
      "Building trades unions testified against any moratorium, and neither 1000 Friends nor LandWatch asked for one. With construction jobs real and concentrated, a pause has almost no constituency, which pushes the debate toward pricing and conditions instead of prohibition.",
  },
];
