// verify-api-connectivity.js
const fetch = require('node-fetch'); // npm install node-fetch@2

// List your API endpoints here for each landing page section
const apiEndpoints = [
  // Section 1: Hero (e.g., featured content, hero stats)
  'https://your-api-gateway-url-hero.amazonaws.com/prod/hero',
  // Section 2: Problem/Solution (e.g., insights, stats)
  'https://your-api-gateway-url-problem.amazonaws.com/prod/problem',
  // Section 3: Artist Showcase (e.g., artist data, Spotify integration)
  'https://your-api-gateway-url-artist.amazonaws.com/prod/artist',
  // Section 4: Dynamic Pricing (e.g., pricing API)
  'https://your-api-gateway-url-pricing.amazonaws.com/prod/pricing',
  // Section 5: Buyers (e.g., buyer features, testimonials)
  'https://your-api-gateway-url-buyers.amazonaws.com/prod/buyers',
  // Section 6: Artists (e.g., artist onboarding, features)
  'https://your-api-gateway-url-artists.amazonaws.com/prod/artists',
  // Section 7: Collaboration (e.g., collab tools, invites)
  'https://your-api-gateway-url-collab.amazonaws.com/prod/collaboration',
  // Section 8: AWS/Infra (e.g., status, health check)
  'https://your-api-gateway-url-aws.amazonaws.com/prod/aws',
  // Section 9: Final CTA (e.g., signup, contact)
  'https://your-api-gateway-url-cta.amazonaws.com/prod/cta',
  // Add more endpoints as needed
];

async function checkEndpoint(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      console.log(`✅ ${url} is reachable (Status: ${res.status})`);
    } else {
      console.log(`❌ ${url} returned status ${res.status}`);
    }
  } catch (err) {
    console.log(`❌ ${url} error: ${err.message}`);
  }
}

(async () => {
  for (const url of apiEndpoints) {
    await checkEndpoint(url);
  }
})();
