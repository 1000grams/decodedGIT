#!/bin/bash
# automate-verify-spotify-env.sh
# Verify Spotify-related environment variables for the spotifyArtistFetcher Lambda
# and optionally update them if missing. Intended for AWS CloudShell. The Lambda
# now expects SPOTIFY_CREDENTIALS_SECRET instead of separate ID/secret values.

set -euo pipefail

LAMBDA_NAME="${LAMBDA_NAME:-spotifyArtistFetcher}"
REQUIRED_VARS=(SPOTIFY_CREDENTIALS_SECRET ARTIST_IDS SPOTIFY_TABLE)

# Fetch current Lambda environment variables
current=$(aws lambda get-function-configuration \
  --function-name "$LAMBDA_NAME" \
  --query 'Environment.Variables' --output json)

# Track variables in an associative array
declare -A env
for key in $(echo "$current" | jq -r 'keys[]'); do
  env[$key]=$(echo "$current" | jq -r --arg k "$key" '.[$k]')
done

missing=()
for var in "${REQUIRED_VARS[@]}"; do
  val="${env[$var]:-}"
  if [[ -z "$val" || "$val" == "null" ]]; then
    missing+=("$var")
    echo "❌ $var not set"
  else
    echo "✅ $var present"
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Updating Lambda environment with provided values..."
  for var in "${missing[@]}"; do
    new_val="${!var:-}"
    if [[ -z "$new_val" ]]; then
      echo "Skipping $var – provide it as an environment variable to set it"
    else
      env[$var]="$new_val"
    fi
  done
  env_json="{"
  first=1
  for k in "${!env[@]}"; do
    [[ $first -eq 0 ]] && env_json+=","
    first=0
    env_json+="\"$k\":\"${env[$k]}\""
  done
  env_json+="}"
  aws lambda update-function-configuration \
    --function-name "$LAMBDA_NAME" \
    --environment "Variables=$env_json" >/dev/null
  echo "Lambda environment updated"
else
  echo "All required variables are set"
fi
