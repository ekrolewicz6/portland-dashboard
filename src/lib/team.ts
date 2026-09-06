import fs from "node:fs";
import path from "node:path";

/**
 * The people behind the Lab, in one place, so the homepage and the About
 * page never disagree. Photos live in public/images/team; a person whose
 * file is missing renders as initials until it is added, so the site never
 * ships a broken image.
 */

export type Person = {
  name: string;
  title: string;
  line?: string;
  initials: string;
  /** Path under /public. Rendered only if the file exists at build time. */
  photo?: string;
};

export const PEOPLE: Person[] = [
  {
    name: "Edan Krolewicz",
    title: "Founder",
    initials: "EK",
    photo: "/images/team/edan-krolewicz.jpg",
  },
  {
    name: "Jonathan Pulvers",
    title: "Partnerships & Development",
    initials: "JP",
  },
];

export function photoExists(publicPath?: string): boolean {
  if (!publicPath) return false;
  try {
    return fs.existsSync(path.join(process.cwd(), "public", publicPath));
  } catch {
    return false;
  }
}

export function withPhotos(): (Person & { hasPhoto: boolean })[] {
  return PEOPLE.map((p) => ({ ...p, hasPhoto: photoExists(p.photo) }));
}

export const FOUNDER = PEOPLE[0];
