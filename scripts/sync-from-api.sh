#!/bin/bash
# Sync constants from burrow-api to keep them in lock-step.
# Run whenever backend constants change. Note in commit message.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/../burrow-api/src/common/constants.ts"
DEST="$ROOT/src/lib/constants.ts"
if [[ ! -f "$SRC" ]]; then
  echo "Missing $SRC — clone burrow-api as a sibling or adjust path." >&2
  exit 1
fi
cp "$SRC" "$DEST"
echo "// Synced from burrow-api on $(date -u +%Y-%m-%dT%H:%M:%SZ)" | cat - "$DEST" > /tmp/burrow-constants-sync && mv /tmp/burrow-constants-sync "$DEST"
echo "Synced. Review diff and commit."
