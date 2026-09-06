import { HEADLINE } from "@/lib/pps-budget/data";

/**
 * The whole story in one screen, directly under the hero. A reader who stops
 * here has the full thesis: (a) the $2.77B decomposed by what can actually
 * move, "the one-page budget the district has never published"; (b) the three
 * findings, each with its one number, deep-linking to their acts; (c) the
 * annual question. Every act below pays off one element of this exhibit.
 *
 * Segment math ($K, FY2026-27 adopted): locked = capital 1,382,508 + debt
 * service 278,876 [budget-fy2026-27-vol1 p173, p157]; grants = special revenue
 * 223,936 [p122]; committed = GF salaries+benefits 680,500 [p107] + internal
 * service 21,159 [p205]; movable = GF remainder 181,612.
 */

const TOTAL_K = 2_768_591;

const SEGMENTS = [
  {
    label: "Locked",
    valueK: 1_661_384,
    display: "$1.66B",
    detail: "Bond money and bond debt. Voters locked it in, and only a new bond measure can change it.",
    color: "var(--color-canopy)",
  },
  {
    label: "Restricted grants",
    valueK: 223_936,
    display: "$224M",
    detail: "Title I, special education, and similar grants. Congress and the legislature set the rules.",
    color: "var(--color-clay)",
  },
  {
    label: "Committed",
    valueK: 701_659,
    display: "$702M",
    detail: "Payroll and pensions under contracts already signed. It can move, but only at the bargaining table.",
    color: "var(--color-ember)",
  },
  {
    label: "The movable slice",
    valueK: 181_612,
    display: "$182M",
    detail: "What is left. This is the only money this year's board votes actually decide.",
    color: "var(--color-fern)",
  },
] as const;

const FINDINGS = [
  {
    href: "#the-empty-chair",
    stat: "9",
    statLabel: "working days given to citizen reviewers of a $2.8B budget",
    title: "No one checks the work",
    body: "Everywhere else in Oregon, citizens sit on the budget committee with a vote. In Portland the board approves its own work.",
  },
  {
    href: "#the-levy-leak",
    stat: "$1.51",
    statLabel: "of every $1.99 voters approved actually arrives",
    title: "The teachers levy leaks",
    body: "Tax caps from the 1990s erase about a quarter of the teachers levy before it arrives. The same levy now pays for about 200 fewer teachers than it did in 2019.",
  },
  {
    href: "#waste",
    stat: "$41M→$18M",
    statLabel: "the district's own guess at its year-end cash, months apart",
    title: "Big surprises, no required response",
    body: "The district's year-end forecast swung by $23 million within a single year. Nothing requires anyone to explain that or act on it, so decisions come late.",
  },
] as const;

export default function TheWholeStory() {
  return (
    <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
      <div className="mx-auto w-full max-w-[1400px] 3xl:max-w-[1800px] px-5 sm:px-8 lg:px-12 py-10 sm:py-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
          The short version
        </p>

        {/* (a) The one-page budget the district has never published */}
        <div className="mt-5 rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-editorial text-[22px] sm:text-[26px] leading-tight text-[var(--color-ink)]">
              ${(HEADLINE.allFundsFy27 / 1e9).toFixed(2)} billion, sorted by what can actually move
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              FY2026-27 adopted · the one-page budget PPS has never published
            </p>
          </div>

          <div className="mt-5 flex h-14 w-full overflow-hidden rounded-sm">
            {SEGMENTS.map((s) => (
              <div
                key={s.label}
                className="relative h-full"
                style={{ width: `${(s.valueK / TOTAL_K) * 100}%`, backgroundColor: s.color }}
                title={`${s.label}: ${s.display}`}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SEGMENTS.map((s) => (
              <div key={s.label} className="flex gap-2.5">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <p className="text-[14px] font-semibold leading-tight text-[var(--color-ink)]">
                    {s.label}{" "}
                    <span className="font-mono tabular-nums text-[var(--color-ink-light)]">
                      {s.display}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">
                    {s.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-[var(--color-parchment)] pt-3 text-[15px] leading-relaxed text-[var(--color-ink)]">
            Every real fight about this budget is a fight over the green slice. This year the operating fund fell <span className="font-mono font-semibold tabular-nums">$6.5M</span> while the headline total grew <span className="font-mono tabular-nums">$733M</span>.
          </p>
        </div>

        {/* (b) The three findings */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {FINDINGS.map((f) => (
            <a
              key={f.title}
              href={f.href}
              className="group rounded-sm border border-[var(--color-parchment)] bg-white p-5 transition-colors hover:border-[var(--color-ember)]"
            >
              <span className="block font-mono text-[30px] font-semibold tabular-nums leading-none text-[var(--color-clay)] sm:text-[34px]">
                {f.stat}
              </span>
              <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-ink-muted)]">
                {f.statLabel}
              </p>
              <p className="mt-3 border-t border-[var(--color-parchment)] pt-3 font-editorial text-[20px] leading-tight text-[var(--color-ink)] group-hover:text-[var(--color-canopy)]">
                {f.title}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">
                {f.body}
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ember)]">
                Read the evidence ↓
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
