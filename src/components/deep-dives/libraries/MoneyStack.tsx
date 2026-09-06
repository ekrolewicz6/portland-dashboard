import { DERIVED, HEADLINE } from "@/lib/libraries/data";

/**
 * The money, drawn to scale. The levy gauge is the story: $1.22 of a $1.24
 * cap, 1.6% of room left, on a base that is inflating. Then the bond as a
 * waterfall and both translated to a single resident.
 */
export default function MoneyStack() {
  const levyPct = (HEADLINE.levyRate / HEADLINE.levyCap) * 100;
  const bondExtra = HEADLINE.bondTotalHighM - HEADLINE.bondAuthorizedM;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* levy gauge — the wide one */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7 lg:col-span-3">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          The operating levy, against its ceiling
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-[44px] font-bold tabular-nums leading-none text-[var(--color-ink)]">
            ${HEADLINE.levyRate.toFixed(2)}
          </span>
          <span className="text-[16px] text-[var(--color-ink-muted)]">
            per $1,000 of assessed value · cap ${HEADLINE.levyCap.toFixed(2)}
          </span>
        </div>

        <div className="relative mt-12 h-12">
          <div className="absolute inset-y-0 left-0 right-0 rounded-sm bg-[var(--color-paper-warm)] ring-1 ring-inset ring-[var(--color-parchment)]" />
          <div
            className="absolute inset-y-0 left-0 rounded-l-sm bg-[var(--color-canopy)]"
            style={{ width: `${levyPct}%` }}
          />
          <div
            className="absolute inset-y-0 rounded-r-sm bg-[var(--color-clay)]"
            style={{ left: `${levyPct}%`, right: 0 }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
            Levied · $1.22
          </span>
          <span
            className="absolute top-full mt-2 -translate-x-full whitespace-nowrap font-mono text-[13px] font-bold text-[var(--color-clay)]"
            style={{ left: "100%" }}
          >
            {DERIVED.levyHeadroomPct}% headroom · $0.02
          </span>
          <span className="absolute -top-2 h-[calc(100%+16px)] w-px bg-[var(--color-ink)]" style={{ left: "100%" }} />
          <span className="absolute bottom-full mb-1.5 -translate-x-full whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink)]" style={{ left: "100%" }}>
            Legal cap, set by voters 2012
          </span>
        </div>

        <p className="mt-10 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          Permanent doesn&apos;t mean unlimited. The rate is two cents from its ceiling, and the
          county&apos;s own five-year forecast already assumes it goes to the ceiling in FY2028 —{" "}
          <strong className="text-[var(--color-ink)]">and still runs a deficit every year through FY2031</strong>.
          Every cost that rises faster than assessed value — inflation, internal services, the utilities and
          staffing of buildings that are now much bigger — comes out of service. FY2027 closed a ~$2 million
          gap through reductions in the same year the new estate opened.
        </p>
      </div>

      {/* right column: bond + per-resident */}
      <div className="grid gap-4 lg:col-span-2">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The capital bond, authorized → delivered
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-7 rounded-sm bg-[var(--color-canopy)]" style={{ width: `${(HEADLINE.bondAuthorizedM / HEADLINE.bondTotalHighM) * 100}%` }} />
              <span className="shrink-0 font-mono text-[14px] font-bold tabular-nums text-[var(--color-ink)]">$387M</span>
            </div>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">voter-approved, Nov. 2020 · {HEADLINE.bondApprovalPct}% yes</p>
            <div className="flex items-center gap-3 pt-1">
              <div className="h-7 rounded-sm bg-[var(--color-canopy)]" style={{ width: `${(HEADLINE.bondAuthorizedM / HEADLINE.bondTotalHighM) * 100}%` }} />
              <div className="h-7 rounded-sm bg-[var(--color-ember)]" style={{ width: `${(bondExtra / HEADLINE.bondTotalHighM) * 100}%` }} />
              <span className="shrink-0 font-mono text-[14px] font-bold tabular-nums text-[var(--color-ink)]">~$459M</span>
            </div>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
              + ${bondExtra}M premiums, interest &amp; other sources · 20 projects
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)]">
          {[
            { v: `$${DERIVED.bondPerResident}`, k: "of capital per resident, just spent" },
            { v: `$${DERIVED.operatingPerResident}`, k: "per resident per year to run it" },
            { v: `$${DERIVED.operatingPerCheckout.toFixed(2)}`, k: "operating cost per checkout" },
            { v: `${HEADLINE.fte}`, k: "full-time-equivalent staff" },
          ].map((s) => (
            <div key={s.k} className="bg-white p-4">
              <p className="font-mono text-[24px] font-bold tabular-nums leading-none text-[var(--color-ink)]">{s.v}</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--color-ink-muted)]">{s.k}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
