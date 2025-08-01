$bucket = "decodedmusic-lambda-code"
$region = "eu-central-1"

$functions = @(
    "dashboardAnalytics",
    "dashboardCampaigns",
    "dashboardCatalog",
    "dashboardFinance",
    "dashboardRoadmap",
    "dashboardStreams",
    "dashboardTeam",
    "pitchHandler",
    "social",
    "cognitoCheck",
    "spotifyCallbackHandler"
)

foreach ($fn in $functions) {
    $lambdaName = "prod-$fn"
    $zipKey = "prod-$fn.zip"
    Write-Output "🔄 Updating $lambdaName with $zipKey..."
    aws lambda update-function-code `
        --function-name $lambdaName `
        --s3-bucket $bucket `
        --s3-key $zipKey `
        --region $region
}
