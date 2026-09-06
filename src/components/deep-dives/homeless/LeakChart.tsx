import { CONTINUUM, LEAKS } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";

/** Where the continuum leaks today: what goes into each transition and what comes through, from published counts. */
export default function LeakChart() {
  const stage = new Map(CONTINUUM.map((s, i) => [s.id, { ...s, n: i + 1 }]));
  const holes = CONTINUUM.filter((s) => s.count.status === "unknown");
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What goes in, what comes through</p>
          <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">every number links to the document it came from</p>
        </div>
        <ol className="divide-y divide-[var(--color-parchment)]">
          {LEAKS.map((l) => {
            const s = stage.get(l.stageId);
            const pct = l.outValue == null ? null : Math.round((l.outValue / l.inValue) * 100);
            const w = l.outValue == null ? 0 : Math.max(0.6, (l.outValue / l.inValue) * 100);
            return (
              <li key={l.title} className="grid gap-x-6 gap-y-2 px-5 py-4 sm:px-6 xl:grid-cols-[210px_minmax(0,1fr)_260px] xl:items-center">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{String(s?.n ?? 0).padStart(2, "0")} · {s?.name}</p>
                  <p className="mt-0.5 text-[14px] font-semibold leading-snug text-[var(--color-canopy)]">{l.title}</p>
                  <p className="text-[11.5px] text-[var(--color-ink-muted)]">{l.period}</p>
                  <SourceLinks ids={l.src} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 flex-1 rounded-sm bg-[var(--color-parchment)]" />
                    <span className="w-[150px] shrink-0 text-right font-mono text-[11.5px] tabular-nums text-[var(--color-ink-light)]">{l.inValue.toLocaleString()} {l.inLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 flex-1">
                      {l.outValue == null ? (
                        <div className="h-full w-full rounded-sm border border-dashed border-[var(--color-clay)] bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--color-clay-tint)_6px_12px)]" />
                      ) : (
                        <div className="h-full rounded-sm bg-[var(--color-fern)]" style={{ width: `${w}%` }} />
                      )}
                    </div>
                    <span className={`w-[150px] shrink-0 text-right font-mono text-[11.5px] font-semibold tabular-nums ${l.outValue == null ? "text-[var(--color-clay)]" : "text-[var(--color-fern)]"}`}>
                      {l.outValue == null ? "no rate published" : `${l.outValue.toLocaleString()} ${l.outLabel}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`font-editorial-normal text-[30px] leading-none tabular-nums ${pct == null ? "text-[var(--color-clay)]" : pct < 20 ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{pct == null ? "?" : `${pct}%`}</span>
                  <p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]">{l.read}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
        <div className="bg-[var(--color-canopy)] px-5 py-4 text-white">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">Four stages are holes, not leaks</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/80">They do not exist as counted stages, and three of the four are the floor of the stabilize-first lane. Nothing can leak from a stage nobody can see.</p>
        </div>
        {holes.map((h) => (
          <div key={h.id} className="bg-white px-4 py-4">
            <p className="font-mono text-[10px] text-[var(--color-clay)]">{String(CONTINUUM.indexOf(h) + 1).padStart(2, "0")} · not counted</p>
            <p className="mt-1 text-[14px] font-semibold leading-snug text-[var(--color-canopy)]">{h.name}</p>
            <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-light)]">{h.count.portlandToday}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
