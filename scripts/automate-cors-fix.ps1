# Configuration
$LambdaFunctions = @(
    "prod-dashboardStreams",
    "prod-dashboardEarnings"
)
$Region = "eu-central-1"

# Update Lambda functions to include CORS headers
foreach ($lambda in $LambdaFunctions) {
    Write-Host "🔄 Updating Lambda function: $lambda"

    # Download the current function code
    $functionCodeUrl = aws lambda get-function --function-name $lambda --region $Region --query 'Code.Location' --output text
    Invoke-WebRequest -Uri $functionCodeUrl -OutFile function_code.zip

    # Unzip, modify, and re-zip the function code
    Expand-Archive -Path function_code.zip -DestinationPath function_code -Force
    (Get-Content -Path function_code\index.js) -replace 'headers: {', 'headers: {`n        "Access-Control-Allow-Origin": "*",' | Set-Content -Path function_code\index.js
    Compress-Archive -Path function_code\* -DestinationPath function_code.zip -Force

    # Update the Lambda function with the modified code
    aws lambda update-function-code --function-name $lambda --region $Region --zip-file fileb://function_code.zip

    Write-Host "✅ Updated Lambda function: $lambda"

    # Clean up temporary files
    Remove-Item -Recurse -Force function_code, function_code.zip
}

# Enable CORS in API Gateway
$ApiId = "2h2oj7u446"

$Endpoints = @(
    "/dashboard/streams",
    "/dashboard/earnings"
)

foreach ($endpoint in $Endpoints) {
    Write-Host "🔄 Enabling CORS for endpoint: $endpoint"

    $resourceId = aws apigateway get-resources --rest-api-id $ApiId --region $Region --query "items[?path=='$endpoint'].id" --output text

    # Update the put-integration-response block to use a valid response template
    aws apigateway put-integration-response `
      --rest-api-id $ApiId `
      --resource-id $resourceId `
      --http-method OPTIONS `
      --region $Region `
      --status-code 200 `
      --response-templates '{"application/json": ""}'

    # Update the put-method-response block to skip if it already exists
    try {
        aws apigateway put-method-response `
            --rest-api-id $ApiId `
            --resource-id $resourceId `
            --http-method OPTIONS `
            --region $Region `
            --status-code 200 `
            --response-parameters "method.response.header.Access-Control-Allow-Origin=true"
    } catch {
        if ($_.Exception.Message -like "*Response already exists*") {
            Write-Host "⚠️ Method response already exists — skipping."
        } else {
            throw $_
        }
    }

    aws apigateway put-method-response `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method GET `
        --region $Region `
        --status-code 200 `
        --response-parameters "method.response.header.Access-Control-Allow-Origin=true"

    aws apigateway put-integration-response `
        --rest-api-id $ApiId `
        --resource-id $resourceId `
        --http-method GET `
        --region $Region `
        --status-code 200 `
        --response-parameters "method.response.header.Access-Control-Allow-Origin='*'"

    Write-Host "✅ Enabled CORS for endpoint: $endpoint"
}

# Deploy the API Gateway changes
Write-Host "🔄 Deploying API Gateway changes"
aws apigateway create-deployment --rest-api-id $ApiId --region $Region --stage-name prod

Write-Host "✅ CORS fix automation complete."
