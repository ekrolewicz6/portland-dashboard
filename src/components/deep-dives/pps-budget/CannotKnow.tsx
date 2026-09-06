import { GAPS } from "@/lib/pps-budget/data";

/**
 * The eight missing documents. Visible: the document and who holds it.
 * One tap: what it would settle and how to get it.
 */

type GapRow = (typeof GAPS)[number];

function GapCard({ r, i }: { r: GapRow; i: number }) {
  return (
    <li>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 sm:px-5">
          <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold tabular-nums text-[var(--color-ember)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
              {r.gap}
            </span>
            <span className="mt-1 block text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
              <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]">
                Who has it ·{" "}
              </span>
              {r.holder}
            </span>
          </span>
          <span aria-hidden className="shrink-0 font-mono text-[16px] text-[var(--color-ink-muted)] transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>
        <div className="space-y-2 border-t border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-4 py-3.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)] sm:px-5 sm:pl-[52px]">
          <p>
            <span className="font-semibold text-[var(--color-ink)]">What it would settle: </span>
            {r.settles}
          </p>
          <p>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-fern)]">
              How to get it ·{" "}
            </span>
            {r.ask}
          </p>
        </div>
      </details>
    </li>
  );
}

export default function CannotKnow() {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-editorial text-[22px] leading-snug text-[var(--color-ink)]">
          Eight missing documents, and who holds each one
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          4 in district files · 1 with the state · 3 need a vote to exist
        </p>
      </div>
      <div className="mt-4 rounded-sm border border-[var(--color-parchment)] bg-white">
        <ul className="divide-y divide-[var(--color-parchment)]">
          {GAPS.map((r, i) => (
            <GapCard key={r.gap} r={r} i={i} />
          ))}
        </ul>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        Our records requests are drafted and unsent. The district can moot every one by publishing.
      </p>
    </div>
  );
}
