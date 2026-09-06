import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTINUUM, PRINCIPLES } from "@/lib/homeless/continuum";
import PathwayExplorer from "./PathwayExplorer";

/**
 * The short version for the homelessness deep dive: pick a person and see
 * their path across the fourteen stages, the four rules that hold the
 * continuum together, and the link to the full page.
 */
export default function ContinuumTldr() {
  const unknown = CONTINUUM.filter((s) => s.count.status === "unknown").length;
  const known = CONTINUUM.filter((s) => s.count.status === "known").length;
  return (
    <div className="space-y-4">
      <PathwayExplorer />
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The four rules that hold it together</p>
          <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">
            {known} of {CONTINUUM.length} stages counted today · {CONTINUUM.length - known - unknown} partly · <span className="text-[var(--color-clay)]">{unknown} not at all</span>
          </p>
        </div>
        <div className="grid gap-[1px] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <div key={p.rule} className="bg-white px-4 py-3.5">
              <p className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">
                <span className="mr-1.5 font-mono text-[11px] font-bold text-[var(--color-ember)]">{i + 1}</span>
                {p.rule}
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Link
        href="/deep-dives/continuum"
        className="group flex flex-col gap-3 rounded-sm bg-[var(--color-canopy)] p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(15,36,25,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">The full continuum</p>
          <p className="mt-1 font-editorial-normal text-[21px] leading-tight sm:text-[23px]">Every stage defined, the six questions that pick the first door, when Housing First works, and how to count each bucket</p>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-white/70">A single framework for outreach, police, EMS, hospitals, and jails to decide the next best step for each person, and to see where people fall through.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ember-bright)]">
          Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
