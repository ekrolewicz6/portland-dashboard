import type { NextConfig } from "next";

const projectRoot = __dirname;

/**
 * Security headers.
 *
 * Framing is the one that carries real weight here: /member and /admin are
 * session-gated pages, and without a frame directive any site could embed
 * them and drive them through a transparent overlay. The dashboard embed
 * route is the deliberate exception — its whole purpose is to be iframed by
 * newsrooms and neighbourhood sites — so it opts back in.
 *
 * No Content-Security-Policy yet: the app loads Google Analytics and Google
 * Fonts and uses inline styles throughout, so a policy strict enough to be
 * worth having would need a nonce pipeline through every inline style. Adding
 * a permissive one would be theatre. The headers below are the ones that
 * work without that groundwork.
 */
const SECURITY_HEADERS = [
  // No MIME sniffing: a user-uploaded or proxied file must be treated as the
  // type it was served with.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin, not the full path, to third parties. Dashboard URLs
  // carry the topic being read, which is nobody else's business.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The app asks for none of these; deny them up front.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

/** Same list, minus the framing restrictions, for the embeddable routes. */
const EMBEDDABLE_HEADERS = SECURITY_HEADERS.filter(
  (h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy",
);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["postgres"],
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        // Embeds are meant to be framed anywhere. Listed first; Next applies
        // every matching entry, and the specific entry here simply omits the
        // framing headers rather than trying to override them.
        source: "/dashboard/embed/:path*",
        headers: EMBEDDABLE_HEADERS,
      },
      {
        source: "/((?!dashboard/embed).*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
