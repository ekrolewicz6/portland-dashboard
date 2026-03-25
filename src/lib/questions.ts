/** Metadata for the 10 civic dashboard categories */

export const VALID_QUESTIONS = [
  "housing",
  "homelessness",
  "safety",
  "transportation",
  "education",
  "fiscal",
  "economy",
  "environment",
  "quality",
  "accountability",
  "climate",
] as const;

export type QuestionSlug = (typeof VALID_QUESTIONS)[number];

export function isValidQuestion(slug: string): slug is QuestionSlug {
  return VALID_QUESTIONS.includes(slug as QuestionSlug);
}

export const questionMeta: Record<
  QuestionSlug,
  { title: string; shortTitle: string; color: string }
> = {
  housing: { title: "Are We Building Enough?", shortTitle: "Housing", color: "#b85c6a" },
  homelessness: { title: "Are People Getting Housed?", shortTitle: "Homelessness", color: "#8b6c5c" },
  safety: { title: "Are People Safe?", shortTitle: "Public Safety", color: "#b85c3a" },
  transportation: { title: "Can You Get Around?", shortTitle: "Transportation", color: "#4a7f9e" },
  education: { title: "Are Kids Learning?", shortTitle: "Education", color: "#3d7a5a" },
  fiscal: { title: "Is the City Solvent?", shortTitle: "Fiscal Health", color: "#7c6f9e" },
  economy: { title: "Can People Make a Living?", shortTitle: "Economy", color: "#c8956c" },
  environment: { title: "Are We Meeting Our Climate Goals?", shortTitle: "Environment", color: "#5a8a6a" },
  quality: { title: "Does Portland Work as a Place to Live?", shortTitle: "Quality of Life", color: "#6a7f8a" },
  accountability: { title: "Who Promised What?", shortTitle: "Accountability", color: "#8a5c6a" },
  climate: { title: "Is Portland Meeting Its Climate Commitments?", shortTitle: "Climate", color: "#2d6a4f" },
};
