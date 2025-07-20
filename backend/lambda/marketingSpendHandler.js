const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SPEND_TABLE || 'MarketingSpend';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const item = {
        artist_id: { S: body.artist_id },
        campaign_id: { S: body.campaign_id },
        platform: { S: body.platform },
        date: { S: body.date || new Date().toISOString().slice(0,10) },
        spent_cents: { N: String(body.amount_spent_cents || 0) }
      };
      await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
      return response(200, { message: 'Marketing spend recorded' });
    }
    if (event.httpMethod === 'GET') {
      const qs = event.queryStringParameters || {};
      if (!qs.artist_id) return response(400, { message: 'artist_id required' });
      const params = new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'artist_id = :a',
        ExpressionAttributeValues: { ':a': { S: qs.artist_id } }
      });
      const data = await ddb.send(params);
      const items = (data.Items || []).map(cleanItem);
      return response(200, items);
    }
    return response(405, { message: 'Method Not Allowed' });
  } catch (err) {
    console.error('marketingSpend error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode, body) {
  return { statusCode, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}

function cleanItem(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    const val = v.S ?? (v.N ? Number(v.N) : undefined);
    obj[k] = val;
  }
  return obj;
}
