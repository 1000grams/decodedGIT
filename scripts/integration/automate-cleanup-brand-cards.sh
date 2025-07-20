#!/bin/bash
# automate-cleanup-brand-cards.sh

# This script will keep only the three specified cards in your Brands & Creators section/component.

CARDS_FILE="src/components/BrandsCreatorsCards.jsx"

if [ ! -f "$CARDS_FILE" ]; then
  echo "❌ $CARDS_FILE not found. Please update the path if your cards component is elsewhere."
  exit 1
fi

# Backup the original file
cp "$CARDS_FILE" "$CARDS_FILE.bak"

# Overwrite the file with only the three required cards
cat > "$CARDS_FILE" <<'EOF'
import React from "react";

export default function BrandsCreatorsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div className="p-6 bg-white rounded shadow text-center">
        <h3 className="text-xl font-bold mb-2">Intelligent Search</h3>
        <p>Find the perfect track in seconds with advanced filters and AI-powered recommendations.</p>
      </div>
      <div className="p-6 bg-white rounded shadow text-center">
        <h3 className="text-xl font-bold mb-2">Pre-Cleared Catalog</h3>
        <p>License music instantly—no legal headaches, no waiting for rights clearance.</p>
      </div>
      <div className="p-6 bg-white rounded shadow text-center">
        <h3 className="text-xl font-bold mb-2">High-Quality Assets</h3>
        <p>Access WAV, MP3, and stems for every track, ready for broadcast and production.</p>
      </div>
    </div>
  );
}
EOF

echo "✅ Cleaned up $CARDS_FILE to only show Intelligent Search, Pre-Cleared Catalog, and High-Quality Assets cards."
echo "A backup of the original file is saved as $CARDS_FILE.bak"
