#!/bin/bash

BUCKET="decodedmusic-lambda-code"
REGION="eu-central-1"
ROLE="arn:aws:iam::396913703024:role/decoded-genai-stack-backend-DashboardLambdaRole-YkDbqxxNlaMR"

declare -a FUNCTIONS=(
  "facebookPoster"
  "shortsGenerator"
  "spotifyArtistFetcher"
  "dailyTrendingPost"
  "cognitoCheck"
)

for fn in "${FUNCTIONS[@]}"; do
  echo "🚀 Creating prod-$fn..."

  aws lambda create-function \
    --function-name "prod-$fn" \
    --runtime nodejs18.x \
    --role "$ROLE" \
    --handler index.handler \
    --code S3Bucket="$BUCKET",S3Key="$fn.zip" \
    --region "$REGION" \
    --timeout 3 \
    --memory-size 128 \
    --architectures "x86_64" > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "✅ Created prod-$fn"
  else
    echo "⚠️  prod-$fn may already exist or failed to create"
  fi

  sleep 2
done

echo "✅ Creation attempt finished."
