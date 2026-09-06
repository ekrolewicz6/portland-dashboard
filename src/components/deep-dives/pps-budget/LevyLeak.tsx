import { COMPRESSION_SERIES, HEADLINE, LEVY_SERIES } from "@/lib/pps-budget/data";
import { fmtCount, fmtMoney } from "@/lib/pps-budget/engine";

/**
 * Act II centerpiece: "the levy leak" (document.md, the compression section).
 *
 * Three stacked reads of the same defect:
 *   1. The compression ramp: the Measure 5 loss across all PPS tax lines,
 *      $20.9M rising to a projected $53.4M, one CSS bar per year, the
 *      projected year hatched.
 *   2. The headline: of the $1.99 per $1,000 voters approved, $1.5142
 *      actually arrives. The rest never reaches the district.
 *   3. The positions table: receipts drift up while funded teacher positions
 *      slide from 916 to 718, because each teacher costs more every year.
 *
 * Server component, light section, pure CSS bars, no chart library.
 */

type CompressionRow = (typeof COMPRESSION_SERIES)[number];
type LevyRow = (typeof LEVY_SERIES)[number];

/** Shared scale for the ramp: the projected FY2026-27 loss is the widest bar. */
const MAX_LOSS = HEADLINE.compressionFy27M; // $53.4M

/** Clay hatch: dollars that exist on paper but never arrive. */
const HATCH =
  "repeating-linear-gradient(45deg, rgba(184,92,58,0.85) 0 6px, rgba(184,92,58,0.28) 6px 12px)";

const DELIVERED_PCT = ((HEADLINE.levyEffectiveRate / HEADLINE.levyVotedRate) * 100).toFixed(2);
const LOST_RATE = HEADLINE.levyVotedRate - HEADLINE.levyEffectiveRate; // $0.48 per $1,000

const FIRST_LEVY = LEVY_SERIES[0];
const LAST_LEVY = LEVY_SERIES[LEVY_SERIES.length - 1];

function isProjected(row: CompressionRow | LevyRow): boolean {
  return "projected" in row && row.projected === true;
}

function fmtLoss(m: number): string {
  return `$${m.toFixed(1)}M`;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
      {children}
    </p>
  );
}

function Swatch({ fill, hatch }: { fill?: string; hatch?: boolean }) {
  return (
    <span
      aria-hidden
      className="h-2 w-3 shrink-0 rounded-sm"
      style={hatch ? { backgroundImage: HATCH } : { backgroundColor: fill }}
    />
  );
}

function RampRow({ row }: { row: CompressionRow }) {
  const projected = isProjected(row);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">
        {row.fy}
      </span>
      <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
        <div
          className={`h-full rounded-sm ${projected ? "" : "bg-[var(--color-clay)]"}`}
          style={{
            width: `${((row.lossM / MAX_LOSS) * 100).toFixed(2)}%`,
            ...(projected ? { backgroundImage: HATCH } : {}),
          }}
        />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums text-[var(--color-ink)]">
        {fmtLoss(row.lossM)}
      </span>
    </div>
  );
}

const TH = "px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]";

export default function LevyLeak() {
  return (
    <div className="space-y-6">
      {/* ── 1. The compression ramp ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Eyebrow>Compression, district-wide: the money deleted each year</Eyebrow>
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
            full width = {fmtLoss(MAX_LOSS)}
          </span>
        </div>
        <div className="mt-4 space-y-1.5">
          {COMPRESSION_SERIES.map((row) => (
            <RampRow key={row.fy} row={row} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5">
            <Swatch fill="var(--color-clay)" />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              deleted before collection
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Swatch hatch />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">projected</span>
          </span>
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
            no comparable 2025-26 total appears in the sources
          </span>
        </div>
      </div>

      {/* ── 2. The headline: approved vs arrives ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] border-l-[3px] border-l-[var(--color-clay)] bg-white p-5 sm:p-6">
        <h3 className="font-editorial text-[20px] leading-snug text-[var(--color-ink)]">
          Voters said yes to $1.99. About $1.51 arrives.
        </h3>
        <div className="mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Eyebrow>What voters approved</Eyebrow>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--color-ink)]">
              ${HEADLINE.levyVotedRate.toFixed(2)} per $1,000
            </span>
          </div>
          <div className="relative mt-1.5 h-8 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--color-fern)]"
              style={{ width: `${DELIVERED_PCT}%` }}
            />
            <div
              className="absolute inset-y-0 right-0"
              style={{ left: `${DELIVERED_PCT}%`, backgroundImage: HATCH }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Swatch fill="var(--color-fern)" />
              <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
                what arrives · ${HEADLINE.levyEffectiveRate.toFixed(4)}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch hatch />
              <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
                lost to compression · ${LOST_RATE.toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. The positions table ── */}
      <div>
        <Eyebrow>More money in, fewer teachers out</Eyebrow>
        <div className="mt-4 overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-white">
          <table className="w-full sm:min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
                <th className={TH}>Year</th>
                <th className={`${TH} text-right`}>Receipts</th>
                <th className={`${TH} text-right`}>Positions funded</th>
                <th className={`${TH} text-right`}>Average teacher cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-parchment)]">
              {LEVY_SERIES.map((row, i) => {
                const slide = i === 0 || i === LEVY_SERIES.length - 1;
                const num = `px-4 py-2.5 text-right font-mono text-[12px] tabular-nums ${slide ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-light)]"}`;
                return (
                  <tr key={row.fy}>
                    <td className="px-4 py-2.5 font-mono text-[12px] tabular-nums text-[var(--color-ink)]">
                      {row.fy}
                      {isProjected(row) && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                          proj.
                        </span>
                      )}
                    </td>
                    <td className={num}>${row.receiptsM.toFixed(1)}M</td>
                    <td className={num}>
                      {fmtCount(row.positions)}
                      {"note" in row && (
                        <span aria-hidden className="ml-1 text-[var(--color-clay)]">
                          *
                        </span>
                      )}
                    </td>
                    <td className={num}>{fmtMoney(row.avgCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {LEVY_SERIES.map((row) =>
          "note" in row ? (
            <p key={row.fy} className="mt-2 text-[11px] leading-snug text-[var(--color-clay)]">
              <span aria-hidden>* </span>
              {row.fy}: {row.note}.
            </p>
          ) : null,
        )}
      </div>

      {/* ── Footnote ── */}
      <p className="border-t border-[var(--color-parchment)] pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        Sources: Tax Supervising &amp; Conservation Commission annual report · Community Budget
        Review Committee levy reviews
      </p>
    </div>
  );
}
