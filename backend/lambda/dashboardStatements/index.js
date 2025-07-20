const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.DYNAMO_TABLE_STATEMENTS || 'Statements';
const ddb = new DynamoDBClient({ region: REGION });
const DEFAULT_STATEMENTS = [{ statement_id: 'stub', amount_cents: 0, period: '2025-01' }];

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
      Limit: 12
    }));

    const items = (data.Items || []).map(clean);
    return response(200, items.length ? items : DEFAULT_STATEMENTS);
  } catch (err) {
    console.error('statements error', err);
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
