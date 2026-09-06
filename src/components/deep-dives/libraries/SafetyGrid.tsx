import { DERIVED } from "@/lib/libraries/data";

/**
 * The safety finding, as people rather than percentages. Three 100-figure
 * grids from the November 2022 employee survey, then the incident count
 * with Central's share drawn to scale.
 */
function Figures({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div className="grid grid-cols-20 gap-[3px]" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className="aspect-square rounded-[2px]"
          style={{ background: i < pct ? tone : "var(--color-parchment)" }}
        />
      ))}
    </div>
  );
}

export default function SafetyGrid() {
  const groups = [
    { label: "In-person, public-facing", pct: DERIVED.safeInPerson, tone: "#b85c3a" },
    { label: "Remote, public-facing", pct: DERIVED.safeRemote, tone: "#b85c3a" },
    { label: "Not public-facing", pct: DERIVED.safeNonPublic, tone: "#3d7a5a" },
  ];
  const centralPct = DERIVED.centralIncidentShare * 100;

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          &ldquo;I feel safe at work&rdquo; — of every 100 employees, November 2022
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[34px] font-bold tabular-nums leading-none" style={{ color: g.tone }}>
                  {g.pct}
                </span>
                <span className="text-[14px] text-[var(--color-ink-muted)]">of 100</span>
              </div>
              <p className="mt-1 text-[15px] font-semibold text-[var(--color-ink)]">{g.label}</p>
              <div className="mt-3">
                <Figures pct={g.pct} tone={g.tone} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          The people who face the public felt <strong className="text-[var(--color-clay)]">half as safe</strong> as
          the people who don&apos;t. By 2025 most audit recommendations were implemented or under way, and
          still only <strong className="text-[var(--color-ink)]">{DERIVED.involvedInChanges2025}%</strong> of
          employees felt appropriately involved in the changes made on their behalf.
        </p>
      </div>

      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Incident reports, calendar 2022
          </p>
          <p className="font-mono text-[13px] tabular-nums text-[var(--color-ink-muted)]">
            {DERIVED.incidents2022.toLocaleString()} systemwide · 6 a day
          </p>
        </div>
        <div className="mt-4 flex h-10 w-full gap-[2px] overflow-hidden rounded-sm">
          <div className="h-full bg-[var(--color-clay)]" style={{ width: `${centralPct}%` }} title={`Central Library: ${DERIVED.incidentsCentral2022.toLocaleString()}`} />
          <div className="h-full flex-1 bg-[var(--color-parchment)]" title={`18 other locations: ${(DERIVED.incidents2022 - DERIVED.incidentsCentral2022).toLocaleString()}`} />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-[13px] uppercase tracking-[0.1em]">
          <span className="flex items-center gap-1.5 font-semibold text-[var(--color-clay)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-clay)]" /> Central Library · {DERIVED.incidentsCentral2022.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-parchment)] ring-1 ring-[var(--color-ink-muted)]/40" /> 18 other locations · {(DERIVED.incidents2022 - DERIVED.incidentsCentral2022).toLocaleString()}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          <strong className="text-[var(--color-ink)]">One building carries {Math.round(centralPct)}% of the load.</strong>{" "}
          That is the case for specialist partners at high-need sites rather than systemwide rules — the
          report&apos;s San Francisco model, and for reporting severity per 10,000 visits, not raw counts,
          so a busier building isn&apos;t automatically a worse one.
        </p>
      </div>
    </div>
  );
}
