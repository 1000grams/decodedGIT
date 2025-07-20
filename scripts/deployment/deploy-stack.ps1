$stackName = "decodedmusic-backend"
$templateFile = "template.yaml"
$region = "eu-central-1"
$envName = "prod"

aws cloudformation deploy `
  --template-file $templateFile `
  --stack-name $stackName `
  --capabilities CAPABILITY_NAMED_IAM `
  --region $region `
  --parameter-overrides EnvName=$envName