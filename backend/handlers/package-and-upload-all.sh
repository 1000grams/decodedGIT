#!/bin/bash
set -e

bucket="decodedmusic-lambda-code"
# Map local lambda directories to prod zip names
lambdas=(
  "pitchHandler:prod-pitchHandler"
  "dashboardEarnings:prod-dashboardEarnings"
  "dashboardStreams:prod-dashboardStreams"
  "dashboardCatalog:prod-dashboardCatalog"
  "dashboardAnalytics:prod-dashboardAnalytics"
  "dashboardStatements:prod-dashboardStatements"
  "dashboardAccounting:prod-dashboardAccounting"
  "dashboardTeam:prod-dashboardTeam"
  "dashboardCampaigns:prod-dashboardCampaigns"
  "dashboardSpotify:prod-dashboardSpotify"
  "fetch:prod-fetch"
)

for entry in "${lambdas[@]}"; do
  dir=${entry%%:*}
  zip_name=${entry##*:}
  (
    echo "Packaging $dir → $zip_name..."
    cd backend/handlers/$dir
    zip -r "$zip_name.zip" . -x "$zip_name.zip"
    echo "Uploading $zip_name.zip to s3://$bucket/"
    aws s3 cp "$zip_name.zip" "s3://$bucket/"
    echo "$zip_name uploaded."
  )
done

echo "All Lambda functions packaged and uploaded."

