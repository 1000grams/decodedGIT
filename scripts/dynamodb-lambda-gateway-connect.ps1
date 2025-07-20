# Define the AWS region
$Region = "eu-central-1"

# Verify and connect DynamoDB <-> Lambda <-> Gateway
$LambdaFunctions = @(
    "prod-dashboardStreams",
    "prod-dashboardEarnings",
    "prod-dashboardCatalog"
)

$DynamoDBTables = @(
    "prod-DecodedStreams",
    "prod-DecodedEarnings",
    "prod-Catalog"
)

foreach ($lambda in $LambdaFunctions) {
    Write-Host "🔄 Verifying Lambda function: $lambda"

    $envVars = aws lambda get-function-configuration --function-name $lambda --region $Region --query "Environment.Variables" --output json

    foreach ($table in $DynamoDBTables) {
        if ($envVars -match $table) {
            Write-Host "✅ Lambda $lambda is connected to table $table"
        } else {
            Write-Host "❌ Lambda $lambda is missing connection to table $table"
        }
    }
}

Write-Host "🔄 Verifying API Gateway integration"
$ApiId = "2h2oj7u446"
$Endpoints = @(
    "/dashboard/streams",
    "/dashboard/earnings",
    "/dashboard/catalog"
)

foreach ($endpoint in $Endpoints) {
    $resourceId = aws apigateway get-resources --rest-api-id $ApiId --region $Region --query "items[?path=='$endpoint'].id" --output text

    if ($resourceId) {
        Write-Host "✅ API Gateway has resource for $endpoint"
    } else {
        Write-Host "❌ Missing resource for $endpoint"
    }
}

Write-Host "✅ Verification complete."
