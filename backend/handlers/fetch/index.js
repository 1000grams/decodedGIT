const { DynamoDBClient, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { headers } = require('../../../lambda/shared/cors-headers');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLES = {
  catalog: process.env.DYNAMO_TABLE_CATALOG || 'DecodedCatalog',
  earnings: process.env.DYNAMO_TABLE_EARNINGS || 'DecodedEarnings',
  streams: process.env.DYNAMO_TABLE_STREAMS || 'DecodedStreams',
};
const DEFAULTS = {
  catalog: [{ id: 'stub', title: 'Sample Track', artist_id: 'stub' }],
  earnings: [{ artist_id: 'stub', month: '2025-01', revenue_cents: 0 }],
  streams: [{ artist_id: 'stub', play_count: 0 }],
};

const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  try {
    const qs = event.queryStringParameters || {};
    const artistId = qs.artist_id;
    const [catalog, earnings, streams] = await Promise.all([
      fetchTable('catalog', artistId),
      fetchTable('earnings', artistId),
      fetchTable('streams', artistId),
    ]);
    const body = { catalog, earnings, streams };
    return { statusCode: 200, headers, body: JSON.stringify(body) };
  } catch (err) {
    console.error('fetch error', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

async function fetchTable(key, artistId) {
  const TableName = TABLES[key];
  let data;
  if (artistId) {
    data = await ddb.send(new QueryCommand({
      TableName,
      KeyConditionExpression: 'artist_id = :a',
      ExpressionAttributeValues: { ':a': { S: artistId } },
    }));
  } else {
    data = await ddb.send(new ScanCommand({ TableName, Limit: 50 }));
  }
  const items = (data.Items || []).map(clean);
  return items.length ? items : DEFAULTS[key];
}

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? (v.N ? Number(v.N) : v.BOOL);
  }
  return obj;
}
