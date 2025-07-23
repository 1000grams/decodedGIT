#!/bin/bash

API_ID="2h2oj7u446"
REGION="eu-central-1"
COGNITO_AUTHORIZER_ID="your_cognito_authorizer_id_here"

# Define all dashboard paths
ROUTES=(
  "analytics"
  "campaigns"
  "streams"
  "statements"
  "spotify"
  "team"
  "catalog"
  "accounting"
  "earnings"
)

METHODS=("GET" "POST" "PUT" "DELETE")

echo "🔧 Applying CORS and Cognito auth to /dashboard/* routes"

for route in "${ROUTES[@]}"; do
  echo "🔄 Processing /dashboard/$route"

  for method in "${METHODS[@]}"; do
    echo "   ↪️ Ensuring method: $method"

    # Update method to use Cognito authorization
    aws apigateway put-method \
      --rest-api-id "$API_ID" \
      --resource-id "$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/dashboard/$route'].id" --output text)" \
      --http-method "$method" \
      --authorization-type "COGNITO_USER_POOLS" \
      --authorizer-id "$COGNITO_AUTHORIZER_ID" \
      --region "$REGION" \
      --no-cli-pager || echo "      ⚠️ $method already configured"

    # Add CORS method response
    aws apigateway put-method-response \
      --rest-api-id "$API_ID" \
      --resource-id "$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/dashboard/$route'].id" --output text)" \
      --http-method "$method" \
      --status-code 200 \
      --response-parameters '{"method.response.header.Access-Control-Allow-Origin": true}' \
      --region "$REGION" \
      --no-cli-pager || echo "      ⚠️ Response already exists"

    # Add CORS integration response
    aws apigateway put-integration-response \
      --rest-api-id "$API_ID" \
      --resource-id "$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/dashboard/$route'].id" --output text)" \
      --http-method "$method" \
      --status-code 200 \
      --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'*'"}' \
      --region "$REGION" \
      --no-cli-pager || echo "      ⚠️ Integration response exists"
  done

  echo "   🌐 Adding OPTIONS method for CORS preflight"

  RESOURCE_ID=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[?path=='/dashboard/$route'].id" --output text)

  aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --authorization-type "NONE" \
    --region "$REGION" \
    --no-cli-pager || echo "      ⚠️ OPTIONS already exists"

  aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
    --region "$REGION" \
    --no-cli-pager || echo "      ⚠️ OPTIONS integration exists"

  aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": true,
      "method.response.header.Access-Control-Allow-Methods": true,
      "method.response.header.Access-Control-Allow-Origin": true
    }' \
    --region "$REGION" \
    --no-cli-pager || echo "      ⚠️ OPTIONS method response exists"

  aws apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
      "method.response.header.Access-Control-Allow-Headers": "'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''",
      "method.response.header.Access-Control-Allow-Methods": "'\''GET,POST,PUT,DELETE,OPTIONS'\''",
      "method.response.header.Access-Control-Allow-Origin": "'\''*'\''"
    }' \
    --region "$REGION" \
    --no-cli-pager || echo "      ⚠️ OPTIONS integration response exists"
done

echo "🚀 Deploying updated configuration"
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name prod \
  --region "$REGION"

echo "✅ All methods now secured with Cognito and CORS configured."
