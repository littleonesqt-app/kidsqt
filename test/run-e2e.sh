#!/usr/bin/env bash
# Starts a throwaway server with an empty database, runs the browser tests against it, then stops it.
# Needs Playwright:  npm i -D playwright && npx playwright install chromium
set -euo pipefail
cd "$(dirname "$0")/.."
DATA=$(mktemp -d)
PORT=${PORT:-3999}
DATA_DIR="$DATA" PORT=$PORT COOKIE_SECURE=${COOKIE_SECURE:-false} node server/index.js > "$DATA/server.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null; rm -rf "$DATA"' EXIT
for i in $(seq 1 50); do curl -sf "http://localhost:$PORT/healthz" >/dev/null && break; sleep 0.1; done
DATA_DIR="$DATA" node test/accounts.e2e.js "http://localhost:$PORT" "${1:-}"
