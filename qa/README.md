# Brimz QA — test scripts

Repo-committed test suite that grows with the milestones. Two layers:

```
qa/
├── smoke/     Fast shell smoke tests (no heavy deps) — DB + API health
└── e2e/       Playwright browser tests for the React dashboard
```

This is distinct from `backend/tests/` (pytest unit/acceptance tests that ship
inside the Python package). `qa/` is **cross-system**: it exercises the running
stack (Postgres, the API, the browser UI) the way a reviewer would.

## Milestone coverage

| Layer | File | Milestone | Status |
|-------|------|-----------|--------|
| smoke | `smoke/m1_database.sh` | M1 Database | ✅ ready |
| smoke | `smoke/m2_api.sh` | M2 Backend API | ⏳ auto-skips until the API is up |
| e2e   | `e2e/tests/dashboard.smoke.spec.ts` | M3 Frontend | ✅ ready (visual draft) |
| e2e   | `e2e/tests/navigation.spec.ts` | M3 Frontend | ✅ ready (visual draft) |
| e2e   | `e2e/tests/fitbit.spec.ts` | M4 Fitbit | ⏳ placeholder (skipped) |

Each future-milestone test **skips cleanly** (green) until its feature exists, so
the whole suite stays runnable at every point in the project.

## Run everything

```bash
# 1. Smoke (needs: docker compose up -d, and backend venv installed)
qa/smoke/run_all.sh

# 2. Playwright e2e (first time only)
cd qa/e2e
npm install
npx playwright install --with-deps chromium
npx playwright test        # auto-starts the dashboard dev server
```

## Environment knobs

- `DATABASE_URL` — override for the DB smoke (default: Docker Postgres on :5433)
- `API_BASE_URL` — where `m2_api.sh` looks for the API (default `http://localhost:8000`)
- `BASE_URL` — where Playwright points (default `http://localhost:5173`, the Vite dev server)
