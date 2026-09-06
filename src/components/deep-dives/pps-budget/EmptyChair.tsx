import type { ReactNode } from "react";

import { HEADLINE } from "@/lib/pps-budget/data";

/**
 * "The empty chair" governance visual, closing Act II.
 *
 * Server component. Two side-by-side panels compare budget committees:
 * every other large Oregon district seats 7 board members plus 7 appointed
 * citizens (ORS 294.414); Portland seats the 7 board members alone
 * (ORS 294.423), leaving 7 chairs empty. Below, a quote band carries the
 * CBRC's own verdict on the nine working days it was given.
 */

const SEATS = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The advice scorecard: what the CBRC asked for across its 2023-2026 reports,
 * and what happened. Sourced from the reports themselves; the recurring-ask
 * table lives in research/pps-budget/notes/cbrc-findings.md §2.
 */
const SCORECARD = [
  {
    ask: "More than nine days to review the budget",
    asked: "4 straight years",
    outcome: "Unanswered, four years running.",
    acted: false,
  },
  {
    ask: "Drop the paid MAP testing contract; the state offers assessments free",
    asked: "3 reports since 2023",
    outcome: "Still paying, ~$218,000 a year.",
    acted: false,
  },
  {
    ask: "Publish central-office spending where the public can check it",
    asked: "3 straight years",
    outcome: "Not published.",
    acted: false,
  },
  {
    ask: "Measure whether the equity allocation works before changing it",
    asked: "2023 and 2024",
    outcome: "Never produced; allocation halved anyway.",
    acted: false,
  },
  {
    ask: "Report back on which recommendations were acted on",
    asked: "2026",
    outcome: "No such report has ever existed.",
    acted: false,
  },
  {
    ask: "Adopt a long-term fiscal strategy with milestones",
    asked: "2025",
    outcome: "Adopted; committee calls it a first step.",
    acted: true,
  },
  {
    ask: "Evaluate blended classrooms before expanding them",
    asked: "2025",
    outcome: "Done: outside evaluation delivered 2026.",
    acted: true,
  },
] as const;

function SeatRow({
  label,
  variant,
}: {
  label: string;
  variant: "board" | "citizen" | "empty";
}) {
  const chip =
    variant === "board"
      ? "bg-[var(--color-canopy)]"
      : variant === "citizen"
        ? "bg-[var(--color-fern)]"
        : "border border-dashed border-[var(--color-ink-muted)] bg-transparent";
  return (
    <div>
      <div className="flex gap-1.5" aria-hidden="true">
        {SEATS.map((n) => (
          <span key={n} className={`h-8 w-8 shrink-0 rounded-sm ${chip}`} />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function CommitteePanel({
  title,
  statute,
  children,
  caption,
}: {
  title: string;
  statute: string;
  children: ReactNode;
  caption: string;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          {title}
        </p>
        <p className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
          {statute}
        </p>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
      <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
        {caption}
      </p>
    </div>
  );
}

export default function EmptyChair() {
  return (
    <div className="space-y-5">
      {/* ── The two committees, seat by seat ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <CommitteePanel
          title="Every other large Oregon district"
          statute="ORS 294.414"
          caption="The budget committee is the board plus an equal number of appointed citizens. Fourteen people review the budget, and half of them answer to no one but the public."
        >
          <SeatRow label="7 board seats" variant="board" />
          <SeatRow label="7 appointed citizen seats" variant="citizen" />
        </CommitteePanel>
        <CommitteePanel
          title="Portland"
          statute="ORS 294.423"
          caption="Portland is the one large district the statute exempts. The board reviews its own budget, and the seven chairs that would go to citizens anywhere else stay empty."
        >
          <SeatRow label="7 board seats" variant="board" />
          <SeatRow label="No citizen seats" variant="empty" />
        </CommitteePanel>
      </div>

      {/* ── The committee's own verdict ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)]">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Time to review
            </p>
            <p className="mt-1 font-editorial text-[64px] leading-none text-[var(--color-clay)]">
              <span className="font-mono tabular-nums">
                {HEADLINE.cbrcWorkingDays}
              </span>
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-light)]">
              working days to weigh a $2.8 billion budget
            </p>
          </div>
          <div className="border-t border-[var(--color-parchment)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-1">
            <blockquote className="space-y-4">
              <p className="font-editorial text-[18px] sm:text-[20px] leading-snug text-[var(--color-ink)]">
                &ldquo;Budget oversight that cannot be conducted thoroughly
                risks becoming symbolic rather than substantive.&rdquo;
              </p>
            </blockquote>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">The district&rsquo;s own citizen review committee, 2026</p>
          </div>
        </div>
      </div>

      {/* ── The advice scorecard ── */}
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The advice, and what happened to it
          </p>
          <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">Seventeen volunteers, advisory only. What they asked for, 2023–2026, and what happened.</p>
        </div>
        <ul className="divide-y divide-[var(--color-parchment)]">
          {SCORECARD.map((row) => (
            <li
              key={row.ask}
              className="grid gap-x-6 gap-y-1.5 px-5 py-4 md:grid-cols-[minmax(0,5fr)_110px_minmax(0,5fr)]"
            >
              <p className="text-[13.5px] font-semibold leading-snug text-[var(--color-ink)]">
                {row.ask}
              </p>
              <p className="font-mono text-[11px] leading-relaxed text-[var(--color-ink-muted)] md:pt-0.5">
                {row.asked}
              </p>
              <p className="text-[13px] leading-relaxed">
                <span
                  className={`mr-2 inline-block rounded-sm px-1.5 py-0.5 align-middle font-mono text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    row.acted
                      ? "bg-[var(--color-fern)] text-white"
                      : "bg-[var(--color-clay)] text-white"
                  }`}
                >
                  {row.acted ? "Acted on" : "Unanswered"}
                </span>
                <span className="text-[var(--color-ink-light)]">{row.outcome}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink)]">
          The two green rows prove the district can respond when it chooses to. That is what makes
          the five clay rows a choice.
        </p>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
        Sources: Oregon Revised Statutes 294.414 and 294.423; PPS Community Budget Review
        Committee reports to the board, 2023&ndash;2026; TSCC annual report 2024&ndash;25.
      </p>
    </div>
  );
}
