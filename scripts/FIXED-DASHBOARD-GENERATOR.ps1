# FIXED AUTOMATED FRONTEND FILE GENERATOR
Write-Host " FRONTEND INTEGRATION - SYNTAX FIXED VERSION" -ForegroundColor Cyan
Write-Host " Saving dashboard files without template literal errors..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# 1. Save Frontend Integration HTML
Write-Host "`n Saving dashboard.html..." -ForegroundColor Green
$frontendHTML = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rue De Vivre - Analytics Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1> Rue De Vivre Analytics</h1>
            <div class="user-controls">
                <button id="spotify-connect-btn" class="spotify-btn">
                     Connect Spotify (Optional)
                </button>
                <div id="spotify-status" class="spotify-status hidden">
                     Spotify Connected
                </div>
            </div>
        </header>
        <main class="analytics-grid">
            <section class="portfolio-card">
                <h2> Portfolio Overview</h2>
                <div id="portfolio-data" class="loading">Loading...</div>
            </section>
            <section class="spotify-card">
                <h2> Spotify Analytics</h2>
                <div id="spotify-data" class="loading">Loading...</div>
            </section>
            <section class="trends-card">
                <h2> Market Trends</h2>
                <div id="trends-data" class="loading">Loading...</div>
            </section>
            <section class="recommendations-card">
                <h2> Investment Recommendations</h2>
                <div id="recommendations-data" class="loading">Loading...</div>
            </section>
        </main>
    </div>
    <script src="dashboard.js"></script>
</body>
</html>
"@

$frontendHTML | Out-File -FilePath "dashboard.html" -Encoding UTF8
Write-Host "    dashboard.html saved successfully!" -ForegroundColor Green

Write-Host "`n FIXED DASHBOARD FILES GENERATED!" -ForegroundColor Green
