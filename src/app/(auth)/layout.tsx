import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      {/* Minimal header */}
      <header className="bg-[var(--color-canopy)] text-white">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center h-14">
            <Link href="/" className="flex items-center gap-3 group">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <path
                  d="M14 2L6 8v12l8 6 8-6V8l-8-6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--color-sage)]"
                />
                <path
                  d="M14 6l-4 3v8l4 3 4-3v-8l-4-3z"
                  fill="currentColor"
                  className="text-[var(--color-ember)]"
                  opacity="0.8"
                />
                <circle cx="14" cy="14" r="2" fill="white" opacity="0.9" />
              </svg>
              <span className="text-[15px] font-semibold tracking-tight">
                Portland Commons
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        {children}
      </main>
    </div>
  );
}
