# Civic Dashboard Architecture Notes

The repository root **is** the application. There is no `apps/` directory and
no parent monorepo: a clone of `portland-civic-lab` contains the Next.js app,
its API routes, its migrations, and its ingestion scripts.

Nothing in `src/` reads a path outside the repository. Earlier versions of
this file described shared `../../data/datasets/` and `../../data/knowledge/`
trees and a `data/` compatibility symlink; none of that exists, and no code
looks for it. One ingest script is the exception:
`ingest/sync-pbj-records.ts` defaults to
`../../../intelligence/bizjournals-records/...`, a path that exists on one
machine only. Pass `--input` or set `PBJ_INPUT_DIR` when running it.

## Layout

| Path | What it is |
|------|------------|
| `src/app/` | Next.js App Router. `(public)/` public pages, `api/` route handlers, `api/cron/` scheduled jobs. |
| `src/components/` | React components, mostly per-topic dashboard detail views. |
| `src/lib/` | Shared server and client code, including `db-query.ts` — the single database entry point. |
| `src/data/` | Hand-written reference data with provenance recorded in the file. |
| `src/db/` | Drizzle schema definitions. `schema.ts` is hand-maintained for app-owned tables; `introspected/` is a generated snapshot. See `src/db/README.md`. |
| `drizzle/` | Numbered SQL migrations, applied one file at a time. |
| `ingest/` | TypeScript ingestion, seeding, scraping, and verification scripts. |
| `ingest/legacy/python/` | Legacy Python ETL, retained for transition. Not used by the app. |
| `docs/` | Data-source inventory, storage strategy, audit and roadmap. |
| `research/`, `reports/` | Committed research corpora and published report assets. See `docs/data-storage.md` for what may be committed. |
| `e2e/` | Playwright smoke suite. |
| `public/` | Static assets served at the site root. |
| `runtime-data/` | App-local downloads, scrape caches, and the contact-form local fallback. Gitignored, so it does **not** exist in a fresh clone; scripts create it. |

## Database access

Every runtime query goes through `src/lib/db-query.ts`, which exports a
`postgres` client used with tagged templates. There is no ORM layer at
runtime: `drizzle-orm` is imported only by the files under `src/db/`, which
exist so `drizzle-kit` can generate migrations and an introspected snapshot.
See the README section in `README.md` and `src/db/README.md`.

With no `DATABASE_URL`, every query rejects immediately and the dashboard
routes report `dataStatus: "unavailable"`. Pages still render; they say the
data is missing rather than showing numbers that are not there.

## Where new work goes

New ingestion work goes in `ingest/`. Treat `ingest/legacy/python/` as legacy
unless a task explicitly requires it.
