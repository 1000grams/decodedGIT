#!/bin/bash
set -euo pipefail

HANDLERS_DIR="backend/handlers"
cd "$HANDLERS_DIR"

for dir in */ ; do
  if [ -f "$dir/package.json" ]; then
    echo "Installing deps for $dir"
    (cd "$dir" && npm install node-fetch@^3.2.0)
    zip_file="${dir%/}.zip"
    echo "Creating $zip_file"
    (cd "$dir" && zip -r "../$zip_file" . -x "../$zip_file")
  fi
done
