# Contributing to Portland Civic Lab

Thanks for your interest. Portland Civic Lab builds public dashboards and
civic tools for Portland, Oregon, and contributions are welcome — code, data
sourcing, design, writing, and local knowledge all count.

## Quick start

```bash
git clone https://github.com/ekrolewicz6/portland-civic-lab.git
cd portland-civic-lab
npm install
cp .env.example .env.local   # fill in what you have; see notes below
npm run dev
```

There is no mock-data mode. Without a `DATABASE_URL` every query fails fast
and the dashboards report `dataStatus: "unavailable"` instead of numbers, so
the pages still render and are fine for UI, layout, and docs work.

For data work you need a local Postgres. PostGIS is not required: nothing in
the TypeScript app or the schema uses it. Only `ingest/legacy/python/` has
spatial code, and only that tree needs a PostGIS-enabled database.

Set up a database by applying the files in `drizzle/` one at a time:

```bash
npx tsx ingest/apply-migration.ts drizzle/0003_members.sql
```

Read the migration caveat in [README.md](README.md#migrations-are-not-a-runnable-sequence)
first. `drizzle/` is a folder of numbered SQL files, not a replayable history:
`0000_fine_dorian_gray.sql` has bare `CREATE SCHEMA`/`CREATE TABLE` statements
and `0002_boec_20sec.sql` alters a table no migration creates, so applying the
directory in order to an empty database fails partway through. `0001` onward
are otherwise `IF NOT EXISTS` and safe to re-run individually.

The closest thing to a reproducible database is `ingest/ci-seed.ts`, which CI
uses: it runs the migrations statement-by-statement, tolerates the known
failures, then creates the handful of fixture tables the smoke suite asserts
against. It is deliberately not a copy of production.

## Repo map

| Path | What it is |
|------|------------|
| `src/app/(public)/` | Public pages (dashboards, methodology, contact, …) |
| `src/app/api/dashboard/` | One JSON endpoint per dashboard topic |
| `src/app/api/cron/` | Scheduled sync jobs (Vercel cron; require `CRON_SECRET`) |
| `src/components/dashboard/` | Per-topic detail components |
| `src/lib/db-query.ts` | The only database entry point — raw `postgres` tagged templates |
| `src/db/schema.ts` + `drizzle/` | Drizzle schema definitions and SQL migrations (drizzle-kit only; no runtime ORM) |
| `ingest/` | Data ingestion / seed / sync scripts (TypeScript) |
| `docs/` | Data source inventory, storage strategy, audit & roadmap |

## Ground rules

1. **Never present estimated or remembered data as real.** Every chart cites
   its source. If data is unavailable, say so. Read `KNOWN_ISSUES.md` before
   touching data code — it documents real gotchas (corrupt permit dates,
   crime grid undercounting, survivorship bias) that will bite you, and the
   integrity rules the code now enforces.
2. **Working data is not committed.** Downloads, scrape caches, and JSON
   snapshots belong in `runtime-data/` (gitignored) or in Postgres. The one
   exception is research provenance — see `docs/data-storage.md` for exactly
   where that line falls.
3. **No secrets in code.** Configuration comes from environment variables.
   `.env.example` is kept in sync with what `src/` and `ingest/` actually
   read; if you add a `process.env.X`, add it there in the same change.
4. **Match the existing style.** TypeScript strict mode, no new `any`/
   `as unknown` casts where a real type is feasible.

## Data integrity rules enforced in code

These were broken before and fixed; the rules are written into the code and
its comments so they are not re-broken. See
`src/app/api/cron/verify-promises/route.ts` for the canonical statement.

1. **Verdicts are derived, never written.** Anything a cron job publishes as
   machine-verified — a `verification_status`, a pass/fail label — must be
   computed from the values that job just queried. If the data cannot support
   a verdict, write `in_progress` and say why in the notes. No literal
   verdicts.
2. **Comparison windows are computed at run time and anchored to the data.**
   A window frozen in source drifts out of date while `updated_at` keeps
   being refreshed. Anchor to the freshest row in the table, not to
   `CURRENT_DATE`: ingest lags by days, and comparing a partial recent window
   against a complete prior one manufactures a decline.
3. **Permit timeliness is measured by application cohort.** Never group on
   issue date. Grouping by issue date only counts permits that have already
   finished, which makes recent periods look fast. Cohorts are closed a fixed
   interval before the freshest application in the table.
4. **A route with no data reports it.** When a query returns nothing or
   fails, the route answers `dataStatus: "unavailable"`. It does not fall
   back to a remembered constant, and the cache layer refuses to store or
   serve an `unavailable`/`error` payload.

## Before you open a PR

```bash
npx tsc --noEmit             # typecheck the app
npx tsc -p ingest --noEmit   # typecheck the ingest scripts (excluded from the root tsconfig)
npm run lint                 # eslint .
npm run build                # production build
```

CI (`.github/workflows/ci.yml`) runs the same four checks. Its order is: app
typecheck, ingest typecheck, lint, load schema and fixtures into a Postgres
service container with `ingest/ci-seed.ts`, build, Playwright smoke suite.
The suite runs with a real `DATABASE_URL`: without one every
`/api/dashboard/*` route answers "unavailable", which the old suite could not
tell apart from working.

### Optional pre-push hook

`.githooks/pre-push` runs every dashboard API query against a real database
and refuses the push if any of them errors. It is not enabled by default.
Turn it on once per clone:

```bash
git config core.hooksPath .githooks
```

Without a `DATABASE_URL` (in the environment or in `.env.local`) the hook
skips rather than failing, so it never blocks UI or docs work.

## Good first contributions

- Pick a "PRR Needed" or "Periodic Download" source on the
  [methodology page](https://www.portlandciviclab.org/methodology) and help
  automate or refresh it
- Extract shared chart/layout primitives from the large `*Detail.tsx`
  components
- Add Playwright smoke tests for the dashboard topic pages
- Improve accessibility (alt text, contrast, keyboard navigation)

## Questions

Open a GitHub issue, or use the [contact form](https://www.portlandciviclab.org/contact).

## License

By contributing, you agree your contributions are licensed under the
AGPL-3.0 (see `LICENSE`).
