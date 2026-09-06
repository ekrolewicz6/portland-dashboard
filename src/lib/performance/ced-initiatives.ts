/**
 * Public-source portfolio records for the CED cockpit.
 *
 * Every fact here must trace to a public source listed in `sources` —
 * council records, portland.gov, prosperportland.us, or mainstream
 * reporting of on-record facts. This is a demonstration built from
 * public records, not authoritative City status. No editorial risk
 * ratings: stages and dates only, as documented.
 */

export type InitiativeCategory =
  | "housing"
  | "permitting"
  | "climate"
  | "economic-development"
  | "arts-venues"
  | "major-projects";

export type InitiativeStage =
  | "planning"
  | "decision-pending"
  | "in-negotiation"
  | "implementation"
  | "operational";

export interface InitiativeSource {
  label: string;
  url: string;
}

export interface InitiativeDecision {
  what: string;
  who: string;
  /** Documented date or window; omit when not on the record. */
  due?: string;
}

export interface CedInitiative {
  slug: string;
  title: string;
  /** Owning bureau or office. */
  owner: string;
  category: InitiativeCategory;
  summary: string;
  stage: InitiativeStage;
  /** Documented public dollar figures, with context. */
  funding?: string;
  nextMilestone?: { label: string; date: string };
  decisionsPending: InitiativeDecision[];
  dependencies: string[];
  lastAction?: { date: string; what: string };
  sources: InitiativeSource[];
}

export const CATEGORY_LABELS: Record<InitiativeCategory, string> = {
  housing: "Housing",
  permitting: "Permitting",
  climate: "Climate",
  "economic-development": "Economic development",
  "arts-venues": "Arts & venues",
  "major-projects": "Major projects",
};

export const STAGE_LABELS: Record<InitiativeStage, string> = {
  planning: "Planning",
  "decision-pending": "Decision pending",
  "in-negotiation": "In negotiation",
  implementation: "Implementation",
  operational: "Operational",
};

export const CED_INITIATIVES: CedInitiative[] = [
  {
    "slug": "housing-production-strategy",
    "title": "Housing Production Strategy Implementation",
    "owner": "Bureau of Planning & Sustainability (with Portland Housing Bureau)",
    "category": "housing",
    "summary": "City Council adopted the Housing Production Strategy in August 2024 (Resolution 37673), a package of 35 actions to promote needed housing development. Per the city's progress tracker as of spring 2026, 2 actions are complete, 26 are in progress, and 7 have not yet started.",
    "stage": "implementation",
    "lastAction": {
      "date": "2026-03-27",
      "what": "Rezoning of sites for affordable housing took effect, the strategy's second completed action per the city's HPS progress tracker"
    },
    "nextMilestone": {
      "date": "2026-08",
      "label": "PHB report and recommendations to City Council on alternative homeownership models, including social housing and limited-equity cooperatives/community land trusts"
    },
    "funding": "$7 million HUD Pathways to Removing Obstacles (PRO) Housing grant cited among implementation funding sources on the city's progress tracker, including $670,000 to develop and test innovative affordable-housing financing strategies; tracker also cites a $14 million federal appropriation and $33 million from the Portland Clean Energy Community Benefits Fund toward related actions",
    "decisionsPending": [
      {
        "what": "Council consideration of PHB's report and recommendations on alternative homeownership models (social housing, limited-equity cooperatives, community land trusts)",
        "who": "Portland City Council / Portland Housing Bureau",
        "due": "2026-08"
      },
      {
        "what": "Central City code amendments (publication listed for spring 2026 on the HPS tracker) and subsequent adoption process",
        "who": "Bureau of Planning & Sustainability / Portland City Council",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "Co-implementation by Portland Housing Bureau, Prosper Portland, Portland Permitting & Development, and PBOT",
      "Inclusionary Housing Program review scheduled to start 2027, complete 2028",
      "Housing bond revenue replacement action targeted for completion in 2027"
    ],
    "sources": [
      {
        "label": "Housing Production Strategy progress tracker (Portland.gov)",
        "url": "https://www.portland.gov/bps/planning/housing-production/progress"
      },
      {
        "label": "Housing Needs Analysis and Housing Production Strategy overview (Portland.gov)",
        "url": "https://www.portland.gov/bps/planning/housing-production"
      },
      {
        "label": "Resolution 37673 (adoption record, Portland.gov)",
        "url": "https://www.portland.gov/council/documents/resolution/adopted/37673"
      }
    ]
  },
  {
    "slug": "affordable-housing-bond-pipeline",
    "title": "Affordable Housing Bond Delivery (Portland and Metro Bonds)",
    "owner": "Portland Housing Bureau",
    "category": "housing",
    "summary": "Portland's $211 million share of the regional Metro Affordable Housing Bond has produced 2,154+ units open or in development against a 1,475-unit goal, with all funds allocated or earmarked as of July 2026. Combined, the Portland Housing Bond and Metro bond are funding more than 4,000 new affordable homes, of which 2,740 were open as of PHB's January 2026 report.",
    "stage": "implementation",
    "lastAction": {
      "date": "2026-08-17",
      "what": "73Foster development opened with 64 affordable homes, announced by the Portland Housing Bureau"
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "104 additional Metro bond-funded units expected to open during 2026, with 658 more units expected 2027-2029"
    },
    "funding": "$211 million Metro bond allocation to Portland (1,475-unit goal, all funds allocated or earmarked as of July 2026); Portland and Metro housing bonds combined are funding 4,000+ new affordable homes, including nearly 800 permanent supportive housing units, 1,800+ family-sized units, and nearly 1,500 deeply affordable (30% AMI) homes per PHB's January 15, 2026 release",
    "decisionsPending": [
      {
        "what": "Identification of replacement revenue for housing bond funds, an action on the city's Housing Production Strategy tracker targeted for completion in 2027",
        "who": "Portland Housing Bureau / Portland City Council",
        "due": "2027"
      }
    ],
    "dependencies": [
      "Metro regional bond funds are 92% allocated regionally, with Portland's share fully allocated or earmarked as of July 2026",
      "Pipeline of 1,544 units under construction for completion between 2026 and 2029 (per PHB, January 2026)",
      "Supplemental funding sources including PCEF and tax increment financing districts"
    ],
    "sources": [
      {
        "label": "Metro Housing Bond in Portland - status page (Portland.gov)",
        "url": "https://www.portland.gov/phb/metro-housing-bond"
      },
      {
        "label": "PHB: 928 affordable homes opened last year (Portland.gov, Jan 15, 2026)",
        "url": "https://www.portland.gov/phb/news/2026/1/15/portland-housing-bureau-funds-helped-open-928-affordable-homes-last-year"
      },
      {
        "label": "73Foster opening announcement (Portland.gov, Aug 17, 2026)",
        "url": "https://www.portland.gov/phb/news/2026/8/17/new-affordable-housing-now-open-73foster"
      },
      {
        "label": "Metro Housing Bond quarterly report, Jan-Mar 2026 (Metro)",
        "url": "https://www.oregonmetro.gov/sites/default/files/2026-05/housing-bond-quarterly-progress-report_q1_jan_mar_2026.pdf"
      }
    ]
  },
  {
    "slug": "housing-bureau-fiscal-controls",
    "title": "Housing Bureau Fund Balance Review and Fiscal Oversight",
    "owner": "Portland Housing Bureau / Office of the City Administrator",
    "category": "housing",
    "summary": "After the Housing Bureau disclosed about $21 million in unbudgeted funds to City Council in November 2025, a CFO-directed review by the City Budget Office, Controller, and Housing Bureau identified roughly $106 million in unspent balances by February 2026. The city announced an independent third-party audit, City Council held its first-ever oversight hearing on April 23, 2026, and an April 2026 council vote allocated the identified funds.",
    "stage": "implementation",
    "lastAction": {
      "date": "2026-04-23",
      "what": "City Council held its first-ever oversight hearing, questioning the CFO, deputy city administrator, budget director, and interim Housing Bureau director about when and how the unspent balances were disclosed"
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "Findings of the independent third-party audit of Housing Bureau financial management announced by the City Administrator in February 2026"
    },
    "funding": "Approximately $106 million in unspent housing funds identified (about $20.7 million disclosed November 2025, rising to $106 million by February 2026); council's April 2026 package, approved 8-4, directed roughly $56 million to housing uses including $17.5 million for publicly owned affordable housing acquisition, $9 million for rental assistance, $8.8 million for rent buydowns, and $2 million for eviction legal defense, plus $8.6 million to the city general fund (per OPB)",
    "decisionsPending": [
      {
        "what": "Results and recommendations of the independent third-party audit of the Housing Bureau's unspent funds, which the City Administrator said would extend to a review of non-general-fund resources citywide",
        "who": "Office of the City Administrator / contracted auditor",
        "due": "TBD"
      },
      {
        "what": "Possible additional council oversight hearing; councilors expressed interest at the April 23 hearing but none had been scheduled",
        "who": "Portland City Council",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "Identified balances incorporated into the Housing Bureau's FY 2026-27 budget submission per the CFO-directed review",
      "Engagement of a third-party audit contractor, procured under an emergency clause per the City Administrator's February 2026 announcement"
    ],
    "sources": [
      {
        "label": "City Administrator announces independent audit of unspent funds (KATU, Feb 2026)",
        "url": "https://katu.com/news/local/portland-city-administrator-responds-to-revelation-of-106m-in-unspent-housing-funds-politics-money-investigation-oregon-council-rental-bureau-government-local-community"
      },
      {
        "label": "Portland approves plan to spend $56 million of unbudgeted housing funds (OPB, Apr 8, 2026)",
        "url": "https://www.opb.org/article/2026/04/08/portland-56-million-unbudgeted-housing-funds/"
      },
      {
        "label": "Council holds oversight hearing over unspent housing funds (KPTV, Apr 24, 2026)",
        "url": "https://www.kptv.com/2026/04/24/portland-city-council-holds-oversight-hearing-over-unspent-housing-funds/"
      },
      {
        "label": "Additional $21M in unspent housing funds discovered (KOIN)",
        "url": "https://www.koin.com/news/portland/deeply-troubled-portland-officials-discover-additional-21m-in-unspent-housing-funds/"
      },
      {
        "label": "City Auditor commentary on unspent housing funds and accountability (Portland.gov, Mar 25, 2026)",
        "url": "https://www.portland.gov/auditor/news/2026/3/25/unspent-housing-funds-show-accountability-isnt-optional-portlands-next"
      }
    ]
  },
  {
    "slug": "ppd-permitting-consolidation-reform",
    "title": "Permitting Consolidation and Reform (Portland Permitting & Development)",
    "owner": "Portland Permitting & Development",
    "category": "permitting",
    "summary": "Portland Permitting & Development (PP&D) launched July 1, 2024, consolidating permitting staff from the Bureau of Development Services, Environmental Services, Transportation, Water, and Parks' Urban Forestry Division into a single bureau of about 350 employees, following an August 2023 council resolution. Reform work continues into 2026: weekly-updated permit review dashboards (July 2025), a completed Digital Services collaboration (January 2026), programs including 30-Day Residential Permitting, One-Stop Review, and After-Hours Review, and a joint BPS/PP&D Design Review Reform Report (May 2026) recommending a temporary two-year suspension of required discretionary design review.",
    "stage": "implementation",
    "lastAction": {
      "date": "2026-05-14",
      "what": "Bureau of Planning and Sustainability and PP&D published the Design Review Reform Report, identifying eight reform concepts and recommending a temporary two-year suspension of required discretionary design review, responding to a December 2025 City Council resolution."
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "City Council action on design review reform, including the recommended two-year temporary suspension of required design review (expected late 2026 per the May 2026 announcement)"
    },
    "decisionsPending": [
      {
        "what": "Legislative land use decision on design review reform options, including the directors' recommendation to temporarily suspend required discretionary design review for two years (voluntary review would remain available)",
        "who": "Portland City Council",
        "due": "Expected late 2026"
      }
    ],
    "dependencies": [
      "Bureau of Planning and Sustainability (co-author of the Design Review Reform Report and lead on the legislative land use process)",
      "Public input and additional analysis prior to the expected late-2026 council action"
    ],
    "sources": [
      {
        "label": "Portland.gov: Portland Permitting & Development launches (July 1, 2024)",
        "url": "https://www.portland.gov/ppd/news/2024/7/1/portland-permitting-development-launches"
      },
      {
        "label": "Portland.gov: City Council gives green light to Portland Permitting & Development (May 29, 2024)",
        "url": "https://www.portland.gov/permitimprovement/news/2024/5/29/city-council-gives-green-light-portland-permitting-development"
      },
      {
        "label": "Portland.gov: Council unanimously commits to consolidate city permitting (Aug 30, 2023)",
        "url": "https://www.portland.gov/permitimprovement/news/2023/8/30/portland-city-council-unanimously-commits-consolidate-city"
      },
      {
        "label": "Portland.gov: New dashboards provide enhanced insights into building permit processes (July 21, 2025)",
        "url": "https://www.portland.gov/ppd/news/2025/7/21/new-dashboards-provide-enhanced-insights-city-portlands-building-permit"
      },
      {
        "label": "Portland.gov: Design Review Reform Report published (May 14, 2026)",
        "url": "https://www.portland.gov/bps/planning/news/2026/5/14/city-portland-publishes-design-review-reform-report-outlining-options"
      },
      {
        "label": "Portland.gov: Digital Services wraps up collaboration with Permitting & Development (Jan 2, 2026)",
        "url": "https://www.portland.gov/digital-services/news/2026/1/2/digital-services-wraps-collaboration-permitting-development-builds"
      },
      {
        "label": "Portland.gov: Background on the Permit Improvement Project",
        "url": "https://www.portland.gov/permitimprovement/about"
      },
      {
        "label": "Portland.gov: About Portland Permitting & Development (programs and leadership)",
        "url": "https://www.portland.gov/ppd/about-portland-permitting-development"
      }
    ]
  },
  {
    "slug": "ppd-fee-budget-stabilization",
    "title": "PP&D Fee and Budget Stabilization (FY 2026-27)",
    "owner": "Portland Permitting & Development",
    "category": "permitting",
    "summary": "PP&D, which derives roughly 94% of its revenues from service fees, had been drawing on reserve funds to maintain service levels amid weak permit volumes. In the FY 2026-27 budget cycle the city approved fee adjustments projected to raise overall fee revenue collections by about 8%, intended to let the bureau recover its costs in the fiscal year ending June 30, 2027 without reliance on reserves; a proposed 14.0 FTE cut to the below-cost-recovery Tree Permitting Program was restored by an 8-4 council amendment vote using Portland Clean Energy Community Benefits Fund resources.",
    "stage": "implementation",
    "funding": "PP&D total budget of $103.2 million in the Mayor's FY 2026-27 Proposed Budget (3.0% reduction from current service level); fee adjustments projected to add approximately $3.2 million (about 8% increase in overall fee revenue collections); Councilor Koyama Lane's adopted amendment restored $3.2 million to Tree Permitting from Portland Clean Energy Community Benefits Fund resources",
    "lastAction": {
      "date": "2026-07-10",
      "what": "Updated PP&D fee schedule took effect, following Portland City Council approval on June 11, 2026 (public hearing June 3) and Multnomah County Board of Commissioners approval on June 18, 2026 for unincorporated areas; City Council adopted the final FY 2026-27 budget on June 18, 2026."
    },
    "nextMilestone": {
      "date": "2027-06-30",
      "label": "End of FY 2026-27, the fiscal year in which PP&D's approved fee changes are intended to achieve cost recovery without reliance on reserve funds"
    },
    "decisionsPending": [],
    "dependencies": [
      "Permit application volumes and construction activity, which drive the fee revenue that funds roughly 94% of the bureau",
      "Portland Clean Energy Community Benefits Fund allocation supporting the Tree Permitting Program, transferred to PP&D with the program in July 2024 and October 2025"
    ],
    "sources": [
      {
        "label": "Portland.gov: Permitting & Development fee changes take effect July 10 (April 27, 2026)",
        "url": "https://www.portland.gov/ppd/news/2026/4/27/permitting-development-proposes-fee-changes-starting-july"
      },
      {
        "label": "Portland.gov: Mayor's FY 2026-27 Proposed Budget highlights and key budget adjustments (PP&D section)",
        "url": "https://www.portland.gov/budget/documents/mayors-proposed-budget-highlights-and-key-budget-adjustments/download"
      },
      {
        "label": "Portland.gov: Councilor Koyama Lane's budget amendments (May 17, 2026)",
        "url": "https://www.portland.gov/council/districts/3/tiffany-koyama-lane/news/2026/5/17/councilor-koyama-lanes-budget-amendments"
      },
      {
        "label": "Portland.gov: Portland City Council adopts final budget for 2026-27 (June 18, 2026)",
        "url": "https://www.portland.gov/hello/news/2026/6/18/portland-city-council-adopts-final-budget-2026-27"
      },
      {
        "label": "Portland.gov: Tree code permits and enforcement team joins Permitting & Development (Oct 1, 2025)",
        "url": "https://www.portland.gov/ppd/news/2025/10/1/portlands-tree-code-permits-and-enforcement-team-joins-permitting-development"
      },
      {
        "label": "Willamette Week: After dozens of layoffs in Portland's permitting bureau, industry groups try to strike bargain with city (March 21, 2024)",
        "url": "https://www.wweek.com/news/city/2024/03/21/after-dozens-of-layoffs-in-portlands-permitting-bureau-industry-groups-try-to-strike-bargain-with-city/"
      },
      {
        "label": "Portland.gov: PP&D Financial Advisory Committee meeting notes, April 23, 2025 (cost recovery and reserve discussion)",
        "url": "https://www.portland.gov/ppd/finance/documents/ppd-financial-advisory-committee-meeting-notes-april-23-2025/download"
      }
    ]
  },
  {
    "slug": "pcef-climate-investment-plan",
    "title": "PCEF Climate Investment Plan (five-year portfolio)",
    "owner": "Bureau of Planning and Sustainability (Portland Clean Energy Community Benefits Fund)",
    "category": "climate",
    "summary": "PCEF's five-year Climate Investment Plan allocates $1,591,590,328 through June 30, 2029 across community grants and strategic programs including transportation decarbonization, building energy upgrades in affordable housing, and climate-friendly schools; the plan's first annual review was adopted by City Council on March 11, 2026 (Ordinance 192154). Mayor Keith Wilson has proposed PCEF as one potential source for the city's $120 million Moda Center renovation contribution, a use that requires PCEF Committee review, and a separate ballot initiative to redirect 25% of PCEF revenue to police hiring was ruled invalid in its initial form by a Multnomah County judge on Feb. 24, 2026, with backers stating they would revise it.",
    "stage": "implementation",
    "funding": "$1,591,590,328 allocated through June 30, 2029 under the amended Climate Investment Plan (Ordinance 192005, passed Dec. 11, 2024, which added $386.987 million for city-bureau strategic programs, $300 million for the Collaborating for Climate Action opportunity, and $120 million more for Community Responsive Grants); the original 2023 plan set a framework of approximately $750 million over five years. Ordinance 192154 (Mar. 11, 2026) added $15 million for clean energy in regulated affordable housing and allocated $30 million under Strategic Program 14 (Access to Fair and Flexible Capital). Approximately $64 million in community grants were awarded in December 2025; the 2026 Community Grants cycle offers up to $60 million.",
    "lastAction": {
      "date": "2026-03-11",
      "what": "City Council passed Ordinance 192154, adopting the CIP's first annual review: +$15 million for clean energy in regulated affordable housing (est. 580 additional units), $30 million allocated for capital access programs including office-to-residential conversions, and authority for the BPS Director to adjust individual program allocations up to 10% on PCEF Committee recommendation."
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "2026 Community Grants award notifications (up to $60 million; applications closed May 27, 2026) — fall 2026 per published PCEF timeline"
    },
    "decisionsPending": [
      {
        "what": "Whether PCEF funds will be used toward the city's $120 million upfront Moda Center renovation contribution approved in the Aug. 12, 2026 term sheet (8-4 council vote); the PCEF Committee must review spending plans before any funds are approved, and the city's funding-source breakdown is not yet determined",
        "who": "PCEF Committee; Portland City Council",
        "due": "Final lease/development agreement expected December 2026"
      },
      {
        "what": "Award decisions for the 2026 Community Grants cycle (up to $60 million across five funding areas)",
        "who": "PCEF / Bureau of Planning and Sustainability",
        "due": "Fall 2026 notification per published timeline"
      }
    ],
    "dependencies": [
      "Moda Center lease negotiations and final funding package (city term sheet approved Aug. 12, 2026)",
      "City Council annual budget actions affecting PCEF allocations",
      "Possible revised ballot initiative to redirect 25% of PCEF revenue (initial version ruled constitutionally deficient Feb. 24, 2026)"
    ],
    "sources": [
      {
        "label": "PCEF Climate Investment Plan (Portland.gov)",
        "url": "https://www.portland.gov/bps/cleanenergy/climate-investment-plan"
      },
      {
        "label": "Ordinance 192005 — CIP amendment to $1.59B (Dec. 11, 2024)",
        "url": "https://www.portland.gov/council/documents/ordinance/1052-pcef-cip-amendment"
      },
      {
        "label": "Ordinance 192154 — first annual CIP review amendment (Mar. 11, 2026)",
        "url": "https://www.portland.gov/council/documents/ordinance/amend-portland-clean-energy-community-benefit-funds-climate-investment"
      },
      {
        "label": "OPB: Council approves Moda Center term sheet; PCEF proposed as a revenue source (Aug. 12, 2026)",
        "url": "https://www.opb.org/article/2026/08/12/portland-city-council-approves-moda-center-renovations-term-sheet/"
      },
      {
        "label": "Portland Mercury: PCEF awards nearly $64 million in community grants (Dec. 5, 2025)",
        "url": "https://www.portlandmercury.com/news/2025/12/05/48169523/amid-grim-outlook-for-national-climate-investments-portlands-clean-energy-fund-doles-out-nearly-64-million"
      },
      {
        "label": "OPB: Judge rules PCEF-diversion initiative lacked required full text (Feb. 24, 2026)",
        "url": "https://www.opb.org/article/2026/02/24/judge-rules-initiative-to-divert-portland-climate-funds-lacked-clear-language/"
      },
      {
        "label": "PCEF 2026 Community Grants cycle (Portland.gov)",
        "url": "https://www.portland.gov/bps/cleanenergy/community-grants/2026-community-grants-cycle"
      }
    ]
  },
  {
    "slug": "clean-industry-initiative",
    "title": "Clean Industry Initiative",
    "owner": "Bureau of Planning and Sustainability (co-led with PSU Center for Public Service and Prosper Portland)",
    "category": "climate",
    "summary": "A BPS-led industrial decarbonization effort, co-led with Portland State University and Prosper Portland, that implements recommendations from the 2023 Portland Clean Industry Study: reducing industrial emissions, air pollution, and waste while building workforce pathways and supporting climate-tech innovation. A PCEF-funded Clean Industry Community Program and a planned funding opportunity for emissions-reducing projects at industrial businesses are the initiative's current implementation vehicles.",
    "stage": "implementation",
    "funding": "Clean Industry Community Program approved by City Council to use $20 million in PCEF funds (per PSU announcement) in partnership with PSU, BPS, Prosper Portland, Portland Metro Chamber, Neighbors for Clean Air, Worksystems, and Energy 350; BPS-PSU partnership MOU funded at $150,000 from each organization (through October 2025); $110,000 final-phase U.S. DOE Community Energy Innovation Prize awarded January 2025.",
    "lastAction": {
      "date": "2025-01-06",
      "what": "BPS and area partners (the PDX Clean Industry Network) were awarded a third U.S. Department of Energy Community Energy Innovation Prize of $110,000."
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "PCEF-funded Clean Industry funding opportunity for industrial-business decarbonization projects (announced for launch via the Collaborating for Climate Action opportunity; award status not yet posted on the program page)"
    },
    "decisionsPending": [
      {
        "what": "Selection of projects under the PCEF Collaborating for Climate Action clean-industry funding opportunity for industrial businesses",
        "who": "Bureau of Planning and Sustainability / PCEF",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "PCEF Climate Investment Plan — Collaborating for Climate Action allocation ($300 million umbrella)"
    ],
    "sources": [
      {
        "label": "About the Clean Industry Initiative (Portland.gov)",
        "url": "https://www.portland.gov/bps/climate-action/clean-industry/about-clean-industry"
      },
      {
        "label": "BPS news: third DOE Community Energy Innovation Prize awarded (Jan. 6, 2025)",
        "url": "https://www.portland.gov/bps/climate-action/news/2025/1/6/bureau-planning-and-sustainability-and-area-partners-awarded-third"
      },
      {
        "label": "PSU: Clean Industry Community Program to use $20 million in PCEF funds",
        "url": "https://www.pdx.edu/sustainability/news/psu-power-portlands-clean-industry-community-program"
      },
      {
        "label": "BPS-PSU Clean Industry partnership announcement (Jan. 8, 2024)",
        "url": "https://www.portland.gov/bps/climate-action/clean-industry/news/2024/1/8/bureau-planning-and-sustainability-portland-state"
      }
    ]
  },
  {
    "slug": "climate-health-standards-existing-buildings",
    "title": "Climate and Health Standards for Existing Buildings",
    "owner": "Bureau of Planning and Sustainability (policy sponsored by District 1 Councilor Candace Avalos)",
    "category": "climate",
    "summary": "Proposed building performance standards that would require commercial and multifamily buildings of at least 20,000 square feet to report annual energy performance to the city by June 1 each year, with emissions-reduction targets of 20% every five years toward zero by 2050, alongside renter-transparency and anti-displacement provisions. The draft is before the council's Housing and Permitting Committee, which is scheduled to vote Sept. 1, 2026 on whether to advance it to the full City Council.",
    "stage": "decision-pending",
    "lastAction": {
      "date": "2026-07-28",
      "what": "Draft standard details publicly reported: 20,000+ sq ft commercial and multifamily buildings would report annual energy performance and cut emissions 20% every five years toward zero by 2050, with a Housing and Permitting Committee vote set for Sept. 1, 2026."
    },
    "nextMilestone": {
      "date": "2026-09-01",
      "label": "Housing and Permitting Committee vote on whether to advance the draft standards to the full City Council"
    },
    "decisionsPending": [
      {
        "what": "Committee vote on advancing the draft Climate and Health Standards to the full City Council",
        "who": "Portland City Council Housing and Permitting Committee",
        "due": "2026-09-01"
      },
      {
        "what": "Full City Council consideration and adoption of the standards, if advanced by committee",
        "who": "Portland City Council",
        "due": "TBD"
      }
    ],
    "dependencies": [],
    "sources": [
      {
        "label": "Climate and Health Standards for Existing Buildings (Portland.gov)",
        "url": "https://www.portland.gov/bps/climate-action/building-standards"
      },
      {
        "label": "Project overview and background (Portland.gov)",
        "url": "https://www.portland.gov/bps/climate-action/building-standards/project-overview"
      },
      {
        "label": "HFO report on proposed carbon rules and Sept. 1, 2026 committee vote (July 28, 2026)",
        "url": "https://www.hfore.com/new-portland-carbon-rules-would-reach-nearly-every-large-apartment-building/"
      },
      {
        "label": "BPS news: cost analysis of climate and health policies for buildings (Jan. 17, 2025)",
        "url": "https://portland.gov/bps/climate-action/news/2025/1/17/cost-analysis-climate-and-health-policies-buildings"
      }
    ]
  },
  {
    "slug": "broadway-corridor-usps-redevelopment",
    "title": "Broadway Corridor / Former USPS Site Redevelopment",
    "owner": "Prosper Portland (with Portland Housing Bureau)",
    "category": "economic-development",
    "summary": "Redevelopment of the 14-acre former USPS site (within the ~32-acre Broadway Corridor) that Prosper Portland acquired in 2016, with capacity for up to 4 million square feet across roughly nine blocks. Demolition and remediation are complete, new streets are under construction, and the first two buildings — a 230-unit affordable project on Parcel 4A (Home Forward/Urban League) and a middle-income project on Parcel 6 (Related NW) — are in predevelopment and design review.",
    "stage": "implementation",
    "funding": "More than $100 million in Prosper Portland and City funds for site preparation and infrastructure (per June 2025 board Report 25-19); $33.5 million Portland Clean Energy Fund award for Parcel 6; $750,000 Prosper Portland predevelopment loan to Related NW (expandable to $1 million with PCEF funds); over $40 million awarded by the Portland Housing Bureau for Parcel 4A ($37.5 million Metro Affordable Housing Bond + $4.5 million River District TIF).",
    "lastAction": {
      "date": "2026-06-12",
      "what": "Portland Housing Bureau issued the final floodplain notice for the Parcel 4A Broadway Corridor Affordable Housing project; three weeks earlier (May 21, 2026), the Portland Design Commission held a Design Advice Request hearing on Related NW's Parcel 6 tower (13 stories, ~200 units, net-zero target)."
    },
    "nextMilestone": {
      "label": "Planned groundbreaking on Parcel 4A affordable housing (230 units, completion expected summer 2028); Parcel 6 groundbreaking anticipated late 2026 per the June 2025 board report",
      "date": "2026-Q3"
    },
    "decisionsPending": [
      {
        "what": "Type Ix (staff-level) design review decision on the Parcel 6 middle-income housing project following the May 21, 2026 Design Advice Request",
        "who": "Portland Permitting & Development / Design Commission staff",
        "due": "TBD"
      },
      {
        "what": "Development feasibility and construction financing decision for Parcel 6 after completion of the predevelopment scope (schematic design, market study, contractor pricing); the predevelopment loan may be forgiven if development is determined infeasible",
        "who": "Related NW and Prosper Portland",
        "due": "Late 2026 (anticipated groundbreaking per June 2025 board report)"
      }
    ],
    "dependencies": [
      "Execution of Portland Clean Energy Fund funding agreements for the $33.5M Parcel 6 award (anticipated summer 2025 per board report)",
      "Completion of the NW Johnson & Kearney street extension project serving the district",
      "Additional local and state public funding sought for the Parcel 6 project"
    ],
    "sources": [
      {
        "label": "Prosper Portland — Broadway Corridor Redevelopment",
        "url": "https://prosperportland.us/our-work/broadway-corridor-redevelopment/"
      },
      {
        "label": "Prosper Portland Board Report 25-19 — Parcel 6 Predevelopment Loan (June 18, 2025)",
        "url": "https://prosperportland.us/wp-content/uploads/2025/06/Report-25-19.pdf"
      },
      {
        "label": "Portland.gov — PHB awards over $40M to Home Forward and Urban League for 230-unit Parcel 4A development (Aug 8, 2024)",
        "url": "https://www.portland.gov/phb/news/2024/8/8/portland-housing-bureau-awards-over-40m-home-forward-and-urban-league-230-unit"
      },
      {
        "label": "Next Portland — Broadway Corridor Parcel 6 receives Design Advice (May 29, 2026)",
        "url": "https://www.nextportland.com/2026/05/29/broadway-corridor-parcel-6-receives-design-advice-images/"
      },
      {
        "label": "Portland.gov — Final floodplain notice, Broadway Corridor Affordable Housing (June 12, 2026)",
        "url": "https://www.portland.gov/phb/news/2026/6/12/final-floodplain-notice-broadway-corridor-affordable-housing-project"
      },
      {
        "label": "Portland.gov — NW Johnson & Kearney Street Extension Project (PBOT)",
        "url": "https://www.portland.gov/transportation/pbot-projects/construction/nw-johnson-kearney-street-extension-project"
      }
    ]
  },
  {
    "slug": "new-tif-districts",
    "title": "New Tax Increment Finance Districts (Cully and Six 2024 Districts)",
    "owner": "Prosper Portland (with Portland Housing Bureau)",
    "category": "economic-development",
    "summary": "Portland created a new generation of TIF districts: the community-led Cully district (adopted November 2022) and six districts approved by City Council on October 30, 2024 — 82nd Avenue Area, East 205, and Sumner-Parkrose-Argay-Columbia Corridor (SPACC) in East Portland, plus Central Eastside Corridor, Lloyd-Holladay, and Westside in the Central City. Resources first became available in FY 2025-26; Community Leadership Committees appointed in October 2025 are developing the first 5-Year Action Plans for City Council approval by end of 2026.",
    "stage": "decision-pending",
    "funding": "More than $2.5 billion projected across the six 2024 districts over 30 years, including over $1 billion for affordable housing and $400 million for public infrastructure, with a 45% affordable-housing set-aside citywide; the three East Portland districts are projected to deploy approximately $1.43 billion over 30 years; East 205 maximum indebtedness is $770 million (3,745 acres, per Ordinance 191937); Cully maximum indebtedness is $350 million, with about $143 million reserved for Portland Housing Bureau affordable housing.",
    "lastAction": {
      "date": "2025-10-29",
      "what": "Portland City Council appointed 39 Community Leadership Committee members (13 per district) for the three East Portland TIF districts to advise Prosper Portland, PHB, and Council on each district's 5-Year Action Plan; district-specific action planning began in early 2026."
    },
    "nextMilestone": {
      "label": "Community Leadership Committees present the first district 5-Year Action Plans to City Council",
      "date": "2026-Q4"
    },
    "decisionsPending": [
      {
        "what": "City Council approval of the inaugural 5-Year Action Plans for the 82nd Avenue Area, East 205, and SPACC TIF districts, which will govern first investments in housing, economic development, and infrastructure",
        "who": "Portland City Council",
        "due": "End of 2026"
      }
    ],
    "dependencies": [
      "Tax increment collection, which began with resources first available in FY 2025-26",
      "Completion of the Community Leadership Committee action-planning process (kickoffs fall 2025, planning through 2026)",
      "45% TIF set-aside administered by the Portland Housing Bureau for affordable housing"
    ],
    "sources": [
      {
        "label": "Portland.gov — Council approves six TIF districts, >$2.5B over 30 years (Oct 30, 2024)",
        "url": "https://www.portland.gov/rubio/news/2024/10/30/council-approves-generational-public-investments-east-portland-and-central"
      },
      {
        "label": "Portland.gov — Ordinance 191937, East 205 Urban Renewal Plan ($770M maximum indebtedness, Oct 30, 2024)",
        "url": "https://www.portland.gov/council/documents/ordinance/passed/191937"
      },
      {
        "label": "Prosper Portland — City Council appoints Community Leadership Committees for East Portland TIF districts (Oct 29, 2025)",
        "url": "http://prosperportland.us/eastpdx-clc-appointments/"
      },
      {
        "label": "Prosper Portland — East 205 TIF District",
        "url": "https://prosperportland.us/our-work/east-205-tif-district/"
      },
      {
        "label": "Portland.gov — Cully TIF District Exploration Process Report, accepted Sept 28, 2022 ($350M maximum indebtedness)",
        "url": "https://www.portland.gov/council/documents/report/accepted/819-2022"
      },
      {
        "label": "Prosper Portland — Cully TIF District",
        "url": "https://prosperportland.us/our-work/cully-tif-district/"
      }
    ]
  },
  {
    "slug": "omsi-district",
    "title": "OMSI District Development",
    "owner": "Prosper Portland (with OMSI and Portland Bureau of Transportation)",
    "category": "economic-development",
    "summary": "A 24-acre mixed-use district planned around the Oregon Museum of Science and Industry in the Central Eastside, with up to 1,200 housing units (minimum 300 affordable at or below 80% AMI), about 3 million square feet of development, and a waterfront park developed in partnership with Indigenous communities. City Council approved a term sheet and infrastructure funding in September 2024; the New Water Avenue street project's planned 2025 groundbreaking was not met, and officials have said a revised construction timeline is forthcoming.",
    "stage": "planning",
    "funding": "Up to $16.9 million authorized for the New Water Avenue project via Ordinance 191884 ($10.9 million in tax increment revenue from Prosper Portland, up to $6 million from the Oregon Business Development Department if received, and $500,000 in PBOT transportation system development charges); $4 million from Portland Parks & Recreation for waterfront park planning; Metro contributed $7 million for the park and $750,000 for Indigenous advisory roles; $850,000 in federal community project funding secured in early 2026 for Water Avenue intersection rebuilds.",
    "lastAction": {
      "date": "2026-02",
      "what": "An $850,000 federal community project allocation secured by Rep. Suzanne Bonamici was directed to rebuilding two SE Water Avenue intersections and pedestrian upgrades, as the district's planned 2025 groundbreaking was missed amid extended design and value-engineering work."
    },
    "nextMilestone": {
      "label": "Publication of a revised construction timeline and construction start for the New Water Avenue project (street work was previously anticipated to begin by early 2026 and finish by June 2027)",
      "date": "TBD"
    },
    "decisionsPending": [
      {
        "what": "A refreshed construction timeline for the New Water Avenue project and the broader district, which city and OMSI officials said is forthcoming after the 2025 groundbreaking target was missed",
        "who": "OMSI, Prosper Portland, and PBOT",
        "due": "TBD"
      },
      {
        "what": "Receipt of up to $6 million in state funding from the Oregon Business Development Department, which Ordinance 191884 counts toward the project only if received; officials are also pursuing additional grants and private funding for district infrastructure",
        "who": "Oregon Business Development Department / project partners",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "Completion of the New Water Avenue street reconstruction, the infrastructure piece preceding vertical development",
      "Additional state, federal, and private funding for district infrastructure and the waterfront park",
      "First housing project: an approximately 100-unit, estimated $36 million affordable development on Water Avenue by Edlen & Co. and Hacienda CDC"
    ],
    "sources": [
      {
        "label": "OPB — Portland City Council approves $15 million to advance new OMSI district (Sept 4, 2024)",
        "url": "https://www.opb.org/article/2024/09/04/portland-city-council-approves-15-million-advance-new-omsi-district/"
      },
      {
        "label": "Portland.gov — Ordinance 191884 authorizing the Prosper Portland–PBOT IGA for the New Water Avenue project, up to $16.9M (Sept 4, 2024)",
        "url": "https://www.portland.gov/council/documents/ordinance/passed/191884"
      },
      {
        "label": "Prosper Portland — OMSI District",
        "url": "https://prosperportland.us/our-work/omsi-district/"
      },
      {
        "label": "Hoodline — Feds kick in $850K for OMSI District as groundbreaking goal slides past 2025 (Feb 2026)",
        "url": "https://hoodline.com/2026/02/feds-kick-in-850k-for-omsi-district-as-portland-groundbreaking-goal-slides-past-2025/"
      },
      {
        "label": "OMSI — Future OMSI District",
        "url": "https://omsi.edu/future-omsi-district/"
      }
    ]
  },
  {
    "slug": "keller-psu-performing-arts-decision",
    "title": "Keller Auditorium / PSU Performing Arts Center Decision",
    "owner": "Office of Arts & Culture (Community & Economic Development Service Area)",
    "category": "arts-venues",
    "summary": "A city-appointed steering committee unanimously recommended on June 24, 2026 that Portland advance a new ~3,000-seat Broadway-capable venue as part of the proposed Performing Arts + Culture Center at Portland State University, targeting a 2030 opening, while creating an actionable plan to reimagine the Keller Auditorium as a 1,200-1,800-seat venue. Mayor Keith Wilson introduced Resolution 2026-270 to accept the recommendations; the City Council's City Life Committee voted 4-1 on August 11, 2026 to refer it, as amended, to the full 12-member Council with a do-pass recommendation.",
    "stage": "decision-pending",
    "funding": "Concept estimates published during the process were about $358 million for the new PSU venue and about $236 million for a Keller renovation; Resolution 2026-270 materials cite updated estimates of $447 million (PSU venue) and $290 million (Keller renovation), a $137.5 million state funding commitment ($85 million for theater/academic space, $52.5 million for parking), and $8.5-$17.5 million in Keller maintenance needs over ten years. Per news coverage of the August 11 committee vote, the resolution does not commit the City to a specific dollar amount.",
    "lastAction": {
      "date": "2026-08-11",
      "what": "City Life Committee voted 4-1 to amend Resolution 2026-270 and refer it to the full City Council with a do-pass recommendation; an amendment acknowledged the Keller will need repairs to keep operating during PSU venue construction."
    },
    "nextMilestone": {
      "label": "Full City Council first reading and vote on Resolution 2026-270",
      "date": "TBD"
    },
    "decisionsPending": [
      {
        "what": "Adoption of Resolution 2026-270 accepting the Future of Large-Scale Performing Arts recommendations",
        "who": "Portland City Council (full 12-member body)",
        "due": "TBD"
      },
      {
        "what": "Project Commitment Agreement between the City and Portland State University",
        "who": "Deputy City Administrator, Community & Economic Development, and PSU",
        "due": "2026-12-01 (per Resolution 2026-270)"
      },
      {
        "what": "Detailed financial plan, including total project cost and the City's expected financial contribution",
        "who": "Deputy City Administrator, Community & Economic Development",
        "due": "TBD"
      },
      {
        "what": "Actionable plan for reimagining the Keller Auditorium as a 1,200-1,800-seat venue",
        "who": "Office of Arts & Culture / Deputy City Administrator",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "PSU Performing Arts + Culture Center project (PSU-owned site)",
      "State of Oregon funding commitment",
      "Philanthropic fundraising coordination",
      "Portland'5 management transition (the Keller is a Portland'5 venue)"
    ],
    "sources": [
      {
        "label": "Resolution 2026-270: Accept the Future of Large-Scale Performing Arts recommendations (Portland.gov)",
        "url": "https://www.portland.gov/council/documents/resolution/accept-future-large-scale-performing-arts-recommendations"
      },
      {
        "label": "Future of Large-Scale Performing Arts program page (Portland.gov)",
        "url": "https://www.portland.gov/arts/keller/future-large-scale-performing-arts"
      },
      {
        "label": "Oregon ArtsWatch: Portland committee advances PSU theater plan; Keller supporters object",
        "url": "https://www.orartswatch.org/portland-committee-advances-psu-theater-plan-keller-supporters-complain/"
      },
      {
        "label": "KPTV: Portland City Council committee approves proposal for new Broadway-style theater (Aug 12, 2026)",
        "url": "https://www.kptv.com/2026/08/12/portland-city-council-committee-approves-proposal-new-broadway-style-theater/"
      },
      {
        "label": "Willamette Week: Council Punts Performing Arts Center Vote as Mayor Proposes Two-Venue Solution (July 29, 2026)",
        "url": "https://www.wweek.com/arts/2026/07/29/council-punts-performing-arts-center-vote-as-wilson-proposes-two-venue-solution/"
      },
      {
        "label": "Oregon ArtsWatch: Debate on future of Keller Auditorium heats up (cost estimates $358M / $236M)",
        "url": "https://www.orartswatch.org/debate-on-future-of-keller-auditorium-heats-up/"
      },
      {
        "label": "KGW: Portland City Council committee delays vote on new PSU Broadway theater, Keller Auditorium downsizing",
        "url": "https://www.kgw.com/article/money/business/portland-city-council-committee-vote-new-psu-broadway-theater-keller-auditorium-downsizing/283-6483e9d3-4f9f-46c2-845a-f59f00b6d08a"
      }
    ]
  },
  {
    "slug": "portland5-management-transition",
    "title": "Portland'5 Centers for the Arts Management Transition (Metro to City)",
    "owner": "Office of Arts & Culture, Spectator Venues program (with Metro)",
    "category": "arts-venues",
    "summary": "Metro, which has managed the city-owned Portland'5 Centers for the Arts venues since 1989, formally notified the City on December 31, 2025 of its intent to withdraw as manager, starting an 18-month clock; management returns to the City of Portland on July 1, 2027. The City ran an informal request for information (January 26 - March 16, 2026) to explore operating models, including the option of managing the venues itself, and RFI results may inform a future formal request for proposals if outside management is pursued.",
    "stage": "implementation",
    "lastAction": {
      "date": "2026-03-16",
      "what": "Responses were due for the City's request for information on venue operations and operating models for Portland'5."
    },
    "nextMilestone": {
      "label": "Management of Portland'5 transfers from Metro to the City of Portland (or its selected operator)",
      "date": "2027-07-01"
    },
    "decisionsPending": [
      {
        "what": "Whether the City will manage Portland'5 directly or select an outside operator (new operating model)",
        "who": "City of Portland (Office of Arts & Culture, with the CED Deputy City Administrator and Spectator Venues program)",
        "due": "Per the RFI's estimated timeline, new venue operator(s) identified by December 2026"
      },
      {
        "what": "Whether to issue a formal request for proposals for outside venue management",
        "who": "Office of Arts & Culture",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "Metro / Metropolitan Exposition Recreation Commission (MERC) transition coordination",
      "Keller Auditorium / PSU performing arts center decision (Resolution 2026-270)",
      "Performing Arts Venues Workgroup recommendations (submitted June 25, 2025)"
    ],
    "sources": [
      {
        "label": "Metro and City of Portland Announce Next Steps in Portland'5 Management Transition (Portland.gov, Jan 5, 2026)",
        "url": "https://www.portland.gov/community-economic-dev/news/2026/1/5/metro-and-city-portland-announce-next-steps-portland5"
      },
      {
        "label": "Future of Portland'5 program page (Portland.gov)",
        "url": "https://www.portland.gov/arts/keller/future-portland5"
      },
      {
        "label": "City launches request for information to explore new operating models for Portland'5 (Portland.gov, Jan 26, 2026)",
        "url": "https://www.portland.gov/arts/news/2026/1/26/city-launches-request-information-explore-new-operating-models-portland5"
      },
      {
        "label": "Request for Information: Venue Operations for Portland'5 Centers for the Arts (Portland.gov)",
        "url": "https://www.portland.gov/arts/portland5-request-information"
      },
      {
        "label": "Oregon ArtsWatch: City will take back management of Portland'5 performance halls",
        "url": "https://www.orartswatch.org/city-will-take-back-management-of-portland5-performance-halls/"
      }
    ]
  },
  {
    "slug": "arts-education-access-tax-reform",
    "title": "Arts Education and Access Tax Reform (Ordinance 192185)",
    "owner": "Office of Arts & Culture and Revenue Division",
    "category": "arts-venues",
    "summary": "On May 27, 2026, Portland City Council voted 7-5 to pass Ordinance 192185 amending the Arts Tax code: the annual Arts Education and Access Income Tax rises from $35 to $50 per person (indexed to inflation going forward), the filing threshold rises to $20,000 in Oregon taxable income for single filers ($40,000 joint), and the federal poverty level exemption test is eliminated, relieving roughly 218,000 current filers (about 44%). The changes respond to a March 2026 city audit finding the City needs improvements to deliver on voter-approved arts education and grants commitments; the new rate takes effect April 15, 2027.",
    "stage": "implementation",
    "funding": "The tax funds the Arts Access Fund, which supports K-5 arts education in Portland public elementary schools and arts grants; the measure is projected to generate roughly the same amount in its first year, about $12 million annually, while growing with inflation thereafter (OPB).",
    "lastAction": {
      "date": "2026-05-27",
      "what": "City Council passed Ordinance 192185 on a 7-5 vote."
    },
    "nextMilestone": {
      "label": "Required reports to Council from the Office of Arts & Culture and Revenue Division on grant programs, tax collection transition, and fund management",
      "date": "TBD"
    },
    "decisionsPending": [
      {
        "what": "Reports to Council on grant programs, tax collection transition, and fund management required by the ordinance",
        "who": "Office of Arts & Culture and Revenue Division",
        "due": "December 2026 through January 2027 (per Ordinance 192185)"
      },
      {
        "what": "Possible further reforms to the tax's collection process, which Council President Jamie Dunphy said he is open to",
        "who": "Portland City Council",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "2012 voter-approved Arts Education and Access Fund ballot measure",
      "March 2026 Portland City Auditor report on the Arts Tax"
    ],
    "sources": [
      {
        "label": "OPB: Portland votes to increase arts tax, allow fewer people to pay (May 27, 2026)",
        "url": "https://www.opb.org/article/2026/05/27/portland-votes-to-increase-arts-tax-allow-fewer-people-to-pay/"
      },
      {
        "label": "Ordinance 192185 (Portland.gov)",
        "url": "https://www.portland.gov/council/documents/ordinance/passed/192185"
      },
      {
        "label": "Portland City Auditor: Arts Tax — City needs to make improvements to deliver on voter approved commitments (March 18, 2026)",
        "url": "https://www.portland.gov/auditor/audit-services/news/2026/3/18/arts-tax-city-needs-make-improvements-deliver-voter-approved"
      },
      {
        "label": "About the Arts Access Fund (Portland.gov)",
        "url": "https://www.portland.gov/arts/arts-access-fund/about-arts-access-fund"
      }
    ]
  },
  {
    "slug": "moda-center-renovation-blazers-lease",
    "title": "Moda Center Renovation & Trail Blazers Lease",
    "owner": "Office of the City Administrator (Spectator Venues & Visitor Activities Fund)",
    "category": "major-projects",
    "summary": "On August 12, 2026, Portland City Council voted 8-4 to adopt Resolution 2026-280, a non-binding term sheet with Rip City Management LLC and Trail Blazers Holdings LLC for a publicly funded Moda Center renovation tied to a minimum 20-year lease that keeps the Trail Blazers playing all home games in Portland. Amended terms include $3.17 million in annual rent (3% escalation), a $3 million annual tax-equivalent payment (5% escalation), labor peace agreements for arena workers, and a community benefits plan, with the city retaining permanent ownership of the arena.",
    "stage": "in-negotiation",
    "funding": "City: $120 million upfront plus up to $275 million over the 20-year lease for eligible arena projects (Resolution 2026-280); the city has not finalized its funding sources — options on the record include roughly $50 million in estimated tax proceeds from the team's sale, the Portland Clean Energy Fund, and Prosper Portland reserves, each requiring separate board approval. State: up to $365 million in bonds authorized by SB 1501 (passed March 2026, Senate 24-6 / House 42-14). Multnomah County: funding framework of up to $101.6 million approved August 2026, funded through the car rental tax. Total public package reported at nearly $600 million.",
    "lastAction": {
      "date": "2026-08-12",
      "what": "City Council adopted Resolution 2026-280 as amended, 8-4 (nays: Avalos, Green, Koyama Lane, Morillo), approving the non-binding term sheet and directing the administration to negotiate definitive documents with team ownership, the state, and the county. Amendments set annual rent at $3.17 million and the annual tax-equivalent payment at $3 million."
    },
    "nextMilestone": {
      "date": "2026-12-31",
      "label": "Council vote on binding lease, renovation, and operating agreements — expected December 2026, with a December 31, 2026 deadline set in the resolution"
    },
    "decisionsPending": [
      {
        "what": "Approval of final binding lease, renovation, and operating agreements (term sheet is non-binding; negotiations continue through fall 2026)",
        "who": "Portland City Council",
        "due": "2026-12-31"
      },
      {
        "what": "Selection and approval of the city's funding sources for its $120 million contribution; Portland Clean Energy Fund and Prosper Portland boards say they need detailed renovation plans, which the Blazers have not yet provided, before approving disbursement",
        "who": "City of Portland; PCEF committee; Prosper Portland board",
        "due": "TBD"
      },
      {
        "what": "Creation of a joint state-city authority to oversee the arena, a condition of the SB 1501 state bond authorization",
        "who": "State of Oregon and City of Portland",
        "due": "TBD"
      },
      {
        "what": "State bond sale to fund the $365 million share; the state's reported target is spring 2027 to complete construction ahead of the 2030 NCAA Women's Final Four",
        "who": "State of Oregon",
        "due": "Spring 2027 (reported target)"
      }
    ],
    "dependencies": [
      "SB 1501 conditions: finalized team sale (NBA Board of Governors approved the $4.25 billion sale to a Tom Dundon-led group March 30, 2026; majority stake closed March 31, 2026), a joint state-city oversight authority, a minimum 20-year lease, and financial commitments from the city and Multnomah County",
      "Multnomah County funding framework of up to $101.6 million (approved August 2026)",
      "Detailed renovation plans from the Trail Blazers, which city funding boards say they need before approving disbursements",
      "Companion Resolution 2026-285 development-partner process for adjacent city-owned parcels runs on a timeline concurrent with the lease negotiations"
    ],
    "sources": [
      {
        "label": "Portland.gov — Resolution 2026-280 (Moda Center term sheet)",
        "url": "https://www.portland.gov/council/documents/resolution/moda-term-sheet-0"
      },
      {
        "label": "OPB — Portland City Council approves term sheet for Moda Center renovations (Aug 12, 2026)",
        "url": "https://www.opb.org/article/2026/08/12/portland-city-council-approves-moda-center-renovations-term-sheet/"
      },
      {
        "label": "Willamette Week — Council Approves Moda Center Term Sheet to Kick Off Negotiations With Blazers (Aug 12, 2026)",
        "url": "https://www.wweek.com/news/city/2026/08/12/council-approves-moda-center-term-sheet-to-kick-off-negotiations-with-blazers/"
      },
      {
        "label": "KTVZ/KGW — Portland City Council votes 8-4 to approve $120M Moda Center renovation term sheet",
        "url": "https://ktvz.com/news/top-stories/2026/08/12/portland-city-council-votes-8-4-to-approve-120m-moda-center-renovation-term-sheet/"
      },
      {
        "label": "OPB — 5 things to know before Wednesday's vote on Moda Center negotiations (Aug 10, 2026)",
        "url": "https://www.opb.org/article/2026/08/10/moda-center-portland-oregon-sports-baskeball-trail-blazers/"
      },
      {
        "label": "KGW — Oregon lawmakers pass $365M funding bill for Moda Center renovations (SB 1501)",
        "url": "https://www.kgw.com/article/news/politics/oregon-house-legislature-pass-moda-center-fund-bill-365-million/283-3cbda423-a745-4d0a-86df-b0de2d8d8d4f"
      },
      {
        "label": "Willamette Week — As County Passes Funding for Moda Center Renovation, City Tussles Over Term Sheet (Aug 6, 2026)",
        "url": "https://www.wweek.com/news/city/2026/08/06/as-county-passes-funding-for-moda-center-renovation-city-tussles-over-term-sheet/"
      },
      {
        "label": "ESPN — NBA approves Trail Blazers' sale to group led by Tom Dundon (Mar 30, 2026)",
        "url": "https://www.espn.com/nba/story/_/id/48350814/nba-board-governors-approves-portland-trail-blazers-sale-group-led-tom-dundon"
      }
    ]
  },
  {
    "slug": "rose-quarter-district-development-partner",
    "title": "Rose Quarter District Redevelopment — City-Owned Parcels near Moda Center and Veterans Memorial Coliseum",
    "owner": "Office of the City Administrator",
    "category": "major-projects",
    "summary": "Resolution 2026-285 directs the City Administrator to initiate a process to identify and negotiate with a development partner for ten city-owned Rose Quarter parcels surrounding Moda Center and Veterans Memorial Coliseum, including two parking garages north of the arena and a green space south of it, with negotiations to be prioritized with the nonprofit Albina Vision Trust. The City Life Committee approved the amended resolution 5-0 on August 11, 2026, on a timeline concurrent with the Moda Center lease negotiations; a full council vote date has not yet been set.",
    "stage": "decision-pending",
    "lastAction": {
      "date": "2026-08-11",
      "what": "City Life Committee unanimously approved the amended Resolution 2026-285 (5-0) and referred it to the full City Council with a recommendation for adoption. The resolution was co-introduced by District 2 Councilors Elana Pirtle-Guiney, Sameer Kanal, and Dan Ryan."
    },
    "nextMilestone": {
      "date": "TBD",
      "label": "Formal first reading and full City Council vote, at a date to be set by the Council President"
    },
    "decisionsPending": [
      {
        "what": "Full council adoption of Resolution 2026-285 naming a development-partner process for the Rose Quarter parcels; Councilor Morillo has raised on-record concerns about giving sole preference to one nonprofit",
        "who": "Portland City Council",
        "due": "TBD"
      },
      {
        "what": "Negotiation of binding development agreements with the selected partner; per the committee-approved resolution, the process must conclude within 12 months of negotiations starting, with binding agreements returning to council on a timeline concurrent with the Moda Center lease (anticipated by December 31, 2026)",
        "who": "City Administrator; Portland City Council",
        "due": "TBD"
      }
    ],
    "dependencies": [
      "Moda Center lease negotiations under Resolution 2026-280 — the development-partner process is set to run concurrent with finalizing the long-term lease; the Blazers' current negotiations cover the arena and directly adjacent buildings, and the team has expressed no interest in developing the northern and southern parcels",
      "Albina Vision Trust meeting resolution requirements: demonstrated real estate financing experience, ability to secure significant investment, and commitment to advancing the public interest",
      "Coordination with broader Lower Albina efforts documented in the resolution materials: ODOT's I-5 Rose Quarter Transportation Corridor project, Broadway/Weidler Main Street Improvements, Albina Vision Trust's redevelopment of the Portland Public Schools Prophet Education Center site, and the Reconnecting Albina Planning Project"
    ],
    "sources": [
      {
        "label": "Portland.gov — Resolution 2026-285 (development partner for city-owned properties adjacent to Moda Center)",
        "url": "https://www.portland.gov/council/documents/resolution/moda-center-development-partner-resolution"
      },
      {
        "label": "OPB — Portland councilors advance plan to develop city land adjacent to Moda Center (Aug 12, 2026)",
        "url": "https://www.opb.org/article/2026/08/12/portland-councilors-land-plan-moda-center/"
      },
      {
        "label": "Portland.gov — From Councilor Ryan's desk: August 14, 2026",
        "url": "https://www.portland.gov/council/districts/2/dan-ryan/news/2026/8/14/councilor-ryans-desk-august-14-2026"
      },
      {
        "label": "KOIN — City considers Albina Vision Trust to revitalize Moda Center area",
        "url": "https://www.koin.com/news/portland/nonprofit-albina-vision-trust-develop-moda-center/amp/"
      }
    ]
  }
];

/**
 * Sort key for a documented due value. ISO-prefixed dates ("2026-09-01",
 * "2026-08") sort chronologically; anything else ("Fall 2026", "TBD",
 * undefined) sorts after them, in original order.
 */
function dueSortKey(due?: string): number {
  if (!due) return Number.MAX_SAFE_INTEGER;
  const m = due.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return (
    Number(m[1]) * 10000 + Number(m[2] ?? "12") * 100 + Number(m[3] ?? "31")
  );
}

/** All documented pending decisions across the portfolio, dated ones first. */
export function pendingDecisions(
  initiatives: CedInitiative[] = CED_INITIATIVES,
): Array<InitiativeDecision & { initiative: CedInitiative }> {
  const rows = initiatives.flatMap((initiative) =>
    initiative.decisionsPending.map((d) => ({ ...d, initiative })),
  );
  return rows.sort((a, b) => dueSortKey(a.due) - dueSortKey(b.due));
}

export function initiativesByCategory(
  initiatives: CedInitiative[] = CED_INITIATIVES,
): Array<{ category: InitiativeCategory; label: string; items: CedInitiative[] }> {
  const order: InitiativeCategory[] = [
    "housing",
    "permitting",
    "climate",
    "economic-development",
    "arts-venues",
    "major-projects",
  ];
  return order
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: initiatives.filter((i) => i.category === category),
    }))
    .filter((g) => g.items.length > 0);
}
