const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.DYNAMO_TABLE_CATALOG || 'DecodedCatalog';
const ddb = new DynamoDBClient({ region: REGION });
const DEFAULT_CATALOG = [{ id: 'stub', title: 'Sample Track', artist_id: 'stub' }];

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    let data;
    if (qs.artist_id) {
      data = await ddb.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'artist_id = :a',
        ExpressionAttributeValues: { ':a': { S: qs.artist_id } }
      }));
    } else {
      data = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 50 }));
    }
    const items = (data.Items || []).map(clean);
    return response(200, items.length ? items : DEFAULT_CATALOG);
  } catch (err) {
    console.error('catalog error', err);
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
  return obj;
}
