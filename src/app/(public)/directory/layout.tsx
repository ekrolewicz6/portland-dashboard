import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portland Business Directory",
  description:
    "Search 100,000+ registered businesses in Portland, Oregon. Filter by entity type, location, and registration date. Sourced from Oregon Secretary of State records.",
  openGraph: {
    title: "Portland Business Directory | Portland Civic Lab",
    description: "Search registered businesses across Portland — entity types, locations, registration history.",
    url: "https://www.portlandciviclab.org/directory",
  },
  alternates: { canonical: "https://www.portlandciviclab.org/directory" },
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
