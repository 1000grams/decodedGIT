#!/bin/bash

# Configuration
LAMBDA_FUNCTIONS=(
    "prod-dashboardStreams"
    "prod-dashboardEarnings"
)

# Update Lambda functions to include CORS headers
for lambda in "${LAMBDA_FUNCTIONS[@]}"; do
    echo "🔄 Updating Lambda function: $lambda"

    # Download the current function code
    aws lambda get-function --function-name "$lambda" --query 'Code.Location' --output text > function_code_url.txt
    FUNCTION_CODE_URL=$(cat function_code_url.txt)
    curl -o function_code.zip "$FUNCTION_CODE_URL"

    # Unzip, modify, and re-zip the function code
    unzip function_code.zip -d function_code
    sed -i '/headers: {/a \        \"Access-Control-Allow-Origin\": \"*\",' function_code/index.js
    zip -r function_code.zip function_code/*

    # Update the Lambda function with the modified code
    aws lambda update-function-code --function-name "$lambda" --zip-file fileb://function_code.zip

    echo "✅ Updated Lambda function: $lambda"

    # Clean up temporary files
    rm -rf function_code function_code.zip function_code_url.txt

done

# Enable CORS in API Gateway
API_ID="2h2oj7u446"
REGION="eu-central-1"

ENDPOINTS=(
    "/dashboard/streams"
    "/dashboard/earnings"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo "🔄 Enabling CORS for endpoint: $endpoint"

    aws apigateway put-method-response \
        --rest-api-id "$API_ID" \
        --resource-id $(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='$endpoint'].id" --output text) \
        --http-method GET \
        --status-code 200 \
        --response-parameters "method.response.header.Access-Control-Allow-Origin=true"

    aws apigateway put-integration-response \
        --rest-api-id "$API_ID" \
        --resource-id $(aws apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='$endpoint'].id" --output text) \
        --http-method GET \
        --status-code 200 \
        --response-parameters "method.response.header.Access-Control-Allow-Origin='*'"

    echo "✅ Enabled CORS for endpoint: $endpoint"
done

# Deploy the API Gateway changes
echo "🔄 Deploying API Gateway changes"
aws apigateway create-deployment --rest-api-id "$API_ID" --stage-name prod

echo "✅ CORS fix automation complete."
