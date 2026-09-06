import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SsoLink from "@/components/SsoLink";
import {
  ASK_PORTLAND_URL,
  COUNCIL_URL,
  DOWNTOWN_URL,
  OREGON_GOVERNANCE_URL,
  PARKS_URL,
  PERMITS_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
  },
  description:
    "Portland Civic Lab builds free, public, source-linked tools that show how the city and state actually work: what the official numbers say, what residents think, and what could change. Dashboards, deep-dives, a parks atlas, a downtown plan, a guide to City Council, an atlas of Oregon government, surveys, and permitting tools.",
  alternates: { canonical: "https://www.portlandciviclab.org" },
  openGraph: {
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "How the city and state actually work: what the numbers say, what residents think, and what could change. Eight public tools, every figure linked to its source.",
    url: "https://www.portlandciviclab.org",
    siteName: "Portland Civic Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "How the city and state actually work: what the numbers say, what residents think, and what could change.",
  },
};

/**
 * The homepage is a showcase. Each property leads with its own signature
 * visual (captured from the live site into public/images/home), one line on
 * what it shows, and a link. The thesis lives in the hero and the funder
 * section; the About section carries the model and the independence terms.
 */

const dashboardTopics = [
  { title: "Housing", href: "/dashboard/housing" },
  { title: "Homelessness", href: "/dashboard/homelessness" },
  { title: "Safety", href: "/dashboard/safety" },
  { title: "Fiscal health", href: "/dashboard/fiscal" },
  { title: "Performance", href: "/dashboard/performance" },
  { title: "Climate", href: "/dashboard/climate" },
  { title: "Transportation", href: "/dashboard/transportation" },
  { title: "Accountability", href: "/dashboard/accountability" },
];

type Tile = {
  key: string;
  eyebrow: string;
  title: string;
  line: string;
  href: string;
  img: { src: string; width: number; height: number; alt: string };
  span: string;
  sso?: boolean;
  external?: boolean;
};

const TILES: Tile[] = [
  {
    key: "downtown",
    eyebrow: "Portland Possible",
    title: "What if downtown worked for everyone?",
    line: "Every parcel, building, and block in the city center, what each could become, and the coordinated moves it would take.",
    href: DOWNTOWN_URL,
    img: { src: "/images/home/downtown.jpg", width: 2648, height: 1400, alt: "Interactive parcel map of downtown Portland with a selected area panel showing urgency-to-act scores and modeled capacity" },
    span: "lg:col-span-7",
    external: true,
  },
  {
    key: "pps",
    eyebrow: "Deep-dive · The PPS budget",
    title: "Where the next dollar goes.",
    line: "A $2.77 billion budget sorted by what can actually move, and ten decisions the school board could make.",
    href: "/deep-dives/pps-budget",
    img: { src: "/images/home/pps-b.jpg", width: 2572, height: 1900, alt: "The PPS budget as one bar sorted into locked, restricted, committed, and movable money, with three findings beneath it" },
    span: "lg:col-span-5",
  },
  {
    key: "parks",
    eyebrow: "Portland Parks Atlas",
    title: "All 316 parks, searchable by what you want to do there.",
    line: "Conditions, maintenance backlogs, events, and the partners caring for each park, from public data.",
    href: PARKS_URL,
    img: { src: "/images/home/parks-b.jpg", width: 2880, height: 2580, alt: "A map of Portland dotted with the parks where a child can play, filters for what a park is for, and seven ways into the atlas" },
    span: "lg:col-span-5",
    external: true,
  },
  {
    key: "oregon",
    eyebrow: "Oregon Governance Atlas",
    title: "Who controls the next step of every bill.",
    line: "The people and institutions that decide what becomes law, drawn from the chamber rules, with the bargains behind major decisions.",
    href: OREGON_GOVERNANCE_URL,
    img: { src: "/images/home/oregon.jpg", width: 1992, height: 1280, alt: "A flow diagram of how a bill moves through the Oregon House, Senate, Ways and Means, the Governor, courts, and voters" },
    span: "lg:col-span-7",
    external: true,
  },
  {
    key: "dashboards",
    eyebrow: "Dashboards",
    title: "How Portland is actually doing.",
    line: "Housing, homelessness, safety, budgets, and performance: official data in one place, every source linked.",
    href: "/dashboard",
    img: { src: "/images/home/dashboards-b.jpg", width: 2572, height: 1440, alt: "Housing dashboard key metrics and a line chart of open building permits by quarter, showing the backlog growing" },
    span: "lg:col-span-3",
  },
  {
    key: "council",
    eyebrow: "Portland City Council",
    title: "What Council takes up next.",
    line: "Every upcoming meeting from the official record, what is at stake, and how to testify.",
    href: COUNCIL_URL,
    img: { src: "/images/home/council.jpg", width: 2368, height: 1360, alt: "A card showing the next public Council agenda with meeting time, location, and notice status" },
    span: "lg:col-span-3",
    external: true,
  },
  {
    key: "ask",
    eyebrow: "Ask Portland",
    title: "What residents actually think.",
    line: "Independent surveys weighted to the whole city, with the raw numbers shown next to the estimates.",
    href: ASK_PORTLAND_URL,
    img: { src: "/images/home/ask.jpg", width: 2224, height: 1280, alt: "The Ask Portland survey landing page with a live housing survey card" },
    span: "lg:col-span-3",
    external: true,
  },
  {
    key: "permits",
    eyebrow: "Portland Permits",
    title: "Start with an address.",
    line: "Zoning, likely permits, fees, and timelines for a property, before anyone files an application.",
    href: PERMITS_URL,
    img: { src: "/images/home/permits-b.jpg", width: 1792, height: 1030, alt: "The Portland Permits address search with counts of permit applications, form types, and service categories" },
    span: "lg:col-span-3",
    sso: true,
    external: true,
  },
];

const PROOF = [
  { v: "8", k: "free public tools" },
  { v: "316", k: "parks mapped, every one" },
  { v: "5,275", k: "downtown parcels, block by block" },
  { v: "134", k: "documents behind one school budget" },
];

const PRINCIPLES = [
  {
    title: "Every number has a source",
    body: "Each figure on each page traces to a public document, page cited. Numbers that exist only in press reporting are labeled that way. Where the record is silent, the page says so instead of guessing.",
  },
  {
    title: "Independent of what we cover",
    body: "Unaffiliated with and unfunded by any government, union, campaign, or vendor that appears in the work. Every contract the Lab holds is listed on the Independence page, and paid work never buys a conclusion.",
  },
  {
    title: "Built to be used, not just read",
    body: "Calculators for your own tax bill, watch-lists with dates, records requests drafted and ready, and plans specific enough to vote on. The goal is a resident who can act, not only one who is informed.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-px bg-[var(--color-ember)]" />
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
        {children}
      </span>
    </div>
  );
}

function ShowcaseTile({ t }: { t: Tile }) {
  const inner = (
    <>
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <Image
          src={t.img.src}
          width={t.img.width}
          height={t.img.height}
          alt={t.img.alt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.015]"
        />
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
          {t.eyebrow}
        </p>
        <h3 className="mt-1.5 font-editorial text-[22px] leading-tight text-[var(--color-ink)] group-hover:text-[var(--color-canopy)] sm:text-[24px]">
          {t.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{t.line}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-canopy)]">
          Open {t.external ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </p>
      </div>
    </>
  );
  const cls = `group block ${t.span}`;
  if (t.sso) return <SsoLink href={t.href} className={cls}>{inner}</SsoLink>;
  if (t.external) return <a href={t.href} className={cls}>{inner}</a>;
  return <Link href={t.href} className={cls}>{inner}</Link>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Header />

      {/* ── Hero: the thesis, then proof ── */}
      <section className="relative bg-[var(--color-canopy)] noise-overlay overflow-hidden">
        <div className="absolute top-0 right-0 w-[680px] h-[680px] bg-[var(--color-canopy-light)] rounded-full blur-[190px] opacity-28 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-[var(--color-ember)] rounded-full blur-[170px] opacity-[0.08] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-18 lg:py-24">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/85 animate-fade-up">
              <span>Portland Civic Lab</span>
              <div className="w-8 h-px bg-[var(--color-ember)]/60" />
              <span>Free, public, source-linked</span>
            </div>

            <h1 className="mt-6 font-editorial-normal text-[42px] sm:text-[58px] lg:text-[72px] xl:text-[78px] text-white leading-[1.03] tracking-tight animate-fade-up">
              Portland, decoded.
              <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                Numbers, voices, and what comes next.
              </span>
            </h1>

            <p
              className="mt-6 max-w-3xl text-[17px] sm:text-[20px] text-white/80 leading-relaxed animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              We build free public tools that show how the city and state actually work: what
              the official numbers say, what residents think, and what could change. Every figure
              links to its source. We take no money from the governments, unions, or vendors we
              cover.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
              >
                See the work
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/6 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Support the lab
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <dl
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {PROOF.map((s) => (
              <div key={s.k} className="bg-[var(--color-canopy)] p-5">
                <dd className="font-mono text-[28px] font-bold tabular-nums text-white sm:text-[32px]">{s.v}</dd>
                <dt className="mt-1 text-[12.5px] leading-snug text-white/60">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The work: eight tools, each shown ── */}
      <section id="work" className="scroll-mt-20 max-w-[1400px] 3xl:max-w-[1800px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Eyebrow>The work · eight public tools</Eyebrow>
            <h2 className="font-editorial text-[32px] sm:text-[42px] text-[var(--color-ink)] leading-tight">
              Every one built from the public record. Every one free.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-light)] md:text-right">
            Pictures from the tools themselves. Open any of them; there is no account, no paywall,
            and no charge.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          {TILES.map((t) => (
            <ShowcaseTile key={t.key} t={t} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-[var(--color-parchment)] pt-6">
          <span className="mr-2 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Dashboards by topic
          </span>
          {dashboardTopics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="rounded-full border border-[var(--color-parchment)] bg-white px-3 py-1 text-[12.5px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-sage)] hover:text-[var(--color-canopy)]"
            >
              {topic.title}
            </Link>
          ))}
          <Link
            href="/deep-dives"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-canopy)] hover:underline"
          >
            All deep-dives <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── For funders and partners ── */}
      <section className="bg-[var(--color-paper-warm)] border-y border-[var(--color-parchment)]">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <Eyebrow>Why it exists</Eyebrow>
              <h2 className="font-editorial text-[32px] sm:text-[42px] text-[var(--color-ink)] leading-tight">
                Portland runs on numbers almost nobody can check.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
                Budgets, bond audits, permit timelines, and legislative records are public in
                theory and unreadable in practice. The Lab reads them, checks every figure against
                its source, and turns them into pictures and tools a resident, a reporter, or a
                board member can use in an afternoon. The result is a shared set of facts that
                people who disagree can argue from.
              </p>
              <div className="mt-8 rounded-sm border border-[var(--color-canopy)]/25 bg-white p-5">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                  What support pays for
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink)]">
                  The next deep-dive, the next atlas, and the archive that keeps every source
                  checkable years later. The tools stay free either way.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/donate"
                    className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
                  >
                    Support the work
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-white"
                  >
                    Talk to us
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-1">
              {PRINCIPLES.map((p, i) => (
                <div key={p.title} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] font-bold text-[var(--color-ember)]">
                      0{i + 1}
                    </span>
                    <h3 className="font-editorial text-[21px] leading-tight text-[var(--color-ink)]">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About: the model, plainly ── */}
      <section id="about" className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <Eyebrow>About</Eyebrow>
            <h2 className="font-editorial text-[32px] sm:text-[42px] text-[var(--color-ink)] leading-tight">
              A company that gives its civic work away
            </h2>
            <p className="mt-5 max-w-xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
              Everything Portland Civic Lab publishes is free. Every dashboard, deep-dive, atlas,
              and tool is open to any resident: no paywall, no account, no charge. That is the
              heart of the project.
            </p>
            <p className="mt-4 max-w-xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
              Portland Civic Lab is a for-profit company testing a simple idea: that a private
              company can do genuine public-interest work, building tools that make a city more
              legible to the people who live in it, and give them away. We see that as a bridge
              between people who believe in private initiative and people who believe in strong
              public goods. The two do not have to be opposed.
            </p>
            <p className="mt-4 max-w-xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
              Some of our work is paid. Public agencies and institutions can hire the Lab for data
              products, portfolio analysis, and decision support, and we compete for that work
              through normal public procurement, with no sole-source deals and no special access.
              Every government contract we hold is listed on our{" "}
              <Link
                href="/independence"
                className="font-semibold text-[var(--color-canopy)] underline decoration-[var(--color-sage)] underline-offset-2 hover:decoration-[var(--color-canopy)]"
              >
                Independence page
              </Link>
              , and paid work never buys a conclusion.
            </p>
          </div>

          <div className="lg:col-span-7 lg:pl-4">
            <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                <ShieldCheck className="h-4 w-4" />
                How this works
              </div>
              <p className="mt-4 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                The public tools are free and stay free. We cover the cost of building and
                maintaining them, with help from supporters who value the work and chip in to keep
                it free and fund what is next. Because the Lab is a company rather than a charity,
                contributions are not tax-deductible donations. We would rather be plain about that
                than leave it unsaid.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
                >
                  Support the work
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/methodology"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
                >
                  How we source the data
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
