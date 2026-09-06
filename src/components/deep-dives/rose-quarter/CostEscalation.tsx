import { COST_HISTORY, HEADLINE, SOURCES } from "@/lib/rose-quarter/data";

const fmt = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${Math.round(n / 1e6)}M`;

/**
 * Cost over time, on a shared scale.
 *
 * The draft 2026 figure is drawn differently and labelled differently from
 * every other point, because it is not the same kind of number: ODOT's own
 * published estimate is still $1.96–2.08B, while internal draft records
 * reported in August 2026 put it far higher. Blending those into one smooth
 * line would imply an official figure that does not exist.
 */
export default function CostEscalation() {
  const max = Math.max(...COST_HISTORY.map((c) => c.value));
  const first = COST_HISTORY.find((c) => c.date === "2017")!;
  const official = HEADLINE.costCurrentAbout;
  const multipleOfficial = official / first.value;
  const multipleDraft = HEADLINE.costCurrentHigh / first.value;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat k={fmt(first.value)} t="promised in 2017" d="The figure legislators voted for when they raised transportation taxes." />
        <Stat k={fmt(official)} t="the estimate as of August 2026" d={`About ${multipleOfficial.toFixed(1)}× the 2017 number, for 1.8 miles.`} />
        <Stat
          k={fmt(HEADLINE.committedToDate)}
          t="actually spent or committed"
          d="Phases 1A and 1B. Everything after that, the widening and the covers, is roughly $3B, and essentially unfunded."
        />
      </div>

      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <div className="space-y-4">
          {COST_HISTORY.map((c) => (
            <div key={c.date}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-[13.5px] text-[var(--color-ink)]">
                  <span className="font-mono text-[12px] text-[var(--color-ink-muted)]">{c.date}</span>{" "}
                  {c.label}
                  {c.draft && (
                    <span className="ml-2 rounded-sm bg-[#f6e7df] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--color-clay)]">
                      draft, not official
                    </span>
                  )}
                </span>
                <span className="font-mono text-[14px] font-bold tabular-nums text-[var(--color-ink)]">
                  {fmt(c.value)}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${(c.value / max) * 100}%`,
                    backgroundColor: c.draft ? "transparent" : "#b85c3a",
                    backgroundImage: c.draft
                      ? "repeating-linear-gradient(45deg, #b85c3a55 0 6px, transparent 6px 12px)"
                      : undefined,
                    border: c.draft ? "1px solid #b85c3a" : undefined,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 border-t border-[var(--color-parchment)] pt-4 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          Not all of that growth is waste. The 2017 figure bought a lane project; the current one
          includes a buildable cover that did not exist in the original scope, and Oregon has since
          lost roughly $388 million of federal money that was meant to pay for exactly that piece.
          But the gap is now larger than the entire original project: about {fmt(HEADLINE.committedToDate)}{" "}
          has been spent or committed, and the remainder is unfunded. The chair of the Oregon
          Transportation Commission put the underlying problem plainly in 2025:{" "}
          <a
            href={SOURCES.credibility.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2"
          >
            &ldquo;We have a credibility problem right now.&rdquo;
          </a>
        </p>
      </div>
    </div>
  );
}

function Stat({
  k,
  t,
  d,
  tone,
}: {
  k: string;
  t: string;
  d: string;
  tone?: "draft";
}) {
  return (
    <div
      className={`rounded-sm p-5 ${
        tone === "draft"
          ? "border-2 border-dashed border-[var(--color-clay)]/50 bg-white"
          : "border border-[var(--color-parchment)] bg-white"
      }`}
    >
      <p className="font-mono text-[26px] font-bold leading-none tabular-nums text-[var(--color-clay)]">
        {k}
      </p>
      <p className="mt-2 text-[14px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">{d}</p>
    </div>
  );
}
