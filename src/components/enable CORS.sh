#!/bin/bash

# Configuration
API_ID="2h2oj7u446"
STAGE_NAME="prod"

# Get the resource ID for the /api/dashboard path
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/api/dashboard'].id" --output text)

if [ -z "$RESOURCE_ID" ]; then
  echo "Error: Unable to find resource ID for /api/dashboard"
  exit 1
fi

echo "Resource ID for /api/dashboard: $RESOURCE_ID"

# Enable CORS for the OPTIONS method
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "method.response.header.Access-Control-Allow-Origin=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Headers=true"

aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "method.response.header.Access-Control-Allow-Origin='*',method.response.header.Access-Control-Allow-Methods='GET,POST,PUT,DELETE,OPTIONS',method.response.header.Access-Control-Allow-Headers='Content-Type,Authorization'"

# Deploy the API
aws apigateway create-deployment --rest-api-id $API_ID --stage-name $STAGE_NAME

echo "CORS has been enabled and the API has been deployed to the $STAGE_NAME stage."