#!/usr/bin/env bash
set -euo pipefail

API_ID="2h2oj7u446"
REGION="eu-central-1"

echo "🔍 Scanning API Gateway ($API_ID) for CORS configuration issues and patching if needed..."

# Get all resources and their IDs
resources=$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION" --query "items[*].{id:id,path:path}" --output json)

# Extract array length
resource_count=$(echo "$resources" | jq length)

for (( i=0; i<resource_count; i++ ))
do
  path=$(echo "$resources" | jq -r ".[$i].path")
  resource_id=$(echo "$resources" | jq -r ".[$i].id")

  echo "🔎 Checking resource: $path ($resource_id)"

  for method in GET POST OPTIONS
  do
    if aws apigateway get-method --rest-api-id "$API_ID" --resource-id "$resource_id" --http-method "$method" --region "$REGION" > /dev/null 2>&1; then
      echo "→ $method method exists"

      # Check method response
      if aws apigateway get-method-response --rest-api-id "$API_ID" --resource-id "$resource_id" --http-method "$method" --status-code 200 --region "$REGION" > /dev/null 2>&1; then
        echo "   ✅ Method response for $method 200 exists"
      else
        echo "   ⚠️ Missing method response for $method – patching..."
        aws apigateway update-method-response           --rest-api-id "$API_ID"           --resource-id "$resource_id"           --http-method "$method"           --status-code 200           --patch-operations op=add,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value=true           --region "$REGION" || echo "     ❌ Failed to patch method response"
      fi

      # Patch integration response
      echo "   🔧 Attempting to patch integration response..."
      aws apigateway update-integration-response         --rest-api-id "$API_ID"         --resource-id "$resource_id"         --http-method "$method"         --status-code 200         --patch-operations           op=add,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value="'*'"         --region "$REGION" > /dev/null 2>&1 || echo "     ⚠️ Could not patch integration response (may not be required for proxy integrations)"

    else
      echo "→ $method method does not exist"
    fi
  done

  # Ensure OPTIONS method exists
  if aws apigateway get-method --rest-api-id "$API_ID" --resource-id "$resource_id" --http-method OPTIONS --region "$REGION" > /dev/null 2>&1; then
    echo "   ✅ OPTIONS method already exists"
  else
    echo "   ➕ Creating OPTIONS method..."
    aws apigateway put-method       --rest-api-id "$API_ID"       --resource-id "$resource_id"       --http-method OPTIONS       --authorization-type NONE       --region "$REGION"

    aws apigateway put-integration       --rest-api-id "$API_ID"       --resource-id "$resource_id"       --http-method OPTIONS       --type MOCK       --request-templates file://<(echo '{ "application/json": "{\"statusCode\": 200}"' )       --region "$REGION"

    aws apigateway put-method-response       --rest-api-id "$API_ID"       --resource-id "$resource_id"       --http-method OPTIONS       --status-code 200       --response-parameters method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true       --response-models '{"application/json":"Empty"}'       --region "$REGION"

    aws apigateway put-integration-response       --rest-api-id "$API_ID"       --resource-id "$resource_id"       --http-method OPTIONS       --status-code 200       --selection-pattern ""       --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'","method.response.header.Access-Control-Allow-Methods":"'GET,POST,OPTIONS'","method.response.header.Access-Control-Allow-Origin":"'*'"}'       --response-templates '{"application/json": ""}'       --region "$REGION"
  fi
done

echo "🚀 Deploying to 'prod'..."
aws apigateway create-deployment   --rest-api-id "$API_ID"   --stage-name prod   --region "$REGION"   --description "CORS auto-audit and patch"

echo "✅ CORS audit and patching complete."
