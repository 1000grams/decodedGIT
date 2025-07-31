const https = require('https');
const querystring = require('querystring');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const fs = require('fs');
const path = require('path');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPOTIFY_TABLE || 'SpotifyArtistData';
const ARTIST_IDS = (process.env.ARTIST_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const ddb = new DynamoDBClient({ region: REGION });
const secretsClient = new SecretsManagerClient({ region: REGION });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

let creds;
async function getCreds() {
  if (creds) return creds;
  if (process.env.SPOTIFY_CREDENTIALS_SECRET) {
    const { SecretString } = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: process.env.SPOTIFY_CREDENTIALS_SECRET })
    );
    creds = JSON.parse(SecretString);
  } else {
    try {
      const filePath = path.resolve(__dirname, '../spotify-credentials.json');
      const file = fs.readFileSync(filePath, 'utf8');
      creds = JSON.parse(file);
    } catch {
      creds = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET };
    }
  }
  return creds;
}

async function getToken() {
  const { client_id: id, client_secret: secret } = await getCreds();
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const json = await res.json();
  return json.access_token;
}

async function fetchArtistData(token, artistId) {
  const headers = { Authorization: `Bearer ${token}` };
  const base = 'https://api.spotify.com/v1';
  const profile = await fetch(`${base}/artists/${artistId}`, { headers }).then(r => r.json());
  const top = await fetch(`${base}/artists/${artistId}/top-tracks?market=US`, { headers }).then(r => r.json());
  const cats = await fetch(`${base}/browse/categories?limit=5`, { headers }).then(r => r.json());
  return { profile, top: top.tracks || [], categories: cats.categories?.items || [] };
}

async function handleArtistFetch() {
  if (!ARTIST_IDS.length) throw new Error('No ARTIST_IDS configured');
  const token = await getToken();
  const week = new Date().toISOString().slice(0,10);
  const tasks = ARTIST_IDS.map(async id => {
    const data = await fetchArtistData(token, id);
    const item = {
      artist_id: { S: id },
      week_start: { S: week },
      name: { S: data.profile.name || '' },
      followers: { N: String(data.profile.followers?.total || 0) },
      popularity: { N: String(data.profile.popularity || 0) },
      top_tracks: { S: JSON.stringify(data.top.map(t => ({ id: t.id, name: t.name }))) },
      trending: { S: JSON.stringify(data.categories.map(c => c.name)) }
    };
    await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  });
  await Promise.all(tasks);
  return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ saved: ARTIST_IDS.length }) };
}

function handleAuth() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Missing CLIENT_ID or REDIRECT_URI in environment variables.' }) };
  }
  const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'user-read-email'
  })}`;
  return { statusCode: 302, headers: { ...corsHeaders, Location: authURL } };
}

function handleCallback(code) {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const postData = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI });
  const options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch { json = { error: 'Invalid JSON from Spotify', raw: body }; }
        resolve({ statusCode: res.statusCode, body: JSON.stringify(json), headers: corsHeaders });
      });
    });
    req.on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }), headers: corsHeaders });
    });
    req.write(postData);
    req.end();
  });
}

exports.handler = async (event = {}) => {
  const path = (event.rawPath || event.path || '').toLowerCase();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (path.endsWith('/auth')) {
    return handleAuth();
  }
  if (path.endsWith('/callback')) {
    const code = event.queryStringParameters?.code;
    if (!code) return { statusCode: 400, body: 'Missing code', headers: corsHeaders };
    return handleCallback(code);
  }
  return handleArtistFetch();
};

