import { headers } from "next/headers";
import type { ApiResponse, QuestionData } from "@/app/(public)/dashboard/types";

/** Civic dashboard categories shown on the homepage grid (display order). */
export const QUESTIONS = [
  { id: "climate", question: "Is Portland Meeting Its Climate Commitments?", color: "#2d6a4f" },
  { id: "housing", question: "Are We Building Enough?", color: "#b85c6a" },
  { id: "safety", question: "Are People Safe?", color: "#b85c3a" },
  { id: "homelessness", question: "Are People Getting Housed?", color: "#8b6c5c" },
  { id: "fiscal", question: "What Do Portlanders Pay, and What Do They Get?", color: "#7c6f9e" },
  { id: "economy", question: "Can People Make a Living?", color: "#c8956c" },
  { id: "economic-health", question: "Is the Local Economy Healthy?", color: "#5c8b9c" },
  { id: "education", question: "Are Kids Learning?", color: "#3d7a5a" },
  { id: "quality", question: "Does Portland Work as a Place to Live?", color: "#6a7f8a" },
  { id: "accountability", question: "What Have Voters Approved?", color: "#8a5c6a" },
] as const;

/**
 * Origin for this app's server-side fetches of its own API.
 *
 * Prefers the configured value. The Host header is only a fallback for local
 * development: it is client-controllable, and behind a proxy that forwards it
 * unchanged a spoofed Host would make the server fetch an attacker's origin
 * and render whatever JSON came back as Portland's civic data.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[dashboard] NEXT_PUBLIC_APP_URL is not set; falling back to the Host header. Set it in production.",
    );
  }
  return `${proto}://${host}`;
}

export async function fetchQuestionData(baseUrl: string): Promise<QuestionData[]> {
  const startAll = Date.now();
  const results = await Promise.all(
    QUESTIONS.map(async (q) => {
      const start = Date.now();
      try {
        const res = await fetch(`${baseUrl}/api/dashboard/${q.id}`, {
          cache: "no-store",
        });
        const elapsed = Date.now() - start;
        if (!res.ok) {
          const body = await res.text().catch(() => "(unreadable)");
          console.error(
            `[dashboard] ${q.id} returned ${res.status} in ${elapsed}ms — ${body.slice(0, 200)}`,
          );
          return { ...q, apiData: null };
        }
        const data: ApiResponse = await res.json();
        if (elapsed > 5000) {
          console.warn(`[dashboard] ${q.id} slow response: ${elapsed}ms`);
        }
        return { ...q, apiData: data };
      } catch (err) {
        const elapsed = Date.now() - start;
        console.error(
          `[dashboard] ${q.id} failed after ${elapsed}ms:`,
          err instanceof Error ? err.message : err,
        );
        return { ...q, apiData: null };
      }
    }),
  );

  const totalElapsed = Date.now() - startAll;
  const live = results.filter((r) => r.apiData).map((r) => r.id);
  const failed = results.filter((r) => !r.apiData).map((r) => r.id);
  console.log(
    `[dashboard] Fetched ${results.length} questions in ${totalElapsed}ms — live: [${live.join(", ")}]${failed.length ? ` — failed: [${failed.join(", ")}]` : ""}`,
  );

  return results;
}

/** Extract a short headline value from the API headline string */
export function extractHeadlineValue(headline: string | undefined): string {
  if (!headline) return "—";
  const match = headline.match(/^([\d,]+(?:\.\d+)?%?)/);
  if (match) return match[1];
  const numMatch = headline.match(/([\d,]+(?:\.\d+)?)/);
  if (numMatch) return numMatch[1];
  return headline.split(" ").slice(0, 3).join(" ");
}

/** Extract a label from the headline (everything after the first number) */
export function extractHeadlineLabel(headline: string | undefined): string {
  if (!headline) return "Data loading";
  const cleaned = headline.replace(/^[\d,]+(?:\.\d+)?%?\s*/, "");
  return cleaned.replace(/^[—–-]\s*/, "").trim() || headline;
}
