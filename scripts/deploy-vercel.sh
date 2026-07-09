#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! vercel whoami &>/dev/null; then
  echo "Not logged in. Run: vercel login"
  exit 1
fi

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${BLINK_API_KEY:-}" ]]; then
  echo "Warning: BLINK_API_KEY not set — LLM features will use FAQ fallback only."
fi

echo "Setting production env vars on Vercel (if not already set)..."
for key in RENAISS_USE_LIVE BLINK_API_KEY BLINK_MODEL; do
  val="${!key:-}"
  if [[ -n "$val" ]]; then
    printf '%s' "$val" | vercel env add "$key" production --yes 2>/dev/null || \
      printf '%s' "$val" | vercel env rm "$key" production --yes 2>/dev/null; \
      printf '%s' "$val" | vercel env add "$key" production --yes 2>/dev/null || true
  fi
done

echo "Deploying to production..."
vercel deploy --prod --yes

echo "Done. Copy the Production URL above for your hackathon demo."