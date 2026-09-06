import Link from "next/link";
import { SERVICES } from "@/lib/services";

export const dynamic = "force-static";

const STEPS = [
  {
    n: "01",
    title: "Tell us about the business once",
    body: "What you do, where you are, who owns it, how many people you employ, what you do for the neighborhood. Ten minutes. No EIN, no bank details, no financials.",
  },
  {
    n: "02",
    title: "We go looking for money",
    body: "City, county, state, federal, and private programs — grants, tax credits, rebates, wage subsidies, and industry funds. We check what you actually qualify for and confirm each one is still open before it reaches you.",
  },
  {
    n: "03",
    title: "We write the applications",
    body: "Every question answered from your profile, with sources shown. You read it, change anything that doesn't sound like you, and submit it yourself. We never file anything in your name.",
  },
  {
    n: "04",
    title: "We tell you what it came to",
    body: "Every application tracked through to a yes or a no, with the dollars that landed. Deadlines and renewals watched so nothing lapses quietly.",
  },
];

export default function BusinessPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            For Portland small businesses
          </span>
        </div>

        <h1 className="font-editorial-normal text-[40px] sm:text-[56px] lg:text-[64px] text-[var(--color-ink)] leading-[1.05] max-w-4xl">
          There is money with your business&apos;s name on it. Nobody has time
          to go find it.
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] sm:text-[19px] text-[var(--color-ink-light)] leading-relaxed">
          Grants, tax credits, energy rebates, hiring subsidies, industry funds.
          Most of it goes unclaimed every year — not because businesses
          don&apos;t qualify, but because finding it is a part-time job and you
          already have a full-time one.
        </p>

        <p className="mt-5 max-w-2xl text-[17px] sm:text-[19px] text-[var(--color-ink-light)] leading-relaxed">
          Tell Portland Civic Lab about your business once. We do the hunting
          and the paperwork. You review what we wrote and click submit.
        </p>

        <p className="mt-5 max-w-2xl text-[17px] sm:text-[19px] text-[var(--color-ink-light)] leading-relaxed">
          Free for Portland businesses during the pilot. If that changes, the
          price appears on this page first, the way it does for the rest of our
          work.
        </p>

        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          Start with the address. Some of Portland&apos;s largest grants are gated on district
          boundaries you can&apos;t see from the street — that check takes twenty seconds and
          needs no account.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/business/check"
            className="rounded-sm bg-[var(--color-canopy)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
          >
            Check your address
          </Link>
          <Link
            href="/member/business/new"
            className="rounded-sm border border-[var(--color-parchment)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-canopy)]"
          >
            Register your business
          </Link>
          <Link
            href="/signup"
            className="text-[15px] font-semibold text-[var(--color-canopy)] hover:underline"
          >
            Create an account first →
          </Link>
        </div>
      </section>

      {/* The point: recurring beats one-time */}
      <section className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-14">
          <h2 className="font-editorial text-[28px] sm:text-[32px] text-[var(--color-ink)] max-w-3xl leading-tight">
            We rank everything by one question: how much cash does this actually
            put back in your hands?
          </h2>
          <p className="mt-5 max-w-3xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
            A one-time $5,000 grant is good. A rebate that lowers your utility
            bill every month for a decade is better, and almost nobody chases it
            because it isn&apos;t exciting. A tax credit worth a few thousand
            dollars a year is invisible money — the IRS simply lets you keep
            more of what you earned, and most owners never learn it exists.
          </p>
          <p className="mt-4 max-w-3xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
            So we sort by five-year value, weighted by how likely you are to win
            it and discounted by how much work it takes — not by which program
            has the biggest headline number.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16">
        <h2 className="font-editorial text-[30px] text-[var(--color-ink)]">
          How it works
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-7"
            >
              <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[var(--color-ember)]">
                {s.n}
              </span>
              <h3 className="mt-3 font-editorial text-[21px] text-[var(--color-ink)]">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Everything else */}
      <section className="border-t border-[var(--color-parchment)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16">
          <h2 className="font-editorial text-[30px] text-[var(--color-ink)]">
            Funding is where we start
          </h2>
          <p className="mt-4 max-w-3xl text-[16px] text-[var(--color-ink-light)] leading-relaxed">
            The goal is simpler than it sounds: one place that handles the
            administrative weight of running a small business in Portland. The
            same profile powers all of it, so you never fill anything out twice.
            Estimates below are typical ranges, not promises.
          </p>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s) => (
              <div
                key={s.slug}
                className={`rounded-sm border p-6 ${
                  s.status === "active"
                    ? "border-[var(--color-ember)] bg-[var(--color-paper-warm)]"
                    : "border-dashed border-[var(--color-parchment)]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-editorial text-[18px] text-[var(--color-ink)]">
                    {s.name}
                  </h3>
                </div>
                <p
                  className={`mt-1.5 text-[12px] font-semibold ${
                    s.status === "active"
                      ? "text-[var(--color-canopy)]"
                      : "text-[var(--color-ember)]"
                  }`}
                >
                  {s.valueHint}
                </p>
                <p className="mt-3 text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                  {s.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty */}
      <section className="border-t border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16">
          <h2 className="font-editorial text-[30px] text-[var(--color-ink)]">
            What we won&apos;t do
          </h2>
          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-7">
            <div>
              <h3 className="font-editorial text-[19px] text-[var(--color-ink)]">
                Submit in your name
              </h3>
              <p className="mt-2.5 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                Applications carry your attestation and your signature. We
                prepare them completely; you read and send. That line stays
                where it is.
              </p>
            </div>
            <div>
              <h3 className="font-editorial text-[19px] text-[var(--color-ink)]">
                Quote numbers we haven&apos;t checked
              </h3>
              <p className="mt-2.5 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                Every program shows whether we&apos;ve confirmed its current
                amounts and deadlines against the funder&apos;s own listing.
                Unverified is labeled unverified.
              </p>
            </div>
            <div>
              <h3 className="font-editorial text-[19px] text-[var(--color-ink)]">
                Ask for what we don&apos;t need
              </h3>
              <p className="mt-2.5 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                No EIN, SSN, or bank details to get started — and when a
                specific application does require them, we tell you which one
                and why.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1100px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <h2 className="font-editorial-normal text-[32px] sm:text-[40px] text-[var(--color-ink)] leading-tight max-w-3xl">
          Ten minutes now, and we start looking.
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/member/business/new"
            className="rounded-sm bg-[var(--color-canopy)] px-7 py-3.5 text-[15px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
          >
            Register your business
          </Link>
          <Link
            href="/contact"
            className="text-[15px] font-semibold text-[var(--color-canopy)] hover:underline"
          >
            Ask us a question first →
          </Link>
        </div>
      </section>
    </div>
  );
}
