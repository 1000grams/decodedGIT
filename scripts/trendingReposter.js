// Trending Topic Reposter
// Gathers trending topics and reposts content with hashtags.

const fetch = require('node-fetch');

async function getTwitterTrends() {
  // Placeholder for Twitter API call
  return ['music', 'news'];
}

async function getTikTokTrends() {
  // Placeholder for TikTok API
  return ['viral', 'dance'];
}

async function getRedditTrends() {
  const res = await fetch('https://www.reddit.com/r/trendingsubreddits/new.json');
  const json = await res.json();
  return json.data.children.slice(0,2).map(p => p.data.display_name);
}

async function selectRandomInstagramPost() {
  // Placeholder to pick a post from catalog
  return { caption: 'Listen now', mediaUrl: process.env.POST_IMAGE_URL || 'https://decodedmusic.com/logo.png' };
}

async function publishToInstagram(caption) {
  console.log('Posting to Instagram:', caption);
}

async function run() {
  const topics = [
    ...(await getTwitterTrends()),
    ...(await getTikTokTrends()),
    ...(await getRedditTrends())
  ];
  const post = await selectRandomInstagramPost();
  const hashtags = topics.slice(0,2).map(t => `#${t}`).join(' ');
  await publishToInstagram(`${post.caption} ${hashtags}`);
  console.log('Trending repost done');
}

run().catch(err => {
  console.error('Trending repost failed', err);
});
