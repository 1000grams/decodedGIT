# PowerShell script to automate Lambda packaging and S3 upload for spotifyAuthHandler

$lambdaDir = "C:\decoded\backend\lambda\spotifyAuthHandler"
$handlerFile = "spotifyAuthHandler.js"
$indexFile = "index.js"
$zipFile = "spotifyAuthHandler.zip"
$s3Bucket = "decodedmusic-lambda-code"

# Go to Lambda directory
Set-Location $lambdaDir

# Rename handler to index.js if needed
if (Test-Path $handlerFile) {
    Rename-Item -Path $handlerFile -NewName $indexFile -Force
}

# Zip the handler
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path $indexFile -DestinationPath $zipFile -Force

# Upload to S3
aws s3 cp $zipFile "s3://$s3Bucket/"

Write-Host "Lambda zipped and uploaded to S3 successfully."
