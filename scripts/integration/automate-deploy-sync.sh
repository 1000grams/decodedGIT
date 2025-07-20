#!/bin/bash
# automate-deploy-sync.sh
# Pull latest code, build, and deploy to S3

set -euo pipefail

BUCKET="${DEPLOY_BUCKET:-}"
REGION="${AWS_REGION:-eu-central-1}"

if [ -z "$BUCKET" ]; then
  echo "Usage: DEPLOY_BUCKET=your-bucket ./automate-deploy-sync.sh" >&2
  exit 1
fi

echo "[1/5] Updating repository..."
# Ensure repository is clean
if ! git diff-index --quiet HEAD --; then
  echo "Uncommitted changes detected. Stash or commit them before deploying." >&2
  exit 1
fi

git pull --rebase

echo "[2/5] Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[3/5] Building project..."
rm -rf build
npm run build

echo "[4/5] Syncing build to s3://$BUCKET (region: $REGION)..."
aws s3 sync build/ "s3://$BUCKET" --region "$REGION" --delete

echo "[5/5] Deployment complete."
