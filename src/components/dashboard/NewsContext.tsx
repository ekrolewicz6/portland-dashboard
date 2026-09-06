"use client";

import { useEffect, useState } from "react";
import { Newspaper, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface NewsStory {
  id: number;
  category: string;
  headline: string;
  source: string;
  url: string;
  published_date: string;
  summary: string;
  relevance: string;
}

/**
 * Story URLs arrive from the news feed, so only web schemes are turned into
 * links — anything else (javascript:, data:, ...) is shown as plain text.
 */
function webUrl(raw: string): string | null {
  try {
    const { protocol, href } = new URL(raw);
    return protocol === "http:" || protocol === "https:" ? href : null;
  } catch {
    return null;
  }
}

function StoryHeadline({ headline, url }: { headline: string; url: string }) {
  const safeUrl = webUrl(url);

  if (!safeUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-ink)] leading-snug">
        {headline}
      </span>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-ink)] hover:underline leading-snug"
    >
      {headline}
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewsContext({ category }: { category: string }) {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/dashboard/news?category=${encodeURIComponent(category)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setStories(d.stories ?? []);
        if (!cancelled) setLoaded(true);
      })
      .catch(() => { if (!cancelled) setLoaded(true); });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category]);

  if (!loaded || stories.length === 0) return null;

  // Show only the most recent story when collapsed; reveal the rest on expand.
  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <Newspaper
          className="w-4 h-4"
          style={{ color: "var(--color-ink-muted)" }}
        />
        <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
          Happening Now
        </h2>
        <div className="flex-1 h-px bg-[var(--color-parchment)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-light)]">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </span>
      </div>

      {/* Compact featured row — single line, always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm px-4 py-3 hover:border-[var(--color-sage)] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-light)] flex-shrink-0">
            {formatDate(featured.published_date)}
          </span>
          <span className="w-px h-3 bg-[var(--color-parchment)] flex-shrink-0" />
          <span className="text-[13px] text-[var(--color-ink)] font-medium leading-snug truncate flex-1 group-hover:text-[var(--color-canopy)] transition-colors">
            {featured.headline}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-light)] flex-shrink-0 hidden sm:inline">
            {open ? "Hide" : "Read"}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-ink-muted)]/60 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-ink-muted)]/60 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded panel — featured story details + the rest */}
      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {/* Featured story full body */}
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4">
            <div className="flex items-start gap-3">
              <Newspaper className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-ink-faint)]" />
              <div className="min-w-0">
                <StoryHeadline
                  headline={featured.headline}
                  url={featured.url}
                />
                <p className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                  {featured.source} &middot; {formatDate(featured.published_date)}
                </p>
                <p className="text-[13px] text-[var(--color-ink-light)] mt-2 leading-relaxed">
                  {featured.summary}
                </p>
                {featured.relevance && (
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-2 italic leading-relaxed">
                    <span className="font-medium not-italic">
                      Why this matters:
                    </span>{" "}
                    {featured.relevance}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Remaining stories — same compact card */}
          {rest.map((story) => (
            <div
              key={story.id}
              className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4"
            >
              <div className="flex items-start gap-3">
                <Newspaper className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-ink-faint)]" />
                <div className="min-w-0">
                  <StoryHeadline headline={story.headline} url={story.url} />
                  <p className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                    {story.source} &middot; {formatDate(story.published_date)}
                  </p>
                  <p className="text-[13px] text-[var(--color-ink-light)] mt-2 leading-relaxed">
                    {story.summary}
                  </p>
                  {story.relevance && (
                    <p className="text-[12px] text-[var(--color-ink-muted)] mt-2 italic leading-relaxed">
                      <span className="font-medium not-italic">
                        Why this matters:
                      </span>{" "}
                      {story.relevance}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
