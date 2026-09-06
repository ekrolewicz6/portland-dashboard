import { CONTINUUM, PATHWAYS, PHASES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";
import type { CountStatus } from "@/lib/homeless/continuum-types";
import { EVIDENCE_LABEL, shortName } from "@/lib/homeless/stage-labels";

/**
 * The continuum, drawn as phase swimlanes: one row per phase, each stage a
 * card with its clock, whether anyone can count who is in it, and the best
 * number Portland has. The 01–14 order runs down the rows. Below it, the
 * matrix of which cohort passes through which stage, in what order. Both
 * carry a how-to-read line. Server component.
 */

const STATUS: Record<CountStatus, { label: string; cls: string; dot: string; bg: string }> = {
  known: { label: "Counted", cls: "text-[var(--color-fern)]", dot: "bg-[var(--color-fern)]", bg: "bg-[var(--color-sage-tint)]" },
  partial: { label: "Partly counted", cls: "text-[#a9784f]", dot: "bg-[var(--color-ember)]", bg: "bg-[#f4ebe0]" },
  unknown: { label: "Not counted", cls: "text-[var(--color-clay)]", dot: "bg-[var(--color-clay)]", bg: "bg-[var(--color-clay-tint)]" },
};

function HowToRead({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
      <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
      {children}
    </p>
  );
}

export default function ContinuumMap() {
  const cohortNames = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  const counted = CONTINUUM.filter((s) => s.count.status === "known").length;
  const partial = CONTINUUM.filter((s) => s.count.status === "partial").length;
  let n = 0;

  return (
    <div className="space-y-6">
      {/* ── Stage map: phase swimlanes ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The fourteen stages, in order</p>
          <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">
            {counted} counted · {partial} partly · <span className="text-[var(--color-clay)]">{CONTINUUM.length - counted - partial} not counted at all</span>
          </p>
        </div>
        <HowToRead>
          Read top to bottom. Each band is a phase of the journey; each card is one stage a person can physically be in, numbered in the order most people pass through them. Under each name is the stage&apos;s clock (how fast it should move), then whether anyone in Portland can say who is in it right now, and the best number that exists.
        </HowToRead>

        <ol className="divide-y divide-[var(--color-parchment)]">
          {PHASES.map((p) => {
            const stages = CONTINUUM.filter((s) => s.phase === p.key);
            const span = 12 / stages.length;
            const wide = stages.length <= 2;
            return (
              <li key={p.key} className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[180px_minmax(0,1fr)] xl:gap-6">
                <div className="flex items-start gap-3 xl:block">
                  <span className="mt-1 block h-10 w-1 shrink-0 rounded-full xl:mb-3 xl:h-1 xl:w-10" style={{ backgroundColor: p.color }} aria-hidden />
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: p.color }}>{p.label}</p>
                    <p className="text-[13px] leading-snug text-[var(--color-ink-light)]">{p.sub}</p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-ink-muted)]">{stages.length} {stages.length === 1 ? "stage" : "stages"}</p>
                  </div>
                </div>
                <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
                  {stages.map((s) => {
                    n += 1;
                    const st = STATUS[s.count.status];
                    return (
                      <li
                        key={s.id}
                        className={`flex flex-col rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 xl:[grid-column:span_var(--span)] ${wide ? "xl:flex-row xl:items-stretch xl:gap-6" : ""}`}
                        style={{ ["--span" as string]: span }}
                      >
                        <div className={`min-w-0 ${wide ? "xl:flex-1" : ""}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] font-bold text-[var(--color-ink-muted)]">{String(n).padStart(2, "0")}</span>
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} aria-hidden />
                          </div>
                          <h4 className="mt-1.5 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-canopy)]">{s.name}</h4>
                          <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">
                            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Clock · </span>
                            {s.duration.split(";")[0].split(". ")[0]}
                          </p>
                        </div>
                        <div className={`mt-3 rounded-sm px-3 py-2.5 ${st.bg} ${wide ? "xl:mt-0 xl:w-[260px] xl:shrink-0" : "xl:mt-auto"}`}>
                          <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${st.cls}`}>{st.label}</p>
                          <p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink)] tabular-nums" title={s.count.what}>{s.count.portlandToday}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>

        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
          <span className="font-semibold text-[var(--color-fern)]">Counted</span> means a published figure exists for who is in the stage now.{" "}
          <span className="font-semibold text-[#a9784f]">Partly counted</span> means capacity or annual throughput is published but not who is there today.{" "}
          <span className="font-semibold text-[var(--color-clay)]">Not counted</span> means nobody can say. Section 02 defines every stage in full.
        </p>
      </div>

      {/* ── Cohort × stage matrix ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Who passes through which stage, in what order</p>
          <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{PATHWAYS.length} kinds of people × {CONTINUUM.length} stages</p>
        </div>
        <HowToRead>
          Each row is one kind of person; each column is a stage, in the same order as above. A number means that person passes through that stage, and the number is the step order.{" "}
          <span className="mx-0.5 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--color-ember)] align-middle font-mono text-[10px] font-bold text-[var(--color-canopy)]">1</span>{" "}
          marks the first door, the one that has to exist for that person; most failures are the wrong first door. Blank means the stage is skipped on purpose. The last column is the strongest study behind that order. Pick a person in section 05 to see one path at a time.
        </HowToRead>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-[12px] xl:min-w-0 xl:table-fixed">
            <thead>
              <tr className="border-b border-[var(--color-parchment)]">
                <th className="sticky left-0 z-10 w-[140px] 2xl:w-[180px] bg-white px-3 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] sm:px-6">Kind of person</th>
                {CONTINUUM.map((s, i) => (
                  <th key={s.id} className="px-0.5 py-3 text-center align-bottom font-medium leading-tight text-[var(--color-ink-light)]" title={s.name}>
                    <span className="block font-mono text-[9.5px] text-[var(--color-ink-muted)] xl:hidden 2xl:block">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-0.5 block text-[10.5px] xl:mx-auto xl:mt-1 xl:rotate-180 xl:whitespace-nowrap xl:text-[10.5px] xl:[writing-mode:vertical-rl] 2xl:mt-0.5 2xl:rotate-0 2xl:whitespace-normal 2xl:text-[11px] 2xl:[writing-mode:horizontal-tb]"><span className="hidden font-mono text-[9.5px] text-[var(--color-ink-muted)] xl:inline 2xl:hidden">{String(i + 1).padStart(2, "0")} · </span>{shortName(s)}</span>
                  </th>
                ))}
                <th className="w-[88px] 2xl:w-[110px] px-2 py-3 text-left align-bottom font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Evidence for the order</th>
              </tr>
            </thead>
            <tbody>
              {PATHWAYS.map((p) => {
                const order = new Map(p.steps.map((id, i) => [id, i + 1]));
                return (
                  <tr key={p.cohort} className="border-b border-[var(--color-parchment)] last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 text-[13px] font-semibold leading-tight text-[var(--color-ink)]">
                      {cohortNames.get(p.cohort) ?? p.cohort}
                    </td>
                    {CONTINUUM.map((s) => {
                      const k = order.get(s.id);
                      const first = k === 1;
                      return (
                        <td key={s.id} className="px-1 py-3 text-center">
                          {k ? (
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-bold ${
                                first ? "bg-[var(--color-ember)] text-[var(--color-canopy)]" : "bg-[var(--color-canopy)]/10 text-[var(--color-canopy)]"
                              }`}
                              title={`${cohortNames.get(p.cohort)}: step ${k} is ${s.name}`}
                            >
                              {k}
                            </span>
                          ) : (
                            <span className="text-[var(--color-parchment)]" aria-hidden>·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-3 text-[11.5px] leading-snug text-[var(--color-ink-light)]">{EVIDENCE_LABEL[p.evidence] ?? p.evidence}</td>
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
