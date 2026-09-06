/**
 * Metadata for the civic dashboard categories.
 *
 * Twelve slugs, eleven reachable pages: /dashboard/environment redirects to
 * /dashboard/climate, which renders the air-quality view itself.
 */

export const VALID_QUESTIONS = [
  "housing",
  "homelessness",
  "safety",
  "transportation",
  "education",
  "fiscal",
  "economy",
  "economic-health",
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
  { title: string; shortTitle: string; color: string; description: string }
> = {
  housing: { title: "Are We Building Enough?", shortTitle: "Housing", color: "#b85c6a", description: "Portland housing permits, construction trends, and affordability data from city records." },
  homelessness: { title: "Are People Getting Housed?", shortTitle: "Homelessness", color: "#8b6c5c", description: "Shelter capacity, unsheltered counts, and housing placement outcomes across Portland." },
  safety: { title: "Are People Safe?", shortTitle: "Public Safety", color: "#b85c3a", description: "Portland crime data, police staffing, response times, and public safety trends." },
  transportation: { title: "Can You Get Around?", shortTitle: "Transportation", color: "#4a7f9e", description: "Portland transit ridership, road conditions, Vision Zero progress, and commute patterns." },
  education: { title: "Are Kids Learning?", shortTitle: "Education", color: "#3d7a5a", description: "Enrollment, graduation rates, attendance, and spending for 6 Portland-area school districts." },
  fiscal: { title: "Where Does the Money Go?", shortTitle: "Fiscal Health", color: "#7c6f9e", description: "Portland's General Fund, FiSC local fiscal basket, income-tax scenarios, revenue sources, structural deficit, and service-return context." },
  economy: { title: "Can People Make a Living?", shortTitle: "Economy", color: "#c8956c", description: "Portland jobs, wages, unemployment, and economic indicators from BLS and Census data." },
  "economic-health": { title: "Is the Local Economy Healthy?", shortTitle: "Economic Health", color: "#5c8b9c", description: "Composite scorecard combining business formation, financial distress, employment, real estate, and permits into a single state-of-the-economy score." },
  environment: { title: "Are We Meeting Our Climate Goals?", shortTitle: "Environment", color: "#5a8a6a", description: "Portland greenhouse gas emissions, PCEF spending, air quality, and climate action progress." },
  quality: { title: "Does Portland Work as a Place to Live?", shortTitle: "Quality of Life", color: "#6a7f8a", description: "Parks, libraries, road quality, walkability, and livability metrics across Portland." },
  accountability: { title: "What Have Voters Approved?", shortTitle: "Accountability", color: "#8a5c6a", description: "Ballot measures, City Council actions, auditor findings, and public commitments." },
  climate: { title: "Is Portland Meeting Its Climate Commitments?", shortTitle: "Climate", color: "#2d6a4f", description: "Climate Emergency Workplan tracker, bureau scorecards, PCEF finance, and emissions trajectory." },
};
