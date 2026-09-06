import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";
import { DERIVED, FISCAL, HEADLINE, SOURCES, type Source } from "@/lib/libraries/data";
import DeltaChart from "@/components/deep-dives/libraries/DeltaChart";
import TwoDoors from "@/components/deep-dives/libraries/TwoDoors";
import MoneyStack from "@/components/deep-dives/libraries/MoneyStack";
import FiscalReality from "@/components/deep-dives/libraries/FiscalReality";
import SafetyGrid from "@/components/deep-dives/libraries/SafetyGrid";
import PatronSignal from "@/components/deep-dives/libraries/PatronSignal";
import SystemMap from "@/components/deep-dives/libraries/SystemMapLoader";
import ReachCompare from "@/components/deep-dives/libraries/ReachCompare";
import EraTimeline from "@/components/deep-dives/libraries/EraTimeline";
import CommonsDiagram from "@/components/deep-dives/libraries/CommonsDiagram";
import MeasuresTable from "@/components/deep-dives/libraries/MeasuresTable";
import ApprovalMap from "@/components/deep-dives/libraries/ApprovalMap";
import ActionPath from "@/components/deep-dives/libraries/ActionPath";
import RoadmapGantt from "@/components/deep-dives/libraries/RoadmapGantt";

export const metadata: Metadata = pageMeta({
  title: "Portland just rebuilt its libraries. Now it has to decide what they're for.",
  description:
    "A $459M bond finished, 19 locations at full capacity for the first time since 2023, and a budget that runs a deficit every year through 2031 even at the maximum levy. The numbers behind the system, the gap to 2040 in one chart, a real map of every branch, who has to approve what, and the decisions that can actually be made this year.",
  path: "/deep-dives/libraries",
  type: "article",
});

const NAV = [
  { id: "delta", label: "The delta" },
  { id: "doors", label: "Two front doors" },
  { id: "money", label: "The money" },
  { id: "safety", label: "Safety" },
  { id: "patrons", label: "What patrons say" },
  { id: "map", label: "The map" },
  { id: "world", label: "Vs. the world" },
  { id: "history", label: "1864–2026" },
  { id: "model", label: "The model" },
  { id: "measures", label: "Measures" },
  { id: "approve", label: "Who approves what" },
  { id: "action", label: "What can be done" },
  { id: "roadmap", label: "To 2040" },
  { id: "method", label: "Method" },
];

function Src({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target={s.url.startsWith("/") ? undefined : "_blank"}
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
  const rank = { primary: 0, standard: 1, analysis: 2, news: 3 } as const;
  return [...byUrl.values()].sort(
    (a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) || a.org.localeCompare(b.org),
  );
}

/** The hero's one picture: of every 100 households, 38 have an active card. */
function HouseholdGrid() {
  const lit = HEADLINE.cardholderHouseholdPct;
  return (
    <div>
      <div className="grid grid-cols-10 gap-[5px]" aria-hidden>
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[3px]"
            style={{ background: i < lit ? "var(--color-ember-bright)" : "rgba(255,255,255,0.10)" }}
          />
        ))}
      </div>
      <p className="mt-4 font-mono text-[42px] font-bold leading-none tabular-nums text-[var(--color-ember-bright)]">
        {lit}<span className="text-[24px]">%</span>
      </p>
      <p className="mt-1.5 text-[15px] leading-snug text-white/70">
        of households have an active library card. The target the county&apos;s own report sets for
        2040 is 70%. Everything on this page is about the other 62.
      </p>
    </div>
  );
}

export default function LibrariesPage() {
  return (
    <article className="bg-[var(--color-paper)]">
      {/* ── hero ── */}
      <header className="noise-overlay relative overflow-hidden bg-[var(--color-canopy)] py-16 text-white sm:py-20">
        <div className={`relative z-10 ${DIVE_CONTAINER}`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-end">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
                <Link href="/deep-dives" className="hover:text-white">Policy deep-dive</Link> ——— Libraries
              </p>
              <h1 className="mt-5 font-editorial-normal text-[38px] leading-[1.06] sm:text-[54px] xl:text-[64px]">
                Portland just rebuilt its libraries.
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  Now it has to decide what they&apos;re for.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75">
                A ${HEADLINE.bondTotalHighM} million bond is finished. All nineteen locations run at
                full capacity this year for the first time since 2023. Checkouts are near record highs.
                And the district that owns them runs an operating deficit every year through 2031 —
                even after it takes the levy to its legal maximum. Fewer than four in ten households
                have an active card. One building generates half the incident reports. This is what the
                numbers say, the gap to 2040 in one chart, a real map of every branch, exactly who has to
                approve what, and the decisions that can actually be made this year.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#delta" className="rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)]">
                  The delta, in one chart
                </a>
                <a href="#action" className="rounded-sm border border-white/25 px-5 py-3 text-[16px] font-semibold text-white hover:bg-white/10">
                  What can be done this year
                </a>
              </div>
            </div>
            <aside className="rounded-sm border border-white/15 bg-white/[0.04] p-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/50">Of every 100 households</p>
              <div className="mt-4">
                <HouseholdGrid />
              </div>
            </aside>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "Locations, all open at full capacity in FY2027", v: String(HEADLINE.locations) },
              { k: "Checkouts & renewals a year", v: `${HEADLINE.checkoutsM}M` },
              { k: "Capital just spent, per county resident", v: `$${DERIVED.bondPerResident}` },
              { k: "Ongoing deficit, every year through FY2031", v: `−$${FISCAL.ongoingDeficitM.toFixed(1)}M` },
            ].map((s) => (
              <div key={s.k} className="bg-[var(--color-canopy)] p-5">
                <dd className="font-mono text-[26px] font-bold tabular-nums text-white sm:text-[30px]">{s.v}</dd>
                <dt className="mt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-white/50">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── nav ── */}
      <nav className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/95 backdrop-blur print:hidden" aria-label="Section navigation">
        <ReadingProgress />
        <div className={DIVE_CONTAINER}>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-2 font-mono text-[14px] uppercase tracking-[0.08em]">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-3 py-3 text-[var(--color-ink-light)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-canopy)]">
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── 01 · delta ── */}
      <Section
        id="delta"
        eyebrow="01 · What we're trying to accomplish"
        title="The distance to 2040, measured"
        lead="Every number the county's report commits to, next to where that number sits today. The orange bar is the work. Two of six have no baseline at all, which is itself the first finding."
      >
        <DeltaChart />
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          Read it top to bottom and the shape of the problem is clear: the reach numbers need to nearly
          double, the safety numbers need to triple, and the resilience number starts at zero. None of
          those is a building problem. The buildings are done.
        </p>
      </Section>

      {/* ── 02 · two doors ── */}
      <Section
        id="doors"
        tone="warm"
        eyebrow="02 · The last fifteen years"
        title="Two front doors, and only one of them is busy"
        lead="Digital borrowing more than doubled while physical checkouts fell by a third and foot traffic fell by 40%. The pandemic and six years of rolling construction closures explain part of it. The ratio of licenses to books explains the rest of what it costs."
      >
        <TwoDoors />
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          The strategic meaning is not &ldquo;digital replaces buildings.&rdquo; It is that the library
          now has two front doors and one set of books. Digital convenience reduces transactional visits
          even as rebuilt branches gain value for study, meetings, children&apos;s learning, and trusted
          help, and every e-license is a recurring cost that a print book never was.{" "}
          <Src id="stateLibraryStats" />
        </p>
      </Section>

      {/* ── 03 · money ── */}
      <Section
        id="money"
        eyebrow="03 · The money"
        title="Permanent funding, spent to the ceiling"
        lead="Voters ended the levy-to-levy era in 2012. They did not end arithmetic. The rate is two cents from its legal cap, the forecast already spends those two cents, and the district still runs short every year through 2031."
      >
        <MoneyStack />
        <div className="mt-6">
          <FiscalReality />
        </div>
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          This is the constraint any plan lives inside. There is no expansion fund. Reserves have a
          policy; the capital fund has claims; the one-time money is assigned. Which is why the only
          honest first step is a plan that assumes{" "}
          <strong className="text-[var(--color-ink)]">zero new money</strong> until someone names an
          appropriation and what it displaces. <Src id="fy2027Budget" /> · <Src id="districtPresentation" />
        </p>
      </Section>

      {/* ── 04 · safety ── */}
      <Section
        id="safety"
        tone="warm"
        eyebrow="04 · The people at the desk"
        title="Welcome and safety are the same operational problem"
        lead="After reopening, staff met more severe behavioral-health crises, drug use, and weapons concerns than the operating model was built for. The County Auditor put numbers on it."
      >
        <SafetyGrid />
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
          MCL simplified rules, created security leadership, expanded training, and partnered with
          Cascadia social workers; a federal workplace-health assessment at three branches found
          ventilation and protocol issues. The evidence should not stigmatize patrons. It does show that
          welcome is engineering, training, specialist partners, and employee voice — not a policy
          statement. <Src id="auditorReport2023" /> · <Src id="auditorFollowup2025" />
        </p>
      </Section>

      {/* ── 05 · patrons ── */}
      <Section
        id="patrons"
        eyebrow="05 · What patrons already said"
        title="Books first. Then books."
        lead="Before any vision, the people who use the library were asked what matters. The answer constrains everything that follows."
      >
        <PatronSignal />
      </Section>

      {/* ── 06 · map ── */}
      <Section
        id="map"
        tone="warm"
        eyebrow="06 · The system"
        title="Nineteen locations, one county, eighteen miles across"
        lead="Central and East County anchor the network as flagships; seventeen neighborhood commons carry the baseline everywhere else. Three of the buildings are Carnegie libraries from 1913. One opened in May."
      >
        <SystemMap />
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-4">
          {[
            { v: "0.3", k: "sq ft per resident, systemwide, in 2017 — worst east of I-205" },
            { v: `+${DERIVED.eastCountySqftPerResident}`, k: "sq ft per resident added by East County alone" },
            { v: `${FISCAL.unrenovatedBuildings}`, k: "owned buildings the bond didn't substantially renovate" },
            { v: `$${FISCAL.correctiveNeedM + FISCAL.renewalNeed20yrM}M`, k: "their corrective + 20-year renewal need" },
          ].map((s) => (
            <div key={s.k} className="bg-white p-4">
              <p className="font-mono text-[24px] font-bold tabular-nums leading-none text-[var(--color-ink)]">{s.v}</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--color-ink-muted)]">{s.k}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
          Locations and addresses: <Src id="locationsWiki" />, cross-checked against <Src id="mclHistory" />;
          coordinates geocoded from street addresses. Space deficit: <Src id="spaceFramework" />. Building need:{" "}
          <Src id="districtPresentation" />.
        </p>
      </Section>

      {/* ── 07 · world ── */}
      <Section
        id="world"
        eyebrow="07 · Against the best"
        title="There is no world ranking. There is a reach gap."
        lead="No credible league table of library systems exists, and circulation is too narrow a score. But the systems the report benchmarks all publish one number Portland cannot: what share of the public they actually reach."
      >
        <ReachCompare />
      </Section>

      {/* ── 08 · history ── */}
      <Section
        id="history"
        tone="warm"
        eyebrow="08 · 1864–2026"
        title="Access, widening in layers"
        lead="Dues to taxes, downtown to countywide, shelves to networks, English-only to culturally specific teams. Each expansion corrected an older limit and created a new responsibility, and each was also a decision about who counted."
      >
        <EraTimeline />
      </Section>

      {/* ── 09 · model ── */}
      <Section
        id="model"
        tone="dark"
        eyebrow="09 · What the library should become"
        title="One commons, three layers, five purposes"
        lead="Not a rename and not a rebrand. A performance standard for the institution that already exists, with books and reading kept at the root."
      >
        <CommonsDiagram />
      </Section>

      {/* ── 10 · measures ── */}
      <Section
        id="measures"
        eyebrow="10 · What 'world-leading' would have to prove"
        title="Six measures a Board could actually govern by"
        lead="The report's first draft had twelve domains and fixed 2040 targets. That is too many to govern and too early to set. Six Board-level measures, targets after the 2027 baseline, and three rules that stop a flagship or an average from hiding a branch."
      >
        <MeasuresTable />
      </Section>

      {/* ── 11 · approve ── */}
      <Section
        id="approve"
        tone="warm"
        eyebrow="11 · Who approves what"
        title="Five people, two hats, one intergovernmental agreement"
        lead="The Library District has its own tax authority and no board of its own: the County Commissioners sit as its board, and the District contracts with the County to run the library. To do anything, you need one of four yeses."
      >
        <ApprovalMap />
      </Section>

      {/* ── 12 · action ── */}
      <Section
        id="action"
        tone="dark"
        eyebrow="12 · What can actually be done"
        title="Endorse the direction. Fund nothing yet. Return in twelve months with evidence."
        lead="The vision is strong. The implementation package is not ready for a binding vote — there is no cost model, no representative baseline, no workforce agreement, no partner terms. The realistic path is a staged decision: what to approve now, what to require, and what to reserve."
      >
        <ActionPath />
      </Section>

      {/* ── 13 · roadmap ── */}
      <Section
        id="roadmap"
        eyebrow="13 · To 2040"
        title="Readiness, demonstration, scale, evidence"
        lead="Fourteen years in four phases, each with a gate the Board has to open. The claim at the end rests on results and equity, not a purchased award or a circulation ranking."
      >
        <RoadmapGantt />
      </Section>

      {/* ── 14 · method ── */}
      <Section
        id="method"
        tone="warm"
        eyebrow="14 · Method &amp; sources"
        title="How this was built"
        lead="Official Multnomah County and MCL histories, budgets, forecasts, audits, and program pages; State Library of Oregon statistics; the 2024 patron survey; international standards and benchmark systems' own reporting."
      >
        <div className="space-y-5">
          <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
            Derived figures on this page — per-resident and per-checkout costs, reach shares, incident
            share, materials cost per circulation — are simple division on cited numbers; the formula
            for each is in the page&apos;s source code. Historical statistics come from state
            fiscal-year records whose definitions change across years; pandemic and construction
            closures make visit trends especially hard to read. The patron survey is self-selected.
            International examples are practice benchmarks, not a ranking. Proposed 2040 targets are
            north stars requiring a representative baseline, community deliberation, and fiscal analysis
            before adoption, which is exactly what the readiness phase is for.
          </p>
          <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">
            The full report —{" "}
            <a href="/reports/portland-libraries-2026/Portland_Libraries_Deep_Dive_2026.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-canopy)] underline decoration-[var(--color-sage)]/60 underline-offset-2 hover:decoration-[var(--color-canopy)]">
              Portland Public Knowledge Commons (PDF)
            </a>{" "}
            — carries the full text, every citation, and the claim-source ledger behind this page.
          </p>
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">Sources</p>
            <ul className="mt-3 columns-1 gap-x-8 text-[14px] leading-relaxed text-[var(--color-ink-light)] sm:columns-2">
              {dedupeSources().map((s) => (
                <li key={s.url} className="break-inside-avoid">
                  <a href={s.url} target={s.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="underline decoration-[var(--color-sage)]/50 underline-offset-2 hover:text-[var(--color-canopy)]">
                    {s.org}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </article>
  );
}
