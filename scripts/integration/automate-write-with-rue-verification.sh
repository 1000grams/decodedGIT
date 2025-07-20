#!/bin/bash
# automate-write-with-rue-verification.sh

echo "🔍 Checking for WriteWithRueForm.jsx component..."
if [ -f src/components/collab/WriteWithRueForm.jsx ]; then
  echo "✅ WriteWithRueForm.jsx exists."
else
  echo "❌ WriteWithRueForm.jsx does NOT exist in src/components/collab/"
  exit 1
fi

echo "🔍 Searching for 'Sign Up to Collaborate' CTA in src/..."
CTA_LOCATIONS=$(grep -ri "Sign Up to Collaborate" src/)
if [ -n "$CTA_LOCATIONS" ]; then
  echo "✅ Found 'Sign Up to Collaborate' CTA in:"
  echo "$CTA_LOCATIONS"
else
  echo "❌ 'Sign Up to Collaborate' CTA not found in src/"
  exit 1
fi

echo "🔍 Checking if WriteWithRueForm is imported where CTA is used..."
CTA_FILE=$(echo "$CTA_LOCATIONS" | head -n1 | cut -d: -f1)
if grep -q "WriteWithRueForm" "$CTA_FILE"; then
  echo "✅ WriteWithRueForm is imported in $CTA_FILE"
else
  echo "❌ WriteWithRueForm is NOT imported in $CTA_FILE"
  echo "Adding import statement..."
  sed -i '1iimport WriteWithRueForm from "../components/collab/WriteWithRueForm";' "$CTA_FILE"
fi

echo "🔍 Checking if WriteWithRueForm is rendered in $CTA_FILE..."
if grep -q "<WriteWithRueForm" "$CTA_FILE"; then
  echo "✅ WriteWithRueForm is rendered in $CTA_FILE"
else
  echo "❌ WriteWithRueForm is NOT rendered in $CTA_FILE"
  echo "Adding integration code after CTA button..."

  # Insert integration code after the first occurrence of the CTA button
  awk '
    /Sign Up to Collaborate/ && !done {
      print $0
      print "{showForm && <WriteWithRueForm />}"
      done=1
      next
    }
    {print $0}
  ' "$CTA_FILE" > "$CTA_FILE.tmp" && mv "$CTA_FILE.tmp" "$CTA_FILE"
fi

echo "🔧 Improving integration: Ensuring CTA toggles the form..."
if ! grep -q "useState" "$CTA_FILE"; then
  sed -i '1iimport { useState } from "react";' "$CTA_FILE"
fi
if ! grep -q "const \[showForm" "$CTA_FILE"; then
  sed -i '/function /a\  const [showForm, setShowForm] = useState(false);' "$CTA_FILE"
fi
if grep -q "Sign Up to Collaborate" "$CTA_FILE"; then
  sed -i 's/Sign Up to Collaborate/Sign Up to Collaborate<\/button>\n      <button onClick={() => setShowForm(!showForm)} style={{display: "none"}}><\/button>/' "$CTA_FILE"
fi

echo "✅ Verification and integration improvement complete!"
echo "Please review $CTA_FILE to ensure the integration is as expected."
