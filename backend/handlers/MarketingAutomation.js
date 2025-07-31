const { DynamoDBClient, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { headers: corsHeaders } = require('../../lambda/shared/cors-headers');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const SPEND_TABLE = process.env.SPEND_TABLE || 'MarketingSpend';
const STATS_TABLE = process.env.STATS_TABLE || 'WeeklyArtistStats';
const REVENUE_TABLE = process.env.REVENUE_TABLE || 'RevenueLog';
const SUB_TABLE = process.env.SUB_TABLE || 'ArtistSubscriptions';
const ARTIST_IDS = (process.env.ARTIST_IDS || 'RDV').split(',');

const ddb = new DynamoDBClient({ region: REGION });
const ses = new SESClient({ region: REGION });

exports.handler = async (event) => {
  const { httpMethod, path = '' } = event;

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    if (path.endsWith('/spend')) return await handleMarketingSpend(event);
    if (path.endsWith('/attribution')) return await handleAttribution(event);
    if (path.endsWith('/weekly-stats')) return await handleWeeklyStats();
    if (path.endsWith('/payout')) return await handlePayout();
    if (path.endsWith('/subscription/webhook')) return await handleSubscriptionWebhook(event);
    if (path.endsWith('/subscription/report')) return await handleSubscriptionReport();
    return response(404, { message: 'Not Found' });
  } catch (err) {
    console.error('MarketingAutomation error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

async function handleMarketingSpend(event) {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const item = {
      artist_id: { S: body.artist_id },
      campaign_id: { S: body.campaign_id },
      platform: { S: body.platform },
      date: { S: body.date || new Date().toISOString().slice(0, 10) },
      spent_cents: { N: String(body.amount_spent_cents || 0) },
    };
    await ddb.send(new PutItemCommand({ TableName: SPEND_TABLE, Item: item }));
    return response(200, { message: 'Marketing spend recorded' });
  }
  if (event.httpMethod === 'GET') {
    const qs = event.queryStringParameters || {};
    if (!qs.artist_id) return response(400, { message: 'artist_id required' });
    const params = new QueryCommand({
      TableName: SPEND_TABLE,
      KeyConditionExpression: 'artist_id = :a',
      ExpressionAttributeValues: { ':a': { S: qs.artist_id } },
    });
    const data = await ddb.send(params);
    const items = (data.Items || []).map(cleanItem);
    return response(200, items);
  }
  return response(405, { message: 'Method Not Allowed' });
}

async function handleAttribution(event) {
  const qs = event.queryStringParameters || {};
  const campaignId = qs.campaign_id;
  if (!campaignId) return response(400, { message: 'campaign_id required' });

  const spendRes = await ddb.send(new QueryCommand({
    TableName: SPEND_TABLE,
    IndexName: 'campaign_id-index',
    KeyConditionExpression: 'campaign_id = :c',
    ExpressionAttributeValues: { ':c': { S: campaignId } },
  }));
  const statsRes = await ddb.send(new QueryCommand({
    TableName: STATS_TABLE,
    IndexName: 'campaign_id-index',
    KeyConditionExpression: 'campaign_id = :c',
    ExpressionAttributeValues: { ':c': { S: campaignId } },
  }));
  const spend = spendRes.Items || [];
  const stats = statsRes.Items || [];

  const spent = spend.reduce((sum, i) => sum + parseInt(i.spent_cents.N), 0);
  const streams = stats.reduce((sum, i) => sum + parseInt(i.streams.N), 0);
  const costPerStream = streams ? (spent / streams).toFixed(2) : 0;

  return response(200, {
    campaign_id: campaignId,
    spend_cents: spent,
    streams,
    cost_per_stream: parseFloat(costPerStream),
  });
}

async function handleWeeklyStats() {
  const weekStart = getWeekStart();
  const promises = ARTIST_IDS.map((id) => {
    const item = simulateStats(id, weekStart);
    return ddb.send(new PutItemCommand({ TableName: STATS_TABLE, Item: item }));
  });
  await Promise.all(promises);
  return response(200, { message: 'weekly stats logged', count: ARTIST_IDS.length });
}

async function handlePayout() {
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 3);
  const periodCutoff = threshold.toISOString().slice(0, 7);
  const scanParams = new ScanCommand({
    TableName: REVENUE_TABLE,
    FilterExpression: '#p <= :m AND #s <> :paid',
    ExpressionAttributeNames: { '#p': 'period', '#s': 'status' },
    ExpressionAttributeValues: { ':m': { S: periodCutoff }, ':paid': { S: 'Paid' } },
  });
  const data = await ddb.send(scanParams);
  const items = data.Items || [];
  for (const item of items) {
    await ddb.send(new UpdateItemCommand({
      TableName: REVENUE_TABLE,
      Key: { artist_id: item.artist_id, track_id: item.track_id },
      UpdateExpression: 'SET #s = :p',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':p': { S: 'Paid' } },
    }));
  }
  return response(200, { updated: items.length });
}

async function handleSubscriptionWebhook(event) {
  const body = JSON.parse(event.body || '{}');
  const type = body.type || '';
  const data = body.data?.object || {};

  if (type === 'invoice.paid') {
    const item = {
      artist_id: { S: data.metadata.artist_id },
      email: { S: data.customer_email || '' },
      subscribed_since: { S: new Date(data.created * 1000).toISOString().slice(0, 10) },
      next_billing_date: { S: new Date(data.period_end * 1000).toISOString().slice(0, 10) },
      active: { BOOL: true },
      subscription_id: { S: data.subscription || '' },
    };
    await ddb.send(new PutItemCommand({ TableName: SUB_TABLE, Item: item }));
  }

  if (type === 'invoice.payment_failed') {
    await ddb.send(new UpdateItemCommand({
      TableName: SUB_TABLE,
      Key: { artist_id: { S: data.metadata.artist_id } },
      UpdateExpression: 'SET active = :f',
      ExpressionAttributeValues: { ':f': { BOOL: false } },
    }));
    await sendFailureEmail(data.customer_email);
  }

  return response(200, { message: 'ok' });
}

async function handleSubscriptionReport() {
  const data = await ddb.send(new ScanCommand({ TableName: SUB_TABLE }));
  const items = data.Items || [];
  const records = items.map(clean);
  const totalSubscribers = records.filter((r) => r.active).length;
  const monthlyRevenue = totalSubscribers * 99;
  const avgRetention = calcRetention(records);
  return response(200, { totalSubscribers, monthlyRevenue, avgRetention });
}

function response(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function cleanItem(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    const val = v.S ?? (v.N ? Number(v.N) : v.BOOL);
    obj[k] = val;
  }
  return obj;
}

function clean(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    obj[k] = v.S ?? v.N ?? v.BOOL;
  }
  return obj;
}

function getWeekStart() {
  const date = new Date();
  const day = date.getUTCDay();
  const diff = day >= 2 ? day - 2 : 7 - (2 - day);
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulateStats(artistId, weekStart) {
  return {
    artist_id: { S: artistId },
    week_start: { S: weekStart },
    spotify_streams: { N: String(rand(10000, 20000)) },
    youtube_views: { N: String(rand(5000, 15000)) },
    snap_followers: { N: String(rand(100, 400)) },
    ig_followers: { N: String(rand(500, 1500)) },
    meta_spend_cents: { N: String(rand(500, 1000)) },
    google_spend_cents: { N: String(rand(300, 800)) },
    snapchat_spend_cents: { N: String(rand(200, 600)) },
    engagement_rate: { N: (Math.random() * 0.05 + 0.02).toFixed(3) },
    trend_notes: { S: 'auto-generated stats' },
  };
}

function calcRetention(records) {
  const months = records
    .map((r) => {
      if (!r.subscribed_since) return 0;
      const diff = Date.now() - new Date(r.subscribed_since).getTime();
      return diff / (1000 * 60 * 60 * 24 * 30);
    })
    .filter((n) => n > 0);
  if (!months.length) return 0;
  const avg = months.reduce((a, b) => a + b, 0) / months.length;
  return Number(avg.toFixed(1));
}

async function sendFailureEmail(to) {
  if (!to) return;
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Text: { Data: 'Your Decoded Music subscription payment failed. Please update your billing info.' } },
      Subject: { Data: 'Payment Failed' },
    },
    Source: 'no-reply@decodedmusic.com',
  };
  try {
    await ses.send(new SendEmailCommand(params));
  } catch (err) {
    console.error('email send error', err);
  }
}
