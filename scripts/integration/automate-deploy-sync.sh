#!/bin/bash
# automate-deploy-sync.sh
# Pull latest code, build, and deploy to S3

set -euo pipefail

BUCKET="${DEPLOY_BUCKET:-}"
REGION="${AWS_REGION:-eu-central-1}"
# Optional CloudFront distribution ID for cache invalidation
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [ -z "$BUCKET" ]; then
  echo "Usage: DEPLOY_BUCKET=your-bucket ./automate-deploy-sync.sh" >&2
  exit 1
fi

echo "[1/6] Updating repository..."
# Ensure repository is clean
if ! git diff-index --quiet HEAD --; then
  echo "Uncommitted changes detected. Stash or commit them before deploying." >&2
  exit 1
fi

git pull --rebase

echo "[2/6] Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[3/6] Building project..."
rm -rf build
npm run build

echo "[4/6] Syncing build to s3://$BUCKET (region: $REGION)..."
aws s3 sync build/ "s3://$BUCKET" --region "$REGION" --delete

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "[5/6] Creating CloudFront invalidation for distribution $DISTRIBUTION_ID..."
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
fi

echo "[6/6] Deployment complete."
