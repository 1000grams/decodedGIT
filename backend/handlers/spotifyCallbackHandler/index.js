const https = require('https');
const querystring = require('querystring');

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const code = event.queryStringParameters?.code;
  if (!code) {
    return { statusCode: 400, body: 'Missing code' };
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
  });

  const options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(body);
        } catch {
          json = { error: 'Invalid JSON from Spotify', raw: body };
        }
        resolve({
          statusCode: res.statusCode,
          body: JSON.stringify(json),
          headers: corsHeaders
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message }),
        headers: corsHeaders
      });
    });

    req.write(postData);
    req.end();
  });
};
