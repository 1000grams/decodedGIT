#!/bin/bash
set -x

# Download the latest favicon.png from GitHub
curl -L -o public/favicon.png https://github.com/1000grams/decoded/raw/main/public/favicon.png

# Ensure the correct <link> is present in index.html
grep -q '<link rel="icon" href="%PUBLIC_URL%/favicon.png"' public/index.html || \
  echo '<link rel="icon" href="%PUBLIC_URL%/favicon.png" />' >> public/index.html

# Remove old favicon.ico
rm -f public/favicon.ico

echo "Favicon updated from GitHub. Ready to build."
