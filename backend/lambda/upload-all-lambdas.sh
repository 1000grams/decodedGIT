#!/bin/bash

S3_BUCKET="decodedmusic-lambda-code"

for dir in */ ; do
  if [ -d "$dir" ]; then
    LAMBDA_NAME="${dir%/}"
    ZIP_FILE="${LAMBDA_NAME}.zip"

    echo "🔄 Zipping $LAMBDA_NAME with shared folders..."

    rm -f "$ZIP_FILE"

    # Add shared folders as needed
    zip -r "$ZIP_FILE" "$LAMBDA_NAME" ../utils ../catalog/api/graphql > /dev/null

    echo "⬆️  Uploading $ZIP_FILE to s3://$S3_BUCKET/..."
    aws s3 cp "$ZIP_FILE" "s3://$S3_BUCKET/" --quiet

    echo "✅ $LAMBDA_NAME uploaded as $ZIP_FILE"
  fi
done

echo "🎉 All Lambda functions zipped (with shared folders) and uploaded!"
