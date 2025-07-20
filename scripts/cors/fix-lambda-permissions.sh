#!/bin/bash
echo " FIXING LAMBDA PERMISSIONS FOR API GATEWAY"
echo "============================================"

API_ID="m5vfcsuueh"
REGION="eu-central-1"

echo " Adding API Gateway invoke permissions..."

# Fix prod-dashboardSpotify
aws lambda add-permission \
  --function-name prod-dashboardSpotify \
  --statement-id allow-api-gateway-invoke-spotify \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:eu-central-1:*:${API_ID}/*" \
  --region $REGION

echo "✅ Added permissions for prod-dashboardSpotify"

# Fix prod-spotifyAuthHandler  
aws lambda add-permission \
  --function-name prod-spotifyAuthHandler \
  --statement-id allow-api-gateway-invoke-auth \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:eu-central-1:*:${API_ID}/*" \
  --region $REGION

echo " Added permissions for prod-spotifyAuthHandler"
echo " Lambda permissions fixed!"
