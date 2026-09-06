import { CalendarClock, FlaskConical } from "lucide-react";
import { PREDICTIONS, TEMPORARY_CAVEAT, INVITATION } from "@/lib/rose-quarter/predictions";
import { CORRIDORS, CORDON, PERIODS, THRESHOLDS, PREREGISTERED_AT, corridorLength } from "@/lib/rose-quarter/prereg";

/**
 * The pre-registration, rendered.
 *
 * Server component, and deliberately so: everything here is fixed before the
 * closure, so there is nothing to compute in the browser. The countdown is
 * rendered from a server-computed date rather than a ticking clock — a page
 * whose whole claim is precision should not disagree with itself between
 * server and client render.
 *
 * The point of showing the thresholds, station list and baseline method now,
 * in this much detail, is that nobody can later say we moved the goalposts.
 */

function daysUntil(target: string, now: Date): number {
  const t = new Date(`${target}T00:00:00-07:00`).getTime();
  return Math.ceil((t - now.getTime()) / 86_400_000);
}

export default function ExperimentTracker({ now = new Date() }: { now?: Date }) {
  const days = daysUntil("2026-09-11", now);
  const before = days > 0;

  const odot = PREDICTIONS.filter((p) => p.side === "odot");
  const opp = PREDICTIONS.filter((p) => p.side === "hypothesis");
  const stationCount =
    CORRIDORS.reduce((n, c) => n + c.stations.length, 0) + CORDON.southbound.length;

  return (
    <div className="space-y-6">
      {/* ── status ── */}
      <div className="rounded-sm border-2 border-[var(--color-canopy)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ember)]">
            <FlaskConical className="h-4 w-4" />
            Pre-registered {PREREGISTERED_AT}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[12px] text-[var(--color-ink-muted)]">
            <CalendarClock className="h-4 w-4" />
            {before ? `${days} days until southbound I-5 closes` : "closure under way"}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          Everything below — the thresholds, the {stationCount} traffic detectors, the baseline
          method — was published <strong className="text-[var(--color-ink)]">before</strong> the
          closure began. A test written afterwards proves nothing, because
          whoever writes it already knows the answer.
        </p>
      </div>

      {/* ── the two sides ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <PredictionColumn
          title="What ODOT expects"
          tone="river"
          note="Quoted verbatim from the agency's own closure notice."
          items={odot}
        />
        <PredictionColumn
          title="What the research literature predicts"
          tone="clay"
          note="The reduced-demand hypothesis, from the transportation literature."
          items={opp}
        />
      </div>

      {/* ── provenance ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          ODOT&apos;s forecast is quoted verbatim, with a date. The other column is the
          reduced-demand hypothesis from the transportation literature — well documented after
          closures elsewhere, though no Portland organisation has forecast this one.{" "}
          {INVITATION.body}
        </p>
      </div>

      {/* ── the frozen test ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]">
          What we will measure, and what would settle it
        </h4>
        <div className="mt-4 space-y-4">
          {PREDICTIONS.map((p) => (
            <div key={p.id} className="border-l-2 border-[var(--color-parchment)] pl-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-[11px] font-bold text-[var(--color-ember)]">
                  {p.id}
                </span>
                <span className="text-[13.5px] font-medium text-[var(--color-ink)]">{p.who}</span>
                <span className="rounded-sm bg-[#f0eeec] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                  too early to score
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                {p.rule}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 border-t border-[var(--color-parchment)] pt-4 sm:grid-cols-3">
          <Fact
            k={String(stationCount)}
            t="detectors, named in advance"
            d="Stations may only be dropped by a mechanical data-quality rule, never added. Dropped ones are still listed."
          />
          <Fact
            k="2025"
            t="matched weekdays as baseline"
            d={`Only ${PERIODS.find((p) => p.key === "PRE_CLEAN")?.label.toLowerCase() ?? "three days"} of clean pre-closure weekdays exist, so the primary comparison is the same weekdays a year earlier.`}
          />
          <Fact
            k="Week 3"
            t="the scoring window"
            d="Chosen now, not later. Day one gridlock and day thirty free flow are both real and both meaningless on their own."
          />
        </div>
      </div>

      {/* ── how we tell diversion from evaporation ── */}
      <div className="rounded-sm bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]">
          Telling diversion from evaporation — and why it is hard here
        </h4>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
          If traffic simply moves to I-405 and I-205, that tells us the road network has slack — it
          says nothing about whether Portland needs more lanes. The claim that bears on $2 billion
          is stronger: that some trips stop being made at all. Distinguishing the two is usually
          impossible, because traffic can leak onto streets nobody counts.
        </p>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
          One clean instrument exists, thanks to geography.{" "}
          <strong className="text-[var(--color-ink)]">
            There are exactly two road crossings of the Columbia River in the metro area, and both
            are metered.
          </strong>{" "}
          Nothing can slip around them; the next bridge is forty miles east. For traffic coming south
          out of Washington, the count across those two bridges is a direct measure of trips taken.
        </p>
        <div className="mt-3 max-w-3xl rounded-sm border-l-2 border-[var(--color-clay)] bg-white p-4">
          <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            <strong className="text-[var(--color-ink)]">But that instrument is narrower than it
            looks,</strong> and we would rather say so now than discover it in October. The cordon
            only sees trips that cross the river. A large share of southbound traffic at the Rose
            Quarter never does — it enters from North and Northeast Portland, south of both bridges,
            and the cordon is blind to all of it. Our own detector data shows volume changing
            substantially between the river and the Rose Quarter, which means local traffic is a
            major component, not a rounding error.
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
            So the cordon is a strong test of one clearly-defined slice of the problem, not a verdict
            on the whole of it. We will also report a screenline between the river and the Rose
            Quarter to size the local share directly, and where the arterial counts needed to close
            the gap do not exist, the page will say so rather than quietly narrowing the claim.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Rule
            v={`≥ ${THRESHOLDS.diversionRatio}`}
            t="Pure diversion"
            d="Same trips, different road. Says nothing about needing lanes."
          />
          <Rule
            v={`≤ ${THRESHOLDS.evaporationRatio}`}
            t="Evaporation"
            d="Trips not made by car. Only counts if the drop also clears two standard deviations of ordinary variation."
            emphasis
          />
          <Rule
            v="≥ 1.02"
            t="Longer trips"
            d="Diversion that added mileage — I-205 is the longer way round. A real outcome, rarely reported."
          />
        </div>
      </div>

      {/* ── the caveat, not in a footnote ── */}
      <div className="rounded-sm border-l-2 border-[var(--color-clay)] bg-white p-5 sm:p-6">
        <h4 className="text-[15px] font-semibold text-[var(--color-ink)]">
          {TEMPORARY_CAVEAT.heading}
        </h4>
        {TEMPORARY_CAVEAT.body.map((para) => (
          <p
            key={para.slice(0, 24)}
            className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]"
          >
            {para}
          </p>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
        Corridors instrumented:{" "}
        {CORRIDORS.map((c) => `${c.name} (${corridorLength(c).toFixed(1)} mi)`).join(" · ")}. Data
        from PORTAL, the Portland State University transportation data archive.
      </p>
    </div>
  );
}

function PredictionColumn({
  title,
  note,
  items,
  tone,
}: {
  title: string;
  note: string;
  items: typeof PREDICTIONS;
  tone: "river" | "clay";
}) {
  const accent = tone === "river" ? "#2d5f7e" : "#b85c3a";
  const bg = tone === "river" ? "#f4f8fa" : "#fbf4f0";
  return (
    <div className="rounded-sm border p-5" style={{ borderColor: `${accent}40`, backgroundColor: bg }}>
      <h4 className="text-[15px] font-semibold" style={{ color: accent }}>
        {title}
      </h4>
      <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{note}</p>
      <div className="mt-4 space-y-4">
        {items.map((p) => (
          <div key={p.id}>
            {p.quote ? (
              <blockquote className="border-l-2 pl-3 text-[14px] italic leading-relaxed text-[var(--color-ink)]" style={{ borderColor: accent }}>
                &ldquo;{p.quote}&rdquo;
              </blockquote>
            ) : (
              <p className="text-[14px] leading-relaxed text-[var(--color-ink)]">{p.claim}</p>
            )}
            <p className="mt-1.5 text-[11.5px] text-[var(--color-ink-muted)]">
              {p.isParaphrase ? "Our formulation · " : ""}
              <a
                href={p.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--color-parchment)] underline-offset-2 hover:decoration-current"
              >
                {p.sourceTitle}
              </a>
              {p.publishedOn ? `, ${p.publishedOn}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fact({ k, t, d }: { k: string; t: string; d: string }) {
  return (
    <div>
      <p className="font-mono text-[20px] font-bold tabular-nums text-[var(--color-canopy)]">{k}</p>
      <p className="text-[13px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{d}</p>
    </div>
  );
}

function Rule({
  v,
  t,
  d,
  emphasis,
}: {
  v: string;
  t: string;
  d: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-sm bg-white p-4 ${
        emphasis ? "border-2 border-[var(--color-fern)]/40" : "border border-[var(--color-parchment)]"
      }`}
    >
      <p className="font-mono text-[16px] font-bold tabular-nums text-[var(--color-canopy)]">{v}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-light)]">{d}</p>
    </div>
  );
}
