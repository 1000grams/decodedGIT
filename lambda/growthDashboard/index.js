const { spawnSync } = require('child_process');
const path = require('path');

const headers = {
  'Access-Control-Allow-Origin': 'https://decodedmusic.com',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event = {}) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const artistId = event.queryStringParameters?.artistId || '';
  if (!artistId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'artistId is required' }) };
  }

  try {
    const script = path.join(__dirname, 'growth-dashboard.py');
    const result = spawnSync('python3', [script, `--artistId=${artistId}`], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error(result.stderr.trim());
    }
    return { statusCode: 200, headers, body: result.stdout };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
