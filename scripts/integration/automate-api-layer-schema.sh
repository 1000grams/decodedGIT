#!/bin/bash
# automate-api-layer-schema.sh

# 1. Ensure the target directory exists
mkdir -p backend/catalog/api/graphql

# 2. Create the GraphQL schema file
cat > backend/catalog/api/graphql/schema.graphql <<'EOF'
type ASCAP {
  work_id: String!
  ipi_name: String!
  ipi_base_number: String!
  publisher: String!
}

type Track {
  track_id: ID!
  title: String!
  artist: Artist!
  bpm: Int
  key: String
  duration_sec: Int
  price_cents: Int
  ascap: ASCAP!
  preview_url: String!
}

input TrackFilter {
  genre_ids: [ID!]
  mood_ids: [ID!]
  bpm_min: Int
  bpm_max: Int
  duration_min: Int
  duration_max: Int
  license_type: LicenseType
}

type TrackPage {
  items: [Track!]!
  total: Int!
  facets: FacetResults
}

type Query {
  browseTracks(filter: TrackFilter, page: Int!, perPage: Int!): TrackPage!
  getTrack(track_id: ID!): Track
  listGenres: [Genre!]!
  listMoods: [Mood!]!
}

schema {
  query: Query
}
EOF

echo "✅ Created backend/catalog/api/graphql/schema.graphql with the API Layer schema."
