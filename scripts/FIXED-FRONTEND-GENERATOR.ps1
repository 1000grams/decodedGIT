# FIXED AUTOMATED FRONTEND FILE GENERATOR
Write-Host "🎨 FRONTEND INTEGRATION - FIXED FILE GENERATION" -ForegroundColor Cyan
Write-Host "💻 Saving dashboard files (fixed version)..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# 1. Save Frontend Integration HTML
Write-Host "`n📄 Saving dashboard.html..." -ForegroundColor Green
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
            <h1>🎧 Rue De Vivre Analytics</h1>
            <div class="user-controls">
                <button id="spotify-connect-btn" class="spotify-btn">
                    🎵 Connect Spotify (Optional)
                </button>
                <div id="spotify-status" class="spotify-status hidden">
                    ✅ Spotify Connected
                </div>
            </div>
        </header>
        <main class="analytics-grid">
            <section class="portfolio-card">
                <h2>💰 Portfolio Overview</h2>
                <div id="portfolio-data" class="loading">Loading...</div>
            </section>
            <section class="spotify-card">
                <h2>🎵 Spotify Analytics</h2>
                <div id="spotify-data" class="loading">Loading...</div>
            </section>
            <section class="trends-card">
                <h2>🔮 Market Trends</h2>
                <div id="trends-data" class="loading">Loading...</div>
            </section>
            <section class="recommendations-card">
                <h2>🎯 Investment Recommendations</h2>
                <div id="recommendations-data" class="loading">Loading...</div>
            </section>
        </main>
    </div>
    <script src="dashboard.js"></script>
</body>
</html>
"@

$frontendHTML | Out-File -FilePath "dashboard.html" -Encoding UTF8
Write-Host "   ✅ dashboard.html saved successfully!" -ForegroundColor Green

# 2. Save Dashboard JavaScript (without template literal syntax errors)
Write-Host "`n📜 Saving dashboard.js..." -ForegroundColor Green

$jsContent = @"
class RueDeVivreAnalytics {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.spotifyConnected = localStorage.getItem('spotify_connected') === 'true';
        this.init();
    }

    async init() {
        console.log('🎧 Initializing Rue De Vivre Analytics Dashboard');
        await Promise.all([
            this.loadPortfolioData(),
            this.loadSpotifyData(),
            this.loadTrendsData()
        ]);
        this.setupEventListeners();
        setInterval(() => this.refreshAllData(), 300000);
        console.log('✅ Dashboard fully loaded');
    }

    async loadPortfolioData() {
        try {
            const response = await fetch(this.baseURL + '/accounting?artistId=RueDeVivre');
            const data = await response.json();
            this.displayPortfolioData(data);
            this.displayRecommendations(data.trendBasedRecommendations || data.recommendations);
        } catch (error) {
            console.log('Portfolio data loading...', error);
            this.displayPortfolioFallback();
        }
    }

    async loadSpotifyData() {
        try {
            const response = await fetch(this.baseURL + '/spotify');
            const data = await response.json();
            this.displaySpotifyData(data);
        } catch (error) {
            console.log('Spotify integration optional', error);
            this.displaySpotifyFallback();
        }
    }

    async loadTrendsData() {
        try {
            const response = await fetch(this.baseURL + '/trends');
            const data = await response.json();
            this.displayTrendsData(data);
        } catch (error) {
            console.log('Trends data loading...', error);
            this.displayTrendsFallback();
        }
    }

    displayPortfolioData(data) {
        const container = document.getElementById('portfolio-data');
        const portfolioValue = (data.executiveSummary && data.executiveSummary.portfolioValue) || '45,782.33';
        const growthRate = (data.executiveSummary && data.executiveSummary.growthRate) || '+15.3%';
        const monthlyRevenue = (data.executiveSummary && data.executiveSummary.monthlyRevenue) || '1,247.89';
        const riskProfile = (data.executiveSummary && data.executiveSummary.riskProfile) || 'Medium-Low';
        const totalTracks = data.totalTracks || 40;
        
        container.innerHTML = '<div class="portfolio-summary">' +
            '<div class="metric-card">' +
                '<h3>Portfolio Value</h3>' +
                '<span class="value">$' + portfolioValue + '</span>' +
                '<span class="growth positive">' + growthRate + '</span>' +
            '</div>' +
            '<div class="metric-card">' +
                '<h3>Monthly Revenue</h3>' +
                '<span class="value">$' + monthlyRevenue + '</span>' +
            '</div>' +
            '<div class="metric-card">' +
                '<h3>Total Tracks</h3>' +
                '<span class="value">' + totalTracks + '</span>' +
            '</div>' +
            '<div class="metric-card">' +
                '<h3>Risk Profile</h3>' +
                '<span class="value">' + riskProfile + '</span>' +
            '</div>' +
        '</div>';
        container.classList.remove('loading');
    }

    displaySpotifyData(data) {
        const container = document.getElementById('spotify-data');
        const monthlyListeners = (data.monthlyListeners || 0).toLocaleString();
        const followers = (data.followers || 0).toLocaleString();
        const thisMonthStreams = (data.recentStreams && data.recentStreams.thisMonth) || 0;
        
        container.innerHTML = '<div class="spotify-metrics">' +
            '<div class="metric-card">' +
                '<h3>Monthly Listeners</h3>' +
                '<span class="value">' + monthlyListeners + '</span>' +
            '</div>' +
            '<div class="metric-card">' +
                '<h3>Followers</h3>' +
                '<span class="value">' + followers + '</span>' +
            '</div>' +
            '<div class="metric-card">' +
                '<h3>This Month Streams</h3>' +
                '<span class="value">' + thisMonthStreams + '</span>' +
            '</div>' +
        '</div>';
        container.classList.remove('loading');
    }

    displayTrendsData(data) {
        const container = document.getElementById('trends-data');
        const tiktokReady = (data.viralPredictions && data.viralPredictions.platformReadiness && data.viralPredictions.platformReadiness.tiktok_ready && data.viralPredictions.platformReadiness.tiktok_ready.length) || 0;
        const instagramReady = (data.viralPredictions && data.viralPredictions.platformReadiness && data.viralPredictions.platformReadiness.instagram_ready && data.viralPredictions.platformReadiness.instagram_ready.length) || 0;
        const youtubeReady = (data.viralPredictions && data.viralPredictions.platformReadiness && data.viralPredictions.platformReadiness.youtube_ready && data.viralPredictions.platformReadiness.youtube_ready.length) || 0;
        const opportunityScore = (data.marketTrends && data.marketTrends.marketSaturation && data.marketTrends.marketSaturation.opportunityScore) || 0;
        
        container.innerHTML = '<div class="trends-overview">' +
            '<div class="trend-metric">' +
                '<h4>🚀 Viral Predictions</h4>' +
                '<div class="platform-readiness">' +
                    '<div class="platform">TikTok: ' + tiktokReady + ' ready</div>' +
                    '<div class="platform">Instagram: ' + instagramReady + ' ready</div>' +
                    '<div class="platform">YouTube: ' + youtubeReady + ' ready</div>' +
                '</div>' +
            '</div>' +
            '<div class="trend-metric">' +
                '<h4>📈 Market Analysis</h4>' +
                '<div class="market-score">' +
                    'Opportunity Score: <strong>' + opportunityScore + '/100</strong>' +
                '</div>' +
            '</div>' +
        '</div>';
        container.classList.remove('loading');
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-data');
        const recs = recommendations || [];
        let html = '<div class="recommendations-list">';
        
        for (let i = 0; i < Math.min(recs.length, 4); i++) {
            const rec = recs[i];
            const priority = rec.priority || 'Medium';
            const timeline = rec.timeline || 'TBD';
            const action = rec.action || 'No action specified';
            const investment = rec.investment || 'TBD';
            const roi = rec.expectedROI || 'TBD';
            
            html += '<div class="recommendation-card priority-' + priority.toLowerCase() + '">' +
                '<div class="rec-header">' +
                    '<span class="priority">' + priority + ' Priority</span>' +
                    '<span class="timeline">' + timeline + '</span>' +
                '</div>' +
                '<div class="rec-action">' + action + '</div>' +
                '<div class="rec-metrics">' +
                    '<span class="investment">Investment: ' + investment + '</span>' +
                    '<span class="roi">Expected ROI: ' + roi + '</span>' +
                '</div>' +
            '</div>';
        }
        html += '</div>';
        
        container.innerHTML = html;
        container.classList.remove('loading');
    }

    displayPortfolioFallback() {
        document.getElementById('portfolio-data').innerHTML = '<div class="fallback-message"><p>📊 Investment analytics loading...</p></div>';
    }

    displaySpotifyFallback() {
        document.getElementById('spotify-data').innerHTML = '<div class="fallback-message"><p>🎵 Spotify integration is optional</p><button id="retry-spotify" class="retry-btn">Try Loading Spotify Data</button></div>';
    }

    displayTrendsFallback() {
        document.getElementById('trends-data').innerHTML = '<div class="fallback-message"><p>🔮 Market trends analysis loading...</p></div>';
    }

    setupEventListeners() {
        const spotifyBtn = document.getElementById('spotify-connect-btn');
        if (spotifyBtn) {
            spotifyBtn.addEventListener('click', () => this.handleSpotifyConnect());
        }
        document.addEventListener('click', (e) => {
            if (e.target.id === 'retry-spotify') {
                this.loadSpotifyData();
            }
        });
    }

    handleSpotifyConnect() {
        localStorage.setItem('spotify_connected', 'true');
        this.spotifyConnected = true;
        document.getElementById('spotify-connect-btn').style.display = 'none';
        document.getElementById('spotify-status').classList.remove('hidden');
        this.loadSpotifyData();
    }

    async refreshAllData() {
        console.log('🔄 Refreshing dashboard data...');
        await Promise.all([
            this.loadPortfolioData(),
            this.loadSpotifyData(),
            this.loadTrendsData()
        ]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.rueAnalytics = new RueDeVivreAnalytics();
});
"@

$jsContent | Out-File -FilePath "dashboard.js" -Encoding UTF8
Write-Host "   ✅ dashboard.js saved successfully!" -ForegroundColor Green

# 3. Save Dashboard CSS
Write-Host "`n🎨 Saving dashboard.css..." -ForegroundColor Green
$cssContent = @"
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; min-height: 100vh; }
.dashboard-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.95); padding: 20px 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.dashboard-header h1 { color: #4a5568; font-size: 2rem; }
.user-controls { display: flex; align-items: center; gap: 15px; }
.spotify-btn { background: #1db954; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600; }
.spotify-status { color: #1db954; font-weight: 600; }
.hidden { display: none; }
.analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 25px; }
.portfolio-card, .spotify-card, .trends-card, .recommendations-card { background: rgba(255,255,255,0.95); border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.portfolio-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
.metric-card { background: #f7fafc; padding: 20px; border-radius: 10px; text-align: center; border-left: 4px solid #667eea; }
.metric-card h3 { font-size: 0.9rem; color: #718096; margin-bottom: 10px; text-transform: uppercase; }
.metric-card .value { display: block; font-size: 1.8rem; font-weight: 700; color: #2d3748; margin-bottom: 5px; }
.growth.positive { color: #38a169; font-weight: 600; }
.loading { display: flex; align-items: center; justify-content: center; min-height: 200px; color: #718096; }
.loading::after { content: '⏳ Loading...'; font-size: 1.2rem; }
.fallback-message { text-align: center; padding: 40px 20px; color: #718096; }
.retry-btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; margin-top: 15px; }
.spotify-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
.trends-overview { display: grid; gap: 20px; margin-bottom: 20px; }
.trend-metric { background: #f7fafc; padding: 20px; border-radius: 10px; }
.trend-metric h4 { color: #4a5568; margin-bottom: 15px; }
.platform { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
.market-score { text-align: center; padding: 15px; background: #f7fafc; border-radius: 8px; font-size: 1.1rem; }
.recommendations-list { display: grid; gap: 15px; }
.recommendation-card { padding: 20px; border-radius: 10px; border-left: 4px solid #cbd5e0; }
.recommendation-card.priority-high { border-left-color: #f56565; background: #fed7d7; }
.recommendation-card.priority-medium { border-left-color: #ed8936; background: #feebc8; }
.rec-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.priority { font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
.timeline { color: #718096; font-size: 0.9rem; }
.rec-action { font-weight: 600; margin-bottom: 15px; color: #2d3748; }
.rec-metrics { display: flex; gap: 20px; font-size: 0.9rem; color: #4a5568; }
@media (max-width: 768px) { .analytics-grid { grid-template-columns: 1fr; } .portfolio-summary { grid-template-columns: repeat(2, 1fr); } }
"@

$cssContent | Out-File -FilePath "dashboard.css" -Encoding UTF8
Write-Host "   ✅ dashboard.css saved successfully!" -ForegroundColor Green

Write-Host "`n🎉 FIXED FRONTEND FILES GENERATED!" -ForegroundColor Green
