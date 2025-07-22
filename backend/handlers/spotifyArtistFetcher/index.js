const fetch = require('node-fetch');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPOTIFY_TABLE || 'SpotifyArtistData';
const ARTIST_IDS = (process.env.ARTIST_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const ddb = new DynamoDBClient({ region: REGION });
const secretsClient = new SecretsManagerClient({ region: REGION });
let creds;

async function getCreds() {
  if (creds) return creds;
  if (process.env.SPOTIFY_CREDENTIALS_SECRET) {
    const { SecretString } = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: process.env.SPOTIFY_CREDENTIALS_SECRET })
    );
    creds = JSON.parse(SecretString);
  } else {
    creds = {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    };
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

async function getArtistData(token, artistId) {
  const headers = { Authorization: `Bearer ${token}` };
  const base = 'https://api.spotify.com/v1';
  const profile = await fetch(`${base}/artists/${artistId}`, { headers }).then(r => r.json());
  const top = await fetch(`${base}/artists/${artistId}/top-tracks?market=US`, { headers }).then(r => r.json());
  const cats = await fetch(`${base}/browse/categories?limit=5`, { headers }).then(r => r.json());
  return { profile, top: top.tracks || [], categories: cats.categories?.items || [] };
}

exports.handler = async () => {
  if (!ARTIST_IDS.length) throw new Error('No ARTIST_IDS configured');
  const token = await getToken();
  const week = new Date().toISOString().slice(0,10);
  const tasks = ARTIST_IDS.map(async id => {
    const data = await getArtistData(token, id);
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
  return { statusCode: 200, body: JSON.stringify({ saved: ARTIST_IDS.length }) };
};
