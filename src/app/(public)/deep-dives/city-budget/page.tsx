import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import { dataset, clientPayload } from "@/lib/city-budget/data.server";
import { fmtExact, fmtMoney, CLASS_LABEL } from "@/lib/city-budget/types";
import FlowDiagram from "@/components/deep-dives/city-budget/FlowDiagram";
import Reconciliation from "@/components/deep-dives/city-budget/Reconciliation";
import MoneyLadder from "@/components/deep-dives/city-budget/MoneyLadder";
import Priorities from "@/components/deep-dives/city-budget/Priorities";
import PeerCities from "@/components/deep-dives/city-budget/PeerCities";
import RevenueShift from "@/components/deep-dives/city-budget/RevenueShift";
import GeneralFundBridge from "@/components/deep-dives/city-budget/GeneralFundBridge";
import RevenueStructure from "@/components/deep-dives/city-budget/RevenueStructure";
import { COMPETING_TOTALS } from "@/lib/city-budget/comparisons";
import {
  GROSS_TOTAL,
  GROSS_TOTAL_PRIOR,
  YOY_CHANGE,
  YOY_PCT,
  EXTERNAL_REVENUE,
  BUREAU_EXPENSE,
  BEGINNING_BALANCE,
  FUND_TRANSFERS,
  PROGRAM_COUNT,
  BUREAU_COUNT,
  FUND_COUNT,
  TOTAL_FTE,
  SOURCE_DOCS,
  BUDGET_DOC,
  EXTRACTED_AT,
} from "@/lib/city-budget/summary";

export const metadata: Metadata = pageMeta({
  title: "Portland's $8.5 Billion, Line by Line",
  description:
    "Every dollar in the City of Portland's FY 2026-27 adopted budget — 83 funds, 286 programs, four years — traced from where it comes from to what it buys. Reconciled exactly to the City's published totals.",
  path: "/deep-dives/city-budget",
  type: "article",
});

const NAV = [
  { id: "flow", label: "The flow" },
  { id: "honest", label: "Three totals" },
  { id: "choices", label: "What we choose" },
  { id: "why", label: "Why so big" },
  { id: "peers", label: "Vs other cities" },
  { id: "revenue", label: "How we raise it" },
  { id: "shrinking", label: "Why it shrank" },
  { id: "cuts", label: "What changed" },
  { id: "everything", label: "Every program" },
  { id: "method", label: "Method" },
];

export default function CityBudgetPage() {
  const payload = clientPayload();

  // Biggest movers, FY25-26 revised -> FY26-27 adopted.
  const movers = dataset.bureaus
    .map((b) => ({
      name: b.name,
      area: b.serviceArea,
      prior: b.values[2] ?? 0,
      current: b.values[3] ?? 0,
      delta: (b.values[3] ?? 0) - (b.values[2] ?? 0),
    }))
    .filter((m) => m.prior > 0 || m.current > 0);
  const cuts = [...movers].sort((a, b) => a.delta - b.delta).slice(0, 8);
  const adds = [...movers].sort((a, b) => b.delta - a.delta).slice(0, 8);

  const objects = Object.entries(dataset.classTotals)
    .map(([cls, v]) => ({ cls, v: v[3] ?? 0 }))
    .filter((o) => o.v > 0)
    .sort((a, b) => b.v - a.v);
  const objTotal = objects.reduce((s, o) => s + o.v, 0);

  const failed = dataset.reconciliation.filter((r) => !r.passed);

  // Structural figures, derived from the same parsed data as everything else.
  const at = (v: (number | null)[]) => v[3] ?? 0;
  const programTotal = dataset.programs.reduce((s, p) => s + at(p.total), 0);
  const UTILITY_SLUGS = [
    "water-bureau",
    "bureau-of-environmental-services",
    "portland-bureau-of-transportation",
  ];
  const utilities = dataset.bureaus
    .filter((b) => UTILITY_SLUGS.includes(b.slug))
    .reduce((s, b) => s + at(b.values), 0);
  const pcef =
    dataset.funds.find((f) => /clean energy/i.test(f.name))?.expenseGrandTotal[3] ?? 0;
  const topFunds = [...dataset.funds]
    .sort((a, b) => (b.expenseGrandTotal[3] ?? 0) - (a.expenseGrandTotal[3] ?? 0))
    .slice(0, 10);
  const GF_DISCRETIONARY_SHARE = 803_400_000 / GROSS_TOTAL;

  return (
    <article className="bg-[var(--color-paper)]">
      {/* ── hero ── */}
      <header className="noise-overlay relative overflow-hidden bg-[var(--color-canopy)] py-16 text-white sm:py-20">
        <div className={DIVE_CONTAINER}>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
                Policy deep-dive ——— City finances
              </p>
              <h1 className="mt-5 font-editorial-normal text-[40px] leading-[1.05] sm:text-[56px] xl:text-[64px]">
                Portland&apos;s $8.5 billion.
                <span className="block italic text-[var(--color-ember-bright)]">
                  Line by line.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/80">
                The City publishes its budget as {SOURCE_DOCS.reduce((s, d) => s + (d.pages ?? 0), 0)}{" "}
                pages of PDF. We parsed all of it — {FUND_COUNT} funds, {PROGRAM_COUNT} programs,
                four fiscal years — and reconciled it to the dollar against the City&apos;s own
                published totals. This page traces every dollar from where it comes from to what it
                buys, and you can read the exact figure for any line.
              </p>
            </div>

            <aside className="self-start rounded-sm border border-white/15 bg-white/[0.04] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">
                The short version
              </p>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-[13px] font-semibold text-white">The headline number</dt>
                  <dd className="text-[14px] leading-relaxed text-white/70">
                    {fmtExact(GROSS_TOTAL)} — but it counts a dollar again every time it moves
                    between city funds.
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-white">New money</dt>
                  <dd className="text-[14px] leading-relaxed text-white/70">
                    {fmtExact(EXTERNAL_REVENUE)} actually arrives from outside the City this year.
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-white">The direction</dt>
                  <dd className="text-[14px] leading-relaxed text-white/70">
                    Down {fmtMoney(Math.abs(YOY_CHANGE))} ({Math.abs(YOY_PCT).toFixed(1)}%)
                    against last year&apos;s <em>revised</em> budget — the City&apos;s own
                    comparison. Adopted-to-adopted it is about 1%. Either way, it is shrinking.
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "Total budget", v: fmtMoney(GROSS_TOTAL) },
              { k: "Programs traced", v: String(PROGRAM_COUNT) },
              { k: "Bureaus", v: String(BUREAU_COUNT) },
              { k: "Full-time equivalents", v: Number(TOTAL_FTE).toLocaleString("en-US") },
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

          <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-white/45">
            Positions are counted in full-time equivalents, which is why the total isn&apos;t a
            whole number: a half-time job counts as 0.5, and a person split across two programs is
            counted in fractions against each. {Number(TOTAL_FTE).toLocaleString("en-US")} FTE is
            therefore a measure of funded working hours, not a headcount of people.
          </p>
        </div>
      </header>

      {/* ── sticky nav ── */}
      <nav className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/95 backdrop-blur">
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

      {/* ── the flow ──
          Deliberately NOT wrapped in <Section>: its sticky left rail would take
          a quarter of the width, and a Sankey of this density needs every pixel. */}
      <section id="flow" className="scroll-mt-24 py-12 sm:py-14 xl:py-16">
        <div className={DIVE_CONTAINER}>
          <div className="mb-8 grid gap-x-10 gap-y-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ember)]">
                The whole budget
              </p>
              <h2 className="mt-2 font-editorial text-[32px] leading-tight text-[var(--color-canopy)] sm:text-[40px]">
                Follow the money
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
                Every band is a real figure from the budget book. Click one to pin it and read the
                exact number; click a bureau to open its programs in place, without losing sight of
                the whole city.
              </p>
            </div>
            <p className="self-end text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
              The budget book never says which revenue dollar pays for which program, so the
              diagram doesn&apos;t pretend to know — sources and uses meet at a single hub.
              Downstream of that, the hierarchy <em>is</em> published, so it fans out in full.
            </p>
          </div>

          <FlowDiagram data={payload} />
        </div>
      </section>

      {/* ── three totals ── */}
      <Section
        id="honest"
        tone="warm"
        eyebrow="Why the number keeps changing"
        title="Portland has three budgets, and all three are true"
        lead={
          <>
            Quote {fmtMoney(GROSS_TOTAL)} and you&apos;re using the City&apos;s official figure.
            Quote {fmtMoney(EXTERNAL_REVENUE)} and you&apos;re describing money that actually
            arrives. Quote {fmtMoney(BUREAU_EXPENSE)} and you mean what bureaus spend doing things.
            The arithmetic between them:
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            {fmtMoney(BEGINNING_BALANCE)} of the headline is money carried over from prior years,
            and {fmtMoney(FUND_TRANSFERS)} is funds paying each other. Neither is new money, and
            both are counted on both sides.
          </p>
        }
      >
        <Reconciliation />
      </Section>

      {/* ── what it says about priorities ── */}
      <Section
        id="choices"
        eyebrow="What the money says"
        title="A budget's priorities live in the money you can move"
        lead={
          <>
            Most of Portland&apos;s budget arrives already spoken for — a water rate can only fund
            water, a federal grant only its grant. Judge the City by its whole budget and you learn
            what it <em>operates</em>. Judge it by the discretionary General Fund and you learn what
            it <em>chose</em>. The two look nothing alike.
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Both columns come from the same program pages, split by whether the funding line is
            General Fund discretionary. No modelling or allocation is involved.
          </p>
        }
      >
        <Priorities />

        <div className="mt-8">
          <GeneralFundBridge />
        </div>
      </Section>

      {/* ── structure ── */}
      <Section
        id="why"
        tone="warm"
        eyebrow="Why the number is so large"
        title="Portland's budget is mostly a utility company"
        lead={
          <>
            Portland looks expensive next to other cities largely because it owns things other
            cities don&apos;t. Water, sewers and streets are inside the city budget here, funded by
            rates and gas taxes rather than by taxes Council can redirect.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              k: `${((utilities / programTotal) * 100).toFixed(0)}%`,
              t: "is water, sewer and streets",
              d: `${fmtMoney(utilities)} of program spending runs the Water Bureau, Environmental Services and Transportation. Most of it is paid by ratepayers through utility bills, not by taxpayers, and by law it cannot be spent on anything else.`,
            },
            {
              k: `${((GF_DISCRETIONARY_SHARE) * 100).toFixed(0)}%`,
              t: "is genuinely discretionary",
              d: `Roughly ${fmtMoney(803_400_000)} of the ${fmtMoney(GROSS_TOTAL)} headline is money Council allocates each year. Every debate about "the city budget" is really a debate about this sliver.`,
            },
            {
              k: fmtMoney(pcef),
              t: "sits in the Clean Energy Fund",
              d: "The Portland Clean Energy Community Benefits Fund — a voter-created surcharge on large retailers — is now larger than the entire Transportation operating budget. Few American cities have anything like it.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-[var(--color-canopy)]">
                {c.k}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-[var(--color-ink)]">{c.t}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                {c.d}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ember)]">
            The ten largest funds
          </h3>
          <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            A fund is a legally separate pot with its own rules about what it may pay for. Portland
            has {FUND_COUNT} of them. Ranking them is a faster read on the City&apos;s structure
            than any org chart:
          </p>
          <div className="space-y-2.5">
            {topFunds.map((f) => (
              <div key={f.slug}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] text-[var(--color-ink)]">
                    {f.name}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[var(--color-ink)]">
                    {fmtExact(f.expenseGrandTotal[3] ?? 0)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                  <div
                    className="h-full rounded-sm bg-[var(--color-canopy)]"
                    style={{
                      width: `${((f.expenseGrandTotal[3] ?? 0) / (topFunds[0].expenseGrandTotal[3] ?? 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── peers ── */}
      <Section
        id="peers"
        eyebrow="Against other cities"
        title="Portland spends more per resident than Seattle — which owns a power company"
        lead={
          <>
            Every per-capita comparison of city budgets is a trap, because cities draw their
            boundaries in different places. But one comparison survives the caveats: Portland
            budgets about $13,500 per resident against Seattle&apos;s $11,400 — and Seattle&apos;s
            number carries a $1.8&nbsp;billion municipal electric utility that Portland
            doesn&apos;t own at all. Owning the water pipes explains why Portland outspends Denver
            or Boston. It does not explain Seattle.
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Peer figures are adopted or proposed budgets from each city&apos;s own published
            documents, with populations from the Census Bureau&apos;s 2025 estimates. Sources are
            linked in the method section.
          </p>
        }
      >
        <PeerCities />
      </Section>

      {/* ── revenue structure ── */}
      <Section
        id="revenue"
        tone="warm"
        eyebrow="The revenue side"
        title="Portland taxes profits because it isn't allowed to tax purchases"
        lead={
          <>
            The biggest structural difference between Portland and its peers isn&apos;t what it
            spends money on — it&apos;s where the money comes from. Oregon bars sales taxes at both
            the state and local level, so the instrument Denver uses for more than half its general
            fund simply doesn&apos;t exist here. What Portland leans on instead is far more
            volatile.
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Peer sales-tax shares come from each city&apos;s own budget documents; Portland&apos;s
            business-tax and property-tax figures come from the City Budget Office forecast and
            Multnomah County&apos;s assessment summary. All linked inline.
          </p>
        }
      >
        <RevenueStructure />
      </Section>

      {/* ── why it shrank ── */}
      <Section
        id="shrinking"
        eyebrow="Where the money went"
        title="The tax base didn't collapse. The federal money ran out."
        lead={
          <>
            A budget falling 5.5% sounds like a city in decline. The revenue table says something
            more specific: everything Portland raises itself went <em>up</em>. What disappeared was
            intergovernmental aid — the pandemic-era federal money that had been quietly paying for
            ongoing programs — landing at the same moment the City stopped covering the gap out of
            savings.
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Both columns are the City&apos;s own resources table, FY2025-26 revised against
            FY2026-27 adopted. Internal money is separated out because it moves the headline total
            without being revenue gained or lost.
          </p>
        }
      >
        <RevenueShift />
      </Section>

      {/* ── what changed ── */}
      <Section
        id="cuts"
        eyebrow="Year over year"
        title={`The budget shrank ${Math.abs(YOY_PCT).toFixed(1)}% this year`}
        lead={
          <>
            From {fmtExact(GROSS_TOTAL_PRIOR)} revised last year to {fmtExact(GROSS_TOTAL)}{" "}
            adopted — a fall of {fmtExact(Math.abs(YOY_CHANGE))}. That is the City&apos;s own
            framing, and it compares against a <em>revised</em> figure that grew during the year;
            measured adopted-against-adopted the drop is closer to 1%. The cuts underneath are
            real either way — Council closed a $171.6&nbsp;million gap, and about 100 people lost
            their jobs. Which bureaus absorbed it:
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <MoverTable title="Largest decreases" rows={cuts} tone="down" />
          <MoverTable title="Largest increases" rows={adds} tone="up" />
        </div>

        <div className="mt-8 rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ember)]">
            What the money buys
          </h3>
          <div className="space-y-3">
            {objects.map((o) => (
              <div key={o.cls}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-[var(--color-ink-light)]">
                    {CLASS_LABEL[o.cls] ?? o.cls}
                  </span>
                  <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--color-ink)]">
                    {fmtExact(o.v)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                  <div
                    className="h-full rounded-sm bg-[var(--color-canopy)]"
                    style={{ width: `${(o.v / objTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── every program ── */}
      <Section
        id="everything"
        eyebrow="The exhaustive list"
        title="Every program the City funds"
        lead={
          <>
            The diagram shows proportion; this shows the number. All {PROGRAM_COUNT} programs,
            nested under their bureau and service area, with the exact adopted figure and staffing
            for each. It opens without JavaScript and your browser&apos;s find-in-page works on it.
          </>
        }
      >
        <MoneyLadder />
      </Section>

      {/* ── method ── */}
      <Section
        id="method"
        tone="dark"
        eyebrow="How this was built"
        title="Every check we ran, including the ones that only partly passed"
        lead={
          <>
            These figures come from parsing the City&apos;s own budget PDFs, not from retyping
            summary tables. That&apos;s only trustworthy if the parse is verified, so here is the
            full audit — published whether it flatters the result or not.
          </>
        }
      >
        <div className="rounded-sm bg-[var(--color-paper)] p-5 sm:p-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                k: "Reconciliation",
                v: `${dataset.reconciliation.filter((r) => r.passed).length}/${dataset.reconciliation.length}`,
                d: "checks passed",
              },
              { k: "Exact match", v: fmtExact(GROSS_TOTAL), d: "against the City's published total" },
              { k: "Extracted", v: EXTRACTED_AT, d: "from PDFs published Aug 2026" },
            ].map((s) => (
              <div key={s.k} className="rounded-sm border border-[var(--color-parchment)] bg-white p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                  {s.k}
                </p>
                <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-[var(--color-canopy)]">
                  {s.v}
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)]">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead>
                <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                  <th className="py-2 pr-3">Check</th>
                  <th className="py-2 pr-3">Expected</th>
                  <th className="py-2 pr-3">Found</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-parchment)]">
                {dataset.reconciliation.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3 align-top">
                      <span className="block text-[var(--color-ink)]">{r.title}</span>
                      {r.detail && !r.passed && (
                        <span className="block text-[11px] text-[var(--color-ink-muted)]">
                          {r.detail}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 align-top font-mono tabular-nums text-[var(--color-ink-light)]">
                      {r.expected ?? "—"}
                    </td>
                    <td className="py-2 pr-3 align-top font-mono tabular-nums text-[var(--color-ink-light)]">
                      {r.actual ?? "—"}
                    </td>
                    <td className="py-2 align-top">
                      <span
                        className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                          r.passed
                            ? "bg-[#e3efe7] text-[var(--color-fern)]"
                            : "bg-[#f6e7df] text-[var(--color-clay)]"
                        }`}
                      >
                        {r.passed ? "pass" : r.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-[var(--color-parchment)] pt-5">
            <h3 className="mb-2 text-[14px] font-semibold text-[var(--color-ink)]">
              The City publishes three different totals for this budget
            </h3>
            <p className="mb-3 max-w-3xl text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
              They differ by up to $9.2 million. None is wrong; they are drawn at different moments
              and on slightly different bases. We use the second because our independently parsed
              fund detail reproduces it to the dollar — but a reader quoting the ordinance is also
              quoting an official figure, and should not be told they are mistaken.
            </p>
            <ul className="mb-5 space-y-2">
              {COMPETING_TOTALS.map((t) => (
                <li key={t.label} className="text-[12.5px] leading-relaxed">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-semibold tabular-nums text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
                  >
                    {fmtExact(t.value)}
                  </a>
                  <span className="text-[var(--color-ink-light)]"> — {t.label}. {t.what}</span>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-[14px] font-semibold text-[var(--color-ink)]">
              What this does not claim
            </h3>
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
              <li>
                The budget book does not publish which revenue source funds which program, so the
                diagram routes sources and uses through one hub instead of inventing that link.
              </li>
              <li>
                FY 2025-26 is a <em>revised</em> budget that kept moving during the year; the fund
                pages and the citywide summary were compiled weeks apart, so prior-year comparisons
                quote the City&apos;s published figure rather than our sum of fund pages.
              </li>
              <li>
                Adopted figures are a plan, not a record of spending. Only the two actuals columns
                describe money that was really spent.
              </li>
              {failed.length > 0 && (
                <li>
                  {failed.length} check{failed.length === 1 ? "" : "s"} above did not fully pass; the
                  variance is shown rather than smoothed over.
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6 border-t border-[var(--color-parchment)] pt-5">
            <h3 className="mb-2 text-[14px] font-semibold text-[var(--color-ink)]">Sources</h3>
            <ul className="space-y-2">
              {SOURCE_DOCS.map((d) => (
                <li key={d.url} className="text-[12px] leading-relaxed">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
                  >
                    {d.title}
                  </a>
                  <span className="text-[var(--color-ink-muted)]">
                    {" "}
                    — {d.pages} pp · sha256 {d.sha256?.slice(0, 12)}…
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-ink-muted)]">
              {BUDGET_DOC}. Checksums are recorded so a silently revised document is detected rather
              than quietly changing the numbers on this page.
            </p>
          </div>
        </div>
      </Section>
    </article>
  );
}

function MoverTable({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { name: string; area: string; prior: number; current: number; delta: number }[];
  tone: "up" | "down";
}) {
  const max = Math.max(...rows.map((r) => Math.abs(r.delta)), 1);
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ember)]">
        {title}
      </h3>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] text-[var(--color-ink)]">{r.name}</span>
              <span
                className={`shrink-0 font-mono text-[13px] font-semibold tabular-nums ${
                  tone === "down" ? "text-[var(--color-clay)]" : "text-[var(--color-fern)]"
                }`}
              >
                {r.delta >= 0 ? "+" : "−"}
                {fmtMoney(Math.abs(r.delta))}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${(Math.abs(r.delta) / max) * 100}%`,
                  backgroundColor: tone === "down" ? "#b85c3a" : "#3d7a5a",
                }}
              />
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">
              {fmtMoney(r.prior)} → {fmtMoney(r.current)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
