#!/bin/bash
# Automated Bedrock Deployment Script

echo " Starting Bedrock Integration Deployment"

# Create directory structure
mkdir -p backend/lambda/bedrockInsights
mkdir -p cloudformation
mkdir -p scripts

# Install Lambda dependencies
cd backend/lambda/bedrockInsights
npm init -y
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb

# Package Lambda function
echo " Packaging Lambda function..."
zip -r bedrock-insights.zip . -x "*.zip"

# Deploy CloudFormation stack
echo " Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file ../../../cloudformation/bedrock-stack.yml \
  --stack-name decoded-bedrock-integration \
  --region eu-central-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides EnvName=prod

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name decoded-bedrock-integration \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`BedrockApiUrl`].OutputValue' \
  --output text)

# Update Lambda function code
echo " Updating Lambda function code..."
aws lambda update-function-code \
  --function-name prod-bedrock-insights \
  --zip-file fileb://bedrock-insights.zip \
  --region eu-central-1

echo " Deployment complete!"
echo " API URL: $API_URL"
echo " Test with: curl $API_URL"

cd ../../..
