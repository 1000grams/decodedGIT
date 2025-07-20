#!/bin/bash

# Define directories and files to zip
lambda_dirs=(
  "cognitoCheck"
  "loginHandler"
  "signinHandler"
  "signupHandler"
  "dashboardAnalytics"
  "dashboardCatalog"
  "dashboardSpotify"
  "dashboardEarnings"
)

# Create zip files for each lambda directory
for dir in "${lambda_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "Zipping $dir..."
    zip -r "${dir}.zip" "$dir"
  else
    echo "Directory $dir not found. Skipping..."
  fi
  if [ ! -f "${dir}.zip" ]; then
    echo "Error: ZIP file for $dir was not created. Please check the directory."
  fi
done

# Notify completion
echo "Lambda zipping completed."
