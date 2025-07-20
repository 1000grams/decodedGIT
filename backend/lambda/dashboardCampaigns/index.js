const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPEND_TABLE || 'MarketingSpend';
const ddb = new DynamoDBClient({ region: REGION });
const DEFAULT_CAMPAIGNS = [{ campaign_id: 'stub', spent_cents: 0 }];

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    if (!qs.artist_id) {
      return response(400, { message: 'artist_id required' });
    }

    const data = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'artist_id = :a',
      ExpressionAttributeValues: { ':a': { S: qs.artist_id } }
    }));

    const items = (data.Items || []).map(clean);
    const grouped = {};
    for (const item of items) {
      const id = item.campaign_id;
      grouped[id] = (grouped[id] || 0) + (item.spent_cents || 0);
    }
    const campaigns = Object.entries(grouped).map(([campaign_id, spent_cents]) => ({ campaign_id, spent_cents }));
    return response(200, campaigns.length ? campaigns : DEFAULT_CAMPAIGNS);
  } catch (err) {
    console.error('campaigns error', err);
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
