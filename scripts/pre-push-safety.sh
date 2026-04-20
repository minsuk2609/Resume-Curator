#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running pre-push safety checks"

# Clean local auth/session artifacts that should never be pushed.
SESSION_PATTERNS=(
  "linkedin-auth.json"
  "*.session"
  "*.cookies.json"
  "*.storage-state.json"
  "storageState.json"
)

removed_any=false
for pattern in "${SESSION_PATTERNS[@]}"; do
  while IFS= read -r -d '' match; do
    rm -f "$match"
    echo "Removed local session artifact: ${match#./}"
    removed_any=true
  done < <(find . -type f -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0)
done

if [ "$removed_any" = false ]; then
  echo "No local session artifacts found."
fi

# Ensure sensitive local-only files are not tracked.
TRACKING_BLOCKLIST=(
  ".env"
  "linkedin-auth.json"
)

tracking_error=false
for path in "${TRACKING_BLOCKLIST[@]}"; do
  if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
    echo "Sensitive file is tracked by git: $path"
    tracking_error=true
  fi
done

# Scan tracked source files for possible committed secrets.
SECRET_REGEX='(AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) KEY-----|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z\-_]{35}|sk-[A-Za-z0-9]{20,}|(api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password)\s*[:=]\s*["'"'"'][^"'"'"'\n]{8,}["'"'"'])'

secret_hits="$(git grep -nI -E "$SECRET_REGEX" -- \
  ':(exclude)*.md' \
  ':(exclude)package-lock.json' \
  ':(exclude)client/package-lock.json' \
  ':(exclude)server/package-lock.json' || true)"

if [ -n "$secret_hits" ]; then
  echo "Possible secrets found in tracked files:"
  echo "$secret_hits"
  printf "\nReview and remove/redact before pushing.\n"
  tracking_error=true
else
  echo "No obvious committed secrets found in tracked files."
fi

if [ "$tracking_error" = true ]; then
  printf "\nPre-push safety check failed.\n"
  exit 1
fi

printf "\nPre-push safety check passed. Safe to push.\n"
