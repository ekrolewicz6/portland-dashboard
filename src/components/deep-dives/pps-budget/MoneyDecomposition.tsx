import { HEADLINE, WATERFALL } from "@/lib/pps-budget/data";
import { fmtMillionsFromK } from "@/lib/pps-budget/engine";

/**
 * "Four kinds of money" (Act I payoff): the five fund types of the adopted
 * budget as paired FY25-26 vs FY26-27 bars on one shared dollar scale, with
 * each row's year-over-year change at its end. Capital Projects (+$738.7M,
 * clay) is deliberately the loudest thing on the page; the General Fund's
 * -$6.5M (ember) carries the flag "first drop in eleven years." The closing
 * band states the anti-summing rule: the $2.77B total mixes money that
 * legally cannot mix.
 */

type FundRow = (typeof WATERFALL)[number];

/** Shared scale: Capital Projects FY26-27 is the widest bar. */
const MAX_K = Math.max(...WATERFALL.flatMap((r) => [r.fy26, r.fy27]));

function pct(k: number): string {
  return `${((k / MAX_K) * 100).toFixed(2)}%`;
}

/** Signed one-decimal delta, so -$6.5M and +$738.7M read exactly. */
function fmtDeltaK(k: number): string {
  const sign = k < 0 ? "−" : "+";
  return `${sign}$${Math.abs(k / 1000).toFixed(1)}M`;
}

/** Ledger-tag chip tone, keyed to the four-ledger color scheme. */
const TAG_TONE: Record<FundRow["tag"], string> = {
  locked: "var(--color-clay)",
  "mostly locked": "var(--color-clay)",
  committed: "var(--color-ember)",
  "movable+committed": "var(--color-fern)",
};

/** Per-row emphasis: who shouts, who carries a flag. */
const ROW_META: Partial<
  Record<FundRow["fund"], { loud?: boolean; deltaColor: string; flag?: string }>
> = {
  "Capital Projects": { loud: true, deltaColor: "var(--color-clay)" },
  "General Fund": {
    deltaColor: "var(--color-ember)",
    flag: "First drop in eleven years",
  },
};

function LedgerChip({ tag }: { tag: FundRow["tag"] }) {
  const tone = TAG_TONE[tag];
  return (
    <span
      className="rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: tone, borderColor: tone }}
    >
      {tag.replace("+", " + ")}
    </span>
  );
}

function YearBar({
  label,
  valueK,
  fill,
}: {
  label: string;
  valueK: number;
  fill: string;
}) {
  return (
    <div className="grid grid-cols-[52px_1fr_58px] items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
        {label}
      </span>
      <div className="h-3.5 rounded-sm bg-[var(--color-paper-warm)]">
        <div
          className="h-full rounded-sm"
          style={{ width: pct(valueK), backgroundColor: fill, minWidth: "2px" }}
        />
      </div>
      <span className="text-right font-mono text-[11px] tabular-nums text-[var(--color-ink-light)]">
        {fmtMillionsFromK(valueK)}
      </span>
    </div>
  );
}

export default function MoneyDecomposition() {
  const allFunds = fmtMillionsFromK(HEADLINE.allFundsFy27 / 1000);

  return (
    <div className="mt-8">

      <div className="mt-4 rounded-sm border border-[var(--color-parchment)] bg-white">
        <ul className="divide-y divide-[var(--color-parchment)]">
          {WATERFALL.map((r) => {
            const meta = ROW_META[r.fund];
            const deltaK = r.fy27 - r.fy26;
            return (
              <li key={r.fund} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                        {r.fund}
                      </p>
                      <LedgerChip tag={r.tag} />
                    </div>
                    {meta?.flag ? (
                      <p className="mt-0.5 text-[11.5px] font-semibold text-[var(--color-ember)]">
                        {meta.flag}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-mono tabular-nums font-semibold ${
                        meta?.loud ? "text-[16px]" : "text-[13px]"
                      }`}
                      style={{ color: meta?.deltaColor ?? "var(--color-ink)" }}
                    >
                      {fmtDeltaK(deltaK)}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                      year over year
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 space-y-1">
                  <YearBar label="FY25-26" valueK={r.fy26} fill="var(--color-sage)" />
                  <YearBar
                    label="FY26-27"
                    valueK={r.fy27}
                    fill={meta?.loud ? "var(--color-clay)" : "var(--color-canopy)"}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="rounded-b-sm bg-[var(--color-canopy)] px-4 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sage)]">
            The anti-summing rule
          </p>
          <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-paper)]">
            Adding the five rows gives you {allFunds}, and that number is real,
            but it mixes money that legally cannot mix. Bond dollars must
            build; they cannot pay a teacher or keep a school open. Debt
            service belongs to bondholders. Only the General Fund answers to
            the board, and it is the one pile that shrank.
          </p>
        </div>
      </div>

      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        PPS FY2026-27 Adopted Budget Vol 1 · adopted requirements by fund, both
        years as printed in the FY2026-27 book
      </p>
    </div>
  );
}
