/**
 * Build the flow graph.
 *
 * The honest-design decision that shapes everything here: the budget book does
 * NOT say which revenue dollar funds which program. Inventing that mapping —
 * by allocating proportionally, say — would be modelled data presented as
 * real, which this site does not do.
 *
 * So the flow passes through a single hub. Sources feed the hub; the hub feeds
 * uses. Every link is a figure the City actually publishes, and the diagram
 * makes no claim about which source paid for which use. Downstream of "Bureau
 * expense" the hierarchy IS published, so it fans out fully:
 *
 *   sources ──▶ [ the $8.55B ] ──▶ uses ──▶ service area ──▶ bureau ──▶ object
 *                                                              └▶ program
 */

import type { BudgetDataset, Values } from "./types";
import { CLASS_LABEL } from "./types";

export type Stage = "source" | "hub" | "area" | "bureau" | "object";
export const STAGES: Stage[] = ["source", "hub", "area", "bureau", "object"];

export const STAGE_LABEL: Record<Stage, string> = {
  source: "Where it comes from",
  hub: "The budget",
  area: "Service area",
  bureau: "Bureau",
  object: "What it buys",
};

export type NodeKind = "external" | "internal" | "spending" | "reserve" | "hub" | "program";

export interface FlowNode {
  id: string;
  stage: Stage;
  label: string;
  kind: NodeKind;
  value: number;
  /** Parent bureau, for program nodes. */
  parentId?: string;
  /** Rank within the column; fixed so columns never reshuffle between years. */
  rank: number;
  detail?: string;
  page?: number;
}

export interface FlowLink {
  id: string;
  source: string;
  target: string;
  value: number;
  /** Internal dollars are counted twice in the gross total. */
  internal: boolean;
}

export interface FlowGraph {
  nodes: FlowNode[];
  links: FlowLink[];
  byStage: Record<Stage, FlowNode[]>;
  total: number;
  /** Money that exists in a total but has no published breakdown. */
  unattributed: number;
}

export type Basis = "gross" | "net";

const INTERNAL_SOURCES = new Set([
  "Beginning Fund Balance",
  "Fund Transfers - Revenue",
  "Interagency Revenue",
  "General Fund Discretionary",
  "General Fund Overhead",
  "Miscellaneous Fund Allocation",
]);

const INTERNAL_USES = new Set([
  "Fund Transfers - Expense",
  "Ending Fund Balance",
  "Reserved for Future Expenditure",
  "Contingency",
  "Debt Service Reserves",
]);

const yearIndex = (y: string) => Math.max(0, ["2023-24", "2024-25", "2025-26", "2026-27"].indexOf(y));
const at = (v: Values, i: number) => v[i] ?? 0;

export interface BuildOpts {
  year: string;
  basis: Basis;
  /** Bureau slugs expanded into their programs. */
  expanded: Set<string>;
}

export function buildGraph(data: BudgetDataset, opts: BuildOpts): FlowGraph {
  const yi = yearIndex(opts.year);
  const nodes: FlowNode[] = [];
  const links: FlowLink[] = [];
  const push = (n: FlowNode) => (nodes.push(n), n);

  const res = data.citywide.resources;
  const req = data.citywide.requirements;
  const cur = yi === 3;
  const figVal = (r: { current: number | null; prior: number | null }) =>
    (cur ? r.current : r.prior) ?? 0;
  const rowOf = (fig: typeof req, label: string) =>
    fig?.rows.find((r) => r.label.toLowerCase() === label.toLowerCase());
  const amount = (fig: typeof req, label: string) => {
    const r = rowOf(fig, label);
    return r ? figVal(r) : 0;
  };

  // The City's Figure 6/7 tables print only FY25-26 and FY26-27. For the two
  // actuals years, fall back to the same objects aggregated from the fund
  // detail, which reproduces those figures exactly for FY26-27, so the two
  // sources are known to agree where they overlap.
  const fromFunds = yi < 2;
  const yearly = data.yearlyObjects;
  const fundAmount = (side: "revenues" | "expenses", label: string) =>
    yearly?.[side]?.[label]?.[yi] ?? 0;
  const amountY = (fig: typeof req, side: "revenues" | "expenses", label: string) =>
    fromFunds ? fundAmount(side, label) : amount(fig, label);

  const transfers = amountY(res, "revenues", "Fund Transfers - Revenue");
  const interagency = amountY(res, "revenues", "Interagency Revenue");

  const internalMS = amountY(req, "expenses", "Internal Materials and Services");

  // ── sources ────────────────────────────────────────────────────────
  // Net removes only the genuinely double-counted internal transactions:
  // transfers between funds, and one bureau billing another. Beginning
  // balance stays — it is real money that funds this year's spending, just
  // not money that arrived this year.
  const sourceRows = (
    fromFunds
      ? Object.entries(yearly?.revenues ?? {}).map(([label, v]) => ({
          label,
          depth: 1,
          isTotal: false,
          value: v?.[yi] ?? 0,
        }))
      : (res?.rows ?? []).map((r) => ({
          label: r.label,
          depth: r.depth,
          isTotal: r.isTotal,
          value: figVal(r),
        }))
  )
    .filter((r) => r.depth > 0 && !r.isTotal && r.label.length > 2)
    .map((r) => ({ label: r.label, value: r.value }))
    .filter((r) => r.value !== 0)
    .filter((r) =>
      opts.basis === "gross"
        ? true
        : r.label !== "Fund Transfers - Revenue" && r.label !== "Interagency Revenue",
    )
    .sort((a, b) => b.value - a.value);

  const total = sourceRows.reduce((s, r) => s + r.value, 0);

  push({
    id: "hub",
    stage: "hub",
    label: opts.basis === "gross" ? "Total city budget" : "Counted once",
    kind: "hub",
    value: total,
    rank: 0,
    detail:
      opts.basis === "gross"
        ? `Everything the budget authorises. ${fmt(transfers + interagency)} of it is money moving between city funds, counted on both sides.`
        : `Transfers between funds (${fmt(transfers)}) and interagency billing (${fmt(interagency)}) removed, so no dollar is counted twice.`,
  });

  sourceRows.forEach((r, i) => {
    const internal = INTERNAL_SOURCES.has(r.label);
    const id = `src:${r.label}`;
    push({
      id,
      stage: "source",
      label: CLASS_LABEL[r.label] ?? r.label,
      kind: internal ? "internal" : "external",
      value: r.value,
      rank: i,
      detail: internal
        ? r.label === "Beginning Fund Balance"
          ? "Carried over from prior years — real money, but not new money."
          : "An internal transaction, counted on both sides of the gross total."
        : undefined,
    });
    links.push({ id: `${id}->hub`, source: id, target: "hub", value: r.value, internal });
  });

  // ── uses: service areas, plus explicit buckets for everything else ──
  const areas = new Map<string, number>();
  for (const p of data.programs) {
    areas.set(p.serviceArea, (areas.get(p.serviceArea) ?? 0) + at(p.total, yi));
  }
  // Program totals already include interagency charges; in net mode those are
  // removed on the source side, so remove them here too.
  const netAdj = opts.basis === "gross" ? 0 : internalMS;
  const areaTotal = [...areas.values()].reduce((s, v) => s + v, 0);
  const bureauExpense = amountY(req, "expenses", "Bureau Expense");

  const buckets: { label: string; value: number; kind: NodeKind; detail?: string }[] = [];
  const unattributed = Math.max(0, bureauExpense - areaTotal);
  if (unattributed > 1000) {
    buckets.push({
      label: "Not broken out by program",
      value: unattributed,
      kind: "reserve",
      detail:
        "The citywide bureau-expense figure exceeds the sum of the published program pages by this much. Shown rather than absorbed into a category.",
    });
  }

  const held =
    amountY(req, "expenses", "Contingency") +
    amountY(req, "expenses", "Ending Fund Balance") +
    amountY(req, "expenses", "Reserved for Future Expenditure") +
    amountY(req, "expenses", "Debt Service Reserves");
  if (held > 0) {
    buckets.push({
      label: "Held, not spent",
      value: held,
      kind: "reserve",
      detail: "Contingency, reserves and ending balance — budgeted, but not spending on anything this year.",
    });
  }

  const debt = amountY(req, "expenses", "Debt Service");
  if (debt > 0) {
    buckets.push({ label: "Debt service (fund level)", value: debt, kind: "reserve", detail: "Principal and interest paid at fund level rather than by a program." });
  }

  if (opts.basis === "gross") {
    const out = amountY(req, "expenses", "Fund Transfers - Expense");
    if (out > 0) {
      buckets.push({
        label: "Transferred to other city funds",
        value: out,
        kind: "internal",
        detail: "The same dollars appear again as revenue in the receiving fund.",
      });
    }
  }

  let rank = 0;
  const areaEntries = [...areas.entries()]
    .map(([name, v]) => ({ name, v: v - (areaTotal ? (netAdj * v) / areaTotal : 0) }))
    .filter((a) => a.v > 0)
    .sort((a, b) => b.v - a.v);

  for (const a of areaEntries) {
    const id = `area:${a.name}`;
    push({ id, stage: "area", label: a.name, kind: "spending", value: a.v, rank: rank++ });
    links.push({ id: `hub->${id}`, source: "hub", target: id, value: a.v, internal: false });
  }
  for (const b of buckets) {
    const id = `area:${b.label}`;
    push({ id, stage: "area", label: b.label, kind: b.kind, value: b.value, rank: rank++, detail: b.detail });
    links.push({
      id: `hub->${id}`,
      source: "hub",
      target: id,
      value: b.value,
      internal: b.kind === "internal",
    });
  }

  // ── bureaus (expandable to programs) ───────────────────────────────
  const shown = new Set(areaEntries.map((a) => a.name));
  const scaleArea = (area: string) => {
    const raw = areas.get(area) ?? 0;
    const adj = areaEntries.find((a) => a.name === area)?.v ?? raw;
    return raw > 0 ? adj / raw : 1;
  };

  let brank = 0;
  for (const b of [...data.bureaus].sort((x, y) => at(y.values, yi) - at(x.values, yi))) {
    if (!shown.has(b.serviceArea)) continue;
    const k = scaleArea(b.serviceArea);
    const v = at(b.values, yi) * k;
    if (v <= 0) continue;
    const bid = `bureau:${b.slug}`;
    const expanded = opts.expanded.has(b.slug);

    push({
      id: bid,
      stage: "bureau",
      label: b.name,
      kind: "spending",
      value: v,
      rank: brank++,
      detail: `${b.programCount} program${b.programCount === 1 ? "" : "s"}${
        at(b.fte, yi) ? ` · ${at(b.fte, yi).toFixed(0)} positions` : ""
      }. Click to open its programs.`,
    });
    links.push({
      id: `area:${b.serviceArea}->${bid}`,
      source: `area:${b.serviceArea}`,
      target: bid,
      value: v,
      internal: false,
    });

    if (expanded) {
      const progs = data.programs
        .filter((p) => p.bureauSlug === b.slug && at(p.total, yi) > 0)
        .sort((x, y) => at(y.total, yi) - at(x.total, yi));
      for (const p of progs) {
        push({
          id: `prog:${p.slug}`,
          stage: "bureau",
          label: p.name,
          kind: "program",
          value: at(p.total, yi) * k,
          parentId: bid,
          rank: brank++,
          detail: p.description ?? undefined,
          page: p.pages[0],
        });
      }
    }
  }

  // ── objects ────────────────────────────────────────────────────────
  const objTotals = new Map<string, number>();
  const bureauObj = new Map<string, Map<string, number>>();
  for (const p of data.programs) {
    const k = scaleArea(p.serviceArea);
    const m = bureauObj.get(p.bureauSlug) ?? new Map<string, number>();
    for (const e of p.expenses) {
      if (!e.class) continue;
      if (opts.basis === "net" && e.class === "internal-materials-services") continue;
      const v = at(e.values, yi) * k;
      if (v <= 0) continue;
      objTotals.set(e.class, (objTotals.get(e.class) ?? 0) + v);
      m.set(e.class, (m.get(e.class) ?? 0) + v);
    }
    bureauObj.set(p.bureauSlug, m);
  }

  [...objTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([cls, v], i) => {
      push({
        id: `obj:${cls}`,
        stage: "object",
        label: CLASS_LABEL[cls] ?? cls,
        kind: "spending",
        value: v,
        rank: i,
      });
    });

  for (const [slug, m] of bureauObj) {
    const bid = `bureau:${slug}`;
    if (!nodes.some((n) => n.id === bid)) continue;
    for (const [cls, v] of m) {
      const oid = `obj:${cls}`;
      if (!nodes.some((n) => n.id === oid)) continue;
      links.push({ id: `${bid}->${oid}`, source: bid, target: oid, value: v, internal: false });
    }
  }

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s, nodes.filter((n) => n.stage === s).sort((a, b) => a.rank - b.rank)]),
  ) as Record<Stage, FlowNode[]>;

  return { nodes, links, byStage, total, unattributed };
}

function fmt(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString("en-US")}`;
}
