import { headers } from "next/headers";
import DashboardClient from "./DashboardClient";
import type { ApiResponse, QuestionData } from "./types";

export const dynamic = "force-dynamic";

/** The ten civic dashboard categories in display order */
const QUESTIONS = [
  { id: "housing", question: "Are We Building Enough?", color: "#b85c6a" },
  { id: "safety", question: "Are People Safe?", color: "#b85c3a" },
  { id: "economy", question: "Can People Make a Living?", color: "#c8956c" },
  { id: "fiscal", question: "Where Does the Money Go?", color: "#7c6f9e" },
  { id: "homelessness", question: "Are People Getting Housed?", color: "#8b6c5c" },
  { id: "transportation", question: "Can You Get Around?", color: "#4a7f9e" },
  { id: "education", question: "Are Kids Learning?", color: "#3d7a5a" },
  { id: "climate", question: "Is Portland Meeting Its Climate Commitments?", color: "#2d6a4f" },
  { id: "quality", question: "Does Portland Work as a Place to Live?", color: "#6a7f8a" },
  { id: "accountability", question: "Who Promised What?", color: "#8a5c6a" },
] as const;

async function fetchQuestionData(baseUrl: string): Promise<QuestionData[]> {
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
          console.error(`[dashboard] ${q.id} returned ${res.status} in ${elapsed}ms — ${body.slice(0, 200)}`);
          return { ...q, apiData: null };
        }
        const data: ApiResponse = await res.json();

        // Validate expected shape
        if (!data.headline && data.dataStatus !== "unavailable") {
          console.warn(`[dashboard] ${q.id} responded OK but missing headline field — keys: ${Object.keys(data).join(", ")}`);
        }

        if (elapsed > 5000) {
          console.warn(`[dashboard] ${q.id} slow response: ${elapsed}ms`);
        }

        return { ...q, apiData: data };
      } catch (err) {
        const elapsed = Date.now() - start;
        console.error(`[dashboard] ${q.id} failed after ${elapsed}ms:`, err instanceof Error ? err.message : err);
        return { ...q, apiData: null };
      }
    }),
  );

  const totalElapsed = Date.now() - startAll;
  const failed = results.filter((r) => !r.apiData).map((r) => r.id);
  const live = results.filter((r) => r.apiData).map((r) => r.id);
  console.log(`[dashboard] Fetched ${results.length} questions in ${totalElapsed}ms — live: [${live.join(", ")}]${failed.length ? ` — failed: [${failed.join(", ")}]` : ""}`);

  return results;
}

export default async function DashboardPage() {
  // Determine base URL from the incoming request headers
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const questions = await fetchQuestionData(baseUrl);

  return <DashboardClient questions={questions} />;
}
