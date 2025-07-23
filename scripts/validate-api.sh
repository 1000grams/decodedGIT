#!/bin/bash

# API Configuration
API_HOSTNAME="2h2oj7u446.execute-api.eu-central-1.amazonaws.com"
API_PATH="/dashboard/catalog"
API_URL="https://$API_HOSTNAME$API_PATH"
AUTH_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" # Replace with a valid token

# Function to validate the API
function Validate-API {
    echo "🚀 Sending request to API: $API_URL"

    # Make the API request using curl
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: $AUTH_TOKEN" $API_URL)
    if [ "$RESPONSE" -eq 200 ]; then
        echo "✅ API request successful!"
    else
        echo "❌ API request failed with status code $RESPONSE"
    fi
}

# Check if the route exists
echo "🔍 Checking if route exists..."
aws apigateway get-resources --rest-api-id $API_ID | grep "$ROUTE" || echo "❌ Route $ROUTE not found!"

# Test the API
echo "🔍 Testing API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: $TOKEN" https://$API_ID.execute-api.eu-central-1.amazonaws.com/$STAGE$ROUTE)
if [ "$RESPONSE" -eq 200 ]; then
    echo "✅ API is working!"
else
    echo "❌ API returned status code $RESPONSE"
fi

# Check CORS
echo "🔍 Checking CORS configuration..."
aws apigateway get-method --rest-api-id $API_ID --resource-id vi70h2 --http-method OPTIONS | grep "Access-Control-Allow-Origin" || echo "❌ CORS not enabled!"

# Run the validation
Validate-API