Write-Host "🎧 SPOTIFY DASHBOARD DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "🔍 Checking Spotify integration on decodedmusic.com/dashboard" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 STEP 1: BACKEND SPOTIFY HEALTH CHECK" -ForegroundColor Green
Write-Host "   python debug-spotify-setup.py                 # Check credentials & API access"
Write-Host "   python test-spotify-api-direct.py             # Direct API test"
Write-Host ""

Write-Host "📡 STEP 2: LAMBDA FUNCTION TESTING" -ForegroundColor Green  
Write-Host "   # Test dashboard Spotify endpoint directly:"
Write-Host "   curl https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify"
Write-Host ""

Write-Host "🌐 STEP 3: FRONTEND API CALLS" -ForegroundColor Green
Write-Host "   # Check browser console at decodedmusic.com/dashboard"
Write-Host "   # Look for 401, 403, 500 errors on Spotify API calls"
Write-Host ""

Write-Host "🔑 STEP 4: COGNITO TOKEN VALIDATION" -ForegroundColor Green
Write-Host "   # Verify user tokens have proper Spotify scopes"
Write-Host "   python validate-cognito-spotify-tokens.py"
Write-Host ""