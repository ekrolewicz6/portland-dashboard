import { CONTINUUM, STAGE_ROLES } from "@/lib/homeless/continuum";

/** Who owns the person at each stage, who else is in the room, what police do and do not do, and who writes the handoff. */
export default function WhoDoesWhat() {
  const stage = new Map(CONTINUUM.map((s, i) => [s.id, { ...s, n: i + 1 }]));
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <p className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
        <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
        One row per stage. The lead owns the person and does not change at the door. Police appear where the law gives them a role and nowhere else; where the column says none, a police presence means a step failed. The last column is who writes the record that lets the count follow the person to the next stage.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[12.5px] leading-snug xl:min-w-0 xl:table-fixed">
          <thead>
            <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              <th className="w-[150px] px-4 py-3 sm:px-6">Stage</th>
              <th className="px-3 py-3">Who leads</th>
              <th className="px-3 py-3">Also in the room</th>
              <th className="px-3 py-3 text-[var(--color-clay)]">Police</th>
              <th className="px-3 py-3">Who writes the handoff</th>
            </tr>
          </thead>
          <tbody>
            {STAGE_ROLES.map((r) => {
              const s = stage.get(r.stageId);
              return (
                <tr key={r.stageId} className="border-b border-[var(--color-parchment)] align-top last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                  <td className="px-4 py-3.5 sm:px-6">
                    <span className="block font-mono text-[10px] text-[var(--color-ink-muted)]">{String(s?.n ?? 0).padStart(2, "0")}</span>
                    <span className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">{s?.name}</span>
                  </td>
                  <td className="px-3 py-3.5 text-[var(--color-ink)]">{r.lead}</td>
                  <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{r.inRoom}</td>
                  <td className={`px-3 py-3.5 ${r.police.startsWith("None") ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"}`}>{r.police}</td>
                  <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{r.handoff}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
