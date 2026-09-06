import { Eye, EyeOff } from "lucide-react";
import { BED_LAYERS } from "@/lib/homeless/data";

/**
 * Five things you need to know about a bed before you can send someone to
 * it tonight. Two are reported. Three are not. That's the figure.
 */
export default function BedReality() {
  const dark = BED_LAYERS.filter((l) => !l.tracked).length;
  return (
    <div className="grid gap-0 overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white md:grid-cols-[220px_1fr]">
      <div className="flex flex-col justify-between border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 md:border-b-0 md:border-r sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Bed visibility</p>
        <div className="mt-4">
          <p className="font-mono text-[44px] font-bold leading-none tabular-nums text-[var(--color-clay)]">
            {dark}<span className="text-[22px] text-[var(--color-ink-muted)]"> of {BED_LAYERS.length}</span>
          </p>
          <p className="mt-2 text-[13px] leading-snug text-[var(--color-ink-light)]">
            things a field worker must know about a bed that no public system reports.
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <ol className="space-y-1.5">
          {BED_LAYERS.map((layer, i) => (
            <li
              key={layer.key}
              className={`flex items-center gap-3 rounded-sm border px-3.5 py-2.5 ${
                layer.tracked ? "border-[var(--color-parchment)] bg-white" : "border-dashed border-[var(--color-clay)]/40 bg-[var(--color-clay-tint)]"
              }`}
              style={{ marginLeft: `${i * 6}%` }}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${layer.tracked ? "bg-[var(--color-fern)]/15 text-[var(--color-fern)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"}`}>
                {layer.tracked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[14px] font-semibold text-[var(--color-ink)]">{layer.label}</span>
                <span className="text-[12.5px] text-[var(--color-ink-muted)]"> · {layer.desc}</span>
              </div>
              <span className={`shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wide ${layer.tracked ? "text-[var(--color-fern)]" : "text-[var(--color-clay)]"}`}>
                {layer.tracked ? "reported" : "unreported"}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
          So the worker phones down a stale list while a suitable bed sits empty. The cheapest new bed in Oregon is the empty one nobody can see.
        </p>
      </div>
    </div>
  );
}
