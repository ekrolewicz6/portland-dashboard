"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type RegisterRow = {
  what: string;
  who: string;
  due: string;
  dueLabel: string;
  dated: boolean;
  initiativeTitle: string;
  initiativeSlug: string;
  category: string;
  categoryLabel: string;
  stageLabel: string;
  owner: string;
  source: { label: string; url: string } | null;
};

export type CategoryCount = { key: string; label: string; count: number };

export default function DecisionsRegister({
  rows,
  categories,
  cockpitHref,
}: {
  rows: RegisterRow[];
  categories: CategoryCount[];
  cockpitHref: string;
}) {
  const [category, setCategory] = useState<string>("all");
  const [datedOnly, setDatedOnly] = useState(false);

  const visible = useMemo(
    () => rows.filter((r) => (category === "all" || r.category === category) && (!datedOnly || r.dated)),
    [rows, category, datedOnly],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            category === "all"
              ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white"
              : "border-[var(--color-parchment)] bg-white text-[var(--color-ink)] hover:border-[var(--color-sage)]"
          }`}
        >
          All <span className="ml-1 font-mono text-[11px] opacity-70">{rows.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            aria-pressed={category === c.key}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              category === c.key
                ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white"
                : "border-[var(--color-parchment)] bg-white text-[var(--color-ink)] hover:border-[var(--color-sage)]"
            }`}
          >
            {c.label} <span className="ml-1 font-mono text-[11px] opacity-70">{c.count}</span>
          </button>
        ))}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[13px] text-[var(--color-ink-light)]">
          <input
            type="checkbox"
            checked={datedOnly}
            onChange={(e) => setDatedOnly(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-canopy)]"
          />
          Dated only
        </label>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="hidden grid-cols-[120px_1fr_220px_140px] gap-4 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)] md:grid">
          <span>Due</span>
          <span>Decision</span>
          <span>Who decides</span>
          <span>Source</span>
        </div>
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-center text-[14.5px] text-[var(--color-ink-light)]">
            No decisions match that filter.
          </p>
        ) : (
          <ol className="divide-y divide-[var(--color-parchment)]">
            {visible.map((r, i) => (
              <li
                key={`${r.initiativeSlug}-${i}`}
                className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[120px_1fr_220px_140px] md:items-start md:gap-4"
              >
                <span
                  className={`font-mono text-[12.5px] font-semibold tabular-nums ${
                    r.dated ? "text-[var(--color-clay)]" : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {r.dueLabel}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold leading-snug text-[var(--color-ink)]">{r.what}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[var(--color-ink-muted)]">
                    <Link href={`${cockpitHref}#${r.initiativeSlug}`} className="font-medium text-[var(--color-canopy)] hover:underline">
                      {r.initiativeTitle}
                    </Link>
                    <span aria-hidden>·</span>
                    <span>{r.categoryLabel}</span>
                    <span aria-hidden>·</span>
                    <span>{r.stageLabel}</span>
                  </span>
                </span>
                <span className="text-[13px] leading-snug text-[var(--color-ink-light)]">{r.who}</span>
                <span>
                  {r.source ? (
                    <a
                      href={r.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-canopy)] hover:text-[var(--color-fern)]"
                    >
                      <span className="line-clamp-2">{r.source.label}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">No source on record</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        Showing {visible.length} of {rows.length}
      </p>
    </div>
  );
}
