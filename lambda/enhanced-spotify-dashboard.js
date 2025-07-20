const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Dashboard Spotify Event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Access-Control-Allow-Origin': 'https://decodedmusic.com',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        // Get trend prediction data
        const trendsResponse = await dynamodb.scan({
            TableName: 'prod-TrendPrediction-decodedmusic-backend',
            Limit: 1,
            ScanIndexForward: false
        }).promise();
        
        const latestTrends = trendsResponse.Items[0]?.analysis_data || {};
        
        const spotifyData = {
            artist: 'Rue De Vivre',
            followers: 15,
            verified: false,
            monthlyListeners: 1250,
            topTracks: [
                { name: 'Beat Drop', plays: 3500, revenue: 14.00, viralScore: 8.5 },
                { name: 'Synth Wave', plays: 2800, revenue: 11.20, viralScore: 7.2 },
                { name: 'Digital Dreams', plays: 2100, revenue: 8.40, viralScore: 6.8 }
            ],
            recentStreams: {
                today: 45,
                thisWeek: 312,
                thisMonth: 1250
            },
            marketInsights: {
                growthRate: '+15.3%',
                engagement: 'High',
                viralPotential: 'Beat Drop showing viral momentum',
                syncOpportunities: ['Gaming soundtracks', 'Fitness apps', 'Tech commercials']
            },
            portfolio: {
                totalValue: '45,782.33',
                monthlyROI: '+15.3%',
                riskLevel: 'Medium-Low'
            },
            // ADD TREND PREDICTIONS INTEGRATION
            trendInsights: {
                viralReadiness: {
                    tiktokReady: latestTrends.viral_predictions?.platform_readiness?.tiktok_ready?.length || 0,
                    instagramReady: latestTrends.viral_predictions?.platform_readiness?.instagram_ready?.length || 0,
                    youtubeReady: latestTrends.viral_predictions?.platform_readiness?.youtube_ready?.length || 0
                },
                brandOpportunities: {
                    techMatches: latestTrends.brand_matches?.['Tech/Innovation']?.length || 0,
                    luxuryMatches: latestTrends.brand_matches?.['Luxury/Premium']?.length || 0,
                    fitnessMatches: latestTrends.brand_matches?.['Fitness/Wellness']?.length || 0
                },
                marketScore: latestTrends.market_saturation?.opportunity_score || 0
            }
        };
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(spotifyData)
        };
        
    } catch (error) {
        console.error('Spotify Dashboard Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to load Spotify data',
                message: error.message,
                fallback: { artist: 'Rue De Vivre', followers: 0 }
            })
        };
    }
};
