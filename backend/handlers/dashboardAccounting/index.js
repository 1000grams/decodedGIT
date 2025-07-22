const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const REV_TABLE = process.env.REVENUE_TABLE || 'RevenueLog';
const EXP_TABLE = process.env.EXPENSE_TABLE || 'ExpenseLog';
const ddb = new DynamoDBClient({ region: REGION });
const DEFAULT_ACCOUNTING = {
  totalRevenue: 0,
  totalExpenses: 0,
  netRevenue: 0,
  outstandingInvoices: 0,
  lastPaymentDate: null,
};

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const artistId = qs.artist_id;
    if (!artistId) return response(400, { message: 'artist_id required' });

    const [revData, expData] = await Promise.all([
      ddb.send(new QueryCommand({
        TableName: REV_TABLE,
        KeyConditionExpression: 'artist_id = :a',
        ExpressionAttributeValues: { ':a': { S: artistId } }
      })),
      ddb.send(new QueryCommand({
        TableName: EXP_TABLE,
        KeyConditionExpression: 'artist_id = :a',
        ExpressionAttributeValues: { ':a': { S: artistId } }
      }))
    ]);

    const revenue = (revData.Items || []).map(clean);
    const expenses = (expData.Items || []).map(clean);

    const totalRevenue = revenue.reduce((s, r) => s + r.revenue_cents, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount_cents, 0);
    const outstandingInvoices = revenue.filter((r) => r.status !== 'Paid').length;
    const lastPaymentDate = revenue
      .filter((r) => r.status === 'Paid' && r.expected_payout_date)
      .map((r) => r.expected_payout_date)
      .sort()
      .pop() || null;

    const result = {
      totalRevenue,
      totalExpenses,
      netRevenue: totalRevenue - totalExpenses,
      outstandingInvoices,
      lastPaymentDate,
    };
    const hasData = revenue.length || expenses.length;
    return response(200, hasData ? result : DEFAULT_ACCOUNTING);
  } catch (err) {
    console.error('accounting error', err);
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
