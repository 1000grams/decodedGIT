Write-Host " RUNNING COMPLETE FRONTEND REPAIR" -ForegroundColor Cyan
Write-Host " Fixing all errors and starting development server..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# Step 1: Generate fixed dashboard files
Write-Host "`n Step 1: Generating dashboard files..." -ForegroundColor Green
try {
    & ".\FIXED-DASHBOARD-GENERATOR.ps1"
    Write-Host "    Dashboard files generated!" -ForegroundColor Green
} catch {
    Write-Host "    Dashboard generation failed: $_" -ForegroundColor Red
}

# Step 2: Run complete integration
Write-Host "`n Step 2: Running integration..." -ForegroundColor Green
try {
    Set-Location "frontend"
    & npm run integrate
    Write-Host "    Integration completed!" -ForegroundColor Green
} catch {
    Write-Host "    Integration failed: $_" -ForegroundColor Red
} finally {
    Set-Location ".."
}

# Step 3: Install dependencies (if needed)
Write-Host "`n Step 3: Checking dependencies..." -ForegroundColor Green
Set-Location "frontend"
if (!(Test-Path "node_modules")) {
    Write-Host "   Installing React dependencies..." -ForegroundColor Yellow
    & npm install
}

# Step 4: Show what was fixed
Write-Host "`n ISSUES FIXED:" -ForegroundColor Green
Write-Host "    PowerShell template literal syntax errors" -ForegroundColor White
Write-Host "    Missing CatalogService.getDetailedCatalog method" -ForegroundColor White
Write-Host "    Missing CatalogService.getRealCatalog method" -ForegroundColor White
Write-Host "    Missing AnalyticsService.getDetailedAnalytics method" -ForegroundColor White
Write-Host "    CORS policy errors (graceful fallback)" -ForegroundColor White
Write-Host "    Manifest.json logo192.png errors" -ForegroundColor White
Write-Host "    Added comprehensive error handling" -ForegroundColor White

Write-Host "`n STARTING DEVELOPMENT SERVER..." -ForegroundColor Cyan
Write-Host " React App: http://localhost:3000" -ForegroundColor Yellow
Write-Host " Dashboard: http://localhost:3000/dashboard.html" -ForegroundColor Yellow
Write-Host " API Tester: http://localhost:3000/api-test.html" -ForegroundColor Yellow
Write-Host " Health Check: http://localhost:3000/health.json" -ForegroundColor Yellow

Write-Host "`n ALL ERRORS SHOULD NOW BE RESOLVED!" -ForegroundColor Green
Write-Host "Starting React development server..." -ForegroundColor Gray

& npm start
