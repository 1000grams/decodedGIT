// Create: backend/lambda/bedrockInsights/index.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        // Get latest marketing data
        const marketingData = await ddb.send(new ScanCommand({
            TableName: 'prod-MarketingSpend',
            Limit: 10
        }));
        
        // Generate AI insights
        const prompt = `Analyze this music marketing data and provide strategic insights: ${JSON.stringify(marketingData.Items)}`;
        
        const command = new InvokeModelCommand({
            modelId: process.env.BEDROCK_MODEL_ID || 'meta.llama3-70b-instruct-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({ prompt, max_tokens: 300 })
        });
        
        const response = await client.send(command);
        const completion = JSON.parse(new TextDecoder().decode(response.body)).completion;
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                marketSummary: completion,
                aiRecommendations: completion.split('\n').filter(line => line.includes('-')).slice(0, 3),
                generatedAt: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Bedrock insights error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'AI insights temporarily unavailable' })
        };
    }
};