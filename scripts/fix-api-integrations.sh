#!/bin/bash

# Set region
REGION="eu-central-1"

# Map of API IDs and expected method-to-Lambda integrations
declare -A integrations=(
  # Format: [apiId:path:method]=lambdaName
  ["jyubkduhqb:/check:GET"]="prod-authLogin"
  ["9zlblaqwo0:/pitch:POST"]="prod-pitchHandler"
  ["w4s1qi2h6d:/catalog:GET"]="prod-catalog-handler"
  ["0930nh8tai:/artistmanager:POST"]="prod-artistManager"
  ["y1zthsd7l0:/auth/login:POST"]="prod-authLogin"
)

# Cognito Authorizer ARN
COGNITO_AUTHORIZER_ID="cy09jc"

fix_integration_and_cors() {
  local apiId=$1
  local path=$2
  local method=$3
  local lambda=$4
  local lambdaArn="arn:aws:lambda:$REGION:396913703024:function:$lambda"

  echo "🔧 Fixing $method $path on API $apiId → Lambda $lambda"

  resourceId=$(aws apigateway get-resources --rest-api-id "$apiId" --query "items[?path=='$path'].id" --output text)

  # Create method (ignore if already exists)
  aws apigateway put-method \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method "$method" \
    --authorization-type "COGNITO_USER_POOLS" \
    --authorizer-id "$COGNITO_AUTHORIZER_ID" 2>/dev/null || echo "⚠️ Method $method already exists"

  # Add integration
  aws apigateway put-integration \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method "$method" \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$lambdaArn/invocations"

  # Add CORS OPTIONS method if not exists
  aws apigateway put-method \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --authorization-type "NONE" 2>/dev/null || echo "⚠️ OPTIONS already exists"

  aws apigateway put-integration \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" 2>/dev/null || echo "⚠️ OPTIONS integration exists"

  aws apigateway put-method-response \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true \
    --response-models '{"application/json":"Empty"}' 2>/dev/null || echo "⚠️ OPTIONS response exists"

  aws apigateway put-integration-response \
    --rest-api-id "$apiId" \
    --resource-id "$resourceId" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters "{\n      \"method.response.header.Access-Control-Allow-Headers\": \"'Content-Type,X-Amz-Date,Authorization,X-Api-Key'\",\n      \"method.response.header.Access-Control-Allow-Methods\": \"'GET,POST,PUT,DELETE,OPTIONS'\",\n      \"method.response.header.Access-Control-Allow-Origin\": \"'*'\"\n    }" 2>/dev/null || echo "⚠️ OPTIONS integration response exists"

  echo "✅ Fixed: $apiId $path $method"
}

retry_deployment() {
  local apiId=$1
  local retries=5
  local delay=5

  for ((i=1; i<=retries; i++)); do
    echo "🚀 Attempting deployment for API $apiId (Attempt $i/$retries)..."
    if aws apigateway create-deployment --rest-api-id "$apiId" --stage-name prod; then
      echo "✅ Deployed $apiId to prod"
      return
    else
      echo "⚠️ Deployment failed, retrying in $delay seconds..."
      sleep $delay
      delay=$((delay * 2))
    fi
  done

  echo "❌ Failed to deploy $apiId after $retries attempts"
}

# Run fixes
for key in "${!integrations[@]}"; do
  IFS=":" read -r apiId path method <<< "$key"
  lambda=${integrations[$key]}
  fix_integration_and_cors "$apiId" "$path" "$method" "$lambda"
  retry_deployment "$apiId"

done

echo "🎉 All integrations and CORS headers fixed!"
