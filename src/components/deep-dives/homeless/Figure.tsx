import React from "react";

/**
 * Light wrapper for a visual: an optional mono eyebrow, the figure, an
 * optional one-line caption. Keeps the chrome consistent across the page
 * without boxing every paragraph.
 */
export function Figure({
  eyebrow,
  right,
  caption,
  children,
  className = "",
  padded = true,
}: {
  eyebrow?: React.ReactNode;
  right?: React.ReactNode;
  caption?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <figure className={`rounded-sm border border-[var(--color-parchment)] bg-white ${className}`}>
      {eyebrow || right ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 sm:px-6">
          {eyebrow ? (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
              {eyebrow}
            </p>
          ) : <span />}
          {right ? (
            <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">{right}</p>
          ) : null}
        </div>
      ) : null}
      <div className={padded ? "p-5 sm:p-6" : ""}>{children}</div>
      {caption ? (
        <figcaption className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Renders `*emphasis*` markers in data strings as <em>, nothing else. */
export function Em({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <em key={i}>{p}</em> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </>
  );
}
