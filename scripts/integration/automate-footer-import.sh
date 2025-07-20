#!/bin/bash
# automate-footer-import.sh

# 1. Ensure Footer import exists in src/App.js or src/App.jsx
APP_JS=""
if [ -f src/App.jsx ]; then
  APP_JS="src/App.jsx"
elif [ -f src/App.js ]; then
  APP_JS="src/App.js"
else
  echo "❌ Could not find src/App.js or src/App.jsx"
  exit 1
fi

# 2. Add import statement if not present
if ! grep -q 'import Footer from "./components/Footer"' "$APP_JS"; then
  sed -i '1iimport Footer from "./components/Footer";' "$APP_JS"
fi

# 3. Add <Footer /> before the closing </div> of the main app container if not present
if ! grep -q "<Footer />" "$APP_JS"; then
  # Insert before the last closing div
  sed -i '/<\/div>[^<]*$/i \  <Footer />' "$APP_JS"
fi

echo "✅ Footer imported and rendered in $APP_JS"
