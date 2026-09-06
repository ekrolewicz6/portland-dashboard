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
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">Fourteen stages. Thirteen kinds of people. Six questions for 2 a.m. A price and an owner for every stage.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#pathways" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
                  Pick a person <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#breaks" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                  Where it breaks
                </a>
              </div>
            </div>
            <div className="xl:col-span-5">
              <div className="rounded-sm border border-white/12 bg-white/[0.05] p-5 backdrop-blur sm:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">The four rules</p>
                <ol className="mt-4 space-y-2.5">
                  {PRINCIPLES.map((p, i) => (
                    <li key={p.rule} className="flex gap-3">
                      <span className="font-mono text-[13px] font-bold text-[var(--color-ember-bright)]">{i + 1}</span>
                      <p className="text-[14px] font-semibold leading-snug text-white">{p.rule}</p>
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
            { v: String(CONTINUUM.length), l: "stages from sidewalk to lease", s: `${partial} partly counted today, ${unknown} not counted at all, none fully`, src: [] as string[] },
            { v: `${SCORECARD.score}/${SCORECARD.of}`, l: "the county's own by-name-list score", s: `${misses} unmet conditions, all about knowing who is where`, src: ["multco-bfz-scorecard"] },
            { v: "54%", l: "of shelter exits go nowhere anyone recorded", s: "2,800 of 5,213 exits in FY2025", src: ["multco-shelter-review"] },
            { v: fmtNum(STATS.deaths2024), l: "died homeless in 2024", s: "the number the highest-acuity lane is judged on", src: ["domicile-unknown"] },
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
      <Section layout="stacked" id="pathways" eyebrow="01 · The journey" title="Pick a person. See their path." lead="Fourteen stages from the sidewalk to a lease. Everyone the system meets is one of thirteen kinds of people, each with an evidence-backed order through them. Pick one.">
        <PathwayExplorer />
      </Section>

      {/* 02 · Where it breaks */}
      <Section layout="stacked" id="breaks" tone="warm" eyebrow="02 · Where it breaks today" title="How many people are at each stage, and what is there for them" lead="Tonight's snapshot first. Then, stage by stage, people against support, and at each transition what goes in and what comes through. Where nobody can say, the board says so.">
        <SystemBalance />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">At the transitions: what goes in, what comes through</p>
          <LeakChart />
        </div>
      </Section>

      {/* 03 · What it costs */}
      <Section layout="stacked" id="money" eyebrow="03 · What it costs" title="The money is mostly in the wrong stage" lead="A shelter bed costs three times what supportive housing costs per person, and the cheap steps between them were the ones cut. Eight of fourteen stages have no published unit cost at all.">
        <CostChart />
      </Section>

      {/* 04 · The fix */}
      <Section layout="stacked" id="fix" tone="warm" eyebrow="04 · How to fix it" title="Four rules, and one thing to do at every stage" lead="The rules make the continuum one system instead of fourteen programs. Under them, for each stage: the thing to do in the next budget, the one number to publish, and who answers for it.">
        <FixBoard />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">When a stage fails, and who enforces it</p>
          <FailureLadder />
        </div>
      </Section>

      {/* 05 · Each stage */}
      <Section layout="stacked" id="stages" eyebrow="05 · Each stage, in depth" title="Pick a stage." lead="Everything the page knows about one stage: the overview, what it is, when it works and how it fails, who does what, who answers and what it costs, and Portland today with the gap.">
        <StageExplorer />
      </Section>

      {/* 06 · Tonight */}
      <Section layout="stacked" id="tonight" tone="warm" eyebrow="06 · Tonight, at the scene" title="Six questions, then the doors that are actually open" lead="Answer them in order from what you can see. Then every door on a 24-hour clock, because most of the system closes at dusk and the hardest hour is 2 a.m.">
        <TriageStepper />
        <div className="mt-6">
          <DoorsOpen />
        </div>
      </Section>

      {/* 07 · Saying no */}
      <Section layout="stacked" id="saying-no" eyebrow="07 · When someone says no" title="A no is information. Find out what kind." lead="Seven steps, in order. The law draws two lines; below them nobody can make anyone go anywhere, so the answer to a no is a better offer, a return visit, and enforcement last.">
        <WhenNo />
      </Section>

      {/* 08 · Lanes and Housing First */}
      <Section layout="stacked" id="lanes" tone="warm" eyebrow="08 · Three lanes, and when Housing First works" title="Intensity follows acuity; the lease does not wait for treatment" lead="Three lanes set how much support a person gets, never which doors they may use. Thirteen cases where Housing First works, works with conditions, or is not enough by itself.">
        <LanesVisual />
        <div className="mt-6">
          <HousingFirstBoard />
        </div>
        <Note>Lane volumes and costs come from Sharon Meieran&apos;s 2026 Multnomah County turnaround proposal, a county-chair campaign document, and are planning assumptions.</Note>
      </Section>

      {/* 09 · Counting */}
      <Section layout="stacked" id="count" eyebrow="09 · Counting each bucket" title="Seven fields, nine numbers, and who can say what today" lead="One living-situation code and one referral result per contact; capacity comes with the bill; silence degrades to unknown, never to housed.">
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
      <Section layout="stacked" id="risks" tone="warm" eyebrow="10 · What could go wrong" title="We asked what this plan misses, then fixed what we could" lead="A critic listed what the design misses; seven front-line, clinical, and legal readers said what breaks at 2 a.m. Most is now built in. The rest is named, with what would settle it.">
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
