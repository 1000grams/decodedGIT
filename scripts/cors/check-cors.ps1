# check-cors.ps1 - Verify CORS headers on API Gateway routes (PowerShell version)

$ErrorActionPreference = 'Stop'

$API_ID = "2h2oj7u446"
$REGION = "eu-central-1"

# Fetch all routes with methods
$routes = aws apigateway get-resources `
    --rest-api-id $API_ID `
    --region $REGION `
    --query "items[?resourceMethods].{id:id,path:path,methods:keys(resourceMethods)}" `
    --output json | ConvertFrom-Json

foreach ($route in $routes) {
    $resourceId = $route.id
    $path = $route.path
    $methods = $route.methods
    foreach ($method in $methods) {
        Write-Host "Checking $method $path"
        if ($method -ne "OPTIONS") {
            try {
                $corsAllowed = aws apigateway get-method-response `
                    --rest-api-id $API_ID `
                    --resource-id $resourceId `
                    --http-method $method `
                    --status-code 200 `
                    --region $REGION `
                    --query 'responseParameters."method.response.header.Access-Control-Allow-Origin"' `
                    --output text
            } catch {
                $corsAllowed = "MISSING"
            }
            if ($corsAllowed -eq "true") {
                Write-Host "CORS header present on $method $path"
            } else {
                Write-Host "Missing Access-Control-Allow-Origin on $method $path"
            }
        }
        if ($method -eq "GET") {
            try {
                $optionsExists = aws apigateway get-method `
                    --rest-api-id $API_ID `
                    --resource-id $resourceId `
                    --http-method OPTIONS `
                    --region $REGION `
                    --query "httpMethod" `
                    --output text
            } catch {
                $optionsExists = "MISSING"
            }
            if ($optionsExists -eq "OPTIONS") {
                Write-Host "OPTIONS method exists for $path"
            } else {
                Write-Host "OPTIONS method missing for $path"
            }
        }
        Write-Host "---"
    }
}

Write-Host "Done checking all routes"
