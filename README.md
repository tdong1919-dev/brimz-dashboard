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
