"use client";

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { Flag, X, CheckCircle2 } from "lucide-react";

interface FlagDataButtonProps {
  question: string;
}

type FlagState = "idle" | "submitting" | "success" | "error";

/** Elements that can hold focus inside the dialog, in DOM order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function FlagDataButton({ question }: FlagDataButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FlagState>("idle");
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Move focus into the dialog on open and hand it back to the trigger on close,
  // so keyboard users never land behind the overlay.
  useEffect(() => {
    if (!open) return;

    const panel = dialogRef.current;
    const trigger = triggerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Land on the first real field rather than the close button, so the
    // dialog opens ready to type in.
    const fields = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>("input, textarea, select")
        ).filter((el) => el.offsetParent !== null)
      : [];
    const first = fields[0] ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === firstEl || !panel.contains(active))) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && (active === lastEl || !panel.contains(active))) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      (trigger ?? previouslyFocused)?.focus();
    };
  }, [open, close]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/data-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        metric: formData.get("metric"),
        message: formData.get("message"),
        email: formData.get("email"),
        website: formData.get("website"),
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (!response.ok || !result?.ok) {
      setState("error");
      setError(result?.error || "Couldn't send your report right now.");
      return;
    }
    setState("success");
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen(true);
          setState("idle");
          setError("");
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)] rounded-sm transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        Flag an issue
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-md rounded-sm border border-[var(--color-parchment)] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id={headingId}
                className="font-editorial text-[22px] leading-tight text-[var(--color-ink)]"
              >
                Something look wrong?
              </h2>
              <button
                onClick={close}
                aria-label="Close"
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {state === "success" ? (
              <div className="mt-4 flex items-start gap-2 rounded-sm border border-[var(--color-sage)]/40 bg-[var(--color-sage)]/10 px-4 py-3 text-[14px] text-[var(--color-canopy)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Thanks — we review every report and fix what&apos;s wrong.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <p className="text-[13px] leading-relaxed text-[var(--color-ink-light)]">
                  Tell us which number looks off and why — a link to an
                  official source helps us fix it fast.
                </p>

                <label className="block">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
                    Which number? (optional)
                  </span>
                  <input
                    name="metric"
                    maxLength={200}
                    className="mt-1.5 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-3 py-2 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                    placeholder="e.g. Median rent, April 2026"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
                    What&apos;s wrong?
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    minLength={10}
                    maxLength={2000}
                    className="mt-1.5 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-3 py-2 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                    placeholder="The value doesn't match ... because ..."
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
                    Email for follow-up (optional)
                  </span>
                  <input
                    name="email"
                    type="email"
                    maxLength={200}
                    className="mt-1.5 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-3 py-2 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                    placeholder="Only used to follow up on this report"
                  />
                </label>

                <label className="hidden" aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                {state === "error" && (
                  <p className="text-[13px] text-red-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="w-full rounded-sm bg-[var(--color-canopy)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)] disabled:opacity-60"
                >
                  {state === "submitting" ? "Sending..." : "Send report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
