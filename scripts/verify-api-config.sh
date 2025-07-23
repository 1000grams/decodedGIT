#!/bin/bash
set -euo pipefail

REGION=${AWS_REGION:-eu-central-1}

# List of REST API IDs and their names
declare -A apis=(
  ["2h2oj7u446"]="DashboardAPI"
  ["0930nh8tai"]="DecodedMusicAPI"
  ["jyubkduhqb"]="CognitoProtectedAPI"
  ["6msaiqit9j"]="DecodedMusicBackend"
  ["9zlblaqwo0"]="PitchAPI"
  ["m5vfcsuueh"]="DecodedMusicBackendApi"
  ["urwizt0j58"]="DecodedMusicBackendApi2"
  ["w4s1qi2h6d"]="prod-decoded-api"
  ["y1zthsd7l0"]="prod-decodedmusic-api"
)

get_resources() {
  aws apigateway get-resources \
    --rest-api-id "$1" \
    --region "$REGION" \
    --output json
}

verify_resource() {
  local api_id=$1
  local resource=$2
  local path=$(echo "$resource" | jq -r '.path')
  local id=$(echo "$resource" | jq -r '.id')

  echo -e "\n🛣️  Path: $path"

  local methods=$(echo "$resource" | jq -r '.resourceMethods | keys[]?' 2>/dev/null)
  for method in $methods; do
    echo -n "  ➤ [$method] "
    local integration=$(aws apigateway get-integration --rest-api-id "$api_id" --resource-id "$id" --http-method "$method" --region "$REGION" 2>/dev/null)
    local type=$(echo "$integration" | jq -r '.type // "NO_INTEGRATION"')
    if [[ "$type" == "AWS_PROXY" || "$type" == "AWS" ]]; then
      local uri=$(echo "$integration" | jq -r '.uri')
      echo "🔗 Lambda: $uri"
    elif [[ "$type" == "MOCK" ]]; then
      echo "⚠️ MOCK integration"
    else
      echo "❌ No integration"
    fi
  done

  local cors_headers=$(aws apigateway get-method --rest-api-id "$api_id" --resource-id "$id" --http-method OPTIONS --region "$REGION" 2>/dev/null | jq '.methodResponses."200".responseParameters')
  if echo "$cors_headers" | grep -q 'Access-Control-Allow-Origin'; then
    echo "  ✅ CORS: Access-Control-Allow-Origin present"
  else
    echo "  ⚠️  CORS: NOT configured"
  fi
}

verify_stage() {
  local api_id=$1
  local deployed=$(aws apigateway get-stage --rest-api-id "$api_id" --stage-name prod --region "$REGION" 2>/dev/null)
  if [[ -n "$deployed" ]]; then
    echo "🚀 Deployed to stage: prod"
  else
    echo "⚠️  NOT deployed to 'prod' stage"
  fi
}

verify_api() {
  local api_id=$1
  local name=$2
  echo -e "\n=== 🔧 API: $name ($api_id) ==="
  local resources=$(get_resources "$api_id")
  echo "$resources" | jq -c '.items[]' | while read -r resource; do
    verify_resource "$api_id" "$resource"
  done
  verify_stage "$api_id"
}

main() {
  echo "🔍 Verifying API integrations and CORS setup..."
  for api_id in "${!apis[@]}"; do
    verify_api "$api_id" "${apis[$api_id]}"
  done
}

main "$@"
