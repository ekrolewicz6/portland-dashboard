import { ESSER_TIMELINE } from "@/lib/pps-budget/data";

/**
 * Act III: the ESSER cliff, "one-time money in, cuts out."
 *
 * Server component, pure CSS bars. Left: a single tall sage bar for the
 * almost-$115M federal relief award (2020-2024). Right: the cut sequence as
 * ascending clay bars per fiscal year, on the same dollar scale, so the
 * reader sees the cuts climbing toward the size of the money that briefly
 * papered over them. The 2023-24 row has no public gap figure (gapM is
 * null), so it renders as a labeled dashed band, and 2027-28 is projected,
 * so it renders hatched. The committee's spring 2023 warning connects the
 * two sides as a pull-quote.
 */

function fmtM(m: number): string {
  return `$${m.toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
}

/** Clay hatch for the projected year, tuned for the paper background. */
const HATCH =
  "repeating-linear-gradient(45deg, rgba(184,92,58,0.75) 0 6px, rgba(184,92,58,0.22) 6px 12px)";

/** Sage hatch for the year the gap was papered over with the last relief. */
const SAGE_HATCH =
  "repeating-linear-gradient(45deg, rgba(122,158,126,0.8) 0 6px, rgba(122,158,126,0.25) 6px 12px)";

/** Cuts since the relief ran out, for the takeaway line: 30 + 40 + 56.3. */
const CUTS_SO_FAR_M = 126;

type Cut = (typeof ESSER_TIMELINE.cuts)[number];

function isProjected(c: Cut): boolean {
  return "projected" in c && c.projected === true;
}

/** One horizontal row on the shared $115M scale. */
function BarRow({
  label,
  sub,
  value,
  pctWidth,
  fill,
  overflow = false,
  bold = false,
}: {
  label: string;
  sub?: string;
  value: string;
  pctWidth: number;
  fill: { color?: string; hatch?: string };
  overflow?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)_96px] items-center gap-x-3 sm:grid-cols-[96px_minmax(0,1fr)_110px] sm:gap-x-4">
      <div className="text-right">
        <p
          className={`font-mono text-[11px] tabular-nums leading-tight ${
            bold ? "font-bold text-[var(--color-ink)]" : "font-semibold text-[var(--color-ink-muted)]"
          }`}
        >
          {label}
        </p>
        {sub ? (
          <p className="font-mono text-[9px] leading-tight text-[var(--color-ink-muted)]">{sub}</p>
        ) : null}
      </div>
      <div className="relative h-5 min-w-0 overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${Math.min(pctWidth, 100)}%`,
            backgroundColor: fill.color,
            backgroundImage: fill.hatch,
          }}
        />
        {overflow && (
          <span
            aria-hidden
            className="absolute inset-y-0 right-1 flex items-center font-mono text-[11px] font-bold text-white"
          >
            ›››
          </span>
        )}
      </div>
      <p
        className={`font-mono text-[11px] tabular-nums leading-tight ${
          bold ? "font-bold text-[var(--color-ink)]" : "font-semibold text-[var(--color-ink-light)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function EsserCliff() {
  return (
    <div className="space-y-6">
      {/* ── The two sides of the cliff, one dollar scale ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            One-time money in, cuts out
          </p>
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
            full width = {fmtM(ESSER_TIMELINE.esserTotalM)} of relief
          </span>
        </div>
        <h3 className="mt-2 font-editorial text-[20px] leading-snug text-[var(--color-ink)]">
          Four years of federal aid hid the deficit. Now it surfaces as cuts, bigger every year.
        </h3>

        <div className="mt-6 space-y-2.5">
          {/* The relief, full width: the reference bar */}
          <BarRow
            label="2020-24"
            sub="4 years"
            value={fmtM(ESSER_TIMELINE.esserTotalM)}
            pctWidth={100}
            fill={{ color: "var(--color-sage)" }}
            bold
          />
          <p className="py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-clay)] sm:pl-[112px]">
            The money runs out. The cuts begin. ↓
          </p>
          {/* One row per cut year, same scale */}
          {ESSER_TIMELINE.cuts.map((cut) => {
            const projected = isProjected(cut);
            if (cut.gapM === null) {
              return (
                <BarRow
                  key={cut.fy}
                  label={cut.fy}
                  value="no figure"
                  pctWidth={22}
                  fill={{ hatch: SAGE_HATCH }}
                  sub="patched"
                />
              );
            }
            return (
              <BarRow
                key={cut.fy}
                label={cut.fy}
                sub={projected ? "projected" : undefined}
                value={`${fmtM(cut.gapM)}${projected ? "+" : ""}`}
                pctWidth={(cut.gapM / ESSER_TIMELINE.esserTotalM) * 100}
                fill={projected ? { hatch: HATCH } : { color: "var(--color-clay)" }}
              />
            );
          })}
          {/* The cumulative punchline: cuts have already passed the relief */}
          <div className="border-t border-[var(--color-parchment)] pt-2.5">
            <BarRow
              label="Total cut"
              sub="3 years"
              value={`$${CUTS_SO_FAR_M}M+`}
              pctWidth={(CUTS_SO_FAR_M / ESSER_TIMELINE.esserTotalM) * 100}
              fill={{ color: "var(--color-clay-deep, #8f4023)" }}
              overflow
              bold
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-parchment)] pt-4">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-sage)]" />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              temporary federal relief
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-clay)]" />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              that year&apos;s gap, closed by cuts
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-3 rounded-sm" style={{ backgroundImage: HATCH }} />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">projected</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-3 rounded-sm"
              style={{ backgroundImage: SAGE_HATCH }}
            />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              gap patched with the last relief, no public figure
            </span>
          </span>
        </div>
      </div>

      {/* ── The committee saw it coming ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] border-l-[3px] border-l-[var(--color-clay)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          The warning, on the record
        </p>
        <blockquote className="mt-3 font-editorial text-[18px] leading-snug text-[var(--color-ink)] sm:text-[20px]">
          {ESSER_TIMELINE.cliffNote}
        </blockquote>
      </div>
      <p className="font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
        Sources: TSCC reviews; PPS Community Budget Review Committee, spring 2023 and 2026-27; PPS adopted budget FY2023-24.
      </p>
    </div>
  );
}
