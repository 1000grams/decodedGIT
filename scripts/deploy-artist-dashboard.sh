#!/bin/bash
echo " Deploying Decoded Music - By Artists, For Artists"

# Package Lambda
cd backend/lambda/bedrockInsights
zip -r ../../../bedrock-insights.zip . -x "*.zip"
cd ../../../

# Deploy to AWS
aws lambda update-function-code \
  --function-name prod-bedrock-insights \
  --zip-file fileb://bedrock-insights.zip \
  --region eu-central-1

# Update static files
aws s3 sync . s3://your-s3-bucket \
  --exclude="*.ps1" \
  --exclude="*.zip" \
  --exclude="node_modules/*" \
  --exclude="backend/*"

echo " Deployment complete!"
