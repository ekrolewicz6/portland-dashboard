# Database schema layout

Two complementary files:

- **`schema.ts`** — hand-maintained definitions for tables the app owns and
  migrates (`drizzle/NNNN_*.sql` files, applied with
  `npx tsx ingest/apply-migration.ts <file>`). Add new app tables here AND
  as a numbered migration.

- **`introspected/schema.ts` + `introspected/relations.ts`** — a generated,
  read-only snapshot of the database across all topic schemas (safety,
  housing, homelessness, education, …). It currently declares **176 tables**:
  65 in `public` plus 111 in the 17 named schemas.

  It is a point-in-time snapshot and it lags. This one predates migration
  `0008_business_funding.sql` — none of the tables added by `0008` and later
  (`businesses`, `business_members`, `business_invites`,
  `funding_opportunities`, `opportunity_matches`, `account_identities`,
  `pcb_applications`, `donations`) are in it. Do not treat it as the current
  shape of the database. Use it for typed access to ingest-owned tables
  instead of `as unknown` casts. Regenerate after ingest schema changes:

  ```bash
  set -a; source .env.local; set +a
  npx drizzle-kit pull --config drizzle-introspect.config.ts
  rm -f src/db/introspected/0000_*.sql && rm -rf src/db/introspected/meta
  ```

  (The generated `.sql`/`meta` artifacts are deleted on purpose — they are
  a CREATE-everything dump, never to be applied.)

## Nothing here runs at runtime

Both files exist for `drizzle-kit` (migration generation, `db:studio`,
introspection). `drizzle-orm` is imported only by the three files in this
directory, and nothing outside it imports them: every route and script
queries through `src/lib/db-query.ts` with raw `postgres` tagged templates.

Known debt: API routes query raw SQL with `as unknown` casts. Migrating them
to typed queries against the introspected snapshot is the intent behind
keeping it, but no route does that yet — and the snapshot would need
regenerating first.
