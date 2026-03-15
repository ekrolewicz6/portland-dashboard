// ---------------------------------------------------------------------------
// Portland Commons Dashboard — Question Configuration
// ---------------------------------------------------------------------------

import type { QuestionId } from "@/types/dashboard";

export interface QuestionConfig {
  id: QuestionId;
  title: string; // phrased as a question
  shortTitle: string;
  description: string;
  icon: string; // lucide-react icon name
  color: string; // Tailwind color theme key (e.g. "blue")
}

export const QUESTIONS = [
  {
    id: "migration",
    title: "Are people moving to or away from Portland?",
    shortTitle: "Migration",
    description:
      "Tracks net domestic migration, inbound/outbound moves, and population change trends across the Portland metro area.",
    icon: "plane",
    color: "blue",
  },
  {
    id: "business",
    title: "Is Portland gaining or losing businesses?",
    shortTitle: "Business",
    description:
      "Monitors new business registrations, closures, and net change to gauge the health of Portland's entrepreneurial ecosystem.",
    icon: "building-2",
    color: "emerald",
  },
  {
    id: "downtown",
    title: "Is downtown Portland coming back to life?",
    shortTitle: "Downtown",
    description:
      "Measures foot traffic, commercial vacancy rates, and storefront activity in the central business district.",
    icon: "map-pin",
    color: "violet",
  },
  {
    id: "safety",
    title: "Is Portland becoming safer?",
    shortTitle: "Safety",
    description:
      "Analyzes crime rates, incident counts, and clearance rates to evaluate public safety trends across the city.",
    icon: "shield",
    color: "amber",
  },
  {
    id: "tax",
    title: "How does Portland's tax burden compare?",
    shortTitle: "Taxes",
    description:
      "Compares Portland's effective tax rates — income, property, and business — against peer cities in the region and nation.",
    icon: "receipt",
    color: "red",
  },
  {
    id: "housing",
    title: "Can people afford to live in Portland?",
    shortTitle: "Housing",
    description:
      "Tracks median home prices, rental costs, inventory levels, and an affordability index relative to local incomes.",
    icon: "home",
    color: "teal",
  },
  {
    id: "program",
    title: "Are city programs actually working?",
    shortTitle: "Programs",
    description:
      "Evaluates budget utilization, outcome scores, and effectiveness measures for major city-funded initiatives.",
    icon: "bar-chart-3",
    color: "orange",
  },
] as const satisfies readonly QuestionConfig[];

/** Look up a question config by its id */
export function getQuestionById(id: QuestionId): QuestionConfig | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/** Map of question id to its config for O(1) access */
export const QUESTION_MAP = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
) as Record<QuestionId, QuestionConfig>;
