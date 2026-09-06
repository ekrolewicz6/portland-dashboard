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
import CountCompact from "@/components/deep-dives/homeless/CountCompact";
import FixBoard from "@/components/deep-dives/homeless/FixBoard";
import HeadlineMetrics from "@/components/deep-dives/homeless/HeadlineMetrics";
import PublishesMatrix from "@/components/deep-dives/homeless/PublishesMatrix";
import CostChart from "@/components/deep-dives/homeless/CostChart";
import FailureLadder from "@/components/deep-dives/homeless/FailureLadder";
import Critique from "@/components/deep-dives/homeless/Critique";
import FrontLine from "@/components/deep-dives/homeless/FrontLine";
import SourcesList from "@/components/deep-dives/homeless/SourcesList";
import SourceLinks from "@/components/deep-dives/homeless/SourceLinks";
import { RULES_SHORT } from "@/lib/homeless/continuum-short";

export const metadata: Metadata = pageMeta({
  title: "The Continuum — Every Step From Sidewalk to Lease, Defined and Counted",
  description:
    "Fourteen stages, twelve pathways, one first-door protocol for outreach, police, EMS, hospitals, and jails. Where it breaks and when it doesn't, how to count each bucket, and where Portland's gaps are. Every claim sourced and adversarially checked.",
  path: "/deep-dives/continuum",
  type: "article",
});

const NAV = [
  { id: "pathways", label: "01 Journey" },
  { id: "breaks", label: "02 Breaks" },
  { id: "money", label: "03 Costs" },
  { id: "fix", label: "04 Fix" },
  { id: "stages", label: "05 Stages" },
  { id: "tonight", label: "06 Tonight" },
  { id: "saying-no", label: "07 No" },
  { id: "lanes", label: "08 Lanes" },
  { id: "count", label: "09 Counting" },
  { id: "risks", label: "10 Risks" },
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
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
              <Link href="/deep-dives" className="transition-colors hover:text-[var(--color-ember-bright)]">Policy Deep-Dive</Link>
              <div className="h-px w-8 bg-[var(--color-ember)]/50" />
              <Link href="/deep-dives/homelessness" className="transition-colors hover:text-[var(--color-ember-bright)]">Homelessness</Link>
              <div className="h-px w-8 bg-[var(--color-ember)]/50" />
              <span>The continuum</span>
            </div>
            <h1 className="mt-6 max-w-3xl font-editorial-normal text-[38px] leading-[1.06] tracking-tight [text-wrap:balance] sm:text-[52px] lg:text-[58px]">
              Every step from the sidewalk to a lease,
              <span className="block font-editorial italic text-[var(--color-ember-bright)]">so that nobody is lost between them.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-[18px] leading-relaxed text-white/80 sm:text-[20px]">
              About seven thousand people in Multnomah County will sleep outside tonight. Most of them will meet the system through someone doing their best with a partial map: an outreach worker, a police officer, a paramedic, a nurse, a jail release desk. Each of those people uses a different one.
            </p>
            <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-white/70 sm:text-[18px]">
              This page draws a single map they could share. It shows the fourteen places a person can be between the street and a home, who the people are and what each of them needs first, where the system loses them today and what that costs, and what it would take to fix every stage.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#pathways" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
                Follow one person&apos;s path <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#breaks" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                See where it breaks today
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── The four rules, as a strip ── */}
      <section className="border-t border-white/10 bg-[var(--color-canopy-mid)] text-white">
        <div className={`${DIVE_CONTAINER} py-8`}>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">Four rules make it one system instead of fourteen programs</p>
          <ol className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <li key={p.rule} className="flex gap-3">
                <span className="font-editorial-normal text-[28px] leading-none text-[var(--color-ember-bright)]">{i + 1}</span>
                <div>
                  <p className="text-[15px] font-semibold leading-snug text-white">{p.rule}</p>
                  <p className="mt-1 text-[13px] leading-snug text-white/65">{RULES_SHORT[i]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Stat band ── */}
      <section className="border-t border-white/10 bg-[var(--color-canopy)] text-white">
        <div className={`${DIVE_CONTAINER} grid grid-cols-2 gap-6 py-9 lg:grid-cols-4`}>
          {[
            { v: String(CONTINUUM.length), l: "places a person can be, from the sidewalk to a lease", s: `${partial} partly counted today, ${unknown} not counted at all, none fully`, src: [] as string[] },
            { v: `${SCORECARD.score}/${SCORECARD.of}`, l: "the county's own score for knowing who is where", s: `${misses} conditions unmet, all about seeing people`, src: ["multco-bfz-scorecard"] },
            { v: "54%", l: "of people leaving shelter go somewhere nobody recorded", s: "2,800 of 5,213 exits in FY2025", src: ["multco-shelter-review"] },
            { v: fmtNum(STATS.deaths2024), l: "people died homeless in 2024", s: "the number the whole system is finally judged on", src: ["domicile-unknown"] },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-mono text-[30px] font-bold leading-none tabular-nums text-[var(--color-ember-bright)] sm:text-[36px]">{s.v}</p>
              <p className="mt-2 text-[13px] font-semibold leading-snug">{s.l}</p>
              <p className="mt-0.5 text-[12px] text-white/55">{s.s}</p>
              <SourceLinks ids={s.src} dark />
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

      {/* 01 · The journey */}
      <Section layout="stacked" id="pathways" eyebrow="01 · The journey" title="Pick a person, and follow their path." lead="Nobody arrives at the system as a case number. They arrive as a mother with two kids and an eviction notice, a young man in withdrawal, a veteran who has been outside for years. Each kind of person needs a different first door and a different order of steps, and the research is clear about most of them. Pick one and watch the path light up.">
        <PathwayExplorer />
      </Section>

      {/* 02 · Where it breaks */}
      <Section layout="stacked" id="breaks" tone="warm" eyebrow="02 · Where it breaks today" title="How many people are at each stage, and what is actually there for them" lead="Start with tonight: what exists for the people sleeping outside on an ordinary weeknight. Then walk the fourteen stages and compare the people in each one with the beds, slots, and workers that exist there. Where nobody can say how many people are in a stage, the board says so plainly, because that silence is the first thing that is broken.">
        <SystemBalance />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">At the transitions: what goes in, what comes through</p>
          <LeakChart />
        </div>
      </Section>

      {/* 03 · What it costs */}
      <Section layout="stacked" id="money" eyebrow="03 · What it costs" title="The money is mostly in the wrong stage" lead="A year in a shelter bed costs the county about three times what a year in supportive housing costs per person, and the inexpensive steps that move people between the two were the ones cut in the last budget. For most stages nobody has ever published what a year or an episode costs, and that is a finding in itself.">
        <CostChart />
      </Section>

      {/* 04 · The fix */}
      <Section layout="stacked" id="fix" tone="warm" eyebrow="04 · How to fix it" title="Four rules, and one clear thing to do at every stage" lead="The rules are what turn fourteen programs into one system a person can travel through. Under them, each stage gets the plainest possible instruction: the one thing to fund or change in the next budget, the one number to publish so everyone can see whether it worked, and the one office that answers for it.">
        <FixBoard />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">When a stage fails, and who enforces it</p>
          <FailureLadder />
        </div>
      </Section>

      {/* 05 · Each stage */}
      <Section layout="stacked" id="stages" eyebrow="05 · Each stage, in depth" title="Pick a stage, and see everything we know about it" lead="Each stage opens on a short overview: what exists there, where it falls short, what to do now, the number to watch, and who answers. The tabs hold the full definition, what the stage looks like when it works and how it fails the person in it, who does what, what it costs, and Portland\u2019s numbers today.">
        <StageExplorer />
      </Section>

      {/* 06 · Tonight */}
      <Section layout="stacked" id="tonight" tone="warm" eyebrow="06 · Tonight, at the scene" title="Six questions at the scene, then the doors that are actually open" lead="At 2 a.m. an officer, a medic, or an outreach worker has to decide where a person goes next with only what they can see in front of them. These six questions, in this order, get to the right first door. Below them is every door in the county on a 24-hour clock, because most of the system closes at dusk and the hardest hour is the middle of the night.">
        <TriageStepper />
        <div className="mt-6">
          <DoorsOpen />
        </div>
      </Section>

      {/* 07 · Saying no */}
      <Section layout="stacked" id="saying-no" eyebrow="07 · When someone says no" title="When someone says no, find out what kind of no it is" lead="Most people who refuse are turning down a specific offer, or are in no state to accept any offer tonight. The law lets nobody be moved unless they are in danger or incapacitated, so the honest response to a no is a better offer, a return visit by the same worker, and enforcement only as the last step and only on the record.">
        <WhenNo />
      </Section>

      {/* 08 · Lanes and Housing First */}
      <Section layout="stacked" id="lanes" tone="warm" eyebrow="08 · Three lanes, and when Housing First works" title="Support follows need, and the lease does not wait for treatment" lead="Three lanes decide how much help a person gets, never which doors they may use. Most people need cash and a conversation; a small group needs ongoing support; a tenth of the people, who account for half the shelter nights, need to be stabilized first and then housed with a team. Housing First is the rule for most of them, and thirteen cases say exactly when it works, when it works only with conditions, and when it is not enough on its own.">
        <LanesVisual />
        <div className="mt-6">
          <HousingFirstBoard />
        </div>
        <Note>Lane volumes and costs come from Sharon Meieran&apos;s 2026 Multnomah County turnaround proposal, a county-chair campaign document, and are planning assumptions.</Note>
      </Section>

      {/* 09 · Counting */}
      <Section layout="stacked" id="count" eyebrow="09 · Counting each bucket" title="Seven fields, nine numbers, and who can say what today" lead="Counting who is where does not need a new form. It needs one living-situation code and one referral result from each contact, entered where the worker already enters the contact, and a rule that when a provider goes quiet the count degrades to unknown instead of pretending people were housed. The matrix at the end shows how little of this the county, the city, or the Sheriff can say right now.">
        <CountCompact />
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The nine headline numbers</p>
          <HeadlineMetrics />
        </div>
        <div className="mt-6">
          <PublishesMatrix />
        </div>
      </Section>

      {/* 10 · Risks */}
      <Section layout="stacked" id="risks" tone="warm" eyebrow="10 · What could go wrong" title="We asked what this plan misses, then fixed what we could" lead="Before publishing, a critic listed everything the design leaves out, and seven people who work the front line at night said what would break in the first week. Most of what they found is now built into the plan, and each finding below says how. What remains is named honestly, with the document or the decision that would settle it.">
        <Critique />
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
        lead="County and city records, Oregon statutes and EMS protocols, national data standards, the trials behind each pathway, and one candidate's proposal, labeled. Three drafts, judged, challenged claim by claim, then read by seven front-line, clinical, and legal reviewers."
      >
        <SourcesList />
      </Section>
    </div>
  );
}
