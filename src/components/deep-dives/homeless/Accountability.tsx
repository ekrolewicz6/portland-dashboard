import { ACCOUNTABILITY, ACCOUNTABILITY_LADDER, CONTINUUM, NEVER_A_FAILURE, WHO_ENFORCES } from "@/lib/homeless/continuum";

/** Who answers for each stage, the mechanism that holds them to it, the number they are judged on, and what happens when they miss. */
export default function Accountability() {
  const stage = new Map(CONTINUUM.map((s, i) => [s.id, { ...s, n: i + 1 }]));
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <p className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
          <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
          One row per stage. The owner is who answers for it in public, named with the body that funds or governs it. The mechanism is what ties money or authority to the number. The measure is the one figure the owner is judged on, with its target. The last column is what happens when they miss, on the ladder below. Where the owner is &ldquo;nobody today,&rdquo; that is the finding.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-[12.5px] leading-snug xl:min-w-0 xl:table-fixed">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                <th className="w-[150px] px-4 py-3 sm:px-6">Stage</th>
                <th className="px-3 py-3">Who answers for it</th>
                <th className="px-3 py-3">How they are held to it</th>
                <th className="px-3 py-3 text-[var(--color-fern)]">The number, and its target</th>
                <th className="px-3 py-3 text-[var(--color-clay)]">If they miss</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTABILITY.map((a) => {
                const s = stage.get(a.stageId);
                const nobody = a.owner.startsWith("Nobody today");
                return (
                  <tr key={a.stageId} className="border-b border-[var(--color-parchment)] align-top last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                    <td className="px-4 py-3.5 sm:px-6">
                      <span className="block font-mono text-[10px] text-[var(--color-ink-muted)]">{String(s?.n ?? 0).padStart(2, "0")}</span>
                      <span className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">{s?.name}</span>
                    </td>
                    <td className={`px-3 py-3.5 ${nobody ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{a.owner}</td>
                    <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{a.mechanism}</td>
                    <td className="px-3 py-3.5 text-[var(--color-ink)]">{a.measure}</td>
                    <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{a.ifFails}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ol className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <li className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What happens when a stage fails, in this order</p>
          </li>
          {ACCOUNTABILITY_LADDER.map((s) => (
            <li key={s.n} className="grid gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 py-4 last:border-b-0 sm:grid-cols-[40px_minmax(0,1fr)] sm:px-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-clay)] font-mono text-[13px] font-bold text-white">{s.n}</span>
              <div>
                <p className="text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{s.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{s.body}</p>
              </div>
            </li>
          ))}
          <li className="bg-[var(--color-paper-warm)] px-5 py-4 sm:px-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Never counted as the worker&apos;s or the program&apos;s failure</p>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-[var(--color-ink-light)]">
              {NEVER_A_FAILURE.map((t) => (
                <li key={t.slice(0, 30)} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-fern)]" />{t}</li>
              ))}
            </ul>
          </li>
        </ol>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <p className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)] sm:px-6">Who enforces, and what they hold</p>
          <ul className="divide-y divide-[var(--color-parchment)]">
            {WHO_ENFORCES.map((w) => (
              <li key={w.body} className="px-5 py-3.5 sm:px-6">
                <p className="text-[14px] font-semibold leading-snug text-[var(--color-canopy)]">{w.body}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{w.holds}</p>
              </li>
            ))}
          </ul>
          <p className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)] px-5 py-4 text-[13.5px] leading-relaxed text-white/85 sm:px-6">
            <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">The missing owner</span>
            No one answers for the whole continuum today. The design asks for one system director, accountable to a joint city-county body, whose only product is the weekly table; Houston and Hennepin County both run on that model.
          </p>
        </div>
      </div>
    </div>
  );
}
