"use client";

import { useState } from "react";
import { Shield, Flame, Users } from "lucide-react";
import { BENEFICIARIES as B } from "@/lib/fpdr/data";
import { fmtMoney } from "@/lib/fpdr/engine";

type Group = "all" | "police" | "fire";

export default function WhoBenefits() {
  const [group, setGroup] = useState<Group>("all");

  const retirees =
    group === "police" ? B.retireesPolice : group === "fire" ? B.retireesFire : B.retireesAndSurvivors;
  const active =
    group === "police"
      ? B.activeFpdrTwoPolice
      : group === "fire"
        ? B.activeFpdrTwoFire
        : B.activeFpdrTwo;
  const avgPension =
    group === "police"
      ? B.avgAnnualPensionPolice
      : group === "fire"
        ? B.avgAnnualPensionFire
        : B.avgAnnualPension;

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="inline-flex rounded-sm border border-[var(--color-parchment)] overflow-hidden bg-white">
        {(
          [
            { id: "all", label: "Everyone", icon: Users },
            { id: "police", label: "Police", icon: Shield },
            { id: "fire", label: "Fire", icon: Flame },
          ] as const
        ).map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${
              group === g.id
                ? "bg-[var(--color-canopy)] text-white"
                : "text-[var(--color-ink-light)] hover:bg-[var(--color-paper-warm)]"
            }`}
          >
            <g.icon className="w-3.5 h-3.5" />
            {g.label}
          </button>
        ))}
      </div>

      {/* Headline counts */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-4xl font-bold text-[var(--color-canopy)] tabular-nums leading-none">
            {retirees.toLocaleString()}
          </p>
          <p className="text-[13px] font-semibold text-[var(--color-ink)] mt-2">
            getting a pension check
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            retirees and the surviving spouses of officers and firefighters
          </p>
        </div>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-4xl font-bold text-[var(--color-canopy)] tabular-nums leading-none">
            {fmtMoney(avgPension)}
          </p>
          <p className="text-[13px] font-semibold text-[var(--color-ink)] mt-2">
            average pension, per year
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            with a {(B.colaPct * 100).toFixed(0)}% cost-of-living bump most years
          </p>
        </div>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5">
          <p className="font-mono text-4xl font-bold text-[var(--color-canopy)] tabular-nums leading-none">
            {active.toLocaleString()}
          </p>
          <p className="text-[13px] font-semibold text-[var(--color-ink)] mt-2">
            still on the job, pre-2007
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            the last members still earning the old pay-go pension
          </p>
        </div>
      </div>

      {/* Human-interest callouts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Callout
          title="They retire young, after long careers"
          body={`A typical member retires around age ${B.avgRetireAge} with about ${B.avgYearsService} years of service. Public-safety work is hard on the body, and many start drawing a pension decades before most people retire.`}
        />
        <Callout
          title="Some beneficiaries are in their 90s"
          body={`Checks still go to surviving spouses who are ${B.oldestBeneficiaryBand} — widows and widowers of officers and firefighters who died long ago. A survivor's benefit is paid for that person's entire life.`}
        />
        <Callout
          title={`${B.alternatePayees} ex-spouses get a slice, too`}
          body="Through divorce court orders, former spouses receive a court-assigned share of a member's pension — a reminder that these obligations stretch across whole families and lifetimes."
        />
        <Callout
          title="The 'extra paycheck' retirement spike"
          body={`Because pensions are based on final pay, members cluster their retirements into months with an extra pay period to boost the calculation. In ${"FYE2021"} that helped drive a record ${B.recordRetirements} retirements in a single year.`}
        />
      </div>

      <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
        These are real benefits earned by people who ran toward danger for a
        living — the question is not whether they should be
        paid, but <span className="italic">how Portland chooses to pay for them.</span>{" "}
        Counts and averages are from the city actuary&apos;s June 30, 2024 valuation.
      </p>
    </div>
  );
}

function Callout({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5">
      <h4 className="text-[14px] font-semibold text-[var(--color-canopy)] mb-1.5">{title}</h4>
      <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">{body}</p>
    </div>
  );
}
