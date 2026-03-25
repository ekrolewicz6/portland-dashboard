import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for PCB Certification — Portland Civic Lab",
  description:
    "Apply to become a certified Portland Civic Lab Business. Access tax benefits, real estate, network value, and more.",
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
