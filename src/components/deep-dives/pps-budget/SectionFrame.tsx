import { DIVE_CONTAINER } from "@/components/deep-dives/shared";

/**
 * The page's only section shape. Full width, stacked, mobile-first:
 *
 *   eyebrow "N / 12 · act"
 *   the claim, as a headline (the answer, never the question)
 *   one optional sub-line
 *   the visual(s)
 *   footer: the one number that proves the claim | "Next →" link
 *
 * Anything longer than a line of prose lives in <Depth>, closed by default,
 * so the visuals carry the story and the research stays one tap away.
 */

type Tone = "default" | "warm" | "dark";

const TONE: Record<Tone, string> = {
  default: "",
  warm: "bg-[var(--color-paper-warm)] border-y border-[var(--color-parchment)]",
  dark: "bg-[var(--color-canopy)] text-white",
};

export function Panel({
  id,
  n,
  act,
  claim,
  sub,
  number,
  numberLabel,
  next,
  tone = "default",
  children,
}: {
  id: string;
  n: number;
  act: string;
  claim: string;
  sub?: React.ReactNode;
  number?: string;
  numberLabel?: string;
  next?: { href: string; question: string };
  tone?: Tone;
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={`scroll-mt-24 py-14 sm:py-20 ${TONE[tone]}`}>
      <div className={DIVE_CONTAINER}>
        <div className="max-w-4xl">
          <p
            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${
              dark ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"
            }`}
          >
            {n} / 12 · {act}
          </p>
          <h2
            className={`mt-3 font-editorial text-[30px] leading-[1.1] [text-wrap:balance] sm:text-[38px] xl:text-[44px] ${
              dark ? "text-white" : "text-[var(--color-ink)]"
            }`}
          >
            {claim}
          </h2>
          {sub ? (
            <p
              className={`mt-4 max-w-3xl text-[16px] leading-relaxed sm:text-[17px] ${
                dark ? "text-white/75" : "text-[var(--color-ink-light)]"
              }`}
            >
              {sub}
            </p>
          ) : null}
        </div>

        <div className="mt-8 sm:mt-10">{children}</div>

        {number || next ? (
          <div
            className={`mt-10 flex flex-col gap-6 border-t-2 pt-6 sm:flex-row sm:items-end sm:justify-between ${
              dark ? "border-white/20" : "border-[var(--color-canopy)]/25"
            }`}
          >
            {number ? (
              <div className="flex items-baseline gap-3">
                <span
                  className={`whitespace-nowrap font-mono text-[30px] font-bold tabular-nums leading-none sm:text-[40px] ${
                    dark ? "text-[var(--color-ember-bright)]" : "text-[var(--color-clay)]"
                  }`}
                >
                  {number}
                </span>
                <span
                  className={`max-w-[26ch] text-[13.5px] leading-snug ${
                    dark ? "text-white/70" : "text-[var(--color-ink-light)]"
                  }`}
                >
                  {numberLabel}
                </span>
              </div>
            ) : (
              <span />
            )}
            {next ? (
              <a
                href={next.href}
                className={`group flex items-center gap-3 sm:max-w-[46ch] sm:text-right ${
                  dark ? "text-white" : "text-[var(--color-ink)]"
                }`}
              >
                <span className="font-editorial text-[17px] leading-snug group-hover:text-[var(--color-canopy)] sm:text-[19px]">
                  {next.question}
                </span>
                <span
                  aria-hidden
                  className={`shrink-0 font-mono text-[26px] transition-transform group-hover:translate-x-1 ${
                    dark ? "text-[var(--color-ember-bright)]" : "text-[var(--color-canopy)]"
                  }`}
                >
                  →
                </span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Closed-by-default detail. The research is here; the story is above it. */
export function Depth({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <details
      className={`group mt-6 rounded-sm border ${
        dark ? "border-white/15 bg-white/[0.04]" : "border-[var(--color-parchment)] bg-white"
      }`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${
          dark ? "text-white/70 hover:text-white" : "text-[var(--color-canopy)] hover:text-[var(--color-ink)]"
        }`}
      >
        <span>{title}</span>
        <span aria-hidden className="transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div
        className={`space-y-3 border-t px-5 py-4 text-[14.5px] leading-relaxed ${
          dark
            ? "border-white/15 text-white/80"
            : "border-[var(--color-parchment)] text-[var(--color-ink-light)]"
        }`}
      >
        {children}
      </div>
    </details>
  );
}

/** The state formula as a schematic. The shape is the lesson; no dollars. */
export function FormulaStrip() {
  const box =
    "flex-1 rounded-sm border border-[var(--color-parchment)] bg-white px-4 py-3 text-center";
  const op = "flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-[var(--color-parchment)] bg-white font-mono text-[20px] font-bold leading-none text-[var(--color-ink)]";
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        How Oregon decides what PPS gets, since 1991
      </p>
      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className={box}>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">Formula total</p>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink-light)]">students × state weights</p>
        </div>
        <span className={op}>−</span>
        <div className={`${box} border-[var(--color-clay)]/50`}>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">Local property taxes</p>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink-light)]">what Portland collects</p>
        </div>
        <span className={op}>=</span>
        <div className={`${box} border-[var(--color-canopy)]/50`}>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">The state check</p>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink-light)]">what Salem sends</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="rounded-sm border border-[var(--color-parchment)] bg-white p-4 text-[14.5px] leading-snug text-[var(--color-ink)]">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">
            Tax base grows $1 →{" "}
          </span>
          state check shrinks $1 → schools get <span className="font-mono font-bold">$0</span>.
        </p>
        <p className="rounded-sm border border-[var(--color-parchment)] bg-white p-4 text-[14.5px] leading-snug text-[var(--color-ink)]">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-fern)]">
            What does add money →{" "}
          </span>
          the teachers levy, bonds, the Student Success Act, federal grants.
        </p>
      </div>
    </div>
  );
}
