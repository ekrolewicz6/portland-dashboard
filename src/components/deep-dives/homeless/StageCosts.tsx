import { CONTINUUM, COST_SUMMARY, STAGE_COSTS } from "@/lib/homeless/continuum";

/** What each stage costs today, the unit cost we actually know, what a funded stage needs now, and which way the line should move. */
export default function StageCosts() {
  const stage = new Map(CONTINUUM.map((s, i) => [s.id, { ...s, n: i + 1 }]));
  const unpublished = STAGE_COSTS.filter((c) => /unpublished/i.test(c.unit)).length;
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What each stage costs</p>
          <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">unit cost published for {STAGE_COSTS.length - unpublished} of {STAGE_COSTS.length} stages</p>
        </div>
        <p className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
          <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
          Every dollar figure here is one the county, the city, the state, or a trial has published; where a stage&apos;s unit cost has never been published we say so rather than estimate it. &ldquo;Now&rdquo; is what a funded stage needs in the next budget; &ldquo;later&rdquo; is which way the line should move once the front of the continuum works.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-[12.5px] leading-snug xl:min-w-0 xl:table-fixed">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                <th className="w-[150px] px-4 py-3 sm:px-6">Stage</th>
                <th className="px-3 py-3">Spent or in place today</th>
                <th className="px-3 py-3">The unit cost we know</th>
                <th className="px-3 py-3 text-[var(--color-fern)]">Needed now</th>
                <th className="px-3 py-3">Later</th>
              </tr>
            </thead>
            <tbody>
              {STAGE_COSTS.map((c) => {
                const s = stage.get(c.stageId);
                const unk = /unpublished/i.test(c.unit);
                return (
                  <tr key={c.stageId} className="border-b border-[var(--color-parchment)] align-top last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                    <td className="px-4 py-3.5 sm:px-6">
                      <span className="block font-mono text-[10px] text-[var(--color-ink-muted)]">{String(s?.n ?? 0).padStart(2, "0")}</span>
                      <span className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">{s?.name}</span>
                    </td>
                    <td className="px-3 py-3.5 text-[var(--color-ink)] tabular-nums">{c.today}</td>
                    <td className={`px-3 py-3.5 tabular-nums ${unk ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{c.unit}</td>
                    <td className="px-3 py-3.5 text-[var(--color-ink)]">{c.now}</td>
                    <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{c.future}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ol className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-5">
        {COST_SUMMARY.map((t, i) => (
          <li key={t.slice(0, 30)} className="bg-white px-4 py-4">
            <span className="font-mono text-[12px] font-bold text-[var(--color-ember)]">{i + 1}</span>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{t}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
