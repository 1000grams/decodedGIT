# API Configuration
$API_HOSTNAME = "2h2oj7u446.execute-api.eu-central-1.amazonaws.com"
$API_PATH = "/dashboard/catalog"
$API_URL = "https://$API_HOSTNAME$API_PATH"
$AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" # Replace with a valid token

# Function to validate the API
function Validate-API {
    Write-Host "🚀 Sending request to API: $API_URL"

    try {
        # Make the API request using Invoke-RestMethod
        $response = Invoke-RestMethod -Uri $API_URL -Headers @{ Authorization = $AUTH_TOKEN } -Method GET
        Write-Host "✅ API request successful!"
        Write-Host "Response Body:"
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ API request failed!"
        Write-Host "Error Message: $($_.Exception.Message)"
    }
}

# Check if the route exists
function Check-Route {
    Write-Host "🔍 Checking if route exists..."
    try {
        $resources = aws apigateway get-resources --rest-api-id 2h2oj7u446 | ConvertFrom-Json
        $routeExists = $resources.items | Where-Object { $_.path -eq "/dashboard/catalog" }
        if ($routeExists) {
            Write-Host "✅ Route exists: /dashboard/catalog"
        } else {
            Write-Host "❌ Route not found: /dashboard/catalog"
        }
    } catch {
        Write-Host "❌ Failed to check route!"
        Write-Host "Error Message: $($_.Exception.Message)"
    }
}

# Check CORS configuration
function Check-CORS {
    Write-Host "🔍 Checking CORS configuration..."
    try {
        $method = aws apigateway get-method --rest-api-id 2h2oj7u446 --resource-id vi70h2 --http-method OPTIONS | ConvertFrom-Json
        if ($method.responseParameters."method.response.header.Access-Control-Allow-Origin") {
            Write-Host "✅ CORS is enabled!"
        } else {
            Write-Host "❌ CORS is not enabled!"
        }
    } catch {
        Write-Host "❌ Failed to check CORS!"
        Write-Host "Error Message: $($_.Exception.Message)"
    }
}

# Run the validation
Validate-API
Check-Route
Check-CORS