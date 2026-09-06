import {
  ASK_PORTLAND_URL,
  COUNCIL_URL,
  DOWNTOWN_URL,
  OREGON_GOVERNANCE_URL,
  PARKS_URL,
  PERMITS_URL,
} from "@/lib/site";

/**
 * Everything a person can pick up and work on: the live tools and the open
 * questions. The About page lists these so a volunteer, a researcher, or a
 * professional can point at one thing instead of offering "to help".
 */

export type Topic = {
  name: string;
  href: string;
  external?: boolean;
};

export const TOOLS: Topic[] = [
  { name: "Portland Possible, the downtown map", href: DOWNTOWN_URL, external: true },
  { name: "The Parks Atlas", href: PARKS_URL, external: true },
  { name: "The Oregon Governance Atlas", href: OREGON_GOVERNANCE_URL, external: true },
  { name: "The City Council guide", href: COUNCIL_URL, external: true },
  { name: "Ask Portland surveys", href: ASK_PORTLAND_URL, external: true },
  { name: "Portland Permits", href: PERMITS_URL, external: true },
  { name: "The dashboards", href: "/dashboard" },
  { name: "The City org chart", href: "/org-chart" },
  { name: "The decisions register", href: "/decisions" },
];

export const QUESTIONS: Topic[] = [
  { name: "The homelessness continuum", href: "/deep-dives/continuum" },
  { name: "Homelessness", href: "/deep-dives/homelessness" },
  { name: "The PPS budget", href: "/deep-dives/pps-budget" },
  { name: "The City budget", href: "/deep-dives/city-budget" },
  { name: "Libraries", href: "/deep-dives/libraries" },
  { name: "Venues and public assets", href: "/deep-dives/venue-portfolio" },
  { name: "Housing and growth politics", href: "/deep-dives/portland-growth-politics" },
  { name: "Lloyd Center", href: "/deep-dives/lloyd" },
  { name: "Mass timber", href: "/deep-dives/mass-timber" },
  { name: "The I-5 Rose Quarter", href: "/deep-dives/i-5-rose-quarter" },
  { name: "Data centers", href: "/deep-dives/data-centers" },
  { name: "Oregon economic development", href: "/deep-dives/oregon-economic-development" },
  { name: "Who runs Portland", href: "/deep-dives/who-runs-portland" },
  { name: "FPDR, the police and fire pension", href: "/deep-dives/fpdr" },
];

export function workOnHref(name: string): string {
  return `/contact?topic=${encodeURIComponent("Work on a topic")}&project=${encodeURIComponent(name)}`;
}
