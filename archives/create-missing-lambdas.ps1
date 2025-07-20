$bucket = "decodedmusic-lambda-code"
$region = "eu-central-1"
$role = "arn:aws:iam::396913703024:role/decoded-genai-stack-backend-DashboardLambdaRole-YkDbqxxNlaMR"
$functions = @(
  "facebookPoster",
  "shortsGenerator",
  "spotifyArtistFetcher",
  "dailyTrendingPost",
  "cognitoCheck"
)

foreach ($fn in $functions) {
    Write-Host "🚀 Creating prod-$fn..."
    $result = aws lambda create-function `
        --function-name "prod-$fn" `
        --runtime nodejs18.x `
        --role $role `
        --handler index.handler `
        --code S3Bucket=$bucket,S3Key=$fn.zip `
        --region $region `
        --timeout 3 `
        --memory-size 128 `
        --architectures "x86_64" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Created prod-$fn"
    } else {
        Write-Host "⚠️  prod-$fn may already exist or failed to create"
        Write-Host $result
    }
    Start-Sleep -Seconds 2
}
Write-Host "✅ Creation attempt finished."
