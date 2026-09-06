import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SsoLink from "@/components/SsoLink";
import { withPhotos } from "@/lib/team";
import AudienceDoors, { type Door } from "@/components/home/AudienceDoors";
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

const DOORS: Door[] = [
  {
    key: "residents",
    pill: "I live here",
    eyebrow: "For residents",
    title: "Use the tools. They're free.",
    body: "There is no account to make and nothing to pay. Eight tools, all built from public records, and every number links back to the document it came from.",
    cta: { label: "Explore the tools", href: "#work" },
    secondary: { label: "Read a deep-dive", href: "/deep-dives" },
    img: { src: "/images/home/parks-b.jpg", alt: "The Parks Atlas map of Portland", caption: "Parks Atlas · 316 parks" },
  },
  {
    key: "owners",
    pill: "I own or develop property",
    eyebrow: "For owners and developers",
    title: "Find out which building is worth a closer look.",
    body: "We check a property, or a whole portfolio, against the public record and tell you what is known, what isn't, and what to do next. It starts at $7,500 and takes about three weeks.",
    cta: { label: "For property owners", href: "/property" },
    secondary: { label: "See the downtown map", href: DOWNTOWN_URL, external: true },
    img: { src: "/images/home/downtown.jpg", alt: "The downtown parcel map", position: "object-center", caption: "Portland Possible · 5,275 parcels" },
  },
  {
    key: "institutions",
    pill: "I run a public institution",
    eyebrow: "For public institutions",
    title: "The decisions cross bureau lines. The information doesn't.",
    body: "We keep one reliable record of what a bureau owns, has promised, and owes, and we run the monthly review from it, so your staff never have to feed a second system. We compete for the work through normal procurement. A diagnostic starts at $15,000.",
    cta: { label: "For public institutions", href: "/institutions" },
    secondary: { label: "How we contract", href: "/independence" },
    img: { src: "/images/home/dashboards-b.jpg", alt: "A performance dashboard", position: "object-left-top", caption: "Dashboards · every source linked" },
  },
  {
    key: "supporters",
    pill: "I want to back this",
    eyebrow: "For supporters",
    title: "Fund what gets built next.",
    body: "A founding supporter pays for one program for a year and is named on it. Monthly supporters keep the tools running and the archive online.",
    cta: { label: "Back a program", href: "/donate" },
    secondary: { label: "Talk about founding support", href: "/contact?topic=Founding%20support" },
    img: { src: "/images/home/continuum.jpg", alt: "The homelessness continuum, stage by stage", caption: "The continuum · every figure sourced" },
  },
  {
    key: "builders",
    pill: "I want to help build it",
    eyebrow: "For builders and volunteers",
    title: "Pick something and help build it.",
    body: "Every tool and every open question on the site could use another pair of hands. Tell us what you are good at and how much time you have, and we will come back with something specific.",
    cta: { label: "Pick a topic", href: "/about#topics" },
    secondary: { label: "How the Lab is built", href: "/about" },
    img: { src: "/images/home/oregon.jpg", alt: "The Oregon Governance Atlas", caption: "Oregon Atlas · every bill's next step" },
  },
];

const COMMISSION = "/contact?topic=Commission%20research%20or%20a%20build";

const CAPABILITIES = [
  {
    key: "research",
    accent: "bg-[var(--color-ember)]",
    eyebrow: "Research",
    title: "Get a question answered from the record.",
    examples: [
      "A deep-dive on a topic you name, every figure sourced to the page",
      "An evidence review before a board, council, or investment vote",
      "An independent evaluation of whether a program worked",
    ],
    price: "From $5,000 for an evidence review · from $15,000 for a six-week deep-dive",
    cta: { label: "Commission research", href: COMMISSION },
    links: [{ label: "The public version: thirteen deep-dives", href: "/deep-dives" }],
  },
  {
    key: "decisions",
    accent: "bg-[var(--color-sage)]",
    eyebrow: "Decisions",
    title: "Due diligence for a decision you are about to make.",
    examples: [
      "Which building or portfolio deserves the next dollar of diligence",
      "Technical diligence on a project, a vendor, a model, or a plan",
      "One kept record of what a bureau owns, promised, and owes",
    ],
    price: "From $7,500 for a property · from $15,000 for a diagnostic · pilots $40,000–$90,000",
    cta: { label: "Bring us the decision", href: COMMISSION },
    links: [
      { label: "Owners and developers", href: "/property" },
      { label: "Public institutions", href: "/institutions" },
    ],
  },
  {
    key: "builds",
    accent: "bg-[var(--color-river)]",
    eyebrow: "Builds",
    title: "Have us build the tool, the dataset, or the model.",
    examples: [
      "An atlas or dashboard for your subject, built the same way as ours",
      "A working model of a system: a budget, a pipeline, a continuum",
      "A public tool, sponsored by a foundation and free to everyone",
    ],
    price: "Scoped from the days · maintained from $2,500 a month",
    cta: { label: "Scope a build", href: COMMISSION },
    links: [{ label: "The public version: eight tools", href: "#work" }],
  },
];

const PROGRAMS = [
  {
    n: "01",
    title: "The homelessness continuum",
    body: "A map of where the homelessness system breaks down, stage by stage, written so that outreach workers, hospitals, police, and the county are looking at the same page. A year of support pays for checking the details about which doors are open tonight with the people at those doors, reviewing the evidence, and refreshing the figures every quarter.",
    href: "/deep-dives/continuum",
  },
  {
    n: "02",
    title: "The Parks Atlas",
    body: "All 316 parks, with their condition, maintenance backlog, events, and the groups that look after them. A year of support pays for reconciling the records, keeping the events and partner data current, and adding the access analysis the atlas is still missing.",
    href: PARKS_URL,
    external: true,
  },
  {
    n: "03",
    title: "The deep-dive calendar",
    body: "Thirteen so far, from the school budget to the I-5 Rose Quarter. A year of support pays for the next ones, on questions readers and supporters propose.",
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
    title: "One downtown map that owners and the City both use",
    body: "Every downtown parcel modeled, so a building owner, a lender, and a city planner are looking at the same information about what a block could become.",
  },
  {
    title: "The continuum in use on the front line",
    body: "The homelessness system, stage by stage, used by outreach workers, hospitals, police, jails, and the county as the shared page for tonight.",
  },
  {
    title: "A second Oregon city",
    body: "The same tools, sourcing standard, and rules, rebuilt for the next city that wants them.",
  },
];

const JOIN = [
  {
    eyebrow: "Founding supporter",
    title: "Fund one program for a year.",
    body: "The continuum, the Parks Atlas, or the next deep-dive. Your name goes on the work.",
    href: "/contact?topic=Founding%20support",
    cta: "Talk about a program",
  },
  {
    eyebrow: "Partner",
    title: "Build a tool with us, or sponsor a question.",
    body: "For institutions, firms, and foundations that want part of the public record made usable. Published prices, and the same rules as everyone else.",
    href: "/contact?topic=Partnership",
    cta: "Propose a partnership",
  },
  {
    eyebrow: "Back the company",
    title: "Help build the institution itself.",
    body: "If you are interested in the Lab itself and not just one of its programs, let's talk in person.",
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
                Every decision Portland makes should start from facts anyone can check. We&apos;re
                building the institution that makes that possible: we open up the public record,
                source it, and turn it into tools anyone can use for free. Philanthropy and paid
                work cover the cost, and all of it goes toward a better Portland.
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
                Portland changed its form of government last year. At the same time it is
                deciding what to do with a half-empty downtown and how much to cut from its
                schools.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-10">
              <p className="text-[16px] leading-relaxed text-[var(--color-ink-light)]">
                All of that gets decided on a public record that most people never manage to
                read. We want the people making those decisions, and the people who have to live
                with them, to be looking at the same facts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pick your door ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 lg:px-12 lg:pt-20 3xl:max-w-[1800px]">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Start here</Eyebrow>
            <h2 className="font-editorial text-[32px] leading-tight text-[var(--color-ink)] sm:text-[44px]">
              Start here.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-light)] md:text-right">
            Tell us who you are and we&apos;ll show you the part that&apos;s for you.
          </p>
        </div>
        <AudienceDoors doors={DOORS} />
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
              Eight tools, all free, all built from public records.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-light)] md:text-right">
            Open any of them. There is nothing to sign up for.
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

      {/* ── Work with the Lab: research, decisions, builds ── */}
      <section id="work-with-us" className="scroll-mt-20 bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 3xl:max-w-[1800px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <Eyebrow light>Work with the Lab · published prices</Eyebrow>
              <h2 className="font-editorial text-[32px] leading-tight text-white sm:text-[44px]">
                Bring us a question, a decision, or a build.
              </h2>
            </div>
            <p className="max-w-md text-[14.5px] leading-relaxed text-white/65 md:text-right">
              The prices below are starting points. If it can be answered from the public record,
              or built from it, we can probably do it, and you get the number in writing before
              anything starts.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div
                key={c.key}
                className="relative flex flex-col overflow-hidden rounded-sm border border-white/12 bg-white/[0.04] p-7 sm:p-8"
              >
                <div className={`absolute left-0 right-0 top-0 h-[3px] ${c.accent}`} />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember-bright)]">
                  {c.eyebrow}
                </p>
                <h3 className="mt-3 font-editorial text-[26px] leading-tight text-white sm:text-[28px]">{c.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {c.examples.map((e) => (
                    <li key={e} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/75">
                      <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ember)]" />
                      {e}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex-1" />
                <p className="min-h-[4.25rem] border-t border-white/12 pt-5 font-mono text-[12.5px] leading-relaxed text-white/60">
                  {c.price}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Link
                    href={c.cta.href}
                    className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-ember)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
                  >
                    {c.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {c.links.map((l) =>
                    l.href.startsWith("#") ? (
                      <a key={l.label} href={l.href} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-white hover:underline">
                        {l.label} <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link key={l.label} href={l.href} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-white hover:underline">
                        {l.label} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-white/70">
            Property owners, public agencies, nonprofits, foundations, consulting teams, and
            individuals can all hire us. The prices and the rules are the same for everyone, and if
            you sponsor a piece of research, your name goes on it.
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
                The tools stay free. Supporters decide what we build next.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
                Everything we publish is free. Supporters pay for the upkeep and for whatever comes
                next. A founding supporter funds one program for a year and is credited on that
                program&apos;s work. Supporters don&apos;t get a say in what the work concludes.
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                We set the Lab up as a company rather than a nonprofit because a nonprofit lives
                from grant to grant, and we wanted the free tools to survive on our own earnings.
                The downside is that support isn&apos;t tax-deductible, which we mention everywhere
                we ask for it.
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
                    a month, keeps the dashboards current and the archive online
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
                Founding supporters are named on the program page, get a short update each
                quarter, and see a public accounting once a year of what the money went to. They
                don&apos;t get a say over what the work concludes.
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
              A different kind of civic institution.
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
              Portland Civic Lab is a small company that gives its civic tools away, pays for them
              with research and analysis work at published prices, and publishes the rules that keep
              the two from mixing. Nobody in Oregon has this job, so we took it.
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
              How we&apos;re set up
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
              Two people at the center, plus whichever specialists, partners, and advisors a given
              project needs, all named in the work.
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
                Where this is going.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
                Eight tools are live. This is what we are working toward next, roughly in order.
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
                How to get involved.
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
