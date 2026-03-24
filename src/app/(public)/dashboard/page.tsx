import { headers } from "next/headers";
import DashboardClient from "./DashboardClient";
import type { ApiResponse, QuestionData } from "./types";

export const dynamic = "force-dynamic";

/** The ten civic dashboard categories in display order */
const QUESTIONS = [
  { id: "housing", question: "Are We Building Enough?", color: "#b85c6a" },
  { id: "safety", question: "Are People Safe?", color: "#b85c3a" },
  { id: "economy", question: "Can People Make a Living?", color: "#c8956c" },
  { id: "fiscal", question: "Is the City Solvent?", color: "#7c6f9e" },
  { id: "homelessness", question: "Are People Getting Housed?", color: "#8b6c5c" },
  { id: "transportation", question: "Can You Get Around?", color: "#4a7f9e" },
  { id: "education", question: "Are Kids Learning?", color: "#3d7a5a" },
  { id: "environment", question: "Are We Meeting Our Climate Goals?", color: "#5a8a6a" },
  { id: "quality", question: "Does Portland Work as a Place to Live?", color: "#6a7f8a" },
  { id: "accountability", question: "Who Promised What?", color: "#8a5c6a" },
] as const;

async function fetchQuestionData(baseUrl: string): Promise<QuestionData[]> {
  const results = await Promise.all(
    QUESTIONS.map(async (q) => {
      try {
        const res = await fetch(`${baseUrl}/api/dashboard/${q.id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          console.error(`[dashboard] ${q.id} API returned ${res.status}`);
          return { ...q, apiData: null };
        }
        const data: ApiResponse = await res.json();
        return { ...q, apiData: data };
      } catch (err) {
        console.error(`[dashboard] Failed to fetch ${q.id}:`, err);
        return { ...q, apiData: null };
      }
    }),
  );
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
