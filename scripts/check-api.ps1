Write-Host "🚀 Starting API Check..." -ForegroundColor Cyan

# Define API URL and token
$apiUrl = "https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/catalog"
$authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

# Test API with Invoke-WebRequest
Write-Host "🔍 Testing API with PowerShell..."
try {
    $response = Invoke-WebRequest -Uri $apiUrl -Method GET -Headers @{ Authorization = $authToken }
    Write-Host "✅ PowerShell API Check Passed!"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
} catch {
    Write-Host "❌ PowerShell API Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API with Node.js script
Write-Host "🔍 Testing API with Node.js..."
try {
    node C:\decoded\test-api.js
} catch {
    Write-Host "❌ Node.js API Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 API Check Completed!" -ForegroundColor Green