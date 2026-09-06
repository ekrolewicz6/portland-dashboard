import { SCHOOL_UTILIZATION, SCHOOL_SUMMARY } from "@/lib/pps-budget/schools";

/**
 * The school-level floor under the empty-seats section: all 70 in-scope
 * schools (elementary/K-8/middle/alternative; high schools excluded) as one
 * sorted utilization strip, plus the three overlays that decide the closure
 * debate: who a closure list would touch (Title I), the seismic wrinkle
 * (URM/retrofit), and how far the next school is. Data module:
 * src/lib/pps-budget/schools.ts (generated; provenance in its header).
 * Server component, pure CSS bars.
 */

const S = SCHOOL_SUMMARY;

function pct(u: number): string {
  return `${Math.round(u * 100)}%`;
}

function levelShort(lv: string): string {
  if (lv === "elementary") return "ES";
  if (lv === "middle") return "MS";
  if (lv === "k8") return "K-8";
  return "alt";
}

function Row({ s }: { s: (typeof SCHOOL_UTILIZATION)[number] }) {
  const under = s.u < 0.5;
  return (
    <div className="grid grid-cols-[minmax(0,128px)_minmax(0,1fr)_40px] items-center gap-x-2">
      <p
        className={`truncate font-mono text-[11px] leading-[16px] sm:text-[10px] sm:leading-[15px] ${
          under ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"
        }`}
        title={`${s.n} (${levelShort(s.lv)}): ${s.enr} students in a building sized for ${s.cap}${s.t1 ? " · Title I" : ""}${s.urm ? " · unreinforced masonry" : ""}${s.bc ? " · boundary redrawn since 2018" : ""}`}
      >
        {s.urm ? "⚠" : ""}
        {s.n}
        {s.t1 ? <span className="text-[var(--color-ember)]">*</span> : ""}
      </p>
      <div className="relative h-[9px] min-w-0 rounded-[1px] bg-[var(--color-paper-warm)]">
        {/* 50% and 100% reference ticks */}
        <span className="absolute inset-y-0 left-1/2 w-px bg-[var(--color-parchment)]" aria-hidden />
        <div
          className={`h-full rounded-[1px] ${under ? "bg-[var(--color-clay)]" : "bg-[var(--color-sage)]"}`}
          style={{ width: `${Math.min(s.u * 100, 100).toFixed(1)}%` }}
        />
      </div>
      <p
        className={`text-right font-mono text-[11px] tabular-nums leading-[16px] sm:text-[10px] sm:leading-[15px] ${
          under ? "font-bold text-[var(--color-clay)]" : "text-[var(--color-ink-muted)]"
        }`}
      >
        {pct(s.u)}
      </p>
    </div>
  );
}

export default function SchoolUtilization() {
  const half = Math.ceil(SCHOOL_UTILIZATION.length / 2);
  const cols = [SCHOOL_UTILIZATION.slice(0, half), SCHOOL_UTILIZATION.slice(half)];

  return (
    <div className="space-y-5">
      {/* ── The stat band ── */}
      <div className="grid gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-3">
        {[
          {
            v: S.emptySeats.toLocaleString("en-US"),
            k: `empty seats across ${S.schools} schools, by the district's own capacity numbers`,
          },
          { v: pct(S.medianUtilization), k: "the median school's building utilization, 2025-26" },
          { v: String(S.under50), k: "schools less than half full" },
        ].map((x) => (
          <div key={x.k} className="bg-white p-4">
            <p className="font-mono text-[26px] font-bold tabular-nums leading-none text-[var(--color-ink)]">
              {x.v}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{x.k}</p>
          </div>
        ))}
      </div>

      {/* ── The strip: all 70 schools ── */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Every school, sorted by how full its building is
          </p>
          <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-muted)]">
            enrollment ÷ the district&apos;s 2021 functional capacity · tick = half full
          </span>
        </div>
        <div className="mt-4 grid gap-x-8 gap-y-[6px] md:grid-cols-2 md:[grid-auto-flow:column] md:[grid-template-rows:repeat(35,auto)]">
          {cols.flat().map((s) => (
            <Row key={s.n} s={s} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--color-parchment)] pt-3">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-clay)]" />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              under half full
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-3 rounded-sm bg-[var(--color-sage)]" />
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              half full or better
            </span>
          </span>
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ember)]">*</span> Title I
          </span>
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
            ⚠ unreinforced masonry
          </span>
        </div>
      </div>

      {/* ── The three overlays that decide the closure debate ── */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Who a closure list would touch
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">Of the {S.under50} schools under half full, <span className="font-mono font-bold tabular-nums text-[var(--color-ink)]">{S.under50TitleI}</span> are Title I. A list drawn by emptiness alone lands on lower-income schools again.</p>
        </div>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The seismic wrinkle nobody prices in
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{S.urmBuildings} schools are unreinforced masonry with <span className="font-mono font-bold tabular-nums text-[var(--color-ink)]">${S.seismicUnfundedM}M</span> of retrofit work no bond funds. Keeping one open is quietly a retrofit decision.</p>
        </div>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            How far is the next school?
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">For the smallest schools, the next same-grade school is a median <span className="font-mono font-bold tabular-nums text-[var(--color-ink)]">{S.medianDriveMi} miles</span> away. Skyline is the exception at {S.driveOutliers[0].mi}.</p>
        </div>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">Data: ppsdata.info (Alex Meub, open source) compiling ODE Fall Membership 2025-26, the district&apos;s 2021 facility plan capacities, and the Holmes 2024 seismic estimates; samples of each verified against the primary documents. Capacity predates recent bond expansions; retrofit costs are rough-order; high schools out of scope.</p>
    </div>
  );
}
