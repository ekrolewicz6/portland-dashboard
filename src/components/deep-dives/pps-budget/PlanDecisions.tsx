import type { ReactNode } from "react";
import type { PlanDecision } from "@/lib/pps-budget/plan";
import { PLAN_DECISIONS, RECONCILIATION_RULE } from "@/lib/pps-budget/plan";

/**
 * The plan section: ten decisions the board could adopt, each with the
 * (seven hostile reviewers, the objection counts, the persona chips),
 * the ten decision cards with motion, cost/authority meta, the hardest
 * objection and its answer, and closes with the reconciliation rule as
 * a full-width pull line. Dark-section component: renders on the
 * canopy background. Server component.
 */

function DarkEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
      {children}
    </p>
  );
}

function DecisionCard({ d }: { d: PlanDecision }) {
  return (
    <article className="rounded-sm border border-white/15 bg-white/[0.04] p-5 sm:p-7">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
        {d.id}
      </p>

      <h3 className="mt-2.5 font-editorial text-[21px] leading-snug text-white sm:text-[24px]">
        {d.title}
      </h3>

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] tabular-nums text-white/60">
        <span>
          <span className="font-semibold uppercase tracking-[0.14em] text-white/40">Cost </span>
          {d.cost}
        </span>
        <span>
          <span className="font-semibold uppercase tracking-[0.14em] text-white/40">
            Authority{" "}
          </span>
          {d.authority}
        </span>
      </p>

      {/* Objection and answer, expandable so the decision leads */}
      <details className="group mt-5">
        <summary className="cursor-pointer list-none font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-[var(--color-ember-bright)]">The motion, the strongest objection, and the answer <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span></summary>
        <div className="mt-3 rounded-sm border border-[var(--color-clay)]/40 bg-[var(--color-clay)]/15 p-4 sm:p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">The motion</p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/85">{d.motion}</p>
          <div className="mt-4 border-t border-white/15 pt-4" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            What {d.objection.from} would say
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">{d.objection.text}</p>
        </div>
        <div className="mt-4 border-l-2 border-[var(--color-sage)]/60 pl-4 sm:pl-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sage)]">
            The answer
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">{d.answer}</p>
        </div>
      </details>
    </article>
  );
}

export default function PlanDecisions() {
  return (
    <div className="space-y-8">
      {/* ── If you sit on the board: start Monday ── */}
      <div className="rounded-sm border border-[var(--color-ember)]/50 bg-[var(--color-ember)]/10 p-5 sm:p-7">
        <DarkEyebrow>If you sit on the board, start here</DarkEyebrow>
        <p className="mt-2.5 max-w-3xl font-editorial text-[20px] leading-[1.35] text-white sm:text-[23px]">
          Three motions that cost nearly nothing, need nobody&apos;s permission, and could pass
          this fall:
        </p>
        <ol className="mt-4 max-w-3xl space-y-2.5 text-[14px] leading-relaxed text-white/85">
          <li>
            <span className="font-mono text-[11px] font-semibold text-[var(--color-ember-bright)]">D0+D1 · </span>
            Publish the one-page budget, and put a forecast-accuracy scorecard on the quarterly
            reports the district already produces.
          </li>
          <li>
            <span className="font-mono text-[11px] font-semibold text-[var(--color-ember-bright)]">D2 · </span>
            Give the citizen review committee staged access and answer its recommendations in
            writing before adoption.
          </li>
          <li>
            <span className="font-mono text-[11px] font-semibold text-[var(--color-ember-bright)]">D3 · </span>
            Adopt the capital rule: no public number below the validated estimate without a
            recorded, line-item explanation.
          </li>
        </ol>
      </div>

      {/* ── All ten, at a glance ── */}
      <div className="rounded-sm border border-white/15 bg-white/[0.04] p-5 sm:p-7">
        <DarkEyebrow>The ten decisions at a glance</DarkEyebrow>
        <ol className="mt-4 grid gap-x-8 gap-y-2 text-[13.5px] leading-snug text-white/80 md:grid-cols-2">
          {PLAN_DECISIONS.map((d) => (
            <li key={d.id} className="flex gap-2.5">
              <span className="shrink-0 font-mono text-[11px] font-semibold text-[var(--color-ember-bright)]">
                {d.id}
              </span>
              <span>{d.title}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── The ten decisions, single column ── */}
      <div className="space-y-6">
        {PLAN_DECISIONS.map((d) => (
          <DecisionCard key={d.id} d={d} />
        ))}
      </div>

      {/* ── The reconciliation rule, full width ── */}
      <div className="border-y border-white/15 py-7 sm:py-9">
        <DarkEyebrow>The reconciliation rule</DarkEyebrow>
        <p className="mt-3 max-w-4xl font-editorial text-[24px] leading-[1.3] text-white sm:text-[30px]">
          {RECONCILIATION_RULE}
        </p>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-white/40">
        Sources: PPS adopted budget documents and board policies, Oregon Secretary of State audit
        division, PPS Community Budget Review Committee reports, Multnomah County Tax Supervising
        and Conservation Commission
      </p>
    </div>
  );
}
