const AWS = require('aws-sdk');
const axios = require('axios');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const secretsClient = new SecretsManagerClient({ region: REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: REGION });

async function getSpotifyToken() {
  const { SecretString } = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: process.env.SPOTIFY_CREDENTIALS_SECRET })
  );
  const { client_id, client_secret, refresh_token } = JSON.parse(SecretString);
  const res = await axios.post('https://accounts.spotify.com/api/token', null, {
    params: {
      grant_type: 'refresh_token',
      refresh_token,
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.data.access_token;
}

async function getArtistData(token, artistId) {
  const headers = { Authorization: `Bearer ${token}` };
  const base = 'https://api.spotify.com/v1';
  const [profileRes, topRes] = await Promise.all([
    axios.get(`${base}/artists/${artistId}`, { headers }),
    axios.get(`${base}/artists/${artistId}/top-tracks?market=US`, { headers }),
  ]);
  return {
    profile: profileRes.data,
    topTracks: topRes.data.tracks || [],
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://decodedmusic.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const qs = event.queryStringParameters || {};
    const artistId = qs.artist_id;
    if (!artistId) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'artist_id required' }) };
    }
    const token = await getSpotifyToken();
    const artist = await getArtistData(token, artistId);

    const trendsResponse = await dynamodb
      .scan({ TableName: 'prod-TrendPrediction-decodedmusic-backend', Limit: 1, ScanIndexForward: false })
      .promise();
    const latestTrends = trendsResponse.Items?.[0]?.analysis_data || {};

    const result = {
      name: artist.profile.name,
      followers: artist.profile.followers?.total || 0,
      popularity: artist.profile.popularity,
      top_tracks: artist.topTracks.map((t) => ({ id: t.id, name: t.name })),
      trendInsights: {
        viralReadiness: {
          tiktokReady: latestTrends.viral_predictions?.platform_readiness?.tiktok_ready?.length || 0,
          instagramReady: latestTrends.viral_predictions?.platform_readiness?.instagram_ready?.length || 0,
          youtubeReady: latestTrends.viral_predictions?.platform_readiness?.youtube_ready?.length || 0,
        },
        brandOpportunities: {
          techMatches: latestTrends.brand_matches?.['Tech/Innovation']?.length || 0,
          luxuryMatches: latestTrends.brand_matches?.['Luxury/Premium']?.length || 0,
          fitnessMatches: latestTrends.brand_matches?.['Fitness/Wellness']?.length || 0,
        },
        marketScore: latestTrends.market_saturation?.opportunity_score || 0,
      },
    };

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Spotify Dashboard Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load Spotify data', message: error.message }),
    };
  }
};
