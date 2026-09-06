/**
 * Table assembly.
 *
 * The layout puts a wrapped label AROUND its value line, not before it:
 *
 *       General Fund              <- fragment (no values)
 *                    $0  $0  $0   <- values, no inline label
 *       Discretionary             <- fragment (no values)
 *
 * so "General Fund Discretionary" has one fragment above and one below. A
 * naive "append to previous row" rule would glue "General Fund" onto the
 * preceding row instead.
 *
 * The rule used here: each label-only fragment attaches to the NEAREST
 * value-row-without-an-inline-label, measured in lines; ties go to the row
 * above (suffix). Deterministic, and correct on every wrap observed in both
 * volumes — including three-in-a-row cases like
 *
 *       General Fund              -> prefix of row A
 *                    $0  $0       <- row A
 *       Discretionary             -> suffix of row A  (distance 1 vs 2)
 *       General Fund              -> prefix of row B  (distance 1 vs 2)
 *                    $0  $0       <- row B
 *       Overhead                  -> suffix of row B
 */

import { detectHeaderBlock, assignToColumns, type ColumnBand, type Token } from "./columns";
import { parseMoney, type Values, emptyValues } from "./numbers";
import { joinFragments, normalize, STRUCTURAL } from "./labels";

export interface Row {
  label: string;
  rawLabel: string;
  /** Indentation of the label as printed — depth is derived from this. */
  indent: number;
  depth: number;
  values: Values;
  /** Untouched cell text, so FTE can keep its decimals. */
  raw: (string | null)[];
  isTotal: boolean;
  page: number;
  line: number;
}

export interface Table {
  bands: ColumnBand[];
  rows: Row[];
  grandTotal: Values | null;
  orphans: { token: Token; page: number; line: number; text: string }[];
  startLine: number;
  endLine: number;
}

export interface SourceLine {
  text: string;
  page: number;
  /** Index within the enclosing block, for error messages. */
  idx: number;
}

interface Draft {
  inlineLabel: string;
  indent: number;
  values: (string | null)[];
  page: number;
  idx: number;
  prefixes: string[];
  suffixes: string[];
  needsFragments: boolean;
}

const SECTION_END =
  /^(Overview|Program Description and Goals|Performance|Summary of Budget Decisions|Positions? by|Revenues? by|Expenses? by|Legal Requirement|Fund Overview)/i;

/**
 * Parse one table beginning at or after `start`.
 * Returns null when no header block is found before `limit`.
 */
export function parseTable(
  lines: SourceLine[],
  start: number,
  limit = lines.length,
): Table | null {
  // ── locate the header block ────────────────────────────────────────
  let hdr: ReturnType<typeof detectHeaderBlock> = null;
  let hdrAt = -1;
  for (let i = start; i < limit; i++) {
    const h = detectHeaderBlock(lines.slice(i, i + 3).map((l) => l.text), 0, 3);
    if (h) {
      hdr = h;
      hdrAt = i;
      break;
    }
  }
  if (!hdr) return null;

  const bands = hdr.bands;
  const bodyStart = hdrAt + hdr.endIndex + 1;

  // ── first pass: classify each line ─────────────────────────────────
  const drafts: Draft[] = [];
  const fragments: { text: string; indent: number; idx: number; page: number }[] = [];
  const orphans: Table["orphans"] = [];
  let end = bodyStart;
  let blankRun = 0;

  for (let i = bodyStart; i < limit; i++) {
    const { text, page } = lines[i];
    end = i;

    // The centered page-number folio sits inside the money columns and would
    // otherwise be assigned as a value (observed: "147" landing in the
    // 2023-24 column on the General Fund page).
    if (/^\s*\d{1,4}\s*$/.test(text)) continue;

    if (!text.trim()) {
      blankRun++;
      // Two blank lines then a non-value line ends the table.
      if (blankRun >= 2 && drafts.length) {
        const nxt = lines.slice(i + 1, i + 4).find((l) => l.text.trim());
        if (nxt && (SECTION_END.test(nxt.text.trim()) || !/\$?[\d,]/.test(nxt.text))) break;
      }
      continue;
    }
    if (SECTION_END.test(text.trim()) && drafts.length) break;
    blankRun = 0;

    const a = assignToColumns(text, bands);
    const hasValues = a.values.some((v) => v !== null);

    if (!hasValues) {
      if (a.labelText) {
        fragments.push({
          text: a.labelText,
          indent: text.length - text.trimStart().length,
          idx: drafts.length ? drafts.length : 0,
          page,
        });
        // Remember position by line index for the distance rule.
        (fragments[fragments.length - 1] as { lineIdx?: number }).lineIdx = i;
      }
      continue;
    }

    for (const o of a.orphans) {
      orphans.push({ token: o, page, line: i, text });
    }

    drafts.push({
      inlineLabel: a.labelText,
      indent: a.labelText ? text.length - text.trimStart().length : -1,
      values: a.values,
      page,
      idx: i,
      prefixes: [],
      suffixes: [],
      needsFragments: !a.labelText,
    });

    if (normalize(a.labelText) === "grand total") break;
  }

  // ── attach fragments to the nearest value row ──────────────────────
  //
  // Any value row can take fragments, not just label-less ones. Service-area
  // roll-ups print three-line names whose MIDDLE line carries both the middle
  // words and the values:
  //
  //    Hydroelectric Power
  //    Renewal Replacement    $0   $0   $111,456   $111,456
  //    Fund
  //
  // Ties are broken toward the row that has no inline label (it needs one),
  // and otherwise toward the row below, so a fragment starts the next name
  // rather than extending the previous one.
  for (const f of fragments) {
    const fi = (f as { lineIdx?: number }).lineIdx ?? -1;
    if (fi < 0 || !drafts.length) continue;

    let best: Draft | null = null;
    let bestDist = Infinity;
    for (const d of drafts) {
      const dist = Math.abs(d.idx - fi);
      if (dist > 2) continue; // a label never wraps further than one line away
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
        continue;
      }
      if (dist === bestDist && best) {
        // 1. A row with no inline label needs one more than a row that has one.
        if (d.needsFragments !== best.needsFragments) {
          if (d.needsFragments) best = d;
          continue;
        }
        // 2. A row above that already collected a prefix is mid-wrap and is
        //    still waiting for the tail of its name ("… Renewal Replacement"
        //    + "Fund"). Finish it before starting the next one.
        // Annotated because `best` is reassigned from `above` just below, and
        // inferring one from the other is circular.
        const above: Draft | null = d.idx < fi ? d : best.idx < fi ? best : null;
        if (above && above.prefixes.length) {
          best = above;
          continue;
        }
        // 3. Otherwise the fragment starts the next name.
        if (d.idx > fi && best.idx < fi) best = d;
      }
    }
    if (!best) continue;

    if (fi < best.idx) best.prefixes.push(f.text);
    else best.suffixes.push(f.text);
    if (best.indent < 0) best.indent = f.indent;
  }

  // ── derive depth from the distinct indents actually present ────────
  const indents = [...new Set(drafts.map((d) => (d.indent < 0 ? 0 : d.indent)))].sort(
    (a, b) => a - b,
  );
  const depthOf = new Map<number, number>();
  indents.forEach((v, i) => depthOf.set(v, i));

  // ── materialize ────────────────────────────────────────────────────
  const rows: Row[] = [];
  let grandTotal: Values | null = null;

  for (const d of drafts) {
    const rawLabel = joinFragments([...d.prefixes, d.inlineLabel, ...d.suffixes]);
    const label = rawLabel;
    const values = emptyValues();
    for (let i = 0; i < bands.length && i < 4; i++) values[i] = parseMoney(d.values[i]);

    const n = normalize(label);
    const isTotal = n === "grand total" || STRUCTURAL.has(n) || /^total\b/.test(n);

    if (n === "grand total") {
      grandTotal = values;
      continue;
    }
    if (!label) continue;

    rows.push({
      label,
      rawLabel,
      indent: d.indent < 0 ? 0 : d.indent,
      depth: depthOf.get(d.indent < 0 ? 0 : d.indent) ?? 0,
      values,
      raw: d.values.slice(0, 4),
      isTotal,
      page: d.page,
      line: d.idx,
    });
  }

  return { bands, rows, grandTotal, orphans, startLine: hdrAt, endLine: end };
}

/** Map a table's bands onto the canonical 4-year slots. */
export function alignToYears(
  table: Table,
  years: readonly string[],
): { values: (r: Row) => Values; grandTotal: Values | null } {
  const slot = new Map<number, number>();
  table.bands.forEach((b, i) => {
    const y = years.indexOf(b.year);
    if (y >= 0) slot.set(i, y);
  });

  const remap = (v: Values): Values => {
    const out = emptyValues();
    slot.forEach((yearIdx, bandIdx) => {
      out[yearIdx] = v[bandIdx] ?? null;
    });
    return out;
  };

  return {
    values: (r: Row) => remap(r.values),
    grandTotal: table.grandTotal ? remap(table.grandTotal) : null,
  };
}
