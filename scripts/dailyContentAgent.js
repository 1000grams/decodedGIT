const fs = require('fs/promises');
const path = require('path');
const fetch = require('node-fetch');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Load environment variables from .env if present
try {
  const envPath = path.join(__dirname, '..', '.env');
  const envData = require('fs').readFileSync(envPath, 'utf8');
  envData.split(/\n+/).forEach((line) => {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  });
} catch (e) {
  // ignore missing .env
}

const REGION = process.env.AWS_REGION || 'eu-central-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'meta.llama3-70b-instruct-v1:0';

const GRAPH_VERSION = 'v19.0';

async function getGoogleTrend() {
  try {
    const url = 'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=US&ns=15';
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.replace(/^\)\]\}',?/, ''));
    const day = json.default.trendingSearchesDays?.[0];
    const trend = day?.trendingSearches?.[0]?.title?.query;
    return trend ? [trend] : [];
  } catch (err) {
    console.error('google trend fetch failed', err);
    return [];
  }
}

async function getTikTokTrends() {
  try {
    const res = await fetch('https://www.tiktok.com/node/share/discover?lang=en');
    const json = await res.json();
    const list = json?.body?.discoverList || [];
    return list.slice(0,3).map(i => i.challengeInfo?.challengeName).filter(Boolean);
  } catch (err) {
    console.error('tiktok trend fetch failed', err);
    return [];
  }
}

async function getIGCommentTrends() {
  const token = process.env.INSTAGRAM_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) return [];
  try {
    const mediaRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media?access_token=${token}&fields=id`);
    const mediaJson = await mediaRes.json();
    const id = mediaJson.data?.[0]?.id;
    if (!id) return [];
    const commentsRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${id}/comments?access_token=${token}&limit=50`);
    const commentsJson = await commentsRes.json();
    const words = (commentsJson.data || []).map(c => c.text).join(' ').toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const counts = {};
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(e=>e[0]).slice(0,3);
  } catch (err) {
    console.error('instagram comment fetch failed', err);
    return [];
  }
}

async function getTrendingKeywords() {
  const [google, tiktok, comments] = await Promise.all([
    getGoogleTrend(),
    getTikTokTrends(),
    getIGCommentTrends()
  ]);
  const combined = [...google, ...tiktok, ...comments];
  const unique = [...new Set(combined)];
  return unique.slice(0,5);
}

async function generatePostContent(track) {
  const client = new BedrockRuntimeClient({ region: REGION });
  const trends = await getTrendingKeywords();
  const trendList = trends.join(', ') || 'music news';
  const prompt = `You are a music content strategist for Instagram and TikTok.\n\nBased on the artist profile and current audience, create engaging and trend-aligned captions and stories:\n\n**Artist**: Rue de Vivre\n**Latest Track**: "${track}"\n**Theme**: Bashment + Reggaeton with dancehall attitude\n**Audience**: 18–30 year olds in NYC, Puerto Rico, Latin America\n**Tone**: Flirty, bold, Jamaican-influenced\n\n**Current Trends**:\n${trendList}\n\nGenerate:\n- 3 social media captions (2 English/Spanglish, 1 in full Spanish)\n- 2 story hook ideas\n- 1 comment reply to high-engagement fans`;
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens: 200 })
  });
  const response = await client.send(command);
  const completion = JSON.parse(new TextDecoder().decode(response.body)).completion;
  return completion.trim();
}

async function postToInstagram(caption, mediaUrl) {
  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) throw new Error('INSTAGRAM_TOKEN not set');
  const url = `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_USER_ID}/media`;
  await fetch(url + `?access_token=${token}&caption=${encodeURIComponent(caption)}&image_url=${encodeURIComponent(mediaUrl)}`, { method: 'POST' });
}

// Placeholder analytics fetch functions
async function getInstagramInsights() {
  console.log('Fetching Instagram insights...');
  return { reach: 1000, interactions: 75 };
}

async function summarizeAnalytics(data) {
  const client = new BedrockRuntimeClient({ region: REGION });
  const prompt = `Summarize the following engagement metrics and suggest one improvement:\n${JSON.stringify(data)}`;
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens: 150 })
  });
  const response = await client.send(command);
  return JSON.parse(new TextDecoder().decode(response.body)).completion.trim();
}

async function run() {
  const caption = await generatePostContent('Fireproof');
  const mediaUrl = process.env.POST_IMAGE_URL || 'https://decodedmusic.com/logo.png';
  await postToInstagram(caption, mediaUrl);
  const analytics = await getInstagramInsights();
  const summary = await summarizeAnalytics(analytics);
  await fs.writeFile('latest_social_summary.txt', summary);
  console.log('Daily content agent completed.');
}

run().catch(err => {
  console.error('Daily content agent failed', err);
  process.exit(1);
});
