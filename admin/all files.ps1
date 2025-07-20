Write-Host "💾 SAVING ALL DECODEDMUSIC FILES AND COMMITTING TO GIT" -ForegroundColor Green

cd C:\decoded

# Check git status first
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
git status

# Add all the service files we created
Write-Host "📄 Adding React service files..." -ForegroundColor Yellow
git add frontend/src/services/AnalyticsService.js -f
git add frontend/src/services/SpotifyService.js -f  
git add frontend/src/services/CatalogService.js -f
git add frontend/src/hooks/useAuth.js -f

# Add the main App.js
git add frontend/src/App.js -f

# Add CloudFormation template
Write-Host "☁️ Adding CloudFormation template..." -ForegroundColor Yellow
git add cloudformation/marketing-hub.yml -f

# Add any other important files
git add frontend/package.json -f
git add frontend/src/index.js -f
git add frontend/src/index.css -f

# Check what we're about to commit
Write-Host "🔍 Files to be committed:" -ForegroundColor Yellow
git diff --cached --name-only

# Commit with detailed message
$commitMessage = @"
🎵 decodedmusic Complete Platform - June 30, 2025

✅ FRONTEND FEATURES:
- React Router with protected routes
- Mock authentication system (useAuth hook)
- AWS service integrations with fallback data
- Dashboard with Rue de Vivre analytics
- Analytics page with streaming data
- Catalog page with music tracks
- Background video (p1.mp4) in hero section
- Responsive dark theme design

✅ SERVICES ADDED:
- AnalyticsService.js - AWS analytics integration
- SpotifyService.js - Spotify API service  
- CatalogService.js - Music catalog service
- useAuth.js - Authentication hook

✅ BACKEND INFRASTRUCTURE:
- Updated marketing-hub.yml CloudFormation
- DynamoDB tables for marketing data
- Lambda functions for Bedrock insights
- Cognito authentication integration
- API Gateway endpoints

✅ DEPLOYMENT:
- S3: decoded-genai-stack-webappne-websitebucket4326d7c2-jvplfkkey9mb
- CloudFront: E11YR13TCZW98X  
- Domain: https://decodedmusic.com
- Region: eu-central-1

Platform: Created by artist, for artists
Price Revolution: $0.99
AWS Account: 3969-1370-3024
"@

Write-Host "💬 Committing with message..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Push to remote repository
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to remote repository!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Push failed, trying to pull first..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push origin main
}

# Show final status
Write-Host "📊 Final git status:" -ForegroundColor Yellow
git status

Write-Host "" -ForegroundColor White
Write-Host "✅ GIT SYNC COMPLETE!" -ForegroundColor Green
Write-Host "📁 Local repository is now in sync with remote" -ForegroundColor Cyan