const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPOTIFY_TABLE || 'SpotifyArtistData';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
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

function response(statusCode, body) {
  return { statusCode, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? (v.N ? Number(v.N) : v.BOOL);
  }
  if (obj.top_tracks) obj.top_tracks = JSON.parse(obj.top_tracks);
  if (obj.trending) obj.trending = JSON.parse(obj.trending);
  return obj;
}
