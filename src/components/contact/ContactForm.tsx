"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

const TOPICS = [
  "General note",
  "Property screening",
  "Institutional work",
  "Founding support",
  "Backing the company",
  "Advising the Lab",
  "Partnership",
  "Data correction",
  "Volunteering",
  "Permitting tools",
  "Dashboard or analysis request",
];

export default function ContactForm({ defaultTopic }: { defaultTopic?: string } = {}) {
  const initialTopic = TOPICS.includes(defaultTopic ?? "") ? defaultTopic : TOPICS[0];
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");
    setSuccessMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        organization: formData.get("organization"),
        topic: formData.get("topic"),
        message: formData.get("message"),
        website: formData.get("website"),
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string; delivery?: string }
      | null;

    if (!response.ok || !result?.ok) {
      setState("error");
      setError(result?.error || "Unable to send this message right now.");
      return;
    }

    form.reset();
    setSuccessMessage(
      result.delivery === "local-file"
        ? "Message received locally. The server saved the submission for review."
        : "Thanks — your message is on its way. We'll reply if you've asked something we need to follow up on."
    );
    setState("success");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[var(--color-parchment)] rounded-sm p-5 sm:p-7 shadow-[0_24px_80px_rgba(20,25,18,0.08)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
            Name
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            className="mt-2 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-light)]/55 focus:border-[var(--color-sage)]"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
            Reply email
          </span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-light)]/55 focus:border-[var(--color-sage)]"
            placeholder="Where should we reply?"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
            Organization
          </span>
          <input
            name="organization"
            autoComplete="organization"
            className="mt-2 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-light)]/55 focus:border-[var(--color-sage)]"
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
            Topic
          </span>
          <select
            name="topic"
            defaultValue={initialTopic}
            className="mt-2 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-sage)]"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-light)]">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={7}
          className="mt-2 w-full rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-light)]/55 focus:border-[var(--color-sage)]"
          placeholder="What should Portland Civic Lab know?"
        />
      </label>

      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-[var(--color-ink-light)]">
          We&apos;ll only use your email to reply to this message.
        </p>

        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "submitting" ? "Sending..." : "Send message"}
          <Send className="h-4 w-4" />
        </button>
      </div>

      {state === "success" && (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-[var(--color-sage)]/40 bg-[var(--color-sage)]/10 px-4 py-3 text-[14px] text-[var(--color-canopy)]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
