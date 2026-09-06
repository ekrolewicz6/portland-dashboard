/**
 * The benchmarks: is PPS spending a lot per student, and is teacher pay the
 * reason? Two exhibits for the "is it a lot?" section (Act III).
 *
 *   1. Per-student spending on two accounting bases that must never share a
 *      column: Oregon's own operating measure (NOE per ADMr, 2023-24) against
 *      in-state peers, and federal current spending (Census F-33, FY2024)
 *      against big-city peers. Between them, the state's own "should":
 *      the Quality Education Model.
 *   2. Teacher salary schedules across six districts, nominal and adjusted
 *      for each metro's cost of living (BEA Regional Price Parities, 2024).
 *
 * Sources and derivations: research/pps-budget/notes/benchmarks-2026-08-30.md.
 * Server component, pure CSS bars.
 */

/** ODE Net Operating Expenditures per ADMr, 2023-24 (OAR 581-023-0041 basis). */
const OREGON_PEERS = [
  { name: "Portland", value: 16503, pps: true },
  { name: "Beaverton", value: 13135, pps: false },
  { name: "Oregon average", value: 12989, pps: false },
  { name: "Salem-Keizer", value: 12958, pps: false },
  { name: "David Douglas", value: 12924, pps: false },
] as const;

/** Census F-33 per-pupil current spending, FY2024 (all funds, no capital/debt). */
const NATIONAL_PEERS = [
  { name: "San Francisco", value: 25173, pps: false },
  { name: "Minneapolis", value: 24469, pps: false },
  { name: "Sacramento", value: 22771, pps: false },
  { name: "Portland", value: 22237, pps: true },
  { name: "Seattle", value: 22227, pps: false },
  { name: "Denver", value: 17972, pps: false },
  { name: "Oregon average", value: 18083, pps: false },
  { name: "U.S. average", value: 17619, pps: false },
] as const;

/**
 * Published 2025-26 salary schedules (SF effective Jan 2025), adjusted by BEA
 * metro all-items RPP 2024: adjusted = salary / RPP * 100. Sorted by adjusted
 * top of scale.
 */
const TEACHER_PAY = [
  { city: "Seattle", days: 189, start: 74730, top: 146087, rpp: 111.1, adjStart: 67244, adjTop: 131452, note: "†" },
  { city: "Sacramento", days: 192, start: 64225, top: 135137, rpp: 106.7, adjStart: 60209, adjTop: 126687 },
  { city: "Denver", days: 186, start: 57666, top: 124233, rpp: 105.8, adjStart: 54514, adjTop: 117442, note: "‡" },
  { city: "San Francisco", days: 185, start: 79468, top: 131654, rpp: 115.6, adjStart: 68736, adjTop: 113875, note: "§" },
  { city: "Minneapolis", days: null, start: 54702, top: 114306, rpp: 104.8, adjStart: 52186, adjTop: 109048, note: "‡" },
  { city: "Portland", days: 193, start: 57206, top: 111314, rpp: 105.4, adjStart: 54264, adjTop: 105590, pps: true },
] as const;

function fmtK(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function Eyebrow({ children, tone = "muted" }: { children: string; tone?: "muted" | "ember" }) {
  return (
    <p
      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${
        tone === "ember" ? "text-[var(--color-ember)]" : "text-[var(--color-ink-muted)]"
      }`}
    >
      {children}
    </p>
  );
}

function BarPanel({
  title,
  basis,
  rows,
  max,
  footer,
}: {
  title: string;
  basis: string;
  rows: readonly { name: string; value: number; pps: boolean }[];
  max: number;
  footer: string;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{basis}</p>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span
              className={`w-[110px] shrink-0 text-[12px] leading-tight ${
                r.pps
                  ? "font-semibold text-[var(--color-ink)]"
                  : "text-[var(--color-ink-light)]"
              }`}
            >
              {r.name}
            </span>
            <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
              <div
                className={`h-full rounded-sm ${r.pps ? "bg-[var(--color-canopy)]" : "bg-[var(--color-sage)]"}`}
                style={{ width: `${((r.value / max) * 100).toFixed(1)}%` }}
              />
            </div>
            <span
              className={`w-16 shrink-0 text-right font-mono text-[11px] tabular-nums ${
                r.pps ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-light)]"
              }`}
            >
              {fmtK(r.value)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[13px] leading-relaxed text-[var(--color-ink)]">
        {footer}
      </p>
    </div>
  );
}

const TH =
  "px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]";

export default function Benchmarks() {
  return (
    <div className="space-y-6">
      {/* ── 1. Per-student, two accountings side by side ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel
          title="Against Oregon, on Oregon's books"
          basis="Operating spending per student in 2023-24, using the state's own accounting."
          rows={OREGON_PEERS}
          max={16503}
          footer="Portland spends 27 percent above the state average. Every other large district sits within 2 percent of it."
        />
        <BarPanel
          title="Against big cities, on federal books"
          basis="Current spending per pupil in FY2024, using federal accounting. The two panels use different rules and should not be compared with each other."
          rows={NATIONAL_PEERS}
          max={25173}
          footer="26 percent above the national average, in a dead heat with Seattle, below San Francisco and Minneapolis, far above Denver."
        />
      </div>

      {/* ── 2. The state's own "should" ── */}
      <div className="rounded-sm border border-[var(--color-canopy)]/40 bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <Eyebrow tone="ember">What the state says it should be</Eyebrow>
        <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <div>
            <p className="font-editorial text-[40px] leading-none text-[var(--color-ink)]">
              <span className="font-mono tabular-nums">$2.42B</span>
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-ink-light)]">
              per two-year budget: the gap between what Oregon funds and what its own adequacy
              model says schools need, statewide
            </p>
          </div>
          <div className="space-y-3 text-[14.5px] leading-relaxed text-[var(--color-ink)] md:border-l md:border-[var(--color-parchment)] md:pl-6">
            <p>Oregon&apos;s own Quality Education Model prices an adequate system at about <span className="font-mono font-semibold tabular-nums">$24,900</span> per student. The legislature has never funded it.</p>
            <p className="font-semibold">PPS, at about $26,300 per student all-funds operating, already spends past it. &ldquo;Underfunded&rdquo; describes Oregon. It does not describe Portland&apos;s total.</p>
          </div>
        </div>
        <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[13px] leading-relaxed text-[var(--color-ink)]">
          What is genuinely low is the share reaching instruction: about 53 percent of operating
          spending against a 61 percent national average. Closing that eight-point gap would move
          roughly <span className="font-mono font-semibold tabular-nums">$92 million</span> a
          year, about $2,100 per student, into classrooms without a new dollar of revenue.
        </p>
      </div>

      {/* ── 3. Teacher pay, cost-of-living adjusted ── */}
      <div>
        <Eyebrow>Teacher pay, adjusted for what it costs to live there</Eyebrow>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
          Published 2025-26 schedules, adjusted by each metro&apos;s federal cost-of-living index. Portland is last.
        </p>
        <div className="mt-4 overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-white">
          <table className="w-full sm:min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
                <th className={TH}>District</th>
                <th className={`${TH} hidden text-right sm:table-cell`}>Starting salary</th>
                <th className={`${TH} text-right`}>Top of scale</th>
                <th className={`${TH} hidden text-right sm:table-cell`}>Cost of living</th>
                <th className={`${TH} text-right`}>Top, adjusted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-parchment)]">
              {TEACHER_PAY.map((row) => {
                const pps = "pps" in row && row.pps;
                const cell = `px-4 py-2.5 text-right font-mono text-[12px] tabular-nums ${
                  pps ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-light)]"
                }`;
                return (
                  <tr key={row.city} className={pps ? "bg-[var(--color-paper-warm)]" : ""}>
                    <td
                      className={`px-4 py-2.5 text-[13px] ${
                        pps
                          ? "font-semibold text-[var(--color-ink)]"
                          : "text-[var(--color-ink-light)]"
                      }`}
                    >
                      {row.city}
                      {"note" in row && row.note ? (
                        <span aria-hidden className="ml-0.5 text-[var(--color-ink-muted)]">
                          {row.note}
                        </span>
                      ) : null}
                    </td>
                    <td className={`${cell} hidden sm:table-cell`}>{fmtK(row.start)}</td>
                    <td className={cell}>{fmtK(row.top)}</td>
                    <td className={`${cell} hidden sm:table-cell`}>{row.rpp.toFixed(1)}</td>
                    <td className={cell}>{fmtK(row.adjTop)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <details className="mt-2 group"><summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Method and caveats <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span></summary><p className="mt-2 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">Cost of living = federal Regional Price Parity for each metro, 2024 (100 = national average); adjusted salary = salary &divide; index &times; 100. &dagger; Seattle figures include nine supplemental days and a stipend most teachers receive (base: $63,117 to $121,632). &Dagger; Denver and Minneapolis top lanes require a doctorate; Portland tops out at a master&apos;s plus 45 credits. &sect; San Francisco&apos;s schedule took effect January 2025 and includes parcel-tax add-ons. Contract years run 184 to 193 days; Portland&apos;s is the longest.</p></details>

        {/* The wedge */}
        <div className="mt-4 rounded-sm border-l-2 border-[var(--color-clay)] bg-[var(--color-paper-warm)] p-4">
          <p className="text-[15px] leading-relaxed text-[var(--color-ink)]"><span className="font-semibold">Expensive without being well paid.</span> A levy-funded teacher costs the district about $152,000; the top of the salary scale is $111,314. The wedge is pensions and benefits, set in Salem, not paychecks.</p>
        </div>
      </div>
    </div>
  );
}
