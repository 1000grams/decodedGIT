const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.DYNAMO_TABLE_ANALYTICS || 'WeeklyArtistStats';
const ddb = new DynamoDBClient({ region: REGION });
const DEFAULT_STATS = [{ week_start: '2025-01-01', spotify_streams: 0, youtube_views: 0 }];

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    if (!qs.artist_id) {
      return response(400, { message: 'artist_id required' });
    }

    const data = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'artist_id = :a',
      ExpressionAttributeValues: { ':a': { S: qs.artist_id } },
      ScanIndexForward: false,
      Limit: 52
    }));

    const items = (data.Items || []).map(clean);
    return response(200, items.length ? items : DEFAULT_STATS);
  } catch (err) {
    console.error('analytics error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body)
  };
}

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? (v.N ? Number(v.N) : v.BOOL);
  }
  return obj;
}
