import { SHELTER_CONTINUUM } from "@/lib/homeless/data";

/**
 * The continuum as a ladder: street at the bottom, home at the top, each
 * model a rung, each rung's gap written beside it in clay.
 */
export default function ShelterContinuum() {
  const rungs = [...SHELTER_CONTINUUM].reverse();
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The ladder Portland needs</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fern)]">▲ home</p>
      </div>
      <ol className="relative mt-4 ml-3 border-l-2 border-[var(--color-parchment)]">
        {rungs.map((r, i) => {
          const top = i === 0;
          const bottom = i === rungs.length - 1;
          return (
            <li key={r.model} className="relative pl-6 pb-5 last:pb-0">
              <span
                className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white ${top ? "bg-[var(--color-fern)]" : bottom ? "bg-[var(--color-storm)]" : "bg-[var(--color-canopy-light)]"}`}
                style={{ boxShadow: "0 0 0 1.5px var(--color-parchment)" }}
                aria-hidden
              />
              <div className="grid gap-x-6 gap-y-1 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="text-[14.5px] font-semibold leading-tight text-[var(--color-canopy)]">{r.model}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-ink-muted)]">{r.job}</p>
                </div>
                <p className="text-[12.5px] leading-snug text-[var(--color-clay)]">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">gap · </span>{r.gap}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 ml-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-storm)]">▼ street</p>
    </div>
  );
}
