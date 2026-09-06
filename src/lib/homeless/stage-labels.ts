import type { Stage } from "./continuum-types";

/** Short stage names for tight column headers and tracks, where the full name would wrap or hyphenate. */
export const STAGE_SHORT: Record<string, string> = {
  prevention: "Prevention",
  diversion: "Diversion",
  "unsheltered-active": "Verified outside",
  "institutional-exit": "In-reach",
  "intake-match": "Match queue",
  "crisis-sobering": "Crisis & sobering",
  "withdrawal-management": "Detox",
  "residential-treatment": "Treatment",
  "medical-respite": "Respite",
  "emergency-shelter": "Shelter",
  "bridge-transition": "Bridge",
  "rapid-rehousing": "Rapid rehousing",
  "permanent-supportive-housing": "Supportive housing",
  retention: "Followed",
};

export function shortName(s: Pick<Stage, "id" | "name">): string {
  return STAGE_SHORT[s.id] ?? s.name;
}

/** Plain-language labels for the evidence grade behind a pathway's order. */
export const EVIDENCE_LABEL: Record<string, string> = {
  RCT: "Randomized trial",
  "RCT, housing step only": "Trial, housing step only",
  "quasi-experimental": "Matched study",
  observational: "Observational",
};
