const querystring = require("querystring");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

exports.handler = async () => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing CLIENT_ID or REDIRECT_URI in environment variables." }),
    };
  }

  const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "user-read-email",
  })}`;

  return {
    statusCode: 302,
    headers: {
      Location: authURL,
    },
  };
};
