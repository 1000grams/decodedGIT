const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fetch = require('node-fetch');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

const LINKS = [
  'https://open.spotify.com/artist/293x3NAIGPR4RCJrFkzs0P',
  'https://www.youtube.com/@ruedevivre',
  'https://www.instagram.com/kaiserinstreetwear/'
];

async function getTrendingTopic() {
  try {
    const url = 'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=US&ns=15';
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.replace(/^\)\]\}',?/, ''));
    const day = json.default.trendingSearchesDays?.[0];
    const trend = day?.trendingSearches?.[0]?.title?.query;
    return trend || 'music news';
  } catch (err) {
    console.error('trend fetch failed', err);
    return 'music news';
  }
}

function pickLink() {
  const index = Math.floor(Math.random() * LINKS.length);
  return LINKS[index];
}

async function generateCaption(topic, link) {
  const client = new BedrockRuntimeClient({ region: REGION });
  const prompt = `Topic: ${topic} is trending. Write a humorous social caption in Carol Leifer's stand-up style. Make a self-deprecating joke then plug Rue de Vivre's music with this link: ${link}`;
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens: 150 })
  });
  const response = await client.send(command);
  const completion = JSON.parse(new TextDecoder().decode(response.body)).completion;
  return completion.trim();
}

async function postToInstagram(caption) {
  const token = process.env.INSTAGRAM_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) throw new Error('Instagram credentials missing');
  const url = `https://graph.facebook.com/v19.0/${userId}/media`;
  const imageUrl = process.env.POST_IMAGE_URL || 'https://decodedmusic.com/logo.png';
  await fetch(`${url}?access_token=${token}&caption=${encodeURIComponent(caption)}&image_url=${encodeURIComponent(imageUrl)}`, { method: 'POST' });
}

exports.handler = async () => {
  const topic = await getTrendingTopic();
  const link = pickLink();
  const caption = await generateCaption(topic, link);
  await postToInstagram(caption);
  return { statusCode: 200, body: JSON.stringify({ message: 'post queued', topic, link }) };
};
