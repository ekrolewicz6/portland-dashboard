import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, Receipt, ArrowRight, Scale, EyeOff, Repeat, Landmark } from "lucide-react";
import { HEADLINE, SOURCES, FACTS } from "@/lib/fpdr/data";
import { fmtMoney, fmtMillions, fmtPct } from "@/lib/fpdr/engine";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import PersonalCostCalculator from "@/components/deep-dives/fpdr/PersonalCostCalculator";
import ReformSimulator from "@/components/deep-dives/fpdr/ReformSimulator";
import LevyGrowthChart from "@/components/deep-dives/fpdr/LevyGrowthChart";
import SpendingChart from "@/components/deep-dives/fpdr/SpendingChart";
import WhoBenefits from "@/components/deep-dives/fpdr/WhoBenefits";
import ReformMenu from "@/components/deep-dives/fpdr/ReformMenu";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "The Pension on Your Property Tax Bill — FPDR, Explained",
  description:
    "Portland owes $3.9 billion in police and fire pensions and has saved almost none of it. A plain-language, interactive deep-dive into FPDR: what it costs you, who gets it, and how it could be fixed.",
  path: "/deep-dives/fpdr",
  type: "article",
});

const NAV = [
  { id: "what", label: "What it is" },
  { id: "cost", label: "Your cost" },
  { id: "growing", label: "The trend" },
  { id: "who", label: "Who gets it" },
  { id: "hard", label: "Why it's stuck" },
  { id: "fix", label: "Try a fix" },
  { id: "menu", label: "All the fixes" },
  { id: "sources", label: "Sources" },
];

function Src({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
    >
      {s.org}
    </a>
  );
}

export default function FpdrDeepDivePage() {
  const wastedShare = 1 - HEADLINE.fundedRatio;

  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative bg-[var(--color-canopy)] text-white noise-overlay overflow-hidden">
        <div className="absolute top-0 right-0 w-[720px] h-[720px] bg-[var(--color-canopy-light)] rounded-full blur-[190px] opacity-25 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-[var(--color-ember)] rounded-full blur-[160px] opacity-[0.07] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-24`}>
          <div className="grid xl:grid-cols-12 gap-10 xl:gap-16 items-end">
            <div className="xl:col-span-8">
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                <Link href="/deep-dives" className="hover:text-[var(--color-ember-bright)] transition-colors">
                  Policy Deep-Dive
                </Link>
                <div className="w-8 h-px bg-[var(--color-ember)]/50" />
                <span>Portland budgets</span>
              </div>
              <h1 className="mt-6 font-editorial-normal text-[40px] sm:text-[58px] lg:text-[70px] leading-[1.04] tracking-tight max-w-4xl 3xl:max-w-5xl">
                The pension hiding on your
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  property tax bill
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] sm:text-[20px] text-white/75 leading-relaxed">
                Portland has promised <strong className="text-white">{fmtMoney(HEADLINE.liability)}</strong> in
                retirement and disability benefits to its police and firefighters, and has saved almost
                none of it. Instead, the bill lands on your property taxes, a little more every year.
                Here&apos;s how it works, what it costs you, and how it could be fixed.
              </p>
              <div className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-white/70">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                  Co-authored by
                </span>
                <span className="text-white/85">
                  Portland Civic Lab and{" "}
                  <a
                    href={SOURCES.machizOpEd.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white underline decoration-[var(--color-ember)]/50 underline-offset-2 hover:decoration-[var(--color-ember)]"
                  >
                    Kevin Machiz, CFA, FRM
                  </a>
                </span>
              </div>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <a
                  href="#cost"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
                >
                  See what it costs you
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#fix"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Try fixing it yourself
                </a>
              </div>
            </div>

            <aside className="hidden xl:block xl:col-span-4">
              <div className="rounded-sm border border-white/12 bg-white/[0.05] p-6 backdrop-blur">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]">
                  The short version
                </div>
                <dl className="mt-4 space-y-4">
                  {[
                    { t: "What it is", d: "A police & fire pension paid straight from property taxes, with almost nothing saved behind it." },
                    { t: "Why it matters", d: `It's ~${fmtPct(HEADLINE.shareOfCityLine, 0)} of your City of Portland tax line and grows every year, quietly squeezing other services.` },
                    { t: "The catch", d: "The fix is known, start saving, but it costs more now to cost far less later." },
                  ].map((r) => (
                    <div key={r.t}>
                      <dt className="text-[13px] font-semibold text-white">{r.t}</dt>
                      <dd className="text-[13px] text-white/65 leading-relaxed mt-0.5">{r.d}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 30-second stat band ── */}
      <section className="bg-[var(--color-canopy-mid)] text-white border-t border-white/10">
        <div className={`${DIVE_CONTAINER} py-10 grid grid-cols-2 lg:grid-cols-4 gap-6`}>
          {[
            { v: fmtMoney(HEADLINE.liability), l: "promised to retirees", s: "in today's dollars" },
            { v: fmtPct(wastedShare, 1), l: "of it is unsaved", s: `only ${fmtMoney(HEADLINE.assets)} set aside` },
            { v: `${fmtMoney(HEADLINE.annualLevyFY26)}`, l: "from property taxes this year", s: "and rising every year" },
            { v: fmtPct(HEADLINE.shareOfCityLine, 0), l: "of your city tax line", s: "goes to this one fund" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-mono text-[30px] sm:text-[38px] font-bold tabular-nums leading-none text-[var(--color-ember-bright)]">
                {s.v}
              </p>
              <p className="text-[13px] font-semibold mt-2 leading-snug">{s.l}</p>
              <p className="text-[12px] text-white/55 mt-0.5">{s.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-14 z-40 bg-[var(--color-paper)]/95 backdrop-blur border-b border-[var(--color-parchment)]">
        <div className={DIVE_CONTAINER}>
          <div className="flex gap-1 overflow-x-auto py-2 text-[12px] font-mono uppercase tracking-[0.08em] scrollbar-hide">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-3 py-3 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-canopy)] transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── What it is ── */}
      <Section
        id="what"
        eyebrow="The basics"
        title="A pension fund with almost no money in it"
        lead={
          <>
            FPDR stands for <strong>Fire &amp; Police Disability and Retirement</strong>. It pays
            pensions, disability, and survivor benefits to Portland&apos;s police officers and
            firefighters. The benefits are normal. What&apos;s strange, and expensive, is how
            Portland pays for them.
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-7">
            <div className="flex items-center gap-2.5 mb-3">
              <PiggyBank className="w-6 h-6 text-[var(--color-fern)]" />
              <h3 className="font-editorial-normal text-[20px] text-[var(--color-canopy)]">
                How almost every pension works
              </h3>
            </div>
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              Money is set aside <strong>while you&apos;re still working</strong> and invested for
              decades. By the time you retire, investment growth has done most of the heavy lifting.
              It&apos;s a piggy bank that fills up and earns interest. This is how Oregon&apos;s PERS
              system works, and nearly every other public pension in the country.
            </p>
          </div>
          <div className="rounded-sm border-2 border-[var(--color-clay)]/30 bg-[#fbf4f0] p-7">
            <div className="flex items-center gap-2.5 mb-3">
              <Receipt className="w-6 h-6 text-[var(--color-clay)]" />
              <h3 className="font-editorial-normal text-[20px] text-[var(--color-clay)]">
                How FPDR works: &ldquo;pay-as-you-go&rdquo;
              </h3>
            </div>
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              Portland saves <strong>essentially nothing</strong>. Each year, property taxes are
              collected to cover that year&apos;s retiree checks, and that&apos;s it. There&apos;s no
              invested piggy bank doing the work, so taxpayers are on the hook for the whole thing,
              forever. Worse, with nothing set aside the unfunded balance keeps growing instead of being
              paid down — the city falls further behind each year, the opposite of what accepted funding
              guidelines call for. Analysts say only Portland and Puerto Rico still run a public pension
              this way.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-sm bg-[var(--color-canopy)] text-white p-7 sm:p-8">
          <p className="text-[16px] sm:text-[18px] leading-relaxed">
            The result: FPDR has promised{" "}
            <strong className="text-[var(--color-ember-bright)]">{fmtMoney(HEADLINE.liability)}</strong>{" "}
            in benefits but holds just{" "}
            <strong className="text-[var(--color-ember-bright)]">{fmtMoney(HEADLINE.assets)}</strong>{" "}
            in savings — less than <strong className="text-[var(--color-ember-bright)]">one percent</strong>{" "}
            of what it owes. A normal pension aims for 100%.
          </p>
          <p className="text-[12px] text-white/55 mt-3">
            Source: <Src id="milliman2024" /> actuarial valuation, June 30, 2024.
          </p>
        </div>

        <div className="mt-10">
          <H3>Where this year&apos;s money goes</H3>
          <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed mt-2 mb-6 max-w-2xl">
            Of the roughly {fmtMoney(HEADLINE.annualLevyFY26)} collected this year, most pays pensions
            to people who already retired. A growing slice pre-funds PERS for officers and firefighters
            hired since 2007, so Portland is now paying for <strong>two systems at once.</strong>
          </p>
          <SpendingChart />
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-4">
            Program spending, FY2025-26. Source: <Src id="fiveYearPlan" />.
          </p>
        </div>
      </Section>

      {/* ── Your cost ── */}
      <Section
        id="cost"
        tone="warm"
        eyebrow="Your cost"
        title="What are you personally paying?"
        lead="FPDR is its own line on your Multnomah County property tax bill. Move the slider to your home's assessed value to see your share."
      >
        <PersonalCostCalculator />
        <p className="text-[12px] text-[var(--color-ink-muted)] mt-4 max-w-2xl leading-relaxed">
          Based on the FY2025-26 FPDR rate of ${HEADLINE.ratePer1000AV_FY26.toFixed(4)} per $1,000 of
          assessed value (<Src id="county2526" />). The multi-year figure grows assessed value by the
          city&apos;s assumed ~3%/year and applies its published rate forecast through FY31
          (<Src id="fiveYearPlan2731" />), since both the rate and the assessed base keep rising. In
          Oregon, Measure 50 caps assessed-value growth and decoupled it from market value, so assessed
          value tracks neither a home&apos;s sale price nor how &ldquo;nice&rdquo; it is.
        </p>
      </Section>

      {/* ── The trend ── */}
      <Section
        id="growing"
        eyebrow="The trend"
        title="The bill keeps climbing"
        lead={
          <>
            Because Portland never saved up, the yearly tax bill grows as more officers and
            firefighters retire. It has gone from about $169 million in FY2019-20 to the{" "}
            {fmtMoney(HEADLINE.annualLevyFY27)} approved for FY2026-27.
          </>
        }
      >
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6 sm:p-8">
          <LevyGrowthChart />
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-3">
            FPDR levy by fiscal year, in millions. FY30 is the city&apos;s own projection. Sources:{" "}
            <Src id="county2526" />, <Src id="fiveYearPlan" />.
          </p>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          <InfoCard icon={<Scale className="w-5 h-5 text-[var(--color-ember)]" />} title="It quietly squeezes other services">
            Oregon caps how much property tax can be charged. As FPDR&apos;s slice grows, it pushes the
            city toward that cap, and when the cap is hit, other levies get cut (&ldquo;compression&rdquo;).
          </InfoCard>
          <InfoCard icon={<Landmark className="w-5 h-5 text-[var(--color-ember)]" />} title="But it probably won't hit its ceiling">
            The fund has a legal cap of ${HEADLINE.capPer1000RMV.toFixed(2)} per $1,000 of market value.
            The city&apos;s actuary ran 10,000 scenarios and found less than a{" "}
            {fmtPct(FACTS.capBreachOddsThru2044, 0)} chance of hitting it before 2044 — the rate is
            forecast to crest around 2033, then ease as older retirees pass away.
          </InfoCard>
        </div>
      </Section>

      {/* ── Who gets it ── */}
      <Section
        id="who"
        tone="warm"
        eyebrow="Who gets it"
        title="The people on the other end"
        lead="This isn't an abstraction — it's real benefits for real people who did dangerous jobs. About 2,000 retirees and survivors get a check today, and a few hundred officers and firefighters are still earning the old pension."
      >
        <WhoBenefits />
      </Section>

      {/* ── Why it's stuck ── */}
      <Section
        id="hard"
        eyebrow="Why it's stuck"
        title={<>If everyone agrees it&apos;s a mess, why isn&apos;t it fixed?</>}
        lead="Almost everyone, including the city's own pension director, agrees pay-as-you-go is the wrong way to fund this. It stays in place anyway, for four stubborn reasons."
      >
        <div className="space-y-4">
          <ReasonRow n={1} icon={<Scale className="w-5 h-5" />} title="You can't cut the benefits">
            Oregon courts treat an earned pension as a binding promise. In a line of cases ending with{" "}
            <em>Moro v. State</em> (<Src id="moro" />), the Oregon Supreme Court ruled that benefits
            already earned can&apos;t be reduced. So reform can&apos;t cut the benefits retirees were
            promised — it can only change <em>how they&apos;re paid for</em>, and how much they
            ultimately cost taxpayers.
          </ReasonRow>
          <ReasonRow n={2} icon={<Repeat className="w-5 h-5" />} title="Fixing it means funding two things at once for a while">
            To start saving properly, Portland would keep paying today&apos;s retirees{" "}
            <strong>and</strong> set aside new money for the future at the same time. That transition is
            the single hardest part — it raises taxes now to lower them much more later. It isn&apos;t
            exotic: amortizing an unfunded liability this way is how nearly every other public pension in
            the country is funded. The catch is political — the payoff is real, but it arrives decades
            after today&apos;s officials are gone.
          </ReasonRow>
          <ReasonRow n={3} icon={<EyeOff className="w-5 h-5" />} title="Almost nobody knows it's there">
            The cost is buried in a line item most people never read, set by a separate board, and it
            rises automatically without a public vote. A problem nobody sees is a problem nobody is
            forced to fix.
          </ReasonRow>
          <ReasonRow n={4} icon={<Landmark className="w-5 h-5" />} title="It needs a citywide vote">
            The rules live in the city charter, so any real change — including the option to start
            saving — would have to go to the ballot. That takes years of public education and political
            will the city hasn&apos;t spent yet, even as it faces a{" "}
            {fmtMoney(FACTS.cityFY26ShortfallLow)}+ budget shortfall.
          </ReasonRow>
        </div>
      </Section>

      {/* ── Try a fix ── */}
      <Section
        id="fix"
        tone="dark"
        eyebrow="Try a fix"
        title="Could saving up actually be cheaper?"
        lead={
          <>
            Here&apos;s what a real funding policy looks like: fully fund the pension over 30 years, with
            the bill set to{" "}
            <span className="text-[var(--color-ember-bright)] font-semibold">decline every year</span>{" "}
            and fall away once the debt is paid off. Add a bond to soften the early bump, or set the
            return to 0% to watch the savings vanish.
          </>
        }
      >
        <ReformSimulator />
        <p className="text-[12px] text-white/50 mt-4 max-w-2xl leading-relaxed">
          This is a simplified teaching model, not an official forecast. It applies a real
          funding-policy structure — a declining-dollar amortization of the unfunded liability over 30
          years at a 7% return, the kind of policy analysts like Kevin Machiz recommend
          (<Src id="machizDeck" />) — to the city actuary&apos;s own benefit projections (the{" "}
          {fmtMillions(8469)} lifetime pay-go cost, peaking in the mid-2030s; <Src id="milliman2024" />).
          A real policy would phase in the first year or two more gently than shown, and the future bill
          is in plain (not inflation-adjusted) dollars.
        </p>
      </Section>

      {/* ── All the fixes ── */}
      <Section
        id="menu"
        eyebrow="The full menu"
        title="Every option, with the catch"
        lead="There's no free lunch. Each fix trades near-term pain for long-term savings, or avoids the pain by taking on a different risk. Here's the honest version of each."
      >
        <ReformMenu />
      </Section>

      {/* ── Sources ── */}
      <Section
        id="sources"
        tone="warm"
        eyebrow="Sources & method"
        title="Where these numbers come from"
        lead="Every figure on this page is drawn from primary sources — the city's actuary, county tax records, and city budget documents — verified in June 2026. The reform simulator is a simplified educational model; everything else is reported data."
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
            <h3 className="font-editorial-normal text-[18px] text-[var(--color-canopy)]">
              A note on the funding debate
            </h3>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed mt-2">
              Analysts like Kevin Machiz and Marc Poris argue Portland should start pre-funding, because
              over the life of the plan it could save a quarter to a third of the cost. The city counters
              that the upfront transition cost is enormous and arrives when budgets are tightest. Both
              are right, which is what makes it genuinely hard rather than obvious.
            </p>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-3">
          {Object.values(SOURCES).map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-sm border border-transparent hover:border-[var(--color-parchment)] hover:bg-white p-2 -m-2 transition-colors"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ember)]" />
              <span>
                <span className="block text-[13px] text-[var(--color-ink)] group-hover:text-[var(--color-canopy)] leading-snug">
                  {s.title}
                </span>
                <span className="block text-[11px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wide mt-0.5">
                  {s.org} · {s.kind}
                </span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── local helpers ─────────────────────────────────────────────────

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-editorial-normal text-[24px] text-[var(--color-canopy)] leading-tight">
      {children}
    </h3>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
      <div className="flex items-center gap-2.5 mb-2">
        {icon}
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h4>
      </div>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
    </div>
  );
}

function ReasonRow({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 rounded-sm border border-[var(--color-parchment)] bg-white p-6">
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <span className="font-mono text-[26px] font-bold text-[var(--color-parchment)] leading-none">{n}</span>
        <span className="text-[var(--color-ember)]">{icon}</span>
      </div>
      <div>
        <h3 className="text-[17px] font-semibold text-[var(--color-canopy)] mb-1.5">{title}</h3>
        <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
