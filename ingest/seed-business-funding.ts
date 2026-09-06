/**
 * seed-business-funding.ts
 *
 * Seeds the business funding finder for the Bold Coffee & Books demo:
 *   1. A curated catalog of funding opportunities relevant to a Portland
 *      coffee shop / bookstore (city, county, state, federal, private).
 *   2. Bold Coffee & Books as an unclaimed business profile (built from
 *      their public website) so the owner can sign in and claim it.
 *   3. Opportunity matches with fit scores and rationale, including one
 *      fully worked prefilled application draft.
 *
 * IMPORTANT: amounts, deadlines, and program availability are seeded from
 * research and marked needs_verification unless the program is statutory.
 * Verify each entry against the live source before demoing dollar figures
 * as fact or preparing a real application.
 *
 * Idempotent: opportunities and the business upsert by slug; matches for
 * the seeded business are replaced wholesale.
 *
 * Usage: npx tsx ingest/seed-business-funding.ts
 */

import postgres from "postgres";
import type { OpportunityEligibility } from "../src/lib/business";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();

const sql = postgres(DB_URL, { prepare: false, onnotice: () => {} });

// ── Opportunity catalog ─────────────────────────────────────────────────

/**
 * postgres.js's sql.json() accepts only object types that carry an index
 * signature, which interfaces never do. Re-mapping a shared interface through
 * this keeps src/lib as the single definition of the shape while producing a
 * structurally identical anonymous type the driver will take.
 */
type JsonSafe<T> = T extends (infer U)[]
  ? JsonSafe<U>[]
  : T extends object
    ? { [K in keyof T]: JsonSafe<T[K]> }
    : T;

interface OpportunitySeed {
  slug: string;
  name: string;
  funder: string;
  level: "city" | "county" | "state" | "federal" | "private";
  category: "grant" | "incentive" | "contest" | "tax_credit" | "technical_assistance" | "loan";
  amountMin: number | null;
  amountMax: number | null;
  /** Recurring money beats one-time money — the dashboard reports them apart. */
  valueType: "one_time" | "recurring_annual" | "per_unit";
  unitLabel?: string;
  effortLevel: 1 | 2 | 3 | 4 | 5;
  successProbability: "low" | "medium" | "high";
  deadline: string | null; // ISO date
  rolling: boolean;
  url: string | null;
  description: string;
  /**
   * The shape the matcher reads back out of the `eligibility` JSON column —
   * a structured geographic gate rather than free text, so an address can
   * actually be tested against it.
   */
  eligibility: JsonSafe<OpportunityEligibility>;
  verificationStatus: "verified" | "needs_verification";
  sourceNote: string;
}

const OPPORTUNITIES: OpportunitySeed[] = [
  // ── City of Portland ──
  {
    slug: "prosper-portland-repair-grant",
    valueType: "one_time",
    effortLevel: 2,
    successProbability: "medium",
    name: "Small Business Repair Grant",
    funder: "Prosper Portland",
    level: "city",
    category: "grant",
    amountMin: 1000,
    amountMax: 10000,
    deadline: null,
    rolling: true,
    url: "https://prosperportland.us/",
    description:
      "Reimbursement grants for Portland small businesses repairing storefront damage from vandalism or break-ins (windows, doors, locks, graffiti removal).",
    eligibility: {
      geography: { label: "City of Portland", cityOfPortlandOnly: true },
      businessTypes: ["retail", "food_service"],
      notes: "Must document repair costs; funding availability varies by cycle.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current funding round and cap at prosperportland.us.",
  },
  {
    slug: "prosper-portland-ibrn",
    valueType: "one_time",
    effortLevel: 1,
    successProbability: "high",
    name: "Inclusive Business Resource Network",
    funder: "Prosper Portland",
    level: "city",
    category: "technical_assistance",
    amountMin: null,
    amountMax: null,
    deadline: null,
    rolling: true,
    url: "https://prosperportland.us/portfolio-items/inclusive-business-resource-network/",
    description:
      "Free business advising, industry-specific technical assistance, and access to small grants and flexible capital through partner organizations, prioritizing entrepreneurs from underserved communities.",
    eligibility: {
      geography: { label: "City of Portland", cityOfPortlandOnly: true },
      notes: "Intake through partner organizations; no cost to participate.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Program is long-running; confirm current partner list.",
  },
  {
    slug: "prosper-prosperity-investment",
    valueType: "one_time",
    effortLevel: 4,
    successProbability: "medium",
    name: "Prosperity Investment Program",
    funder: "Prosper Portland",
    level: "city",
    category: "grant",
    amountMin: 10000,
    amountMax: 75000,
    deadline: null,
    rolling: true,
    url: "https://prosperportland.us/",
    description:
      "Matching, reimbursable grants for tenant and building improvements — storefronts, signage, lighting, mechanical systems, roofing, architecture and engineering. Covers up to 75% of approved costs against a 25% match. Only available inside a tax increment finance district, which is the whole reason this one has to be checked against the address rather than assumed.",
    eligibility: {
      geography: {
        label: "Tax increment finance districts only",
        cityOfPortlandOnly: true,
        requiresTifDistrict: true,
      },
      notes:
        "Work cannot begin before a grant agreement is executed. Landlord participation is usually required for building-wide systems.",
    },
    verificationStatus: "needs_verification",
    sourceNote:
      "Confirm current district list and match requirements with Prosper Portland before applying.",
  },
  {
    slug: "venture-portland-district-grants",
    valueType: "one_time",
    effortLevel: 3,
    successProbability: "medium",
    name: "Business District Activation Grants",
    funder: "Venture Portland (via your district association)",
    level: "city",
    category: "grant",
    amountMin: 1000,
    amountMax: 10000,
    deadline: null,
    rolling: false,
    url: "https://ventureportland.org/",
    description:
      "Grants for events, marketing, and district vitality projects. Funds flow through neighborhood business district associations rather than to businesses directly, so applications are strongest when a business anchors or co-hosts the activity.",
    eligibility: {
      geography: { label: "Portland business districts", cityOfPortlandOnly: true, requiresBusinessDistrict: true, requiresVenturePortlandMember: true },
      notes:
        "Applied for by or with the local business district association, not the business directly.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Which association applies depends on the address; membership decides whether the route is open at all.",
  },
  {
    slug: "pcef-small-business-energy",
    valueType: "one_time",
    effortLevel: 3,
    successProbability: "medium",
    name: "Clean Energy Upgrade Funding (PCEF-funded programs)",
    funder: "Portland Clean Energy Fund via community partners",
    level: "city",
    category: "grant",
    amountMin: 5000,
    amountMax: 50000,
    deadline: null,
    rolling: true,
    url: "https://www.portland.gov/bps/cleanenergy",
    description:
      "PCEF funds nonprofit-led programs that pay for energy efficiency and clean energy upgrades in small commercial spaces — HVAC, refrigeration, lighting, and heat pumps. Worth screening for any business with a significant equipment or heating load.",
    eligibility: {
      geography: { label: "City of Portland", cityOfPortlandOnly: true },
      notes: "Access is through funded partner programs, not direct application.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Identify the current PCEF-funded small business program operator.",
  },
  // ── Regional / county ──
  {
    slug: "energy-trust-business-incentives",
    valueType: "one_time",
    effortLevel: 1,
    successProbability: "high",
    name: "Commercial Energy Incentives",
    funder: "Energy Trust of Oregon",
    level: "county",
    category: "incentive",
    amountMin: 500,
    amountMax: 20000,
    deadline: null,
    rolling: true,
    url: "https://www.energytrust.org/commercial/",
    description:
      "Cash incentives for energy-efficient lighting, refrigeration, food service equipment, HVAC, and water heating in commercial spaces. Starts with a free walkthrough that identifies which of your existing equipment qualifies.",
    eligibility: {
      geography: { label: "PGE/Pacific Power/NW Natural service territory" },
      notes: "Incentive size depends on equipment; free walkthrough available.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Long-running program; confirm current incentive schedule.",
  },
  {
    slug: "racc-arts-grants",
    valueType: "recurring_annual",
    effortLevel: 4,
    successProbability: "medium",
    name: "Arts & Culture Project Grants",
    funder: "Regional Arts & Culture Council",
    level: "county",
    category: "grant",
    amountMin: 1500,
    amountMax: 7000,
    deadline: null,
    rolling: false,
    url: "https://racc.org/grants/",
    description:
      "Project grants for arts and culture programming in the Portland metro area — readings, workshops, performances, and exhibitions. Typically awarded via a sponsored project or partnership, with the business as venue and organizer.",
    eligibility: {
      geography: { label: "Multnomah, Washington, Clackamas counties" },
      missionTags: ["arts_culture", "community_events", "literacy", "youth"],
      notes:
        "Usually requires an individual artist or nonprofit applicant; the business can host/partner.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current cycle and whether a fiscal sponsor is needed.",
  },
  // ── State of Oregon ──
  {
    slug: "cobid-certification",
    valueType: "one_time",
    effortLevel: 2,
    successProbability: "high",
    name: "COBID Certification (WBE / ESB)",
    funder: "Oregon Certification Office for Business Inclusion & Diversity",
    level: "state",
    category: "technical_assistance",
    amountMin: null,
    amountMax: null,
    deadline: null,
    rolling: true,
    url: "https://www.oregon.gov/biz/programs/COBID/",
    description:
      "State certification as a Woman Business Enterprise and/or Emerging Small Business. Not money itself — it unlocks set-aside contracts with public agencies and priority in several state and city programs.",
    eligibility: {
      geography: { label: "Oregon" },
      ownershipAttributes: ["woman_owned"],
      notes: "WBE requires 51%+ ownership and control by a woman.",
    },
    verificationStatus: "verified",
    sourceNote: "Standing state program; certification is free.",
  },
  {
    slug: "oregon-sbdc-advising",
    valueType: "one_time",
    effortLevel: 1,
    successProbability: "high",
    name: "Small Business Development Center Advising",
    funder: "Oregon SBDC Network (PCC SBDC)",
    level: "state",
    category: "technical_assistance",
    amountMin: null,
    amountMax: null,
    deadline: null,
    rolling: true,
    url: "https://oregonsbdc.org/",
    description:
      "Free one-on-one business advising through Portland Community College's SBDC — financials, expansion planning, and help assembling grant and loan applications.",
    eligibility: { geography: { label: "Oregon" } },
    verificationStatus: "verified",
    sourceNote: "Standing SBA-funded program.",
  },
  {
    slug: "business-oregon-edlf",
    valueType: "one_time",
    effortLevel: 4,
    successProbability: "medium",
    name: "Entrepreneurial Development Loan Fund",
    funder: "Business Oregon",
    level: "state",
    category: "loan",
    amountMin: 10000,
    amountMax: 100000,
    deadline: null,
    rolling: true,
    url: "https://www.oregon.gov/biz/",
    description:
      "Direct state loans for small and emerging businesses that can't access traditional bank financing, with priority for women- and minority-owned businesses. A financing backstop for expansion (second location, build-out), not free money.",
    eligibility: {
      geography: { label: "Oregon" },
      ownershipAttributes: ["woman_owned", "minority_owned"],
      notes: "Loan, not a grant; favorable terms for priority applicants.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current loan cap and terms with Business Oregon.",
  },
  // ── Federal ──
  {
    slug: "wotc-tax-credit",
    valueType: "per_unit",
    unitLabel: "per eligible hire",
    effortLevel: 2,
    successProbability: "high",
    name: "Work Opportunity Tax Credit",
    funder: "IRS / Oregon Employment Department",
    level: "federal",
    category: "tax_credit",
    amountMin: 2400,
    amountMax: 9600,
    deadline: null,
    rolling: true,
    url: "https://www.irs.gov/businesses/small-businesses-self-employed/work-opportunity-tax-credit",
    description:
      "Federal tax credit of $2,400–$9,600 per eligible hire from target groups (veterans, SNAP recipients, long-term unemployed, and others). For a shop that hires from the community, this is recurring money most small employers never claim — certification is filed per-hire within 28 days.",
    eligibility: {
      notes: "Per-hire certification (Form 8850) filed with the state workforce agency.",
    },
    verificationStatus: "verified",
    sourceNote: "Statutory program; confirm current authorization period.",
  },
  {
    slug: "ada-disabled-access-credit",
    valueType: "recurring_annual",
    effortLevel: 1,
    successProbability: "high",
    name: "Disabled Access Credit (IRC §44)",
    funder: "IRS",
    level: "federal",
    category: "tax_credit",
    amountMin: null,
    amountMax: 5000,
    deadline: null,
    rolling: true,
    url: "https://www.irs.gov/forms-pubs/about-form-8826",
    description:
      "Federal tax credit covering 50% of accessibility expenditures between $250 and $10,250 per year (up to $5,000/yr) for small businesses. Ramps, door hardware, accessible restrooms, signage, and website accessibility work all commonly qualify.",
    eligibility: {
      notes: "Small businesses: ≤$1M revenue or ≤30 full-time employees.",
      maxEmployees: 30,
    },
    verificationStatus: "verified",
    sourceNote: "Statutory credit; applies to qualifying expenditures.",
  },
  {
    slug: "sba-wosb-certification",
    valueType: "one_time",
    effortLevel: 2,
    successProbability: "high",
    name: "Woman-Owned Small Business (WOSB) Certification",
    funder: "U.S. Small Business Administration",
    level: "federal",
    category: "technical_assistance",
    amountMin: null,
    amountMax: null,
    deadline: null,
    rolling: true,
    url: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/women-owned-small-business-federal-contract-program",
    description:
      "Free federal certification that opens set-aside contracting with federal agencies. Pairs with COBID at the state level.",
    eligibility: {
      ownershipAttributes: ["woman_owned"],
      notes: "51%+ woman-owned and controlled.",
    },
    verificationStatus: "verified",
    sourceNote: "Standing SBA program.",
  },
  // ── Private ──
  {
    slug: "amber-grant",
    valueType: "one_time",
    effortLevel: 1,
    successProbability: "low",
    name: "Amber Grant for Women",
    funder: "WomensNet",
    level: "private",
    category: "grant",
    amountMin: 10000,
    amountMax: 35000,
    deadline: null,
    rolling: true,
    url: "https://ambergrantsforwomen.com/",
    description:
      "$10,000 awarded monthly to a woman-owned business, with monthly winners eligible for a $25,000 year-end award. The application is short — describe the business and what the money would do — so the deciding factor is the strength of the story.",
    eligibility: {
      ownershipAttributes: ["woman_owned"],
      notes: "Woman-owned or co-owned; $15 application fee; monthly cycles.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Long-running; confirm current award amounts and fee.",
  },
  {
    slug: "amex-backing-small",
    valueType: "one_time",
    effortLevel: 3,
    successProbability: "low",
    name: "Backing Small Businesses Grant",
    funder: "American Express + Main Street America",
    level: "private",
    category: "grant",
    amountMin: 10000,
    amountMax: 20000,
    deadline: null,
    rolling: false,
    url: "https://www.mainstreet.org/",
    description:
      "$10,000 grants (with larger enhancement grants for some recipients) to small businesses in historic commercial districts, awarded in annual cycles. Community-anchor businesses are the exact profile.",
    eligibility: {
      notes: "Annual cycle; eligibility tied to district and revenue size.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm the current year's cycle is running and its window.",
  },
  {
    slug: "binc-assistance",
    valueType: "one_time",
    effortLevel: 1,
    successProbability: "high",
    name: "Bookseller Emergency Assistance & Scholarships",
    funder: "Book Industry Charitable Foundation (Binc)",
    level: "private",
    category: "grant",
    amountMin: 500,
    amountMax: 10000,
    deadline: null,
    rolling: true,
    url: "https://www.bincfoundation.org/",
    description:
      "The book industry's own safety net: emergency financial assistance for bookstore owners and employees (medical, disaster, hardship) plus professional development scholarships. Every bookstore should be registered before they need it.",
    eligibility: {
      businessTypes: ["bookstore"],
      notes: "For bookstores and comic shops and their employees.",
    },
    verificationStatus: "verified",
    sourceNote: "Standing industry foundation.",
  },
  {
    slug: "comcast-rise",
    valueType: "one_time",
    effortLevel: 2,
    successProbability: "low",
    name: "Comcast RISE",
    funder: "Comcast",
    level: "private",
    category: "grant",
    amountMin: 5000,
    amountMax: 25000,
    deadline: null,
    rolling: false,
    url: "https://www.comcastrise.com/",
    description:
      "Grant packages combining cash, marketing services, media placements, and technology makeovers for small businesses, awarded in city cohorts.",
    eligibility: {
      notes: "Cohort-based; check whether Portland is in the current cycle.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm whether a Portland cohort is open this year.",
  },
  {
    slug: "fica-tip-credit",
    valueType: "recurring_annual",
    effortLevel: 1,
    successProbability: "high",
    name: "FICA Tip Credit (IRC §45B)",
    funder: "IRS",
    level: "federal",
    category: "tax_credit",
    amountMin: 1500,
    amountMax: 8000,
    deadline: null,
    rolling: true,
    url: "https://www.irs.gov/forms-pubs/about-form-8846",
    description:
      "Employers pay the 7.65% employer share of FICA on employee tips; this credit hands most of it back every year. For any business with meaningful tip volume it is pure recurring money, and it is one of the most commonly missed credits in food service — it only requires Form 8846 at tax time.",
    eligibility: {
      businessTypes: ["food_service"],
      notes:
        "Food and beverage establishments where tipping is customary. Value scales with tipped wages.",
    },
    verificationStatus: "verified",
    sourceNote: "Statutory credit; value estimate depends on actual tip volume.",
  },
  {
    slug: "secure-act-retirement-credit",
    valueType: "recurring_annual",
    effortLevel: 2,
    successProbability: "high",
    name: "Retirement Plan Startup Credit (SECURE 2.0)",
    funder: "IRS",
    level: "federal",
    category: "tax_credit",
    amountMin: 500,
    amountMax: 5000,
    deadline: null,
    rolling: true,
    url: "https://www.irs.gov/retirement-plans/retirement-plans-startup-costs-tax-credit",
    description:
      "Federal credit covering startup costs of a new employee retirement plan for up to three years, plus an additional credit for employer contributions. Oregon already requires most employers to offer a plan or register for OregonSaves — this turns a compliance obligation into a credit and a hiring advantage.",
    eligibility: {
      maxEmployees: 100,
      notes: "Employers with ≤100 employees who had no plan in the prior three years.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current credit percentages and employee-count tiers with a CPA.",
  },
  {
    slug: "worksource-ojt-reimbursement",
    valueType: "per_unit",
    unitLabel: "per trainee hired",
    effortLevel: 3,
    successProbability: "medium",
    name: "On-the-Job Training Wage Reimbursement",
    funder: "WorkSource Oregon / Worksystems Inc.",
    level: "state",
    category: "incentive",
    amountMin: 3000,
    amountMax: 12000,
    deadline: null,
    rolling: true,
    url: "https://www.worksystems.org/",
    description:
      "Workforce boards reimburse a share of wages (commonly around half) while a new hire is being trained. In effect someone else pays part of payroll — the single biggest controllable expense after rent — for the first months of an employee's tenure. Must be arranged before the hire starts.",
    eligibility: {
      geography: { label: "Multnomah/Washington County workforce area" },
      notes:
        "Agreement must be in place BEFORE the employee starts; candidate typically referred through WorkSource.",
    },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current reimbursement rate and open contracts with Worksystems.",
  },
  {
    slug: "publisher-coop-marketing",
    valueType: "recurring_annual",
    effortLevel: 2,
    successProbability: "high",
    name: "Publisher Co-op Marketing Funds",
    funder: "Publishers via ABA / direct rep relationships",
    level: "private",
    category: "incentive",
    amountMin: 2000,
    amountMax: 15000,
    deadline: null,
    rolling: true,
    url: "https://www.bookweb.org/",
    description:
      "Publishers reimburse bookstores for advertising, author events, displays, and newsletter placement featuring their titles — money that already exists for stores that ask and file the paperwork. Most independents leave the majority of it unclaimed.",
    eligibility: {
      businessTypes: ["bookstore"],
      notes:
        "Requires tracking eligible events/ads and submitting claims per publisher's program; ABA membership helps.",
    },
    verificationStatus: "needs_verification",
    sourceNote:
      "Value depends on publisher mix and event volume — confirm with Ali which reps/programs Bold already uses.",
  },
  {
    slug: "sponsored-community-programming",
    valueType: "recurring_annual",
    effortLevel: 3,
    successProbability: "medium",
    name: "Corporate & Foundation Event Sponsorship",
    funder: "Local employers, foundations, and employee resource groups",
    level: "private",
    category: "grant",
    amountMin: 3000,
    amountMax: 25000,
    deadline: null,
    rolling: true,
    url: null,
    description:
      "Local employers, hospital systems, universities, and their employee resource groups hold real budgets for community, literacy, and cultural sponsorship. For a business already producing that programming and absorbing the cost, PCL packages the event series into a sponsorship prospectus and pitches it — the events don't change, someone else pays for them.",
    eligibility: {
      geography: { label: "Portland metro" },
      missionTags: [
        "arts_culture",
        "community_events",
        "literacy",
        "youth",
        "safe_space",
      ],
      notes:
        "Not an application form — a prospectus plus outreach. Recurring annual sponsorships are the goal, not one-off gifts.",
    },
    verificationStatus: "needs_verification",
    sourceNote:
      "Value estimate based on comparable community venue sponsorships; requires PCL outreach to confirm.",
  },
  {
    slug: "verizon-digital-ready",
    valueType: "one_time",
    effortLevel: 2,
    successProbability: "medium",
    name: "Verizon Small Business Digital Ready Grants",
    funder: "Verizon",
    level: "private",
    category: "grant",
    amountMin: 10000,
    amountMax: 10000,
    deadline: null,
    rolling: false,
    url: "https://www.verizon.com/about/responsibility/digital-inclusion/small-business-training",
    description:
      "$10,000 grants for small businesses that complete free courses on the Digital Ready platform — a few hours of coursework unlocks each application round.",
    eligibility: { notes: "Requires completing platform courses before applying." },
    verificationStatus: "needs_verification",
    sourceNote: "Confirm current application round.",
  },
];

// ── Bold Coffee & Books profile ─────────────────────────────────────────
//
// Built from their public website. Employee count and entity details are
// placeholders the owners correct after claiming the profile.

const BOLD = {
  slug: "bold-coffee-and-books",
  name: "Bold Coffee & Books",
  entityType: null as string | null,
  naicsCode: "722515", // snack & nonalcoholic beverage bars; retail books secondary (459210)
  description:
    "Independent coffee shop and bookstore at SW 18th & Jefferson in Goose Hollow. Specialty coffee, curated books (children's through general fiction), catering, and private events. Hosts author readings, writing workshops, book clubs, and open mics with an explicit mission of creating safe spaces for people from marginalized communities.",
  addressStreet: "1755 SW Jefferson St",
  addressZip: "97205",
  neighborhood: "Goose Hollow",
  website: "https://boldcoffeeandbooks.com",
  employeeCount: null as number | null,
  ownershipAttributes: ["woman_owned"], // Ali co-owns; % ownership to confirm with owners
  missionTags: [
    "community_events",
    "arts_culture",
    "literacy",
    "safe_space",
    "accessibility",
  ],
};

// ── Matches: fit scores, rationale, and one worked application ──────────

interface MatchSeed {
  opportunitySlug: string;
  fitScore: number;
  fitRationale: string;
  status: string;
  applicationDraft?: {
    questions: { question: string; answer: string; source?: string }[];
  };
}

const MATCHES: MatchSeed[] = [
  {
    opportunitySlug: "amber-grant",
    fitScore: 92,
    status: "ready_for_review",
    fitRationale:
      "Woman co-owned (Ali, 20 years in the book industry), a strong community story, and a short application. Best first submission: high fit, low effort, monthly cycles.",
    applicationDraft: {
      questions: [
        {
          question: "Tell us about your business.",
          answer:
            "Bold Coffee & Books is an independent coffee shop and bookstore at SW 18th & Jefferson in Portland's Goose Hollow neighborhood, steps from the MAX line. Ali Shaw, co-owner, brings 20 years of book industry experience; her husband and co-owner Tim brings 22 years in counseling and social work. That pairing shapes everything: a carefully curated bookshop (children's through general fiction) inside a working café, run as a deliberate safe space for people from marginalized communities. We host author readings, writing workshops, book clubs, and open mics that center diverse voices, alongside specialty coffee, food, and catering.",
          source: "Business profile + public website",
        },
        {
          question: "What would you do with the grant money?",
          answer:
            "Three things, in order: (1) expand our community programming — paying visiting authors and workshop leaders so events centering marginalized voices are funded, not favors; (2) deepen our children's and YA inventory, the sections our neighborhood families ask for most; and (3) upgrade our event space (seating, sound, accessibility) so readings and open mics can grow without losing the intimacy that makes them work.",
          source: "Draft for owner review — edit to match current priorities",
        },
        {
          question: "How did you hear about the Amber Grant?",
          answer: "Portland Civic Lab's small business funding finder.",
          source: "Prefilled",
        },
      ],
    },
  },
  {
    opportunitySlug: "wotc-tax-credit",
    fitScore: 88,
    status: "qualified",
    fitRationale:
      "Recurring money, not a one-off: $2,400–$9,600 per eligible hire. Most cafés never file the 28-day certification. Worth setting up as standard hiring paperwork.",
  },
  {
    opportunitySlug: "publisher-coop-marketing",
    fitScore: 94,
    status: "in_prep",
    fitRationale:
      "The highest-value thing on this list that isn't a grant. Bold already runs the qualifying events — this is money publishers have budgeted and most stores never claim. Ali's 20 years of rep relationships make it a short conversation, and it repeats every year.",
  },
  {
    opportunitySlug: "fica-tip-credit",
    fitScore: 90,
    status: "qualified",
    fitRationale:
      "One form at tax time (8846) returns the employer FICA paid on tips, every year. If Bold's accountant isn't already filing it, this is the cheapest recurring dollar in the entire list.",
  },
  {
    opportunitySlug: "worksource-ojt-reimbursement",
    fitScore: 84,
    status: "identified",
    fitRationale:
      "Payroll is expense #2. This reimburses a share of wages during training — but the agreement must be signed BEFORE the hire starts, so PCL sets it up now and it's ready the next time Bold hires.",
  },
  {
    opportunitySlug: "sponsored-community-programming",
    fitScore: 83,
    status: "identified",
    fitRationale:
      "Bold currently absorbs the cost of its own community programming. Local employers and foundations fund exactly this. PCL builds the sponsorship prospectus from the existing event calendar and pitches it — the events don't change, someone else pays.",
  },
  {
    opportunitySlug: "secure-act-retirement-credit",
    fitScore: 76,
    status: "identified",
    fitRationale:
      "Oregon already requires a retirement plan or OregonSaves registration. This credit covers the startup cost for three years — turning a compliance chore into money back and a real hiring advantage over other cafés.",
  },
  {
    opportunitySlug: "cobid-certification",
    fitScore: 85,
    status: "qualified",
    fitRationale:
      "If Ali holds 51%+ ownership, WBE certification is free and unlocks set-aside catering contracts with public agencies — plus priority in several other programs in this list.",
  },
  {
    opportunitySlug: "energy-trust-business-incentives",
    fitScore: 82,
    status: "qualified",
    fitRationale:
      "Espresso equipment, refrigeration, and dishwashing are exactly what Energy Trust incentivizes. Starts with a free walkthrough — no application risk.",
  },
  {
    opportunitySlug: "ada-disabled-access-credit",
    fitScore: 80,
    status: "identified",
    fitRationale:
      "Bold already invests in ADA accessibility. Future accessibility spending (up to $10,250/yr) can be half-covered by this credit — a note for the accountant, prepared by PCL.",
  },
  {
    opportunitySlug: "binc-assistance",
    fitScore: 78,
    status: "identified",
    fitRationale:
      "The book industry's safety net. Registering costs nothing and covers both owners and staff if hardship ever hits.",
  },
  {
    opportunitySlug: "racc-arts-grants",
    fitScore: 74,
    status: "identified",
    fitRationale:
      "The reading series and open mics are fundable arts programming. Likely route: partner with a featured artist or fiscal sponsor, with Bold as venue and organizer.",
  },
  {
    opportunitySlug: "amex-backing-small",
    fitScore: 72,
    status: "identified",
    fitRationale:
      "Community-anchor small businesses are this program's exact profile. Annual cycle — PCL watches the window and preps the application when it opens.",
  },
  {
    opportunitySlug: "prosper-portland-ibrn",
    fitScore: 70,
    status: "identified",
    fitRationale:
      "Free advising plus a door into partner-administered small grants and flexible capital. Low effort to enroll.",
  },
  {
    opportunitySlug: "verizon-digital-ready",
    fitScore: 65,
    status: "identified",
    fitRationale:
      "$10k for a few hours of coursework when a round is open. PCL tracks the rounds.",
  },
  {
    opportunitySlug: "pcef-small-business-energy",
    fitScore: 62,
    status: "identified",
    fitRationale:
      "Larger dollars than Energy Trust if a PCEF-funded program covers Goose Hollow commercial spaces — PCL is identifying the current program operator.",
  },
  {
    opportunitySlug: "venture-portland-district-grants",
    fitScore: 60,
    status: "identified",
    fitRationale:
      "District-level events money. Bold's existing event calendar makes it the natural anchor for a Goose Hollow district application.",
  },
  {
    opportunitySlug: "comcast-rise",
    fitScore: 55,
    status: "identified",
    fitRationale:
      "Cash plus marketing package if Portland is in the current cohort — PCL checks each cycle.",
  },
  {
    opportunitySlug: "sba-wosb-certification",
    fitScore: 52,
    status: "identified",
    fitRationale:
      "Free federal counterpart to COBID. Only worth it if federal catering/contracting is interesting — bundled with the COBID paperwork if so.",
  },
  {
    opportunitySlug: "business-oregon-edlf",
    fitScore: 45,
    status: "identified",
    fitRationale:
      "A loan, not a grant — flagged as the financing backstop if an expansion (second location, build-out) is ever on the table.",
  },
  {
    opportunitySlug: "prosper-portland-repair-grant",
    fitScore: 40,
    status: "identified",
    fitRationale:
      "Only relevant after storefront damage — but knowing it exists the day a window breaks is worth several thousand dollars.",
  },
];

// ── Seed ────────────────────────────────────────────────────────────────

/**
 * Opportunity rows are shared by every business, so their descriptions must
 * describe the *program* only. Anything about a particular business belongs
 * in that business's fit_rationale. (An early version of this seed described
 * several programs in terms of Bold Coffee & Books, which then showed up on
 * an unrelated business's dashboard.)
 */
function assertDescriptionsAreBusinessAgnostic() {
  const named = /\b(bold|ali'?s|tim'?s)\b/i;
  const offenders = OPPORTUNITIES.filter(
    (o) => named.test(o.description) || named.test(o.name)
  );
  if (offenders.length > 0) {
    throw new Error(
      `Opportunity descriptions must not name a specific business. Fix: ${offenders
        .map((o) => o.slug)
        .join(", ")}`
    );
  }
}

async function main() {
  assertDescriptionsAreBusinessAgnostic();
  console.log(`Seeding ${OPPORTUNITIES.length} funding opportunities...`);
  for (const o of OPPORTUNITIES) {
    await sql`
      INSERT INTO funding_opportunities (
        slug, name, funder, level, category, amount_min, amount_max,
        value_type, unit_label, effort_level, success_probability,
        deadline, rolling, url, description, eligibility,
        verification_status, source_note, updated_at
      ) VALUES (
        ${o.slug}, ${o.name}, ${o.funder}, ${o.level}, ${o.category},
        ${o.amountMin}, ${o.amountMax},
        ${o.valueType}, ${o.unitLabel ?? null}, ${o.effortLevel},
        ${o.successProbability},
        ${o.deadline}, ${o.rolling},
        ${o.url}, ${o.description}, ${sql.json(o.eligibility)},
        ${o.verificationStatus}, ${o.sourceNote}, now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        funder = EXCLUDED.funder,
        level = EXCLUDED.level,
        category = EXCLUDED.category,
        amount_min = EXCLUDED.amount_min,
        amount_max = EXCLUDED.amount_max,
        value_type = EXCLUDED.value_type,
        unit_label = EXCLUDED.unit_label,
        effort_level = EXCLUDED.effort_level,
        success_probability = EXCLUDED.success_probability,
        deadline = EXCLUDED.deadline,
        rolling = EXCLUDED.rolling,
        url = EXCLUDED.url,
        description = EXCLUDED.description,
        eligibility = EXCLUDED.eligibility,
        verification_status = EXCLUDED.verification_status,
        source_note = EXCLUDED.source_note,
        updated_at = now()
    `;
  }

  console.log("Seeding Bold Coffee & Books profile (unclaimed)...");
  const bizRows = await sql`
    INSERT INTO businesses (
      slug, name, entity_type, naics_code, description, address_street,
      address_zip, neighborhood, website, employee_count,
      ownership_attributes, mission_tags, claimed
    ) VALUES (
      ${BOLD.slug}, ${BOLD.name}, ${BOLD.entityType}, ${BOLD.naicsCode},
      ${BOLD.description}, ${BOLD.addressStreet}, ${BOLD.addressZip},
      ${BOLD.neighborhood}, ${BOLD.website}, ${BOLD.employeeCount},
      ${sql.json(BOLD.ownershipAttributes)}, ${sql.json(BOLD.missionTags)},
      false
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      naics_code = EXCLUDED.naics_code,
      description = EXCLUDED.description,
      address_street = EXCLUDED.address_street,
      address_zip = EXCLUDED.address_zip,
      neighborhood = EXCLUDED.neighborhood,
      website = EXCLUDED.website,
      ownership_attributes = EXCLUDED.ownership_attributes,
      mission_tags = EXCLUDED.mission_tags,
      updated_at = now()
    RETURNING id
  `;
  const businessId = bizRows[0].id as number;

  console.log(`Replacing matches for business ${businessId}...`);
  await sql`DELETE FROM opportunity_matches WHERE business_id = ${businessId}`;
  for (const m of MATCHES) {
    const opp = await sql`
      SELECT id FROM funding_opportunities WHERE slug = ${m.opportunitySlug}
    `;
    if (opp.length === 0) {
      console.warn(`  ! opportunity not found: ${m.opportunitySlug}`);
      continue;
    }
    await sql`
      INSERT INTO opportunity_matches (
        business_id, opportunity_id, fit_score, fit_rationale, status,
        application_draft
      ) VALUES (
        ${businessId}, ${opp[0].id}, ${m.fitScore}, ${m.fitRationale},
        ${m.status},
        ${m.applicationDraft ? sql.json(m.applicationDraft) : null}
      )
    `;
  }

  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM funding_opportunities)::int AS opportunities,
      (SELECT COUNT(*) FROM opportunity_matches WHERE business_id = ${businessId})::int AS matches
  `;
  const value = await sql`
    SELECT
      SUM(CASE WHEN fo.value_type = 'recurring_annual'
               THEN COALESCE(fo.amount_max, fo.amount_min, 0) ELSE 0 END)::int AS recurring,
      SUM(COALESCE(fo.amount_max, fo.amount_min, 0))::int AS first_year
    FROM opportunity_matches om
    JOIN funding_opportunities fo ON fo.id = om.opportunity_id
    WHERE om.business_id = ${businessId}
  `;
  console.log(
    `Done: ${counts[0].opportunities} opportunities, ${counts[0].matches} matches for ${BOLD.name}.`
  );
  console.log(
    `  First-year potential (upper bound): $${(value[0].first_year ?? 0).toLocaleString()}`
  );
  console.log(
    `  Recurring annual (upper bound):     $${(value[0].recurring ?? 0).toLocaleString()}`
  );
  console.log(
    "  NOTE: verify every needs_verification entry against its live source before showing these numbers to an owner."
  );
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
