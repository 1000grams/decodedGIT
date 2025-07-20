Write-Host "🚀 Starting post-cleanup sanity checks..." -ForegroundColor Cyan

# 1. Verify Build
Write-Host "🔍 Verifying React build..."
if (Test-Path .\frontend) {
    Push-Location .\frontend
    npm install
    npm run build
    if (Test-Path .\build) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed. Check for errors in the build process." -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "❌ Frontend directory not found. Skipping build verification." -ForegroundColor Red
}

# 2. Verify Endpoint Connectivity
Write-Host "🔍 Verifying API endpoint connectivity..."
if (Test-Path .\scripts\verify-api-connectivity.js) {
    try {
        node .\scripts\verify-api-connectivity.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API connectivity verified!" -ForegroundColor Green
        } else {
            Write-Host "❌ API connectivity test failed. Check your endpoints or network." -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running API connectivity script: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ API connectivity script not found. Skipping." -ForegroundColor Red
}

# 3. Check .env File
Write-Host "🔍 Checking for .env file..."
if (Test-Path .\frontend\.env) {
    Write-Host "✅ .env file found in frontend directory." -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing in frontend directory. Ensure environment variables are configured." -ForegroundColor Red
}

# 4. Regenerate buzz.html Header
Write-Host "🔍 Regenerating buzz.html summary header..."
if (Test-Path .\frontend\public\buzz.html) {
    try {
        $buzzFile = Get-Content .\frontend\public\buzz.html
        $updatedBuzzFile = $buzzFile -replace "<!-- HEADER -->", "<!-- HEADER: Updated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->"
        $updatedBuzzFile | Set-Content .\frontend\public\buzz.html
        Write-Host "✅ buzz.html header updated!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error updating buzz.html: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ buzz.html not found. Skipping header update." -ForegroundColor Red
}

# 5. Lint Fixes
Write-Host "🔍 Running ESLint auto-fix..."
if (Test-Path .\frontend) {
    Push-Location .\frontend
    try {
        npx eslint src/ --ext .js,.jsx,.ts,.tsx --fix
        Write-Host "✅ ESLint auto-fix completed!" -ForegroundColor Green
    } catch {
        Write-Host "❌ ESLint auto-fix failed: $_" -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "❌ Frontend directory not found. Skipping ESLint fixes." -ForegroundColor Red
}

# 6. Archive Large Files
Write-Host "🔍 Archiving large files (>5MB)..."
$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 5MB }
if ($largeFiles) {
    if (!(Test-Path .\archive)) { New-Item -ItemType Directory -Path .\archive }
    $largeFiles | ForEach-Object {
        Move-Item $_.FullName .\archive\ -Force
        Write-Host "  Archived: $($_.FullName)" -ForegroundColor Yellow
    }
    Write-Host "✅ Large files archived!" -ForegroundColor Green
} else {
    Write-Host "✅ No large files to archive." -ForegroundColor Green
}

Write-Host "`n🎉 Post-cleanup sanity checks completed!" -ForegroundColor Cyan

