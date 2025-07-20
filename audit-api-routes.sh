#!/bin/bash

# This script audits all API Gateway REST APIs in a given region and lists their routes and attached Lambdas.
# Requires: AWS CLI v2, jq

REGION="eu-central-1"
TMP_FILE="api_resources.tmp"

echo "Fetching all REST APIs in region: $REGION"
API_IDS=$(aws apigateway get-rest-apis --region $REGION --output json | jq -r '.items[] | "\(.id) \(.name)"')

echo ""
echo "-------------------------"
echo "API Gateway Route Mapping"
echo "-------------------------"

# Loop through each API ID
echo "$API_IDS" | while read API_ID API_NAME; do
  echo ""
  echo "🔹 API: $API_NAME ($API_ID)"

  # Get root resource ID
  ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --output json | jq -r '.items[] | select(.path == "/") | .id')

  # Get all resources
  aws apigateway get-resources --rest-api-id $API_ID --region $REGION --embed methods --output json > $TMP_FILE

  # Parse each resource + methods
  jq -r '.items[] | select(.resourceMethods != null) | 
    .path as $path | 
    .resourceMethods | keys[] as $method | 
    "\($method) \($path)"' $TMP_FILE | while read METHOD PATH; do
      # Extract Lambda ARN if exists
      RESOURCE_ID=$(jq -r --arg path "$PATH" '.items[] | select(.path == $path) | .id' $TMP_FILE)
      LAMBDA_ARN=$(aws apigateway get-integration         --rest-api-id $API_ID         --resource-id $RESOURCE_ID         --http-method $METHOD         --region $REGION         --output json 2>/dev/null | jq -r '.uri // "N/A"' | sed 's/.*functions\///;s/\/invocations.*//')

      printf "  - 🛣️ [%-6s] %-40s ➝ Lambda: %s\n" "$METHOD" "$PATH" "$LAMBDA_ARN"
  done
done

rm -f $TMP_FILE
