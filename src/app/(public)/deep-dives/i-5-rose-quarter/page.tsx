import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import { DIVE_CONTAINER, Section } from "@/components/deep-dives/shared";
import { SOURCES, HEADLINE, WHATS_NEXT } from "@/lib/rose-quarter/data";
import { ARG_SOURCES, type Source } from "@/lib/rose-quarter/arguments";
import ExperimentTracker from "@/components/deep-dives/rose-quarter/ExperimentTracker";
import CostEscalation from "@/components/deep-dives/rose-quarter/CostEscalation";
import Figure from "@/components/deep-dives/rose-quarter/Figure";
import {
  AlbinaWaves,
  Cases,
  DesignEvolution,
  LegalFight,
  PricingExchanges,
  LandValue,
} from "@/components/deep-dives/rose-quarter/Sections";

export const metadata: Metadata = pageMeta({
  title: "The Rose Quarter Experiment — a $3.5 billion freeway fight, about to be tested",
  description:
    "On September 11 Portland closes southbound I-5 and sends the traffic to I-405 and I-205 — nearly what removal advocates propose permanently. Both sides' predictions, published before the closure, with the test written down in advance.",
  path: "/deep-dives/i-5-rose-quarter",
  type: "article",
});

const NAV = [
  { id: "experiment", label: "The experiment" },
  { id: "albina", label: "What was destroyed" },
  { id: "project", label: "What's being built" },
  { id: "for", label: "The case for" },
  { id: "against", label: "The case against" },
  { id: "collide", label: "Where they collide" },
  { id: "money", label: "The money" },
  { id: "legal", label: "The legal fight" },
  { id: "alternative", label: "If not this" },
  { id: "next", label: "What's next" },
  { id: "method", label: "Method" },
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

/**
 * SOURCES and ARG_SOURCES overlap deliberately — a few documents carry both the
 * factual record and an argument. Deduplicate by URL so the reader sees each
 * document once, sorted so primary documents lead.
 */
function dedupeSources(): Source[] {
  const all = [...Object.values(SOURCES), ...Object.values(ARG_SOURCES)] as Source[];
  const byUrl = new Map<string, Source>();
  for (const s of all) if (!byUrl.has(s.url)) byUrl.set(s.url, s);
  const rank = { primary: 0, analysis: 1, book: 2, news: 3 } as const;
  return [...byUrl.values()].sort(
    (a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) || a.org.localeCompare(b.org),
  );
}

export default function RoseQuarterPage() {
  return (
    <article className="bg-[var(--color-paper)]">
      {/* ── hero ── */}
      <header className="noise-overlay relative overflow-hidden bg-[var(--color-canopy)] py-16 text-white sm:py-20">
        <div className={`relative z-10 ${DIVE_CONTAINER}`}>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
                Policy deep-dive ——— Freeways &amp; the Rose Quarter
              </p>
              <h1 className="mt-5 font-editorial-normal text-[40px] leading-[1.05] sm:text-[56px] xl:text-[64px]">
                Portland is about to run
                <span className="block font-editorial italic text-[var(--color-ember-bright)]">
                  the experiment by accident.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75">
                On September 11 the state closes southbound I-5 through the Rose Quarter for five
                weeks and sends the traffic to I-405 and I-205, which is very nearly what
                freeway-removal advocates have been proposing permanently. Both sides have said what
                they expect to happen. This page publishes those predictions, and the test that
                decides them, <em>before</em> the closure begins.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#experiment"
                  className="rounded-sm bg-[var(--color-ember)] px-5 py-3 text-[15px] font-semibold text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)]"
                >
                  See the pre-registered test
                </a>
                <a
                  href="#albina"
                  className="rounded-sm border border-white/25 px-5 py-3 text-[14px] font-semibold text-white hover:bg-white/10"
                >
                  Start with what was destroyed
                </a>
              </div>
            </div>

            <aside className="hidden rounded-sm border border-white/15 bg-white/[0.04] p-6 xl:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">
                The short version
              </p>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-[14px] font-semibold text-white">What everyone agrees on</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    A Black neighborhood was destroyed to build this freeway, and something is owed.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">What they don&apos;t</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    Two fights, tangled together: whether to widen at all, and whether the covers
                    require the widening. Freight and labour want the lanes on their own merits.
                  </dd>
                </div>
                <div>
                  <dt className="text-[14px] font-semibold text-white">The awkward fact</dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-white/65">
                    ODOT&apos;s own consultant found pricing the road would beat widening it, for a
                    billion dollars less. The environmental review says pricing was not considered.
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "Cost today", v: "$3.5B" },
              { k: "Miles", v: String(HEADLINE.lengthMiles) },
              { k: "Promised in 2017", v: "$450M" },
              { k: "Closure begins", v: "Sept 11" },
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
About $400M has been spent or committed. The rest, roughly $3&nbsp;billion, is
            essentially unfunded. ODOT&apos;s own website still shows an older $1.96–2.08B figure.
          </p>
        </div>
      </header>

      {/* ── nav ── */}
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

      {/* ── the experiment ── */}
      <Section
        id="experiment"
        eyebrow="The accidental experiment"
        title="For five weeks, Portland gets to see what happens"
        lead={
          <>
            The argument over this project is, at bottom, an empirical one: if you take lanes away,
            does traffic find another route, or does some of it stop existing? On September 11 that
            question gets tested on the actual road, and the detour ODOT has designed sends drivers
            almost exactly where advocates say the freeway should go permanently.
          </>
        }
        aside={
          <Figure id="closureMap" />
        }
      >
        <ExperimentTracker />
      </Section>

      {/* ── albina ── */}
      <Section
        id="albina"
        tone="dark"
        eyebrow="Before any of this"
        title="Three times, the same neighborhood"
        lead={
          <>
            You cannot understand why Albina Vision Trust supports a freeway project, or why its
            opponents are so careful about how they say no, without this. The land under and beside
            I-5 was a Black neighborhood, and it was taken three separate times in fifteen years.
          </>
        }
        aside={
          <p className="text-[12px] leading-relaxed text-white/55">
            In 2025 Portland approved a settlement for displaced Albina residents and their
            descendants, later increased to {`$${(HEADLINE.albinaSettlement / 1e6).toFixed(1)}M`} (
            <Src id="albinaSettlement" />
            ). The city&apos;s own housing bureau documents this history in detail.
          </p>
        }
      >
        <div className="space-y-6">
          <AlbinaWaves />
          <div className="rounded-sm border-l-2 border-[var(--color-ember-bright)] bg-white/[0.05] p-5 backdrop-blur sm:p-6">
            <p className="max-w-3xl text-[15px] leading-relaxed text-white/85">
              That history explains the one position in this fight that confuses outsiders. The
              organisation that carries Albina&apos;s interests is not for the freeway and not
              against it — it is deliberately agnostic on the lanes (<Src id="avtPosition" />
              ). Every other actor in these rooms is solving for something else: freight throughput,
              climate, congestion, an arena. &ldquo;Is this good for the neighborhood?&rdquo; is
              the question that has historically landed at the bottom of the list — that is how the
              neighborhood was destroyed the first time, and holding it first, to the exclusion of
              every other cause, is the entire strategy.
            </p>
          </div>
        </div>
      </Section>

      {/* ── the project ── */}
      <Section
        id="project"
        eyebrow="The design"
        title="What is actually being built"
        lead={
          <>
            ODOT is emphatic that no new through lanes are added — the project adds one auxiliary
            lane in each direction, full shoulders, and a cover carrying streets and buildings over
            the freeway (<Src id="odotFaq" />
            ). Critics say total paved width is the number that matters and that the roadway ends up
            wide enough to stripe for ten lanes. Both can be true at once, which is why this argument
            never resolves.
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Figure id="cover" priority />
            <Figure id="mapAuxiliary" />
          </div>

          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
              The distinction that decides everything: can you build on it?
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              A landscaped lid over a freeway is a park. A lid engineered to carry buildings is a
              neighborhood. Under the current design the cover creates about{" "}
              {HEADLINE.coverAcresTotal} acres of new surface, of which roughly{" "}
              {HEADLINE.coverAcresBuildable} are buildable — three storeys at the north end, up to
              six at the south. That gap between total and buildable is the thing Albina Vision
              Trust spent years fighting over, and it is why they walked away from the project in
              2020 and came back in 2021.
            </p>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
              Published acreage figures conflict — 4, 7 and 8 acres all circulate, sometimes because
              the buildable number is quoted as if it were the total. We use 7.1 total and 4
              buildable, from the 2024 environmental review (<Src id="rsea" />
              ).
            </p>
          </div>

          <div className="rounded-sm border-l-2 border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
              &ldquo;Highest crash rate&rdquo; is doing a lot of work in that sentence
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              ODOT&apos;s crash statistic is a <em>rate</em>, and the crashes behind it are
              overwhelmingly low-speed property damage — the rear-enders congestion produces, not the
              collisions that kill people. That distinction matters because ODOT&apos;s own safety
              policy prioritises fatal and serious-injury crashes, the standard most agencies now
              work to.
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              By that measure the state&apos;s deadliest facilities are not interstates at all. They
              are the old &ldquo;orphan highways&rdquo; that predate the interstate era and now run
              as arterials through neighborhoods while still being managed like highways — TV
              Highway, 82nd Avenue, Powell, Barbur. Those roads have the fatalities. The Rose Quarter
              has the fender-benders and the headline.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-editorial-normal text-[22px] text-[var(--color-canopy)]">
              The rest of what comes with it
            </h3>
            <p className="mb-4 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              The project is not only lanes and a lid. It restores street connections severed in
              1962, adds a crossing that has never existed, and rebuilds the surface network around
              the arena. These are ODOT&apos;s own maps of each piece.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <Figure id="mapCover" />
              <Figure id="mapHancock" />
              <Figure id="mapMultimodal" />
              <Figure id="mapBikePed" />
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-editorial-normal text-[22px] text-[var(--color-canopy)]">
              How the design changed, and who changed it
            </h3>
            <DesignEvolution />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Figure id="mapOfframp" />
            <div className="rounded-sm border-l-2 border-[var(--color-clay)] bg-white p-5">
              <h4 className="text-[15px] font-semibold text-[var(--color-ink)]">
                The ramp the Blazers got
              </h4>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
                In January 2023 Rip City Management, which runs the Moda Center and hosts roughly
                250 events a year, about half of whose visitors arrive on foot or by bike — filed a
                twenty-page objection to the relocated off-ramp, warning of a 210-degree turn and
                four extra crossings through crowds. They hired an architecture firm and a law firm
                to make the case (<Src id="blazersObject" />
                ).
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
                A flyover ramp appeared in the next design cycle and was folded into the 2024
                environmental review. ODOT has never itemised its cost; the nearest public figure
                bundles it into a ~$170M package. And ODOT&apos;s own safety analysis concedes the
                new ramp configuration fails Highway Safety Manual standards and would{" "}
                <em>increase</em> crashes by about 13%.
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                One correction to the obvious story: testimony in the comprehensive-plan case
                indicates the flyover was proposed by the <em>City</em> — the Portland Bureau of
                Transportation — rather than invented by ODOT to appease the arena. Who benefits and
                who suggested it are different questions, and the documented sequence supports the
                first more than the second. We have not been able to read the transcript ourselves,
                so this is flagged as unverified.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── case for ── */}
      <Section
        id="for"
        tone="warm"
        eyebrow="Argued at full strength"
        title="The strongest case for building it"
        lead={
          <>
            Built from ODOT&apos;s stated purpose, Albina Vision Trust&apos;s published position, and
            the labour and freight coalition that carried this project through the Oregon
            Transportation Commission in December 2025 — not from the version that is easiest to
            argue against.
          </>
        }
      >
        <Cases side="for" />
      </Section>

      {/* ── case against ── */}
      <Section
        id="against"
        eyebrow="Argued at full strength"
        title="The strongest case against building it"
        lead={
          <>
            Built, as far as possible, from ODOT&apos;s own file and the historical record rather
            than from advocacy, because that is where this case is strongest. Its best evidence is
            the agency&apos;s own consultant, the agency&apos;s own safety report, and the Eisenhower
            administration&apos;s own public works planner.
          </>
        }
      >
        <Cases side="against" />
      </Section>

      {/* ── collide ── */}
      <Section
        id="collide"
        tone="darker"
        eyebrow="Where the cases collide"
        title="The alternative that was never analysed"
        lead={
          <>
            Both sides can be sincere and still talk past each other, because they are arguing about
            different things. But one fact sits underneath the whole dispute and neither side really
            contests it.
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-sm border border-white/15 bg-white/[0.05] p-6 backdrop-blur">
            <p className="max-w-3xl text-[17px] leading-relaxed text-white">
              A July 2022 memorandum attached to this project&apos;s own environmental assessment
              found that <strong>pricing the road would cut traffic and raise speeds more than the
              widening would</strong>, and cost more than a billion dollars less. The environmental
              review then stated that congestion pricing was not considered.
            </p>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-white/65">
              That is not an advocacy claim about the project. It is the project&apos;s own file (
              <a
                href={ARG_SOURCES.wspPricing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-ember-bright)] underline decoration-white/30 underline-offset-2"
              >
                City Observatory, reporting the memo
              </a>
              ). It is also the core of the federal lawsuit, and the reason the state case cites
              Portland&apos;s Central City Plan, which requires pricing analysis before I-5 is
              widened.
            </p>
          </div>

          <div className="rounded-sm border border-white/15 bg-white/[0.05] p-6 backdrop-blur">
            <h3 className="text-[16px] font-semibold text-white">
              Then Oregon killed the alternative anyway
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              In March 2024 — six weeks after the federal approval was signed, two months before the
              first lawsuit — Governor Kotek halted regional tolling (<Src id="kotekTolling" />
              ). The politics were straightforward: tolling would have landed first on Clackamas
              County commuters with no transit alternative, in swing legislative districts, and a
              poll found 91% opposed.
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              So the cheaper option that ODOT&apos;s own consultant preferred was removed from the
              table by the Governor, while ODOT&apos;s environmental review said it had not been
              considered. Whatever you think should be built here, that is not how a $2 billion
              decision is supposed to get made.
            </p>
          </div>

          <div className="rounded-sm border border-white/15 bg-white/[0.05] p-6 backdrop-blur">
            <h3 className="text-[16px] font-semibold text-white">
              And a second alternative that was never analysed either
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              Pricing is the alternative everyone argues about. But there is another one that has
              never been costed in any published document: <strong className="text-white">build the
              covers without widening the freeway.</strong> If the goal is reconnecting Albina, that
              is the option that delivers it most directly, and no environmental review, no design
              report and no funding request has ever priced it.
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              Its mirror image finally got asked out loud at the August 2026 Transportation
              Commission meeting, where a commissioner asked what the project would cost{" "}
              <em>without</em> the covers. That the question is only being raised now, nine years and
              $400 million in, is its own answer about how this project was scoped.
            </p>
          </div>

          <div className="rounded-sm border-2 border-[var(--color-ember)]/40 bg-white/[0.03] p-6">
            <h3 className="text-[16px] font-semibold text-white">The question nobody will put to a vote</h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              Nothing in the engineering requires the covers and the extra lanes to be one project.
              The bundle is political, and it was tied from both ends. In Salem the project has
              always been about freight — the lane is the point, the neighborhood incidental.
              Locally, the caps became the price of permission: the community trust walked out in
              2020 demanding amends and buildable covers (<Src id="avtWithdrawal2020" />
              ), the city withdrew the same day, and Portland only rejoined two years later with the
              covers as a condition (<Src id="portlandRejoins2022" />
              ).
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">
              So the forced marriage cuts both ways: either both things happen or neither does.
              Opposing the lanes is made to look like opposing the neighborhood; defending the
              neighborhood means carrying the lanes. One camp answers that nothing legally obliges
              ODOT to build the covers once the lanes are in; the other, that the covers cannot be
              built without the highway work and that six years of community process should count
              for something. Both are right about the thing they are pointing at, and the camps are
              closer than the public sparring suggests: in 2019 they were jointly demanding a full
              environmental review (<Src id="avtEis2019" />
              ).
            </p>
          </div>
        </div>
      </Section>

      {/* ── money ── */}
      <Section
        id="money"
        eyebrow="The money"
        title="From $450 million to somewhere north of $3 billion"
        lead={
          <>
            Every cost figure below is dated and attributed, because the number has moved so often
            that quoting it without a date is meaningless, and because ODOT&apos;s published
            estimate and its internal draft estimates are currently more than a billion dollars
            apart.
          </>
        }
        aside={<Figure id="schedule" />}
      >
        <CostEscalation />
      </Section>

      <Section
        eyebrow="The wider arithmetic"
        title="Roads stopped paying for themselves a long time ago"
        tone="warm"
        lead={
          <>
            Most support for highway expansion rests on an intuition that drivers fund the roads
            they use. Nationally, that has not been true for decades, and the returns on new urban
            highway capacity have been falling since the 1950s.
          </>
        }
      >
        <PricingExchanges />
      </Section>

      {/* ── legal ── */}
      <Section
        id="legal"
        eyebrow="The legal fight"
        title="Two lawsuits, three withdrawals, no ruling"
        lead={
          <>
            Neither case has ever reached a decision on the merits. Both have nonetheless changed the
            project, because ODOT keeps pulling documents rather than defending them.
          </>
        }
      >
        <LegalFight />
      </Section>

      {/* ── alternative ── */}
      <Section
        id="alternative"
        eyebrow="If not this"
        title="What the land would be worth instead"
        lead={
          <>
            The serious alternative is not &ldquo;do nothing.&rdquo; It is price the road first, and
            then ask whether the Eastbank Freeway needs rebuilding at all when I-405 already
            connects at both ends. Portland studied exactly this in 2005 and then stopped talking
            about it (<Src id="odotProject" />
            ).
          </>
        }
      >
        <div className="space-y-6">
          <LandValue />
          <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">
              The argument that reframes the cost
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              The Eastbank Freeway and the Marquam Bridge will both need major reconstruction within
              a generation. If that bill is coming regardless, the honest comparison is not
              &ldquo;spend billions to remove a freeway&rdquo; but &ldquo;spend billions to rebuild
              one, or spend less and not have it.&rdquo; That reframing is what turns removal from a
              utopian proposal into a budgeting question, and it is the strongest version of the
              case advocates make.
            </p>
          </div>
        </div>
      </Section>

      {/* ── next ── */}
      <Section
        id="next"
        eyebrow="The decision points"
        title="What happens next"
        lead="Four dates that determine whether this gets built, and in what form."
      >
        <Figure id="phase1a" className="mb-6" />
        <div className="grid gap-5 md:grid-cols-2">
          {WHATS_NEXT.map((e) => (
            <div key={e.what} className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-ember)]">
                {e.when}
              </p>
              <h3 className="mt-1.5 text-[15px] font-semibold text-[var(--color-ink)]">{e.what}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                {e.why}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── method ── */}
      <Section
        id="method"
        tone="warm"
        eyebrow="Method and sources"
        title="How this was built, and what we could not verify"
        lead="Every figure here traces to a linked document. Where the record runs out, we say so rather than filling the gap."
      >
        <div className="space-y-6">
          <div className="rounded-sm border-l-2 border-[var(--color-clay)] bg-white p-5 sm:p-6">
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">
              What we could not verify
            </h3>
            <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
              <li>
                <strong>The status of both lawsuits.</strong> Press coverage stops after the state
                trial was reset to January 2026, and we have not yet been able to pull the docket. A
                trial appears to have been held; until we can read the record we are not going to
                describe its outcome. Treat every status on this page as current to the last
                verifiable filing, not to today. This is the biggest gap on the page and the one we
                are working on first.
              </li>
              <li>
                <strong>Who originated the flyover.</strong> Testimony in the state case reportedly
                attributes the proposal to the City rather than to ODOT. We have not read the
                transcript.
              </li>
              <li>
                <strong>An itemised cost for the flyover ramp.</strong> Only a bundled ~$170M package
                figure exists publicly.
              </li>
              <li>
                <strong>That the Blazers&apos; objection caused the flyover.</strong> The sequence is
                documented; the causation is not sourced, so we describe the sequence only.
              </li>
              <li>
                <strong>Absolute crash counts</strong> for the corridor. ODOT publishes a rate
                multiple, not the underlying injury and fatality breakdown.
              </li>
              <li>
                <strong>&ldquo;Most expensive highway project per mile in the US.&rdquo;</strong> The
                arithmetic supports something close to it, but no ranking body certifies this. We do
                not assert it.
              </li>
              <li>
                <strong>The August 2026 Transportation Commission figures.</strong> The ~$3.5B
                estimate and the ~$400M committed-to-date figure were presented at a meeting held
                the same day this page was written. We link the Commission&apos;s materials page;
                the individual documents were not yet indexed when we published.
              </li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-5 sm:p-6">
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">
              On the traffic measurement
            </h3>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
              Detector data comes from PORTAL (<Src id="portal" />
              ), the Portland State University archive of regional freeway sensors. We archive every
              day we pull, with a checksum, so that if PORTAL later revises a figure the change shows
              up as a reviewable difference rather than silently altering a published result. Station
              lists, time windows and thresholds were fixed on {"2026-08-13"} and cannot be changed
              without an amendment that appears on this page.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-[15px] font-semibold text-[var(--color-ink)]">Sources</h3>
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 2xl:grid-cols-3">
              {dedupeSources().map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-2 text-[13px] leading-snug"
                >
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-ember)]" />
                  <span>
                    <span className="text-[var(--color-ink)] group-hover:underline">{s.title}</span>
                    <span className="block text-[11.5px] text-[var(--color-ink-muted)]">
                      {s.org} · {s.kind}
                      {s.year ? ` · ${s.year}` : ""}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </article>
  );
}
