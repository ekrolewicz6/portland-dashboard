import { fmtMoney } from "@/lib/city-budget/types";
import { PEERS, POLICE_SHARE, LINCOLN_FISC, CENSUS_POP } from "@/lib/city-budget/comparisons";

/**
 * Peer comparison, built to resist its own misuse.
 *
 * A per-capita league table is the number every reader wants and the number
 * most likely to mislead them: the spread between cities is mostly about which
 * functions sit inside the city boundary, not how much government anyone buys.
 * So each bar carries a scope strip showing what's in and what's out, and the
 * caveat sits above the chart rather than in a footnote below it.
 */
export default function PeerCities() {
  const rows = PEERS.map((p) => ({ ...p, perCap: p.total / p.population })).sort(
    (a, b) => b.perCap - a.perCap,
  );
  const max = Math.max(...rows.map((r) => r.perCap));

  return (
    <div className="space-y-8">
      <div className="rounded-sm border-l-2 border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-4 sm:p-5">
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          <strong className="text-[var(--color-ink)]">Read this table sideways, not down.</strong>{" "}
          San Francisco looks three times Portland&apos;s size per resident mostly because it is
          also a county running a $3.6&nbsp;billion hospital system. Boston looks small until you
          notice a third of its budget is schools, which Portland doesn&apos;t run. The honest
          comparison isn&apos;t a ranking — it&apos;s the scope column. Researchers who do this
          properly rebuild every city on a common footing; the{" "}
          <a
            href={LINCOLN_FISC}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
          >
            Lincoln Institute&apos;s standardized city database
          </a>{" "}
          is the reference for that.
        </p>
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          Every total below is an <strong>adopted</strong> budget read from that city&apos;s own
          budget document, and every population is a{" "}
          <a
            href={CENSUS_POP}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--color-parchment)] underline-offset-2 hover:decoration-[var(--color-river)]"
          >
            Census Bureau 2025 estimate
          </a>
          , so the denominator is consistent even where a city&apos;s own book counts differently.
          Netting conventions still differ: Austin and Denver publish totals net of internal
          duplication, Seattle and Minneapolis do not.
        </p>
      </div>

      <div className="space-y-5">
        {rows.map((r) => (
          <div
            key={r.city}
            className={`rounded-sm border p-4 sm:p-5 ${
              r.highlight
                ? "border-[var(--color-canopy)] bg-white"
                : "border-[var(--color-parchment)] bg-white"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3
                className={`text-[15px] ${
                  r.highlight
                    ? "font-bold text-[var(--color-canopy)]"
                    : "font-semibold text-[var(--color-ink)]"
                }`}
              >
                {r.city}
                <span className="ml-2 font-mono text-[11px] font-normal text-[var(--color-ink-muted)]">
                  {r.fy}
                </span>
              </h3>
              <p className="font-mono text-[13px] tabular-nums text-[var(--color-ink-light)]">
                <span className="text-[16px] font-bold text-[var(--color-ink)]">
                  ${Math.round(r.perCap).toLocaleString("en-US")}
                </span>
                <span className="text-[var(--color-ink-muted)]"> per resident</span>
                <span className="ml-2 text-[var(--color-ink-muted)]">
                  · {fmtMoney(r.total)} · {(r.population / 1000).toFixed(0)}K people
                </span>
              </p>
            </div>

            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${(r.perCap / max) * 100}%`,
                  backgroundColor: r.highlight ? "#0f2419" : "#8a9aa5",
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { k: "Water", v: r.water },
                { k: "Electric", v: r.electric },
                { k: "Schools", v: r.schools },
                { k: "County", v: r.county },
              ].map((s) => (
                <span
                  key={s.k}
                  className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                    s.v === "in"
                      ? "bg-[#e3efe7] text-[var(--color-fern)]"
                      : s.v === "partial"
                        ? "bg-[#f6ecd9] text-[var(--color-ember)]"
                        : "bg-[#f0eeec] text-[var(--color-ink-muted)]"
                  }`}
                >
                  {s.k} {s.v}
                </span>
              ))}
            </div>

            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
              {r.includes}
            </p>
          </div>
        ))}
      </div>

      {/* ── police share ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">
          Police as a share of the general fund
        </h3>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          This is the most quoted and least comparable number in city politics. The spread below is
          driven by what each city counts as its general fund, not by policing policy. Only the
          first four are close enough in structure to compare; the rest are shown so you can see
          why a national ranking is meaningless.
        </p>

        <div className="mt-4 space-y-3">
          {POLICE_SHARE.map((p) => {
            const pct = (p.police / p.generalFund) * 100;
            return (
              <div key={p.city} className={p.comparable ? "" : "opacity-55"}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-[var(--color-ink)]">
                    {p.city}
                    {!p.comparable && (
                      <span className="ml-1.5 font-mono text-[10px] uppercase text-[var(--color-clay)]">
                        not comparable
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[var(--color-ink)]">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${pct * 2.4}%`,
                      backgroundColor: p.comparable ? "#b85c3a" : "#a8a29e",
                    }}
                  />
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">
                  {fmtMoney(p.police)} of {fmtMoney(p.generalFund)} · {p.denominator}
                  {p.published ? " · city's own figure" : " · our computation"}
                </p>
                {p.note && (
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-ink-muted)]">
                    {p.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
          Among the four structurally comparable cities, Portland sits between Austin and
          Minneapolis and well above Seattle. But Portland&apos;s figure is a share of{" "}
          <em>discretionary</em> general fund, a narrower slice than any peer quotes, so if
          anything it understates how comparable the three are. Only Austin publishes its own
          percentage; the rest are ours.
        </p>
      </div>
    </div>
  );
}
