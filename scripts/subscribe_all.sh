#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"
JWT="${JWT:-}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq est requis. Installez-le (sudo apt-get install -y jq)" >&2
  exit 1
fi

if [[ -z "$JWT" ]]; then
  echo "JWT manquant. Exportez JWT=\"<access_token>\" avant d'exécuter ce script." >&2
  exit 1
fi

get_service_id() {
  local name="$1"
  curl -s "$API_BASE/services/" | jq -r ".[] | select(.name==\"$name\") | .id"
}

subscribe() {
  local service_name="$1"
  local access="$2"
  local refresh="$3"
  local expires="$4"
  local sid
  sid=$(get_service_id "$service_name")
  if [[ -z "$sid" || "$sid" == "null" ]]; then
    echo "Service '$service_name' introuvable" >&2
    return 1
  fi
  echo "Abonnement $service_name ($sid)"
  curl -s -X POST "$API_BASE/services/$sid/subscribe" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $JWT" \
    -d "{\"access_token\":\"$access\",\"refresh_token\":\"$refresh\",\"expires_at\":$([ -n "$expires" ] && echo \"\"$expires\"\" || echo null)}" | jq .
}

# Option: échanger un code Google OAuth et stocker tokens Gmail
exchange_google_code() {
  local code="$1"
  local redirect_uri="${GOOGLE_REDIRECT_URI:-http://localhost:8081/oauth/google/callback}"
  if [[ -z "$code" ]]; then
    echo "Code OAuth Google manquant" >&2
    return 1
  }
  echo "Échange du code Google …"
  curl -s -X POST "$API_BASE/auth/oauth/google/exchange/" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $JWT" \
    -d "{\"code\":\"$code\",\"redirect_uri\":\"$redirect_uri\"}" | jq .
}

# GMail (deux options)
# 1) Si vous avez un code OAuth Google, exportez CODE et GOOGLE_REDIRECT_URI, puis:
#    CODE="<code>" GOOGLE_REDIRECT_URI="http://localhost:8081/oauth/google/callback" ./scripts/subscribe_all.sh
if [[ -n "${CODE:-}" ]]; then
  exchange_google_code "$CODE"
else
  # 2) Sinon, abonnement direct en fournissant vos tokens Gmail (si déjà obtenus)
  subscribe gmail "${GMAIL_ACCESS_TOKEN:-GMAIL_ACCESS_TOKEN}" "${GMAIL_REFRESH_TOKEN:-GMAIL_REFRESH_TOKEN}" "${GMAIL_EXPIRES_AT:-2026-01-01T00:00:00Z}"
fi

# GitHub
subscribe github "${GITHUB_ACCESS_TOKEN:-GITHUB_ACCESS_TOKEN}" "${GITHUB_REFRESH_TOKEN:-}" "${GITHUB_EXPIRES_AT:-}"

# Discord
subscribe discord "${DISCORD_ACCESS_TOKEN:-DISCORD_ACCESS_TOKEN}" "${DISCORD_REFRESH_TOKEN:-DISCORD_REFRESH_TOKEN}" "${DISCORD_EXPIRES_AT:-2025-12-31T23:59:59Z}"

# Spotify
subscribe spotify "${SPOTIFY_ACCESS_TOKEN:-SPOTIFY_ACCESS_TOKEN}" "${SPOTIFY_REFRESH_TOKEN:-SPOTIFY_REFRESH_TOKEN}" "${SPOTIFY_EXPIRES_AT:-2025-12-31T23:59:59Z}"

# Telegram (bot token ou OAuth access)
subscribe telegram "${TELEGRAM_ACCESS_TOKEN:-TELEGRAM_ACCESS_TOKEN}" "${TELEGRAM_REFRESH_TOKEN:-}" "${TELEGRAM_EXPIRES_AT:-}"

# Twitter / X
subscribe twitter "${TWITTER_ACCESS_TOKEN:-TWITTER_ACCESS_TOKEN}" "${TWITTER_REFRESH_TOKEN:-TWITTER_REFRESH_TOKEN}" "${TWITTER_EXPIRES_AT:-2025-12-31T23:59:59Z}"

# WeatherAPI (clé API)
subscribe weatherapi "${WEATHERAPI_KEY:-WEATHERAPI_KEY}" "${WEATHERAPI_REFRESH_TOKEN:-}" "${WEATHERAPI_EXPIRES_AT:-}"

# System (pas de token requis, ignorer)
echo "System n'a pas besoin de token; abonnement inutile."
