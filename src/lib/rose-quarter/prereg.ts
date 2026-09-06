/**
 * THE PRE-REGISTRATION — frozen before the experiment begins.
 *
 * On September 11, 2026 ODOT closes southbound I-5 through the Rose Quarter for
 * up to five weeks and sends the traffic to I-405 and I-205. That is close to
 * what freeway-removal advocates propose permanently, so the closure is an
 * accidental test of the central empirical claim in a $2 billion argument.
 *
 * This file is the whole test, written down in advance: which detectors, which
 * hours, which weeks, which baseline, and exactly what result would prove each
 * side right. It is committed before any closure data exists, and it is
 * imported by BOTH the ingest scripts and the page — one definition, so a
 * threshold cannot quietly drift between what we promised and what we computed.
 *
 * Changing anything here after Sept 11 requires appending to AMENDMENTS, which
 * the page renders. Silent edits are the failure mode this file exists to stop.
 *
 * Station IDs and segment lengths come from PORTAL's own station metadata
 * (https://new.portal.its.pdx.edu/highways/api/stationmetadata/), read
 * 2026-08-13. Only mainline stations are listed: PORTAL's `locationtext`
 * distinguishes mainline ("@ SB I-5 MP302.51") from ramps ("Wheeler (2R018) to
 * SB I-5"), and including a ramp would double-count its traffic.
 */

export const PREREG_VERSION = 1;
export const PREREGISTERED_AT = "2026-08-13";

/** PORTAL highway identifiers. */
export const HIGHWAY = {
  I5_NB: 1,
  I5_SB: 2,
  I205_NB: 3,
  I205_SB: 4,
  I405_NB: 5,
  I405_SB: 6,
  I84_EB: 7,
  I84_WB: 8,
  OR217_NB: 9,
  OR217_SB: 10,
  US26_EB: 11,
  US26_WB: 12,
  WA_I5_NB: 501,
  WA_I5_SB: 502,
  WA_I205_NB: 54,
  WA_I205_SB: 55,
} as const;

export interface Station {
  id: number;
  /** Milepost, as PORTAL reports it. */
  mp: number;
  /** Segment length this station represents, in miles. Used for travel time. */
  length: number;
  label: string;
}

export interface Corridor {
  id: string;
  name: string;
  highwayId: number;
  /** What this corridor is for — stated so the reader can check our reasoning. */
  role: "treatment" | "control" | "detour" | "approach" | "downstream" | "cordon";
  why: string;
  stations: Station[];
}

/**
 * The closure, precisely. ODOT closes SB I-5 between I-405 and I-84, but leaves
 * one SB lane open from the I-405 junction to the Broadway exit, and the
 * I-84 WB → I-5 SB movement stays open. So the segment is not uniformly closed,
 * and C1 is split: C1a is the genuinely closed section, C1b still carries
 * I-84 traffic. Reporting them as one number would be the easiest
 * honest-looking mistake available.
 */
export const CORRIDORS: Corridor[] = [
  {
    id: "C1a",
    name: "I-5 southbound — the closed section",
    highwayId: HIGHWAY.I5_SB,
    role: "treatment",
    why: "The segment actually losing its lanes. This is the treatment.",
    stations: [
      { id: 3172, mp: 303.47, length: 0.4, label: "at I-405" },
      { id: 10642, mp: 302.8, length: 0.295, label: "Russell" },
      { id: 3121, mp: 302.51, length: 0.315, label: "Broadway" },
    ],
  },
  {
    id: "C1b",
    name: "I-5 southbound — below the I-84 merge",
    highwayId: HIGHWAY.I5_SB,
    role: "treatment",
    why: "Still fed by I-84 westbound, which stays open. Reported separately so it is not mistaken for the closed section.",
    stations: [
      { id: 3120, mp: 301.32, length: 0.685, label: "Morrison Bridge" },
      { id: 3185, mp: 300.8, length: 0.91, label: "Madison" },
    ],
  },
  {
    id: "C2",
    name: "I-5 northbound — the control direction",
    highwayId: HIGHWAY.I5_NB,
    role: "control",
    why: "Same viaduct, same weather, same events, same school calendar, and it stays open. Every headline number is a difference against this, not a raw before-and-after.",
    stations: [
      { id: 3171, mp: 303.47, length: 0.39, label: "at I-405" },
      { id: 10641, mp: 302.8, length: 0.29, label: "Russell" },
      { id: 3169, mp: 302.52, length: 0.15, label: "Broadway" },
      { id: 3168, mp: 301.32, length: 0.755, label: "Morrison Bridge" },
      { id: 3032, mp: 300.8, length: 0.645, label: "Madison" },
    ],
  },
  {
    id: "C3",
    name: "I-405 southbound — the detour",
    highwayId: HIGHWAY.I405_SB,
    role: "detour",
    why: "Where ODOT sends the traffic. Also, permanently, where advocates propose putting I-5.",
    stations: [
      { id: 3122, mp: 4.09, length: 1.435, label: "from I-5" },
      { id: 3110, mp: 1.77, length: 0.22, label: "Jefferson" },
      { id: 3196, mp: 1.15, length: 0.145, label: "Broadway" },
    ],
  },
  {
    id: "C4",
    name: "I-405 northbound — control",
    highwayId: HIGHWAY.I405_NB,
    role: "control",
    why: "The detour route's opposite direction, to separate detour load from general I-405 conditions.",
    stations: [
      { id: 3170, mp: 4.2, length: 1.37, label: "to I-5" },
      { id: 3111, mp: 2.12, length: 0.265, label: "Alder" },
      { id: 3109, mp: 1.77, length: 0.485, label: "Jefferson" },
      { id: 3108, mp: 1.15, length: 0.81, label: "Broadway" },
    ],
  },
  {
    id: "C5",
    name: "I-5 southbound — the approach",
    highwayId: HIGHWAY.I5_SB,
    role: "approach",
    why: "Upstream of the closure. If drivers reroute before reaching it, it shows here first.",
    stations: [
      { id: 3174, mp: 305.9, length: 0.185, label: "Columbia" },
      { id: 3173, mp: 305.6, length: 0.195, label: "Lombard" },
      { id: 10640, mp: 304.3, length: 0.385, label: "Alberta" },
    ],
  },
  {
    id: "C8",
    name: "I-5 southbound — downstream of the merge",
    highwayId: HIGHWAY.I5_SB,
    role: "downstream",
    why: "Below where I-405 rejoins. Completes the realistic southbound path.",
    stations: [
      { id: 3194, mp: 298.9, length: 0.825, label: "Corbett" },
      { id: 3118, mp: 297.6, length: 0.8, label: "Miles" },
      { id: 3116, mp: 297.3, length: 0.67, label: "Terwilliger" },
    ],
  },
];

/**
 * The realistic southbound path, before and during. Comparing these two — not
 * comparing the closed segment against itself — is what answers the question a
 * driver actually has: how much longer does my trip take?
 */
export const PATHS = {
  baseline: ["C5", "C1a", "C1b", "C8"],
  duringClosure: ["C5", "C3", "C8"],
} as const;

/**
 * The Columbia River cordon — the strongest instrument available here.
 *
 * There are exactly two road crossings of the Columbia in the metro area, and
 * PORTAL instruments both. Nothing can leak around them; the next crossing is
 * forty miles east. So for the Washington-to-Oregon movement, total volume
 * across these two points is a direct count of trips taken, not a proxy. If it
 * falls, trips were not made by car. That is a genuinely closed system, and it
 * is the only place in this experiment where diversion and evaporation can be
 * told apart cleanly rather than inferred.
 */
export const CORDON = {
  southbound: [
    { id: 1026, highwayId: HIGHWAY.I5_SB, label: "I-5 Interstate Bridge", mp: 307.9 },
    { id: 10579, highwayId: HIGHWAY.I205_SB, label: "I-205 Glenn Jackson", mp: 25.6 },
  ],
  northbound: [
    { id: 1025, highwayId: HIGHWAY.I5_NB, label: "I-5 Interstate Bridge", mp: 307.9 },
    { id: 10575, highwayId: HIGHWAY.I205_NB, label: "I-205 Glenn Jackson", mp: 25.6 },
  ],
} as const;

/** Verifies the closure actually happened as described. If this fails, no verdict may publish. */
export const CLOSURE_CHECK = {
  stationId: 1035,
  highwayId: HIGHWAY.I5_SB,
  label: "Wheeler on-ramp to SB I-5",
  expectedDropPct: 80,
} as const;

// ── time ────────────────────────────────────────────────────────────

export const WINDOWS = {
  AM: { from: 6, to: 9, label: "Morning peak, 6–9am" },
  MIDDAY: { from: 9, to: 15, label: "Midday, 9am–3pm" },
  PM: { from: 15, to: 19, label: "Evening peak, 3–7pm" },
  NIGHT: { from: 19, to: 6, label: "Overnight, 7pm–6am" },
  ALLDAY: { from: 0, to: 24, label: "All day" },
} as const;
export type WindowKey = keyof typeof WINDOWS;

export interface Period {
  key: string;
  from: string;
  to: string;
  label: string;
  note?: string;
}

/**
 * Periods. Note how little clean pre-closure baseline exists: school starts in
 * early September, Labor Day is the 7th, and the closure begins the 11th. Three
 * comparable weekdays. We say so rather than papering over it, and lean on the
 * year-over-year baseline instead.
 */
export const PERIODS: Period[] = [
  {
    key: "PRE_PROXIMATE",
    from: "2026-08-25",
    to: "2026-09-10",
    label: "Weeks before",
    note: "Contaminated by the start of school and Labor Day. Secondary baseline only.",
  },
  {
    key: "PRE_CLEAN",
    from: "2026-09-08",
    to: "2026-09-10",
    label: "The three clean days",
    note: "The only school-in-session weekdays before the closure. n=3, and we report it as n=3.",
  },
  { key: "SHOCK", from: "2026-09-11", to: "2026-09-15", label: "First three days" },
  { key: "W1", from: "2026-09-14", to: "2026-09-18", label: "Week 1" },
  { key: "W2", from: "2026-09-21", to: "2026-09-25", label: "Week 2" },
  {
    key: "W3",
    from: "2026-09-28",
    to: "2026-10-02",
    label: "Week 3",
    note: "The primary evaluation window, chosen in advance.",
  },
  { key: "W4", from: "2026-10-05", to: "2026-10-09", label: "Week 4" },
  {
    key: "W5",
    from: "2026-10-12",
    to: "2026-10-16",
    label: "Week 5",
    note: "Indigenous Peoples' Day (Oct 12) excluded, so n=4.",
  },
];

export const PRIMARY_WINDOW = "W3";
export const CLOSURE_START = "2026-09-11";
/** ODOT says "up to five weeks"; treated as the planned end, to be corrected from the record. */
export const CLOSURE_END_PLANNED = "2026-10-16";

/** Days excluded from every weekday aggregate. */
export const EXCLUDED_DATES = ["2026-09-07", "2026-10-12"];

// ── thresholds ──────────────────────────────────────────────────────

/**
 * Every number below is fixed before the data exists. They are deliberately
 * round and few: a reader who disagrees with our conclusion should be able to
 * check the arithmetic without trusting us.
 */
export const THRESHOLDS = {
  /** Travel time ratio at or above this backs ODOT's operative forecast. */
  odotBorneOut: 2.0,
  odotPartly: 1.5,
  /** At or below this in week 3 backs the "it settles" prediction. */
  settledBorneOut: 1.25,
  /** Below this counts as "not chaos" for the shock window. */
  chaosFloor: 1.5,
  /** Cordon volume ratio at or below this, and beyond 2 sigma, demonstrates evaporation. */
  evaporationRatio: 0.95,
  evaporationSigmas: 2,
  /** At or above this means the same trips were made — pure diversion. */
  diversionRatio: 0.98,
  /** Days in a five-day week that must meet a rule for it to count. */
  daysRequired: 3,
  /** Rain in the peak window above this flags the day. Flagged days are shown, never deleted. */
  rainFlagMm: 2.5,
  /** Minimum share of expected readings for a station-hour to be usable. */
  minReadingShare: 0.8,
} as const;

/**
 * Conditions under which ODOT's forecast is testable at all.
 *
 * ODOT's number came with a condition attached — "if every driver sticks to
 * their normal travel patterns", which as written makes it close to
 * unfalsifiable. Scoring it as though the condition weren't there would be a
 * cheap shot. So we test the condition first, with numbers fixed in advance. If
 * drivers changed behaviour, the honest verdict is that the forecast was never
 * put to the test, and the size of the change is itself the finding.
 */
export const ANTECEDENT = {
  sameTrips: { metric: "Columbia cordon southbound weekday volume", tolerancePct: 2 },
  sameTiming: { metric: "share of daily volume in the peaks", tolerancePoints: 2 },
  sameRoutes: { metric: "I-5 southbound volume at Alberta, upstream of the closure", tolerancePct: 3 },
} as const;

export interface Amendment {
  date: string;
  what: string;
  why: string;
}

/** Append-only. Rendered on the page whenever non-empty. */
export const AMENDMENTS: Amendment[] = [];

/** Every corridor's total instrumented length, in miles. */
export function corridorLength(c: Corridor): number {
  return c.stations.reduce((s, st) => s + st.length, 0);
}

export function corridorById(id: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.id === id);
}

/** All highway IDs the ingest must pull. */
export const REQUIRED_HIGHWAYS = Array.from(
  new Set([
    ...CORRIDORS.map((c) => c.highwayId),
    ...CORDON.southbound.map((s) => s.highwayId),
    ...CORDON.northbound.map((s) => s.highwayId),
    HIGHWAY.I205_SB,
    HIGHWAY.I205_NB,
    HIGHWAY.I84_EB,
    HIGHWAY.I84_WB,
    HIGHWAY.US26_EB,
    HIGHWAY.US26_WB,
    HIGHWAY.OR217_NB,
    HIGHWAY.OR217_SB,
    HIGHWAY.WA_I5_SB,
    HIGHWAY.WA_I5_NB,
  ]),
).sort((a, b) => a - b);
