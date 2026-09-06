import { BOARD_MEASURES, GAMING_RULES } from "@/lib/libraries/data";

/**
 * Six Board-level measures, each with the question it answers and what has
 * to exist before it can be reported — followed by the three anti-gaming
 * rules. Targets come after the 2027 baseline, not before.
 */
export default function MeasuresTable() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="hidden grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-6 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)] sm:grid sm:px-7">
          <span>Board measure</span>
          <span>What it answers</span>
          <span>What must exist first</span>
        </div>
        <ol className="divide-y divide-[var(--color-parchment)]">
          {BOARD_MEASURES.map((m, i) => (
            <li key={m.title} className="grid gap-x-6 gap-y-1.5 px-5 py-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:px-7">
              <p className="flex items-baseline gap-2.5">
                <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--color-ember)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-editorial text-[18px] leading-tight text-[var(--color-ink)]">{m.title}</span>
              </p>
              <p className="text-[15px] leading-snug text-[var(--color-ink)]">{m.asks}</p>
              <p className="text-[14px] leading-snug text-[var(--color-ink-muted)]">{m.needs}</p>
            </li>
          ))}
        </ol>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-7">
          A credible target has a definition, a denominator, a data owner, a reporting interval, an
          equity breakdown, a cost, and a reason. Circulation, visits, and cardholders stay as operating
          signals; they are not, by themselves, proof of an outcome.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {GAMING_RULES.map((r, i) => (
          <div key={r.title} className="rounded-sm border-l-[3px] border-l-[var(--color-clay)] bg-white p-4">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-clay)]">Rule {i + 1}</p>
            <p className="mt-1 font-editorial text-[17px] leading-snug text-[var(--color-ink)]">{r.title}</p>
            <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-ink-light)]">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
