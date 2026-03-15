/** Metadata for the 7 dashboard questions */

export const VALID_QUESTIONS = [
  "migration",
  "business",
  "downtown",
  "safety",
  "tax",
  "housing",
  "program",
] as const;

export type QuestionSlug = (typeof VALID_QUESTIONS)[number];

export function isValidQuestion(slug: string): slug is QuestionSlug {
  return VALID_QUESTIONS.includes(slug as QuestionSlug);
}

export const questionMeta: Record<
  QuestionSlug,
  { title: string; color: string }
> = {
  migration: { title: "Is Portland gaining or losing people?", color: "#4a7f9e" },
  business: { title: "Is Portland gaining or losing businesses?", color: "#3d7a5a" },
  downtown: { title: "Is downtown coming back?", color: "#c8956c" },
  safety: { title: "Is Portland safe?", color: "#b85c3a" },
  tax: { title: "Is the tax burden competitive?", color: "#7c6f9e" },
  housing: { title: "Is housing getting built?", color: "#b85c6a" },
  program: { title: "Is the Portland Commons working?", color: "#1a3a2a" },
};
