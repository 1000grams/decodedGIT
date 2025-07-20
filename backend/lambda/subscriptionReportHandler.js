const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SUB_TABLE || 'ArtistSubscriptions';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async () => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: TABLE }));
    const items = data.Items || [];
    const records = items.map(clean);
    const totalSubscribers = records.filter(r => r.active).length;
    const monthlyRevenue = totalSubscribers * 99;
    const avgRetention = calcRetention(records);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ totalSubscribers, monthlyRevenue, avgRetention })
    };
  } catch (err) {
    console.error('report error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'error' }) };
  }
};

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? v.N ?? v.BOOL;
  }
  return obj;
}

function calcRetention(records) {
  const months = records.map(r => {
    if (!r.subscribed_since) return 0;
    const diff = Date.now() - new Date(r.subscribed_since).getTime();
    return diff / (1000 * 60 * 60 * 24 * 30);
  }).filter(n => n > 0);
  if (!months.length) return 0;
  const avg = months.reduce((a,b) => a + b, 0) / months.length;
  return Number(avg.toFixed(1));
}
