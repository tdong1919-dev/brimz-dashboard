#!/usr/bin/env bash
# Milestone 2 smoke test: backend REST API health + core endpoints.
# Auto-skips (green) until the API is actually running — so it's safe to keep in
# the suite before M2 exists.
#
# M3: all /api/v1 reads require auth — the script logs in with the seeded demo
# admin first and sends the Bearer token on every check.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

API="${API_BASE_URL:-http://localhost:8000}"
ADMIN_EMAIL="${SMOKE_ADMIN_EMAIL:-owner@brimz.tech}"
ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-brimz-admin}"

head "M2 — Backend API"

if ! command -v curl >/dev/null 2>&1; then
  skip "curl not installed"; summary; exit 0
fi

# Is anything listening? If not, this milestone isn't up yet → skip, don't fail.
if ! curl -fsS --max-time 2 "$API/health" >/dev/null 2>&1 \
   && ! curl -fsS --max-time 2 "$API/" >/dev/null 2>&1; then
  skip "no API at $API (M2 not started yet)"
  summary; exit 0
fi

# --- M3 auth: reads are gated, so log in first ---
TOKEN=$(curl -fsS --max-time 5 "$API/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
if [ -n "$TOKEN" ]; then
  ok "POST /api/v1/auth/login — demo admin login"
else
  fail "POST /api/v1/auth/login — demo admin login (reads below will fail)"
fi
AUTH=(-H "Authorization: Bearer $TOKEN")

# An unauthenticated read must be rejected (the M3 gate works).
if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$API/api/v1/events")" = "401" ]; then
  ok "unauthenticated read is rejected (401)"
else
  fail "unauthenticated read is rejected (401)"
fi

# --- Endpoints below activate once the FastAPI service exists (M2) ---
check_json() { # check_json <path> <label>
  if curl -fsS --max-time 5 "${AUTH[@]}" "$API$1" | grep -q '.'; then
    ok "GET $1 — $2"
  else
    fail "GET $1 — $2"
  fi
}

check_json "/health" "health endpoint"
check_json "/api/v1/events" "events list"
check_json "/api/v1/events/1/energy" "energy timeline"
check_json "/api/v1/events/1/state" "live stadium state (playback)"
check_json "/api/v1/events/1/zones" "per-zone engagement"
check_json "/api/v1/playback?event_id=1" "playback state"

# The live snapshot must expose per-zone energy (the simulation's core promise).
if curl -fsS --max-time 5 "${AUTH[@]}" "$API/api/v1/events/1/state" | grep -q '"zones"'; then
  ok "state exposes per-zone energy"
else
  fail "state exposes per-zone energy"
fi

summary
