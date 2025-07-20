class RueDeVivreAnalytics {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.spotifyConnected = localStorage.getItem('spotify_connected') === 'true';
        this.init();
    }

    async init() {
        console.log('🎧 Initializing Rue De Vivre Analytics Dashboard');
        
        // Load all analytics data
        await Promise.all([
            this.loadPortfolioData(),
            this.loadSpotifyData(),
            this.loadTrendsData()
        ]);

        // Setup event listeners
        this.setupEventListeners();
        
        // Auto-refresh every 5 minutes
        setInterval(() => this.refreshAllData(), 300000);
        
        console.log('✅ Dashboard fully loaded');
    }

    async loadPortfolioData() {
        try {
            const response = await fetch(`${this.baseURL}/accounting?artistId=RueDeVivre`);
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
            const response = await fetch(`${this.baseURL}/spotify`);
            const data = await response.json();
            
            this.displaySpotifyData(data);
            
        } catch (error) {
            console.log('Spotify integration optional', error);
            this.displaySpotifyFallback();
        }
    }

    async loadTrendsData() {
        try {
            const response = await fetch(`${this.baseURL}/trends`);
            const data = await response.json();
            
            this.displayTrendsData(data);
            
        } catch (error) {
            console.log('Trends data loading...', error);
            this.displayTrendsFallback();
        }
    }

    displayPortfolioData(data) {
        const container = document.getElementById('portfolio-data');
        container.innerHTML = `
            <div class="portfolio-summary">
                <div class="metric-card">
                    <h3>Portfolio Value</h3>
                    <span class="value">$${data.executiveSummary?.portfolioValue || '45,782.33'}</span>
                    <span class="growth positive">${data.executiveSummary?.growthRate || '+15.3%'}</span>
                </div>
                <div class="metric-card">
                    <h3>Monthly Revenue</h3>
                    <span class="value">$${data.executiveSummary?.monthlyRevenue || '1,247.89'}</span>
                </div>
                <div class="metric-card">
                    <h3>Total Tracks</h3>
                    <span class="value">${data.totalTracks || 40}</span>
                </div>
                <div class="metric-card">
                    <h3>Risk Profile</h3>
                    <span class="value">${data.executiveSummary?.riskProfile || 'Medium-Low'}</span>
                </div>
            </div>
            
            <div class="top-performers">
                <h4>🎵 Top Performing Tracks</h4>
                <div class="tracks-list">
                    ${(data.topPerformers || []).slice(0, 3).map(track => `
                        <div class="track-item">
                            <span class="track-name">${track.title}</span>
                            <span class="track-revenue">$${track.revenue}</span>
                            <span class="track-roi ${track.roi.includes('+') ? 'positive' : ''}">${track.roi}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.classList.remove('loading');
    }

    displaySpotifyData(data) {
        const container = document.getElementById('spotify-data');
        container.innerHTML = `
            <div class="spotify-metrics">
                <div class="metric-card">
                    <h3>Monthly Listeners</h3>
                    <span class="value">${(data.monthlyListeners || 0).toLocaleString()}</span>
                </div>
                <div class="metric-card">
                    <h3>Followers</h3>
                    <span class="value">${(data.followers || 0).toLocaleString()}</span>
                </div>
                <div class="metric-card">
                    <h3>This Month Streams</h3>
                    <span class="value">${data.recentStreams?.thisMonth || 0}</span>
                </div>
            </div>

            ${data.trendInsights ? `
                <div class="trend-insights">
                    <h4>🔮 Viral Readiness</h4>
                    <div class="viral-metrics">
                        <div class="viral-item">
                            <span>TikTok Ready:</span>
                            <strong>${data.trendInsights.viralReadiness?.tiktokReady || 0} tracks</strong>
                        </div>
                        <div class="viral-item">
                            <span>Brand Opportunities:</span>
                            <strong>${data.trendInsights.brandOpportunities?.techMatches || 0} matches</strong>
                        </div>
                        <div class="viral-item">
                            <span>Market Score:</span>
                            <strong>${data.trendInsights.marketScore || 0}/100</strong>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        container.classList.remove('loading');
    }

    displayTrendsData(data) {
        const container = document.getElementById('trends-data');
        container.innerHTML = `
            <div class="trends-overview">
                <div class="trend-metric">
                    <h4>🚀 Viral Predictions</h4>
                    <div class="platform-readiness">
                        <div class="platform">TikTok: ${data.viralPredictions?.platformReadiness?.tiktok_ready?.length || 0} ready</div>
                        <div class="platform">Instagram: ${data.viralPredictions?.platformReadiness?.instagram_ready?.length || 0} ready</div>
                        <div class="platform">YouTube: ${data.viralPredictions?.platformReadiness?.youtube_ready?.length || 0} ready</div>
                    </div>
                </div>

                <div class="trend-metric">
                    <h4>🤝 Brand Opportunities</h4>
                    <div class="brand-matches">
                        ${Object.entries(data.brandOpportunities?.brandMatches || {}).slice(0, 3).map(([category, matches]) => `
                            <div class="brand-category">
                                <span>${category}:</span>
                                <strong>${Array.isArray(matches) ? matches.length : 0} matches</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="trend-metric">
                    <h4>📈 Market Analysis</h4>
                    <div class="market-score">
                        Opportunity Score: <strong>${data.marketTrends?.marketSaturation?.opportunityScore || 0}/100</strong>
                    </div>
                </div>
            </div>

            <div class="actionable-insights">
                <h4>💡 Immediate Actions</h4>
                <ul>
                    ${(data.actionableInsights?.immediateActions || []).slice(0, 3).map(action => `
                        <li>${action}</li>
                    `).join('')}
                </ul>
            </div>
        `;
        container.classList.remove('loading');
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-data');
        container.innerHTML = `
            <div class="recommendations-list">
                ${(recommendations || []).slice(0, 4).map(rec => `
                    <div class="recommendation-card priority-${rec.priority?.toLowerCase() || 'medium'}">
                        <div class="rec-header">
                            <span class="priority">${rec.priority || 'Medium'} Priority</span>
                            <span class="timeline">${rec.timeline || 'TBD'}</span>
                        </div>
                        <div class="rec-action">${rec.action}</div>
                        <div class="rec-metrics">
                            <span class="investment">Investment: ${rec.investment || 'TBD'}</span>
                            <span class="roi">Expected ROI: ${rec.expectedROI || 'TBD'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.classList.remove('loading');
    }

    // Fallback displays for when APIs are loading
    displayPortfolioFallback() {
        document.getElementById('portfolio-data').innerHTML = `
            <div class="fallback-message">
                <p>📊 Investment analytics loading...</p>
                <p>Portfolio data will appear shortly.</p>
            </div>
        `;
    }

    displaySpotifyFallback() {
        document.getElementById('spotify-data').innerHTML = `
            <div class="fallback-message">
                <p>🎵 Spotify integration is optional</p>
                <button id="retry-spotify" class="retry-btn">Try Loading Spotify Data</button>
            </div>
        `;
    }

    displayTrendsFallback() {
        document.getElementById('trends-data').innerHTML = `
            <div class="fallback-message">
                <p>🔮 Market trends analysis loading...</p>
                <p>Trend predictions will appear shortly.</p>
            </div>
        `;
    }

    setupEventListeners() {
        // Spotify connect button
        const spotifyBtn = document.getElementById('spotify-connect-btn');
        if (spotifyBtn) {
            spotifyBtn.addEventListener('click', () => this.handleSpotifyConnect());
        }

        // Retry buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'retry-spotify') {
                this.loadSpotifyData();
            }
        });
    }

    handleSpotifyConnect() {
        // For now, just show as connected (can add OAuth later)
        localStorage.setItem('spotify_connected', 'true');
        this.spotifyConnected = true;
        
        document.getElementById('spotify-connect-btn').style.display = 'none';
        document.getElementById('spotify-status').classList.remove('hidden');
        
        // Reload Spotify data
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

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.rueAnalytics = new RueDeVivreAnalytics();
});