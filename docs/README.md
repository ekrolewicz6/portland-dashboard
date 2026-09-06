# Civic Dashboard Docs

Canonical app-local documentation lives here when it describes implementation
or operational details owned by the civic dashboard.

- `AUDIT_AND_ROADMAP.md` - full audit and the institutional roadmap.
- `CODEBASE_AUDIT_2026-09.md` - September 2026 point-in-time codebase audit.
- `data-source-inventory.md` - canonical data-source inventory and ingestion status for the dashboard.
- `data-storage.md` - where data lives, and what may and may not be committed.
- `org-chart-plan.md` - plan for the city org-chart dataset.
- `property-data-sources.md` - property and real-estate source notes.
- `shared-auth-runbook.md` - operating the shared WorkOS account layer.
- `prr-drafts/` - drafted public records requests.

There is no shared cross-project tree. Earlier versions of this file pointed
at `/Users/edankrolewicz/Code/Active/portland/data/knowledge/portfolio/` and
`/Users/edankrolewicz/Code/Active/portland/data/datasets/` — personal absolute
paths on one machine, which no clone of this repository has. Cross-project
strategy and shared datasets have no home in this repo today; put strategy
notes in this directory and data in Postgres or `runtime-data/`.
