"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-editorial-normal text-[32px] text-[var(--color-ink)]">
          Sign in
        </h1>
        <p className="text-[14px] text-[var(--color-ink-muted)] mt-2">
          Welcome back to Portland Commons
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded">
            {error}
          </div>
        )}

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
            className="w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)] transition-colors"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--color-canopy)] text-white text-[14px] font-medium rounded hover:bg-[var(--color-canopy-mid)] transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-[13px] text-[var(--color-ink-muted)] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[var(--color-canopy)] font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm text-center text-[var(--color-ink-muted)] text-[14px]">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
