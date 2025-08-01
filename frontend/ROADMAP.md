# ROADMAP: Spotify OAuth and User-Level Scopes

This project currently authenticates with Spotify using client credentials and artist-level data.
To support user-specific features such as playlist access, implement the following steps:

1. **OAuth Authorization Code Flow**
   - Register the app with Spotify and enable the Authorization Code flow.
   - Add a backend route `/auth/spotify/callback` to exchange the authorization code for access and refresh tokens.
   - Store tokens per user, keyed by their artist ID from `ArtistManager`.

2. **Request User Scopes**
   - When directing users to Spotify for login, include the desired scopes (e.g. `playlist-read-private`).
   - After successful callback, save the granted scopes along with tokens.

3. **Frontend Integration**
   - After authentication, call the backend to retrieve the stored tokens for the logged-in artist.
   - Use these tokens to access user-level Spotify APIs (playlists, saved tracks, etc.).

4. **Token Refresh**
   - Implement a refresh-token mechanism on the backend to keep user tokens valid without requiring re-login.

5. **Testing and Rollout**
   - Start with limited scopes and a small test group of artists.
   - Expand scope coverage as features (playlist editing, follows, etc.) are added.

6. **Analytics Dashboard Frontend**
   - Build a single-page dashboard with sections for portfolio metrics, Spotify analytics, market trends, and investment recommendations.
   - Fetch data from backend endpoints (`/accounting`, `/spotify`, `/trends`), refresh it periodically, and show fallback messages on errors.
   - Offer an optional "Connect Spotify" button that stores connection status locally and enables user-level Spotify features.
   - Style the interface with a responsive grid layout and metric cards for clarity on both desktop and mobile.

This roadmap ensures any artist logging into the platform can authorize Spotify, access personalized data, and view a comprehensive analytics dashboard.
