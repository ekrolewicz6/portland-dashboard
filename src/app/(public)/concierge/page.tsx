import type { Metadata } from "next";
import ChatInterface from "@/components/concierge/ChatInterface";

export const metadata: Metadata = {
  title: "Civic Concierge | Portland Civic Lab",
  description:
    "AI-powered civic data assistant for Portland, Oregon. Ask anything about city government, permits, zoning, public services, climate commitments, housing, and more.",
};

export default function ConciergePage() {
  return (
    <div className="bg-[var(--color-paper)] min-h-[80vh] flex flex-col">
      {/* Hero strip */}
      <section className="bg-[var(--color-canopy)] text-white py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em] mb-3">
            AI Civic Concierge
          </p>
          <h1 className="font-editorial-normal text-3xl sm:text-4xl leading-[1.15] mb-3">
            Ask Anything About Portland
          </h1>
          <p className="text-white/60 text-[14px] max-w-lg mx-auto leading-relaxed">
            Questions about city government, permits, zoning, public services,
            climate data, or any Portland civic topic &mdash; answered with real
            data.
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
