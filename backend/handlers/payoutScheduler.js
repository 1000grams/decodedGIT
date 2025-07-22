const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.REVENUE_TABLE || 'RevenueLog';
const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async () => {
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 3);
  const periodCutoff = threshold.toISOString().slice(0,7);
  const scanParams = new ScanCommand({
    TableName: TABLE,
    FilterExpression: '#p <= :m AND #s <> :paid',
    ExpressionAttributeNames: { '#p': 'period', '#s': 'status' },
    ExpressionAttributeValues: { ':m': { S: periodCutoff }, ':paid': { S: 'Paid' } }
  });
  const data = await ddb.send(scanParams);
  const items = data.Items || [];
  for (const item of items) {
    await ddb.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { artist_id: item.artist_id, track_id: item.track_id },
      UpdateExpression: 'SET #s = :p',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':p': { S: 'Paid' } }
    }));
  }
  return { statusCode: 200, body: JSON.stringify({ updated: items.length }) };
};
