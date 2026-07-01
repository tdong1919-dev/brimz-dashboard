#!/usr/bin/env bash
# Milestone 1 smoke test: Postgres reachable, schema migrated, data seeded & valid.
# Non-destructive by default; pass --full to reset + reseed from scratch.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ROOT="$(repo_root)"
BACKEND="$ROOT/backend"
VENV_BIN="$BACKEND/.venv/bin"
FULL=0
[ "${1:-}" = "--full" ] && FULL=1

head "M1 — Database Foundation"

# 1. Docker Postgres container up?
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^brimz-db$'; then
  ok "docker container 'brimz-db' is running"
else
  fail "docker container 'brimz-db' not running — run: docker compose up -d"
  summary; exit 1
fi

# 2. Backend venv present?
if [ -x "$VENV_BIN/brimz" ]; then
  ok "backend venv + brimz CLI found"
else
  fail "backend venv missing — run: cd backend && python3 -m venv .venv && .venv/bin/pip install -e '.[dev]'"
  summary; exit 1
fi

cd "$BACKEND" || { fail "cannot cd to backend"; summary; exit 1; }

# 3. Migrate (and optionally reset) then ensure data exists.
if [ "$FULL" -eq 1 ]; then
  if "$VENV_BIN/brimz" seed --reset >/dev/null 2>&1; then
    ok "full reset + reseed completed"
  else
    fail "full reset + reseed failed"; summary; exit 1
  fi
else
  "$VENV_BIN/alembic" upgrade head >/dev/null 2>&1 && ok "alembic at head" || log "alembic upgrade skipped/failed (continuing)"
  # Seed only if the DB looks empty.
  if "$VENV_BIN/brimz" validate >/dev/null 2>&1; then
    ok "existing data already valid"
  else
    log "no valid data yet — seeding"
    "$VENV_BIN/brimz" seed >/dev/null 2>&1 && ok "seed completed" || { fail "seed failed"; summary; exit 1; }
  fi
fi

# 4. Validate acceptance criteria (42 checks).
if OUT="$("$VENV_BIN/brimz" validate 2>&1)"; then
  N="$(echo "$OUT" | grep -c '  ✓')"
  ok "brimz validate passed (${N} checks)"
else
  fail "brimz validate FAILED:"
  echo "$OUT" | grep '✗' | sed 's/^/      /'
fi

summary
