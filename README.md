# Portland Civic Lab

Public dashboards, civic data, and participation tools for Portland, Oregon —
live at **[portlandciviclab.org](https://www.portlandciviclab.org)**.

Every number links to its public source. Every method is documented. The
code is open source (AGPL-3.0; the writing and curated data are CC BY-ND and CC BY, see `LICENSE-CONTENT.md`), and members decide what gets built next.

## What's here

- **Dashboards** (`/dashboard`) — ten topics (housing, safety, homelessness,
  climate, fiscal, economy, education, …) with live data pipelines, honest
  freshness labels, CSV export, and embeds
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

Without `DATABASE_URL` the app runs in mock-data mode — fine for UI work.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the repo map, data ground rules,
and how to pick up an issue.

## Stack

- **App**: Next.js 15 (App Router) + TypeScript + Tailwind v4 + Recharts
- **Database**: Supabase Postgres (+ PostGIS); Drizzle schema in `src/db/`
  (`schema.ts` = app-owned tables, `introspected/` = full 177-table snapshot)
- **Data pipelines**: TypeScript scripts in `ingest/`, scheduled as Vercel
  crons (`vercel.json`); legacy Python in `ingest/legacy/python/`
- **Auth**: WorkOS AuthKit
- **Hosting**: Vercel (auto-deploys from `main`)
- **CI**: typecheck, lint, build, Playwright smoke tests (`npm test`)

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm test           # Playwright smoke suite (builds first: npm run build)
npx tsc --noEmit   # typecheck
npm run lint       # lint

# apply a SQL migration (idempotent files in drizzle/)
npx tsx ingest/apply-migration.ts drizzle/0006_topic_proposals.sql
```

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
