/**
 * A steelmanned two-sided debate panel with an adjudication band.
 * Server component; rendered inline within the section where its subject
 * lives, per the rose-quarter Cases grammar.
 *
 * The prop type is structural rather than an import from one deep dive's
 * argument module. Each dive defines its own Debate shape — venues carries
 * source ids the PPS one does not — and they are free to keep diverging in
 * ways this panel never reads. Two byte-identical copies of this file, one
 * per dive, differed only in which module they imported the type from.
 */

interface DebatePoint {
  claim: string;
  body: string;
}

interface DebateSide {
  label: string;
  points: readonly DebatePoint[];
}

export interface DebateModel {
  id: string;
  title: string;
  stakes: string;
  a: DebateSide;
  b: DebateSide;
  adjudication: { headline: string; body: string };
}

export default function Debate({ debate }: { debate: DebateModel }) {
  return (
    <div id={debate.id} className="mt-8 overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember)]">
          The debate
        </p>
        <h3 className="mt-1.5 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">
          {debate.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          <span className="font-semibold text-[var(--color-ink)]">Stakes:</span> {debate.stakes}
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        {[debate.a, debate.b].map((side, i) => (
          <div
            key={side.label}
            className={`p-5 ${i === 0 ? "border-b md:border-b-0 md:border-r border-[var(--color-parchment)]" : ""}`}
          >
            <p
              className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${
                i === 0 ? "text-[var(--color-canopy)]" : "text-[var(--color-clay)]"
              }`}
            >
              {side.label}
            </p>
            <div className="mt-4 space-y-4">
              {side.points.map((p) => (
                <div key={p.claim}>
                  <p className="text-[14px] font-semibold leading-snug text-[var(--color-ink)]">
                    {p.claim}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)] p-5 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
          Where this analysis lands
        </p>
        <p className="mt-2 font-editorial text-[18px] leading-snug">
          {debate.adjudication.headline}
        </p>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-white/78">
          {debate.adjudication.body}
        </p>
      </div>
    </div>
  );
}
