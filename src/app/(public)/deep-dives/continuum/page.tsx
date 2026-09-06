import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";
import { CONTINUUM, PRINCIPLES, SCORECARD } from "@/lib/homeless/continuum";
import { STATS } from "@/lib/homeless/data";
import { fmtNum } from "@/lib/homeless/engine";
import PathwayExplorer from "@/components/deep-dives/homeless/PathwayExplorer";
import StageExplorer from "@/components/deep-dives/homeless/StageExplorer";
import LeakChart from "@/components/deep-dives/homeless/LeakChart";
import SystemBalance from "@/components/deep-dives/homeless/SystemBalance";
import TriageStepper from "@/components/deep-dives/homeless/TriageStepper";
import DoorsOpen from "@/components/deep-dives/homeless/DoorsOpen";
import WhenNo from "@/components/deep-dives/homeless/WhenNo";
import LanesVisual from "@/components/deep-dives/homeless/LanesVisual";
import HousingFirstBoard from "@/components/deep-dives/homeless/HousingFirstBoard";
import CountLedger from "@/components/deep-dives/homeless/CountLedger";
import HeadlineMetrics from "@/components/deep-dives/homeless/HeadlineMetrics";
import PublishesMatrix from "@/components/deep-dives/homeless/PublishesMatrix";
import CostChart from "@/components/deep-dives/homeless/CostChart";
import FailureLadder from "@/components/deep-dives/homeless/FailureLadder";
import CaveatsAccordion from "@/components/deep-dives/homeless/CaveatsAccordion";
import FrontLine from "@/components/deep-dives/homeless/FrontLine";
import SourcesList from "@/components/deep-dives/homeless/SourcesList";

export const metadata: Metadata = pageMeta({
  title: "The Continuum — Every Step From Sidewalk to Lease, Defined and Counted",
  description:
    "Fourteen stages, twelve pathways, one first-door protocol for outreach, police, EMS, hospitals, and jails. What&apos;s open at 2 a.m. and when it doesn't, how to count each bucket, and where Portland's gaps are. Every claim sourced and adversarially checked.",
  path: "/deep-dives/continuum",
  type: "article",
});

const NAV = [
  { id: "pathways", label: "01 People" },
  { id: "stages", label: "02 Stages" },
  { id: "breaks", label: "03 Where it breaks" },
  { id: "tonight", label: "04 Tonight" },
  { id: "saying-no", label: "05 Saying no" },
  { id: "lanes", label: "06 Housing First" },
  { id: "count", label: "07 Counting" },
  { id: "money", label: "08 Money" },
  { id: "risks", label: "09 Risks" },
  { id: "sources", label: "Sources" },
];

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{children}</p>;
}

export default function ContinuumPage() {
  const unknown = CONTINUUM.filter((s) => s.count.status === "unknown").length;
  const partial = CONTINUUM.filter((s) => s.count.status === "partial").length;
  const misses = SCORECARD.items.filter((i) => !i.met).length;

  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--color-canopy)] text-white noise-overlay">
        <div className="pointer-events-none absolute right-0 top-0 h-[760px] w-[760px] -translate-y-1/3 translate-x-1/4 rounded-full bg-[var(--color-canopy-light)] opacity-25 blur-[190px]" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-24`}>
          <div className="grid items-end gap-10 xl:grid-cols-12 xl:gap-16">
            <div className="xl:col-span-7">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                <Link href="/deep-dives" className="transition-colors hover:text-[var(--color-ember-bright)]">Policy Deep-Dive</Link>
                <div className="h-px w-8 bg-[var(--color-ember)]/50" />
                <Link href="/deep-dives/homelessness" className="transition-colors hover:text-[var(--color-ember-bright)]">Homelessness</Link>
                <div className="h-px w-8 bg-[var(--color-ember)]/50" />
                <span>The continuum</span>
              </div>
              <h1 className="mt-6 max-w-4xl font-editorial-normal text-[40px] leading-[1.04] tracking-tight sm:text-[56px] lg:text-[64px]">
                Every step from the sidewalk to a lease
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">defined once, so no one falls through.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">
                Fourteen stages. Twelve kinds of people, each with an evidence-backed path. Six questions any
                responder can answer at 2 a.m. A rule for when Housing First works and when something has to come
                first. And a way to count who is where without a form nobody fills in.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#pathways" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
                  Pick a person <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#tonight" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                  What&apos;s open at 2 a.m.
                </a>
              </div>
            </div>
            <div className="xl:col-span-5">
              <div className="rounded-sm border border-white/12 bg-white/[0.05] p-5 backdrop-blur sm:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">The four rules</p>
                <ol className="mt-4 space-y-3.5">
                  {PRINCIPLES.map((p, i) => (
                    <li key={p.rule} className="flex gap-3">
                      <span className="font-mono text-[13px] font-bold text-[var(--color-ember-bright)]">{i + 1}</span>
                      <div>
                        <p className="text-[14px] font-semibold leading-snug text-white">{p.rule}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-white/65">{p.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat band ── */}
      <section className="border-t border-white/10 bg-[var(--color-canopy-mid)] text-white">
        <div className={`${DIVE_CONTAINER} grid grid-cols-2 gap-6 py-9 lg:grid-cols-4`}>
          {[
            { v: String(CONTINUUM.length), l: "stages from sidewalk to lease", s: `${partial} partly counted today, ${unknown} not counted at all, none fully` },
            { v: `${SCORECARD.score}/${SCORECARD.of}`, l: "the county's own by-name-list score", s: `${misses} unmet conditions, all about knowing who is where` },
            { v: "54%", l: "of shelter exits go nowhere anyone recorded", s: "2,800 of 5,213 exits in FY2025" },
            { v: fmtNum(STATS.deaths2024), l: "died homeless in 2024", s: "the number the highest-acuity lane is judged on" },
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

      {/* 01 · Pick a person */}
      <Section
        layout="stacked"
        id="pathways"
        eyebrow="01 · Start here"
        title="Pick a person. See their path."
        lead="Everyone the system meets is one of twelve kinds of people, and each kind has an evidence-backed order of stages from the street to a lease. Pick one. The stages light up in order; the amber circle is the first door that has to exist for them."
      >
        <PathwayExplorer />
      </Section>

      {/* 02 · Pick a stage */}
      <Section
        layout="stacked"
        id="stages"
        tone="warm"
        eyebrow="02 · The fourteen stages"
        title="Pick a stage. See everything about it."
        lead="A stage is a place a person can physically be, defined by a number a worker can take this week. Six phases, fourteen stages, in order. Click any one: what it is, when it works and how it fails, who does what there (and what police do not), who answers for it and what it costs, and Portland's number today with the gap behind it."
      >
        <StageExplorer />
        <Note>Stage definitions were drafted three ways, judged, synthesized, challenged claim by claim against primary documents, then read by seven front-line, clinical, and legal reviewers. The dot on each card says whether anyone in Portland can count who is in that stage right now: none fully, ten partly, four not at all.</Note>
      </Section>

      {/* 03 · Where it breaks */}
      <Section
        layout="stacked"
        id="breaks"
        eyebrow="03 · Where it breaks today"
        title="How many people are in each stage, and what is there for them"
        lead="First the snapshot a responder would want at 2 a.m. Then, stage by stage, how many people are in it (counted, our estimate with the arithmetic, or unknown), how much support exists there in the unit that matters, and the coverage that implies. Below that, what goes into each transition and what comes through. Where nobody can say, the board says so, because that is where the system breaks first."
      >
        <SystemBalance />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">And at the transitions: what goes in, what comes through</p>
          <LeakChart />
        </div>
      </Section>

      {/* 04 · Tonight */}
      <Section
        layout="stacked"
        id="tonight"
        tone="warm"
        eyebrow="04 · Tonight, at the scene"
        title="Six questions in order, then the doors that are actually open"
        lead="Any responder can answer these from what they can see or ask, in order: safety, then stabilization, then population, then history. Each yes names the first door and what that door really is in Portland tonight. Below the questions, every door on a 24-hour clock, because most of the system is a daytime system and the hardest hour is 2 a.m."
      >
        <TriageStepper />
        <div className="mt-6">
          <DoorsOpen />
        </div>
        <Note>Door rules and hours are from the county sobering page and EMS protocols, Unity, Central City Concern, Janus, Call to Safety, 211, and the city, as read by a paramedic, a patrol officer, an outreach worker, and a hospital social worker in the review. Hours change; the stage explorer above and the memo carry the sources.</Note>
      </Section>

      {/* 05 · Saying no */}
      <Section
        layout="stacked"
        id="saying-no"
        eyebrow="05 · When someone says no"
        title="A no is information. Find out what kind."
        lead="Most people who refuse are refusing a specific offer, or are not in a state to accept any offer tonight. The law draws two lines, danger to self or others and incapacitation in public, and below them nobody can make anyone go anywhere. So a no gets an order of questions, a re-approach clock, a decline recorded against the offer rather than the person, and enforcement last."
      >
        <WhenNo />
      </Section>

      {/* 06 · Lanes and Housing First */}
      <Section
        layout="stacked"
        id="lanes"
        tone="warm"
        eyebrow="06 · Three lanes, and when Housing First works"
        title="Intensity follows acuity; the lease does not wait for treatment"
        lead="Three lanes set how much support a person gets, never which doors they are eligible for. Lane 3 is a tenth of the people and half the shelter nights, and the only lane a responder can score at the scene. Underneath, the placement rule itself: thirteen cases where Housing First works, works with conditions, or is not enough by itself, with the trial behind each one a tap away."
      >
        <LanesVisual />
        <div className="mt-6">
          <HousingFirstBoard />
        </div>
        <Note>Lane volumes and costs are a 2026 county turnaround proposal&apos;s planning assumptions, labeled as such. Nine of the thirteen Housing First evidence strings were adversarially checked and corrected; the other four stand unrefuted rather than verified.</Note>
      </Section>

      {/* 07 · Counting */}
      <Section
        layout="stacked"
        id="count"
        eyebrow="07 · Counting each bucket"
        title="Seven fields a worker already enters, nine numbers the system is judged on, and who can say what today"
        lead="The count has to survive workers who will not fill in forty fields, providers who report late, and people who move between jail, hospital, shelter, and street without telling anyone. So the stage count is one living-situation code, the funnel is one referral result, capacity comes with the bill, and silence degrades to unknown rather than to housed. The matrix at the end shows how little of this anyone can say now."
      >
        <CountLedger />
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The nine headline numbers</p>
          <HeadlineMetrics />
        </div>
        <div className="mt-6">
          <PublishesMatrix />
        </div>
      </Section>

      {/* 08 · Money and blame */}
      <Section
        layout="stacked"
        id="money"
        tone="warm"
        eyebrow="08 · Who answers for it, and what it costs"
        title="A price for every stage, and a consequence for every miss"
        lead="The unit costs the region has published all point one way: a shelter bed costs about three times what supportive housing costs per person, and the cheap conversion steps between them were the ones cut. Most stage costs were never published at all. Below the chart, what happens when a stage fails, in order, and who has the authority to make it happen. The owner, the number, and the cost for any single stage are on its card in section 02."
      >
        <CostChart />
        <div className="mt-6">
          <FailureLadder />
        </div>
      </Section>

      {/* 09 · What could go wrong */}
      <Section
        layout="stacked"
        id="risks"
        eyebrow="09 · What could go wrong"
        title="The critique we kept, and what the front line will say"
        lead="A completeness critic listed what the design misses, and seven front-line, clinical, and legal readers said what breaks at 2 a.m. We changed the design where they were right and kept every objection here with its answer, so the people who will hear them next have it in hand."
      >
        <CaveatsAccordion />
        <div className="mt-6">
          <FrontLine />
        </div>
      </Section>

      {/* Sources */}
      <Section
        layout="stacked"
        id="sources"
        tone="warm"
        eyebrow="Sources & method"
        title="Where this comes from"
        lead="The county's own reports, budgets, handbooks, scorecard, and shelter review; the city's audit, weekly street reports, and shelter figures; Oregon statutes and EMS protocols; nineteen national frameworks and data standards; the randomized and matched studies behind each pathway; and a 2026 county turnaround proposal by a candidate for county chair, used for stage targets and the three-lane model and labeled as a proposal wherever it appears. Three independent designs were drafted, scored, synthesized, challenged claim by claim, read by a completeness critic, and then by seven front-line, clinical, and legal reviewers. The full registry is in the research archive."
      >
        <SourcesList />
      </Section>
    </div>
  );
}
