// ---------------------------------------------------------------------------
// Portland Commons Dashboard — Data Source Status Registry
// ---------------------------------------------------------------------------
//
// This module exports the status of each data source so the dashboard can
// display "LIVE DATA" vs "ESTIMATED" badges on headline cards and detail panels.
//
// Statuses:
//   LIVE           — Connected to live API, data refreshes automatically
//   LIVE_PARTIAL   — Some metrics live, others still mock
//   MOCK           — All data is fabricated for demonstration
//   NEEDS_API_KEY  — Free API available, just needs env var
//   NEEDS_PRR      — Requires a public records request
//   NEEDS_DOWNLOAD — Free data available for download (CSV, etc.)
//   NEEDS_SUB      — Requires paid subscription
//   STATIC         — Computed from published rates, no live feed
//   INTERNAL       — Will come from our own system (PCB registry)
//   OFFLINE        — Data source permanently unavailable
//   DATA_NEEDED    — Category exists but no data sources connected yet

import type { QuestionId } from "@/types/dashboard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataSourceStatus =
  | "LIVE"
  | "LIVE_PARTIAL"
  | "MOCK"
  | "NEEDS_API_KEY"
  | "NEEDS_PRR"
  | "NEEDS_DOWNLOAD"
  | "NEEDS_SUB"
  | "STATIC"
  | "INTERNAL"
  | "OFFLINE"
  | "DATA_NEEDED";

export interface DataSource {
  /** Human-readable name */
  name: string;
  /** Current connection status */
  status: DataSourceStatus;
  /** Short explanation for the user */
  statusLabel: string;
  /** Where the data comes from */
  provider: string;
  /** What is blocking this from being LIVE? */
  blocker?: string;
  /** Environment variable needed (if applicable) */
  envVar?: string;
}

export interface QuestionDataStatus {
  /** The question this applies to */
  questionId: QuestionId;
  /** Overall status for the headline card badge */
  overallStatus: DataSourceStatus;
  /** Label shown to users on the card */
  badgeLabel: string;
  /** Tooltip or longer description */
  badgeTooltip: string;
  /** Individual data sources powering this question */
  sources: DataSource[];
}

// ---------------------------------------------------------------------------
// Helper — check env vars at runtime
// ---------------------------------------------------------------------------

function hasEnvVar(name: string): boolean {
  if (typeof process !== "undefined" && process.env) {
    return !!process.env[name];
  }
  return false;
}

// ---------------------------------------------------------------------------
// Source Definitions — 10 Civic Dashboard Categories
// ---------------------------------------------------------------------------

export const QUESTION_DATA_STATUS: Record<QuestionId, QuestionDataStatus> = {
  // ── Housing ───────────────────────────────────────────────────────────
  housing: {
    questionId: "housing",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Building permits are live from ArcGIS. Median rent data uses estimates (Zillow ZORI CSV available for free download).",
    sources: [
      {
        name: "Building Permits (BDS)",
        status: "LIVE",
        statusLabel: "Live data",
        provider: "Portland Permitting & Development via ArcGIS",
      },
      {
        name: "Median Rent (Zillow ZORI)",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Free CSV download needed",
        provider: "Zillow Research",
        blocker:
          "Download from zillow.com/research/data/ — filter Portland metro row",
      },
    ],
  },

  // ── Homelessness ──────────────────────────────────────────────────────
  homelessness: {
    questionId: "homelessness",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "Homelessness data requires JOHS shelter reports, HUD PIT counts, and Multnomah County behavioral health data.",
    sources: [
      {
        name: "JOHS Shelter Data",
        status: "NEEDS_PRR",
        statusLabel: "Data sharing agreement needed",
        provider: "Joint Office of Homeless Services",
        blocker: "Request data sharing agreement with JOHS",
      },
      {
        name: "HUD Point-in-Time Count",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Annual download needed",
        provider: "HUD Exchange",
        blocker: "Download from hudexchange.info/programs/coc/",
      },
      {
        name: "Behavioral Health Data",
        status: "NEEDS_PRR",
        statusLabel: "Public records request needed",
        provider: "Multnomah County Health Department",
        blocker: "File PRR with Multnomah County",
      },
    ],
  },

  // ── Public Safety ─────────────────────────────────────────────────────
  safety: {
    questionId: "safety",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Crime grid data is live from ArcGIS. 911 response times are estimated (require BOEC public records request).",
    sources: [
      {
        name: "Crime Grid Data",
        status: "LIVE",
        statusLabel: "Live data",
        provider: "Portland Police Bureau via ArcGIS",
      },
      {
        name: "911 Response Times",
        status: "NEEDS_PRR",
        statusLabel: "Public records request needed",
        provider: "Bureau of Emergency Communications (BOEC)",
        blocker: "File PRR to BOEC for monthly Priority 1 response medians",
      },
      {
        name: "PPB Crime CSVs",
        status: "NEEDS_API_KEY",
        statusLabel: "Needs investigation",
        provider: "Portland Police Bureau Open Data",
        blocker: "Email ppbopendata@police.portlandoregon.gov",
      },
    ],
  },

  // ── Transportation ────────────────────────────────────────────────────
  transportation: {
    questionId: "transportation",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "TriMet route/stop data is in DB. Ridership trends, crash data, and commute mode share still needed.",
    sources: [
      {
        name: "TriMet GTFS Routes & Stops",
        status: "LIVE",
        statusLabel: "Live data (89 routes, 6,399 stops)",
        provider: "TriMet via GTFS",
      },
      {
        name: "TriMet Ridership Trends",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Monthly reports available",
        provider: "TriMet",
        blocker: "Download monthly ridership reports from trimet.org",
      },
      {
        name: "PBOT Crash Data",
        status: "NEEDS_API_KEY",
        statusLabel: "ArcGIS layer available",
        provider: "Portland Bureau of Transportation",
        blocker: "Query Portland Maps ArcGIS for crash data",
      },
      {
        name: "Census Commute Mode Share",
        status: hasEnvVar("CENSUS_API_KEY") ? "LIVE" : "NEEDS_API_KEY",
        statusLabel: hasEnvVar("CENSUS_API_KEY") ? "Connected" : "API key needed",
        provider: "U.S. Census Bureau ACS",
        envVar: "CENSUS_API_KEY",
      },
    ],
  },

  // ── Education ─────────────────────────────────────────────────────────
  education: {
    questionId: "education",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "Education data requires Oregon Dept of Education downloads for PPS enrollment, test scores, and graduation rates.",
    sources: [
      {
        name: "PPS Enrollment Data",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Free download available",
        provider: "Oregon Dept of Education",
        blocker: "Download from ode.state.or.us/data/reportcard/",
      },
      {
        name: "Test Scores (3rd grade reading, 8th grade math)",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Free download available",
        provider: "Oregon Dept of Education",
        blocker: "Download ODE assessment data",
      },
      {
        name: "Graduation Rates",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Published annually",
        provider: "Oregon Dept of Education",
        blocker: "Download from ODE data portal",
      },
    ],
  },

  // ── Fiscal Health ─────────────────────────────────────────────────────
  fiscal: {
    questionId: "fiscal",
    overallStatus: "STATIC",
    badgeLabel: "Published rates",
    badgeTooltip:
      "Tax comparison is computed from published tax rates. Updated annually when new fiscal year begins. Budget and PERS data still needed.",
    sources: [
      {
        name: "Tax Rate Analysis",
        status: "STATIC",
        statusLabel: "Static analysis",
        provider: "Lincoln Institute / OR DOR / WA DOR / City budgets",
      },
      {
        name: "City Budget Data",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Annual download needed",
        provider: "Portland City Budget Office",
        blocker: "Download from portland.gov/cbo/budget",
      },
      {
        name: "PERS Liability Data",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Annual report available",
        provider: "Oregon PERS",
        blocker: "Download from oregon.gov/pers/",
      },
    ],
  },

  // ── Economy ───────────────────────────────────────────────────────────
  economy: {
    questionId: "economy",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Business registrations are live from Oregon SOS. Downtown vacancy data from quarterly reports. Foot traffic needs Placer.ai subscription.",
    sources: [
      {
        name: "Oregon SOS Business Registry",
        status: "LIVE",
        statusLabel: "Live data",
        provider: "Oregon Secretary of State via data.oregon.gov",
      },
      {
        name: "Commercial Vacancy Rate",
        status: "LIVE_PARTIAL",
        statusLabel: "Quarterly reports",
        provider: "CBRE/Colliers/JLL/Kidder Mathews",
      },
      {
        name: "BLS Employment & Wages",
        status: "NEEDS_API_KEY",
        statusLabel: "Free API available",
        provider: "Bureau of Labor Statistics",
        blocker: "Register at bls.gov/developers/",
        envVar: "BLS_API_KEY",
      },
      {
        name: "Foot Traffic",
        status: "NEEDS_SUB",
        statusLabel: "Subscription needed",
        provider: "Placer.ai",
        blocker: "$2K-$5K/mo subscription or partnership with Clean & Safe District",
      },
    ],
  },

  // ── Environment & Climate ─────────────────────────────────────────────
  environment: {
    questionId: "environment",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "Environment data requires BPS emissions inventory, DEQ air quality API, and Urban Forestry canopy data.",
    sources: [
      {
        name: "GHG Emissions Inventory",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Download available",
        provider: "Portland Bureau of Planning & Sustainability",
        blocker: "Download from portland.gov/bps/climate-action",
      },
      {
        name: "Air Quality Index",
        status: "NEEDS_API_KEY",
        statusLabel: "Free API key available",
        provider: "EPA AirNow",
        blocker: "Register at docs.airnow.gov",
        envVar: "AIRNOW_API_KEY",
      },
      {
        name: "Tree Canopy Coverage",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "GIS data available",
        provider: "Portland Urban Forestry",
        blocker: "Download from Portland Parks GIS",
      },
      {
        name: "Waste Diversion Rate",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Annual report available",
        provider: "Metro Regional Government",
        blocker: "Download from oregonmetro.gov",
      },
    ],
  },

  // ── Quality of Life ───────────────────────────────────────────────────
  quality: {
    questionId: "quality",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "Quality of life data requires Portland Parks ArcGIS, library data, and street condition ratings.",
    sources: [
      {
        name: "Park Access Data",
        status: "NEEDS_API_KEY",
        statusLabel: "ArcGIS layer available",
        provider: "Portland Parks & Recreation",
        blocker: "Query Portland Parks ArcGIS layers",
      },
      {
        name: "Library Hours & Visits",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Annual reports available",
        provider: "Multnomah County Library",
        blocker: "Download annual reports from multcolib.org",
      },
      {
        name: "Street Condition Ratings",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "PBOT data available",
        provider: "Portland Bureau of Transportation",
        blocker: "Download PBOT pavement condition index data",
      },
    ],
  },

  // ── Accountability ────────────────────────────────────────────────────
  accountability: {
    questionId: "accountability",
    overallStatus: "DATA_NEEDED",
    badgeLabel: "Data needed",
    badgeTooltip:
      "Accountability layer requires elected official database, ballot measure tracking, and campaign finance data from ORESTAR.",
    sources: [
      {
        name: "Elected Official Database",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Public records available",
        provider: "Portland City Council / portland.gov",
        blocker: "Compile from portland.gov/council",
      },
      {
        name: "Ballot Measure Tracking",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "Election results available",
        provider: "Multnomah County Elections",
        blocker: "Download from multco.us/elections",
      },
      {
        name: "Campaign Finance (ORESTAR)",
        status: "NEEDS_API_KEY",
        statusLabel: "Free portal available",
        provider: "Oregon Secretary of State",
        blocker: "Access via secure.sos.state.or.us/orestar/",
      },
    ],
  },

  // ── Legacy categories (kept for API route compatibility) ──────────────
  migration: {
    questionId: "migration",
    overallStatus: "MOCK",
    badgeLabel: "Estimated",
    badgeTooltip:
      "Migration data uses estimates. Water Bureau data requires a public records request; Census data requires an API key.",
    sources: [
      {
        name: "Water Bureau Activations",
        status: "NEEDS_PRR",
        statusLabel: "Public records request needed",
        provider: "Portland Water Bureau",
        blocker: "File PRR to PWBCustomerService@portlandoregon.gov",
      },
      {
        name: "Census Population Estimates",
        status: hasEnvVar("CENSUS_API_KEY") ? "LIVE" : "NEEDS_API_KEY",
        statusLabel: hasEnvVar("CENSUS_API_KEY")
          ? "Connected"
          : "API key needed",
        provider: "U.S. Census Bureau",
        envVar: "CENSUS_API_KEY",
        blocker: hasEnvVar("CENSUS_API_KEY")
          ? undefined
          : "Register at api.census.gov/data/key_signup.html",
      },
      {
        name: "IRS SOI Migration Flows",
        status: "NEEDS_DOWNLOAD",
        statusLabel: "CSV download needed",
        provider: "IRS Statistics of Income",
        blocker: "Download from irs.gov/statistics/soi-tax-stats-migration-data",
      },
    ],
  },

  business: {
    questionId: "business",
    overallStatus: "MOCK",
    badgeLabel: "Estimated",
    badgeTooltip:
      "Business formation data uses estimates. BLT registration data requires a public records request to the Revenue Division. CivicApps API is offline.",
    sources: [
      {
        name: "Revenue Division BLT Registrations",
        status: "NEEDS_PRR",
        statusLabel: "Public records request needed",
        provider: "Portland Revenue Division",
        blocker: "File PRR — call 503-823-5157",
      },
      {
        name: "CivicApps Business Licenses",
        status: "OFFLINE",
        statusLabel: "API permanently offline",
        provider: "CivicApps Portland",
        blocker: "API is down; use Revenue Division PRR instead",
      },
    ],
  },

  downtown: {
    questionId: "downtown",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Graffiti reports are live from ArcGIS. Foot traffic and vacancy data are estimated.",
    sources: [
      {
        name: "Foot Traffic",
        status: "NEEDS_SUB",
        statusLabel: "Subscription needed",
        provider: "Placer.ai",
        blocker: "$2K-$5K/mo subscription",
      },
      {
        name: "Commercial Vacancy Rate",
        status: "NEEDS_SUB",
        statusLabel: "Subscription needed",
        provider: "CoStar Group",
        blocker: "$500-$1.5K/mo subscription",
      },
      {
        name: "Graffiti Reports",
        status: "LIVE",
        statusLabel: "Live data",
        provider: "Portland BPS via ArcGIS",
      },
    ],
  },

  tax: {
    questionId: "tax",
    overallStatus: "STATIC",
    badgeLabel: "Published rates",
    badgeTooltip:
      "Tax comparison is computed from published tax rates. Updated annually when new fiscal year begins.",
    sources: [
      {
        name: "Tax Rate Analysis",
        status: "STATIC",
        statusLabel: "Static analysis",
        provider: "Lincoln Institute / OR DOR / WA DOR / City budgets",
      },
    ],
  },

  program: {
    questionId: "program",
    overallStatus: "INTERNAL",
    badgeLabel: "Preview data",
    badgeTooltip:
      "Program metrics use preview data. Will be live once the PCB registry system is operational.",
    sources: [
      {
        name: "PCB Registry",
        status: "INTERNAL",
        statusLabel: "Awaiting system launch",
        provider: "Portland Commons Program Office",
        blocker: "PCB application system not yet live",
      },
    ],
  },

  // ── Climate Accountability Platform ───────────────────────────────────
  climate: {
    questionId: "climate",
    overallStatus: "LIVE",
    badgeLabel: "Live data",
    badgeTooltip:
      "Climate Accountability Platform. All 43 workplan actions seeded from the CEW 2022-2025. Emissions data from BPS GHG inventory. PCEF from Climate Investment Plan.",
    sources: [
      {
        name: "Climate Emergency Workplan (2022-2025)",
        status: "LIVE",
        statusLabel: "Manually encoded",
        provider: "Portland Bureau of Planning & Sustainability",
      },
      {
        name: "BPS GHG Inventory (1990-2023)",
        status: "LIVE",
        statusLabel: "Manually encoded",
        provider: "Portland Bureau of Planning & Sustainability",
      },
      {
        name: "PCEF Climate Investment Plan",
        status: "LIVE",
        statusLabel: "Manually encoded",
        provider: "Portland Clean Energy Fund",
      },
      {
        name: "CEW Progress Reports (2023–2025)",
        status: "LIVE",
        statusLabel: "Status extracted",
        provider: "Portland Bureau of Planning & Sustainability",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Convenience exports
// ---------------------------------------------------------------------------

/** Get the overall badge status for a question */
export function getQuestionStatus(questionId: QuestionId): QuestionDataStatus {
  return QUESTION_DATA_STATUS[questionId];
}

/** Get a user-friendly badge variant for the UI */
export function getBadgeVariant(
  status: DataSourceStatus,
): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (status) {
    case "LIVE":
      return "success";
    case "LIVE_PARTIAL":
      return "info";
    case "STATIC":
      return "neutral";
    case "INTERNAL":
      return "info";
    case "MOCK":
    case "NEEDS_PRR":
    case "NEEDS_DOWNLOAD":
    case "NEEDS_API_KEY":
    case "DATA_NEEDED":
      return "warning";
    case "NEEDS_SUB":
    case "OFFLINE":
      return "danger";
    default:
      return "neutral";
  }
}

/** All questions that currently have at least some live data */
export const LIVE_QUESTIONS: QuestionId[] = (
  Object.values(QUESTION_DATA_STATUS) as QuestionDataStatus[]
)
  .filter((q) => q.overallStatus === "LIVE" || q.overallStatus === "LIVE_PARTIAL")
  .map((q) => q.questionId);

/** All questions that are fully estimated/mock */
export const MOCK_QUESTIONS: QuestionId[] = (
  Object.values(QUESTION_DATA_STATUS) as QuestionDataStatus[]
)
  .filter(
    (q) =>
      q.overallStatus === "MOCK" ||
      q.overallStatus === "NEEDS_PRR" ||
      q.overallStatus === "NEEDS_SUB" ||
      q.overallStatus === "DATA_NEEDED",
  )
  .map((q) => q.questionId);
