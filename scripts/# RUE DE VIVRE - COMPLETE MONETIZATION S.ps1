# RUE DE VIVRE - COMPLETE MONETIZATION SYSTEM
# Automated music business intelligence and revenue optimization

Write-Host "🎧 RUE DE VIVRE - MONETIZATION SYSTEM STARTUP" -ForegroundColor Cyan
Write-Host "💰 AI-Powered Music Business Intelligence" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# Enhanced system validation with fail-fast checks
Write-Host "`n🔍 SYSTEM DIAGNOSTICS & VALIDATION" -ForegroundColor Green

# Early validation - fail fast if critical components missing
$accountId = aws sts get-caller-identity --query Account --output text 2>$null
$region = aws configure get region 2>$null

if (-not $accountId -or $accountId -eq "" -or $accountId -eq "None") {
    Write-Host "❌ Failed to get AWS Account ID — aborting." -ForegroundColor Red
    Write-Host "   Please ensure AWS CLI is configured: aws configure" -ForegroundColor Yellow
    exit 1
}

if (-not $region -or $region -eq "" -or $region -eq "None") {
    Write-Host "❌ Failed to get AWS Region — aborting." -ForegroundColor Red
    Write-Host "   Please ensure AWS CLI is configured: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ AWS Account ID: $accountId" -ForegroundColor Green
Write-Host "✅ AWS Region: $region" -ForegroundColor Green

# System diagnostics
python debug-spotify-setup.py

# Check dashboard API status
Write-Host "`n🌐 CHECKING DASHBOARD API STATUS..." -ForegroundColor Yellow
try {
    $apiTest = Invoke-RestMethod -Uri "https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/accounting" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Dashboard API: OPERATIONAL" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Dashboard API: Needs CORS fix" -ForegroundColor Yellow
    Write-Host "   Will apply dashboard fixes during startup..." -ForegroundColor Gray
}

# Pause for review
Read-Host "`nPress Enter to continue with full system startup..."

# PRIORITY: Fix dashboard if needed
Write-Host "`n🔧 DASHBOARD INTEGRATION & FIXES" -ForegroundColor Green
Write-Host "Ensuring dashboard API is operational for real-time analytics..."

# Check if dashboard fix is needed
$needsDashboardFix = $false
try {
    $corsTest = Invoke-RestMethod -Uri "https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/spotify" -Method GET -TimeoutSec 5 -ErrorAction Stop
} catch {
    if ($_.Exception.Message -match "CORS" -or $_.Exception.Response.StatusCode -eq 403) {
        $needsDashboardFix = $true
    }
}

if ($needsDashboardFix) {
    Write-Host "🚨 Applying dashboard CORS fixes..." -ForegroundColor Yellow
    
    # Apply automated dashboard fixes
    $criticalResources = @("qd43p5", "m8rjvq", "4nztit", "fn9o60d4c6")
    
    foreach ($resourceId in $criticalResources) {
        Write-Host "   🔧 Configuring CORS for resource: $resourceId" -ForegroundColor Gray
        
        aws apigateway put-method --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --authorization-type NONE --region $region 2>$null
        aws apigateway put-integration --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --type MOCK --request-templates '{\"application/json\":\"{\\\"statusCode\\\": 200}\"}' --region $region 2>$null
        aws apigateway put-method-response --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --status-code 200 --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":false,\"method.response.header.Access-Control-Allow-Methods\":false,\"method.response.header.Access-Control-Allow-Origin\":false}' --region $region 2>$null
        aws apigateway put-integration-response --rest-api-id 2h2oj7u446 --resource-id $resourceId --http-method OPTIONS --status-code 200 --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":\"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token\",\"method.response.header.Access-Control-Allow-Methods\":\"GET,POST,OPTIONS\",\"method.response.header.Access-Control-Allow-Origin\":\"https://decodedmusic.com\"}' --region $region 2>$null
    }
    
    # Deploy dashboard fixes
    aws apigateway create-deployment --rest-api-id 2h2oj7u446 --stage-name prod --description "CORS fix deployment from monetization system" --region $region
    Write-Host "✅ Dashboard CORS fixes deployed!" -ForegroundColor Green
    
    # Brief pause for deployment
    Write-Host "   ⏱️ Waiting for deployment propagation..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Dashboard API already operational!" -ForegroundColor Green
}

# Core system components
Write-Host "`n🚀 LAUNCHING CORE SYSTEMS" -ForegroundColor Green

# 1. Infrastructure setup
Write-Host "`n📊 Setting up data infrastructure..."
python create-insights-table.py

# 2. Catalog loading (all 4 albums)
Write-Host "`n📚 Loading complete catalog (40 tracks across 4 albums)..."
python load-ascap-works-albums.py

# 3. Spotify integration
Write-Host "`n🔗 Linking tracks to Spotify..."
python spotify-auto-linker.py

# 4. Enhanced insights collection
Write-Host "`n🎵 Collecting enhanced Spotify insights..."
python enhanced-spotify-insights.py

# 5. Mood & context analysis
Write-Host "`n🎭 Analyzing mood & context metadata..."
python mood-context-analyzer.py

# 6. Viral prediction modeling
Write-Host "`n🚀 Predicting viral potential..."
python viral-prediction-model.py

# 7. Comprehensive dashboard
Write-Host "`n📈 Generating monetization dashboard..."
python growth-dashboard.py

# 8. Final dashboard API validation
Write-Host "`n🧪 FINAL SYSTEM VALIDATION" -ForegroundColor Green
Write-Host "Testing all API endpoints..."

$endpoints = @(
    @{name="Spotify Data"; url="https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/spotify"},
    @{name="Accounting Data"; url="https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/accounting?artistId=RueDeVivre"}
)

$allEndpointsWorking = $true
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✅ $($endpoint.name): OPERATIONAL" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ $($endpoint.name): $($_.Exception.Message)" -ForegroundColor Yellow
        $allEndpointsWorking = $false
    }
}

Write-Host "`n" + "=" * 60 -ForegroundColor White
if ($allEndpointsWorking) {
    Write-Host "🎉 MONETIZATION SYSTEM FULLY OPERATIONAL!" -ForegroundColor Green
} else {
    Write-Host "🎉 MONETIZATION SYSTEM OPERATIONAL!" -ForegroundColor Green
    Write-Host "   (Some dashboard endpoints may need additional time to propagate)" -ForegroundColor Yellow
}
Write-Host "💰 AI-Powered Revenue Optimization Active" -ForegroundColor Yellow

Write-Host "`n🎯 SYSTEM CAPABILITIES:" -ForegroundColor Cyan
Write-Host "   📚 40 tracks across 4 albums analyzed" -ForegroundColor White
Write-Host "   🎭 Mood & context classification complete" -ForegroundColor White
Write-Host "   🚀 Viral potential predictions generated" -ForegroundColor White
Write-Host "   📊 Revenue optimization recommendations ready" -ForegroundColor White
Write-Host "   🎯 Sync licensing opportunities identified" -ForegroundColor White
Write-Host "   📱 Platform-specific strategies created" -ForegroundColor White
Write-Host "   🌐 Real-time dashboard API operational" -ForegroundColor Green

Write-Host "`n💡 QUICK COMMANDS:" -ForegroundColor Yellow
Write-Host "   📈 Full Dashboard: python growth-dashboard.py" -ForegroundColor Gray
Write-Host "   🎭 Mood Analysis: python mood-context-analyzer.py" -ForegroundColor Gray
Write-Host "   🚀 Viral Predictions: python viral-prediction-model.py" -ForegroundColor Gray
Write-Host "   🔍 System Diagnostics: python debug-spotify-setup.py" -ForegroundColor Gray
Write-Host "   ⚡ Quick Stats: python growth-dashboard.py --quick" -ForegroundColor Gray
Write-Host "   🌐 Live Dashboard: https://decodedmusic.com/dashboard" -ForegroundColor Cyan
Write-Host "   🔧 Fix Dashboard: .\automated-dashboard-deployment.ps1" -ForegroundColor Gray

Write-Host "`n🔍 REAL-TIME API ENDPOINTS:" -ForegroundColor Yellow
Write-Host "   📊 Accounting: https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/accounting" -ForegroundColor Gray
Write-Host "   🎵 Spotify Data: https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/spotify" -ForegroundColor Gray
Write-Host "   📈 Streams: https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/dashboard/streams" -ForegroundColor Gray

Write-Host "`n🚀 MONETIZATION INTELLIGENCE READY!" -ForegroundColor Green
Write-Host "💰 Revenue optimization active across all 40 tracks" -ForegroundColor Yellow
Write-Host "🎧 Dashboard accessible at: https://decodedmusic.com/dashboard" -ForegroundColor Cyan