import { TRIPWIRES } from "@/lib/pps-budget/data";

/**
 * What to watch: six dates, one number each, and your move.
 *
 * Server component, light context. Six compact rows hang off a single
 * hairline rail (border-l parchment), one per tripwire in TRIPWIRES. Each
 * row carries a small ember square dot riding the rail (the site's marker
 * convention, matching the venue dive's PhaseTimeline), a muted mono index,
 * the what in semibold, and the tripwire underneath: the single observable
 * that tells you which way it broke. The rail ends at the last dot so the
 * list reads as a watch list with a bottom, not an open-ended timeline.
 */

type Tripwire = (typeof TRIPWIRES)[number];

function TripwireRow({
  tripwire,
  index,
  isLast,
}: {
  tripwire: Tripwire;
  index: number;
  isLast: boolean;
}) {
  return (
    <li
      className={`relative border-l pl-6 sm:pl-8 ${
        isLast
          ? "border-transparent pb-1"
          : "border-[var(--color-parchment)] pb-7 sm:pb-8"
      }`}
    >
      {/* Ember dot riding the rail */}
      <span
        aria-hidden
        className="absolute left-0 top-[7px] h-[7px] w-[7px] -translate-x-1/2 bg-[var(--color-ember)] ring-4 ring-[var(--color-paper)]"
      />

      {/* The what */}
      <p className="flex items-baseline gap-x-2.5">
        <span
          aria-hidden
          className="font-mono text-[10px] font-semibold tabular-nums tracking-[0.08em] text-[var(--color-ink-muted)]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
          {tripwire.what}
        </span>
      </p>

      {/* The tripwire: the one observable */}
      <p className="mt-1.5 max-w-2xl text-[14px] leading-snug text-[var(--color-ink-light)]">
        {tripwire.tripwire}
      </p>
      <details className="group mt-2 max-w-2xl">
        <summary className="cursor-pointer list-none font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ember)] hover:text-[var(--color-ink)]">
          Your move <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span>
        </summary>
        <p className="mt-1.5 border-l-2 border-[var(--color-ember)]/50 pl-3 text-[13.5px] leading-snug text-[var(--color-ink)]">
          {tripwire.action}
        </p>
      </details>
    </li>
  );
}

export default function Tripwires() {
  return (
    <div>

      <ol className="mt-7">
        {TRIPWIRES.map((t, i) => (
          <TripwireRow
            key={t.what}
            tripwire={t}
            index={i}
            isLast={i === TRIPWIRES.length - 1}
          />
        ))}
      </ol>

      <p className="mt-6 font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
        Dates and figures:
        Portland Public Schools budget documents, Oregon PERS rate filings,
        and the 2025 bond program. Portland Civic Lab analysis.
      </p>
    </div>
  );
}
