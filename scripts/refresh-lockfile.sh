
#!/bin/bash

# Navigate to your project directory
cd /workspaces/musicdecoded

# Remove the existing lockfile
rm -f package-lock.json

# Remove node_modules to ensure a clean install
rm -rf node_modules

# Reinstall dependencies and regenerate package-lock.json
npm install

# Stage the changes for git
git add package-lock.json package.json

# Optionally, add any other files that may have changed
git add .

# Commit the changes
git commit -m "Regenerate package-lock.json and update dependencies"

# Push to your remote repository
git push
