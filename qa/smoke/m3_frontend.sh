#!/usr/bin/env bash
# Milestone 3 smoke test: auth surface + admin surface + built frontend.
# Auto-skips (green) until the API is running, mirroring m2_api.sh.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

API="${API_BASE_URL:-http://localhost:8000}"
APP="${APP_BASE_URL:-http://localhost:5173}"
ADMIN_EMAIL="${SMOKE_ADMIN_EMAIL:-owner@brimz.tech}"
ADMIN_PASSWORD="${SMOKE_ADMIN_PASSWORD:-brimz-admin}"
VIEWER_EMAIL="${SMOKE_VIEWER_EMAIL:-analyst@brimz.tech}"
VIEWER_PASSWORD="${SMOKE_VIEWER_PASSWORD:-brimz-viewer}"

head "M3 — Auth + Admin + Frontend"

if ! command -v curl >/dev/null 2>&1; then
  skip "curl not installed"; summary; exit 0
fi

if ! curl -fsS --max-time 2 "$API/health" >/dev/null 2>&1; then
  skip "no API at $API (start with: brimz serve)"
  summary; exit 0
fi

login() { # login <email> <password> -> token on stdout ('' on failure)
  curl -fsS --max-time 5 "$API/api/v1/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" 2>/dev/null \
    | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p'
}

code() { # code <method> <path> <token> [body]
  local method=$1 path=$2 token=$3 body=${4:-}
  local args=(-s -o /dev/null -w '%{http_code}' --max-time 5 -X "$method")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  curl "${args[@]}" "$API$path"
}

# --- Auth behaviour ---
ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
[ -n "$ADMIN_TOKEN" ] && ok "admin login issues tokens" || fail "admin login issues tokens"

VIEWER_TOKEN=$(login "$VIEWER_EMAIL" "$VIEWER_PASSWORD")
[ -n "$VIEWER_TOKEN" ] && ok "viewer login issues tokens" || fail "viewer login issues tokens"

BAD=$(code POST "/api/v1/auth/login" "" '{"email":"owner@brimz.tech","password":"wrong"}')
[ "$BAD" = "401" ] && ok "bad password rejected (401)" || fail "bad password rejected (got $BAD)"

ME=$(code GET "/api/v1/auth/me" "$ADMIN_TOKEN")
[ "$ME" = "200" ] && ok "GET /auth/me with token" || fail "GET /auth/me with token (got $ME)"

# --- Role gates ---
VC=$(code POST "/api/v1/playback" "$VIEWER_TOKEN" '{"mode":"live"}')
[ "$VC" = "403" ] && ok "viewer cannot drive playback (403)" || fail "viewer cannot drive playback (got $VC)"

VA=$(code GET "/api/v1/admin/status" "$VIEWER_TOKEN")
[ "$VA" = "403" ] && ok "viewer cannot reach /admin (403)" || fail "viewer cannot reach /admin (got $VA)"

AA=$(code GET "/api/v1/admin/status" "$ADMIN_TOKEN")
[ "$AA" = "200" ] && ok "admin reaches /admin/status" || fail "admin reaches /admin/status (got $AA)"

AP=$(code POST "/api/v1/playback" "$ADMIN_TOKEN" '{"mode":"live"}')
[ "$AP" = "200" ] && ok "admin drives playback" || fail "admin drives playback (got $AP)"

# --- Frontend (dev server or preview, if running) ---
if curl -fsS --max-time 2 "$APP" >/dev/null 2>&1; then
  if curl -fsS --max-time 5 "$APP" | grep -qi 'brimz\|<div id="root">'; then
    ok "frontend serves the app shell at $APP"
  else
    fail "frontend serves the app shell at $APP"
  fi
else
  skip "no frontend at $APP (start with: npm run dev)"
fi

summary
