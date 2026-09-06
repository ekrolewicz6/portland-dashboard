import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";
import { CONTINUUM, CONTINUUM_SOURCES, PRINCIPLES, SCORECARD } from "@/lib/homeless/continuum";
import { STATS } from "@/lib/homeless/data";
import { fmtNum } from "@/lib/homeless/engine";
import ContinuumMap from "@/components/deep-dives/homeless/ContinuumMap";
import StageDetail from "@/components/deep-dives/homeless/StageDetail";
import FirstDoor from "@/components/deep-dives/homeless/FirstDoor";
import Lanes from "@/components/deep-dives/homeless/Lanes";
import PathwayExplorer from "@/components/deep-dives/homeless/PathwayExplorer";
import HousingFirstRules from "@/components/deep-dives/homeless/HousingFirstRules";
import CountLedger from "@/components/deep-dives/homeless/CountLedger";
import HeadlineMetrics from "@/components/deep-dives/homeless/HeadlineMetrics";
import GapDiagnostic from "@/components/deep-dives/homeless/GapDiagnostic";
import Caveats from "@/components/deep-dives/homeless/Caveats";
import WhoDoesWhat from "@/components/deep-dives/homeless/WhoDoesWhat";
import WhenNo from "@/components/deep-dives/homeless/WhenNo";
import FrontLine from "@/components/deep-dives/homeless/FrontLine";
import MeasuresCompare from "@/components/deep-dives/homeless/MeasuresCompare";
import Accountability from "@/components/deep-dives/homeless/Accountability";
import StageCosts from "@/components/deep-dives/homeless/StageCosts";
import ModesGrid from "@/components/deep-dives/homeless/ModesGrid";

export const metadata: Metadata = pageMeta({
  title: "The Continuum — Every Step From Sidewalk to Lease, Defined and Counted",
  description:
    "Fourteen stages, twelve pathways, one first-door protocol for outreach, police, EMS, hospitals, and jails. When Housing First works and when it doesn't, how to count each bucket, and where Portland's gaps are. Every claim sourced and adversarially checked.",
  path: "/deep-dives/continuum",
  type: "article",
});

const NAV = [
  { id: "pathways", label: "01 Pick a person" },
  { id: "map", label: "02 The map" },
  { id: "stages", label: "03 Every stage" },
  { id: "first-door", label: "04 First door" },
  { id: "lanes", label: "05 Three lanes" },
  { id: "housing-first", label: "06 Housing First" },
  { id: "count", label: "07 Counting" },
  { id: "gaps", label: "08 The gaps" },
  { id: "caveats", label: "09 Not covered" },
  { id: "roles", label: "10 Who does what" },
  { id: "saying-no", label: "11 Saying no" },
  { id: "front-line", label: "12 Front line" },
  { id: "accountable", label: "13 Who pays, who answers" },
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
                <a href="#housing-first" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
                  When Housing First works
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

      {/* 05 */}
      <Section
        layout="stacked"
        id="pathways"
        eyebrow="01 · Start here"
        title="Pick a person. See their path."
        lead="Start here. Every person the system meets is one of twelve kinds, and each kind has an evidence-backed order of stages from the street to a lease. Pick one: the stages they pass through light up in order, the amber circle is the first door that has to exist, and the note below says why that order and how strong the evidence is. The rest of the page defines the stages, the questions that pick the first door, and how to count who is where."
      >
        <PathwayExplorer />
      </Section>

      {/* 01 */}
      <Section
        layout="stacked"
        id="map"
        eyebrow="02 · The map"
        title="Fourteen stages, and how many of them anyone can count"
        lead="Two pictures. First, the fourteen stages a person can be in, grouped into six phases and numbered in the order most people pass through them, each with its clock, whether anyone can count who is there today, and the best number Portland has. Second, which kinds of people pass through which stages, and in what order, with the first door that has to exist for each."
      >
        <ContinuumMap />
        <Note>
          Stage definitions and counts are distilled from a three-draft, judged, and adversarially verified design; eleven of twelve load-bearing factual claims survived checking against primary documents and the twelfth was corrected. The full memo and source registry are in the Civic Lab research archive.
        </Note>
      </Section>

      {/* 02 */}
      <Section
        layout="stacked"
        id="stages"
        tone="warm"
        eyebrow="03 · Every stage, defined"
        title="The shared vocabulary"
        lead="A stage is defined by a number a worker can take this week, not by a program or a building: who enters, how they leave, how long they stay, who belongs, how to count it, and what Portland has and lacks there. First, for each stage, what it looks like from the person's side when it works and the ways it fails them; then the full definition. If police, outreach, the emergency department, and the jail use the same fourteen words, they can hand a person to each other."
      >
        <ModesGrid />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Every stage in full: entry, exit, clock, count, Portland today, gap</p>
          <StageDetail />
        </div>
      </Section>

      {/* 03 */}
      <Section
        layout="stacked"
        id="first-door"
        eyebrow="04 · The first door"
        title="Six questions any responder can answer at the scene"
        lead="In order. Safety, then stabilization, then population, then history. Each yes names the first door, the stage it maps to, and what that door actually is in Portland tonight, including where there isn't one. The order matters: most failures are the wrong first door, not the wrong last one."
      >
        <FirstDoor />
      </Section>

      {/* 04 */}
      <Section
        layout="stacked"
        id="lanes"
        tone="warm"
        eyebrow="05 · Three lanes"
        title="Intensity follows acuity, and the highest-acuity group is small"
        lead="Three lanes sort people by acuity. Lane 3 can be scored at the scene from what a responder can observe; Lane 2 is assigned from history at the first handoff, never on the street; a person impaired tonight is not laned until re-approached. The lane decides the first door and the intensity of support, never eligibility for a later door. The chronic tenth of shelter users consumes half of shelter nights; that is who Lane 3 is for."
      >
        <Lanes />
        <Note>
          The three-lane structure and the per-lane volumes and costs (14,000–17,000 people at $5,000–6,000; 4,000–5,000 at $18,000–24,000; 900–1,200 at $45,000–65,000, on a flat budget) come from a 2026 county turnaround proposal by a candidate for county chair. They are budget assumptions, not measured outcomes, and are labeled that way wherever they appear. The observable criteria and the Housing First guardrail on Lane 3 are ours, from the trial evidence in section 06.
        </Note>
      </Section>

      {/* 06 */}
      <Section
        layout="stacked"
        id="housing-first"
        tone="warm"
        eyebrow="06 · When Housing First works, and when it doesn't"
        title="A placement rule, not a religion"
        lead="Housing First is the best-replicated result in this field for people with serious mental illness and long homelessness, and it is not a treatment for addiction, not a wound clinic, not a plan for a region with no units, and not a substitute for the hours of stabilization a person in psychosis or withdrawal needs before they can say yes. Thirteen cases, three verdicts, each with its evidence."
      >
        <HousingFirstRules />
        <Note>
          Where the evidence is a randomized trial we say so; where it is a matched or observational study, or a plan document, we say that. The compulsory-treatment verdict rests on a nine-study systematic review and Massachusetts overdose data; Oregon&apos;s civil-commitment standard widened on January 1, 2026 to reach foreseeable harm and basic needs, which makes the evidence point sharper: an order without a bed and a team produces a discharge, not a recovery.
        </Note>
      </Section>

      {/* 07 */}
      <Section
        layout="stacked"
        id="count"
        eyebrow="07 · Counting each bucket"
        title="Seven fields a worker already enters, and nine numbers the system is judged on"
        lead="The count has to survive workers who will not fill in forty fields, providers who report late, and people who move between jail, hospital, shelter, and street without telling anyone. So the stage count is one living-situation code, the funnel is one referral result, capacity comes with the bill, and silence degrades to unknown rather than to housed."
      >
        <CountLedger />
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The nine headline numbers</p>
          <HeadlineMetrics />
        </div>
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What the county and city publish today</p>
          <MeasuresCompare />
        </div>
        <Note>
          Three legal limits shape this: survivor records may not enter the shared identifier even hashed, substance-use treatment records need written patient consent, and hospital homelessness flags catch about a third of patients. Section 09 says what each does to the count.
        </Note>
      </Section>

      {/* 08 */}
      <Section
        layout="stacked"
        id="gaps"
        tone="warm"
        eyebrow="08 · Reading the gaps"
        title="What the counts would tell you, and what Portland's say now"
        lead="The point of counting each stage is diagnosis: the pattern in the numbers that says a gap is here, and what it usually means. For every stage, the signal, the likely cause, and the honest reading of Portland's numbers today, which is mostly that the count that would settle it does not exist."
      >
        <GapDiagnostic />
      </Section>

      {/* 09 */}
      <Section
        layout="stacked"
        id="caveats"
        eyebrow="09 · What this does not yet cover"
        title="The critique we could not answer, kept in view"
        lead="Before this was published, a completeness critic read the design against the source record and listed what it misses. We kept the list rather than smoothing it over: people with no pathway yet, legal limits on a shared count, data that does not exist or already does, governance with no owner, and the ways the headline number could be gamed."
      >
        <Caveats />
      </Section>

      {/* 10 */}
      <Section
        layout="stacked"
        id="roles"
        tone="warm"
        eyebrow="10 · Who does what"
        title="One lead per person, the right people in the room, and police only where the law puts them"
        lead="A continuum is only shared if everyone knows whose person this is at each stage and who writes the handoff. This table names the lead at every stage, who else belongs in the room, what police do and do not do there, and who records the arrival so the count can follow the person. The lead does not change at the door; that is the single habit that stops people falling between agencies."
      >
        <WhoDoesWhat />
      </Section>

      {/* 11 */}
      <Section
        layout="stacked"
        id="saying-no"
        eyebrow="11 · When someone says no"
        title="A no is information about the offer, the person's state, or the door. Find out which."
        lead="Most people who refuse are refusing a specific offer, or are not in a state to accept any offer tonight. The law draws two lines (danger to self or others, and incapacitation in public) and below them nobody can make anyone go anywhere. So the protocol for a no is an order of questions, a re-approach clock, a decline recorded against the offer rather than the person, and enforcement last, only after a real offer, on the record. Beside it, where police belong in all of this, and the honest sequence by which people actually get off the street."
      >
        <WhenNo />
      </Section>

      {/* 12 */}
      <Section
        layout="stacked"
        id="front-line"
        tone="warm"
        eyebrow="12 · What the front line will say"
        title="Forty objections from the people who would have to run this, and the answer to each"
        lead="Before this was published, an outreach worker, a paramedic, a patrol officer, a jail release desk, an emergency-department social worker, an addiction clinician, and a lawyer were each asked what breaks at 2 a.m. Their objections are the ones any rollout will hear in the first week. We changed the design where they were right and kept the objection and the answer here, by role, so the people who will hear them next have the answer in hand."
      >
        <FrontLine />
      </Section>

      {/* 13 */}
      <Section
        layout="stacked"
        id="accountable"
        eyebrow="13 · Who answers for it, and what it costs"
        title="An owner, a number, a consequence, and a price for every stage"
        lead="A continuum nobody answers for is a diagram. So for each of the fourteen stages: who answers for it in public, the mechanism that ties money or authority to the number, the one figure they are judged on with its target, and what happens when they miss, on a five-step ladder that starts with publishing and ends with reassigning the stage. Then the money: what is spent today, the unit cost the region has actually published, what a funded stage needs in the next budget, and which way each line should move. Two stages have no owner today and eight have no published unit cost. Those are findings, not gaps in this page."
      >
        <Accountability />
        <div className="mt-8">
          <StageCosts />
        </div>
        <Note>
          Dollar figures are the county&apos;s (FY2025 shelter review, FY2026 and FY2027 budgets and quarterly reports), the state&apos;s (facility study, legislative appropriations), or a trial&apos;s. The 2026 turnaround proposal&apos;s lane budgets are a candidate&apos;s arithmetic on unmeasured unit costs and are labeled as an assumption. Unit costs for sobering, detox, residential treatment, respite, outreach, bridge housing, retention, and diversion have never been published locally; each is a records request in the memo.
        </Note>
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
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 2xl:grid-cols-3">
          {CONTINUUM_SOURCES.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="group -m-2 flex items-start gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-[var(--color-parchment)] hover:bg-white">
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
