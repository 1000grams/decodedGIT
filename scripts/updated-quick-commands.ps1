# ...existing code...

Write-Host "🔍 SPOTIFY DASHBOARD DEBUGGING:" -ForegroundColor Red
Write-Host "   python test-spotify-api-direct.py             # Test Spotify API directly"
Write-Host "   python debug-spotify-setup.py                 # Check credentials & setup"
Write-Host "   # Check CloudWatch logs for dashboardSpotify Lambda"
Write-Host "   # Browser: F12 > Console at decodedmusic.com/dashboard"
Write-Host ""

Write-Host "🔧 SPOTIFY FIXES:" -ForegroundColor Red
Write-Host "   # Deploy debug version of Spotify Lambda"
Write-Host "   # Check Secrets Manager for 'prod/spotify/credentials'"
Write-Host "   # Verify Cognito user has Spotify permissions"
Write-Host ""

# ...rest of existing code...