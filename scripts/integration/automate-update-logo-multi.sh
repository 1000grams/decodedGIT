#!/bin/bash
# automate-update-logo-multi.sh

LOGO_IMPORT='import decodedMusicLogo from "../assets/decoded-music-logo.png";'
LOGO_IMG='<img src={decodedMusicLogo} alt="Decoded Music Logo" className="h-10 w-auto" />'

FILES=(
  "src/components/Header.js"
  "src/components/Footer.js"
  "src/sections/Section8AWS.js"
  "src/sections/Section1Hero.js"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Add import if not present
    if ! grep -q "decodedMusicLogo" "$FILE"; then
      sed -i "1i$LOGO_IMPORT" "$FILE"
    fi
    # Replace text or old logo with the image (simple heuristic)
    sed -i 's/Decoded Music Logo/'"$LOGO_IMG"'/g' "$FILE"
    sed -i 's/Decoded Music/'"$LOGO_IMG"'/g' "$FILE"
    sed -i 's/logo.png/decoded-music-logo.png/g' "$FILE"
    echo "✅ Updated logo in $FILE"
  else
    echo "⚠️  $FILE not found, skipping."
  fi
done

echo "ℹ️  Please manually update your CSS files if you want to adjust logo styles:"
echo "    src/styles/Section8AWS.module.css"
echo "    src/styles/Footer.module.css"
echo "    src/styles/Section1Hero.module.css"
echo "    src/styles/Header.module.css"
echo "ℹ️  No changes made to src/App.css or src/build.zip."
