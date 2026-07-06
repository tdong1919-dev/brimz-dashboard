#!/usr/bin/env bash
# Run all ready smoke tests. Future-milestone tests skip cleanly.
set -uo pipefail
DIR="$(dirname "${BASH_SOURCE[0]}")"

RC=0
bash "$DIR/m1_database.sh" "$@" || RC=1
bash "$DIR/m2_api.sh"      || RC=1
bash "$DIR/m3_frontend.sh" || RC=1

echo
if [ "$RC" -eq 0 ]; then
  echo "ALL SMOKE TESTS PASSED (skips are expected for un-started milestones)"
else
  echo "SMOKE TESTS FAILED"
fi
exit "$RC"
