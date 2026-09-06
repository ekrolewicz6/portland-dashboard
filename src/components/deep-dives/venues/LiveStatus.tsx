import Link from "next/link";
import {
  CED_INITIATIVES,
  STAGE_LABELS,
  type CedInitiative,
  type InitiativeStage,
} from "@/lib/performance/ced-initiatives";

/**
 * Live-status bridge between the venue deep-dive and the CED cockpit.
 *
 * With a `slug`, renders that one initiative as a compact inline strip
 * (used beside an asset card). With no slug, renders all four venue
 * initiatives as a card grid with links into the cockpit and the weekly
 * decisions register. Missing slugs are filtered silently: the deep-dive
 * must never throw because a registry record was renamed.
 *
 * `compact` tightens the grid cards' padding (the slug strip is already
 * the compact rendering).
 */

const VENUE_SLUGS = [
  "moda-center-renovation-blazers-lease",
  "keller-psu-performing-arts-decision",
  "rose-quarter-district-development-partner",
  "portland5-management-transition",
] as const;

const COCKPIT_HREF = "/dashboard/performance/dcas/ced";

function stageChipClasses(stage: InitiativeStage): string {
  if (stage === "in-negotiation" || stage === "decision-pending") {
    return "border-[var(--color-ember)]/30 bg-[var(--color-ember)]/10 text-[var(--color-ember)]";
  }
  if (stage === "implementation") {
    return "border-[var(--color-canopy)]/25 bg-[var(--color-canopy)]/10 text-[var(--color-canopy)]";
  }
  return "border-[var(--color-parchment)] bg-[var(--color-paper-warm)] text-[var(--color-ink-light)]";
}

function StageChip({ stage }: { stage: InitiativeStage }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${stageChipClasses(stage)}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export default function LiveStatus({ slug, compact }: { slug?: string; compact?: boolean }) {
  const bySlug = new Map(CED_INITIATIVES.map((i) => [i.slug, i]));

  /* ── Single-initiative inline strip ── */
  if (slug) {
    const init = bySlug.get(slug);
    if (!init) return null;
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Live status · CED cockpit
        </span>
        <StageChip stage={init.stage} />
        {init.nextMilestone ? (
          <span className="text-[12px] leading-snug text-[var(--color-ink-light)]">
            {init.nextMilestone.label} ·{" "}
            <span className="font-mono tabular-nums">{init.nextMilestone.date}</span>
          </span>
        ) : null}
        <Link
          href={COCKPIT_HREF}
          className="-my-2 ml-auto inline-flex min-h-[44px] items-center whitespace-nowrap text-[12px] font-semibold text-[var(--color-canopy)] hover:text-[var(--color-canopy-light)]"
        >
          Track live →
        </Link>
      </div>
    );
  }

  /* ── All four venue initiatives ── */
  const initiatives = VENUE_SLUGS.map((s) => bySlug.get(s)).filter(
    (i): i is CedInitiative => Boolean(i),
  );
  if (initiatives.length === 0) return null;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {initiatives.map((init) => {
          const firstDecision = init.decisionsPending[0];
          return (
            <div
              key={init.slug}
              className={`rounded-sm border border-[var(--color-parchment)] bg-white ${
                compact ? "p-4" : "p-5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
                  {init.title}
                </h3>
                <StageChip stage={init.stage} />
              </div>

              {init.nextMilestone ? (
                <div className="mt-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Next milestone
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink)]">
                    {init.nextMilestone.label}{" "}
                    <span className="whitespace-nowrap font-mono text-[12px] tabular-nums text-[var(--color-ink-light)]">
                      · {init.nextMilestone.date}
                    </span>
                  </p>
                </div>
              ) : null}

              {firstDecision ? (
                <div className="mt-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Decision pending
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">
                    {firstDecision.what}
                    {firstDecision.due ? (
                      <span className="font-mono text-[12px] tabular-nums">
                        {" "}
                        · due {firstDecision.due}
                      </span>
                    ) : null}
                  </p>
                </div>
              ) : null}

              {init.lastAction ? (
                <p className="mt-3.5 border-t border-[var(--color-parchment)] pt-3 text-[12px] leading-snug text-[var(--color-ink-muted)]">
                  <span className="font-mono tabular-nums">{init.lastAction.date}</span> ·{" "}
                  {init.lastAction.what}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-8">
        <Link
          href={COCKPIT_HREF}
          className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[var(--color-canopy)] hover:text-[var(--color-canopy-light)]"
        >
          The CED cockpit: every initiative, decision, and source →
        </Link>
        <Link
          href="/decisions"
          className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[var(--color-canopy)] hover:text-[var(--color-canopy-light)]"
        >
          The decisions register →
        </Link>
      </div>
    </div>
  );
}
