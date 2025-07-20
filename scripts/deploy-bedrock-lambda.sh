#!/bin/bash
echo "🎵 Deploying decodedmusic Bedrock Lambda"
echo "Platform: created by artist for artist"
echo "Built by: RDV & AHA LLC Music Management"
echo "================================================"

# Navigate to Lambda directory
cd backend/lambda/bedrockInsights

# Install dependencies
echo " Installing dependencies..."
npm install

# Create deployment package
echo " Creating deployment package..."
zip -r bedrock-insights-deployment.zip . -x "test.js" "*.zip"

# Deploy to AWS Lambda
echo "🚀 Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name prod-bedrock-insights \
  --zip-file fileb://bedrock-insights-deployment.zip \
  --region eu-central-1

# Update environment variables
echo " Setting environment variables..."
aws lambda update-function-configuration \
  --function-name prod-bedrock-insights \
  --environment Variables='{
    "AWS_REGION":"eu-central-1",
    "BEDROCK_MODEL_ID":"meta.llama3-70b-instruct-v1:0"
  }' \
  --region eu-central-1

# Test the deployment
echo " Testing deployed function..."
aws lambda invoke \
  --function-name prod-bedrock-insights \
  --payload '{"httpMethod":"GET","headers":{"Content-Type":"application/json"}}' \
  --region eu-central-1 \
  response.json

echo " Test response:"
cat response.json | jq .

echo " Deployment complete!"
echo " decodedmusic Bedrock Lambda is live!"
