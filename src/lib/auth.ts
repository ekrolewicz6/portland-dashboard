import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth.js configuration for Portland Civic Lab.
 *
 * Uses a credentials provider (email / password) as the initial auth method.
 * When a Postgres database is available the @auth/pg-adapter can be wired in
 * by setting DATABASE_URL. Until then the adapter is omitted and sessions are
 * JWT-only, which works perfectly for dev and early deploys.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with real DB lookup once Postgres is connected.
        // For now accept a hard-coded dev account so the auth flow can be tested.
        if (
          credentials.email === "admin@portlandcommons.org" &&
          credentials.password === "portland2026"
        ) {
          return {
            id: "1",
            name: "Portland Admin",
            email: credentials.email,
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    newUser: "/signup",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as Record<string, unknown>).role as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? "portland-commons-dev-secret",
};

/** Re-export helpers that other server code may need. */
export { authOptions as config };
