/**
 * The pension bill as a timeline: six nodes, one line each, ending at the
 * 4% → 23% jump. Replaces four paragraphs. Facts and cites: document.md
 * "PERS" paragraph; acfr-fy2025 p37/p122 ($510.3M bonds outstanding);
 * cbrc-2026-27 p10 (4% → 23%); tscc-review-fy2026 p10 (reserve spent).
 */

const NODES = [
  { year: "1945", who: "Salem", text: "PERS created for every Oregon public employer. Districts pay the rate; the PERS board sets it." },
  { year: "1980s–90s", who: "Salem", text: "Workers hired before 1996 are guaranteed ~8% a year on their accounts, in good markets and bad." },
  { year: "2001 · 2008", who: "Markets", text: "Two crashes turn the guarantees into debt. Every public employer must pay extra to fill the hole." },
  { year: "2002–03", who: "PPS", text: "The district borrows hundreds of millions in pension bonds and parks it with PERS. The credits hold its rate near 4% for two decades.", pps: true },
  { year: "2015", who: "Courts", text: "The Oregon Supreme Court rules benefits already earned cannot be cut. The bill is sealed." },
  { year: "Now", who: "PPS", text: "The credits expire on schedule. The rate jumps toward 23%. The reserve built for this was spent in one year, to its last $394,000.", pps: true, now: true },
] as const;

export default function PensionTimeline() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          How a pension rate goes from 4 percent to 23
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          $510.3M of pension bonds still outstanding
        </p>
      </div>
      <ol className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {NODES.map((n, i) => {
          const pps = "pps" in n && n.pps;
          const now = "now" in n && n.now;
          return (
            <li key={n.year} className="relative border-t-2 pt-3" style={{ borderColor: now ? "var(--color-clay)" : pps ? "var(--color-ember)" : "var(--color-parchment)" }}>
              <span
                aria-hidden
                className="absolute -top-[5px] left-0 h-2 w-2 rounded-full"
                style={{ backgroundColor: now ? "var(--color-clay)" : pps ? "var(--color-ember)" : "var(--color-ink-muted)" }}
              />
              <p className="font-mono text-[11px] font-bold tabular-nums text-[var(--color-ink)]">
                {n.year}
              </p>
              <p className={`font-mono text-[9px] uppercase tracking-[0.14em] ${pps ? "text-[var(--color-ember)]" : "text-[var(--color-ink-muted)]"}`}>
                {n.who} · {i + 1}
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{n.text}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 border-t border-[var(--color-parchment)] pt-3 text-[14px] leading-snug text-[var(--color-ink)]">
        <span className="font-semibold">Who is to blame:</span> for the rate, Salem and the courts, decades ago. For being unready, the district.
      </p>
    </div>
  );
}
