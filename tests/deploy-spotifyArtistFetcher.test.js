const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');

if (!process.env.AWS_ACCESS_KEY_ID) {
  console.log('AWS credentials not configured; skipping deploy-spotifyArtistFetcher tests');
  process.exit(0);
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  assert.strictEqual(res.status, 0, `Command failed: ${cmd} ${args.join(' ')}`);
}

// Create zip package
run('zip', ['-r', 'backend/spotifyArtistFetcher.zip', 'backend/handlers/spotifyArtistFetcher']);
assert.ok(fs.existsSync('backend/spotifyArtistFetcher.zip'), 'Zip file not created');

// Upload to S3
run('aws', ['s3', 'cp', 'backend/spotifyArtistFetcher.zip', 's3://decodedmusic-lambda-code/', '--region', 'eu-central-1']);

// Update Lambda function
run('aws', ['lambda', 'update-function-code', '--function-name', 'prod-spotifyArtistFetcher', '--s3-bucket', 'decodedmusic-lambda-code', '--s3-key', 'spotifyArtistFetcher.zip', '--region', 'eu-central-1']);

console.log('deploy-spotifyArtistFetcher tests passed');
