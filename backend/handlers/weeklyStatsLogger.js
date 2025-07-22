const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE = process.env.STATS_TABLE || 'WeeklyArtistStats';
const ARTIST_IDS = (process.env.ARTIST_IDS || 'RDV').split(',');

const ddb = new DynamoDBClient({ region: REGION });

exports.handler = async () => {
  const weekStart = getWeekStart();
  const promises = ARTIST_IDS.map((id) => {
    const item = simulateStats(id, weekStart);
    return ddb.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  });
  await Promise.all(promises);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'weekly stats logged', count: ARTIST_IDS.length })
  };
};

function getWeekStart() {
  const date = new Date();
  const day = date.getUTCDay();
  const diff = (day >= 2 ? day - 2 : 7 - (2 - day));
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
    trend_notes: { S: 'auto-generated stats' }
  };
}
