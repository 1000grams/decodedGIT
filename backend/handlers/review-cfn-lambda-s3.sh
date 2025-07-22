#!/bin/bash

# This script checks all CloudFormation YAML files in the current directory and subdirectories
# for Lambda function resources that reference the decodedmusic-lambda-code S3 bucket.

echo "🔍 Searching for Lambda S3 references in CloudFormation templates..."

grep -r --include="*.yaml" -A 5 "AWS::Lambda::Function" . | grep -B 5 -A 10 "S3Bucket: decodedmusic-lambda-code"

echo "✅ Review complete. Check the output above for S3 bucket references."
