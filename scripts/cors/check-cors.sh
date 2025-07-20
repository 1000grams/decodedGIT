#!/usr/bin/env bash
# check-cors.sh - Verify CORS headers on API Gateway routes (for GPT-4.1 Copilot use)

set -euo pipefail

API_ID="2h2oj7u446"
REGION="eu-central-1"
STAGE="prod"

# Fetch all routes with methods
ROUTES=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --query "items[?resourceMethods].{id:id,path:path,methods:keys(resourceMethods)}" \
  --output json)

# Guard against empty or invalid output which can cause jq errors
if ! echo "$ROUTES" | jq -e 'length > 0' >/dev/null 2>&1; then
  echo "❌ Failed to fetch routes or no routes returned"
  exit 1
fi

# Loop through each route and method
for row in $(echo "$ROUTES" | jq -c '.[]'); do
  RESOURCE_ID=$(echo "$row" | jq -r '.id')
  PATH=$(echo "$row" | jq -r '.path')
  METHODS=$(echo "$row" | jq -r '.methods[]')

  for METHOD in $METHODS; do
    echo "🔍 Checking $METHOD $PATH"

    # Skip OPTIONS; it's validated separately
    if [ "$METHOD" != "OPTIONS" ]; then
      CORS_ALLOWED=$(aws apigateway get-method-response \
        --rest-api-id "$API_ID" \
        --resource-id "$RESOURCE_ID" \
        --http-method "$METHOD" \
        --status-code 200 \
        --region "$REGION" \
        --query 'responseParameters."method.response.header.Access-Control-Allow-Origin"' \
        --output text 2>/dev/null || echo "MISSING")

      if [ "$CORS_ALLOWED" == "true" ]; then
        echo "✅ CORS header present on $METHOD $PATH"
      else
        echo "❌ Missing Access-Control-Allow-Origin on $METHOD $PATH"
      fi
    fi

    # Confirm OPTIONS exists
    if [ "$METHOD" == "GET" ]; then
      OPTIONS_EXISTS=$(aws apigateway get-method \
        --rest-api-id "$API_ID" \
        --resource-id "$RESOURCE_ID" \
        --http-method OPTIONS \
        --region "$REGION" \
        --query "httpMethod" \
        --output text 2>/dev/null || echo "MISSING")

      if [ "$OPTIONS_EXISTS" == "OPTIONS" ]; then
        echo "✅ OPTIONS method exists for $PATH"
      else
        echo "⚠️ OPTIONS method missing for $PATH"
      fi
    fi

    echo "---"
  done

done

echo "✅ Done checking all routes"
