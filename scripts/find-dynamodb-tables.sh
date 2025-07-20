```powershell
#!/bin/bash

# Configuration
$lambdaFunctions = @(
    "prod-dashboardStreams",
    "prod-dashboardEarnings"
)
$dynamodbTables = @(
    "prod-DecodedStreams",
    "prod-DecodedEarnings"
)
$apiBaseUrl = "https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod"
$frontendEnvFile = ".\frontend\.env"

Write-Host "`n🔍 Verifying backend and frontend configuration...`n"

# Step 1: Verify DynamoDB Tables
Write-Host "➡️  Checking DynamoDB tables...`n"
foreach ($table in $dynamodbTables) {
    Write-Host "🔍 Checking table: $table"
    $tableStatus = aws dynamodb describe-table --table-name $table --query "Table.TableStatus" --output text 2>$null
    if ($tableStatus -eq "ACTIVE") {
        Write-Host "✅ Table $table exists and is active."
    } else {
        Write-Host "❌ Table $table does not exist or is not active."
    }
}

# Step 2: Verify Lambda Function Environment Variables
Write-Host "`n➡️  Checking Lambda function environment variables...`n"
foreach ($lambda in $lambdaFunctions) {
    Write-Host "🔍 Checking Lambda function: $lambda"
    $envVars = aws lambda get-function-configuration --function-name $lambda --query "Environment.Variables" --output json 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Unable to retrieve configuration for Lambda function: $lambda"
        continue
    }
    Write-Host "Environment Variables for ${lambda}:`n$envVars"
    foreach ($table in $dynamodbTables) {
        if ($envVars -match $table) {
            Write-Host "✅ Lambda function $lambda is configured with table $table."
        } else {
            Write-Host "❌ Lambda function $lambda is missing configuration for table $table."
        }
    }
}

# Step 3: Test API Endpoints
Write-Host "`n➡️  Testing API endpoints...`n"
$endpoints = @(
    "/dashboard/streams",
    "/dashboard/earnings"
)
foreach ($ep in $endpoints) {
    $url = "$apiBaseUrl$ep"
    Write-Host "🔍 Testing endpoint: $url"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        Write-Host "✅ API endpoint $url is working."
    } catch {
        Write-Host "❌ API endpoint $url returned an error: $($_.Exception.Message)"
    }
}

# Step 4: Verify Frontend Configuration
Write-Host "`n➡️  Checking frontend configuration...`n"
if (Test-Path $frontendEnvFile) {
    Write-Host "🔍 Found frontend .env file: $frontendEnvFile"
    $envContent = Get-Content $frontendEnvFile
    if ($envContent -match "REACT_APP_API_BASE_URL=$apiBaseUrl") {
        Write-Host "✅ Frontend .env file is correctly configured with API base URL."
    } else {
        Write-Host "❌ Frontend .env file is missing or has an incorrect API base URL."
    }
} else {
    Write-Host "❌ Frontend .env file not found at $frontendEnvFile."
}

Write-Host "`n✅ Verification complete."
```