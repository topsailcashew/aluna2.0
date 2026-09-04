#!/usr/bin/env bash
# Copies every NEXT_PUBLIC_FIREBASE_* value from .env.local into the linked
# Vercel project, for all three environments.
#
# The Firebase web config is public by design — it identifies the project, it
# does not grant access. Data is protected by firestore.rules. These still have
# to reach Vercel, or the deployed app shows its "connect to Firebase" screen.
#
# Run after `vercel link`. Safe to re-run: existing values are replaced.
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env.local ] || { echo "No .env.local found."; exit 1; }

while IFS= read -r line; do
  # Skip blanks and comments.
  [[ -z "$line" || "$line" == \#* ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  [[ "$key" == NEXT_PUBLIC_* ]] || continue

  for env in production preview development; do
    # Remove first so a re-run updates rather than erroring on a duplicate.
    vercel env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$key" "$env" >/dev/null
    echo "  set $key ($env)"
  done
done < .env.local

echo "Done. Redeploy with: vercel --prod"
