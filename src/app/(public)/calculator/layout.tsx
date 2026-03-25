import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benefits Calculator — Portland Civic Lab",
  description:
    "Estimate the total first-year value of Portland Civic Lab Business certification for your business.",
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
