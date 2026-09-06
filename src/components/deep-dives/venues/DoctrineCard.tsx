import {
  ANNUAL_QUESTION,
  ANNUAL_QUESTION_SHORT,
  DOCTRINE_POINTS,
  DOCTRINE_SENTENCE,
  GATES,
} from "@/lib/venues/data";

/**
 * §18–19. The handable block: the doctrine in one sentence, the ten
 * commitments, the five gates, and the question Portland should answer
 * in public every year.
 *
 * Designed as the page's poster artifact: a certificate-style card with
 * a double-rule frame (outer parchment rule, inner hairline), a centered
 * mono masthead, the doctrine sentence as the dominant centered element,
 * ten commitments in two columns with oversized ghost numerals, the five
 * gates as a hairline-ruled strip of mini-cells, and the annual question
 * as a full-width band capping the card. It sits on solid white so it
 * reads the same inside the dark Section it lives in, and it survives
 * printing: one card, kept whole across page breaks where the browser
 * can manage it.
 */
export default function DoctrineCard() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-1.5 print:break-inside-avoid">
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)]/70 px-5 pt-7 pb-6 sm:px-9 sm:pt-9 sm:pb-9">
        {/* ── Masthead ── */}
        <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
          <span>Portland Civic Lab</span>
          <span aria-hidden className="text-[var(--color-ember)]">
            ·
          </span>
          <span>Venue Portfolio Doctrine</span>
          <span aria-hidden className="text-[var(--color-ember)]">
            ·
          </span>
          <span className="tabular-nums">2026</span>
        </p>
        <div
          aria-hidden
          className="mx-auto mt-5 h-1.5 w-1.5 rotate-45 bg-[var(--color-ember)]"
        />

        {/* ── (a) The question everything else serves ── */}
        <p className="mt-7 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember)]">
          The one question this whole page exists to answer
        </p>
        <blockquote className="mx-auto mt-4 max-w-3xl text-center font-editorial text-[28px] leading-[1.12] text-[var(--color-ink)] [text-wrap:balance] sm:text-[36px] xl:text-[42px]">
          {ANNUAL_QUESTION_SHORT}
        </blockquote>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-[var(--color-ink-light)] [text-wrap:balance] sm:text-[16px]">
          Said fully: {ANNUAL_QUESTION}
        </p>

        <div
          aria-hidden
          className="mx-auto mt-9 h-1.5 w-1.5 rotate-45 bg-[var(--color-ember)]"
        />

        {/* ── (b) The answer, as a way of operating ── */}
        <p className="mt-7 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember)]">
          How a city gets to a good answer
        </p>
        <blockquote className="mx-auto mt-3 max-w-3xl text-center font-editorial text-[19px] leading-[1.3] text-[var(--color-ink)] [text-wrap:balance] sm:text-[22px]">
          {DOCTRINE_SENTENCE}
        </blockquote>

        {/* ── (c) Ten promises, ghost-numbered, filled down each column ── */}
        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          Spelled out as ten promises
        </p>
        <ol className="mt-5 grid gap-x-10 gap-y-4 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
          {DOCTRINE_POINTS.map((point, i) => (
            <li key={point} className="flex items-start gap-3">
              <span
                aria-hidden
                className="w-9 shrink-0 select-none text-right font-mono text-[24px] font-semibold leading-none tabular-nums text-[var(--color-ember)]/30 sm:w-12 sm:text-[30px]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pt-1 text-[14px] leading-snug text-[var(--color-ink-light)]">
                {point}
              </span>
            </li>
          ))}
        </ol>

        {/* ── (d) The five questions, as a hairline-ruled strip ── */}
        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          And five questions every project answers before it gets a dollar
        </p>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-5">
          {GATES.map((gate) => (
            <div
              key={gate.id}
              className="bg-white p-3 last:col-span-2 sm:p-3.5 sm:last:col-span-1"
            >
              <p className="font-mono text-[11px] font-semibold tabular-nums text-[var(--color-ember)]">
                {String(gate.n).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[12px] font-semibold leading-snug text-[var(--color-ink)]">
                {gate.title}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-ink-muted)]">
                {gate.question}
              </p>
            </div>
          ))}
        </div>

        {/* ── (e) The closing charge, a full-width band capping the card ── */}
        <div className="-mx-5 -mb-6 mt-10 border-t border-[var(--color-ember)]/50 bg-[var(--color-paper-warm)] px-5 py-7 sm:-mx-9 sm:-mb-9 sm:px-10 sm:py-9">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Ask it every year, in public
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center font-editorial text-[19px] leading-snug text-[var(--color-ink)] [text-wrap:balance]">
            Until the city can answer the question at the top of this card, about every dollar, no
            single venue proposal, however popular, is a complete plan.
          </p>
        </div>
      </div>
    </div>
  );
}
