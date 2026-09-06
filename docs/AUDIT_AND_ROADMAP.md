# Portland Civic Lab — Full Audit & Institutional Roadmap

**Date:** June 9, 2026 · **Status update June 11, 2026:** Phase 0 and the
software scope of Phases 1-2 are deployed — security hardening, WorkOS
membership (test env), CI + smoke tests, CSV export, data freshness labels,
flag-a-number, topic proposals + voting, the /records PRR tracker,
/volunteer, /open-data, and privacy/terms naming Portland Civic Lab LLC.
Remaining: WorkOS production cutover + Sentry (user), and the Phase 3-4
items (member workbench, first Progress Report, governance mechanisms).

**Scope:** Complete audit of the application (product, security, data, engineering, ops) plus a gap analysis between today's codebase and the goal: a democratically-run civic technology institution where Portlanders become members, participate in civic functions, analyze data, volunteer, file public records requests, and govern the organization itself.

---

## Executive Summary

**Where you are today:** A genuinely impressive solo-built civic data product. The dashboard core is real — live data pipelines from BDS, PPB, BLS, Census, HUD, ODE and others, 9 automated cron jobs, honest methodology documentation, and a polished public face. This is further along than most civic tech projects ever get.

**The honest assessment:** It is a *publication*, not yet a *platform*, and nowhere near an *institution*. There are no users — auth is a stub with hardcoded credentials sitting in a public GitHub repo. There is no membership, no participation surface, no governance structure, no legal entity visible anywhere, no license on the "open source" code, and no second contributor. Several public-facing surfaces (Spaces, Concierge, Progress Report, signup) are demos or empty shells. Everything ships straight to production on `main` with zero tests and no error monitoring.

**The gap, in one sentence:** You have built the *evidence layer* of the institution; you have not yet built the *people layer* (members, identity, participation) or the *trust layer* (legal entity, governance, open-source license, operational reliability) — and the institution is the combination of all three.

**The path:** Fix the security and trust foundations immediately (days), replace the auth stub with WorkOS and launch real membership (weeks), build the first participation loops — data annotation, PRR filing, volunteering — on top of membership (months), and in parallel stand up the organizational scaffolding (legal entity, bylaws, membership governance) that makes "democratically run" true rather than aspirational (quarters).

---

# Part I — Audit of the Current Application

## 1. Security (fix before anything else)

These findings matter more than usual because **the repo is public** (`github.com/ekrolewicz6/portland-civic-lab`).

### Critical

| # | Finding | Location | Detail |
|---|---------|----------|--------|
| S1 | **Hardcoded admin credentials in public source** | `src/lib/auth.ts:28-31` | `admin@portlandcommons.org` / `portland2026` grants an `admin` role JWT. Anyone on the internet can read this and log in. |
| S2 | **Weak NEXTAUTH_SECRET fallback** | `src/lib/auth.ts:71`, `middleware.ts` | Falls back to `"portland-commons-dev-secret"` — also public. If the env var is ever unset in prod, anyone can forge admin sessions. |
| S3 | **Raw error messages leaked to clients** | `api/cron/sync-permits`, `sync-crime`, `verify-promises`, `concierge/chat`, all `api/performance/*` | `{ error: err.message }` exposes table names, query structure, infra details. |
| S4 | **Cron routes fail-open** | All `api/cron/*` routes | Auth check is `if (process.env.CRON_SECRET && ...)` — if the secret is unset, the routes are publicly callable, enabling expensive sync triggering and data tampering. |

### High

| # | Finding | Location | Detail |
|---|---------|----------|--------|
| S5 | `sql.unsafe()` with string-built WHERE/ORDER BY clauses | `api/directory/route.ts:68-79` | Currently safe (conditions are internally generated) but one refactor away from SQL injection. |
| S6 | Concierge chat has no input validation, rate limiting, or cost controls | `api/concierge/chat/route.ts` | Unbounded Anthropic API spend; prompt-injection surface; no per-IP limits. |
| S7 | Contact form rate limiting is in-memory | `api/contact/route.ts:25` | Resets on every cold start; useless on Vercel's multi-instance deploys. Honeypot is trivially bypassed. |
| S8 | Runtime `CREATE TABLE IF NOT EXISTS` in contact fallback path | `api/contact/route.ts:174-245` | Race conditions; schema should live in migrations. |
| S9 | 30-day JWT sessions, no server-side invalidation | `src/lib/auth.ts:47` | Long-lived forgeable sessions compound S1/S2. |

**Immediate actions (this week):**
1. Delete the credentials provider stub entirely; remove hardcoded creds (S1).
2. Throw at startup if `NEXTAUTH_SECRET` / `CRON_SECRET` are unset in production (S2, S4).
3. Rotate any real secrets that have ever appeared in git history; scrub history if needed (`git filter-repo`).
4. Replace all `error.message` responses with generic messages + server-side logging (S3).
5. Add zod validation + per-IP rate limiting to the concierge route, or take it offline until gated behind membership (S6).

## 2. Product Surface Inventory

| Surface | Route | Verdict | Notes |
|---------|-------|---------|-------|
| Home | `/` | ✅ Solid | Recently rewritten for user-facing voice |
| Dashboard hub | `/dashboard` | ✅ Solid | 12 live topics; performance promo intentionally hidden |
| Topic pages | `/dashboard/[question]` | ✅ Solid | Real data; export visible, embed hidden (TODO.md) |
| Methodology | `/methodology` | ✅ Solid | Honest limitations section — a genuine asset |
| Contact | `/contact` | ✅ Solid | Backend has robustness issues (S7, S8) |
| Directory | `/directory` | ✅ Solid | Live Oregon SOS data |
| Calculator | `/calculator` | ✅ Solid | PCB benefit estimator |
| Apply | `/apply` | ⚠️ Works, but | Submissions lack durable persistence guarantees |
| Performance suite | `/dashboard/performance/*` | 🟡 Hidden/half-built | Error pages can surface stack traces |
| Spaces | `/spaces`, `/spaces/[id]` | 🟡 Demo | Sample listings, "coming soon" everywhere |
| Concierge | `/concierge` | 🟡 Unclear | Chat UI exists; ungated, uncontrolled AI spend |
| Progress Report | `/progress-report` | 🟡 Empty shell | Infrastructure ready, zero content |
| Login | `/login` | 🔴 Broken/insecure | Hardcoded dev account (S1) |
| Signup | `/signup` | 🔴 Fake | Form submits to nowhere; shows fake success |
| Embed | `/embed/[question]` | 🔴 Orphaned | Routes exist, unreachable, button hidden |

**Pattern:** the public-facing *publication* surfaces are good; everything that involves *users or accounts* is a stub. That's exactly the layer the membership vision requires.

**Product actions:**
- Remove or `noindex` the broken signup/login until WorkOS lands — a fake "Application received" success screen actively destroys trust.
- Either ship or fully remove: Spaces, Progress Report, embed routes. Half-visible demos undermine the credibility the dashboards earn.
- Decide the PCB program's place in the story. The business certification track (calculator/apply/spaces/directory) is a second product narrative that currently coexists awkwardly with the civic-data narrative.

## 3. Data Infrastructure

**Strengths:** 30+ tables across well-separated schemas; idempotent UPSERT pipelines for permits/campsites; 9 scheduled cron jobs; a data verification script (`ingest/verify-api-queries.ts`); honest source-status badges on the methodology page.

> **Correction (September 2026):** this section originally called the verification script "a pre-push data verification hook", implying it ran on every push. It did not — the committed Claude Code hook that invoked it worked on one machine only and has been deleted. The script is now wired as `.githooks/pre-push`, which is **opt-in**: a contributor enables it with `git config core.hooksPath .githooks`. Do not assume any push has been verified.

**Problems, ranked:**

| # | Finding | Impact |
|---|---------|--------|
| D1 | `lastUpdated` is always `new Date()` — the *check* time, not the *data* time | Users see "updated today" on 7-week-old BLS data. Directly contradicts the transparency brand. |
| D2 | Zillow rent/home-value data is manual-refresh only (30-45 day lag) | Headline housing numbers can silently go 2+ months stale |
| D3 | Climate action statuses are manually seeded with no refresh path | The accountability platform can drift from reality indefinitely |
| D4 | Cache invalidation is event-based and partial; no TTL expiry backstop | Stale cache persists undetected after manual data refreshes |
| D5 | Schema is split: `safety.ppb_offenses` (613K rows) and others exist only in migrations, not `src/db/schema.ts` | No generated types; raw-SQL-with-`as unknown` casts proliferate (126 instances) |
| D6 | "Every number linked to its source" is implemented at headline level only | Per-metric provenance (sourceUrl + fetchedAt) doesn't exist in the schema |
| D7 | Single points of failure: ArcGIS endpoints, DATABASE_URL, portlandmaps HTML scraping | DB outage = blank dashboard; scraper breaks silently on site redesign |
| D8 | `data/` directory: 7,000+ files deleted in the working tree, uncommitted | The data-storage strategy migration (git → runtime-data/ + Postgres) is mid-flight and undocumented |

**Data actions:**
- Add a `source_fetched_at` / `data_as_of` column convention and surface real data ages in the UI (D1). This is the single highest-leverage trust fix in the data layer.
- Promote Zillow fetch to a weekly cron (D2); design a quarterly review checklist for manual sources (D3).
- Commit the `data/` deletion with a written strategy note; document which `runtime-data/` files are generated vs. required (D8).

## 4. Engineering & Operations

| # | Finding | Detail |
|---|---------|--------|
| E1 | **Zero tests, zero CI** | Playwright installed, never used. No `.github/workflows`. Every commit deploys to production unvalidated. |
| E2 | **No error tracking or alerting** | No Sentry/equivalent. Cron failures are invisible. A broken pipeline announces itself only via wrong public data. |
| E3 | Everything on `main`, no preview/staging discipline | High blast radius; incompatible with ever having a second contributor |
| E4 | Component gigantism | 8 detail components over 1,000 lines (EducationDetail: 1,316) with heavy copy-paste duplication of chart/layout patterns |
| E5 | 126 `as unknown` casts | Type safety bypassed precisely where data correctness matters most (API routes) |
| E6 | 135 console.log statements; no structured logging | Reactive debugging only |
| E7 | Documentation sprawl | 13 doc files, 3 specs (2 deprecated pointers, 1 pointing outside the repo), 4 names for the project: "Portland Civic Lab" (site), "Portland Commons" (auth code), "portland-commons-dashboard" (package.json), "portland-dashboard" (GitHub) |
| E8 | **No LICENSE file** | The methodology page claims "all code and data pipelines are open source." Without a license, the public repo is legally proprietary. (`package.json`'s `"private": true` is fine — it only guards against accidental npm publishing.) |

**Ops actions:**
- Add a GitHub Actions workflow: typecheck + lint + build on every push; a handful of Playwright smoke tests (home loads, each dashboard topic returns data, contact form validates) (E1).
- Add Sentry (free tier) + a cron-failure alert (Vercel log drains or a dead-man's-switch ping like healthchecks.io) (E2).
- Choose and add a license — AGPL-3.0 if you want improvements shared back (common for civic tech), MIT if you want maximum adoption. Add a `repository` field to package.json and write CONTRIBUTING.md (E8).
- Consolidate naming: one name everywhere. Rename the GitHub repo to `portland-civic-lab`, fix package.json, purge "Commons" from auth code (E7).

---

# Part II — The Vision, Made Concrete

"The greatest democratically-run civic technology organization" decomposes into three layers. Today's codebase only has the first.

### Layer 1: Evidence (✅ ~70% built)
Public dashboards, source-linked data, methodology transparency, accountability tracking (Promise Tracker, Climate platform, performance mirror). **This exists and is good.**

### Layer 2: People (🔴 ~5% built)
Identity, membership, and participation:
- **Members** sign in (WorkOS), have profiles, belong to working groups
- **Participation**: members annotate data, propose dashboard topics, verify promises, review PRR responses, attend/organize civic functions
- **Data analysis**: members get query/notebook/export access to the warehouse, not just pre-built charts
- **Volunteering**: a real opportunity board with skills matching (data, design, policy, organizing) and contribution tracking
- **Public records requests**: guided filing, public tracking of request status, publication of responses into the data commons

What exists today: a broken login, a fake signup, an ungated AI chat. **This layer is the entire next chapter.**

### Layer 3: Institution (🔴 ~0% built)
The structures that make it durable and democratic:
- **Legal entity** (almost certainly 501(c)(3) for grants + donations; possibly a (c)(4) arm later for advocacy)
- **Governance**: bylaws, a board, and — to honor "democratically run" — member voting on priorities, budget allocations, and eventually board seats
- **Transparency about itself**: public finances, public roadmap, public meeting notes — the org must meet the standard it holds the city to
- **Sustainability**: funding (grants, memberships, perhaps city/foundation contracts), more than one maintainer, operational reliability (Layer 1 ops fixes are a prerequisite)

Nothing in the repo or docs addresses this layer.

---

# Part III — Gap Analysis by Pillar

## Pillar 1: Membership & Identity (WorkOS)

**Today:** next-auth with a hardcoded credentials stub; JWT-only; no users table; signup is fake.

**Target:** WorkOS AuthKit as the identity layer — email magic links + Google OAuth (lowest friction for residents), MFA available, and SSO ready for future org partners. Free tier covers 1M MAU, so cost is not a concern.

**Build:**
1. Rip out next-auth credentials provider; integrate AuthKit (`@workos-inc/authkit-nextjs`).
2. New schema: `members` (id, workos_user_id, name, email, joined_at, status), `member_profiles` (neighborhood, interests, skills), `member_roles` (member / contributor / steward / admin).
3. Membership onboarding flow: what you can do as a member, code of conduct acceptance, optional neighborhood + interest selection.
4. A `/members` area: profile, your contributions, your working groups, your PRRs.

**Decisions for you:** Is membership free, dues-based, or tiered (free + sustaining)? Dues create a funding stream *and* strengthen the democratic claim (members-as-constituents), but raise the barrier. Common pattern: free membership, optional sustaining contribution, voting rights for all members after 60-90 days tenure.

## Pillar 2: Civic Participation

**Today:** Nothing interactive. Ask Portland (surveys) is a separate external product.

**Target:** Members can *do things* that improve the commons:
- **Data annotation & verification**: flag suspect numbers, attach local context to metrics, verify Promise Tracker claims (the verification engine already exists — give members a review queue).
- **Topic proposals & prioritization**: members propose dashboards/analyses; quarterly member vote selects what the lab builds next. This is the smallest viable version of "democratically run" and you can ship it early.
- **Civic functions**: events calendar (data walks, council-watch nights, hackathons), RSVP, and post-event artifacts published back to the site.
- **Integrate Ask Portland**: member accounts should eventually unify with survey participation — one identity across the lab's products.

## Pillar 3: Data Analysis for Members

**Today:** Pre-built charts only; CSV export is hidden because it doesn't work (TODO.md).

**Target, in increasing ambition:**
1. **Fix and ship CSV export** (it's already 80% built) — every chart downloadable.
2. **Public read-only API** with documented endpoints (the `/api/dashboard/*` routes are already most of this — formalize, version, and document them).
3. **Member workbench**: saved queries, simple SQL or notebook access against a read-replica with row-level public-data-only views.
4. **Member-published analyses**: a review pipeline where member analyses become Progress Report content (this also fixes the empty Progress Report page — your members write it with you).

## Pillar 4: Volunteering

**Today:** Nothing.

**Target:** An opportunities board (`/volunteer`): roles spanning data engineering, design, writing, policy research, event organizing; skill tags matched to member profiles; lightweight application; contribution log feeding member profiles. Start manual (a Notion-backed board is fine for month one) and productize once there's traffic. **Prerequisite:** CONTRIBUTING.md, a license, good first issues, and CI — nobody can volunteer on a repo that's unsafe to contribute to (E1, E3, E8).

## Pillar 5: Public Records Requests

**Today:** Nothing — but this is the highest-differentiation pillar. Oregon's public records law is strong, and KNOWN_ISSUES.md already documents data that *requires* PRRs (BOEC 911 response times are hardcoded "PRR Needed").

**Target:**
1. **PRR guide + templates**: Oregon-specific how-to, per-agency contacts and fee norms, template generator.
2. **Request tracker**: members file/log requests through the platform; status is public (filed → acknowledged → fulfilled/denied → appealed); deadlines tracked against statutory response windows.
3. **The flywheel**: fulfilled PRRs feed the data commons — responses get published, parsed, and become dashboard sources. The lab's own data gaps (BOEC, JOHS shelter data) become the first member-driven PRR campaigns.
4. **Agency accountability scorecard**: response times and denial rates per agency — a dashboard *about* transparency itself.

## Pillar 6: Democratic Governance

**Today:** Nothing. No entity, no bylaws, no board, no membership rules.

**Target sequence:**
1. **Entity formation** (talk to an Oregon nonprofit attorney; Oregon Nonprofit Corporation + 501(c)(3) federal exemption). Fiscal sponsorship (e.g., through an existing civic-tech-friendly sponsor) can bridge the 6-12 month IRS wait.
2. **Founding documents**: mission, bylaws with a member class that holds real powers (elect some board seats, approve major priorities), code of conduct, conflict-of-interest policy.
3. **Mechanism design**: start small and real — quarterly priority votes (Pillar 2) are governance training wheels; board elections come once there are enough engaged members to make elections meaningful (rule of thumb: 100+ active members).
4. **Radical self-transparency**: public budget, public board minutes, public metrics about the org itself. You cannot credibly run an accountability platform for the city while being opaque yourself.

## Pillar 7: Trust & Reliability Infrastructure (cross-cutting prerequisite)

Everything above sits on fixes from Part I: security holes closed (S1-S4), real data-freshness display (D1), tests + CI (E1), error monitoring (E2), a license (E8), one consistent name (E7). An institution asking Portlanders to trust it with their identity and participation cannot have hardcoded admin passwords in a public repo.

---

# Part IV — Roadmap

## Phase 0 — Stop the Bleeding (this week)
- [ ] Remove hardcoded credentials & weak secret fallbacks; rotate secrets; scrub git history if needed
- [ ] Fail-secure cron auth; generic error responses everywhere
- [ ] Gate or disable the concierge chat (AI spend + injection risk)
- [ ] Take down or `noindex` fake signup/login
- [ ] Commit the `data/` migration with a written strategy note
- [ ] Add LICENSE, remove `"private": true`, pick the one true name

## Phase 1 — Foundation (weeks 1-4)
- [ ] WorkOS AuthKit integration + `members` schema + onboarding flow
- [ ] GitHub Actions CI (typecheck, lint, build, smoke tests) + Sentry + cron alerting
- [ ] Real `data_as_of` timestamps across pipelines and UI
- [ ] Fix CSV export and ship it; weekly Zillow cron
- [ ] CONTRIBUTING.md + 10 good-first-issues
- [ ] Decide: membership model (free/dues), entity strategy (consult attorney / fiscal sponsor)

## Phase 2 — First Participation Loops (months 2-4)
- [ ] Member area: profile, contributions, settings
- [ ] Data flagging/annotation on every chart ("report an issue with this number" → member-attributed review queue)
- [ ] Topic proposals + first quarterly member priority vote
- [ ] PRR guide, templates, and request tracker (start with the lab's own data gaps: BOEC, JOHS)
- [ ] Volunteer board (manual matching is fine)
- [ ] Events calendar + first 2-3 in-person civic functions
- [ ] File entity paperwork or sign fiscal sponsorship

## Phase 3 — The Commons (months 4-9)
- [ ] Public documented data API v1
- [ ] Member analysis workbench (saved queries → published analyses)
- [ ] First member-coauthored Progress Report (fills the empty page with the community's work)
- [ ] PRR-to-dashboard pipeline: first fulfilled request published as a data source
- [ ] Promise Tracker member verification queue
- [ ] Unify identity with Ask Portland
- [ ] Component refactor: extract shared chart/layout primitives from the 1,000-line detail components (prerequisite for contributor velocity)

## Phase 4 — The Institution (months 9-18)
- [ ] Bylaws ratified with member powers; first board (including member-elected seats)
- [ ] Public org dashboard: finances, membership, PRR stats, uptime — the lab measured by its own standards
- [ ] Funding: grants (Knight, Democracy Fund, local foundations), sustaining memberships, possible data-services contracts
- [ ] Working groups with stewards (housing, safety, climate, schools) owning their dashboard verticals
- [ ] Agency transparency scorecard from accumulated PRR data
- [ ] Second paid maintainer / executive capacity

---

## The 10 Highest-Leverage Actions, In Order

1. **Remove the hardcoded admin credentials and secret fallbacks** — existential trust risk, public repo (`src/lib/auth.ts`)
2. **Add a LICENSE and make the open-source claim true** — the cheapest credibility win available
3. **Integrate WorkOS and create the members table** — unblocks every pillar of the vision
4. **Ship real data-freshness timestamps** — aligns the product with its core transparency promise
5. **CI + Sentry + cron alerts** — an institution's data platform cannot fail silently
6. **One name everywhere** — "Portland Civic Lab," in package.json, GitHub, auth code, and specs
7. **Ship the first participation loop (flag-a-number + topic voting)** — smallest real version of "democratically run"
8. **Launch the PRR tracker seeded with your own data gaps** — unique value nobody else in Portland offers
9. **Start entity formation / fiscal sponsorship** — the legal container for everything else
10. **Recruit 3 volunteer contributors and make the repo safe for them** — the moment this stops being a solo project is the moment it becomes an organization

---

## Closing Note

The hard part of this vision is not the software. The dashboard proves you can build. The gap is that institutions are made of **people with standing** (members), **rules they consent to** (governance), and **promises kept reliably over time** (operations). Every recommendation above serves one of those three. The sequencing matters: trust fixes before membership, membership before participation, participation before governance — because each layer is the credibility foundation for the next.
