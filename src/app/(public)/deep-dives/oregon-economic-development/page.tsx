import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Mail, MessageSquare } from "lucide-react";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import {
  BudgetChart,
  IncentiveRoiChart,
  MethodologyToggle,
  ScorecardChart,
} from "@/components/deep-dives/oregon-economy/Charts";
import {
  CAVEATS,
  CNBC_RANK,
  COMMERCE_PROPOSAL,
  CONTESTED_EVIDENCE,
  COUNCIL_CAMPS,
  DIAGNOSIS,
  FRONT_DOOR,
  HEADLINE_STATS,
  INTEL_SIP,
  NAV,
  OTHER_KPMS,
  PEER_STATES,
  PEER_TAKEAWAY,
  SCHOOL_COST,
  SCOREBOARD_NOTE,
  SERIOUS_BAR,
  SOURCES,
  STATEWIDE_INCENTIVE,
  SURVEY,
  TARGETS_CUT,
  TLDR_POINTS,
  TRADEOFFS,
  type SourceKey,
} from "@/lib/oregon-economy/data";
import { fmtDollars, fmtUSD } from "@/lib/oregon-economy/engine";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Is Oregon serious about its own economy?",
  description:
    "Governor Kotek's Prosperity Council wants to blow up Business Oregon and build a Department of Commerce. A data deep dive into the case against the agency, and the asterisks the headline numbers hide.",
  path: "/deep-dives/oregon-economic-development",
  type: "article",
});

const SOURCE_ENTRIES = Object.entries(SOURCES) as Array<[SourceKey, (typeof SOURCES)[SourceKey]]>;

function MiniKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
      {children}
    </p>
  );
}

function SourceLink({ id, children, tone = "light" }: { id: SourceKey; children?: ReactNode; tone?: "light" | "dark" }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-semibold underline underline-offset-4 transition-colors ${
        tone === "dark"
          ? "text-[var(--color-ember-bright)] decoration-[var(--color-ember-bright)]/40 hover:text-white"
          : "text-[var(--color-canopy)] decoration-[var(--color-sage)]/40 hover:text-[var(--color-ember)]"
      }`}
    >
      {children ?? s.org}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function StatCard({ value, label, source }: { value: string; label: string; source: SourceKey }) {
  return (
    <div className="rounded-sm border border-white/12 bg-white/[0.055] p-5 backdrop-blur-sm">
      <p className="break-words font-mono text-[28px] font-bold leading-none tracking-tight text-white tabular-nums [overflow-wrap:anywhere] sm:text-[32px]">
        {value}
      </p>
      <p className="mt-3 text-[12px] leading-snug text-white/62">{label}</p>
      <a href={SOURCES[source].url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 underline-offset-2 hover:text-[var(--color-ember-bright)] hover:underline">
        {SOURCES[source].org}
      </a>
    </div>
  );
}

const FIX_TONE = {
  yes: { label: "A reorg can fix this", className: "border-[var(--color-sage)] bg-[var(--color-sage-tint)] text-[var(--color-canopy)]" },
  partly: { label: "A reorg might help", className: "border-[#d6a15f] bg-[#fff8ea] text-[#80511b]" },
  no: { label: "A reorg won't fix this", className: "border-[#df9b86] bg-[var(--color-clay-tint)] text-[var(--color-clay)]" },
} as const;

const PEER_TONE = {
  positive: "border-[var(--color-sage)] bg-[var(--color-sage-tint)]",
  caution: "border-[#f0b6a8] bg-[var(--color-clay-tint)]",
  mixed: "border-[var(--color-parchment)] bg-white",
} as const;

export default function OregonEconomicDevelopmentPage() {
  const structural = DIAGNOSIS.filter((d) => d.kind === "structural");
  const execution = DIAGNOSIS.filter((d) => d.kind === "execution");

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-canopy)] text-white noise-overlay">
        <div className="absolute right-[-20%] top-[-20%] h-[760px] w-[760px] rounded-full bg-[var(--color-sage)]/20 blur-[170px]" />
        <div className="absolute bottom-[-28%] left-[-12%] h-[520px] w-[520px] rounded-full bg-[var(--color-ember)]/16 blur-[140px]" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-20 xl:py-24`}>
          <Link href="/deep-dives" className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/70 transition-colors hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Deep Dives
          </Link>

          <div className="mt-10 grid items-end gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember-bright)]">
                <span>Economy</span>
                <span className="h-px w-8 bg-[var(--color-ember)]/60" />
                <span>Government</span>
                <span className="h-px w-8 bg-[var(--color-ember)]/60" />
                <span>Accountability</span>
              </div>
              <h1 className="mt-7 max-w-5xl font-editorial-normal text-[44px] leading-[1.0] tracking-tight sm:text-[60px] lg:text-[76px]">
                Is Oregon serious about{" "}
                <span className="font-editorial italic text-[var(--color-ember-bright)]">its own economy?</span>
              </h1>
              <p className="mt-7 max-w-3xl text-[18px] leading-relaxed text-white/76 sm:text-[20px]">
                Governor Kotek&apos;s Prosperity Council is poised to recommend blowing up Business Oregon and
                building a &ldquo;Department of Commerce.&rdquo; The case against the agency is real. So are the
                asterisks the headline numbers hide. This is the evidence — you be the judge before the
                recommendations land on June 25.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#scorecard" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember-bright)] px-5 py-3 text-[14px] font-bold text-[var(--color-canopy)] transition-colors hover:bg-white">
                  See the scorecard
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#peer-states" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/18 bg-white/[0.06] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:border-white/40 hover:bg-white/[0.1]">
                  Would a reorg fix it?
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {HEADLINE_STATS.map((stat) => (
                  <StatCard key={stat.label} value={stat.value} label={stat.label} source={stat.source} />
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-white/12 bg-white/[0.06] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <MiniKicker>The story in one number</MiniKicker>
              <h2 className="mt-3 font-editorial text-[28px] leading-tight text-white">
                They missed the goal for years. So they moved the goal — then cleared it by eight jobs.
              </h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-black/10 p-3">
                  <p className="text-[13px] text-white/70">Job goal, 2020-2023</p>
                  <p className="font-mono text-[20px] font-bold text-white/90 tabular-nums">~1,200</p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-sm border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/10 p-3">
                  <p className="text-[13px] text-white/80">Goal after the cut</p>
                  <p className="font-mono text-[20px] font-bold text-[var(--color-ember-bright)] tabular-nums">800</p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-black/10 p-3">
                  <p className="text-[13px] text-white/70">Jobs created, 2025</p>
                  <p className="font-mono text-[20px] font-bold text-white tabular-nums">808</p>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-white/55">
                A &ldquo;win&rdquo; by eight jobs, against a bar cut by a third, the year Oregon&apos;s private
                sector lost ~6,500 jobs. Source:{" "}
                <SourceLink id="appr2025" tone="dark">Business Oregon performance report</SourceLink>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 60-second version */}
      <section className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className={`${DIVE_CONTAINER} py-10 sm:py-12`}>
          <div className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
            <div>
              <MiniKicker>The 60-second version</MiniKicker>
              <h2 className="mt-3 font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[36px]">
                If you read nothing else.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
                The rest of the page shows you the primary sources behind every line, and the caveats reformers
                tend to skip.
              </p>
            </div>
            <ol className="grid gap-3">
              {TLDR_POINTS.map((point, i) => (
                <li key={point} className="-mx-4 flex gap-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-canopy)] font-mono text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed text-[var(--color-ink)]">{point}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <nav aria-label="Section navigation" className="sticky top-14 z-40 border-b border-[var(--color-parchment)] bg-[var(--color-paper)]/92 backdrop-blur-md">
        <div className={`${DIVE_CONTAINER} flex gap-2 overflow-x-auto py-3`}>
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="whitespace-nowrap rounded-full border border-[var(--color-parchment)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--color-ink-light)] transition-colors hover:border-[var(--color-sage)] hover:text-[var(--color-canopy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        {/* Scorecard */}
        <Section
          id="scorecard"
          eyebrow="The scorecard"
          title="The case against Business Oregon starts with one chart."
          lead="The agency's headline measure is jobs created at the firms it funds. It missed that target for years, and the fix was to cut the target. Here is the evidence, straight from the state's own performance report."
          tone="warm"
        >
          <ScorecardChart />

          {/* It wasn't just the jobs goal — multiple targets were cut before the "100% green" year */}
          <div className="mt-6 -mx-4 border-y border-[var(--color-ember)]/30 bg-[var(--color-clay-tint)] p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
              It wasn&apos;t just the jobs goal
            </p>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink)]">
              Heading into the year it declared{" "}
              <span className="font-semibold">&ldquo;100% of targets met,&rdquo;</span> Business Oregon had quietly
              lowered at least three of those targets:
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3">
              {TARGETS_CUT.map((t) => (
                <div key={t.kpm} className="rounded-sm border border-[var(--color-ember)]/25 bg-white p-3">
                  <p className="text-[13px] font-semibold leading-snug text-[var(--color-ink)]">{t.kpm}</p>
                  <p className="mt-1.5 font-mono text-[16px] font-bold tabular-nums">
                    <span className="text-[var(--color-ink-muted)]">{t.from}</span>
                    <span className="px-1 text-[var(--color-ink-muted)]">→</span>
                    <span className="text-[var(--color-clay)]">{t.to}</span>
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px]">
              <SourceLink id="appr2025">FY2025 performance report</SourceLink>
            </p>
          </div>

          <div className="mt-5 -mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <MiniKicker>The honest read</MiniKicker>
            <h3 className="mt-2 font-editorial text-[24px] leading-tight text-[var(--color-ink)]">
              In 2025 it hit &ldquo;100% of targets.&rdquo; Read the asterisks.
            </h3>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              A fair verdict has to hold both sides. The agency does beat most of its ten measures, but several of
              those wins lean on one-time COVID money, a separate scorecard, or a target that was quietly lowered.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {OTHER_KPMS.map((k) => (
                <div key={k.name} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-bold leading-snug text-[var(--color-ink)]">{k.name}</p>
                    <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] ${k.verdict === "beat" ? "border-[var(--color-sage)] bg-[var(--color-sage-tint)] text-[var(--color-canopy)]" : "border-[#df9b86] bg-[var(--color-clay-tint)] text-[var(--color-clay)]"}`}>
                      {k.verdict === "beat" ? "Beat" : "Missed"}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[14px] font-bold text-[var(--color-ink)]">{k.value}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-ink-light)]">{k.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{SCOREBOARD_NOTE}</p>
          </div>
        </Section>

        {/* Methodology */}
        <Section
          id="methodology"
          eyebrow="The asterisk"
          title="Before you say “nine of ten years,” read this."
          lead="The most-repeated line about Business Oregon, that it failed its mission nine of the past ten years, quietly mixes two different ways of counting. Here is the catch the headline skips."
        >
          <MethodologyToggle />
        </Section>

        {/* The hidden tools / incentives */}
        <Section
          id="metric"
          eyebrow="The hidden tools"
          title="The agency is judged on its smallest lever."
          lead="The jobs scorecard only counts firms that get a direct check. Oregon's biggest economic-development tools, the property-tax breaks for Intel and the data-center giants, aren't in it at all. They show up somewhere else: on the property-tax bill schools never get to send."
          tone="warm"
        >
          <div className="-mx-4 border-y border-[var(--color-parchment)] bg-[var(--color-canopy)] p-4 text-white sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-white">
                  ~{fmtUSD(STATEWIDE_INCENTIVE.perYear)}<span className="text-[16px] font-normal text-white/55">/yr</span>
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/72">
                  in property tax Oregon gives up to the Intel SIP and enterprise zones — counting state and all
                  local districts. Schools alone forgo {fmtUSD(SCHOOL_COST.y2024)} of it.
                </p>
              </div>
              <div>
                <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-white">{fmtDollars(SCHOOL_COST.dataCenterPerJob)}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/72">
                  per job at the data centers that captured two-thirds of one enterprise-zone program — averaging
                  about $7.6M each.
                </p>
              </div>
              <div>
                <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-white">{INTEL_SIP.taxBreak}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/72">
                  Intel&apos;s flagship Strategic Investment Program break. {INTEL_SIP.mechanic}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-sm border border-white/12 bg-black/15 p-3.5">
              <p className="text-[13px] leading-relaxed text-white/75">{INTEL_SIP.context}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
              <SourceLink id="dorTaxExp" tone="dark">DOR tax-expenditure report</SourceLink>
              <SourceLink id="goodJobsFirst" tone="dark">School tax-break study</SourceLink>
              <SourceLink id="opbDataCenters" tone="dark">Data-center breaks</SourceLink>
              <SourceLink id="intelSip" tone="dark">Intel SIP agreement</SourceLink>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <IncentiveRoiChart />
            <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
              <MiniKicker>Where the money went</MiniKicker>
              <h3 className="mt-2 font-editorial text-[24px] leading-tight text-[var(--color-ink)]">
                Three districts, one big bill.
              </h3>
              <div className="mt-4 grid gap-3">
                {SCHOOL_COST.districts.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-3 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-3">
                    <p className="text-[14px] font-semibold text-[var(--color-ink)]">{d.name}</p>
                    <p className="font-mono text-[18px] font-bold tabular-nums text-[var(--color-clay)]">{fmtUSD(d.millions)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                This is the &ldquo;diffuse focus&rdquo; the reform draft names, made concrete: the agency is graded on
                490 directly-funded jobs while billions in tax breaks, its biggest bets, sit outside the scorecard.
              </p>
            </div>
          </div>
        </Section>

        {/* The $1B decoded */}
        <Section
          id="budget"
          eyebrow="Follow the billion"
          title="“$1 billion a year” is the most misleading number about this agency."
          lead="You will hear that Business Oregon spends more than a billion dollars a year. It's a biennial figure, and most of it is bonded infrastructure money that passes through the agency to water and sewer projects. The part that actually runs the agency is a rounding error by comparison."
        >
          <BudgetChart />
        </Section>

        {/* The front door */}
        <Section
          id="front-door"
          eyebrow="The front door"
          title="You can see the problem on the homepage."
          lead="Forget the budget tables for a second. Look at the agency's website the way a CEO deciding where to build a factory would. Then look at a state that treats its site as a sales tool. The contrast is the whole story in one screen."
          tone="warm"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="-mx-4 border-y border-[#f0b6a8] bg-[var(--color-clay-tint)] p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)]">Business Oregon</p>
              <p className="mt-2 font-editorial text-[24px] leading-tight text-[var(--color-ink)]">{FRONT_DOOR.oregonHero}</p>
              <p className="mt-2 text-[13px] italic leading-snug text-[var(--color-ink-muted)]">CTA: &ldquo;{FRONT_DOOR.oregonCta}&rdquo;</p>
            </div>
            <div className="-mx-4 border-y border-[var(--color-sage)] bg-[var(--color-sage-tint)] p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-canopy)]">JobsOhio (for contrast)</p>
              <p className="mt-2 font-editorial text-[24px] leading-tight text-[var(--color-ink)]">{FRONT_DOOR.ohioHero}</p>
              <p className="mt-2 text-[13px] italic leading-snug text-[var(--color-ink-muted)]">CTA: &ldquo;{FRONT_DOOR.ohioCta}&rdquo;</p>
            </div>
          </div>

          <div className="mt-5 -mx-4 overflow-hidden border-y border-[var(--color-parchment)] bg-white sm:mx-0 sm:rounded-sm sm:border">
            {FRONT_DOOR.rows.map((row, i) => (
              <div key={row.label} className={`grid gap-px sm:grid-cols-[0.7fr_1.3fr_1.3fr] ${i > 0 ? "border-t border-[var(--color-parchment)]" : ""}`}>
                <div className="bg-[var(--color-paper-warm)] p-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  {row.label}
                </div>
                <div className="p-4 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-clay)] sm:hidden">Oregon</span>
                  {row.oregon}
                </div>
                <div className="border-t border-[var(--color-parchment)] p-4 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:border-t-0 sm:border-l">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-canopy)] sm:hidden">Ohio</span>
                  {row.ohio}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 -mx-4 border-y border-[var(--color-ember)]/30 bg-[var(--color-clay-tint)] p-5 sm:mx-0 sm:rounded-sm sm:border">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">Why the front door is the tell</p>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink)]">{FRONT_DOOR.verdict}</p>
            <p className="mt-3 text-[13px]"><SourceLink id="bizOregonSite">See Business Oregon&apos;s site</SourceLink> · <SourceLink id="jobsOhio">See JobsOhio</SourceLink></p>
          </div>
        </Section>

        {/* Structure vs execution */}
        <Section
          id="diagnosis"
          eyebrow="The real question"
          title="Is this a structure problem or an execution problem?"
          lead="A reorganization can fix a broken org chart. It cannot, by itself, make an agency answer the phone, rebuild its website, or set an honest target. So it's worth sorting Business Oregon's problems into the ones a “Department of Commerce” would actually touch, and the ones it wouldn't."
        >
          <div className="-mx-4 mb-5 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
              The decline is real, too — Oregon&apos;s business rank fell hard (CNBC, 2019 → 2025)
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
              {CNBC_RANK.map((r) => (
                <div key={r.metric} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-3 text-center">
                  <p className="font-mono text-[16px] font-bold tabular-nums text-[var(--color-ink)] sm:text-[18px]">
                    #{r.y2019} → <span className="text-[var(--color-clay)]">#{r.y2025}</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--color-ink-light)]">{r.metric}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px]"><SourceLink id="cnbc">CNBC, via Business Oregon&apos;s own legislative deck</SourceLink></p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5 xl:p-6 2xl:p-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-canopy)] xl:text-[12px] 2xl:text-[13px]">Structural — about the system</p>
              <div className="mt-4 grid gap-3 xl:mt-5 xl:gap-4">
                {structural.map((d) => {
                  const Icon = d.icon;
                  const tone = FIX_TONE[d.fixedByReorg];
                  return (
                    <div key={d.problem} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-4 xl:p-5 2xl:p-6">
                      <div className="flex items-start gap-3 xl:gap-4">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-warm)] text-[var(--color-canopy)] xl:h-11 xl:w-11"><Icon className="h-5 w-5 xl:h-[22px] xl:w-[22px]" /></span>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold leading-snug text-[var(--color-ink)] sm:text-[16px] xl:text-[17px] 2xl:text-[18px]">{d.problem}</p>
                          <p className="mt-1.5 max-w-[68ch] text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:text-[14px] xl:text-[15px] 2xl:text-[16px]">{d.detail}</p>
                        </div>
                      </div>
                      <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] xl:mt-4 xl:px-3 xl:py-1.5 xl:text-[11px] ${tone.className}`}>{tone.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5 xl:p-6 2xl:p-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)] xl:text-[12px] 2xl:text-[13px]">Execution — about the doing</p>
              <div className="mt-4 grid gap-3 xl:mt-5 xl:gap-4">
                {execution.map((d) => {
                  const Icon = d.icon;
                  const tone = FIX_TONE[d.fixedByReorg];
                  return (
                    <div key={d.problem} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-4 xl:p-5 2xl:p-6">
                      <div className="flex items-start gap-3 xl:gap-4">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-warm)] text-[var(--color-clay)] xl:h-11 xl:w-11"><Icon className="h-5 w-5 xl:h-[22px] xl:w-[22px]" /></span>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold leading-snug text-[var(--color-ink)] sm:text-[16px] xl:text-[17px] 2xl:text-[18px]">{d.problem}</p>
                          <p className="mt-1.5 max-w-[68ch] text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:text-[14px] xl:text-[15px] 2xl:text-[16px]">{d.detail}</p>
                        </div>
                      </div>
                      <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.1em] xl:mt-4 xl:px-3 xl:py-1.5 xl:text-[11px] ${tone.className}`}>{tone.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Peer states */}
        <Section
          id="peer-states"
          eyebrow="The field test"
          title="Would a “Department of Commerce” actually move the needle?"
          lead="Reformers point to states that put economic development close to the governor with a clear strategy. They're onto something, but the same set of states is also a warning that structure is necessary, not sufficient."
          tone="warm"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {PEER_STATES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.state} className={`-mx-4 border-y p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5 ${PEER_TONE[p.tone]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-editorial text-[24px] leading-tight text-[var(--color-ink)]">{p.state}</h3>
                      <p className="mt-1 text-[12px] font-semibold text-[var(--color-ink-muted)]">{p.agency}</p>
                    </div>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-[var(--color-canopy)]"><Icon className="h-5 w-5" /></span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{p.model}</p>
                  <p className="mt-3 border-l-2 border-[var(--color-sage)] pl-3 text-[13px] font-semibold leading-relaxed text-[var(--color-ink)]">{p.outcome}</p>
                  <p className="mt-3 border-l-2 border-[var(--color-ember)] pl-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                    <span className="font-semibold text-[var(--color-clay)]">But: </span>{p.caution}
                  </p>
                  <p className="mt-3 text-[12px]"><SourceLink id={p.source}>Source</SourceLink></p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 -mx-4 border-y border-[var(--color-parchment)] bg-[var(--color-canopy)] p-5 text-white sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <MiniKicker>The takeaway</MiniKicker>
            <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-white/85">{PEER_TAKEAWAY}</p>
          </div>
        </Section>

        {/* The real debate — competing papers + survey */}
        <Section
          id="debate"
          eyebrow="The real debate"
          title="The room can't agree on the problem."
          lead="Before recommending anything, the Council collected competing visions. Two landed as formal papers — one from the business coalition, one from the Council's own labor members — and they disagree on nearly everything, starting with whether Oregon's economy is failing at all."
          tone="warm"
        >
          {/* Survey snapshot */}
          <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5 xl:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                What {SURVEY.responses.toLocaleString()} Oregonians said
              </p>
              <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{SURVEY.oregon.toLocaleString()} in-state responses</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {SURVEY.topFocus.map((f) => (
                <div key={f.area}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[var(--color-ink)] sm:text-[14px]">{f.area}</p>
                    <p className="font-mono text-[13px] tabular-nums text-[var(--color-ink-light)]">{f.n}</p>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--color-parchment)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-ember)] motion-safe:transition-all"
                      style={{ width: `${Math.round((f.n / SURVEY.topFocus[0].n) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-[68ch] text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:text-[14px]">{SURVEY.note}</p>
            <p className="mt-3 text-[12px]"><SourceLink id={SURVEY.source}>Prosperity Council survey results</SourceLink></p>
          </div>

          {/* Two camps */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {COUNCIL_CAMPS.map((c) => {
              const business = c.tone === "business";
              return (
                <div
                  key={c.author}
                  className={`-mx-4 border-y p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5 xl:p-6 ${business ? "border-[var(--color-ember)]/30 bg-[var(--color-clay-tint)]" : "border-[var(--color-sage)] bg-[var(--color-sage-tint)]"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${business ? "text-[var(--color-clay)]" : "text-[var(--color-canopy)]"}`}>
                      {business ? "The business case" : "The labor case"}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{c.author} · {c.date}</p>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold leading-snug text-[var(--color-ink)] sm:text-[16px] xl:text-[17px]">{c.frame}</p>
                  <ul className="mt-4 space-y-2">
                    {c.asks.map((a) => (
                      <li key={a} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:text-[14px]">
                        <span className={`mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${business ? "bg-[var(--color-ember)]" : "bg-[var(--color-sage)]"}`} />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{c.evidence}</p>
                  <p className="mt-3 text-[12px]"><SourceLink id={c.source}>{business ? "OBC letter" : "“High Road” paper"}</SourceLink></p>
                </div>
              );
            })}
          </div>

          {/* Contested evidence */}
          <div className="mt-5 -mx-4 border-y border-[var(--color-parchment)] bg-[var(--color-canopy)] p-4 text-white sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">One state, two stories</p>
            <h3 className="mt-2 font-editorial text-[24px] leading-tight text-white sm:text-[26px]">The same Oregon, read two ways.</h3>
            <div className="mt-5 space-y-3">
              {CONTESTED_EVIDENCE.map((e) => (
                <div key={e.question} className="rounded-sm border border-white/12 bg-white/[0.05] p-4">
                  <p className="text-[14px] font-bold text-white sm:text-[15px]">{e.question}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-sm border-l-2 border-[var(--color-ember-bright)] bg-black/15 py-1.5 pl-3">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ember-bright)]">The reform case</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/80 sm:text-[14px]">{e.reform}</p>
                    </div>
                    <div className="rounded-sm border-l-2 border-[var(--color-sage)] bg-black/15 py-1.5 pl-3">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sage)]">The counter-case</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/80 sm:text-[14px]">{e.counter}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-[72ch] text-[12px] leading-relaxed text-white/55">
              The reform case is sourced throughout this piece. The counter-case is the labor members&apos; paper, citing
              Brookings and BLS. Both are on the record — the Council has to choose which Oregon it&apos;s governing for.
            </p>
          </div>
        </Section>

        {/* You decide */}
        <Section
          id="decide"
          eyebrow="You decide"
          title="What would actually make Oregon serious?"
          lead="The Prosperity Council's final report is scheduled to land June 25 (its charter deadline is June 30). Here is the proposal, the trade-offs it forces, and the bar a real fix would have to clear, so you can weigh it yourself."
        >
          <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <MiniKicker>The proposal on the table</MiniKicker>
            <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)]">{COMMERCE_PROPOSAL.what}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border-l-2 border-[var(--color-sage)] bg-[var(--color-sage-tint)] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-canopy)]">What it would change</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-light)]">{COMMERCE_PROPOSAL.changes}</p>
              </div>
              <div className="rounded-sm border-l-2 border-[var(--color-ember)] bg-[var(--color-clay-tint)] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">What it wouldn&apos;t</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-light)]">{COMMERCE_PROPOSAL.doesntChange}</p>
              </div>
            </div>
            <p className="mt-4 rounded-sm bg-[var(--color-paper-warm)] p-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
              {COMMERCE_PROPOSAL.status} See the <SourceLink id="prosperityCouncil">Prosperity Council page</SourceLink>.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {TRADEOFFS.map((t) => (
              <div key={t.tension} className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-5">
                <p className="font-editorial text-[19px] leading-tight text-[var(--color-ink)]">{t.tension}</p>
                <p className="mt-3 border-l-2 border-[var(--color-sage)] pl-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{t.left}</p>
                <p className="mt-2 border-l-2 border-[var(--color-ember)] pl-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{t.right}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 -mx-4 border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <MiniKicker>The bar for &ldquo;serious&rdquo;</MiniKicker>
            <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)]">Four things a real fix would have to do.</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {SERIOUS_BAR.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="flex gap-3 rounded-sm border border-[var(--color-parchment)] bg-white p-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-canopy)] text-white"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="text-[15px] font-bold leading-snug text-[var(--color-ink)]">{s.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{s.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Take action */}
        <Section
          id="take-action"
          eyebrow="What you can do"
          title="June 25 is a decision point — not a spectator sport."
          lead="The final report is a recommendation; what happens next runs through the Legislature and the governor. Here is how to follow it and weigh in."
          tone="darker"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <a href="https://www.oregon.gov/gov/policies/Pages/Prosperity-Council.aspx" target="_blank" rel="noopener noreferrer" className="group -mx-4 border-y border-white/12 bg-white/[0.055] p-4 transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canopy-deep)] sm:mx-0 sm:rounded-sm sm:border sm:p-5">
              <MessageSquare className="h-5 w-5 text-[var(--color-ember-bright)]" />
              <h3 className="mt-4 font-editorial text-[24px] leading-tight text-white">Read the report</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/70">Watch the Governor&apos;s Prosperity Council page for the final recommendations, scheduled for June 25, 2026 (charter deadline June 30).</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--color-ember-bright)]">Prosperity Council<ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" /></span>
            </a>
            <a href="https://www.oregonlegislature.gov/citizen_engagement" target="_blank" rel="noopener noreferrer" className="group -mx-4 border-y border-white/12 bg-white/[0.055] p-4 transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canopy-deep)] sm:mx-0 sm:rounded-sm sm:border sm:p-5">
              <Mail className="h-5 w-5 text-[var(--color-ember-bright)]" />
              <h3 className="mt-4 font-editorial text-[24px] leading-tight text-white">Tell your legislator</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/70">A reorg, and the budget and incentive choices behind it, runs through the Legislature. Find yours and weigh in.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--color-ember-bright)]">Find your legislator<ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" /></span>
            </a>
            <a href={SOURCES.ojp.url} target="_blank" rel="noopener noreferrer" className="group -mx-4 border-y border-white/12 bg-white/[0.055] p-4 transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canopy-deep)] sm:mx-0 sm:rounded-sm sm:border sm:p-5">
              <ExternalLink className="h-5 w-5 text-[var(--color-ember-bright)]" />
              <h3 className="mt-4 font-editorial text-[24px] leading-tight text-white">Read the reporting</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/70">This deep dive builds on Nigel Jaquiss&apos;s reporting for the Oregon Journalism Project. Start there.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--color-ember-bright)]">Oregon Journalism Project<ArrowRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-0.5" /></span>
            </a>
          </div>
        </Section>

        {/* Sources & method */}
        <Section
          id="sources"
          eyebrow="Sources & method"
          title="Every number, traceable, and every asterisk, in the open."
          lead="This piece extends Nigel Jaquiss's reporting for the Oregon Journalism Project with primary sources. Where a number is contested, slippery, or comes from an advocacy group, we say so."
          tone="darker"
        >
          <div className="-mx-4 border-y border-white/12 bg-white/[0.055] p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
            <MiniKicker>The caveats reformers skip</MiniKicker>
            <ul className="mt-4 grid gap-3">
              {CAVEATS.map((c) => (
                <li key={c} className="flex gap-3 text-[14px] leading-relaxed text-white/74">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ember-bright)]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {SOURCE_ENTRIES.map(([id, source]) => (
              <a
                key={id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group min-w-0 rounded-sm border border-white/12 bg-white/[0.055] p-4 transition-colors hover:border-[var(--color-ember)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canopy-deep)]"
              >
                <p className="break-words font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">{source.org}</p>
                <p className="mt-2 break-words text-[14px] font-semibold leading-snug text-white group-hover:text-[var(--color-ember-bright)]">{source.title}</p>
                <p className="mt-3 break-words [overflow-wrap:anywhere] font-mono text-[10px] leading-relaxed text-white/42">{source.url}</p>
              </a>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
