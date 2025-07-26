const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// ✅ Update this with your confirmed bucket
const BUCKET_NAME = 'decodedmusic-lambda-code';

const s3 = new AWS.S3();
// Resolve the lambda directory relative to this script so it works on any OS
const lambdaDir = path.join(__dirname, '..', 'backend', 'lambda');

fs.readdir(lambdaDir, (err, files) => {
  if (err) {
    console.error('❌ Failed to read lambda directory:', err);
    return;
  }

  const zipFiles = files.filter(file => file.endsWith('.zip'));

  if (zipFiles.length === 0) {
    console.log('⚠️ No ZIP files found in backend/lambda.');
    return;
  }

  console.log(`📦 Found ${zipFiles.length} ZIP file(s). Uploading to ${BUCKET_NAME}...`);

  zipFiles.forEach(file => {
    const filePath = path.join(lambdaDir, file);
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: BUCKET_NAME,
      Key: `lambdas/${file}`,
      Body: fileContent,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error(`❌ Failed to upload ${file}:`, err.message);
      } else {
        console.log(`✅ Uploaded ${file} → ${data.Location}`);
      }
    });
  });
});
