import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SsoLink from "@/components/SsoLink";
import { withPhotos } from "@/lib/team";
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
    "Free, public, source-linked tools that show how Portland actually works, and the lab that property owners and public institutions hire when a decision needs evidence. Dashboards, deep-dives, a parks atlas, a downtown plan, a guide to City Council, an atlas of Oregon government, surveys, and permitting tools.",
  alternates: { canonical: "https://www.portlandciviclab.org" },
  openGraph: {
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "How the city actually works: what the numbers say, what residents think, and what could change. Eight free public tools, every figure linked to its source, and paid decision work at published prices.",
    url: "https://www.portlandciviclab.org",
    siteName: "Portland Civic Lab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "How the city actually works: what the numbers say, what residents think, and what could change.",
  },
};

/**
 * The homepage has three readers: residents who use the free tools, the
 * owners and institutions who hire the Lab, and the supporters who fund the
 * public program. The hero carries the thesis and the downtown map; the
 * three doors send each reader where they belong; the rest shows the work.
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
  img: { src: string; alt: string; position?: string };
  span: string;
  aspect: string;
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
    img: { src: "/images/home/downtown.jpg", alt: "Interactive parcel map of downtown Portland with a selected area panel showing urgency-to-act scores and modeled capacity" },
    span: "lg:col-span-7",
    aspect: "aspect-[16/9]",
    external: true,
  },
  {
    key: "pps",
    eyebrow: "Deep-dive · The PPS budget",
    title: "Where the next dollar goes.",
    line: "A $2.77 billion budget sorted by what can actually move, and ten decisions the school board could make.",
    href: "/deep-dives/pps-budget",
    img: { src: "/images/home/pps-b.jpg", alt: "The PPS budget as one bar sorted into locked, restricted, committed, and movable money, with three findings beneath it", position: "object-top" },
    span: "lg:col-span-5",
    aspect: "aspect-[5/4]",
  },
  {
    key: "parks",
    eyebrow: "Portland Parks Atlas",
    title: "All 316 parks, searchable by what you want to do there.",
    line: "Conditions, maintenance backlogs, events, and the partners caring for each park, from public data.",
    href: PARKS_URL,
    img: { src: "/images/home/parks-b.jpg", alt: "A map of Portland dotted with the parks where a child can play, filters for what a park is for, and seven ways into the atlas", position: "object-top" },
    span: "lg:col-span-5",
    aspect: "aspect-[5/4]",
    external: true,
  },
  {
    key: "oregon",
    eyebrow: "Oregon Governance Atlas",
    title: "Who controls the next step of every bill.",
    line: "The people and institutions that decide what becomes law, drawn from the chamber rules, with the bargains behind major decisions.",
    href: OREGON_GOVERNANCE_URL,
    img: { src: "/images/home/oregon.jpg", alt: "A flow diagram of how a bill moves through the Oregon House, Senate, Ways and Means, the Governor, courts, and voters", position: "object-top" },
    span: "lg:col-span-7",
    aspect: "aspect-[16/9]",
    external: true,
  },
  {
    key: "dashboards",
    eyebrow: "Dashboards",
    title: "How Portland is actually doing.",
    line: "Housing, homelessness, safety, budgets, and performance: official data in one place, every source linked.",
    href: "/dashboard",
    img: { src: "/images/home/dashboards-b.jpg", alt: "Housing dashboard key metrics and a line chart of open building permits by quarter, showing the backlog growing", position: "object-left-top" },
    span: "lg:col-span-3",
    aspect: "aspect-[16/10]",
  },
  {
    key: "council",
    eyebrow: "Portland City Council",
    title: "What Council takes up next.",
    line: "Every upcoming meeting from the official record, what is at stake, and how to testify.",
    href: COUNCIL_URL,
    img: { src: "/images/home/council.jpg", alt: "A card showing the next public Council agenda with meeting time, location, and notice status", position: "object-left-top" },
    span: "lg:col-span-3",
    aspect: "aspect-[16/10]",
    external: true,
  },
  {
    key: "ask",
    eyebrow: "Ask Portland",
    title: "What residents actually think.",
    line: "Independent surveys weighted to the whole city, with the raw numbers shown next to the estimates.",
    href: ASK_PORTLAND_URL,
    img: { src: "/images/home/ask.jpg", alt: "The Ask Portland survey landing page with a live housing survey card", position: "object-left-top" },
    span: "lg:col-span-3",
    aspect: "aspect-[16/10]",
    external: true,
  },
  {
    key: "permits",
    eyebrow: "Portland Permits",
    title: "Start with an address.",
    line: "Zoning, likely permits, fees, and timelines for a property, before anyone files an application.",
    href: PERMITS_URL,
    img: { src: "/images/home/permits-b.jpg", alt: "The Portland Permits address search with counts of permit applications, form types, and service categories", position: "object-top" },
    span: "lg:col-span-3",
    aspect: "aspect-[16/10]",
    sso: true,
    external: true,
  },
];

const PROOF = [
  { v: "8", k: "free public tools" },
  { v: "316", k: "parks, every one mapped" },
  { v: "5,275", k: "downtown parcels" },
  { v: "134", k: "documents behind one school budget" },
];

const DOORS = [
  {
    eyebrow: "For residents",
    title: "Use the tools. They're free.",
    body: "No account, no paywall, no charge. Dashboards, deep-dives, two atlases, a guide to Council, and a permits tool, all built from the public record.",
    cta: "Open a tool",
    href: "#work",
  },
  {
    eyebrow: "For owners and institutions",
    title: "Hire the Lab for the decision.",
    body: "Property screening for owners and development teams. Portfolio intelligence for public institutions. Prices published, public work competed.",
    cta: "See the paid work",
    href: "#work-with-us",
    accent: true,
  },
  {
    eyebrow: "For supporters",
    title: "Fund what gets built next.",
    body: "Founding support keeps one named program running for a year, with the supporter credited on the work. Monthly support keeps the archive checkable.",
    cta: "Back a program",
    href: "#support",
  },
];

const PROGRAMS = [
  {
    n: "01",
    title: "The homelessness continuum",
    body: "Where the system breaks, stage by stage, built so front-line workers, hospitals, police, and the county can argue from the same page. A year funds the front-line verification of every \"that door tonight\" string, the evidence review, and a quarterly refresh of every figure.",
    href: "/deep-dives/continuum",
  },
  {
    n: "02",
    title: "The Parks Atlas",
    body: "All 316 parks: conditions, maintenance backlogs, events, and the partners caring for each one. A year funds the record reconciliation, the events and partner data kept current, and the access analysis the atlas still lacks.",
    href: PARKS_URL,
    external: true,
  },
  {
    n: "03",
    title: "The deep-dive calendar",
    body: "Thirteen topics so far, from the PPS budget to the I-5 Rose Quarter. A year funds the next deep-dives on questions supporters and readers propose, each sourced to the page and kept checkable in the archive.",
    href: "/deep-dives",
  },
];


const FINISHED = [
  {
    title: "Every public dollar traceable",
    body: "Every line in the City, County, and school district budgets linked to the page it comes from, and to the decision that moved it.",
  },
  {
    title: "Every bill in Salem, with a name on its next step",
    body: "The person or committee that controls what happens next to every measure, drawn from the chamber rules, kept current through the session.",
  },
  {
    title: "One map the city's owners and bureaus argue from",
    body: "Every downtown parcel modeled, so a building owner, a lender, and a planner start from the same evidence about what a block could become.",
  },
  {
    title: "The continuum adopted on the front line",
    body: "The homelessness system, stage by stage, used by outreach workers, hospitals, police, jails, and the county as the shared page for tonight.",
  },
  {
    title: "The same model in a second Oregon city",
    body: "The tools, the sourcing standard, and the independence rules, rebuilt for the next city that wants its numbers checkable.",
  },
];

const JOIN = [
  {
    eyebrow: "Founding supporter",
    title: "Fund one program for a year.",
    body: "The continuum, the Parks Atlas, or the next deep-dive. Named on the work, never on its conclusions.",
    href: "/contact?topic=Founding%20support",
    cta: "Talk about a program",
  },
  {
    eyebrow: "Partner",
    title: "Build a tool with us, or sponsor a question.",
    body: "Institutions, firms, and foundations that want a piece of the public record made usable, at published prices and under the same rules.",
    href: "/contact?topic=Partnership",
    cta: "Propose a partnership",
  },
  {
    eyebrow: "Back the company",
    title: "Help build the institution itself.",
    body: "If what you want to be part of is the Lab, not only one of its programs, we would rather have that conversation in person than on a page.",
    href: "/contact?topic=Backing%20the%20company",
    cta: "Start the conversation",
    accent: true,
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px w-8 bg-[var(--color-ember)]" />
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${
          light ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function ShowcaseTile({ t }: { t: Tile }) {
  const inner = (
    <>
      <div
        className={`relative overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white ${t.aspect}`}
      >
        <Image
          src={t.img.src}
          alt={t.img.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`object-cover ${t.img.position ?? "object-center"} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
        />
      </div>
      <div className="mt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
          {t.eyebrow}
        </p>
        <h3 className="mt-1.5 font-editorial text-[22px] leading-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-canopy)] sm:text-[24px]">
          {t.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{t.line}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-canopy)]">
          Open{" "}
          {t.external ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
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
  const team = withPhotos();
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      <Header />

      {/* ── Hero: the thesis on the left, the downtown map on the right ── */}
      <section className="relative z-10 overflow-x-clip bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]/85 animate-fade-up">
                <span>Portland Civic Lab</span>
                <div className="h-px w-8 bg-[var(--color-ember)]/60" />
                <span>Free, public, source-linked</span>
              </div>

              <h1 className="mt-6 font-editorial-normal text-[46px] leading-[0.98] tracking-tight text-white animate-fade-up sm:text-[62px] lg:text-[70px] xl:text-[84px]">
                Portland,
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  explained.
                </span>
              </h1>

              <p
                className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/80 animate-fade-up sm:text-[19px]"
                style={{ animationDelay: "100ms" }}
              >
                Free, source-linked tools that show how the city actually works. And the lab that
                property owners and public institutions hire when the next decision needs evidence.
              </p>

              <div
                className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row"
                style={{ animationDelay: "180ms" }}
              >
                <a
                  href="#work"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
                >
                  Explore the tools
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#work-with-us"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.12]"
                >
                  Work with the Lab
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <dl
                className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/12 pt-6 animate-fade-up sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                style={{ animationDelay: "240ms" }}
              >
                {PROOF.map((s) => (
                  <div key={s.k}>
                    <dd className="font-mono text-[26px] font-bold tabular-nums leading-none text-white">
                      {s.v}
                    </dd>
                    <dt className="mt-2 text-[12.5px] leading-snug text-white/60">{s.k}</dt>
                  </div>
                ))}
              </dl>
            </div>

            {/* The map: bleeds past the container edge and hangs below the hero on desktop */}
            <div className="lg:col-span-6 lg:mt-10 lg:w-[115%] xl:w-[120%]">
              <a
                href={DOWNTOWN_URL}
                className="group relative block animate-fade-up"
                style={{ animationDelay: "160ms" }}
                aria-label="Open Portland Possible, the downtown parcel map"
              >
                <div className="relative overflow-hidden rounded-sm ring-1 ring-white/15 shadow-[0_2px_4px_rgba(0,0,0,0.25),0_40px_90px_-20px_rgba(0,0,0,0.6)]">
                  <Image
                    src="/images/home/downtown.jpg"
                    alt="Interactive parcel map of downtown Portland with a selected area panel showing urgency-to-act scores and modeled capacity"
                    width={2648}
                    height={1400}
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  />
                </div>
                <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-2 rounded-sm sm:flex bg-[var(--color-canopy)]/85 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)] ring-1 ring-white/10 backdrop-blur-sm">
                  Portland Possible
                  <span className="text-white/55">· every downtown parcel</span>
                  <ArrowUpRight className="h-3 w-3 text-white/70" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why now ── */}
      <section className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 3xl:max-w-[1800px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <Eyebrow>Why now</Eyebrow>
              <h2 className="font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[34px]">
                Portland changed its form of government, is deciding what its downtown becomes,
                and is choosing what its schools cut, all at once.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-10">
              <p className="text-[16px] leading-relaxed text-[var(--color-ink-light)]">
                Every one of those decisions rests on a public record that almost nobody can
                read. The Lab exists so that the people making them, and the people living with
                them, can argue from the same checkable facts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three doors: who this is for ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 lg:px-12 lg:pt-20 3xl:max-w-[1800px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[var(--color-parchment)]">
          {DOORS.map((d) => (
            <div key={d.eyebrow} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                {d.eyebrow}
              </p>
              <h2 className="mt-3 font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[28px]">
                {d.title}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                {d.body}
              </p>
              <a
                href={d.href}
                className={`mt-5 inline-flex items-center gap-2 text-[14px] font-semibold ${
                  d.accent
                    ? "rounded-sm bg-[var(--color-canopy)] px-4 py-2.5 text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
                    : "text-[var(--color-canopy)] hover:underline"
                }`}
              >
                {d.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── The work: eight tools, each shown ── */}
      <section
        id="work"
        className="mx-auto w-full max-w-[1400px] scroll-mt-20 px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 3xl:max-w-[1800px]"
      >
        <div className="flex flex-col gap-6 border-t border-[var(--color-parchment)] pt-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Eyebrow>The work · eight public tools</Eyebrow>
            <h2 className="font-editorial text-[32px] leading-tight text-[var(--color-ink)] sm:text-[44px]">
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
          <span className="mr-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
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

      {/* ── Work with the Lab: two practices, prices in public ── */}
      <section id="work-with-us" className="scroll-mt-20 bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <Eyebrow light>Work with the Lab · published prices</Eyebrow>
              <h2 className="font-editorial text-[32px] leading-tight text-white sm:text-[44px]">
                Two kinds of paid work. Both priced in public.
              </h2>
            </div>
            <p className="max-w-md text-[14.5px] leading-relaxed text-white/65 md:text-right">
              Floors and bands, not quotes. The number is in writing before any work starts, and
              this page is what every client sees.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Property */}
            <Link
              href="/property"
              className="group relative flex flex-col overflow-hidden rounded-sm border border-white/12 bg-white/[0.04] p-7 transition-colors hover:border-[var(--color-ember)]/50 hover:bg-white/[0.06] sm:p-9"
            >
              <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-ember)]" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember-bright)]">
                Property owners and developers
              </p>
              <h3 className="mt-3 max-w-md font-editorial text-[28px] leading-tight text-white sm:text-[32px]">
                Which building deserves the next dollar of diligence?
              </h3>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">
                We screen a property or a portfolio against the public record: parcel, zoning,
                historic status, development capacity, permit history, and the programs that apply.
                You get an evidence packet that names what is known, what is missing, and the next
                three moves, every claim cited. It is the step before you pay an architect or an
                engineer to look. The public version is the downtown map and the Lloyd Center
                deep-dive.
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/12 pt-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                    One property
                  </p>
                  <p className="mt-1 font-mono text-[26px] font-bold tabular-nums leading-none text-white">
                    From $7,500
                  </p>
                  <p className="mt-2 text-[13px] text-white/55">
                    Scoped to the decision · portfolios of about ten from $20,000 · maintained
                    record from $2,500 a month
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-ember)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-canopy)] transition-colors group-hover:bg-[var(--color-ember-bright)]">
                  For property owners
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Institutions */}
            <Link
              href="/institutions"
              className="group relative flex flex-col overflow-hidden rounded-sm border border-white/12 bg-white/[0.04] p-7 transition-colors hover:border-[var(--color-sage)]/60 hover:bg-white/[0.06] sm:p-9"
            >
              <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-sage)]" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-sage)]">
                Public institutions
              </p>
              <h3 className="mt-3 max-w-md font-editorial text-[28px] leading-tight text-white sm:text-[32px]">
                The decisions cross bureau lines. The information doesn&apos;t.
              </h3>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">
                Portfolio intelligence, decision diagnostics, civic data products, and independent
                evaluation for agencies and institutions. Delivered as a service your staff can use
                next month, and won through normal procurement, never sole-sourced.
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/12 pt-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                    Diagnostic
                  </p>
                  <p className="mt-1 font-mono text-[26px] font-bold tabular-nums leading-none text-white">
                    $15,000<span className="text-white/45">–</span>$25,000
                  </p>
                  <p className="mt-2 text-[13px] text-white/55">
                    Pilots $40,000–$90,000 · ongoing service $100,000–$180,000 a year
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-white/[0.12]">
                  For public institutions
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>

          <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-white/70">
            Nonprofits, foundations, and consulting teams hire the Lab for the same kinds of work:
            sponsored research, data products, dashboards, and software. Same published bands,
            same rules, and the sponsor named on the work.
          </p>

          <div className="mt-6 flex flex-col gap-4 rounded-sm border border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-white/75">
              {[
                "We compete for public work",
                "One side per matter",
                "Every contract listed in public",
                "Paid work never buys a conclusion",
              ].map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--color-ember)]" />
                  {r}
                </li>
              ))}
            </ul>
            <Link
              href="/independence"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-white hover:underline"
            >
              The rules, in full
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── The public program: what support funds ── */}
      <section id="support" className="scroll-mt-20 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Eyebrow>The public program</Eyebrow>
              <h2 className="font-editorial text-[32px] leading-tight text-[var(--color-ink)] sm:text-[44px]">
                The tools stay free. Support decides what gets built next.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
                Everything the Lab publishes is free to every resident. Supporters fund the
                maintenance and the next build. Founding support keeps one named program running
                for a year, with the supporter credited on the work itself, and never on its
                conclusions.
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                Portland Civic Lab is a for-profit company, not a nonprofit, by choice. A nonprofit
                lives from grant to grant. A company that sells its expertise can keep the free
                tools running on its own earnings, so no foundation&apos;s calendar decides whether
                the archive stays up. The trade-off is that support is not tax-deductible, and we
                say so everywhere we ask.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/contact?topic=Founding%20support"
                  className="group rounded-sm border border-[var(--color-canopy)] bg-[var(--color-canopy)] p-5 text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">
                    Founding support
                  </p>
                  <p className="mt-2 font-mono text-[20px] font-bold tabular-nums leading-none">
                    $10,000–$25,000
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-white/70">
                    a year, funds one program and names you on it
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold">
                    Get in touch
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
                <Link
                  href="/donate"
                  className="group rounded-sm border border-[var(--color-parchment)] bg-white p-5 transition-colors hover:border-[var(--color-sage)]"
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                    Monthly support
                  </p>
                  <p className="mt-2 font-mono text-[20px] font-bold tabular-nums leading-none text-[var(--color-ink)]">
                    From $10
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-[var(--color-ink-light)]">
                    a month, keeps the archive checkable and the dashboards current
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-canopy)]">
                    Support the work
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                Programs a founding supporter can fund
              </p>
              <ul className="mt-4 divide-y divide-[var(--color-parchment)] border-y border-[var(--color-parchment)]">
                {PROGRAMS.map((p) => {
                  const inner = (
                    <>
                      <span className="w-8 shrink-0 font-mono text-[12px] font-bold text-[var(--color-ember)]">
                        {p.n}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 font-editorial text-[24px] leading-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-canopy)]">
                          {p.title}
                          {p.external ? (
                            <ArrowUpRight className="h-4 w-4 text-[var(--color-ink-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-[var(--color-ink-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </span>
                        <span className="mt-2 block max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                          {p.body}
                        </span>
                      </span>
                    </>
                  );
                  const cls = "group flex items-start gap-4 py-6";
                  return (
                    <li key={p.n}>
                      {p.external ? (
                        <a href={p.href} className={cls}>{inner}</a>
                      ) : (
                        <Link href={p.href} className={cls}>{inner}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                Every founding supporter is named on the program page, receives a quarterly
                two-page update, and sees an annual public account of what the money produced.
                Nobody gets a say over conclusions, by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About: the idea in brief, the founder, a door to the full page ── */}
      <section id="about" className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <Eyebrow>About the Lab</Eyebrow>
            <h2 className="max-w-3xl font-editorial text-[32px] leading-tight text-[var(--color-ink)] sm:text-[44px]">
              A new kind of civic institution, built in Oregon, in public.
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
              A founder-owned company that gives its civic tools away, funds them with paid decision
              work at published prices, and publishes the rules that keep the two apart. There is no
              institution in Oregon whose job this is. We are building it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
              >
                The people building it
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/independence"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-sage)]"
              >
                Independence and funding
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <Link
            href="/about"
            className="group block rounded-sm border border-[var(--color-parchment)] bg-white p-5 transition-colors hover:border-[var(--color-sage)] lg:col-span-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              A studio, not a firm
            </p>
            <ul className="mt-3 space-y-2.5">
              {team.map((p) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-[var(--color-canopy)]">
                    {p.hasPhoto && p.photo ? (
                      <Image src={p.photo} alt={p.name} fill sizes="36px" className="object-cover object-top" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-editorial text-[13px] text-[var(--color-ember-bright)]">
                        {p.initials}
                      </span>
                    )}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold leading-tight text-[var(--color-ink)]">{p.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">{p.title}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
              A small core, plus the specialists, partners, and advisors each engagement needs, named
              in the work.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-canopy)]">
              How the Lab is built
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        </div>
      </section>

      {/* ── Where this goes, and who builds it ── */}
      <section id="join" className="scroll-mt-20 bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Eyebrow light>Where this goes</Eyebrow>
              <h2 className="font-editorial text-[32px] leading-tight text-white sm:text-[44px]">
                What a finished Portland Civic Lab looks like.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
                Eight tools exist today. These are the five things the Lab is being built to
                finish, in the order the public record lets us reach them.
              </p>
              <ol className="mt-8 divide-y divide-white/10 border-y border-white/10">
                {FINISHED.map((f, i) => (
                  <li key={f.title} className="flex items-start gap-4 py-5">
                    <span className="w-8 shrink-0 font-mono text-[12px] font-bold text-[var(--color-ember-bright)]">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-editorial text-[21px] leading-tight text-white">{f.title}</h3>
                      <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-white/65">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-6">
              <Eyebrow light>Join the people building it</Eyebrow>
              <h2 className="font-editorial text-[32px] leading-tight text-white sm:text-[44px]">
                Three ways in.
              </h2>
              <div className="mt-8 flex flex-col gap-4">
                {JOIN.map((j) => (
                  <Link
                    key={j.eyebrow}
                    href={j.href}
                    className={`group relative overflow-hidden rounded-sm border p-6 transition-colors sm:p-7 ${
                      j.accent
                        ? "border-[var(--color-ember)]/60 bg-[var(--color-ember)]/10 hover:bg-[var(--color-ember)]/15"
                        : "border-white/12 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                  >
                    {j.accent && <div className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-ember)]" />}
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember-bright)]">
                      {j.eyebrow}
                    </p>
                    <h3 className="mt-2 font-editorial text-[24px] leading-tight text-white">{j.title}</h3>
                    <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-white/70">{j.body}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">
                      {j.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-[13px] leading-relaxed text-white/50">
                Support is not tax-deductible, and every sponsored program and contract is listed
                on the Independence page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
