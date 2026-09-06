import { WASTE_VERDICTS } from "@/lib/pps-budget/data";

/**
 * The waste examination, W1 to W5: the Act IV opener (document.md section 10).
 * Opens with the waste standard and the no-total rule in a bordered band, then
 * renders the five examined claims as verdict cards. W5, money lost to slow
 * reactions, closes the grid full-width because it is the biggest problem the
 * page shows and the one every other problem got more expensive through.
 */

type WasteVerdict = (typeof WASTE_VERDICTS)[number];

const LEDGER_LABELS: Record<WasteVerdict["ledger"], string> = {
  locked: "Locked money",
  movable: "Money the board controls",
  committed: "Committed money",
};

/** Verdict chip colors: clay for shown, ember for cost of delay,
 *  sage for a defensible choice, canopy for unexplained overhead. */
const VERDICT_STYLES: Record<WasteVerdict["id"], { bg: string; fg: string }> = {
  W1: { bg: "var(--color-clay)", fg: "#ffffff" },
  W2: { bg: "var(--color-ember)", fg: "var(--color-canopy-deep)" },
  W3: { bg: "var(--color-canopy)", fg: "var(--color-paper)" },
  W4: { bg: "var(--color-sage)", fg: "var(--color-canopy-deep)" },
  W5: { bg: "var(--color-clay)", fg: "#ffffff" },
};

function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p
      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)] ${className}`}
    >
      {children}
    </p>
  );
}

function StandardBand() {
  return (
    <div>
      <div className="rounded-sm border border-[var(--color-canopy)]/40 bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <Eyebrow>The standard</Eyebrow>
        <p className="mt-3 max-w-3xl font-editorial text-[18px] leading-relaxed text-[var(--color-ink)] sm:text-[20px]">
          {
            "A dollar is wasted only when the district controlled it, a better use of that same money was predictable, and the district had, or refused to gather, the information to know at the time."
          }
        </p>
        <p className="mt-4 max-w-3xl border-t border-[var(--color-parchment)] pt-4 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
          {
            "These findings do not add up to one waste number, and anyone who gives you one is guessing."
          }
        </p>
      </div>
    </div>
  );
}

function VerdictCard({ v }: { v: WasteVerdict }) {
  const isLargest = v.id === "W5";
  const chip = VERDICT_STYLES[v.id];

  return (
    <article
      className={`rounded-sm border p-5 ${
        isLargest
          ? "border-[var(--color-clay)]/50 bg-[var(--color-paper-warm)] md:col-span-2"
          : "border-[var(--color-parchment)] bg-white"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <span
          className={`shrink-0 rounded-full border border-[var(--color-parchment)] px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-[var(--color-ink-light)] ${
            isLargest ? "bg-white" : "bg-[var(--color-paper-warm)]"
          }`}
        >
          {v.id}
        </span>
        <h3 className="font-editorial text-[20px] leading-tight text-[var(--color-ink)]">
          {v.title}
        </h3>
        <span className="rounded-full border border-[var(--color-parchment)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          {LEDGER_LABELS[v.ledger]}
        </span>
      </div>

      <div
        className="mt-3 border-l-[3px] pl-3"
        style={{ borderColor: chip.bg }}
      >
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          The verdict
        </p>
        <p className="mt-0.5 text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
          {v.verdict}
        </p>
      </div>

      <details className="group mt-4">
        <summary className="cursor-pointer list-none font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-canopy)] hover:text-[var(--color-ink)]">Evidence, the strongest defense, and the takeaway <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span></summary>
        <div className="mt-3 space-y-3 border-t border-[var(--color-parchment)] pt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
          <p><span className="font-semibold text-[var(--color-ink)]">The evidence: </span>{v.evidence}</p>
          <p><span className="font-semibold text-[var(--color-ink)]">The strongest defense: </span>{v.defense}</p>
          <p className="font-semibold text-[var(--color-ink)]">{v.bottomLine}</p>
        </div>
      </details>
    </article>
  );
}

export default function WasteVerdicts() {
  // The data array is already in display order; W5 renders last, full-width.
  const ordered = WASTE_VERDICTS;

  return (
    <div className="space-y-4">
      <StandardBand />

      <div className="grid gap-4 md:grid-cols-2">
        {ordered.map((v) => (
          <VerdictCard key={v.id} v={v} />
        ))}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
        Sources: PPS bond performance audits, Oregon Secretary of State 2019 performance
        audit, Tax Supervising and Conservation Commission annual reviews, PPS adopted
        budget documents.
      </p>
    </div>
  );
}
