# cleanup-decoded-root.ps1
Write-Host "🧹 Starting DecodedMusic root directory cleanup..." -ForegroundColor Cyan

# Set working root directory
$root = "C:\decoded"
Set-Location $root

# Step 1: Create folders
$folders = @(
    "$root\scripts\deployment",
    "$root\scripts\diagnostics",
    "$root\scripts\cors",
    "$root\scripts\integration",
    "$root\docs",
    "$root\archives"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory | Out-Null
        Write-Host "✅ Created folder: $folder"
    }
}

# Step 2: Define move rules
$moveRules = @{}
$moveRules['scripts\deployment'] = @(
    '*deploy-backend.ps1',
    '*deploy-*.ps1',
    'RUN-COMPLETE-INTEGRATION*',
    'RUN-COMPLETE-REPAIR*',
    'decoded-claude-deploy*'
)
$moveRules['scripts\integration'] = @(
    'automate-*',
    'enhanced-integration-script*',
    'growth-dashboard*',
    'rights-management-publishing-intelligence*'
)
$moveRules['scripts\cors'] = @(
    'fix-cors*',
    'check-cors*',
    'fix-dashboard-lambda-permissions*',
    'fix-lambda-permissions*'
)
$moveRules['scripts\diagnostics'] = @(
    'final-spotify-test*',
    'comprehensive-spotify-test*',
    'run-all-script*',
    'create-separate-diagnostic-files*'
)
$moveRules['docs'] = @(
    'README*',
    'RUE DE VIVRE*',
    '*deployment notes*',
    'AUTHENTICATION*',
    '*Spotify Database*',
    'Required Cloud*'
)
$moveRules['archives'] = @(
    'cross-table-data-integration*',
    'dashboard-router*',
    'ENABLE-CORS*',
    'final-verification-test*',
    'check-index*',
    'QuickFixScript*',
    'decodedmusic Subscription Stack*',
    'create-missing-lambdas*'
)

# Step 3: Move files
foreach ($targetFolder in $moveRules.Keys) {
    foreach ($pattern in $moveRules[$targetFolder]) {
        $files = Get-ChildItem -Path $root -Filter $pattern -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $dest = Join-Path $root $targetFolder $file.Name
            Move-Item -Path $file.FullName -Destination $dest -Force
            Write-Host "📦 Moved '$($file.Name)' to '$targetFolder'"
        }
    }
}

# Final message using format operator to avoid terminator issues
Write-Host ('✅ Cleanup complete. Review folders inside: {0}' -f $root) -ForegroundColor Green
# End of script
