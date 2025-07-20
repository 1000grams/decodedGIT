#!/bin/bash
# universal-automation-template.sh

# 1. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  You have uncommitted changes. Please commit or stash them before running this script."
  exit 1
fi

# 2. Commit current state as a checkpoint
git add .
git commit -m "Checkpoint: before automated update"

# 3. Apply your automated changes below
# Example: Create/update a file
echo "Automated update at $(date)" > automated-update.txt

# 4. Show the diff for review
git diff HEAD

echo "✅ Automated changes applied. Review above and commit if satisfied."
