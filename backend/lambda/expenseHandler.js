const { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.EXPENSE_TABLE || 'ExpenseLog';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const item = {
        artist_id: { S: body.artist_id },
        vendor: { S: body.vendor },
        type: { S: body.type },
        amount_cents: { N: String(body.amount_cents || 0) },
        date: { S: body.date || new Date().toISOString().slice(0,10) },
        campaign: { S: body.campaign || '' },
        note: { S: body.note || '' }
      };
      await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
      return response(200, { message: 'Expense recorded' });
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
    console.error('expenseHandler error', err);
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
