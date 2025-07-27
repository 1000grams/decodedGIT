const { headers } = require('../../lambda/shared/cors-headers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  console.log("Spotify handler triggered");
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: "Spotify endpoint working!" }),
  };
};
