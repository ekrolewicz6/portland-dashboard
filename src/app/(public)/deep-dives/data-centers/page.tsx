import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Clock,
  Droplets,
  Factory,
  Gavel,
  GraduationCap,
  Landmark,
  Leaf,
  MapPin,
  Scale,
  Server,
  Wheat,
  Zap,
} from "lucide-react";
import { COMMITTEE, HEADLINE, SOURCES, WHATS_NEXT, fmtNum } from "@/lib/datacenters/data";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import RateShift from "@/components/deep-dives/datacenters/RateShift";
import SubsidyPerJob from "@/components/deep-dives/datacenters/SubsidyPerJob";
import ConditionsScorecard from "@/components/deep-dives/datacenters/ConditionsScorecard";
import DealCalculator from "@/components/deep-dives/datacenters/DealCalculator";
import SitingMap from "@/components/deep-dives/datacenters/SitingMap";
import CommitteeDetail from "@/components/deep-dives/datacenters/CommitteeDetail";
import RecordFindings from "@/components/deep-dives/datacenters/RecordFindings";
import WhoShowedUp from "@/components/deep-dives/datacenters/WhoShowedUp";
import StructuralFactors from "@/components/deep-dives/datacenters/StructuralFactors";
import DocumentLibrary from "@/components/deep-dives/datacenters/DocumentLibrary";
import { DCAC_DOC_COUNT } from "@/lib/datacenters/dcac-docs";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Oregon's Data Center Bargain — the Case For, the Case Against, and the Win-Win Test",
  description:
    "Oregon hosts ~125 data centers and hands tech companies $450M+ a year in tax breaks. In 2026 the state hit pause. The strongest case for the deals, the strongest case against, and an honest test of when, if ever, a data center is a win-win.",
  path: "/deep-dives/data-centers",
  type: "article",
});

const NAV = [
  { id: "fight", label: "The fight" },
  { id: "case-for", label: "The case for" },
  { id: "case-against", label: "The case against" },
  { id: "evidence", label: "Where they collide" },
  { id: "test", label: "The win-win test" },
  { id: "price", label: "Pricing a deal" },
  { id: "committee", label: "The committee" },
  { id: "record", label: "The record" },
  { id: "voices", label: "Who showed up" },
  { id: "why", label: "Why it's shaped this way" },
  { id: "library", label: "All documents" },
  { id: "next", label: "What happens next" },
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

export default function DataCentersDeepDivePage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative bg-[var(--color-canopy)] text-white noise-overlay overflow-hidden">
        <div className="absolute top-0 right-0 w-[720px] h-[720px] bg-[var(--color-canopy-light)] rounded-full blur-[190px] opacity-25 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-[var(--color-river)] rounded-full blur-[160px] opacity-[0.08] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-24`}>
          <div className="grid xl:grid-cols-12 gap-10 xl:gap-16 items-end">
            <div className="xl:col-span-8">
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                <Link href="/deep-dives" className="hover:text-[var(--color-ember-bright)] transition-colors">
                  Policy Deep-Dive
                </Link>
                <div className="w-8 h-px bg-[var(--color-ember)]/50" />
                <span>Energy, water &amp; taxes</span>
              </div>
              <h1 className="mt-6 font-editorial-normal text-[40px] sm:text-[58px] lg:text-[70px] leading-[1.04] tracking-tight max-w-4xl 3xl:max-w-5xl">
                Oregon built the cloud.
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  Was it worth the bill?
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] sm:text-[20px] text-white/75 leading-relaxed">
                Roughly {HEADLINE.facilities} data centers now run in Oregon, drawn by no sales tax,
                cheap hydropower, and{" "}
                <strong className="text-white">${HEADLINE.annualTaxBreaksM} million-plus a year</strong>{" "}
                in tax breaks. In 2026 the bargain blew open: a moratorium, a lawsuit, a first-in-the-nation
                rate overhaul, and a governor saying Oregon should &ldquo;stop being a cheap
                date.&rdquo; This deep-dive argues both sides at full strength, then runs the test that
                actually matters: under what conditions is a data center a win for the town next door?
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <a
                  href="#case-for"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
                >
                  Read both cases
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#test"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Skip to the win-win test
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
                    {
                      t: "What they are",
                      d: "Warehouse-scale computer buildings run by Amazon, Google, Meta, and Apple — the physical internet, and now the physical AI boom.",
                    },
                    {
                      t: "The fight",
                      d: "Whether $450M+ a year in tax breaks, surging power demand, and secretive water deals buy Oregon enough in return.",
                    },
                    {
                      t: "Where it stands",
                      d: "New tax deals frozen since June 2026. A governor's committee reports in October. The 2027 Legislature decides what replaces the pause.",
                    },
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
            {
              v: `~${HEADLINE.facilities}`,
              l: "data centers in Oregon",
              s: "Hillsboro, the Columbia River, Central Oregon",
            },
            {
              v: `$${HEADLINE.annualTaxBreaksM}M+`,
              l: "yearly tax breaks to tech companies",
              s: "the country's most generous data-center terms",
            },
            {
              v: `$${HEADLINE.awsMorrowTaxesM}M`,
              l: "AWS pays Morrow County anyway",
              s: "more than the next 16 taxpayers combined",
            },
            {
              v: "+30% / −1.3%",
              l: "the 2026 rate split",
              s: "data centers pay more, households pay less",
            },
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

      {/* ── The fight ── */}
      <Section
        id="fight"
        eyebrow="2026: the year it broke open"
        title="Why everyone is suddenly fighting about server farms"
        lead={
          <>
            Data centers grew quietly in Oregon for twenty years. Then, in six months, the state froze
            their tax breaks, a teachers&apos; union sued two governments, and regulators rewrote how
            they pay for power. Three fights, one question: who&apos;s getting the better end of this?
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            Why here at all? No sales tax on billions of dollars of servers, cheap Columbia River
            hydropower, a cool dry climate that&apos;s free air-conditioning, and eight trans-Pacific
            fiber cables landing at Hillsboro (<Src id="cubWhyOregon" />). Communities have zoned{" "}
            {fmtNum(HEADLINE.envisionedAcres)} more acres for them — enough to quadruple the
            industry&apos;s footprint (<Src id="lincolnAcres" />).
          </p>
        }
      >
        <div className="grid md:grid-cols-3 gap-5">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <Landmark className="w-5 h-5 text-[var(--color-ember)]" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                June 5
              </span>
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] mb-1.5">
              The state hit pause
            </h3>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              House Bill 4084 barred new data centers from enterprise-zone property tax breaks, Oregon&apos;s largest incentive program, until after the 2027 session. Existing and
              already-approved deals keep their terms (<Src id="dwtMoratorium" />). Gov. Kotek had cut
              data centers from her own tax-break expansion three months earlier (<Src id="opbEzCut" />).
            </p>
          </div>
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <Gavel className="w-5 h-5 text-[var(--color-ember)]" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                June 24
              </span>
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] mb-1.5">
              The lawsuit landed
            </h3>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              1000 Friends of Oregon, Tax Fairness Oregon, Tualatin Riverkeepers, and the Oregon
              Education Association sued Hillsboro and Washington County over ~17 tax-break
              applications — tied to NVIDIA, CoreWeave, Adobe, Dropbox, QTS, and Flexential — rushed
              through before the moratorium, allegedly without required public notice (
              <Src id="capitalChronicleLawsuit" />).
            </p>
          </div>
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-5 h-5 text-[var(--color-ember)]" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                All year
              </span>
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] mb-1.5">
              The power bill got rewritten
            </h3>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              Under 2025&apos;s POWER Act, the first law of its kind in the country, regulators moved
              big data centers into their own rate class. PGE&apos;s version raised their bills ~30% and
              cut household bills 1.3% (<Src id="opbPowerAct" />, <Src id="tomsHardwareRates" />). The
              governor, in July: Oregon should &ldquo;stop being a cheap date&rdquo; (
              <Src id="klccCheapDate" />).
            </p>
          </div>
        </div>
      </Section>

      {/* ── The case for ── */}
      <Section
        id="case-for"
        tone="warm"
        eyebrow="The strongest case for"
        title="Rural Oregon's best deal in a generation"
        lead={
          <>
            Set aside the metro fights for a moment and look at Boardman, Hermiston, and Prineville —
            towns the timber economy left behind. This is the case data-center supporters actually
            make, at its strongest.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            This is a steelman: the best honest version of the argument, built from what county
            commissioners, chambers of commerce, and the companies themselves point to — not a
            caricature of it. The counter-case follows.
          </p>
        }
      >
        <div className="grid md:grid-cols-2 gap-5">
          <ForCard
            icon={<Landmark className="w-5 h-5 text-[var(--color-fern)]" />}
            title="Even with the breaks, they're the biggest taxpayer by far"
          >
            AWS pays Morrow County more than ${HEADLINE.awsMorrowTaxesM} million a year in property
            taxes, more than the next 16 largest taxpayers combined, while three of its five sites
            are still fully tax-exempt. Amazon&apos;s buildings are roughly half the county&apos;s
            taxable value and a third of everything it levies. On top of that, fee-in-lieu agreements
            send tens of millions to schools, housing, and emergency services (
            <Src id="eastOregonianLeaders" />, <Src id="bakerCityAbatement" />).
          </ForCard>
          <ForCard
            icon={<Factory className="w-5 h-5 text-[var(--color-fern)]" />}
            title="Real jobs, in places that had lost theirs"
          >
            Local officials credit data centers with {fmtNum(HEADLINE.regionalJobsFte)} full-time-equivalent
            jobs across Eastern Oregon and ${HEADLINE.easternOregonGdpB} billion in regional GDP (
            <Src id="eastOregonianLeaders" />). The deals require wages at least 130% of the county
            average (<Src id="bakerCityAbatement" />). Prineville — near 20% unemployment after the
            mills closed and Les Schwab left — now anchors its budget on Meta and Apple (
            <Src id="fortuneStudy" />).
          </ForCard>
          <ForCard
            icon={<MapPin className="w-5 h-5 text-[var(--color-fern)]" />}
            title="This is an industry Oregon actually wins"
          >
            Rural counties can&apos;t recruit chip fabs or biotech campuses. They can win data centers,
            because the raw ingredients — cheap hydro, cool dry air, fiber landings, open land — are
            already here (<Src id="cubWhyOregon" />). Washington, Idaho, and Arizona offer their own
            incentives; the choice isn&apos;t between a data center with breaks and one without, but
            between hosting the buildout or watching it cross the river.
          </ForCard>
          <ForCard
            icon={<Wheat className="w-5 h-5 text-[var(--color-fern)]" />}
            title="The honest counterfactual is a wheat field"
          >
            The abatements forgive taxes on buildings that otherwise wouldn&apos;t exist. Without the
            deal, the land is dryland farm ground generating a few thousand dollars a year. With it, a
            county of 12,000 people collects ${HEADLINE.awsMorrowTaxesM}M+ in taxes and ~$40M in
            15-year fees (<Src id="bakerCityAbatement" />). Since the 2026 POWER Act rules, big users
            also carry 100% of the grid costs they create — households&apos; bills went{" "}
            <em>down</em> (<Src id="oecGuardrails" />).
          </ForCard>
        </div>
      </Section>

      {/* ── The case against ── */}
      <Section
        id="case-against"
        eyebrow="The strongest case against"
        title="You paid for buildings that employ almost no one"
        lead={
          <>
            The opposition&apos;s case doesn&apos;t depend on hating tech. It depends on arithmetic:
            what Oregon gives up per job, who absorbs the cost, and what the buildings consume that
            never shows up on a tax ledger.
          </>
        }
        aside={<SubsidyPerJob />}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <AgainstCard
            icon={<CircleDollarSign className="w-5 h-5 text-[var(--color-clay)]" />}
            title="The jobs math doesn't survive contact"
          >
            A typical facility runs on ~30 permanent staff across millions of square feet, many in
            $35–50K security and maintenance roles (<Src id="ocppBoom" />). Oregon&apos;s own incentive
            study: the 15-year rural deals lose 84 cents per dollar forgone and cost ~$
            {fmtNum(HEADLINE.subsidyPerJobLongTerm)} per job — thirteen times the standard program (
            <Src id="governingStudy" />). One Hillsboro deal penciled out near $520,000 per employee
            per year (<Src id="ocppBoom" />).
          </AgainstCard>
          <AgainstCard
            icon={<GraduationCap className="w-5 h-5 text-[var(--color-clay)]" />}
            title="Every school in Oregon pays a little for each local deal"
          >
            The mechanic is subtler than &ldquo;the district loses money.&rdquo; Oregon equalizes
            school funding, so when an abatement cuts local revenue the state backfills that
            district, and the loss reappears as a thinner statewide pool, approximately $1.50 per
            weighted student for every $1M removed (<Src id="odeSchoolFunding" />). Hermiston&apos;s
            superintendent told the committee the enterprise-zone school fee is &ldquo;not additional
            support to the local district&rdquo; (<Src id="dcacIncentives" />). Districts took
            ${HEADLINE.schoolsLostM2024}M in abatements in 2024 alone (
            <Src id="capitalChronicleLawsuit" />) — spread across everyone, felt sharply by no one.
          </AgainstCard>
          <AgainstCard
            icon={<Scale className="w-5 h-5 text-[var(--color-clay)]" />}
            title="They were coming anyway — the neighbors prove it"
          >
            Oregon stacks four subsidies: no sales tax (Amazon saved roughly $3B on $39.3B of eastern
            Oregon investment), ~$450M/yr in property tax breaks, publicly funded infrastructure, and
            a 10-year income tax exemption that let Meta pay about 1.3% instead of 7.6%. The decisive
            fact Tax Fairness Oregon put before the committee:{" "}
            <strong>California and Washington offer no data-center property tax break at all</strong>{" "}
           , and still have data centers (<Src id="taxFairness" />). Even the governor concluded
            Oregon was underpricing itself (<Src id="klccCheapDate" />).
          </AgainstCard>
          <AgainstCard
            icon={<Leaf className="w-5 h-5 text-[var(--color-clay)]" />}
            title="The climate ledger is going backwards"
          >
            Umatilla Electric, {fmtNum(HEADLINE.uecCustomers)} customers, now emits {HEADLINE.uecEmissionsTonsM}{" "}
            million tons of CO₂ a year serving Amazon&apos;s buildout, making it Oregon&apos;s
            third-largest utility emitter; its power is 2,000% more carbon-intensive than a decade ago (
            <Src id="governingUec" />). Regional reports warn data-center gas demand could push Oregon
            and Washington off their 2050 climate targets (<Src id="capitalChronicleGas" />).
          </AgainstCard>
          <AgainstCard
            icon={<Droplets className="w-5 h-5 text-[var(--color-clay)]" />}
            title="The water story only came out in court"
          >
            Google&apos;s The Dalles campuses drank {HEADLINE.googleWaterGallonsM2021} million gallons
            in 2021 — over a quarter of the entire city&apos;s water, near 40% in recent reports — and
            the public only knows because the city lost a 13-month fight to keep it secret (
            <Src id="registerWater" />, <Src id="waterWatch" />). Statewide reporting requirements are
            still virtually nonexistent, even as the boom reaches basins already in a nitrate
            groundwater crisis (<Src id="rollingStoneWater" />).
          </AgainstCard>
          <AgainstCard
            icon={<Gavel className="w-5 h-5 text-[var(--color-clay)]" />}
            title="When the door was closing, they went around the public"
          >
            In the weeks before the moratorium took effect, companies filed a flurry of Hillsboro
            applications, six from one firm in a single April day, and staff approved them, the
            lawsuit alleges, without public notice or a vote of any elected body (
            <Src id="capitalChronicleLawsuit" />). Whatever you think of the deals, that&apos;s not how
            public money is supposed to move.
          </AgainstCard>
        </div>
      </Section>

      {/* ── Where they collide ── */}
      <Section
        id="evidence"
        tone="dark"
        eyebrow="Where the cases collide"
        title="Three findings that decide the argument"
        lead={
          <>
            Both sides are quoting real numbers. Put them side by side and the disagreement gets
            smaller, and more useful. The evidence points to three conclusions neither campaign
            leads with.
          </>
        }
        aside={<RateShift />}
      >
        <div className="space-y-5">
          <Finding n="01" title="Both jobs numbers are true, and that's the point">
            Amazon directly employs roughly {fmtNum(HEADLINE.amazonDirectJobs)} people in its eastern
            Oregon data centers; boosters&apos; {fmtNum(HEADLINE.regionalJobsFte)}-FTE figure adds
            construction, contractors, and ripple effects (<Src id="governingUec" />,{" "}
            <Src id="eastOregonianLeaders" />). A 2026 Georgia Tech study of the whole country splits
            the difference: metro counties gain ~4.1% employment after a data center opens; rural
            counties see &ldquo;negligible&rdquo; job spillover, but wages rise ~5% where clusters
            form, and electricity prices rise ~5% too (<Src id="fortuneStudy" />). Data centers are
            weak jobs programs everywhere. That was never their real value.
          </Finding>
          <Finding n="02" title="Geography flips the verdict">
            The same deal that&apos;s hard to defend in Hillsboro is easy to defend in Boardman. Morrow
            County traded taxes it could never have collected — the buildings wouldn&apos;t exist — for
            payments that now carry a third of its levy (<Src id="eastOregonianLeaders" />). Washington
            County traded real school revenue to companies drawn by fiber cables that were coming
            ashore regardless (<Src id="ocppBoom" />). The question was never &ldquo;data centers, yes
            or no&rdquo; — it&apos;s &ldquo;which county, at what price.&rdquo;
          </Finding>
          <Finding n="03" title="The POWER Act proved the win-win is buildable">
            For years the debate assumed someone had to lose: either block the industry or let
            households subsidize its grid. Then Oregon wrote the first law in the country making
            &gt;{HEADLINE.powerActThresholdMw} MW users a separate rate class, and the industry
            stayed, its bills went up ~30%, and household bills went <em>down</em> (
            <Src id="opbPowerAct" />, <Src id="tomsHardwareRates" />). Priced correctly, the
            arrangement survives. That&apos;s the template for every other term of the bargain.
          </Finding>
        </div>
      </Section>

      {/* ── The win-win test ── */}
      <Section
        id="test"
        tone="warm"
        eyebrow="Our honest read"
        title="The win-win test: six conditions, and where Oregon stands"
        lead={
          <>
            A data center deal is a genuine win-win when the host community keeps more than it gives
            up — on taxes, power, water, and trust. That&apos;s testable. Here&apos;s the test, applied
            to Oregon as of August 2026.
          </>
        }
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              Score today: <strong>1 met, 1 partial, 4 unmet</strong>. The met one, grid costs, was
              considered impossible until 2025. None of the unmet four requires banning anything;
              they require pricing, disclosure, and process. Scoring updated after reading the
              committee&apos;s own record.
            </p>
          </div>
        }
      >
        <ConditionsScorecard />

        <div className="mt-8 rounded-sm border-2 border-[var(--color-canopy)]/20 bg-white p-7">
          <div className="flex items-center gap-2.5 mb-3">
            <Server className="w-5 h-5 text-[var(--color-ember)]" />
            <h3 className="font-editorial-normal text-[20px] text-[var(--color-canopy)]">
              So which way does it lean?
            </h3>
          </div>
          <div className="space-y-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
            <p>
              <strong className="text-[var(--color-ink)]">
                As signed before 2026, the bargain leaned toward the companies.
              </strong>{" "}
              That&apos;s not an activist&apos;s claim; it&apos;s the state&apos;s own math. The
              15-year vehicle that built the boom loses 84 cents on the dollar, the buildings employ
              dozens where the renderings implied thousands, and the costs that never hit a ledger —
              carbon, water, school revenue — piled up in the dark.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">
                But &ldquo;bad deal&rdquo; is not the honest verdict either.
              </strong>{" "}
              In Morrow County, the alternative to an under-priced deal was no deal: the fees and taxes
              are real, they reshape what a small county can afford, and they are bigger than anything else
              that region could plausibly have recruited. And the POWER Act showed the terms are negotiable — Oregon raised the
              industry&apos;s power bill 30% and the industry kept building.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">
                The win-win exists, under conditions Oregon has only started to enforce.
              </strong>{" "}
              Full-cost power pricing (done), clean-energy additionality everywhere including co-op
              territory (half done), water disclosure with caps in stressed basins (not done),
              abatements repriced toward fee-in-lieu deals that hold schools harmless (not done), and
              approvals in public (not done). If the 2027 Legislature converts the current pause into
              those terms, Oregon keeps the industry <em>and</em> the returns. If the moratorium simply
              lapses, the pre-2026 pattern — private gain, socialized cost, discovered later — comes
              back with the AI boom behind it.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Pricing a deal ── */}
      <Section
        id="price"
        eyebrow="The framework"
        title="How to price a data center deal"
        lead={
          <>
            The whole fight reduces to three numbers: what the site would pay fully taxed, what the
            deal actually pays, and how likely the company was to build without a break. Get those
            three, and &ldquo;good deal or giveaway&rdquo; stops being a matter of opinion.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            The model prices the deal from the host community&apos;s side. It deliberately excludes
            construction activity (temporary, and present in every scenario where the facility is
            built) and assumes bare land yields ~no revenue — both stated in the fine print, both
            adjustable in spirit by moving the sliders.
          </p>
        }
      >
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <StepCard n="01" title="What the site pays fully taxed">
            Taxable value ≈ 70% of on-site investment — servers are most of the value and
            depreciate fast, but they&apos;re refreshed continuously — times the county&apos;s rate,
            over 15 years, discounted. A $2B campus at 1.1%: about $15M a year, or{" "}
            <strong>$171M in present value</strong>.
          </StepCard>
          <StepCard n="02" title="What the deal actually pays">
            Fees in lieu of taxes during the abatement, full taxes after it ends, plus state income
            tax from the permanent jobs. A Morrow-style deal — ~$2.7M/yr in fees, 100 jobs — pays
            about <strong>$37M in present value</strong>: roughly a fifth of full freight.
          </StepCard>
          <StepCard n="03" title="The break-even leverage">
            Divide №2 by №1 (plus income taxes on both sides): the deal beats holding firm only if
            the chance they&apos;d build <em>anyway</em> is below that ratio. The Morrow-style deal
            breaks even at <strong>~21%</strong>; a Hillsboro-style deal at <strong>~64%</strong>, and the fiber cables put Hillsboro&apos;s true leverage well above that.
          </StepCard>
        </div>

        <DealCalculator />

        <p className="mt-4 text-[13px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
          This is the policy insight hiding in the arithmetic: <strong>the right abatement is not a
          number, it&apos;s a curve.</strong> The scarcer a community&apos;s advantages, the more it
          can afford to give; the more unique its advantages, the less it should. A statewide flat
          program, which is what the enterprise-zone system was, prices Boardman and Hillsboro
          identically, and therefore misprices both. Benchmarks for the cost-per-job readout come
          from the state incentive study (<Src id="governingStudy" />).
        </p>

        <div className="mt-6 rounded-sm border-2 border-[var(--color-canopy)]/20 bg-white p-6">
          <h4 className="text-[15px] font-semibold text-[var(--color-canopy)] mb-2">
            Oregon already ran this calculation, and published the answer
          </h4>
          <p className="text-[13.5px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
            In June 2026, Business Oregon handed the advisory committee its own return figures by
            program. The short-term standard enterprise zone returns{" "}
            <strong className="text-[var(--color-fern)]">{HEADLINE.roiStandard}</strong> per dollar.
            The Strategic Investment Program returns{" "}
            <strong className="text-[var(--color-ink)]">{HEADLINE.roiSip}</strong>. The 15-year rural
            enterprise zone, which carries <strong>$15.4B of the $15.8B</strong> in data-center
            investment and <strong>$233.6M of the $240.9M</strong> in abated taxes — returns{" "}
            <strong className="text-[var(--color-clay)]">{HEADLINE.roiLongTerm}</strong> (
            <Src id="businessOregonRoi" />). The state&apos;s economic development agency is not
            disputing the critics&apos; arithmetic. It supplied it.
          </p>
          <p className="mt-3 text-[13.5px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
            Morrow County&apos;s assessor put the same point in county terms: ${HEADLINE.morrowExemptTaxM}M
            of property tax exempted against ${HEADLINE.morrowCollectedTaxM}M actually collected
            countywide, with ${HEADLINE.morrowFeesM}M coming back as negotiated fees (
            <Src id="morrowAssessor" />). The fees change what a county of 12,000 can pay for, and the exemption is larger than the entire tax base.
          </p>
        </div>

        <div className="mt-6 rounded-sm border border-[var(--color-parchment)] bg-white p-6">
          <h4 className="text-[15px] font-semibold text-[var(--color-canopy)] mb-2">
            What a fully priced framework looks like — Minnesota, presented to Oregon in May
          </h4>
          <p className="text-[13.5px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
            Oregon&apos;s POWER Act allocates cost. Minnesota&apos;s 2025 bipartisan package,
            presented to this committee by its Department of Commerce, also directs what gets built:
            utilities must show a new data center won&apos;t raise other customers&apos; rates{" "}
            <em>or</em> impede the state&apos;s 100%-clean-by-2040 standard; 15-year agreements run
            at 80% take-or-pay with upfront collateral and exit fees; a large-user fee funds
            low-income weatherization; rules reach down to 5 MW so projects can&apos;t shrink under
            the threshold; and the electricity sales-tax exemption was repealed. Google — testifying
            as the customer — called Oregon&apos;s law a missed opportunity by comparison (
            <Src id="dcacIncentives" />).
          </p>
          <p className="mt-3 text-[13.5px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl">
            The transferable lesson for pricing: Minnesota converts every soft condition into a
            contract term with a number attached. That is what makes a deal checkable rather than
            promised, and it is why the same approach works for water disclosure and abatement
            length, not just electricity.
          </p>
        </div>

        <div className="mt-10">
          <h3 className="font-editorial-normal text-[22px] text-[var(--color-canopy)] mb-2">
            The same math, on a map
          </h3>
          <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed max-w-3xl mb-5">
            Run the framework across Oregon&apos;s regions and a siting policy falls out: where
            deals can pencil, where they can&apos;t, and where the answer isn&apos;t price at all.
            The state has started acting on the same logic — in July 2026 the Governor pulled 32
            state-owned acres in Salem from a proposed data center (<Src id="salemWithdrawal" />).
          </p>
          <SitingMap />
        </div>
      </Section>

      {/* ── The committee ── */}
      <Section
        id="committee"
        tone="dark"
        eyebrow="Who writes the rulebook"
        title="The seven people drafting Oregon's answer"
        lead={
          <>
            Everything above — pricing, siting, water, power — lands on one desk: the Data Center
            Advisory Committee Gov. Kotek convened in January 2026. Its recommendations, due by{" "}
            {COMMITTEE.reportDue}, are the blueprint the 2027 Legislature will work from.
          </>
        }
        aside={
          <p className="text-[12px] text-white/55 leading-relaxed">
            Charge, membership, and schedule from the Governor&apos;s announcement (
            <Src id="govCommittee" />) and the Oregon Dept. of Energy&apos;s committee page (
            <Src id="advisoryCommittee" />), where agendas, recordings, and materials are posted.
          </p>
        }
      >
        <div className="rounded-sm bg-[var(--color-paper)] p-5 sm:p-6 -m-1">
          <CommitteeDetail />
        </div>
      </Section>

      {/* ── What the record shows ── */}
      <Section
        id="record"
        eyebrow="Inside the record"
        title="Thirteen things the committee's own documents establish"
        lead={
          <>
            We downloaded all {DCAC_DOC_COUNT} documents and recordings the committee has posted —
            agency decks, industry slides, tribal testimony, and the facilitators&apos; summaries of
            what was actually said in the room. The most useful findings aren&apos;t the contested
            ones. They&apos;re the numbers the state produced about itself.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            Everything below is attributed to a specific presentation, all of them linked at the
            bottom of this section. Where presenters disagree, both figures are kept — that
            disagreement is usually the most informative part.
          </p>
        }
      >
        <RecordFindings />
      </Section>

      {/* ── Who showed up ── */}
      <Section
        id="voices"
        tone="warm"
        eyebrow="Who showed up"
        title="Every camp that testified, and its hardest number"
        lead={
          <>
            Seven months of hearings drew agencies, tribes, utilities, unions, county assessors, the
            companies themselves, and the advocates suing them. Laid out by camp, the coalition
            structure explains the politics better than any single argument does.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            Notice who is missing from the committee itself: no tribal member, no utility, no
            operator, no ratepayer advocate. Those groups got a presenter&apos;s slot, not a seat at
            the table where the report gets written.
          </p>
        }
      >
        <WhoShowedUp />
      </Section>

      {/* ── Why it's unfolding this way ── */}
      <Section
        id="why"
        tone="darker"
        eyebrow="The incentives behind the incentives"
        title="Why the debate is shaped the way it is"
        lead={
          <>
            Read the record and the alignments stop looking like opinions. They look like positions
            people hold because of where they sit. Eight structural features of this process explain
            most of what gets said, and what never comes up.
          </>
        }
      >
        <StructuralFactors />
        <div className="mt-6 rounded-sm border border-white/12 bg-white/[0.05] p-6 backdrop-blur">
          <p className="text-[13.5px] text-white/75 leading-relaxed max-w-3xl">
            Put together, these push toward one destination. A moratorium has no constituency —
            labor opposed it and the major land-use groups never asked for it. Abolition has no path
            — the money is already committed and out of scope. What&apos;s left is repricing and
            conditioning, which is exactly what the facilitator recorded in June:{" "}
            <strong className="text-white">
              the committee agreed incentives need to be reviewed and modernized
            </strong>{" "}
            (<Src id="dcacIncentives" />). The fight in 2027 will not be over whether to change the
            deal. It will be over how much, and who gets to decide — the state, or 36 counties
            negotiating one at a time.
          </p>
        </div>
      </Section>

      {/* ── Document library ── */}
      <Section
        id="library"
        eyebrow="The primary record"
        title="Every document, linked"
        lead={
          <>
            The committee posts everything: agendas, presenter slides, facilitator summaries, and
            full meeting recordings. This is the complete index as of August 2026 — the raw material
            for anyone who wants to check our reading against the source.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            Hosted by the Oregon Department of Energy (<Src id="advisoryCommittee" />). Written
            comment goes to{" "}
            <span className="font-mono text-[11px] text-[var(--color-ink)]">{COMMITTEE.email}</span>.
          </p>
        }
      >
        <DocumentLibrary />
      </Section>

      {/* ── What happens next ── */}
      <Section
        id="next"
        eyebrow="The decision points"
        title="What happens next"
        lead="The moratorium didn't settle the fight — it scheduled it. Beyond the committee's report, three places to watch."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {WHATS_NEXT.map((e) => (
            <div key={e.what} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[var(--color-ember)]" />
                <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--color-ember)]">
                  {e.when}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{e.what}</h3>
              <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed mt-1">{e.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-[var(--color-ink-light)] leading-relaxed max-w-2xl">
          And if you live near a proposed site: the enterprise-zone sponsor, your city or county, is where the next deal actually gets decided. The committee section above has the dates
          and the comment address.
        </p>
      </Section>

      {/* ── Sources ── */}
      <Section
        id="sources"
        tone="warm"
        eyebrow="Sources & method"
        title="Where these numbers come from"
        lead="Every figure links to a public document, a named study, or on-the-record reporting, pulled in August 2026. Both cases were built from what each side's strongest advocates actually cite, and the committee sections come from reading all 77 documents and recordings it has published, indexed in full above."
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-[var(--color-ember)]" />
              <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">A live story</h3>
            </div>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              The advisory committee reports in {HEADLINE.committeeReportDue}, the Hillsboro lawsuit is
              in early stages, and Pacific Power&apos;s rate case is pending. Time-sensitive figures
              should be re-checked after each.
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

function ForCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border-2 border-[var(--color-fern)]/30 bg-[#f1f7f3] p-6">
      <div className="flex items-center gap-2.5 mb-2.5">
        {icon}
        <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] leading-snug">{title}</h3>
      </div>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
    </div>
  );
}

function AgainstCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border-2 border-[var(--color-clay)]/30 bg-[#fbf4f0] p-6">
      <div className="flex items-center gap-2.5 mb-2.5">
        {icon}
        <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] leading-snug">{title}</h3>
      </div>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
    </div>
  );
}

function StepCard({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[20px] font-bold text-[var(--color-parchment)] leading-none">
          {n}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--color-canopy)] mb-1.5 leading-snug">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
    </div>
  );
}

function Finding({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-white/12 bg-white/[0.05] p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[20px] font-bold text-[var(--color-ember-bright)]/60 leading-none">
          {n}
        </span>
        <h3 className="text-[16px] font-semibold text-white leading-snug">{title}</h3>
      </div>
      <p className="text-[13px] text-white/70 leading-relaxed">{children}</p>
    </div>
  );
}
