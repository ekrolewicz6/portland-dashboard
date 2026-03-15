import { headers } from "next/headers";
import DashboardClient from "./DashboardClient";
import type { ApiResponse, QuestionData } from "./types";

export const dynamic = "force-dynamic";

/** The seven questions in display order */
const QUESTIONS = [
  { id: "safety", question: "Is Portland safe?", color: "#b85c3a" },
  { id: "tax", question: "Is the tax burden competitive?", color: "#7c6f9e" },
  { id: "housing", question: "Is housing getting built?", color: "#b85c6a" },
  { id: "downtown", question: "Is downtown coming back?", color: "#c8956c" },
  { id: "migration", question: "Is Portland gaining or losing people?", color: "#4a7f9e" },
  { id: "business", question: "Is Portland gaining or losing businesses?", color: "#3d7a5a" },
  { id: "program", question: "Is the Portland Commons working?", color: "#1a3a2a" },
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
