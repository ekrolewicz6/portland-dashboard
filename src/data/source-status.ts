// ---------------------------------------------------------------------------
// Portland Civic Lab Dashboard — Data Source Status Registry
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
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "PIT counts, statewide comparisons, racial disparities, shelter gap, IRP campsite reports, and SHS funding data loaded. JOHS shelter occupancy still needed.",
    sources: [
      {
        name: "PSU Statewide Homelessness Estimates (2025)",
        status: "LIVE",
        statusLabel: "36 counties seeded",
        provider: "PSU HRAC / Oregon Housing Alliance",
      },
      {
        name: "IRP Campsite Reports",
        status: "LIVE",
        statusLabel: "149K+ reports, daily sync",
        provider: "Portland Impact Reduction Program via ArcGIS",
      },
      {
        name: "HUD Point-in-Time Count",
        status: "LIVE",
        statusLabel: "2025 data loaded",
        provider: "HUD Exchange / Multnomah County",
      },
      {
        name: "SHS Funding & Placements",
        status: "LIVE",
        statusLabel: "FY2022-FY2025 loaded",
        provider: "Metro / Multnomah County",
      },
      {
        name: "JOHS Shelter Occupancy",
        status: "NEEDS_PRR",
        statusLabel: "Nightly occupancy data needed",
        provider: "Joint Office of Homeless Services",
        blocker: "Request data sharing agreement with JOHS",
      },
    ],
  },

  // ── Public Safety ─────────────────────────────────────────────────────
  safety: {
    questionId: "safety",
    overallStatus: "LIVE",
    badgeLabel: "Live data",
    badgeTooltip:
      "627K+ PPB NIBRS offense records through April 2026, daily sync from Tableau Public CSV. BOEC 911 answer-time trend is seeded from public Director's Reports.",
    sources: [
      {
        name: "PPB NIBRS Offense Data",
        status: "LIVE",
        statusLabel: "627K+ records through Apr 2026",
        provider: "Portland Police Bureau via Tableau Public CSV",
      },
      {
        name: "Downtown Safety Scorecard",
        status: "LIVE",
        statusLabel: "Live YoY comparison",
        provider: "Computed from PPB NIBRS data",
      },
      {
        name: "911 Response Times",
        status: "LIVE_PARTIAL",
        statusLabel: "Director's Report trend loaded",
        provider: "Bureau of Emergency Communications (BOEC)",
        blocker:
          "Operational dispatch-level response medians still require a public records request.",
      },
    ],
  },

  // ── Transportation ────────────────────────────────────────────────────
  transportation: {
    questionId: "transportation",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "TriMet ridership (20 years), Vision Zero crash data (11 years), Census commute mode share (8 years), GTFS routes/stops all loaded.",
    sources: [
      {
        name: "TriMet GTFS Routes & Stops",
        status: "LIVE",
        statusLabel: "89 routes, 6,399 stops",
        provider: "TriMet via GTFS",
      },
      {
        name: "TriMet Ridership (FY2006-FY2025)",
        status: "LIVE",
        statusLabel: "20 years loaded",
        provider: "TriMet Annual Performance Reports / NTD",
      },
      {
        name: "Vision Zero Crash Data (2015-2025)",
        status: "LIVE",
        statusLabel: "11 years loaded",
        provider: "PBOT Vision Zero / City Auditor / ODOT",
      },
      {
        name: "Census Commute Mode Share",
        status: "LIVE",
        statusLabel: "2015-2023 loaded from ACS",
        provider: "U.S. Census Bureau ACS Table B08301",
      },
    ],
  },

  // ── Education ─────────────────────────────────────────────────────────
  education: {
    questionId: "education",
    overallStatus: "LIVE",
    badgeLabel: "Live data",
    badgeTooltip:
      "Enrollment, graduation rates, and ELA/Math test scores loaded for all 6 Portland-area districts from Oregon Dept of Education.",
    sources: [
      {
        name: "Enrollment (6 districts, 5 years)",
        status: "LIVE",
        statusLabel: "630 rows loaded",
        provider: "Oregon Dept of Education Report Cards",
      },
      {
        name: "Graduation Rates (4yr + 5yr cohort)",
        status: "LIVE",
        statusLabel: "3 years loaded",
        provider: "Oregon Dept of Education",
      },
      {
        name: "ELA & Math Test Scores",
        status: "LIVE",
        statusLabel: "479 rows from ODE XLSX",
        provider: "Oregon Dept of Education Assessment Reports",
      },
    ],
  },

  // ── Fiscal Health ─────────────────────────────────────────────────────
  fiscal: {
    questionId: "fiscal",
    overallStatus: "STATIC",
    badgeLabel: "FiSC + rates",
    badgeTooltip:
      "Tax and fiscal-burden views combine Lincoln FiSC 2023 per-capita local-government finance data with published income-tax rates. Budget and PERS data still need deeper live integration.",
    sources: [
      {
        name: "Lincoln FiSC Local Fiscal Basket",
        status: "STATIC",
        statusLabel: "2023 update loaded",
        provider: "Lincoln Institute of Land Policy",
      },
      {
        name: "Income Tax Calculator",
        status: "STATIC",
        statusLabel: "Published-rate model",
        provider: "IRS / OR DOR / WA DOR / state tax agencies",
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
        name: "BLS QCEW Employment & Wages (MSA)",
        status: "LIVE",
        statusLabel: "26 quarters loaded (2019-2025)",
        provider: "Bureau of Labor Statistics QCEW CSV API",
      },
      {
        name: "Census Business Formation (CBP/SUSB)",
        status: "LIVE",
        statusLabel: "7 years loaded (2016-2022)",
        provider: "U.S. Census Bureau CBP + SUSB",
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

  // ── Economic Health (composite) ──────────────────────────────────────
  "economic-health": {
    questionId: "economic-health",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Composite scorecard. PBJ public-records pipeline + BLS QCEW + LAUS + BDS permits all live. Score weights are tunable.",
    sources: [
      {
        name: "PBJ Public Records (weekly)",
        status: "LIVE",
        statusLabel: "Weekly scrape — bankruptcies, lawsuits, liens, real estate, new businesses",
        provider: "Portland Business Journal (subscription)",
      },
      {
        name: "BLS QCEW Employment (Multnomah)",
        status: "LIVE",
        statusLabel: "Quarterly establishment + employment",
        provider: "Bureau of Labor Statistics QCEW",
      },
      {
        name: "BLS LAUS Unemployment (MSA)",
        status: "LIVE",
        statusLabel: "Monthly Portland MSA rate",
        provider: "Bureau of Labor Statistics LAUS",
      },
      {
        name: "Portland BDS Permits",
        status: "LIVE",
        statusLabel: "Permit issuance, last 24 months",
        provider: "Portland Bureau of Development Services",
      },
    ],
  },

  // ── Environment & Climate ─────────────────────────────────────────────
  environment: {
    questionId: "environment",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Climate accountability platform with CEW workplan tracker, bureau scorecard, PCEF finance tracking, and emissions trajectory. AQI data live from EPA AirNow.",
    sources: [
      {
        name: "Climate Emergency Workplan Tracker",
        status: "LIVE",
        statusLabel: "47 actions encoded",
        provider: "Portland Bureau of Planning & Sustainability",
      },
      {
        name: "GHG Emissions Inventory (1990–2023)",
        status: "LIVE",
        statusLabel: "Historical data loaded",
        provider: "BPS Climate & Energy Dashboard",
      },
      {
        name: "PCEF Investment Tracking",
        status: "LIVE",
        statusLabel: "$750M plan encoded",
        provider: "Portland Clean Energy Fund",
      },
      {
        name: "Bureau Climate Scorecard",
        status: "LIVE",
        statusLabel: "13 bureaus tracked",
        provider: "Climate Justice Audit (Feb 2026)",
      },
      {
        name: "Air Quality Index",
        status: hasEnvVar("AIRNOW_API_KEY") ? "LIVE" : "NEEDS_API_KEY",
        statusLabel: hasEnvVar("AIRNOW_API_KEY") ? "Live data" : "Free API key available",
        provider: "EPA AirNow",
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
    overallStatus: "LIVE",
    badgeLabel: "Live data",
    badgeTooltip:
      "318 parks from ArcGIS, 23K pavement segments with PCI scores, 16 years of library stats from Oregon State Library Socrata.",
    sources: [
      {
        name: "Portland Parks (ArcGIS)",
        status: "LIVE",
        statusLabel: "318 parks, 11,402 acres",
        provider: "Portland Parks & Recreation via ArcGIS",
      },
      {
        name: "PBOT Pavement Condition Index",
        status: "LIVE",
        statusLabel: "23K segments loaded",
        provider: "Portland Bureau of Transportation via ArcGIS",
      },
      {
        name: "Multnomah County Library Stats",
        status: "LIVE",
        statusLabel: "16 years (2010-2025)",
        provider: "Oregon State Library via Socrata",
      },
    ],
  },

  // ── Accountability ────────────────────────────────────────────────────
  accountability: {
    questionId: "accountability",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Promise Tracker with 27 verified mayoral claims, 4 ballot measures, 13 elected officials. Campaign finance (ORESTAR) still needed.",
    sources: [
      {
        name: "Portland Promise Tracker",
        status: "LIVE",
        statusLabel: "27 claims tracked, auto-verified daily",
        provider: "Portland Civic Lab cross-reference engine",
      },
      {
        name: "Elected Officials",
        status: "LIVE",
        statusLabel: "13 officials tracked",
        provider: "Portland City Council / portland.gov",
      },
      {
        name: "Ballot Measures",
        status: "LIVE",
        statusLabel: "4 measures, $542M/year",
        provider: "Multnomah County Elections",
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
    badgeLabel: "FiSC + rates",
    badgeTooltip:
      "The tax view combines Lincoln FiSC 2023 local-government revenue data with a published-rate income-tax calculator.",
    sources: [
      {
        name: "Lincoln FiSC Local Fiscal Basket",
        status: "STATIC",
        statusLabel: "2023 update loaded",
        provider: "Lincoln Institute of Land Policy",
      },
      {
        name: "Income Tax Calculator",
        status: "STATIC",
        statusLabel: "Published-rate model",
        provider: "IRS / OR DOR / WA DOR / state tax agencies",
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
        provider: "Portland Civic Lab Program Office",
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
      "Climate Accountability Platform. All 47 workplan actions seeded from the CEW 2022-2025. Emissions data from BPS GHG inventory. PCEF from Climate Investment Plan.",
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

/**
 * Look up a question's data status from an untrusted slug (a route param, or
 * an id carried on a fetched payload). Returns null when the slug is not a
 * known question, so callers can omit the badge rather than render an
 * undefined one.
 */
export function getQuestionStatusBySlug(slug: string): QuestionDataStatus | null {
  return Object.prototype.hasOwnProperty.call(QUESTION_DATA_STATUS, slug)
    ? QUESTION_DATA_STATUS[slug as QuestionId]
    : null;
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
