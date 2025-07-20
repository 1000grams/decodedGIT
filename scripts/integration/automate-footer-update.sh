#!/bin/bash
# automate-footer-update.sh

# Ensure the src/components directory exists
mkdir -p src/components

# Create or update the Footer.jsx component with live social links
cat > src/components/Footer.jsx <<'EOF'
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div>
          &copy; {new Date().getFullYear()} <a href="https://decodedmusic.com" className="underline">decodedmusic.com</a>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
          <a href="https://discord.gg/6Txu7wUW" target="_blank" rel="noopener noreferrer" className="underline">Discord</a>
          <a href="https://open.spotify.com/playlist/4BFQN83x5VenHywmXIUC9X" target="_blank" rel="noopener noreferrer" className="underline">Productivity Playlist</a>
          <a href="https://www.youtube.com/@ALGOPLAYLIST" target="_blank" rel="noopener noreferrer" className="underline">YouTube</a>
          <a href="https://www.youtube.com/@ruedevivre/releases" target="_blank" rel="noopener noreferrer" className="underline">Rue De Vivre YouTube</a>
          <a href="https://www.instagram.com/kaiserinstreetwear/" target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
EOF

echo "✅ Footer.jsx updated with live social links in src/components/Footer.jsx"
