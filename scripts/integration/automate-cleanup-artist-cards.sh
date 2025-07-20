#!/bin/bash
# automate-cleanup-artist-cards.sh

JSON_FILE="src/content/landingPage.json"
BACKUP_FILE="src/content/landingPage.json.bak"

if [ ! -f "$JSON_FILE" ]; then
  echo "❌ $JSON_FILE not found."
  exit 1
fi

cp "$JSON_FILE" "$BACKUP_FILE"

# Clean up the "For Artists" cards to only keep the three specified
# Adjust 'artistCards' below if your JSON uses a different key for the artist cards section.
jq 'if has("artistCards") 
      then .artistCards |= map(select(
        .title == "Catalog Management" or
        .title == "Marketing Hub" or
        .title == "Direct Licensing Opportunities"
      )) 
      else . 
    end' "$BACKUP_FILE" > "$JSON_FILE"

echo "✅ Cleaned up For Artists cards in $JSON_FILE to only include Catalog Management, Marketing Hub, and Direct Licensing Opportunities."
echo "A backup of the original file is saved as $BACKUP_FILE"
