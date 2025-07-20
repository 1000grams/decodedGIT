#!/bin/bash
set -e

bucket="decodedmusic-lambda-code"
lambdas=(
  pitchHandler
  dashboardEarnings
  dashboardStreams
  dashboardCatalog
  dashboardAnalytics
  dashboardStatements
  dashboardAccounting
  dashboardTeam
  dashboardCampaigns
  dashboardSpotify
  spotifyArtistFetcher
)

for fn in "${lambdas[@]}"; do
  (
    echo "Packaging $fn..."
    cd backend/lambda/$fn
    zip -r "$fn.zip" . -x "$fn.zip"
    echo "Uploading $fn.zip to s3://$bucket/"
    aws s3 cp "$fn.zip" "s3://$bucket/"
    echo "$fn uploaded."
  )
done

echo "All Lambda functions packaged and uploaded."

