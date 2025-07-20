#!/bin/bash

set -e

# ===== CONFIG =====
API_ID="2h2oj7u446"  # 🔁 Your API Gateway ID
REGION="eu-central-1"
STAGE_NAME="prod"
LAMBDA_PREFIX="prod-dashboard"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
COGNITO_AUTHORIZER_ID="l8m8wy"  # Cognito Authorizer ID

declare -A routes=(
  ["/dashboard/catalog"]="Catalog"
  ["/dashboard/streams"]="Streams"
  ["/dashboard/earnings"]="Earnings"
  ["/dashboard/statements"]="Statements"
  ["/dashboard/analytics"]="Analytics"
  ["/dashboard/accounting"]="Accounting"
  ["/dashboard/campaigns"]="Campaigns"
  ["/dashboard/spotify"]="Spotify"
  ["/dashboard/team"]="Team"
)

methods=("GET" "POST" "PUT" "DELETE")

# Routes that should use a single ANY method instead of separate verbs
declare -A any_routes=(
  ["/dashboard/analytics"]=1
  ["/dashboard/spotify"]=1
  ["/dashboard/streams"]=1
)

# ===== LOOP THROUGH ROUTES =====
for path in "${!routes[@]}"; do
  lambdaName="$LAMBDA_PREFIX${routes[$path]}"
  echo "🔧 Configuring $path → Lambda: $lambdaName"

  resourceId=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" \
    --query "items[?path=='$path'].id" --output text)

  if [ -z "$resourceId" ]; then
    echo "❌ Resource not found for $path"
    continue
  fi

  # ===== CONNECT ROUTE TO LAMBDA =====
  if [[ -n "${any_routes[$path]}" ]]; then
    method_list=("ANY")
  else
    method_list=("${methods[@]}")
  fi

  for method in "${method_list[@]}"; do
    # Check if method already exists
    existing=$(aws apigateway get-method --rest-api-id "$API_ID" --resource-id "$resourceId" --http-method "$method" --region "$REGION" 2>/dev/null || true)
    if [ -z "$existing" ]; then
      echo "➕ Creating $method method"
      aws apigateway put-method --rest-api-id "$API_ID" \
        --resource-id "$resourceId" \
        --http-method "$method" \
        --authorization-type "COGNITO_USER_POOLS" \
        --authorizer-id "$COGNITO_AUTHORIZER_ID" \
        --region "$REGION"
    else
      echo "ℹ️ $method already exists"
    fi

    echo "🔗 Linking $method to Lambda $lambdaName"
    aws apigateway put-integration --rest-api-id "$API_ID" \
      --resource-id "$resourceId" \
      --http-method "$method" \
      --type AWS_PROXY \
      --integration-http-method POST \
      --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$lambdaName/invocations" \
      --region "$REGION" || true
  done

  # ===== CORS CONFIGURATION (OPTIONS) =====
  echo "🌐 Configuring CORS on $path"

  aws apigateway put-method --rest-api-id "$API_ID" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --authorization-type "NONE" \
    --region "$REGION" || true

  aws apigateway put-integration --rest-api-id "$API_ID" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
    --region "$REGION" || true

  aws apigateway put-method-response --rest-api-id "$API_ID" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": true,
      "method.response.header.Access-Control-Allow-Origin": true,
      "method.response.header.Access-Control-Allow-Methods": true
    }' \
    --region "$REGION" || true

  aws apigateway put-integration-response --rest-api-id "$API_ID" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": "*",
      "method.response.header.Access-Control-Allow-Origin": "*",
      "method.response.header.Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    }' \
    --region "$REGION" || true
done

# ===== DEPLOY =====
echo "🚀 Deploying changes..."
aws apigateway create-deployment --rest-api-id "$API_ID" \
  --stage-name "$STAGE_NAME" --region "$REGION"

echo "✅ All routes connected and deployed."
