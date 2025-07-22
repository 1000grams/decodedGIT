# PowerShell script to upload Lambda zip to AWS CloudShell via S3

$lambdaDir = "C:\decoded\backend\lambda\spotifyAuthHandler"
$zipFile = "spotifyAuthHandler.zip"
$s3Bucket = "decodedmusic-lambda-code"

# Go to Lambda directory
Set-Location $lambdaDir

# Check if zip exists
if (!(Test-Path $zipFile)) {
    Write-Host "ERROR: $zipFile not found in $lambdaDir. Aborting."
    exit 1
}

# Upload to S3
aws s3 cp $zipFile "s3://$s3Bucket/"

Write-Host "Lambda zip uploaded to S3. Now, in CloudShell, run:"
Write-Host "aws s3 cp s3://$s3Bucket/$zipFile ~/"
Write-Host "This will copy the zip to your CloudShell home directory."
