/**
 * A two-sided debate with the verdict visible and the argument one tap away.
 * Visible: title, each side's claims as headlines, the adjudication headline.
 * Collapsed: the bodies and the adjudication's reasoning.
 *
 * The prop type is structural rather than an import from one deep dive's
 * argument module. Each dive defines its own Debate shape — venues carries
 * source ids the PPS one does not — and they are free to keep diverging in
 * ways this panel never reads. Two copies of this file, one per dive,
 * differed only in which module they imported the type from.
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
  a: DebateSide;
  b: DebateSide;
  adjudication: { headline: string; body: string };
}

export default function Debate({ debate }: { debate: DebateModel }) {
  return (
    <div id={debate.id} className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
        <h3 className="font-editorial text-[22px] leading-tight text-[var(--color-ink)]">
          {debate.title}
        </h3>
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
            <ul className="mt-3 space-y-2.5">
              {side.points.map((p) => (
                <li key={p.claim} className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
                  {p.claim}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)] p-5 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
          Where the evidence lands
        </p>
        <p className="mt-2 font-editorial text-[19px] leading-snug sm:text-[21px]">
          {debate.adjudication.headline}
        </p>
        <details className="group mt-3">
          <summary className="cursor-pointer list-none font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 hover:text-white">
            The full argument <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span>
          </summary>
          <div className="mt-3 grid gap-4 border-t border-white/15 pt-4 text-[13.5px] leading-relaxed text-white/80 md:grid-cols-2">
            {[debate.a, debate.b].map((side) => (
              <div key={side.label} className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">{side.label}</p>
                {side.points.map((p) => (
                  <p key={p.claim}>{p.body}</p>
                ))}
              </div>
            ))}
            <p className="border-t border-white/15 pt-3 md:col-span-2">
              <span className="font-semibold text-white">The reasoning: </span>
              {debate.adjudication.body}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
