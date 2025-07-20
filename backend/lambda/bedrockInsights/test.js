// filepath: backend/lambda/bedrockInsights/test.js
// Test script for Bedrock Lambda

const { handler } = require('./index.js');

// Mock event for testing
const testEvent = {
    httpMethod: 'GET',
    headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
    },
    requestContext: {
        requestId: 'test-request-id'
    }
};

// Mock environment variables
process.env.AWS_REGION = 'eu-central-1';
process.env.BEDROCK_MODEL_ID = 'meta.llama3-70b-instruct-v1:0';

console.log(' Testing decodedmusic Bedrock Lambda...');
console.log(' Platform: created by artist for artist');
console.log(' Built by: RDV & AHA LLC Music Management');
console.log('=' * 50);

async function runTest() {
    try {
        console.log(' Invoking Lambda handler...');
        const result = await handler(testEvent);
        
        console.log('✅ Lambda response:');
        console.log('Status Code:', result.statusCode);
        console.log('Headers:', result.headers);
        
        const body = JSON.parse(result.body);
        console.log('Response Body:');
        console.log(JSON.stringify(body, null, 2));
        
        if (body.success) {
            console.log(' Test PASSED - AI insights generated successfully!');
        } else {
            console.log(' Test completed with fallback response');
        }
        
    } catch (error) {
        console.error(' Test FAILED:', error);
    }
}

runTest();
