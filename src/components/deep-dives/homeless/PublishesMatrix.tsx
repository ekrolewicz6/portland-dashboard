import { KNOWLEDGE_MATRIX, type Knows } from "@/lib/homeless/continuum";

const CELL: Record<Knows, { cls: string; label: string }> = {
  yes: { cls: "bg-[var(--color-fern)]", label: "yes" },
  partial: { cls: "bg-[var(--color-ember)]", label: "partly" },
  no: { cls: "bg-[var(--color-clay)]", label: "no" },
  na: { cls: "bg-transparent border border-dashed border-[var(--color-parchment)]", label: "not theirs" },
};

/** Ten things you would need to know to run a continuum, and whether the county, the city, or the Sheriff can say them today. */
export default function PublishesMatrix() {
  const cols: { k: "county" | "city" | "sheriff"; label: string }[] = [{ k: "county", label: "County" }, { k: "city", label: "City" }, { k: "sheriff", label: "Sheriff" }];
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Who can say what, today</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
          {(Object.keys(CELL) as Knows[]).map((k) => <li key={k} className="flex items-center gap-1.5"><span className={`inline-block h-3 w-3 rounded-full ${CELL[k].cls}`} />{CELL[k].label}</li>)}
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px] xl:min-w-0">
          <thead>
            <tr className="border-b border-[var(--color-parchment)] font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              <th className="px-4 py-3 text-left sm:px-6">What you would need to know</th>
              {cols.map((c) => <th key={c.k} className="w-[90px] px-2 py-3 text-center">{c.label}</th>)}
              <th className="w-[36%] px-4 py-3 text-left">Why not</th>
            </tr>
          </thead>
          <tbody>
            {KNOWLEDGE_MATRIX.map((r) => (
              <tr key={r.question} className="border-b border-[var(--color-parchment)] last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                <td className="px-4 py-3 font-medium leading-snug text-[var(--color-canopy)] sm:px-6">{r.question}</td>
                {cols.map((c) => <td key={c.k} className="px-2 py-3 text-center"><span className={`inline-block h-4 w-4 rounded-full ${CELL[r[c.k]].cls}`} title={CELL[r[c.k]].label} /></td>)}
                <td className="px-4 py-3 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
