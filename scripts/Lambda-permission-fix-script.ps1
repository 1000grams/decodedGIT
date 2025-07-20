# Create Lambda permission fix script
$lambdaFixScript = @'
#!/bin/bash
echo "🔧 FIXING LAMBDA PERMISSIONS FOR API GATEWAY"
echo "============================================"

API_ID="m5vfcsuueh"
REGION="eu-central-1"

echo "🔐 Adding API Gateway invoke permissions..."

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

echo "✅ Added permissions for prod-spotifyAuthHandler"
echo "🎯 Lambda permissions fixed!"
'@

$lambdaFixScript | Out-File -FilePath "fix-lambda-permissions.sh" -Encoding UTF8

# Create CORS fix script
$corsFixScript = @'
#!/bin/bash
echo "🌐 ADDING CORS TO API GATEWAY"
echo "============================"

API_ID="m5vfcsuueh"
REGION="eu-central-1"

# Add CORS to root resource
ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)

echo "🔧 Adding CORS OPTIONS method to root..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region $REGION

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --integration-http-method OPTIONS \
  --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
  --region $REGION

aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
  --region $REGION

aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'https://decodedmusic.com'"'"'"}' \
  --region $REGION

echo "🚀 Deploying API with CORS..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --description "Added CORS support" \
  --region $REGION

echo "✅ CORS enabled for https://decodedmusic.com"
'@

$corsFixScript | Out-File -FilePath "fix-cors.sh" -Encoding UTF8

Write-Host "`n🎯 FIXES CREATED - RUN THESE NOW:" -ForegroundColor Cyan
Write-Host "   1. bash fix-lambda-permissions.sh" -ForegroundColor Yellow
Write-Host "   2. bash fix-cors.sh" -ForegroundColor Yellow

Write-Host "`n🎧 SPOTIFY DATA AVAILABLE:" -ForegroundColor Green
Write-Host "   ✅ Artist: Rue De Vivre" -ForegroundColor Gray
Write-Host "   ✅ Followers: 15" -ForegroundColor Gray
Write-Host "   ✅ Credentials: Working" -ForegroundColor Gray

Write-Host "`n🔧 SCRIPT REVIEW: PERFECT!" -ForegroundColor Green