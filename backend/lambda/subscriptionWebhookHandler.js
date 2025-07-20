const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.SUB_TABLE || 'ArtistSubscriptions';
const ddb = new DynamoDBClient({ region: REGION });
const ses = new SESClient({ region: REGION });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const type = body.type || '';
    const data = body.data?.object || {};

    if (type === 'invoice.paid') {
      const item = {
        artist_id: { S: data.metadata.artist_id },
        email: { S: data.customer_email || '' },
        subscribed_since: { S: new Date(data.created * 1000).toISOString().slice(0,10) },
        next_billing_date: { S: new Date(data.period_end * 1000).toISOString().slice(0,10) },
        active: { BOOL: true },
        subscription_id: { S: data.subscription || '' }
      };
      await ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
    }

    if (type === 'invoice.payment_failed') {
      await ddb.send(new UpdateItemCommand({
        TableName: TABLE,
        Key: { artist_id: { S: data.metadata.artist_id } },
        UpdateExpression: 'SET active = :f',
        ExpressionAttributeValues: { ':f': { BOOL: false } }
      }));
      await sendFailureEmail(data.customer_email);
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'ok' }) };
  } catch (err) {
    console.error('webhook error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'error' }) };
  }
};

async function sendFailureEmail(to) {
  if (!to) return;
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Text: { Data: 'Your Decoded Music subscription payment failed. Please update your billing info.' } },
      Subject: { Data: 'Payment Failed' }
    },
    Source: 'no-reply@decodedmusic.com'
  };
  try {
    await ses.send(new SendEmailCommand(params));
  } catch (err) {
    console.error('email send error', err);
  }
}
