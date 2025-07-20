# PowerShell script to automate dashboardSpotify Lambda setup

# 1. Create working directory
$dir = "dashboardSpotify"
if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}
Set-Location $dir

# 2. Create index.js
$indexJs = @'
exports.handler = async (event) => {
  console.log("Spotify handler triggered");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Spotify endpoint working!" }),
  };
};
'@
Set-Content -Path "index.js" -Value $indexJs

# 3. Zip the Lambda
if (Test-Path "dashboardSpotify.zip") { Remove-Item "dashboardSpotify.zip" -Force }
Compress-Archive -Path index.js -DestinationPath dashboardSpotify.zip

# 4. Upload to S3
aws s3 cp dashboardSpotify.zip s3://decodedmusic-lambda-code/dashboardSpotify.zip

# 5. Update Lambda function code
aws lambda update-function-code `
  --function-name prod-dashboardSpotify `
  --s3-bucket decodedmusic-lambda-code `
  --s3-key dashboardSpotify.zip `
  --region eu-central-1

Write-Host "dashboardSpotify Lambda deployed and updated."
