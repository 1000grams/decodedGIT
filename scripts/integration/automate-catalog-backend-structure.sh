#!/bin/bash
# automate-catalog-backend-structure.sh

# Root backend folder
mkdir -p backend/catalog

# Storage & Hosting
mkdir -p backend/catalog/storage/s3/raw_uploads
mkdir -p backend/catalog/storage/s3/preview_mp3s
mkdir -p backend/catalog/storage/cloudfront

# Compute & API
mkdir -p backend/catalog/api/appsync_graphql
mkdir -p backend/catalog/api/apigateway_rest
mkdir -p backend/catalog/lambda/nodejs
mkdir -p backend/catalog/lambda/python

# Auth
mkdir -p backend/catalog/auth/cognito

# Database & Search
mkdir -p backend/catalog/database/dynamodb
mkdir -p backend/catalog/database/aurora_postgres
mkdir -p backend/catalog/search/opensearch

# Caching & Queuing
mkdir -p backend/catalog/cache/elasticache_redis
mkdir -p backend/catalog/queue/sqs
mkdir -p backend/catalog/notification/sns

# CI/CD
mkdir -p backend/catalog/cicd/console
mkdir -p backend/catalog/cicd/codepipeline
mkdir -p backend/catalog/cicd/codebuild
mkdir -p backend/catalog/cicd/cloudformation_cdk

# Sample README files for each major category
echo "This folder contains S3 bucket definitions for raw uploads and preview MP3s." > backend/catalog/storage/README.md
echo "This folder contains AppSync GraphQL and API Gateway REST API definitions." > backend/catalog/api/README.md
echo "This folder contains Lambda function code (Node.js and Python)." > backend/catalog/lambda/README.md
echo "This folder contains Cognito authentication setup." > backend/catalog/auth/README.md
echo "This folder contains DynamoDB and Aurora PostgreSQL database definitions." > backend/catalog/database/README.md
echo "This folder contains OpenSearch configuration for search and aggregation." > backend/catalog/search/README.md
echo "This folder contains Redis (Elasticache) and SQS/SNS setup." > backend/catalog/cache_queue_notification_README.md
echo "This folder contains CI/CD pipeline definitions for CodePipeline, CodeBuild, and CloudFormation/CDK." > backend/catalog/cicd/README.md

echo "✅ Backend folder structure for DecodedMusic catalog created."
