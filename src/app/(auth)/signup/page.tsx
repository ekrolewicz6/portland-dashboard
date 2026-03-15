"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Wire to real registration API
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-[var(--color-canopy)] rounded-full flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 10 8 14 16 6" />
          </svg>
        </div>
        <h1 className="font-editorial-normal text-[28px] text-[var(--color-ink)]">
          Application received
        </h1>
        <p className="text-[14px] text-[var(--color-ink-muted)] mt-2 mb-6">
          We&apos;ll review your information and get back to you shortly.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-[var(--color-canopy)] text-white text-[14px] font-medium rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-editorial-normal text-[32px] text-[var(--color-ink)]">
          Create an account
        </h1>
        <p className="text-[14px] text-[var(--color-ink-muted)] mt-2">
          Join the Portland Commons community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-[13px] font-medium text-[var(--color-ink-light)] mb-1.5"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)] transition-colors"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-[var(--color-ink-light)] mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-[var(--color-ink-light)] mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)] transition-colors"
            placeholder="At least 8 characters"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[var(--color-canopy)] text-white text-[14px] font-medium rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
        >
          Create account
        </button>
      </form>

      <p className="text-center text-[13px] text-[var(--color-ink-muted)] mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-canopy)] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
