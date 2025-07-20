#!/bin/bash
# build.sh - Automated build with AWS Secrets Manager env injection for Linux/macOS

# Set your AWS Secret name and region
SECRET_NAME="decodedmusic-frontend-env"
AWS_REGION="eu-central-1"

# Fetch secrets from AWS Secrets Manager and write to .env
echo "Fetching secrets from AWS Secrets Manager..."
aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --region "$AWS_REGION" --query SecretString --output text > .env

# Build the React app
echo "Building React app..."
npm run build

echo "Build complete. You can now deploy your build folder."
