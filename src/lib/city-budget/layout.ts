/**
 * Sankey layout. Pure functions, no React, no DOM, so the numbers can be
 * checked directly.
 *
 * Two pieces are worth explaining because no off-the-shelf layout does them:
 *
 * 1. `solveColumnScale`. Tiny nodes need a minimum height or they vanish, but
 *    raising them adds height, which overflows the column, which changes the
 *    scale, which changes which nodes are below the floor. That is a fixed
 *    point, so it is iterated to convergence rather than approximated once.
 *
 * 2. `declutter`. Labels want to sit at their node's centre, but adjacent
 *    nodes can be 3px apart. Pushing labels apart greedily drifts them far
 *    from their nodes; this is isotonic regression (pool-adjacent-violators),
 *    which finds the arrangement closest to the wanted positions subject to a
 *    minimum spacing. O(n), and exactly optimal.
 *
 * One global scale is used for every column, so a ribbon of a given thickness
 * means the same number of dollars everywhere in the diagram.
 */

import type { FlowGraph, FlowNode, Stage } from "./graph";
import { STAGES } from "./graph";

export interface LayoutOpts {
  width: number;
  height: number;
  nodeWidth: number;
  nodeGap: number;
  minNodeHeight: number;
  labelMinHeight: number;
  labelPitch: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export const DEFAULT_OPTS: LayoutOpts = {
  width: 1180,
  height: 1180,
  nodeWidth: 13,
  nodeGap: 4,
  minNodeHeight: 2,
  labelMinHeight: 13,
  labelPitch: 15,
  padding: { top: 8, right: 8, bottom: 8, left: 8 },
};

export interface LaidNode extends FlowNode {
  x: number;
  y: number;
  w: number;
  h: number;
  column: number;
  labeled: boolean;
  labelY: number;
  /** Labels sit left of the first column and right of every other. */
  labelSide: "left" | "right";
}

export interface LaidLink {
  id: string;
  source: string;
  target: string;
  value: number;
  internal: boolean;
  d: string;
  thickness: number;
}

export interface Layout {
  nodes: LaidNode[];
  links: LaidLink[];
  columns: { stage: Stage; x: number; total: number }[];
  height: number;
  scale: number;
  /** Nodes raised to the minimum height — disclosed, never hidden. */
  floored: number;
  /** Dollars below which a node gets no inline label at this size. */
  labelThreshold: number;
}

/**
 * Pixels per dollar for one column, plus which entries had to be floored.
 * Iterates because flooring changes the space left for everything else.
 */
export function solveColumnScale(
  values: number[],
  o: { height: number; gap: number; minHeight: number },
): { scale: number; floored: number[] } {
  const n = values.length;
  if (!n) return { scale: 0, floored: [] };
  const usable = o.height - o.gap * (n - 1);
  if (usable <= 0) return { scale: 0, floored: values.map((_, i) => i) };

  let floored: number[] = [];
  for (let iter = 0; iter < n + 2; iter++) {
    const flooredSet = new Set(floored);
    const rest = values.map((v, i) => (flooredSet.has(i) ? 0 : v)).reduce((s, v) => s + v, 0);
    const room = usable - o.minHeight * floored.length;
    const scale = rest > 0 ? room / rest : 0;
    const next = values
      .map((v, i) => ({ v, i }))
      .filter(({ v, i }) => flooredSet.has(i) || v * scale < o.minHeight)
      .map(({ i }) => i);
    if (next.length === floored.length) return { scale: Math.max(0, scale), floored };
    floored = next;
  }
  return { scale: 0, floored };
}

/**
 * Isotonic regression: positions closest to `anchors` subject to
 * y[i+1] - y[i] >= pitch, then clamped into [lo, hi].
 * Anchors must be non-decreasing, which they are — column order is y order.
 */
export function declutter(anchors: number[], pitch: number, lo: number, hi: number): number[] {
  const n = anchors.length;
  if (!n) return [];
  // Shift so the constraint becomes "non-decreasing".
  const a = anchors.map((v, i) => v - i * pitch);

  const val: number[] = [];
  const cnt: number[] = [];
  for (const x of a) {
    val.push(x);
    cnt.push(1);
    // Pool adjacent violators.
    while (val.length > 1 && val[val.length - 2] > val[val.length - 1]) {
      const v2 = val.pop()!;
      const c2 = cnt.pop()!;
      const v1 = val.pop()!;
      const c1 = cnt.pop()!;
      val.push((v1 * c1 + v2 * c2) / (c1 + c2));
      cnt.push(c1 + c2);
    }
  }

  const out: number[] = [];
  for (let k = 0; k < val.length; k++) for (let j = 0; j < cnt[k]; j++) out.push(val[k]);

  const res = out.map((v, i) => v + i * pitch);
  // Clamp without breaking the spacing constraint.
  const shiftDown = Math.max(0, lo - res[0]);
  const shiftUp = Math.max(0, res[n - 1] - hi);
  const shift = shiftDown - shiftUp;
  return res.map((v) => v + shift);
}

/** Closed filled ribbon — supports different thickness at each end. */
export function ribbonPath(
  a: { x: number; y: number; t: number },
  b: { x: number; y: number; t: number },
  curvature = 0.5,
): string {
  const c1 = a.x + (b.x - a.x) * curvature;
  const c2 = b.x - (b.x - a.x) * curvature;
  return [
    `M${a.x},${a.y}`,
    `C${c1},${a.y} ${c2},${b.y} ${b.x},${b.y}`,
    `L${b.x},${b.y + b.t}`,
    `C${c2},${b.y + b.t} ${c1},${a.y + a.t} ${a.x},${a.y + a.t}`,
    "Z",
  ].join(" ");
}

export function computeLayout(g: FlowGraph, oIn: Partial<LayoutOpts> = {}): Layout {
  const o = { ...DEFAULT_OPTS, ...oIn };
  const innerW = o.width - o.padding.left - o.padding.right;
  const innerH = o.height - o.padding.top - o.padding.bottom;

  // Programs render inside their bureau's column, so a bureau that is expanded
  // is replaced by its children rather than adding a column.
  const colNodes: FlowNode[][] = STAGES.map((s) => {
    const list = g.byStage[s] ?? [];
    if (s !== "bureau") return list;
    const expandedParents = new Set(list.filter((n) => n.parentId).map((n) => n.parentId!));
    return list.filter((n) => n.parentId || !expandedParents.has(n.id));
  });

  const activeCols = colNodes.map((list, i) => ({ list, i })).filter((c) => c.list.length);

  // One scale for the whole diagram: the tightest column wins, so equal
  // thickness always means equal dollars.
  let scale = Infinity;
  for (const c of activeCols) {
    const s = solveColumnScale(
      c.list.map((n) => n.value),
      { height: innerH, gap: o.nodeGap, minHeight: o.minNodeHeight },
    );
    if (s.scale > 0) scale = Math.min(scale, s.scale);
  }
  if (!Number.isFinite(scale) || scale <= 0) scale = innerH / Math.max(1, g.total);

  const colCount = activeCols.length;
  const gapX = colCount > 1 ? (innerW - o.nodeWidth * colCount) / (colCount - 1) : 0;

  const laid: LaidNode[] = [];
  const columns: Layout["columns"] = [];
  let floored = 0;
  let maxBottom = 0;

  activeCols.forEach((c, ci) => {
    const x = o.padding.left + ci * (o.nodeWidth + gapX);
    let y = o.padding.top;
    const heights = c.list.map((n) => {
      const h = n.value * scale;
      if (h < o.minNodeHeight) floored++;
      return Math.max(o.minNodeHeight, h);
    });
    const colH = heights.reduce((s, h) => s + h, 0) + o.nodeGap * (c.list.length - 1);
    // Centre short columns so the diagram reads as one object.
    y += Math.max(0, (innerH - colH) / 2);

    c.list.forEach((n, i) => {
      const h = heights[i];
      laid.push({
        ...n,
        x,
        y,
        w: o.nodeWidth,
        h,
        column: ci,
        labeled: h >= o.labelMinHeight,
        labelY: y + h / 2,
        labelSide: ci === 0 ? "left" : "right",
      });
      y += h + o.nodeGap;
      maxBottom = Math.max(maxBottom, y);
    });

    columns.push({
      stage: STAGES[c.i],
      x,
      total: c.list.reduce((s, n) => s + n.value, 0),
    });
  });

  // Declutter labels per column.
  for (let ci = 0; ci < columns.length; ci++) {
    const inCol = laid.filter((n) => n.column === ci && n.labeled).sort((a, b) => a.y - b.y);
    if (inCol.length < 2) continue;
    const ys = declutter(
      inCol.map((n) => n.y + n.h / 2),
      o.labelPitch,
      o.padding.top + o.labelPitch / 2,
      o.height - o.padding.bottom - o.labelPitch / 2,
    );
    inCol.forEach((n, i) => (n.labelY = ys[i]));
  }

  // ── ribbons ────────────────────────────────────────────────────────
  const byId = new Map(laid.map((n) => [n.id, n]));
  // A program's ribbons attach to the program node, not its bureau.
  const resolve = (id: string) => {
    const n = byId.get(id);
    if (n) return n;
    return undefined;
  };

  const outCursor = new Map<string, number>();
  const inCursor = new Map<string, number>();
  const links: LaidLink[] = [];

  // Sorting by target/source position keeps ribbons from crossing inside a node.
  const ordered = [...g.links].sort((a, b) => {
    const sa = resolve(a.source);
    const sb = resolve(b.source);
    if (sa && sb && sa.y !== sb.y) return sa.y - sb.y;
    const ta = resolve(a.target);
    const tb = resolve(b.target);
    return (ta?.y ?? 0) - (tb?.y ?? 0);
  });

  for (const l of ordered) {
    const s = resolve(l.source);
    const t = resolve(l.target);
    if (!s || !t) continue;
    const th = Math.max(0.6, l.value * scale);

    const so = outCursor.get(s.id) ?? 0;
    const ti = inCursor.get(t.id) ?? 0;
    // Never let ports run past their node.
    const sy = s.y + Math.min(so, Math.max(0, s.h - th));
    const ty = t.y + Math.min(ti, Math.max(0, t.h - th));
    outCursor.set(s.id, so + th);
    inCursor.set(t.id, ti + th);

    links.push({
      id: l.id,
      source: l.source,
      target: l.target,
      value: l.value,
      internal: l.internal,
      thickness: th,
      d: ribbonPath({ x: s.x + s.w, y: sy, t: th }, { x: t.x, y: ty, t: th }),
    });
  }

  return {
    nodes: laid,
    links,
    columns,
    height: Math.max(o.height, maxBottom + o.padding.bottom),
    scale,
    floored,
    labelThreshold: o.labelMinHeight / (scale || 1),
  };
}
