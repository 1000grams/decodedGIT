$bucket = "decodedmusic-lambda-code"
$region = "eu-central-1"

$functions = @(
    "dashboardAccounting",
    "dashboardAnalytics",
    "dashboardCampaigns",
    "dashboardCatalog",
    "dashboardEarnings",
    "dashboardSpotify",
    "dashboardStatements",
    "dashboardStreams",
    "dashboardTeam",
    "pitchHandler",
    "shortsGenerator",
    "facebookPoster",
    "spotifyArtistFetcher",
    "dailyTrendingPost",
    "cognitoCheck",
    "spotifyCallbackHandler"
)

foreach ($fn in $functions) {
    $lambdaName = "prod-$fn"
    $zipKey = "$fn.zip"
    Write-Output "🔄 Updating $lambdaName with $zipKey..."
    aws lambda update-function-code `
        --function-name $lambdaName `
        --s3-bucket $bucket `
        --s3-key $zipKey `
        --region $region
}