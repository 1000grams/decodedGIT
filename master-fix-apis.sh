#!/bin/bash

set -e

# ===== USER CONFIG =====
COGNITO_USER_POOL_ID="eu-central-1_d9JNeVdni"
REGION="eu-central-1"
STAGE="prod"

# List of API Gateway IDs (SKIP dashboard's 2h2oj7u446)
API_IDS=(
  "y1zthsd7l0"  # decodedmusic-api
  "jyubkduhqb"  # CognitoProtectedAPI
  "w4s1qi2h6d"  # login APIs
)

# Ensure the Cognito Authorizer ID is fetched for each API dynamically
fetch_authorizer_id() {
  local api_id=$1
  echo "🔍 Fetching Cognito authorizer ID for API: $api_id"
  local authorizer_id=$(aws apigateway get-authorizers \
    --rest-api-id "$api_id" \
    --region "$REGION" \
    --query "items[?providerARNs[0]=='arn:aws:cognito-idp:$REGION:396913703024:userpool/$COGNITO_USER_POOL_ID'].id" \
    --output text)

  if [[ -z "$authorizer_id" ]]; then
    echo "❌ Could not find Cognito authorizer for API: $api_id. Skipping."
    return 1
  fi

  echo "✅ Cognito Authorizer ID for API $api_id: $authorizer_id"
  echo "$authorizer_id"
}

# ===== Function to update a resource =====
update_methods_and_cors() {
  local api_id=$1
  echo "🔧 Processing API: $api_id"

  # Fetch the Cognito Authorizer ID for the current API
  local authorizer_id
  authorizer_id=$(fetch_authorizer_id "$api_id") || return 1

  # Get all resource IDs
  RESOURCE_IDS=$(aws apigateway get-resources \
    --rest-api-id "$api_id" \
    --region "$REGION" \
    --query "items[?pathPart!=''].id" \
    --output text)

  for res_id in $RESOURCE_IDS; do
    echo "🔹 Updating Resource ID: $res_id"

    for method in GET POST; do
      echo "  ➕ Ensuring $method method exists with Cognito auth"
      aws apigateway put-method \
        --rest-api-id "$api_id" \
        --resource-id "$res_id" \
        --http-method "$method" \
        --authorization-type "COGNITO_USER_POOLS" \
        --authorizer-id "$authorizer_id" \
        --region "$REGION" \
        --no-api-key-required 2>/dev/null || true

      aws apigateway put-integration \
        --rest-api-id "$api_id" \
        --resource-id "$res_id" \
        --http-method "$method" \
        --type "AWS_PROXY" \
        --integration-http-method POST \
        --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:396913703024:function:prod-$(basename $res_id)/invocations" \
        --region "$REGION" 2>/dev/null || true
    done

    echo "  🌐 Ensuring OPTIONS method for CORS"
    aws apigateway put-method \
      --rest-api-id "$api_id" \
      --resource-id "$res_id" \
      --http-method OPTIONS \
      --authorization-type "NONE" \
      --region "$REGION" 2>/dev/null || true

    aws apigateway put-integration \
      --rest-api-id "$api_id" \
      --resource-id "$res_id" \
      --http-method OPTIONS \
      --type MOCK \
      --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
      --region "$REGION" 2>/dev/null || true

    aws apigateway put-method-response \
      --rest-api-id "$api_id" \
      --resource-id "$res_id" \
      --http-method OPTIONS \
      --status-code 200 \
      --response-parameters '{"method.response.header.Access-Control-Allow-Headers": true, "method.response.header.Access-Control-Allow-Methods": true, "method.response.header.Access-Control-Allow-Origin": true}' \
      --response-models '{"application/json": "Empty"}' \
      --region "$REGION" 2>/dev/null || true

    aws apigateway put-integration-response \
      --rest-api-id "$api_id" \
      --resource-id "$res_id" \
      --http-method OPTIONS \
      --status-code 200 \
      --response-parameters '{"method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'", "method.response.header.Access-Control-Allow-Methods": "'GET,POST,OPTIONS'", "method.response.header.Access-Control-Allow-Origin": "'*'"}' \
      --response-templates '{"application/json": ""}' \
      --region "$REGION" 2>/dev/null || true
  done

  echo "🚀 Deploying API: $api_id"
  aws apigateway create-deployment \
    --rest-api-id "$api_id" \
    --stage-name "$STAGE" \
    --region "$REGION"
}

# ===== Run updates for each API =====
for api_id in "${API_IDS[@]}"; do
  update_methods_and_cors "$api_id"
done

echo "✅ All APIs updated and deployed successfully."
