/**
 * Compression, explained on one tax bill. Two worked examples, same house,
 * two market values, so the reader sees both the mechanism and why it is
 * getting worse.
 *
 * Rates per $1,000 of ASSESSED value, FY2026-27 (education taxes subject to
 * the Measure 5 cap; bonds are outside the cap): PPS permanent 4.7743 + gap
 * 0.5038 + local option 1.99 [budget-fy2026-27-vol1 p226] + Multnomah ESD
 * 0.4576 + PCC 0.2828 [tscc-annual-report-2024-25-general p43] = 8.0085.
 * Cap: $5.00 per $1,000 of REAL MARKET value (Measure 5, 1990).
 * Order of cuts: local option levies first, to zero, before permanent rates
 * (ORS 310.150).
 *
 * Example house: assessed $350,000. Computed school taxes 8.0085 × 350 =
 * $2,803. Levy share 1.99 × 350 = $696.50.
 *   Market $500,000 → cap $2,500 → $303 deleted → levy collected $393.50.
 *   Market $600,000 → cap $3,000 → nothing deleted → levy collected $696.50.
 */

const RATE_ALL = 8.0085;
const RATE_LEVY = 1.99;
const CAP_RATE = 5;
const ASSESSED_K = 350;

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function Case({
  marketK,
  label,
  tone,
}: {
  marketK: number;
  label: string;
  tone: "bad" | "fine";
}) {
  const computed = RATE_ALL * ASSESSED_K;
  const cap = CAP_RATE * marketK;
  const levy = RATE_LEVY * ASSESSED_K;
  const deleted = Math.max(0, computed - cap);
  const levyPaid = Math.max(0, levy - deleted);
  const scale = Math.max(computed, cap);
  const bad = tone === "bad";
  return (
    <div className={`rounded-sm border p-4 sm:p-5 ${bad ? "border-[var(--color-clay)]/50 bg-white" : "border-[var(--color-parchment)] bg-white"}`}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[14px] text-[var(--color-ink)]">
        Market value <span className="font-mono font-bold tabular-nums">{money(marketK * 1000)}</span> · assessed value{" "}
        <span className="font-mono font-bold tabular-nums">{money(ASSESSED_K * 1000)}</span>
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="text-[var(--color-ink-light)]">School taxes the bill computes, on assessed value</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--color-ink)]">{money(computed)}</span>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
            <div className="flex h-full" style={{ width: `${(computed / scale) * 100}%` }}>
              <div className="h-full bg-[var(--color-canopy)]" style={{ width: `${((computed - levy) / computed) * 100}%` }} />
              <div className="h-full bg-[var(--color-fern)]" style={{ width: `${(levy / computed) * 100}%` }} />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="text-[var(--color-ink-light)]">The 1990 cap: $5 per $1,000 of market value</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--color-ink)]">{money(cap)}</span>
          </div>
          <div className="relative mt-1 h-4 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
            <div className="h-full bg-[var(--color-ink-muted)]/40" style={{ width: `${(cap / scale) * 100}%` }} />
            <span aria-hidden className="absolute inset-y-0 w-[2px] bg-[var(--color-ink)]" style={{ left: `${(cap / scale) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className={`mt-4 rounded-sm px-3 py-2.5 text-[13.5px] leading-snug ${bad ? "bg-[var(--color-clay)]/10 text-[var(--color-ink)]" : "bg-[var(--color-sage-tint)] text-[var(--color-ink)]"}`}>
        {bad ? (
          <>
            Over the cap by <span className="font-mono font-bold tabular-nums text-[var(--color-clay)]">{money(deleted)}</span>.
            That amount is deleted, and by law it comes out of the teachers levy first. The levy on
            this house drops from {money(levy)} to <span className="font-mono font-bold tabular-nums">{money(levyPaid)}</span>.
          </>
        ) : (
          <>
            Under the cap. Nothing is deleted. The full levy, <span className="font-mono font-bold tabular-nums">{money(levy)}</span>, is collected.
          </>
        )}
      </div>
    </div>
  );
}

export default function CompressionExplainer() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
        What compression is, on one tax bill
      </p>
      <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink)]">
        Your school taxes are figured on your home&apos;s <em>assessed</em> value. But since 1990,
        Oregon has capped them at $5 per $1,000 of <em>market</em> value. When the first number
        comes out higher than the cap allows, the county does not bill the difference. It deletes
        it, and the law says the teachers levy is deleted first. Same house, two market values:
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Case marketK={500} label="A house whose market value has gone flat" tone="bad" />
        <Case marketK={600} label="The same house in a rising market" tone="fine" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-canopy)]" />
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">other school taxes</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-fern)]" />
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">the teachers levy</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-[2px] bg-[var(--color-ink)]" />
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">the cap</span>
        </span>
      </div>
      <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[14px] leading-relaxed text-[var(--color-ink)]">
        <span className="font-semibold">Why it keeps getting worse:</span> assessed values rise 3
        percent a year by law no matter what. Portland market values have been flat since 2022. So
        every year, more homes look like the one on the left, and the district-wide loss below
        keeps climbing.
      </p>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
        Rates per $1,000 of assessed value, 2026-27: PPS 5.28 + levy 1.99 + ESD 0.46 + PCC 0.28 =
        $8.01. Bonds sit outside the cap. Sources: PPS adopted budget; TSCC annual report.
      </p>
    </div>
  );
}
