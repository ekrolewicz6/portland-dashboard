import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
      <div className="text-center">
        <h1 className="font-editorial-normal text-[64px] text-[var(--color-canopy)]">
          404
        </h1>
        <p className="text-[16px] text-[var(--color-ink-muted)] mt-2 mb-8">
          This page could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-medium rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
