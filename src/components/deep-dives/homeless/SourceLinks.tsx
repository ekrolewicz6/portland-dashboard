import { SRC } from "@/lib/homeless/continuum";

/** Inline source links for a figure: the documents it came from, by short title. */
export default function SourceLinks({ ids, dark = false }: { ids: string[]; dark?: boolean }) {
  if (!ids.length) return null;
  return (
    <p className={`mt-1.5 font-mono text-[10px] leading-snug ${dark ? "text-white/45" : "text-[var(--color-ink-muted)]"}`}>
      <span className="uppercase tracking-[0.1em]">Source{ids.length > 1 ? "s" : ""} · </span>
      {ids.map((id, i) => {
        const s = SRC[id];
        if (!s) return null;
        return (
          <span key={id}>
            {i > 0 ? "; " : ""}
            <a href={s.u} target="_blank" rel="noopener noreferrer" className={`underline decoration-dotted underline-offset-2 ${dark ? "hover:text-white" : "hover:text-[var(--color-canopy)]"}`}>{s.t}</a>
          </span>
        );
      })}
    </p>
  );
}
