"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, HeartHandshake, Repeat2 } from "lucide-react";

type Frequency = "monthly" | "once";

const MONTHLY_AMOUNTS = [10, 25, 50, 100, 250, 500];
const ONE_TIME_AMOUNTS = [25, 50, 100, 250, 500, 1000];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DonationForm() {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("25");
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const suggestedAmounts = frequency === "monthly" ? MONTHLY_AMOUNTS : ONE_TIME_AMOUNTS;
  const normalizedAmount = useMemo(() => {
    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? parsed : amount;
  }, [amount, customAmount]);

  function updateFrequency(next: Frequency) {
    setFrequency(next);
    const nextAmount = next === "monthly" ? 25 : 100;
    setAmount(nextAmount);
    setCustomAmount(String(nextAmount));
    setError("");
  }

  function updateAmount(nextAmount: number) {
    setAmount(nextAmount);
    setCustomAmount(String(nextAmount));
    setError("");
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/donate/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { configured?: boolean } | null) => {
        if (!cancelled) setIsConfigured(Boolean(data?.configured));
      })
      .catch(() => {
        if (!cancelled) setIsConfigured(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function submit() {
    setError("");

    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1) {
      setError("Enter at least $1.");
      return;
    }

    if (normalizedAmount > 10000) {
      setError("For support over $10,000, please contact us first.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/donate/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: normalizedAmount, frequency }),
        });

        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) {
          throw new Error(data.error || "Could not start Checkout.");
        }

        window.location.assign(data.url);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not start Checkout. Please try again.",
        );
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[440px] rounded-sm border border-white/15 bg-white/[0.08] p-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-md lg:sticky lg:top-20">
      <div className="rounded-sm bg-[var(--color-paper)] p-4 text-[var(--color-ink)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]">
              Support
            </p>
            <h2 className="mt-2 font-editorial text-[26px] leading-none text-[var(--color-ink)] sm:text-[30px]">
              Back the lab
            </h2>
          </div>
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-canopy)] text-white">
            <HeartHandshake className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-full bg-[var(--color-paper-warm)] p-1">
          <button
            type="button"
            onClick={() => updateFrequency("monthly")}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[14px] font-semibold transition sm:px-4 ${
              frequency === "monthly"
                ? "bg-[var(--color-canopy)] text-white shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Repeat2 className="h-4 w-4" />
            Monthly
          </button>
          <button
            type="button"
            onClick={() => updateFrequency("once")}
            className={`rounded-full px-3 py-2.5 text-[14px] font-semibold transition sm:px-4 ${
              frequency === "once"
                ? "bg-[var(--color-canopy)] text-white shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            One-time
          </button>
        </div>

        <p className="mt-3 rounded-sm border border-[var(--color-parchment)] bg-white px-4 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          {frequency === "monthly"
            ? "Predictable runway: keeps the dashboards current and funds the next tool."
            : "A one-time push for data updates, records requests, and new tools."}
        </p>

        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(82px,1fr))] gap-2">
          {suggestedAmounts.map((suggested) => (
            <button
              key={suggested}
              type="button"
              onClick={() => updateAmount(suggested)}
              className={`min-w-0 rounded-sm border px-3 py-2.5 text-[15px] font-semibold transition ${
                amount === suggested && normalizedAmount === suggested
                  ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white"
                  : "border-[var(--color-parchment)] bg-white text-[var(--color-ink)] hover:border-[var(--color-sage)]"
              }`}
            >
              {formatCurrency(suggested)}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Or give any amount
          </span>
          <div className="mt-2 flex items-center rounded-sm border border-[var(--color-parchment)] bg-white px-4 py-2.5 focus-within:border-[var(--color-canopy)]">
            <span className="text-[18px] font-semibold text-[var(--color-ink-muted)]">$</span>
            <input
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setAmount(Number(event.target.value));
                setError("");
              }}
              inputMode="decimal"
              min="1"
              max="10000"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[24px] font-semibold text-[var(--color-ink)] outline-none"
              aria-label="Support amount in dollars"
            />
            <span className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              USD
            </span>
          </div>
        </label>

        {error && (
          <p className="mt-3 rounded-sm border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
            {error}
          </p>
        )}

        {isConfigured === false && (
          <p className="mt-3 rounded-sm border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] leading-relaxed text-amber-800">
            Online support is built but not yet enabled. Stripe needs one final
            server-side key before Checkout can accept live payments.
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={isPending || isConfigured !== true}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 py-3.5 text-[15px] font-semibold text-[var(--color-canopy)] transition hover:bg-[var(--color-ember-bright)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConfigured === null
            ? "Checking secure Checkout..."
            : isConfigured === false
              ? "Stripe Checkout not enabled yet"
              : isPending
            ? "Opening secure Checkout..."
            : `Support with ${formatCurrency(normalizedAmount || amount)}${
                frequency === "monthly" ? " monthly" : ""
              }`}
          <ArrowUpRight className="h-4 w-4" />
        </button>

        <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-canopy)]" />
          Secure checkout by Stripe. Cancel anytime. Not tax-deductible.
        </p>
      </div>
    </div>
  );
}
