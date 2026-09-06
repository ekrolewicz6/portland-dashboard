import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Open Data & API",
  description:
    "Portland Civic Lab's data is free to use: JSON endpoints and CSV downloads for every dashboard topic, no API key required.",
  path: "/open-data",
});

const TOPICS = [
  "climate",
  "housing",
  "safety",
  "homelessness",
  "fiscal",
  "economy",
  "economic-health",
  "education",
  "quality",
  "accountability",
] as const;

export default function OpenDataPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      <section className="relative overflow-hidden bg-[var(--color-canopy)] noise-overlay">
        <div className="absolute right-0 top-0 h-[420px] w-[520px] translate-x-1/4 -translate-y-1/3 rounded-full bg-[var(--color-canopy-light)] opacity-25 blur-[150px]" />
        <div className="mx-auto max-w-[1400px] 3xl:max-w-[1800px] px-5 py-14 sm:px-8 sm:py-18 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/85">
              <span>Open data</span>
              <div className="h-px w-8 bg-[var(--color-ember)]/60" />
              <span>No API key required</span>
            </div>
            <h1 className="mt-6 font-editorial-normal text-[42px] leading-[1.02] tracking-tight text-white sm:text-[56px]">
              Take the data with you
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/70 sm:text-[18px]">
              Every number on the dashboard is available as JSON or CSV — free
              for journalists, researchers, students, and anyone building on
              Portland&apos;s public data.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="space-y-10 text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          <div>
            <h2 className="font-editorial text-[28px] sm:text-[34px] leading-tight text-[var(--color-ink)] mb-3">
              JSON endpoints
            </h2>
            <p className="mb-4">
              Each dashboard topic has a JSON endpoint with the headline
              metric, trend, time series, source attribution, and insights:
            </p>
            <pre className="overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 text-[13px] text-[var(--color-ink)]">
{`GET https://www.portlandciviclab.org/api/dashboard/{topic}

{
  "headline": "...",          // plain-language summary
  "headlineValue": 1234,      // the key number
  "trend": { "direction": "up", "percentage": 5, "label": "vs last year" },
  "chartData": [ { "date": "2026-04", "value": 1234 }, ... ],
  "source": "Portland Bureau of ... ",
  "insights": [ "..." ]
}`}
            </pre>
            <p className="mt-4">Available topics:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <code
                  key={t}
                  className="rounded-sm border border-[var(--color-parchment)] bg-white px-2 py-1 text-[12px] text-[var(--color-ink)]"
                >
                  {t}
                </code>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-editorial text-[28px] sm:text-[34px] leading-tight text-[var(--color-ink)] mb-3">
              CSV downloads
            </h2>
            <p>
              The same topics are downloadable as CSV — the identical files
              behind the &ldquo;Export CSV&rdquo; button on each dashboard
              page:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 text-[13px] text-[var(--color-ink)]">
{`GET https://www.portlandciviclab.org/api/dashboard/{topic}/export`}
            </pre>
          </div>

          <div>
            <h2 className="font-editorial text-[28px] sm:text-[34px] leading-tight text-[var(--color-ink)] mb-3">
              Ground rules
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Free to use, no key, no signup. Attribution to Portland Civic
                Lab (and the original government source, listed in every
                response) is appreciated.
              </li>
              <li>
                Responses are cached for up to an hour; please don&apos;t poll
                more often than that.
              </li>
              <li>
                Know the caveats: the{" "}
                <Link href="/methodology" className="text-[var(--color-canopy)] underline">
                  methodology page
                </Link>{" "}
                documents each source&apos;s lag, bias, and known issues.
              </li>
              <li>
                These endpoints are young — shapes may evolve. If you build
                something on them,{" "}
                <Link href="/contact" className="text-[var(--color-canopy)] underline">
                  tell us
                </Link>{" "}
                so we don&apos;t break you.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-editorial text-[28px] sm:text-[34px] leading-tight text-[var(--color-ink)] mb-3">
              Want the raw pipelines?
            </h2>
            <p>
              The entire platform — ingestion scripts, schema, and site — is
              open source under AGPL-3.0 at{" "}
              <a
                href="https://github.com/ekrolewicz6/portland-civic-lab"
                className="text-[var(--color-canopy)] underline"
              >
                github.com/ekrolewicz6/portland-civic-lab
              </a>
              . The code is AGPL. The writing is CC BY-ND, so share it whole
              with a link, but don&apos;t publish altered versions under our
              name. The curated datasets are CC BY: use them, build on them,
              credit the Lab and the original public source.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
