# PowerShell Script: Map Lambda Functions to CloudFormation Stacks
# Make sure AWS CLI is configured with correct region and profile first
$region = "eu-central-1"

Write-Host "`n🧩 Fetching all CloudFormation stacks in region $region..." -ForegroundColor Cyan
$stacks = aws cloudformation list-stacks --region $region --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].StackName" --output text | Out-String

foreach ($stack in $stacks.Trim().Split("`n")) {
    Write-Host "`n🔍 Stack: $stack" -ForegroundColor Yellow
    $resources = aws cloudformation list-stack-resources --stack-name $stack --region $region --output json

    $lambdas = ($resources | ConvertFrom-Json).StackResourceSummaries |
        Where-Object { $_.ResourceType -eq "AWS::Lambda::Function" }

    foreach ($lambda in $lambdas) {
        Write-Host "   • Lambda: $($lambda.PhysicalResourceId)" -ForegroundColor Green
    }

    if ($lambdas.Count -eq 0) {
        Write-Host "   ⚠ No Lambda functions in this stack." -ForegroundColor DarkGray
    }
}
