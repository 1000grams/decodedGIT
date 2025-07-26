#!/bin/bash
set -x

# Download the latest favicon.ico from the S3 bucket
curl -L -o public/favicon.ico \
  https://decoded-genai-stack-webappne-websitebucket4326d7c2-jvplfkkey9mb.s3.amazonaws.com/favicon.ico

# Ensure the correct <link> is present in index.html
grep -q '<link rel="icon" href="%PUBLIC_URL%/favicon.ico"' public/index.html || \
  echo '<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />' >> public/index.html

# Remove old favicon.png
rm -f public/favicon.png

echo "Favicon updated from S3. Ready to build."
