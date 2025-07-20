#!/bin/bash
# automate-footer-usage-cleanup.sh

APP_JS=""
if [ -f src/App.jsx ]; then
  APP_JS="src/App.jsx"
elif [ -f src/App.js ]; then
  APP_JS="src/App.js"
else
  echo "❌ Could not find src/App.js or src/App.jsx"
  exit 1
fi

# 1. Ensure Footer is imported
if ! grep -q 'import Footer from "./components/Footer"' "$APP_JS"; then
  sed -i '1iimport Footer from "./components/Footer";' "$APP_JS"
fi

# 2. Ensure Footer is used in the JSX
if ! grep -q "<Footer" "$APP_JS"; then
  # Insert <Footer /> before the last closing </div>
  sed -i '/<\/div>[^<]*$/i \  <Footer />' "$APP_JS"
fi

# 3. Remove unused import warning if Footer is imported but not used
if grep -q 'import Footer from "./components/Footer"' "$APP_JS" && ! grep -q "<Footer" "$APP_JS"; then
  sed -i '/import Footer from ".\/components\/Footer"/d' "$APP_JS"
fi

echo "✅ Footer import and usage cleaned up in $APP_JS"
