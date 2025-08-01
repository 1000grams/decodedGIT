const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const ddb = new DynamoDBClient({ region: REGION });

const TABLES = {
  revenue: process.env.REVENUE_TABLE || 'RevenueLog',
  expense: process.env.EXPENSE_TABLE || 'ExpenseLog',
  earnings: process.env.EARNINGS_TABLE || 'DecodedEarnings',
  statements: process.env.STATEMENTS_TABLE || 'Statements',
};

const DEFAULT_ACCOUNTING = {
  totalRevenue: 0,
  totalExpenses: 0,
  netRevenue: 0,
  outstandingInvoices: 0,
  lastPaymentDate: null,
};

const DEFAULT_EARNINGS = [{ artist_id: 'stub', month: '2025-01', revenue_cents: 0 }];
const DEFAULT_STATEMENTS = [{ statement_id: 'stub', amount_cents: 0, period: '2025-01' }];

exports.handler = async (event) => {
  const path = event.resource || event.path || '';
  const qs = event.queryStringParameters || {};
  const artistId = qs.artist_id;

  try {
    if (path.endsWith('/accounting')) {
      if (!artistId) return response(400, { message: 'artist_id required' });
      const [revData, expData] = await Promise.all([
        ddb.send(new QueryCommand({
          TableName: TABLES.revenue,
          KeyConditionExpression: 'artist_id = :a',
          ExpressionAttributeValues: { ':a': { S: artistId } },
        })),
        ddb.send(new QueryCommand({
          TableName: TABLES.expense,
          KeyConditionExpression: 'artist_id = :a',
          ExpressionAttributeValues: { ':a': { S: artistId } },
        })),
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
    }

    if (path.endsWith('/earnings')) {
      let data;
      if (artistId) {
        data = await ddb.send(new QueryCommand({
          TableName: TABLES.earnings,
          KeyConditionExpression: 'artist_id = :a',
          ExpressionAttributeValues: { ':a': { S: artistId } },
        }));
      } else {
        data = await ddb.send(new ScanCommand({ TableName: TABLES.earnings, Limit: 50 }));
      }
      const items = (data.Items || []).map(clean);
      return response(200, items.length ? items : DEFAULT_EARNINGS);
    }

    if (path.endsWith('/statements')) {
      if (!artistId) return response(400, { message: 'artist_id required' });
      const data = await ddb.send(new QueryCommand({
        TableName: TABLES.statements,
        KeyConditionExpression: 'artist_id = :a',
        ExpressionAttributeValues: { ':a': { S: artistId } },
        ScanIndexForward: false,
        Limit: 12,
      }));
      const items = (data.Items || []).map(clean);
      return response(200, items.length ? items : DEFAULT_STATEMENTS);
    }

    return response(404, { message: 'Not Found' });
  } catch (err) {
    console.error('finance error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? (v.N ? Number(v.N) : v.BOOL);
  }
  return obj;
}

