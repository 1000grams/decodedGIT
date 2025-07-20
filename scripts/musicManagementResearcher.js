// Music Management Researcher
// Sweeps public news sources for industry activity and posts summaries as "Industry Buzz".
// Configure with NEWS_API_KEY for newsapi.org and AWS credentials for Bedrock.
// Threads API info: https://developers.facebook.com/docs/threads-api

const fs = require('fs/promises');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Load .env if present
try {
  const envPath = path.join(__dirname, '..', '.env');
  const envData = require('fs').readFileSync(envPath, 'utf8');
  envData.split(/\n+/).forEach((line) => {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  });
} catch (e) {
  // ignore if no .env file
}

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'c085412f8c0d41ae8849f1f177a2e4fc';
const REGIONS = ["los angeles", "new york", "atlanta", "miami"];
const KEYWORDS = [
  "record label", "music sync opportunities", "artist deals",
  "artist disputes", "catalog sales", "contract release",
  "music usage dispute"
];

async function fetchArticles(query) {
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY env variable required');
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`News API error ${res.status}`);
  return res.json();
}

async function gatherNews() {
  const allResults = [];
  for (const region of REGIONS) {
    for (const term of KEYWORDS) {
      const query = `${term} ${region}`;
      const data = await fetchArticles(query);
      allResults.push(...(data.articles || []));
    }
  }
  return allResults.slice(0, 50); // limit
}

async function summarizeWithBedrock(text) {
  const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-central-1' });
  const prompt = `Summarize the following news into short bullet points highlighting labels, deals, disputes, catalog sales, contract releases, and unpaid usage.\n${text}`;
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt, max_tokens: 400 })
  });
  const response = await client.send(command);
  return JSON.parse(new TextDecoder().decode(response.body)).completion;
}

async function run() {
  const news = await gatherNews();
  const text = news.map(a => `- ${a.title} (${a.source.name})`).join('\n');
  const summary = await summarizeWithBedrock(text);
  await fs.writeFile('industry_buzz.txt', summary);
  console.log('Industry Buzz saved. Share via Threads API: https://developers.facebook.com/docs/threads-api');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

// run daily
setInterval(() => {
  run().catch(err => console.error('Daily run failed', err));
}, 24 * 60 * 60 * 1000);
