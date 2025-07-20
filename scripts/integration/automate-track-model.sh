#!/bin/bash
# automate-track-model.sh

# 1. Ensure the target directory exists
mkdir -p backend/catalog/database/dynamodb

# 2. Create the TypeScript data model file for tracks with ASCAP fields
cat > backend/catalog/database/dynamodb/track.model.ts <<'EOF'
// filepath: backend/catalog/database/dynamodb/track.model.ts

// This TypeScript interface defines the data model for a song in the catalog,
// including ASCAP fields and extensible metadata.

export interface ASCAP {
  work_id: string;           // ASCAP Work ID (e.g. "W123456789")
  ipi_name: string;          // Writer/Publisher IPI Name (e.g. "Rue de Vivre")
  ipi_base_number: string;   // IPI Base Number (e.g. "123456789")
  publisher: string;         // Publishing entity
}

export interface Track {
  track_id: string;          // UUID, primary key
  title: string;             // Track title
  artist_id: string;         // UUID, FK to artists table
  album_id?: string;         // Optional: FK to albums table
  theme?: string;            // Optional: theme or mood
  beats?: number;            // Optional: BPM
  duration_sec?: number;     // Optional: duration in seconds
  price_cents?: number;      // Optional: price in cents
  ascap: ASCAP;              // ASCAP performance rights data
  preview_url?: string;      // Optional: URL to preview MP3
  metadata_json?: any;       // Extensible/custom fields (JSONB)
}
EOF

echo "✅ Created backend/catalog/database/dynamodb/track.model.ts with ASCAP fields."

