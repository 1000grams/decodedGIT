const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const REV_TABLE = process.env.REVENUE_TABLE || 'RevenueLog';
const EXP_TABLE = process.env.EXPENSE_TABLE || 'ExpenseLog';
const ddb = new DynamoDBClient({ region: REGION });

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

    const revenue = (revData.Items || []).map(cleanItem);
    const expenses = (expData.Items || []).map(cleanItem);

    const totalRevenue = revenue.reduce((s, r) => s + r.revenue_cents, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount_cents, 0);
    const net = totalRevenue - totalExpenses;
    const unpaid = revenue.filter(r => r.status !== 'Paid').reduce((s, r) => s + r.revenue_cents, 0);

    const rows = ['Type,Title/Vendor,Platform/Category,Amount (USD),Date,Status'];
    for (const r of revenue) {
      rows.push(`Revenue,${r.title},${r.platform},$${(r.revenue_cents/100).toFixed(2)},${r.period},${r.status}`);
    }
    for (const e of expenses) {
      rows.push(`Expense,${e.vendor},${e.type},$${(e.amount_cents/100).toFixed(2)},${e.date},-`);
    }
    rows.push('Totals,,,');
    rows.push(`Net,$${(net/100).toFixed(2)},Total Revenue,$${(totalRevenue/100).toFixed(2)}`);
    rows.push(`Total Expenses,$${(totalExpenses/100).toFixed(2)},Unpaid Revenue,$${(unpaid/100).toFixed(2)}`);

    const csv = rows.join('\n');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="accounting.csv"'
      },
      body: csv
    };
  } catch (err) {
    console.error('export accounting error', err);
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
