import type { NextConfig } from "next";

const projectRoot = __dirname;

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["postgres"],
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    // The certification, benefits-calculator, and commercial-spaces concepts
    // promised benefits that do not exist yet. They are parked until a
    // standard and real benefits are substantiated; the code stays in place.
    return [
      { source: "/apply", destination: "/business", permanent: false },
      { source: "/calculator", destination: "/business", permanent: false },
      { source: "/spaces", destination: "/business", permanent: false },
      { source: "/spaces/:path*", destination: "/business", permanent: false },
      // The weekly Portfolio Brief became the decisions register.
      { source: "/brief", destination: "/decisions", permanent: true },
    ];
  },
};

export default nextConfig;
