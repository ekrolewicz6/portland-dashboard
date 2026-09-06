# Portland Civic Lab

Public dashboards, civic data, and participation tools for Portland, Oregon —
live at **[portlandciviclab.org](https://www.portlandciviclab.org)**.

Every number links to its public source. Every method is documented. The
code is open source (AGPL-3.0; the writing and curated data are CC BY-ND and CC BY, see `LICENSE-CONTENT.md`), and members decide what gets built next.

## What's here

- **Dashboards** (`/dashboard`) — eleven topics (housing, safety,
  homelessness, climate, fiscal, economy, education, …) with live data
  pipelines, honest freshness labels, CSV export, and embeds. `src/lib/questions.ts`
  lists twelve slugs; `environment` is a legacy slug that redirects to
  `/dashboard/climate`.
- **Participation** — flag suspect numbers on any chart (`/api/data-flags`),
  propose and vote on new topics (`/proposals`), track our public records
  requests (`/records`)
- **Membership** — WorkOS AuthKit sign-in, member area (`/member`)
- **Open data** (`/open-data`) — free JSON + CSV endpoints, no key required

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev
```

There is no mock-data mode. Without `DATABASE_URL` every query fails fast,
and the dashboards render with `dataStatus: "unavailable"` — the pages work,
they just say the data is missing. That is fine for UI, layout, and docs
work. For anything data-shaped you need a real database.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the repo map, data ground rules,
and how to pick up an issue.

## Stack

- **App**: Next.js 15 (App Router) + TypeScript + Tailwind v4 + Recharts
- **Database**: Supabase Postgres. Routes query it with raw `postgres` tagged
  templates through `src/lib/db-query.ts`; there is no ORM at runtime.
  Drizzle survives as schema definitions only, consumed by `drizzle-kit`:
  `src/db/schema.ts` (hand-maintained, app-owned tables) and
  `src/db/introspected/` (a generated 176-table snapshot). Nothing in the app
  or the schema uses PostGIS.
- **Data pipelines**: TypeScript scripts in `ingest/`, scheduled as Vercel
  crons (`vercel.json`); legacy Python in `ingest/legacy/python/`
- **Auth**: WorkOS AuthKit
- **Hosting**: Vercel (auto-deploys from `main`)
- **CI**: app typecheck, ingest typecheck, lint, build, Playwright smoke
  tests against a Postgres service container (`.github/workflows/ci.yml`)

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm test           # Playwright smoke suite against `next start`; run
                   # `npm run build` yourself first
npx tsc --noEmit   # typecheck the app
npx tsc -p ingest --noEmit   # typecheck the ingest scripts
npm run lint       # eslint .

# apply one SQL migration
npx tsx ingest/apply-migration.ts drizzle/0006_topic_proposals.sql
npm run db:migrate -- drizzle/0006_topic_proposals.sql   # same script
```

`db:push` was removed. It diffed the partial `src/db/schema.ts` against the
live database and offered to drop every table the schema did not declare,
which is most of them.

### Migrations are not a runnable sequence

`drizzle/` is a folder of numbered SQL files, not a migration history you can
replay. Applying them in order to an empty database fails:

- `0000_fine_dorian_gray.sql` has a bare `CREATE SCHEMA` and 31 bare
  `CREATE TABLE` statements, so re-running it errors.
- `0002_boec_20sec.sql` alters `safety.boec_911_monthly`, which no migration
  creates.

`0001` onward are otherwise written with `IF NOT EXISTS` and are safe to
re-run individually, which is how they are applied in practice — one file at
a time against a database that already exists. `ingest/ci-seed.ts` builds the
CI database by running the files statement-by-statement and tolerating the
failures above, then creating the fixture tables the smoke tests need. Nobody
currently has a documented way to build the full production schema from this
directory alone.

## Key documents

- [docs/AUDIT_AND_ROADMAP.md](docs/AUDIT_AND_ROADMAP.md) — full audit and
  the institutional roadmap (where this project is going)
- [docs/data-source-inventory.md](docs/data-source-inventory.md) — every
  data source and its status
- [docs/data-storage.md](docs/data-storage.md) — where data lives and why
- [KNOWN_ISSUES.md](KNOWN_ISSUES.md) — data gotchas; read before touching
  data code

## About

Operated by Portland Civic Lab LLC, an independent civic technology
organization. Not affiliated with the City of Portland. See
[/privacy](https://www.portlandciviclab.org/privacy) and
[/terms](https://www.portlandciviclab.org/terms).
