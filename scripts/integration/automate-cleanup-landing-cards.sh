#!/bin/bash
# automate-cleanup-landing-cards.sh

JSON_FILE="src/content/landingPage.json"
BACKUP_FILE="src/content/landingPage.json.bak"

if [ ! -f "$JSON_FILE" ]; then
  echo "❌ $JSON_FILE not found."
  exit 1
fi

cp "$JSON_FILE" "$BACKUP_FILE"

# Use jq to filter only the three required cards
jq 'map(select(
  .title == "Intelligent Search" or
  .title == "Pre-Cleared Catalog" or
  .title == "High-Quality Assets"
))' "$BACKUP_FILE" > "$JSON_FILE"

echo "✅ Cleaned up $JSON_FILE to only include Intelligent Search, Pre-Cleared Catalog, and High-Quality Assets."
echo "A backup of the original file is saved as $BACKUP_FILE"
