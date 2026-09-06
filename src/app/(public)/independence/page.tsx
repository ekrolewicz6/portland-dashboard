import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Megaphone } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import {
  ClosingCta,
  NumberedList,
  PageHero,
  QuietAction,
  SectionHead,
  SHELL,
} from "@/components/site/Page";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "Independence & Funding",
  description:
    "How Portland Civic Lab stays independent while taking paid work from governments, businesses, nonprofits, and supporters: the rules we operate under, every contract we hold, how we're funded, and where we're not neutral.",
  path: "/independence",
});

const RULES = [
  {
    title: "One side per matter",
    body: "We never take money from two parties with opposing interests in the same transaction. If we're advising a public body on a deal, nobody across the table is paying us anything. If we're screening a property for its owner, the same is true of the buyer, the lender, and the City.",
  },
  {
    title: "Private clients are on the register too",
    body: "Property owners, developers, and firms who hire us appear on this page by client, scope, and dates, the same as public bodies. We don't publish new analysis of a property while its owner is paying us, and any later public work that touches that property says we were paid on it.",
  },
  {
    title: "Nothing public comes down for a client",
    body: "Data and code stay open. Clients buy the work, not exclusivity. No engagement pulls a dataset, a score, a map, or a tool off the site, and no client gets a public figure about them changed except by a correction anyone could ask for.",
  },
  {
    title: "We compete for public work",
    body: "Small one-time engagements go through an agency's normal small-procurement process. Anything ongoing, or above the informal threshold, we win through a process someone else could win. No sole-source awards for ongoing work, no pricing engineered to slip under a threshold, and the same diagnostic costs the same whether the buyer is a bureau, a foundation, or a firm.",
  },
  {
    title: "Spec-writer or bidder, never both",
    body: "If we help a public body scope a solicitation, we disclose that in writing and accept that we may be barred from bidding on the result. Understanding the problem is not a license to write our own shopping list.",
  },
  {
    title: "Conflicts are flagged in the work itself",
    body: "When a finding or recommendation touches something we sell or own, the document says so, in place, and recommends independent validation before any procurement. You should never need this page to spot the conflict.",
  },
  {
    title: "No grading our own homework",
    body: "We don't evaluate programs whose systems or data pipelines we built unless an outside evaluator of record signs the result.",
  },
  {
    title: "Supporters see findings when the public does",
    body: "Sponsors fund the question, never the answer. A supporter is named on the program they fund, gets no preview and no veto, and reads the findings when everyone else does. Every sponsored program is on the register.",
  },
  {
    title: "Advocacy is disclosed and walled off",
    body: "When someone at the Lab campaigns on an issue, this page says so. Our public analysis covers that issue the way it covers everything else, and we take no paid work touching the live matter while the campaign runs.",
  },
  {
    title: "Written for the public record",
    body: "We assume every message we send a public official will be read by the public. Under Oregon law, it usually can be. We write accordingly, and we'd be comfortable with any of it on a front page.",
  },
];

const REGISTER = [
  { label: "Government contracts", note: "Client, scope, dollar value, dates, and the procurement it was won through." },
  { label: "Private engagements", note: "Client, scope, and dates. If a client needs their name kept confidential, the entry still appears with the property type, scope, and dates. The name is the only thing withheld." },
  { label: "Sponsored programs", note: "The supporter, the program funded, the amount, and the period, with the supporter credited on the work." },
];

const MONEY = [
  { source: "The founder", status: "Funds the Lab today" },
  { source: "Supporters", status: "Monthly and founding · not tax-deductible" },
  { source: "Clients", status: "Published prices · none signed yet" },
  { source: "Sponsors", status: "Named on the work · none yet" },
];

function RegisterCard() {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white shadow-[0_2px_4px_rgba(15,36,25,0.05),0_24px_48px_-24px_rgba(15,36,25,0.25)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        <span className="text-[var(--color-ember)]">The register</span>
        <span>As of September 2026</span>
      </div>
      <ul className="divide-y divide-[var(--color-parchment)]">
        {REGISTER.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-4 px-5 py-4">
            <span className="text-[14px] font-semibold text-[var(--color-ink)]">{r.label}</span>
            <span className="font-editorial text-[22px] leading-none text-[var(--color-ink)]">None.</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
        Each engagement appears within a week of signature
      </div>
    </div>
  );
}

export default function IndependencePage() {
  return (
    <div className="bg-[var(--color-paper)]">
      <PageHero
        eyebrow="Independence & funding"
        title="Don't take our word for it."
        lede="Portland Civic Lab publishes analysis about the same governments, owners, and institutions that can hire it. That only works if the rules, the money, and the conflicts are public. So they live on this page, where anyone can check them."
        actions={<QuietAction href="/contact">Catch us breaking one</QuietAction>}
        aside={<RegisterCard />}
      />

      {/* The rules */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
          <SectionHead
            eyebrow="The rules"
            title="The rules we operate under."
            lede="These aren't aspirations. They're operating rules, and if you catch us breaking one, we want to hear about it."
          />
          <div className="mt-10">
            <NumberedList items={RULES} columns={2} />
          </div>
        </div>
      </section>

      {/* The register */}
      <section className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
        <SectionHead
          eyebrow="The register"
          title="Every contract we hold, public and private."
          lede="Anyone can hire the Lab: governments, businesses, nonprofits, and individual supporters. This register is what makes that safe to say. Each engagement appears here within a week of signature."
        />
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
          {REGISTER.map((r) => (
            <div key={r.label} className="border-t border-[var(--color-ink)]/20 pt-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">{r.label}</p>
              <p className="mt-3 font-editorial text-[34px] leading-none text-[var(--color-ink)]">None.</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">{r.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Current as of September 2026</p>
      </section>

      {/* Funding */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <SectionHead eyebrow="Funding" title="How the Lab is funded today." />
              <div className="mt-6 max-w-2xl space-y-4 text-[16px] leading-relaxed text-[var(--color-ink-light)]">
                <p>
                  Portland Civic Lab is a for-profit company, funded today by its founder and by
                  contributions from supporters who want the public tools to stay free. Because
                  we&apos;re a company rather than a charity, contributions aren&apos;t
                  tax-deductible. We say so everywhere we ask.
                </p>
                <p>
                  The model is the one an economics consultancy or a research firm uses: we take
                  paid work from governments, businesses, nonprofits, foundations, and individuals,
                  for policy analysis, data products, dashboards, and software, at published prices.
                  What we don&apos;t do is let the source of the money shape the finding.
                </p>
                <p>
                  When a supporter funds a piece of public research, the sponsor is named on the
                  work itself. Sponsors fund the question, never the answer, and paid work of any
                  kind never buys a conclusion. Every engagement we take preserves our right to
                  publish disagreement.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 lg:pt-16">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">Where the money comes from</p>
              <ul className="mt-4 divide-y divide-[var(--color-parchment)] border-y border-[var(--color-parchment)]">
                {MONEY.map((m) => (
                  <li key={m.source} className="flex items-baseline gap-3 py-3.5">
                    <span className="text-[15px] font-semibold text-[var(--color-ink)]">{m.source}</span>
                    <span className="mb-1 flex-1 border-b border-dotted border-[var(--color-ink-muted)]/50" aria-hidden />
                    <span className="text-right font-mono text-[11.5px] uppercase tracking-[0.1em] text-[var(--color-ink-light)]">{m.status}</span>
                  </li>
                ))}
              </ul>
              <Link href="/donate" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-canopy)] hover:underline">
                What support funds <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Where we're not neutral */}
      <section className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
        <div className="relative overflow-hidden rounded-sm border border-[var(--color-canopy)] bg-[var(--color-canopy)] noise-overlay p-7 sm:p-10">
          <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-ember)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">
              <Megaphone className="h-4 w-4" />
              Where we&apos;re not neutral
            </div>
            <h2 className="mt-4 max-w-2xl font-editorial text-[26px] leading-tight text-white sm:text-[32px]">The Moda Center deal</h2>
            <div className="mt-5 max-w-3xl space-y-4 text-[15.5px] leading-relaxed text-white/80">
              <p>
                Portland Civic Lab&apos;s founder runs <span className="font-semibold text-white">Rip City Not Rip Off</span>, an
                advocacy campaign about the City&apos;s Moda Center arena deal.
              </p>
              <p>
                Two things follow. Our public analysis covers the arena the way it covers everything
                else, from public sources with every source labeled. And while the campaign runs, the
                Lab takes no paid work touching the live arena negotiation from the City, the team, or
                any other financially interested party.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-6 rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="font-editorial text-[24px] leading-tight text-[var(--color-ink)] sm:text-[28px]">
              We use the public records law we tell you about.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
              The Lab files its own Oregon public records requests to fill gaps in the city&apos;s
              data, and tracks every request, and every outcome, in public.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href="/records"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
            >
              See the request tracker
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <ClosingCta
        eyebrow="Hold us to it"
        title="If you catch us breaking a rule, we want to hear about it."
        body="Questions about anything on this page, or something you think belongs on it: write to us. Corrections are logged in public."
        primary={{ label: "Ask us directly", href: "/contact" }}
        secondary={{ label: "The methodology", href: "/methodology" }}
      />
    </div>
  );
}
