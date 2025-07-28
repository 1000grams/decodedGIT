const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPOTIFY_TABLE || 'SpotifyArtistData';
const ddb = new DynamoDBClient({ region: REGION });

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  try {
    const qs = event.queryStringParameters || {};
    if (!qs.artist_id) return response(400, { message: 'artist_id required' });
    const data = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'artist_id = :a',
      ExpressionAttributeValues: { ':a': { S: qs.artist_id } },
      ScanIndexForward: false,
      Limit: 1
    }));
    const item = data.Items?.[0] ? clean(data.Items[0]) : {};
    return response(200, item);
  } catch (err) {
    console.error('spotify dashboard error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? (v.N ? Number(v.N) : v.BOOL);
  }
  if (obj.top_tracks) obj.top_tracks = JSON.parse(obj.top_tracks);
  if (obj.trending) obj.trending = JSON.parse(obj.trending);
  return obj;
}
