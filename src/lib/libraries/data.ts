/**
 * Data for the libraries deep-dive, transcribed from the Portland Civic Lab
 * research report "Portland Public Knowledge Commons" (August 2026) and its
 * claim-source ledger at reports/portland-libraries-2026/. Every figure here
 * traces to a SOURCES entry; nothing is invented for the page.
 */

export interface Source {
  org: string;
  url: string;
  kind: "primary" | "analysis" | "news" | "standard";
}

export const SOURCES = {
  mclHistory: { org: "MCL system history", url: "https://multcolib.org/multnomah-county-library-history", kind: "primary" },
  oregonEncyclopedia: { org: "Oregon Encyclopedia", url: "https://www.oregonencyclopedia.org/articles/library_association_of_portland/", kind: "primary" },
  isomHistory: { org: "MCL, Mary Frances Isom essay", url: "https://multcolib.org/sites/default/files/2024-07/mcl-his_isom.pdf", kind: "primary" },
  albinaHistory: { org: "MCL, Albina relocation history", url: "https://multcolib.org/articles/albina-librarys-relocation-history", kind: "primary" },
  indigenousTeam: { org: "MCL, Indigenous team", url: "https://multcolib.org/articles/indigenous-team-multnomah-county-library", kind: "primary" },
  districtVote: { org: "Multnomah County, 2012 election result", url: "https://multco.us/news/voters-say-yes-libraries-multnomah-countys-award-winning-system-gets-permanent-funding", kind: "primary" },
  fy2027Budget: { org: "Multnomah County, FY2027 adopted library budget", url: "https://multco.us/file/library_-0/download", kind: "primary" },
  fy2026Capital: { org: "Multnomah County, FY2026 capital budget", url: "https://multco.us/file/capital_budget/download", kind: "primary" },
  spaceFramework: { org: "MCL, 2017 Framework for Future Library Spaces", url: "https://multcolib.org/sites/default/files/2023-11/Multnomah_County_Library_space_planning_framework_FINAL_0.pdf", kind: "primary" },
  buildingProgram: { org: "MCL, building program", url: "https://multcolib.org/building-libraries-together", kind: "primary" },
  bondCompliance: { org: "Multnomah County, bond compliance", url: "https://multco.us/info/library-capital-bond-project-compliance", kind: "primary" },
  fineFree: { org: "Multnomah County, fine-free announcement", url: "https://multco.us/news/multnomah-county-library-ends-all-late-fees-waives-existing-fines", kind: "primary" },
  auditorReport2023: { org: "Multnomah County Auditor, 2023 report", url: "https://multco.us/file/multnomah_county_auditor_library_audit_report/download", kind: "primary" },
  auditorFollowup2025: { org: "Multnomah County Auditor, 2025 follow-up", url: "https://multco.us/info/recommendation-status-evaluation-library-has-implemented-most-audit-recommendations-employee", kind: "primary" },
  schoolCorpsEnded: { org: "MCL, March 2025 community update", url: "https://multcolib.org/directors-desk/march-2025-community-update", kind: "primary" },
  stateLibraryStats: { org: "State Library of Oregon, Public Library Statistics", url: "https://data.oregon.gov/dataset/Oregon-Public-Library-Statistics/8zw7-zgjw", kind: "primary" },
  patronSurvey: { org: "MCL, 2024 patron-survey highlights", url: "https://multcolib.org/directors-desk/highlights-2024-multnomah-county-library-patron-survey", kind: "primary" },
  newsFacts: { org: "MCL, news and facts", url: "https://multcolib.org/news-facts", kind: "primary" },
  iflaManifesto: { org: "IFLA–UNESCO Public Library Manifesto", url: "https://www.ifla.org/public-library-manifesto/", kind: "standard" },
  oodi: { org: "Oodi Helsinki, service design", url: "https://oodihelsinki.fi/en/what-is-oodi/service-design/", kind: "primary" },
  oodiResults: { org: "Oodi Helsinki, 2025 results", url: "https://oodihelsinki.fi/en/thank-you-for-this-year/", kind: "primary" },
  dokk1: { org: "Dokk1 Aarhus", url: "https://dokk1.dk/english", kind: "primary" },
  nlbSingapore: { org: "National Library Board Singapore, 2024 review", url: "https://www.nlb.gov.sg/main/about-us/press-room-and-publications/media-releases/2025/-/media/05C9299DEFBD4B7999C51D3A3CB4B6DF.ashx", kind: "primary" },
  torontoOverview: { org: "Toronto Public Library, system overview", url: "https://tpl.ca/about-the-library/", kind: "primary" },
  torontoImpact: { org: "Toronto Public Library, social-impact report", url: "https://tpl.ca/wp-content/uploads/sites/164/2025/05/11-measuring-the-social-impact-of-toronto-public-library-combined.pdf", kind: "primary" },
  vancouverStats: { org: "Vancouver Public Library, 2024 statistics", url: "https://www.vpl.ca/sites/default/files/2025-04/VPL%20Annual%20Statistics%202024%20FINAL.pdf", kind: "primary" },
  vancouverReconciliation: { org: "Vancouver Public Library, Rights and Reconciliation", url: "https://www.vpl.ca/rights-reconciliation/truth-reconciliation", kind: "primary" },
  turanga: { org: "Christchurch City Libraries, Tūranga", url: "https://my.christchurchcitylibraries.com/turanga/turanga-about-the-building/", kind: "primary" },
  youmedia: { org: "U Chicago Consortium, YOUmedia evaluation", url: "https://consortium.uchicago.edu/publications/teens-digital-media-and-chicago-public-library", kind: "primary" },
  thinkMcl: { org: "MCL, Think MCL service priorities", url: "https://multcolib.org/think-mcl", kind: "primary" },
  locationsWiki: { org: "MCL branch list (Wikipedia, cross-checked against MCL)", url: "https://en.wikipedia.org/wiki/Multnomah_County_Library", kind: "news" },
  // Served from public/reports/. The build output of reports/ is not deployed,
  // so the published PDF is copied there rather than linked in place.
  pclReport: { org: "Portland Civic Lab, full report (PDF)", url: "/reports/portland-libraries-2026.pdf", kind: "analysis" },
} satisfies Record<string, Source>;

export const HEADLINE = {
  locations: 19,
  checkoutsM: 18.1,
  visitsM: 8.9,
  cardholders: 385828,
  cardholderHouseholdPct: 38,
  budgetM: 128.5,
  fte: 544.8,
  levyRate: 1.22,
  levyCap: 1.24,
  bondAuthorizedM: 387,
  bondTotalLowM: 458,
  bondTotalHighM: 459,
  bondApprovalPct: 63,
  digitalShare2025: 42,
  digitalShare2019: 19,
  digitalCircGrowthPct: 113,
};

export const SIX_PURPOSES = [
  {
    title: "Curated access to knowledge and culture",
    body: "Deep, plural, multilingual physical and digital collections; skilled reference; preservation of local memory; intellectual freedom; and privacy.",
  },
  {
    title: "Education beyond school",
    body: "Children's librarianship, literacy services, GED and language learning, homework help, and digital instruction make the library a lifelong learning system.",
  },
  {
    title: "Geographic equalization",
    body: "Deposit stations, storefront branches, bookmobiles, delivery, a countywide network, and online service all answer one question: how does public knowledge reach people who cannot easily reach a central institution?",
  },
  {
    title: "Civic and social infrastructure",
    body: "Meeting rooms, lectures, clubs, and shared space support association and public life — with a standard of demonstrable welcome, not neutrality alone.",
  },
  {
    title: "Practical welfare infrastructure",
    body: "Baby clinics, jail and homebound service, cooling and smoke refuge, internet and charging. The boundary is professional: access and navigation fit the library; clinical care and law enforcement require partner agencies.",
  },
  {
    title: "Community identity and belonging",
    body: "Language- and culture-specific positions, Black and Indigenous collections and teams, and locally rooted programs — a shift from \"service to\" toward shared authority.",
  },
];

export interface TimelineEvent {
  year: string;
  title: string;
  body: string;
  sourceIds: Array<keyof typeof SOURCES>;
}

export const TIMELINE: TimelineEvent[] = [
  { year: "1864", title: "Dues-supported reading room", body: "A small group of Portland businessmen organizes the Library Association of Portland — civic-minded but exclusive: only paying members could use it.", sourceIds: ["mclHistory", "oregonEncyclopedia"] },
  { year: "1891", title: "A free public library opens", body: "Portland Public Library opens free of charge in City Hall, alongside the dues-based Association.", sourceIds: ["oregonEncyclopedia"] },
  { year: "1902", title: "Tax-supported, and merged", body: "John Wilson's 1900 bequest required free access; Oregon's 1901 library law allowed city tax levies. The Association becomes tax-supported and absorbs the city library — access becomes a right of residence.", sourceIds: ["mclHistory", "oregonEncyclopedia"] },
  { year: "1905–1916", title: "Countywide extension", body: "Sellwood opens as the first facility outside downtown (1905). Under Mary Frances Isom, deposit stations, school libraries, children's service, immigrant-language collections, and homebound delivery expand fast; by 1916 nearly 3,000 lectures and meetings draw roughly 111,000 attendees.", sourceIds: ["isomHistory"] },
  { year: "1913", title: "Central Library opens", body: "Carnegie funding helps build branches; the A.E. Doyle–designed Central Library opens downtown.", sourceIds: ["mclHistory"] },
  { year: "1920s–30s", title: "Library as welfare infrastructure", body: "Baby clinics operate in Arleta and St. Johns libraries — the library-as-social-service role is not a recent invention.", sourceIds: ["mclHistory"] },
  { year: "1942–1948", title: "Vanport branch", body: "Established during WWII, the Vanport branch is the country's only public library in a war-housing project, serving Black Portland — until the 1948 flood destroys it.", sourceIds: ["mclHistory"] },
  { year: "1970s–80s", title: "Ten temporary levies", body: "Beginning in the 1970s, Portland runs ten temporary levy campaigns over four decades, making hours and staffing contingent on repeated elections. Albina Library's 1977 relocation proceeds despite Black community pushback.", sourceIds: ["albinaHistory"] },
  { year: "1990", title: "Public ownership", body: "The private Library Association transfers its buildings, books, and holdings to the people of Multnomah County.", sourceIds: ["mclHistory"] },
  { year: "1996–1998", title: "Modernization and outreach widen", body: "A bond funds technology and renovations; Central's seismic retrofit runs 1994–97. School Corps begins (1997); Spanish/Latino outreach and bilingual roles are designated (1998).", sourceIds: ["mclHistory"] },
  { year: "2012", title: "Permanent Library District", body: `About ${63}% of voters approve a permanent Library District authorized up to $1.24 per $1,000 assessed value — ending the levy-to-levy era. Funding begins July 2013, restoring seven-day service.`, sourceIds: ["districtVote"] },
  { year: "2017", title: "The space-deficit finding", body: "The Framework for Future Library Spaces finds just over 0.3 sq ft per resident systemwide, worst east of I-205 — the planning basis for the 2020 bond.", sourceIds: ["spaceFramework"] },
  { year: "2020", title: "$387M bond approved", body: "Voters approve $387 million in general-obligation bonds in November; with other sources the program reaches roughly $458–459 million across twenty major projects.", sourceIds: ["buildingProgram", "fy2026Capital"] },
  { year: "2020–2021", title: "Pandemic closure and fine-free", body: "Buildings close in March 2020; indoor reopening phases in June–August 2021. MCL eliminates late fees, waiving $730,185 across 72,861 accounts and restoring 2,000+ blocked accounts.", sourceIds: ["fineFree"] },
  { year: "2022", title: "Safety crisis surfaces", body: "2,241 incident reports logged, 1,109 at Central. Only 27% of in-person public-facing staff report feeling safe, versus 55% of non-public-facing staff.", sourceIds: ["auditorReport2023"] },
  { year: "2023", title: "County Auditor report", body: "The Auditor documents the safety and employee-voice gap; MCL begins simplifying rules, building security leadership, and partnering with Cascadia social workers.", sourceIds: ["auditorReport2023"] },
  { year: "2024–2025", title: "School Corps and Books2U end", body: "MCL ends both programs after the 2024–25 school year; Library Connect (automatic student accounts) continues.", sourceIds: ["schoolCorpsEnded"] },
  { year: "2025", title: "Audit follow-up", body: "Most 2023 recommendations are implemented or in progress, but only 15% of surveyed employees feel appropriately involved in the changes.", sourceIds: ["auditorFollowup2025"] },
  { year: "2026", title: "East County opens, program completes", body: "East County Library opens in May at 95,000 sq ft — Central's scale. Belmont's August reopening completes the major bond program; Hillsdale closes for further work.", sourceIds: ["buildingProgram", "bondCompliance"] },
];

export interface TrendRow {
  metric: string;
  fy2011: string;
  fy2019: string;
  fy2021: string;
  fy2025: string;
  note: string;
}

export const TREND_ROWS: TrendRow[] = [
  { metric: "Service population", fy2011: "736,785", fy2019: "813,300", fy2021: "829,560", fy2025: "799,109", note: "County population grew, then softened." },
  { metric: "Registered borrowers", fy2011: "436,949", fy2019: "416,935", fy2021: "388,868", fy2025: "369,377", note: "Registered share fell from ~59% to ~46% of population." },
  { metric: "In-person visits", fy2011: "5.52M", fy2019: "3.61M", fy2021: "N/A", fy2025: "2.18M", note: "Down 60% since 2011 — but COVID and bond closures distort this." },
  { metric: "Physical circulation", fy2011: "23.95M*", fy2019: "14.89M", fy2021: "6.95M", fy2025: "10.15M", note: "Recovered from the pandemic but below the prior era." },
  { metric: "Digital circulation", fy2011: "N/A", fy2019: "3.46M", fy2021: "5.21M", fy2025: "7.37M", note: "More than doubled from 2019." },
  { metric: "Total circulation", fy2011: "23.95M*", fy2019: "18.35M", fy2021: "12.16M", fy2025: "17.51M", note: "Transaction volume recovered more than visits did." },
  { metric: "Public computer sessions", fy2011: "1.07M", fy2019: "700,579", fy2021: "3,443", fy2025: "352,166", note: "Home devices and closures changed the role of terminals." },
];

export interface GapDomain {
  domain: string;
  current: string;
  gap: string;
  move: string;
}

export const GAP_DOMAINS: GapDomain[] = [
  { domain: "Funding & governance", current: "Permanent district; strong voter mandate; near-complete capital renewal", gap: "Levy near the $1.24 legal maximum; a larger estate raises recurring costs; responsibility is fragmented across County, cities, schools, and providers", move: "A ten-year operating compact tied to service levels, lifecycle costs, and outcomes, with an annual joint public accountability session" },
  { domain: "Reach", current: "19 locations; 385,828 cardholders; Library Connect; online service; mobile capacity", gap: "~38% active-cardholder-household penetration in the FY2026 measure; the patron survey is self-selected, not a resident-reach study", move: "A representative resident panel, outreach to nonusers, 80% annual resident use by 2040, and no branch service area below a published floor" },
  { domain: "Reading & collections", current: "Nearly 3 million physical and digital items; very high circulation; specialist collections and selectors", gap: "Patron \"find what I need\" fell; the browsing/space tradeoff has no public portfolio dashboard; digital licensing costs are rising", move: "A protected collection floor, deep multilingual/local/Indigenous collections, and transparent wait/fill/browse metrics" },
  { domain: "Learning & youth", current: "Summer Reading reaches 100,000+ children; automatic student accounts; literacy programs", gap: "School Corps and Books2U ended after 2024–25; account creation does not prove use or outcomes", move: "A countywide school-library compact, embedded librarians and mobile delivery, and shared early-literacy outcomes with schools" },
  { domain: "Digital & AI agency", current: "Digital circulation is now a coequal channel; public computers, devices, databases, gigabit upgrades", gap: "Broadband/device/skills gaps persist; web traffic is not proof of capability; AI raises misinformation, privacy, and labor risk", move: "A digital-navigator corps and privacy-protecting AI/media-literacy instruction, plus assistive tech and secure creation tools" },
  { domain: "Belonging & power", current: "Language/culture-specific teams; Black and Indigenous collections; multilingual programs", gap: "Unequal satisfaction; historic displacement and exclusion; role-recognition and workload concerns among specialist staff", move: "Paid community curators, tribal-government relationships, a participatory program budget, and disaggregated outcomes" },
  { domain: "Safety & wellbeing", current: "Security leadership, training, simplified rules, social-work partnership", gap: "The 2022 safety baseline was unacceptable; only 15% of staff felt appropriately involved in 2025's changes", move: "Specialist health/housing peers at high-need sites, joint incident command, and a ≥90% staff-safety target reported transparently" },
  { domain: "Resilience", current: "Libraries have served as cooling/smoke refuge; expanded buildings create a strong network", gap: "Libraries are not automatically resilience hubs — backup power, supplies, staffing, and coordination are inconsistent", move: "Every branch clean-air/cooling/communications capable, with at least six full hubs carrying backup power and extended hours" },
  { domain: "Measurement", current: "Strong transaction statistics and a patron-survey tradition", gap: "No credible global ranking exists; the survey excludes most nonusers; closures confound every trend line", move: "An open quarterly dashboard, a representative panel, and independent review every three years" },
];

export interface Benchmark {
  city: string;
  system: string;
  stat: string;
  lesson: string;
  sourceIds: Array<keyof typeof SOURCES>;
}

export const BENCHMARKS: Benchmark[] = [
  { city: "Helsinki", system: "Oodi", stat: "2.7M visits · 550K loans · 1,200 events (2025)", lesson: "Co-design and a civic living room. Residents contributed 2,300 ideas to the design; participatory budgeting continues to shape service. Loans alone miss its value.", sourceIds: ["oodi", "oodiResults"] },
  { city: "Aarhus", system: "Dokk1", stat: "One integrated civic platform", lesson: "Library plus citizen services plus flexible public space, organized around four spaces — inspiration, learning, meeting, performance/creation.", sourceIds: ["dokk1"] },
  { city: "Singapore", system: "National Library Board", stat: "70% reach · 20.8M physical visits · 38.8M loans · 134 nodes (2024)", lesson: "System reach and distributed access, plus S.U.R.E. — a program that treats source evaluation as a core public capability.", sourceIds: ["nlbSingapore"] },
  { city: "Toronto", system: "Toronto Public Library", stat: "81% resident use · 100 branches · 45M visits", lesson: "Universal presence, backed by a representative resident panel measuring emotional, social, intellectual, and creative impact — not just circulation.", sourceIds: ["torontoOverview", "torontoImpact"] },
  { city: "Vancouver", system: "Vancouver Public Library", stat: "Free recording & creation facilities", lesson: "Tools paired with an explicit Indigenous Rights and Reconciliation strategy — governance and relationships decide who sees the tools as theirs.", sourceIds: ["vancouverStats", "vancouverReconciliation"] },
  { city: "Christchurch", system: "Tūranga", stat: "2,400+ community ideas shaped the building", lesson: "Bicultural and resilient design, built with Ngāi Tahu/Ngāi Tūāhuriri partnership and seismic performance built in from the start.", sourceIds: ["turanga"] },
  { city: "Chicago", system: "YOUmedia", stat: "Teen digital-media learning labs", lesson: "Equipment becomes meaningful through mentors, peer culture, and pathways for participation — not reservations and devices alone.", sourceIds: ["youmedia"] },
  { city: "San Francisco", system: "Library–public health partnership", stat: "Social worker + paid peer health/safety associates", lesson: "Fund the right expertise on-site instead of turning librarians into case managers — the boundary that protects both roles.", sourceIds: ["torontoOverview"] },
];

export const LAYERS = [
  { n: 1, title: "The universal digital library", body: "A simple, privacy-protecting account unifying physical and digital borrowing, databases, research help, courses, room and tool reservations, civic information, and personalized — not commercial — recommendations, in the county's major languages." },
  { n: 2, title: "Nineteen neighborhood commons", body: "Every branch meets a published service guarantee: browsing and children's collections, quiet study, public technology, staffed help, free meeting space, flexible learning/creation capability, clean air and cooling, and locally shaped programs." },
  { n: 3, title: "Flagships and mobile nodes", body: "Central anchors deep and special collections, public scholarship, and large convenings. East County operates as a full regional flagship. The Operations Center enables systemwide logistics and mobile libraries, pop-ups, and emergency distribution." },
];

export const PROTECTED_PURPOSES = [
  { n: 1, title: "Read freely", body: "Intellectual freedom, patron privacy, deep and plural collections, multilingual abundance, local and Indigenous memory, accessible formats, and the physical pleasure of browsing." },
  { n: 2, title: "Learn and navigate", body: "Early literacy, homework, adult education, English learning, media and AI literacy, research, and navigation of benefits, government information, jobs, and small-business support." },
  { n: 3, title: "Make and work", body: "Studios and tools as mentored pathways — a first podcast, a prototype, a repaired object, a published zine, a digitized family history — paired with teaching artists and routes to schools, unions, and employers." },
  { n: 4, title: "Belong and govern", body: "Places to be alone together, join groups, encounter local culture, and shape library priorities — paid community-curator roles, participatory program funds, and transparent forums." },
  { n: 5, title: "Prepare and recover", body: "Planned resilience infrastructure: clean air, cooling, charging, and communications everywhere; selected hubs add backup power, supplies, trained staffing, and formal emergency-response integration." },
];

export const BOUNDARIES = [
  "An unfunded shelter or behavioral-health clinic",
  "A police station or surveillance platform",
  "A replacement for adequately funded school libraries and teachers",
  "A commercial coworking club that crowds out universal access",
  "A technology vendor's captive channel",
  "An events venue whose schedule displaces reading, quiet, and spontaneous use",
];

export interface ScorecardRow {
  domain: string;
  northStar: string;
  proof: string;
}

export const SCORECARD: ScorecardRow[] = [
  { domain: "Universal reach", northStar: "80% of residents use MCL annually; 70% of households have an active library relationship", proof: "Representative resident panel plus privacy-protecting administrative data; nonusers reported separately" },
  { domain: "Equitable branch access", northStar: "No branch or major demographic group falls more than 5 points below the county reach floor", proof: "Branch-equity index across hours, travel time, space, collections, staffing, technology, and use" },
  { domain: "Reading & knowledge", northStar: "≥95% can find what they need; strong browse depth and multilingual parity", proof: "Patron/resident survey, fill/wait rates, collection audit, challenge and privacy reporting" },
  { domain: "Youth & learning", northStar: "100% of K–12 students have usable accounts; halve early-literacy and digital-skill gaps", proof: "Shared longitudinal outcomes with schools, contribution- not sole-attribution claims" },
  { domain: "Digital & AI agency", northStar: "90% of participants complete defined digital, source-evaluation, and AI-literacy tasks", proof: "Pre/post capability measures; accessibility and privacy audit" },
  { domain: "Creativity & economic agency", northStar: "Every branch offers mentored creation; participants show skills, projects, or job progress", proof: "Portfolio and pathway tracking with opt-in follow-up" },
  { domain: "Belonging & civic value", northStar: "≥90% say the library strengthens belonging and trust across difference", proof: "Representative social-impact survey and qualitative panels" },
  { domain: "Staff & patron safety", northStar: "≥90% of public-facing staff feel safe and heard; incident severity declines continuously", proof: "Anonymous workforce survey, transparent incident taxonomy" },
  { domain: "Resilience", northStar: "All branches clean-air/cooling/comms capable; at least six full resilience hubs", proof: "Annual readiness drill, backup-power test, after-action review" },
  { domain: "Co-governance", northStar: "Every service area participates in paid co-design; participatory budgeting recurs annually", proof: "Public decision log: who participated, what changed, who was paid" },
  { domain: "Sustainability", northStar: "Net-zero operational pathway, low-carbon procurement, circular repair/reuse", proof: "Energy/carbon/waste dashboard and ten-year asset plan" },
  { domain: "Learning organization", northStar: "Quarterly open data and independent impact evaluation every three years", proof: "ISO 11620/16439-aligned methods, external review, public response plan" },
];

export const GAMING_RULES = [
  { title: "No averages without distribution", body: "Publish every core measure by branch/service area and, where privacy permits, by race/ethnicity, language, age, disability, income, and housing status." },
  { title: "No outputs without outcomes", body: "Keep reporting visits, loans, programs, and hours — but pair them with what changed in residents' capability, connection, safety, or opportunity." },
  { title: "No flagship exception", body: "Central or East County cannot carry a global claim while smaller branches fall below a guaranteed floor." },
];

export interface RoadmapStage {
  range: string;
  title: string;
  items: string[];
}

export const ROADMAP: RoadmapStage[] = [
  {
    range: "2026–2028",
    title: "Stabilize, listen, and establish the baseline",
    items: [
      "Finish the operating transition: staff new spaces, publish service standards, disclose the ten-year recurring cost of the new estate",
      "Recruit a representative resident panel including nonusers; publish branch-level performance",
      "Reset safety with employees: joint labor–management–community safety council, audited protocols",
      "Protect the reading core: public collection principles and branch browsing floors",
      "Negotiate a school-library compact with six districts to replace School Corps and Books2U",
      "Choose six resilience pilots by heat, smoke, outage, transit, and social-vulnerability data",
    ],
  },
  {
    range: "2028–2031",
    title: "Operate the commons",
    items: [
      "Launch the unified digital account and multilingual resident dashboard",
      "Deploy digital navigators and privacy-protecting media/AI literacy systemwide",
      "Fund mentors and pathways for every creation space",
      "Scale specialist social-work and peer-navigation teams at high-need sites",
      "Create paid service-area councils and a participatory programming fund",
      "Make all nineteen branches clean-air/cooling/charging/comms sites; certify six full hubs",
    ],
  },
  {
    range: "2031–2036",
    title: "Demonstrate outcomes and share the model",
    items: [
      "Tie budget proposals to the public scorecard and branch-equity floor",
      "Complete two independent impact reviews; publish raw, privacy-safe data and methods",
      "Establish Portland as a global learning site for culturally specific public librarianship",
      "Develop research partnerships with local universities and community evaluators",
      "Exchange staff and practice with Helsinki, Toronto, Singapore, Vancouver, Aarhus, Christchurch",
    ],
  },
  {
    range: "2036–2040",
    title: "Earn the claim",
    items: [
      "Meet every floor: reach, equity, quality, outcomes, agency, belonging, safety, resilience, co-governance, sustainability, evidence",
      "\"Number one\" then means the system most successful at turning shared knowledge infrastructure into freedom and belonging for the whole public",
    ],
  },
];

export interface GovernanceStep {
  who: string;
  role: string;
  detail: string;
  sourceIds: Array<keyof typeof SOURCES>;
}

export const GOVERNANCE_CHAIN: GovernanceStep[] = [
  {
    who: "Voters",
    role: "Set the taxing authority",
    detail: `November 2012: ~${63}% approve a permanent Library District, capped at $1.24 per $1,000 of assessed value. November 2020: voters approve $387M in general-obligation bonds for capital construction. Any levy rate above the legal cap, or any new bond, requires another public vote.`,
    sourceIds: ["districtVote", "buildingProgram"],
  },
  {
    who: "Multnomah County Board of Commissioners",
    role: "Governs the Library District",
    detail: "The District is a separate taxing district, but the County Board governs it — setting the annual levy rate within the voter-approved cap (currently $1.22 of the $1.24 maximum) and adopting the annual operating budget as part of the County's budget process.",
    sourceIds: ["fy2027Budget"],
  },
  {
    who: "MCL administration",
    role: "Operates as a County department",
    detail: "MCL proposes its budget, runs the 2020 bond capital program, and sets operating policy — fine-free service, ending School Corps and Books2U, safety reforms — within the budget and purpose the Board approves.",
    sourceIds: ["fy2027Budget", "buildingProgram", "schoolCorpsEnded"],
  },
  {
    who: "Multnomah County Auditor",
    role: "Independent oversight",
    detail: "The 2023 audit and 2025 follow-up provide independent review of operations and safety outside MCL's own management chain — the accountability layer the report's proposed compact would formalize and extend.",
    sourceIds: ["auditorReport2023", "auditorFollowup2025"],
  },
];

export interface LibraryLocation {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  tier: "flagship" | "commons";
  note?: string;
  lat: number;
  lng: number;
}

/**
 * The 19 current MCL locations. Addresses and neighborhoods cross-checked
 * against Wikipedia's branch list (itself sourced to MCL); square-footage
 * and status notes come from the report / MCL building program.
 * Coordinates geocoded from the street address via OpenStreetMap Nominatim.
 * The Operations Center and mobile services are not public branches with a
 * fixed address and are described in text rather than plotted.
 */
export const LOCATIONS: LibraryLocation[] = [
  { id: "central", name: "Central Library", address: "801 SW 10th Ave", neighborhood: "Downtown", tier: "flagship", note: "125,000 sq ft · opened 1913, A.E. Doyle", lat: 45.5191921, lng: -122.6832062 },
  { id: "east-county", name: "East County Library", address: "475 NW Division St", neighborhood: "Gresham", tier: "flagship", note: "95,000 sq ft · opened May 2026", lat: 45.5051163, lng: -122.4360427 },
  { id: "albina", name: "Albina", address: "216 NE Knott St", neighborhood: "Eliot", tier: "commons", note: "renovated 2020", lat: 45.5417967, lng: -122.6631077 },
  { id: "belmont", name: "Belmont", address: "1038 SE César E. Chávez Blvd", neighborhood: "Sunnyside", tier: "commons", note: "opened 1924 · completed the bond program, Aug. 2026", lat: 45.5153709, lng: -122.6226348 },
  { id: "capitol-hill", name: "Capitol Hill", address: "10723 SW Capitol Hwy", neighborhood: "W. Portland Park", tier: "commons", note: "opened 1972", lat: 45.4480033, lng: -122.7254492 },
  { id: "fairview", name: "Fairview-Columbia", address: "1520 NE Village St", neighborhood: "Fairview", tier: "commons", note: "opened 2001", lat: 45.5322215, lng: -122.4392551 },
  { id: "gregory-heights", name: "Gregory Heights", address: "7921 NE Sandy Blvd", neighborhood: "Roseway", tier: "commons", note: "opened 1966", lat: 45.5516489, lng: -122.5813237 },
  { id: "hillsdale", name: "Hillsdale", address: "1525 SW Sunset Blvd", neighborhood: "Hillsdale", tier: "commons", note: "renovated 2004 · closed Aug. 2026 for further work", lat: 45.4798337, lng: -122.6940865 },
  { id: "holgate", name: "Holgate", address: "7905 SE Holgate Blvd", neighborhood: "Foster-Powell", tier: "commons", note: "opened 1971", lat: 45.4905447, lng: -122.5821504 },
  { id: "hollywood", name: "Hollywood", address: "4040 NE Tillamook St", neighborhood: "Hollywood", tier: "commons", note: "renovated 2002", lat: 45.5376270, lng: -122.6211734 },
  { id: "kenton", name: "Kenton", address: "8226 N Denver Ave", neighborhood: "Kenton", tier: "commons", note: "opened 2010", lat: 45.5828074, lng: -122.6864628 },
  { id: "midland", name: "Midland", address: "805 SE 122nd Ave", neighborhood: "Mill Park", tier: "commons", note: "25,000 sq ft", lat: 45.5167065, lng: -122.5384570 },
  { id: "north-portland", name: "North Portland", address: "512 N Killingsworth St", neighborhood: "Humboldt", tier: "commons", note: "Carnegie library, opened 1913", lat: 45.5624605, lng: -122.6715265 },
  { id: "northwest", name: "Northwest", address: "2300 NW Thurman St", neighborhood: "Northwest", tier: "commons", note: "opened 2001", lat: 45.5353360, lng: -122.6991446 },
  { id: "rockwood", name: "Rockwood", address: "17917 SE Stark St", neighborhood: "Rockwood", tier: "commons", note: "opened 1963", lat: 45.5195568, lng: -122.4790759 },
  { id: "sellwood-moreland", name: "Sellwood-Moreland", address: "7860 SE 13th Ave", neighborhood: "Sellwood", tier: "commons", note: "renovated 2002 · first branch outside downtown, 1905", lat: 45.4677335, lng: -122.6527888 },
  { id: "st-johns", name: "St. Johns", address: "7510 N Charleston Ave", neighborhood: "St. Johns", tier: "commons", note: "Carnegie library, opened 1913", lat: 45.5900361, lng: -122.7510527 },
  { id: "troutdale", name: "Troutdale", address: "2451 SW Cherry Park Rd", neighborhood: "Troutdale", tier: "commons", note: "opened 2010", lat: 45.5294674, lng: -122.4097010 },
  { id: "woodstock", name: "Woodstock", address: "6008 SE 49th Ave", neighborhood: "Woodstock", tier: "commons", note: "renovated 2000", lat: 45.4790051, lng: -122.6121065 },
];
