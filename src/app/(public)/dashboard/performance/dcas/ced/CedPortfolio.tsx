import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  GitBranch,
  Scale,
} from "lucide-react";
import {
  CED_INITIATIVES,
  STAGE_LABELS,
  initiativesByCategory,
  pendingDecisions,
  type CedInitiative,
  type InitiativeStage,
} from "@/lib/performance/ced-initiatives";

const STAGE_STYLES: Record<InitiativeStage, string> = {
  planning: "border-[var(--color-sage)]/50 bg-[var(--color-sage)]/12 text-[var(--color-canopy)]",
  "decision-pending": "border-[var(--color-ember)]/50 bg-[var(--color-ember)]/12 text-[var(--color-clay)]",
  "in-negotiation": "border-[var(--color-ember)]/40 bg-[var(--color-ember)]/8 text-[var(--color-clay)]",
  implementation: "border-[var(--color-canopy)]/30 bg-[var(--color-canopy)]/8 text-[var(--color-canopy)]",
  operational: "border-[var(--color-parchment)] bg-[var(--color-paper-warm)] text-[var(--color-ink-light)]",
};

function InitiativeCard({ initiative }: { initiative: CedInitiative }) {
  return (
    <article className="flex flex-col rounded-sm border border-[var(--color-parchment)] bg-white p-5 shadow-[0_12px_45px_rgba(15,36,25,0.045)]">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          {initiative.owner}
        </p>
        <span
          className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STAGE_STYLES[initiative.stage]}`}
        >
          {STAGE_LABELS[initiative.stage]}
        </span>
      </div>

      <h3 className="mt-2 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">
        {initiative.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-light)]">
        {initiative.summary}
      </p>

      <div className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-[var(--color-ink)]">
        {initiative.funding && (
          <div className="flex items-start gap-2">
            <CircleDollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-canopy)]" />
            <span>{initiative.funding}</span>
          </div>
        )}
        {initiative.nextMilestone && (
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-canopy)]" />
            <span>
              <span className="font-semibold">Next:</span>{" "}
              {initiative.nextMilestone.label}{" "}
              <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                · {initiative.nextMilestone.date}
              </span>
            </span>
          </div>
        )}
        {initiative.dependencies.length > 0 && (
          <div className="flex items-start gap-2">
            <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-canopy)]" />
            <span>
              <span className="font-semibold">Waiting on:</span>{" "}
              {initiative.dependencies.join(" · ")}
            </span>
          </div>
        )}
      </div>

      {initiative.lastAction && (
        <p className="mt-4 border-l-2 border-[var(--color-ember)]/50 pl-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            {initiative.lastAction.date} ·{" "}
          </span>
          {initiative.lastAction.what}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4">
        {initiative.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-canopy)] hover:text-[var(--color-fern)]"
          >
            {s.label}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default function CedPortfolio() {
  if (CED_INITIATIVES.length === 0) return null;
  const decisions = pendingDecisions();
  const groups = initiativesByCategory();
  const milestoneCount = CED_INITIATIVES.filter((i) => i.nextMilestone).length;

  return (
    <section className="mt-6">
      {/* Banner */}
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-canopy)] noise-overlay p-6 text-white shadow-[0_22px_80px_rgba(15,36,25,0.12)] sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">
          Public-source demonstration
        </p>
        <h2 className="mt-3 max-w-4xl font-editorial text-[28px] leading-tight tracking-tight sm:text-[36px]">
          The CED portfolio, as one picture
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/74">
          Scorecards measure activity. This section tracks the portfolio itself:
          the major initiatives moving through Community &amp; Economic
          Development, what each is waiting on, and the decisions on the public
          record as unresolved. Built entirely from public sources — every fact
          links to where it came from. Illustrative, not authoritative City
          status.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            `${CED_INITIATIVES.length} initiatives tracked`,
            `${decisions.length} decisions pending`,
            `${milestoneCount} milestones on the calendar`,
          ].map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-white/14 bg-white/8 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/85"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>

      {/* Decisions queue */}
      <div className="mt-5 overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white shadow-[0_22px_80px_rgba(15,36,25,0.065)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
          <Scale className="h-4 w-4 text-[var(--color-canopy)]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-canopy)]">
            Decisions on the record as unresolved
          </p>
        </div>
        <div className="divide-y divide-[var(--color-parchment)]">
          {decisions.map((d) => (
            <div
              key={`${d.initiative.slug}-${d.what}`}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_220px_130px] sm:items-baseline sm:gap-4"
            >
              <p className="text-sm font-semibold leading-snug text-[var(--color-ink)]">
                {d.what}
                <span className="mt-0.5 block font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                  {d.initiative.title}
                </span>
              </p>
              <p className="text-[13px] text-[var(--color-ink-light)]">{d.who}</p>
              <p className="font-mono text-[12px] text-[var(--color-clay)] sm:text-right">
                {d.due ?? "No date set"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Initiatives by category */}
      {groups.map((group) => (
        <div key={group.category} className="mt-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--color-ember)]" />
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
              {group.label}
            </h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {group.items.map((initiative) => (
              <InitiativeCard key={initiative.slug} initiative={initiative} />
            ))}
          </div>
        </div>
      ))}

      {/* Provenance + disclosure */}
      <div className="mt-6 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
        <p>
          This portfolio view is assembled from council records, city and agency
          publications, and on-record reporting; it is refreshed manually, and
          the date on each entry tells you how current it is. Its open decisions
          are also listed in the{" "}
          <Link
            href="/decisions"
            className="font-semibold text-[var(--color-canopy)] hover:underline"
          >
            decisions register
          </Link>
          .
        </p>
        <p className="mt-3">
          <span className="font-semibold text-[var(--color-ink)]">
            Disclosure:
          </span>{" "}
          Portland Civic Lab sells a portfolio-intelligence service built on
          this kind of view —{" "}
          <Link
            href="/institutions"
            className="font-semibold text-[var(--color-canopy)] hover:underline"
          >
            described, with prices, here
          </Link>
          . This public page is free, built only from public records, and stays
          free either way.
        </p>
      </div>
    </section>
  );
}
