import { APPROVALS, HEADLINE } from "@/lib/libraries/data";

/**
 * Who has to say yes. First the structure as a diagram — voters set the
 * ceiling, one five-member Board wears two hats, the library operates under
 * an intergovernmental agreement, the Auditor watches — then a matrix of
 * twelve concrete actions and the single authority each one needs.
 */

const WHO_SHORT: Record<string, string> = {
  Voters: "Voters",
  "County Board": "Board",
  MCL: "MCL",
  Partners: "Partners",
};

const WHO_TONE: Record<string, string> = {
  Voters: "bg-[var(--color-clay)] text-white",
  "County Board": "bg-[var(--color-canopy)] text-white",
  MCL: "bg-[var(--color-sage)] text-[var(--color-canopy)]",
  Partners: "bg-[var(--color-ember)] text-[var(--color-canopy)]",
};

export default function ApprovalMap() {
  const money = APPROVALS.filter((a) => a.kind === "money");
  const policy = APPROVALS.filter((a) => a.kind === "policy");

  return (
    <div className="space-y-6">
      {/* structure diagram */}
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4 sm:px-7">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            The chain of authority
          </p>
        </div>
        <div className="grid gap-px bg-[var(--color-parchment)] md:grid-cols-4">
          {[
            {
              who: "Voters",
              sets: "The ceiling",
              body: `Approved the permanent district and its $${HEADLINE.levyCap.toFixed(2)} cap in 2012 (63% yes) and the $${HEADLINE.bondAuthorizedM}M bond in 2020 (${HEADLINE.bondApprovalPct}% yes). Only voters can raise the cap or issue new debt.`,
              tone: "Voters",
            },
            {
              who: "Board of County Commissioners",
              sets: "Money and policy",
              body: "Five commissioners who also sit as the Library District Board. Set the rate each year, adopt the budget, authorize major commitments. Two of the five seats turn over in December 2026.",
              tone: "County Board",
            },
            {
              who: "Multnomah County Library",
              sets: "Operations",
              body: "The District contracts with the County to run the library through an intergovernmental agreement. The Director is the accountable executive; represented staff work under a 2025–2028 agreement.",
              tone: "MCL",
            },
            {
              who: "County Auditor · partners",
              sets: "Oversight and expertise",
              body: "The Auditor reviews independently (2023, 2025). Schools, health, housing, emergency management, and tribal governments own what they own — nothing they run can be assumed.",
              tone: "Partners",
            },
          ].map((n, i) => (
            <div key={n.who} className="relative bg-white p-5">
              <span className={`inline-flex items-center rounded-sm px-2 py-1 font-mono text-[12px] font-bold uppercase leading-tight tracking-[0.12em] ${WHO_TONE[n.tone]}`}>
                {n.sets}
              </span>
              <h3 className="mt-2.5 font-editorial text-[18px] leading-snug text-[var(--color-ink)]">{n.who}</h3>
              <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-ink-light)]">{n.body}</p>
              {i < 3 ? (
                <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-parchment)] bg-white font-mono text-[14px] text-[var(--color-ink-muted)] md:flex">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* matrix */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: "To move money", rows: money },
          { title: "To change policy or service", rows: policy },
        ].map((col) => (
          <div key={col.title} className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
            <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3">
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">{col.title}</p>
            </div>
            <ul className="divide-y divide-[var(--color-parchment)]">
              {col.rows.map((a) => (
                <li key={a.action} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 px-5 py-3.5 sm:grid-cols-[108px_minmax(0,1fr)]">
                  <span className={`inline-flex h-6 w-fit items-center whitespace-nowrap rounded-sm px-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] ${WHO_TONE[a.who]}`}>
                    {WHO_SHORT[a.who]}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
                      {a.action}
                      {a.status ? <span className="ml-2 font-mono text-[12px] font-normal uppercase tracking-[0.1em] text-[var(--color-clay)]">{a.status}</span> : null}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-snug text-[var(--color-ink-muted)]">{a.how}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
