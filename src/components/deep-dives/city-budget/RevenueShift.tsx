import { dataset } from "@/lib/city-budget/data.server";
import { fmtExact, fmtMoney, CLASS_LABEL } from "@/lib/city-budget/types";

/**
 * Why the budget shrank — answered from the City's own resources table rather
 * than from commentary.
 *
 * The headline "budget is down 5.5%" invites the wrong inference, that
 * Portland's tax base collapsed. It didn't. Taxes, fees and permits all rose.
 * What fell was intergovernmental aid, the end of federal pandemic money, * and the size of the reserve the City was drawing on. Separating those two
 * things is the whole point of this section.
 */

const EXPLAIN: Record<string, string> = {
  "Beginning Fund Balance":
    "Money left over from prior years. A smaller carry-over means less cushion to spend, and it shrinks the headline total without anything being cut.",
  "Fund Transfers - Revenue":
    "Money moving between city funds. Internal — it inflates both sides of the total and nets to nothing.",
  Intergovernmental:
    "Federal and state money. This is the real external loss: the pandemic-era aid that paid for ongoing programs has run out.",
  "Bond & Note Proceeds": "Borrowing for capital projects. Rises and falls with the construction schedule, not with the tax base.",
  "Charges for Services":
    "Water, sewer and stormwater bills, and other fees for service. Rate increases, not a windfall.",
  "Interagency Revenue": "One bureau billing another. Internal — counted on both sides.",
  Taxes: "Property tax, business licence tax, lodging tax. Still growing, just not fast enough.",
  "Licenses & Permits": "Permits, franchise fees and licences.",
  Miscellaneous: "Interest earnings and everything else.",
};

const INTERNAL = new Set([
  "Beginning Fund Balance",
  "Fund Transfers - Revenue",
  "Interagency Revenue",
  "Miscellaneous Fund Allocation",
]);

export default function RevenueShift() {
  const res = dataset.citywide.resources;
  if (!res) return null;

  const rows = res.rows
    .filter((r) => r.depth > 0 && !r.isTotal && r.label.length > 2)
    .map((r) => ({
      label: r.label,
      prior: r.prior ?? 0,
      current: r.current ?? 0,
      delta: (r.current ?? 0) - (r.prior ?? 0),
      internal: INTERNAL.has(r.label),
    }))
    .filter((r) => r.prior !== 0 || r.current !== 0);

  const external = rows.filter((r) => !r.internal).sort((a, b) => b.delta - a.delta);
  const internal = rows.filter((r) => r.internal).sort((a, b) => a.delta - b.delta);

  const extUp = external.filter((r) => r.delta > 0).reduce((s, r) => s + r.delta, 0);
  const extDown = external.filter((r) => r.delta < 0).reduce((s, r) => s + r.delta, 0);
  const max = Math.max(...rows.map((r) => Math.abs(r.delta)));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          k={`+${fmtMoney(extUp)}`}
          t="Money Portland raises itself went up"
          d="Taxes, utility charges and permits all grew. The local tax base did not collapse."
          tone="up"
        />
        <Card
          k={fmtMoney(extDown)}
          t="Outside aid fell away"
          d="Almost entirely intergovernmental — the end of federal pandemic money that had been paying for ongoing programs."
          tone="down"
        />
        <Card
          k={fmtMoney(
            internal.find((r) => r.label === "Beginning Fund Balance")?.delta ?? 0,
          )}
          t="Smaller cushion to spend"
          d="A thinner carry-over from last year. This shrinks the headline number without a single service being cut."
          tone="down"
        />
      </div>

      <Group
        title="Money from outside the City"
        note="This is the part that answers whether Portland is getting poorer."
        rows={external}
        max={max}
      />
      <Group
        title="Money already inside the City"
        note="Carry-over and transfers between funds. These move the headline total but are not new or lost revenue."
        rows={internal}
        max={max}
        muted
      />

      <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
        So the shrinkage is not a collapsing tax base. Portland&apos;s own revenue rose about{" "}
        {fmtMoney(extUp)}. What ended was{" "}
        <strong className="text-[var(--color-ink)]">
          {fmtMoney(Math.abs(extDown))} of outside money
        </strong>{" "}
        — federal aid down {(((external.find((r) => r.label === "Intergovernmental")?.delta ?? 0) / (external.find((r) => r.label === "Intergovernmental")?.prior ?? 1)) * 100).toFixed(0)}% —
        arriving at the same moment the City stopped covering the difference out of reserves.
        Council closed a $171.6&nbsp;million gap, and about 100 people lost their jobs.
      </p>
    </div>
  );
}

function Card({
  k,
  t,
  d,
  tone,
}: {
  k: string;
  t: string;
  d: string;
  tone: "up" | "down";
}) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
      <p
        className={`font-mono text-[26px] font-bold leading-none tabular-nums ${
          tone === "up" ? "text-[var(--color-fern)]" : "text-[var(--color-clay)]"
        }`}
      >
        {k}
      </p>
      <p className="mt-2 text-[14px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">{d}</p>
    </div>
  );
}

function Group({
  title,
  note,
  rows,
  max,
  muted,
}: {
  title: string;
  note: string;
  rows: { label: string; prior: number; current: number; delta: number }[];
  max: number;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border p-5 sm:p-6 ${
        muted
          ? "border-dashed border-[var(--color-parchment)] bg-[var(--color-paper-warm)]"
          : "border-[var(--color-parchment)] bg-white"
      }`}
    >
      <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{note}</p>

      <div className="mt-4 space-y-4">
        {rows.map((r) => {
          const pct = r.prior ? (r.delta / r.prior) * 100 : 0;
          const up = r.delta >= 0;
          return (
            <div key={r.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-[13.5px] font-medium text-[var(--color-ink)]">
                  {CLASS_LABEL[r.label] ?? r.label}
                </span>
                <span
                  className={`font-mono text-[13px] font-semibold tabular-nums ${
                    up ? "text-[var(--color-fern)]" : "text-[var(--color-clay)]"
                  }`}
                >
                  {up ? "+" : "−"}
                  {fmtExact(Math.abs(r.delta))}
                  <span className="ml-1.5 text-[11px] font-normal text-[var(--color-ink-muted)]">
                    {up ? "+" : ""}
                    {pct.toFixed(1)}%
                  </span>
                </span>
              </div>

              {/* Diverging bar from a centre line: left is a fall, right a rise. */}
              <div className="relative mt-1.5 h-2 w-full rounded-sm bg-[var(--color-paper-warm)]">
                <span className="absolute left-1/2 top-0 h-full w-px bg-[var(--color-parchment)]" />
                <span
                  className="absolute top-0 h-full rounded-sm"
                  style={{
                    width: `${(Math.abs(r.delta) / max) * 50}%`,
                    left: up ? "50%" : undefined,
                    right: up ? undefined : "50%",
                    backgroundColor: up ? "#3d7a5a" : "#b85c3a",
                  }}
                />
              </div>

              <p className="mt-1 font-mono text-[10.5px] text-[var(--color-ink-muted)]">
                {fmtExact(r.prior)} → {fmtExact(r.current)}
              </p>
              {EXPLAIN[r.label] && (
                <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-ink-light)]">
                  {EXPLAIN[r.label]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
