/**
 * FPDR calculation engine.
 *
 * Three models power the interactive pieces of the deep-dive:
 *
 *  1. personalCost()  — what the FPDR levy costs a single household today.
 *     Straight arithmetic off the verified FY2025-26 tax rate.
 *
 *  2. projectedCost() — the same household's cost over the City's published
 *     rate-forecast window (FY26–FY31), growing assessed value ~3%/yr.
 *
 *  3. simulateFundingPolicy() — an illustrative model of a real funding policy:
 *     a declining-dollar, 30-year amortization of the unfunded liability
 *     (optionally seeded by a pension-obligation bond), calibrated to the
 *     outputs the city's actuary-watchers cite. It is a teaching tool, NOT an
 *     actuarial forecast. The one thing it gets exactly right is the core
 *     economics: the ONLY source of savings from pre-funding is investment
 *     returns, so at a 0% return the savings collapse to zero. The reform levy
 *     declines over the funding window, then drops toward zero once the
 *     liability is paid off — the cost profile a closed, mature plan should
 *     follow.
 */

import {
  HEADLINE,
  FPDR_RATE_FORECAST,
  PAYGO_ANCHORS,
  SIM_START_YEAR,
  SIM_END_YEAR,
} from "./data";

// ── Personal cost ─────────────────────────────────────────────────

export interface PersonalCost {
  /** Assessed value the household was charged on. */
  assessedValue: number;
  /** FPDR dollars this household pays per year. */
  annual: number;
  /** Per month. */
  monthly: number;
  /** This household's share of the entire citywide FPDR levy. */
  shareOfLevy: number;
}

export function personalCost(assessedValue: number): PersonalCost {
  const annual = (assessedValue / 1000) * HEADLINE.ratePer1000AV_FY26;
  return {
    assessedValue,
    annual,
    monthly: annual / 12,
    shareOfLevy: annual / HEADLINE.annualLevyFY26,
  };
}

export interface ProjectedCost {
  /** Number of fiscal years in the published forecast window. */
  years: number;
  /** Cumulative FPDR cost across that window ($). */
  total: number;
  /** The household's FPDR bill in the final forecast year ($). */
  finalAnnual: number;
}

/**
 * Projected cumulative FPDR cost for a household over the City's published
 * rate-forecast window (FY26–FY31). Grows assessed value by the City's assumed
 * AV growth each year and applies that year's published rate. This is the right
 * way to estimate a multi-year bill: both the rate and the assessed base rise,
 * so multiplying today's bill by N materially understates the real total.
 */
export function projectedCost(assessedValue: number): ProjectedCost {
  let av = assessedValue;
  let total = 0;
  let finalAnnual = 0;
  for (const yr of FPDR_RATE_FORECAST) {
    av = av * (1 + yr.avGrowth);
    finalAnnual = (av / 1000) * yr.ratePer1000AV;
    total += finalAnnual;
  }
  return { years: FPDR_RATE_FORECAST.length, total, finalAnnual };
}

// ── Pay-as-you-go projection (interpolated from anchors) ──────────

/** Linearly interpolate the projected benefit payments ($M) for a year. */
export function payGoAt(year: number): number {
  const a = PAYGO_ANCHORS;
  if (year <= a[0].year) return a[0].payments;
  if (year >= a[a.length - 1].year) return a[a.length - 1].payments;
  for (let i = 0; i < a.length - 1; i++) {
    const lo = a[i];
    const hi = a[i + 1];
    if (year >= lo.year && year <= hi.year) {
      const t = (year - lo.year) / (hi.year - lo.year);
      return lo.payments + t * (hi.payments - lo.payments);
    }
  }
  return a[a.length - 1].payments;
}

// ── Reform simulation: a real funding policy ──────────────────────
// Models the alternative funding policy analysts recommend for a closed,
// mature, underfunded plan: fully amortize the unfunded liability over 30
// years with a DECLINING-dollar contribution (level-percent-of-payroll is
// inappropriate for a closed plan), at the NASRA peer-median 7% return. The
// reform levy IS that contribution — benefits are paid from the invested trust
//, so it starts above pay-go, declines every year, and drops to ~zero once
// the liability is retired and contributions cease. Optionally seeded with a
// pension-obligation bond, whose debt service is added to the levy, so the
// bond is a leveraged bet that helps only when the trust return beats the bond
// rate, not free money. The 2%/yr decline is calibrated so that, at 7%, the
// curve reproduces the cited outputs: a ~$0.4B transition cost, breakeven in
// the low-20s of years, and ~30% lifetime savings. NOT an actuarial forecast.

const AMORT_YEARS = 30;
const DECLINE_RATE = 0.02;
// Pension-obligation bond: taxable rate and term used to model debt service.
const POB_RATE = 0.055;
const POB_TERM = 25;

export interface FundingSimYear {
  year: number;
  /** Status-quo levy that year ($M) — just the benefits due. */
  payGo: number;
  /** Levy under the funding policy ($M) — the contribution; benefits come from the trust. */
  reform: number;
  /** Invested trust balance at year-end ($M). */
  trust: number;
}

export interface FundingSimResult {
  annualReturn: number;
  /** Pension-obligation bond seeded into the trust ($M). */
  pobAmount: number;
  rows: FundingSimYear[];
  /** Total levied over the whole horizon under pay-go ($M). */
  lifetimePayGo: number;
  /** Net total cost under the policy, crediting any leftover trust ($M). */
  lifetimeReform: number;
  /** lifetimePayGo - lifetimeReform ($M). Equals total investment returns. */
  lifetimeSavings: number;
  savingsPct: number;
  /** Highest single-year levy under the policy ($M) — the early "bump". */
  peakReform: number;
  /** Year the policy levy peaks (the first funding year). */
  peakReformYear: number;
  /** First year the policy levy drops below the pay-go levy. */
  crossoverYear: number | null;
  /** Year the liability is paid off and contributions cease. */
  fundedYear: number;
}

/**
 * Forward-simulate the levy under a declining-dollar, 30-year funding policy.
 *
 * Mechanics: the city levies a contribution that declines a constant percent
 * each year for 30 years, drops it into a trust earning `annualReturn`, and
 * pays benefits from the trust. We solve for the smallest starting contribution
 * that keeps the trust solvent through the entire horizon; any trust left at
 * the end is credited back (it's real money), so net lifetime savings equal
 * exactly the investment returns earned, which is why a 0% return yields $0.
 */
export function simulateFundingPolicy(
  annualReturn: number,
  pobAmount = 0
): FundingSimResult {
  const r = annualReturn;
  const N = AMORT_YEARS;
  const d = DECLINE_RATE;

  const years: number[] = [];
  for (let y = SIM_START_YEAR; y <= SIM_END_YEAR; y++) years.push(y);
  const benefits = years.map(payGoAt);
  const H = years.length;

  const contribution = (c0: number, t: number) =>
    t < N ? c0 * Math.pow(1 - d, t) : 0;

  // Forward-run the trust for a given starting contribution.
  const run = (c0: number) => {
    let trust = pobAmount;
    let minTrust = Infinity;
    const path: number[] = [];
    for (let t = 0; t < H; t++) {
      trust = (trust + contribution(c0, t) - benefits[t]) * (1 + r);
      path.push(trust);
      if (trust < minTrust) minTrust = trust;
    }
    return { path, minTrust, end: trust };
  };

  // Solve for the smallest initial contribution that keeps the invested trust
  // solvent through the whole horizon (higher c0 → higher trust everywhere).
  let lo = 0;
  let hi = 10_000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (run(mid).minTrust >= 0) hi = mid;
    else lo = mid;
  }
  const c0 = hi;
  const { path, end } = run(c0);

  // Level annual debt service to repay the bond over its term (the proceeds were
  // already seeded into the trust inside run()); added to the levy, not the trust.
  const debtService =
    pobAmount === 0
      ? 0
      : (pobAmount * POB_RATE) / (1 - Math.pow(1 + POB_RATE, -POB_TERM));

  const rows: FundingSimYear[] = [];
  let lifetimePayGo = 0;
  let cumReform = 0;
  let peakReform = 0;
  let peakReformYear = SIM_START_YEAR;
  let crossoverYear: number | null = null;

  for (let t = 0; t < H; t++) {
    // Taxpayer levy = funding contribution + any bond debt service that year.
    const levy = contribution(c0, t) + (t < POB_TERM ? debtService : 0);
    lifetimePayGo += benefits[t];
    cumReform += levy;
    if (levy > peakReform) {
      peakReform = levy;
      peakReformYear = years[t];
    }
    if (crossoverYear === null && t > 0 && levy < benefits[t] - 0.01) {
      crossoverYear = years[t];
    }
    rows.push({
      year: years[t],
      payGo: benefits[t],
      reform: levy,
      trust: Math.max(0, path[t]),
    });
  }

  // Credit any trust left at the end (real money) against the policy's cost.
  const lifetimeReform = cumReform - Math.max(0, end);
  const lifetimeSavings = lifetimePayGo - lifetimeReform;

  return {
    annualReturn: r,
    pobAmount,
    rows,
    lifetimePayGo,
    lifetimeReform,
    lifetimeSavings,
    savingsPct: lifetimeSavings / lifetimePayGo,
    peakReform,
    peakReformYear,
    crossoverYear,
    fundedYear: SIM_START_YEAR + N,
  };
}

// ── Formatting helpers (shared by the page) ───────────────────────

/** $251.6M, $3.9B, $896, etc. */
export function fmtMoney(value: number, opts?: { cents?: boolean }): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`;
  if (abs >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 10_000) return `$${Math.round(value).toLocaleString()}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts?.cents ? 2 : 0,
  }).format(value);
}

/** A value given in millions → a clean money string. */
export function fmtMillions(valueInMillions: number): string {
  return fmtMoney(valueInMillions * 1_000_000);
}

export function fmtPct(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}
