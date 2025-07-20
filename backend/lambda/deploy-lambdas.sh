#!/bin/bash

# Define variables
S3_BUCKET="decodedmusic-lambda-deployments"
LAMBDA_FUNCTIONS=(
  "loginHandler"
  "signinHandler"
  "signupHandler"
)
AWS_REGION="eu-central-1"
ACCOUNT_ID="396913703024"
API_ID="2h2oj7u446"

# Upload ZIP files to S3
for function in "${LAMBDA_FUNCTIONS[@]}"; do
  if [ -f "${function}.zip" ]; then
    echo "Uploading ${function}.zip to S3..."
    aws s3 cp "${function}.zip" "s3://${S3_BUCKET}/${function}.zip" --region "${AWS_REGION}"
  else
    echo "ZIP file for ${function} not found. Skipping..."
  fi
done

# Create or update Lambda functions
for function in "${LAMBDA_FUNCTIONS[@]}"; do
  echo "Creating or updating Lambda function: ${function}..."
  aws lambda create-function \
    --function-name "${function}" \
    --runtime "nodejs18.x" \
    --role "arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role" \
    --handler "index.handler" \
    --code "S3Bucket=${S3_BUCKET},S3Key=${function}.zip" \
    --region "${AWS_REGION}" || \
  aws lambda update-function-code \
    --function-name "${function}" \
    --s3-bucket "${S3_BUCKET}" \
    --s3-key "${function}.zip" \
    --region "${AWS_REGION}"
done

# Wire up API Gateway routes
API_ID="YOUR_API_ID"
STAGE="prod"
ROUTES=(
  "/auth/login"
  "/auth/signin"
  "/auth/signup"
)

for i in "${!ROUTES[@]}"; do
  echo "Wiring up API Gateway route: ${ROUTES[$i]}..."
  aws apigateway put-integration \
    --rest-api-id "${API_ID}" \
    --resource-id "RESOURCE_ID_FOR_${ROUTES[$i]}" \
    --http-method "POST" \
    --type "AWS_PROXY" \
    --integration-http-method "POST" \
    --uri "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTIONS[$i]}/invocations" \
    --region "${AWS_REGION}"
done

# Enable CORS
for route in "${ROUTES[@]}"; do
  echo "Enabling CORS for route: ${route}..."
  aws apigateway put-method-response \
    --rest-api-id "${API_ID}" \
    --resource-id "RESOURCE_ID_FOR_${route}" \
    --http-method "POST" \
    --status-code "200" \
    --response-parameters "method.response.header.Access-Control-Allow-Origin=true" \
    --region "${AWS_REGION}"

  aws apigateway put-integration-response \
    --rest-api-id "${API_ID}" \
    --resource-id "RESOURCE_ID_FOR_${route}" \
    --http-method "POST" \
    --status-code "200" \
    --response-parameters "method.response.header.Access-Control-Allow-Origin='*'" \
    --region "${AWS_REGION}"
done

# Deploy API Gateway
echo "Deploying API Gateway..."
aws apigateway create-deployment \
  --rest-api-id "${API_ID}" \
  --stage-name "${STAGE}" \
  --region "${AWS_REGION}"

echo "Deployment completed."
