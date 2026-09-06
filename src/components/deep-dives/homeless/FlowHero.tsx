import { FLOW, fmtNum } from "@/lib/homeless/engine";
import { STATS } from "@/lib/homeless/data";

/**
 * The one idea of the page, as a picture: two proportional bars. People who
 * fall into homelessness each month vs. people who climb out. The gap is the
 * whole story. Server component, pure CSS, sized to the hero's dark panel.
 */
const HATCH_DARK =
  "repeating-linear-gradient(135deg, rgba(224,168,112,0.9) 0 5px, rgba(224,168,112,0.25) 5px 10px)";

export default function FlowHero() {
  const inPct = 100;
  const outPct = (FLOW.outflow / FLOW.inflow) * 100;
  const net = FLOW.inflow - FLOW.outflow;
  return (
    <div className="rounded-sm border border-white/12 bg-white/[0.05] p-5 backdrop-blur sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
          Multnomah County, every month
        </p>
        <p className="font-mono text-[10px] tabular-nums text-white/45">Jan 2025 by-name list</p>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-semibold text-white">Fall into homelessness</span>
            <span className="font-mono text-[15px] font-bold tabular-nums text-[#e8a07a]">{fmtNum(FLOW.inflow)}</span>
          </div>
          <div className="mt-1.5 h-7 w-full overflow-hidden rounded-sm bg-white/[0.06]">
            <div className="h-full rounded-sm bg-[var(--color-clay)]" style={{ width: `${inPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-semibold text-white">Climb out</span>
            <span className="font-mono text-[15px] font-bold tabular-nums text-[#8fcaa4]">{fmtNum(FLOW.outflow)}</span>
          </div>
          <div className="relative mt-1.5 flex h-7 w-full overflow-hidden rounded-sm bg-white/[0.06]">
            <div className="h-full rounded-sm bg-[var(--color-fern)]" style={{ width: `${outPct}%` }} />
            <div
              className="ml-[2px] flex h-full flex-1 items-center justify-center rounded-sm"
              style={{ backgroundImage: HATCH_DARK }}
              aria-hidden
            >
              <span className="rounded-[2px] bg-[var(--color-canopy)]/90 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-[var(--color-ember-bright)]">
                +{fmtNum(net)} stay
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-[var(--color-ember-bright)]">
            +{fmtNum(net)}
          </p>
          <p className="mt-1 text-[12px] text-white/60">net added to the list, every month</p>
        </div>
        <p className="max-w-[170px] text-right text-[12px] leading-snug text-white/60">
          {fmtNum(STATS.byNameTotalJan2025)} → ~{fmtNum(STATS.byNameTotal)} in one year
        </p>
      </div>
    </div>
  );
}
