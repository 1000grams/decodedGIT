if [ -f build/index.html ]; then
  echo "✅ index.html is in the root of the build directory."
else
  echo "❌ index.html is NOT in the root of the build directory."
  echo "Please run 'npm run build' and ensure your build output is in the 'build' folder."
fi
