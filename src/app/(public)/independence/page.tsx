import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Eye,
  FileSearch,
  Handshake,
  Building2,
  Megaphone,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { pageMeta } from "@/lib/page-meta";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "Independence & Funding",
  description:
    "How Portland Civic Lab stays independent while taking paid work from governments, businesses, nonprofits, and supporters: the rules we operate under, every contract we hold, how we're funded, and where we're not neutral.",
  path: "/independence",
});

const RULES = [
  {
    icon: Handshake,
    title: "One side per matter",
    body: "We never take money from two parties with opposing interests in the same transaction. If we're advising a public body on a deal, nobody across the table is paying us anything.",
  },
  {
    icon: Building2,
    title: "Private clients are on the register too",
    body: "Property owners, developers, and firms who hire us appear on this page by client, scope, and dates, the same as public bodies. We don't publish analysis on a property while its owner is paying us, and the engagement is disclosed on any related public work afterward.",
  },
  {
    icon: Scale,
    title: "We compete for public work",
    body: "Small one-time engagements go through an agency's normal small-procurement process. Anything ongoing, or above the informal threshold, we win through a process someone else could win. No sole-source awards for ongoing work, and no pricing engineered to slip under a threshold.",
  },
  {
    icon: FileSearch,
    title: "Spec-writer or bidder — never both",
    body: "If we help a public body scope a solicitation, we disclose that in writing and accept that we may be barred from bidding on the result. Understanding the problem is not a license to write our own shopping list.",
  },
  {
    icon: Eye,
    title: "Conflicts are flagged in the work itself",
    body: "When a finding or recommendation touches something we sell, the document says so, in place — and recommends independent validation before any procurement. You should never need this page to spot the conflict.",
  },
  {
    icon: ShieldCheck,
    title: "No grading our own homework",
    body: "We don't evaluate programs whose systems or data pipelines we built unless an outside evaluator of record signs the result.",
  },
  {
    icon: Megaphone,
    title: "Written for the public record",
    body: "We assume every message we send a public official will be read by the public — under Oregon law, it usually can be. We write accordingly, and we'd be comfortable with any of it on a front page.",
  },
];

export default function IndependencePage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Independence &amp; funding
          </span>
        </div>

        <h1 className="font-editorial-normal text-[40px] sm:text-[56px] lg:text-[64px] text-[var(--color-ink)] leading-[1.05] max-w-4xl">
          Don&apos;t take our word for it.
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] sm:text-[19px] text-[var(--color-ink-light)] leading-relaxed">
          Portland Civic Lab publishes analysis about the same governments,
          owners, and institutions that can hire it. That only works if the
          rules, the money, and the conflicts are public — so they live on this
          page, where anyone can check them.
        </p>
      </section>

      {/* The rules */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              The rules
            </span>
          </div>
          <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
            The rules we operate under
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
            These aren&apos;t aspirations. They&apos;re operating rules — and if
            you catch us breaking one, we want to hear about it.
          </p>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RULES.map((rule) => (
              <div
                key={rule.title}
                className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:last:col-span-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]">
                  <rule.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-editorial text-[22px] text-[var(--color-ink)] leading-tight">
                  {rule.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] text-[var(--color-ink-light)] leading-relaxed">
                  {rule.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            The register
          </span>
        </div>
        <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
          Every contract we hold, public and private
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
          Anyone can hire the Lab: governments, businesses, nonprofits, and
          individual supporters. This register is what makes that safe to say.
          Each engagement appears here within a week of signature.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              label: "Government contracts",
              note: "Client, scope, dollar value, dates, and the procurement it was won through.",
            },
            {
              label: "Private engagements",
              note: "Client, scope, and dates. Where a client requires confidentiality, the property type and scope are listed and the fact of the engagement is disclosed.",
            },
            {
              label: "Sponsored programs",
              note: "The supporter, the program funded, the amount, and the period, with the supporter credited on the work.",
            },
          ].map((r) => (
            <div key={r.label} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                {r.label}
              </p>
              <p className="mt-2 font-editorial text-[26px] text-[var(--color-ink)]">None.</p>
              <p className="mt-2 text-[14px] text-[var(--color-ink-light)] leading-relaxed">{r.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-[var(--color-ink-muted)]">
          Current as of September 2026.
        </p>
      </section>

      {/* Funding */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              Funding
            </span>
          </div>
          <h2 className="font-editorial text-[28px] sm:text-[36px] text-[var(--color-ink)] leading-tight max-w-2xl">
            How the Lab is funded today
          </h2>
          <div className="mt-6 max-w-2xl space-y-4 text-[16px] text-[var(--color-ink-light)] leading-relaxed">
            <p>
              Portland Civic Lab is a for-profit company, funded today by its
              founder and by contributions from supporters who want the public
              tools to stay free. Because we&apos;re a company rather than a
              charity, contributions aren&apos;t tax-deductible — we say so
              everywhere we ask.
            </p>
            <p>
              The model is the one an economics consultancy or a research firm
              uses: we take paid work from governments, businesses, nonprofits,
              foundations, and individuals, for policy analysis, data products,
              dashboards, and software, at published prices. What we don&apos;t
              do is let the source of the money shape the finding.
            </p>
            <p>
              When a supporter funds a piece of public research, the sponsor is
              named on the work itself. Sponsors fund the question, never the
              answer — and paid work of any kind never buys a conclusion. Every
              engagement we take preserves our right to publish disagreement.
            </p>
          </div>
        </div>
      </section>

      {/* Where we're not neutral */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-16">
        <div className="relative overflow-hidden rounded-sm border border-[var(--color-canopy)] bg-[var(--color-canopy)] noise-overlay p-7 sm:p-10">
          <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-ember)]" />
          <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
            <Megaphone className="h-4 w-4" />
            Where we&apos;re not neutral
          </div>
          <h2 className="mt-4 font-editorial text-[26px] sm:text-[32px] text-white leading-tight max-w-2xl">
            Our founder campaigns on the Moda Center deal
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-[15.5px] leading-relaxed text-white/80">
            <p>
              Portland Civic Lab&apos;s founder publicly runs{" "}
              <span className="font-semibold text-white">
                Rip City Not Rip Off
              </span>
              , an advocacy campaign about the City&apos;s Moda Center arena
              deal. We&apos;d rather tell you than have you find out.
            </p>
            <p>
              Two commitments follow from it. Our public analysis covers the
              arena the way it covers everything else — built from public
              sources, with every source labeled. And our paid work excludes
              it: while the campaign runs, Portland Civic Lab will not accept
              payment from the City, the team, or any other financially
              interested party for work touching the live arena negotiation.
            </p>
            <p>
              Advocacy in the open, analysis in the open, and a bright line
              between them — drawn here, in public, where it can be checked.
            </p>
          </div>
        </div>
      </section>

      {/* Records */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-editorial text-[24px] sm:text-[28px] text-[var(--color-ink)] leading-tight">
                We use the public records law we tell you about
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                The Lab files its own Oregon public records requests to fill
                gaps in the city&apos;s data — and tracks every request, and
                every outcome, in public.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/records"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
              >
                See the request tracker
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[14px] text-[var(--color-ink-light)]">
          Questions about anything on this page — or something you think
          belongs on it?{" "}
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-canopy)] hover:underline"
          >
            Ask us directly
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </section>
    </div>
  );
}
