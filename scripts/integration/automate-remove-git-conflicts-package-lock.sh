#!/bin/bash
# automate-remove-git-conflicts-package-lock.sh

FILE="package-lock.json"

if [ ! -f "$FILE" ]; then
  echo "❌ $FILE not found."
  exit 1
fi

# Remove all git conflict markers from package-lock.json
sed -i '/^<<<<<<< /d;/^=======/d;/^>>>>>>> /d' "$FILE"

echo "✅ All git conflict markers removed from $FILE."
echo "⚠️  Please review $FILE to ensure the merged content is correct before continuing the rebase."

