/**
 * Types for the continuum-of-care model on the homelessness deep dive.
 * The data (continuum.ts) is distilled from research/homelessness-continuum,
 * which was drafted by three independent reviewers, judged, synthesized, and
 * then challenged claim by claim. These types mirror that memo's structure so
 * the page and the memo cannot drift apart silently.
 */

/** The broad phase a stage belongs to; drives the column grouping on the map. */
export type Phase = "prevent" | "find" | "stabilize" | "shelter" | "house" | "sustain";

/** How much the region can actually say about who is in this stage today. */
export type CountStatus = "known" | "partial" | "unknown";

export interface StageCount {
  /** What is counted, in plain words ("people whose last contact was a shelter check-in"). */
  what: string;
  /** Where the count comes from, or would come from. */
  source: string;
  /** How often it can be refreshed without heroics. */
  cadence: string;
  /** The best published figure for Portland today, or what stands in for one. */
  portlandToday: string;
  status: CountStatus;
}

export interface Stage {
  id: string;
  name: string;
  phase: Phase;
  /** One sentence: the job this stage does that no other stage does. */
  purpose: string;
  entry: string;
  exit: string;
  duration: string;
  /** Cohort ids from PLACEMENT_COHORTS that use this stage. */
  cohorts: string[];
  capacityUnit: string;
  count: StageCount;
  /** What Portland has here today, with the capacity number where one is published. */
  exists: string;
  /** The documented gap, with a source id from research/homelessness-continuum/sources.md. */
  gap: string;
  gapSource?: string;
}

export interface Pathway {
  /** Cohort id from PLACEMENT_COHORTS. */
  cohort: string;
  /** Ordered stage ids. */
  steps: string[];
  /** Why this order, in one or two sentences. */
  why: string;
  /** Strength of the best evidence for the sequence. */
  evidence: "RCT" | "quasi-experimental" | "observational" | "practice" | "RCT, housing step only";
  evidenceSource?: string;
}

export interface GapSignal {
  stageId: string;
  /** The pattern in the counts that says the gap is here. */
  signal: string;
  /** What that pattern usually means. */
  likelyGap: string;
  /** What Portland's numbers say, or "unknown" with the records request that would settle it. */
  portlandReading: string;
}

export interface CountField {
  n: number;
  name: string;
  what: string;
  /** Where it already lives (an HMIS element, a billing record) so the reader sees it is not new collection. */
  alreadyExists: string;
}

export interface CountRule {
  rule: string;
  why: string;
}

export interface StalenessBand {
  label: string;
  days: string;
  meaning: string;
  color: string;
}
