Write-Host "🚀 COMPLETE FRONTEND INTEGRATION - AUTOMATED RUN" -ForegroundColor Cyan
Write-Host "💻 Running all steps automatically..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# Step 1: Run fixed PowerShell generator
Write-Host "`n📄 Step 1: Generating dashboard files..." -ForegroundColor Green
try {
    & ".\FIXED-FRONTEND-GENERATOR.ps1"
    Write-Host "   ✅ Dashboard files generated!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ PowerShell generation failed: $_" -ForegroundColor Red
}

# Step 2: Navigate to frontend and run integration
Write-Host "`n📦 Step 2: Running frontend integration..." -ForegroundColor Green
try {
    Set-Location "frontend"
    
    # Run integration
    & npm run integrate-dashboard
    Write-Host "   ✅ Integration completed!" -ForegroundColor Green
    
    # Test backend
    & npm run test-backend
    Write-Host "   ✅ Backend test completed!" -ForegroundColor Green
    
    # Build with dashboard
    & npm run build-with-dashboard
    Write-Host "   ✅ Build completed!" -ForegroundColor Green
    
    Set-Location ".."
} catch {
    Write-Host "   ❌ Frontend integration failed: $_" -ForegroundColor Red
    Set-Location ".."
}

Write-Host "`n🎉 COMPLETE INTEGRATION FINISHED!" -ForegroundColor Green
Write-Host "📁 Files created:" -ForegroundColor Yellow
Write-Host "   📄 dashboard.html - Standalone dashboard" -ForegroundColor White
Write-Host "   📜 dashboard.js - Dashboard JavaScript" -ForegroundColor White
Write-Host "   🎨 dashboard.css - Dashboard styles" -ForegroundColor White
Write-Host "   📦 frontend/scripts/ - NPM integration scripts" -ForegroundColor White
Write-Host "   📋 frontend/package.json - Updated with scripts" -ForegroundColor White

Write-Host "`n🚀 Next: Deploy to S3 with:" -ForegroundColor Cyan
Write-Host "   cd frontend && npm run deploy" -ForegroundColor Gray
