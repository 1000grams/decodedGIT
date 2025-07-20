# Base URL for the API
$baseUrl = "https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod"

# List of endpoints to test
$endpoints = @(
    "/",
    "/signup",
    "/pitch",
    "/catalog",
    "/dashboard/streams",
    "/dashboard/catalog",
    "/dashboard/earnings"
)

Write-Host "`n🔍 Starting basic endpoint tests..." -ForegroundColor Cyan

# Loop through each endpoint and test it
foreach ($ep in $endpoints) {
    $url = "$baseUrl$ep"
    Write-Host "`n➡️  Testing: $url" -ForegroundColor Yellow
    try {
        # Send a GET request to the endpoint
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        Write-Host "✅ Success: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Green
    } catch {
        # Handle errors and display the error message
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Basic API test complete." -ForegroundColor Cyan