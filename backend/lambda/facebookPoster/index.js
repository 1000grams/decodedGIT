const fetch = require('node-fetch');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const { getSecretValue, getParameter } = require('../utils/secrets');

const LINKS = [
  'https://music.apple.com/us/artist/rue-de-vivre/1802574638',
  'https://www.youtube.com/@ruedevivre',
  'https://open.spotify.com/artist/293x3NAIGPR4RCJrFkzs0P'
];

function pickLink() {
  const index = Math.floor(Math.random() * LINKS.length);
  return LINKS[index];
}

const REGION = process.env.AWS_REGION || 'eu-central-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
let PAGE_IDS;
let TOKEN;

async function generateMessage(topic) {
  const client = new BedrockRuntimeClient({ region: REGION });
  const link = pickLink();
  const prompt = `Write a short Facebook post about ${topic}. Include a playful call to action and end with this link: ${link}`;
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens: 120 })
  });
  const res = await client.send(command);
  const completion = JSON.parse(new TextDecoder().decode(res.body)).completion;
  const message = completion.trim();
  return `${message}\n${link}`;
}

async function postToPage(pageId, message) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  console.log(`Posting to ${pageId}: ${message}`);
  await fetch(`${url}?access_token=${TOKEN}&message=${encodeURIComponent(message)}`, { method: 'POST' });
  console.log(`Posted to ${pageId}`);
}

async function loadConfig() {
  if (!TOKEN) {
    if (process.env.FACEBOOK_TOKEN_SECRET) {
      const val = await getSecretValue(process.env.FACEBOOK_TOKEN_SECRET);
      TOKEN = typeof val === 'string' ? val : val.token || val.value;
    } else {
      TOKEN = process.env.FACEBOOK_TOKEN;
    }
  }
  if (!PAGE_IDS) {
    if (process.env.FACEBOOK_PAGE_IDS_PARAM) {
      const val = await getParameter(process.env.FACEBOOK_PAGE_IDS_PARAM);
      PAGE_IDS = val.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      PAGE_IDS = (process.env.FACEBOOK_PAGE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }
}

exports.handler = async (event = {}) => {
  await loadConfig();
  if (!TOKEN) throw new Error('FACEBOOK_TOKEN not set');
  if (PAGE_IDS.length === 0) throw new Error('FACEBOOK_PAGE_IDS not configured');

  const topic = event.topic || 'latest news';
  const message = await generateMessage(topic);
  console.log(`Generated message for topic "${topic}": ${message}`);
  for (const pageId of PAGE_IDS) {
    await postToPage(pageId, message);
  }
  return { statusCode: 200, body: JSON.stringify({ posted: PAGE_IDS.length, message }) };
};
