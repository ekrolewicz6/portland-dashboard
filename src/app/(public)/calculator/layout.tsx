import type { Metadata } from "next";

export const metadata: Metadata = {
  // Not shipped yet (see TODO.md): reachable by direct URL for the people
  // building it, but kept out of search until it is ready to be found.
  robots: { index: false, follow: false },
  title: "Benefits Calculator",
  description:
    "Estimate the total first-year value of Portland Civic Lab Business certification for your business.",
  openGraph: {
    title: "Benefits Calculator | Portland Civic Lab",
    description: "Calculate the value of Portland Civic Lab Business certification for your business.",
    url: "https://www.portlandciviclab.org/calculator",
  },
  alternates: { canonical: "https://www.portlandciviclab.org/calculator" },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
