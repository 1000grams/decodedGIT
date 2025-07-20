# Spotify Data Module

This module pulls artist data from the Spotify Web API on a weekly schedule and exposes it to the Artist Dashboard.

## DynamoDB Table – `SpotifyArtistData`

| Field | Example | Description |
| --- | --- | --- |
| `artist_id` | `293x3NAIGPR4RCJrFkzs0P` | Spotify artist ID |
| `week_start` | `2025-06-18` | Monday of the data week |
| `name` | `Rue de Vivre` | Artist name |
| `followers` | `12345` | Total Spotify followers |
| `popularity` | `55` | Spotify popularity score |
| `top_tracks` | `[ {"id": "abc", "name": "Fireproof"} ]` | JSON list of top tracks |
| `trending` | `["reggaeton","pop"]` | Names of trending categories |

Partition key is `artist_id` with `week_start` as a sort key so historical snapshots can be retained.

## Weekly Fetch Lambda

`spotifyArtistFetcher` runs every **Wednesday** via EventBridge. It loads Spotify credentials from the secret named by `SPOTIFY_CREDENTIALS_SECRET`, pulls profile, top tracks and a sample of trending categories for each `ARTIST_IDS` entry and writes the data to `SpotifyArtistData`.

## Dashboard Endpoint

`dashboardSpotify` is a simple read-only Lambda behind `/api/dashboard/spotify`. It returns the most recent record for a given `artist_id` so the frontend can display follower counts, top tracks and trend hints.

## Frontend Panel

The React dashboard imports `SpotifyModule` which calls `/api/dashboard/spotify?artist_id=...` and renders the results in a sidebar frame.
