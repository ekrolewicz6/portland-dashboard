/**
 * db-url.ts
 *
 * Single source of truth for the Postgres connection string used by the
 * ingest scripts.
 *
 * Ingest scripts write to the same database the dashboard reads from, so
 * connecting to the wrong one is never harmless. A default connection string
 * makes that failure mode invisible: a script started without DATABASE_URL
 * either dies with an opaque ECONNREFUSED against 127.0.0.1:5432, or — on any
 * machine that happens to run a local Postgres — succeeds against the wrong
 * database and reports a clean load. Requiring the variable collapses both
 * outcomes into one explicit error raised before a socket is ever opened.
 */

import postgres from "postgres";

/** Connection options accepted by `postgres()`, minus the URL itself. */
export type IngestClientOptions = postgres.Options<
  Record<string, postgres.PostgresType>
>;

/**
 * Returns the connection string every ingest script must run against.
 *
 * Throws rather than exiting so callers keep control of their own teardown
 * (open clients, partially written files) and so the stack trace names the
 * script that was misconfigured.
 */
export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — ingest scripts have no default database.\n" +
        "  Set DATABASE_URL=postgresql://... in .env.local, then run the script as:\n" +
        "    npx tsx --env-file=.env.local ingest/<script>.ts",
    );
  }
  return url;
}

/**
 * Convenience wrapper for scripts that only need a client and the usual
 * options; scripts with bespoke connection tuning can call `postgres()`
 * directly with `requireDatabaseUrl()`.
 */
export function createIngestClient(options?: IngestClientOptions) {
  return postgres(requireDatabaseUrl(), options);
}
