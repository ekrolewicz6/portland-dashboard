/**
 * Asset-by-asset analysis (§7, §9.1, §17 of the source analysis).
 * Grades and directives are Portland Civic Lab analysis (`pclAnalysis`).
 * `liveSlug` links an asset to its live record in the CED initiative
 * registry, rendered by <LiveStatus/>.
 */

import type { SourceId } from "./data";

export interface AssetGrade {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad" | "na";
}

export interface SubVenue {
  name: string;
  body: string;
}

export interface VenueAsset {
  id: string;
  name: string;
  kicker: string;
  /** Narrative role: the story of what this asset is. */
  role: string;
  strengths: string[];
  risks: string[];
  grades: AssetGrade[];
  /** §17 directive. */
  directive: { headline: string; detail: string };
  subVenues?: SubVenue[];
  keyQuestion?: string;
  liveSlug?: string;
  sourceIds?: SourceId[];
}

export const ASSETS: VenueAsset[] = [
  {
    id: "moda",
    name: "Moda Center",
    kicker: "The flagship, bought for a dollar",
    role: "Paul Allen opened it in October 1995 as the Rose Garden: $262 million, of which the City put in $34.5 million and Allen and his lenders carried the rest. The financing didn't survive: Allen's Oregon Arena Corporation went bankrupt in 2004, creditors took the building, Allen bought it back in 2007, and Moda Health's name went up in 2013. Then, in 2024, the whole arc ended in a single line item: the arena transferred to the City of Portland for one dollar. The dollar bought roughly 1.5 million annual visitors, a major-league anchor tenant, and enormous strategic control. It also bought the biggest building-cost question the City has ever faced in this portfolio.",
    strengths: [
      "≈1.5 million annual visitors",
      "Major-league anchor tenant",
      "Strong concert and event market",
      "Valuable surrounding real estate",
      "A big surrounding business in parking and ticket fees",
    ],
    risks: [
      "An aging 1995 building with a very large identified renovation need",
      "A private operator keeping much of the money the building makes",
      "A tangled split of who gets the revenue and who pays for repairs",
      "Public money going in with no guarantee the public gets value back",
      "Rose Quarter land and development rights sold short inside a bigger arena deal",
    ],
    grades: [
      { label: "Demand", value: "A", tone: "good" },
      { label: "Strategic importance", value: "A", tone: "good" },
      { label: "Owner economics", value: "Incomplete", tone: "na" },
      { label: "Capital risk", value: "Very high", tone: "bad" },
    ],
    directive: {
      headline: "Proceed only conditionally.",
      detail: "Keep the NBA, fix the arena, use money already set aside for venues, but only with a hard cap on what the City can lose, private partners on the hook for finishing the job and eating the overruns, the City's right to see the books and audit them, a real share of the upside, and no development rights slipped away in the fine print.",
    },
    keyQuestion: "Not whether the building has users, but whether the public owner captures enough value and transfers enough risk under its contracts.",
    liveSlug: "moda-center-renovation-blazers-lease",
    sourceIds: ["wikiModa", "wikiRoseGardenBk", "pdxModaCenter", "svAnnualReport", "modaTermSheetOpb", "pclAnalysis"],
  },
  {
    id: "vmc",
    name: "Veterans Memorial Coliseum",
    kicker: "The complement, not the copy",
    role: "Skidmore, Owings & Merrill finished it in 1960: a gray glass-and-aluminum curtain wall around a free-floating concrete bowl, the roof carried on four seventy-foot piers. Portlanders called it the Glass Palace, and in 1961 the city dedicated it to veterans who made the supreme sacrifice. It has survived a demolition proposal (2009), earned a National Register listing the same year, and become the National Trust's first Portland National Treasure (2016). It is worth the most as Moda's complement, not as a smaller copy of it. The renovation is financed and underway; what comes next should be decided by evidence, not by another rendering.",
    strengths: [
      "Credible demand despite years of partial closure",
      "A genuine mid-size niche Moda cannot serve",
      "Renovation already substantially financed",
    ],
    risks: [
      "Repairs still stacked up beyond the current work",
      "The temptation to follow this renovation with another aspirational one",
    ],
    grades: [
      { label: "Demand", value: "Credible", tone: "good" },
      { label: "Owner economics", value: "Incomplete", tone: "na" },
      { label: "Condition", value: "Improving", tone: "warn" },
    ],
    directive: {
      headline: "Finish the current work. Be the complement, not the copy.",
      detail: "After it reopens, count what happens: which events, how many people, what it returns to the City, how many shows were pulled over from Moda versus genuinely new, what upkeep costs, what repairs remain. The next decision should rest on how the reopened building actually performs, not on a concept.",
    },
    sourceIds: ["wikiVmc", "ntVmc", "svAnnualReport", "pclAnalysis"],
  },
  {
    id: "rose-quarter-land",
    name: "Rose Quarter land, garages & development rights",
    kicker: "The most underappreciated asset in the portfolio",
    role: "The Rose Quarter is not two arenas. It is publicly owned real estate beside major transit lines: parcels, garages, plazas, air rights, reversion clauses. And it sits on ground with a memory. This is lower Albina: in 1956 voters approved the Coliseum's construction, and building it destroyed 476 homes, roughly half of them inhabited by Black families, the first of the clearance waves that I-5 and the Emanuel Hospital expansion would continue. Land like this is exactly what gets quietly undervalued inside an arena negotiation, one schedule-B exhibit at a time. It is also exactly where the district's future carries obligations older than any lease.",
    strengths: [
      "Strong event-linked demand",
      "Real money now, and big options kept open for later",
      "Right beside transit and the central city",
    ],
    risks: [
      "Development rights handed off without an independent appraisal",
      "Rebuilding garages as if people will always park this much",
      "Arenas left as islands in a sea of parking instead of anchors of a district",
    ],
    grades: [
      { label: "Demand", value: "Strong", tone: "good" },
      { label: "Owner economics", value: "Cash + option value", tone: "good" },
      { label: "Condition & highest use", value: "Needs analysis", tone: "warn" },
    ],
    directive: {
      headline: "Plan the district as seriously as the arenas.",
      detail: "Keep a parcel-by-parcel record: who owns what, ground leases, easements, parking capacity, garage condition, appraised value, development rights, air rights, reversions. Appraise the land publicly and plan the whole district before any new long-term commitment. Keep the City's options open.",
    },
    liveSlug: "rose-quarter-district-development-partner",
    sourceIds: ["gibsonAlbina", "rqPartnerResolution", "pclAnalysis"],
  },
  {
    id: "providence",
    name: "Providence Park",
    kicker: "The strongest asset, with an unknown attached",
    role: "Sport has been played on this block since 1893, when the Multnomah Amateur Athletic Club raised a grandstand over what had been a Chinese vegetable garden supplying much of the city's produce. The stadium itself went up in 1926 for $502,000 and has cycled through five names on its way to the loudest proof in the portfolio: every Timbers MLS home match has sold out since 2011, and the 2019 eastside expansion added capacity on roughly $75 million of private money. That is the financing model this analysis keeps asking for, already working. What the City still lacks is a current, complete picture of the building's condition, what it will cost to keep up over its life, and who pays for what under the operator agreement.",
    strengths: [
      "Capacity above 25,000; ~150 events annually",
      "Strong professional soccer demand",
      "$75M of private financing for the 2019 expansion: the financing model working as intended",
    ],
    risks: [
      "No complete public study of the building's condition",
      "A contract that runs out in 2035, which is closer than it sounds",
    ],
    grades: [
      { label: "Demand", value: "Exceptional", tone: "good" },
      { label: "Owner economics", value: "Likely favorable", tone: "good" },
      { label: "Capital visibility", value: "Incomplete", tone: "warn" },
      { label: "Overall", value: "A−", tone: "good" },
    ],
    directive: {
      headline: "Protect it, and know exactly what it costs.",
      detail: "Finish the building-condition study, pin down exactly what the City and the operator each owe, set aside money for long-term upkeep, put a price on every commercial right, and start the 2035 negotiation years before it becomes urgent.",
    },
    sourceIds: ["wikiProvidence", "pdxProvidence", "pdxProvidencePark", "pclAnalysis"],
  },
  {
    id: "keller",
    name: "Keller Auditorium",
    kicker: "A successful venue in an unsustainable building",
    role: "It opened on the Fourth of July, 1917, as the Public Auditorium. A 1968 modernization kept only seventeen percent of the original structure (mostly two walls) and produced what the critic Ada Louise Huxtable called \"a building of unrelieved blandness.\" The blandness works: Keller is the economic engine of Portland'5, with 179 events, 395,255 attendees, and $10.7 million in charges-for-services revenue in FY2024–25 (more than half the system's earned revenue), inside a building that needs major work for decades to come. That is the distinction the debate keeps missing: Keller is not an unsuccessful venue. It is a successful venue in a building that, over the long run, may be too expensive to keep standing.",
    strengths: [
      "Earns more than any other Portland'5 venue",
      "179 events, 395,255 attendees (FY2024–25)",
      "Over half of Portland'5 charges-for-services revenue",
    ],
    risks: [
      "Poor physical condition; big repair bills for decades",
      "$290M renovation estimate in Resolution 2026-270 materials",
      "The risk of ending up with two big Broadway halls if a PSU hall proceeds",
    ],
    grades: [
      { label: "Commercial performance", value: "A", tone: "good" },
      { label: "Demand", value: "A", tone: "good" },
      { label: "Physical sustainability", value: "D / C−", tone: "bad" },
    ],
    directive: {
      headline: "Keep it as the bridge, not as a second Broadway hall forever.",
      detail: "Don't close it early, and don't run two Broadway halls forever. If a new Broadway-capable PSU venue goes ahead, the question becomes what replaces Keller and what the building does next, decided only after the new hall is fully up and running.",
    },
    liveSlug: "keller-psu-performing-arts-decision",
    sourceIds: ["wikiKeller", "res2026270", "sazanFca", "p5RevenueDoc", "pclAnalysis"],
  },
  {
    id: "schnitzer",
    name: "Arlene Schnitzer Concert Hall",
    kicker: "Subsidy, stated plainly",
    role: "It opened in 1928 as a movie palace (the Portland Publix, renamed the Paramount two years later), and by 1982 it was deteriorated enough that the city condemned it, paid the owner $4.1 million, spent $10 million restoring it, and relit a replica of the original rooftop sign: PORTLAND, in five-foot neon. Today it is culturally central and heavily used (199 events, 294,058 attendees in FY2024–25), and the money it earns does not cover what it costs to run once every expense is counted. Call that what it is: the public paying for culture on purpose, not a management failure. The discipline is knowing exactly what the subsidy costs and what it buys.",
    strengths: [
      "Strong cultural demand; the resident organizations' home",
      "Historic building with civic identity",
    ],
    risks: [
      "Loses serious money on operations each year",
      "Big repair bills over the long term",
      "Attendance still below FY2019",
    ],
    grades: [
      { label: "Cultural demand", value: "Strong", tone: "good" },
      { label: "Earned economics", value: "Deficit", tone: "warn" },
      { label: "Capital need", value: "Major", tone: "bad" },
    ],
    directive: {
      headline: "Keep it, and name the subsidy out loud.",
      detail: "The right questions: what is the public getting for its money, what repairs will keep the building standing, how much do the resident organizations chip in, how much can donors raise, and is the subsidy per attendee still reasonable? Break the repair work into phases and say plainly how each one is paid for.",
    },
    liveSlug: "portland5-management-transition",
    sourceIds: ["wikiSchnitzer", "sazanFca", "p5RevenueDoc", "pclAnalysis"],
  },
  {
    id: "hatfield",
    name: "Antoinette Hatfield Hall",
    kicker: "Three theaters, one building, three different answers",
    role: "Built in 1987 as the New Theatre Building and renamed for Oregon's former First Lady in 2007, it holds three theaters under one roof, sharing one big repair bill. The three draw very different crowds. The question is not which theater to kill. It is: what is the cheapest way, over the long run, to house the programs Portland actually wants?",
    strengths: ["A useful mid-sized niche (Newmark)", "Small-scale community and education programming (Winningstad, Brunish)"],
    risks: [
      "A big repair bill shared across the whole building",
      "Winningstad attendance fallen sharply from FY2019",
      "The mission trotted out to justify every building expense automatically",
    ],
    grades: [
      { label: "Newmark", value: "Retain & modernize", tone: "good" },
      { label: "Winningstad", value: "Test consolidation", tone: "warn" },
      { label: "Brunish", value: "Mission over building", tone: "warn" },
    ],
    subVenues: [
      {
        name: "Newmark Theatre: the strongest case",
        body: "About 85,400 attendees across 148 events in FY2024–25. A genuine mid-sized theater niche, with a credible long-term role, possibly in a reconfigured building.",
      },
      {
        name: "Winningstad Theatre: events without audiences",
        body: "100 events, roughly 13,800 attendees. The clearest proof in the portfolio that a full calendar is not the same as full seats.",
      },
      {
        name: "Brunish Theatre: small utility, big building bill",
        body: "67 events, about 5,400 attendees. Real value to the community. But the mission should not automatically pick up the tab for every future building repair.",
      },
    ],
    directive: {
      headline: "Keep the programs. Rethink the building.",
      detail: "Find out whether Newmark can stand apart, physically and financially, from the weaker pieces, and whether Winningstad and Brunish's programs could run well in cheaper space. Combining them is not abandoning them if the programs survive and the long-term bills shrink.",
    },
    liveSlug: "portland5-management-transition",
    sourceIds: ["wikiHatfield", "sazanFca", "p5RevenueDoc", "pclAnalysis"],
  },
  {
    id: "pir",
    name: "Portland International Raceway",
    kicker: "An enterprise hiding inside a parks bureau",
    role: "The raceway sits on the grave of a city. Vanport was wartime housing for Kaiser shipyard workers, nearly 40,000 people, Oregon's second-largest city. It drowned on Memorial Day 1948 when a railroad berm gave way; fifteen people died and eighteen thousand lost their homes by nightfall. Portland acquired the emptied site in 1960 with an intact street grid and little else, and the first races ran on Vanport's own streets (Cottonwood, Lake, Victory Boulevard), with leftover foundations as trackside hazards into the 1970s. Today PIR is a business the City runs inside its parks bureau: ticketed events, a loyal user community, real revenue coming in. Its danger is the oldest one in public enterprise: treating this year's positive cash flow as surplus while the asset quietly consumes itself.",
    strengths: [
      "Distinctive regional niche with an established user community",
      "Ticketed events, sponsorship and commercial potential",
      "Brings in more than it spends, year to year",
    ],
    risks: [
      "No public plan for long-term upkeep",
      "The surplus looks real only because future repairs aren't counted yet",
    ],
    grades: [
      { label: "Niche demand", value: "Strong", tone: "good" },
      { label: "Operating contribution", value: "Positive", tone: "good" },
      { label: "Lifecycle funding", value: "Reserve concern", tone: "bad" },
    ],
    directive: {
      headline: "Keep it, run it like a business, and save the surplus for the track.",
      detail: "Business discipline, in order: (1) figure out what the track really clears in a normal year; (2) map what every part of it will need over the next 20–30 years; (3) set up a repair reserve that is not optional; (4) keep the track's own earnings to fill it; (5) only then look at commercial expansion. Cash in hand is not surplus until future repairs are funded.",
    },
    sourceIds: ["wikiVanport", "pirHistory", "pclAnalysis"],
  },
  {
    id: "pioneer",
    name: "Pioneer Courthouse Square",
    kicker: "Civic infrastructure, not a profit center",
    role: "For sixty years this block was the Portland Hotel; for thirty more it was the parking lot a department store razed it for. The square that replaced the parking lot in 1984 was paid for partly by fifty thousand Portlanders buying inscribed bricks at $750,000 total, and the hotel's wrought-iron gate still stands on the eastern edge. \"Portland's living room\" is the rare cliché that is simply accurate: free public use, civic assembly, festivals, vigils, corporate rentals. It runs on a mix of City support (≈$470,000 a year under the 2022–25 agreement), event fees, sponsorship, and donations. Profit is the wrong measuring stick. The right one is keeping the commercial side and the civic side visible, each on its own.",
    strengths: [
      "Civic and symbolic value: A",
      "Programming potential: A−",
      "Downtown identity, a magnet for tourists, constant media presence",
    ],
    risks: [
      "Commercial performance B−/incomplete; financial transparency C",
      "Paid events quietly crowding out ordinary public use",
      "What the next management agreement actually says has never been laid out in public",
    ],
    grades: [
      { label: "Civic value", value: "A", tone: "good" },
      { label: "Programming", value: "A−", tone: "good" },
      { label: "Transparency", value: "C", tone: "warn" },
      { label: "Overall", value: "B−", tone: "warn" },
    ],
    directive: {
      headline: "Keep professional management, but under a performance-based agreement.",
      detail: "Score it on what it exists for: free-programming hours, genuinely open public days, unique attendance, subsidy per programmed public hour, maintenance, safety, community participation, and the share of programming accessible without charge. Report commercial statements separately, so a corporate rental and a civic vigil stop hiding inside one undifferentiated event count.",
    },
    sourceIds: ["wikiPioneer", "pdxPioneer", "pioneerOrd", "pclAnalysis"],
  },
  {
    id: "smaller",
    name: "The smaller venues",
    kicker: "The best return nobody measures",
    role: "Walker, Erv Lind, and Sckavone stadiums; East Delta's fields; the Interstate Firehouse Cultural Center; the Community Music Center; Multnomah Arts Center; the amphitheaters and Waterfront Park. This is the least visible ring of the portfolio, and possibly its highest public value per dollar. Walker Stadium shows the model: a 1956 ballpark in Lents Park, named for the Parks Bureau's first Sports Director, that the Portland Pickles took over in 2016 under an agreement allocating rent, cleaning, security, and maintenance. It seats about 1,500 and has squeezed in 4,387: the kind of over-capacity night no spreadsheet in the city currently records.",
    strengths: [
      "Locally valuable, often heavily used",
      "Small capital dollars buy visible improvements: lights, restrooms, seating, accessibility, sound, field condition",
    ],
    risks: [
      "No single public accounting of events, attendance, money in, money out, postponed repairs, or results",
      "Easy to neglect precisely because the price tags aren't dramatic",
    ],
    grades: [
      { label: "Usage", value: "Uneven", tone: "warn" },
      { label: "Documentation", value: "Poor", tone: "bad" },
      { label: "Marginal return", value: "Potentially highest", tone: "good" },
    ],
    directive: {
      headline: "Count them, sort them, and fund the small fixes.",
      detail: "Group them as a Community & Civic Venues Program with three standards: neighborhood venues that earn their keep (leases cover running costs and wear), cultural venues that need subsidy (given openly, and measured), and public spaces for events (never fenced off just to chase private rental revenue). A modest annual fund here may beat some far larger prestige projects in public benefit per dollar.",
    },
    sourceIds: ["wikiWalker", "pdxWalker", "walkerOrd", "pclAnalysis"],
  },
  {
    id: "psu",
    name: "The proposed PSU venue",
    kicker: "A prospective asset, not yet an entitlement",
    role: "A new ~3,000-seat Broadway-capable hall at Portland State (estimated at up to $449 million in concept materials, $447 million in Resolution 2026-270's), recommended by the steering process in June 2026 and referred toward the full council in August. Today it is exactly one thing: a possible replacement for Keller. Every judgment about it follows from refusing to treat it as anything more until the proof arrives.",
    strengths: [
      "Would solve Keller's failing-building problem with a modern hall built for the job",
      "$137.5M in state funding already committed on the record",
    ],
    risks: [
      "Money to build it is not money to run it",
      "Labor plan, booking agreements, resident-company commitments, and repair fund all unproven",
      "The additive trap: building it and keeping Keller too",
    ],
    grades: [
      { label: "Concept demand", value: "Credible", tone: "good" },
      { label: "Financing proof", value: "Incomplete", tone: "warn" },
      { label: "Operating proof", value: "Absent", tone: "bad" },
    ],
    directive: {
      headline: "Demand proof it can be built and run before committing.",
      detail: "No City-backed construction money until there is a complete budget, every funding source committed in writing, an operator, a labor plan, a realistic budget for running it each year, signed booking and resident-company agreements, a hard legal cap on what the City can be asked to cover, and a plan for what becomes of Keller.",
    },
    liveSlug: "keller-psu-performing-arts-decision",
    sourceIds: ["res2026270", "flspaProgram", "artswatchPsu", "pclAnalysis"],
  },
];

/* ------------------------------------------------ §9.1: the ranking */

export interface RankingRow {
  asset: string;
  demand: string;
  ownerEconomics: string;
  condition: string;
  recommendation: string;
}

export const RANKING: RankingRow[] = [
  { asset: "Moda Center", demand: "Very strong", ownerEconomics: "Incomplete, contract-dependent", condition: "Large identified liability", recommendation: "Invest only under strong public protections" },
  { asset: "Providence Park", demand: "Exceptional", ownerEconomics: "Incomplete but likely favorable", condition: "Exposure unresolved", recommendation: "Preserve; finish the condition study; negotiate early" },
  { asset: "Keller Auditorium", demand: "Strongest P5 commercial", ownerEconomics: "Positive earned contribution", condition: "Poor", recommendation: "Keep as the bridge; then replace or give it a new job" },
  { asset: "Portland Int'l Raceway", demand: "Strong niche", ownerEconomics: "Positive direct contribution", condition: "Reserve concern", recommendation: "Keep it; bank money for future repairs" },
  { asset: "Veterans Memorial Coliseum", demand: "Credible despite closure", ownerEconomics: "Incomplete", condition: "Improving through renovation", recommendation: "Finish it; let it do what Moda can't" },
  { asset: "Newmark Theatre", demand: "Good", ownerEconomics: "Likely subsidized", condition: "Shared-building liability", recommendation: "Retain and modernize" },
  { asset: "Schnitzer Concert Hall", demand: "Strong cultural", ownerEconomics: "Significant earned deficit", condition: "Major capital need", recommendation: "Keep it; put the subsidy deal in writing" },
  { asset: "Pioneer Courthouse Square", demand: "Strong civic use", ownerEconomics: "Mixed public/commercial", condition: "Ongoing public-realm need", recommendation: "Retain with performance agreement" },
  { asset: "Winningstad Theatre", demand: "Moderate-to-low", ownerEconomics: "Subsidized", condition: "Shared major liability", recommendation: "Test sharing and reshaping the space" },
  { asset: "Brunish Theatre", demand: "Low commercial", ownerEconomics: "Subsidized", condition: "Shared major liability", recommendation: "Keep the programs; make the space earn its case" },
  { asset: "Rose Quarter land & garages", demand: "Strong event-linked", ownerEconomics: "Material cash + option value", condition: "Highest-use analysis needed", recommendation: "Manage it as serious real estate" },
  { asset: "Neighborhood venues", demand: "Uneven, locally valuable", ownerEconomics: "Poorly documented", condition: "Poorly documented", recommendation: "Count them, sort them, fund the small fixes that pay off" },
];
