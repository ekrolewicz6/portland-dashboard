import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware protects authenticated route groups (/member, /landlord, /admin).
 * Everything else is public.
 */

const publicPaths = [
  "/",
  "/dashboard",
  "/directory",
  "/calculator",
  "/apply",
  "/progress-report",
  "/login",
  "/signup",
];

const publicApiPrefixes = ["/api/dashboard/", "/api/public/", "/api/auth/", "/api/export/"];

const publicPrefixes = ["/dashboard/"];

function isPublicRoute(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true;
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  // Static assets and Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  return false;
}

const protectedPrefixes = ["/member", "/landlord", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate protected prefixes
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "portland-commons-dev-secret",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  const role = token.role as string | undefined;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/landlord/:path*", "/admin/:path*"],
};
