# PowerShell version of the fixes for Windows users
Write-Host "🔧 FIXING DASHBOARD API GATEWAY" -ForegroundColor Cyan 
Write-Host "==============================="

# Get AWS account ID
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "🔐 Using Account ID: $accountId" -ForegroundColor Yellow

# Fix Lambda permissions
Write-Host "`n🔧 FIXING LAMBDA PERMISSIONS..." -ForegroundColor Yellow

aws lambda add-permission --function-name prod-dashboardSpotify --statement-id allow-dashboard-api-invoke-spotify4 --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-central-1:${accountId}:2h2oj7u446/*" --region eu-central-1

aws lambda add-permission --function-name prod-spotifyAuthHandler --statement-id allow-dashboard-api-invoke-auth4 --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-central-1:${accountId}:2h2oj7u446/*" --region eu-central-1

aws lambda add-permission --function-name prod-dashboardAccounting --statement-id allow-dashboard-api-invoke-accounting4 --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-central-1:${accountId}:2h2oj7u446/*" --region eu-central-1

Write-Host "✅ Lambda permissions fixed!" -ForegroundColor Green

# Fix CORS headers
Write-Host "`n🌐 FIXING CORS HEADERS..." -ForegroundColor Yellow

# Get all resources
$resources = aws apigateway get-resources --rest-api-id 2h2oj7u446 --region eu-central-1 --query 'items[].[id,path]' --output text

# Add CORS to each resource
$resources -split "`n" | ForEach-Object {
    if ($_ -ne "") {
        $parts = $_ -split "`t"
        $resourceId = $parts[0]
        $resourcePath = $parts[1]
        
        Write-Host "   Adding CORS to: $resourcePath" -ForegroundColor Gray
        
        # Add OPTIONS method (ignore if exists)
        aws apigateway put-method --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --authorization-type NONE --region eu-central-1 2>$null
        
        # Add integration 
        aws apigateway put-integration --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --type MOCK --integration-http-method OPTIONS --request-templates '{\"application/json\":\"{\\\"statusCode\\\": 200}\"}' --region eu-central-1 2>$null
        
        # Add method response
        aws apigateway put-method-response --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --status-code 200 --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":false,\"method.response.header.Access-Control-Allow-Methods\":false,\"method.response.header.Access-Control-Allow-Origin\":false}' --region eu-central-1 2>$null
        
        # Add integration response with CORS headers (this is the key fix)
        aws apigateway put-integration-response --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --status-code 200 --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":\"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token\",\"method.response.header.Access-Control-Allow-Methods\":\"GET,POST,PUT,DELETE,OPTIONS\",\"method.response.header.Access-Control-Allow-Origin\":\"https://decodedmusic.com\"}' --region eu-central-1 2>$null
    }
}

# Deploy the changes
Write-Host "`n🚀 DEPLOYING API CHANGES..." -ForegroundColor Yellow
aws apigateway create-deployment --rest-api-id 2h2oj7u446 --stage-name prod --description "Fixed Lambda permissions and CORS" --region eu-central-1

Write-Host "`n✅ ALL FIXES APPLIED!" -ForegroundColor Green
Write-Host "🌐 Dashboard: https://decodedmusic.com/dashboard" -ForegroundColor Cyan
Write-Host "🎧 Hard refresh (Ctrl+F5) to see changes!" -ForegroundColor Yellow