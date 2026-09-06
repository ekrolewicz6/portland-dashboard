import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ClipboardList,
  FileSearch,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { DOWNTOWN_URL, PERMITS_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "For Property Owners and Developers",
  description:
    "Portland Civic Lab screens a property or a portfolio against the public record and hands back an evidence packet: what is known, what is missing, and the next three moves. Published prices, one side per matter.",
  path: "/property",
});

const DELIVERABLES = [
  {
    icon: Layers,
    title: "The public record, assembled",
    body: "Parcel and ownership history, zoning and overlays, historic status, development capacity, permit history, assessment, and the incentive programs that apply to this address. One packet, every claim cited to the document it came from.",
  },
  {
    icon: FileSearch,
    title: "An uncertainty register",
    body: "Every material claim graded by what supports it. The questions only a specialist can answer are named, along with which specialist, so the next dollar of diligence goes where it changes the decision.",
  },
  {
    icon: ClipboardList,
    title: "The decision, framed",
    body: "The uses that are plausible, the constraints that bind, the approvals in sequence, and the next three moves with dates. Written for the owner, the lender, and the design team to read the same way.",
  },
  {
    icon: Building2,
    title: "A maintained record, if the decision keeps moving",
    body: "Assumptions, deadlines, specialist findings, and decisions kept current in one place, with a monthly review. Sold only where the portfolio actually needs it.",
  },
];

const NOT_INCLUDED = [
  "Not an appraisal or a valuation.",
  "Not a structural, environmental, or building-condition assessment.",
  "Not a market study, a lease analysis, or a construction estimate.",
  "Not a guarantee of any approval, incentive, or timeline.",
];

const PRICING = [
  {
    name: "One property",
    price: "From $7,500",
    detail:
      "Two to three weeks on one building or site and one decision, scoped to how hard the decision is. Complete in itself: the packet, the register, and a working session to walk through it.",
  },
  {
    name: "A portfolio of about ten",
    price: "From $20,000",
    detail:
      "The same screening across a defined set of parcels, ranked, so the properties that deserve real diligence surface first and the rest get a documented reason to wait.",
  },
  {
    name: "Inside a partner's assignment",
    price: "Priced from the days",
    detail:
      "A data, analysis, or reporting package within a consultant's or design team's scoped project, quoted with the partner, with one lead contract and written responsibilities.",
  },
  {
    name: "Maintained portfolio record",
    price: "From $2,500 / month",
    detail:
      "Assumptions, deadlines, specialist findings, and decisions kept current, with a monthly review. Only where the decisions keep moving.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us the property and the decision",
    body: "An address or a list, and the question you are trying to answer: sell, hold, convert, expand, or walk away. Twenty minutes.",
  },
  {
    n: "02",
    title: "We screen and assemble",
    body: "Two to three weeks against the public record and the downtown model. Where the record is silent, the packet says so instead of guessing.",
  },
  {
    n: "03",
    title: "You get the packet and a working session",
    body: "The evidence, the register, and the next three moves, walked through with the people who will act on it.",
  },
  {
    n: "04",
    title: "The record stays current, if you want it to",
    body: "For a portfolio with live decisions, we keep the record and run a monthly review. For a single decision, the engagement ends here.",
  },
];

const RULES = [
  {
    title: "One side per matter",
    body: "If we are working for you on a property, nobody across the table from you is paying us anything on the same matter.",
  },
  {
    title: "We don't publish on your building while you're a client",
    body: "Our public downtown map and deep-dives keep running. Analysis of a property under engagement waits until the engagement ends, and the engagement is disclosed on any related public work afterward.",
  },
  {
    title: "Every engagement is on the register",
    body: "Private clients appear on our Independence page by client, scope, and dates, the same as public ones. If a client needs confidentiality, the property type and scope are listed and the fact of the engagement is disclosed.",
  },
  {
    title: "Public data is not our asset",
    body: "Everything we screen against is public, and much of our code is open. What you pay for is the assembly, the judgment, and the accountability for getting it right.",
  },
];

export default function PropertyPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1100px] px-5 pb-12 pt-16 sm:px-8 sm:pt-24 lg:px-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--color-ember)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            For property owners and developers
          </span>
        </div>

        <h1 className="max-w-4xl font-editorial-normal text-[40px] leading-[1.05] text-[var(--color-ink)] sm:text-[56px] lg:text-[64px]">
          Which building deserves the next dollar of diligence?
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] sm:text-[19px]">
          Owners and development teams bring us a property, or a portfolio, and a decision. We
          screen it against the public record and hand back an evidence packet: what is known,
          what is missing, and what to do next. It is the step before you pay an architect, an
          engineer, or a broker to look.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/contact?topic=Property%20screening"
            className="rounded-sm bg-[var(--color-canopy)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-canopy-light)]"
          >
            Start with a property
          </Link>
          <a
            href={DOWNTOWN_URL}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-canopy)] hover:underline"
          >
            See the public downtown map
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* What you get */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--color-ember)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              What you get
            </span>
          </div>
          <h2 className="max-w-2xl font-editorial text-[28px] leading-tight text-[var(--color-ink)] sm:text-[36px]">
            An evidence packet, not a map
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
            Our public downtown model shows what every parcel could become. A screening turns that
            into a decision about yours.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {DELIVERABLES.map((d) => (
              <div key={d.title} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--color-canopy)]/7 text-[var(--color-canopy)]">
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-editorial text-[24px] leading-tight text-[var(--color-ink)]">
                  {d.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{d.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-sm border border-[var(--color-clay)]/30 bg-[var(--color-clay-tint)] p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
              What it is not
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)] sm:grid-cols-2">
              {NOT_INCLUDED.map((n) => (
                <li key={n} className="flex items-start gap-2">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-clay)]" />
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              Specialist work is scoped and priced separately, and the packet names which
              specialist each open question needs. We will tell you when a screening is not the
              right purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--color-ember)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Published pricing
          </span>
        </div>
        <h2 className="max-w-2xl font-editorial text-[28px] leading-tight text-[var(--color-ink)] sm:text-[36px]">
          The same starting point for every client, so nobody wonders about the deal next door
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          Floors, not quotes. The number depends on the size of the site or portfolio and how
          hard the decision is, and you have it in writing before any work starts. Private work
          is billed with a deposit at commencement and milestones after.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PRICING.map((tier) => (
            <div key={tier.name} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-7">
              <h3 className="font-editorial text-[24px] text-[var(--color-ink)]">{tier.name}</h3>
              <div className="mt-2 font-mono text-[17px] font-semibold tabular-nums text-[var(--color-canopy)]">
                {tier.price}
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{tier.detail}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-[var(--color-ink-light)]">
          Larger programs, such as a district-wide or consortium-funded screening, are costed from
          the team and the scope and appear here when they become standard offerings.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--color-ember)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
              How it works
            </span>
          </div>
          <h2 className="max-w-2xl font-editorial text-[28px] leading-tight text-[var(--color-ink)] sm:text-[36px]">
            Four steps, three weeks
          </h2>

          <ol className="mt-9 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t-2 border-[var(--color-canopy)] pt-4">
                <span className="font-mono text-[12px] font-bold text-[var(--color-ember)]">{s.n}</span>
                <h3 className="mt-2 font-editorial text-[21px] leading-tight text-[var(--color-ink)]">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
            <ShieldCheck className="h-4 w-4" />
            How we work for private clients
          </div>
          <h2 className="mt-4 max-w-2xl font-editorial text-[28px] leading-tight text-white sm:text-[36px]">
            The Lab publishes about downtown. Here is how that stays honest when you hire us.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
            {RULES.map((r) => (
              <div key={r.title}>
                <h3 className="font-editorial text-[22px] leading-tight text-white">{r.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/75">{r.body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/independence"
            className="mt-9 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Read the independence page
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px w-8 bg-[var(--color-ember)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Proof
          </span>
        </div>
        <h2 className="max-w-2xl font-editorial text-[28px] leading-tight text-[var(--color-ink)] sm:text-[36px]">
          The public version is already live
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          We don&apos;t ask owners to imagine the work. The downtown parcel model and the permits
          tool are public, free, and built from the same record we screen against. The Lloyd
          Center deep-dive is the closest public example of a packet: one property, the record
          assembled, the gaps named, the next moves dated.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={DOWNTOWN_URL}
            className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
          >
            Open the downtown map
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={PERMITS_URL}
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
          >
            Try the permits tool
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <Link
            href="/deep-dives/lloyd"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
          >
            Read the Lloyd Center deep-dive
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="font-editorial text-[24px] leading-tight text-[var(--color-ink)] sm:text-[28px]">
                Bring the address and the decision
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                Tell us the property, what you are deciding, and when. We reply within two working
                days with whether a screening is the right purchase and, if it is, a fixed scope
                inside the band.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/contact?topic=Property%20screening"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
              >
                Start with a property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
