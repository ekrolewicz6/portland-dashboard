/**
 * The two cases, argued at full strength.
 *
 * House rule for these pages: build each side from what that side's own most
 * capable advocates actually say, using their best evidence, not the version
 * that is easiest to knock down. A reader who agrees with either side should
 * finish that side's section thinking "yes, that's it", and then be genuinely
 * tested by the other one.
 *
 * Two things make this fight unusual and both belong in the framing:
 *
 *   1. Almost nobody disputes the history. ODOT, Albina Vision Trust and the
 *      opposition all agree a Black neighborhood was destroyed to build this
 *      freeway and that something is owed. What is contested is really two
 *      questions tangled together: whether to widen the freeway at all — freight
 *      and labour want the lanes on their own merits, and whether the covers
 *      can be had without the widening.
 *   2. The strongest evidence against the widening is not from advocates. It
 *      is from ODOT's own consultant, ODOT's own safety analysis, and the
 *      Eisenhower administration's own public works planner.
 */

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: "primary" | "news" | "analysis" | "book";
  year?: number;
}

export const ARG_SOURCES = {
  downs1962: {
    id: "downs1962",
    title: "The Law of Peak-Hour Expressway Congestion",
    org: "Anthony Downs, Traffic Quarterly",
    url: "https://trid.trb.org/View/697530",
    kind: "analysis",
    year: 1962,
  },
  bragdon1960: {
    id: "bragdon1960",
    title: "Progress Review and Analysis, Federal Highway Program — Interim Report",
    org: "Gen. John S. Bragdon, Special Assistant for Public Works Planning",
    url: "https://www.eisenhowerlibrary.gov/research/finding-aids/b/bragdon-john-s-records-1953-61",
    kind: "primary",
    year: 1960,
  },
  litman2026: {
    id: "litman2026",
    title: "Roadway Costs, User Revenues and Cost Recovery Trends",
    org: "Todd Litman, Victoria Transport Policy Institute",
    url: "https://www.vtpi.org/rcrt.pdf",
    kind: "analysis",
    year: 2026,
  },
  guerra2025: {
    id: "guerra2025",
    title: "Overbuilt: The High Costs and Low Rewards of US Highway Construction",
    org: "Erick Guerra, Island Press",
    url: "https://islandpress.org/books/overbuilt",
    kind: "book",
    year: 2025,
  },
  kimble2024: {
    id: "kimble2024",
    title: "City Limits: Infrastructure, Inequality, and the Future of America's Highways",
    org: "Megan Kimble",
    url: "https://megankimble.com",
    kind: "book",
    year: 2024,
  },
  eberts2009: {
    id: "eberts2009",
    title: "Understanding the Contribution of Highway Investment to National Economic Growth",
    org: "Randall W. Eberts, Upjohn Institute",
    url: "http://research.upjohn.org/reports/115",
    kind: "analysis",
    year: 2009,
  },
  brownMorrisTaylor: {
    id: "brownMorrisTaylor",
    title: "Paved with Good Intentions: Fiscal Politics, Freeways, and the 20th Century American City",
    org: "Brown, Morris & Taylor, Access 35",
    url: "https://www.accessmagazine.org/fall-2009/paved-good-intentions-fiscal-politics-freeways-20th-century-american-city/",
    kind: "analysis",
    year: 2009,
  },
  meloGrahamCanavan: {
    id: "meloGrahamCanavan",
    title: "Effects of Road Investments on Economic Output and Induced Travel Demand",
    org: "Melo, Graham & Canavan, Transportation Research Record 2297",
    url: "https://doi.org/10.3141/2297-20",
    kind: "analysis",
    year: 2012,
  },
  georgetownRmi: {
    id: "georgetownRmi",
    title: "States Are in the Driver's Seat on Transportation Carbon Pollution",
    org: "Georgetown Climate Center & RMI",
    url: "https://www.georgetownclimate.org/articles/issue-brief-states-are-in-the-drivers-seat-on-transportation-carbon-pollution.html",
    kind: "analysis",
    year: 2023,
  },
  t4aIija: {
    id: "t4aIija",
    title: "The IIJA is a climate time bomb. Will states defuse it?",
    org: "Transportation for America",
    url: "https://t4america.org/2024/02/28/the-iija-is-a-climate-time-bomb-will-states-defuse-it/",
    kind: "analysis",
    year: 2024,
  },
  wspPricing: {
    id: "wspPricing",
    title: "ODOT consultant: Pricing is a better fix for the Rose Quarter",
    org: "City Observatory, on ODOT's July 2022 memo",
    url: "https://cityobservatory.org/congestion-pricing-better_wsp/",
    kind: "analysis",
    year: 2022,
  },
  odotCrashRamp: {
    id: "odotCrashRamp",
    title: "ODOT's own analysis: the new ramp increases crashes",
    org: "City Observatory, on ODOT's Aug 2022 safety report",
    url: "https://cityobservatory.org/rq_more_crashes/",
    kind: "analysis",
    year: 2022,
  },
  odotAbout: {
    id: "odotAbout",
    title: "Project overview and benefits",
    org: "ODOT, I-5 Rose Quarter Improvement Project",
    url: "https://www.i5rosequarter.org/about/",
    kind: "primary",
  },
  odotFaq: {
    id: "odotFaq",
    title: "Project FAQs — safety, width, and purpose",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/faqs/",
    kind: "primary",
  },
  odotSafetyFs: {
    id: "odotSafetyFs",
    title: "Safety Conditions and Improvements fact sheet",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/xhmowytt/i5rq_safety-conditions-improvements_2025_remediated.pdf",
    kind: "primary",
  },
  odotFreightFs: {
    id: "odotFreightFs",
    title: "Freight and Mobility fact sheet",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/kljhhj30/i5rq_fs_gr-02-freightmobility_07222026_remediated.pdf",
    kind: "primary",
  },
  odotAlbinaFs: {
    id: "odotAlbinaFs",
    title: "The Future of Albina fact sheet",
    org: "ODOT",
    url: "https://www.i5rosequarter.org/media/0lfj1gnm/i5rq_fs_gr-01-future_07242026_remediated.pdf",
    kind: "primary",
  },
  avtWithdrawal2020: {
    id: "avtWithdrawal2020",
    title: "Albina Vision Trust withdraws support for the I-5 Rose Quarter project",
    org: "Willamette Week",
    url: "https://www.wweek.com/news/state/2020/06/30/racial-justice-group-albina-vision-trust-now-wont-support-i-5-rose-quarter-project/",
    kind: "news",
    year: 2020,
  },
  avtTransportation: {
    id: "avtTransportation",
    title: "Albina Vision Trust on transportation and the highway cover",
    org: "Albina Vision Trust",
    url: "https://www.albinavisioninc.com/transportation",
    kind: "primary",
  },
  avtRescue: {
    id: "avtRescue",
    title: "Albina Vision Trust rescues I-5 Rose Quarter project, again",
    org: "BikePortland",
    url: "https://bikeportland.org/2025/12/11/albina-vision-trust-rescues-i-5-rose-quarter-project-again-398585",
    kind: "news",
    year: 2025,
  },
  advocatesSpar: {
    id: "advocatesSpar",
    title: "Advocates spar ahead of pivotal Rose Quarter vote",
    org: "BikePortland",
    url: "https://bikeportland.org/2025/12/09/advocates-spar-ahead-of-pivotal-rose-quarter-project-vote-398505",
    kind: "news",
    year: 2025,
  },
  capExplainer: {
    id: "capExplainer",
    title: "Let's talk about the I-5 freeway cap",
    org: "BikePortland",
    url: "https://bikeportland.org/2024/03/14/lets-talk-about-the-i-5-freeway-cap-384767",
    kind: "news",
    year: 2024,
  },
  rochester: {
    id: "rochester",
    title: "Rochester's Inner Loop East removal",
    org: "Segregation by Design",
    url: "https://www.segregationbydesign.com/rochester-ny/inner-loop-and-removal",
    kind: "analysis",
  },
  cnuRemovals: {
    id: "cnuRemovals",
    title: "Eight completed highway removals tell the story of a movement",
    org: "Congress for the New Urbanism",
    url: "https://www.cnu.org/publicsquare/2022/05/31/eight-completed-highway-removals-tell-story-movement",
    kind: "analysis",
    year: 2022,
  },
  flag2005: {
    id: "flag2005",
    title: "I-5/I-405 Freeway Loop Advisory Group — Summary Report",
    org: "City of Portland",
    url: "https://www.portland.gov/sites/default/files/2020-01/freeway-loop-study-project-summary-report-2005.pdf",
    kind: "primary",
    year: 2005,
  },
} as const satisfies Record<string, Source>;

export type ArgSourceId = keyof typeof ARG_SOURCES;

export interface Argument {
  n: string;
  claim: string;
  body: string;
  evidence: string;
  sourceId: ArgSourceId;
}

/**
 * The case FOR. Built from ODOT's stated purpose and need, Albina Vision
 * Trust's published position, and the labour and freight case — the coalition
 * that actually carried this project through the Oregon Transportation
 * Commission in December 2025.
 */
export const CASE_FOR: Argument[] = [
  {
    n: "01",
    claim: "The cap is the mitigation the freeway never paid",
    body:
      "The community position on this project has never been a vote for the lanes, and, less noticed, never a vote against them either. It is deliberately agnostic on the widening, with one narrower demand: if the state runs a project through this neighborhood, it must tunnel the freeway. Environmental review already forces mitigation of air and noise; the deeper injury is structural. A freeway trench organises an entire district around moving cars through it, and a walkable neighborhood is close to impossible beside one. On this view the cap is not an amenity. It is remediation of the original harm, owed the same way air-quality mitigation is owed.",
    evidence:
      "When those terms weren't met, the trust walked out — its 2020 withdrawal demanded amends and covers engineered to carry buildings, and the project stalled for two years until it got them. The rebuilding of Albina is proceeding on acquired land regardless; the cap decides whether it happens beside an open trench or on top of a healed street grid.",
    sourceId: "avtWithdrawal2020",
  },
  {
    n: "02",
    claim: "This is the state's most crash-prone urban interstate",
    body:
      "ODOT's case rests on geometry, not volume: a two-lane section with no full shoulders where three interstates converge, so a stalled car or a merge conflict has nowhere to go. The auxiliary lanes exist to separate merging traffic from through traffic, which is the specific movement that produces rear-end crashes here.",
    evidence:
      "ODOT reports a crash rate about 3.5 times the statewide I-5 average, the highest on any urban interstate in Oregon, and projects up to a 50% reduction.",
    sourceId: "odotSafetyFs",
  },
  {
    n: "03",
    claim: "It is the only two-lane pinch point on I-5 between Canada and Mexico",
    body:
      "I-5 is the west coast's freight spine. This section is the narrowest urban link on the entire route, and freight cannot reroute the way commuters can — a truck bound for the Port of Portland is not going to take transit. Oregon's economy runs through a bottleneck that was designed for 1960s volumes.",
    evidence:
      "About 11,700 trucks a day, roughly 10% of traffic, carrying more than $100 million in goods daily. ODOT ranks it Oregon's worst bottleneck and among the worst freight bottlenecks nationally.",
    sourceId: "odotFreightFs",
  },
  {
    n: "04",
    claim: "The structures need rebuilding anyway",
    body:
      "The overcrossings are old, seismically deficient, and sit on a viaduct whose deck was last replaced in 1985, which is exactly why it is being torn out this September. If the bridges must come down and go back up regardless, the marginal cost of doing it in a configuration that also carries a neighborhood is smaller than the headline number suggests.",
    evidence:
      "Phase 1A, already under construction, is largely seismic retrofit and bridge preservation, and adds no through capacity.",
    sourceId: "odotAbout",
  },
  {
    n: "05",
    claim: "It is a jobs programme for the community that was harmed",
    body:
      "The project carries workforce and contracting commitments aimed specifically at Black-owned firms and apprentices — the most concrete redistribution on the table, and the reason organised labour and a number of Black contractors have backed it while some advocacy groups have not.",
    evidence:
      "ODOT projects roughly 2 million labour hours and up to $150 million in payroll and benefits directed to minority- and women-owned firms.",
    sourceId: "odotAlbinaFs",
  },
];

/**
 * The case AGAINST. Deliberately built as far as possible from ODOT's own
 * documents and from the historical record rather than from advocacy, because
 * that is where this case is strongest.
 */
export const CASE_AGAINST: Argument[] = [
  {
    n: "01",
    claim: "ODOT's own consultant found the cheaper alternative works better",
    body:
      "A July 2022 memorandum attached to the project's own Supplemental Environmental Assessment found that pricing the road would cut traffic and raise speeds more than the widening would — for more than a billion dollars less. ODOT's environmental review then stated that congestion pricing was not considered. That is not an advocacy claim about the project; it is the project's own file.",
    evidence:
      "The same review that omitted pricing is the one now being challenged in federal court for failing to consider alternatives.",
    sourceId: "wspPricing",
  },
  {
    n: "02",
    claim: "Adding lanes to an urban freeway does not durably reduce congestion",
    body:
      "This is not a new or contested finding. Anthony Downs formalised it in 1962: on urban commuter expressways, peak-hour congestion rises to meet capacity. Sixty years of evidence since has been consistent. A wider road at the Rose Quarter buys some years of relief and then returns to congestion, with more vehicles in the same space.",
    evidence:
      "Downs's Law of Peak-Hour Expressway Congestion, Traffic Quarterly, 1962 — published four years before this section of I-5 opened.",
    sourceId: "downs1962",
  },
  {
    n: "03",
    claim: "The safety case does not survive ODOT's own safety analysis",
    body:
      "ODOT quotes a crash RATE, and the crashes behind it are overwhelmingly low-speed property damage — the rear-enders congestion produces, not the collisions that kill people. ODOT's own safety policy prioritises fatal and serious-injury crashes, and by that measure the state's deadliest roads are the old orphan highways that predate the interstate era and now run through neighborhoods while still being managed like highways: TV Highway, 82nd, Powell, Barbur. Metro has said the state never showed this section is unusually dangerous for serious crashes. More pointedly, ODOT's own modelling concedes the relocated ramp fails Highway Safety Manual standards and raises crashes.",
    evidence:
      "ODOT's August 2022 safety technical report projects roughly a 13% crash increase from the new ramp configuration versus no-build. Spending $3.5 billion at the state's fender-bender capital while its fatality corridors wait is a choice, not a safety programme.",
    sourceId: "odotCrashRamp",
  },
  {
    n: "04",
    claim: "Putting the freeway here was never the plan, and the government said so at the time",
    body:
      "The standard defence of urban interstates is that they were a national decision made long ago. The record says otherwise. In March 1960, Eisenhower's own Special Assistant for Public Works Planning wrote that interstates should not be aimed at the centres of congestion, that inner loops should not be part of the system, and that practically all experts agreed transit was the answer for cities. Eisenhower himself said that routing interstates through congested cities was against his original concept and that he never anticipated it.",
    evidence:
      "Bragdon's interim report reached the President in 1960. The highway departments kept building, because the federal match paid 90 cents on the dollar for roads and nothing for transit.",
    sourceId: "bragdon1960",
  },
  {
    n: "05",
    claim: "The economics stopped working decades ago",
    body:
      "Highway investment returns were extraordinary when the network was new and have fallen steadily ever since, to the point where urban expansions are generally poor investments. Meanwhile the user-pays story has quietly collapsed: road user fees now cover only about half of roadway spending nationally, with the rest drawn from general taxes paid by everyone, including people who do not drive.",
    evidence:
      "Estimated returns fell from about 55% in 1949–50 to roughly 13% by 1990–2000. Subsidies now exceed $500 per vehicle per year.",
    sourceId: "litman2026",
  },
  {
    n: "06",
    claim: "You can cover a freeway without widening it",
    body:
      "This is the crux, and the bundle has two origin stories that are both true. The state's interest was always the freight bottleneck — the lane is the point, the neighborhood incidental. The caps entered the project as the local price of permission, when the city, the county and Metro made clear the widening would never be permitted without them. Since then the marriage has been forced in both directions: either both things happen or neither does, which means opposing the lanes is made to look like opposing the neighborhood, and defending the neighborhood means carrying the lanes.",
    evidence:
      "Opponents note there is no binding obligation compelling ODOT to build the covers once the lanes are widened. AVT's counter is that the covers cannot be built without the highway work. Notably, no published document has ever priced the covers-without-widening option — it has never been analysed at all.",
    sourceId: "advocatesSpar",
  },
];

/**
 * Litman's underpricing arguments and counterarguments, adapted. This is the
 * cleanest existing framework for testing the "roads pay for themselves"
 * intuition that underlies most support for expansion, so it is reproduced
 * with attribution rather than reinvented.
 */
export interface Exchange {
  argument: string;
  counter: string;
  optimal: string;
}

export const PRICING_EXCHANGES: Exchange[] = [
  {
    argument: "Everybody uses roads, so everybody should pay — including non-drivers.",
    counter:
      "Roads do provide basic access that benefits everyone, but that only requires minimal capacity. The additional cost of roads designed to move large volumes of cars at speed is a cost of serving drivers.",
    optimal:
      "User fees should recover roadway costs, priced higher for larger vehicles and peak-period driving.",
  },
  {
    argument: "Roadway expansions reduce congestion, which benefits everybody.",
    counter:
      "Urban roadway expansions provide little long-term congestion relief, and degrade access by every other mode in the process.",
    optimal: "Implement cost-effective congestion pricing before expanding roads.",
  },
  {
    argument: "Roadway investment increases economic productivity.",
    counter:
      "In urban regions with mature transport systems, productivity declines with increased road supply and rises with improvements to non-auto modes and density.",
    optimal:
      "Invest in the most cost-effective accessibility improvements, which are seldom roadway subsidies.",
  },
  {
    argument: "Road user fees and tolls are regressive and harm lower-income drivers.",
    counter:
      "Underpricing roads harms lower-income travellers overall, by increasing traffic and entrenching car dependency. User fees are less regressive than most alternatives, including sales taxes.",
    optimal:
      "Favour affordable modes. Where subsidy is justified on equity grounds, target it rather than granting it to higher-income drivers.",
  },
];

/** What the land under an urban freeway is worth, when a city gets it back. */
export const LAND_VALUE = {
  dallas: {
    project: "I-345, Dallas — removal analysis",
    acres: 377,
    developmentPotential: 9_000_000_000,
    annualPropertyTax: 255_000_000,
    housingUnits: 26_000,
    note: "The land freed by removing an elevated urban freeway, valued by the city's own analysis.",
  },
  rochester: {
    project: "Inner Loop East, Rochester — completed 2017",
    cost: 22_000_000,
    developmentInduced: 229_000_000,
    acres: 6.5,
    walkingIncrease: 50,
    bikingIncrease: 60,
    note: "The clearest completed precedent: about a third of a downtown loop removed and replaced with a street grid.",
  },
} as const;

/** National context for where the money actually goes. */
export const NATIONAL_CONTEXT = {
  costRecoveryPct: 51,
  costRecoveryPeakPct: 71,
  subsidyPerVehicleYear: 500,
  roadwayExpendituresB: 295,
  userRevenuesB: 151,
  vmtGrowthSince1960: 4.5,
  spendGrowthSince1960: 2.5,
  revenueGrowthSince1960: 0.74,
  returnsThen: 55,
  returnsNow: 13,
  iija: {
    highwayExpansionPct: 25.7,
    highwayResurfacingPct: 27.9,
    transitRailPct: 19.6,
    activeModesPct: 3.3,
  },
} as const;
