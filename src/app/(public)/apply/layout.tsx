import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for PCB Certification — Portland Commons",
  description:
    "Apply to become a certified Portland Commons Business. Access tax benefits, real estate, network value, and more.",
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
