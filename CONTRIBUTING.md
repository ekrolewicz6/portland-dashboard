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

Without a `DATABASE_URL`, the app runs in mock-data mode — fine for UI work.
For data work you'll need a local Postgres (with PostGIS) and to run the
migrations in `drizzle/` (e.g. `npx tsx ingest/apply-migration.ts drizzle/0003_members.sql`).

## Repo map

| Path | What it is |
|------|------------|
| `src/app/(public)/` | Public pages (dashboards, methodology, contact, …) |
| `src/app/api/dashboard/` | One JSON endpoint per dashboard topic |
| `src/app/api/cron/` | Scheduled sync jobs (Vercel cron; require `CRON_SECRET`) |
| `src/components/dashboard/` | Per-topic detail components |
| `src/db/schema.ts` + `drizzle/` | Database schema and migrations |
| `ingest/` | Data ingestion / seed / sync scripts (TypeScript) |
| `docs/` | Data source inventory, storage strategy, audit & roadmap |

## What's open to contribution, and what isn't

- **Code, data pipelines, design, and accessibility fixes:** yes, by pull
  request. The tools are the shared part of this project.
- **Corrections to any figure or claim:** yes, by issue. Say which page, what
  the number is now, what it should be, and the public source. Corrections
  are logged in public.
- **Deep-dives, memos, and editorial copy:** written by the Lab. We don't
  accept pull requests that add or rewrite editorial content, and editorial
  decisions aren't put to a vote. If you have a topic in mind, propose it at
  https://www.portlandciviclab.org/proposals or pick one at
  https://www.portlandciviclab.org/about#topics and tell us what you can do.

The code is AGPL-3.0. The writing and curated data have their own terms; see
`LICENSE-CONTENT.md`.

## Ground rules

1. **Never present estimated or mock data as real.** Every chart cites its
   source. If data is unavailable, say so. Read `KNOWN_ISSUES.md` before
   touching data code — it documents real gotchas (corrupt permit dates,
   crime grid undercounting, survivorship bias) that will bite you.
2. **Never commit data files.** Working data lives in `runtime-data/`
   (gitignored) or Postgres. See `docs/data-storage.md`.
3. **No secrets in code.** Configuration comes from environment variables;
   `.env.example` documents them all.
4. **Match the existing style.** TypeScript strict mode, no new `any`/
   `as unknown` casts where a real type is feasible.

## Before you open a PR

```bash
npx tsc --noEmit   # typecheck
npm run lint       # lint
npm run build      # production build
```

CI runs the same three checks on every PR.

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
