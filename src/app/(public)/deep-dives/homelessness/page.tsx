import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Wrench } from "lucide-react";
import { SOURCES, STATS } from "@/lib/homeless/data";
import { fmtMoney, fmtNum } from "@/lib/homeless/engine";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";
import FlowHero from "@/components/deep-dives/homeless/FlowHero";
import FlowSimulator from "@/components/deep-dives/homeless/FlowSimulator";
import CostOfInactionCalculator from "@/components/deep-dives/homeless/CostOfInactionCalculator";
import TriageTool from "@/components/deep-dives/homeless/TriageTool";
import BedReality from "@/components/deep-dives/homeless/BedReality";
import StreetTriageFlow from "@/components/deep-dives/homeless/StreetTriageFlow";
import DeflectionReality from "@/components/deep-dives/homeless/DeflectionReality";
import ContinuumTldr from "@/components/deep-dives/homeless/ContinuumTldr";
import CohortLadder from "@/components/deep-dives/homeless/CohortLadder";
import PlanTimeline from "@/components/deep-dives/homeless/PlanTimeline";
import MythsLedger from "@/components/deep-dives/homeless/MythsLedger";
import WhoPays from "@/components/deep-dives/homeless/WhoPays";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Why Portland Can't End Homelessness — The Flow, the Beds, and the Plan",
  description:
    "Portland spends more than ever and homelessness keeps growing. The inflow/outflow math, who is actually on the street, the deflection funnel, the beds nobody can see, and a plan sequenced by speed. Every number sourced.",
  path: "/deep-dives/homelessness",
  type: "article",
});

const NAV = [
  { id: "flow", label: "01 The math" },
  { id: "triage", label: "02 First contact" },
  { id: "who", label: "03 Who" },
  { id: "cohorts", label: "04 Cohorts" },
  { id: "cost", label: "05 Cost of nothing" },
  { id: "deflection", label: "06 Deflection" },
  { id: "beds", label: "07 The beds" },
  { id: "continuum", label: "08 The continuum" },
  { id: "works", label: "09 The plan" },
  { id: "myths", label: "10 Objections" },
  { id: "sources", label: "Sources" },
];

function Src({ id, label }: { id: keyof typeof SOURCES; label?: string }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
    >
      {label ?? s.org}
    </a>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{children}</p>;
}

export default function HomelessnessDeepDive() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--color-canopy)] text-white noise-overlay">
        <div className="pointer-events-none absolute right-0 top-0 h-[760px] w-[760px] -translate-y-1/3 translate-x-1/4 rounded-full bg-[var(--color-canopy-light)] opacity-25 blur-[190px]" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-24`}>
          <div className="grid items-center gap-10 xl:grid-cols-12 xl:gap-16">
            <div className="xl:col-span-7">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                <Link href="/deep-dives" className="transition-colors hover:text-[var(--color-ember-bright)]">Policy Deep-Dive</Link>
                <div className="h-px w-8 bg-[var(--color-ember)]/50" />
                <span>Homelessness</span>
              </div>
              <h1 className="mt-6 max-w-4xl font-editorial-normal text-[40px] leading-[1.04] tracking-tight sm:text-[56px] lg:text-[66px]">
                Why Portland can&apos;t end homelessness
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  It&apos;s a flow problem, and the system can&apos;t see itself.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">
                More people fall into homelessness each month than climb out. A worker with a willing
                person can&apos;t see an open bed. And too many exits from jail, hospital, and treatment
                lead back to the sidewalk. None of it is a mystery. All of it is fixable, in order.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#flow" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
                  Run the numbers <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#works" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                  Skip to the plan
                </a>
              </div>
            </div>
            <div className="xl:col-span-5">
              <FlowHero />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat band ── */}
      <section className="border-t border-white/10 bg-[var(--color-canopy-mid)] text-white">
        <div className={`${DIVE_CONTAINER} grid grid-cols-2 gap-6 py-9 lg:grid-cols-4`}>
          {[
            { v: `~${fmtNum(STATS.byNameTotal)}`, l: "on the county's by-name list", s: `up from ${fmtNum(STATS.byNameTotalJan2025)} a year earlier` },
            { v: `+${STATS.pitChange2023to2025Pct * 100 | 0}%`, l: "tri-county one-night count, 2023 → 2025", s: `${fmtNum(STATS.pitTotal)} counted in one night` },
            { v: fmtMoney(STATS.shsRaisedSince2021), l: "raised by the homeless-services tax", s: "region-wide since 2021" },
            { v: fmtNum(STATS.deaths2024), l: "died homeless in 2024", s: `most from overdose · average age ${STATS.avgAgeAtDeath}` },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-mono text-[30px] font-bold leading-none tabular-nums text-[var(--color-ember-bright)] sm:text-[36px]">{s.v}</p>
              <p className="mt-2 text-[13px] font-semibold leading-snug">{s.l}</p>
              <p className="mt-0.5 text-[12px] text-white/55">{s.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/95 backdrop-blur">
        <div className={`relative ${DIVE_CONTAINER}`}>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em]">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-3 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-canopy)]">
                {n.label}
              </a>
            ))}
          </div>
          <ReadingProgress />
        </div>
      </nav>

      {/* ── 01 The math ── */}
      <Section
        layout="stacked"
        id="flow"
        eyebrow="01 · The one insight"
        title="It's a flow problem, not a stock problem"
        lead={
          <>
            Homelessness behaves like unemployment: a total that rises and falls with two flows
            underneath. About <strong>{fmtNum(STATS.monthlyInflow)}</strong> people join Multnomah
            County&apos;s list each month and <strong>{fmtNum(STATS.monthlyOutflow)}</strong> leave it
            (<Src id="byNameRelease" />). The gap is why it grows. Close the gap and growth stops before
            you build anything.
          </>
        }
      >
        <FlowSimulator />
        <details className="group mt-3 max-w-3xl">
          <summary className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)]">
            Assumptions and unit costs
          </summary>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            A simplified stocks-and-flows model with visible, contestable assumptions: 25% of inflow is
            eviction-driven and 15% is institutional discharge; a staffed treatment bed serves four
            people a year and 35% of stays exit homelessness durably; leased units come online over
            twelve months. Net flow varies month to month; the +{STATS.netMonthly} figure is January
            2025 (<Src id="byNameRelease" />). Unit costs: eviction prevention ~$2,500 per household
            (<Src id="naehTriageCost" />), shelter and master-leasing from the county&apos;s own studies
            (<Src id="shelterReview" />, <Src id="masterLeaseNofa" />), staffed treatment ~$55k per bed
            per year (<Src id="treatmentCost" />).
          </p>
        </details>
      </Section>

      {/* ── 02 First contact ── */}
      <Section
        layout="stacked"
        id="triage"
        tone="warm"
        eyebrow="02 · First contact"
        title="Three doors, and the third one is phone calls"
        lead="Is there a crime? Is there a mental-health hold? If neither, the only tool is a voluntary offer, and that is the branch where Portland loses the moment. The person says yes now; the system answers later."
      >
        <StreetTriageFlow />
      </Section>

      {/* ── 03 Who ── */}
      <Section
        layout="stacked"
        id="who"
        eyebrow="03 · Who is on the street"
        title="Three different problems wearing one coat"
        lead="The loudest myth is that everyone outside is the same. The evidence says three populations, three fixes, and most of the wasted money comes from matching the wrong fix to the wrong person."
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-4">
            <p className="font-mono text-[26px] font-bold leading-none tabular-nums text-[var(--color-clay)]">{fmtNum(STATS.deaths2024)}</p>
            <p className="mt-1.5 text-[13px] font-semibold text-[var(--color-ink)]">died homeless in Multnomah County in 2024</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
              {fmtNum(STATS.overdoseDeaths2024)} by overdose, {fmtNum(STATS.fentanylDeaths2024)} involving fentanyl. The first year-over-year decline since 2013 (<Src id="domicile" />).
            </p>
          </div>
        }
      >
        <TriageTool />
        <Note>
          The transitional / episodic / chronic typology is Kuhn &amp; Culhane (1998). Per-household costs are national averages (<Src id="naehTriageCost" />); the chronic share is Multnomah&apos;s 2023 count (<Src id="pit2023" />).
        </Note>
      </Section>

      {/* ── 04 Cohorts ── */}
      <Section
        layout="stacked"
        id="cohorts"
        tone="warm"
        eyebrow="04 · Twelve cohorts"
        title="The first placement has to match the person"
        lead="A real offer is not a generic shelter referral. A family, a survivor, someone in withdrawal, and someone leaving jail each need a different first door, on a different clock. Housing First is one of those doors, not all of them."
      >
        <CohortLadder />
      </Section>

      {/* ── 05 Cost of nothing ── */}
      <Section
        layout="stacked"
        id="cost"
        eyebrow="05 · The cost of doing nothing, and who holds it"
        title="The status quo isn't free, just hidden. And the saving lands on the wrong desk."
        lead="Fixes look expensive against a baseline of zero. The street isn't zero: it's ER visits, jail nights, ambulance runs, and cleanup, spread across a dozen budgets. Most of the saving from housing someone goes to Medicaid and the health plan, not City Hall. That is not a reason to shrug. It is the map of who to send the bill to."
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Street-cost figure is a central estimate; studies range from ~$35k a year (<Src id="naehCost" />) to far higher for the costliest individuals. Match rates: <Src id="kffFmap" />. Payer mechanics: <Src id="shareGuidance" />, <Src id="ohaHousingMedicaid" />. The full analysis is in the Civic Lab research memo &ldquo;Who Pays for the Street.&rdquo;
          </p>
        }
      >
        <CostOfInactionCalculator />
        <div className="mt-8">
          <WhoPays />
        </div>
        <Note>
          What this does not do: it does not make jail, EMS, or cleanup cheaper unless capacity is actually decommissioned, and it does not fund a building on its own. Those stay local and state costs, and the honest case for them is the 372 deaths and the $1.3B already raised, not payback.
        </Note>
      </Section>

      {/* ── 06 Deflection ── */}
      <Section
        layout="stacked"
        id="deflection"
        tone="warm"
        eyebrow="06 · Deflection vs. treatment"
        title="A referral is not a treatment bed"
        lead={
          <>
            Eligible drug-possession cases go to the Coordinated Care Pathway Center at 980 SE Pine instead of a citation (<Src id="deflectionProgram" />). Better than nothing. But follow the numbers down the funnel and count what &ldquo;success&rdquo; actually contained (<Src id="deflectionQ3" />).
          </>
        }
      >
        <DeflectionReality />
        <Note>
          The FY25 annual report used a broader completion definition that could include accessing any one recommended service (<Src id="deflectionAnnual" />). The definition changed in January 2026, so quarters are not comparable across that line.
        </Note>
      </Section>

      {/* ── 07 The beds ── */}
      <Section
        layout="stacked"
        id="beds"
        eyebrow="07 · The deepest problem"
        title="Nobody can see the beds"
        lead={
          <>
            Oregon is short about <strong>{fmtNum(STATS.treatmentBedGap)} treatment beds</strong> (<Src id="pcgBeds" />). It also can&apos;t say how many of the beds it has are open tonight. A multi-million-dollar registry produced a handful of placements (<Src id="obcc" />), because a database is not a coordination system.
          </>
        }
      >
        <BedReality />
        <a
          href="https://www.pdxhelp.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 block rounded-sm bg-[var(--color-canopy)] p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(15,36,25,0.18)] sm:p-6"
        >
          <div className="grid items-center gap-x-5 gap-y-3 sm:grid-cols-[auto_1fr_auto]">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-[var(--color-ember-bright)]"><Wrench className="h-5 w-5" /></div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">We&apos;re building the fix</div>
              <h3 className="mt-1 font-editorial-normal text-[21px] leading-tight sm:text-[23px]">PDX Help, a working prototype</h3>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-white/70">
                Matches a specific person to the beds they are eligible for, with facilities reporting real openings. The coordination layer Oregon doesn&apos;t have, built to prove it can exist.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ember-bright)]">
              Try it <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </a>
      </Section>

      {/* ── 08 Continuum ── */}
      <Section
        layout="stacked"
        id="continuum"
        tone="warm"
        eyebrow="08 · The continuum"
        title="Pick a person. See every step from the sidewalk to a lease."
        lead={
          <>
            The region cannot say how many people are at each stage between the street and a lease, or whether they are moving. So we built the continuum: fourteen stages, twelve kinds of people, each with an evidence-backed order through them. Pick one below; the stages they pass through light up in order, and the amber circle is the first door that has to exist. The full page defines every stage, gives responders six questions to pick that door, and shows how to count who is where.
          </>
        }
      >
        <ContinuumTldr />
      </Section>

      {/* ── 09 The plan ── */}
      <Section
        layout="stacked"
        id="works"
        eyebrow="09 · What would actually work"
        title="Five moves, in order of speed"
        lead="Cheapest and fastest first. The plan that survives a hostile hearing is the one that stops growth in weeks, fixes visibility in months, and builds the ladder over years, without pretending any step substitutes for the others."
      >
        <PlanTimeline />
      </Section>

      {/* ── 10 Objections ── */}
      <Section
        layout="stacked"
        id="myths"
        tone="warm"
        eyebrow="10 · The objections"
        title="The ones that survive a hostile hearing"
        lead="An honest broker holds the strongest version of every objection. These five come up at every council meeting."
      >
        <MythsLedger />
        <Note>
          Retention and the entry-vs-rules distinction: <Src id="housingFirstNaeh" />. The aggregate-vs-individual critique: <Src id="manhattanHF" />.
        </Note>
      </Section>

      {/* ── Sources ── */}
      <Section
        layout="stacked"
        id="sources"
        eyebrow="Sources & method"
        title="Where these numbers come from"
        lead="Headline figures are read from primary sources and were re-checked in June 2026. The flow model is a teaching tool with visible assumptions. Where a popular figure didn't hold up (a $500M+ unspent balance, a flat $50k per person), it was corrected, not repeated."
      >
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 2xl:grid-cols-3">
          {Object.values(SOURCES).map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="group -m-2 flex items-start gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-[var(--color-parchment)] hover:bg-white">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-fern)]" />
              <span>
                <span className="block text-[13px] leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-canopy)]">{s.title}</span>
                <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">{s.org} · {s.kind}</span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
