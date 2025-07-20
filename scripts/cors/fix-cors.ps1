# fix-cors.ps1 - Auto-fix CORS headers for API Gateway routes (PowerShell version)

$ErrorActionPreference = 'Stop'

$API_ID = "2h2oj7u446"
$REGION = "eu-central-1"

# Map: path -> resource ID
$routes = @{
    "/dashboard/spotify"    = "78tcjj"
    "/dashboard/accounting" = "m8rjvq"
    "/dashboard/catalog"    = "vi70h2"
    "/dashboard/streams"    = "fujz1x"
    "/dashboard/earnings"   = "38zfkl"
    "/dashboard/statements" = "0yy2cq"
    "/spotify/callback"     = "4nztit"
}

function Fix-MethodResponse {
    param(
        [string]$ResourceId,
        [string]$Method
    )
    Write-Host "Patching $Method for resource $ResourceId..."
    try {
        aws apigateway update-method-response `
            --rest-api-id $API_ID `
            --resource-id $ResourceId `
            --http-method $Method `
            --status-code 200 `
            --patch-operations op=add,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value=true `
            --region $REGION | Out-Null
    } catch {
        Write-Host "Already set or failed for $Method $ResourceId"
    }
}

foreach ($path in $routes.Keys) {
    $rid = $routes[$path]
    Write-Host "Checking $path ($rid)"
    Fix-MethodResponse -ResourceId $rid -Method GET
    Fix-MethodResponse -ResourceId $rid -Method POST
}

Write-Host "Deploying updated API to stage 'prod'"
aws apigateway create-deployment `
    --rest-api-id $API_ID `
    --stage-name prod `
    --region $REGION `
    --description "Auto CORS Fix for GET/POST" | Out-Null

Write-Host "All method responses patched and deployed!"
