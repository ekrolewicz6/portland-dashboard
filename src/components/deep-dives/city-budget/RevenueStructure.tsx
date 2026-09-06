import { fmtMoney, fmtExact } from "@/lib/city-budget/types";
import {
  SALES_TAX,
  BLT,
  PROPERTY_LIMITS as PL,
  FORECAST_CUTS,
  REVENUE_SOURCES as SRC,
} from "@/lib/city-budget/revenue-structure";

/**
 * The revenue side: what makes Portland structurally different from peers.
 *
 * The answer is a hole where a tax should be. Oregon bars sales taxes at both
 * state and local level, so the instrument every peer leans on is unavailable.
 * Portland substitutes a tax on business profits — a much narrower and more
 * cyclical base, and then Measures 5 and 50 cap how fast the other main
 * source can grow. That combination is why one federal tax change could open a
 * $32.6 million hole.
 */
export default function RevenueStructure() {
  const maxShare = Math.max(...SALES_TAX.map((s) => s.shareOfGf ?? 0));
  const totalCuts = FORECAST_CUTS.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-8">
      {/* ── the missing tax ── */}
      <div>
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
          Every peer city has a revenue tool Portland is legally denied
        </h3>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          Oregon is one of five states with no statewide sales tax, and one of only three that
          also forbid local ones. This isn&apos;t a choice Portland makes each year; it is a
          constraint the city budgets inside.
        </p>

        <div className="mt-4 space-y-3">
          {SALES_TAX.map((s) => (
            <div
              key={s.city}
              className={`rounded-sm border p-4 ${
                s.shareOfGf === null
                  ? "border-[var(--color-canopy)] bg-white"
                  : "border-[var(--color-parchment)] bg-white"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span
                  className={`text-[14px] ${
                    s.shareOfGf === null
                      ? "font-bold text-[var(--color-canopy)]"
                      : "font-semibold text-[var(--color-ink)]"
                  }`}
                >
                  {s.city}
                  <span className="ml-2 font-mono text-[11px] font-normal text-[var(--color-ink-muted)]">
                    {s.rate}
                  </span>
                </span>
                {s.shareOfGf !== null ? (
                  <span className="font-mono text-[13px] tabular-nums text-[var(--color-ink-light)]">
                    <span className="text-[16px] font-bold text-[var(--color-ink)]">
                      {s.shareOfGf}%
                    </span>{" "}
                    of general fund
                    {s.revenue && (
                      <span className="text-[var(--color-ink-muted)]"> · {fmtMoney(s.revenue)}</span>
                    )}
                  </span>
                ) : (
                  <span className="font-mono text-[13px] font-bold text-[var(--color-clay)]">
                    no such revenue
                  </span>
                )}
              </div>

              {s.shareOfGf !== null && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                  <div
                    className="h-full rounded-sm bg-[#2d5f7e]"
                    style={{ width: `${(s.shareOfGf / maxShare) * 100}%` }}
                  />
                </div>
              )}

              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── what Portland uses instead ── */}
      <div className="rounded-sm border-2 border-[var(--color-ember)]/40 bg-white p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
          What Portland taxes instead: business profits
        </h3>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          The business licence tax, {BLT.rate}, raises about {fmtMoney(BLT.fy2526)} and supplies
          roughly 30% of discretionary General Fund money. Trading a consumption tax for a profits
          tax is a trade of stability for volatility, and the City&apos;s own economist notes that
          no peer city has a comparable tax at this scale.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat
            k={`${BLT.top1000Share}%`}
            t="from 2% of payers"
            d={`Of more than ${(BLT.totalPayers / 1000).toFixed(0)},000 filers, the largest 1,000 pay two-thirds of the tax. The top ten alone pay ${BLT.top10Share}%.`}
          />
          <Stat
            k={fmtMoney(BLT.federalHit)}
            t="lost to one federal change"
            d="Congress made bonus depreciation permanent; Oregon's rolling reconnect to the federal code passed it straight through. The City calls it the single biggest hit to this year's forecast."
            tone="down"
          />
          <Stat
            k={`${BLT.combinedLocalRate}%`}
            t="combined local rate on business income"
            d="City 2.6% plus Multnomah County 2.0% plus Metro 1.0% — before Oregon's 7.6% corporate tax."
          />
        </div>

        <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          Whether that combined burden is the nation&apos;s highest is contested. The{" "}
          <a
            href={SRC.taxFoundationPortland}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2"
          >
            Tax Foundation says it is
          </a>
          , on both corporate and pass-through income; that framing has been{" "}
          <a
            href={SRC.streetRootsRebuttal}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2"
          >
            disputed
          </a>
          . What isn&apos;t in dispute is the concentration: a tax collected mostly from a few
          hundred firms moves with their profits, not with the city&apos;s population.
        </p>
      </div>

      {/* ── property tax limits ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
          And the other main source is capped by the state constitution
        </h3>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          Measure 50 froze assessed values in 1997 and lets them grow only 3% a year, and unlike
          California&apos;s Proposition 13 the value does not reset when a property sells. Measure 5
          then caps the total rate — anything above it is &ldquo;compressed,&rdquo; meaning
          permanently lost rather than deferred.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            k={`${PL.avToRmv}%`}
            t="of market value is taxed"
            d={`Portland property is worth about ${fmtMoney(PL.realMarketValue)} but assessed at ${fmtMoney(PL.assessedValue)}.`}
          />
          <Stat
            k={fmtMoney(PL.compressionCountywide)}
            t="lost to compression countywide"
            d={`Portland's permanent levy alone lost ${fmtMoney(PL.compressionPortlandPermanent)}; its voter-approved local option levy lost ${PL.levyLossPct}% of what voters authorised.`}
            tone="down"
          />
          <Stat
            k={`${PL.avGrowthAssumed}%`}
            t="assessed-value growth assumed"
            d="Among the weakest since Measures 5 and 50 were enacted."
          />
          <Stat
            k={`−${Math.round((1 - PL.top20After / PL.top20Before) * 100)}%`}
            t="downtown office value"
            d={`The 20 largest office buildings fell from about ${fmtMoney(PL.top20Before)} to ${fmtMoney(PL.top20After)} in market value, with office vacancy above ${PL.officeVacancy}%.`}
            tone="down"
          />
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          Compression is the part most people miss: when voters approve a levy and the cap is
          already met, part of that levy simply never gets collected.
        </p>
      </div>

      {/* ── the forecast revisions ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
          How those two facts became this year&apos;s shortfall
        </h3>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          Between forecasts, the City marked down almost every major General Fund line at once —
          {" "}{fmtExact(Math.abs(totalCuts))} in total, before the expiry of one-time federal money
          was even counted.
        </p>

        <div className="mt-4 space-y-3">
          {FORECAST_CUTS.map((c) => (
            <div key={c.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-[var(--color-ink)]">{c.label}</span>
                <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[var(--color-clay)]">
                  − {fmtExact(Math.abs(c.value))}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                <div
                  className="h-full rounded-sm bg-[var(--color-clay)]"
                  style={{ width: `${(Math.abs(c.value) / 20_000_000) * 100}%` }}
                />
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
                {c.why}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
        <strong className="text-[var(--color-ink)]">The distinction, in one line:</strong> Denver
        funds most of its government from what people buy, which tracks population and inflation.
        Portland funds a third of its flexible money from what a few hundred companies earn, and the
        rest from a property base the state constitution won&apos;t let grow much faster than 3%.
        That is a structurally more fragile design, and it is why a change to federal depreciation
        rules, made in Washington, could open a {fmtMoney(BLT.federalHit)} hole in a Portland
        budget.
      </p>
    </div>
  );
}

function Stat({
  k,
  t,
  d,
  tone,
}: {
  k: string;
  t: string;
  d: string;
  tone?: "down";
}) {
  return (
    <div className="rounded-sm bg-[var(--color-paper-warm)] p-4">
      <p
        className={`font-mono text-[24px] font-bold leading-none tabular-nums ${
          tone === "down" ? "text-[var(--color-clay)]" : "text-[var(--color-canopy)]"
        }`}
      >
        {k}
      </p>
      <p className="mt-1.5 text-[13px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-light)]">{d}</p>
    </div>
  );
}
