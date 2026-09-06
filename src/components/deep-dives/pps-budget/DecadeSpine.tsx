import { DECADE } from "@/lib/pps-budget/data";
import { fmtCount, fmtMillionsFromK } from "@/lib/pps-budget/engine";

/**
 * Act III: the decade spine, FY2016-17 through FY2026-27.
 *
 * Server component, pure CSS bars, no charting library. One vertical fern bar
 * per year for the adopted nominal General Fund, an ember dot overlaid at the
 * same year's General Fund in 2026 dollars, and October enrollment printed
 * under every year (forecast years marked). The picture: nominal bars climb
 * every year until this one while the ember dots crest in 2021-22 and slide.
 * The full Cmd+F-able table follows below the chart.
 */

type DecadeRow = (typeof DECADE)[number];

const CHART_MAX = DECADE.reduce((m, d) => Math.max(m, d.gfK, d.realGfK), 0);
const PEAK = DECADE.reduce((p, d) => (d.realGfK > p.realGfK ? d : p));
const LAST = DECADE[DECADE.length - 1];
const PCT_DOWN = Math.round(((PEAK.realGfK - LAST.realGfK) / PEAK.realGfK) * 100);

function rowNote(d: DecadeRow): string | null {
  return "note" in d ? d.note : null;
}

/** "2016-17" -> "16-17", to fit the column labels. */
function shortFy(fy: string): string {
  return fy.slice(2);
}

export default function DecadeSpine() {
  return (
    <div>
      {/* ── Kicker ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] border-l-[3px] border-l-[var(--color-ember)] bg-white p-5">
        <h3 className="font-editorial text-[20px] leading-snug text-[var(--color-ink)]">
          Nominal dollars up every year until this one. Purchasing power down{" "}
          <span className="font-mono tabular-nums">{PCT_DOWN}</span> percent from the{" "}
          {PEAK.fy} peak.
        </h3>
      </div>

      {/* ── The decade chart ── */}
      <div className="mt-6 rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-4 py-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-fern)]" />
            General Fund, adopted
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-ember)]" />
            Same dollars, 2026 prices
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-0 px-2 pb-4 pt-9 sm:min-w-[640px] sm:px-4">
            <div className="flex items-end gap-1.5 border-b border-[var(--color-parchment)]">
              {DECADE.map((d) => {
                const barPct = (d.gfK / CHART_MAX) * 100;
                const realPct = (d.realGfK / CHART_MAX) * 100;
                return (
                  <div key={d.fy} className="relative h-44 flex-1">
                    <div
                      className="absolute inset-x-1 bottom-0 rounded-sm bg-[var(--color-fern)]"
                      style={{ height: `${barPct.toFixed(2)}%`, opacity: d.forecast ? 0.55 : 1 }}
                    />
                    <div
                      className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-white bg-[var(--color-ember)]"
                      style={{ bottom: `calc(${realPct.toFixed(2)}% - 4px)` }}
                    />
                    {d.fy === PEAK.fy ? (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ember)]"
                        style={{ bottom: `calc(${realPct.toFixed(2)}% + 7px)` }}
                      >
                        real-dollar peak
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {DECADE.map((d) => (
                <div key={d.fy} className="flex-1 text-center">
                  <p className="font-mono text-[9px] sm:text-[10px] tabular-nums text-[var(--color-ink)]">
                    {shortFy(d.fy)}
                  </p>
                  <p className="hidden sm:block font-mono text-[9px] tabular-nums text-[var(--color-ink-muted)]">
                    {fmtCount(d.enrollment)}
                    {d.forecast ? " (f)" : ""}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Bars from zero · <span className="hidden sm:inline">October enrollment under each year · </span>(f) = forecast
            </p>
          </div>
        </div>
      </div>

      {/* ── Full data table ── */}
      <div className="mt-6 overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-white">
        <table className="w-full sm:min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
              <th className="px-2 sm:px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Fiscal year
              </th>
              <th className="px-2 sm:px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                General Fund
              </th>
              <th className="hidden sm:table-cell px-2 sm:px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                All funds
              </th>
              <th className="px-2 sm:px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Enrollment
              </th>
              <th className="px-2 sm:px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                GF in 2026 $
              </th>
              <th className="hidden sm:table-cell px-2 sm:px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-parchment)]">
            {DECADE.map((d) => {
              const note = rowNote(d);
              return (
                <tr key={d.fy} className={d.fy === PEAK.fy ? "bg-[var(--color-paper-warm)]" : undefined}>
                  <td className="px-2 sm:px-4 py-2.5 font-mono text-[12px] tabular-nums text-[var(--color-ink)]">
                    {d.fy}
                    {d.forecast ? " (f)" : ""}
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-[var(--color-ink-light)]">
                    {fmtMillionsFromK(d.gfK)}
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-[var(--color-ink-light)]">
                    {fmtMillionsFromK(d.allFundsK)}
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-[var(--color-ink-light)]">
                    {fmtCount(d.enrollment)}
                  </td>
                  <td
                    className={`px-2 sm:px-4 py-2.5 text-right font-mono text-[12px] tabular-nums ${
                      d.fy === PEAK.fy
                        ? "font-bold text-[var(--color-ember)]"
                        : "text-[var(--color-ink-light)]"
                    }`}
                  >
                    {fmtMillionsFromK(d.realGfK)}
                  </td>
                  <td className="hidden sm:table-cell min-w-[220px] px-4 py-2.5 text-[12px] leading-snug text-[var(--color-ink-light)]">
                    {note ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        PPS adopted budget books · PPS ACFR enrollment through 2024-25, TSCC forecasts after ·
        real dollars via BLS CPI-U, calendar-2026 base
      </p>
    </div>
  );
}
