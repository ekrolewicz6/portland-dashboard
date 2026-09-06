# Data Storage Strategy

**Last updated:** September 6, 2026

## Where data lives

| Location | Role | In git? |
|----------|------|---------|
| **Postgres** (Supabase) | Authoritative store. All dashboard reads go through it (with a `dashboard_cache` layer). Cron routes and ingest scripts write here. | No (schema in `src/db/schema.ts` + `drizzle/` migrations) |
| **`runtime-data/`** | Local working directory (multi-GB): downloaded source files (Zillow CSVs, ODE XLSX, HUD XLSB), scrape caches, JSON snapshots used by seed scripts, and the contact-form local fallback. | **No — gitignored.** Never commit this. |
| **`research/`** | Research corpora for the deep dives: provenance-tagged CSV extracts, working notes, checksums. Deliberately committed — see the exception below. | Yes, ~19 MB |
| **`reports/`** | Published report artifacts (the libraries deep dive: 1 PDF, 1 DOCX, 75 page-render PNGs). Committed; not served at runtime. | Yes, ~23 MB |
| **`data/`, `etl/`, `scripts/`** | Local convenience **symlinks** only: `data → runtime-data`, `etl → ingest/legacy/python`, `scripts → ingest`. They exist so old commands and muscle memory keep working. | No — gitignored |
| **`ingest/`** | TypeScript ingest/seed/sync scripts (the real ones). Python legacy lives in `ingest/legacy/python`. | Yes |

## Rules

1. **Working data is never committed.** Anything a script downloads, scrapes,
   or caches belongs in `runtime-data/`, and the script's header comment
   should say where to get it. This is the rule that matters: source files,
   scrape output, and intermediate dumps stay out of git.

2. **Exception: research provenance.** A deep dive's *evidence* may be
   committed, under `research/<topic>/`, when all of the following hold:
   - Every row carries provenance (for the PPS corpus: `fy, basis, doc_id,
     page`), so any figure in a published piece traces back to a document and
     a page number.
   - The underlying PDFs and text layers stay in `runtime-data/` (multi-GB);
     only the extracts are committed, with checksums pinning what they were
     extracted from (`ingest/pps-budget/checksums.lock.json`).
   - Derived series are reproducible from committed inputs by a committed
     script.

   `research/pps-budget/README.md` documents this arrangement and its house
   rules. It is the model for any future corpus.

3. **Published report artifacts may be committed** under `reports/<slug>/`.
   These are outputs, not inputs. They are not served by the app — nothing
   under `reports/` is in `public/`, and `.vercelignore` excludes the whole
   directory from deploys.

### Where the line falls

Commit it if it is **evidence for a published claim** or **a published
artifact**, it is small, and it traces to a source. Do not commit it if it is
**an input a script can fetch again**, if it is large, or if it has no
provenance. When in doubt: `runtime-data/`.

The current tracked footprint is about 42 MB across `research/` and
`reports/` — 168 CSVs, 5 PDFs, 4 XLSX, 1 DOCX, and 85 raster images. That is
the practice this document is describing; it is not licence to grow it. Every
addition should be justifiable under rule 2 or 3 above.

## Other rules

4. **Postgres is the source of truth** for everything the site renders.
   `runtime-data/` snapshots are inputs and caches, not a database.
5. **New ingest code goes in `ingest/`** (TypeScript). Don't add to the
   legacy Python tree.
6. **Fresh clones won't have the symlinks** (they're gitignored), and won't
   have `runtime-data/` either. If you want the symlinks:
   `ln -s runtime-data data && ln -s ingest scripts`.

## History of the migration (April 2026)

The repo originally committed raw data files (PDFs, XLSX, CSVs, scraped
permit JSON) under `data/`, with Python ETL under `etl/` and helper scripts
under `scripts/`. In April 2026 those directories were physically moved
(`data/` → `runtime-data/`, `etl/` → `ingest/legacy/python`,
`scripts/` → `ingest`) and replaced with symlinks; the old tracked paths were
then removed from git, untracking roughly 500 MB of binaries. Those files
remain in git history unless the history is rewritten.
