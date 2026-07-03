# Brimz MVP (monorepo)

Live-event crowd-energy analytics platform. See the full plan in
`.claude/plans/milestone-1-plan.md`.

## Layout

```
backend/          Python · FastAPI (M2) · SQLAlchemy 2.0 + Alembic · PostgreSQL
brimz-dashboard/  React + TypeScript dashboard (Vite) — the M3 frontend
docker-compose.yml  Local Postgres (host port 5433)
```

## Milestone 1 — Database Foundation (quick start)

```bash
# 1. Start Postgres
docker compose up -d

# 2. Set up the Python env
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp ../.env.example ../.env   # defaults already point at localhost:5433

# 3. Build schema, load data, validate
brimz reset        # drop + create all tables
brimz seed         # mock data + Fitbit fixture data (raw JSONB + normalized)
brimz validate     # integrity + acceptance checks

# Or run the migration path instead of `reset`:
alembic upgrade head
```

Acceptance evidence: `pytest` (spins up against the running Postgres).

## Milestone 2 — Backend Services (REST + live playback)

FastAPI serves the whole dashboard domain over `/api/v1`, plus a **playback
engine** that maps wall-clock time onto each event's timeline and loops it, so
sections light up "live." A WebSocket streams per-zone ticks.

```bash
# with Postgres up and the DB seeded (Milestone 1 steps above):
cd backend && source .venv/bin/activate
brimz serve                      # uvicorn on :8000  (--reload for dev)

# explore:
open http://localhost:8000/docs  # OpenAPI / Swagger UI
curl localhost:8000/health
curl localhost:8000/api/v1/events/1/state    # per-zone energy that advances each call
```

- **Live feed (WebSocket):** `ws://localhost:8000/api/v1/live?event_id=1` — an
  initial snapshot then a `tick` every `playback_tick_seconds`. It also accepts
  control frames (`{"cmd":"seek","seek":"2026-06-15T20:24:00Z"}`).
- **Demo control (REST):** `POST /api/v1/playback` with `{"mode":"seek",
  "seek":"..."}` / `{"mode":"live"}` / `{"loop_seconds":120}`.
- **Config** (`.env`): `playback_loop_seconds` (wall-clock per full loop),
  `playback_tick_seconds`, `api_cors_origins`, `api_port`.

Acceptance evidence: `pytest` (playback-clock unit tests + API/WebSocket tests)
and `API_BASE_URL=http://localhost:8000 bash qa/smoke/m2_api.sh`.

## Milestone 3 — Frontend Experience (wired dashboard + auth + admin)

The React dashboard now runs entirely off the API: every page fetches from
`/api/v1` (TanStack Query, types generated from the OpenAPI schema), the
Overview/Crowd views stream live per-zone ticks over the WebSocket, and the app
is gated behind a real login (JWT access + refresh, roles from `access_roles`).

```bash
# with Postgres up, the DB seeded, and the API running (M1/M2 steps above):
cd brimz-dashboard
npm install
npm run dev                      # Vite on :5173 (API base via VITE_API_BASE_URL)
```

**Demo logins** (seeded by `brimz seed`; passwords configurable via `.env`):

| Role    | Email              | Password        | Can do |
|---------|--------------------|-----------------|--------|
| Admin   | owner@brimz.tech   | `brimz-admin`   | everything + `/admin` simulation cockpit |
| Manager | ops@brimz.tech     | `brimz-manager` | dashboards + playback control |
| Viewer  | analyst@brimz.tech | `brimz-viewer`  | dashboards (read-only) |

- **Admin → Stadium Simulation** (`/admin`, Admin only): play/pause the live
  loop, click the energy curve to seek the whole dashboard to any moment, jump
  to seeded peaks, change loop speed — plus mock-data controls (reseed with any
  attendee count as a background task, status, reset) wrapping the M1 CLI.
- **Settings** (`/settings`): profile + password change (`PATCH /api/v1/auth/me`).
- **Auth model:** all `/api/v1` reads require a Bearer token; `POST /playback`
  and WS control frames require Manager/Admin; `/api/v1/admin/*` requires Admin.
  `/health` stays open. WebSocket auth via `?token=`.
- **API types:** `npm run gen:api` regenerates `src/api/types.gen.ts` from the
  running API's `/openapi.json` (CI fails if it drifts).

Acceptance evidence: `pytest` (auth/roles/admin), Playwright e2e
(`cd qa/e2e && npx playwright test` — login, 24-page nav sweep, live-tick
advance, seek-freeze, role gates), and `bash qa/smoke/run_all.sh`.
