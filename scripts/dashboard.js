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
        
        console.log(' Dashboard fully loaded');
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
        
        let topPerformersHTML = '';
        if (data.topPerformers && data.topPerformers.length > 0) {
            for (let i = 0; i < Math.min(3, data.topPerformers.length); i++) {
                const track = data.topPerformers[i];
                const roiClass = track.roi && track.roi.includes('+') ? 'positive' : '';
                topPerformersHTML += '<div class="track-item">';
                topPerformersHTML += '<span class="track-name">' + track.title + '</span>';
                topPerformersHTML += '<span class="track-revenue">$' + track.revenue + '</span>';
                topPerformersHTML += '<span class="track-roi ' + roiClass + '">' + track.roi + '</span>';
                topPerformersHTML += '</div>';
            }
        }
        
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
            '</div>' +
            '<div class="top-performers">' +
            '<h4> Top Performing Tracks</h4>' +
            '<div class="tracks-list">' + topPerformersHTML + '</div>' +
            '</div>';
            
        container.classList.remove('loading');
    }

    displaySpotifyData(data) {
        const container = document.getElementById('spotify-data');
        const monthlyListeners = (data.monthlyListeners || 0).toLocaleString();
        const followers = (data.followers || 0).toLocaleString();
        const thisMonthStreams = (data.recentStreams && data.recentStreams.thisMonth) || 0;
        
        let trendInsightsHTML = '';
        if (data.trendInsights) {
            const tiktokReady = (data.trendInsights.viralReadiness && data.trendInsights.viralReadiness.tiktokReady) || 0;
            const techMatches = (data.trendInsights.brandOpportunities && data.trendInsights.brandOpportunities.techMatches) || 0;
            const marketScore = data.trendInsights.marketScore || 0;
            
            trendInsightsHTML = '<div class="trend-insights">' +
                '<h4> Viral Readiness</h4>' +
                '<div class="viral-metrics">' +
                '<div class="viral-item">' +
                '<span>TikTok Ready:</span>' +
                '<strong>' + tiktokReady + ' tracks</strong>' +
                '</div>' +
                '<div class="viral-item">' +
                '<span>Brand Opportunities:</span>' +
                '<strong>' + techMatches + ' matches</strong>' +
                '</div>' +
                '<div class="viral-item">' +
                '<span>Market Score:</span>' +
                '<strong>' + marketScore + '/100</strong>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        
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
            '</div>' + trendInsightsHTML;
            
        container.classList.remove('loading');
    }

    displayTrendsData(data) {
        const container = document.getElementById('trends-data');
        
        let platformReadinessHTML = '';
        if (data.viralPredictions && data.viralPredictions.platformReadiness) {
            const tiktokReady = (data.viralPredictions.platformReadiness.tiktok_ready && data.viralPredictions.platformReadiness.tiktok_ready.length) || 0;
            const instagramReady = (data.viralPredictions.platformReadiness.instagram_ready && data.viralPredictions.platformReadiness.instagram_ready.length) || 0;
            const youtubeReady = (data.viralPredictions.platformReadiness.youtube_ready && data.viralPredictions.platformReadiness.youtube_ready.length) || 0;
            
            platformReadinessHTML = '<div class="platform">TikTok: ' + tiktokReady + ' ready</div>' +
                '<div class="platform">Instagram: ' + instagramReady + ' ready</div>' +
                '<div class="platform">YouTube: ' + youtubeReady + ' ready</div>';
        }
        
        let brandMatchesHTML = '';
        if (data.brandOpportunities && data.brandOpportunities.brandMatches) {
            const brandMatches = data.brandOpportunities.brandMatches;
            let count = 0;
            for (const category in brandMatches) {
                if (count >= 3) break;
                const matches = brandMatches[category];
                const matchCount = Array.isArray(matches) ? matches.length : 0;
                brandMatchesHTML += '<div class="brand-category">' +
                    '<span>' + category + ':</span>' +
                    '<strong>' + matchCount + ' matches</strong>' +
                    '</div>';
                count++;
            }
        }
        
        const opportunityScore = (data.marketTrends && data.marketTrends.marketSaturation && data.marketTrends.marketSaturation.opportunityScore) || 0;
        
        let actionsHTML = '';
        if (data.actionableInsights && data.actionableInsights.immediateActions) {
            for (let i = 0; i < Math.min(3, data.actionableInsights.immediateActions.length); i++) {
                actionsHTML += '<li>' + data.actionableInsights.immediateActions[i] + '</li>';
            }
        }
        
        container.innerHTML = '<div class="trends-overview">' +
            '<div class="trend-metric">' +
            '<h4> Viral Predictions</h4>' +
            '<div class="platform-readiness">' + platformReadinessHTML + '</div>' +
            '</div>' +
            '<div class="trend-metric">' +
            '<h4> Brand Opportunities</h4>' +
            '<div class="brand-matches">' + brandMatchesHTML + '</div>' +
            '</div>' +
            '<div class="trend-metric">' +
            '<h4> Market Analysis</h4>' +
            '<div class="market-score">Opportunity Score: <strong>' + opportunityScore + '/100</strong></div>' +
            '</div>' +
            '</div>' +
            '<div class="actionable-insights">' +
            '<h4> Immediate Actions</h4>' +
            '<ul>' + actionsHTML + '</ul>' +
            '</div>';
            
        container.classList.remove('loading');
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-data');
        let recommendationsHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            for (let i = 0; i < Math.min(4, recommendations.length); i++) {
                const rec = recommendations[i];
                const priority = (rec.priority || 'Medium').toLowerCase();
                const priorityDisplay = rec.priority || 'Medium';
                const timeline = rec.timeline || 'TBD';
                const action = rec.action || 'No action specified';
                const investment = rec.investment || 'TBD';
                const expectedROI = rec.expectedROI || 'TBD';
                
                recommendationsHTML += '<div class="recommendation-card priority-' + priority + '">' +
                    '<div class="rec-header">' +
                    '<span class="priority">' + priorityDisplay + ' Priority</span>' +
                    '<span class="timeline">' + timeline + '</span>' +
                    '</div>' +
                    '<div class="rec-action">' + action + '</div>' +
                    '<div class="rec-metrics">' +
                    '<span class="investment">Investment: ' + investment + '</span>' +
                    '<span class="roi">Expected ROI: ' + expectedROI + '</span>' +
                    '</div>' +
                    '</div>';
            }
        }
        
        container.innerHTML = '<div class="recommendations-list">' + recommendationsHTML + '</div>';
        container.classList.remove('loading');
    }

    displayPortfolioFallback() {
        document.getElementById('portfolio-data').innerHTML = 
            '<div class="fallback-message">' +
            '<p> Investment analytics loading...</p>' +
            '<p>Portfolio data will appear shortly.</p>' +
            '</div>';
    }

    displaySpotifyFallback() {
        document.getElementById('spotify-data').innerHTML = 
            '<div class="fallback-message">' +
            '<p> Spotify integration is optional</p>' +
            '<button id="retry-spotify" class="retry-btn">Try Loading Spotify Data</button>' +
            '</div>';
    }

    displayTrendsFallback() {
        document.getElementById('trends-data').innerHTML = 
            '<div class="fallback-message">' +
            '<p> Market trends analysis loading...</p>' +
            '<p>Trend predictions will appear shortly.</p>' +
            '</div>';
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
        console.log(' Refreshing dashboard data...');
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
