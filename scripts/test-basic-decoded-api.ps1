#!/bin/bash

# Base URL for the API
baseUrl="https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod"

# List of endpoints to test
endpoints=(
    "/"
    "/signup"
    "/pitch"
    "/catalog"
    "/dashboard/streams"
    "/dashboard/catalog"
    "/dashboard/earnings"
)

# Authorization token (replace with a valid token)
authToken="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

echo -e "\n🔍 Starting basic endpoint tests..."

# Loop through each endpoint and test it
for ep in "${endpoints[@]}"; do
    url="$baseUrl$ep"
    echo -e "\n➡️  Testing: $url"
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "Authorization: $authToken" "$url")
    http_status=$(echo "$response" | grep "HTTP_STATUS" | awk -F: '{print $2}')
    body=$(echo "$response" | sed -e '/HTTP_STATUS/d')

    if [ "$http_status" -eq 200 ]; then
        echo -e "✅ Success: $body"
    else
        echo -e "❌ Error: HTTP $http_status"
        echo -e "Response: $body"
    fi
done

echo -e "\n✅ Basic API test complete."