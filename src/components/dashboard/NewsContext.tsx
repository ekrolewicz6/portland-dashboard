"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

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

export default function NewsContext({ category }: { category: string }) {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/news?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((d) => {
        setStories(d.stories ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [category]);

  if (!loaded || stories.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <Newspaper
          className="w-4 h-4"
          style={{ color: "var(--color-ink-muted)" }}
        />
        <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
          In the News
        </h2>
        <div className="flex-1 h-px bg-[var(--color-parchment)]" />
      </div>

      <div className="space-y-3">
        {stories.map((story) => {
          const date = new Date(story.published_date).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          );

          return (
            <div
              key={story.id}
              className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4"
            >
              <div className="flex items-start gap-3">
                <Newspaper className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-ink-faint)]" />
                <div className="min-w-0">
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium text-[var(--color-ink)] hover:underline leading-snug"
                  >
                    {story.headline}
                  </a>
                  <p className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                    {story.source} &middot; {date}
                  </p>
                  <p className="text-[13px] text-[var(--color-ink-light)] mt-2 leading-relaxed">
                    {story.summary}
                  </p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-2 italic leading-relaxed">
                    <span className="font-medium not-italic">
                      Why this matters:
                    </span>{" "}
                    {story.relevance}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
