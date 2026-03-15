export default function Footer() {
  return (
    <footer className="bg-[var(--color-forest-dark)] text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">
              Portland Commons Civic Dashboard
            </h3>
            <p className="text-sm leading-relaxed">
              Open data for Portland&apos;s recovery. Every metric is sourced
              from public records, government APIs, and verified datasets.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Data Sources</h4>
            <ul className="text-sm space-y-1.5">
              <li>Portland Police Bureau</li>
              <li>Portland Permitting &amp; Development</li>
              <li>CivicApps Portland</li>
              <li>US Census Bureau</li>
              <li>HUD / USPS Vacancy Data</li>
              <li>Bureau of Labor Statistics</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">About</h4>
            <p className="text-sm leading-relaxed">
              Built by Portland Commons. All aggregate data is freely available
              for download and embedding. See our{" "}
              <a href="/methodology" className="text-white underline">
                methodology
              </a>{" "}
              for details on how each metric is calculated.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-sm text-center">
          &copy; {new Date().getFullYear()} Portland Commons. Data is provided
          as-is from public sources.
        </div>
      </div>
    </footer>
  );
}
