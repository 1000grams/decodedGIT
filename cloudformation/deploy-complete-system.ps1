# Complete decodedmusic Platform Deployment - FIXED VERSION

Write-Host "🚀 DEPLOYING COMPLETE DECODEDMUSIC PLATFORM" -ForegroundColor Cyan
Write-Host "🏢 AWS Account: 3969-1370-3024" -ForegroundColor White
Write-Host "🎵 Created by artist, for artists" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

$region = "eu-central-1"
$environment = "prod"

# Check if we're in the right directory
if (!(Test-Path "auth-stack.yml")) {
    if (Test-Path "cloudformation\auth-stack.yml") {
        Write-Host "📁 Changing to cloudformation directory..." -ForegroundColor Yellow
        Set-Location "cloudformation"
    } else {
        Write-Host "❌ CloudFormation templates not found! Creating them..." -ForegroundColor Red
        Write-Host "   Please run the template creation script first." -ForegroundColor Yellow
        exit 1
    }
}

# 1. Deploy Authentication Stack
Write-Host "`n🔐 Deploying Authentication Stack..." -ForegroundColor Green
try {
    aws cloudformation deploy `
      --template-file auth-stack.yml `
      --stack-name decodedmusic-auth `
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
      --region $region `
      --parameter-overrides Environment=$environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Authentication stack deployed successfully!" -ForegroundColor Green
    } else {
        throw "Authentication stack deployment failed"
    }
} catch {
    Write-Host "❌ Authentication stack deployment failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Deploy Subscription Stack
Write-Host "`n💳 Deploying Subscription Stack..." -ForegroundColor Green
try {
    aws cloudformation deploy `
      --template-file subscription-stack.yml `
      --stack-name decodedmusic-subscription `
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
      --region $region `
      --parameter-overrides Environment=$environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Subscription stack deployed successfully!" -ForegroundColor Green
    } else {
        throw "Subscription stack deployment failed"
    }
} catch {
    Write-Host "❌ Subscription stack deployment failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Deploy API Gateway
Write-Host "`n🌐 Deploying API Gateway..." -ForegroundColor Green
try {
    aws cloudformation deploy `
      --template-file api-gateway.yml `
      --stack-name decodedmusic-api `
      --capabilities CAPABILITY_IAM `
      --region $region `
      --parameter-overrides Environment=$environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API Gateway deployed successfully!" -ForegroundColor Green
    } else {
        throw "API Gateway deployment failed"
    }
} catch {
    Write-Host "❌ API Gateway deployment failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Deploy Marketing Hub (if exists)
if (Test-Path "marketing-hub.yml") {
    Write-Host "`n📊 Deploying Marketing Hub..." -ForegroundColor Green
    try {
        aws cloudformation deploy `
          --template-file marketing-hub.yml `
          --stack-name decodedmusic-marketing-hub `
          --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
          --region $region `
          --parameter-overrides Environment=$environment
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Marketing Hub deployed successfully!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Marketing Hub deployment failed: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️ marketing-hub.yml not found, skipping..." -ForegroundColor Yellow
}

# 5. Get API Endpoint
Write-Host "`n🔗 Getting API Endpoint..." -ForegroundColor Yellow
try {
    $apiEndpoint = aws cloudformation describe-stacks --stack-name decodedmusic-api --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text --region $region
    
    if ($apiEndpoint) {
        Write-Host "✅ API Endpoint retrieved: $apiEndpoint" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Could not retrieve API endpoint" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Error getting API endpoint: $_" -ForegroundColor Yellow
}

Write-Host "`n🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "`n📊 PLATFORM STATUS:" -ForegroundColor Cyan
Write-Host "   🔗 API Endpoint: $apiEndpoint" -ForegroundColor White
Write-Host "   🔐 Cognito Pool: eu-central-1_d9JNeVdni" -ForegroundColor White
Write-Host "   📱 App Client: 5pb29tja8gkqm3jb43oimd5qjt" -ForegroundColor White
Write-Host "   📧 Support: ops@decodedmusic.com" -ForegroundColor White
Write-Host "   🏢 AWS Account: 3969-1370-3024" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Update .env file with API endpoint: $apiEndpoint" -ForegroundColor White
Write-Host "   2. Test endpoints: $apiEndpoint/auth (POST), $apiEndpoint/subscription (POST)" -ForegroundColor White
Write-Host "   3. Deploy frontend files to S3" -ForegroundColor White
Write-Host "   4. Configure Stripe for subscription payments" -ForegroundColor White
Write-Host "   5. Test full authentication flow" -ForegroundColor White

# Update .env file if found
if (Test-Path "../.env") {
    Write-Host "`n📝 Updating .env file..." -ForegroundColor Yellow
    $envContent = Get-Content "../.env"
    $envContent = $envContent -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=$apiEndpoint"
    $envContent | Out-File "../.env" -Encoding UTF8
    Write-Host "✅ .env file updated with new API endpoint!" -ForegroundColor Green
}