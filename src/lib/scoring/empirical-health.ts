/**
 * Empirical economic-health scoring.
 *
 * Replaces the arbitrary 0.5×=0 / 1.5×=100 ratios in economic-health.ts
 * with two data-grounded signals per indicator:
 *
 *   • Portland-historical percentile, where Portland's current value sits
 *     in its own 10+ year history. Answers "is this normal for Portland?"
 *   • Peer-current percentile, where Portland sits today against 6 peer
 *     metros (Seattle, Denver, Austin, SF, Minneapolis, Phoenix).
 *     Answers "how does Portland stack up to comparable cities?"
 *
 * Each sub-score = average of those two percentiles, 0-100.
 * Composite = mean of the present sub-scores (re-normalized if any missing).
 *
 * Pure function. No DB calls — caller assembles the inputs from queries.
 */

export type IndicatorKey =
  | "unemployment"
  | "employment"
  | "wageGrowth"
  | "businessFormation"
  | "laborForceParticipation"
  | "affordability"
  | "incomePerCapita"
  | "populationGrowth";

/** A single observation for one metro at one point in time. */
export interface MetroObservation {
  metroCode: string;
  isPortland: boolean;
  /** Indicator value at the most recent comparable period across metros. */
  current: number;
  /** Per-capita normalization divisor (population), or null to use raw. */
  population?: number | null;
  shortName: string;
}

export interface EmpiricalIndicatorInput {
  /** Portland's current value at the most recent period. */
  portlandCurrent: number;
  /** Portland's full historical series for empirical baseline (any cadence). */
  portlandHistory: number[];
  /** Snapshot of all metros at the latest common period. */
  peerSnapshot: MetroObservation[];
  /**
   * If true, lower values are better (e.g., unemployment rate). The percentile
   * is then inverted so "low value" = "high score".
   */
  inverted: boolean;
  label: string;
  description: string;
  /** Source the UI surfaces in the bar's footnote. */
  source: string;
}

export interface EmpiricalSubScore {
  key: IndicatorKey;
  label: string;
  description: string;
  source: string;
  value: number; // 0-100, the published sub-score
  weight: number;
  rawWeight: number;
  /** Percentile of Portland's current value in its own history (0-100). */
  portlandHistoricalPercentile: number;
  /** Percentile rank of Portland among the peer snapshot (0-100). */
  peerPercentile: number;
  /** Portland's current raw value (e.g., 4.2 for 4.2% unemployment). */
  portlandCurrent: number;
  /** Numeric stats for the UI's range ribbon. */
  portlandHistory: {
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    min: number;
    max: number;
    count: number;
  };
  peerSnapshot: MetroObservation[]; // forwarded for UI rendering
  peerMedian: number;
  peerMin: number;
  peerMax: number;
  inverted: boolean;
}

export interface EmpiricalHealthResult {
  score: number; // 0-100
  label: "Healthy" | "Mixed" | "Concerning" | "Insufficient data";
  subScores: EmpiricalSubScore[];
  missing: IndicatorKey[];
}

// Eight indicators, each ~12.5%, sum to 1.0. Composite reflects:
//   - Labor health: unemployment, LFP (people working)
//   - Job dynamism: employment YoY, business formation (firms growing)
//   - Earnings: wage growth, income per capita (paychecks)
//   - Affordability + growth: housing affordability, population growth
const RAW_WEIGHTS: Record<IndicatorKey, number> = {
  unemployment: 0.13,
  employment: 0.13,
  wageGrowth: 0.12,
  laborForceParticipation: 0.13,
  businessFormation: 0.12,
  affordability: 0.13,
  incomePerCapita: 0.12,
  populationGrowth: 0.12,
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Quantile of a sorted-ascending array. q in [0,1]. */
function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const pos = (sortedAsc.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedAsc[base + 1] !== undefined) {
    return sortedAsc[base] + rest * (sortedAsc[base + 1] - sortedAsc[base]);
  }
  return sortedAsc[base];
}

/**
 * Percentile rank of `value` in `series`, 0-100. The fraction of values
 * <= value. Inverted=true treats lower as better, so the rank is flipped.
 */
function percentileRank(value: number, series: number[], inverted: boolean): number {
  if (series.length === 0) return 50;
  let countLeq = 0;
  for (const v of series) if (v <= value) countLeq++;
  const raw = (countLeq / series.length) * 100;
  return inverted ? 100 - raw : raw;
}

function describePortlandHistory(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    p10: quantile(sorted, 0.1),
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    p90: quantile(sorted, 0.9),
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    count: sorted.length,
  };
}

function scoreOne(
  key: IndicatorKey,
  inp: EmpiricalIndicatorInput,
): EmpiricalSubScore | null {
  if (inp.portlandHistory.length < 6 || inp.peerSnapshot.length < 2) {
    return null; // not enough data for either signal
  }

  const histPct = clamp(
    percentileRank(inp.portlandCurrent, inp.portlandHistory, inp.inverted),
    0,
    100,
  );
  const peerValues = inp.peerSnapshot.map((p) => p.current).filter((v) => Number.isFinite(v));
  const peerPct = clamp(percentileRank(inp.portlandCurrent, peerValues, inp.inverted), 0, 100);

  const value = Math.round((histPct + peerPct) / 2);

  const sortedPeers = [...peerValues].sort((a, b) => a - b);
  const peerMedian = quantile(sortedPeers, 0.5);
  const peerMin = sortedPeers[0] ?? 0;
  const peerMax = sortedPeers[sortedPeers.length - 1] ?? 0;

  return {
    key,
    label: inp.label,
    description: inp.description,
    source: inp.source,
    value,
    weight: 0, // filled by caller after re-normalization
    rawWeight: RAW_WEIGHTS[key],
    portlandHistoricalPercentile: Math.round(histPct),
    peerPercentile: Math.round(peerPct),
    portlandCurrent: inp.portlandCurrent,
    portlandHistory: describePortlandHistory(inp.portlandHistory),
    peerSnapshot: inp.peerSnapshot,
    peerMedian,
    peerMin,
    peerMax,
    inverted: inp.inverted,
  };
}

export interface EmpiricalInputs {
  unemployment: EmpiricalIndicatorInput | null;
  employment: EmpiricalIndicatorInput | null;
  wageGrowth: EmpiricalIndicatorInput | null;
  laborForceParticipation: EmpiricalIndicatorInput | null;
  businessFormation: EmpiricalIndicatorInput | null;
  affordability: EmpiricalIndicatorInput | null;
  incomePerCapita: EmpiricalIndicatorInput | null;
  populationGrowth: EmpiricalIndicatorInput | null;
}

export function computeEmpiricalHealth(inputs: EmpiricalInputs): EmpiricalHealthResult {
  const keys: IndicatorKey[] = [
    "unemployment",
    "employment",
    "wageGrowth",
    "laborForceParticipation",
    "businessFormation",
    "affordability",
    "incomePerCapita",
    "populationGrowth",
  ];
  const raw: Array<{ key: IndicatorKey; sub: EmpiricalSubScore | null }> = keys.map((k) => ({
    key: k,
    sub: inputs[k] ? scoreOne(k, inputs[k]!) : null,
  }));

  const present = raw.filter((r) => r.sub !== null) as Array<{
    key: IndicatorKey;
    sub: EmpiricalSubScore;
  }>;
  const missing = raw.filter((r) => r.sub === null).map((r) => r.key);

  if (present.length === 0) {
    return { score: 0, label: "Insufficient data", subScores: [], missing };
  }

  const weightSum = present.reduce((s, r) => s + RAW_WEIGHTS[r.key], 0);
  const subScores = present.map(({ key, sub }) => ({
    ...sub,
    weight: Number((RAW_WEIGHTS[key] / weightSum).toFixed(3)),
  }));

  const composite = subScores.reduce((s, x) => s + x.value * x.weight, 0);
  const score = Math.round(composite);
  const label: EmpiricalHealthResult["label"] =
    score >= 70 ? "Healthy" : score >= 40 ? "Mixed" : "Concerning";

  return { score, label, subScores, missing };
}
