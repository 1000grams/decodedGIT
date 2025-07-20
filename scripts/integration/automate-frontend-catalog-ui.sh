#!/bin/bash
# automate-frontend-catalog-ui.sh

# 1. Ensure src/pages and src/components/ui exist
mkdir -p src/pages/catalog
mkdir -p src/components/catalog
mkdir -p src/components/ui

# 2. Create BrowsePage
cat > src/pages/catalog/BrowsePage.jsx <<'EOF'
import React from "react";
import SearchBar from "../../components/catalog/SearchBar";
import FilterSidebar from "../../components/catalog/FilterSidebar";
import TrackGrid from "../../components/catalog/TrackGrid";

export default function BrowsePage() {
  return (
    <div className="flex">
      <FilterSidebar />
      <div className="flex-1">
        <SearchBar />
        <TrackGrid />
      </div>
    </div>
  );
}
EOF

# 3. Create SearchBar
cat > src/components/catalog/SearchBar.jsx <<'EOF'
import React from "react";
export default function SearchBar() {
  return (
    <input
      type="text"
      placeholder="Search by title, artist, or tags"
      className="w-full p-2 border rounded mb-4"
    />
  );
}
EOF

# 4. Create FilterSidebar
cat > src/components/catalog/FilterSidebar.jsx <<'EOF'
import React from "react";
export default function FilterSidebar() {
  return (
    <aside className="w-64 p-4 border-r">
      {/* TODO: Add genre, mood, BPM, duration, license filters */}
      <div>Filter Sidebar</div>
    </aside>
  );
}
EOF

# 5. Create TrackGrid and TrackCard
cat > src/components/catalog/TrackGrid.jsx <<'EOF'
import React from "react";
import TrackCard from "./TrackCard";

export default function TrackGrid({ tracks = [] }) {
  // Example: tracks would be fetched from API
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tracks.map(track => (
        <TrackCard key={track.track_id} track={track} />
      ))}
    </div>
  );
}
EOF

cat > src/components/catalog/TrackCard.jsx <<'EOF'
import React from "react";
import { Card, CardContent, CardFooter, Button } from "@/components/ui";

export default function TrackCard({ track }) {
  return (
    <Card>
      <CardContent>
        <audio controls src={track.preview_url} />
        <h3>{track.title}</h3>
        <p>{track.artist.name}</p>
        <p><strong>ASCAP Work ID:</strong> {track.ascap.work_id}</p>
        <p><strong>IPI Base:</strong> {track.ascap.ipi_base_number}</p>
      </CardContent>
      <CardFooter>
        <Button as="a" href={`/tracks/${track.track_id}`}>Details</Button>
      </CardFooter>
    </Card>
  );
}
EOF

# 6. Create TrackDetailPage
cat > src/pages/catalog/TrackDetailPage.jsx <<'EOF'
import React from "react";

export default function TrackDetailPage({ track }) {
  return (
    <div className="p-4">
      <h2>{track.title}</h2>
      <table className="table-auto">
        <tbody>
          <tr><td>Artist</td><td>{track.artist.name}</td></tr>
          <tr><td>ASCAP Work ID</td><td>{track.ascap.work_id}</td></tr>
          <tr><td>IPI Name</td><td>{track.ascap.ipi_name}</td></tr>
          <tr><td>IPI Base</td><td>{track.ascap.ipi_base_number}</td></tr>
          <tr><td>Publisher</td><td>{track.ascap.publisher}</td></tr>
          {/* Add more metadata fields as needed */}
        </tbody>
      </table>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Submit Pitch
      </button>
    </div>
  );
}
EOF

# 7. Create PitchSubmissionForm
cat > src/components/catalog/PitchSubmissionForm.jsx <<'EOF'
import React, { useState } from "react";

export default function PitchSubmissionForm() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: POST to Lambda endpoint
    alert("Pitch submitted! (Not yet wired to backend)");
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="block mb-2 p-2 border rounded w-full" />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="block mb-2 p-2 border rounded w-full" />
      <input name="organization" placeholder="Organization" value={form.organization} onChange={handleChange} className="block mb-2 p-2 border rounded w-full" />
      <textarea name="message" placeholder="Message" value={form.message} onChange={handleChange} className="block mb-2 p-2 border rounded w-full" />
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
    </form>
  );
}
EOF

echo "✅ Front-end catalog UI structure scaffolded in src/pages/catalog and src/components/catalog."
