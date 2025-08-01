#!/bin/bash

# Script to automate updating AWS CloudFormation stack for multiple Lambda functions

STACK_NAME="decoded-genai-stack-backend"
TEMPLATE_FILE="cloudformation/decodedMusicBackend.yaml"
LAMBDA_BUCKET="decodedmusic-lambda-code"
REGION="eu-central-1"
ENV_NAME="prod"
WEB_S3_BUCKET_ARN="arn:aws:s3:::decoded-genai-stack-webappne-websitebucket4326d7c2-jvplfkkey9mb"

declare -A lambdas=(
  [DashboardAnalyticsLambda]="prod-dashboardAnalytics.zip"
  [DashboardCampaignsLambda]="prod-dashboardCampaigns.zip"
  [DashboardCatalogLambda]="prod-dashboardCatalog.zip"
  [DashboardFinanceLambda]="prod-dashboardFinance.zip"
  [DashboardRoadmapLambda]="prod-dashboardRoadmap.zip"
  [DashboardStreamsLambda]="prod-dashboardStreams.zip"
  [DashboardTeamLambda]="prod-dashboardTeam.zip"
  [PitchLambda]="prod-pitchHandler.zip"
)

for logical_id in "${!lambdas[@]}"; do
  s3key="${lambdas[$logical_id]}"
  echo "Updating $logical_id with $s3key..."

  aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME-$logical_id" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
      EnvName="$ENV_NAME" \
      WebS3BucketArn="$WEB_S3_BUCKET_ARN" \
      LambdaBucketName="$LAMBDA_BUCKET" \
      LambdaS3Key="$s3key" \
    --region "$REGION"
done

echo "All Lambda CloudFormation stacks updated."
