#!/bin/bash
# automate-update-landing-logo.sh

LANDING_FILE="src/pages/LandingPage.jsx"
LOGO_PATH="../assets/decoded-music-logo.png"

if [ ! -f "$LANDING_FILE" ]; then
  echo "❌ $LANDING_FILE not found. Please update the path if your landing page component is elsewhere."
  exit 1
fi

# Ensure the logo import exists
if ! grep -q "decodedMusicLogo" "$LANDING_FILE"; then
  sed -i '1iimport decodedMusicLogo from "../assets/decoded-music-logo.png";' "$LANDING_FILE"
fi

# Replace any existing logo img or text with the actual logo image in the upper left
# This assumes you have a header or nav section; adjust the selector as needed.
sed -i 's|<div[^>]*>\s*Decoded Music\s*</div>|<img src={decodedMusicLogo} alt="Decoded Music Logo" className="h-10 w-auto" />|g' "$LANDING_FILE"
sed -i 's|Decoded Music Logo|<img src={decodedMusicLogo} alt="Decoded Music Logo" className="h-10 w-auto" />|g' "$LANDING_FILE"

echo "✅ Landing page updated to use the actual Decoded Music logo."
