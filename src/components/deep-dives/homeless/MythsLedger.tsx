import { MYTHS } from "@/lib/homeless/data";
import { Em } from "./Figure";

/** Claim on the left, what the evidence says on the right. One ledger, no cards. */
export default function MythsLedger() {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-6 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)] sm:px-6 md:grid">
        <span>The objection</span>
        <span>What the evidence says</span>
      </div>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {MYTHS.map((m, i) => (
          <li key={m.myth} className="grid gap-x-6 gap-y-2 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <p className="font-editorial-normal text-[17px] leading-snug text-[var(--color-clay)]">
              <span className="mr-2 font-mono text-[11px] text-[var(--color-ink-muted)]">{String(i + 1).padStart(2, "0")}</span>
              {m.myth}
            </p>
            <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-light)]"><Em text={m.truth} /></p>
          </li>
        ))}
      </ol>
    </div>
  );
}
