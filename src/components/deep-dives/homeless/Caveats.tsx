import { CAVEATS, type Caveat } from "@/lib/homeless/continuum";

/**
 * What the design does not yet cover, from the adversarial review: cohorts
 * with no pathway, legal limits on the shared count, data that does not
 * exist, governance with no owner, and the ways the metrics could mislead.
 */
const KINDS: { kind: Caveat["kind"]; label: string }[] = [
  { kind: "cohort", label: "People with no pathway yet" },
  { kind: "legal", label: "Legal limits on the count" },
  { kind: "data", label: "Data that does not exist, or already does" },
  { kind: "governance", label: "Nobody owns it yet" },
  { kind: "risk", label: "How the metrics could mislead" },
];

export default function Caveats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {KINDS.map((k) => (
        <div key={k.kind} className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <p className="border-b border-[var(--color-parchment)] px-4 pt-3.5 pb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">{k.label}</p>
          <ul className="divide-y divide-[var(--color-parchment)]">
            {CAVEATS.filter((c) => c.kind === k.kind).map((c) => (
              <li key={c.title} className="px-4 py-3">
                <p className="text-[13.5px] font-semibold leading-tight text-[var(--color-ink)]">{c.title}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
