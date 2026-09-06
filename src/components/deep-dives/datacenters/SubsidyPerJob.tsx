import { SUBSIDY_PER_JOB, fmtNum } from "@/lib/datacenters/data";

/**
 * Incentive cost per job by program, from Oregon's own incentive study.
 * HTML horizontal bars (house pattern — see KNOWN_ISSUES on Recharts vertical bars).
 */
export default function SubsidyPerJob() {
  const max = Math.max(...SUBSIDY_PER_JOB.map((p) => p.perJob));
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
      <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
        Incentive cost per job created
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--color-ink-muted)]">
        Oregon&apos;s incentive study, by program type
      </p>
      <div className="mt-5 space-y-5">
        {SUBSIDY_PER_JOB.map((p) => {
          const isDataCenterDeal = p.perJob === max;
          return (
            <div key={p.program}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {p.program}
                </span>
                <span
                  className={`font-mono text-[20px] font-bold tabular-nums leading-none ${
                    isDataCenterDeal ? "text-[var(--color-clay)]" : "text-[var(--color-fern)]"
                  }`}
                >
                  ${fmtNum(p.perJob)}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-sm bg-[var(--color-paper-warm)] overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${(p.perJob / max) * 100}%`,
                    backgroundColor: isDataCenterDeal ? "#b85c3a" : "#3d7a5a",
                  }}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-[var(--color-ink-muted)]">{p.note}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-5 border-t border-[var(--color-parchment)] pt-4 text-[13px] text-[var(--color-ink-light)] leading-relaxed">
        The same study found the 15-year deals return{" "}
        <strong className="text-[var(--color-clay)]">16 cents of personal income tax</strong> for
        every dollar of property tax forgone, an 84-cent loss, while standard zones return $1.35.
      </p>
    </div>
  );
}
