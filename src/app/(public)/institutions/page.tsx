import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  Gauge,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { PARKS_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "For Public Institutions",
  description:
    "Portland Civic Lab builds decision intelligence for public institutions — portfolio briefs, decision analysis, civic data products, and independent evaluation, sold at published prices through open procurement.",
  path: "/institutions",
});

const OFFERINGS = [
  {
    icon: Gauge,
    eyebrow: "Flagship service",
    title: "The maintained record",
    body: "One record of what your bureau owns, promised, and owes: assets, agreements, decisions, and dates, reconciled from public and provided records and kept current, with every line sourced. Your monthly review runs from it. We do the reconciling; your staff never maintain a second tracking system.",
    primary: true,
  },
  {
    icon: FileSearch,
    eyebrow: "Bounded engagement",
    title: "Diagnostics & decision analysis",
    body: "One hard question at a time: the factual baseline, the options actually available, what each one costs, and a decision memo written to survive legal review, budget review, and a hostile hearing.",
    primary: false,
  },
  {
    icon: BarChart3,
    eyebrow: "Public-facing",
    title: "Civic data products",
    body: "Atlas-class data products for your domain — inventories, conditions, service levels, outcomes — built the way we build our own dashboards and the Parks Atlas: source-linked, public, and honest about gaps.",
    primary: false,
  },
  {
    icon: ClipboardCheck,
    eyebrow: "Accountability",
    title: "Independent evaluation",
    body: "Did the program work? Mixed-method evaluation with published methodology. Where independence demands it, an outside evaluator of record signs the result — we don't grade our own homework.",
    primary: false,
  },
];

const PRICING = [
  {
    name: "Diagnostic",
    price: "$15,000–$25,000",
    detail:
      "Four to six weeks on one question. Complete in itself — evidence, options, and a recommendation you can act on with or without us.",
  },
  {
    name: "Maintained-record pilot",
    price: "$40,000–$90,000",
    detail:
      "A bounded pilot sized to one portfolio: the reconciled baseline, the kept record, facilitated monthly reviews, and a written evaluation at the end. Every pilot closes with our honest recommendation — continue, change, or stop.",
  },
  {
    name: "Ongoing maintained record",
    price: "$100,000–$180,000 / year",
    detail:
      "Competitively procured and itemized into three components, so you buy only what you use. The components below add up to the annual band; priced by portfolio size and scope after a pilot has proven the value.",
    components: [
      { label: "Software license & hosting", range: "$20–40K" },
      { label: "Portfolio data stewardship", range: "$30–60K" },
      { label: "Review and briefing service", range: "$50–80K" },
    ],
  },
];

const CONTRACT_RULES = [
  "We compete. Small one-time engagements go through your normal small-procurement process; anything ongoing, or above the informal threshold, we win through a process someone else could win. We never price work to slip under a threshold.",
  "If we helped scope your solicitation, we disclose it in writing — and accept that we may be ineligible to bid on it.",
  "During a live solicitation we might bid on, we don't contact the sponsoring office outside the process.",
  "Any recommendation that touches something we sell carries a conflict flag in the document itself.",
  "Everything we deliver to a public body is written as a public record — because it is one.",
];

export default function InstitutionsPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            For public institutions
          </span>
        </div>

        <h1 className="font-editorial-normal text-[40px] sm:text-[56px] lg:text-[64px] text-[var(--color-ink)] leading-[1.05] max-w-4xl">
          The decisions cross bureau lines. The information doesn&apos;t.
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] sm:text-[19px] text-[var(--color-ink-light)] leading-relaxed">
          The choices that matter most in public institutions — where the money
          goes, which projects slip, what waits on whom — span teams, systems,
          and bureaus. The information for those choices rarely does. Portland
          reorganized its bureaus into service areas in 2025; the records they
          run on did not reorganize with them. Portland Civic Lab builds the
          connective tissue: as a service you can use next month, not a
          software project your staff has to feed.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="rounded-sm bg-[var(--color-canopy)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
          >
            Start a conversation
          </Link>
          <Link
            href="/independence"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-canopy)] hover:underline"
          >
            How we stay independent
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* What we do */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              What we do
            </span>
          </div>
          <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
            Four things we do for institutions
          </h2>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {OFFERINGS.map((o) => (
              <div
                key={o.title}
                className={`relative overflow-hidden rounded-sm border p-6 sm:p-7 ${
                  o.primary
                    ? "bg-[var(--color-canopy)] border-[var(--color-canopy)] text-white sm:col-span-2"
                    : "bg-white border-[var(--color-parchment)]"
                }`}
              >
                <div
                  className={`absolute left-0 right-0 top-0 h-[3px] ${
                    o.primary ? "bg-[var(--color-ember)]" : "bg-[var(--color-canopy)]/80"
                  }`}
                />
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-sm ${
                    o.primary
                      ? "bg-white/10 text-[var(--color-ember)]"
                      : "bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]"
                  }`}
                >
                  <o.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ember)]">
                  {o.eyebrow}
                </div>
                <h3
                  className={`mt-2 font-editorial text-[26px] leading-tight ${
                    o.primary ? "text-white" : "text-[var(--color-ink)]"
                  }`}
                >
                  {o.title}
                </h3>
                <p
                  className={`mt-3 max-w-3xl text-[14.5px] leading-relaxed ${
                    o.primary ? "text-white/75" : "text-[var(--color-ink-light)]"
                  }`}
                >
                  {o.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Published pricing
          </span>
        </div>
        <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
          Our prices are public, so no client wonders whether someone else got
          a different deal
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
          Bands, not quotes — the final number depends on portfolio size and
          scope, and it lands inside the band. We price to the genuine value of
          the work, never to procurement thresholds.
        </p>

        <div className="mt-9 space-y-5">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-7"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h3 className="font-editorial text-[24px] text-[var(--color-ink)]">
                  {tier.name}
                </h3>
                <div className="font-mono text-[15px] font-semibold text-[var(--color-canopy)] tabular-nums">
                  {tier.price}
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-[14.5px] text-[var(--color-ink-light)] leading-relaxed">
                {tier.detail}
              </p>
              {tier.components && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tier.components.map((c) => (
                    <div
                      key={c.label}
                      className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-4 py-3"
                    >
                      <div className="text-[12px] text-[var(--color-ink-light)]">
                        {c.label}
                      </div>
                      <div className="mt-1 font-mono text-[14px] font-semibold text-[var(--color-ink)] tabular-nums">
                        {c.range}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-[var(--color-ink-light)]">
          Custom analysis and new modules are scoped and priced separately —
          and appear here when they become standard offerings. Property owners
          and development teams have their own practice and price list on the{" "}
          <Link href="/property" className="font-semibold text-[var(--color-canopy)] hover:underline">
            property page
          </Link>
          .
        </p>
      </section>

      {/* How we contract */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
            <Scale className="h-4 w-4" />
            How we contract
          </div>
          <h2 className="mt-4 font-editorial text-[28px] sm:text-[36px] text-white leading-tight max-w-2xl">
            Rules we hold ourselves to before you ask
          </h2>
          <ul className="mt-8 max-w-3xl space-y-4">
            {CONTRACT_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-ember)]" />
                <span className="text-[15.5px] leading-relaxed text-white/80">
                  {rule}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-white/65">
            If your organization is subject to procurement rules, bring your
            procurement office in early — we prefer it. And the rest of our
            independence commitments, including every government contract we
            hold, live in public.
          </p>
          <Link
            href="/independence"
            className="mt-6 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Read the independence page
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Proof */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Proof
          </span>
        </div>
        <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
          The demo is already public
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
          We don&apos;t ask institutions to imagine what we&apos;d build. The
          Parks Atlas is a kept record of 316 assets and their partners. The
          decisions register is a kept record of every open decision in one
          service area. Both are live, free, and built entirely from public
          data — the same craft we bring to paid work.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard/performance"
            className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
          >
            See the performance cockpits
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={PARKS_URL}
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
          >
            Open the Parks Atlas
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <Link
            href="/decisions"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
          >
            The decisions register
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
