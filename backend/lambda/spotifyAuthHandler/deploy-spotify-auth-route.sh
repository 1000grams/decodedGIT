#!/bin/bash
# Automate API Gateway route creation and Lambda integration for /spotify/auth
# Usage: bash deploy-spotify-auth-route.sh

set -e

API_ID="2h2oj7u446"
REGION="eu-central-1"
LAMBDA_ARN="arn:aws:lambda:$REGION:396913703024:function:prod-spotifyAuthHandler"
LAMBDA_NAME="prod-spotifyAuthHandler"

# Get root resource ID
PARENT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query "items[?path=='/'].id" \
  --output text)

# Get or create /spotify
SPOTIFY_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query "items[?path=='/spotify'].id" \
  --output text)
if [ -z "$SPOTIFY_ID" ]; then
  SPOTIFY_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $PARENT_ID \
    --path-part spotify \
    --region $REGION \
    --query 'id' --output text)
fi

# Get or create /spotify/auth
AUTH_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query "items[?path=='/spotify/auth'].id" \
  --output text)
if [ -z "$AUTH_ID" ]; then
  AUTH_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $SPOTIFY_ID \
    --path-part auth \
    --region $REGION \
    --query 'id' --output text)
fi

# Add GET method (if not present)
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $AUTH_ID \
  --http-method GET \
  --authorization-type "NONE" \
  --region $REGION || true

# Link Lambda to GET
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $AUTH_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations \
  --region $REGION

# Grant invoke permission (ignore if already exists)
aws lambda add-permission \
  --function-name $LAMBDA_NAME \
  --statement-id apigateway-access-auth \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:$REGION:396913703024:$API_ID/*/GET/spotify/auth \
  --region $REGION || true

# Deploy the new route
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region $REGION

echo "Deployment complete. Test: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/spotify/auth"
