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
  | "OFFLINE";

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
// Source Definitions
// ---------------------------------------------------------------------------

export const QUESTION_DATA_STATUS: Record<QuestionId, QuestionDataStatus> = {
  // ── Migration ───────────────────────────────────────────────────────────
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

  // ── Business ────────────────────────────────────────────────────────────
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

  // ── Downtown ────────────────────────────────────────────────────────────
  downtown: {
    questionId: "downtown",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Graffiti reports are live from ArcGIS. Foot traffic and vacancy data are estimated (require Placer.ai and CoStar subscriptions).",
    sources: [
      {
        name: "Foot Traffic",
        status: "NEEDS_SUB",
        statusLabel: "Subscription needed",
        provider: "Placer.ai",
        blocker: "$2K-$5K/mo subscription or partnership with Clean & Safe District",
      },
      {
        name: "Commercial Vacancy Rate",
        status: "NEEDS_SUB",
        statusLabel: "Subscription needed",
        provider: "CoStar Group",
        blocker: "$500-$1.5K/mo subscription or use free PBA quarterly reports",
      },
      {
        name: "Graffiti Reports",
        status: "LIVE",
        statusLabel: "Live data",
        provider: "Portland BPS via ArcGIS",
      },
    ],
  },

  // ── Safety ──────────────────────────────────────────────────────────────
  safety: {
    questionId: "safety",
    overallStatus: "LIVE_PARTIAL",
    badgeLabel: "Partially live",
    badgeTooltip:
      "Crime grid data is live from ArcGIS. 911 response times are estimated (require BOEC public records request). Year-over-year comparisons use estimates.",
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

  // ── Tax ─────────────────────────────────────────────────────────────────
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

  // ── Housing ─────────────────────────────────────────────────────────────
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

  // ── Program ─────────────────────────────────────────────────────────────
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
      q.overallStatus === "NEEDS_SUB",
  )
  .map((q) => q.questionId);
