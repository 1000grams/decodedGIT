d/catalog
$ApiId = "2h2oj7u446"
$Region = "eu-central-1"
$Endpoints = @(
    "/catalog",
    "/dashboard/catalog"
)

foreach ($endpoint in $Endpoints) {
    Write-Host "🔄 Adding GET and OPTIONS methods to $endpoint"

    $resourceId = aws apigateway get-resources --rest-api-id $ApiId --query "items[?path=='$endpoint'].id" --output text

    # Add GET method
    aws apigateway put-method `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method GET `
        --authorization-type NONE

    # Add OPTIONS method
    aws apigateway put-method `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method OPTIONS `
        --authorization-type NONE

    Write-Host "✅ Added GET and OPTIONS methods to $endpoint"
}

Write-Host "🔄 Deploying API Gateway changes"
aws apigateway create-deployment --rest-api-id $ApiId --stage-name prod

Write-Host "✅ Deployment complete."
