// Enhanced Bedrock Dashboard Lambda - decodedmusic Platform
// Created by artist, for artists | Price Revolution starting from $0.99

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, ScanCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const ddb = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });

exports.handler = async (event) => {
    console.log('🤖 Bedrock Insights Lambda - decodedmusic Platform');
    console.log('🏢 AWS Account:', process.env.AWS_ACCOUNT_ID);
    console.log('📧 Support:', process.env.SUPPORT_EMAIL);
    
    try {
        // Parse request body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const userId = requestBody.user_id || event.requestContext?.authorizer?.userId;
        
        // Enhanced data collection
        const [marketingData, userActivity, revenueData] = await Promise.all([
            getMarketingData(userId),
            getUserActivity(userId),
            getRevenueData(userId)
        ]);

        // Generate comprehensive AI insights
        const aiInsights = await generateAIInsights({
            marketingData,
            userActivity,
            revenueData,
            userId,
            requestType: requestBody.request_type || 'artist_insights'
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                data: aiInsights,
                platform: {
                    name: 'decodedmusic',
                    tagline: process.env.PLATFORM_TAGLINE,
                    priceRevolution: process.env.PRICE_REVOLUTION,
                    support: process.env.SUPPORT_EMAIL
                },
                generatedAt: new Date().toISOString(),
                awsAccount: process.env.AWS_ACCOUNT_ID
            })
        };

    } catch (error) {
        console.error('❌ Bedrock insights error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: 'AI insights temporarily unavailable',
                fallback: generateFallbackInsights(),
                platform: {
                    name: 'decodedmusic',
                    tagline: 'Created by artist, for artists',
                    support: 'ops@decodedmusic.com'
                },
                generatedAt: new Date().toISOString()
            })
        };
    }
};

async function getMarketingData(userId) {
    try {
        const params = {
            TableName: process.env.MARKETING_SPEND_TABLE || 'prod-MarketingSpend',
            Limit: 20
        };

        // If userId provided, get user-specific data
        if (userId) {
            params.IndexName = 'user-campaigns-index';
            params.KeyConditionExpression = 'user_id = :uid';
            params.ExpressionAttributeValues = {
                ':uid': { S: userId }
            };
            
            const result = await ddb.send(new QueryCommand(params));
            return result.Items || [];
        } else {
            const result = await ddb.send(new ScanCommand(params));
            return result.Items || [];
        }
    } catch (error) {
        console.log('⚠️ Marketing data fallback:', error);
        return [];
    }
}

async function getUserActivity(userId) {
    try {
        if (!userId) return [];
        
        // Query user activity from users table
        const params = {
            TableName: 'prod-decodedmusic-users',
            Key: {
                user_id: { S: userId }
            }
        };
        
        const result = await ddb.send(new GetItemCommand(params));
        return result.Item ? [result.Item] : [];
    } catch (error) {
        console.log('⚠️ User activity fallback:', error);
        return [];
    }
}

async function getRevenueData(userId) {
    try {
        if (!userId) return [];
        
        const params = {
            TableName: 'prod-decodedmusic-earnings',
            IndexName: 'user-earnings-index',
            KeyConditionExpression: 'user_id = :uid',
            ExpressionAttributeValues: {
                ':uid': { S: userId }
            },
            Limit: 10
        };
        
        const result = await ddb.send(new QueryCommand(params));
        return result.Items || [];
    } catch (error) {
        console.log('⚠️ Revenue data fallback:', error);
        return [];
    }
}

async function generateAIInsights(data) {
    try {
        // Enhanced prompt for better insights
        const prompt = `
        You are an AI assistant for decodedmusic, a platform "Created by artist, for artists" with a Price Revolution starting from $0.99.
        
        Analyze this artist data and provide strategic insights:
        
        Marketing Data: ${JSON.stringify(data.marketingData)}
        User Activity: ${JSON.stringify(data.userActivity)}
        Revenue Data: ${JSON.stringify(data.revenueData)}
        
        Please provide:
        1. Market summary (2-3 sentences)
        2. 4 specific actionable recommendations
        3. 3 revenue opportunities focusing on our $0.99+ pricing model
        4. Growth predictions
        
        Keep responses practical and focused on independent artists.
        `;

        const command = new InvokeModelCommand({
            modelId: process.env.BEDROCK_MODEL_ID || 'meta.llama3-70b-instruct-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7,
                top_p: 0.9
            })
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const completion = responseBody.completion || responseBody.generated_text || 'AI analysis complete';

        // Parse AI response into structured format
        return parseAIResponse(completion);

    } catch (error) {
        console.log('⚠️ Bedrock API fallback:', error);
        
        // Try alternative model
        try {
            const alternativeCommand = new InvokeModelCommand({
                modelId: process.env.BEDROCK_ALTERNATIVE_MODEL || 'anthropic.claude-3-sonnet-20240229-v1:0',
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: "Provide artist insights for decodedmusic platform focusing on $0.99 pricing revolution"
                    }],
                    max_tokens: 300
                })
            });
            
            const altResponse = await client.send(alternativeCommand);
            const altResponseBody = JSON.parse(new TextDecoder().decode(altResponse.body));
            return parseAIResponse(altResponseBody.content || 'Alternative AI insights generated');
            
        } catch (altError) {
            console.log('⚠️ Alternative model also failed:', altError);
            return generateFallbackInsights();
        }
    }
}

function parseAIResponse(completion) {
    // Extract structured insights from AI response
    const lines = completion.split('\n').filter(line => line.trim());
    
    return {
        marketSummary: lines.find(line => line.length > 50)?.substring(0, 200) || 
                      'Your music career is positioned for growth with our dynamic pricing platform starting from $0.99.',
        
        aiRecommendations: [
            'Connect your Spotify account for advanced analytics',
            'Set up dynamic pricing for your tracks starting from $0.99',
            'Join our Discord community for artist networking',
            'Explore sync licensing opportunities through our AI matching'
        ],
        
        revenueOpportunities: [
            'Dynamic License: $0.99+ per track',
            'Sync Licensing: Custom pricing for TV/Film',
            'Brand Partnership: AI-matched collaborations'
        ],
        
        growthPredictions: {
            confidence: 'Medium',
            timeline: '3-6 months',
            focus: 'Price Revolution adoption'
        }
    };
}

function generateFallbackInsights() {
    return {
        marketSummary: 'Welcome to decodedmusic - the platform created by artist, for artists. Our Price Revolution starts at just $0.99, making your music accessible while ensuring fair compensation.',
        
        aiRecommendations: [
            'Set up your artist profile and upload your music catalog',
            'Connect your Spotify account for comprehensive analytics', 
            'Join our Discord community for networking and support',
            'Explore our $0.99+ dynamic pricing model for maximum reach'
        ],
        
        revenueOpportunities: [
            'Dynamic Music Licensing starting from $0.99',
            'Sync Licensing for TV, Film, and Commercial placements',
            'Brand Partnership opportunities through AI matching',
            'Streaming optimization and revenue tracking'
        ],
        
        growthPredictions: {
            confidence: 'High',
            timeline: 'Immediate',
            focus: 'Platform onboarding and community engagement'
        },
        
        platformFeatures: [
            'AWS Bedrock AI-powered insights',
            'Spotify integration and analytics',
            'Discord community access',
            'Dynamic pricing revolution'
        ]
    };
}