# Apply Cognito Authorizer to protected routes
$ApiId = "2h2oj7u446"
$Region = "eu-central-1"
$AuthorizerId = "5fxmkd"
$Endpoints = @(
    "/dashboard/*",
    "/catalog"
)

foreach ($endpoint in $Endpoints) {
    Write-Host "🔄 Applying Cognito Authorizer to $endpoint"

    $resourceId = aws apigateway get-resources --rest-api-id $ApiId --region $Region --query "items[?path=='$endpoint'].id" --output text

    aws apigateway update-method `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method GET `
        --region $Region `
        --patch-operations op="replace",path="/authorizationType",value="COGNITO_USER_POOLS" op="replace",path="/authorizerId",value="$AuthorizerId"

    Write-Host "✅ Applied Cognito Authorizer to $endpoint"
}

Write-Host "🔄 Deploying API Gateway changes"
aws apigateway create-deployment --rest-api-id $ApiId --region $Region --stage-name prod

Write-Host "✅ Deployment complete."
