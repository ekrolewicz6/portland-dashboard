# Codebase Audit — September 2026

Read-only review of the whole repository at commit `61fc87f` (branch
`claude/codebase-audit-m6lg6n`). Every finding below was confirmed by reading
the cited file and line; nothing is inferred from names or docs alone.

> **Status: findings addressed.** Everything below has been fixed except the
> items listed under "Deliberately not done" at the end of this document. Line
> numbers and file paths describe the code **as audited**, not as it now
> stands: several of the cited files have been deleted and others substantially
> rewritten. Read this document as the record of what was wrong and why, and
> `git log` for what was done about it.

Scope: `src/` (app, API routes, cron, components, libs, db), `ingest/`,
`drizzle/`, `e2e/`, `docs/`, root config and docs, `package.json`
dependencies, git history.

## 1. Headline

The code compiles, lints, and builds cleanly, and the security fundamentals
that matter most (parameterized SQL, fail-closed cron auth, HMAC on the
internal account API, zod on public forms, redirect-based admin gating) are
in place. The serious problems are in a different place than a typical audit
would find them:

1. **The site's own honesty rule is being broken in several places.** Mock
   and hard-coded numbers are served as live data through public APIs, a
   dashboard, a cron job that stamps promises "verified" unconditionally, and
   a progress-report renderer that invents fallback values.
2. **Several documented workflows do not exist.** There is no mock-data
   mode, migrations are not idempotent, the Drizzle client is dead code, and
   the pre-push verification hook only works on one machine and currently
   breaks Claude Code for everyone else.
3. **Business claiming and invites are open to any signed-in member**, and a
   public form accepts PII into process memory and discards it.
4. **Dependencies are behind on security patches**, including Next.js
   middleware-bypass advisories that matter because `/admin` and `/member`
   are gated by middleware.

## 2. Toolchain results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | clean (`next lint` is deprecated; migrate to the ESLint CLI before Next 16) |
| `npm run build` | passes; 115 pages; warnings only from `@workos-inc/node` under the edge runtime |
| `npm audit --omit=dev` | 10 vulnerabilities (8 high, 2 moderate) |
| Largest first-load JS | `/dashboard/[question]` 315 kB, deep-dives 220-230 kB |

`npm audit` highlights: `next` 15.5.12 (fixed in 15.5.25 within the current
semver range; includes two middleware/proxy bypass advisories,
GHSA-492v-c6pp-mqqv and GHSA-267c-6grr-h53f), `drizzle-orm` < 0.45.2 (SQL
identifier escaping), `nodemailer` 7 (SMTP command injection; fix is major
version 9), `xlsx` 0.18.5 (no fix on npm; see M-14), `sharp`, `postcss`,
`lodash`, `nanoid`, `valibot`, `protocol-buffers-schema` (all fixed by
`npm audit fix`).

## 3. Critical and High findings

### Data honesty

**C-1. Mock data served as public "open data" with CDN caching.**
`src/app/api/public/metrics/route.ts:2-9` imports `migrationData`,
`businessData`, `downtownData`, `safetyData`, `taxData`, `housingData`,
`programData` from `src/lib/mock-data.ts` (whose header declares it
demonstration data, and whose series are generated with `Math.random()` at
lines 80-94, 131, 263-312) and returns them with `Cache-Control: public,
s-maxage=300` and no mock flag. `src/app/api/export/[question]/route.ts:4-27`
does the same as a CSV download named `portland-civic-{question}-{today}.csv`,
and accepts real question slugs, so `/api/export/housing` yields fake permit
counts. Neither route is referenced by the UI; the UI uses
`/api/dashboard/[question]/export`. Fix: delete both routes.

**C-2. Hard-coded shelter utilization presented as live.**
`src/components/dashboard/homelessness/HomelessnessDetail.tsx:659` and `:669`
render literal `50%` and `87%` in 36 px "big number" cards beside bed counts
that are fetched. The same file substitutes constants when the API returns
empty arrays: `?? 1566` beds (line 295, rendered at 339 and 662), `?? "21,500"`
and `"21,122"` students (907-910), under a PSU HRAC source citation. Fix:
derive from `latestShelter.utilizationPct` (already used at line 340) or
render `DataNeeded`; never coalesce to a displayable number.

**C-3. Promise-verification cron writes verdicts that are not computed.**
`src/app/api/cron/verify-promises/route.ts:110-118` sets promise
`WILSON-SOTC-2026-S7` to `verified` with the note "Sustained decline
confirmed." regardless of the homicide series it just queried; lines 146-155
set H3 to `partially_verified` regardless of the computed decline. Both are
stamped `verified_by = 'auto:...'`. Lines 45-46 also freeze the crime window
at 2026-01-01 to 2026-04-15 while the note says "YTD", so the numbers never
move but `updated_at` is refreshed daily. Lines 160-161 average
`processing_days` by `issued_date`, the survivorship bias `KNOWN_ISSUES.md`
warns about, on a field the same doc says is barely populated. Fix: derive
every status from the computed values (as `verifyCrime` does), compute
windows from `CURRENT_DATE`, and cohort permits by application date.

**C-4. Progress-report climate card invents numbers.**
`src/components/progress-report/ArticleRenderer.tsx:519-538` falls back to
`?? 2023`, `?? 7.7`, `?? 26`, `?? 5.2`, `?? 2.5` when a section's
`dataSnapshot` lacks a field, printing them as fact. Lines 337-359 skip `0`
values but not truthy defaults. Fix: render the callout only when the field
is present.

**H-1. Static, partly synthetic climate figures served with `dataStatus:
"live"`.** `src/app/api/dashboard/environment/emissions/route.ts:7-66` uses a
constant sector ratio for every year (transport/total = 0.380 in 1990, 2005
and 2023) and a smooth synthetic renewable series;
`environment/finance/route.ts:8-60`, `environment/workplan/route.ts`, and
`environment/bureaus/route.ts:5-78` are static arrays. The DB-backed
`/api/dashboard/climate/*` family covers the same subjects, and
`src/components/dashboard/climate/ClimateDetail.tsx:131-153` renders both
families on the same tabs, so visitors see two different sets of climate
numbers. Fix: delete `environment/{emissions,finance,workplan,bureaus}` and
the `environment/*` components; keep `environment/detail` (AQI).

**H-2. Hard-coded fallbacks when tables are empty.**
`climate/workplan/route.ts:110-120` (`total || 43`, `achieved || 6`, fixed
percentages, `lastUpdated: "2025-08-01"`), `climate/finance/route.ts:115-117`
(`|| 740000000` etc.), `climate/emissions/route.ts:95-97`,
`climate/route.ts:55-88`. An empty table yields a confident summary. Fix:
return `dataStatus: "unavailable"` with nulls, as `homelessness/route.ts`
does.

**H-3. Tax dashboard reads from the mock file.**
`src/app/api/dashboard/tax/route.ts:2-13` (and `fiscal/route.ts`, a
re-export) returns `taxData` from `src/lib/mock-data.ts` with
`dataStatus: "live"`. The comment claims the numbers are real, but they have
no `source` or `lastVerified` and sit beside fabricated series. Fix: move
`taxData` to `src/data/` with provenance fields; delete `mock-data.ts`.

**H-4. The data-status badge pipeline is dead, so partially-live topics look
fully live.** `src/app/(public)/dashboard/DashboardClient.tsx` is imported
nowhere; it is the only consumer of `HeadlineCard`, which is the only
consumer of `DataSourceBadge`. The live hub
(`src/app/(public)/dashboard/page.tsx:135-195`) never renders
`QUESTION_DATA_STATUS`, although `src/data/source-status.ts` marks housing,
homelessness, education, economy and quality as `LIVE_PARTIAL`. Fix: render
the badge in the hub card; delete `DashboardClient.tsx`.

**H-5. Trend pill colour ignores question polarity.**
`src/app/(public)/dashboard/[question]/page.tsx:166-172` and
`dashboard/embed/[question]/page.tsx:74-79` colour every "up" green and every
"down" red, so rising homelessness shows a green pill. `getTrendColor` with
`INVERTED_QUESTIONS` exists in `src/lib/utils.ts:1319-1345` and is imported
by nothing.

**H-6. Random-data seed scripts write to tables the app labels as real.**
`ingest/seed-historical-data.ts:37,177,556` generates values with
`Math.random()` and writes `housing_rents`, `safety_crime_monthly`,
`downtown_*`, `migration_*`; `housing_rents` is read by
`src/app/api/dashboard/housing/route.ts:251` as "Median Rent (ZORI)" with no
source filter. `npm run seed` (`ingest/seed-real-data.ts:523`) truncates the
incrementally-synced `housing.permits`, and lines 573-579 count crime grid
cells as crimes, the exact mistake `KNOWN_ISSUES.md` documents. Fix: delete
or quarantine the fabricated-data seeders; add a `source` column to
`housing_rents`.

### Security and authorization

**H-7. Any signed-in member can claim any unclaimed business.**
`src/lib/business.ts:283-299` `claimBusiness` is first-come-first-served
with no ownership check and no undo; the server actions in
`src/app/member/page.tsx:55-67` and
`src/app/member/business/claim/[slug]/page.tsx` do not re-check
`BUSINESS_CLAIM_EMAILS` (the env gate only hides the card). Slugs are
`slugify(name)`. Before claiming, the claim page already shows the
pre-researched funding matches for that business to any member. Fix: enforce
the email allowlist (or a per-business `claim_email`) inside
`claimBusiness`; show matches only after claim.

**H-8. Invite acceptance is not bound to the invited email; the invite
action is an open mail relay.** `src/lib/business.ts:392-409` never compares
`invite.email` to the accepting member; the invite handler in
`src/app/member/business/[slug]/page.tsx` validates email with
`includes("@")`, has no rate limit, embeds the member-controlled business
name in subject and body, and builds the link from the `Host` header. Fix:
compare emails case-insensitively; validate with zod; rate limit per member;
build links from `NEXT_PUBLIC_APP_URL`.

**H-9. PCB applications with PII are accepted, acknowledged, and discarded.**
`src/app/api/pcb/apply/route.ts:40-45` stores submissions in a module-level
array; each Lambda has its own and loses it on recycle. The response promises
a reply within five business days. No rate limit, no max lengths. Fix:
persist like `contact_submissions` (`drizzle/0007`) or disable the form.

**H-10. Unpublished progress reports are public.**
`src/app/api/progress-report/route.ts:18-19,45` flips to all rows on
`?drafts=true` with no auth; `[slug]/route.ts:127-131` has no `published`
filter at all.

**H-11. Next.js and other dependencies need patching.** See section 2.
`next` should move to 15.5.25 now (`npm update next` stays in range);
`drizzle-orm`, `sharp`, `postcss`, `lodash`, `nanoid` via `npm audit fix`;
`nodemailer` to 9.x; `xlsx` per M-14.

### Project hygiene

**H-12. `.claude/settings.json` breaks Claude Code for every other
contributor.** Lines 9-10 run
`cd /Users/edankrolewicz/Code/Active/portland/dashboard && ... npx tsx
scripts/verify-api-queries.ts`. The path is personal, `scripts/` exists only
as a gitignored symlink (the file is `ingest/verify-api-queries.ts`), and
the `if: "Bash(git push *)"` filter is not honoured: during this audit the
hook fired on ordinary `cat`/`for`/`npm` commands and aborted them. Both
`CHANGELOG.md:327` and `docs/AUDIT_AND_ROADMAP.md:88` say this check runs
before every push; for anyone but the author it never has. Fix: move to
`.claude/settings.local.json`, or use `"$CLAUDE_PROJECT_DIR"` and the real
path, or make it a git `pre-push` hook.

**H-13. The documented mock-data mode does not exist.** `README.md:28`,
`CONTRIBUTING.md:17`, `playwright.config.ts:4-6` all promise it.
`src/lib/db.ts:10` exports `USE_MOCK` but no file imports `@/lib/db`;
`src/lib/db-query.ts:3-5` instead falls back to
`postgresql://edankrolewicz@localhost:5432/portland_dashboard`, so without
`DATABASE_URL` every route waits up to `connect_timeout: 10` seconds and
returns `unavailable`. CI runs in exactly this state (M-15).

**H-14. Migration tooling is internally inconsistent and `db:push` can drop
tables.** `drizzle/meta/_journal.json` lists only `0000`; migrations
`0001`-`0010` are hand-written and unjournaled. Eight `metro_*` tables in
`src/db/schema.ts:255-340` have no migration and no primary key while the
live DB has composite PKs; four migration-created tables
(`account_identities`, `business_members`, `contact_submissions`,
`proposal_votes`) and `members.account_public_id` are absent from
`schema.ts`. `drizzle.config.ts` has no `tablesFilter`, so `npm run db:push`
(and `src/db/migrate.ts`) diffs the live `public` schema against this partial
declaration and proposes `DROP TABLE` for `zillow_metrics`,
`census_demographics`, `fred_series` and the four above. `drizzle/0000` has
31 bare `CREATE TABLE`s and `0002` alters a table no migration creates, so
the README's "idempotent" and CONTRIBUTING's apply-in-order instructions both
fail. Fix: pick one source of truth (simplest: drop `drizzle/meta/`, treat
`drizzle/*.sql` as ordered SQL with a `schema_migrations` table, add
`IF NOT EXISTS` to 0000, guard 0002); delete `db:push` and `migrate.ts`.

**H-15. Third-party API key committed.** `ingest/scrape-permit-details.ts:26`
hard-codes a Portland Maps key with no env override; `-v2.ts:34` and
`-bulk.ts:27` use it as a fallback; `docs/data-source-inventory.md:896`
repeats it. It was lifted from the City's public JS rather than issued to
Civic Lab, so it is not a leaked credential, but it violates CONTRIBUTING
rule 3 and is what a City complaint would cite. Require
`PORTLAND_MAPS_API_KEY`; delete the literal everywhere.

## 4. Medium findings

**M-1. No Stripe webhook; donations are never recorded.** No file calls
`constructEvent`. `src/app/(public)/donate/thank-you/page.tsx:10-45` says
"Support received" to anyone who visits. `stripe.checkout.sessions.create`
(`donate/checkout/route.ts:542-571`) is not wrapped in try/catch and has no
rate limit. `STRIPE_WEBHOOK_SECRET` is documented but unused.

**M-2. Internal account-resolve fails open on `emailVerified`.**
`src/lib/membership.ts:169` refuses relink only when `emailVerified ===
false`; `internal/accounts/resolve/route.ts:168-174` forwards `undefined`.
A partner app that omits the field can relink an existing member, including
an admin, by email alone. Require `=== true` and reject non-boolean bodies.

**M-3. Concierge accepts client-fabricated assistant turns.**
`src/app/api/concierge/chat/route.ts:22-32` allows `role: "assistant"` in
the request and does not check that the first message is a user turn; the
model id is hard-coded (`claude-sonnet-4-20250514`); a manual
`Transfer-Encoding: chunked` header is set on a streamed response (line 168).
The public `/concierge` page is linked from the footer and sitemap but
answers with a canned "demo mode" notice when `ANTHROPIC_API_KEY` is unset.

**M-4. Unbounded exports and third-party fan-out with no rate limit.**
`src/app/api/dashboard/[question]/export/route.ts:73-192` runs `SELECT *`
with no LIMIT on several tables and builds the CSV in memory;
`api/performance/export/route.ts:158-166` can trigger a full live ClearImpact
scrape when the cache is cold (no `maxDuration`); `api/growth-politics/parcel`
does 3-5 upstream calls per request and echoes upstream error text;
`api/directory/route.ts:45-49` inserts user words unescaped into a Postgres
regex (`search=(` gives a 500, `.*` forces a regex scan over 362k rows).
`checkRateLimit` is used by only six routes and is per-instance memory.

**M-5. Cache-key pollution.** `accountability/promises/route.ts:80-92,172`
writes one `dashboard_cache` row per distinct `category`/`status` query
string, each carrying the full payload.

**M-6. `data-flags` rejects the environment page.**
`src/app/api/data-flags/route.ts:223-235` keeps its own topic list, which
omits `environment`, while `[question]/page.tsx:191` renders the flag button
for every slug in `src/lib/questions.ts`; the user sees a misleading
length-validation error.

**M-7. No security headers.** There is no `headers()` in `next.config.ts`
and no CSP, `X-Frame-Options`, or `frame-ancestors` anywhere, so `/admin`
and `/member` are frameable. The embed route needs framing; everything else
should deny it.

**M-8. `refresh-data` truncates `housing_rents` outside a transaction.**
`src/app/api/cron/refresh-data/route.ts:400-413`: `TRUNCATE` then row-by-row
inserts with per-row `catch {}`. A failure or the 300 s deadline leaves the
table empty; the cache is only cleared when `inserted > 0`, so the chart
serves stale data for an hour and then blanks. The same path is scheduled
twice in `vercel.json` and disambiguated by an `x-vercel-cron-schedule`
header whose existence is unverified (`route.ts:1002-1003`).

**M-9. `sync-permits` cannot see status changes.** Both
`src/app/api/cron/sync-permits/route.ts:252-254` and `ingest/sync-permits.ts`
refresh recent permits by `INTAKECOMPLETEDATE`, which `KNOWN_ISSUES.md` says
has two populated rows since 2025; new rows arrive only by `OBJECTID > max`,
which the same doc says is not chronological. `sync-campsites` likewise
fetches only `OBJECTID > max`, so its `DO UPDATE` branch and `is_duplicate`
never refresh, which feeds C-3's H3 verdict.

**M-10. Cron routes return 200 on failure.** `sync-aqi:170-176`,
`refresh-data:1197-1199`, `sync-permits:277-295`, `sync-crime:159-166`,
`refresh-housing-matviews:57-62` all return HTTP 200 with `ok:false` or
swallowed errors, so Vercel never flags a broken job. `sync-permits`,
`sync-campsites`, `sync-crime` fetch with no `AbortSignal`.
`sync-performance` is never scheduled and its reader has no TTL.

**M-11. `sync-crime` route re-implements the ingest parser by column index**
(`route.ts:72-96`), without escaped-quote handling or a year sanity bound,
stores `occur_time` in a different format than `ingest/sync-crime.ts`, and
relies on a unique constraint only the ingest script creates.

**M-12. Two Postgres clients; the Drizzle one is dead.** `src/db/index.ts`
(`process.env.DATABASE_URL!`, non-serverless pool) is imported only by
`src/lib/db.ts`, which nothing imports. `src/db/introspected/*` is imported
by nobody. `drizzle-orm` has zero runtime use. The live client in
`src/lib/db-query.ts:71-97` recycles every 30 s and force-closes the old one
after 5 s, which can abort a running `REFRESH MATERIALIZED VIEW CONCURRENTLY`
in the matview cron.

**M-13. DDL in request handlers; single superuser-equivalent role; no RLS.**
`fetch-auditor-news/route.ts:231`, `sync-aqi/route.ts:112`,
`src/lib/performance/store.ts:23-91` create schemas and tables at runtime.
No `GRANT`, `REVOKE`, or policy anywhere; public read routes, member writes
and cron share one owner role. Missing indexes on `safety.ppb_offenses
(occur_date)`, `housing.permits (issued_date)`, `housing.permits
(lower(status))`, all hot filter columns.

**M-14. Dependency hygiene.** Unused: `pg`, `@types/pg`, `mapbox-gl`,
`@types/mapbox-gl`, `react-hook-form`, `date-fns`; `playwright` duplicates
`@playwright/test`; `@types/leaflet` is in `dependencies`; `xlsx` 0.18.5 is
ingest-only but in `dependencies` and has unfixable advisories on npm (use
the SheetJS CDN tarball or `exceljs`, and move to devDependencies).

**M-15. CI cannot catch a broken dashboard.** With no `DATABASE_URL`, every
dashboard API returns `unavailable`; the only dashboard smoke assertion
(`e2e/smoke.spec.ts:20-26`) checks a static h1 and a "Data Source" label the
page renders unconditionally. 10 of 62 pages and 4 of 87 API routes are
covered; zero cron, member, export or embed tests. `tsconfig.json:22`
excludes `ingest/`, so ~100 scripts the crons depend on are never
type-checked (`ingest/tsconfig.json` is inert).

**M-16. "Hidden" modules are reachable and indexed.** `TODO.md` says
Concierge, Directory, Spaces, Reports and Calculator are hidden, but
`src/components/layout/Footer.tsx:35-47` links them, `sitemap.ts` lists
`/directory`, `/concierge`, `/apply`, `/calculator`, and the homepage links
`/dashboard/performance`, which `dashboard/page.tsx:109-111` calls hidden.
Only `/spaces`, `/progress-report` and embeds are `noindex`. The sitemap also
omits the live `/dashboard/economic-health`.

**M-17. Frontend data handling.** Every `*Detail.tsx` (650-1,316 lines) is a
`"use client"` component that fetches its detail endpoint in `useEffect`
with no abort or unmounted guard (22 components), so rapid navigation can
overwrite newer state with stale responses. Fetched JSON is unvalidated with
`any` casts and 19 non-null assertions in `EconomyDetail.tsx`. Whole pages
(`apply`, `calculator`, `spaces/[listingId]`, `directory`) are client
components. `OrgChartExplorer` ships the 1,087-line `org-structure` and
1,257-line `org-personnel` datasets to the browser.

**M-18. Accessibility.** `FlagDataButton.tsx:448-456` modal has no
`role="dialog"`, focus trap or Escape handling; icon-only pagination and
close buttons in `directory/page.tsx:181-218`, `EmbedButton.tsx:330-335` have
no `aria-label`; none of the nine chart components has any `aria-*`, `role`
or `<title>`; tabs in `ClimateDetail.tsx:106-121` and `ui/Tabs.tsx` lack
tablist semantics; `apply` and `calculator` forms have 21 `<label>`s with no
`htmlFor`; several 10-12 px texts at `/35`-`/50` opacity fail AA contrast.

**M-19. Hydration and freshness.**
`PerformanceDashboardClient.tsx:368` renders `toLocaleString()` in SSR
output; `[question]/page.tsx:284` prints render time as "Last Checked" when
no data exists; 19 dashboard routes set `lastUpdated` to today at compute
time and cache it for an hour; the Rose Quarter countdown
(`ExperimentTracker.tsx:23-25`) is frozen at build because the page has no
`revalidate`.

**M-20. `globals.css:57-133`** overrides every `text-[NNpx]` class up to 19
px with `!important` via a `[class*=...]` substring selector that also
matches responsive variants; line 52 uses a non-existent `min-font-size`
property.

**M-21. 42 MB of committed data and binaries** despite "never commit data
files": 168 CSV, 5 PDF, 4 XLSX, 1 DOCX, 85 images. `reports/portland-libraries-2026/`
has three near-duplicate 25-page PNG render sets;
`research/pps-budget/data/benchmarks-raw/elsec24.xlsx` is 12.3 MB.
`.vercelignore` excludes neither directory, so it uploads on every deploy.

## 5. Low findings

- `src/lib/cron-auth.ts:19` compares the bearer token with `===`; use
  `timingSafeEqual`.
- `src/lib/rate-limit.ts:54-58` trusts the first `x-forwarded-for` entry;
  fine on Vercel, bypassable elsewhere, and all limits are per-instance.
- `src/lib/dashboard-data.ts:18-23` and `donate/checkout/route.ts:495-501`
  build self-fetch and Stripe `success_url` from the `Host` header when
  `NEXT_PUBLIC_APP_URL` is unset.
- `api/performance/_internal.ts:40` falls back to `CRON_SECRET` as the API
  token; `error.message` is echoed in four performance routes.
- `real-estate/listings/route.ts:560-563` passes `NaN` ids to SQL;
  `:693-699` returns HTTP 200 with "please run the seed script" on DB
  failure; `:722` publishes `contact_email` for every listing. Similar
  developer-facing error strings in `education/route.ts:183` and
  `migration/route.ts:36-49`.
- `proposals/route.ts:375` exposes proposer first names publicly;
  `data-flags` GET publishes anonymous free-text immediately.
- `admin/users` last-admin guard is not transactional; `ADMIN_EMAILS`
  re-promotes a demoted admin on next sign-in (documented, but not surfaced
  in the UI).
- `NewsContext.tsx:793,829` renders `href` straight from the DB; restrict to
  `http(s)`.
- 36 files (`src/lib/db-query.ts:5`, `drizzle.config.ts:8`, 33 ingest
  scripts) fall back to the author's personal local DB URL; seven ingest
  scripts wired to npm scripts have no env override at all.
- `ingest/build-org-finance.py:2` and `build-org-personnel.py:3` read from
  `/private/tmp/claude-501/...` and `/Users/edankrolewicz/Downloads/...`, so
  `src/data/org-analysis.ts` and `org-personnel.ts` are not reproducible.
- `.gitignore:68` `.env*` also matches the tracked `.env.example`;
  `test-results/.last-run.json` is tracked despite `/test-results/`.
- `.env.example` is missing 12 variables the code reads (`AIRNOW_API_KEY`,
  `PERFORMANCE_API_TOKEN`, `PORTLAND_MAPS_API_KEY`, `BEA_API_KEY`,
  `HUD_API_TOKEN`, `CONTACT_STORE_FALLBACK`, `CONTACT_FALLBACK_DIR`,
  `PBJ_INPUT_DIR`, `PERMIT_DETAIL_CONCURRENT`, `PERMIT_DETAIL_DELAY_MS`,
  plus platform `VERCEL`/`CI`) and documents 10 that nothing reads
  (`DATABASE_URL_UNPOOLED`, both Stripe publishable keys,
  `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `TRIMET_APP_ID`,
  `BLS_API_KEY`, `PLACER_API_KEY`, `PULSE_FROM_EMAIL`, `PULSE_REPLY_TO`).
- `dashboard_cache.updated_at` is `timestamp` without time zone compared
  against JS `Date.now()`; TTL is read-side only, so rows never expire.
- `layout.tsx:109-114` preconnects to Google Fonts while `next/font`
  self-hosts; `Header.tsx` and `SsoLink.tsx` both call `/api/member/me` on
  every page for anonymous visitors.
- Copy drift: root metadata says "Eight questions", the hub renders ten,
  `README.md` says ten topics, `questions.ts` has twelve ids.

## 6. Dead and duplicated code

Confirmed never imported: `src/app/(public)/dashboard/DashboardClient.tsx`;
`components/cards/{DetailPanel,HeadlineCard,DataSourceBadge}.tsx`;
`components/dashboard/DetailPageShell.tsx`;
`components/dashboard/{business,downtown,migration,program,tax}/*Detail.tsx`;
`components/ui/{Button,Card,Input,Select,Table,Tabs}.tsx`; all of
`src/lib/utils.ts` except `cn`; `src/lib/db.ts`; `src/db/index.ts`;
`src/db/introspected/*`; `api/public/metrics`; `api/export/[question]`;
`api/calculator` (no UI reference found; verify external consumers).

Duplicated implementations:

| Pair | Verdict |
|---|---|
| `dashboard/climate/*` vs `dashboard/environment/*` (4 components, 4 API routes) | Diverged rewrites; both rendered on the same tabs |
| `api/cron/sync-permits` vs `ingest/sync-permits.ts` | Near line-for-line copy; ingest refreshes a matview that is never created |
| `api/cron/sync-crime` vs `ingest/sync-crime.ts` | Different parsers writing different formats to one table |
| `ingest/scrape-permit-details{,-v2,-bulk}.ts` | Three generations; npm script points at the oldest |
| `deep-dives/pps-budget/Debate.tsx` vs `venues/Debate.tsx` | Identical except one import line |
| `deep-dives/pps-budget/DoctrineCard.tsx` vs `venues/DoctrineCard.tsx` | ~70% shared JSX |
| `ingest/seed-climate-data.ts` vs `src/db/seed-climate.ts` | Same job, one inside `src/` |

## 7. Documentation claims that are false

| Claim | Where | Reality |
|---|---|---|
| App lives at `apps/civic-dashboard/`, reads `../../data/` | `ARCHITECTURE.md:3-18` | Repo root is the app; nothing reads those paths |
| Mock-data mode without `DATABASE_URL` | `README.md:28`, `CONTRIBUTING.md:17`, `playwright.config.ts:4` | Does not exist (H-13) |
| 177-table introspected snapshot | `README.md:36`, `src/db/README.md:11` | 176 tables, predates migration 0008 |
| Idempotent migrations in `drizzle/` | `README.md:52`, `CONTRIBUTING.md:19`, `apply-migration.ts:6` | 0000 and 0002 fail on re-run or fresh apply |
| Supabase Postgres + PostGIS required | `README.md:35`, `CONTRIBUTING.md:18` | No PostGIS usage in the TS app or snapshot |
| `.env.example` documents all variables | `CONTRIBUTING.md:42` | 12 missing, 10 unused |
| Never commit data files | `CONTRIBUTING.md:39` | 42 MB committed |
| Verification runs before every push | `CHANGELOG.md:327`, `docs/AUDIT_AND_ROADMAP.md:88` | Only on the author's machine |
| Drizzle is the DB layer | `README.md:35` | Runtime uses raw `postgres`; Drizzle client is dead |
| Hidden modules removed from nav | `TODO.md` | Linked from footer and sitemap |

## 8. Done well

- Every user-influenced query is parameterized; every `sql.unsafe` string
  body is a compile-time constant; all `ON CONFLICT` targets are backed by
  real constraints; outbound fetches target constant hosts.
- `cron-auth.ts` fails closed when the secret is unset and is applied before
  any work in all nine cron routes. `internal/accounts/resolve` uses HMAC
  with `timingSafeEqual`, clock-skew limits and no PII in responses.
- Admin and business gates redirect rather than throw; server actions
  re-derive the member from the session, never from form data; invite tokens
  are 24 random bytes with expiry and single use.
- `db-query.ts` handles the Supabase pooler correctly and refuses to cache
  non-object or error payloads. `fetch-sos-all-active.ts` is the model for
  destructive reloads: staging table, row-count guard, atomic swap.
- `data-freshness.ts` derives "data through" from the data with a
  plausible-year guard. The embed and question pages refuse mock fallbacks.
- Deep-dive pages are server components with small client islands; Leaflet
  is behind `dynamic({ ssr:false })`; all 101 `target="_blank"` links carry
  `noopener`/`noreferrer`; `dangerouslySetInnerHTML` appears once, on static
  JSON-LD.
- `KNOWN_ISSUES.md`, `docs/AUDIT_AND_ROADMAP.md` and
  `research/pps-budget/README.md` are unusually candid about data traps and
  provenance; `DataNeeded.tsx` is a good reusable honesty primitive.

## 9. Suggested order of work

1. Delete `api/public/metrics`, `api/export/[question]`, and
   `src/lib/mock-data.ts` (moving `taxData` to `src/data/` with provenance).
   Fix the shelter constants, ArticleRenderer fallbacks, and the
   verify-promises verdict logic. Render `DataSourceBadge` in the hub. Wire
   `getTrendColor`. (One day; removes every "fake number shown as real".)
2. `npm update next && npm audit fix`; bump nodemailer; resolve `xlsx`.
3. Fix `.claude/settings.json`; either implement mock mode in `db-query.ts`
   or delete the claim; delete `db:push`, `src/db/index.ts`, `src/lib/db.ts`.
4. Lock down `claimBusiness` and `acceptInvite`; persist or disable PCB
   applications; gate draft progress reports; add a Stripe webhook.
5. Add security headers; rate-limit and bound the export, parcel, directory
   and performance-export routes; escape the directory regex.
6. Make cron routes return 5xx on failure, add fetch timeouts, wrap
   `housing_rents` reload in a transaction, schedule `sync-performance`, and
   fix the permit/campsite refresh windows.
7. Collapse `environment/*` into `climate/*`; delete the dead components and
   routes listed in section 6; extract the shared crime and permit parsers.
8. Rebuild CI around a Postgres service with seed data and one assertion per
   dashboard API; type-check `ingest/`.
9. Reconcile `.env.example`, README, CONTRIBUTING, ARCHITECTURE and the
   migration journal with what the code actually does.

## 10. Deliberately not done

Four things in this document were judged, and left alone on purpose.

**Next.js 16.** Two advisories remain in `npm audit --omit=dev`, both inside
the PostCSS that Next vendors, and both fixable only by the Next 16 major.
That upgrade changes the lint toolchain, the caching model and several APIs at
once; it is its own piece of work with its own testing, not a line item in an
audit fix. Next moved to 15.5.25 within its semver range, which carries the
middleware-bypass fixes that actually mattered here. The audit's other eight
advisories are resolved.

**Research provenance files.** `research/` holds 19 MB of source workbooks and
PDFs behind the PPS budget dive, and `research/pps-budget/README.md` documents
committing them on purpose: every extracted row carries the document and page
it came from, and the documents are the proof. Deleting them to satisfy a
"never commit data files" rule would destroy the provenance the rule exists to
protect. The rule is now written down accurately instead, and `.vercelignore`
keeps the directory out of deploys. The genuinely redundant material — two
duplicate 25-page PNG render sets of a PDF that is itself committed — is gone.

**The `performance-dark-*` block outside Tailwind's layers.** Flagged as
contradicting the layer guidance in `KNOWN_ISSUES.md`, but the code carries a
comment explaining that it sits outside the layers deliberately, so generated
utilities cannot be ordered ahead of it. That is a considered decision, and
churning it would risk a visual regression to satisfy a lint-shaped rule.

**Whole-page client components.** `apply`, `calculator`, `spaces/[listingId]`
and `directory` ship their static copy as client JavaScript. Splitting each
into a server shell around a client island is a real improvement and a real
refactor of four pages; the client-side correctness problems in them — unabortable
fetches, unguarded state writes, unassociated form labels — are fixed, which is
the part that was actually breaking.

## 11. What changed

Six commits, in the order the work was done:

1. `c799b63` — stop presenting unsourced numbers as measured data
2. `a4912e6` — close authorization gaps and record what the site promises to record
3. `a40cefa` — make failures visible, bound the expensive routes, patch dependencies
4. `da35e75` — give CI a database, fix the type debt, and make the docs true
5. `2215ddb` — fix races, bound the last unbounded surfaces, stop leaking what nobody reads
6. this commit — remove the committed Portland Maps key, collapse the last duplicates

Verification at each step: `npx tsc --noEmit`, `npx tsc -p ingest --noEmit`,
`npm run lint`, `npm run build`, and the Playwright suite against a real
Postgres. The suite grew from 17 tests to 42, and now covers every dashboard
API and topic page, the cron auth boundary, the draft-report gate, and the
absence of the two fabricated-data routes.
