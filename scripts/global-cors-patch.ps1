# Apply global CORS patch to all API Gateway endpoints
$ApiId = "2h2oj7u446"
$Region = "eu-central-1"

$Resources = aws apigateway get-resources --rest-api-id $ApiId --query "items[].id" --output text

foreach ($resourceId in $Resources) {
    Write-Host "🔄 Applying CORS to resource $resourceId"

    aws apigateway put-method-response `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method OPTIONS `
        --status-code 200 `
        --response-parameters "method.response.header.Access-Control-Allow-Origin=true"

    aws apigateway put-integration-response `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method OPTIONS `
        --status-code 200 `
        --response-templates '{"application/json": ""}'

    Write-Host "✅ Applied CORS to resource $resourceId"
}

Write-Host "🔄 Deploying API Gateway changes"
aws apigateway create-deployment --rest-api-id $ApiId --stage-name prod

Write-Host "✅ Deployment complete."
