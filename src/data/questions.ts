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
    id: "housing",
    title: "Are We Building Enough?",
    shortTitle: "Housing",
    description:
      "Tracks building permits, median rents, home values, and housing completions across Portland.",
    icon: "home",
    color: "rose",
  },
  {
    id: "homelessness",
    title: "Are People Getting Housed?",
    shortTitle: "Homelessness",
    description:
      "Monitors shelter capacity, Point-in-Time counts, permanent supportive housing, and behavioral health services.",
    icon: "tent",
    color: "stone",
  },
  {
    id: "safety",
    title: "Are People Safe?",
    shortTitle: "Public Safety",
    description:
      "Analyzes crime data, 911 response times, officer staffing, and use-of-force trends across the city.",
    icon: "shield",
    color: "amber",
  },
  {
    id: "transportation",
    title: "Can You Get Around?",
    shortTitle: "Transportation",
    description:
      "Tracks transit ridership, traffic fatalities, commute mode share, and bike infrastructure.",
    icon: "bus",
    color: "blue",
  },
  {
    id: "education",
    title: "Are Kids Learning?",
    shortTitle: "Education",
    description:
      "Monitors PPS enrollment, test scores, graduation rates, and teacher staffing ratios.",
    icon: "graduation-cap",
    color: "emerald",
  },
  {
    id: "fiscal",
    title: "Is the City Solvent?",
    shortTitle: "Fiscal Health",
    description:
      "Compares tax burden, tracks city budget trends, revenue sources, capital project completion, and PERS liability.",
    icon: "receipt",
    color: "violet",
  },
  {
    id: "economy",
    title: "Can People Make a Living?",
    shortTitle: "Economy",
    description:
      "Combines business registrations, commercial vacancy, employment data, wages by sector, and downtown vitality.",
    icon: "building-2",
    color: "orange",
  },
  {
    id: "environment",
    title: "Are We Meeting Our Climate Goals?",
    shortTitle: "Environment",
    description:
      "Tracks greenhouse gas emissions, air quality, tree canopy coverage, and waste diversion rates.",
    icon: "leaf",
    color: "green",
  },
  {
    id: "quality",
    title: "Does Portland Work as a Place to Live?",
    shortTitle: "Quality of Life",
    description:
      "Measures park access, library services, street conditions, and 311 service request trends.",
    icon: "sun",
    color: "slate",
  },
  {
    id: "accountability",
    title: "Who Promised What?",
    shortTitle: "Accountability",
    description:
      "Tracks elected officials, ballot measure outcomes, campaign finance, and agency performance metrics.",
    icon: "scale",
    color: "pink",
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
