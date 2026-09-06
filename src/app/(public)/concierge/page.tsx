import type { Metadata } from "next";
import ChatInterface from "@/components/concierge/ChatInterface";

export const metadata: Metadata = {
  // Not shipped yet (see TODO.md): reachable by direct URL for the people
  // building it, but kept out of search until it is ready to be found.
  robots: { index: false, follow: false },
  title: "Civic Concierge",
  description:
    "AI-powered civic data assistant for Portland, Oregon. Ask anything about city government, permits, zoning, public services, climate commitments, housing, and more.",
  openGraph: {
    title: "Civic Concierge | Portland Civic Lab",
    description: "AI-powered civic data assistant — ask anything about Portland city government.",
    url: "https://www.portlandciviclab.org/concierge",
  },
  alternates: { canonical: "https://www.portlandciviclab.org/concierge" },
};

export default function ConciergePage() {
  return (
    <div className="bg-[var(--color-paper)] min-h-[80vh] flex flex-col">
      {/* Hero strip */}
      <section className="relative overflow-hidden noise-overlay bg-[var(--color-canopy)] text-white py-10 sm:py-14">
        <div className="absolute right-0 top-0 h-[420px] w-[520px] translate-x-1/4 -translate-y-1/3 rounded-full bg-[var(--color-canopy-light)] opacity-25 blur-[150px]" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[10px] font-mono font-semibold text-[var(--color-ember)] uppercase tracking-[0.22em]">
              AI Civic Concierge
            </span>
            <div className="w-8 h-px bg-[var(--color-ember)]" />
          </div>
          <h1 className="font-editorial-normal text-[36px] sm:text-[48px] leading-[1.08] tracking-tight mb-3">
            Ask Anything About Portland
          </h1>
          <p className="text-white/60 text-[14px] max-w-lg mx-auto leading-relaxed">
            Questions about city government, permits, zoning, public services,
            and climate data, answered from the Lab&apos;s public datasets. Every
            answer links its source or says it has none, and it can still be
            wrong: check the source before you act on it.
          </p>
        </div>
      </section>

      {/* Chat area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ChatInterface />
      </div>
    </div>
  );
}
