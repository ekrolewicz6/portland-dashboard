import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { DOWNTOWN_URL, PERMITS_URL } from "@/lib/site";
import {
  ArtifactFrame,
  ClosingCta,
  Document,
  Ledger,
  NumberedList,
  PageHero,
  PrimaryAction,
  QuietAction,
  SectionHead,
  SHELL,
  type LedgerRow,
} from "@/components/site/Page";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "For Property Owners and Developers",
  description:
    "Portland Civic Lab screens a property or a portfolio against the public record and hands back an evidence packet: what is known, what is missing, and the next three moves. Published prices, one side per matter.",
  path: "/property",
});

const PACKET = [
  { n: "01", title: "The public record, assembled", body: "Parcel and ownership history, zoning and overlays, historic status, development capacity, permit history, assessment, and the programs that apply. Every claim is cited to its document." },
  { n: "02", title: "What we're unsure of", body: "Each material claim is graded by how well it is supported, and where a specialist is needed we say which one, so the next dollar of diligence goes where it matters." },
  { n: "03", title: "The decision, laid out", body: "The uses that are plausible, the constraints that actually bind, and the approvals in order. Written so the owner, the lender, and the design team read it the same way." },
  { n: "04", title: "The next three moves, with dates", body: "What to do first, second, and third, and the date each one depends on." },
];

const DELIVERABLES = [
  {
    title: "The public record, assembled",
    body: "Parcel and ownership history, zoning and overlays, historic status, development capacity, permit history, assessment, and the incentive programs that apply to this address. One packet, every claim cited to the document it came from.",
  },
  {
    title: "A register of what we're unsure of",
    body: "Each material claim is graded by how well it is supported. The questions only a specialist can answer are listed, along with which specialist, so the next dollar of diligence goes where it matters.",
  },
  {
    title: "The decision, laid out",
    body: "The uses that are plausible, the constraints that actually bind, the approvals in order, and the next three moves with dates. Written so the owner, the lender, and the design team read it the same way.",
  },
  {
    title: "A maintained record, if the decision keeps moving",
    body: "Assumptions, deadlines, specialist findings, and decisions kept current in one place, with a monthly review. Sold only where the portfolio actually needs it.",
  },
];

const NOT_INCLUDED = [
  "Not an appraisal or a valuation",
  "Not a structural, environmental, or building-condition assessment",
  "Not a market study, a lease analysis, or a construction estimate",
  "Not a guarantee of any approval, incentive, or timeline",
];

const PRICING: LedgerRow[] = [
  {
    name: "One property",
    price: "From $7,500",
    detail: "Two to three weeks on one building or site and one decision, scoped to how hard the decision is. Complete in itself: the packet, the register, and a working session to walk through it.",
  },
  {
    name: "A portfolio of about ten",
    price: "From $20,000",
    detail: "The same screening across a defined set of parcels, ranked, so the properties that deserve real diligence surface first and the rest get a documented reason to wait.",
  },
  {
    name: "Inside a partner's assignment",
    price: "Priced from the days",
    detail: "A data, analysis, or reporting package within a consultant's or design team's scoped project, quoted with the partner, with one lead contract and written responsibilities.",
  },
  {
    name: "Maintained portfolio record",
    price: "From $2,500 / month",
    detail: "Assumptions, deadlines, specialist findings, and decisions kept current, with a monthly review. Only where the decisions keep moving.",
  },
];

const STEPS = [
  { title: "Tell us the property and the decision", body: "An address or a list, and the question you are trying to answer: sell, hold, convert, expand, or walk away. Twenty minutes." },
  { title: "We screen and assemble", body: "Two to three weeks against the public record and the downtown model. Where the record is silent, the packet says so instead of guessing." },
  { title: "You get the packet and a working session", body: "The evidence, the register, and the next three moves, walked through with the people who will act on it." },
  { title: "The record stays current, if you want it to", body: "For a portfolio with live decisions, we keep the record and run a monthly review. For a single decision, the engagement ends here." },
];

const RULES = [
  {
    title: "One side per matter",
    body: "If we are working for you on a property, nobody across the table from you, the buyer, the lender, or the City, is paying us anything on the same matter.",
  },
  {
    title: "We don't publish on your building while you're a client",
    body: "Our public downtown map and deep-dives keep running, and nothing already public comes down for a client. New analysis of a property under engagement waits until the engagement ends, and any later public work that touches it says we were paid on it.",
  },
  {
    title: "Every engagement is on the register",
    body: "Private clients appear on our Independence page by client, scope, and dates, the same as public ones. If a client needs their name kept confidential, the entry still appears with the property type, scope, and dates. The name is the only thing withheld.",
  },
  {
    title: "Public data is not our asset",
    body: "Everything we screen against is public, and most of our code is open source. What you pay for is the work of pulling it together, the judgment, and someone accountable for getting it right.",
  },
];

export default function PropertyPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      <PageHero
        eyebrow="For property owners and developers"
        title="Which building deserves the next dollar of diligence?"
        lede="Owners and development teams bring us a property, or a portfolio, and a decision. We screen it against the public record and hand back an evidence packet: what is known, what is missing, and what to do next. It is the step before you pay an architect, an engineer, or a broker to look."
        actions={
          <>
            <PrimaryAction href="/contact?topic=Property%20screening">Start with a property</PrimaryAction>
            <QuietAction href={DOWNTOWN_URL} external>See the public downtown map</QuietAction>
          </>
        }
        aside={
          <Document
            header={{ left: "Evidence packet", right: "One property · 2 to 3 weeks" }}
            rows={PACKET}
            footer={<span>Every claim cited · from $7,500</span>}
          />
        }
      />

      {/* What you get */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
          <SectionHead
            eyebrow="What you get"
            title="What you get back."
            lede="Our public downtown model shows what every parcel could become. A screening turns that into an answer about your building."
          />
          <div className="mt-10">
            <NumberedList items={DELIVERABLES} columns={2} />
          </div>

          <div className="mt-12 rounded-sm border border-[var(--color-clay)]/30 bg-[var(--color-clay-tint)] px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">What it is not</p>
                <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
                  {NOT_INCLUDED.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-[14px] leading-snug text-[var(--color-ink-light)]">
                      <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-clay)]" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="max-w-sm text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                Specialist work is scoped and priced separately, and the packet names which specialist
                each open question needs. We will tell you when a screening is not the right purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
        <SectionHead
          eyebrow="Published pricing"
          title="The same starting prices for every client."
          lede="These are starting points rather than quotes. The final number depends on the size of the site or portfolio and how hard the decision is, and you have it in writing before any work starts. Private work is billed with a deposit up front and milestones after that."
        />
        <div className="mt-10">
          <Ledger rows={PRICING} />
        </div>
        <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          Larger programs, such as a district-wide or consortium-funded screening, are costed from the
          team and the scope and appear here when they become standard offerings.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
          <SectionHead eyebrow="How it works" title="Four steps, about three weeks." />
          <div className="mt-10">
            <NumberedList items={STEPS} columns={4} />
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className={`${SHELL} relative z-10 py-14 sm:py-16 lg:py-20`}>
          <SectionHead
            light
            eyebrow="How we work for private clients"
            title="We also publish about downtown. Here is how we keep that honest when you hire us."
          />
          <div className="mt-10">
            <NumberedList items={RULES} columns={2} light />
          </div>
          <Link
            href="/independence"
            className="mt-10 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Read the independence page
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Proof */}
      <section className={`${SHELL} py-14 sm:py-16 lg:py-20`}>
        <SectionHead
          eyebrow="Proof"
          title="You can try the public version now."
          lede="The downtown model and the permits tool are free, and they are built from the same records we screen against."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <ArtifactFrame src="/images/home/downtown.jpg" alt="The downtown parcel model" caption="Portland Possible · 5,275 parcels" href={DOWNTOWN_URL} external position="object-center" />
            <p className="mt-3 text-[14px] font-semibold text-[var(--color-ink)]">Every parcel downtown, what it is, and what it could become.</p>
          </div>
          <div>
            <ArtifactFrame src="/images/home/permits-b.jpg" alt="The permits tool" caption="Portland Permits" href={PERMITS_URL} external />
            <p className="mt-3 text-[14px] font-semibold text-[var(--color-ink)]">Zoning, likely permits, fees, and timelines for an address.</p>
          </div>
          <Link
            href="/deep-dives/lloyd"
            className="group flex flex-col justify-between rounded-sm bg-[var(--color-canopy)] p-6 text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
          >
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">Deep-dive · Lloyd Center</p>
              <p className="mt-3 font-editorial text-[24px] leading-tight">The closest public example of a packet.</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">One property, with the record pulled together, the open questions listed, and the next moves dated.</p>
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold">
              Read it <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        </div>
      </section>

      <ClosingCta
        eyebrow="Start here"
        title="Send us the address and the decision."
        body="Tell us which property, what you are trying to decide, and when you need to decide it. We will reply within two working days and say whether a screening makes sense and, if it does, exactly what it would cost."
        primary={{ label: "Start with a property", href: "/contact?topic=Property%20screening" }}
        secondary={{ label: "Public institutions", href: "/institutions" }}
      />
    </div>
  );
}
