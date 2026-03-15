import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portland Commons Civic Dashboard",
  description:
    "Real-time data on Portland's recovery — migration, business formation, downtown activity, safety, taxes, and housing.",
  openGraph: {
    title: "Portland Commons Civic Dashboard",
    description:
      "Seven questions that drive Portland's story, answered with real data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--color-cream)]">{children}</body>
    </html>
  );
}
