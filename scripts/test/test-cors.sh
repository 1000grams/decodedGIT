#!/bin/bash
# Script to test CORS headers for given API routes
# Usage: ./test-cors.sh https://api-id.execute-api.region.amazonaws.com/prod

BASE_URL="$1"
if [ -z "$BASE_URL" ]; then
  echo "Usage: $0 <base_api_url>" >&2
  exit 1
fi

ROUTES=(
  "/backend"
  "/streams"
  "/team"
  "/accounting"
  "/analytics"
  "/campaigns"
  "/catalog"
  "/earnings"
  "/statements"
)

for path in "${ROUTES[@]}"; do
  url="${BASE_URL}${path}"
  echo "🔍 Testing CORS for $url"
  headers=$(curl -s -D - -o /dev/null -X OPTIONS "$url" \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: POST")
  if echo "$headers" | grep -qi 'Access-Control-Allow-Origin:'; then
    echo "✅ CORS headers present"
    echo "$headers" | grep -i 'Access-Control-Allow-.*'
  else
    echo "❌ CORS headers missing"
    echo "$headers"
  fi
  echo
done
