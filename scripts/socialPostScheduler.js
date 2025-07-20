// Social Posting Scheduler
// Uses Meta Graph API, Snapchat API, and YouTube to queue posts.
// Requires access tokens via environment variables.

const fetch = require('node-fetch');

async function postToInstagram(caption, mediaUrl) {
  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) throw new Error('INSTAGRAM_TOKEN not set');
  const url = `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_USER_ID}/media`;
  const res = await fetch(url + `?access_token=${token}&caption=${encodeURIComponent(caption)}&image_url=${encodeURIComponent(mediaUrl)}`, {
    method: 'POST'
  });
  const data = await res.json();
  return data.id;
}

async function scheduleSnapchatPost(mediaUrl, caption) {
  // Placeholder for Snapchat Marketing API
  console.log('Snapchat post queued:', caption, mediaUrl);
}

async function queueYouTubeShort(mediaUrl, title) {
  // Placeholder for YouTube API call
  console.log('YouTube Short queued:', title);
}

async function run() {
  const post = { caption: 'New single out now!', mediaUrl: 'https://decodedmusic.com/logo.png' };
  const mediaUrl = process.env.POST_IMAGE_URL || post.mediaUrl;
  post.mediaUrl = mediaUrl;
  await postToInstagram(post.caption, post.mediaUrl);
  await scheduleSnapchatPost(post.mediaUrl, post.caption);
  await queueYouTubeShort(post.mediaUrl, post.caption);
  console.log('Posts scheduled');
}

run().catch(err => {
  console.error('Posting failed', err);
  process.exit(1);
});
