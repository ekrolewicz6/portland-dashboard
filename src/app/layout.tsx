import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";

import { LEGAL_ENTITY, TAGLINE } from "@/lib/site";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-JRGVM4XLGV";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f2419",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.portlandciviclab.org"),
  title: {
    default: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    template: "%s · Portland Civic Lab",
  },
  description:
    "Free, public, source-linked tools that show how Portland actually works: dashboards, deep-dives, a parks atlas, a downtown plan, a guide to City Council, an atlas of Oregon government, surveys, and permitting tools. And the lab that property owners and public institutions hire when a decision needs evidence.",
  applicationName: "Portland Civic Lab",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  keywords: [
    "Portland Oregon",
    "Portland civic dashboard",
    "Portland data",
    "Multnomah County data",
    "Portland housing",
    "Portland homelessness",
    "Portland public safety",
    "Portland budget",
    "Portland climate",
    "Portland education",
    "Portland economy",
    "Portland accountability",
    "civic transparency",
    "open data",
  ],
  authors: [{ name: "Portland Civic Lab" }],
  creator: "Portland Civic Lab",
  publisher: "Portland Civic Lab",
  openGraph: {
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "How the city actually works: what the numbers say, what residents think, and what could change. Eight free public tools, every figure linked to its source, and paid decision work at published prices.",
    url: "https://www.portlandciviclab.org",
    siteName: "Portland Civic Lab",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portland Civic Lab — Free, source-linked tools for understanding Portland",
    description:
      "Eight free, source-linked civic tools for Portland, and paid decision work at published prices.",
    creator: "@portlandciviclab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.portlandciviclab.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} ${bricolage.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Portland Civic Lab",
              legalName: LEGAL_ENTITY,
              slogan: TAGLINE,
              url: "https://www.portlandciviclab.org",
              description:
                "Free, public, source-linked civic tools for Portland, Oregon, and paid decision work for property owners and public institutions at published prices.",
              areaServed: {
                "@type": "City",
                name: "Portland",
                containedInPlace: { "@type": "State", name: "Oregon" },
              },
              sameAs: ["https://github.com/ekrolewicz6/portland-civic-lab"],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
