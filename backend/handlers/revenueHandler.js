const { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.REVENUE_TABLE || 'RevenueLog';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const item = {
        artist_id: { S: body.artist_id },
        track_id: { S: body.track_id },
        title: { S: body.title },
        type: { S: body.type },
        platform: { S: body.platform },
        revenue_cents: { N: String(body.revenue_cents || 0) },
        period: { S: body.period || new Date().toISOString().slice(0,7) },
        status: { S: body.status || 'Pending' },
        expected_payout_date: { S: body.expected_payout_date || '' }
      };
      await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
      return response(200, { message: 'Revenue recorded' });
    }
    if (event.httpMethod === 'GET') {
      const qs = event.queryStringParameters || {};
      if (qs.artist_id) {
        const data = await ddb.send(new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'artist_id = :a',
          ExpressionAttributeValues: { ':a': { S: qs.artist_id } }
        }));
        return response(200, (data.Items || []).map(cleanItem));
      } else {
        const data = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 50 }));
        return response(200, (data.Items || []).map(cleanItem));
      }
    }
    return response(405, { message: 'Method Not Allowed' });
  } catch (err) {
    console.error('revenueHandler error', err);
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
