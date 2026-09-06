import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import { SOURCES, HEADLINE, FTE_BY_FUNCTION, type Source } from "@/lib/pps-budget/data";
import { DEBATES, CASE_FILE } from "@/lib/pps-budget/arguments";
import TheWholeStory from "@/components/deep-dives/pps-budget/TheWholeStory";
import MoneyDecomposition from "@/components/deep-dives/pps-budget/MoneyDecomposition";
import DecadeSpine from "@/components/deep-dives/pps-budget/DecadeSpine";
import LevyLeak from "@/components/deep-dives/pps-budget/LevyLeak";
import HomeownerCalculator from "@/components/deep-dives/pps-budget/HomeownerCalculator";
import EmptyChair from "@/components/deep-dives/pps-budget/EmptyChair";
import BondLedger from "@/components/deep-dives/pps-budget/BondLedger";
import EsserCliff from "@/components/deep-dives/pps-budget/EsserCliff";
import Benchmarks from "@/components/deep-dives/pps-budget/Benchmarks";
import SchoolUtilization from "@/components/deep-dives/pps-budget/SchoolUtilization";
import WasteVerdicts from "@/components/deep-dives/pps-budget/WasteVerdicts";
import OverrunAnatomy from "@/components/deep-dives/pps-budget/OverrunAnatomy";
import PlanDecisions from "@/components/deep-dives/pps-budget/PlanDecisions";
import CannotKnow from "@/components/deep-dives/pps-budget/CannotKnow";
import DoctrineCard from "@/components/deep-dives/pps-budget/DoctrineCard";
import Tripwires from "@/components/deep-dives/pps-budget/Tripwires";
import FieldKit from "@/components/deep-dives/pps-budget/FieldKit";
import Debate from "@/components/deep-dives/Debate";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";

export const metadata: Metadata = pageMeta({
  title: "Where the next dollar goes: the PPS budget, examined",
  description:
    "Portland Public Schools cut teachers while its budget hit $2.77 billion, and both facts are true. Eleven years of budget books and every audit, read so you don't have to. What decides whether a dollar reaches a student, where the waste actually is, and ten things the school board could do about it.",
  path: "/deep-dives/pps-budget",
  type: "article",
});

const NAV = [
  { id: "salems-machine", label: "How the money works" },
  { id: "the-levy-leak", label: "The levy leak" },
  { id: "the-empty-chair", label: "Who checks it" },
  { id: "the-decade", label: "What happened" },
  { id: "where-it-goes", label: "Where it goes" },
  { id: "the-benchmarks", label: "Is it a lot?" },
  { id: "empty-seats", label: "Empty schools" },
  { id: "waste", label: "The waste" },
  { id: "arguments", label: "The big fights" },
  { id: "cannot-know", label: "What we can't know" },
  { id: "the-plan", label: "The plan" },
  { id: "watch", label: "Your move" },
  { id: "doctrine", label: "One rule" },
  { id: "method", label: "Method" },
];

function Src({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-canopy)] underline decoration-[var(--color-sage)]/50 underline-offset-2 hover:decoration-[var(--color-canopy)]"
    >
      {s.org}
    </a>
  );
}

function dedupeSources(): Source[] {
  const all = Object.values(SOURCES) as Source[];
  const byUrl = new Map<string, Source>();
  for (const s of all) if (!byUrl.has(s.url)) byUrl.set(s.url, s);
  const rank = { primary: 0, statute: 1, analysis: 2, news: 3 } as const;
  return [...byUrl.values()].sort(
    (a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) || a.org.localeCompare(b.org),
  );
}

function IndependenceNote() {
  return (
    <div className="mt-6 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5">
      <div className="h-[2px] w-8 bg-[var(--color-ember)]" />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember)]">
        Where we stand
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
        Portland Civic Lab is unaffiliated with and unfunded by PPS, any employee union, any
        contractor or vendor named on this page, and any campaign. Every number traces to a public
        document; press-only figures are labeled press; the judgments are ours and labeled. Our
        standing disclosures live on the{" "}
        <Link href="/independence" className="font-semibold text-[var(--color-canopy)] hover:underline">
          Independence page
        </Link>
        , and corrections are invited and logged.
      </p>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-[var(--color-ink-light)] [&_strong]:text-[var(--color-ink)] [div+&]:mt-8 [&+div]:mt-8">
      {children}
    </div>
  );
}

export default function PpsBudgetPage() {
  return (
    <article className="bg-[var(--color-paper)]">
      {/* ── hero ── */}
      <header className="noise-overlay relative overflow-hidden bg-[var(--color-canopy)] py-16 text-white sm:py-20">
        <div className={`relative z-10 ${DIVE_CONTAINER}`}>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
                <Link href="/deep-dives" className="hover:text-white">Policy deep-dive</Link> ——— The Portland Public Schools budget
              </p>
              <h1 className="mt-5 font-editorial-normal text-[40px] leading-[1.05] sm:text-[56px] xl:text-[64px]">
                Where the next dollar goes.
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  And the ten decisions that would change it.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/85">
                Portland Public Schools just cut 322 positions, its sixth straight year of cuts.
                Its budget is $2.77 billion, the largest in its history. Both are true, and no
                public document explains how.
              </p>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/70">
                We read eleven years of budget books and every audit so you don&apos;t have to.
                This page shows what decides whether a dollar reaches a student, where money is
                doing less than it could, and ten decisions that would change it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#the-plan"
                  className="rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)]"
                >
                  Skip to the plan
                </a>
                <a
                  href="#the-levy-leak"
                  className="rounded-sm border border-white/25 px-5 py-3 text-[14px] font-semibold text-white hover:bg-white/10"
                >
                  See where your levy goes
                </a>
              </div>
            </div>

            <aside className="hidden rounded-sm border border-white/15 bg-white/[0.04] p-6 xl:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">
                How to read this page
              </p>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-[14px] font-semibold text-white">First, the rules</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    Oregon sets most of the rules for school money. We start there, because the
                    rules explain most of the fights.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">Then, what happened</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    The last ten years: where the money came from, where it went, what got cut,
                    and where it was wasted.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">Then, what to do</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    Ten specific things the school board could do, and what you can do yourself:
                    six questions, six dates, one rule.
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "The headline budget", v: "$2.77B" },
              { k: "The actual operating fund, down $6.5M", v: "$862M" },
              { k: "Already projected out of next year's budget", v: "$65M+" },
              { k: "Students, down one in eight since 2019", v: "42,304" },
            ].map((s) => (
              <div key={s.k} className="bg-[var(--color-canopy)] p-5">
                <dd className="font-mono text-[26px] font-bold tabular-nums text-white sm:text-[30px]">
                  {s.v}
                </dd>
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
                  {s.k}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── the whole story in one screen ── */}
      <TheWholeStory />

      {/* ── nav ── */}
      <nav
        className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/95 backdrop-blur print:hidden"
        aria-label="Section navigation"
      >
        <ReadingProgress />
        <div className={`${DIVE_CONTAINER} scrollbar-hide flex gap-1 overflow-x-auto`}>
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="flex min-h-[44px] shrink-0 items-center px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)]"
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ════ ACT II · THE RULES NOBODY IN THE ROOM CONTROLS ════ */}

      <Section
        id="salems-machine"
        eyebrow="The rules from Salem"
        title="Why higher Portland taxes don't buy Portland more school."
        lead="Oregon's funding formula subtracts local tax dollars from the state's check. That is not a scandal. It is the design, and it explains most of this page."
      >
        <Prose>
          <p>
            That $182 million slice is small because almost everything around it was decided before
            this school board was elected. Since 1991, Oregon has funded schools through an equalization
            formula with one governing identity: the state grant equals a district&apos;s formula
            total <em>minus its local property taxes</em>. Every ordinary tax dollar Portland
            collects is subtracted from its state check. If the tax base booms, the check shrinks
            by the same amount. The Legislative Revenue Office says it flatly: if local revenues
            are high, state aid is low (<Src id="lro524" />). The statute even counts tax capacity
            a district declines to levy as if it had collected it (<Src id="ors327011" />).
          </p>
          <p>
            The formula weights students, not buildings: a student with a disability counts double,
            but the state pays that weight only up to 11 percent of enrollment, a 1990s cap, while
            PPS reports 17 percent of its students receive special education services (
            <Src id="cbrcFy27" />). The gap lands on the operating fund, involuntarily, every year.
            One mercy for a shrinking district: the state pays on the <em>higher</em> of this
            year&apos;s or last year&apos;s count, so enrollment loss hits with a one-year lag.
          </p>
          <p>
            What actually adds money sits outside the formula: the local option levy, bond levies,
            the Student Success Act, federal grants, the city&apos;s arts tax, and, for four
            years, almost $115 million of one-time pandemic relief. Which means the two taxes
            Portlanders vote on directly are nearly the only local levers that work. One of them
            is leaking.
          </p>
        </Prose>
      </Section>

      <Section
        id="the-levy-leak"
        eyebrow="The rules from Salem"
        title="Voters approved $1.99 for teachers. About $1.51 arrives."
        lead="The gap between those two numbers is the leak: about 48 cents of every levy dollar, erased by tax limits Oregon voters passed in the 1990s. It is not mismanagement, and nobody at district headquarters can fix it."
        tone="warm"
      >
        <Prose>
          <p>
            Start with one tax bill. The teachers levy is written as $1.99 per $1,000 of your
            home&apos;s <em>assessed</em> value. But a 1990 constitutional amendment, Measure 5,
            says the school taxes on any property cannot exceed $5 per $1,000 of its{" "}
            <em>market</em> value. When a bill breaks that ceiling, the county does not defer the
            extra or collect it later. It deletes it. And the constitution names what gets deleted
            first: add-on levies like the teachers levy, cut all the way to zero if needed, before
            any other school tax line loses a cent. Averaged across every property in the
            district, the deleted amount now equals about 48 cents of the $1.99. That is the leak,
            and tax people call it compression. The dollars that do arrive are clean: restricted
            to teacher salaries by law, held in their own sub-account, audited every year (
            <Src id="cbrcLevy2025" />).
          </p>
          <p>
            Why would anyone design a tax to be deleted? Because the levy was born as the
            overflow. Measure 5 was a 1990 tax revolt: voters capped school taxes to push school
            funding onto the state. Measure 50, in 1997, froze each home&apos;s assessed value
            below its market value and let it grow just 3 percent a year, and as part of that
            same deal it let districts ask voters for extra money, but only from whatever room
            the $5 ceiling left over. That is why the levy gets cut first: it was only ever
            allowed to exist in whatever room the ceiling left. For two decades Portland
            home prices rose fast enough that the gap stayed wide. Then prices went flat after
            2022 while assessed values kept ratcheting up 3 percent a year, the two numbers
            converged on thousands of properties at once, and the room the levy lives in started
            closing. Nobody in 1997 designed that ending. But it works exactly as written, and it
            is growing fast.
          </p>
        </Prose>
        <LevyLeak />
        <Prose>
          <p>
            Translate the arithmetic into teachers and it reads like this: roughly flat receipts now buy
            about a quarter fewer teachers than in 2019, because compression grew 72 percent in
            three years while the average cost of a teacher rose from $106,000 toward $152,000.
            The district&apos;s own levy reviewers wrote the sentence that should be on every 2029
            renewal mailer: without intervention, PPS could lose nearly one quarter of its
            levy-funded teaching positions (<Src id="cbrcLevy2025" />). A board member who wants
            more teachers per levy dollar has exactly one venue, and it is not the district office.
            It is the legislature. And there is one sentence every voter can carry to the 2029
            renewal campaign: <strong>print the effective rate next to the $1.99.</strong> What
            the leak costs your own house, at your own assessed value:
          </p>
        </Prose>
        <HomeownerCalculator />
      </Section>

      <Section
        id="the-empty-chair"
        eyebrow="The rules from Salem"
        title="Who reviews the budget? In Portland, the people who wrote it."
        lead="Oregon seats citizens beside the board on nearly every district's budget committee. Portland is the carve-out."
      >
        <Prose>
          <p>
            If Salem writes the revenue rules, at least the spending gets reviewed, somewhere, by
            someone. Here is who. For most Oregon districts, state law requires the budget
            committee to be the elected board <em>plus an equal number of appointed citizens</em>,
            ordinary residents with the same seat, the same questions, the same vote on approval (
            <Src id="ors294414" />). Portland is exempt, and the exemption has a reason. Multnomah
            County is the one county in Oregon with a Tax Supervising and Conservation Commission,
            a Governor-appointed watchdog the legislature created in 1919, and every local budget
            in the county, PPS included, must survive its public hearing and be certified before
            adoption (<Src id="tsccFy26" />). So when lawmakers wrote the citizen-committee
            requirement, they let large districts already under that commission skip it (
            <Src id="ors294423" />): a county with a professional budget watchdog, the thinking
            went, did not need citizens at the table too. PPS took the exemption. The citizen half
            of the table, standard in Beaverton and Salem-Keizer, is an empty chair here.
          </p>
        </Prose>
        <EmptyChair />
        <Prose>
          <p>
            So did the 1919 trade work? Judge each reviewer by what it can actually do. The
            commission checks legal form: rates within limits, hearings held, funds balanced. It
            has passed PPS on all seven of its checklist items and certified the budget without a
            single objection in each of the last three years (<Src id="tsccFy26" />), the same
            three years the deficit compounded and the cuts arrived. Certification asks whether a
            budget is lawful, never whether it is wise. The judgment half of the review, the half
            citizen committees do with a vote everywhere else in Oregon, fell to volunteers with
            nine days and no vote, and the scorecard above shows what that is worth: when advice
            costs nothing to ignore, most of it gets ignored, year after year, in writing. Which
            leaves the obvious question: with the rules set in Salem and the review this thin,
            what did the district actually do with its decade? The answer is the next section, and
            it is not flattering to anyone.
          </p>
          <div className="mt-6 rounded-sm border-l-2 border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
              The rule this page reads everything by
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink)]">
              Judge the district by how it handles the problems it can control. The state created many
              of these problems, but &ldquo;Salem did it&rdquo; cannot excuse the choices the
              district makes for itself. Every section below does both.
            </p>
          </div>
        </Prose>
      </Section>

      {/* ════ ACT III · WHAT THE DISTRICT DID WITH ITS DECADE ════ */}

      <Section
        id="the-decade"
        eyebrow="What happened"
        title="Eleven years: money up every year, students down, then the bill."
        lead="Nominal operating money rose without interruption until this year. Purchasing power peaked in 2021-22 and has fallen nine percent since."
      >
        <div className="mb-8 rounded-sm border border-[var(--color-fern)]/40 bg-[var(--color-sage-tint)] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fern)]">
            Credit where the record supports it
          </p>
          <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            This is not a failing district. PPS reports reading proficiency of 56.4 percent against
            a 43.0 percent state average, math at 48.0 against 31.2, and graduation at 82.5 percent
            (<Src id="academicJourney" />). TSCC certified its last three budgets without a single
            objection, Lincoln High finished $16.9M under its revised budget, and the quarterly
            financial reports exist and are public.
          </p>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            Two more things the record supports, against the way this story usually gets told.
            The district did see the cliff coming: it adopted a reserve policy in 2019 targeting
            up to 10 percent, built a balance above the floor, and spent it down through the
            deficit years instead of laying people off sooner, while the teachers union argued
            throughout that it was sitting on money it should spend (<Src id="tsccFy26" />). That
            reserve is a large part of why Portland was not doing mass layoffs two years ago. And
            during the strike, when its numbers were widely doubted, the district said publicly
            that a settlement on those terms would force deep cuts. It did. Nothing below should
            be read as a claim that nobody at PPS was paying attention.
          </p>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            The problem this page documents is not
            collapse. It is a district that teaches better than its state average while its buildings,
            its finances, and its planning fall behind its own results.
          </p>
        </div>
        <DecadeSpine />
        <Prose>
          <p>
            The turn has a date and a cause. Enrollment held near 49,500 for four years, then fell
            sharply beginning in 2019-20: down one student in eight since, by the
            district&apos;s own count (<Src id="suptMessageFy27" />), worst in
            kindergarten, where the share of eligible children enrolling fell from about 80
            percent to about 70 and stayed there. Students who never arrive in kindergarten never
            arrive in any later grade either. Meanwhile the money kept coming: the state check,
            cushioned by the formula&apos;s lag, and a flood of one-time federal money.
          </p>
        </Prose>
        <EsserCliff />
        <Prose>
          <p>
            The relief was spent on people and programs, deliberately, and federal guidance
            encouraged exactly that. But one-time money was carrying ongoing commitments, and the
            district&apos;s own citizen committee said so in real time, in spring 2023, six months
            before the strike: the funding was &ldquo;hiding the looming shortfall ... from the
            general public&rdquo; (<Src id="cbrcFy24" />). Then November 2023: the first strike in
            district history, settled at a press-reported cost near $175 million over three years,
            a figure no published cost model has ever supported or refuted, because none exists (
            <Src id="opbStrikeFaq" />). Then the federal money ran out, then the cuts, in a sequence the chart
            above prints: $30 million, $40 million, $56.3 million, with more than $65 million
            already projected for next year (<Src id="budgetFy27Vol1" />). So where inside the
            operating fund did the squeeze actually land?
          </p>
        </Prose>
      </Section>

      <Section
        id="where-it-goes"
        eyebrow="What happened"
        title="Where the operating dollar goes, and where the cuts landed."
        lead="Seventy-nine cents of every operating dollar is people. When cuts came, classrooms gave up ground twice as fast as the back office."
        tone="warm"
      >
        <Prose>
          <p>
            Of the $862 million operating fund, 78.9 percent, $680.5 million, is salaries and
            benefits (<Src id="budgetFy27Vol1" />). And the fastest-growing piece of that is not
            salaries. It is the pension bill, which is about to jump from roughly 4 percent of
            payroll to nearly 23 (<Src id="cbrcFy27" />). A number that strange needs its own
            explanation, because nobody at PPS chose it.
          </p>
        </Prose>
        <div className="mt-8 rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The pension bill, explained
          </p>
          <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                What PERS is
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                The statewide pension system the legislature created in 1945 for every Oregon
                public employer: teachers, firefighters, city clerks, all of them (
                <Src id="persOverview" />). The district writes the checks and controls nothing
                else. Rates are set in Salem by the PERS board, on its actuaries&apos; schedule.
              </p>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                Where the hole came from
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                For workers hired before 1996, the state guaranteed their retirement accounts
                would grow about 8 percent a year, in good markets and bad. The crashes of 2001
                and 2008 turned those guarantees into debt, and in 2015 the Oregon Supreme Court
                ruled that benefits already earned cannot be cut. So every public employer in
                Oregon now pays extra, for years to come, to fill a hole dug decades ago. That
                surcharge is most of the 23 percent.
              </p>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                Why PPS looked immune for twenty years
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                In 2002 and 2003 the district borrowed hundreds of millions through pension
                bonds, $510.3 million still outstanding (<Src id="acfrFy2025" />), and parked the
                money with PERS. The investment credits from that deposit paid most of the
                district&apos;s pension bill for two decades and held its net rate near 4
                percent. Those credits are running out now, on a schedule the actuaries published
                years in advance. The jump to 23 was a calendar event, not a surprise.
              </p>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                So who is to blame?
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                For the rate itself: legislatures and pension boards from the 1980s and 1990s,
                and the court rulings that sealed their promises. Nobody now at PPS had a vote.
                For being unready: the district. It built a reserve for exactly this moment and
                spent it in a single year, down to its last $394,000 (<Src id="tsccFy26" />).
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-white">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
                {["Staffing by function", "FY2021-22 actual", "FY2025-26 adopted", "Change"].map((h) => (
                  <th key={h} className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-parchment)]">
              {FTE_BY_FUNCTION.map((r) => (
                <tr key={r.group}>
                  <td className="px-4 py-3 text-[13px] font-semibold text-[var(--color-ink)]">{r.group}</td>
                  <td className="px-4 py-3 font-mono text-[13px] tabular-nums text-[var(--color-ink-light)]">{r.fy22.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[13px] tabular-nums text-[var(--color-ink-light)]">{r.fy26.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-mono text-[13px] font-semibold tabular-nums ${r.pct < 0 ? "text-[var(--color-clay)]" : "text-[var(--color-fern)]"}`}>
                    {r.pct > 0 ? "+" : ""}{r.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-parchment)] px-4 py-2.5 text-[11.5px] leading-snug text-[var(--color-ink-light)]">
            Special programs grew because special-education caseloads grew, and federal law rightly
            protects that service. It is the least-cuttable line on this table, not the most
            bloated.
          </p>
          <p className="border-t border-[var(--color-parchment)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            PPS FY2025-26 Adopted Budget, FTE by major function
          </p>
        </div>
        <Prose>
          <p>
            Regular instruction gave up 12.2 percent while central business support gave up 5.5,
            and the district&apos;s own committee could not verify the central-office cut claims
            because no publication separates them: the year 65 central positions were reportedly
            cut, the whole support function fell half a percent, and the central-only line was, in
            the committee&apos;s words, &ldquo;not clearly presented&rdquo; (<Src id="cbrcFy26" />
            ). Per student, the honest paradox: real dollars per student are <em>up</em> 24 percent
            over the decade, because enrollment fell faster than inflation ate the budget, and the
            institution still feels poorer every year, because its fixed footprint never shrank.
            All of which begs the question this page has been dancing around: is any of this
            actually a lot of money?
          </p>
        </Prose>
      </Section>

      <Section
        id="the-benchmarks"
        eyebrow="What happened"
        title="Yes, it is a lot of money. And no, teacher pay is not why."
        lead="PPS spends about a quarter more per student than its Oregon peers. Its teachers' salaries, adjusted for Portland prices, are last among six peer cities. Both are true at once. The difference disappears into pensions, benefits, buildings, and overhead before it reaches a classroom."
        tone="warm"
      >
        <Prose>
          <p>
            Two fair questions this page has not yet answered: how much <em>should</em> a student
            cost, and are teachers paid well or badly here? Neither has one true answer, but both
            have honest comparisons, so here they are, with the ground rules stated. Per-student
            spending can be counted two ways, Oregon&apos;s way and the federal way, and the two
            produce different numbers for the same district (<Src id="odeNoe2324" />
            <Src id="censusFin2024" />). Each panel below compares like with like, and the panels
            are never mixed.
          </p>
        </Prose>
        <Benchmarks />
        <Prose>
          <p>
            Put the two halves together and the two loudest arguments in town both fail. The
            claim that PPS is starved of money does not survive the peer comparison; the claim
            that its teachers are overpaid does not survive the cost-of-living table (
            <Src id="beaRpp2024" />
            <Src id="neaPay2025" />). What the numbers show instead is a district that takes in
            more per student than nearly everyone it can fairly be compared to, and gets less of
            it into classroom teaching, because pensions, benefits, buildings, and overhead take
            their cut first. The pension share of that story was told above. The next section
            tells the one you can see from the street: the buildings.
          </p>
        </Prose>
      </Section>

      <Section
        id="empty-seats"
        eyebrow="What happened"
        title="Fewer students, the same buildings, and a thinner program in each one."
        lead="Revenue arrives per student. Costs arrive per building. But the sharper problem is not the money: below a certain size, a school cannot offer what a larger one can, and Portland now has a lot of schools below that size."
      >
        <Prose>
          <p>
            The district operates on the order of 80 schools across 152 square miles for a student
            body down about 16 percent from its peak, with the slide forecast to continue toward
            roughly 39,900 by 2028-29 (<Src id="tsccFy26" />). Every year of that divergence pays
            principals, boilers, custodians, and bus routes for seats without students in them,
            out of the same fund cutting classroom positions. That is the money argument, and it
            is the smaller one. The district&apos;s own case for consolidating is about what a
            school can offer: a counselor who is there five days instead of two, a librarian, a
            full slate of electives. Those need a certain number of students to exist at all, and
            a school of 160 does not get there on any budget. The forecasts were public and
            unambiguous by 2021-22. The consolidation process began in fall 2026, with up to 20
            schools reported on the table (<Src id="wwTwentySchools" />, press). And the public
            can now see the whole footprint school by school, through an open-source compilation
            of the district&apos;s own numbers (<Src id="ppsdataInfo" />) that we spot-checked
            against the state&apos;s enrollment file, the district&apos;s facility plan, and the
            seismic engineers&apos; report before using it here (<Src id="odeFallMembership2526" />
            <Src id="lrfp2021" />
            <Src id="holmesSeismic2024" />):
          </p>
        </Prose>
        <SchoolUtilization />
        <Prose>
          <p>
            Both of these things are true, and the coming debate will tend to ignore one of them.
            Keeping small schools open is something Portland pays extra for on purpose: for
            walkability, for belonging, and out of the memory of what closures did to Black and
            brown North and Northeast Portland the last time. The honest way to hold both is to
            stop pretending this is mainly a savings decision. Per-building savings are modest,
            roughly one to two million dollars per elementary, which will not close a $65 million
            gap. What consolidation can actually deliver is a fuller program at the receiving
            school, and that is the promise nobody has been asked to put in writing. The
            district&apos;s savings model is not public, and neither is any accounting of what
            students would gain. Communities are being asked to trust arithmetic nobody can check,
            in both directions. Whether any of this deserves the word everyone reaches for, waste,
            depends on what the word means. Here is the definition this page uses.
          </p>
        </Prose>
      </Section>

      {/* ════ ACT IV · THE EXAMINATION ════ */}

      <Section
        id="waste"
        eyebrow="The judgment calls"
        title="Where the waste is, and where it isn't."
        lead="Before we call anything waste, we say exactly what the word means, and then hold every finding to that definition, with the strongest defense printed next to each one."
        tone="warm"
      >
        <WasteVerdicts />
        <div className="mt-8">
          <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
            The construction bonds deserve their own exhibit. They hold the district&apos;s
            biggest self-inflicted losses, and also its best recent work, the proof that it can
            deliver on budget when the number voters see is honest to begin with:
          </p>
          <BondLedger />
          <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
            A ledger of overruns raises the natural next question: <em>why</em> do they happen,
            and how much of it is anyone&apos;s fault? Benson is the one project where the audit
            trail lets us answer step by step (<Src id="bondAuditY6" />
            <Src id="opbBondTrim" />
            <Src id="turnerCostIndex" />
            <Src id="megaprojectBaseRates" />):
          </p>
          <OverrunAnatomy />
        </div>
      </Section>

      <Section
        id="arguments"
        eyebrow="The judgment calls"
        title="The four fights Portland keeps having, and what the numbers say."
        lead="We give each side its best argument, then say which one the evidence supports, and how confident anyone should be."
      >
        <div className="space-y-8">
          {DEBATES.map((d) => (
            <Debate key={d.id} debate={d} />
          ))}
        </div>

        {/* The equity formula: live litigation gets a case file, not a debate. */}
        <div className="mt-8 rounded-sm border border-[var(--color-parchment)] bg-white">
          <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-clay)]">
              A case file, not a debate
            </p>
            <h3 className="mt-1.5 font-editorial text-[22px] leading-tight text-[var(--color-ink)]">
              {CASE_FILE.title}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{CASE_FILE.status}</p>
          </div>
          <div className="space-y-3 p-5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            <p><span className="font-semibold text-[var(--color-ink)]">The mechanics:</span> {CASE_FILE.mechanics}</p>
            <p><span className="font-semibold text-[var(--color-ink)]">The allegation:</span> {CASE_FILE.allegation}</p>
            <p><span className="font-semibold text-[var(--color-ink)]">What is fair game now:</span> {CASE_FILE.fairGame}</p>
            <p className="border-t border-[var(--color-parchment)] pt-3 font-semibold text-[var(--color-ink)]">{CASE_FILE.bottomLine}</p>
          </div>
        </div>

        <Prose>
          <p className="mt-8">
            Notice that three of these four fights stall at the same wall: a document that exists
            but has never been published. The broke-or-hiding fight would end with the
            district&apos;s staffing records. The strike fight would end with the settlement cost
            model the district built to negotiate. The equity question would end with the
            effectiveness study its own committee asked for twice. All three sit in district
            files today. The next section names all eight missing documents, what each would
            settle, and exactly who to ask.
          </p>
        </Prose>
      </Section>

      <Section
        id="cannot-know"
        eyebrow="The judgment calls"
        title="What the public record cannot answer."
        lead="Each of these questions has an answer sitting in a district file. Getting it requires no new money, only a decision to publish."
        tone="warm"
      >
        <CannotKnow />
      </Section>

      {/* ════ ACT V · THE PLAN ════ */}

      <Section
        id="the-plan"
        eyebrow="The plan"
        title="Ten things the school board could actually do."
        lead="Everything above is diagnosis. This is the treatment: specific enough to vote on, in the order it should happen."
        tone="dark"
      >
        <PlanDecisions />
      </Section>

      <Section
        id="watch"
        eyebrow="Your part"
        title="What to do with all of this."
        lead="You do not need to read 500 pages to hold the district accountable. You need six questions, six dates, and the address of the board room."
      >
        <FieldKit />
        <div className="mt-10">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The calendar: six tripwires, and your move at each
          </p>
          <Tripwires />
        </div>
      </Section>

      <Section
        id="doctrine"
        eyebrow="The plan"
        title="One rule to carry out of here."
        lead="One sentence, ten specific commitments, and the question to ask every April."
        tone="warm"
      >
        <DoctrineCard />
      </Section>

      {/* ── method ── */}
      <Section
        id="method"
        eyebrow="Method"
        title="How this page knows what it claims."
        lead="Built on 134 public documents, archived with a tamper-evident record, and two fact-checked working papers."
      >
        <Prose>
          <p>
            This page condenses two longer working papers: the research document{" "}
            <Src id="researchDoc" /> and the recommendations <Src id="planDoc" />. Every figure was
            checked page-by-page against the source documents before publication, and the plan was
            stress-tested against the strongest counterarguments we could construct from seven
            hostile perspectives, a budget director, a union negotiator, an equity advocate, a
            parent organizer, a construction veteran, a lawyer, and a veteran administrator, then
            rewritten until it held. The corpus behind it all, 134 public documents fetched and
            checksummed with every extraction citing its page, is public: <Src id="pclAnalysis" />.
          </p>
          <p>
            Three cautions, each for a different reason. First, some figures on this page exist
            only in press reporting, never in an official document: the strike settlement cost,
            the closure counts, the kindergarten capture rate. They are labeled press wherever
            they appear so you can weigh them accordingly. Second, a warning for anyone
            fact-checking this page with a search engine: portlandschools.org and portlandk12.org
            belong to Portland, <em>Maine</em>, whose school budget really does go to a voter
            referendum every June, so headlines like &ldquo;Portland voters approve school
            budget&rdquo; are about a different Portland; no Oregon school budget is ever voted
            on directly. We built a filter into our own pipeline to keep Maine documents out, and
            your searches deserve the same skepticism. Third, the official Oregon record
            disagrees with itself more than anyone should be comfortable with: our extraction
            logged nineteen contradictions between the oversight bodies&apos; own published
            tables, the same staffing table printing different totals in different editions, for
            example, and the district&apos;s audited annual report carries an impossible
            enrollment figure in its statistical section. Where sources conflict, this page shows
            the conflict rather than smoothing it over.
          </p>
        </Prose>
        <IndependenceNote />
        <div className="mt-10">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Sources
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {dedupeSources().map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-[var(--color-parchment)] bg-white p-3.5 hover:border-[var(--color-sage)]"
              >
                <p className="text-[12.5px] font-semibold leading-snug text-[var(--color-ink)]">{s.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                  {s.org}
                  {s.year ? ` · ${s.year}` : ""}
                </p>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </article>
  );
}
