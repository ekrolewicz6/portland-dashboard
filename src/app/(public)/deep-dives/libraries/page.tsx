import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import ReadingProgress from "@/components/deep-dives/venues/ReadingProgress";
import { HEADLINE, SIX_PURPOSES, SOURCES, type Source } from "@/lib/libraries/data";
import Timeline from "@/components/deep-dives/libraries/Timeline";
import HybridTrend from "@/components/deep-dives/libraries/HybridTrend";
import GapTable from "@/components/deep-dives/libraries/GapTable";
import Benchmarks from "@/components/deep-dives/libraries/Benchmarks";
import FutureModel from "@/components/deep-dives/libraries/FutureModel";
import Scorecard from "@/components/deep-dives/libraries/Scorecard";
import Roadmap from "@/components/deep-dives/libraries/Roadmap";
import GovernanceApproval from "@/components/deep-dives/libraries/GovernanceApproval";
import SystemMap from "@/components/deep-dives/libraries/SystemMapLoader";

export const metadata: Metadata = pageMeta({
  title: "Portland already has a world-class library system. It hasn't decided what that means.",
  description:
    "19 locations, a $459M bond just finished, and 18.1 million checkouts a year — next to a 38% cardholder-household rate and a safety crisis staff are still recovering from. The full history, the honest gap, the map of every branch, who has to approve what, and a plan to 2040.",
  path: "/deep-dives/libraries",
  type: "article",
});

const NAV = [
  { id: "purpose", label: "What libraries are for" },
  { id: "history", label: "History" },
  { id: "hybrid", label: "The hybrid turn" },
  { id: "gap", label: "The gap" },
  { id: "map", label: "The map" },
  { id: "benchmarks", label: "Global lessons" },
  { id: "model", label: "The future model" },
  { id: "scorecard", label: "2040 scorecard" },
  { id: "roadmap", label: "Roadmap" },
  { id: "governance", label: "Who approves what" },
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

export default function LibrariesPage() {
  return (
    <article className="bg-[var(--color-paper)]">
      {/* ── hero ── */}
      <header className="noise-overlay relative overflow-hidden bg-[var(--color-canopy)] py-16 text-white sm:py-20">
        <div className={`relative z-10 ${DIVE_CONTAINER}`}>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
                <Link href="/deep-dives" className="hover:text-white">Policy deep-dive</Link> ——— Libraries & public knowledge infrastructure
              </p>
              <h1 className="mt-5 font-editorial-normal text-[38px] leading-[1.08] sm:text-[52px] xl:text-[60px]">
                Portland already has a world-class library system.
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  It hasn&apos;t decided what that means.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75">
                A $387 million bond just rebuilt the network — nineteen locations culminating in a
                95,000-square-foot flagship in Gresham. Checkouts are near record highs and digital
                borrowing has doubled since 2019. And still, only about 38% of households have an
                active card, staff safety collapsed after reopening, and two school programs quietly
                ended. This is the full history, the honest gap between hardware and outcomes, a map
                of every branch, exactly who has to approve what money and policy, and a plan to 2040.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#gap"
                  className="rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)]"
                >
                  See the gap
                </a>
                <a
                  href="#map"
                  className="rounded-sm border border-white/25 px-5 py-3 text-[14px] font-semibold text-white hover:bg-white/10"
                >
                  The map of every branch
                </a>
              </div>
            </div>

            <aside className="hidden rounded-sm border border-white/15 bg-white/[0.04] p-6 xl:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">
                The short version
              </p>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-[14px] font-semibold text-white">The good news</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    A once-in-a-generation capital rebuild just finished. The east–west space gap
                    the county documented in 2017 is corrected.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">The problem</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    Hardware outran operating capacity: reach, safety, and outcomes all lag the
                    buildings that now house them.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">The stakes</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    The levy is near its legal cap. Whether the next decade is spent stabilizing and
                    measuring, or defaulting to circulation as the only score, is a choice being made now.
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "Locations across the county", v: String(HEADLINE.locations) },
              { k: "Checkouts & renewals a year", v: `${HEADLINE.checkoutsM}M` },
              { k: "2020 bond, with premiums & other sources", v: `~$${HEADLINE.bondTotalHighM}M` },
              { k: "Households with an active card", v: `${HEADLINE.cardholderHouseholdPct}%` },
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

      {/* ── nav ── */}
      <nav className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/95 backdrop-blur print:hidden" aria-label="Section navigation">
        <ReadingProgress />
        <div className={DIVE_CONTAINER}>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-2 font-mono text-[12px] uppercase tracking-[0.08em]">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-3 py-3 text-[var(--color-ink-light)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-canopy)]"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── 1 · purpose ── */}
      <Section
        id="purpose"
        eyebrow="01 · What purpose have libraries served?"
        title="Never only one purpose"
        lead={
          <>
            The durable public-library idea: a place anyone can enter without buying anything,
            encounter knowledge beyond what the market would select for them, and exercise the
            practical freedoms of citizenship. Portland&apos;s own history shows six purposes
            layered on top of each other.
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {SIX_PURPOSES.map((p) => (
            <div key={p.title} className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
              <h3 className="font-editorial text-[19px] leading-snug text-[var(--color-ink)]">{p.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl rounded-sm border-l-[3px] border-l-[var(--color-clay)] bg-[var(--color-paper-warm)] p-5 text-[14px] leading-relaxed text-[var(--color-ink)]">
          That history is both democratic and disciplinary. Portland&apos;s library removed dues and
          extended service countywide — and its earlier librarians also decided which books and
          conduct counted as respectable, while Black and Native communities were displaced or
          excluded by public decisions. The lesson isn&apos;t that libraries failed. It&apos;s that
          publicness has to be continuously made, not merely declared.
        </p>
      </Section>

      {/* ── 2 · history ── */}
      <Section
        id="history"
        tone="warm"
        eyebrow="02 · 1864–2026"
        title="Access, widening in layers"
        lead="From a dues-supported reading room to a countywide, multilingual network — each expansion corrected an older limit and created a new responsibility."
      >
        <Timeline />
      </Section>

      {/* ── 3 · hybrid ── */}
      <Section
        id="hybrid"
        eyebrow="03 · The last fifteen years"
        title="The library now has two front doors"
        lead="A permanent district in 2012 ended decades of levy-to-levy politics. Then digital borrowing became a coequal system: more than doubling from FY2019 to FY2025 while physical visits, hit by the pandemic and rolling construction closures, still haven't recovered."
      >
        <HybridTrend />
        <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
          The FY2027 adopted operating budget is <strong className="text-[var(--color-ink)]">${HEADLINE.budgetM}M</strong>{" "}
          with <strong className="text-[var(--color-ink)]">{HEADLINE.fte}</strong> FTE. The levy rate
          sits at ${HEADLINE.levyRate.toFixed(2)}, close to the ${HEADLINE.levyCap.toFixed(2)} legal
          maximum — slow assessed-value growth, downtown value decline, and the operating needs of
          larger buildings produced a roughly $2M gap addressed through reductions this cycle.{" "}
          <Src id="fy2027Budget" /> · <Src id="stateLibraryStats" />
        </p>
      </Section>

      {/* ── 4 · gap ── */}
      <Section
        id="gap"
        eyebrow="04 · Where Portland is now — and the delta"
        title="Hardware outran operating capacity"
        lead="Portland's gap isn't a shortage of aspiration. It's the distance between the physical network just finished and the operating, safety, and outcome evidence that hasn't caught up. Nine domains, each read as current assets, evidence of the gap, and the move that would close it."
      >
        <GapTable />
        <p className="mt-6 max-w-3xl rounded-sm border-l-[3px] border-l-[var(--color-ember)] bg-white p-5 text-[14px] leading-relaxed text-[var(--color-ink)]">
          If Portland measures success mainly through circulation, it will underuse this investment.
          If it treats the library as a catch-all social-service site, it will burn out staff and
          blur accountability. The opportunity is a limited set of protected public purposes,
          organized systemwide, with partners enlisted where different expertise is required.
        </p>
      </Section>

      {/* ── 5 · map ── */}
      <Section
        id="map"
        tone="warm"
        eyebrow="05 · The system"
        title="Nineteen locations, one county"
        lead="Central and East County anchor the network as flagships; seventeen neighborhood commons carry the baseline everywhere else — from Northwest Portland to Troutdale, eighteen miles east."
      >
        <SystemMap />
        <p className="mt-5 max-w-3xl text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Locations and addresses: <Src id="locationsWiki" />, cross-checked against{" "}
          <Src id="mclHistory" /> and <Src id="newsFacts" />. Square footage and opening dates for
          Central and East County: <Src id="buildingProgram" />.
        </p>
      </Section>

      {/* ── 6 · benchmarks ── */}
      <Section
        id="benchmarks"
        eyebrow="06 · What the best systems teach"
        title="Practice benchmarks, not a ranking"
        lead="No authoritative 'best library system in the world' ranking exists — national datasets use different definitions, and high circulation can reflect access, culture, pricing, or counting rules as much as quality. Portland should benchmark practices and outcomes instead."
      >
        <Benchmarks />
      </Section>

      {/* ── 7 · model ── */}
      <Section
        id="model"
        tone="dark"
        eyebrow="07 · What Portland libraries should become"
        title="The Portland Public Knowledge Commons"
        lead="One commons, three mutually reinforcing layers, and five purposes that stay protected no matter what else the library takes on."
      >
        <FutureModel />
      </Section>

      {/* ── 8 · scorecard ── */}
      <Section
        id="scorecard"
        eyebrow="08 · What '#1 in the world' should mean"
        title="A public standard, not a slogan"
        lead="Portland should reject an opaque composite ranking. To claim world leadership credibly, it should meet a minimum standard in every domain, publish disaggregated results, and undergo independent review every three years. These are proposed north stars — the County should set final targets after a representative 2027 baseline."
      >
        <Scorecard />
      </Section>

      {/* ── 9 · roadmap ── */}
      <Section
        id="roadmap"
        tone="warm"
        eyebrow="09 · A practical path"
        title="2026 to 2040, in four stages"
        lead="Stabilize and measure, then operate the commons, then demonstrate outcomes, then earn the claim."
      >
        <Roadmap />
      </Section>

      {/* ── 10 · governance ── */}
      <Section
        id="governance"
        eyebrow="10 · Who approves what"
        title="One set of five commissioners governs all of it"
        lead="The Library District has its own tax authority and no elected board of its own. Money and policy both run through the County Board of Commissioners — which is exactly why the report proposes a formal, annual public accountability session."
      >
        <GovernanceApproval />
      </Section>

      {/* ── 11 · method ── */}
      <Section
        id="method"
        eyebrow="11 · Method &amp; sources"
        title="How this was built"
        lead="Official Multnomah County and MCL histories, budgets, audits, and program pages; State Library of Oregon and federal statistics; international library standards and benchmark systems' own reporting; and selected independent reporting."
      >
        <div className="space-y-5">
          <p className="max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            Historical statistics were calculated from state fiscal-year records; definitions change
            across years, and pandemic and construction closures make visit and program trends
            especially hard to interpret. The 2024 patron survey is self-selected and should not be
            read as representative of all residents. Current post-bond square footage and
            branch-level FY2026 performance were not available in audited form at publication.
            International examples are practice benchmarks, not a ranking. Proposed 2040 targets are
            strategic north stars requiring a representative baseline, community deliberation, and
            fiscal analysis before adoption.
          </p>
          <p className="max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            The full report —{" "}
            <a
              href="/reports/portland-libraries-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-canopy)] underline decoration-[var(--color-sage)]/60 underline-offset-2 hover:decoration-[var(--color-canopy)]"
            >
              Portland Public Knowledge Commons (PDF)
            </a>{" "}
            — carries the full text, every citation, and the claim-source ledger behind this page.
          </p>
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
              Sources
            </p>
            <ul className="mt-3 columns-1 gap-x-8 text-[12.5px] leading-relaxed text-[var(--color-ink-light)] sm:columns-2">
              {dedupeSources().map((s) => (
                <li key={s.url} className="break-inside-avoid">
                  <a
                    href={s.url}
                    target={s.url.startsWith("/") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--color-sage)]/50 underline-offset-2 hover:text-[var(--color-canopy)]"
                  >
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
