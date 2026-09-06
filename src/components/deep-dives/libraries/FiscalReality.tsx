import { FISCAL, HEADLINE } from "@/lib/libraries/data";

/**
 * The fiscal position that any plan has to live inside: ongoing revenue
 * already below ongoing expense, a forecast that already spends the last two
 * cents of levy, five separate pots of money drawn to scale so nobody adds
 * them up, and the building bill the bond didn't cover.
 */

const POTS = [
  { label: "Annual operating budget", v: HEADLINE.budgetM, note: "FY2027 adopted · spent every year", tone: "#0f2419" },
  { label: "District Capital Fund", v: FISCAL.capitalFundM, note: "separate fund · bond-era capital purposes", tone: "#3d7a5a" },
  { label: "Operating reserve", v: FISCAL.operatingReserveM, note: "Board-set reserve policy · not for recurring costs", tone: "#7fa88e" },
  { label: "One-time special projects", v: FISCAL.oneTimeSpecialProjectsM, note: "already assigned in FY2027", tone: "#c8956c" },
];
const POT_MAX = Math.max(...POTS.map((p) => p.v));

export default function FiscalReality() {
  const revW = (FISCAL.ongoingRevenueM / FISCAL.ongoingExpenseM) * 100;
  const buildingTotal = FISCAL.correctiveNeedM + FISCAL.renewalNeed20yrM;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* structural deficit */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          Ongoing money in vs. ongoing money out, FY2027
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-baseline justify-between font-mono text-[13px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
              <span>Ongoing revenue</span>
              <span className="text-[15px] font-bold tabular-nums text-[var(--color-canopy)]">${FISCAL.ongoingRevenueM}M</span>
            </div>
            <div className="mt-1.5 h-9 w-full rounded-sm bg-[var(--color-paper-warm)]">
              <div className="h-full rounded-sm bg-[var(--color-canopy)]" style={{ width: `${revW}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between font-mono text-[13px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
              <span>Ongoing expense</span>
              <span className="text-[15px] font-bold tabular-nums text-[var(--color-clay)]">${FISCAL.ongoingExpenseM}M</span>
            </div>
            <div className="relative mt-1.5 h-9 w-full rounded-sm bg-[var(--color-paper-warm)]">
              <div className="h-full rounded-l-sm bg-[var(--color-canopy)]" style={{ width: `${revW}%` }} />
              <div className="absolute inset-y-0 rounded-r-sm bg-[var(--color-clay)]" style={{ left: `${revW}%`, right: 0 }} />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[13px] font-bold text-white">
                −${FISCAL.ongoingDeficitM.toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          The May 2026 five-year forecast shows ongoing expense above ongoing revenue{" "}
          <strong className="text-[var(--color-ink)]">in every year through FY{FISCAL.deficitThroughFY}</strong>, and it already assumes the levy goes to its ${HEADLINE.levyCap.toFixed(2)} maximum from FY
          {FISCAL.forecastAssumesMaxRateFrom}. The last two cents are not headroom. They are spent.
        </p>
        <div className="mt-4 rounded-sm bg-[var(--color-paper-warm)] p-3.5">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            How FY2027 was balanced · ${FISCAL.reductionsM}M in reductions
          </p>
          <p className="mt-1 text-[15px] text-[var(--color-ink)]">{FISCAL.reductionItems.join(" · ")}</p>
        </div>
      </div>

      {/* pots, to scale */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          Four pots of money that must not be added together
        </p>
        <ul className="mt-5 space-y-3.5">
          {POTS.map((p) => (
            <li key={p.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-[var(--color-ink)]">{p.label}</span>
                <span className="font-mono text-[16px] font-bold tabular-nums" style={{ color: p.tone }}>${p.v}M</span>
              </div>
              <div className="mt-1 h-5 w-full rounded-sm bg-[var(--color-paper-warm)]">
                <div className="h-full rounded-sm" style={{ width: `${(p.v / POT_MAX) * 100}%`, background: p.tone }} />
              </div>
              <p className="mt-0.5 text-[13px] text-[var(--color-ink-muted)]">{p.note}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-[var(--color-parchment)] pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-semibold text-[var(--color-ink)]">
              Building need, {FISCAL.unrenovatedBuildings} branches the bond didn&apos;t renovate
            </span>
            <span className="font-mono text-[16px] font-bold tabular-nums text-[var(--color-clay)]">${buildingTotal}M</span>
          </div>
          <div className="mt-1 flex h-5 w-full gap-[2px] rounded-sm bg-[var(--color-paper-warm)]">
            <div className="h-full rounded-l-sm bg-[var(--color-clay)]" style={{ width: `${(FISCAL.correctiveNeedM / POT_MAX) * 100}%` }} title="$13M corrective work" />
            <div className="h-full rounded-r-sm bg-[var(--color-clay)]/45" style={{ width: `${(FISCAL.renewalNeed20yrM / POT_MAX) * 100}%` }} title="$69M renewal over 20 years" />
          </div>
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-muted)]">
            ${FISCAL.correctiveNeedM}M corrective now + ${FISCAL.renewalNeed20yrM}M predicted renewal over twenty years — nearly the whole capital fund, already claimed
          </p>
        </div>
      </div>
    </div>
  );
}
