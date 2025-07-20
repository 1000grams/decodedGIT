# Individual component launcher for Rue de Vivre monetization system

param(
    [string]$Component = ""
)

Write-Host "🎧 RUE DE VIVRE - COMPONENT LAUNCHER" -ForegroundColor Cyan

if ($Component -eq "") {
    Write-Host "`n🎯 Available Components:" -ForegroundColor Yellow
    Write-Host "   1. diagnostics     - System diagnostics and health check"
    Write-Host "   2. catalog         - Load complete 4-album catalog"
    Write-Host "   3. linking         - Link tracks to Spotify"
    Write-Host "   4. insights        - Collect Spotify audio features"
    Write-Host "   5. mood            - Mood & context analysis"
    Write-Host "   6. viral           - Viral prediction modeling"
    Write-Host "   7. dashboard       - Complete monetization dashboard"
    Write-Host "   8. all             - Run complete system"
    
    $Component = Read-Host "`nEnter component name or number"
}

switch ($Component) {
    {$_ -in "1", "diagnostics", "debug"} {
        Write-Host "`n🔍 Running System Diagnostics..." -ForegroundColor Green
        python debug-spotify-setup.py
    }
    {$_ -in "2", "catalog", "load"} {
        Write-Host "`n📚 Loading Complete Catalog..." -ForegroundColor Green
        python load-ascap-works-albums.py
    }
    {$_ -in "3", "linking", "spotify"} {
        Write-Host "`n🔗 Linking to Spotify..." -ForegroundColor Green
        python spotify-auto-linker.py
    }
    {$_ -in "4", "insights", "features"} {
        Write-Host "`n🎵 Collecting Spotify Insights..." -ForegroundColor Green
        python enhanced-spotify-insights.py
    }
    {$_ -in "5", "mood", "context"} {
        Write-Host "`n🎭 Analyzing Mood & Context..." -ForegroundColor Green
        python mood-context-analyzer.py
    }
    {$_ -in "6", "viral", "prediction"} {
        Write-Host "`n🚀 Predicting Viral Potential..." -ForegroundColor Green
        python viral-prediction-model.py
    }
    {$_ -in "7", "dashboard", "report"} {
        Write-Host "`n📈 Generating Dashboard..." -ForegroundColor Green
        python growth-dashboard.py
    }
    {$_ -in "8", "all", "complete"} {
        Write-Host "`n🚀 Running Complete System..." -ForegroundColor Green
        .\run-complete-monetization-system.ps1
    }
    default {
        Write-Host "`n❌ Unknown component: $Component" -ForegroundColor Red
        Write-Host "Run without parameters to see available options."
    }
}