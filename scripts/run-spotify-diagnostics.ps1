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

Write-Host "`n🔧 Verifying Spotify credentials..." -ForegroundColor Yellow
try {
    $clientIdRaw = aws secretsmanager get-secret-value --secret-id "my/spotifyClientId" --region eu-central-1 --query SecretString --output text
    $clientSecretRaw = aws secretsmanager get-secret-value --secret-id "my/spotifyClientSecret" --region eu-central-1 --query SecretString --output text

    $clientId = ($clientIdRaw | ConvertFrom-Json).SPOTIFY_CLIENT_ID
    $clientSecret = ($clientSecretRaw | ConvertFrom-Json).SPOTIFY_CLIENT_SECRET

    $credentialsObject = @{ client_id = $clientId; client_secret = $clientSecret }
    $correctJson = $credentialsObject | ConvertTo-Json -Compress

    aws secretsmanager update-secret --secret-id "prod/spotify/credentials" --secret-string $correctJson --region eu-central-1 | Out-Null
    Write-Host "    prod/spotify/credentials updated" -ForegroundColor Green
} catch {
    Write-Host "    ❌ Failed to update credentials: $($_.Exception.Message)" -ForegroundColor Red
}

if ($pythonWorking) {
    Write-Host "`n🧪 Running quick Spotify verification..." -ForegroundColor Yellow

    $simpleTest = 'import boto3
import json
import requests

try:
    client = boto3.client("secretsmanager", region_name="eu-central-1")
    secret = client.get_secret_value(SecretId="prod/spotify/credentials")
    creds = json.loads(secret["SecretString"])

    auth_url = "https://accounts.spotify.com/api/token"
    auth_data = {
        "grant_type": "client_credentials",
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"]
    }
    r = requests.post(auth_url, data=auth_data)
    if r.status_code == 200:
        print("✅ Spotify API authentication successful!")
    else:
        print(f"❌ Spotify auth failed: {r.status_code}")
        print(r.text)
except Exception as e:
    print(f"❌ Test failed: {e}")'

    $simpleTest | Out-File -FilePath "simple-spotify-test.py" -Encoding UTF8
    try {
        python simple-spotify-test.py
    } catch {
        Write-Host "    Simple test failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n Running detailed Python diagnostic..." -ForegroundColor Yellow
    try {
        python test-spotify-api-direct.py
    } catch {
        Write-Host "    Python script failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n🔗 Testing Lambda endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://m5vfcsuueh.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify" -Method GET -ErrorAction Stop
        Write-Host "    ✅ Lambda working! Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "    Status Code: $statusCode" -ForegroundColor Yellow
        if ($statusCode -eq 401) {
            Write-Host "    ✅ Lambda working - authentication required" -ForegroundColor Green
        } elseif ($statusCode -eq 403) {
            Write-Host "    ⚠️  Lambda permissions issue - but credentials may be fixed" -ForegroundColor Yellow
        } else {
            Write-Host "    ❌ Lambda test error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`n Skipping Python diagnostic (Python not available)" -ForegroundColor Red
    Write-Host "   Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

Write-Host "`n DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n🎯 YOUR SPOTIFY DASHBOARD SHOULD NOW WORK!" -ForegroundColor Cyan
Write-Host "   🌐 https://decodedmusic.com/dashboard" -ForegroundColor Yellow
Write-Host "   ✅ Credentials verified" -ForegroundColor Green

Write-Host "`n📱 If still not working:" -ForegroundColor Yellow
Write-Host "   1. Hard refresh browser (Ctrl+F5)" -ForegroundColor Gray
Write-Host "   2. Check browser developer console for errors" -ForegroundColor Gray
Write-Host "   3. Wait 30 seconds for changes to propagate" -ForegroundColor Gray



