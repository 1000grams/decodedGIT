#!/bin/bash

# REQUIRED: Set your region
REGION="eu-central-1"

# List of REST API IDs and their names (adjust as needed)
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

echo "🔍 Verifying API integrations and CORS setup..."

for api_id in "${!apis[@]}"; do
  name="${apis[$api_id]}"
  echo -e "\n=== 🔧 API: $name ($api_id) ==="

  # Get all resources
  resources=$(aws apigateway get-resources --rest-api-id "$api_id" --region "$REGION" --output json)

  # Loop through each resource
  echo "$resources" | jq -c '.items[]' | while read -r resource; do
    path=$(echo "$resource" | jq -r '.path')
    id=$(echo "$resource" | jq -r '.id')

    echo -e "\n🛣️  Path: $path"

    # List methods
    methods=$(echo "$resource" | jq -r '.resourceMethods | keys[]?' 2>/dev/null)

    for method in $methods; do
      echo -n "  ➤ [$method] "

      # Get integration info
      integration=$(aws apigateway get-integration --rest-api-id "$api_id" --resource-id "$id" --http-method "$method" --region "$REGION" 2>/dev/null)
      type=$(echo "$integration" | jq -r '.type // "NO_INTEGRATION"')

      if [[ "$type" == "AWS_PROXY" || "$type" == "AWS" ]]; then
        uri=$(echo "$integration" | jq -r '.uri')
        echo "🔗 Lambda: $uri"
      elif [[ "$type" == "MOCK" ]]; then
        echo "⚠️ MOCK integration"
      else
        echo "❌ No integration"
      fi
    done

    # Check if OPTIONS method has CORS headers
    cors_headers=$(aws apigateway get-method --rest-api-id "$api_id" --resource-id "$id" --http-method OPTIONS --region "$REGION" 2>/dev/null | jq '.methodResponses."200".responseParameters')

    if echo "$cors_headers" | grep -q 'Access-Control-Allow-Origin'; then
      echo "  ✅ CORS: Access-Control-Allow-Origin present"
    else
      echo "  ⚠️  CORS: NOT configured"
    fi
  done

  # Check if deployed to 'prod'
  deployed=$(aws apigateway get-stage --rest-api-id "$api_id" --stage-name prod --region "$REGION" 2>/dev/null)
  if [[ -n "$deployed" ]]; then
    echo "🚀 Deployed to stage: prod"
  else
    echo "⚠️  NOT deployed to 'prod' stage"
  fi

done
