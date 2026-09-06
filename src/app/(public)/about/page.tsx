import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BadgeCheck, Handshake, HeartHandshake, Lightbulb, Users } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { withPhotos } from "@/lib/team";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "About the Lab",
  description:
    "Portland Civic Lab is a new kind of civic institution, built in Oregon, in public: free, source-linked tools funded by paid decision work at published prices. The people building it, the rules they work under, and how to join them.",
  path: "/about",
});

const PRINCIPLES = [
  {
    title: "Every number has a source",
    body: "Each figure traces to a public document, page cited. Numbers that exist only in press reporting are labeled that way. Where the record is silent, the page says so instead of guessing.",
  },
  {
    title: "Anyone can hire us. Nobody buys a conclusion.",
    body: "Governments, businesses, nonprofits, and individual supporters all pay for the Lab's work, and some of them appear in it. What keeps that honest is the rules: every contract published within a week of signature, one side per matter, public work won through open procurement, and sponsors named on the question, never the answer.",
  },
  {
    title: "Built to be used, not just read",
    body: "Calculators for your own tax bill, watch-lists with dates, records requests drafted and ready, and plans specific enough to vote on. The goal is a resident who can act.",
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
  size = "md",
}: {
  initials: string;
  photo?: string;
  hasPhoto: boolean;
  name: string;
  size?: "md" | "lg";
}) {
  const box = "aspect-square";
  const text = size === "lg" ? "text-[96px] sm:text-[128px]" : "text-[40px]";
  return (
    <div className={`relative w-full overflow-hidden rounded-sm bg-[var(--color-canopy)] ${box}`}>
      {hasPhoto && photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes={size === "lg" ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
          className="object-cover object-top"
          priority={size === "lg"}
        />
      ) : (
        <div className="noise-overlay flex h-full w-full items-center justify-center">
          <span className={`relative z-10 font-editorial ${text} leading-none text-[var(--color-ember-bright)]`}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const people = withPhotos();
  const founder = people[0];

  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── The idea, with the founder ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-20 3xl:max-w-[1800px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                About the Lab
              </span>
            </div>
            <h1 className="max-w-3xl font-editorial-normal text-[40px] leading-[1.03] text-[var(--color-ink)] sm:text-[56px] lg:text-[64px]">
              A new kind of civic institution, built in Oregon, in public.
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
              Portland runs on budgets, audits, permit records, and legislative files that are
              public in theory and unreadable in practice. The Lab reads them, checks every figure
              against its source, and turns them into tools a resident, a reporter, a building
              owner, or a bureau director can use in an afternoon. There is no institution in
              Oregon whose job that is. We are building it, one tool at a time, with the work in
              the open from the first day.
            </p>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
              The model is as new as the work. Portland Civic Lab is a for-profit company, not a
              nonprofit, by choice: a company that sells its expertise can keep the free tools
              running on its own earnings, so no foundation&apos;s calendar decides whether the
              archive stays up. The paid work funds the public program. The public program is
              what makes the paid work worth trusting. Neither side has to apologize for the
              other.
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

          <div className="lg:col-span-5 lg:pt-6">
            <div className="max-w-[400px] lg:ml-auto">
            <Avatar
              initials={founder.initials}
              photo={founder.photo}
              hasPhoto={founder.hasPhoto}
              name={founder.name}
              size="lg"
            />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4 lg:ml-auto lg:max-w-[400px]">
              <div>
                <p className="font-editorial text-[24px] leading-tight text-[var(--color-ink)]">{founder.name}</p>
                <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
                  {founder.title}
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-[400px] text-[14.5px] leading-relaxed text-[var(--color-ink-light)] lg:ml-auto">
              {founder.line} Where the founder is not neutral is written down on the Independence
              page.
            </p>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 3xl:max-w-[1800px]">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--color-ember)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              How the work is done
            </span>
          </div>
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

      {/* ── The people ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-ember)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                The people
              </span>
            </div>
            <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
              Everyone who builds the Lab is listed here.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-light)] md:text-right">
            Staff, partners, advisors, volunteers, and the supporters who fund the public program.{" "}
            {people.length === 1 ? "One name" : `${people.length} names`} today. The rest of this
            page is how the list grows.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {people.map((p) => (
            <div key={p.name}>
              <Avatar initials={p.initials} photo={p.photo} hasPhoto={p.hasPhoto} name={p.name} />
              <p className="mt-4 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">{p.name}</p>
              <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
                {p.title}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{p.line}</p>
            </div>
          ))}
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
            {ROLES.map((r) => {
              const inner = (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-[var(--color-ember-bright)]">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-editorial text-[24px] leading-tight text-white">{r.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">{r.body}</p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">
                    {r.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </>
              );
              const cls =
                "group flex flex-col rounded-sm border border-white/12 bg-white/[0.04] p-6 transition-colors hover:border-[var(--color-ember)]/50 hover:bg-white/[0.07]";
              return (
                <Link key={r.title} href={r.href} className={cls}>
                  {inner}
                </Link>
              );
            })}
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
