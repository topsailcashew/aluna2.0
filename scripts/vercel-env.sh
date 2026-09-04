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

# Vercel CLI 54.9.1 cannot add an "all Preview branches" variable without a
# TTY: it reports git_branch_required and then suggests the very command that
# just failed, with or without --force. Production and Development are what a
# `vercel --prod` deploy reads, so a Preview miss is a warning, not a failure.
# Set PREVIEW_BRANCH to target one branch instead, e.g. PREVIEW_BRANCH=main.
preview_branch="${PREVIEW_BRANCH:-}"
failed=0
skipped_preview=0

while IFS= read -r line <&3 || [ -n "$line" ]; do
  # Skip blanks and comments.
  [[ -z "$line" || "$line" == \#* ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  [[ "$key" == NEXT_PUBLIC_* ]] || continue

  for env in production preview development; do
    # Remove first so a re-run updates rather than erroring on a duplicate.
    vercel env rm "$key" "$env" --yes </dev/null >/dev/null 2>&1 || true

    # --value/--yes rather than piping on stdin, which would prompt.
    if [ "$env" = "preview" ] && [ -n "$preview_branch" ]; then
      target=("$key" "$env" "$preview_branch")
    else
      target=("$key" "$env")
    fi

    if vercel env add "${target[@]}" --value "$value" --yes \
         </dev/null >/dev/null 2>&1; then
      echo "  set $key ($env${preview_branch:+ @$preview_branch})"
    elif [ "$env" = "preview" ]; then
      skipped_preview=1
    else
      echo "  FAILED $key ($env)" >&2
      failed=1
    fi
  done
done 3< .env.local

if [ "$failed" -ne 0 ]; then
  echo "Some variables did not save." >&2
  exit 1
fi

if [ "$skipped_preview" -ne 0 ]; then
  echo
  echo "Note: Preview was skipped (see the comment at the top of this script)."
  echo "Production and Development are set. To cover Preview, either re-run as"
  echo "  PREVIEW_BRANCH=<branch> $0"
  echo "or add them in the Vercel dashboard under Settings -> Environment Variables."
fi

echo "Done. Redeploy with: vercel --prod"
