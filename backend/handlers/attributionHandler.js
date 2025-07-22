const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const SPEND_TABLE = process.env.SPEND_TABLE || 'MarketingSpend';
const STATS_TABLE = process.env.STATS_TABLE || 'WeeklyArtistStats';

const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const campaignId = qs.campaign_id;
    if (!campaignId) return response(400, { message: 'campaign_id required' });

    const spendRes = await ddb.send(new QueryCommand({
      TableName: SPEND_TABLE,
      IndexName: 'campaign_id-index',
      KeyConditionExpression: 'campaign_id = :c',
      ExpressionAttributeValues: { ':c': { S: campaignId } }
    }));
    const spend = spendRes.Items || [];

    const statsRes = await ddb.send(new QueryCommand({
      TableName: STATS_TABLE,
      IndexName: 'campaign_id-index',
      KeyConditionExpression: 'campaign_id = :c',
      ExpressionAttributeValues: { ':c': { S: campaignId } }
    }));
    const stats = statsRes.Items || [];

    const spent = spend.reduce((sum, i) => sum + parseInt(i.spent_cents.N), 0);
    const streams = stats.reduce((sum, i) => sum + parseInt(i.streams.N), 0);
    const costPerStream = streams ? (spent / streams).toFixed(2) : 0;

    return response(200, {
      campaign_id: campaignId,
      spend_cents: spent,
      streams,
      cost_per_stream: parseFloat(costPerStream)
    });
  } catch (err) {
    console.error('attribution error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode, body) {
  return { statusCode, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}
