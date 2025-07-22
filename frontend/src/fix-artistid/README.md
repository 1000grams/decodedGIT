# Fix Artist ID Project

This project is a Vite-based React application designed to dynamically fetch and display artist data using the `artist_id` provided by `ArtistManager.js`. It integrates with a backend API Gateway endpoint `/api/artist` to query artist data from DynamoDB.

## Features
- Dynamically fetch artist data based on Cognito login.
- Query artist data from DynamoDB using the `/api/artist` endpoint.
- Modular and reusable components.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Integration
- Ensure the backend API Gateway endpoint `/api/artist` is properly configured to query DynamoDB.
- Use `ArtistManager.js` to dynamically manage the `artist_id`.

## Development
- Modify components to fetch artist data using the `artist_id`.
- Test the integration with the backend API.

## Deployment
- Build the project:
   ```bash
   npm run build
   ```
- Deploy the built files to your hosting environment.

## Notes
- This project uses Vite for fast builds and React for the frontend framework.
- Ensure the backend Lambda function `prod-spotifyArtistFetcher` is properly configured to support `/api/artist` queries.
