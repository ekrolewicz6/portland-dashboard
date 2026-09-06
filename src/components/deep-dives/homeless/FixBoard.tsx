import { CONTINUUM, PHASES, PRINCIPLES } from "@/lib/homeless/continuum";
import { RULES_SHORT, STAGE_SHORT } from "@/lib/homeless/continuum-short";

/** How to fix it: the four rules as four cards, then one row per stage with the thing to do now, the number to publish, and who answers. */
export default function FixBoard() {
  const phaseOf = new Map(PHASES.map((p) => [p.key, p]));
  return (
    <div className="space-y-5">
      <ol className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-4">
        {PRINCIPLES.map((p, i) => (
          <li key={p.rule} className="bg-white px-5 py-4">
            <span className="font-editorial-normal text-[34px] leading-none text-[var(--color-ember)]">{i + 1}</span>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{p.rule}</p>
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{RULES_SHORT[i]}</p>
          </li>
        ))}
      </ol>
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What to do at each stage</p>
          <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">do now · the number to publish · who answers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-[13px] leading-snug xl:min-w-0 xl:table-fixed">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                <th className="w-[190px] px-4 py-3 sm:px-6">Stage</th>
                <th className="px-3 py-3 text-[var(--color-canopy)]">Do now</th>
                <th className="w-[26%] px-3 py-3 text-[var(--color-fern)]">The number</th>
                <th className="w-[20%] px-3 py-3">Who answers</th>
              </tr>
            </thead>
            <tbody>
              {CONTINUUM.map((s, i) => {
                const sh = STAGE_SHORT[s.id];
                const p = phaseOf.get(s.phase);
                return (
                  <tr key={s.id} className="border-b border-[var(--color-parchment)] align-top last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                    <td className="px-4 py-3 sm:px-6">
                      <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: p?.color }}>{String(i + 1).padStart(2, "0")} · {p?.label}</span>
                      <span className="text-[13.5px] font-semibold text-[var(--color-canopy)]">{s.name}</span>
                    </td>
                    <td className="px-3 py-3 font-medium text-[var(--color-ink)]">{sh.doNow}</td>
                    <td className="px-3 py-3 font-mono text-[12px] text-[var(--color-fern)]">{sh.metric}</td>
                    <td className={`px-3 py-3 text-[12.5px] ${sh.owner.startsWith("Nobody") ? "text-[var(--color-clay)]" : "text-[var(--color-ink-light)]"}`}>{sh.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
