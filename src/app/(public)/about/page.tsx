import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  HeartHandshake,
  Landmark,
  Lightbulb,
  Users,
  Wrench,
} from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { withPhotos } from "@/lib/team";
import { QUESTIONS, TOOLS, workOnHref, type Topic } from "@/lib/topics";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "About the Lab",
  description:
    "How Portland Civic Lab is built: a small studio core, three lines of work, and the specialists, partners, advisors, supporters, and volunteers each engagement pulls in. The rules for every one of those relationships, every topic you can work on, and how to join.",
  path: "/about",
});

const LINES = [
  { title: "Public program", body: "Free tools and deep-dives, every figure sourced." },
  { title: "Property practice", body: "Screening and decision packets for owners and developers." },
  { title: "Institutional practice", body: "Portfolio intelligence for public bodies, competed." },
];

const PLUG_INS = ["Specialists", "Partners", "Advisors", "Supporters", "Volunteers"];

const RELATIONSHIPS = [
  {
    icon: Wrench,
    title: "Specialists, by engagement",
    body: "Engineers, architects, actuaries, researchers, and lawyers are brought in for the engagement that needs them, scoped and priced separately, and named in the deliverable. The Lab keeps no bench it has to feed.",
    rule: "Named in the work. Never implied by the platform.",
  },
  {
    icon: Handshake,
    title: "Partners and primes",
    body: "Design, strategy, and consulting firms that bring a client, or that the Lab brings into one. One lead contract, written responsibilities. Whoever brings the client holds the relationship; the Lab keeps the record and the sourcing standard.",
    rule: "One side per matter, always.",
  },
  {
    icon: Landmark,
    title: "Public bodies",
    body: "Small one-time engagements go through an agency's normal small-procurement process. Anything ongoing, or above the informal threshold, is won through a process someone else could win.",
    rule: "Spec-writer or bidder. Never both.",
  },
  {
    icon: HeartHandshake,
    title: "Supporters and sponsors",
    body: "Individuals and foundations fund named programs for a year. They are credited on the program page and the work it produces, get a quarterly update and an annual public account, and have no say over conclusions.",
    rule: "Sponsors fund the question, never the answer.",
  },
];

const PRINCIPLES = [
  {
    title: "Every number has a source",
    body: "Each figure traces to a public document, page cited. Where the record is silent, the page says so instead of guessing.",
  },
  {
    title: "Anyone can hire us. Nobody buys a conclusion.",
    body: "Every contract is published within a week of signature, public work is won through open procurement, and paid work never changes a finding.",
  },
  {
    title: "Built to be used, not just read",
    body: "Calculators, watch-lists with dates, records requests drafted and ready, and plans specific enough to vote on.",
  },
];

const ROLES = [
  {
    icon: Lightbulb,
    title: "Advisors",
    body: "People who know procurement, public finance, housing, health systems, or research methods, and will tell us when we are wrong. A few hours a quarter, in writing, credited here.",
    cta: "Offer to advise",
    href: "/contact?topic=Advising%20the%20Lab",
  },
  {
    icon: Handshake,
    title: "Partners",
    body: "Institutions, firms, nonprofits, and municipal teams that build a tool with us, sponsor a question, or hire the Lab at published prices. Listed here and on the Independence page the week the engagement signs.",
    cta: "Propose a partnership",
    href: "/contact?topic=Partnership",
  },
  {
    icon: HeartHandshake,
    title: "Founding supporters",
    body: "People and foundations that fund one named program for a year. Credited on the program page and the work it produces, never on its conclusions.",
    cta: "Talk about founding support",
    href: "/contact?topic=Founding%20support",
  },
  {
    icon: Users,
    title: "Volunteers and contributors",
    body: "Researchers, engineers, designers, and residents who check a figure, file a records request, or build a piece of a tool. Credited on the work they touched.",
    cta: "Volunteer",
    href: "/volunteer",
  },
];

const REGISTER = [
  { label: "Founding supporters", note: "Name, program funded, amount, and period." },
  { label: "Partners", note: "Organization, scope, and dates, the same as the contract register." },
  { label: "Advisors", note: "Name, what they advise on, and since when." },
];

function Avatar({
  initials,
  photo,
  hasPhoto,
  name,
}: {
  initials: string;
  photo?: string;
  hasPhoto: boolean;
  name: string;
}) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[var(--color-canopy)]">
      {hasPhoto && photo ? (
        <Image src={photo} alt={name} fill sizes="56px" className="object-cover object-top" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-editorial text-[18px] leading-none text-[var(--color-ember-bright)]">{initials}</span>
        </div>
      )}
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-5 w-px bg-[var(--color-sage)]" aria-hidden />;
}

function StudioDiagram({ names }: { names: { name: string; title: string }[] }) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
        How the Lab is built
      </p>

      <div className="mt-4 rounded-sm bg-[var(--color-canopy)] p-4 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
          The studio · a small core
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {names.map((n) => (
            <li key={n.name} className="text-[14px]">
              <span className="font-semibold text-white">{n.name}</span>
              <span className="text-white/60"> · {n.title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] leading-snug text-white/65">
          Originates the work, sets the sourcing standard, keeps the archive and the rules.
        </p>
      </div>

      <Connector />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LINES.map((l) => (
          <div key={l.title} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-3">
            <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">{l.title}</p>
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{l.body}</p>
          </div>
        ))}
      </div>

      <Connector />

      <div className="rounded-sm border border-dashed border-[var(--color-sage)] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Pulled in per engagement, named in the work
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {PLUG_INS.map((p) => (
            <li
              key={p}
              className="rounded-full border border-[var(--color-parchment)] bg-white px-3 py-1 text-[12.5px] font-medium text-[var(--color-ink)]"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
        Every engagement assembles the people it needs, with roles written down before work
        starts. Every contract, sponsor, and partner is listed on the Independence page.
      </p>
    </div>
  );
}

function TopicRow({ t }: { t: Topic }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border border-[var(--color-parchment)] bg-white px-4 py-3">
      <span className="min-w-[9rem] flex-1 text-[14px] font-medium leading-snug text-[var(--color-ink)]">{t.name}</span>
      <span className="ml-auto flex shrink-0 items-center gap-3">
        {t.external ? (
          <a
            href={t.href}
            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Open <ArrowUpRight className="h-3 w-3" />
          </a>
        ) : (
          <Link
            href={t.href}
            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        <Link
          href={workOnHref(t.name)}
          className="inline-flex items-center gap-1 rounded-sm bg-[var(--color-canopy)] px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
        >
          Work on this
        </Link>
      </span>
    </li>
  );
}

export default function AboutPage() {
  const people = withPhotos();

  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── The idea, and how the Lab is built ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-20 3xl:max-w-[1800px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                About the Lab
              </span>
            </div>
            <h1 className="max-w-3xl font-editorial-normal text-[40px] leading-[1.03] text-[var(--color-ink)] sm:text-[56px] lg:text-[60px]">
              A studio, not a firm.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
              Portland runs on budgets, audits, permit records, and legislative files that are
              public in theory and unreadable in practice. The Lab reads them, checks every figure
              against its source, and turns them into tools a resident, a reporter, a building
              owner, or a bureau director can use in an afternoon. There is no institution in
              Oregon whose job that is. We are building it, in public.
            </p>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
              It is built as a studio on purpose. A small core originates the work, sets the
              standard, and keeps the archive. Each engagement assembles the specialists,
              partners, and advisors it needs, with roles written down and names in the
              deliverable. The paid work funds the public program. The public program is what
              makes the paid work worth trusting.
            </p>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
              Portland Civic Lab is a for-profit company, not a nonprofit, by choice: a company that
              sells its expertise can keep the free tools running on its own earnings, so no
              foundation&apos;s calendar decides whether the archive stays up. The trade-off is
              that support is not tax-deductible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/independence"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
              >
                Independence and funding
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-sage)]"
              >
                How we source the data
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pt-8">
            <StudioDiagram names={people.map((p) => ({ name: p.name, title: p.title }))} />
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 3xl:max-w-[1800px]">
          <ol className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="border-t-2 border-[var(--color-canopy)] pt-4">
                <span className="font-mono text-[12px] font-bold text-[var(--color-ember)]">0{i + 1}</span>
                <h2 className="mt-2 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">{p.title}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── How we work with others ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--color-ember)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              How we work with others
            </span>
          </div>
          <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
            Four kinds of relationship. One rule for each.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {RELATIONSHIPS.map((r) => (
            <div key={r.title} className="flex flex-col rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">{r.title}</h3>
              <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{r.body}</p>
              <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ember)]">
                {r.rule}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The people ── */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--color-ember)]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                  The people
                </span>
              </div>
              <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
                The people who build the Lab.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                Staff, partners, advisors, volunteers, and the supporters who fund the public
                program.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
              {people.map((p) => (
                <li key={p.name} className="flex items-center gap-4 rounded-sm border border-[var(--color-parchment)] bg-white p-4">
                  <Avatar initials={p.initials} photo={p.photo} hasPhoto={p.hasPhoto} name={p.name} />
                  <div>
                    <p className="font-editorial text-[20px] leading-tight text-[var(--color-ink)]">{p.name}</p>
                    <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
                      {p.title}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Pick a topic ── */}
      <section id="topics" className="mx-auto w-full max-w-[1400px] scroll-mt-20 px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                Pick a topic
              </span>
            </div>
            <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
              Want to work on something specific? Point at it.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-light)] md:text-right">
            Every tool and every open question is something a person can pick up. Tell us what you
            can do and how much time you have, and we reply with a specific piece of work.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Tools that need hands
            </p>
            <ul className="mt-3 space-y-2">
              {TOOLS.map((t) => (
                <TopicRow key={t.name} t={t} />
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
              Questions in progress
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {QUESTIONS.map((t) => (
                <TopicRow key={t.name} t={t} />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--color-parchment)] pt-5 text-[14px] text-[var(--color-ink-light)]">
          <span>Not here yet?</span>
          <Link href="/proposals" className="inline-flex items-center gap-1 font-semibold text-[var(--color-canopy)] hover:underline">
            Propose a topic <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/volunteer" className="inline-flex items-center gap-1 font-semibold text-[var(--color-canopy)] hover:underline">
            Volunteer without a topic in mind <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Who else belongs here ── */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember-bright)]">
                Join the people building it
              </span>
            </div>
            <h2 className="font-editorial text-[30px] leading-tight text-white sm:text-[40px]">
              Four ways onto this page.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/70">
              Names appear here the week they sign, and on the Independence page. Nobody is listed
              for a conversation, an intention, or a logo on a slide.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <Link
                key={r.title}
                href={r.href}
                className="group flex flex-col rounded-sm border border-white/12 bg-white/[0.04] p-6 transition-colors hover:border-[var(--color-ember)]/50 hover:bg-white/[0.07]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-[var(--color-ember-bright)]">
                  <r.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-editorial text-[24px] leading-tight text-white">{r.title}</h3>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-white/70">{r.body}</p>
                <p className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">
                  {r.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The register ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                Supporters, partners, and advisors
              </span>
            </div>
            <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
              Empty on purpose.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
              This list holds only people and organizations that have actually signed. When
              Oregon&apos;s foundations, firms, and municipal teams join, you will see them here
              first, with what they funded or built, and on the contract register the same week.
              An empty list you can trust is worth more than a full one you can&apos;t.
            </p>
            <Link
              href="/independence"
              className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              The contract register
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-7">
            {REGISTER.map((r) => (
              <div key={r.label} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                  {r.label}
                </p>
                <p className="mt-2 font-editorial text-[26px] text-[var(--color-ink)]">None yet.</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-light)]">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-[13px] text-[var(--color-ink-muted)]">Current as of September 2026.</p>
      </section>
    </div>
  );
}
