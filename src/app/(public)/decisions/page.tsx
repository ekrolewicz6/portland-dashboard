import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import {
  CATEGORY_LABELS,
  CED_INITIATIVES,
  STAGE_LABELS,
  pendingDecisions,
  type InitiativeCategory,
} from "@/lib/performance/ced-initiatives";
import DecisionsRegister, { type CategoryCount, type RegisterRow } from "./DecisionsRegister";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "Decisions on the record",
  description:
    "Every decision in Portland's development portfolio that the public record says is still open: what it is, who owns it, when it is due, and where it says so. Dates and stages only, no ratings. Updated when the record moves.",
  path: "/decisions",
});

const COCKPIT = "/dashboard/performance/dcas/ced";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-08" → "Aug 2026"; "2026-12-31" → "Dec 31, 2026"; anything else as written. */
function dueLabel(due?: string): { label: string; dated: boolean } {
  if (!due) return { label: "Not on record", dated: false };
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(due.trim());
  if (!m) return { label: due, dated: /\d{4}/.test(due) };
  const month = MONTHS[Number(m[2]) - 1] ?? m[2];
  return { label: m[3] ? `${month} ${Number(m[3])}, ${m[1]}` : `${month} ${m[1]}`, dated: true };
}

function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso);
  if (!m) return iso;
  const month = LONG_MONTHS[Number(m[2]) - 1] ?? m[2];
  return m[3] ? `${month} ${Number(m[3])}, ${m[1]}` : `${month} ${m[1]}`;
}

export default function DecisionsPage() {
  const pending = pendingDecisions();
  const rows: RegisterRow[] = pending.map((d) => {
    const { label, dated } = dueLabel(d.due);
    return {
      what: d.what,
      who: d.who,
      due: d.due ?? "",
      dueLabel: label,
      dated,
      initiativeTitle: d.initiative.title,
      initiativeSlug: d.initiative.slug,
      category: d.initiative.category,
      categoryLabel: CATEGORY_LABELS[d.initiative.category],
      stageLabel: STAGE_LABELS[d.initiative.stage],
      owner: d.initiative.owner,
      source: d.initiative.sources[0] ?? null,
    };
  });

  const order: InitiativeCategory[] = ["housing", "permitting", "climate", "economic-development", "arts-venues", "major-projects"];
  const categories: CategoryCount[] = order
    .map((key) => ({ key, label: CATEGORY_LABELS[key], count: rows.filter((r) => r.category === key).length }))
    .filter((c) => c.count > 0);

  const asOf = CED_INITIATIVES.map((i) => i.lastAction?.date).filter((d): d is string => Boolean(d)).sort().at(-1);
  const initiativeCount = new Set(rows.map((r) => r.initiativeSlug)).size;
  const datedCount = rows.filter((r) => r.dated).length;

  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-14 sm:px-8 sm:pt-20 lg:px-12 3xl:max-w-[1800px]">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--color-ember)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Decisions on the record · free · public sources only
          </span>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h1 className="max-w-3xl font-editorial-normal text-[40px] leading-[1.03] text-[var(--color-ink)] sm:text-[56px] lg:text-[60px]">
              Every open decision in the City&apos;s development portfolio.
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
              What the public record says is still undecided: what it is, who owns it, when it
              is due, and where it says so. Dates and stages only, no ratings. Updated when the
              record moves.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 self-end lg:col-span-5">
            {[
              { v: String(rows.length), k: "open decisions" },
              { v: String(datedCount), k: "with a date on the record" },
              { v: String(initiativeCount), k: "initiatives" },
            ].map((s) => (
              <div key={s.k} className="border-t-2 border-[var(--color-canopy)] pt-3">
                <dd className="font-mono text-[28px] font-bold tabular-nums leading-none text-[var(--color-ink)]">{s.v}</dd>
                <dt className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
        {asOf && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Record as of {longDate(asOf)} · Community &amp; Economic Development service area
          </p>
        )}
      </section>

      {/* Register */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 3xl:max-w-[1800px]">
        <DecisionsRegister rows={rows} categories={categories} cockpitHref={COCKPIT} />

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6 lg:col-span-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
              How this is built
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">
              Every row is a decision an initiative&apos;s public record lists as pending: council
              resolutions, portland.gov and Prosper Portland publications, and on-record
              reporting. A date appears only when a document names one. This is a demonstration
              built from public records, not authoritative City status. Today it covers the
              Community &amp; Economic Development service area; other service areas are added as
              their records are read.
            </p>
            <Link
              href={COCKPIT}
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              The full portfolio: every initiative, dependency, and source
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 lg:col-span-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
              Disclosure
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">
              Portland Civic Lab sells a kept version of this record to public institutions: one
              reconciled register of what a bureau owns, promised, and owes, with a monthly
              review that runs from it. Prices are published. This public register is free and
              stays free.
            </p>
            <Link
              href="/institutions"
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              The maintained record, with prices
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
