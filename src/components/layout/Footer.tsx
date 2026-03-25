export default function Footer() {
  return (
    <footer className="bg-[var(--color-canopy)] text-white/60 mt-20">
      {/* Divider accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-ember)]/40 to-transparent" />

      <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3 className="font-editorial-normal text-xl text-white mb-3">
              Portland Civic Lab
            </h3>
            <p className="text-[13px] leading-relaxed max-w-sm">
              Open data for Portland&apos;s recovery. Every metric is sourced
              from public records, government APIs, and verified datasets.
              Built to answer the questions Portland is asking.
            </p>
          </div>

          {/* Data Sources */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-4">
              Data Sources
            </h4>
            <ul className="text-[13px] space-y-2">
              <li className="hover:text-white/80 transition-colors">Portland Police Bureau</li>
              <li className="hover:text-white/80 transition-colors">PP&amp;D Permit Data</li>
              <li className="hover:text-white/80 transition-colors">CivicApps Portland</li>
              <li className="hover:text-white/80 transition-colors">US Census Bureau</li>
              <li className="hover:text-white/80 transition-colors">HUD / USPS Vacancy</li>
              <li className="hover:text-white/80 transition-colors">Bureau of Labor Statistics</li>
            </ul>
          </div>

          {/* About */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-4">
              About This Dashboard
            </h4>
            <p className="text-[13px] leading-relaxed mb-4">
              All aggregate data is freely available for download and embedding.
              See our{" "}
              <a
                href="/methodology"
                className="text-[var(--color-lichen)] hover:text-white underline underline-offset-2 decoration-white/20 hover:decoration-white/40 transition-all"
              >
                methodology
              </a>{" "}
              for details on how each metric is calculated.
            </p>
            <p className="text-[13px] leading-relaxed">
              <span className="text-[var(--color-ember)] font-medium">
                Portland Pulse
              </span>{" "}
              — weekly data stories in your inbox.{" "}
              <span className="text-white/40 italic">Coming soon.</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/40">
            &copy; {new Date().getFullYear()} Portland Civic Lab. Data provided
            as-is from public sources.
          </p>
          <p className="text-[11px] text-white/25 font-mono">
            Auto-updated &middot; Zero human intervention
          </p>
        </div>
      </div>
    </footer>
  );
}
