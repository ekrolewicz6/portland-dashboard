import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Store,
  Snowflake,
  Hammer,
  Scale,
  Home,
  Coins,
  Landmark,
  TrendingDown,
  Clock,
} from "lucide-react";
import { HEADLINE, SOURCES, ANCHOR_LOSSES } from "@/lib/lloyd/data";
import { fmtNum, fmtMoney, fmtPct } from "@/lib/lloyd/engine";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import WhereTheyStand from "@/components/deep-dives/lloyd/WhereTheyStand";
import WhatItGuarantees from "@/components/deep-dives/lloyd/WhatItGuarantees";
import DeliveryReality from "@/components/deep-dives/lloyd/DeliveryReality";
import DecisionTimeline from "@/components/deep-dives/lloyd/DecisionTimeline";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Lloyd Center: Demolished on a Promise — Portland's Mall, Explained",
  description:
    "Portland's dead mall is coming down for up to 5,141 homes, but the approval requires zero affordable units and no ice rink, and the city is building fewer homes than it has since 2009. A visual, both-sides deep-dive into the Lloyd Center fight.",
  path: "/deep-dives/lloyd",
  type: "article",
});

const NAV = [
  { id: "what", label: "What's settled" },
  { id: "sides", label: "Both sides" },
  { id: "deal", label: "The deal" },
  { id: "deliver", label: "Will it get built" },
  { id: "decide", label: "The decision" },
  { id: "bigger", label: "Bigger picture" },
  { id: "sources", label: "Sources" },
];

function Src({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]"
    >
      {s.org}
    </a>
  );
}

export default function LloydDeepDivePage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative bg-[var(--color-canopy)] text-white noise-overlay overflow-hidden">
        <div className="absolute top-0 right-0 w-[720px] h-[720px] bg-[var(--color-canopy-light)] rounded-full blur-[190px] opacity-25 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[460px] h-[460px] bg-[var(--color-ember)] rounded-full blur-[160px] opacity-[0.07] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className={`relative z-10 ${DIVE_CONTAINER} py-16 sm:py-24`}>
          <div className="grid xl:grid-cols-12 gap-10 xl:gap-16 items-end">
            <div className="xl:col-span-8">
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/90">
                <Link href="/deep-dives" className="hover:text-[var(--color-ember-bright)] transition-colors">
                  Policy Deep-Dive
                </Link>
                <div className="w-8 h-px bg-[var(--color-ember)]/50" />
                <span>Housing &amp; redevelopment</span>
              </div>
              <h1 className="mt-6 font-editorial-normal text-[40px] sm:text-[58px] lg:text-[70px] leading-[1.04] tracking-tight max-w-4xl 3xl:max-w-5xl">
                The mall is dead.
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  Will the homes get built?
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] sm:text-[20px] text-white/75 leading-relaxed">
                Lloyd Center closes for good on {HEADLINE.closeDate} and comes down for up to{" "}
                <strong className="text-white">{fmtNum(HEADLINE.unitsModeled)} new homes</strong>. Almost
                everyone agrees that&apos;s the right future for the site. The fight is over what the
                teardown takes with it, and whether the homes ever actually show up.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <a
                  href="#deal"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]"
                >
                  See what&apos;s actually guaranteed
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#deliver"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Will it get built?
                </a>
              </div>
            </div>

            <aside className="hidden xl:block xl:col-span-4">
              <div className="rounded-sm border border-white/12 bg-white/[0.05] p-6 backdrop-blur">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]">
                  The short version
                </div>
                <dl className="mt-4 space-y-4">
                  {[
                    { t: "What it is", d: "Portland's 1960s mega-mall, ~90% empty, closing this summer to be demolished and rebuilt as a neighborhood." },
                    { t: "The fight", d: "Not “save it vs. demolish it” — both sides want housing. It's about the ice rink, displaced tenants, and broken promises." },
                    { t: "The catch", d: "The approval locks in no affordable homes and no rink, and Portland is building fewer homes than any year since 2009." },
                  ].map((r) => (
                    <div key={r.t}>
                      <dt className="text-[13px] font-semibold text-white">{r.t}</dt>
                      <dd className="text-[13px] text-white/65 leading-relaxed mt-0.5">{r.d}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 30-second stat band ── */}
      <section className="bg-[var(--color-canopy-mid)] text-white border-t border-white/10">
        <div className={`${DIVE_CONTAINER} py-10 grid grid-cols-2 lg:grid-cols-4 gap-6`}>
          {[
            { v: fmtNum(HEADLINE.unitsModeled), l: "homes promised", s: "a modeling ceiling, not a floor" },
            { v: "0", l: "affordable homes required", s: "and no ice rink required either" },
            { v: fmtNum(HEADLINE.permits2025), l: "homes Portland built in 2025", s: "citywide — Lloyd promises ~10× that" },
            { v: "Dec 22", l: "the Council's deadline", s: "to rule on the appeal" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-mono text-[30px] sm:text-[38px] font-bold tabular-nums leading-none text-[var(--color-ember-bright)]">
                {s.v}
              </p>
              <p className="text-[13px] font-semibold mt-2 leading-snug">{s.l}</p>
              <p className="text-[12px] text-white/55 mt-0.5">{s.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-14 z-40 bg-[var(--color-paper)]/95 backdrop-blur border-b border-[var(--color-parchment)]">
        <div className={DIVE_CONTAINER}>
          <div className="flex gap-1 overflow-x-auto py-2 text-[12px] font-mono uppercase tracking-[0.08em] scrollbar-hide">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-3 py-3 text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-canopy)] transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── What's settled ── */}
      <Section
        id="what"
        eyebrow="The basics"
        title="What's actually being decided"
        lead={
          <>
            The mall is closing on {HEADLINE.closeDate} and coming down — that part is settled. What&apos;s
            still being fought over is everything the demolition takes with it, and whether the homes that
            replace it ever show up.
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-7">
            <div className="flex items-center gap-2.5 mb-3">
              <Store className="w-6 h-6 text-[var(--color-clay)]" />
              <h3 className="font-editorial-normal text-[20px] text-[var(--color-canopy)]">
                The mall is finished
              </h3>
            </div>
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              Opened in {HEADLINE.openedYear} as the region&apos;s grandest shopping center, Lloyd Center
              lost every anchor store and is now about {fmtPct(HEADLINE.vacancyPct)} vacant. After a 2021
              foreclosure, owners Urban Renaissance Group and KKR will demolish it and rebuild across{" "}
              {HEADLINE.developmentAreas} parcels.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {ANCHOR_LOSSES.map((a) => (
                <span
                  key={a.store}
                  className="inline-flex items-baseline gap-1.5 rounded-sm bg-[var(--color-paper-warm)] px-2 py-1 text-[11px] text-[var(--color-ink-light)]"
                >
                  <span className="line-through decoration-[var(--color-clay)]/60">{a.store}</span>
                  <span className="font-mono text-[var(--color-ink-muted)]">{a.year}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-sm border-2 border-[var(--color-fern)]/30 bg-[#f1f7f3] p-7">
            <div className="flex items-center gap-2.5 mb-3">
              <Home className="w-6 h-6 text-[var(--color-fern)]" />
              <h3 className="font-editorial-normal text-[20px] text-[var(--color-canopy)]">
                Why this isn&apos;t the usual mall fight
              </h3>
            </div>
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              You&apos;d expect &ldquo;save the mall&rdquo; vs. &ldquo;tear it down.&rdquo; But even the
              people fighting the plan agree the site should become housing. The disagreement is about{" "}
              <strong>how</strong> — what gets reused, what gets guaranteed, and what Portland loses in the
              gap between demolition and delivery.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Both sides ── */}
      <Section
        id="sides"
        tone="warm"
        eyebrow="The two sides"
        title="Everyone wants the homes. So what's the fight?"
        lead="There are two real, named campaigns, and they're closer than the slogans suggest. Both want housing here. They split on the building, the rink, the timing, and what gets locked in."
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              The sides aren&apos;t evenly matched. The <Src id="saveLloyd" /> and{" "}
              <Src id="saveLloydIce" /> campaigns are organized — named leaders, ~15,000 petition
              signatures, two legal appeals. The pro-housing <Src id="dontSaveLloyd" /> side is mostly the
              developer, standing neighborhood groups, and an anonymous YIMBY site.
            </p>
          </div>
        }
      >
        <WhereTheyStand />
      </Section>

      {/* ── The deal ── */}
      <Section
        id="deal"
        eyebrow="The fine print"
        title="What the plan actually guarantees"
        lead={
          <>
            Strip away the renderings and the approval is a flexible framework. Here&apos;s what it locks
            in, and, more tellingly, what it doesn&apos;t.
          </>
        }
        aside={
          <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
            From the City&apos;s land-use decision (<Src id="finalFindings" />). The March 2026 approval
            cleared the infrastructure framework only — not demolition, not individual buildings.
          </p>
        }
      >
        <WhatItGuarantees />
        <p className="mt-5 text-[13px] text-[var(--color-ink-light)] leading-relaxed max-w-2xl">
          On the ice rink, City staff were blunt: the plan &ldquo;is capable of supporting such a use,
          though there are not specific approval criteria that require a new rink or preservation of the
          existing rink.&rdquo; That single gap is what the appeals are about.
        </p>
      </Section>

      {/* ── Will it get built ── */}
      <Section
        id="deliver"
        tone="dark"
        eyebrow="Promise vs. delivery"
        title="Will the homes actually get built?"
        lead={
          <>
            The promise is ~{fmtNum(HEADLINE.unitsModeled)} homes over a decade-plus. The problem is the
            market Portland is building into, and a funding district that&apos;s currently empty.
          </>
        }
      >
        <DeliveryReality />
        <div className="mt-6 rounded-sm border border-white/12 bg-white/[0.05] p-6 backdrop-blur">
          <div className="flex items-center gap-2.5 mb-2">
            <Coins className="w-5 h-5 text-[var(--color-ember-bright)]" />
            <h3 className="text-[15px] font-semibold text-white">Follow the money</h3>
          </div>
          <p className="text-[13px] text-white/70 leading-relaxed">
            The City built a {fmtMoney(HEADLINE.tifMaxIndebtedness)} tax-increment district
            (the Lloyd-Holladay TIF) around this site, with {fmtPct(HEADLINE.tifHousingPct)} earmarked for
            affordable housing. But downtown property values fell so far that it&apos;s generating{" "}
            <strong className="text-white">{fmtMoney(HEADLINE.tifIncrementNow)}</strong> in new revenue for
            the coming year — its spending plan is paused. Source: <Src id="tifDistrict" />.
          </p>
        </div>
        <p className="text-[12px] text-white/50 mt-4 max-w-2xl leading-relaxed">
          The pace slider is a simple teaching tool, not a forecast — the point is the scale. Homes,
          square footage, and the ~{fmtNum(HEADLINE.unitsModeled)}-unit ceiling are from the City&apos;s
          findings (<Src id="finalFindings" />); the citywide permit counts are from{" "}
          <Src id="oregonPermits" />.
        </p>
      </Section>

      {/* ── The decision ── */}
      <Section
        id="decide"
        tone="warm"
        eyebrow="Who decides"
        title="Who decides, and when"
        lead="The Design Commission's March approval only cleared the framework. The real decision is at City Council right now, and the clock is running."
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-7">
            <DecisionTimeline />
          </div>
          <div className="space-y-5">
            <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <Scale className="w-5 h-5 text-[var(--color-ember)]" />
                <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">The appeal</h3>
              </div>
              <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
                Two appeals — one focused on adaptive reuse, one on the rink — argue the plan violates
                Portland&apos;s own Central City 2035 policies for the Lloyd district. They ask the Council
                to deny the plan or require a <strong>permanent, year-round rink</strong> before any
                demolition. More than 150 people testified on June 24; no decision yet (
                <Src id="courthouseHearing" />).
              </p>
            </div>
            <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="flex items-center gap-2.5 mb-2">
                <Snowflake className="w-5 h-5 text-[var(--color-river)]" />
                <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">Why the rink, specifically</h3>
              </div>
              <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
                It&apos;s the only permanent, year-round, transit-accessible ice rink in the city, where
                Tonya Harding learned to skate. Olympic champion Ilia Malinin even shared the petition. The
                approved plan offers, at most, seasonal skating (<Src id="malinin" />).
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Bigger picture ── */}
      <Section
        id="bigger"
        eyebrow="Zoom out"
        title="Why this is bigger than one mall"
        lead="Lloyd Center is a local fight that's really a stand-in for three much larger questions."
      >
        <div className="grid md:grid-cols-3 gap-5">
          <BigIssue
            icon={<TrendingDown className="w-5 h-5 text-[var(--color-ember)]" />}
            title="The end of the mall era"
            n="01"
          >
            About {fmtNum(HEADLINE.mallsNow)} enclosed malls are left in the U.S., heading toward ~
            {fmtNum(HEADLINE.malls2028)} by 2028. Lloyd is a textbook case of the next chapter:
            demolish the dead mall, build a neighborhood. How cities do that, and what they keep, is
            playing out everywhere (<Src id="mallStats" />).
          </BigIssue>
          <BigIssue
            icon={<Coins className="w-5 h-5 text-[var(--color-ember)]" />}
            title="Can the toolkit deliver?"
            n="02"
          >
            Portland needs ~{fmtNum(HEADLINE.housingNeed20yr)} homes over 20 years but its tax-increment
            district, abatements, and zoning are colliding with frozen financing and a permit collapse.
            Lloyd is a real test of whether the city&apos;s housing toolkit can turn a marquee site into
            actual homes (<Src id="housingNeed" />).
          </BigIssue>
          <BigIssue
            icon={<Landmark className="w-5 h-5 text-[var(--color-ember)]" />}
            title="What a city owes its history"
            n="03"
          >
            Lloyd sits next to lower Albina — the heart of historic Black displacement and now of
            restorative rebuilding. Lloyd Center itself isn&apos;t that displacement site, but the
            adjacency raises a fair question: what should equitable redevelopment commit to here?
          </BigIssue>
        </div>
      </Section>

      {/* ── Sources ── */}
      <Section
        id="sources"
        tone="warm"
        eyebrow="Sources & method"
        title="Where these numbers come from"
        lead="Every figure is from a primary document or a named report, pulled in June 2026 — the City's land-use findings, Prosper Portland, the developer's plan, and the campaigns themselves."
        aside={
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-[var(--color-ember)]" />
              <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">A live story</h3>
            </div>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              As of late June 2026, the City Council appeal was unresolved (a ruling is due by{" "}
              {HEADLINE.councilDeadline}) and the mall&apos;s {HEADLINE.closeDate} closing still stood.
              Time-sensitive figures should be re-checked.
            </p>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-3">
          {Object.values(SOURCES).map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-sm border border-transparent hover:border-[var(--color-parchment)] hover:bg-white p-2 -m-2 transition-colors"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-ember)]" />
              <span>
                <span className="block text-[13px] text-[var(--color-ink)] group-hover:text-[var(--color-canopy)] leading-snug">
                  {s.title}
                </span>
                <span className="block text-[11px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wide mt-0.5">
                  {s.org} · {s.kind}
                </span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── local helpers ─────────────────────────────────────────────────

function BigIssue({
  icon,
  title,
  n,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  n: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--color-ember)]">{icon}</span>
        <span className="font-mono text-[20px] font-bold text-[var(--color-parchment)] leading-none">
          {n}
        </span>
      </div>
      <h3 className="text-[16px] font-semibold text-[var(--color-canopy)] mb-1.5 leading-snug">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{children}</p>
    </div>
  );
}
