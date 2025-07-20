#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <rest-api-id> [region] [stage]" >&2
  exit 1
fi

API_ID="$1"
REGION="${2:-eu-central-1}"
STAGE_NAME="${3:-prod}"

PATHS=(
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

aws_cli() {
  aws --region "$REGION" "$@"
}

echo "🔧 Enabling CORS on API ID $API_ID in $REGION for stage $STAGE_NAME"
for path in "${PATHS[@]}"; do
  echo "🔍 Processing path: $path"
  RESOURCE_ID=$(aws_cli apigateway get-resources --rest-api-id "$API_ID" \
    --query "items[?path=='$path'].id" --output text)

  if [[ -z "$RESOURCE_ID" || "$RESOURCE_ID" == "None" ]]; then
    echo "  ⚠️ Resource not found, skipping: $path"
    continue
  fi

  aws_cli apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --authorization-type NONE >/dev/null 2>&1 || true

  aws_cli apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\": 200}"}' >/dev/null

  aws_cli apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": true,
      "method.response.header.Access-Control-Allow-Methods": true,
      "method.response.header.Access-Control-Allow-Origin": true
    }' \
    --response-models '{"application/json":"Empty"}' >/dev/null 2>&1 || true

  aws_cli apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --selection-pattern '' \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": "\"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token\"",
      "method.response.header.Access-Control-Allow-Methods": "\"GET,POST,OPTIONS,PUT,DELETE,PATCH\"",
      "method.response.header.Access-Control-Allow-Origin": "\"*\""
    }' \
    --response-templates '{"application/json":""}' >/dev/null

  echo "✅ CORS enabled for $path"
done

echo "🚀 Deploying updated API to stage: $STAGE_NAME"
aws_cli apigateway create-deployment --rest-api-id "$API_ID" --stage-name "$STAGE_NAME" --description "Enable CORS" >/dev/null

echo "🎉 All CORS routes configured and deployed"
