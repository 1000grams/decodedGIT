const https = require('https');

async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...');
  console.log('🔗 API Base: https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod');
  
  const endpoints = [
    '/accounting?artistId=RueDeVivre',
    '/spotify',
    '/trends',
    '/catalog?artistId=ruedevivre'
  ];
  
  const baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${baseURL}${endpoint}...`);
      
      const result = await new Promise((resolve, reject) => {
        const req = https.get(`${baseURL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'decodedmusic-frontend-test'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Request timeout')));
      });
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint}: Success (${result.status})`);
        try {
          const parsed = JSON.parse(result.data);
          console.log(`   Data keys: ${Object.keys(parsed).join(', ')}`);
        } catch (e) {
          console.log(`   Response length: ${result.data.length} chars`);
        }
      } else {
        console.log(`❌ ${endpoint}: Failed (${result.status})`);
        console.log(`   Response: ${result.data.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n🎯 Backend Health Summary:`);
  console.log(`   If you see ✅ responses, your backend is working`);
  console.log(`   If you see ❌ errors, check your AWS Lambda functions`);
  console.log(`   CORS errors are normal - they'll work in the browser`);
}

if (require.main === module) {
  testBackendConnection().catch(console.error);
}

module.exports = { testBackendConnection };
