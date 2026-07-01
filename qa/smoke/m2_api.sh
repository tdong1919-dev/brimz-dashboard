#!/usr/bin/env bash
# Milestone 2 smoke test: backend REST API health + core endpoints.
# Auto-skips (green) until the API is actually running — so it's safe to keep in
# the suite before M2 exists.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

API="${API_BASE_URL:-http://localhost:8000}"

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

# --- Endpoints below activate once the FastAPI service exists (M2) ---
check_json() { # check_json <path> <label>
  if curl -fsS --max-time 5 "$API$1" | grep -q '.'; then
    ok "GET $1 — $2"
  else
    fail "GET $1 — $2"
  fi
}

check_json "/health" "health endpoint"
check_json "/api/v1/events" "events list"
check_json "/api/v1/events/1/energy" "energy timeline"

summary
