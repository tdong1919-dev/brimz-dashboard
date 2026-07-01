#!/usr/bin/env bash
# Shared helpers for smoke scripts: colored logging + pass/fail/skip counters.
set -uo pipefail

PASS=0
FAIL=0
SKIP=0

_c() { # _c <color-code> <text>
  if [ -t 1 ]; then printf '\033[%sm%s\033[0m' "$1" "$2"; else printf '%s' "$2"; fi
}

log()  { echo "  $*"; }
ok()   { PASS=$((PASS+1)); echo "  $(_c '0;32' '✓') $*"; }
fail() { FAIL=$((FAIL+1)); echo "  $(_c '0;31' '✗') $*"; }
skip() { SKIP=$((SKIP+1)); echo "  $(_c '0;33' '↷ SKIP') $*"; }
head() { echo; echo "$(_c '1;36' "=== $* ===")"; }

summary() {
  echo
  echo "$(_c '1' 'Summary'): ${PASS} passed, ${FAIL} failed, ${SKIP} skipped"
  [ "$FAIL" -eq 0 ]
}

# Repo root = two levels up from this file (qa/smoke/lib.sh -> repo).
repo_root() { cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd; }
