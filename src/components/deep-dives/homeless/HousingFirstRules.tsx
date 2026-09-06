import { HOUSING_FIRST, type HfRule } from "@/lib/homeless/continuum";

/**
 * When Housing First works, when it works only with conditions, and when it
 * is not enough by itself. Three columns, each rule with its evidence.
 */
const GROUPS: { verdict: HfRule["verdict"]; label: string; sub: string; color: string; tint: string }[] = [
  { verdict: "works", label: "Works", sub: "offer the lease now", color: "var(--color-fern)", tint: "var(--color-sage-tint)" },
  { verdict: "works-with-conditions", label: "Works with conditions", sub: "the conditions are the model", color: "var(--color-ember)", tint: "#fff7ee" },
  { verdict: "not-by-itself", label: "Not by itself", sub: "something else comes first or alongside", color: "var(--color-clay)", tint: "var(--color-clay-tint)" },
];

export default function HousingFirstRules() {
  return (
    <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
      {GROUPS.map((g) => {
        const rules = HOUSING_FIRST.filter((r) => r.verdict === g.verdict);
        return (
          <div key={g.verdict} className="flex flex-col rounded-sm border border-[var(--color-parchment)] bg-white">
            <div className="border-b-[3px] px-5 pt-4 pb-3" style={{ borderColor: g.color }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: g.color }}>{g.label}</p>
              <p className="text-[12.5px] text-[var(--color-ink-muted)]">{g.sub} · {rules.length} {rules.length === 1 ? "case" : "cases"}</p>
            </div>
            <ul className="divide-y divide-[var(--color-parchment)]">
              {rules.map((r) => (
                <li key={r.who} className="px-5 py-4">
                  <p className="text-[14.5px] font-semibold leading-tight text-[var(--color-ink)]">{r.who}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{r.finding}</p>
                  <p className="mt-2 rounded-sm px-2.5 py-2 text-[12px] leading-snug text-[var(--color-ink-light)]" style={{ backgroundColor: g.tint }}>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Evidence · </span>{r.evidence}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
