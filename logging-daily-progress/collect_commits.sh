#!/usr/bin/env bash
# collect_commits.sh — list the current user's commits for a given day
# in the exact format used by the Commits section of progress-daily.md.
#
# Usage:
#   bash scripts/collect_commits.sh <YYYY-MM-DD> [author-regex]
#
# If author-regex is omitted, falls back to `git config user.email`.
# Output format, one line per commit:
#   `<short-sha>` <scope>: <subject>
# where <scope> is derived from the branch the commit first appeared on
# (best-effort; falls back to "main" if the commit is on the default branch only).

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <YYYY-MM-DD> [author-regex]" >&2
  exit 2
fi

day="$1"
author="${2:-$(git config user.email)}"

# sanity check the date
if ! date -d "$day" >/dev/null 2>&1; then
  echo "error: '$day' is not a valid date (expected YYYY-MM-DD)" >&2
  exit 2
fi

# day window in the local timezone — inclusive start, exclusive end
since="${day} 00:00:00"
until="${day} 23:59:59"

# --all so we catch commits on feature branches the user hasn't merged yet
# --no-merges because merge commits rarely represent authored work worth logging
git log --all --no-merges \
  --author="$author" \
  --since="$since" \
  --until="$until" \
  --pretty=format:'%h%x09%s' \
| while IFS=$'\t' read -r sha subject; do
    # try to find a branch that contains this commit (first non-HEAD, non-origin ref)
    scope=$(git branch --all --contains "$sha" 2>/dev/null \
            | grep -v 'HEAD' \
            | sed -e 's|remotes/origin/||' -e 's/^[* ]*//' \
            | grep -v '^$' \
            | head -n1 \
            | xargs \
            || true)
    scope="${scope:-main}"
    printf '\`%s\` %s: %s\n' "$sha" "$scope" "$subject"
  done
