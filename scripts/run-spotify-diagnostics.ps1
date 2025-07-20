Write-Host "🔍 SPOTIFY DIAGNOSTIC TESTS" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n🐍 Testing Python availability..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   Python found: $pythonVersion" -ForegroundColor Green
    $pythonWorking = $true
} catch {
    Write-Host "    Python not found in PATH" -ForegroundColor Red
    $pythonWorking = $false
}

Write-Host "`n Testing API endpoint directly..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://m5vfcsuueh.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify" -Method GET -ErrorAction Stop
    Write-Host "    API endpoint responded successfully" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($statusCode -eq 401) {
        Write-Host "    Authentication required (expected)" -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "   🚫 Forbidden - check IAM permissions" -ForegroundColor Red
    } elseif ($statusCode -eq 500) {
        Write-Host "    Server error - check Lambda logs" -ForegroundColor Red
    } else {
        Write-Host "   ❌ API endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🔑 Testing AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "    AWS credentials working" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ AWS credentials not working: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Listing AWS Secrets..." -ForegroundColor Yellow
try {
    $secrets = aws secretsmanager list-secrets --region eu-central-1 --output json | ConvertFrom-Json
    Write-Host "    Found $($secrets.SecretList.Count) secrets" -ForegroundColor Green
    
    $spotifySecrets = $secrets.SecretList | Where-Object { $_.Name -like "*spotify*" }
    if ($spotifySecrets) {
        Write-Host "    Spotify secrets found:" -ForegroundColor Green
        $spotifySecrets | ForEach-Object { Write-Host "      - $($_.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "    No Spotify secrets found" -ForegroundColor Red
        Write-Host "    You need to create Spotify credentials in Secrets Manager" -ForegroundColor Yellow
    }
} catch {
    Write-Host "    Failed to list secrets: $($_.Exception.Message)" -ForegroundColor Red
}

if ($pythonWorking) {
    Write-Host "`n Running Python diagnostic script..." -ForegroundColor Yellow
    try {
        python test-spotify-api-direct.py
    } catch {
        Write-Host "    Python script failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n Skipping Python diagnostic (Python not available)" -ForegroundColor Red
    Write-Host "   Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

Write-Host "`n DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "=" * 50



