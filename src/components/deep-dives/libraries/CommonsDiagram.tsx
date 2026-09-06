import { BOUNDARIES, LAYERS, LOCATIONS, PROTECTED_PURPOSES } from "@/lib/libraries/data";

/**
 * The model as a picture: a digital layer spanning everything, nineteen
 * squares for the nineteen commons (two of them flagships), mobile nodes
 * reaching past the edge, and the five purposes as the ground the whole
 * thing stands on. Dark section.
 */
export default function CommonsDiagram() {
  const commons = LOCATIONS.filter((l) => l.tier === "commons");
  const flagships = LOCATIONS.filter((l) => l.tier === "flagship");

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-white/15 bg-white/[0.04] p-5 sm:p-7">
        {/* layer 1 */}
        <div className="rounded-sm border border-[var(--color-ember)]/50 bg-[var(--color-ember)]/10 px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">Layer 1 · {LAYERS[0].title}</p>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-white/50">every resident · all hours · every language</p>
          </div>
          <p className="mt-1.5 text-[14px] leading-snug text-white/75">{LAYERS[0].body}</p>
        </div>

        {/* layer 2 + 3 */}
        <div className="mt-3 grid gap-3">
          <div className="rounded-sm border border-[var(--color-sage)]/40 bg-white/[0.03] px-4 py-3">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--color-sage)]">Layer 2 · {LAYERS[1].title}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {commons.map((l) => (
                <span key={l.id} className="rounded-[3px] border border-[var(--color-sage)]/50 bg-[var(--color-sage)]/15 px-2 py-1 font-mono text-[12.5px] text-white/85" title={`${l.address}, ${l.neighborhood}`}>
                  {l.name}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[14px] leading-snug text-white/70">{LAYERS[1].body}</p>
          </div>
          <div className="rounded-sm border border-[var(--color-ember)]/50 bg-white/[0.03] px-4 py-3">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">Layer 3 · {LAYERS[2].title}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flagships.map((l) => (
                <span key={l.id} className="rounded-[3px] bg-[var(--color-ember)] px-2 py-1 font-mono text-[12.5px] font-bold text-[var(--color-canopy)]">
                  {l.name}
                </span>
              ))}
              <span className="rounded-[3px] border border-dashed border-[var(--color-ember)]/60 px-2 py-1 font-mono text-[12.5px] text-white/70">Operations Center</span>
              <span className="rounded-[3px] border border-dashed border-[var(--color-ember)]/60 px-2 py-1 font-mono text-[12.5px] text-white/70">Mobile · schools · shelters · jails · elder housing</span>
            </div>
            <p className="mt-3 text-[14px] leading-snug text-white/70">{LAYERS[2].body}</p>
          </div>
        </div>

        {/* the ground: five purposes */}
        <div className="mt-3 grid gap-px overflow-hidden rounded-sm border border-white/20 bg-white/20 sm:grid-cols-5">
          {PROTECTED_PURPOSES.map((p) => (
            <div key={p.n} className="bg-[var(--color-canopy)] p-3.5">
              <p className="font-mono text-[12px] font-bold text-[var(--color-ember-bright)]">0{p.n}</p>
              <p className="mt-0.5 font-editorial text-[17px] leading-tight text-white">{p.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-white/60">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">
          Five protected purposes · the ground everything stands on
        </p>
      </div>

      <div className="rounded-sm border border-[var(--color-clay)]/50 bg-[var(--color-clay)]/15 p-5 sm:p-6">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          What it must not become
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-3">
          {BOUNDARIES.map((b) => (
            <li key={b} className="flex gap-2.5 text-[15px] leading-snug text-white/85">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--color-ember-bright)]" />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[15px] leading-snug text-white/65">
          When another profession is needed, that agency funds and supervises its own specialists.
        </p>
      </div>
    </div>
  );
}
