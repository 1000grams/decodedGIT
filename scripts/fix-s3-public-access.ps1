# === Config Variables ===
$BUCKET = "decoded-genai-stack-webappne-websitebucket4326d7c2-jvplfkkey9mb"
$DISTRIBUTION_ID = "E11YR13TCZW98X"
$OAI_CANONICAL_ID = "142663f3177f4688826dbcfe5e8d1b28f2168fb8d4d84ca8287a2a1399fa703d4a80fd25dd451507f6bd78d132466246"

Write-Host "🔐 Setting private bucket policy for CloudFront OAI..."
aws s3api put-bucket-policy --bucket $BUCKET --policy "{
  `"Version`": `"2012-10-17`",
  `"Statement`": [
    {
      `"Sid`": `"AllowCloudFrontOAIReadOnly`",
      `"Effect`": `"Allow`",
      `"Principal`": {
        `"CanonicalUser`": `"$OAI_CANONICAL_ID`"
      },
      `"Action`": `"s3:GetObject`",
      `"Resource`": `"arn:aws:s3:::$BUCKET/*`"
    }
  ]
}"

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Bucket policy set successfully."
} else {
  Write-Host "❌ Failed to set bucket policy."
  exit 1
}

Write-Host "🚀 Uploading React build to S3..."
aws s3 sync build/ s3://$BUCKET --delete

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ React build uploaded to S3 successfully."
} else {
  Write-Host "❌ Failed to upload React build to S3."
  exit 1
}

Write-Host "📡 Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ CloudFront invalidation created successfully."
} else {
  Write-Host "❌ Failed to create CloudFront invalidation."
  exit 1
}

Write-Host "✅ Deployment done. Wait 1–2 minutes and visit: https://decodedmusic.com"