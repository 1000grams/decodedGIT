const https = require("https");
const querystring = require("querystring");
const { headers } = require('../../lambda/shared/cors-headers');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// This handler only initiates the Spotify OAuth flow (no token exchange)
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  // Always redirect to Spotify auth (no code handling here)
  const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "user-read-email",
  })}`;
  return {
    statusCode: 302,
    headers: { ...headers, Location: authURL },
  };
};
