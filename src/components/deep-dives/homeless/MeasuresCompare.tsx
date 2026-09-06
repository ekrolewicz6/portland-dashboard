import { MEASURED_TODAY } from "@/lib/homeless/continuum";

const WHO: Record<string, string> = { County: "text-[var(--color-fern)]", City: "text-[var(--color-river)]", "Tri-county": "text-[var(--color-ember)]", Sheriff: "text-[var(--color-clay)]" };

/** What the county, the city, and the Sheriff publish today, what each cannot tell you, and what the design changes. */
export default function MeasuresCompare() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What is measured today, and what changes</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">two governments, one Sheriff, no shared row</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[12.5px] leading-snug xl:min-w-0 xl:table-fixed">
          <thead>
            <tr className="border-b border-[var(--color-parchment)] text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              <th className="w-[210px] px-4 py-3 sm:px-6">Published now</th>
              <th className="px-3 py-3">What it counts</th>
              <th className="px-3 py-3 text-[var(--color-clay)]">What it cannot tell you</th>
              <th className="px-3 py-3 text-[var(--color-fern)]">What this design changes</th>
            </tr>
          </thead>
          <tbody>
            {MEASURED_TODAY.map((m) => (
              <tr key={m.name} className="border-b border-[var(--color-parchment)] align-top last:border-b-0 hover:bg-[var(--color-paper-warm)]">
                <td className="px-4 py-3.5 sm:px-6">
                  <span className={`block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${WHO[m.who]}`}>{m.who}</span>
                  <span className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">{m.name}</span>
                </td>
                <td className="px-3 py-3.5 text-[var(--color-ink)]">{m.counts}</td>
                <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{m.cannot}</td>
                <td className="px-3 py-3.5 text-[var(--color-ink-light)]">{m.design}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
        The two governments share a plan and a set of indicators and dispute each other&apos;s numbers in public. The 2024 city audit&apos;s two findings, no single adult entry point and no real-time bed availability, are still open. Washington County has met the Built for Zero quality standard for chronic single adults since 2020; Houston runs one system with one owner. Neither requires new money to copy.
      </p>
    </div>
  );
}
