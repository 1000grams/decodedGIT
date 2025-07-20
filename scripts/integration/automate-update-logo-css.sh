#!/bin/bash
# automate-update-logo-css.sh

CSS_FILES=(
  "src/styles/Section8AWS.module.css"
  "src/styles/Footer.module.css"
  "src/styles/Section1Hero.module.css"
  "src/styles/Header.module.css"
  "src/App.css"
)

for FILE in "${CSS_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Add or update a .logo class for consistent logo styling
    if grep -q "\.logo" "$FILE"; then
      # Update existing .logo class
      sed -i '/\.logo\s*{/,/}/c\.logo {\n  height: 40px;\n  width: auto;\n  display: inline-block;\n}' "$FILE"
    else
      # Add .logo class at the end
      echo -e "\n.logo {\n  height: 40px;\n  width: auto;\n  display: inline-block;\n}" >> "$FILE"
    fi
    echo "✅ Updated .logo class in $FILE"
  else
    echo "⚠️  $FILE not found, skipping."
  fi
done

echo "✅ All listed CSS files have been updated with a .logo class for consistent logo styling."
